import { useState, useRef, useCallback, useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { getSignalTalksAdmin, postSignalTalk } from '@/api/signal';
import { useSocket } from '@/components/modules/socket-provider';
import useAlertStore from '@/stores/alert';
import useSignalDraftStore from '@/stores/signal-draft';
import { SelectedImage, ChatResponse, ChatMessage, SignalChannel } from '@/types/signal';
import { CHAT_CONSTANTS } from '@/constants/signal';
import { validateImageFile } from '@/utils';

export const useSignalHandler = (channel: SignalChannel) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollTriggerRef = useRef<() => void>(null);
  const { showAlert } = useAlertStore();

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

      await signalResponse.refetch();

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

  const handleDeleteMessage = (_id: string) => {
    showAlert('삭제 기능은 현재 지원되지 않습니다.');
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

  // TODO: 실제 API 연동 — 토글 엔드포인트가 정해지면 아래 캐시 업데이트 전후로 요청 추가
  const handleToggleInvestmentNote = (messageId: string) => {
    queryClient.setQueryData<InfiniteData<ChatResponse>>(signalQueryKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          results: page.results.map((msg) =>
            msg.id === messageId ? { ...msg, is_investment_note: !msg.is_investment_note } : msg,
          ),
        })),
      };
    });
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
    handleToggleInvestmentNote,
  };
};
