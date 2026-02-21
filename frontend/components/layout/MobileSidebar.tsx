'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  Users, 
  MapPin, 
  TrendingUp, 
  FileText,
  PackageCheck,
  Megaphone
} from 'lucide-react';
import { User } from '@/types';

interface MobileSidebarProps {
  user: User | null;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'VOLUNTEER'] },
  { href: '/dashboard/items', label: 'Items', icon: Package, roles: ['ADMIN'] },
  { href: '/dashboard/stock', label: 'Stock', icon: Warehouse, roles: ['ADMIN', 'VOLUNTEER'] },
  { href: '/dashboard/users', label: 'Users', icon: Users, roles: ['ADMIN'] },
  { href: '/dashboard/campaigns', label: 'Campaigns', icon: Megaphone, roles: ['ADMIN'] },
  { href: '/dashboard/distribution', label: 'Distribution', icon: TrendingUp, roles: ['ADMIN', 'VOLUNTEER'] },
  { href: '/dashboard/reports', label: 'Reports', icon: FileText, roles: ['ADMIN'] },
];

export default function MobileSidebar({ user }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const filteredItems = navItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 z-50 lg:hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <PackageCheck className="text-blue-600" size={46} strokeWidth={2.5} />
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">Trackventory</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Distribution Manager</p>
                  </div>
                </div>
              </div>

              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {filteredItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link 
                      key={item.href} 
                      href={item.href} 
                      onClick={() => setIsOpen(false)}
                      className="relative block"
                    >
                      <motion.div
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                          isActive 
                            ? 'text-blue-600 bg-blue-50' 
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </motion.div>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
