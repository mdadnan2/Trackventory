'use client';

import { useEffect, useState } from 'react';
import { itemsAPI } from '@/services/api';
import { Item, PaginatedResponse } from '@/types';
import { Package, Plus } from 'lucide-react';
import PageHeader from '@/components/ui/page-header';
import ContentCard from '@/components/ui/content-card';
import DataTable from '@/components/ui/data-table';
import Modal from '@/components/ui/modal';
import FormField from '@/components/ui/form-field';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { ToastContainer } from '@/components/ui/toast';

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
      label: 'Name',
      render: (value: string, item: Item) => (
        <span className={item.isActive ? '' : 'text-gray-400'}>{value}</span>
      )
    },
    { 
      key: 'category', 
      label: 'Category',
      render: (value: string, item: Item) => (
        <span className={item.isActive ? '' : 'text-gray-400'}>{value}</span>
      )
    },
    { 
      key: 'unit', 
      label: 'Unit',
      render: (value: string, item: Item) => (
        <span className={item.isActive ? '' : 'text-gray-400'}>{value}</span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value: boolean, item: Item) => (
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={value}
            onChange={() => handleToggleStatus(item)}
            className="sr-only peer"
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ms-3 text-sm font-medium text-gray-900">
            {value ? 'Active' : 'Inactive'}
          </span>
        </label>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <ContentCard className="p-6">
        <DataTable
          columns={columns}
          data={items}
          loading={loading}
          searchPlaceholder="Search items..."
          emptyMessage="No items found. Add your first item to get started."
          action={
            <Button onClick={() => setShowForm(true)}>
              Add
            </Button>
          }
        />
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={loadItems}
        />
      </ContentCard>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Add New Item"
        description="Create a new inventory item"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField label="Item Name" required>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Rice, Wheat, Oil"
              required
            />
          </FormField>

          <FormField label="Category" required>
            <input
              type="text"
              className="input"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Food, Clothing"
              required
            />
          </FormField>

          <FormField label="Unit" required helper="Unit of measurement">
            <input
              type="text"
              className="input"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="e.g., kg, liters, pieces"
              required
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Item</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setSelectedItem(null);
        }}
        title="Confirm Deactivation"
        description="Are you sure you want to deactivate this item?"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This will deactivate <strong>{selectedItem?.name}</strong>. The item will no longer be available for new transactions.
          </p>
          <div className="flex justify-end gap-3 pt-4">
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
              Deactivate
            </Button>
          </div>
        </div>
      </Modal>

      <ToastContainer toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
