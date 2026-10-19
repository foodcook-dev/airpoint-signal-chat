import { useEffect, useRef, useState } from 'react';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import {
  getCommentsAdmin,
  postDeactivateComment,
  postCommentBanUser,
} from '@/pages/signal-chat/api';
import useAlertStore from '@/store/alert';
import useConfirmStore from '@/store/confirm';
import { validateImageFile } from '@/pages/signal-chat/utils';
import type { ChatMessage, CommentResponse, SelectedImage } from '@/pages/signal-chat/types';
import type ResponseError from '@/libs/response-error';

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
  const [commentImage, setCommentImage] = useState<SelectedImage | null>(null);
  const commentFileInputRef = useRef<HTMLInputElement>(null);

  // 대댓글 입력 (한 번에 하나의 댓글에만 대댓글을 달 수 있도록 단일 상태로 관리)
  const [replyTarget, setReplyTarget] = useState<{ commentId: number; nickname: string } | null>(
    null,
  );
  const [replyValue, setReplyValue] = useState('');
  const [replyImage, setReplyImage] = useState<SelectedImage | null>(null);
  const replyFileInputRef = useRef<HTMLInputElement>(null);

  // 댓글/대댓글 이미지 첨부는 최대 1장
  const readImageFile = (file: File, onLoaded: (image: SelectedImage) => void) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      showAlert(validationError);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) onLoaded({ url: result, name: file.name });
    };
    reader.onerror = () => {
      showAlert(`${file.name} 파일 읽기에 실패했습니다.`);
    };
    reader.readAsDataURL(file);
  };

  const handleCommentImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readImageFile(file, setCommentImage);
    e.target.value = '';
  };

  const handleCommentImageRemove = () => setCommentImage(null);
  const handleCommentImageButtonClick = () => commentFileInputRef.current?.click();

  const handleReplyImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readImageFile(file, setReplyImage);
    e.target.value = '';
  };

  const handleReplyImageRemove = () => setReplyImage(null);
  const handleReplyImageButtonClick = () => replyFileInputRef.current?.click();

  const handleMutationError = (e: ResponseError) => {
    if (typeof e.error === 'string') showAlert(e.error);
    else console.error(e);
  };

  const commentResponse = useInfiniteQuery<CommentResponse>({
    queryKey: ['comment', selectedChat?.id],
    queryFn: ({ pageParam = 1 }) =>
      getCommentsAdmin({ signalTalkId: selectedChat?.id, page: pageParam as number, pageSize: 10 }),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.next) return pages.length + 1;
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!selectedChat?.id,
  });

  const { mutateAsync: disableCommentRequest } = useMutation({
    mutationFn: (commentId: number) => postDeactivateComment(commentId),
    onSuccess: () => {
      showAlert('댓글이 비활성화되었습니다.');
      commentResponse.refetch();
    },
    onError: handleMutationError,
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

  const { mutateAsync: blockUserRequest } = useMutation({
    mutationFn: (params: { userId: number; reason: string; blockedUntil: string; memo: string }) =>
      postCommentBanUser(params),
    onSuccess: () => {
      showAlert('사용자 댓글 작성이 제한되었습니다.');
    },
    onError: handleMutationError,
  });

  const handleConfirmBlock = async (data: {
    userId: number;
    reason: string;
    blockedUntil: string;
    memo: string;
  }) => {
    await blockUserRequest(data);
  };

  // 대댓글 달기 버튼 클릭 — 같은 대상(댓글 또는 그 안의 특정 대댓글)을 다시 누르면 입력창을 닫고,
  // 같은 스레드 안의 다른 대댓글을 누르면 태그만 바꿔서 입력창을 유지한다.
  const handleOpenReply = (commentId: number, nickname: string) => {
    setReplyTarget((prev) =>
      prev?.commentId === commentId && prev?.nickname === nickname ? null : { commentId, nickname },
    );
    setReplyValue('');
    setReplyImage(null);
  };

  const handleCancelReply = () => {
    setReplyTarget(null);
    setReplyValue('');
    setReplyImage(null);
  };

  // TODO: 대댓글 작성 API 연동 — 현재는 UI/UX만 구현
  const handleSubmitReply = () => {
    if (!replyValue.trim() && !replyImage) return;
    showAlert('대댓글 작성 기능은 준비 중입니다.');
    setReplyValue('');
    setReplyImage(null);
    setReplyTarget(null);
  };

  // TODO: 댓글 작성 API 연동 — 현재는 UI/UX만 구현
  const handleSubmitComment = () => {
    if (!newComment.trim() && !commentImage) return;
    showAlert('댓글 작성 기능은 준비 중입니다.');
    setNewComment('');
    setCommentImage(null);
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
    commentImage,
    commentFileInputRef,
    handleCommentImageSelect,
    handleCommentImageRemove,
    handleCommentImageButtonClick,

    // 대댓글 작성
    replyTarget,
    replyValue,
    setReplyValue,
    handleOpenReply,
    handleCancelReply,
    handleSubmitReply,
    replyImage,
    replyFileInputRef,
    handleReplyImageSelect,
    handleReplyImageRemove,
    handleReplyImageButtonClick,
  };
};
