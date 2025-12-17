import { ChatBubbleMessage } from '@/components/ui/chat/chat-bubble';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import likePng from '@/assets/images/signal_like.png';
import goodPng from '@/assets/images/signal_good.png';
import checkPng from '@/assets/images/signal_check.png';
import { ChatMessage } from '@/pages/signal-chat/types';
import ImagePreviewDialog from '@/components/modules/dialog/image-preview-dialog';

interface OGTag {
  og_image?: string;
  og_title: string;
  og_description: string;
  og_tag_link: string;
}

interface OGTagProps {
  ogTags: OGTag[];
}

function OGTag({ ogTags }: OGTagProps) {
  if (!ogTags || ogTags.length === 0) return null;

  return (
    <div className="max-w-[600px]">
      {ogTags.map((og, index) => (
        <div
          key={index}
          className="bg-foreground text-contrast rounded-lg overflow-hidden shadow-sm"
        >
          {og.og_image && (
            <img src={og.og_image} alt={og.og_title} className="w-full h-32 object-cover" />
          )}
          <div className="p-3">
            <h3 className="font-medium text-sm line-clamp-2 mb-1">{og.og_title}</h3>
            <p className="text-xs line-clamp-3 mb-1">{og.og_description}</p>
            <a href={og.og_tag_link} target="_blank" className="text-xs">
              {og.og_tag_link}
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

interface ContentImagesProps {
  images: string[];
}

function ContentImages({ images }: ContentImagesProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="flex gap-2">
        {images.map((imageUrl, index) => (
          <img
            key={index}
            src={imageUrl}
            alt={`image-${index + 1}`}
            className="w-full h-32 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setSelectedImage(imageUrl)}
          />
        ))}
      </div>

      <ImagePreviewDialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
        imageUrl={selectedImage}
      />
    </>
  );
}

interface DefaultMessageProps {
  message: string;
  message_with_html?: string | null;
  comment_count?: number;
  og_tags?: ChatMessage['og_tags'];
  content_images?: ChatMessage['content_images'];
  reactions?: ChatMessage['reactions'];
  onClickCommentCount?: () => void;
}

export function DefaultMessage({
  message,
  message_with_html,
  comment_count = 0,
  og_tags,
  content_images,
  reactions,
  onClickCommentCount,
}: DefaultMessageProps) {
  return (
    <>
      <div className="items-end flex flex-col gap-2">
        <ChatBubbleMessage>
          {message_with_html ? (
            <div dangerouslySetInnerHTML={{ __html: message_with_html }} />
          ) : (
            <span className="text-sm text-contrast">{message}</span>
          )}
          {comment_count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClickCommentCount}
              className="w-full justify-start items-center rounded-none mt-2 border-t border-border gap-4 px-0 pt-2"
            >
              <span className="text-xs text-primary font-medium">댓글 {comment_count}개</span>
              <span className="text-[10px] text-contrast/50">댓글 전체 보기</span>
            </Button>
          )}
        </ChatBubbleMessage>
        <OGTag ogTags={og_tags || []} />
        <ContentImages images={content_images || []} />
      </div>
      {((reactions?.like ?? 0) > 0 ||
        (reactions?.good ?? 0) > 0 ||
        (reactions?.check ?? 0) > 0) && (
        <div className="flex gap-1 justify-end text-xs text-contrast/80 select-none">
          {(reactions?.like ?? 0) > 0 && (
            <div className="flex gap-1 items-center rounded-xl bg-foreground shadow-sm p-2">
              <img src={likePng} alt="like" className="inline-block h-3.5" />
              <span>{reactions?.like}</span>
            </div>
          )}
          {(reactions?.good ?? 0) > 0 && (
            <div className="flex gap-1 items-center rounded-xl bg-foreground shadow-sm p-2">
              <img src={goodPng} alt="good" className="inline-block h-3.5" />
              <span>{reactions?.good}</span>
            </div>
          )}
          {(reactions?.check ?? 0) > 0 && (
            <div className="flex gap-1 items-center rounded-xl bg-foreground shadow-sm p-2">
              <img src={checkPng} alt="check" className="inline-block h-3.5" />
              <span>{reactions?.check}</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}
