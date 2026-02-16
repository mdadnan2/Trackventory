'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path ? 'bg-blue-700' : '';

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold">
              Trackventory
            </Link>
            
            <div className="hidden md:flex gap-2">
              <Link href="/dashboard" className={`px-3 py-2 rounded ${isActive('/dashboard')}`}>
                Dashboard
              </Link>
              
              {user?.role === 'ADMIN' && (
                <>
                  <Link href="/dashboard/items" className={`px-3 py-2 rounded ${isActive('/dashboard/items')}`}>
                    Items
                  </Link>
                  <Link href="/dashboard/stock" className={`px-3 py-2 rounded ${isActive('/dashboard/stock')}`}>
                    Stock
                  </Link>
                  <Link href="/dashboard/users" className={`px-3 py-2 rounded ${isActive('/dashboard/users')}`}>
                    Users
                  </Link>
                  <Link href="/dashboard/cities" className={`px-3 py-2 rounded ${isActive('/dashboard/cities')}`}>
                    Cities
                  </Link>
                </>
              )}
              
              <Link href="/dashboard/distribution" className={`px-3 py-2 rounded ${isActive('/dashboard/distribution')}`}>
                Distribution
              </Link>
              <Link href="/dashboard/reports" className={`px-3 py-2 rounded ${isActive('/dashboard/reports')}`}>
                Reports
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm">{user?.name}</span>
            <span className="text-xs bg-blue-700 px-2 py-1 rounded">{user?.role}</span>
            <button onClick={signOut} className="btn btn-secondary text-sm">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
