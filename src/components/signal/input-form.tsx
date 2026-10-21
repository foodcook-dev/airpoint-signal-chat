import { Send, ImageIcon, X, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInput } from '@/components/ui/chat/chat-input';
import { CHAT_CONSTANTS, SIGNAL_CHANNELS } from '@/constants/signal';
import type { SignalChannel } from '@/types/signal';
import { cn } from '@/libs/auth';
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
      <div className="flex flex-wrap gap-3">
        {images.map((image, index) => (
          <div key={index} className="relative w-20 flex-shrink-0">
            <img src={image.url} alt={image.name} className="h-20 w-20 rounded-lg object-cover" />
            <Button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 p-0 text-xs text-white hover:bg-red-600"
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
  channel: SignalChannel;
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
  channel,
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
  maxAutoReactions = 50,
  onAutoReactionToggle,
  onMaxAutoReactionsChange,
}: InputFormProps) {
  const channelConfig = SIGNAL_CHANNELS[channel];

  return (
    <div className="bg-background flex-shrink-0 p-2">
      <form
        onSubmit={onSubmit}
        className={cn(
          'overflow-hidden rounded-xl border transition-shadow focus-within:ring-2',
          channelConfig.inputRingClass,
        )}
      >
        {/* 발송 대상 채널 표시 (오발송 방지) */}
        <div
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold',
            channelConfig.badgeClass,
          )}
        >
          {channel === 'premium' && <Crown className="size-3.5" />}
          {channelConfig.label} 채널에 발송됩니다
          <span className="font-normal opacity-80">· {channelConfig.description}</span>
        </div>

        {/* 이미지 미리보기 */}
        <ImagePreview images={selectedImages} onRemove={onImageRemove} />

        <ChatInput
          placeholder={`${channelConfig.label} 채널에 보낼 내용을 작성하세요.`}
          className="min-h-16 resize-none border-0 p-2 shadow-none focus-visible:ring-0"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
        />

        <div className="border-border/60 flex items-center justify-between border-t px-3 py-2.5">
          <div className="flex items-center gap-1">
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
              variant="ghost"
              size="icon"
              onClick={onImageButtonClick}
              className="text-contrast/60 hover:bg-button-background h-8 w-8"
              disabled={isSubmitting}
              title="이미지 첨부"
            >
              <ImageIcon className="size-4" />
            </Button>
            {selectedImages.length > 0 && (
              <span className="text-contrast/50 text-xs">
                {selectedImages.length}/{CHAT_CONSTANTS.MAX_IMAGES}
              </span>
            )}

            <div className="border-border/60 ml-2 flex items-center gap-2 border-l pl-3">
              <Switch
                id="auto-reaction"
                checked={isAutoReactionEnabled}
                onCheckedChange={onAutoReactionToggle}
              />
              <Label
                htmlFor="auto-reaction"
                className="text-contrast/70 cursor-pointer text-xs font-normal whitespace-nowrap"
              >
                자동 리액션
              </Label>
              {isAutoReactionEnabled && (
                <div className="flex items-center gap-1">
                  <Input
                    id="max-reactions"
                    type="number"
                    min={1}
                    max={50}
                    value={maxAutoReactions}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value >= 1 && value <= 50) {
                        onMaxAutoReactionsChange?.(value);
                      } else if (value > 50) {
                        onMaxAutoReactionsChange?.(50);
                      } else if (value < 1) {
                        onMaxAutoReactionsChange?.(1);
                      }
                    }}
                    className="border-border/60 text-contrast h-6 w-12 border bg-transparent p-0 text-center text-xs shadow-none"
                  />
                  <span className="text-contrast/50 text-xs">개</span>
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className={cn('gap-1.5 text-white shadow-xs', channelConfig.sendButtonClass)}
            disabled={(!inputValue.trim() && selectedImages.length === 0) || isSubmitting}
          >
            <Send className="size-3.5" />
            {isSubmitting ? '전송 중' : `${channelConfig.shortLabel} 채널에 발송`}
          </Button>
        </div>
      </form>
    </div>
  );
}
