import { Trash2 } from 'lucide-react';
import likePng from '@/assets/images/signal_like.png';
import goodPng from '@/assets/images/signal_good.png';
import checkPng from '@/assets/images/signal_check.png';
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
  ChatBubbleAction,
  ChatBubbleActionWrapper,
} from '@/components/ui/chat/chat-bubble';
import OGTag from './og-tag';
import ContentImages from './content-images';
import { ChatMessage } from '@/pages/signal-chat/types';
import { PollResultMessage, PollMessage } from './poll-message';

interface SignalMessageProps {
  chat: ChatMessage;
  onDelete: (id: string) => void;
}

export default function SignalMessage({ chat, onDelete }: SignalMessageProps) {
  const {
    id,
    message_with_html,
    message,
    created_at,
    og_tags,
    content_images,
    poll,
    poll_notification,
    reactions,
  } = chat;

  const renderContent = () => {
    if (poll_notification) {
      return (
        <PollResultMessage
          poll_notification={poll_notification}
          message={message}
          message_with_html={message_with_html}
        />
      );
    }

    if (poll) {
      return <PollMessage poll={poll} created_at={created_at} />;
    }

    // 기본 채팅 + 리액션
    return (
      <>
        <div className="items-end flex flex-col gap-2">
          <ChatBubbleMessage>
            {message_with_html ? (
              <div dangerouslySetInnerHTML={{ __html: message_with_html }} />
            ) : (
              message
            )}
          </ChatBubbleMessage>
          <OGTag ogTags={og_tags || []} />
          <ContentImages images={content_images || []} />
        </div>
        <div className="flex gap-1 justify-end text-xs text-contrast/80 select-none">
          {reactions?.like > 0 && (
            <div className="flex gap-1 items-center rounded-xl bg-foreground shadow-sm p-2">
              <img src={likePng} alt="like" className="inline-block h-3.5" />
              <span>{reactions.like}</span>
            </div>
          )}
          {reactions?.good > 0 && (
            <div className="flex gap-1 items-center rounded-xl bg-foreground shadow-sm p-2">
              <img src={goodPng} alt="good" className="inline-block h-3.5" />
              <span>{reactions.good}</span>
            </div>
          )}
          {reactions?.check > 0 && (
            <div className="flex gap-1 items-center rounded-xl bg-foreground shadow-sm p-2">
              <img src={checkPng} alt="check" className="inline-block h-3.5" />
              <span>{reactions.check}</span>
            </div>
          )}
        </div>
      </>
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
