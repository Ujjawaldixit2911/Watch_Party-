import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';

    const variants = {
      primary:
        'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/35 border border-indigo-500/40',
      secondary:
        'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/60 shadow-sm',
      destructive:
        'bg-red-600/90 hover:bg-red-600 text-white shadow-lg shadow-red-600/20 border border-red-500/40',
      outline:
        'bg-transparent border border-zinc-700 hover:bg-zinc-800/80 text-zinc-200 hover:text-white',
      ghost: 'bg-transparent hover:bg-zinc-800/60 text-zinc-300 hover:text-white',
      glass:
        'glass-panel hover:bg-zinc-800/70 text-zinc-100 shadow-md backdrop-blur-md hover:border-zinc-500/50',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-4 py-2 gap-2 h-10',
      lg: 'text-base px-6 py-3 gap-2.5 h-12 font-semibold',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
