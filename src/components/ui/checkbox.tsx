import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/libs/utils';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-2">
        <div className="relative">
          <input type="checkbox" className="sr-only" ref={ref} {...props} />
          <div
            className={cn(
              'h-4 w-4 rounded border border-gray-300 bg-white flex items-center justify-center transition-colors',
              'hover:border-gray-400',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
              props.checked ? 'bg-blue-600 border-blue-600' : '',
              className,
            )}
            onClick={() => {
              if (props.onChange) {
                props.onChange({
                  target: { checked: !props.checked },
                } as React.ChangeEvent<HTMLInputElement>);
              }
            }}
          >
            {props.checked && <Check className="h-3 w-3 text-white" />}
          </div>
        </div>
        {label && (
          <label
            className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
            onClick={() => {
              if (props.onChange) {
                props.onChange({
                  target: { checked: !props.checked },
                } as React.ChangeEvent<HTMLInputElement>);
              }
            }}
          >
            {label}
          </label>
        )}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
