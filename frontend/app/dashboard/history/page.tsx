'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { distributionAPI } from '@/services/api';
import { History, Info, X } from 'lucide-react';

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, totalItems: 0, packages: 0, items: 0 });
  const [filter, setFilter] = useState<'all' | 'items' | 'packages'>('all');
  const [selectedItems, setSelectedItems] = useState<any>(null);

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
            }`}>
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('items')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'items' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
            Items Only ({stats.items})
          </button>
          <button
            onClick={() => setFilter('packages')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'packages' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
            📦 Packages ({stats.packages})
          </button>
        </div>
      </div>

      <div className="p-6">
        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Distribution History</h3>
            <p className="text-gray-600">Your distribution records will appear here</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date & Time</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Beneficiary</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Campaign</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Items</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredHistory.map((dist) => (
                    <tr key={dist._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(dist.createdAt).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(dist.createdAt).toLocaleTimeString('en-IN', { 
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {dist.isPackage ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            📦 Package
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            Item
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {dist.beneficiaryInfo?.name || dist.beneficiaryName || '-'}
                        </div>
                        {(dist.beneficiaryInfo?.phone || dist.beneficiaryPhone) && (
                          <div className="text-xs text-gray-500">{dist.beneficiaryInfo?.phone || dist.beneficiaryPhone}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {dist.isPackage ? (
                            <span>{dist.city && dist.area ? `${dist.city}, ${dist.area}` : dist.area || dist.city || '-'}</span>
                          ) : (
                            <span>{dist.city}, {dist.area}</span>
                          )}
                        </div>
                        {dist.pinCode && (
                          <div className="text-xs text-gray-500">{dist.pinCode}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {dist.campaignId ? (
                          <span className="inline-flex px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">
                            {dist.campaignId.name || 'Campaign'}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedItems({ dist, items: dist.items })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors group">
                          <Info className="w-4 h-4" />
                          <span className="text-sm font-medium">{dist.items.length}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {selectedItems && (
        <ItemDetailsModal
          distribution={selectedItems.dist}
          items={selectedItems.items}
          onClose={() => setSelectedItems(null)}
        />
      )}
    </div>
  );
}

function ItemDetailsModal({ distribution, items, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Items Distributed</h3>
            <p className="text-sm text-blue-100">
              {new Date(distribution.createdAt).toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric'
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {distribution.isPackage && distribution.packageName && (
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-purple-900">
                📦 Package: {distribution.packageName}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {items.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <div className="font-medium text-gray-900">{item.itemId?.name || 'Item'}</div>
                  {item.itemId?.category && (
                    <div className="text-xs text-gray-500 mt-0.5">{item.itemId.category}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{item.quantity}</div>
                  <div className="text-xs text-gray-500">{item.itemId?.unit || 'units'}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700">Total Items:</span>
              <span className="text-lg font-bold text-blue-600">
                {items.reduce((sum: number, item: any) => sum + item.quantity, 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 bg-gray-50 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
