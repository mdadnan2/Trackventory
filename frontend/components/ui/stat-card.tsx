'use client';

import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

export default function StatCard({ title, value, icon: Icon, trend, variant = 'primary' }: StatCardProps) {
  const variants = {
    primary: 'bg-blue-50 text-blue-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-orange-50 text-orange-600',
    danger: 'bg-red-50 text-red-600',
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${variants[variant]}`}>
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
}
