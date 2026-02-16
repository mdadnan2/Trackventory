'use client';

import { useEffect, useState } from 'react';
import { stockAPI, usersAPI } from '@/services/api';
import { StockItem, User } from '@/types';
import { Package, Users, TrendingUp, AlertCircle } from 'lucide-react';
import PageHeader from '@/components/ui/page-header';
import ContentCard from '@/components/ui/content-card';

export default function InventoryPage() {
  const [centralStock, setCentralStock] = useState<StockItem[]>([]);
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState<string>('');
  const [volunteerStock, setVolunteerStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'central' | 'volunteer'>('central');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedVolunteer) {
      loadVolunteerStock(selectedVolunteer);
    }
  }, [selectedVolunteer]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stockRes, usersRes] = await Promise.all([
        stockAPI.getCentralStock(),
        usersAPI.getAll(1, 100)
      ]);
      setCentralStock(stockRes.data.data);
      setVolunteers(usersRes.data.data.users.filter((u: User) => u.role === 'VOLUNTEER'));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVolunteerStock = async (volunteerId: string) => {
    try {
      const res = await stockAPI.getVolunteerStock(volunteerId);
      setVolunteerStock(res.data.data);
    } catch (error) {
      console.error('Error loading volunteer stock:', error);
    }
  };

  const totalCentralStock = centralStock.reduce((sum, item) => sum + item.stock, 0);
  const totalVolunteerStock = volunteerStock.reduce((sum, item) => sum + item.stock, 0);
  const lowStockItems = centralStock.filter(item => item.stock < 10).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Overview"
        description="Monitor stock levels across central and volunteer locations"
        icon={Package}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ContentCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Items</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{centralStock.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
        </ContentCard>

        <ContentCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Central Stock</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{totalCentralStock}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </ContentCard>

        <ContentCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Low Stock Items</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{lowStockItems}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </ContentCard>
      </div>

      <ContentCard>
        <div className="border-b border-slate-200">
          <div className="flex gap-1 p-2">
            <button
              onClick={() => setActiveTab('central')}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'central'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Central Warehouse
            </button>
            <button
              onClick={() => setActiveTab('volunteer')}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'volunteer'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Volunteer Stock
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'central' && (
            <div>
              {loading ? (
                <div className="text-center py-12 text-slate-500">Loading...</div>
              ) : centralStock.length === 0 ? (
                <div className="text-center py-12 text-slate-500">No stock available</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Item Name</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Category</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Unit</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Quantity</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {centralStock.map((stockItem) => (
                        <tr key={stockItem.itemId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4 font-medium text-slate-900">{stockItem.item.name}</td>
                          <td className="py-4 px-4 text-slate-600">{stockItem.item.category}</td>
                          <td className="py-4 px-4 text-slate-600">{stockItem.item.unit}</td>
                          <td className="py-4 px-4 text-right font-semibold text-slate-900">{stockItem.stock}</td>
                          <td className="py-4 px-4 text-center">
                            {stockItem.stock === 0 ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                Out of Stock
                              </span>
                            ) : stockItem.stock < 10 ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                In Stock
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'volunteer' && (
            <div className="space-y-6">
              <div className="max-w-md">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Volunteer
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={selectedVolunteer}
                  onChange={(e) => setSelectedVolunteer(e.target.value)}
                >
                  <option value="">Choose a volunteer...</option>
                  {volunteers.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.name} ({v.email})
                    </option>
                  ))}
                </select>
              </div>

              {selectedVolunteer && (
                <div>
                  {volunteerStock.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      No stock assigned to this volunteer
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                          <Users className="text-blue-600" size={20} />
                          <span className="font-medium text-blue-900">
                            Total Stock: {totalVolunteerStock} items
                          </span>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Item Name</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Category</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Unit</th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Quantity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {volunteerStock.map((stockItem) => (
                              <tr key={stockItem.itemId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                <td className="py-4 px-4 font-medium text-slate-900">{stockItem.item.name}</td>
                                <td className="py-4 px-4 text-slate-600">{stockItem.item.category}</td>
                                <td className="py-4 px-4 text-slate-600">{stockItem.item.unit}</td>
                                <td className="py-4 px-4 text-right font-semibold text-slate-900">{stockItem.stock}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </ContentCard>
    </div>
  );
}
