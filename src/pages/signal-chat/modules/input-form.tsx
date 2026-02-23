import { Send, ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInput } from '@/components/ui/chat/chat-input';
import { CHAT_CONSTANTS } from '@/pages/signal-chat/constants';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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
  // 추가된 props
  isAutoReactionEnabled?: boolean;
  maxAutoReactions?: number;
  onAutoReactionToggle?: (enabled: boolean) => void;
  onMaxAutoReactionsChange?: (value: number) => void;
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
  isAutoReactionEnabled = false,
  maxAutoReactions = 5,
  onAutoReactionToggle,
  onMaxAutoReactionsChange,
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

          <div className="flex items-center gap-3">
            <div className="border-border/50 bg-muted/30 flex items-center gap-3 rounded-md border px-3 py-1.5">
              <div className="flex h-7 items-center gap-2">
                <Switch
                  id="auto-reaction"
                  checked={isAutoReactionEnabled}
                  onCheckedChange={onAutoReactionToggle}
                />
                <Label
                  htmlFor="auto-reaction"
                  className="cursor-pointer text-xs font-normal whitespace-nowrap"
                >
                  자동 리액션 활성화
                </Label>
              </div>

              <div className="border-border/50 flex items-center justify-center gap-2 border-l pl-3">
                <Input
                  id="max-reactions"
                  type="number"
                  min={1}
                  max={20}
                  value={maxAutoReactions}
                  disabled={!isAutoReactionEnabled}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 1 && value <= 20) {
                      onMaxAutoReactionsChange?.(value);
                    } else if (value > 20) {
                      onMaxAutoReactionsChange?.(20);
                    } else if (value < 1) {
                      onMaxAutoReactionsChange?.(1);
                    }
                  }}
                  className="border-border/50 bg-background h-7 w-14 text-center text-xs"
                />
                <span className="text-muted-foreground text-xs">개</span>
              </div>
            </div>

            <Button
              type="submit"
              className="gap-1.5 bg-blue-600 text-white shadow-xs hover:bg-blue-700"
              disabled={(!inputValue.trim() && selectedImages.length === 0) || isSubmitting}
            >
              <Send className="size-3.5" />
              {isSubmitting ? '전송 중' : '발송'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
