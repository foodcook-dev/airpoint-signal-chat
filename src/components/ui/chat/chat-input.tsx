import * as React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/libs/utils';

interface ChatInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, ...props }, ref) => (
    <div className="bg-background p-4 backdrop-blur-sm">
      <Textarea
        autoComplete="off"
        ref={ref}
        name="message"
        className={cn(
          'bg-background text-contrast hover:border-border max-h-32 min-h-[44px] w-full resize-none rounded-xl px-4 py-3 text-sm shadow-sm transition-all duration-200 focus-visible:border-blue-500/50 focus-visible:ring-1 focus-visible:ring-blue-500/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    </div>
  ),
);
ChatInput.displayName = 'ChatInput';

export { ChatInput };
