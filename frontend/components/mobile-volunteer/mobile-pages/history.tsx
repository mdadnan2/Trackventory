'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { distributionAPI } from '@/services/api';
import ScreenContainer from '../ScreenContainer';
import ActionCard from '../ActionCard';
import { Clock, MapPin, Package, Calendar } from 'lucide-react';

export default function MobileHistory() {
  const { user } = useAuth();
  const [distributions, setDistributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const res = await distributionAPI.getAll({ page: 1, limit: 100 });
      const myDists = (res.data.data.distributions || []).filter(
        (d: any) => d.volunteerId?._id === user?._id
      );
      setDistributions(myDists);
    } catch (error) {
      console.error('Error loading distributions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const groupByDate = (dists: any[]) => {
    const groups: Record<string, any[]> = {};
    dists.forEach((dist) => {
      const date = new Date(dist.createdAt).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(dist);
    });
    return groups;
  };

  if (loading) {
    return (
      <ScreenContainer title="History">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      </ScreenContainer>
    );
  }

  const grouped = groupByDate(distributions);

  return (
    <ScreenContainer title="History" subtitle={`${distributions.length} distributions`}>
      <div className="space-y-4">
        {Object.keys(grouped).length > 0 ? (
          Object.entries(grouped).map(([date, dists]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3 px-1">
                <Calendar size={16} className="text-slate-400" />
                <div className="text-sm font-semibold text-slate-600">{formatDate(dists[0].createdAt)}</div>
              </div>
              <div className="space-y-2">
                {dists.map((dist) => (
                  <ActionCard key={dist._id}>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                            <Package className="text-green-600" size={20} />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">
                              {dist.items?.reduce((sum: number, i: any) => sum + i.quantity, 0)} items
                            </div>
                            <div className="text-sm text-slate-500 mt-1">
                              {dist.items?.map((i: any) => i.itemId?.name).join(', ')}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 whitespace-nowrap">
                          {formatTime(dist.createdAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin size={14} className="text-slate-400" />
                        <span>{dist.area}, {dist.cityId?.name}</span>
                      </div>
                      {dist.campaignId && (
                        <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-lg inline-block">
                          {dist.campaignId.name}
                        </div>
                      )}
                    </div>
                  </ActionCard>
                ))}
              </div>
            </div>
          ))
        ) : (
          <ActionCard>
            <div className="text-center py-12 text-slate-500">
              <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>No distributions yet</p>
            </div>
          </ActionCard>
        )}
      </div>
    </ScreenContainer>
  );
}
