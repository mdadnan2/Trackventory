'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { reportsAPI } from '@/services/api';

type FilterType = 'week' | 'month' | '3months' | '6months' | 'year';

interface DashboardMetrics {
  inStock: {
    total: number;
    central: number;
    volunteers: number;
  };
  withVolunteers: {
    totalItems: number;
    volunteersCount: number;
  };
  distributed: number;
  damaged: number;
}

export default function DashboardFilterCards() {
  const [filter, setFilter] = useState<FilterType>('week');
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    inStock: { total: 0, central: 0, volunteers: 0 },
    withVolunteers: { totalItems: 0, volunteersCount: 0 },
    distributed: 0,
    damaged: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, [filter]);

  const getDateRange = (): { startDate?: string; endDate?: string } => {
    const now = new Date();
    const startDate = new Date();

    switch (filter) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case 'year':
        startDate.setMonth(0);
        startDate.setDate(1);
        break;
    }

    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString()
    };
  };

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const dateRange = getDateRange();
      const res = await reportsAPI.getDashboardMetrics(dateRange);
      setMetrics(res.data.data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Filter Dropdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-slate-300 p-4 flex items-center"
        >
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
            className="w-full px-4 py-2 border-0 focus:ring-0 text-slate-900 bg-transparent cursor-pointer"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="year">This Year</option>
          </select>
        </motion.div>

        {/* Card 2: In Stock */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-slate-300 p-4"
        >
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded"></div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">In Stock</h3>
              <p className="text-2xl font-bold text-slate-900">{metrics.inStock.total.toLocaleString()}</p>
            </div>
          )}
        </motion.div>

        {/* Card 3: With Volunteers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-slate-300 p-4"
        >
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded"></div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">With Volunteers</h3>
              <p className="text-2xl font-bold text-slate-900">{metrics.withVolunteers.totalItems.toLocaleString()}</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Row 2: Distributed and Damaged Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distributed Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-slate-300 p-6"
        >
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded"></div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-slate-900">Distributed</h3>
                <div className="bg-green-100 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">{metrics.distributed.toLocaleString()}</p>
              <p className="text-sm text-slate-500 mt-1">Total items distributed</p>
            </div>
          )}
        </motion.div>

        {/* Damaged Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-slate-300 p-6"
        >
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded"></div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-slate-900">Damaged</h3>
                <div className="bg-red-100 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">{metrics.damaged.toLocaleString()}</p>
              <p className="text-sm text-slate-500 mt-1">Items reported damaged</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
