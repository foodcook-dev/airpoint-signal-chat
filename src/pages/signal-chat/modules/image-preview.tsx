import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewProps {
  images: Array<{
    url: string;
    name: string;
  }>;
  onRemove: (index: number) => void;
}

export default function ImagePreview({ images, onRemove }: ImagePreviewProps) {
  if (images.length === 0) return null;

  return (
    <div className="p-3 border-b border-gray-200/50">
      <div className="flex gap-4 max-w-md">
        {images.map((image, index) => (
          <div key={index} className="relative">
            <img
              src={image.url}
              alt={image.name}
              className="w-full h-20 rounded-lg object-cover border border-gray-200"
            />
            <Button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs"
            >
              <X className="w-3 h-3" />
            </Button>
            <p className="text-xs text-gray-500 mt-1 truncate">{image.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
