'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { stockAPI, distributionAPI, campaignsAPI } from '@/services/api';
import ScreenContainer from '../ScreenContainer';
import ActionCard from '../ActionCard';
import QuantityStepper from '../QuantityStepper';
import StickyActionBar from '../StickyActionBar';
import { CheckCircle, MapPin, Package, Megaphone } from 'lucide-react';
import { State, City } from 'country-state-city';

export default function MobileDistribute() {
  const { user } = useAuth();
  const { addToQueue } = useOfflineQueue();
  const [step, setStep] = useState(1);
  const [stock, setStock] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [beneficiaryCount, setBeneficiaryCount] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    loadStates();
  }, [user]);

  useEffect(() => {
    if (selectedState) {
      loadCities(selectedState);
    } else {
      setCities([]);
      setSelectedCity('');
    }
  }, [selectedState]);

  const loadData = async () => {
    try {
      if (user?._id) {
        const [stockRes, campaignRes] = await Promise.all([
          stockAPI.getVolunteerStock(user._id),
          campaignsAPI.getAll(1, 100),
        ]);
        setStock(stockRes.data.data || []);
        const active = (campaignRes.data.data?.data || []).filter((c: any) => c.status === 'ACTIVE');
        setCampaigns(active);
        if (active.length === 1) setSelectedCampaign(active[0]._id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadStates = () => {
    const indianStates = State.getStatesOfCountry('IN');
    setStates(indianStates);
  };

  const loadCities = (stateName: string) => {
    const indianStates = State.getStatesOfCountry('IN');
    const selectedStateObj = indianStates.find(s => s.name === stateName);
    if (selectedStateObj) {
      const stateCities = City.getCitiesOfState('IN', selectedStateObj.isoCode);
      setCities(stateCities);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const items = Object.entries(selectedItems)
        .filter(([_, qty]) => qty > 0)
        .map(([itemId, quantity]) => ({ itemId, quantity }));

      const payload = {
        items,
        state: selectedState,
        city: selectedCity,
        pinCode,
        area: selectedArea,
        campaignId: selectedCampaign || undefined,
      };

      await distributionAPI.create(payload);
      
      // Optimistic update
      setStock((prev) =>
        prev.map((item) => ({
          ...item,
          stock: item.stock - (selectedItems[item.itemId] || 0),
        }))
      );

      resetForm();
    } catch (error) {
      console.error('Error:', error);
      addToQueue('DISTRIBUTION', {
        items: Object.entries(selectedItems)
          .filter(([_, qty]) => qty > 0)
          .map(([itemId, quantity]) => ({ itemId, quantity })),
        state: selectedState,
        city: selectedCity,
        pinCode,
        area: selectedArea,
        campaignId: selectedCampaign,
      });
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedItems({});
    setSelectedState('');
    setSelectedCity('');
    setPinCode('');
    setSelectedArea('');
    setBeneficiaryCount(1);
  };

  const canProceed1 = campaigns.length === 0 || selectedCampaign;
  const canProceed2 = Object.values(selectedItems).some((qty) => qty > 0);
  const canProceed3 = selectedState && selectedCity && pinCode && selectedArea;
  const canProceed4 = beneficiaryCount > 0;

  return (
    <ScreenContainer
      title="Distribution"
      subtitle={`Step ${step} of 5`}
      showBack={step > 1}
    >
      <div className="space-y-4 pb-24">
        {step === 1 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
                1
              </div>
              <div className="text-lg font-semibold text-slate-900">Select Campaign</div>
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
              campaigns.map((campaign) => (
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
                      <div className="text-sm text-slate-500">{campaign.description}</div>
                    </div>
                  </div>
                </ActionCard>
              ))
            )}
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
                2
              </div>
              <div className="text-lg font-semibold text-slate-900">Select Items</div>
            </div>
            {stock.map((item) => (
              <ActionCard key={item.itemId}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{item.item?.name}</div>
                      <div className="text-sm text-slate-500">
                        Available: {item.stock} {item.item?.unit}
                      </div>
                    </div>
                    <Package className="text-blue-600" size={24} />
                  </div>
                  <QuantityStepper
                    value={selectedItems[item.itemId] || 0}
                    onChange={(qty) => setSelectedItems((prev) => ({ ...prev, [item.itemId]: qty }))}
                    max={item.stock}
                  />
                </div>
              </ActionCard>
            ))}
          </>
        )}

        {step === 3 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
                3
              </div>
              <div className="text-lg font-semibold text-slate-900">Location</div>
            </div>
            <ActionCard>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedCity('');
                    }}
                    className="w-full h-14 px-4 border-2 border-slate-200 rounded-xl text-base bg-white"
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state.isoCode} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedState && (
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">City</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full h-14 px-4 border-2 border-slate-200 rounded-xl text-base bg-white"
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city.name} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Pin Code</label>
                  <input
                    type="text"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="Enter pin code"
                    className="w-full h-14 px-4 border-2 border-slate-200 rounded-xl text-base"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Area</label>
                  <input
                    type="text"
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    placeholder="Enter area name"
                    className="w-full h-14 px-4 border-2 border-slate-200 rounded-xl text-base"
                  />
                </div>
              </div>
            </ActionCard>
          </>
        )}

        {step === 4 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
                4
              </div>
              <div className="text-lg font-semibold text-slate-900">Beneficiaries</div>
            </div>
            <ActionCard>
              <QuantityStepper
                value={beneficiaryCount}
                onChange={setBeneficiaryCount}
                min={1}
                label="Number of beneficiaries"
              />
            </ActionCard>
          </>
        )}

        {step === 5 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center text-lg font-bold">
                5
              </div>
              <div className="text-lg font-semibold text-slate-900">Confirm</div>
            </div>
            <ActionCard>
              <div className="space-y-4">
                {selectedCampaign && (
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Campaign</div>
                    <div className="font-medium text-slate-900">
                      {campaigns.find((c) => c._id === selectedCampaign)?.name}
                    </div>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-4">
                  <div className="text-xs text-slate-500 mb-2">Items</div>
                  {Object.entries(selectedItems)
                    .filter(([_, qty]) => qty > 0)
                    .map(([itemId, qty]) => {
                      const item = stock.find((s) => s.itemId === itemId);
                      return (
                        <div key={itemId} className="flex justify-between py-2">
                          <span className="font-medium">{item?.item?.name}</span>
                          <span className="text-slate-600">
                            {qty} {item?.item?.unit}
                          </span>
                        </div>
                      );
                    })}
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <div className="text-xs text-slate-500 mb-1">Location</div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    <span className="font-medium">
                      {selectedArea}, {selectedCity}, {selectedState} - {pinCode}
                    </span>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <div className="text-xs text-slate-500 mb-1">Beneficiaries</div>
                  <div className="font-medium text-slate-900">{beneficiaryCount} people</div>
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
          else if (step === 5) handleSubmit();
        }}
        disabled={
          (step === 1 && !canProceed1) ||
          (step === 2 && !canProceed2) ||
          (step === 3 && !canProceed3) ||
          (step === 4 && !canProceed4) ||
          loading
        }
        loading={loading}
        variant={step === 5 ? 'success' : 'primary'}
      >
        {step === 5 ? (
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
