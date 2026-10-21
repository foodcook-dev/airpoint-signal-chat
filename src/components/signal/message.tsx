import { Trash2, Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/types/signal';
import { formatSignalDate } from '@/utils';
import logoPng from '@/assets/images/app_logo.png';
import likePng from '@/assets/images/signal_like.png';
import goodPng from '@/assets/images/signal_good.png';
import checkPng from '@/assets/images/signal_check.png';
import { PollResultMessage, PollMessage } from './poll-message';
import { DefaultMessage } from './default-message';

interface SignalMessageProps {
  chat: ChatMessage;
  onDelete: (id: string) => void;
  onOpenThread?: (chat: ChatMessage) => void;
  onToggleInvestmentNote?: (messageId: string) => void;
  canPickInvestmentNote?: boolean;
  isSelected?: boolean;
}

export default function SignalMessage({
  chat,
  onDelete,
  onOpenThread,
  onToggleInvestmentNote,
  canPickInvestmentNote = false,
  isSelected = false,
}: SignalMessageProps) {
  const {
    id,
    is_notice,
    is_investment_note,
    comment_count,
    message_with_html,
    message,
    created_at,
    og_tags,
    content_images,
    poll,
    poll_notification,
    reactions,
  } = chat;

  const handleClickCommentCount = () => onOpenThread?.(chat);

  // 카드 전체를 패널 오픈 트리거로 쓴다 — 단, 링크(OG카드/본문 HTML 속 <a>)는 그 자체의
  // 기본 동작(새 탭 열기)만 하고 패널은 열리지 않아야 해서 클릭 지점이 <a> 안이면 무시한다.
  // 이미지/버튼처럼 자체 동작이 있는 요소는 각자 onClick에서 stopPropagation으로 막는다.
  const handleCardClick = (e: React.MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('a')) return;
    onOpenThread?.(chat);
  };

  const renderContent = () => {
    // 투표 종료 메시지 (현재는 closed 타입만 존재)
    if (poll_notification?.type === 'closed') {
      return <PollResultMessage pollResult={poll_notification} message={message} />;
    }

    // 투표 메시지
    if (poll) return <PollMessage poll={poll} createdAt={created_at} isNotice={is_notice} />;

    // 기본 메시지
    return (
      <DefaultMessage
        message={message}
        messageHtml={message_with_html}
        ogTags={og_tags}
        contentImages={content_images}
      />
    );
  };

  const hasReactions = !!(reactions?.like || reactions?.good || reactions?.check);

  const isPollMessage = !!poll || poll_notification?.type === 'closed';

  return (
    <article
      onClick={handleCardClick}
      className={`group border-contrast/15 bg-background hover:bg-foreground flex cursor-pointer flex-col gap-3 border-b py-4 pr-8 pl-4 transition-colors ${
        isSelected ? 'bg-primary/5' : ''
      } ${canPickInvestmentNote && is_investment_note ? 'border-l-[3px] border-l-amber-500 pl-3' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="border-border flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border bg-white px-1.5">
          <img src={logoPng} alt="logo" className="max-w-full" />
        </div>
        <span className="text-contrast truncate text-[15px] font-semibold">에어포인트</span>
        {canPickInvestmentNote && is_investment_note && (
          <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-amber-600">
            <Star className="size-3 fill-amber-500 text-amber-500" />
            투자노트
          </span>
        )}

        <div className="ml-auto flex flex-shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          {canPickInvestmentNote && (
            <Button
              variant="ghost"
              size="icon"
              className="text-contrast/50 hover:bg-button-background h-7 w-7 hover:text-amber-500"
              onClick={(e) => {
                e.stopPropagation();
                onToggleInvestmentNote?.(id);
              }}
              title={is_investment_note ? '투자노트 해제' : '투자노트로 픽'}
            >
              <Star
                className={`size-3.5 ${is_investment_note ? 'fill-amber-500 text-amber-500' : ''}`}
              />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-contrast/50 hover:bg-button-background h-7 w-7 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            title="삭제"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
        <span className="text-contrast/40 flex flex-shrink-0 items-center text-xs">
          {formatSignalDate(created_at)}
        </span>
      </div>

      <div className="pl-[52px]">{renderContent()}</div>

      {(!isPollMessage || hasReactions) && (
        <div className="text-contrast/60 flex items-center pt-2 pl-[52px] text-xs">
          {!isPollMessage && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClickCommentCount();
              }}
              className="hover:text-primary flex items-center gap-1.5 transition-colors"
              title={comment_count > 0 ? `댓글 ${comment_count}개` : '댓글 작성하기'}
            >
              <MessageSquare className="size-4" />
              {comment_count}
            </button>
          )}

          {hasReactions && (
            <div className="ml-auto flex items-center gap-4">
              {reactions.like > 0 && (
                <span className="flex items-center gap-1.5">
                  <img src={likePng} alt="like" className="h-4" />
                  {reactions.like}
                </span>
              )}
              {reactions.good > 0 && (
                <span className="flex items-center gap-1.5">
                  <img src={goodPng} alt="good" className="h-4" />
                  {reactions.good}
                </span>
              )}
              {reactions.check > 0 && (
                <span className="flex items-center gap-1.5">
                  <img src={checkPng} alt="check" className="h-4" />
                  {reactions.check}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
