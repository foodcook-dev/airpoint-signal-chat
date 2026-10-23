import { Trash2, MessageSquareOff, UserX, Pencil } from 'lucide-react';
import { ReplyIcon } from '@/components/icons/reply-icon';
import { Button } from '@/components/ui/button';
import { formatCommentTime } from '@/utils';
import { ADMIN_USER_ID } from '@/constants/signal';
import adminBadge from '@/assets/icons/admin-badge.svg';
import type { Reply } from '@/types/signal';

interface ReplyItemProps {
  reply: Reply;
  commentId: number;
  isReplyComposerOpenForThread: boolean;
  onStartEditReply: (reply: Reply) => void;
  onDisableComment: (id: number, isDeleted: boolean) => void;
  onDeleteComment: (id: number) => void;
  onBlockUser: (userId: number, nickname: string) => void;
  onOpenReply: (commentId: number, userId: number, nickname: string) => void;
  onImageClick: (url: string) => void;
}

// 대댓글 스레드 안의 대댓글 한 줄 — 헤더(닉네임/시간/신고)+본문+이미지+수정/삭제/차단 버튼
export default function ReplyItem({
  reply,
  commentId,
  isReplyComposerOpenForThread,
  onStartEditReply,
  onDisableComment,
  onDeleteComment,
  onBlockUser,
  onOpenReply,
  onImageClick,
}: ReplyItemProps) {
  const isAdminOwned = Number(reply.user_id) === ADMIN_USER_ID;

  return (
    <div className="group/reply flex flex-col gap-0.5">
      {reply.deleted_at && (
        <div className="text-contrast/50 flex items-center gap-0.5">
          <Trash2 className="size-3" />
          <span className="text-[10px]">삭제된 댓글입니다.</span>
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1">
          <div className="flex items-center gap-0.5">
            <p
              className={`truncate text-xs font-semibold ${
                reply.deleted_at ? 'text-contrast/50' : 'text-contrast/80'
              }`}
            >
              {reply.nickname}
            </p>
            {reply.is_admin_author && (
              <img src={adminBadge} alt="관리자" className="size-4 flex-shrink-0" />
            )}
          </div>
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
          {isAdminOwned && !reply.deleted_at && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-contrast/50 hover:bg-button-background hover:text-primary h-5 w-5"
                onClick={() => onStartEditReply(reply)}
                title="댓글 수정"
              >
                <Pencil className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-contrast/50 hover:bg-button-background h-5 w-5 hover:text-red-500"
                onClick={() => onDeleteComment(reply.id)}
                title="댓글 삭제"
              >
                <Trash2 className="size-3" />
              </Button>
            </>
          )}
          {!isAdminOwned && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-contrast/50 hover:bg-button-background h-5 w-5 hover:text-red-500"
                onClick={() => onDisableComment(reply.id, reply.deleted_at)}
                title="댓글 비활성화"
              >
                <MessageSquareOff className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-contrast/50 hover:bg-button-background h-5 w-5 hover:text-red-500"
                onClick={() => onBlockUser(Number(reply.user_id), reply.nickname)}
                title="사용자 댓글 작성 제한"
              >
                <UserX className="size-3" />
              </Button>
            </>
          )}
        </div>
      </div>
      <div
        className={`mt-1 text-xs leading-relaxed font-normal break-words whitespace-pre-wrap ${
          reply.deleted_at ? 'text-contrast/40' : 'text-contrast/75'
        }`}
      >
        {reply.tag_nickname && (
          <span className="text-primary font-medium">@{reply.tag_nickname} </span>
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
                onClick={() => onImageClick(image)}
              />
            </div>
          ))}
        </div>
      )}
      {/* 이 스레드에 입력창이 이미 열려 있으면 숨김 — 입력창 자체의 취소로 충분해서 중복 노출 방지 */}
      {!reply.deleted_at && !isReplyComposerOpenForThread && (
        <button
          type="button"
          onClick={() => onOpenReply(commentId, Number(reply.user_id), reply.nickname)}
          className="text-contrast/45 hover:text-primary mt-0.5 flex w-fit items-center gap-1 text-[10px] font-medium transition-colors"
        >
          <ReplyIcon className="size-3.5" />
          댓글 달기
        </button>
      )}
    </div>
  );
}
