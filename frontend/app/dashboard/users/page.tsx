'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usersAPI } from '@/services/api';
import { User, PaginatedResponse } from '@/types';
import { Users as UsersIcon, Plus, Shield, UserCheck } from 'lucide-react';
import PageHeader from '@/components/ui/page-header';
import ContentCard from '@/components/ui/content-card';
import DataTable from '@/components/ui/data-table';
import Modal from '@/components/ui/modal';
import FormField from '@/components/ui/form-field';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { ToastContainer } from '@/components/ui/toast';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { Pagination } from '@/components/ui/pagination';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0, pageSize: 5 });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; userId: string; currentStatus: string; userName: string }>({ isOpen: false, userId: '', currentStatus: '', userName: '' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'VOLUNTEER' as 'ADMIN' | 'VOLUNTEER'
  });

  useEffect(() => {
    loadUsers(pagination.currentPage);
  }, []);

  const loadUsers = async (page: number) => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll(page);
      const result: PaginatedResponse<User> = response.data.data;
      setUsers(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await usersAPI.create(formData);
      setToast({ message: 'User created successfully! They can now login with Google.', type: 'success' });
      setShowForm(false);
      loadUsers(pagination.currentPage);
    } catch (error: any) {
      setToast({ message: error.response?.data?.error?.message || 'Error creating user', type: 'error' });
    }
  };

  const toggleStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
      await usersAPI.update(userId, { status: newStatus });
      loadUsers(pagination.currentPage);
      setToast({ message: `User ${newStatus.toLowerCase()} successfully!`, type: 'success' });
      setConfirmDialog({ isOpen: false, userId: '', currentStatus: '', userName: '' });
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || 'Error updating user', type: 'error' });
    }
  };

  const handleStatusClick = (user: User) => {
    setConfirmDialog({ isOpen: true, userId: user._id, currentStatus: user.status, userName: user.name });
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (value: string) => (
        <Badge variant={value === 'ADMIN' ? 'warning' : 'info'}>
          {value === 'ADMIN' ? <Shield size={12} className="inline mr-1" /> : <UserCheck size={12} className="inline mr-1" />}
          {value}
        </Badge>
      )
    },
    {
      key: 'isOnboarded',
      label: 'Onboarded',
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'warning'}>
          {value ? 'Yes' : 'Pending'}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge variant={value === 'ACTIVE' ? 'success' : 'danger'}>
          {value}
        </Badge>
      )
    },
    {
      key: '_id',
      label: 'Actions',
      render: (_: string, row: User) => (
        <Button
          variant="secondary"
          onClick={() => handleStatusClick(row)}
          className="text-xs py-1.5 px-3"
        >
          {row.status === 'ACTIVE' ? 'Block' : 'Activate'}
        </Button>
      )
    }
  ];

  return (
    <>
      <ToastContainer toast={toast} onClose={() => setToast(null)} />
      <div className="space-y-6">
      <ContentCard className="p-6">
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          searchPlaceholder="Search users..."
          emptyMessage="No users found."
          action={
            <Button onClick={() => setShowForm(true)}>
              Add
            </Button>
          }
        />
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={loadUsers}
        />
      </ContentCard>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Add New User"
        description="Create a new user account"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField label="Full Name" required>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              required
            />
          </FormField>

          <FormField label="Email Address" required helper="User will login with this Google account">
            <input
              type="email"
              className="input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              required
            />
          </FormField>

          <FormField label="Role" required>
            <select
              className="input"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'VOLUNTEER' })}
            >
              <option value="VOLUNTEER">Volunteer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </FormField>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.currentStatus === 'ACTIVE' ? 'Block User' : 'Activate User'}
        message={`Are you sure you want to ${confirmDialog.currentStatus === 'ACTIVE' ? 'block' : 'activate'} ${confirmDialog.userName}?`}
        confirmText={confirmDialog.currentStatus === 'ACTIVE' ? 'Block' : 'Activate'}
        cancelText="Cancel"
        type={confirmDialog.currentStatus === 'ACTIVE' ? 'danger' : 'info'}
        onConfirm={() => toggleStatus(confirmDialog.userId, confirmDialog.currentStatus)}
        onCancel={() => setConfirmDialog({ isOpen: false, userId: '', currentStatus: '', userName: '' })}
      />
    </div>
    </>
  );
}
