'use client';

import { ReactNode } from 'react';

interface SectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export default function Section({ title, description, children, className = '' }: SectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div>
          {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
          {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
