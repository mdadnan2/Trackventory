'use client';

import { useEffect, useState } from 'react';
import { campaignsAPI } from '@/services/api';
import { Campaign, PaginatedResponse } from '@/types';
import { Megaphone, Plus, Calendar, CheckCircle, XCircle, Clock, Search, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/ui/page-header';
import ContentCard from '@/components/ui/content-card';
import Modal from '@/components/ui/modal';
import FormField from '@/components/ui/form-field';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { ToastContainer } from '@/components/ui/toast';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { Pagination } from '@/components/ui/pagination';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0, pageSize: 5 });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; campaignId: string; action: 'COMPLETED' | 'CANCELLED'; campaignName: string }>({ isOpen: false, campaignId: '', action: 'COMPLETED', campaignName: '' });
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE' as 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  });

  useEffect(() => {
    loadCampaigns(pagination.currentPage);
  }, []);

  const loadCampaigns = async (page: number) => {
    try {
      setLoading(true);
      const response = await campaignsAPI.getAll(page);
      const result: PaginatedResponse<Campaign> = response.data.data;
      setCampaigns(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await campaignsAPI.create({
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      });
      setFormData({ name: '', startDate: '', endDate: '', status: 'ACTIVE' });
      setShowForm(false);
      loadCampaigns(pagination.currentPage);
      setToast({ message: 'Campaign created successfully!', type: 'success' });
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || 'Error creating campaign', type: 'error' });
    }
  };

  const updateStatus = async (id: string, status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED') => {
    try {
      await campaignsAPI.update(id, { status });
      loadCampaigns(pagination.currentPage);
      setToast({ message: `Campaign ${status.toLowerCase()} successfully!`, type: 'success' });
      setConfirmDialog({ isOpen: false, campaignId: '', action: 'COMPLETED', campaignName: '' });
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || 'Error updating campaign', type: 'error' });
    }
  };

  const handleStatusClick = (campaign: Campaign, action: 'COMPLETED' | 'CANCELLED') => {
    setConfirmDialog({ isOpen: true, campaignId: campaign._id, action, campaignName: campaign.name });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Clock size={16} />;
      case 'COMPLETED': return <CheckCircle size={16} />;
      case 'CANCELLED': return <XCircle size={16} />;
      default: return null;
    }
  };

  const getStatusVariant = (status: string): 'success' | 'danger' | 'warning' | 'info' => {
    switch (status) {
      case 'ACTIVE': return 'info';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'danger';
      default: return 'info';
    }
  };

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'from-blue-50 to-indigo-50 border-blue-200';
      case 'COMPLETED': return 'from-emerald-50 to-teal-50 border-emerald-200';
      case 'CANCELLED': return 'from-red-50 to-orange-50 border-red-200';
      default: return 'from-slate-50 to-slate-100';
    }
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(search.toLowerCase()) ||
    campaign.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <ToastContainer toast={toast} onClose={() => setToast(null)} />
      <div className="md:space-y-6">
        {/* Mobile: Stacked layout */}
        <div className="md:hidden space-y-3 px-4 pt-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              />
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="h-11 w-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Desktop: Original layout */}
        <ContentCard className="hidden md:block p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
              />
            </div>
            <Button onClick={() => setShowForm(true)} className="w-full sm:w-auto">
              <Plus size={18} className="sm:hidden" />
              <span className="hidden sm:inline">Add</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </ContentCard>

        {/* Campaign List */}
        <div className="md:hidden px-4 pb-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">{search ? 'No campaigns match your search.' : 'No campaigns found. Create your first campaign to get started.'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCampaigns.map((campaign, idx) => (
                <motion.div
                  key={campaign._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
                >
                  <div className="p-4">
                    {/* Header with name and status */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-semibold text-base text-slate-900 flex-1 break-words">{campaign.name}</h3>
                      <Badge variant={getStatusVariant(campaign.status)} className="w-fit flex-shrink-0 text-xs">
                        {getStatusIcon(campaign.status)}
                        <span className="ml-1 font-semibold">{campaign.status}</span>
                      </Badge>
                    </div>

                    {/* Dates section */}
                    <div className="space-y-2 mb-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400 flex-shrink-0" />
                        <span className="text-xs text-slate-500">Start Date</span>
                        <span className="text-sm font-medium text-slate-900">{new Date(campaign.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400 flex-shrink-0" />
                        <span className="text-xs text-slate-500">End Date</span>
                        <span className="text-sm font-medium text-slate-900">{new Date(campaign.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {campaign.status === 'ACTIVE' && (
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleStatusClick(campaign, 'COMPLETED')}
                          className="flex-1 text-xs py-2 px-3 font-semibold h-9 rounded-lg"
                        >
                          Complete
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleStatusClick(campaign, 'CANCELLED')}
                          className="flex-1 text-xs py-2 px-3 font-semibold h-9 rounded-lg"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop: Campaign list */}
        <ContentCard className="hidden md:block p-4 sm:p-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="text-center py-16">
              <Megaphone size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">{search ? 'No campaigns match your search.' : 'No campaigns found. Create your first campaign to get started.'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCampaigns.map((campaign, idx) => (
                <motion.div
                  key={campaign._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-gradient-to-br ${getStatusGradient(campaign.status)} border-2 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group`}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-bold text-lg sm:text-xl text-slate-900 break-words flex-1">{campaign.name}</h3>
                        <Badge variant={getStatusVariant(campaign.status)} className="w-fit flex-shrink-0">
                          {getStatusIcon(campaign.status)}
                          <span className="ml-1 text-xs sm:text-sm font-semibold">{campaign.status}</span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/40">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar size={14} className="text-slate-500" />
                            <span className="text-xs text-slate-600 font-medium">Start Date</span>
                          </div>
                          <p className="text-sm sm:text-base font-semibold text-slate-900">{new Date(campaign.startDate).toLocaleDateString()}</p>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/40">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar size={14} className="text-slate-500" />
                            <span className="text-xs text-slate-600 font-medium">End Date</span>
                          </div>
                          <p className="text-sm sm:text-base font-semibold text-slate-900">{new Date(campaign.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {campaign.status === 'ACTIVE' && (
                        <div className="flex gap-2 pt-2 sm:pt-0">
                          <Button
                            variant="secondary"
                            onClick={() => handleStatusClick(campaign, 'COMPLETED')}
                            className="flex-1 sm:flex-none text-xs sm:text-sm py-2 sm:py-2 px-3 font-semibold"
                          >
                            Complete
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleStatusClick(campaign, 'CANCELLED')}
                            className="flex-1 sm:flex-none text-xs sm:text-sm py-2 sm:py-2 px-3 font-semibold"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={loadCampaigns}
          />
        </ContentCard>

        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title="Create New Campaign"
          description="Set up a new distribution campaign"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField label="Campaign Name" required>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Winter Relief 2024"
                required
              />
            </FormField>

            <FormField label="Start Date" required>
              <input
                type="date"
                className="input"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </FormField>

            <FormField label="End Date" required>
              <input
                type="date"
                className="input"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate}
                required
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Campaign</Button>
            </div>
          </form>
        </Modal>

        {/* Mobile Pagination */}
        <div className="md:hidden px-4 pb-4">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={loadCampaigns}
          />
        </div>

        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.action === 'COMPLETED' ? 'Complete Campaign' : 'Cancel Campaign'}
          message={`Are you sure you want to ${confirmDialog.action === 'COMPLETED' ? 'complete' : 'cancel'} "${confirmDialog.campaignName}"?`}
          confirmText={confirmDialog.action === 'COMPLETED' ? 'Complete' : 'Cancel Campaign'}
          cancelText="Go Back"
          type={confirmDialog.action === 'COMPLETED' ? 'info' : 'danger'}
          onConfirm={() => updateStatus(confirmDialog.campaignId, confirmDialog.action)}
          onCancel={() => setConfirmDialog({ isOpen: false, campaignId: '', action: 'COMPLETED', campaignName: '' })}
        />
      </div>
    </>
  );
}
