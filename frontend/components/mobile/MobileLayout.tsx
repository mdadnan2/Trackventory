'use client';

import { ReactNode } from 'react';
import MobileBottomNav from './MobileBottomNav';

interface MobileLayoutProps {
  children: ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {children}
      <MobileBottomNav />
    </div>
  );
}
