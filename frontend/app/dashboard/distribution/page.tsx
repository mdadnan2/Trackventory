'use client';

import { useEffect, useState } from 'react';
import { distributionAPI, itemsAPI, citiesAPI, campaignsAPI, stockAPI, usersAPI } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Item, City, Campaign, User } from '@/types';
import { TrendingUp, MapPin, Package, AlertTriangle, Plus, Minus } from 'lucide-react';
import PageHeader from '@/components/ui/page-header';
import ContentCard from '@/components/ui/content-card';
import FormSection from '@/components/ui/form-section';
import FormField from '@/components/ui/form-field';
import Button from '@/components/ui/button';
import { ToastContainer } from '@/components/ui/toast';

export default function DistributionPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState<string>('');
  const [myStock, setMyStock] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'distribute' | 'damage'>('distribute');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  
  const [formData, setFormData] = useState({
    cityId: '',
    area: '',
    campaignId: '',
    items: [{ itemId: '', quantity: 0 }]
  });

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    if (selectedVolunteer) {
      loadVolunteerStock(selectedVolunteer);
    } else if (user?.role === 'VOLUNTEER') {
      setSelectedVolunteer(user._id);
    }
  }, [selectedVolunteer, user]);

  const loadData = async () => {
    try {
      const [itemsRes, citiesRes, campaignsRes, usersRes] = await Promise.all([
        itemsAPI.getAll(1, 100),
        citiesAPI.getAll(1, 100),
        campaignsAPI.getAll(1, 100),
        user?.role === 'ADMIN' ? usersAPI.getAll(1, 100) : Promise.resolve({ data: { data: { users: [] } } })
      ]);
      
      setItems(itemsRes.data.data.data || []);
      setCities(citiesRes.data.data.data || []);
      setCampaigns((campaignsRes.data.data.data || []).filter((c: Campaign) => c.status === 'ACTIVE'));
      
      if (user?.role === 'ADMIN') {
        setVolunteers((usersRes.data.data.data || []).filter((u: User) => u.role === 'VOLUNTEER'));
      } else if (user) {
        setSelectedVolunteer(user._id);
        loadVolunteerStock(user._id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadVolunteerStock = async (volunteerId: string) => {
    try {
      const stockRes = await stockAPI.getVolunteerStock(volunteerId);
      setMyStock(stockRes.data.data);
    } catch (error) {
      console.error('Error loading stock:', error);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { itemId: '', quantity: 0 }]
    });
  };

  const updateItem = (index: number, field: 'itemId' | 'quantity', value: any) => {
    const updated = [...formData.items];
    updated[index][field] = value;
    setFormData({ ...formData, items: updated });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const handleDistribute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const volunteerId = user?.role === 'ADMIN' ? selectedVolunteer : user?._id;
      const requestId = `${volunteerId}-${Date.now()}`;
      await distributionAPI.create({ ...formData, requestId });
      setToast({ message: 'Distribution recorded successfully!', type: 'success' });
      setFormData({ cityId: '', area: '', campaignId: '', items: [{ itemId: '', quantity: 0 }] });
      loadVolunteerStock(volunteerId!);
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || 'Error recording distribution', type: 'error' });
    }
  };

  const handleDamage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const volunteerId = user?.role === 'ADMIN' ? selectedVolunteer : user?._id;
      const requestId = `damage-${volunteerId}-${Date.now()}`;
      await distributionAPI.reportDamage({ items: formData.items, requestId });
      setToast({ message: 'Damage reported successfully!', type: 'success' });
      setFormData({ cityId: '', area: '', campaignId: '', items: [{ itemId: '', quantity: 0 }] });
      loadVolunteerStock(volunteerId!);
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || 'Error reporting damage', type: 'error' });
    }
  };

  const getAvailableStock = (itemId: string) => {
    if (!itemId) return 0;
    const stock = myStock.find(s => s.itemId === itemId);
    return stock?.stock || 0;
  };

  return (
    <>
      <ToastContainer toast={toast} onClose={() => setToast(null)} />
      <div className="space-y-6">
      <PageHeader
        title="Distribution"
        description="Record distributions and report damages"
        icon={TrendingUp}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ContentCard>
            <div className="border-b border-slate-200">
              <div className="flex gap-1 p-2">
                <button
                  onClick={() => setActiveTab('distribute')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'distribute'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <TrendingUp size={18} />
                  Record Distribution
                </button>
                <button
                  onClick={() => setActiveTab('damage')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'damage'
                      ? 'bg-red-50 text-red-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <AlertTriangle size={18} />
                  Report Damage
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'distribute' && (
                <form onSubmit={handleDistribute} className="space-y-6">
                  {user?.role === 'ADMIN' && (
                    <FormSection title="Volunteer" description="Select volunteer recording this distribution">
                      <FormField label="Select Volunteer" required fullWidth>
                        <select
                          className="input"
                          value={selectedVolunteer}
                          onChange={(e) => setSelectedVolunteer(e.target.value)}
                          required
                        >
                          <option value="">Choose a volunteer...</option>
                          {volunteers.map((v) => (
                            <option key={v._id} value={v._id}>
                              {v.name} ({v.email})
                            </option>
                          ))}
                        </select>
                      </FormField>
                    </FormSection>
                  )}

                  <FormSection title="Location Details" description="Where is the distribution happening?">
                    <FormField label="City" required>
                      <select
                        className="input"
                        value={formData.cityId}
                        onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                        required
                      >
                        <option value="">Select City</option>
                        {cities.map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </FormField>

                    <FormField label="Area" required>
                      <input
                        type="text"
                        className="input"
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        placeholder="Enter area name"
                        required
                      />
                    </FormField>

                    <FormField label="Campaign" helper="Optional" fullWidth>
                      <select
                        className="input"
                        value={formData.campaignId}
                        onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
                      >
                        <option value="">No Campaign</option>
                        {campaigns.map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </FormField>
                  </FormSection>

                  <FormSection title="Items Distributed" description="What items are being distributed?">
                    {formData.items.map((item, index) => {
                      const availableStock = getAvailableStock(item.itemId);
                      return (
                      <div key={index} className="md:col-span-2 flex gap-4">
                        <FormField label="Item" required fullWidth>
                          <select
                            className="input"
                            value={item.itemId}
                            onChange={(e) => updateItem(index, 'itemId', e.target.value)}
                            required
                          >
                            <option value="">Select Item</option>
                            {items.map((i) => (
                              <option key={i._id} value={i._id}>
                                {i.name} (Available: {getAvailableStock(i._id)})
                              </option>
                            ))}
                          </select>
                        </FormField>
                        <FormField label="Quantity" required>
                          <input
                            type="number"
                            className="input"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                            min="0"
                            max={availableStock > 0 ? availableStock : undefined}
                            required
                          />
                        </FormField>
                        {formData.items.length > 1 && (
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="danger"
                              icon={Minus}
                              onClick={() => removeItem(index)}
                            />
                          </div>
                        )}
                      </div>
                    )})}
                  </FormSection>

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="secondary" icon={Plus} onClick={addItem}>
                      Add Item
                    </Button>
                    <Button type="submit">Record Distribution</Button>
                  </div>
                </form>
              )}

              {activeTab === 'damage' && (
                <form onSubmit={handleDamage} className="space-y-6">
                  {user?.role === 'ADMIN' && (
                    <FormSection title="Volunteer" description="Select volunteer reporting this damage">
                      <FormField label="Select Volunteer" required fullWidth>
                        <select
                          className="input"
                          value={selectedVolunteer}
                          onChange={(e) => setSelectedVolunteer(e.target.value)}
                          required
                        >
                          <option value="">Choose a volunteer...</option>
                          {volunteers.map((v) => (
                            <option key={v._id} value={v._id}>
                              {v.name} ({v.email})
                            </option>
                          ))}
                        </select>
                      </FormField>
                    </FormSection>
                  )}

                  <FormSection title="Damaged Items" description="Report items that are damaged or unusable">
                    {formData.items.map((item, index) => {
                      const availableStock = getAvailableStock(item.itemId);
                      return (
                      <div key={index} className="md:col-span-2 flex gap-4">
                        <FormField label="Item" required fullWidth>
                          <select
                            className="input"
                            value={item.itemId}
                            onChange={(e) => updateItem(index, 'itemId', e.target.value)}
                            required
                          >
                            <option value="">Select Item</option>
                            {items.map((i) => (
                              <option key={i._id} value={i._id}>
                                {i.name} (Available: {getAvailableStock(i._id)})
                              </option>
                            ))}
                          </select>
                        </FormField>
                        <FormField label="Quantity" required>
                          <input
                            type="number"
                            className="input"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                            min="0"
                            max={availableStock > 0 ? availableStock : undefined}
                            required
                          />
                        </FormField>
                        {formData.items.length > 1 && (
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="danger"
                              icon={Minus}
                              onClick={() => removeItem(index)}
                            />
                          </div>
                        )}
                      </div>
                    )})}
                  </FormSection>

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="secondary" icon={Plus} onClick={addItem}>
                      Add Item
                    </Button>
                    <Button type="submit" variant="danger">Report Damage</Button>
                  </div>
                </form>
              )}
            </div>
          </ContentCard>
        </div>

        <ContentCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">My Stock</h2>
          </div>
          <div className="space-y-2">
            {myStock.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No stock assigned</p>
            ) : (
              myStock.map((item) => (
                <div key={item.itemId} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">{item.item?.name}</span>
                  <span className="text-sm font-bold text-slate-900">{item.stock}</span>
                </div>
              ))
            )}
          </div>
        </ContentCard>
      </div>
    </div>
    </>
  );
}
