'use client';

import { useEffect, useState } from 'react';
import { citiesAPI } from '@/services/api';
import { City, PaginatedResponse } from '@/types';
import { MapPin, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/ui/page-header';
import ContentCard from '@/components/ui/content-card';
import Modal from '@/components/ui/modal';
import FormField from '@/components/ui/form-field';
import Button from '@/components/ui/button';
import { ToastContainer } from '@/components/ui/toast';
import { Pagination } from '@/components/ui/pagination';

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0, pageSize: 5 });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    loadCities(pagination.currentPage);
  }, []);

  const loadCities = async (page: number) => {
    try {
      setLoading(true);
      const response = await citiesAPI.getAll(page);
      const result: PaginatedResponse<City> = response.data.data;
      setCities(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error loading cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await citiesAPI.create(formData);
      setFormData({ name: '' });
      setShowForm(false);
      loadCities(pagination.currentPage);
      setToast({ message: 'City created successfully!', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || 'Error creating city', type: 'error' });
    }
  };

  return (
    <>
      <ToastContainer toast={toast} onClose={() => setToast(null)} />
      <div className="space-y-6">
      <PageHeader
        title="Cities"
        description="Manage distribution cities and locations"
        icon={MapPin}
        action={
          <Button icon={Plus} onClick={() => setShowForm(true)}>
            Add City
          </Button>
        }
      />

      <ContentCard className="p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : cities.length === 0 ? (
          <div className="text-center py-16">
            <MapPin size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No cities found. Add your first city to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities.map((city, idx) => (
              <motion.div
                key={city._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="p-6 border border-slate-200 rounded-xl hover:shadow-md transition-all bg-gradient-to-br from-white to-slate-50"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-slate-900 truncate">{city.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Added {new Date(city.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={loadCities}
        />
      </ContentCard>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Add New City"
        description="Add a new city for distribution tracking"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField label="City Name" required>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              placeholder="e.g., New York, London"
              required
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit">Create City</Button>
          </div>
        </form>
      </Modal>
    </div>
    </>
  );
}
