'use client';

import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/useIsMobile';
import MobileStock from '@/components/mobile-volunteer/mobile-pages/stock';
import { useEffect, useState } from 'react';
import { stockAPI, itemsAPI, usersAPI } from '@/services/api';
import { Item, User, StockItem } from '@/types';
import { Warehouse, Package, TrendingUp, AlertCircle, Plus, Minus, Undo2 } from 'lucide-react';
import PageHeader from '@/components/ui/page-header';
import ContentCard from '@/components/ui/content-card';
import FormSection from '@/components/ui/form-section';
import FormField from '@/components/ui/form-field';
import Button from '@/components/ui/button';
import { ToastContainer } from '@/components/ui/toast';
import { motion } from 'framer-motion';

export default function StockPage() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [items, setItems] = useState<Item[]>([]);
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [myStock, setMyStock] = useState<StockItem[]>([]);
  const [activeTab, setActiveTab] = useState<'add' | 'assign'>('add');
  const [stockItems, setStockItems] = useState<Array<{ itemId: string; quantity: number }>>([{ itemId: '', quantity: 0 }]);
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnItems, setReturnItems] = useState<Array<{ itemId: string; quantity: number }>>([{ itemId: '', quantity: 0 }]);
  const [returnNotes, setReturnNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (user?.role === 'ADMIN') {
        const [itemsRes, usersRes] = await Promise.all([
          itemsAPI.getAll(1, 100),
          usersAPI.getAll(1, 100)
        ]);
        setItems(itemsRes.data.data.data || itemsRes.data.data.items || []);
        setVolunteers(usersRes.data.data.data?.filter((u: User) => u.role === 'VOLUNTEER') || usersRes.data.data.users?.filter((u: User) => u.role === 'VOLUNTEER') || []);
      } else if (user?.role === 'VOLUNTEER') {
        const stockRes = await stockAPI.getVolunteerStock(user._id);
        setMyStock(stockRes.data.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addStockItem = () => {
    setStockItems([...stockItems, { itemId: '', quantity: 0 }]);
  };

  const removeStockItem = (index: number) => {
    setStockItems(stockItems.filter((_, i) => i !== index));
  };

  const updateStockItem = (index: number, field: 'itemId' | 'quantity', value: any) => {
    const updated = [...stockItems];
    updated[index][field] = value;
    setStockItems(updated);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'bg-red-100 text-red-700 border-red-200', label: 'Empty', icon: '🔴', badge: 'bg-red-500' };
    if (stock < 10) return { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Low Stock', icon: '🟡', badge: 'bg-orange-500' };
    return { color: 'bg-green-100 text-green-700 border-green-200', label: 'Good Stock', icon: '🟢', badge: 'bg-green-500' };
  };

  const totalStock = myStock.reduce((sum, item) => sum + item.stock, 0);
  const lowStockCount = myStock.filter(item => item.stock < 10 && item.stock > 0).length;

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await stockAPI.addStock({ items: stockItems });
      setToast({ message: 'Stock added successfully!', type: 'success' });
      setStockItems([{ itemId: '', quantity: 0 }]);
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || 'Error adding stock', type: 'error' });
    }
  };

  const handleAssignStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await stockAPI.assignStock({ volunteerId: selectedVolunteer, items: stockItems });
      setToast({ message: 'Stock assigned successfully!', type: 'success' });
      setStockItems([{ itemId: '', quantity: 0 }]);
      setSelectedVolunteer('');
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || 'Error assigning stock', type: 'error' });
    }
  };

  const handleReturnStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await stockAPI.returnStock({ volunteerId: user?._id, items: returnItems, notes: returnNotes });
      setToast({ message: 'Stock returned successfully!', type: 'success' });
      setShowReturnModal(false);
      setReturnItems([{ itemId: '', quantity: 0 }]);
      setReturnNotes('');
      loadData();
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || 'Error returning stock', type: 'error' });
    }
  };

  if (user?.role === 'VOLUNTEER') {
    if (isMobile) {
      return <MobileStock />;
    }

    return (
      <>
        <ToastContainer toast={toast} onClose={() => setToast(null)} />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ContentCard>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Total Items</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">{myStock.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Package className="text-blue-600" size={24} />
                    </div>
                  </div>
                </div>
              </ContentCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ContentCard>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Total Quantity</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">{totalStock}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="text-green-600" size={24} />
                    </div>
                  </div>
                </div>
              </ContentCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ContentCard>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Low Stock Items</p>
                      <p className="text-3xl font-bold text-slate-900 mt-2">{lowStockCount}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <AlertCircle className="text-orange-600" size={24} />
                    </div>
                  </div>
                </div>
              </ContentCard>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ContentCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Stock Details</h2>
                    <p className="text-sm text-slate-500 mt-1">Your current inventory status</p>
                  </div>
                  <Warehouse className="text-blue-600" size={24} />
                </div>

                {myStock.length === 0 ? (
                  <div className="text-center py-16">
                    <Package className="w-20 h-20 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium text-slate-600">No stock assigned yet</p>
                    <p className="text-sm text-slate-500 mt-2">Contact admin to get items assigned</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myStock.map((stock, index) => {
                      const status = getStockStatus(stock.stock);
                      return (
                        <motion.div
                          key={stock.itemId}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.05 }}
                          className={`relative p-5 rounded-xl border-2 ${status.color} hover:shadow-lg transition-all`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">{status.icon}</span>
                                <h3 className="text-lg font-bold text-slate-900">{stock.item.name}</h3>
                              </div>
                              <p className="text-sm text-slate-600 mb-3">{stock.item.category}</p>
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                  {status.label}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-4xl font-bold text-slate-900">{stock.stock}</div>
                              <div className="text-sm text-slate-600 mt-1">{stock.item.unit}</div>
                            </div>
                          </div>
                          <div className={`absolute bottom-0 left-0 right-0 h-1 ${status.badge} rounded-b-xl`}></div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </ContentCard>
          </motion.div>
        </motion.div>

        {showReturnModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Undo2 className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Return Stock</h2>
                      <p className="text-sm text-slate-500">Return items to central warehouse</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowReturnModal(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <form onSubmit={handleReturnStock} className="p-6 space-y-6">
                {returnItems.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <FormField label="Item" required fullWidth>
                      <select
                        className="input"
                        value={item.itemId}
                        onChange={(e) => {
                          const updated = [...returnItems];
                          updated[index].itemId = e.target.value;
                          setReturnItems(updated);
                        }}
                        required
                      >
                        <option value="">Select Item</option>
                        {myStock.map((s) => (
                          <option key={s.itemId} value={s.itemId}>
                            {s.item.name} (Available: {s.stock} {s.item.unit})
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Quantity" required>
                      <input
                        type="number"
                        className="input"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...returnItems];
                          updated[index].quantity = parseInt(e.target.value);
                          setReturnItems(updated);
                        }}
                        min="1"
                        required
                      />
                    </FormField>
                    {returnItems.length > 1 && (
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="danger"
                          icon={Minus}
                          onClick={() => setReturnItems(returnItems.filter((_, i) => i !== index))}
                        />
                      </div>
                    )}
                  </div>
                ))}

                <Button
                  type="button"
                  variant="secondary"
                  icon={Plus}
                  onClick={() => setReturnItems([...returnItems, { itemId: '', quantity: 0 }])}
                  fullWidth
                >
                  Add Another Item
                </Button>

                <FormField label="Notes (Optional)" fullWidth>
                  <textarea
                    className="input"
                    rows={3}
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    placeholder="Reason for return..."
                  />
                </FormField>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowReturnModal(false)}
                    fullWidth
                  >
                    Cancel
                  </Button>
                  <Button type="submit" fullWidth>
                    Return Stock
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <ToastContainer toast={toast} onClose={() => setToast(null)} />
      <div className="space-y-6">
      <ContentCard>
        <div className="border-b border-slate-200">
          <div className="flex gap-1 p-2">
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'add'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Add to Central
            </button>
            <button
              onClick={() => setActiveTab('assign')}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'assign'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Assign to Volunteer
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'add' && (
            <form onSubmit={handleAddStock} className="space-y-6">
              <FormSection
                title="Add Stock to Central Inventory"
                description="Add new items to the central warehouse"
              >
                {stockItems.map((item, index) => (
                  <div key={index} className="md:col-span-2 flex gap-4">
                    <FormField label="Item" required fullWidth>
                      <select
                        className="input"
                        value={item.itemId}
                        onChange={(e) => updateStockItem(index, 'itemId', e.target.value)}
                        required
                      >
                        <option value="">Select Item</option>
                        {items?.map((i) => (
                          <option key={i._id} value={i._id}>{i.name} ({i.unit})</option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Quantity" required>
                      <input
                        type="number"
                        className="input"
                        value={item.quantity}
                        onChange={(e) => updateStockItem(index, 'quantity', parseInt(e.target.value))}
                        min="1"
                        required
                      />
                    </FormField>
                    {stockItems.length > 1 && (
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="danger"
                          icon={Minus}
                          onClick={() => removeStockItem(index)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </FormSection>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="secondary" icon={Plus} onClick={addStockItem}>
                  Add Another Item
                </Button>
                <Button type="submit">Add Stock</Button>
              </div>
            </form>
          )}

          {activeTab === 'assign' && (
            <form onSubmit={handleAssignStock} className="space-y-6">
              <FormSection
                title="Assign Stock to Volunteer"
                description="Transfer items from central to field volunteer"
              >
                <FormField label="Select Volunteer" required fullWidth>
                  <select
                    className="input"
                    value={selectedVolunteer}
                    onChange={(e) => setSelectedVolunteer(e.target.value)}
                    required
                  >
                    <option value="">Select Volunteer</option>
                    {volunteers?.map((v) => (
                      <option key={v._id} value={v._id}>{v.name} ({v.email})</option>
                    ))}
                  </select>
                </FormField>

                {stockItems.map((item, index) => (
                  <div key={index} className="md:col-span-2 flex gap-4">
                    <FormField label="Item" required fullWidth>
                      <select
                        className="input"
                        value={item.itemId}
                        onChange={(e) => updateStockItem(index, 'itemId', e.target.value)}
                        required
                      >
                        <option value="">Select Item</option>
                        {items?.map((i) => (
                          <option key={i._id} value={i._id}>{i.name} ({i.unit})</option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Quantity" required>
                      <input
                        type="number"
                        className="input"
                        value={item.quantity}
                        onChange={(e) => updateStockItem(index, 'quantity', parseInt(e.target.value))}
                        min="1"
                        required
                      />
                    </FormField>
                    {stockItems.length > 1 && (
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="danger"
                          icon={Minus}
                          onClick={() => removeStockItem(index)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </FormSection>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="secondary" icon={Plus} onClick={addStockItem}>
                  Add Another Item
                </Button>
                <Button type="submit">Assign Stock</Button>
              </div>
            </form>
          )}
        </div>
      </ContentCard>
    </div>
    </>
  );
}
