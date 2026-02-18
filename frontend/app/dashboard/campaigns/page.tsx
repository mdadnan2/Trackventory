'use client';

import { useEffect, useState } from 'react';
import { campaignsAPI } from '@/services/api';
import { Campaign, PaginatedResponse } from '@/types';
import { Megaphone, Plus, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
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

  return (
    <>
      <ToastContainer toast={toast} onClose={() => setToast(null)} />
      <div className="space-y-6">
        <PageHeader
          title="Campaigns"
          description="Manage distribution campaigns and relief efforts"
          icon={Megaphone}
          action={
            <Button icon={Plus} onClick={() => setShowForm(true)}>
              Create Campaign
            </Button>
          }
        />

        <ContentCard className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-16">
              <Megaphone size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">No campaigns found. Create your first campaign to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign, idx) => (
                <motion.div
                  key={campaign._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="p-6 border border-slate-200 rounded-xl hover:shadow-md transition-all bg-gradient-to-br from-white to-slate-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Megaphone size={24} className="text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-slate-900">{campaign.name}</h3>
                          <Badge variant={getStatusVariant(campaign.status)}>
                            {getStatusIcon(campaign.status)}
                            <span className="ml-1">{campaign.status}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            <span>Start: {new Date(campaign.startDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            <span>End: {new Date(campaign.endDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {campaign.status === 'ACTIVE' && (
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => handleStatusClick(campaign, 'COMPLETED')}
                          className="text-xs py-1.5 px-3"
                        >
                          Complete
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleStatusClick(campaign, 'CANCELLED')}
                          className="text-xs py-1.5 px-3"
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
