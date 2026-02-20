'use client';

import { ReactNode } from 'react';

interface MobileStickyCTAProps {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function MobileStickyCTA({
  children,
  onClick,
  disabled,
  loading,
}: MobileStickyCTAProps) {
  return (
    <div className="fixed bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className="w-full h-14 bg-blue-600 text-white font-semibold rounded-2xl active:scale-98 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : children}
      </button>
    </div>
  );
}
