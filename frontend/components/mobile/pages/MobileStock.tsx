'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { stockAPI } from '@/services/api';
import MobilePageContainer from '../MobilePageContainer';
import MobileCard from '../MobileCard';
import { Package, AlertCircle } from 'lucide-react';

export default function MobileStock() {
  const { user } = useAuth();
  const [volunteerStock, setVolunteerStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      if (user?._id) {
        const res = await stockAPI.getVolunteerStock(user._id);
        setVolunteerStock(res.data.data || []);
      }
    } catch (error) {
      console.error('Error loading stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'bg-red-100 text-red-700', label: 'Empty' };
    if (stock < 10) return { color: 'bg-orange-100 text-orange-700', label: 'Low' };
    return { color: 'bg-green-100 text-green-700', label: 'Good' };
  };

  if (loading) {
    return (
      <MobilePageContainer title="My Stock">
        <div className="text-center py-12 text-slate-500">Loading...</div>
      </MobilePageContainer>
    );
  }

  return (
    <MobilePageContainer title="My Stock" subtitle={`${volunteerStock.length} items`}>
      <div className="space-y-3">
        {volunteerStock.length > 0 ? (
          volunteerStock.map((item) => {
            const status = getStockStatus(item.stock);
            return (
              <MobileCard key={item.itemId}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Package className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{item.item?.name}</div>
                      <div className="text-xs text-slate-500">{item.item?.category}</div>
                      <div className={`text-xs font-medium mt-1 px-2 py-0.5 rounded-full inline-block ${status.color}`}>
                        {status.label}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-slate-900">{item.stock}</div>
                    <div className="text-xs text-slate-500">{item.item?.unit}</div>
                  </div>
                </div>
              </MobileCard>
            );
          })
        ) : (
          <MobileCard>
            <div className="text-center py-12 text-slate-500">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>No stock assigned yet</p>
            </div>
          </MobileCard>
        )}
      </div>
    </MobilePageContainer>
  );
}
