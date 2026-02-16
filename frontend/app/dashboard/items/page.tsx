'use client';

import { useEffect, useState } from 'react';
import { itemsAPI } from '@/services/api';
import { Item } from '@/types';
import { Package, Plus } from 'lucide-react';
import PageHeader from '@/components/ui/page-header';
import ContentCard from '@/components/ui/content-card';
import DataTable from '@/components/ui/data-table';
import Modal from '@/components/ui/modal';
import FormField from '@/components/ui/form-field';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', category: '', unit: '' });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const response = await itemsAPI.getAll();
      setItems(response.data.data.items);
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
      loadItems();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error creating item');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'unit', label: 'Unit' },
    {
      key: 'isActive',
      label: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'danger'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Items"
        description="Manage inventory items and categories"
        icon={Package}
        action={
          <Button icon={Plus} onClick={() => setShowForm(true)}>
            Add Item
          </Button>
        }
      />

      <ContentCard className="p-6">
        <DataTable
          columns={columns}
          data={items}
          loading={loading}
          searchPlaceholder="Search items..."
          emptyMessage="No items found. Add your first item to get started."
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
    </div>
  );
}
