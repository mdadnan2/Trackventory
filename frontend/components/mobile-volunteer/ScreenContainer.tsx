'use client';

import { ReactNode } from 'react';
import { ArrowLeft, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ScreenContainerProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showMenu?: boolean;
  action?: ReactNode;
  children: ReactNode;
}

export default function ScreenContainer({
  title,
  subtitle,
  showBack,
  showMenu,
  action,
  children,
}: ScreenContainerProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="sticky top-0 bg-white border-b border-slate-200 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          {showBack ? (
            <button 
              onClick={() => router.back()} 
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors flex-shrink-0" 
              aria-label="Go back"
            >
              <ArrowLeft size={20} strokeWidth={2} className="text-slate-700" />
            </button>
          ) : showMenu ? (
            <button 
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors flex-shrink-0" 
              aria-label="Menu"
            >
              <Menu size={20} strokeWidth={2} className="text-slate-700" />
            </button>
          ) : (
            <div className="w-10" />
          )}
          <div className="flex-1 text-center px-4">
            <h1 className="text-lg font-bold text-slate-900 truncate leading-none">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500 truncate mt-0.5">{subtitle}</p>}
          </div>
          {action ? (
            <div className="flex-shrink-0">{action}</div>
          ) : (
            <div className="w-10" />
          )}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
