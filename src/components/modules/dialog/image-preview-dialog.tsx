import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ImagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
}

export default function ImagePreviewDialog({
  open,
  onOpenChange,
  imageUrl,
}: ImagePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-auto max-h-[90vh] w-auto max-w-[90vw] overflow-hidden p-2">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="확대된 이미지"
            className="h-auto max-h-[calc(90vh-4rem)] w-auto max-w-[calc(90vw-4rem)] object-contain"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
