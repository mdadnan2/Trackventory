'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { stockAPI, reportsAPI, distributionAPI } from '@/services/api';
import { motion } from 'framer-motion';
import { Warehouse, Users, TrendingUp, AlertTriangle, Package, Clock, CheckCircle, MapPin, Calendar, AlertCircle } from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import Charts from '@/components/dashboard/charts';
import RecentActivity from '@/components/dashboard/recent-activity';
import DashboardSkeleton from '@/components/ui/loading-skeleton';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stockSummary, setStockSummary] = useState<any[]>([]);
  const [volunteerStock, setVolunteerStock] = useState<any>(null);
  const [distributions, setDistributions] = useState<any[]>([]);
  const [myDistributions, setMyDistributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      if (user?.role === 'ADMIN') {
        const [stockRes, distRes] = await Promise.all([
          reportsAPI.getStockSummary(),
          reportsAPI.getCampaignDistribution()
        ]);
        setStockSummary(stockRes.data.data.data || []);
        setDistributions(distRes.data.data.data || []);
      } else if (user?.role === 'VOLUNTEER') {
        const [stockRes, distRes] = await Promise.all([
          stockAPI.getVolunteerStock(user._id),
          distributionAPI.getAll({ page: 1, limit: 5 })
        ]);
        setVolunteerStock(stockRes.data.data);
        const myDists = distRes.data.data.distributions?.filter(
          (d: any) => d.volunteerId?._id === user._id
        ) || [];
        setMyDistributions(myDists);
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

  const calculateVolunteerStats = () => {
    if (!volunteerStock) return { totalItems: 0, totalStock: 0, distributedToday: 0, areasCovered: 0, distributedThisWeek: 0, damagedReported: 0 };
    
    const totalItems = volunteerStock.length;
    const totalStock = volunteerStock.reduce((sum: number, item: any) => sum + item.stock, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const distributedToday = myDistributions
      .filter((d: any) => new Date(d.createdAt) >= today)
      .reduce((sum: number, d: any) => {
        return sum + (d.items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0);
      }, 0);
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const distributedThisWeek = myDistributions
      .filter((d: any) => new Date(d.createdAt) >= weekAgo)
      .reduce((sum: number, d: any) => {
        return sum + (d.items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0);
      }, 0);
    
    const uniqueAreas = new Set(
      myDistributions.map((d: any) => `${d.cityId?.name}-${d.area}`)
    );
    const areasCovered = uniqueAreas.size;
    
    const damagedReported = 0;
    
    return { totalItems, totalStock, distributedToday, areasCovered, distributedThisWeek, damagedReported };
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'bg-red-100 text-red-700', label: 'Empty', icon: '🔴' };
    if (stock < 10) return { color: 'bg-orange-100 text-orange-700', label: 'Low', icon: '🟡' };
    return { color: 'bg-green-100 text-green-700', label: 'Good', icon: '🟢' };
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const stats = calculateStats();
  const volunteerStats = calculateVolunteerStats();

  const itemChartData = Array.isArray(stockSummary) ? stockSummary.slice(0, 5).map(item => ({
    name: item.item.name,
    distributed: item.totalDistributed
  })) : [];

  const distributionTrendData = Array.isArray(distributions) ? distributions.slice(0, 5).map((dist, idx) => ({
    name: dist.item?.name || `Item ${idx + 1}`,
    value: dist.totalQuantity
  })) : [];

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

          <Charts itemData={itemChartData} trendData={distributionTrendData} />
        </>
      )}

      {user?.role === 'VOLUNTEER' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Items"
              value={volunteerStats.totalItems}
              description="Items assigned to you"
              icon={Package}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              index={0}
            />
            <StatCard
              title="Total Stock"
              value={volunteerStats.totalStock}
              description="Total quantity available"
              icon={Warehouse}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              index={1}
            />
            <StatCard
              title="Distributed Today"
              value={volunteerStats.distributedToday}
              description="Items distributed today"
              icon={CheckCircle}
              color="bg-gradient-to-br from-green-500 to-green-600"
              index={2}
            />
            <StatCard
              title="Areas Covered"
              value={volunteerStats.areasCovered}
              description="Unique locations served"
              icon={MapPin}
              color="bg-gradient-to-br from-orange-500 to-orange-600"
              index={3}
            />
            <StatCard
              title="This Week"
              value={volunteerStats.distributedThisWeek}
              description="Items distributed this week"
              icon={Calendar}
              color="bg-gradient-to-br from-cyan-500 to-cyan-600"
              index={4}
            />
            <StatCard
              title="Damaged Reported"
              value={volunteerStats.damagedReported}
              description="Items reported as damaged"
              icon={AlertCircle}
              color="bg-gradient-to-br from-red-500 to-red-600"
              index={5}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">My Stock</h2>
                    <p className="text-sm text-slate-500 mt-1">Current inventory status</p>
                  </div>
                  <Package className="text-blue-600" size={24} />
                </div>
              </div>
              <div className="p-6">
                {volunteerStock && volunteerStock.length > 0 ? (
                  <div className="space-y-3">
                    {volunteerStock.map((item: any) => {
                      const status = getStockStatus(item.stock);
                      return (
                        <motion.div
                          key={item.itemId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{status.icon}</span>
                            <div>
                              <p className="font-semibold text-slate-900">{item.item?.name}</p>
                              <p className="text-sm text-slate-500">{item.item?.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-slate-900">{item.stock}</p>
                            <p className="text-xs text-slate-500">{item.item?.unit}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No stock assigned yet</p>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Recent Distributions</h2>
                    <p className="text-sm text-slate-500 mt-1">Your last 5 distributions</p>
                  </div>
                  <Clock className="text-green-600" size={24} />
                </div>
              </div>
              <div className="p-6">
                {myDistributions.length > 0 ? (
                  <div className="space-y-3">
                    {myDistributions.slice(0, 5).map((dist: any, index: number) => (
                      <motion.div
                        key={dist._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                        className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <TrendingUp size={16} className="text-green-600" />
                              <p className="font-semibold text-slate-900">
                                {dist.items?.map((i: any) => i.itemId?.name || 'Item').join(', ')} ({dist.items?.reduce((sum: number, i: any) => sum + i.quantity, 0)} items)
                              </p>
                            </div>
                            <p className="text-sm text-slate-600">
                              {dist.area}, {dist.cityId?.name || 'City'}
                            </p>
                          </div>
                          <span className="text-xs text-slate-500 whitespace-nowrap">
                            {getTimeAgo(dist.createdAt)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No distributions yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}

      {user?.role === 'ADMIN' && <RecentActivity />}
    </motion.div>
  );
}
