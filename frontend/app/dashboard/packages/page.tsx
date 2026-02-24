'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { packagesAPI, itemsAPI, usersAPI, stockAPI } from '@/services/api';
import { Package, Item, User } from '@/types';
import { Package as PackageIcon, Plus, Edit, Trash2, Users, Send, Box } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Toast from '@/components/ui/toast-notification';
import ConfirmModal from '@/components/ui/confirm-modal';
import { Combobox } from '@/components/ui/combobox';

export default function PackagesPage() {
  const { user } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [stockSummary, setStockSummary] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; packageId: string | null }>({ show: false, packageId: null });

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pkgRes, itemsRes, usersRes] = await Promise.all([
        packagesAPI.getAll(),
        itemsAPI.getAll(1, 100),
        isAdmin ? usersAPI.getAll(1, 100) : Promise.resolve({ data: { data: [] } })
      ]);
      setPackages(pkgRes.data.data.data || pkgRes.data.data);
      setItems(itemsRes.data.data.data || itemsRes.data.data);
      setVolunteers(usersRes.data.data.data?.filter((u: User) => u.role === 'VOLUNTEER') || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmDelete({ show: true, packageId: id });
  };

  const confirmDeletePackage = async () => {
    if (!confirmDelete.packageId) return;
    try {
      await packagesAPI.delete(confirmDelete.packageId);
      setToast({ message: 'Package deleted successfully', type: 'success' });
      loadData();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message;
      if (errorMsg?.includes('not found')) {
        setToast({ message: 'Package not found', type: 'error' });
      } else {
        setToast({ message: errorMsg || 'Failed to delete package', type: 'error' });
      }
    } finally {
      setConfirmDelete({ show: false, packageId: null });
    }
  };

  const viewStockSummary = async (pkg: Package) => {
    try {
      const res = await packagesAPI.getStockSummary(pkg._id, 'central');
      setStockSummary(res.data.data);
      setSelectedPackage(pkg);
      setShowStockModal(true);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message;
      if (errorMsg?.includes('not found')) {
        setToast({ message: 'Package not found', type: 'error' });
      } else {
        setToast({ message: errorMsg || 'Failed to load stock summary', type: 'error' });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageIcon className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-semibold">Packages</h1>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-2 bg-blue-600 text-white rounded-lg"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PackageIcon className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Package Management</h1>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Create Package
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        {packages.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <PackageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Packages Yet</h3>
            <p className="text-gray-600 mb-4">Create your first package to get started</p>
            {isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Create Package
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg._id}
                package={pkg}
                isAdmin={isAdmin}
                onEdit={() => {
                  setSelectedPackage(pkg);
                  setShowCreateModal(true);
                }}
                onDelete={() => handleDelete(pkg._id)}
                onAssign={() => {
                  setSelectedPackage(pkg);
                  setShowAssignModal(true);
                }}
                onViewStock={() => viewStockSummary(pkg)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete.show && (
        <ConfirmModal
          title="Delete Package"
          message="Are you sure you want to delete this package? This action cannot be undone."
          onConfirm={confirmDeletePackage}
          onCancel={() => setConfirmDelete({ show: false, packageId: null })}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreatePackageModal
          package={selectedPackage}
          items={items}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedPackage(null);
          }}
          onSuccess={() => {
            loadData();
            setShowCreateModal(false);
            setSelectedPackage(null);
          }}
        />
      )}

      {showAssignModal && selectedPackage && (
        <AssignPackageModal
          package={selectedPackage}
          volunteers={volunteers}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedPackage(null);
          }}
          onSuccess={() => {
            loadData();
            setShowAssignModal(false);
            setSelectedPackage(null);
          }}
        />
      )}

      {showStockModal && stockSummary && (
        <StockSummaryModal
          summary={stockSummary}
          onClose={() => {
            setShowStockModal(false);
            setStockSummary(null);
            setSelectedPackage(null);
          }}
        />
      )}
    </div>
  );
}

function PackageCard({ package: pkg, isAdmin, onEdit, onDelete, onAssign, onViewStock }: any) {
  return (
    <div className="bg-white rounded-lg border hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{pkg.name}</h3>
            {pkg.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{pkg.description}</p>
            )}
          </div>
          <PackageIcon className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" />
        </div>

        <div className="space-y-2 mb-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{pkg.items.length}</span> items
          </div>
          {pkg.items.slice(0, 2).map((item: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                {typeof item.itemId === 'object' ? item.itemId.name : 'Item'}
              </span>
              <span className="text-gray-900 font-medium">
                {item.quantity} {typeof item.itemId === 'object' ? item.itemId.unit : ''}
              </span>
            </div>
          ))}
          {pkg.items.length > 2 && (
            <div className="text-sm text-gray-500">+{pkg.items.length - 2} more</div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onViewStock}
            className="flex-1 min-w-[100px] px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-1"
          >
            <Box className="w-4 h-4" />
            Stock
          </button>
          {isAdmin && (
            <>
              <button
                onClick={onAssign}
                className="flex-1 min-w-[100px] px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-1"
              >
                <Send className="w-4 h-4" />
                Assign
              </button>
              <button
                onClick={onEdit}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CreatePackageModal({ package: pkg, items, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    name: pkg?.name || '',
    description: pkg?.description || '',
    items: pkg?.items.map((i: any) => ({
      itemId: typeof i.itemId === 'object' ? i.itemId._id : i.itemId,
      quantity: i.quantity
    })) || [{ itemId: '', quantity: 1 }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Package name is required');
      return;
    }
    
    if (formData.items.length === 0) {
      setError('At least one item is required');
      return;
    }
    
    const emptyItem = formData.items.find(i => !i.itemId);
    if (emptyItem) {
      setError('Please select an item for all rows');
      return;
    }
    
    const invalidQuantity = formData.items.find(i => i.quantity < 1);
    if (invalidQuantity) {
      setError('Item quantity must be at least 1');
      return;
    }

    try {
      setLoading(true);
      setError('');
      if (pkg) {
        await packagesAPI.update(pkg._id, formData);
      } else {
        await packagesAPI.create(formData);
      }
      onSuccess();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message;
      
      if (errorMsg?.includes('already exists')) {
        setError(errorMsg);
      } else if (errorMsg?.toLowerCase().includes('duplicate')) {
        setError('Duplicate items detected. Each item can only be added once per package');
      } else if (errorMsg?.includes('not found') || errorMsg?.includes('inactive')) {
        setError('One or more selected items are no longer available');
      } else {
        setError(errorMsg || 'Failed to save package. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { itemId: '', quantity: 1 }]
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_: any, i: number) => i !== index)
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="bg-white w-full md:max-w-2xl rounded-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-4 md:px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-semibold">
            {pkg ? 'Edit Package' : 'Create Package'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Package Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Family Relief Kit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Brief description"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Items *</label>
              <button
                type="button"
                onClick={addItem}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item: any, index: number) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Combobox
                      options={items.map((i: Item) => ({ value: i._id, label: `${i.name} (${i.unit})` }))}
                      value={item.itemId}
                      onChange={(value) => updateItem(index, 'itemId', value)}
                      placeholder="Select item"
                    />
                  </div>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                    className="w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    min="1"
                  />
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : pkg ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssignPackageModal({ package: pkg, volunteers, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    volunteerId: '',
    quantity: 1
  });
  const [loading, setLoading] = useState(false);
  const [stockSummary, setStockSummary] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStockSummary();
  }, []);

  const loadStockSummary = async () => {
    try {
      const res = await packagesAPI.getStockSummary(pkg._id, 'central');
      setStockSummary(res.data.data);
    } catch (error) {
      console.error('Error loading stock:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.volunteerId) {
      setError('Please select a volunteer');
      return;
    }
    
    if (formData.quantity < 1) {
      setError('Quantity must be at least 1');
      return;
    }

    if (stockSummary && formData.quantity > stockSummary.maxPackages) {
      setError(`Insufficient stock. Only ${stockSummary.maxPackages} package${stockSummary.maxPackages !== 1 ? 's' : ''} available in central warehouse`);
      return;
    }

    try {
      setLoading(true);
      setError('');
      await packagesAPI.assign({
        packageId: pkg._id,
        volunteerId: formData.volunteerId,
        quantity: formData.quantity,
        requestId: uuidv4()
      });
      onSuccess();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message;
      if (errorMsg?.includes('Insufficient')) {
        setError(errorMsg);
      } else if (errorMsg?.includes('not found')) {
        setError('Selected volunteer or package is no longer available');
      } else if (errorMsg?.includes('inactive')) {
        setError('Package or volunteer is inactive');
      } else {
        setError(errorMsg || 'Failed to assign package. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-0 md:p-4 overflow-y-auto">
      <div className="bg-white w-full md:max-w-lg rounded-lg max-h-[95vh] md:max-h-[90vh] flex flex-col my-auto">
        <div className="sticky top-0 bg-white border-b px-4 md:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg md:text-xl font-semibold">Assign Package</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm font-medium text-blue-900 mb-1">{pkg.name}</div>
            {stockSummary && (
              <div className="text-sm text-blue-700">
                Available: <span className="font-semibold">{stockSummary.maxPackages}</span> packages
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Volunteer *
            </label>
            <Combobox
              options={volunteers.map((v: User) => ({ value: v._id, label: v.name }))}
              value={formData.volunteerId}
              onChange={(value) => setFormData({ ...formData, volunteerId: value })}
              placeholder="Select volunteer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              min="1"
              max={stockSummary?.maxPackages || 999}
            />
          </div>

          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StockSummaryModal({ summary, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white w-full md:max-w-lg rounded-2xl max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b px-4 md:px-6 py-4">
          <h2 className="text-lg md:text-xl font-semibold">Stock Summary</h2>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="text-sm text-green-700 mb-1">Available Packages</div>
            <div className="text-3xl font-bold text-green-900">{summary.maxPackages}</div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Item Breakdown:</div>
            {summary.items.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{item.itemName}</div>
                  <div className="text-sm text-gray-600">
                    {item.quantityPerPackage} per package
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{item.possiblePackages}</div>
                  <div className="text-xs text-gray-600">packages</div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
