'use client';

import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, TrendingUp, Package, Clock, MoreHorizontal, Wifi, WifiOff } from 'lucide-react';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';

interface MobileLayoutProps {
  children: ReactNode;
}

export default function MobileVolunteerLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { queue } = useOfflineQueue();

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/dashboard/distribution', icon: TrendingUp, label: 'Distribute' },
    { href: '/dashboard/stock', icon: Package, label: 'Stock' },
    { href: '/dashboard/inventory', icon: Clock, label: 'History' },
    { href: '/dashboard/profile', icon: MoreHorizontal, label: 'More' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {queue.length > 0 && (
        <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white px-4 py-2 text-sm font-medium flex items-center gap-2 z-50">
          <WifiOff size={16} />
          {queue.length} action{queue.length > 1 ? 's' : ''} pending sync
        </div>
      )}
      
      <div className={queue.length > 0 ? 'pt-10' : ''}>
        {children}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 safe-area-pb">
        <div className="flex items-center justify-around h-16">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <button
                key={href}
                onClick={() => router.push(href)}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                  isActive ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
