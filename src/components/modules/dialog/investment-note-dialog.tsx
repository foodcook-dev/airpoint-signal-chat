import { useEffect, useState } from 'react';
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
import type { ChatMessage } from '@/types/signal';

interface InvestmentNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatMessage: ChatMessage | null;
  onConfirm: (title: string) => void;
}

export default function InvestmentNoteDialog({
  open,
  onOpenChange,
  chatMessage,
  onConfirm,
}: InvestmentNoteDialogProps) {
  const [title, setTitle] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const isTitleInvalid = submitAttempted && !title.trim();

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setSubmitAttempted(false);
  }, [open]);

  const handleReset = () => {
    setTitle('');
    setSubmitAttempted(false);
  };

  const handleCancel = () => {
    handleReset();
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setSubmitAttempted(true);
      return;
    }

    onConfirm(title.trim());
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>투자노트 게시</DialogTitle>
          <DialogDescription className="whitespace-pre-line">
            제목을 입력하면 이 시그널 내용으로 투자노트가 임시저장됩니다.
            {'\n'}내용과 이미지 수정은 관리 페이지에서 진행해주세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="investment-note-title" className="text-contrast font-extralight">
                제목 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="investment-note-title"
                placeholder="투자노트 제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`text-contrast font-extralight ${isTitleInvalid ? 'border-red-500' : ''}`}
              />
              {isTitleInvalid && <p className="text-xs text-red-500">제목을 입력해주세요.</p>}
            </div>

            {chatMessage && (
              <div className="grid gap-2">
                <Label className="text-contrast font-extralight">내용 (미리보기)</Label>
                <div className="border-border/60 text-contrast/80 max-h-56 overflow-y-auto rounded-md border px-3 py-2 text-sm whitespace-pre-wrap">
                  {chatMessage.message || '(내용 없음)'}
                </div>
              </div>
            )}

            {!!chatMessage?.content_images.length && (
              <div className="grid gap-2">
                <Label className="text-contrast font-extralight">첨부 이미지 (미리보기)</Label>
                <div className="flex flex-wrap gap-3">
                  {chatMessage.content_images.map((url) => (
                    <div
                      key={url}
                      className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg"
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
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
