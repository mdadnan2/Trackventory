'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { stockAPI, distributionAPI, campaignsAPI } from '@/services/api';
import ScreenContainer from '../ScreenContainer';
import ActionCard from '../ActionCard';
import { Package, TrendingUp, AlertTriangle, Megaphone, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MobileHome() {
  const { user } = useAuth();
  const router = useRouter();
  const [stock, setStock] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      if (user?._id) {
        const [stockRes, distRes, campaignRes] = await Promise.all([
          stockAPI.getVolunteerStock(user._id),
          distributionAPI.getAll({ page: 1, limit: 100 }),
          campaignsAPI.getAll(1, 100),
        ]);
        
        setStock(stockRes.data.data || []);
        
        const activeCampaigns = (campaignRes.data.data?.data || []).filter((c: any) => c.status === 'ACTIVE');
        setCampaigns(activeCampaigns);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const myDists = (distRes.data.data.distributions || []).filter(
          (d: any) => d.volunteerId?._id === user._id && new Date(d.createdAt) >= today
        );
        setTodayCount(myDists.length);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalStock = stock.reduce((sum, item) => sum + item.stock, 0);
  const lowStock = stock.filter((item) => item.stock < 10 && item.stock > 0).length;

  if (loading) {
    return (
      <ScreenContainer title="Home">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer 
      title="Dashboard" 
      subtitle={`Welcome back, ${user?.name}`}
      showMenu
      action={
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">
          {user?.name.charAt(0).toUpperCase()}
        </div>
      }
    >
      <div className="space-y-4">
        {campaigns.length > 0 && (
          <ActionCard>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Megaphone className="text-purple-600" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-purple-600 uppercase">Active Campaign</div>
                <div className="font-bold text-slate-900 truncate">{campaigns[0].name}</div>
              </div>
            </div>
          </ActionCard>
        )}

        <div className="grid grid-cols-2 gap-3">
          <ActionCard>
            <div className="text-center">
              <Package className="text-blue-600 mx-auto mb-2" size={32} />
              <div className="text-3xl font-bold text-slate-900">{totalStock}</div>
              <div className="text-xs text-slate-500 mt-1">Total Stock</div>
            </div>
          </ActionCard>
          
          <ActionCard>
            <div className="text-center">
              <TrendingUp className="text-green-600 mx-auto mb-2" size={32} />
              <div className="text-3xl font-bold text-slate-900">{todayCount}</div>
              <div className="text-xs text-slate-500 mt-1">Today</div>
            </div>
          </ActionCard>
        </div>

        {lowStock > 0 && (
          <ActionCard className="bg-orange-50 border-orange-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-orange-600" size={24} />
              <div className="flex-1">
                <div className="font-semibold text-orange-900">{lowStock} item{lowStock > 1 ? 's' : ''} low</div>
                <div className="text-sm text-orange-700">Check stock levels</div>
              </div>
            </div>
          </ActionCard>
        )}

        <div className="pt-2">
          <h2 className="text-sm font-semibold text-slate-900 mb-3 px-1">Quick Actions</h2>
          <div className="space-y-2">
            <ActionCard onClick={() => router.push('/dashboard/distribution')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <TrendingUp className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Record Distribution</div>
                    <div className="text-sm text-slate-500">Start distribution flow</div>
                  </div>
                </div>
                <ArrowRight className="text-slate-400" size={20} />
              </div>
            </ActionCard>

            <ActionCard onClick={() => router.push('/dashboard/stock')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Package className="text-green-600" size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">View Stock</div>
                    <div className="text-sm text-slate-500">Check inventory</div>
                  </div>
                </div>
                <ArrowRight className="text-slate-400" size={20} />
              </div>
            </ActionCard>
          </div>
        </div>

        <div className="pt-2">
          <h2 className="text-sm font-semibold text-slate-900 mb-3 px-1">My Stock</h2>
          <div className="space-y-2">
            {stock.length > 0 ? (
              stock.slice(0, 5).map((item) => (
                <ActionCard key={item.itemId}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{item.item?.name}</div>
                      <div className="text-sm text-slate-500">{item.item?.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">{item.stock}</div>
                      <div className="text-xs text-slate-500">{item.item?.unit}</div>
                    </div>
                  </div>
                </ActionCard>
              ))
            ) : (
              <ActionCard>
                <div className="text-center py-8 text-slate-500">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No stock assigned</p>
                </div>
              </ActionCard>
            )}
          </div>
        </div>
      </div>
    </ScreenContainer>
  );
}
