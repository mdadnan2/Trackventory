'use client';

import { motion } from 'framer-motion';
import { Plus, Package, TrendingUp, FileText, LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface ActionCard {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
}

interface QuickActionsProps {
  isAdmin: boolean;
}

export default function QuickActions({ isAdmin }: QuickActionsProps) {
  const adminActions: ActionCard[] = [
    {
      title: 'Add Stock',
      description: 'Add new items to central inventory',
      icon: Plus,
      href: '/dashboard/stock',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Manage Items',
      description: 'Create and update inventory items',
      icon: Package,
      href: '/dashboard/items',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Record Distribution',
      description: 'Log distribution to communities',
      icon: TrendingUp,
      href: '/dashboard/distribution',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'View Reports',
      description: 'Analytics and distribution reports',
      icon: FileText,
      href: '/dashboard/reports',
      color: 'from-orange-500 to-orange-600'
    },
  ];

  const volunteerActions: ActionCard[] = [
    {
      title: 'Record Distribution',
      description: 'Log distribution to communities',
      icon: TrendingUp,
      href: '/dashboard/distribution',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'View Reports',
      description: 'Analytics and distribution reports',
      icon: FileText,
      href: '/dashboard/reports',
      color: 'from-orange-500 to-orange-600'
    },
  ];

  const actions = isAdmin ? adminActions : volunteerActions;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Link key={action.title} href={action.href}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="bg-white rounded-2xl p-6 border border-slate-200 cursor-pointer group relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4`}>
                <Icon size={24} className="text-white" />
              </div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">{action.title}</h4>
              <p className="text-sm text-slate-500">{action.description}</p>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}
