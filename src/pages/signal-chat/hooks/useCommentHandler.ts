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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ userId: number; nickname: string } | null>(
    null,
  );

  // 신규 댓글 입력
  const [newComment, setNewComment] = useState('');

  // 대댓글 입력 (한 번에 하나의 댓글에만 답글을 달 수 있도록 단일 상태로 관리)
  const [replyTarget, setReplyTarget] = useState<{ commentId: number; nickname: string } | null>(
    null,
  );
  const [replyValue, setReplyValue] = useState('');

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

  // 답글 달기 버튼 클릭 — 같은 댓글을 다시 누르면 입력창을 닫음
  const handleOpenReply = (commentId: number, nickname: string) => {
    setReplyTarget((prev) => (prev?.commentId === commentId ? null : { commentId, nickname }));
    setReplyValue('');
  };

  const handleCancelReply = () => {
    setReplyTarget(null);
    setReplyValue('');
  };

  // TODO: 답글 작성 API 연동 — 현재는 UI/UX만 구현
  const handleSubmitReply = () => {
    if (!replyValue.trim()) return;
    showAlert('답글 작성 기능은 준비 중입니다.');
    setReplyValue('');
    setReplyTarget(null);
  };

  // TODO: 댓글 작성 API 연동 — 현재는 UI/UX만 구현
  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    showAlert('댓글 작성 기능은 준비 중입니다.');
    setNewComment('');
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
        root: scrollContainerRef.current,
        rootMargin: '200px',
        threshold: 0,
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

  useEffect(() => {
    if ((commentResponse.isLoading || commentResponse.isRefetching) && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [commentResponse.isLoading || commentResponse.isRefetching]);

  return {
    isFetching: commentResponse.isLoading || commentResponse.isRefetching,
    selectedUser,
    commentList: commentResponse.data?.pages.flatMap((page) => page.results) || [],
    commentCount: commentResponse.data?.pages?.[0]?.count || 0,
    commentObserverRef,
    scrollContainerRef,
    blockDialogOpen,
    commentRefetch: commentResponse.refetch,
    setBlockDialogOpen,
    handleDisableComment,
    handleBlockUser,
    handleConfirmBlock,

    // 신규 댓글 작성
    newComment,
    setNewComment,
    handleSubmitComment,

    // 대댓글 작성
    replyTarget,
    replyValue,
    setReplyValue,
    handleOpenReply,
    handleCancelReply,
    handleSubmitReply,
  };
};
