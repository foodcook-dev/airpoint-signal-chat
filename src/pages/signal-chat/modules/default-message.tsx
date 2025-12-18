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
          className="bg-foreground text-contrast overflow-hidden rounded-lg shadow-sm"
        >
          {og.og_image && (
            <img src={og.og_image} alt={og.og_title} className="h-32 w-full object-cover" />
          )}
          <div className="p-3">
            <h3 className="mb-1 line-clamp-2 text-sm font-medium">{og.og_title}</h3>
            <p className="mb-1 line-clamp-3 text-xs">{og.og_description}</p>
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
            className="h-32 w-full cursor-pointer rounded-lg object-cover transition-opacity hover:opacity-80"
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
  messageHtml?: string | null;
  commentCount?: number;
  ogTags?: ChatMessage['og_tags'];
  contentImages?: ChatMessage['content_images'];
  reactions: ChatMessage['reactions'];
  onClickCommentCount?: () => void;
}

export function DefaultMessage({
  message,
  messageHtml,
  commentCount = 0,
  ogTags,
  contentImages,
  reactions,
  onClickCommentCount,
}: DefaultMessageProps) {
  return (
    <>
      <div className="flex flex-col items-end gap-2">
        {/* 기본 메시지 */}
        <ChatBubbleMessage>
          {messageHtml ? (
            <div dangerouslySetInnerHTML={{ __html: messageHtml }} />
          ) : (
            <span className="text-contrast text-sm">{message}</span>
          )}
          {commentCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClickCommentCount}
              className="border-border mt-2 w-full justify-start gap-4 rounded-none border-t px-0 pt-2"
            >
              <span className="text-primary text-xs">댓글 {commentCount}개</span>
              <span className="text-contrast/50 text-[10px]">댓글 전체 보기</span>
            </Button>
          )}
        </ChatBubbleMessage>

        {/* OG 태그 */}
        <OGTag ogTags={ogTags || []} />

        {/* 첨부된 이미지 */}
        <ContentImages images={contentImages || []} />
      </div>

      {/* 리액션 */}
      {reactions && (
        <div className="text-contrast/80 flex justify-end gap-1 text-xs select-none">
          {reactions?.like > 0 && (
            <div className="bg-foreground flex items-center gap-1 rounded-xl p-2 shadow-sm">
              <img src={likePng} alt="like" className="inline-block h-3.5" />
              <span>{reactions?.like}</span>
            </div>
          )}
          {reactions?.good > 0 && (
            <div className="bg-foreground flex items-center gap-1 rounded-xl p-2 shadow-sm">
              <img src={goodPng} alt="good" className="inline-block h-3.5" />
              <span>{reactions?.good}</span>
            </div>
          )}
          {reactions?.check > 0 && (
            <div className="bg-foreground flex items-center gap-1 rounded-xl p-2 shadow-sm">
              <img src={checkPng} alt="check" className="inline-block h-3.5" />
              <span>{reactions?.check}</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}
