'use client';

import { Minus, Plus } from 'lucide-react';

interface MobileQuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
}

export default function MobileQuantityInput({
  value,
  onChange,
  max = 999,
  min = 0,
}: MobileQuantityInputProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-30"
      >
        <Minus size={20} />
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.min(max, Math.max(min, parseInt(e.target.value) || 0)))}
        className="w-20 h-12 text-center text-2xl font-bold border-2 border-slate-200 rounded-xl"
      />
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center active:scale-95 transition-transform disabled:opacity-30"
      >
        <Plus size={20} />
      </button>
    </div>
  );
}
