'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { packagesAPI, itemsAPI, usersAPI, stockAPI } from '@/services/api';
import { Package, Item, User } from '@/types';
import { Package as PackageIcon, Plus, Edit, Trash2, Box, Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Toast from '@/components/ui/toast-notification';
import ConfirmModal from '@/components/ui/confirm-modal';
import { Combobox } from '@/components/ui/combobox';
import { VolunteerPackagesView } from './volunteer-view';

export default function PackagesPage() {
  const { user } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [stockSummary, setStockSummary] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; packageId: string | null }>({ show: false, packageId: null });
  const [volunteerPackages, setVolunteerPackages] = useState<any[]>([]);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    loadData();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin && user?._id && packages.length > 0) {
      loadVolunteerPackages();
    }
  }, [isAdmin, user?._id, packages]);

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

  const loadVolunteerPackages = async () => {
    if (!user?._id) return;
    try {
      const res = await stockAPI.getVolunteerStock(user._id);
      const stockData = res.data.data;
      const pkgSummary: any = {};
      
      packages.forEach(pkg => {
        let minPackages = Infinity;
        pkg.items.forEach((item: any) => {
          const itemId = typeof item.itemId === 'object' ? item.itemId._id : item.itemId;
          const stockItem = stockData.find((s: any) => s.itemId === itemId);
          const available = stockItem?.stock || 0;
          const possible = Math.floor(available / item.quantity);
          minPackages = Math.min(minPackages, possible);
        });
        if (minPackages > 0 && minPackages !== Infinity) {
          pkgSummary[pkg._id] = { package: pkg, available: minPackages };
        }
      });
      
      setVolunteerPackages(Object.values(pkgSummary));
    } catch (error) {
      console.error('Error loading volunteer packages:', error);
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

  // Filter and paginate packages
  const filteredPackages = packages.filter(pkg => 
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPackages = filteredPackages.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8 bg-gray-50">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <VolunteerPackagesView
        volunteerPackages={volunteerPackages}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Package Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage volunteer distribution packages</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search packages..."
          className="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Package List */}
      {paginatedPackages.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center">
          <PackageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No packages found' : 'No Packages Yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? 'Try adjusting your search' : 'Create your first package to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Package
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedPackages.map((pkg) => {
              const totalItems = pkg.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
              return (
                <div
                  key={pkg._id}
                  className="bg-white border border-gray-200 rounded-xl px-5 py-4 hover:bg-gray-50 transition flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{pkg.name}</h3>
                    <p className="text-sm text-gray-500">
                      {pkg.items.length} {pkg.items.length === 1 ? 'item' : 'items'} • {totalItems} total quantity
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => viewStockSummary(pkg)}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setShowCreateModal(true);
                      }}
                      className="rounded-lg px-3 py-1.5 text-sm border border-gray-200 hover:bg-gray-100"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg._id)}
                      className="rounded-lg px-3 py-1.5 text-sm border border-gray-200 hover:bg-red-50 hover:border-red-200 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1}–{Math.min(endIndex, filteredPackages.length)} of {filteredPackages.length} packages
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`rounded-lg px-3 py-1.5 text-sm ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-lg max-h-[90vh] overflow-y-auto">
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

function StockSummaryModal({ summary, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full md:max-w-lg rounded-2xl max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b px-4 md:px-6 py-4">
          <h2 className="text-lg md:text-xl font-semibold">Stock Summary</h2>
        </div>

        <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
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
