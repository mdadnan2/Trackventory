'use client';

import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/useIsMobile';
import MobileHome from '@/components/mobile-volunteer/mobile-pages/home';
import { useEffect, useState } from 'react';
import { stockAPI, reportsAPI, distributionAPI } from '@/services/api';
import { motion } from 'framer-motion';
import { Warehouse, Users, TrendingUp, AlertTriangle, Package, Clock, CheckCircle, MapPin, Calendar, AlertCircle } from 'lucide-react';
import StatCard from '@/components/ui/stat-card';
import Card from '@/components/ui/card';
import RecentActivity from '@/components/dashboard/recent-activity';
import DashboardSkeleton from '@/components/ui/loading-skeleton';
import DashboardFilterCards from '@/components/dashboard/dashboard-filter-cards';
import api from '@/services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [volunteerStock, setVolunteerStock] = useState<any>(null);
  const [myDistributions, setMyDistributions] = useState<any[]>([]);
  const [damagedCount, setDamagedCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      if (user?.role === 'ADMIN') {
        const metricsRes = await reportsAPI.getDashboardMetrics();
        setDashboardMetrics(metricsRes.data.data);
      } else if (user?.role === 'VOLUNTEER') {
        const [stockRes, distRes, damageRes] = await Promise.all([
          stockAPI.getVolunteerStock(user._id),
          distributionAPI.getAll({ volunteerId: user._id, page: 1, limit: 50 }),
          reportsAPI.getVolunteerDamageCount(user._id)
        ]);
        setVolunteerStock(stockRes.data.data);
        setMyDistributions(distRes.data.data?.data || []);
        setDamagedCount(damageRes.data.data?.damagedCount || 0);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (!dashboardMetrics) return { central: 0, volunteer: 0, distributed: 0, damaged: 0 };
    
    return {
      central: dashboardMetrics.inStock?.central || 0,
      volunteer: dashboardMetrics.inStock?.volunteers || 0,
      distributed: dashboardMetrics.distributed || 0,
      damaged: dashboardMetrics.damaged || 0,
    };
  };

  const calculateVolunteerStats = () => {
    const totalItems = volunteerStock?.length || 0;
    const totalStock = volunteerStock?.reduce((sum: number, item: any) => sum + item.stock, 0) || 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const distributedToday = myDistributions
      .filter((d: any) => new Date(d.createdAt) >= today)
      .reduce((sum: number, d: any) => sum + (d.items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0), 0);
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const distributedThisWeek = myDistributions
      .filter((d: any) => new Date(d.createdAt) >= weekAgo)
      .reduce((sum: number, d: any) => sum + (d.items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0), 0);
    
    const uniqueAreas = new Set(myDistributions.map((d: any) => `${d.cityId?.name}-${d.area}`));
    const areasCovered = uniqueAreas.size;
    
    return { totalItems, totalStock, distributedToday, areasCovered, distributedThisWeek, damagedReported: damagedCount };
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

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (isMobile && user?.role === 'VOLUNTEER') {
    return <MobileHome />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >

      {user?.role === 'ADMIN' && (
        <>
          <DashboardFilterCards />

          <div className="grid grid-cols-1 gap-6">
            <RecentActivity />
          </div>
        </>
      )}

      {user?.role === 'VOLUNTEER' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Total Items" value={volunteerStats.totalItems} icon={Package} variant="primary" />
            <StatCard title="Total Stock" value={volunteerStats.totalStock} icon={Warehouse} variant="success" />
            <StatCard title="Distributed Today" value={volunteerStats.distributedToday} icon={CheckCircle} variant="success" />
            <StatCard title="Areas Covered" value={volunteerStats.areasCovered} icon={MapPin} variant="warning" />
            <StatCard title="This Week" value={volunteerStats.distributedThisWeek} icon={Calendar} variant="primary" />
            <StatCard title="Damaged Reported" value={volunteerStats.damagedReported} icon={AlertCircle} variant="danger" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
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
            </Card>

            <Card>
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
            </Card>
          </div>
        </>
      )}
    </motion.div>
  );
}
