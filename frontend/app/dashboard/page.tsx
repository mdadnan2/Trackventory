'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { stockAPI, reportsAPI } from '@/services/api';
import { motion } from 'framer-motion';
import { Warehouse, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import Charts from '@/components/dashboard/charts';
import QuickActions from '@/components/dashboard/quick-actions';
import RecentActivity from '@/components/dashboard/recent-activity';
import DashboardSkeleton from '@/components/ui/loading-skeleton';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stockSummary, setStockSummary] = useState<any[]>([]);
  const [volunteerStock, setVolunteerStock] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      if (user?.role === 'ADMIN') {
        const response = await reportsAPI.getStockSummary();
        setStockSummary(response.data.data);
      } else if (user?.role === 'VOLUNTEER') {
        const response = await stockAPI.getVolunteerStock(user._id);
        setVolunteerStock(response.data.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (!stockSummary.length) return { central: 0, volunteer: 0, distributed: 0, damaged: 0 };
    
    return stockSummary.reduce((acc, item) => ({
      central: acc.central + item.centralStock,
      volunteer: acc.volunteer + item.volunteerStock,
      distributed: acc.distributed + item.totalDistributed,
      damaged: acc.damaged + item.totalDamaged,
    }), { central: 0, volunteer: 0, distributed: 0, damaged: 0 });
  };

  const stats = calculateStats();

  const itemChartData = stockSummary.slice(0, 5).map(item => ({
    name: item.item.name,
    distributed: item.totalDistributed
  }));

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, {user?.name}</p>
      </div>

      {user?.role === 'ADMIN' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Central Stock"
              value={stats.central}
              description="Items in central warehouse"
              icon={Warehouse}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              index={0}
            />
            <StatCard
              title="With Volunteers"
              value={stats.volunteer}
              description="Items assigned to field"
              icon={Users}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              index={1}
            />
            <StatCard
              title="Distributed"
              value={stats.distributed}
              description="Total items distributed"
              icon={TrendingUp}
              color="bg-gradient-to-br from-green-500 to-green-600"
              index={2}
            />
            <StatCard
              title="Damaged"
              value={stats.damaged}
              description="Items reported damaged"
              icon={AlertTriangle}
              color="bg-gradient-to-br from-red-500 to-red-600"
              index={3}
            />
          </div>

          <Charts itemData={itemChartData} />
        </>
      )}

      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <QuickActions isAdmin={user?.role === 'ADMIN'} />
      </div>

      {user?.role === 'ADMIN' && <RecentActivity />}

      {user?.role === 'VOLUNTEER' && volunteerStock && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">My Stock</h2>
            <p className="text-sm text-slate-500 mt-1">Items currently assigned to you</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Available Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {volunteerStock.map((item: any) => (
                  <tr key={item.itemId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.item?.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.item?.unit}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{item.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
