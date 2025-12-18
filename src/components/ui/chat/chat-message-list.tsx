import * as React from 'react';
import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { cn } from '@/libs/utils';

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  smooth?: boolean;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  scrollTriggerRef?: React.MutableRefObject<(() => void) | null>;
}

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  ({
    className,
    children,
    smooth = false,
    onLoadMore,
    hasNextPage,
    isFetchingNextPage,
    scrollTriggerRef,
    ...props
  }) => {
    const { scrollRef, isAtBottom, scrollToBottom, disableAutoScroll } = useAutoScroll({
      smooth,
      content: children,
    });

    // scrollTriggerRef에 scrollToBottom 함수 연결
    React.useEffect(() => {
      if (scrollTriggerRef) {
        scrollTriggerRef.current = scrollToBottom;
      }
    }, [scrollToBottom, scrollTriggerRef]);

    const prevScrollHeight = React.useRef(0);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight } = e.currentTarget;

      if (scrollTop < 200 && hasNextPage && !isFetchingNextPage && onLoadMore) {
        prevScrollHeight.current = scrollHeight;
        onLoadMore();
      }
    };

    React.useEffect(() => {
      if (scrollRef.current && prevScrollHeight.current > 0) {
        const newScrollHeight = scrollRef.current.scrollHeight;
        const heightDiff = newScrollHeight - prevScrollHeight.current;

        if (heightDiff > 0) {
          scrollRef.current.scrollTop = scrollRef.current.scrollTop + heightDiff;
        }

        prevScrollHeight.current = 0;
      }
    }, [children, isFetchingNextPage]);
    return (
      <div className="bg-background relative h-full w-full flex-1 overflow-hidden">
        <div
          className={cn(
            'scrollbar-thin scrollbar-thumb-background dark:scrollbar-thumb-background scrollbar-track-background flex h-full w-full flex-col overflow-y-auto px-4 py-6',
            className,
          )}
          ref={scrollRef}
          onWheel={disableAutoScroll}
          onTouchMove={disableAutoScroll}
          onScroll={handleScroll}
          {...props}
        >
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          )}
          <div className="flex flex-col gap-2">{children}</div>
        </div>{' '}
        {!isAtBottom && (
          <Button
            onClick={() => scrollToBottom()}
            size="icon"
            variant="outline"
            className="bg-foreground text-contrast border-border/50 absolute bottom-4 left-1/2 h-10 w-10 -translate-x-1/2 transform rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="text-muted-foreground h-4 w-4" />
          </Button>
        )}
      </div>
    );
  },
);

ChatMessageList.displayName = 'ChatMessageList';

export { ChatMessageList };
