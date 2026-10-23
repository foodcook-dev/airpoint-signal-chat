import { Send, ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import logoPng from '@/assets/images/app_logo.png';
import type { SelectedImage } from '@/types/signal';

interface CommentComposerProps {
  editingCommentId: number | null;
  onCancelEdit: () => void;
  commentImage: SelectedImage | null;
  onImageRemove: () => void;
  newComment: string;
  onChangeComment: (value: string) => void;
  commentFileInputRef: React.RefObject<HTMLInputElement | null>;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageButtonClick: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

// 관리자 댓글 작성 — 같은 입력창을 "신규 작성"과 "기존 댓글 수정"에 모두 재사용한다
export default function CommentComposer({
  editingCommentId,
  onCancelEdit,
  commentImage,
  onImageRemove,
  newComment,
  onChangeComment,
  commentFileInputRef,
  onImageSelect,
  onImageButtonClick,
  onSubmit,
  isSubmitting,
}: CommentComposerProps) {
  return (
    <div className="border-border bg-background flex-shrink-0 border-t p-3">
      {editingCommentId != null && (
        <div className="bg-primary/10 text-primary mb-2 flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium">
          <span>댓글 수정 중</span>
          <button type="button" onClick={onCancelEdit} className="hover:underline">
            취소
          </button>
        </div>
      )}
      <div className="border-border focus-within:border-primary/60 focus-within:ring-primary/20 flex flex-col gap-2 rounded-xl border p-1.5 pl-2.5 shadow-xs transition-colors focus-within:ring-2">
        {commentImage && (
          <div className="relative w-fit">
            <img
              src={commentImage.url}
              alt={commentImage.name}
              className="h-16 w-16 rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={onImageRemove}
              className="bg-background border-border/60 text-contrast/60 absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full border hover:text-red-500"
              title="이미지 제거"
            >
              <X className="size-2.5" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="border-border/60 flex h-6 w-6 flex-shrink-0 items-center justify-center self-center rounded-full border bg-white px-1">
            <img src={logoPng} alt="logo" className="max-w-full" />
          </div>
          <Textarea
            value={newComment}
            onChange={(e) => onChangeComment(e.target.value)}
            placeholder="댓글을 작성하세요"
            className="max-h-24 min-h-9 flex-1 resize-none border-0 bg-transparent py-1.5 text-xs shadow-none focus-visible:ring-0 md:text-xs"
          />
          <input
            ref={commentFileInputRef}
            type="file"
            accept="image/*"
            onChange={onImageSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-contrast/50 hover:bg-foreground/60 h-8 w-8 flex-shrink-0"
            onClick={onImageButtonClick}
            disabled={!!commentImage}
            title="이미지 첨부 (최대 1장)"
          >
            <ImageIcon className="size-4" />
          </Button>
          <Button
            size="icon"
            className="h-8 w-8 flex-shrink-0 rounded-lg"
            disabled={(!newComment.trim() && !commentImage) || isSubmitting}
            onClick={onSubmit}
            title={editingCommentId != null ? '댓글 수정' : '댓글 등록'}
          >
            <Send className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
