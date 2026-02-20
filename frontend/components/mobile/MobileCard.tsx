'use client';

import { ReactNode } from 'react';

interface MobileCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function MobileCard({ children, className = '', onClick }: MobileCardProps) {
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
