'use client';

import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const distributionData = [
  { month: 'Jan', distributed: 1200 },
  { month: 'Feb', distributed: 1900 },
  { month: 'Mar', distributed: 1500 },
  { month: 'Apr', distributed: 2200 },
  { month: 'May', distributed: 2800 },
  { month: 'Jun', distributed: 2400 },
];

interface ChartsProps {
  itemData?: Array<{ name: string; distributed: number }>;
}

export default function Charts({ itemData }: ChartsProps) {
  const defaultItemData = [
    { name: 'Rice', distributed: 3200 },
    { name: 'Wheat', distributed: 2800 },
    { name: 'Oil', distributed: 1500 },
    { name: 'Sugar', distributed: 1200 },
    { name: 'Lentils', distributed: 900 },
  ];

  const barData = itemData || defaultItemData;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 border border-slate-200"
      >
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Distribution Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={distributionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="distributed" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 border border-slate-200"
      >
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Item Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }} 
            />
            <Bar dataKey="distributed" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
