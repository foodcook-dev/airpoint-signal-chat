import { Trash2 } from 'lucide-react';
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleTimestamp,
  ChatBubbleAction,
  ChatBubbleActionWrapper,
} from '@/components/ui/chat/chat-bubble';
import { ChatMessage } from '@/pages/signal-chat/types';
import { PollResultMessage, PollMessage } from './poll-message';
import { DefaultMessage } from './default-message';

interface SignalMessageProps {
  chat: ChatMessage;
  onDelete: (id: string) => void;
  onOpenThread?: (chat: ChatMessage) => void;
}

export default function SignalMessage({ chat, onDelete, onOpenThread }: SignalMessageProps) {
  const {
    id,
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

  const handleClickCommentCount = () => {
    if (!comment_count || comment_count <= 0) return;
    if (onOpenThread) {
      onOpenThread(chat);
    }
  };

  const renderContent = () => {
    // 투표 종료 메시지
    if (poll_notification) {
      return (
        <PollResultMessage
          poll_notification={poll_notification}
          message={message}
          message_with_html={message_with_html}
        />
      );
    }

    // 투표 메시지
    if (poll) return <PollMessage poll={poll} created_at={created_at} />;

    // 기본 메시지
    return (
      <DefaultMessage
        message={message}
        message_with_html={message_with_html}
        comment_count={comment_count}
        og_tags={og_tags}
        content_images={content_images}
        reactions={reactions}
        onClickCommentCount={handleClickCommentCount}
      />
    );
  };

  return (
    <ChatBubble key={id} variant="sent">
      <ChatBubbleAvatar />
      <div className="flex flex-col gap-2">
        {renderContent()}
        <ChatBubbleTimestamp timestamp={created_at} />
      </div>
      <ChatBubbleActionWrapper variant="sent">
        <ChatBubbleAction
          className="size-8"
          key={`Delete-${id}`}
          icon={<Trash2 className="size-3" />}
          onClick={() => onDelete(id)}
        />
      </ChatBubbleActionWrapper>
    </ChatBubble>
  );
}
