'use client';

import { useState, useEffect } from 'react';
import { packagesAPI, campaignsAPI } from '@/services/api';
import { Package as PackageIcon, ChevronRight, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Toast from '@/components/ui/toast-notification';
import { Combobox } from '@/components/ui/combobox';

export function VolunteerPackagesView({ user, packages, volunteerPackages, onRefresh }: any) {
  const [activeTab, setActiveTab] = useState<'myPackages' | 'request' | 'distribute'>('myPackages');
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
              <button
                onClick={() => setActiveTab('request')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'request' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}>
                Request Package
              </button>
              <button
                onClick={() => setActiveTab('distribute')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'distribute' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}>
                Distribute Package
              </button>
            </div>
          </div>

          <div className="p-4 md:p-6">
            {activeTab === 'myPackages' && <MyPackagesTab volunteerPackages={volunteerPackages} />}
            {activeTab === 'request' && (
              <RequestPackageTab
                packages={packages}
                onSuccess={() => { setToast({ message: 'Package requested successfully', type: 'success' }); onRefresh(); }}
                onError={(msg) => setToast({ message: msg, type: 'error' })}
              />
            )}
            {activeTab === 'distribute' && (
              <DistributePackageTab
                volunteerPackages={volunteerPackages}
                onSuccess={() => { setToast({ message: 'Package distributed successfully', type: 'success' }); onRefresh(); }}
                onError={(msg) => setToast({ message: msg, type: 'error' })}
              />
            )}
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
        <p className="text-gray-600">Request packages from the Request Package tab</p>
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

function RequestPackageTab({ packages, onSuccess, onError }: any) {
  const [selectedPackage, setSelectedPackage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stockSummary, setStockSummary] = useState<any>(null);

  useEffect(() => {
    if (selectedPackage) {
      loadStockSummary();
    }
  }, [selectedPackage]);

  const loadStockSummary = async () => {
    try {
      const res = await packagesAPI.getStockSummary(selectedPackage, 'central');
      setStockSummary(res.data.data);
    } catch (error) {
      console.error('Error loading stock:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage || quantity < 1) return;

    try {
      setLoading(true);
      await packagesAPI.selfAssign({ packageId: selectedPackage, quantity, requestId: uuidv4() });
      onSuccess();
      setSelectedPackage('');
      setQuantity(1);
      setStockSummary(null);
    } catch (error: any) {
      onError(error.response?.data?.error?.message || 'Failed to request package');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Package</label>
        <Combobox
          options={packages.map((p: any) => ({ value: p._id, label: p.name }))}
          value={selectedPackage}
          onChange={setSelectedPackage}
          placeholder="Select package"
        />
      </div>

      {stockSummary && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-sm text-blue-900">Available: <span className="font-semibold">{stockSummary.maxPackages}</span> packages</div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          min="1"
          max={stockSummary?.maxPackages || 999}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !selectedPackage}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
        {loading ? 'Requesting...' : 'Request Package'}
      </button>
    </form>
  );
}

function DistributePackageTab({ volunteerPackages, onSuccess, onError }: any) {
  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryPhone, setBeneficiaryPhone] = useState('');
  const [familySize, setFamilySize] = useState('');
  const [address, setAddress] = useState('');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const res = await campaignsAPI.getAll(1, 100);
      setCampaigns(res.data.data.data || res.data.data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const selectedPkg = volunteerPackages.find((vp: any) => vp.package._id === selectedPackage);
  const maxQuantity = selectedPkg?.available || 0;

  const handleNext = () => {
    if (step === 1 && (!selectedPackage || quantity < 1)) return;
    if (step === 2 && !beneficiaryName) return;
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage || !beneficiaryName || quantity < 1) return;

    try {
      setLoading(true);
      await packagesAPI.distribute({
        packageId: selectedPackage,
        quantity,
        distributionDate: new Date().toISOString(),
        location: {
          address: address || undefined
        },
        beneficiaryInfo: {
          name: beneficiaryName,
          phone: beneficiaryPhone || undefined,
          familySize: familySize ? parseInt(familySize) : undefined
        },
        campaignId: selectedCampaign || undefined,
        requestId: uuidv4()
      });
      onSuccess();
      setStep(1);
      setSelectedPackage('');
      setQuantity(1);
      setBeneficiaryName('');
      setBeneficiaryPhone('');
      setFamilySize('');
      setAddress('');
      setSelectedCampaign('');
    } catch (error: any) {
      onError(error.response?.data?.error?.message || 'Failed to distribute package');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: 'Package', icon: '📦' },
    { num: 2, title: 'Beneficiary', icon: '👤' },
    { num: 3, title: 'Location', icon: '📍' }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8 px-4">
        <div className="flex items-center justify-center">
          {steps.map((s, idx) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all ${
                  step > s.num ? 'bg-green-500 text-white' :
                  step === s.num ? 'bg-purple-600 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {step > s.num ? <Check className="w-6 h-6" /> : s.icon}
                </div>
                <span className={`text-sm mt-2 font-medium whitespace-nowrap ${
                  step >= s.num ? 'text-purple-600' : 'text-gray-400'
                }`}>
                  {s.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-24 h-1 mx-3 rounded transition-all ${
                  step > s.num ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Package Selection */}
        {step === 1 && (
          <div className="bg-white border border-purple-200 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Package & Quantity</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Package *</label>
              <Combobox
                options={volunteerPackages.map((vp: any) => ({ value: vp.package._id, label: `${vp.package.name} (${vp.available} available)` }))}
                value={selectedPackage}
                onChange={setSelectedPackage}
                placeholder="Select package"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max={maxQuantity}
                />
              </div>
              {selectedPkg && (
                <div className="flex items-end">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-purple-600">{selectedPkg.available}</span> packages available
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Beneficiary Details */}
        {step === 2 && (
          <div className="bg-white border border-purple-200 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Beneficiary Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Beneficiary Name *</label>
                <input
                  type="text"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="text"
                  value={beneficiaryPhone}
                  onChange={(e) => setBeneficiaryPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Contact number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Family Size</label>
                <input
                  type="number"
                  value={familySize}
                  onChange={(e) => setFamilySize(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  min="1"
                  placeholder="Number of members"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Location & Campaign */}
        {step === 3 && (
          <div className="bg-white border border-purple-200 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Campaign</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                rows={3}
                placeholder="Full address with city and area"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Campaign (Optional)</label>
              <Combobox
                options={campaigns.map(c => ({ value: c._id, label: c.name }))}
                value={selectedCampaign}
                onChange={setSelectedCampaign}
                placeholder="Select campaign"
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={step === 1 && (!selectedPackage || quantity < 1) || step === 2 && !beneficiaryName}
              className="flex-1 px-6 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || !selectedPackage || !beneficiaryName}
              className="flex-1 px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
              {loading ? 'Distributing...' : 'Complete Distribution'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
