'use client';

import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MobilePageContainerProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  action?: ReactNode;
  children: ReactNode;
}

export default function MobilePageContainer({
  title,
  subtitle,
  showBack,
  action,
  children,
}: MobilePageContainerProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 bg-white border-b border-slate-200 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 flex-1">
            {showBack && (
              <button onClick={() => router.back()} className="p-2 -ml-2">
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="flex-1">
              <h1 className="text-lg font-bold text-slate-900">{title}</h1>
              {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
