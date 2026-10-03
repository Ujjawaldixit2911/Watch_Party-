import React from 'react';
import { Crown, Shield, User } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Role } from '@watchparty/shared';

export interface BadgeProps {
  variant?: 'host' | 'moderator' | 'participant' | 'success' | 'warning' | 'danger' | 'default';
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className,
  dot = false,
}) => {
  const variants = {
    host: 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10',
    moderator: 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-500/10',
    participant: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    danger: 'bg-red-500/15 text-red-400 border-red-500/30',
    default: 'bg-zinc-800/80 text-zinc-300 border-zinc-700',
  };

  const dotColors = {
    host: 'bg-amber-400',
    moderator: 'bg-purple-400',
    participant: 'bg-zinc-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-red-400',
    default: 'bg-zinc-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide uppercase',
        variants[variant],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse-subtle', dotColors[variant])} />}
      {children}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: Role; className?: string; showIcon?: boolean }> = ({
  role,
  className,
  showIcon = true,
}) => {
  if (role === 'HOST') {
    return (
      <Badge variant="host" className={cn('gap-1 text-amber-300 font-bold', className)}>
        {showIcon && <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 inline-block" />}
        <span>Host</span>
      </Badge>
    );
  }
  if (role === 'MODERATOR') {
    return (
      <Badge variant="moderator" className={cn('gap-1 text-purple-300 font-bold', className)}>
        {showIcon && <Shield className="w-3.5 h-3.5 text-purple-400 fill-purple-400/20 inline-block" />}
        <span>Mod</span>
      </Badge>
    );
  }
  return (
    <Badge variant="participant" className={cn('gap-1 text-zinc-300 font-medium', className)}>
      {showIcon && <User className="w-3 h-3 text-zinc-400 inline-block" />}
      <span>Viewer</span>
    </Badge>
  );
};

