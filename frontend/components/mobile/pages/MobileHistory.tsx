'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { distributionAPI } from '@/services/api';
import MobilePageContainer from '../MobilePageContainer';
import MobileCard from '../MobileCard';
import { Clock, MapPin, Package } from 'lucide-react';

export default function MobileHistory() {
  const { user } = useAuth();
  const [distributions, setDistributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const res = await distributionAPI.getAll({ page: 1, limit: 50 });
      const myDists = res.data.data.distributions?.filter(
        (d: any) => d.volunteerId?._id === user?._id
      ) || [];
      setDistributions(myDists);
    } catch (error) {
      console.error('Error loading distributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <MobilePageContainer title="History">
        <div className="text-center py-12 text-slate-500">Loading...</div>
      </MobilePageContainer>
    );
  }

  return (
    <MobilePageContainer title="History" subtitle={`${distributions.length} distributions`}>
      <div className="space-y-3">
        {distributions.length > 0 ? (
          distributions.map((dist) => (
            <MobileCard key={dist._id}>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                      <Package className="text-green-600" size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {dist.items?.reduce((sum: number, i: any) => sum + i.quantity, 0)} items
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {dist.items?.map((i: any) => i.itemId?.name).join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin size={14} className="text-slate-400" />
                  <span>{dist.area}, {dist.cityId?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock size={12} />
                  <span>{formatDate(dist.createdAt)} at {formatTime(dist.createdAt)}</span>
                </div>
              </div>
            </MobileCard>
          ))
        ) : (
          <MobileCard>
            <div className="text-center py-12 text-slate-500">
              <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>No distributions yet</p>
            </div>
          </MobileCard>
        )}
      </div>
    </MobilePageContainer>
  );
}
