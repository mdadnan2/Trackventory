'use client';

import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
}

export default function Table<T>({ columns, data, keyExtractor, onRowClick }: TableProps<T>) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={`${onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''} transition-colors`}
              >
                {columns.map((col) => {
                  const value = (item as any)[col.key];
                  const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
                  return (
                    <td key={col.key} className="px-6 py-4 text-sm text-slate-900">
                      {col.render ? col.render(item) : displayValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
