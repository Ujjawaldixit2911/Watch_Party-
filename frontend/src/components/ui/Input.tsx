import React, { InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, icon, id, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-zinc-300 tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-zinc-400">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full bg-[#111113] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed',
              icon && 'pl-10',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-400 font-medium pl-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
