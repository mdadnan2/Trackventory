'use client';

import { ReactNode } from 'react';

interface StickyActionBarProps {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'danger' | 'success';
}

export default function StickyActionBar({
  children,
  onClick,
  disabled,
  loading,
  variant = 'primary',
}: StickyActionBarProps) {
  const colors = {
    primary: 'bg-blue-600 active:bg-blue-700',
    danger: 'bg-red-600 active:bg-red-700',
    success: 'bg-green-600 active:bg-green-700',
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`w-full h-14 ${colors[variant]} text-white font-semibold rounded-2xl active:scale-98 transition-transform disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto text-lg shadow-lg`}
        aria-label={loading ? 'Processing' : 'Submit action'}
      >
        {loading ? 'Processing...' : children}
      </button>
    </div>
  );
}
