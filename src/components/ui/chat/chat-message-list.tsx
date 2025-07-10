import * as React from 'react';
import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAutoScroll } from '@/components/ui/chat/hooks/useAutoScroll';
import { cn } from '@/libs/utils';

interface ChatMessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  smooth?: boolean;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  scrollTriggerRef?: React.MutableRefObject<(() => void) | null>;
}

const ChatMessageList = React.forwardRef<HTMLDivElement, ChatMessageListProps>(
  (
    {
      className,
      children,
      smooth = false,
      onLoadMore,
      hasNextPage,
      isFetchingNextPage,
      scrollTriggerRef,
      ...props
    },
    _ref,
  ) => {
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
      <div className="relative w-full h-full bg-background">
        <div
          className={cn(
            'flex flex-col w-full h-full px-4 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-background dark:scrollbar-thumb-background scrollbar-track-background',
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
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}
          <div className="flex flex-col gap-2">{children}</div>
        </div>{' '}
        {!isAtBottom && (
          <Button
            onClick={() => scrollToBottom()}
            size="icon"
            variant="outline"
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 h-10 w-10 rounded-full shadow-lg bg-background/90 backdrop-blur-sm border-border/50 hover:bg-background hover:scale-105 transition-all duration-200"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>
    );
  },
);

ChatMessageList.displayName = 'ChatMessageList';

export { ChatMessageList };
