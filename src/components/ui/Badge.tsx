import { ReactNode } from 'react';

export type BadgeStatus = 'healthy' | 'at-risk' | 'critical' | 'active' | 'deployed' | 'review' | 'waitlist' | string;

interface BadgeProps {
  status?: BadgeStatus;
  variant?: string;
  className?: string;
  children?: ReactNode;
}

const statusColors: Record<string, string> = {
  // Health
  'healthy': 'bg-[#3F6A24]/10 border-[#3F6A24]/30 text-[#A8C69F]',
  'at-risk': 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500',
  'critical': 'bg-red-500/10 border-red-500/30 text-red-500',
  // Sprints
  'active': 'bg-[#3F6A24]/10 border-[#3F6A24]/30 text-[#A8C69F]',
  // Content / Tasks
  'waitlist': 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400',
  'production': 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  'review': 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  'deployed': 'bg-[#3F6A24]/10 border-[#3F6A24]/30 text-[#A8C69F]',
  // PostStage statuses
  'planned': 'bg-zinc-500/10 border-zinc-500/30 text-zinc-400',
  'brief written': 'bg-sky-500/10 border-sky-500/30 text-sky-400',
  'in production': 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  'ceo approval': 'bg-orange-500/10 border-orange-500/30 text-orange-400',
  'client approval': 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  'scheduled': 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  'published': 'bg-green-500/10 border-green-500/30 text-green-400',
};

export function Badge({ status = 'default', variant, className = '', children }: BadgeProps) {
  const normStatus = status.toLowerCase();
  const colorClass = statusColors[normStatus] || 'bg-card-alt border-border-dark text-text-secondary';

  return (
    <span className={`font-mono text-[11px] font-medium px-2 py-0.5 border ${colorClass} ${className}`}>
      {children || status}
    </span>
  );
}
