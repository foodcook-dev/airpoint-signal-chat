import { Send, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInput } from '@/components/ui/chat/chat-input';
import ImagePreview from './image-preview';
import { CHAT_CONSTANTS } from '../constants';

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
    <div className="flex-shrink-0 p-4 bg-foreground">
      <form
        onSubmit={onSubmit}
        className="rounded-lg border border-border focus-within:ring-1 focus-within:ring-blue-500 p-1"
      >
        <ImagePreview images={selectedImages} onRemove={onImageRemove} />

        <ChatInput
          placeholder="내용을 작성하세요."
          className="min-h-16 resize-none border-0 p-2 shadow-none focus-visible:ring-0"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
        />

        <div className="flex items-center border-t border-border justify-between p-3">
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
              className="gap-1.5 hover:bg-accent text-contrast bg-button-background shadow-xs"
              disabled={isSubmitting}
            >
              <ImageIcon className="size-4" />
              이미지 첨부 ({selectedImages.length}/{CHAT_CONSTANTS.MAX_IMAGES})
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              disabled={!inputValue.trim() || isSubmitting}
            >
              <Send className="size-3.5" />
              {isSubmitting ? '전송 중...' : '발송'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
