'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { distributionAPI } from '@/services/api';
import { History, MapPin, Package, Calendar } from 'lucide-react';

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, totalItems: 0, packages: 0, items: 0 });
  const [filter, setFilter] = useState<'all' | 'items' | 'packages'>('all');

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await distributionAPI.getAll({ volunteerId: user?._id });
      const data = res.data.data.data || [];
      setHistory(data);
      
      const totalItems = data.reduce((sum: number, dist: any) => 
        sum + dist.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0), 0
      );
      const packages = data.filter((d: any) => d.isPackage).length;
      const items = data.filter((d: any) => !d.isPackage).length;
      setStats({ total: data.length, totalItems, packages, items });
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = filter === 'all' ? history : 
    filter === 'packages' ? history.filter(d => d.isPackage) : 
    history.filter(d => !d.isPackage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Distribution History</h1>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-gray-600">Distributions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalItems}</div>
              <div className="text-xs text-gray-600">Items Distributed</div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('items')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'items' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Items Only ({stats.items})
          </button>
          <button
            onClick={() => setFilter('packages')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'packages' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📦 Packages ({stats.packages})
          </button>
        </div>
      </div>

      <div className="p-6">
        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Distribution History</h3>
            <p className="text-gray-600">Your distribution records will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((dist) => (
              <div key={dist._id} className="bg-white rounded-lg border hover:shadow-md transition-shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(dist.createdAt).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {dist.isPackage ? (
                        <span>{dist.city && dist.area ? `${dist.city}, ${dist.area}` : dist.area || dist.city || 'Package Distribution'}</span>
                      ) : (
                        <span>{dist.city}, {dist.area} - {dist.pinCode}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {dist.isPackage && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                        📦 {dist.packageName}
                      </span>
                    )}
                    {dist.campaignId && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                        {dist.campaignId.name || 'Campaign'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Items Distributed</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dist.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{item.itemId?.name || 'Item'}</span>
                        <span className="text-sm font-bold text-gray-900">{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
