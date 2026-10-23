import { Trash2, MessageSquareOff, UserX, Pencil, Send, ImageIcon, X } from 'lucide-react';
import { ReplyIcon } from '@/components/icons/reply-icon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatCommentTime } from '@/utils';
import { ADMIN_USER_ID } from '@/constants/signal';
import { cn } from '@/libs/auth';
import adminBadge from '@/assets/icons/admin-badge.svg';
import useNewCommentsStore from '@/stores/new-comments';
import { NewBadge } from './new-badge';
import ReplyItem from './reply-item';
import type { ReplyTarget } from '@/hooks/useCommentHandler';
import type { Comment, Reply, SelectedImage } from '@/types/signal';

interface CommentItemProps {
  comment: Comment;
  replyTarget: ReplyTarget;
  replyValue: string;
  onChangeReplyValue: (value: string) => void;
  replyImage: SelectedImage | null;
  replyFileInputRef: React.RefObject<HTMLInputElement | null>;
  onReplyImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReplyImageRemove: () => void;
  onReplyImageButtonClick: () => void;
  onOpenReply: (commentId: number, userId: number, nickname: string) => void;
  onCancelReply: () => void;
  onSubmitReply: () => void;
  isSubmittingReply: boolean;
  onDisableComment: (id: number, isDeleted: boolean) => void;
  onDeleteComment: (id: number) => void;
  onBlockUser: (userId: number, nickname: string) => void;
  onStartEditComment: (comment: Comment) => void;
  onStartEditReply: (reply: Reply) => void;
  onImageClick: (url: string) => void;
}

// 댓글 한 줄 — 헤더(닉네임/시간/신고)+본문+이미지+수정/비활성화/차단 버튼, 그 아래 대댓글 스레드
// (대댓글 목록 + 열려 있을 때의 대댓글 입력창)까지 포함한다.
export default function CommentItem({
  comment,
  replyTarget,
  replyValue,
  onChangeReplyValue,
  replyImage,
  replyFileInputRef,
  onReplyImageSelect,
  onReplyImageRemove,
  onReplyImageButtonClick,
  onOpenReply,
  onCancelReply,
  onSubmitReply,
  isSubmittingReply,
  onDisableComment,
  onDeleteComment,
  onBlockUser,
  onStartEditComment,
  onStartEditReply,
  onImageClick,
}: CommentItemProps) {
  const {
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
    is_admin_author,
    signal_talk_id,
  } = comment;
  const isAdminOwned = user_id === ADMIN_USER_ID;
  const isNew = useNewCommentsStore(
    (state) => state.newIdsBySignal[String(signal_talk_id)]?.has(id) ?? false,
  );
  const isReplyComposerOpenForThread = replyTarget?.commentId === id;

  return (
    <div
      className={cn(
        'border-border/60 group hover:bg-foreground/40 relative border-b px-4 py-3 transition-colors',
        isNew && 'bg-primary/5',
      )}
    >
      {isNew && (
        <span aria-hidden className="bg-primary absolute top-1.5 bottom-1.5 left-0 w-0.5 rounded-r-full" />
      )}
      {deleted_at && (
        <div className="text-contrast/50 mb-1 flex items-center gap-0.5">
          <Trash2 className="size-3" />
          <span className="text-[10px]">삭제된 댓글입니다.</span>
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1">
          <div className="flex items-center gap-0.5">
            <p
              className={`truncate text-xs font-semibold ${
                deleted_at ? 'text-contrast/50' : 'text-contrast/90'
              }`}
            >
              {nickname}
            </p>
            {is_admin_author && (
              <img src={adminBadge} alt="관리자" className="size-4 flex-shrink-0" />
            )}
            {isNew && <NewBadge className="ml-0.5" />}
          </div>
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
          {isAdminOwned && !deleted_at && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-contrast/50 hover:bg-foreground/60 hover:text-primary h-6 w-6"
                onClick={() => onStartEditComment(comment)}
                title="댓글 수정"
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-contrast/50 hover:bg-foreground/60 h-6 w-6 hover:text-red-500"
                onClick={() => onDeleteComment(id)}
                title="댓글 삭제"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </>
          )}
          {!isAdminOwned && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-contrast/50 hover:bg-foreground/60 h-6 w-6 hover:text-red-500"
                onClick={() => onDisableComment(id, deleted_at)}
                title="댓글 비활성화"
              >
                <MessageSquareOff className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-contrast/50 hover:bg-foreground/60 h-6 w-6 hover:text-red-500"
                onClick={() => onBlockUser(user_id, nickname)}
                title="사용자 댓글 작성 제한"
              >
                <UserX className="size-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>
      <div
        className={`mt-1 text-xs leading-relaxed font-normal break-words whitespace-pre-wrap ${
          deleted_at ? 'text-contrast/40' : 'text-contrast/80'
        }`}
      >
        {message}
      </div>
      {images.length > 0 && (
        <>
          <div className="mt-2">
            <span className="text-contrast/50 text-[10px]">첨부 이미지 {images.length}장</span>
          </div>
          <div className="[&::-webkit-scrollbar-thumb]:bg-contrast/20 hover:[&::-webkit-scrollbar-thumb]:bg-contrast/40 flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            {images.map((image) => (
              <div key={image} className="flex justify-center pb-2">
                <img
                  src={image}
                  className="max-h-40 max-w-40 cursor-pointer rounded-lg object-contain transition-opacity hover:opacity-80"
                  onClick={() => onImageClick(image)}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {/* 대댓글 스레드 — 세로 연결선 하나로 같은 스레드임을 표현 (디스코드/슬랙 스타일) */}
      {(replies.length > 0 || isReplyComposerOpenForThread) && (
        <div className="border-border/60 mt-3 flex flex-col gap-4 border-l-2 pl-4">
          {replies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              commentId={id}
              isReplyComposerOpenForThread={isReplyComposerOpenForThread}
              onStartEditReply={onStartEditReply}
              onDisableComment={onDisableComment}
              onDeleteComment={onDeleteComment}
              onBlockUser={onBlockUser}
              onOpenReply={onOpenReply}
              onImageClick={onImageClick}
            />
          ))}

          {/* 대댓글 입력창 — 같은 세로선 안에서 이어지도록 */}
          {isReplyComposerOpenForThread && replyTarget && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                {/* 수정 중엔 @태그를 바꿀 수 있는 UI를 아예 제공하지 않는다 — 항상 원래 태그 그대로 */}
                <span className="bg-primary/10 text-primary inline-flex w-fit items-center gap-1 rounded-full py-0.5 pr-1 pl-2 text-[11px] font-medium">
                  @{replyTarget.nickname}
                  <button
                    type="button"
                    onClick={onCancelReply}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                    title="댓글 취소"
                  >
                    <X className="size-3" />
                  </button>
                </span>
                {replyTarget.editingReplyId != null && (
                  <span className="text-contrast/50 text-[11px] font-medium">댓글 수정 중</span>
                )}
              </div>
              <Textarea
                autoFocus
                value={replyValue}
                onChange={(e) => onChangeReplyValue(e.target.value)}
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
                    onClick={onReplyImageRemove}
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
                    onChange={onReplyImageSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-contrast/50 hover:bg-button-background h-7 w-7"
                    onClick={onReplyImageButtonClick}
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
                    onClick={onCancelReply}
                  >
                    취소
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 gap-1 px-2.5 text-[11px]"
                    disabled={(!replyValue.trim() && !replyImage) || isSubmittingReply}
                    onClick={onSubmitReply}
                  >
                    <Send className="size-3" />
                    {replyTarget.editingReplyId != null ? '수정하기' : '댓글 등록'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 댓글 달기 — 이 스레드에 입력창이 이미 열려 있으면 숨김 */}
      {!deleted_at && !isReplyComposerOpenForThread && (
        <button
          type="button"
          onClick={() => onOpenReply(id, user_id, nickname)}
          className="text-contrast/50 hover:text-primary mt-3 flex items-center gap-1 text-[11px] font-medium transition-colors"
        >
          <ReplyIcon className="size-4" />
          댓글 달기
        </button>
      )}
    </div>
  );
}
