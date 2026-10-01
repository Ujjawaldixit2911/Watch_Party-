import React from 'react';
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
    host: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    moderator: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    participant: 'bg-zinc-800 text-zinc-300 border-zinc-700/60',
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
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide uppercase',
        variants[variant],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse-subtle', dotColors[variant])} />}
      {children}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: Role; className?: string }> = ({ role, className }) => {
  if (role === 'HOST') {
    return (
      <Badge variant="host" dot className={className}>
        Host
      </Badge>
    );
  }
  if (role === 'MODERATOR') {
    return (
      <Badge variant="moderator" className={className}>
        Mod
      </Badge>
    );
  }
  return (
    <Badge variant="participant" className={className}>
      Viewer
    </Badge>
  );
};
