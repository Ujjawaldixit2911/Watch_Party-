import React from 'react';
import { cn } from '../../utils/cn';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
  };

  return (
    <div className={cn('flex items-center gap-2.5 group select-none', className)}>
      {/* Stylish WP Monogram Icon */}
      <div
        className={cn(
          'relative rounded-xl overflow-hidden p-[1.5px] bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 shadow-lg shadow-purple-600/30 group-hover:shadow-cyan-500/40 group-hover:scale-105 transition-all duration-300 flex items-center justify-center flex-shrink-0',
          iconSizes[size]
        )}
      >
        <div className="w-full h-full bg-[#0A0D1A] rounded-[10px] flex items-center justify-center font-extrabold tracking-tighter relative overflow-hidden">
          {/* Subtle inner background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-cyan-500/20 pointer-events-none" />
          
          <span className="font-heading font-black tracking-tighter bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">
            WP
          </span>
        </div>
      </div>

      {/* Brand Text */}
      {showText && (
        <span
          className={cn(
            'font-heading font-black tracking-tight text-white flex items-center',
            textSizes[size]
          )}
        >
          Watch
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 font-extrabold ml-0.5">
            Party
          </span>
        </span>
      )}
    </div>
  );
};
