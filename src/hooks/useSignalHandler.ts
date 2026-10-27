import { useState, useRef, useCallback, useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient, InfiniteData } from '@tanstack/react-query';
import {
  getSignalTalksAdmin,
  postSignalTalk,
  deleteSignalTalk,
  postInvestmentNote,
  postReadComments,
} from '@/api/signal';
import { useSocket } from '@/libs/socket-provider';
import { PATH } from '@/constants/api-path';
import useAlertStore from '@/stores/alert';
import useConfirmStore from '@/stores/confirm';
import useSignalDraftStore from '@/stores/signal-draft';
import useNewCommentsStore from '@/stores/new-comments';
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

    formData.append('audience', audience);

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

  // "새 댓글" 목록에서 댓글/대댓글 클릭 시 해당 시그널 상세패널로 진입하기 위한 핸들러.
  // 클릭된 시그널이 이미 로드된 페이지에 없으면(오래된 시그널), 과거 페이지를 계속 불러오며 찾는다.
  const [isOpeningSignalThread, setIsOpeningSignalThread] = useState(false);

  const handleOpenSignalThread = async (signalTalkId: number) => {
    // ChatMessage.id는 타입상 string이지만 실제 API 응답은 숫자로 내려온다 — 엄격 비교(===) 대신
    // 양쪽을 문자열로 맞춰서 비교해야 한다
    const findInPages = (pages: ChatResponse[] | undefined) =>
      pages
        ?.flatMap((page) => page.results)
        .find((msg) => String(msg.id) === String(signalTalkId)) ?? null;

    const alreadyLoaded = findInPages(signalResponse.data?.pages);
    if (alreadyLoaded) {
      setSelectedChat(alreadyLoaded);
      return;
    }

    setIsOpeningSignalThread(true);
    try {
      let found: ChatMessage | null = null;
      let currentHasNextPage = signalResponse.hasNextPage;
      let pageCount = signalResponse.data?.pages.length ?? 0;

      // 과거 페이지를 끝까지(또는 최대 30페이지까지) 불러오며 찾는다
      while (currentHasNextPage && !found && pageCount < 30) {
        const result = await signalResponse.fetchNextPage();
        found = findInPages(result.data?.pages);
        currentHasNextPage = result.hasNextPage;
        pageCount = result.data?.pages.length ?? pageCount;
      }

      if (found) {
        setSelectedChat(found);
      } else {
        showAlert('해당 시그널을 찾을 수 없습니다.');
      }
    } finally {
      setIsOpeningSignalThread(false);
    }
  };

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

  // 최초 진입이나 새로고침 직후엔 아직 소켓 이벤트가 쌓이지 않았으므로, 목록 API가 내려주는
  // has_new로 NEW 뱃지 상태를 동기화한다. signalResponse.data가 바뀔 때마다(최초 로드, 과거
  // 페이지 추가 로드, 소켓발 invalidate로 인한 refetch 등) 다시 동기화된다 — 이미 markSignalNew로
  // 켜져 있으면 no-op이라 소켓으로 먼저 켜진 상태를 덮어쓰지 않는다.
  useEffect(() => {
    signalResponse.data?.pages.forEach((page) => {
      page.results.forEach((msg) => {
        if (msg.has_new) {
          useNewCommentsStore.getState().markSignalNew(msg.id);
        }
      });
    });
  }, [signalResponse.data]);

  // 상세방을 나올 때(다른 시그널로 바꾸거나 패널을 닫을 때)만 그 시그널의 NEW 표시를 지운다 —
  // 패널을 열어두고 보는 동안에는 계속 떠 있어야 한다. useEffect cleanup으로 하면 StrictMode의
  // 개발 모드 mount→cleanup→mount 시뮬레이션 때문에 패널을 여는 순간 지워져버려서, 실제 "닫기"
  // 액션(이 함수 호출)에 직접 걸어야 한다.
  const setSelectedChat = (chat: ChatMessage | null) => {
    setSelectedChatId((prevId) => {
      const nextId = chat?.id ?? null;
      if (prevId && prevId !== nextId) {
        useNewCommentsStore.getState().clearSignalNew(prevId);
        useNewCommentsStore.getState().clearSignal(prevId);
        // postReadComments는 await 없이 fire-and-forget이라, 서버 last_checked_at이 갱신되기
        // 전에 같은 시그널을 바로 재진입하면 NEW가 레이스로 다시 붙을 수 있다 — 그래서 "방금
        // 여기까지는 확인했다"는 로컬 타임스탬프를 같이 남겨서 useCommentHandler가 서버값과
        // 비교할 때 이 값도 함께 고려하게 한다.
        useNewCommentsStore.getState().markLocallyReadNow(prevId);
        // 읽음 처리가 서버에 실제로 반영된 뒤에 헤더의 "새 댓글" 목록/카운트를 다시 불러온다 —
        // 응답을 기다리지 않고 바로 invalidate하면 아직 감소 전인 카운트를 다시 받아올 수 있다.
        postReadComments({ signalTalkId: Number(prevId) })
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ['unread-comments'] });
          })
          .catch((error) => {
            console.error('댓글 읽음 처리 실패:', error);
          });
      }
      return nextId;
    });
  };

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

    // "새 댓글" 목록에서 시그널 상세패널로 진입
    handleOpenSignalThread,
    isOpeningSignalThread,

    // 투자노트 지정 모달
    investmentNoteTarget,
    handlePickInvestmentNote,
    handleCloseInvestmentNoteModal,
    handleConfirmInvestmentNote,
  };
};
