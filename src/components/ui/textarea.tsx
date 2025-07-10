import * as React from 'react';

import { cn } from '@/libs/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-input placeholder:text-placeholder aria-invalid:ring-destructive/20 aria-invalid:border-destructive bg-background flex field-sizing-content min-h-16 w-full rounded-md border px-3 py-2 text-base shadow-xs outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-contrast',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
