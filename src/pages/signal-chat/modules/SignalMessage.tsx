import { Trash2 } from 'lucide-react';
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
  ChatBubbleAction,
  ChatBubbleActionWrapper,
} from '@/components/ui/chat/chat-bubble';
import OGTag from './OGTag';
import ContentImages from './ContentImages';

interface SignalMessageProps {
  chat: {
    id: string;
    message: string;
    message_with_html?: string;
    created_at: string;
    og_tags?: Array<{
      og_image?: string;
      og_title: string;
      og_description: string;
      og_tag_link: string;
    }>;
    content_images?: string[];
  };
  onDelete: (id: string) => void;
}

export default function SignalMessage({ chat, onDelete }: SignalMessageProps) {
  return (
    <ChatBubble key={chat.id} variant="sent">
      <ChatBubbleAvatar fallback="Admin" />
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
        <div className="flex items-center justify-end">
          <ChatBubbleTimestamp timestamp={chat.created_at} />
        </div>
      </div>
      <ChatBubbleActionWrapper variant="sent">
        <ChatBubbleAction
          className="size-6"
          key={`Delete-${chat.id}`}
          icon={<Trash2 className="size-3" />}
          onClick={() => onDelete(chat.id)}
        />
      </ChatBubbleActionWrapper>
    </ChatBubble>
  );
}
