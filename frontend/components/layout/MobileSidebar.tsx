'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import { User } from '@/types';

interface MobileSidebarProps {
  user: User | null;
}

export default function MobileSidebar({ user }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white rounded-xl shadow-lg border border-slate-200"
      >
        <Menu size={24} className="text-slate-900" />
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
              className="fixed left-0 top-0 h-screen z-50 lg:hidden"
            >
              <Sidebar user={user} />
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 bg-slate-100 rounded-xl"
              >
                <X size={20} className="text-slate-900" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
