import { useState } from 'react';
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

interface UserBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  nickname: string;
  onConfirm: (data: { userId: number; reason: string; blockedUntil: string; memo: string }) => void;
}

export default function UserBlockDialog({
  open,
  onOpenChange,
  userId,
  nickname,
  onConfirm,
}: UserBlockDialogProps) {
  const [reason, setReason] = useState('');
  const [blockedUntil, setBlockedUntil] = useState('');
  const [memo, setMemo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onConfirm({
      userId,
      reason: reason.trim(),
      blockedUntil,
      memo: memo.trim(),
    });

    setReason('');
    setBlockedUntil('');
    setMemo('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setReason('');
    setBlockedUntil('');
    setMemo('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>사용자 댓글 작성 제한</DialogTitle>
          <DialogDescription>
            <span className="font-medium">{nickname}</span> 님의 댓글 작성을 제한합니다.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason" className="text-contrast">
                제한 사유 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="reason"
                placeholder="제한 사유를 입력하세요"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="text-contrast"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="blockedUntil" className="text-contrast">
                차단 날짜 (언제까지)
              </Label>
              <Input
                id="blockedUntil"
                type="datetime-local"
                value={blockedUntil}
                onChange={(e) => setBlockedUntil(e.target.value)}
                className="text-contrast"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="memo" className="text-contrast">
                메모
              </Label>
              <Textarea
                id="memo"
                placeholder="추가 메모를 입력하세요 (선택사항)"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="resize-none text-contrast"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="gray" onClick={handleCancel}>
              취소
            </Button>
            <Button type="submit" className="bg-red-500 hover:bg-red-600 text-white">
              제한하기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
