import { useState, useRef, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import createAxios from '@/libs/create-axios-instance';
import useFetch from '@/hooks/useFetch';
import useAlertStore from '@/store/alert';
import { SelectedImage, ChatResponse, ChatMessage } from '@/pages/signal-chat/types';
import { CHAT_CONSTANTS } from '@/pages/signal-chat/constants';
import { validateImageFile } from '@/pages/signal-chat/utils';

export const useSignalHandler = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollTriggerRef = useRef<() => void>(null);
  const { showAlert } = useAlertStore();

  const [inputValue, setInputValue] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedChat, setSelectedChat] = useState<ChatMessage | null>(null);

  const signalResponse = useInfiniteQuery<ChatResponse>({
    queryKey: ['signal'],
    queryFn: ({ pageParam = 1 }) =>
      createAxios({
        method: 'get',
        endpoint: `/talk/signal_talks/admin/`,
        params: {
          page: pageParam as number,
          page_size: 10,
        },
      }),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.next) return pages.length + 1;
      return undefined;
    },
    initialPageParam: 1,
  });

  const useSendChat = () => {
    const { request } = useFetch<any, FormData>({
      requestFn: (params) => {
        return createAxios({
          method: 'post',
          endpoint: `/talk/signal_talks/create/`,
          body: params,
        });
      },
    });
    return request;
  };
  const sendChatRequest = useSendChat();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedInput = inputValue.trim();
    if (!trimmedInput && selectedImages.length === 0) return;

    setIsSubmitting(true);

    const formData = new FormData();

    if (trimmedInput) formData.append('message', trimmedInput);

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

      await sendChatRequest(formData);

      setInputValue('');
      setSelectedImages([]);
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

  return {
    scrollTriggerRef,
    selectedChat,
    setSelectedChat,

    // 메시지 입력창 관련 상태 및 함수
    inputValue,
    fileInputRef,
    isSubmitting,
    selectedImages,
    setInputValue,
    handleSendMessage,
    handleDeleteMessage,
    handleImageSelect,
    handleImageRemove,
    handleImageButtonClick,

    // 메시지 관련 상태 및 함수
    messageList: signalResponse.data?.pages.flatMap((page) => page.results) || [],
    loadMoreMessages,
    hasNextPage: signalResponse.hasNextPage,
    isFetchingNextPage: signalResponse.isFetchingNextPage,
  };
};
