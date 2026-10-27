import { useEffect, useState, type ReactNode } from 'react';
import { CheckCheck, MessageSquare } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { formatCommentTime } from '@/utils';
import type { UnreadComment } from '@/types/signal';

interface NewCommentsPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comments: UnreadComment[];
  unreadCount: number;
  isLoading?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  onMarkAllRead: () => void;
  isMarkingAllRead?: boolean;
  onCommentClick?: (comment: UnreadComment) => void;
  isOpeningThread?: boolean;
  children: ReactNode;
}

export default function NewCommentsPopover({
  open,
  onOpenChange,
  comments,
  unreadCount,
  isLoading = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  onMarkAllRead,
  isMarkingAllRead = false,
  onCommentClick,
  isOpeningThread = false,
  children,
}: NewCommentsPopoverProps) {
  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(null);
  const [loadMoreTrigger, setLoadMoreTrigger] = useState<HTMLDivElement | null>(null);

  // 팝오버를 아래로 스크롤하면 다음 페이지를 불러온다
  useEffect(() => {
    if (!open || !scrollContainer || !loadMoreTrigger) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore?.();
        }
      },
      { root: scrollContainer, rootMargin: '100px', threshold: 0 },
    );

    observer.observe(loadMoreTrigger);

    return () => {
      observer.unobserve(loadMoreTrigger);
    };
  }, [open, hasNextPage, isFetchingNextPage, onLoadMore, scrollContainer, loadMoreTrigger]);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="flex max-h-[70vh] w-[420px] flex-col overflow-hidden p-0"
      >
        <div className="border-border/60 flex items-center justify-end border-b px-3 py-2">
          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0 || isMarkingAllRead}
            className="text-contrast/60 hover:text-primary disabled:text-contrast/30 flex items-center gap-1 text-xs font-medium transition-colors disabled:cursor-not-allowed"
          >
            {isMarkingAllRead ? (
              <Spinner size="sm" />
            ) : (
              <CheckCheck className="size-3.5" />
            )}
            모두 확인
          </button>
        </div>
        <div ref={setScrollContainer} className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16">
              <Spinner size="md" />
            </div>
          ) : comments.length > 0 ? (
            <>
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  role="button"
                  tabIndex={0}
                  aria-disabled={isOpeningThread}
                  onClick={() => !isOpeningThread && onCommentClick?.(comment)}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !isOpeningThread) {
                      e.preventDefault();
                      onCommentClick?.(comment);
                    }
                  }}
                  className="border-border/60 hover:bg-foreground/40 flex cursor-pointer items-start gap-3 border-b px-4 py-3 last:border-b-0 aria-disabled:pointer-events-none aria-disabled:opacity-60"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-primary inline-block size-1.5 flex-shrink-0 rounded-full" />
                      <p className="text-contrast/90 truncate text-xs font-semibold">
                        {comment.nickname}
                      </p>
                      <p className="text-contrast/50 flex-shrink-0 text-[10px] whitespace-nowrap">
                        {formatCommentTime(comment.created_at)}
                      </p>
                    </div>
                    <p className="text-contrast/80 mt-1 line-clamp-2 text-xs leading-relaxed break-words">
                      {comment.tag_nickname && (
                        <span className="text-primary font-medium">@{comment.tag_nickname} </span>
                      )}
                      {comment.message}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={setLoadMoreTrigger} className="h-4" />
              {isFetchingNextPage && (
                <div className="flex items-center justify-center py-3">
                  <Spinner size="sm" />
                </div>
              )}
            </>
          ) : (
            <div className="text-contrast/40 flex flex-col items-center justify-center gap-2 py-16">
              <MessageSquare className="size-7" strokeWidth={1.5} />
              <p className="text-xs">새로 달린 댓글이 없습니다.</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
