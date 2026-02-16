'use client';

import { useEffect, useState } from 'react';
import { stockAPI, itemsAPI, usersAPI } from '@/services/api';
import { Item, User } from '@/types';
import { Warehouse, Plus, Minus } from 'lucide-react';
import PageHeader from '@/components/ui/page-header';
import ContentCard from '@/components/ui/content-card';
import FormSection from '@/components/ui/form-section';
import FormField from '@/components/ui/form-field';
import Button from '@/components/ui/button';
import { ToastContainer } from '@/components/ui/toast';

export default function StockPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'add' | 'assign'>('add');
  const [stockItems, setStockItems] = useState<Array<{ itemId: string; quantity: number }>>([{ itemId: '', quantity: 0 }]);
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [itemsRes, usersRes] = await Promise.all([
        itemsAPI.getAll(1, 100),
        usersAPI.getAll(1, 100)
      ]);
      setItems(itemsRes.data.data.items);
      setVolunteers(usersRes.data.data.users.filter((u: User) => u.role === 'VOLUNTEER'));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addStockItem = () => {
    setStockItems([...stockItems, { itemId: '', quantity: 0 }]);
  };

  const updateStockItem = (index: number, field: 'itemId' | 'quantity', value: any) => {
    const updated = [...stockItems];
    updated[index][field] = value;
    setStockItems(updated);
  };

  const removeStockItem = (index: number) => {
    setStockItems(stockItems.filter((_, i) => i !== index));
  };

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

  return (
    <>
      <ToastContainer toast={toast} onClose={() => setToast(null)} />
      <div className="space-y-6">
      <PageHeader
        title="Stock Management"
        description="Add stock to central inventory or assign to volunteers"
        icon={Warehouse}
      />

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
                        {items.map((i) => (
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
                    {volunteers.map((v) => (
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
                        {items.map((i) => (
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
