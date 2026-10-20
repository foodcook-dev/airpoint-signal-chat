import { useState } from 'react';
import {
  X,
  MessageSquareOff,
  UserX,
  Trash2,
  Send,
  MessageSquare,
  CornerDownRight,
  ImageIcon,
  Star,
} from 'lucide-react';
import { ReplyIcon } from '@/components/icons/reply-icon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatSignalDate, formatCommentTime } from '@/utils';
import likePng from '@/assets/images/signal_like.png';
import goodPng from '@/assets/images/signal_good.png';
import checkPng from '@/assets/images/signal_check.png';
import logoPng from '@/assets/images/app_logo.png';
import UserBlockDialog from '@/components/modules/dialog/user-block-dialog';
import ImagePreviewDialog from '@/components/modules/dialog/image-preview-dialog';
import { Spinner } from '@/components/ui/spinner';
import type { ChatMessage } from '@/types/signal';
import { useCommentHandler } from '@/hooks/useCommentHandler';

interface CommentSectionProps {
  selectedChat: ChatMessage;
  onClose: () => void;
  onToggleInvestmentNote?: (messageId: string) => void;
  // 투자노트는 프리미엄 채널에만 있는 기능 — 무료 채널에서는 버튼 자체를 숨김
  canPickInvestmentNote?: boolean;
}

export default function CommentSection({
  selectedChat,
  onClose,
  onToggleInvestmentNote,
  canPickInvestmentNote = false,
}: CommentSectionProps) {
  const {
    id,
    message_with_html,
    message,
    content_images,
    created_at,
    reactions,
    is_investment_note,
  } = selectedChat;
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
  } = useCommentHandler({
    selectedChat,
  });

  return (
    <div className="border-border/80 bg-background flex h-screen w-[450px] flex-col rounded-md border">
      {/* 헤더 */}
      <div className="border-border flex items-center justify-between border-b px-4 py-3">
        <div className="flex flex-col gap-1">
          <span className="text-contrast text-sm font-semibold">댓글</span>
          <span className="text-contrast/50 text-xs">작성된 댓글을 확인하고 관리하세요.</span>
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

      {/* 선택된 채팅 메시지 */}
      <div className="bg-foreground/70 border-border/60 flex max-h-[300px] flex-shrink-0 flex-col gap-5 overflow-y-auto border-b px-4 py-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white px-1 shadow-sm">
              <img src={logoPng} alt="logo" className="max-w-full" />
            </div>
            <div>
              <p className="text-contrast/90 text-xs font-semibold">에어포인트</p>
              <p className="text-contrast/70 text-[10px]">{formatSignalDate(created_at)}</p>
            </div>
          </div>

          {canPickInvestmentNote && (
            <Button
              variant={is_investment_note ? 'default' : 'outline'}
              size="sm"
              className={
                is_investment_note
                  ? 'gap-1.5 bg-amber-500 text-xs text-white hover:bg-amber-600'
                  : 'gap-1.5 text-xs'
              }
              onClick={() => onToggleInvestmentNote?.(id)}
            >
              <Star className={`size-3.5 ${is_investment_note ? 'fill-white' : ''}`} />
              {is_investment_note ? '투자노트 해제' : '투자노트 지정'}
            </Button>
          )}
        </div>

        {/* 채팅 메시지 */}
        {message_with_html ? (
          <div
            className="text-contrast max-w-full text-xs leading-relaxed break-words whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: message_with_html }}
          />
        ) : (
          <span className="text-contrast text-xs break-words">{message}</span>
        )}

        {/* 첨부된 이미지 */}
        {content_images.length > 0 && (
          <div>
            <span className="text-contrast/50 text-xs">첨부 이미지 {content_images.length}장</span>
            <div className="[&::-webkit-scrollbar-thumb]:bg-contrast/20 hover:[&::-webkit-scrollbar-thumb]:bg-contrast/40 flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
              {content_images.map((image) => (
                <div key={image} className="flex justify-center pb-2">
                  <img
                    src={image}
                    className="max-h-40 max-w-40 cursor-pointer rounded-lg object-contain transition-opacity hover:opacity-80"
                    onClick={() => setSelectedImage(image)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 리액션 */}
        {reactions && (reactions.like > 0 || reactions.good > 0 || reactions.check > 0) && (
          <div className="border-border/50 flex justify-end gap-1.5 border-t pt-3 text-xs select-none">
            {reactions.like > 0 && (
              <div className="bg-background border-border/50 text-contrast/80 flex items-center gap-1 rounded-full border px-2 py-1 shadow-xs">
                <img src={likePng} alt="like" className="inline-block h-3.5" />
                <span>{reactions.like}</span>
              </div>
            )}
            {reactions.good > 0 && (
              <div className="bg-background border-border/50 text-contrast/80 flex items-center gap-1 rounded-full border px-2 py-1 shadow-xs">
                <img src={goodPng} alt="good" className="inline-block h-3.5" />
                <span>{reactions.good}</span>
              </div>
            )}
            {reactions.check > 0 && (
              <div className="bg-background border-border/50 text-contrast/80 flex items-center gap-1 rounded-full border px-2 py-1 shadow-xs">
                <img src={checkPng} alt="check" className="inline-block h-3.5" />
                <span>{reactions.check}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 댓글 리스트 헤더 */}
      <div className="bg-foreground flex items-center px-4 py-2.5">
        <p className="text-contrast/80 text-xs font-medium">댓글 {commentCount}개</p>
      </div>

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
            {commentList.map(
              ({
                id,
                nickname,
                message,
                images,
                replies,
                is_edited,
                reported_count,
                deleted_at,
                created_at,
                user_id,
              }) => {
                const isNew = false;

                return (
                  <div
                    key={id}
                    className={`border-border/60 group border-b px-4 py-3 transition-colors ${
                      isNew ? 'bg-[#FF7700]/5 hover:bg-[#FF7700]/15' : 'hover:bg-foreground/40'
                    }`}
                  >
                    {deleted_at && (
                      <div className="text-contrast/50 mb-1 flex items-center gap-0.5">
                        <Trash2 className="size-3" />
                        <span className="text-[10px]">삭제된 댓글입니다.</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <p
                          className={`truncate text-xs font-medium ${
                            deleted_at ? 'text-contrast/50' : 'text-contrast/90'
                          }`}
                        >
                          {nickname}
                        </p>
                        {isNew && (
                          <span className="rounded-full bg-[#FF7700] px-1.5 py-0.5 text-[9px] font-bold whitespace-nowrap text-white">
                            NEW
                          </span>
                        )}
                        <div className="text-contrast/60 flex gap-1 text-[10px] whitespace-nowrap">
                          <p>{formatCommentTime(created_at)}</p>
                          {is_edited && <p>(수정됨)</p>}
                        </div>
                        {reported_count > 0 && (
                          <span
                            className="rounded-full bg-red-500/15 px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-red-600"
                            title={`누적 신고 ${reported_count}회`}
                          >
                            신고 {reported_count}회
                          </span>
                        )}
                      </div>

                      <div className="flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-contrast/50 hover:bg-foreground/60 h-6 w-6 hover:text-red-500"
                          onClick={() => handleDisableComment(id, deleted_at)}
                          title="댓글 비활성화"
                        >
                          <MessageSquareOff className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-contrast/50 hover:bg-foreground/60 h-6 w-6 hover:text-red-500"
                          onClick={() => handleBlockUser(user_id, nickname)}
                          title="사용자 댓글 작성 제한"
                        >
                          <UserX className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div
                      className={`py-0.5 text-xs leading-relaxed break-words whitespace-pre-wrap ${
                        deleted_at ? 'text-contrast/40' : 'text-contrast'
                      }`}
                    >
                      {message}
                    </div>
                    {images.length > 0 && (
                      <>
                        <div className="mt-2">
                          <span className="text-contrast/50 text-[10px]">
                            첨부 이미지 {images.length}장
                          </span>
                        </div>
                        <div className="[&::-webkit-scrollbar-thumb]:bg-contrast/20 hover:[&::-webkit-scrollbar-thumb]:bg-contrast/40 flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                          {images.map((image) => (
                            <div key={image} className="flex justify-center pb-2">
                              <img
                                src={image}
                                className="max-h-40 max-w-40 cursor-pointer rounded-lg object-contain transition-opacity hover:opacity-80"
                                onClick={() => setSelectedImage(image)}
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* 대댓글 리스트 — 연결선 대신 화살표 아이콘 + 들여쓰기로 구분 */}
                    {replies.length > 0 && (
                      <div className="mt-2 flex flex-col gap-4">
                        {replies.map((reply) => (
                          <div key={reply.id} className="group/reply flex items-start gap-1.5 pl-4">
                            <CornerDownRight className="text-contrast/30 mt-[3px] size-3.5 flex-shrink-0" />
                            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                              {reply.deleted_at && (
                                <div className="text-contrast/50 flex items-center gap-0.5">
                                  <Trash2 className="size-3" />
                                  <span className="text-[10px]">삭제된 댓글입니다.</span>
                                </div>
                              )}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex min-w-0 items-center gap-1.5">
                                  <p
                                    className={`truncate text-[11px] font-medium ${
                                      reply.deleted_at ? 'text-contrast/50' : 'text-contrast/80'
                                    }`}
                                  >
                                    {reply.nickname}
                                  </p>
                                  <div className="text-contrast/50 flex gap-1 text-[10px] whitespace-nowrap">
                                    <p>{formatCommentTime(reply.created_at)}</p>
                                    {reply.is_edited && <p>(수정됨)</p>}
                                  </div>
                                  {reply.reported_count > 0 && (
                                    <span
                                      className="rounded-full bg-red-500/15 px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-red-600"
                                      title={`누적 신고 ${reply.reported_count}회`}
                                    >
                                      신고 {reply.reported_count}회
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/reply:opacity-100 focus-within:opacity-100">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-contrast/50 hover:bg-foreground/60 h-5 w-5 hover:text-red-500"
                                    onClick={() => handleDisableComment(reply.id, reply.deleted_at)}
                                    title="댓글 비활성화"
                                  >
                                    <MessageSquareOff className="size-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-contrast/50 hover:bg-foreground/60 h-5 w-5 hover:text-red-500"
                                    onClick={() =>
                                      handleBlockUser(Number(reply.user_id), reply.nickname)
                                    }
                                    title="사용자 댓글 작성 제한"
                                  >
                                    <UserX className="size-3" />
                                  </Button>
                                </div>
                              </div>
                              <div
                                className={`text-[11px] leading-relaxed break-words whitespace-pre-wrap ${
                                  reply.deleted_at ? 'text-contrast/40' : 'text-contrast/90'
                                }`}
                              >
                                {reply.tag_nickname && (
                                  <span className="text-primary font-medium">
                                    @{reply.tag_nickname}{' '}
                                  </span>
                                )}
                                {reply.message}
                              </div>
                              {reply.images.length > 0 && (
                                <div className="[&::-webkit-scrollbar-thumb]:bg-contrast/20 hover:[&::-webkit-scrollbar-thumb]:bg-contrast/40 mt-1 flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                                  {reply.images.map((image) => (
                                    <div key={image} className="flex justify-center pb-2">
                                      <img
                                        src={image}
                                        className="max-h-32 max-w-32 cursor-pointer rounded-lg object-contain transition-opacity hover:opacity-80"
                                        onClick={() => setSelectedImage(image)}
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                              {/* 이 스레드에 입력창이 이미 열려 있으면 숨김 — 입력창 자체의 취소로 충분해서 중복 노출 방지 */}
                              {!reply.deleted_at && replyTarget?.commentId !== id && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenReply(id, Number(reply.user_id), reply.nickname)
                                  }
                                  className="text-contrast/45 hover:text-primary mt-0.5 flex w-fit items-center gap-1 text-[10px] font-medium transition-colors"
                                >
                                  <ReplyIcon className="size-3.5" />
                                  댓글 달기
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 댓글 달기 — 이 스레드에 입력창이 이미 열려 있으면 숨김 */}
                    {!deleted_at && replyTarget?.commentId !== id && (
                      <button
                        type="button"
                        onClick={() => handleOpenReply(id, user_id, nickname)}
                        className="text-contrast/50 hover:text-primary mt-3 flex items-center gap-1 text-[11px] font-medium transition-colors"
                      >
                        <ReplyIcon className="size-4" />
                        댓글 달기
                      </button>
                    )}

                    {/* 대댓글 입력창 — 답글 리스트와 동일하게 화살표 아이콘 + 들여쓰기로 표현 */}
                    {replyTarget?.commentId === id && (
                      <div className="mt-2 flex items-start gap-1.5 pl-4">
                        <CornerDownRight className="text-contrast/30 mt-[3px] size-3.5 flex-shrink-0" />
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <span className="bg-primary/10 text-primary inline-flex w-fit items-center gap-1 rounded-full py-0.5 pr-1 pl-2 text-[11px] font-medium">
                            @{replyTarget.nickname}
                            <button
                              type="button"
                              onClick={handleCancelReply}
                              className="hover:bg-primary/20 rounded-full p-0.5"
                              title="댓글 취소"
                            >
                              <X className="size-3" />
                            </button>
                          </span>
                          <Textarea
                            autoFocus
                            value={replyValue}
                            onChange={(e) => setReplyValue(e.target.value)}
                            placeholder="댓글을 작성하세요"
                            className="bg-foreground/40 border-border/60 min-h-14 resize-none text-xs shadow-none md:text-xs"
                          />
                          {replyImage && (
                            <div className="relative w-fit">
                              <img
                                src={replyImage.url}
                                alt={replyImage.name}
                                className="h-16 w-16 rounded-lg object-cover"
                              />
                              <button
                                type="button"
                                onClick={handleReplyImageRemove}
                                className="bg-background border-border/60 text-contrast/60 absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full border hover:text-red-500"
                                title="이미지 제거"
                              >
                                <X className="size-2.5" />
                              </button>
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-1.5">
                            <div>
                              <input
                                ref={replyFileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleReplyImageSelect}
                                className="hidden"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-contrast/50 hover:bg-foreground/60 h-7 w-7"
                                onClick={handleReplyImageButtonClick}
                                disabled={!!replyImage}
                                title="이미지 첨부 (최대 1장)"
                              >
                                <ImageIcon className="size-3.5" />
                              </Button>
                            </div>
                            <div className="flex gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-contrast/60 h-7 px-2.5 text-[11px]"
                                onClick={handleCancelReply}
                              >
                                취소
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 gap-1 px-2.5 text-[11px]"
                                disabled={(!replyValue.trim() && !replyImage) || isSubmittingReply}
                                onClick={handleSubmitReply}
                              >
                                <Send className="size-3" />
                                댓글 등록
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              },
            )}
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

      {/* 관리자 댓글 작성 */}
      <div className="border-border bg-background flex-shrink-0 border-t p-3">
        <div className="border-border focus-within:border-primary/60 focus-within:ring-primary/20 flex flex-col gap-2 rounded-xl border p-1.5 pl-2.5 shadow-xs transition-colors focus-within:ring-2">
          {commentImage && (
            <div className="relative w-fit">
              <img
                src={commentImage.url}
                alt={commentImage.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={handleCommentImageRemove}
                className="bg-background border-border/60 text-contrast/60 absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full border hover:text-red-500"
                title="이미지 제거"
              >
                <X className="size-2.5" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="border-border/60 flex h-6 w-6 flex-shrink-0 items-center justify-center self-center rounded-full border bg-white px-1">
              <img src={logoPng} alt="logo" className="max-w-full" />
            </div>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 작성하세요"
              className="max-h-24 min-h-9 flex-1 resize-none border-0 bg-transparent py-1.5 text-xs shadow-none focus-visible:ring-0 md:text-xs"
            />
            <input
              ref={commentFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCommentImageSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-contrast/50 hover:bg-foreground/60 h-8 w-8 flex-shrink-0"
              onClick={handleCommentImageButtonClick}
              disabled={!!commentImage}
              title="이미지 첨부 (최대 1장)"
            >
              <ImageIcon className="size-4" />
            </Button>
            <Button
              size="icon"
              className="h-8 w-8 flex-shrink-0 rounded-lg"
              disabled={(!newComment.trim() && !commentImage) || isSubmittingComment}
              onClick={handleSubmitComment}
              title="댓글 등록"
            >
              <Send className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

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
