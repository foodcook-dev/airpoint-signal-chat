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
import useAlertStore from '@/store/alert';

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
  const { showAlert } = useAlertStore();
  const [reason, setReason] = useState('');
  const [blockedUntil, setBlockedUntil] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<number | 'permanent' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (blockedUntil) {
      const selectedDate = new Date(blockedUntil);
      const now = new Date();

      if (selectedDate <= now) {
        showAlert('제한 종료일시는 현재 시간 이후여야 합니다.');
        return;
      }
    }

    onConfirm({
      userId,
      reason: reason.trim(),
      blockedUntil,
      memo: memo.trim(),
    });

    setReason('');
    setBlockedUntil('');
    setMemo('');
    setSelectedPeriod(null);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setReason('');
    setBlockedUntil('');
    setMemo('');
    setSelectedPeriod(null);
    onOpenChange(false);
  };

  const setBlockPeriod = (days: number) => {
    const now = new Date();
    now.setDate(now.getDate() + days);
    const offset = now.getTimezoneOffset() * 60000;
    const localTime = new Date(now.getTime() - offset);
    const formattedDate = localTime.toISOString().slice(0, 16);
    setBlockedUntil(formattedDate);
    setSelectedPeriod(days);
  };

  const setPermanentBlock = () => {
    setBlockedUntil('');
    setSelectedPeriod('permanent');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>사용자 댓글 작성 제한</DialogTitle>
          <DialogDescription>{nickname}님의 댓글 작성을 제한합니다.</DialogDescription>
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
              <div className="flex items-center gap-2">
                <Label htmlFor="blockedUntil" className="text-contrast">
                  제한 종료일시
                </Label>
                <Label className="text-contrast/40 text-xs">
                  날짜를 지정하지 않으면 영구적으로 제한됩니다.
                </Label>
              </div>
              <Input
                id="blockedUntil"
                type="datetime-local"
                value={blockedUntil}
                onChange={(e) => {
                  setBlockedUntil(e.target.value);
                  setSelectedPeriod(null);
                }}
                className="text-contrast"
              />
              <div className="mb-2 grid grid-cols-5 gap-2">
                <Button
                  type="button"
                  variant={selectedPeriod === 1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBlockPeriod(1)}
                  className="flex-1"
                >
                  1일
                </Button>
                <Button
                  type="button"
                  variant={selectedPeriod === 3 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBlockPeriod(3)}
                  className="flex-1"
                >
                  3일
                </Button>
                <Button
                  type="button"
                  variant={selectedPeriod === 7 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBlockPeriod(7)}
                  className="flex-1"
                >
                  7일
                </Button>
                <Button
                  type="button"
                  variant={selectedPeriod === 30 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBlockPeriod(30)}
                  className="flex-1"
                >
                  30일
                </Button>
                <Button
                  type="button"
                  variant={selectedPeriod === 'permanent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPermanentBlock()}
                  className="flex-1"
                >
                  영구
                </Button>
              </div>
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
                className="text-contrast resize-none"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="gray" onClick={handleCancel}>
              취소
            </Button>
            <Button type="submit" className="bg-red-500 text-white hover:bg-red-600">
              제한하기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
