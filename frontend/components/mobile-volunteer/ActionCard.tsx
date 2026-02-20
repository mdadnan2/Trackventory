'use client';

import { ReactNode } from 'react';

interface ActionCardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function ActionCard({ children, onClick, className = '' }: ActionCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 border border-slate-200 ${
        onClick ? 'active:scale-98 transition-transform' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
