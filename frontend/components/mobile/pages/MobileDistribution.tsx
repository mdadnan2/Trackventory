'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { stockAPI, distributionAPI, citiesAPI } from '@/services/api';
import MobilePageContainer from '../MobilePageContainer';
import MobileCard from '../MobileCard';
import MobileQuantityInput from '../MobileQuantityInput';
import MobileStickyCTA from '../MobileStickyCTA';
import { CheckCircle, MapPin, Package } from 'lucide-react';

export default function MobileDistribution() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [volunteerStock, setVolunteerStock] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      if (user?._id) {
        const [stockRes, citiesRes] = await Promise.all([
          stockAPI.getVolunteerStock(user._id),
          citiesAPI.getAll(),
        ]);
        setVolunteerStock(stockRes.data.data || []);
        setCities(citiesRes.data.data?.data || citiesRes.data.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleItemQuantityChange = (itemId: string, quantity: number) => {
    setSelectedItems((prev) => ({ ...prev, [itemId]: quantity }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const items = Object.entries(selectedItems)
        .filter(([_, qty]) => qty > 0)
        .map(([itemId, quantity]) => ({ itemId, quantity }));

      await distributionAPI.create({
        items,
        cityId: selectedCity,
        area: selectedArea,
      });

      setSelectedItems({});
      setSelectedCity('');
      setSelectedArea('');
      setStep(1);
      await loadData();
    } catch (error) {
      console.error('Error creating distribution:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedCity_obj = Array.isArray(cities) ? cities.find((c) => c._id === selectedCity) : null;
  const canProceedStep1 = Object.values(selectedItems).some((qty) => qty > 0);
  const canProceedStep2 = selectedCity && selectedArea;

  return (
    <MobilePageContainer
      title="Distribution"
      subtitle={`Step ${step} of 3`}
      showBack={step > 1}
    >
      <div className="space-y-4 pb-24">
        {step === 1 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div className="text-sm font-semibold text-slate-900">Select Items</div>
            </div>
            {volunteerStock.map((item) => (
              <MobileCard key={item.itemId}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{item.item?.name}</div>
                      <div className="text-xs text-slate-500">
                        Available: {item.stock} {item.item?.unit}
                      </div>
                    </div>
                    <Package className="text-blue-600" size={20} />
                  </div>
                  <MobileQuantityInput
                    value={selectedItems[item.itemId] || 0}
                    onChange={(qty) => handleItemQuantityChange(item.itemId, qty)}
                    max={item.stock}
                  />
                </div>
              </MobileCard>
            ))}
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div className="text-sm font-semibold text-slate-900">Select Location</div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setSelectedArea('');
                  }}
                  className="w-full h-14 px-4 border-2 border-slate-200 rounded-xl text-base"
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city._id} value={city._id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedCity && selectedCity_obj && (
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Area</label>
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full h-14 px-4 border-2 border-slate-200 rounded-xl text-base"
                  >
                    <option value="">Select Area</option>
                    {selectedCity_obj.areas?.map((area: string) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div className="text-sm font-semibold text-slate-900">Confirm</div>
            </div>
            <MobileCard>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-500 mb-2">Items</div>
                  {Object.entries(selectedItems)
                    .filter(([_, qty]) => qty > 0)
                    .map(([itemId, qty]) => {
                      const item = volunteerStock.find((s) => s.itemId === itemId);
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
                  <div className="text-xs text-slate-500 mb-2">Location</div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    <span className="font-medium">
                      {selectedArea}, {selectedCity_obj?.name}
                    </span>
                  </div>
                </div>
              </div>
            </MobileCard>
          </>
        )}
      </div>

      <MobileStickyCTA
        onClick={() => {
          if (step === 1 && canProceedStep1) setStep(2);
          else if (step === 2 && canProceedStep2) setStep(3);
          else if (step === 3) handleSubmit();
        }}
        disabled={
          (step === 1 && !canProceedStep1) ||
          (step === 2 && !canProceedStep2) ||
          loading
        }
        loading={loading}
      >
        {step === 3 ? (
          <span className="flex items-center justify-center gap-2">
            <CheckCircle size={20} />
            Confirm Distribution
          </span>
        ) : (
          'Continue'
        )}
      </MobileStickyCTA>
    </MobilePageContainer>
  );
}
