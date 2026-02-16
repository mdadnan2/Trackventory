'use client';

import { motion } from 'framer-motion';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse"></div>
        <div className="h-4 w-64 bg-slate-200 rounded-lg animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-6 border border-slate-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-8 w-20 bg-slate-200 rounded animate-pulse"></div>
                <div className="h-3 w-32 bg-slate-200 rounded animate-pulse"></div>
              </div>
              <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse"></div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200">
            <div className="h-6 w-40 bg-slate-200 rounded animate-pulse mb-4"></div>
            <div className="h-64 bg-slate-100 rounded-xl animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
