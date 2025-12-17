import { useEffect, useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import useFetch from '@/hooks/useFetch';
import createAxios from '@/libs/create-axios-instance';
import useAlertStore from '@/store/alert';
import useConfirmStore from '@/store/confirm';
import type { ChatMessage, CommentResponse } from '@/pages/signal-chat/types';

export const useCommentHandler = ({ selectedChat }: { selectedChat: ChatMessage }) => {
  const { showAlert } = useAlertStore();
  const { showConfirm } = useConfirmStore();

  const commentObserverRef = useRef<HTMLDivElement>(null);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ userId: number; nickname: string } | null>(
    null,
  );

  const commentResponse = useInfiniteQuery<CommentResponse>({
    queryKey: ['comment', selectedChat?.id],
    queryFn: ({ pageParam = 1 }) =>
      createAxios({
        method: 'get',
        endpoint: `/talk/signal_talks/${selectedChat?.id}/comments/admin/`,
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
    enabled: !!selectedChat?.id,
  });

  const { request: disableCommentRequest } = useFetch<any, number>({
    requestFn: (commentId) => {
      return createAxios({
        method: 'post',
        endpoint: `/talk/signal_talks/comments/${commentId}/deactivate/`,
      });
    },
    onSuccess: () => {
      showAlert('댓글이 비활성화되었습니다.');
      commentResponse.refetch();
    },
  });

  const handleDisableComment = (commentId: number, isDeleted: boolean) => {
    if (isDeleted) {
      showAlert('이미 삭제된 댓글입니다.');
      return;
    }
    showConfirm({
      title: '댓글 비활성화',
      message: '이 댓글을 비활성화하시겠습니까?',
      onConfirm: async () => {
        await disableCommentRequest(commentId);
      },
    });
  };

  const handleBlockUser = (userId: number, nickname: string) => {
    setSelectedUser({ userId, nickname });
    setBlockDialogOpen(true);
  };

  const { request: blockUserRequest } = useFetch<
    any,
    {
      userId: number;
      reason: string;
      blockedUntil: string;
      memo: string;
    }
  >({
    requestFn: (params) => {
      return createAxios({
        method: 'post',
        endpoint: `/user/comment-ban-admin/`,
        body: {
          user_id: params.userId,
          reason: params.reason,
          blocked_until: params.blockedUntil,
          memo: params.memo,
        },
      });
    },
    onSuccess: () => {
      showAlert('사용자 댓글 작성이 제한되었습니다.');
    },
  });

  const handleConfirmBlock = async (data: {
    userId: number;
    reason: string;
    blockedUntil: string;
    memo: string;
  }) => {
    await blockUserRequest(data);
  };

  // Intersection Observer를 사용한 무한 스크롤
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (
          target.isIntersecting &&
          commentResponse.hasNextPage &&
          !commentResponse.isFetchingNextPage
        ) {
          commentResponse.fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      },
    );

    const currentObserverRef = commentObserverRef.current;
    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [commentResponse.hasNextPage, commentResponse.isFetchingNextPage, commentResponse]);

  return {
    selectedUser,
    commentList: commentResponse.data?.pages.flatMap((page) => page.results) || [],
    commentCount: commentResponse.data?.pages?.[0]?.count || 0,
    commentObserverRef,
    blockDialogOpen,
    hasNextCommentPage: commentResponse.hasNextPage,
    isFetchingNextCommentPage: commentResponse.isFetchingNextPage,
    setBlockDialogOpen,
    handleDisableComment,
    handleBlockUser,
    handleConfirmBlock,
  };
};
