import { Send, ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInput } from '@/components/ui/chat/chat-input';
import { CHAT_CONSTANTS } from '@/pages/signal-chat/constants';

interface ImagePreviewProps {
  images: Array<{
    url: string;
    name: string;
  }>;
  onRemove: (index: number) => void;
}

function ImagePreview({ images, onRemove }: ImagePreviewProps) {
  if (images.length === 0) return null;

  return (
    <div className="border-border/50 border-b p-3">
      <div className="flex max-w-md gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative">
            <img src={image.url} alt={image.name} className="h-20 w-full rounded-lg object-cover" />
            <Button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
            >
              <X className="h-3 w-3" />
            </Button>
            <p className="text-contrast mt-1 truncate text-xs">{image.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface InputFormProps {
  inputValue: string;
  selectedImages: Array<{
    url: string;
    name: string;
  }>;
  isSubmitting: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: (index: number) => void;
  onImageButtonClick: () => void;
}

export default function InputForm({
  inputValue,
  selectedImages,
  isSubmitting,
  fileInputRef,
  onInputChange,
  onSubmit,
  onImageSelect,
  onImageRemove,
  onImageButtonClick,
}: InputFormProps) {
  return (
    <div className="bg-background flex-shrink-0 p-2">
      <form
        onSubmit={onSubmit}
        className="border-border overflow-hidden rounded-lg border focus-within:ring-1 focus-within:ring-blue-500"
      >
        {/* 이미지 미리보기 */}
        <ImagePreview images={selectedImages} onRemove={onImageRemove} />

        <ChatInput
          placeholder="내용을 작성하세요."
          className="min-h-16 resize-none border-0 p-2 shadow-none focus-visible:ring-0"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
        />

        <div className="bg-foreground border-border flex items-center justify-between border-t p-3">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={onImageSelect}
              className="hidden"
            />
            <Button
              type="button"
              onClick={onImageButtonClick}
              className="hover:bg-accent text-contrast bg-button-background gap-1.5 shadow-xs"
              disabled={isSubmitting}
            >
              <ImageIcon className="size-4" />
              이미지 첨부 ({selectedImages.length}/{CHAT_CONSTANTS.MAX_IMAGES})
            </Button>
          </div>

          <Button
            type="submit"
            className="gap-1.5 bg-blue-600 text-white shadow-xs hover:bg-blue-700"
            disabled={!inputValue.trim() || isSubmitting}
          >
            <Send className="size-3.5" />
            {isSubmitting ? '전송 중' : '발송'}
          </Button>
        </div>
      </form>
    </div>
  );
}
