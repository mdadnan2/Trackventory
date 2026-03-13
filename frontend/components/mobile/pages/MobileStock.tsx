'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { stockAPI } from '@/services/api';
import MobilePageContainer from '../MobilePageContainer';
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
    if (stock === 0) return { badge: 'bg-red-500', label: 'Empty', icon: '🔴' };
    if (stock < 10) return { badge: 'bg-orange-500', label: 'Low', icon: '🟡' };
    return { badge: 'bg-green-500', label: 'Good', icon: '🟢' };
  };

  const totalStock = volunteerStock.reduce((sum, item) => sum + item.stock, 0);
  const lowStockCount = volunteerStock.filter(item => item.stock < 10 && item.stock > 0).length;

  if (loading) {
    return (
      <MobilePageContainer title="My Stock">
        <div className="text-center py-12 text-slate-500">Loading...</div>
      </MobilePageContainer>
    );
  }

  return (
    <MobilePageContainer title="My Stock">
      <div className="space-y-6">
        {/* Stock Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="text-xs text-slate-500 font-medium mb-2">Items</div>
            <div className="text-2xl font-bold text-slate-900">{volunteerStock.length}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="text-xs text-slate-500 font-medium mb-2">Total</div>
            <div className="text-2xl font-bold text-slate-900">{totalStock}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="text-xs text-slate-500 font-medium mb-2">Low Stock</div>
            <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
          </div>
        </div>

        {/* Stock List */}
        {volunteerStock.length > 0 ? (
          <div className="space-y-3">
            {volunteerStock.map((item) => {
              const status = getStockStatus(item.stock);
              return (
                <div key={item.itemId} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center flex-shrink-0">
                      <Package className="text-blue-600" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 text-sm truncate">{item.item?.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{item.item?.category}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <div className="text-xs text-slate-500 font-medium mb-1">Stock</div>
                      <div className="text-2xl font-bold text-slate-900">{item.stock}</div>
                      <div className="text-xs text-slate-500 mt-1">{item.item?.unit}</div>
                    </div>
                    <div className={`rounded-xl p-3 flex flex-col justify-center ${status.badge === 'bg-red-500' ? 'bg-red-50' : status.badge === 'bg-orange-500' ? 'bg-orange-50' : 'bg-green-50'}`}>
                      <div className="text-xs font-medium mb-1">{status.icon}</div>
                      <div className={`text-sm font-semibold ${
                        status.badge === 'bg-red-500' ? 'text-red-700' :
                        status.badge === 'bg-orange-500' ? 'text-orange-700' :
                        'text-green-700'
                      }`}>
                        {status.label}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600 font-medium">No stock assigned yet</p>
            <p className="text-xs text-slate-500 mt-2">Request stock to get started</p>
          </div>
        )}
      </div>
    </MobilePageContainer>
  );
}
