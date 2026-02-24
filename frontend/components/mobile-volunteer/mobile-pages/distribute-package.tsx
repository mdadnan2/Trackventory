'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { packagesAPI, citiesAPI, campaignsAPI } from '@/services/api';
import ScreenContainer from '../ScreenContainer';
import ActionCard from '../ActionCard';
import QuantityStepper from '../QuantityStepper';
import StickyActionBar from '../StickyActionBar';
import { CheckCircle, MapPin, Package as PackageIcon, Megaphone, Box } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function MobilePackageDistribute() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [packages, setPackages] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [packageQuantity, setPackageQuantity] = useState(1);
  const [stockSummary, setStockSummary] = useState<any>(null);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [address, setAddress] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryPhone, setBeneficiaryPhone] = useState('');
  const [familySize, setFamilySize] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    if (selectedPackage && user) {
      loadStockSummary();
    }
  }, [selectedPackage, user]);

  const loadData = async () => {
    try {
      const [pkgRes, campaignRes, citiesRes] = await Promise.all([
        packagesAPI.getAll(),
        campaignsAPI.getAll(1, 100),
        citiesAPI.getAll(1, 100)
      ]);
      setPackages(pkgRes.data.data.data || pkgRes.data.data);
      const active = (campaignRes.data.data?.data || []).filter((c: any) => c.status === 'ACTIVE');
      setCampaigns(active);
      setCities(citiesRes.data.data.data || citiesRes.data.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadStockSummary = async () => {
    try {
      const res = await packagesAPI.getStockSummary(
        selectedPackage._id,
        'volunteer',
        user?._id
      );
      setStockSummary(res.data.data);
    } catch (error) {
      console.error('Error loading stock:', error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const selectedCityObj = cities.find(c => c._id === selectedCity);
      const areaObj = selectedCityObj?.areas?.find((a: any) => a._id === selectedArea);

      await packagesAPI.distribute({
        packageId: selectedPackage._id,
        quantity: packageQuantity,
        distributionDate: new Date().toISOString(),
        location: {
          cityId: selectedCity,
          areaId: selectedArea,
          address: address || undefined,
          coordinates: undefined
        },
        beneficiaryInfo: {
          name: beneficiaryName,
          phone: beneficiaryPhone || undefined,
          familySize: familySize || undefined
        },
        campaignId: selectedCampaign || undefined,
        requestId: uuidv4()
      });

      alert('Package distributed successfully!');
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Error distributing package');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedPackage(null);
    setPackageQuantity(1);
    setStockSummary(null);
    setSelectedCampaign('');
    setSelectedCity('');
    setSelectedArea('');
    setAddress('');
    setBeneficiaryName('');
    setBeneficiaryPhone('');
    setFamilySize(1);
  };

  const canProceed1 = selectedPackage !== null;
  const canProceed2 = packageQuantity > 0 && packageQuantity <= (stockSummary?.maxPackages || 0);
  const canProceed3 = campaigns.length === 0 || selectedCampaign;
  const canProceed4 = selectedCity && selectedArea;
  const canProceed5 = beneficiaryName.trim().length > 0;

  return (
    <ScreenContainer
      title="Distribute Package"
      subtitle={`Step ${step} of 6`}
      showBack={step > 1}
      onBack={() => setStep(step - 1)}
    >
      <div className="space-y-4 pb-24">
        {/* Step 1: Select Package */}
        {step === 1 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
                1
              </div>
              <div className="text-lg font-semibold text-slate-900">Select Package</div>
            </div>
            {packages.length === 0 ? (
              <ActionCard>
                <div className="text-center py-8 text-slate-500">
                  <PackageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No packages available</p>
                </div>
              </ActionCard>
            ) : (
              packages.map((pkg) => (
                <ActionCard
                  key={pkg._id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={selectedPackage?._id === pkg._id ? 'ring-2 ring-blue-600' : ''}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                      selectedPackage?._id === pkg._id ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                    }`}>
                      {selectedPackage?._id === pkg._id && <CheckCircle size={16} className="text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{pkg.name}</div>
                      {pkg.description && (
                        <div className="text-sm text-slate-500 mt-1">{pkg.description}</div>
                      )}
                      <div className="text-xs text-slate-400 mt-2">
                        {pkg.items.length} items
                      </div>
                    </div>
                    <PackageIcon className="text-blue-600 flex-shrink-0" size={24} />
                  </div>
                </ActionCard>
              ))
            )}
          </>
        )}

        {/* Step 2: Select Quantity */}
        {step === 2 && selectedPackage && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
                2
              </div>
              <div className="text-lg font-semibold text-slate-900">Quantity</div>
            </div>

            <ActionCard>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="text-sm font-medium text-blue-900 mb-1">{selectedPackage.name}</div>
                {stockSummary && (
                  <div className="text-sm text-blue-700">
                    Available: <span className="font-semibold">{stockSummary.maxPackages}</span> packages
                  </div>
                )}
              </div>

              <QuantityStepper
                value={packageQuantity}
                onChange={setPackageQuantity}
                min={1}
                max={stockSummary?.maxPackages || 1}
                label="Number of packages"
              />

              {stockSummary && (
                <div className="mt-4 space-y-2">
                  <div className="text-xs font-semibold text-slate-700">Package Contents:</div>
                  {stockSummary.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-slate-600">{item.itemName}</span>
                      <span className="font-medium text-slate-900">
                        {item.quantityPerPackage * packageQuantity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </ActionCard>
          </>
        )}

        {/* Step 3: Select Campaign */}
        {step === 3 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
                3
              </div>
              <div className="text-lg font-semibold text-slate-900">Campaign (Optional)</div>
            </div>
            {campaigns.length === 0 ? (
              <ActionCard>
                <div className="text-center py-8 text-slate-500">
                  <Megaphone className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No active campaigns</p>
                  <p className="text-xs mt-1">You can skip this step</p>
                </div>
              </ActionCard>
            ) : (
              <>
                <ActionCard
                  onClick={() => setSelectedCampaign('')}
                  className={!selectedCampaign ? 'ring-2 ring-blue-600' : ''}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      !selectedCampaign ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                    }`}>
                      {!selectedCampaign && <CheckCircle size={16} className="text-white" />}
                    </div>
                    <div className="font-medium text-slate-700">No Campaign</div>
                  </div>
                </ActionCard>
                {campaigns.map((campaign) => (
                  <ActionCard
                    key={campaign._id}
                    onClick={() => setSelectedCampaign(campaign._id)}
                    className={selectedCampaign === campaign._id ? 'ring-2 ring-blue-600' : ''}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedCampaign === campaign._id ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`}>
                        {selectedCampaign === campaign._id && <CheckCircle size={16} className="text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">{campaign.name}</div>
                        {campaign.description && (
                          <div className="text-sm text-slate-500">{campaign.description}</div>
                        )}
                      </div>
                    </div>
                  </ActionCard>
                ))}
              </>
            )}
          </>
        )}

        {/* Step 4: Location */}
        {step === 4 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
                4
              </div>
              <div className="text-lg font-semibold text-slate-900">Location</div>
            </div>
            <ActionCard>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">City *</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      setSelectedCity(e.target.value);
                      setSelectedArea('');
                    }}
                    className="w-full h-14 px-4 border-2 border-slate-200 rounded-xl text-base bg-white"
                  >
                    <option value="">Select City</option>
                    {cities.map((city: any) => (
                      <option key={city._id} value={city._id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCity && (
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Area *</label>
                    <select
                      value={selectedArea}
                      onChange={(e) => setSelectedArea(e.target.value)}
                      className="w-full h-14 px-4 border-2 border-slate-200 rounded-xl text-base bg-white"
                    >
                      <option value="">Select Area</option>
                      {cities
                        .find((c: any) => c._id === selectedCity)
                        ?.areas?.map((area: any) => (
                          <option key={area._id} value={area._id}>
                            {area.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter specific address"
                    className="w-full h-14 px-4 border-2 border-slate-200 rounded-xl text-base"
                  />
                </div>
              </div>
            </ActionCard>
          </>
        )}

        {/* Step 5: Beneficiary Info */}
        {step === 5 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
                5
              </div>
              <div className="text-lg font-semibold text-slate-900">Beneficiary</div>
            </div>
            <ActionCard>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Name *</label>
                  <input
                    type="text"
                    value={beneficiaryName}
                    onChange={(e) => setBeneficiaryName(e.target.value)}
                    placeholder="Beneficiary name"
                    className="w-full h-14 px-4 border-2 border-slate-200 rounded-xl text-base"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={beneficiaryPhone}
                    onChange={(e) => setBeneficiaryPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full h-14 px-4 border-2 border-slate-200 rounded-xl text-base"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Family Size (Optional)
                  </label>
                  <QuantityStepper
                    value={familySize}
                    onChange={setFamilySize}
                    min={1}
                    max={50}
                  />
                </div>
              </div>
            </ActionCard>
          </>
        )}

        {/* Step 6: Confirm */}
        {step === 6 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center text-lg font-bold">
                6
              </div>
              <div className="text-lg font-semibold text-slate-900">Confirm</div>
            </div>
            <ActionCard>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Package</div>
                  <div className="font-semibold text-slate-900">{selectedPackage?.name}</div>
                  <div className="text-sm text-slate-600">Quantity: {packageQuantity}</div>
                </div>

                {selectedCampaign && (
                  <div className="border-t border-slate-200 pt-4">
                    <div className="text-xs text-slate-500 mb-1">Campaign</div>
                    <div className="font-medium text-slate-900">
                      {campaigns.find((c) => c._id === selectedCampaign)?.name}
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-4">
                  <div className="text-xs text-slate-500 mb-1">Location</div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    <span className="font-medium text-slate-900">
                      {cities.find((c: any) => c._id === selectedCity)?.name},{' '}
                      {cities
                        .find((c: any) => c._id === selectedCity)
                        ?.areas?.find((a: any) => a._id === selectedArea)?.name}
                    </span>
                  </div>
                  {address && <div className="text-sm text-slate-600 ml-6">{address}</div>}
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="text-xs text-slate-500 mb-1">Beneficiary</div>
                  <div className="font-medium text-slate-900">{beneficiaryName}</div>
                  {beneficiaryPhone && (
                    <div className="text-sm text-slate-600">{beneficiaryPhone}</div>
                  )}
                  {familySize > 1 && (
                    <div className="text-sm text-slate-600">Family size: {familySize}</div>
                  )}
                </div>
              </div>
            </ActionCard>
          </>
        )}
      </div>

      <StickyActionBar
        onClick={() => {
          if (step === 1 && canProceed1) setStep(2);
          else if (step === 2 && canProceed2) setStep(3);
          else if (step === 3 && canProceed3) setStep(4);
          else if (step === 4 && canProceed4) setStep(5);
          else if (step === 5 && canProceed5) setStep(6);
          else if (step === 6) handleSubmit();
        }}
        disabled={
          (step === 1 && !canProceed1) ||
          (step === 2 && !canProceed2) ||
          (step === 3 && !canProceed3) ||
          (step === 4 && !canProceed4) ||
          (step === 5 && !canProceed5) ||
          loading
        }
        loading={loading}
        variant={step === 6 ? 'success' : 'primary'}
      >
        {step === 6 ? (
          <span className="flex items-center justify-center gap-2">
            <CheckCircle size={24} />
            Confirm Distribution
          </span>
        ) : (
          'Continue'
        )}
      </StickyActionBar>
    </ScreenContainer>
  );
}
