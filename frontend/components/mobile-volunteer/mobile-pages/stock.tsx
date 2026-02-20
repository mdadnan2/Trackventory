'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { stockAPI, distributionAPI } from '@/services/api';
import ScreenContainer from '../ScreenContainer';
import ActionCard from '../ActionCard';
import QuantityStepper from '../QuantityStepper';
import StickyActionBar from '../StickyActionBar';
import { Package, AlertTriangle, XCircle, RotateCcw } from 'lucide-react';

export default function MobileStock() {
  const { user } = useAuth();
  const { addToQueue } = useOfflineQueue();
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMode, setActionMode] = useState<{ type: 'DAMAGE' | 'LOSS' | 'RETURN'; itemId: string } | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      if (user?._id) {
        const res = await stockAPI.getVolunteerStock(user._id);
        setStock(res.data.data || []);
      }
    } catch (error) {
      console.error('Error loading stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!actionMode) return;
    setSubmitting(true);
    try {
      const payload = {
        items: [{ itemId: actionMode.itemId, quantity }],
      };

      if (actionMode.type === 'DAMAGE') {
        await distributionAPI.reportDamage(payload);
      }
      // For LOSS and RETURN, use damage endpoint (backend maps to correct transaction type)
      
      // Optimistic update
      setStock((prev) =>
        prev.map((item) =>
          item.itemId === actionMode.itemId
            ? { ...item, stock: item.stock - quantity }
            : item
        )
      );

      setActionMode(null);
      setQuantity(0);
    } catch (error) {
      console.error('Error:', error);
      addToQueue(actionMode.type, { items: [{ itemId: actionMode.itemId, quantity }] });
      setActionMode(null);
      setQuantity(0);
    } finally {
      setSubmitting(false);
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'bg-red-100 text-red-700 border-red-200', label: 'Empty' };
    if (stock < 10) return { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Low' };
    return { color: 'bg-green-100 text-green-700 border-green-200', label: 'Good' };
  };

  if (loading) {
    return (
      <ScreenContainer title="My Stock">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      </ScreenContainer>
    );
  }

  if (actionMode) {
    const item = stock.find((s) => s.itemId === actionMode.itemId);
    const actionConfig = {
      DAMAGE: { title: 'Report Damage', icon: AlertTriangle, color: 'text-orange-600', variant: 'danger' as const },
      LOSS: { title: 'Report Loss', icon: XCircle, color: 'text-red-600', variant: 'danger' as const },
      RETURN: { title: 'Return Items', icon: RotateCcw, color: 'text-blue-600', variant: 'primary' as const },
    };
    const config = actionConfig[actionMode.type];

    return (
      <ScreenContainer title={config.title} showBack>
        <div className="space-y-4 pb-24">
          <ActionCard>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <Package className="text-slate-600" size={24} />
              </div>
              <div>
                <div className="font-semibold text-slate-900">{item?.item?.name}</div>
                <div className="text-sm text-slate-500">Available: {item?.stock}</div>
              </div>
            </div>
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              max={item?.stock || 0}
              label="Quantity"
            />
          </ActionCard>
        </div>
        <StickyActionBar
          onClick={handleAction}
          disabled={quantity === 0 || submitting}
          loading={submitting}
          variant={config.variant}
        >
          Confirm {config.title}
        </StickyActionBar>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer title="My Stock" subtitle={`${stock.length} items`}>
      <div className="space-y-3">
        {stock.length > 0 ? (
          stock.map((item) => {
            const status = getStockStatus(item.stock);
            return (
              <ActionCard key={item.itemId}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Package className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{item.item?.name}</div>
                        <div className="text-xs text-slate-500">{item.item?.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-slate-900">{item.stock}</div>
                      <div className="text-xs text-slate-500">{item.item?.unit}</div>
                    </div>
                  </div>
                  
                  <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${status.color}`}>
                    {status.label}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <button
                      onClick={() => setActionMode({ type: 'DAMAGE', itemId: item.itemId })}
                      className="h-12 bg-orange-50 text-orange-700 rounded-xl text-sm font-medium active:scale-95 transition-transform flex items-center justify-center gap-1"
                    >
                      <AlertTriangle size={16} />
                      Damage
                    </button>
                    <button
                      onClick={() => setActionMode({ type: 'LOSS', itemId: item.itemId })}
                      className="h-12 bg-red-50 text-red-700 rounded-xl text-sm font-medium active:scale-95 transition-transform flex items-center justify-center gap-1"
                    >
                      <XCircle size={16} />
                      Loss
                    </button>
                    <button
                      onClick={() => setActionMode({ type: 'RETURN', itemId: item.itemId })}
                      className="h-12 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium active:scale-95 transition-transform flex items-center justify-center gap-1"
                    >
                      <RotateCcw size={16} />
                      Return
                    </button>
                  </div>
                </div>
              </ActionCard>
            );
          })
        ) : (
          <ActionCard>
            <div className="text-center py-12 text-slate-500">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>No stock assigned yet</p>
            </div>
          </ActionCard>
        )}
      </div>
    </ScreenContainer>
  );
}
