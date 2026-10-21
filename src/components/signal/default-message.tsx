import { useState } from 'react';
import { ChatMessage } from '@/types/signal';
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
    <div className="flex max-w-[480px] flex-col gap-2">
      {ogTags.map((og, index) => (
        <a
          key={index}
          href={og.og_tag_link}
          target="_blank"
          className="bg-foreground/80 hover:bg-foreground flex gap-3 rounded-xl p-2.5 transition-colors"
        >
          {og.og_image && (
            <img
              src={og.og_image}
              alt={og.og_title}
              className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
            />
          )}
          <div className="flex min-w-0 flex-col justify-center gap-0.5">
            <h3 className="text-contrast line-clamp-1 text-xs font-semibold">{og.og_title}</h3>
            <p className="text-contrast/60 line-clamp-2 text-[11px]">{og.og_description}</p>
            <span className="text-contrast/40 truncate text-[10px]">{og.og_tag_link}</span>
          </div>
        </a>
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
      <div className="[&::-webkit-scrollbar-thumb]:bg-contrast/20 hover:[&::-webkit-scrollbar-thumb]:bg-contrast/40 flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        {images.map((imageUrl, index) => (
          <img
            key={index}
            src={imageUrl}
            alt={`image-${index + 1}`}
            className="h-40 w-56 flex-shrink-0 cursor-pointer rounded-lg object-cover transition-opacity hover:opacity-80"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(imageUrl);
            }}
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
  ogTags?: ChatMessage['og_tags'];
  contentImages?: ChatMessage['content_images'];
}

export function DefaultMessage({
  message,
  messageHtml,
  ogTags,
  contentImages,
}: DefaultMessageProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* 첨부된 이미지 */}
      <ContentImages images={contentImages || []} />

      {/* 메시지 내용 — 줄바꿈 유지 + 긴 링크 등 안 끊기는 토큰도 꺾이도록 */}
      {messageHtml ? (
        <div
          className="text-contrast text-sm leading-relaxed break-words whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: messageHtml }}
        />
      ) : (
        <span className="text-contrast text-sm leading-relaxed break-words whitespace-pre-wrap">
          {message}
        </span>
      )}

      {/* OG 태그 */}
      <OGTag ogTags={ogTags || []} />
    </div>
  );
}
