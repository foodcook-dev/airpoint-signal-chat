import { useEffect, useRef, useState } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCommentsAdmin,
  postComment,
  patchComment,
  postDeactivateComment,
  postCommentBanUser,
} from '@/api/signal';
import useAlertStore from '@/stores/alert';
import useConfirmStore from '@/stores/confirm';
import { validateImageFile } from '@/utils';
import type { ChatMessage, Comment, CommentResponse, Reply, SelectedImage } from '@/types/signal';
import type ResponseError from '@/libs/response-error';

export const useCommentHandler = ({ selectedChat }: { selectedChat: ChatMessage }) => {
  const { showAlert } = useAlertStore();
  const { showConfirm } = useConfirmStore();
  const queryClient = useQueryClient();

  const commentObserverRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ userId: number; nickname: string } | null>(
    null,
  );

  const [newComment, setNewComment] = useState('');
  const [commentImage, setCommentImage] = useState<SelectedImage | null>(null);
  // 수정 모드에서 이미지를 실제로 건드렸는지(교체/삭제) 추적 — 안 건드렸으면 기존 이미지를 그대로 둬야 한다
  const [commentImageTouched, setCommentImageTouched] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const commentFileInputRef = useRef<HTMLInputElement>(null);

  // 대댓글 입력 (한 번에 하나의 댓글에만 대댓글을 달 수 있도록 단일 상태로 관리)
  // editingReplyId가 있으면 "답글 작성"이 아니라 "이 id의 대댓글을 수정" 모드 — @태그(nickname)는
  // 수정 중엔 바꿀 수 있는 UI를 아예 제공하지 않는다(항상 원래 태그를 그대로 들고 있음).
  const [replyTarget, setReplyTarget] = useState<{
    commentId: number;
    userId: number;
    nickname: string;
    editingReplyId?: number;
  } | null>(null);
  const [replyValue, setReplyValue] = useState('');
  const [replyImage, setReplyImage] = useState<SelectedImage | null>(null);
  const [replyImageTouched, setReplyImageTouched] = useState(false);
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
    setCommentImageTouched(true);
    e.target.value = '';
  };

  const handleCommentImageRemove = () => {
    setCommentImage(null);
    setCommentImageTouched(true);
  };
  const handleCommentImageButtonClick = () => commentFileInputRef.current?.click();

  const handleReplyImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readImageFile(file, setReplyImage);
    setReplyImageTouched(true);
    e.target.value = '';
  };

  const handleReplyImageRemove = () => {
    setReplyImage(null);
    setReplyImageTouched(true);
  };
  const handleReplyImageButtonClick = () => replyFileInputRef.current?.click();

  const handleMutationError = (e: ResponseError) => {
    if (typeof e.error === 'string') showAlert(e.error);
    else console.error(e);
  };

  const commentResponse = useInfiniteQuery<CommentResponse>({
    queryKey: ['comment', selectedChat?.id],
    queryFn: ({ pageParam = 1 }) =>
      getCommentsAdmin({ signalTalkId: selectedChat?.id, page: pageParam as number }),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.next) return pages.length + 1;
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!selectedChat?.id,
  });

  // 명시적으로 새로고침 버튼을 눌렀을 때만 로딩 상태로 취급한다.
  const [isManualRefetching, setIsManualRefetching] = useState(false);
  const handleRefetchComments = async () => {
    setIsManualRefetching(true);
    try {
      await commentResponse.refetch();
    } finally {
      setIsManualRefetching(false);
    }
  };

  const { mutateAsync: disableCommentRequest } = useMutation({
    mutationFn: (commentId: number) => postDeactivateComment(commentId),
    onSuccess: () => {
      showAlert('댓글이 비활성화되었습니다.');
      handleRefetchComments();
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

  // 댓글 수정 시작 — 아래 작성창에 기존 내용을 채워 넣는다. 대댓글 작성 중이었으면 같이 닫는다.
  const handleStartEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setNewComment(comment.message ?? '');
    setCommentImage(comment.images[0] ? { url: comment.images[0], name: comment.images[0] } : null);
    setCommentImageTouched(false);
    setReplyTarget(null);
    setReplyValue('');
    setReplyImage(null);
    setReplyImageTouched(false);
  };

  const handleCancelCommentEdit = () => {
    setEditingCommentId(null);
    setNewComment('');
    setCommentImage(null);
    setCommentImageTouched(false);
  };

  // 대댓글 달기 버튼 클릭 — 같은 대상(댓글 또는 그 안의 특정 대댓글)을 다시 누르면 입력창을 닫고,
  // 같은 스레드 안의 다른 대댓글을 누르면 태그만 바꿔서 입력창을 유지한다.
  const handleOpenReply = (commentId: number, userId: number, nickname: string) => {
    setReplyTarget((prev) =>
      prev?.commentId === commentId && prev?.nickname === nickname && prev?.editingReplyId == null
        ? null
        : { commentId, userId, nickname },
    );
    setReplyValue('');
    setReplyImage(null);
    setReplyImageTouched(false);
  };

  // 대댓글 수정 시작 — @태그는 원래 태그로 고정한 채 내용/이미지만 작성창에 채운다.
  // 댓글 작성 중이었으면 같이 닫는다.
  const handleStartEditReply = (reply: Reply) => {
    setReplyTarget({
      commentId: reply.main_comment_id,
      userId: Number(reply.user_id),
      nickname: reply.tag_nickname || reply.nickname,
      editingReplyId: reply.id,
    });
    setReplyValue(reply.message ?? '');
    setReplyImage(reply.images[0] ? { url: reply.images[0], name: reply.images[0] } : null);
    setReplyImageTouched(false);
    setEditingCommentId(null);
    setNewComment('');
    setCommentImage(null);
    setCommentImageTouched(false);
  };

  const handleCancelReply = () => {
    setReplyTarget(null);
    setReplyValue('');
    setReplyImage(null);
    setReplyImageTouched(false);
  };

  const scrollToLatestComment = async () => {
    const waitForRender = () => new Promise((resolve) => setTimeout(resolve, 50));
    const scrollToBottom = () => {
      const el = scrollContainerRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    };

    const refreshed = await commentResponse.refetch();
    await waitForRender();
    let hasMore = !!refreshed.data?.pages.at(-1)?.next;
    scrollToBottom();

    while (hasMore) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const result = await commentResponse.fetchNextPage();
      await waitForRender();
      hasMore = !!result.hasNextPage;
      scrollToBottom();
    }
  };

  const { mutateAsync: createCommentRequest, isPending: isCreatingComment } = useMutation({
    mutationFn: (params: { content: string; image: SelectedImage | null }) =>
      postComment({
        signalTalkId: selectedChat.id,
        content: params.content,
        image: params.image ?? undefined,
      }),
    onSuccess: () => {
      setNewComment('');
      setCommentImage(null);
      scrollToLatestComment();
    },
    onError: handleMutationError,
  });

  const { mutateAsync: updateCommentRequest, isPending: isUpdatingComment } = useMutation({
    mutationFn: (params: {
      commentId: number;
      content: string;
      image?: SelectedImage;
      removeImage?: boolean;
    }) => patchComment(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comment', selectedChat.id] });
      handleCancelCommentEdit();
    },
    onError: handleMutationError,
  });

  const handleSubmitComment = async () => {
    if (!newComment.trim() && !commentImage) return;

    if (editingCommentId != null) {
      await updateCommentRequest({
        commentId: editingCommentId,
        content: newComment.trim(),
        image: commentImageTouched ? (commentImage ?? undefined) : undefined,
        removeImage: commentImageTouched && !commentImage,
      });
      return;
    }

    await createCommentRequest({ content: newComment.trim(), image: commentImage });
  };

  const { mutateAsync: createReplyRequest, isPending: isCreatingReply } = useMutation({
    mutationFn: (params: {
      content: string;
      image: SelectedImage | null;
      mainCommentId: number;
      replyToUserId: number;
    }) =>
      postComment({
        signalTalkId: selectedChat.id,
        content: params.content,
        image: params.image ?? undefined,
        mainCommentId: params.mainCommentId,
        replyToId: params.replyToUserId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comment', selectedChat.id] });
      setReplyValue('');
      setReplyImage(null);
      setReplyTarget(null);
    },
    onError: handleMutationError,
  });

  const { mutateAsync: updateReplyRequest, isPending: isUpdatingReply } = useMutation({
    mutationFn: (params: {
      commentId: number;
      content: string;
      image?: SelectedImage;
      removeImage?: boolean;
    }) => patchComment(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comment', selectedChat.id] });
      handleCancelReply();
    },
    onError: handleMutationError,
  });

  const handleSubmitReply = async () => {
    if ((!replyValue.trim() && !replyImage) || !replyTarget) return;

    if (replyTarget.editingReplyId != null) {
      await updateReplyRequest({
        commentId: replyTarget.editingReplyId,
        content: replyValue.trim(),
        image: replyImageTouched ? (replyImage ?? undefined) : undefined,
        removeImage: replyImageTouched && !replyImage,
      });
      return;
    }

    await createReplyRequest({
      content: replyValue.trim(),
      image: replyImage,
      mainCommentId: replyTarget.commentId,
      replyToUserId: replyTarget.userId,
    });
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
    if ((commentResponse.isLoading || isManualRefetching) && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [commentResponse.isLoading, isManualRefetching]);

  return {
    isFetching: commentResponse.isLoading || isManualRefetching,
    selectedUser,
    commentList: commentResponse.data?.pages.flatMap((page) => page.results) || [],
    commentCount: commentResponse.data?.pages?.[0]?.count || 0,
    commentObserverRef,
    scrollContainerRef,
    blockDialogOpen,
    setBlockDialogOpen,
    handleDisableComment,
    handleBlockUser,
    handleConfirmBlock,

    // 신규 댓글 작성 / 수정
    newComment,
    setNewComment,
    handleSubmitComment,
    isSubmittingComment: isCreatingComment || isUpdatingComment,
    commentImage,
    commentFileInputRef,
    handleCommentImageSelect,
    handleCommentImageRemove,
    handleCommentImageButtonClick,
    editingCommentId,
    handleStartEditComment,
    handleCancelCommentEdit,

    // 대댓글 작성 / 수정
    replyTarget,
    replyValue,
    setReplyValue,
    handleOpenReply,
    handleCancelReply,
    handleSubmitReply,
    isSubmittingReply: isCreatingReply || isUpdatingReply,
    replyImage,
    replyFileInputRef,
    handleReplyImageSelect,
    handleReplyImageRemove,
    handleReplyImageButtonClick,
    handleStartEditReply,
  };
};
