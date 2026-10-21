import { useEffect, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import useAlertStore from '@/stores/alert';
import { validateImageFile } from '@/utils';
import { CHAT_CONSTANTS } from '@/constants/signal';
import type { ChatMessage, InvestmentNote, SelectedImage } from '@/types/signal';

interface InvestmentNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatMessage: ChatMessage | null;
  onConfirm: (note: InvestmentNote) => void;
}

export default function InvestmentNoteDialog({
  open,
  onOpenChange,
  chatMessage,
  onConfirm,
}: InvestmentNoteDialogProps) {
  const { showAlert } = useAlertStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<SelectedImage[]>([]);

  // 모달을 열 때마다 해당 시그널의 내용/이미지로 초기화한다 — 이미지는 시그널에 첨부된 것을
  // 최대 개수까지 기본으로 가져온다 (첫 번째 이미지가 대표로 쓰인다)
  useEffect(() => {
    if (!open || !chatMessage) return;
    setTitle('');
    setContent(chatMessage.message);
    setImages(
      chatMessage.content_images
        .slice(0, CHAT_CONSTANTS.MAX_IMAGES)
        .map((url, index) => ({ url, name: `image-${index + 1}` })),
    );
  }, [open, chatMessage]);

  const handleAddImageClick = () => fileInputRef.current?.click();

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArray = Array.from(files);

    if (images.length + fileArray.length > CHAT_CONSTANTS.MAX_IMAGES) {
      showAlert(`이미지는 최대 ${CHAT_CONSTANTS.MAX_IMAGES}장까지 첨부할 수 있습니다.`);
      e.target.value = '';
      return;
    }

    fileArray.forEach((file) => {
      const validationError = validateImageFile(file);
      if (validationError) {
        showAlert(validationError);
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (result) setImages((prev) => [...prev, { url: result, name: file.name }]);
      };
      reader.onerror = () => showAlert(`${file.name} 파일 읽기에 실패했습니다.`);
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setTitle('');
    setContent('');
    setImages([]);
  };

  const handleCancel = () => {
    handleReset();
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onConfirm({
      title: title.trim(),
      content: content.trim(),
      images,
    });
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>투자노트 게시</DialogTitle>
          <DialogDescription>게시글의 제목과 내용을 입력하세요.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="investment-note-title" className="text-contrast">
                제목 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="investment-note-title"
                placeholder="투자노트 제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-contrast"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="investment-note-content" className="text-contrast">
                내용 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="investment-note-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="text-contrast max-h-56 min-h-32 resize-none overflow-y-auto"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-contrast">
                  이미지 (첫 번째 이미지가 게시글 썸네일로 사용됩니다)
                </Label>
                <span className="text-contrast/50 text-xs">
                  {images.length}/{CHAT_CONSTANTS.MAX_IMAGES}
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleAddImage}
                className="hidden"
              />
              <div className="flex flex-wrap gap-3">
                {images.map((image, index) => (
                  <div
                    key={`${image.url}-${index}`}
                    className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg"
                  >
                    <img src={image.url} alt={image.name} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="bg-background border-border/60 text-contrast/60 absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border hover:text-red-500"
                      title="이미지 제거"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                {images.length < CHAT_CONSTANTS.MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={handleAddImageClick}
                    className="border-border/60 text-contrast/40 hover:border-primary hover:text-primary flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg border-2 border-dashed transition-colors"
                    title="이미지 추가"
                  >
                    <Plus className="size-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="gray" onClick={handleCancel}>
              취소
            </Button>
            <Button type="submit" className="bg-amber-500 text-white hover:bg-amber-600">
              투자노트 게시
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
