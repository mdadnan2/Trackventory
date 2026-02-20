'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/useIsMobile';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import MobileSidebar from '@/components/layout/MobileSidebar';
import MobileVolunteerLayout from '@/components/mobile-volunteer/MobileLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [forceMobile, setForceMobile] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
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
      <div className="min-h-screen bg-slate-50">
        <div className="hidden lg:block">
          <Sidebar user={user} />
        </div>
        <MobileSidebar user={user} />
        <div className="lg:ml-64">
          <Header user={user} onSignOut={signOut} />
          <main className="mt-16 p-4 lg:p-8">
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
    <div className="min-h-screen bg-slate-50">
      <div className="hidden lg:block">
        <Sidebar user={user} />
      </div>
      <MobileSidebar user={user} />
      <div className="lg:ml-64">
        <Header user={user} onSignOut={signOut} />
        <main className="mt-16 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
