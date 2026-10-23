import { useState } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserBlockDialog from '@/components/modules/dialog/user-block-dialog';
import ImagePreviewDialog from '@/components/modules/dialog/image-preview-dialog';
import { Spinner } from '@/components/ui/spinner';
import type { ChatMessage } from '@/types/signal';
import { useCommentHandler } from '@/hooks/useCommentHandler';
import SignalPreviewBar from './signal-preview-bar';
import CommentItem from './comment-item';
import CommentComposer from './comment-composer';

interface CommentSectionProps {
  selectedChat: ChatMessage;
  onClose: () => void;
  onPickInvestmentNote?: (chat: ChatMessage) => void;
  // 투자노트는 프리미엄 채널에만 있는 기능 — 무료 채널에서는 버튼 자체를 숨김
  canPickInvestmentNote?: boolean;
}

export default function CommentSection({
  selectedChat,
  onClose,
  onPickInvestmentNote,
  canPickInvestmentNote = false,
}: CommentSectionProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const {
    isFetching,
    selectedUser,
    commentList,
    commentCount,
    commentObserverRef,
    scrollContainerRef,
    blockDialogOpen,
    setBlockDialogOpen,
    handleDisableComment,
    handleBlockUser,
    handleConfirmBlock,
    newComment,
    setNewComment,
    handleSubmitComment,
    isSubmittingComment,
    commentImage,
    commentFileInputRef,
    handleCommentImageSelect,
    handleCommentImageRemove,
    handleCommentImageButtonClick,
    editingCommentId,
    handleStartEditComment,
    handleCancelCommentEdit,
    replyTarget,
    replyValue,
    setReplyValue,
    handleOpenReply,
    handleCancelReply,
    handleSubmitReply,
    isSubmittingReply,
    replyImage,
    replyFileInputRef,
    handleReplyImageSelect,
    handleReplyImageRemove,
    handleReplyImageButtonClick,
    handleStartEditReply,
  } = useCommentHandler({
    selectedChat,
  });

  return (
    <div className="border-border/80 bg-background flex h-screen w-[560px] flex-col border-l">
      {/* 헤더 — 제목과 댓글 수를 한 줄로 합침. 시그널 헤더(h-16)와 높이를 맞춤 */}
      <div className="border-border flex h-16 flex-shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-contrast text-sm font-semibold">댓글</span>
          <span className="text-contrast/50 text-xs">{commentCount}개</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-contrast hover:bg-foreground/60 h-7 w-7"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </div>

      <SignalPreviewBar
        selectedChat={selectedChat}
        canPickInvestmentNote={canPickInvestmentNote}
        onPickInvestmentNote={onPickInvestmentNote}
        onImageClick={setSelectedImage}
      />

      {/* 댓글 리스트 */}
      <div
        ref={scrollContainerRef}
        className="relative flex min-h-0 flex-1 flex-col overflow-y-auto"
      >
        {isFetching && (
          <div className="bg-background/50 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
            <Spinner size="md" />
          </div>
        )}
        {commentList.length > 0 && (
          <>
            {commentList.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                replyTarget={replyTarget}
                replyValue={replyValue}
                onChangeReplyValue={setReplyValue}
                replyImage={replyImage}
                replyFileInputRef={replyFileInputRef}
                onReplyImageSelect={handleReplyImageSelect}
                onReplyImageRemove={handleReplyImageRemove}
                onReplyImageButtonClick={handleReplyImageButtonClick}
                onOpenReply={handleOpenReply}
                onCancelReply={handleCancelReply}
                onSubmitReply={handleSubmitReply}
                isSubmittingReply={isSubmittingReply}
                onDisableComment={handleDisableComment}
                onBlockUser={handleBlockUser}
                onStartEditComment={handleStartEditComment}
                onStartEditReply={handleStartEditReply}
                onImageClick={setSelectedImage}
              />
            ))}
            <div ref={commentObserverRef} className="h-4" />
          </>
        )}
        {!isFetching && commentList.length === 0 && (
          <div className="text-contrast/40 flex flex-1 flex-col items-center justify-center gap-2 py-10">
            <MessageSquare className="size-7" strokeWidth={1.5} />
            <p className="text-xs">아직 작성된 댓글이 없습니다.</p>
          </div>
        )}
      </div>

      <CommentComposer
        editingCommentId={editingCommentId}
        onCancelEdit={handleCancelCommentEdit}
        commentImage={commentImage}
        onImageRemove={handleCommentImageRemove}
        newComment={newComment}
        onChangeComment={setNewComment}
        commentFileInputRef={commentFileInputRef}
        onImageSelect={handleCommentImageSelect}
        onImageButtonClick={handleCommentImageButtonClick}
        onSubmit={handleSubmitComment}
        isSubmitting={isSubmittingComment}
      />

      {selectedUser && (
        <UserBlockDialog
          open={blockDialogOpen}
          onOpenChange={setBlockDialogOpen}
          userId={selectedUser.userId}
          nickname={selectedUser.nickname}
          onConfirm={handleConfirmBlock}
        />
      )}

      <ImagePreviewDialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
        imageUrl={selectedImage}
      />
    </div>
  );
}
