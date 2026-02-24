'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  position?: 'left' | 'right' | 'bottom';
}

export default function Drawer({ isOpen, onClose, title, children, position = 'right' }: DrawerProps) {
  const positions = {
    left: { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } },
    right: { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } },
    bottom: { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } },
  };

  const containerClasses = {
    left: 'left-0 top-0 bottom-0 w-96',
    right: 'right-0 top-0 bottom-0 w-96',
    bottom: 'bottom-0 left-0 right-0 max-h-[90vh]',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            {...positions[position]}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`fixed ${containerClasses[position]} bg-white shadow-xl z-50 flex flex-col`}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
