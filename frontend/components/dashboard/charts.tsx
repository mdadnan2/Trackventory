'use client';

import { motion } from 'framer-motion';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

const COLORS = ['#0A4D68', '#088395', '#7DD3FC', '#D1D5DB', '#FBBF24'];

interface ChartsProps {
  itemData?: Array<{ name: string; distributed: number }>;
  trendData?: Array<{ name: string; value: number }>;
}

export default function Charts({ itemData, trendData }: ChartsProps) {
  const defaultItemData = [
    { name: 'A', distributed: 100 },
    { name: 'B', distributed: 80 },
    { name: 'C', distributed: 40 },
    { name: 'D', distributed: 65 },
    { name: 'E', distributed: 30 },
  ];

  const defaultTrendData = [
    { name: 'A', value: 100 },
    { name: 'B', value: 80 },
    { name: 'C', value: 65 },
    { name: 'D', value: 40 },
    { name: 'E', value: 30 },
  ];

  const barData = itemData && itemData.length > 0 ? itemData : defaultItemData;
  const donutData = trendData && trendData.length > 0 ? trendData : defaultTrendData;
  const BAR_COLORS = ['#0A4D68', '#088395', '#7DD3FC', '#D1D5DB', '#FBBF24'];

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
          <PieChart>
            <Pie
              data={donutData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              dataKey="value"
              label={({ name }) => name}
            >
              {donutData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
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
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }} 
            />
            <Bar dataKey="distributed" radius={[8, 8, 0, 0]}>
              {barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
