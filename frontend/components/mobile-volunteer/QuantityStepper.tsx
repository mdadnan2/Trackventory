'use client';

import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
  label?: string;
}

export default function QuantityStepper({
  value,
  onChange,
  max = 999,
  min = 0,
  label,
}: QuantityStepperProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-30 disabled:active:scale-100"
          aria-label="Decrease quantity"
        >
          <Minus size={24} strokeWidth={2.5} />
        </button>
        <div className="flex-1 text-center">
          <div className="text-4xl font-bold text-slate-900">{value}</div>
          {max < 999 && <div className="text-xs text-slate-500 mt-1">of {max}</div>}
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center active:scale-95 transition-transform disabled:opacity-30 disabled:active:scale-100"
          aria-label="Increase quantity"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
