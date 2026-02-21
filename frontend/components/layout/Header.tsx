'use client';

import { Search, LogOut, User as UserIcon } from 'lucide-react';
import { User as UserType } from '@/types';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  user: UserType | null;
  onSignOut: () => void;
  title?: string;
  description?: string;
}

export default function Header({ user, onSignOut, title, description }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const router = useRouter();

  const handleLogoutClick = () => {
    setShowMenu(false);
    setShowLogoutDialog(true);
  };

  const handleViewProfile = () => {
    setShowMenu(false);
    router.push('/dashboard/profile');
  };

  const handleConfirmLogout = () => {
    setShowLogoutDialog(false);
    onSignOut();
  };

  return (
    <>
      <header className="flex-shrink-0 h-16 bg-white border-b border-slate-200 z-10">
        <div className="h-full px-4 lg:pl-8 lg:pr-4 flex items-center justify-between">
          <div className="text-slate-700">
            {title ? (
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-slate-900">{title}</h1>
                {description && <p className="text-xs lg:text-sm text-slate-500">{description}</p>}
              </div>
            ) : (
              <span className="text-sm lg:text-base">Welcome back, <span className="font-semibold">{user?.name}</span></span>
            )}
          </div>
          <div className="flex items-center">
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center hover:bg-slate-50 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0)}
                </div>
              </button>

              <AnimatePresence>
                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-20"
                    >
                      <button
                        onClick={handleViewProfile}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <UserIcon size={16} />
                        View Profile
                      </button>
                      <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <ConfirmDialog
        isOpen={showLogoutDialog}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />
    </>
  );
}
