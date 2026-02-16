'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  Users, 
  MapPin, 
  TrendingUp, 
  FileText,
  PackageCheck,
  PackageSearch,
  Megaphone
} from 'lucide-react';
import { User } from '@/types';

interface SidebarProps {
  user: User | null;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'VOLUNTEER'] },
  { href: '/dashboard/items', label: 'Items', icon: Package, roles: ['ADMIN'] },
  { href: '/dashboard/inventory', label: 'Inventory', icon: PackageSearch, roles: ['ADMIN', 'VOLUNTEER'] },
  { href: '/dashboard/stock', label: 'Stock', icon: Warehouse, roles: ['ADMIN'] },
  { href: '/dashboard/users', label: 'Users', icon: Users, roles: ['ADMIN'] },
  { href: '/dashboard/cities', label: 'Cities', icon: MapPin, roles: ['ADMIN'] },
  { href: '/dashboard/campaigns', label: 'Campaigns', icon: Megaphone, roles: ['ADMIN'] },
  { href: '/dashboard/distribution', label: 'Distribution', icon: TrendingUp, roles: ['ADMIN', 'VOLUNTEER'] },
  { href: '/dashboard/reports', label: 'Reports', icon: FileText, roles: ['ADMIN', 'VOLUNTEER'] },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const filteredItems = navItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <PackageCheck className="text-blue-600" size={32} strokeWidth={2.5} />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Trackventory</h1>
            <p className="text-sm text-slate-500 mt-1">Distribution Manager</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="relative block">
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
    </aside>
  );
}
