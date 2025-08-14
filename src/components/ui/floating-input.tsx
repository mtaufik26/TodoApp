'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, id, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          className={cn(
            "peer h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          id={id}
          {...props}
        />
      </div>
    );
  }
);
FloatingInput.displayName = "FloatingInput";

export { FloatingInput };