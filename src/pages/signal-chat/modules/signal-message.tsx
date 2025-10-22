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
import { ChatMessage } from '../types';

interface SignalMessageProps {
  chat: ChatMessage;
  onDelete: (id: string) => void;
}

export default function SignalMessage({ chat, onDelete }: SignalMessageProps) {
  return (
    <ChatBubble key={chat.id} variant="sent">
      <ChatBubbleAvatar />
      <div className="flex flex-col space-y-2">
        <div className="items-end flex flex-col space-y-2">
          <ChatBubbleMessage>
            {chat.message_with_html ? (
              <div dangerouslySetInnerHTML={{ __html: chat.message_with_html }} />
            ) : (
              chat.message
            )}
          </ChatBubbleMessage>
          <OGTag ogTags={chat.og_tags || []} />
          <ContentImages images={chat.content_images || []} />
        </div>

        <div className="flex gap-1 justify-end text-xs text-contrast/80 select-none">
          {chat.reactions.like > 0 && (
            <div className="flex gap-1 items-center rounded-xl bg-foreground shadow-sm p-2">
              <img src={likePng} alt="like" className="inline-block h-3.5" />
              <span>{chat.reactions.like}</span>
            </div>
          )}
          {chat.reactions.good > 0 && (
            <div className="flex gap-1 items-center rounded-xl bg-foreground shadow-sm p-2">
              <img src={goodPng} alt="good" className="inline-block h-3.5" />
              <span>{chat.reactions.good}</span>
            </div>
          )}
          {chat.reactions.check > 0 && (
            <div className="flex gap-1 items-center rounded-xl bg-foreground shadow-sm p-2">
              <img src={checkPng} alt="check" className="inline-block h-3.5" />
              <span>{chat.reactions.check}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end">
          <ChatBubbleTimestamp timestamp={chat.created_at} />
        </div>
      </div>
      <ChatBubbleActionWrapper variant="sent">
        <ChatBubbleAction
          className="size-8"
          key={`Delete-${chat.id}`}
          icon={<Trash2 className="size-3" />}
          onClick={() => onDelete(chat.id)}
        />
      </ChatBubbleActionWrapper>
    </ChatBubble>
  );
}
