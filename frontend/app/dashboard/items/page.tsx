'use client';

import { useEffect, useState } from 'react';
import { itemsAPI } from '@/services/api';
import { Item, PaginatedResponse } from '@/types';
import { Package, Plus, Search } from 'lucide-react';
import PageHeader from '@/components/ui/page-header';
import Card from '@/components/ui/card';
import Table from '@/components/ui/table';
import Modal from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { ToastContainer } from '@/components/ui/toast';
import EmptyState from '@/components/ui/empty-state';
import { SkeletonTable } from '@/components/ui/skeleton';

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0, pageSize: 5 });
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', category: '', unit: '' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    loadItems(pagination.currentPage);
  }, []);

  const loadItems = async (page: number) => {
    try {
      setLoading(true);
      const response = await itemsAPI.getAll(page);
      const result: PaginatedResponse<Item> = response.data.data;
      setItems(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await itemsAPI.create(formData);
      setFormData({ name: '', category: '', unit: '' });
      setShowForm(false);
      loadItems(pagination.currentPage);
      setToast({ message: 'Item created successfully', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || 'Error creating item', type: 'error' });
    }
  };

  const handleToggleStatus = async (item: Item) => {
    setSelectedItem(item);
    if (!item.isActive) {
      try {
        await itemsAPI.toggleStatus(item._id, true);
        // Update local state immediately
        setItems(items.map(i => 
          i._id === item._id ? { ...i, isActive: true } : i
        ));
        setToast({ message: 'Item activated successfully', type: 'success' });
      } catch (error: any) {
        setToast({ message: error.response?.data?.error || 'Error activating item', type: 'error' });
      }
    } else {
      setShowConfirm(true);
    }
  };

  const confirmDeactivate = async () => {
    if (!selectedItem) return;
    try {
      await itemsAPI.toggleStatus(selectedItem._id, false);
      // Update local state immediately
      setItems(items.map(item => 
        item._id === selectedItem._id ? { ...item, isActive: false } : item
      ));
      setShowConfirm(false);
      setSelectedItem(null);
      setToast({ message: 'Item deactivated successfully', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || 'Error deactivating item', type: 'error' });
    }
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Item Name',
      render: (item: Item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Package size={20} className="text-blue-600" />
          </div>
          <div>
            <p className={`font-medium ${item.isActive ? 'text-slate-900' : 'text-slate-400'}`}>{item.name}</p>
            <p className="text-sm text-slate-500">{item.category}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'unit', 
      label: 'Unit',
      render: (item: Item) => (
        <span className={`text-sm ${item.isActive ? 'text-slate-700' : 'text-slate-400'}`}>{item.unit}</span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (item: Item) => (
        <div className="flex items-center gap-3">
          <Badge variant={item.isActive ? 'success' : 'default'}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={item.isActive}
              onChange={() => handleToggleStatus(item)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Items"
        description="Manage your inventory catalog and item categories"
        actions={
          <Button onClick={() => setShowForm(true)} icon={Plus}>
            Add Item
          </Button>
        }
      />

      <Card padding="none">
        <div className="p-6 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search items by name or category..."
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <SkeletonTable />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No items yet"
            description="Get started by adding your first inventory item"
            action={{ label: 'Add Item', onClick: () => setShowForm(true) }}
          />
        ) : (
          <>
            <Table
              columns={columns}
              data={items}
              keyExtractor={(item) => item._id}
            />
            <div className="p-6 border-t border-slate-200">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={loadItems}
              />
            </div>
          </>
        )}
      </Card>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Add New Item"
        description="Create a new inventory item for tracking"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Item Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Rice, Wheat, Oil"
            required
          />

          <Input
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Food, Clothing, Medical"
            required
          />

          <Input
            label="Unit of Measurement"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="e.g., kg, liters, pieces"
            helperText="How this item will be measured"
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" icon={Plus}>Create Item</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setSelectedItem(null);
        }}
        title="Deactivate Item"
        description="This action will prevent new transactions with this item"
      >
        <div className="space-y-4">
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <p className="text-sm text-orange-800">
              <strong>{selectedItem?.name}</strong> will be deactivated and won't be available for new stock operations.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              variant="secondary"
              onClick={() => {
                setShowConfirm(false);
                setSelectedItem(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDeactivate}>
              Deactivate Item
            </Button>
          </div>
        </div>
      </Modal>

      <ToastContainer toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
