import { Trash2, Star } from 'lucide-react';
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleTimestamp,
  ChatBubbleAction,
  ChatBubbleActionWrapper,
} from '@/components/ui/chat/chat-bubble';
import { ChatMessage } from '@/types/signal';
import { PollResultMessage, PollMessage } from './poll-message';
import { DefaultMessage } from './default-message';

interface SignalMessageProps {
  chat: ChatMessage;
  onDelete: (id: string) => void;
  onOpenThread?: (chat: ChatMessage) => void;
  onToggleInvestmentNote?: (messageId: string) => void;
  // 투자노트는 프리미엄 채널에만 있는 기능 — 무료 채널에서는 버튼 자체를 숨김
  canPickInvestmentNote?: boolean;
  // 마지막으로 댓글 패널을 연 이후 새로 달린 댓글 수
  newCommentCount?: number;
}

export default function SignalMessage({
  chat,
  onDelete,
  onOpenThread,
  onToggleInvestmentNote,
  canPickInvestmentNote = false,
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
        commentCount={comment_count}
        newCommentCount={0}
        ogTags={og_tags}
        contentImages={content_images}
        reactions={reactions}
        onClickCommentCount={handleClickCommentCount}
      />
    );
  };

  return (
    <ChatBubble key={id} variant="sent">
      <ChatBubbleAvatar />
      <div className="relative flex min-w-0 flex-col gap-2">
        {canPickInvestmentNote && is_investment_note && (
          <div className="absolute -top-2 -right-2 z-10 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-1 text-[11px] font-semibold whitespace-nowrap text-white shadow-sm">
            <Star className="size-3 fill-white" />
            투자노트
          </div>
        )}
        {renderContent()}
        <ChatBubbleTimestamp timestamp={created_at} />
      </div>
      <ChatBubbleActionWrapper variant="sent">
        {canPickInvestmentNote && (
          <ChatBubbleAction
            className="h-8 w-auto justify-start gap-1.5 px-2.5 text-xs font-medium whitespace-nowrap"
            key={`InvestmentNote-${id}`}
            icon={
              <>
                <Star
                  className={`size-3 ${is_investment_note ? 'fill-amber-500 text-amber-500' : ''}`}
                />
                {is_investment_note ? '투자노트 해제' : '투자노트 지정'}
              </>
            }
            onClick={() => onToggleInvestmentNote?.(id)}
            title={is_investment_note ? '투자노트 해제' : '투자노트로 픽'}
          />
        )}
        <ChatBubbleAction
          className="h-8 w-auto justify-start gap-1.5 px-2.5 text-xs font-medium whitespace-nowrap"
          key={`Delete-${id}`}
          icon={
            <>
              <Trash2 className="size-3" />
              삭제
            </>
          }
          onClick={() => onDelete(id)}
          title="삭제"
        />
      </ChatBubbleActionWrapper>
    </ChatBubble>
  );
}
