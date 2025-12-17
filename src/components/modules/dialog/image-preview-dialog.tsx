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
      <DialogContent className="max-w-[90vw] max-h-[90vh] w-auto h-auto p-2 overflow-hidden">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="확대된 이미지"
            className="w-auto h-auto max-w-[calc(90vw-4rem)] max-h-[calc(90vh-4rem)] object-contain"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
