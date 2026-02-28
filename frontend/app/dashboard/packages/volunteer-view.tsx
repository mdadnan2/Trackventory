'use client';

import { useState } from 'react';
import { Package as PackageIcon } from 'lucide-react';
import Toast from '@/components/ui/toast-notification';

export function VolunteerPackagesView({ volunteerPackages }: any) {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-4 md:px-6 py-4">
        <div className="flex items-center gap-3">
          <PackageIcon className="w-6 h-6 text-purple-600" />
          <h1 className="text-xl md:text-2xl font-bold">My Packages</h1>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('myPackages')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'myPackages' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}>
                My Packages
              </button>
            </div>
          </div>

          <div className="p-4 md:p-6">
            <MyPackagesTab volunteerPackages={volunteerPackages} />
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function MyPackagesTab({ volunteerPackages }: any) {
  if (volunteerPackages.length === 0) {
    return (
      <div className="text-center py-12">
        <PackageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Packages Available</h3>
        <p className="text-gray-600">Request packages from the <a href="/dashboard/stock" className="text-purple-600 hover:underline font-medium">Stock page</a></p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {volunteerPackages.map((vp: any) => (
        <div key={vp.package._id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-gray-900">{vp.package.name}</h3>
            <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">{vp.available}</span>
          </div>
          <div className="space-y-1">
            {vp.package.items.map((item: any, idx: number) => (
              <div key={idx} className="text-sm text-gray-700">
                • {typeof item.itemId === 'object' ? item.itemId.name : 'Item'} ({item.quantity})
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
