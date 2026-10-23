import { useState, useRef, useCallback, useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import {
  getSignalTalksAdmin,
  postSignalTalk,
  deleteSignalTalk,
  postInvestmentNote,
} from '@/api/signal';
import { useSocket } from '@/libs/socket-provider';
import { PATH } from '@/constants/api-path';
import useAlertStore from '@/stores/alert';
import useConfirmStore from '@/stores/confirm';
import useSignalDraftStore from '@/stores/signal-draft';
import type ResponseError from '@/libs/response-error';
import { SelectedImage, ChatResponse, ChatMessage, SignalChannel } from '@/types/signal';
import { CHAT_CONSTANTS } from '@/constants/signal';
import { validateImageFile } from '@/utils';

export const useSignalHandler = (channel: SignalChannel) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollTriggerRef = useRef<() => void>(null);
  const { showAlert } = useAlertStore();
  const { showConfirm } = useConfirmStore();

  const draft = useSignalDraftStore((state) => state.drafts[channel]);
  const updateDraft = useSignalDraftStore((state) => state.updateDraft);
  const resetDraft = useSignalDraftStore((state) => state.resetDraft);
  const { inputValue, selectedImages, isAutoReactionEnabled, maxAutoReactions } = draft;

  const setInputValue = (value: string) => updateDraft(channel, { inputValue: value });
  const setIsAutoReactionEnabled = (enabled: boolean) =>
    updateDraft(channel, { isAutoReactionEnabled: enabled });
  const setMaxAutoReactions = (value: number) => updateDraft(channel, { maxAutoReactions: value });
  const setSelectedImages = (updater: (prev: SelectedImage[]) => SelectedImage[]) =>
    updateDraft(channel, (prev) => ({ selectedImages: updater(prev.selectedImages) }));

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // 선택된 메시지는 id만 들고 있다가 messageList에서 매번 찾아 씀 — 투자노트 픽처럼
  // 리스트 데이터가 바뀌었을 때 상세 패널도 항상 최신 상태를 보도록 하기 위함
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // 유료 채널은 audience=paid, 무료 채널은 audience=free로 조회
  const audience = channel === 'premium' ? 'paid' : 'free';

  const { joinAudience, joinRoom, leaveRoom } = useSocket();

  // 탭(채널) 전환
  useEffect(() => {
    joinAudience(audience);
  }, [audience]);

  // 댓글 상세방(우측 패널) 입장/퇴장
  useEffect(() => {
    if (!selectedChatId) return;
    const signalTalkId = Number(selectedChatId);
    joinRoom(signalTalkId);
    return () => leaveRoom(signalTalkId);
  }, [selectedChatId]);

  const queryClient = useQueryClient();
  const signalQueryKey = ['signal', channel];

  const signalResponse = useInfiniteQuery<ChatResponse>({
    queryKey: signalQueryKey,
    queryFn: ({ pageParam = 1 }) =>
      getSignalTalksAdmin({ audience, page: pageParam as number, pageSize: 10 }),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.next) return pages.length + 1;
      return undefined;
    },
    initialPageParam: 1,
  });

  const { mutateAsync: sendChatMutate } = useMutation({
    mutationFn: (formData: FormData) => postSignalTalk(formData),
    onSuccess: (newMessage) => {
      // 삭제와 동일하게 refetch 없이 캐시를 직접 patch — 최신 메시지는 1페이지 맨 앞에 들어간다
      queryClient.setQueryData<InfiniteData<ChatResponse>>(signalQueryKey, (old) => {
        if (!old) return old;
        const [firstPage, ...restPages] = old.pages;
        return {
          ...old,
          pages: [{ ...firstPage, results: [newMessage, ...firstPage.results] }, ...restPages],
        };
      });
    },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedInput = inputValue.trim();
    if (!trimmedInput && selectedImages.length === 0) return;

    setIsSubmitting(true);

    const formData = new FormData();

    if (trimmedInput) formData.append('message', trimmedInput);

    // 자동 리액션 설정 항상 전송
    formData.append('enable_auto_reactions', isAutoReactionEnabled.toString());
    formData.append(
      'max_auto_reactions',
      isAutoReactionEnabled ? maxAutoReactions.toString() : '0',
    );

    try {
      for (let i = 0; i < selectedImages.length; i++) {
        const image = selectedImages[i];
        try {
          const response = await fetch(image.url);
          const blob = await response.blob();
          const file = new File([blob], image.name, { type: blob.type });
          formData.append(`images`, file);
        } catch (error) {
          console.error(`이미지 ${image.name} 처리 실패:`, error);
        }
      }

      await sendChatMutate(formData);

      resetDraft(channel);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setTimeout(() => {
        scrollTriggerRef.current?.();
      }, 100);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      showAlert('메시지 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { mutateAsync: deleteSignalTalkMutate } = useMutation({
    mutationFn: (signalTalkId: number) => deleteSignalTalk(signalTalkId),
    onSuccess: (_data, signalTalkId) => {
      queryClient.setQueryData<InfiniteData<ChatResponse>>(signalQueryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            results: page.results.filter((msg) => msg.id !== String(signalTalkId)),
          })),
        };
      });
    },
    onError: (e: ResponseError) => {
      if (typeof e.error === 'string') showAlert(e.error);
      else console.error(e);
    },
  });

  const handleDeleteMessage = (id: string) => {
    showConfirm({
      title: '시그널 삭제',
      message: '이 시그널을 삭제하시겠습니까? 삭제된 시그널은 복구할 수 없습니다.',
      onConfirm: () => {
        deleteSignalTalkMutate(Number(id));
      },
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);

      if (selectedImages.length + fileArray.length > CHAT_CONSTANTS.MAX_IMAGES) {
        showAlert(`이미지는 최대 ${CHAT_CONSTANTS.MAX_IMAGES}개까지 첨부할 수 있습니다.`);
        return;
      }

      fileArray.forEach((file) => {
        const validationError = validateImageFile(file);
        if (validationError) {
          showAlert(validationError);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            setSelectedImages((prev) => [
              ...prev,
              {
                url: result,
                name: file.name,
              },
            ]);
          }
        };
        reader.onerror = () => {
          showAlert(`${file.name} 파일 읽기에 실패했습니다.`);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleImageRemove = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const loadMoreMessages = useCallback(() => {
    if (signalResponse.hasNextPage && !signalResponse.isFetchingNextPage) {
      signalResponse.fetchNextPage();
    }
  }, [signalResponse]);

  // 투자노트 지정 모달에 띄울 대상 시그널 — null이면 모달이 닫힌 상태
  const [investmentNoteTarget, setInvestmentNoteTarget] = useState<ChatMessage | null>(null);

  // 투자노트 픽 버튼 클릭 — 상세 입력 모달을 연다
  const handlePickInvestmentNote = (chat: ChatMessage) => {
    setInvestmentNoteTarget(chat);
  };

  const handleCloseInvestmentNoteModal = () => setInvestmentNoteTarget(null);

  const { mutateAsync: postInvestmentNoteMutate } = useMutation({
    mutationFn: (params: { title: string; signalTalkId: string }) => postInvestmentNote(params),
    onSuccess: (data) => {
      showConfirm({
        title: '투자노트 임시저장 완료',
        message: '투자노트가 임시저장되었습니다. 관리 페이지로 이동하시겠습니까?',
        onConfirm: () => {
          window.open(`${PATH.base}${data.admin_url}`, '_blank');
        },
      });
    },
    onError: (e: ResponseError) => {
      if (typeof e.error === 'string') showAlert(e.error);
      else console.error(e);
    },
  });

  const handleConfirmInvestmentNote = (title: string) => {
    if (!investmentNoteTarget) return;
    postInvestmentNoteMutate({ title, signalTalkId: investmentNoteTarget.id });
    setInvestmentNoteTarget(null);
  };

  const messageList = signalResponse.data?.pages.flatMap((page) => page.results) || [];
  const selectedChat = messageList.find((msg) => msg.id === selectedChatId) || null;
  const setSelectedChat = (chat: ChatMessage | null) => setSelectedChatId(chat?.id ?? null);

  return {
    scrollTriggerRef,
    selectedChat,
    setSelectedChat,

    // 메시지 입력창 관련 상태 및 함수
    inputValue,
    isAutoReactionEnabled,
    maxAutoReactions,
    fileInputRef,
    isSubmitting,
    selectedImages,
    setIsAutoReactionEnabled,
    setMaxAutoReactions,
    setInputValue,
    handleSendMessage,
    handleDeleteMessage,
    handleImageSelect,
    handleImageRemove,
    handleImageButtonClick,

    // 메시지 관련 상태 및 함수
    messageList,
    loadMoreMessages,
    hasNextPage: signalResponse.hasNextPage,
    isFetchingNextPage: signalResponse.isFetchingNextPage,

    // 투자노트 지정 모달
    investmentNoteTarget,
    handlePickInvestmentNote,
    handleCloseInvestmentNoteModal,
    handleConfirmInvestmentNote,
  };
};
