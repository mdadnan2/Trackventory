'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { stockAPI, distributionAPI } from '@/services/api';
import MobilePageContainer from '../MobilePageContainer';
import MobileCard from '../MobileCard';
import { Package, TrendingUp, MapPin, AlertCircle } from 'lucide-react';

export default function MobileDashboard() {
  const { user } = useAuth();
  const [volunteerStock, setVolunteerStock] = useState<any[]>([]);
  const [distributions, setDistributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      if (user?.role === 'VOLUNTEER' && user._id) {
        const [stockRes, distRes] = await Promise.all([
          stockAPI.getVolunteerStock(user._id),
          distributionAPI.getAll({ page: 1, limit: 5 }),
        ]);
        setVolunteerStock(stockRes.data.data || []);
        const myDists = distRes.data.data.distributions?.filter(
          (d: any) => d.volunteerId?._id === user._id
        ) || [];
        setDistributions(myDists);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalStock = volunteerStock.reduce((sum, item) => sum + item.stock, 0);
  const distributedToday = distributions.filter((d) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(d.createdAt) >= today;
  }).length;

  if (loading) {
    return (
      <MobilePageContainer title="Dashboard">
        <div className="text-center py-12 text-slate-500">Loading...</div>
      </MobilePageContainer>
    );
  }

  return (
    <MobilePageContainer title="Dashboard" subtitle={`Welcome, ${user?.name}`}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <MobileCard>
            <div className="flex flex-col gap-2">
              <Package className="text-blue-600" size={24} />
              <div className="text-3xl font-bold text-slate-900">{totalStock}</div>
              <div className="text-xs text-slate-500">Total Stock</div>
            </div>
          </MobileCard>
          <MobileCard>
            <div className="flex flex-col gap-2">
              <TrendingUp className="text-green-600" size={24} />
              <div className="text-3xl font-bold text-slate-900">{distributedToday}</div>
              <div className="text-xs text-slate-500">Today</div>
            </div>
          </MobileCard>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">My Stock</h2>
          <div className="space-y-2">
            {volunteerStock.length > 0 ? (
              volunteerStock.map((item) => (
                <MobileCard key={item.itemId}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{item.item?.name}</div>
                      <div className="text-xs text-slate-500">{item.item?.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">{item.stock}</div>
                      <div className="text-xs text-slate-500">{item.item?.unit}</div>
                    </div>
                  </div>
                </MobileCard>
              ))
            ) : (
              <MobileCard>
                <div className="text-center py-8 text-slate-500">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No stock assigned</p>
                </div>
              </MobileCard>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Recent Activity</h2>
          <div className="space-y-2">
            {distributions.length > 0 ? (
              distributions.slice(0, 5).map((dist) => (
                <MobileCard key={dist._id}>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="text-green-600 mt-1" size={20} />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">
                        {dist.items?.reduce((sum: number, i: any) => sum + i.quantity, 0)} items distributed
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {dist.area}, {dist.cityId?.name}
                      </div>
                    </div>
                  </div>
                </MobileCard>
              ))
            ) : (
              <MobileCard>
                <div className="text-center py-8 text-slate-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No distributions yet</p>
                </div>
              </MobileCard>
            )}
          </div>
        </div>
      </div>
    </MobilePageContainer>
  );
}
