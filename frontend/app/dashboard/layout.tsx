'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/useIsMobile';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import MobileSidebar from '@/components/layout/MobileSidebar';
import MobileVolunteerLayout from '@/components/mobile-volunteer/MobileLayout';

const pageInfo: Record<string, { title: string; description: string }> = {
  '/dashboard/items': { title: 'Items', description: 'Manage inventory items and categories' },
  '/dashboard/stock': { title: 'Stock Management', description: 'Add stock to central inventory or assign to volunteers' },
  '/dashboard/users': { title: 'Users', description: 'Manage user accounts and permissions' },
  '/dashboard/campaigns': { title: 'Campaigns', description: 'Manage distribution campaigns and relief efforts' },
  '/dashboard/distribution': { title: 'Distribution', description: 'Record distributions and report damages' },
  '/dashboard/reports': { title: 'Reports', description: 'Analytics and distribution reports' },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [forceMobile, setForceMobile] = useState(false);

  const currentPageInfo = pathname === '/dashboard/stock' && user?.role === 'VOLUNTEER'
    ? { title: 'My Stock', description: 'View and manage your assigned inventory' }
    : pageInfo[pathname];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xl text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // ADMIN: Always desktop
  if (user.role === 'ADMIN') {
    return (
      <div className="h-screen overflow-hidden flex bg-slate-50">
        {/* Sidebar: fixed height, no independent scroll unless menu is long */}
        <div className="hidden lg:block h-screen shrink-0">
          <Sidebar user={user} />
        </div>
        <MobileSidebar user={user} />
        {/* Main area: flex column, header fixed, content scrollable */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          <Header user={user} onSignOut={signOut} title={currentPageInfo?.title} description={currentPageInfo?.description} />
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // VOLUNTEER: Mobile on small screens OR if forced
  if (user.role === 'VOLUNTEER' && (isMobile || forceMobile)) {
    return <MobileVolunteerLayout>{children}</MobileVolunteerLayout>;
  }

  // VOLUNTEER: Desktop with toggle option
  return (
    <div className="h-screen overflow-hidden flex bg-slate-50">
      <div className="hidden lg:block h-screen shrink-0">
        <Sidebar user={user} />
      </div>
      <MobileSidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Header user={user} onSignOut={signOut} title={currentPageInfo?.title} description={currentPageInfo?.description} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
