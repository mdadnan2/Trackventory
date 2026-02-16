'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ContentCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function ContentCard({ children, className = '', delay = 0 }: ContentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}
