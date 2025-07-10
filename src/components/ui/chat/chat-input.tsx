import * as React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/libs/utils';

interface ChatInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, ...props }, ref) => (
    <div className="bg-foreground backdrop-blur-sm p-4">
      <Textarea
        autoComplete="off"
        ref={ref}
        name="message"
        className={cn(
          'min-h-[44px] max-h-32 px-4 py-3 bg-foreground text-contrast text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-xl resize-none shadow-sm transition-all duration-200 hover:border-border',
          className,
        )}
        {...props}
      />
    </div>
  ),
);
ChatInput.displayName = 'ChatInput';

export { ChatInput };
