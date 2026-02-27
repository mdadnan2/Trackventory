'use client';

import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/useIsMobile';
import MobileDistribute from '@/components/mobile-volunteer/mobile-pages/distribute';
import { useEffect, useState } from 'react';
import { distributionAPI, itemsAPI, campaignsAPI, stockAPI, usersAPI, packagesAPI } from '@/services/api';
import { Item, Campaign, User, Package as PackageType } from '@/types';
import { TrendingUp, MapPin, Package, AlertTriangle, Plus, Minus, X, ShoppingCart } from 'lucide-react';
import PageHeader from '@/components/ui/page-header';
import Card from '@/components/ui/card';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import Tabs from '@/components/ui/tabs';
import { ToastContainer } from '@/components/ui/toast';
import { Combobox } from '@/components/ui/combobox';
import { State, City } from 'country-state-city';

type CartItem = {
  id: string;
  type: 'item' | 'package';
  referenceId: string;
  name: string;
  quantity: number | '';
  items?: Array<{ itemId: string; quantity: number; name: string }>;
};

export default function DistributionPage() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [items, setItems] = useState<Item[]>([]);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState<string>('');
  const [myStock, setMyStock] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'distribute' | 'damage'>('distribute');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  
  const [formData, setFormData] = useState({
    state: '',
    city: '',
    pinCode: '',
    area: '',
    campaignId: ''
  });

  useEffect(() => {
    loadData();
    loadStates();
  }, [user]);

  useEffect(() => {
    if (formData.state) {
      loadCities(formData.state);
    } else {
      setCities([]);
      setFormData(prev => ({ ...prev, city: '' }));
    }
  }, [formData.state]);

  useEffect(() => {
    if (selectedVolunteer) {
      loadVolunteerStock(selectedVolunteer);
    } else if (user?.role === 'VOLUNTEER') {
      setSelectedVolunteer(user._id);
    } else if (user?.role === 'ADMIN' && user._id) {
      setSelectedVolunteer(user._id);
    }
    setCart([]);
  }, [selectedVolunteer, user]);

  const loadData = async () => {
    try {
      const [itemsRes, packagesRes, campaignsRes, usersRes] = await Promise.all([
        itemsAPI.getAll(1, 100),
        packagesAPI.getAll(1, 100),
        campaignsAPI.getAll(1, 100),
        user?.role === 'ADMIN' ? usersAPI.getAll(1, 100) : Promise.resolve({ data: { data: { users: [] } } })
      ]);
      
      setItems(itemsRes.data.data.data || []);
      setPackages(packagesRes.data.data.data || []);
      setCampaigns((campaignsRes.data.data.data || []).filter((c: Campaign) => c.status === 'ACTIVE'));
      
      if (user?.role === 'ADMIN') {
        setVolunteers((usersRes.data.data.data || []).filter((u: User) => u.role === 'VOLUNTEER' || u.role === 'ADMIN'));
      } else if (user) {
        setSelectedVolunteer(user._id);
        loadVolunteerStock(user._id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadStates = () => {
    const indianStates = State.getStatesOfCountry('IN');
    setStates(indianStates.map(s => s.name));
  };

  const loadCities = (stateName: string) => {
    const indianStates = State.getStatesOfCountry('IN');
    const selectedState = indianStates.find(s => s.name === stateName);
    if (selectedState) {
      const stateCities = City.getCitiesOfState('IN', selectedState.isoCode);
      setCities(stateCities.map(c => c.name));
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

  const loadCentralStock = async () => {
    try {
      const stockRes = await stockAPI.getCentralStock();
      setMyStock(stockRes.data.data);
    } catch (error) {
      console.error('Error loading central stock:', error);
    }
  };

  const calculateStockImpact = () => {
    const impact: Record<string, number> = {};
    cart.forEach(entry => {
      if (typeof entry.quantity !== 'number') return; // Skip empty quantities
      if (entry.type === 'item') {
        impact[entry.referenceId] = (impact[entry.referenceId] || 0) + entry.quantity;
      } else {
        entry.items?.forEach(pkgItem => {
          impact[pkgItem.itemId] = (impact[pkgItem.itemId] || 0) + (pkgItem.quantity * entry.quantity);
        });
      }
    });
    return impact;
  };

  const getRemainingStock = (itemId: string) => {
    const impact = calculateStockImpact();
    const stock = myStock.find(s => s.itemId === itemId);
    return (stock?.stock || 0) - (impact[itemId] || 0);
  };

  const getMaxPackageQuantity = (packageId: string) => {
    const pkg = packages.find(p => p._id === packageId);
    if (!pkg) return 0;
    
    const impact = calculateStockImpact();
    const maxPackages = pkg.items.map(pkgItem => {
      const itemId = typeof pkgItem.itemId === 'string' ? pkgItem.itemId : pkgItem.itemId._id;
      const stock = myStock.find(s => s.itemId === itemId);
      const available = (stock?.stock || 0) - (impact[itemId] || 0);
      return Math.floor(available / pkgItem.quantity);
    });
    
    return Math.min(...maxPackages, 999);
  };

  const canAddToCart = (type: 'item' | 'package', id: string, qty: number) => {
    if (type === 'item') {
      const remaining = getRemainingStock(id);
      return remaining >= qty;
    } else {
      const maxQty = getMaxPackageQuantity(id);
      return maxQty >= qty;
    }
  };

  const addToCart = () => {
    if (!selectedOption || !quantity || quantity <= 0) return;
    
    const [type, id] = selectedOption.split('_');
    
    if (!canAddToCart(type as 'item' | 'package', id, quantity)) {
      setToast({ message: 'Insufficient stock!', type: 'error' });
      return;
    }
    
    // Check if item/package already exists in cart
    const existingIndex = cart.findIndex(c => 
      c.type === type && c.referenceId === id
    );
    
    if (existingIndex !== -1) {
      // Item exists - update quantity
      const newQuantity = cart[existingIndex].quantity + quantity;
      
      // Validate new total quantity
      if (!canAddToCart(type as 'item' | 'package', id, newQuantity - cart[existingIndex].quantity)) {
        setToast({ message: 'Insufficient stock for total quantity!', type: 'error' });
        return;
      }
      
      // Update existing item
      const updatedCart = [...cart];
      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        quantity: newQuantity
      };
      
      // Update package items if it's a package
      if (type === 'package' && updatedCart[existingIndex].items) {
        updatedCart[existingIndex].items = updatedCart[existingIndex].items!.map(item => ({
          ...item,
          // Keep original quantity per package, display will multiply by newQuantity
        }));
      }
      
      setCart(updatedCart);
      setToast({ message: `Updated ${cart[existingIndex].name} quantity to ${newQuantity}`, type: 'success' });
    } else {
      // Item doesn't exist - add new
      if (type === 'item') {
        const item = items.find(i => i._id === id);
        if (!item) return;
        
        setCart([...cart, {
          id: `${type}_${id}_${Date.now()}`,
          type: 'item',
          referenceId: id,
          name: item.name,
          quantity: quantity as number
        }]);
      } else {
        const pkg = packages.find(p => p._id === id);
        if (!pkg) return;
        
        setCart([...cart, {
          id: `${type}_${id}_${Date.now()}`,
          type: 'package',
          referenceId: id,
          name: pkg.name,
          quantity: quantity as number,
          items: pkg.items.map(i => ({
            itemId: typeof i.itemId === 'string' ? i.itemId : i.itemId._id,
            quantity: i.quantity,
            name: typeof i.itemId === 'string' ? items.find(item => item._id === i.itemId)?.name || '' : i.itemId.name
          }))
        }]);
      }
      setToast({ message: 'Added to cart', type: 'success' });
    }
    
    setSelectedOption('');
    setQuantity('');
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateCartQuantity = (id: string, newQuantity: number | '') => {
    if (newQuantity === '') {
      // Allow empty quantity
      setCart(cart.map(c => c.id === id ? { ...c, quantity: '' } : c));
      return;
    }

    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    const cartItem = cart.find(c => c.id === id);
    if (!cartItem) return;

    // Calculate impact without this item
    const otherItems = cart.filter(c => c.id !== id);
    const otherImpact: Record<string, number> = {};
    otherItems.forEach(entry => {
      if (entry.type === 'item' && typeof entry.quantity === 'number') {
        otherImpact[entry.referenceId] = (otherImpact[entry.referenceId] || 0) + entry.quantity;
      } else if (entry.type === 'package' && typeof entry.quantity === 'number') {
        entry.items?.forEach(pkgItem => {
          otherImpact[pkgItem.itemId] = (otherImpact[pkgItem.itemId] || 0) + (pkgItem.quantity * entry.quantity);
        });
      }
    });

    // Check if new quantity is valid
    if (cartItem.type === 'item') {
      const stock = myStock.find(s => s.itemId === cartItem.referenceId);
      const available = (stock?.stock || 0) - (otherImpact[cartItem.referenceId] || 0);
      if (newQuantity > available) {
        setToast({ message: `Only ${available} available!`, type: 'error' });
        return;
      }
    } else {
      // Package - check all items
      const pkg = packages.find(p => p._id === cartItem.referenceId);
      if (!pkg) return;

      for (const pkgItem of pkg.items) {
        const itemId = typeof pkgItem.itemId === 'string' ? pkgItem.itemId : pkgItem.itemId._id;
        const stock = myStock.find(s => s.itemId === itemId);
        const available = (stock?.stock || 0) - (otherImpact[itemId] || 0);
        const required = pkgItem.quantity * newQuantity;
        
        if (required > available) {
          const item = items.find(i => i._id === itemId);
          setToast({ message: `Insufficient ${item?.name}. Max ${Math.floor(available / pkgItem.quantity)} packages`, type: 'error' });
          return;
        }
      }
    }

    // Update quantity
    setCart(cart.map(c => c.id === id ? { ...c, quantity: newQuantity } : c));
  };

  const handleDistribute = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      setToast({ message: 'Please add items or packages to distribute', type: 'error' });
      return;
    }
    
    if (!selectedVolunteer) {
      setToast({ message: 'Please select a volunteer', type: 'error' });
      return;
    }
    
    try {
      const volunteerId = user?.role === 'ADMIN' ? selectedVolunteer : user?._id;
      const requestId = `${volunteerId}-${Date.now()}`;
      
      const distributionItems = cart
        .filter(c => c.type === 'item')
        .map(c => ({ itemId: c.referenceId, quantity: c.quantity }));
      
      const distributionPackages = cart
        .filter(c => c.type === 'package')
        .map(c => ({ packageId: c.referenceId, quantity: c.quantity }));
      
      const payload: any = { 
        ...formData, 
        items: distributionItems,
        packages: distributionPackages,
        requestId,
        volunteerId
      };
      
      await distributionAPI.create(payload);
      setToast({ message: 'Distribution recorded successfully!', type: 'success' });
      setFormData({ state: '', city: '', pinCode: '', area: '', campaignId: '' });
      setCart([]);
      
      loadVolunteerStock(volunteerId);
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || 'Error recording distribution', type: 'error' });
    }
  };

  const handleDamage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      setToast({ message: 'Please add items to report damage', type: 'error' });
      return;
    }
    
    if (!selectedVolunteer) {
      setToast({ message: 'Please select a volunteer', type: 'error' });
      return;
    }
    
    try {
      const volunteerId = user?.role === 'ADMIN' ? selectedVolunteer : user?._id;
      const requestId = `damage-${volunteerId}-${Date.now()}`;
      
      const damageItems = cart
        .filter(c => c.type === 'item')
        .map(c => ({ itemId: c.referenceId, quantity: c.quantity }));
      
      const payload: any = { items: damageItems, requestId, volunteerId };
      
      await distributionAPI.reportDamage(payload);
      setToast({ message: 'Damage reported successfully!', type: 'success' });
      setCart([]);
      
      loadVolunteerStock(volunteerId);
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || 'Error reporting damage', type: 'error' });
    }
  };

  const getDropdownOptions = () => {
    const packageOptions = packages
      .filter(pkg => pkg.isActive)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(pkg => {
        const maxQty = getMaxPackageQuantity(pkg._id);
        const inCart = cart.some(c => c.type === 'package' && c.referenceId === pkg._id);
        return {
          value: `package_${pkg._id}`,
          label: `📦 ${pkg.name} (${maxQty} available)`,
          disabled: maxQty === 0 || inCart
        };
      });
    
    const itemOptions = items
      .filter(item => item.isActive)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(item => {
        const remaining = getRemainingStock(item._id);
        const inCart = cart.some(c => c.type === 'item' && c.referenceId === item._id);
        return {
          value: `item_${item._id}`,
          label: `📋 ${item.name} (${remaining} ${item.unit} available)`,
          disabled: remaining === 0 || inCart
        };
      });
    
    return [...packageOptions, ...itemOptions];
  };

  if (isMobile && user?.role === 'VOLUNTEER') {
    return <MobileDistribute />;
  }

  return (
    <>
      <ToastContainer toast={toast} onClose={() => setToast(null)} />
      <div className="space-y-6">
      <PageHeader title="Distribution" description="Record distributions and report damaged items" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card padding="none">
            <Tabs
              tabs={[
                { id: 'distribute', label: 'Record Distribution' },
                { id: 'damage', label: 'Report Damage' }
              ]}
              activeTab={activeTab}
              onChange={(id) => {
                setActiveTab(id as 'distribute' | 'damage');
                setCart([]);
                setSelectedOption('');
                setQuantity('');
              }}
            />

            <div className="p-6">
              {activeTab === 'distribute' && (
                <form onSubmit={handleDistribute} className="space-y-6">
                  {user?.role === 'ADMIN' && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Volunteer</label>
                      <Combobox
                        options={volunteers.sort((a, b) => a.name.localeCompare(b.name)).map((v) => ({ value: v._id, label: `${v.name}${v.role === 'ADMIN' ? ' (Admin)' : ''}` }))}
                        value={selectedVolunteer}
                        onChange={(value) => setSelectedVolunteer(value)}
                        placeholder="Select Volunteer"
                      />
                    </div>
                  )}

                  {/* Cart Display */}
                  {cart.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      {/* Cart Header */}
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white">
                          <ShoppingCart size={18} className="animate-pulse" />
                          <h3 className="font-semibold text-sm">Distribution Cart</h3>
                        </div>
                        <span className="bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-xs font-medium text-white">
                          {cart.length} {cart.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                      
                      {/* Cart Items */}
                      <div className="divide-y divide-slate-100">
                        {cart.map(item => (
                          <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors group">
                            <div className="flex items-start gap-3">
                              {/* Icon */}
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                                item.type === 'package' 
                                  ? 'bg-gradient-to-br from-purple-100 to-pink-100' 
                                  : 'bg-gradient-to-br from-blue-100 to-cyan-100'
                              }`}>
                                {item.type === 'package' ? '📦' : '📋'}
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <h4 className="font-medium text-slate-900 text-sm truncate">{item.name}</h4>
                                  <button
                                    type="button"
                                    onClick={() => removeFromCart(item.id)}
                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-lg transition-all"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                                
                                {/* Package Items */}
                                {item.type === 'package' && item.items && (
                                  <div className="flex flex-wrap gap-1.5 mb-2">
                                    {item.items.map((pkgItem, idx) => (
                                      <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md text-xs text-slate-600">
                                        {pkgItem.name} ×{pkgItem.quantity * item.quantity}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                
                                {/* Quantity Input */}
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-500 font-medium">Qty:</span>
                                  <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === '') {
                                        updateCartQuantity(item.id, '');
                                        return;
                                      }
                                      const num = parseInt(val);
                                      if (num > 0) updateCartQuantity(item.id, num);
                                    }}
                                    className="w-20 px-2.5 py-1 text-sm font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    min="1"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Stock Impact */}
                      <div className="bg-slate-50 px-5 py-4 border-t border-slate-200">
                        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Stock Impact</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(calculateStockImpact()).map(([itemId, qty]) => {
                            const item = items.find(i => i._id === itemId);
                            const remaining = getRemainingStock(itemId);
                            const percentUsed = ((qty / ((myStock.find(s => s.itemId === itemId)?.stock || 0) || 1)) * 100);
                            return (
                              <div key={itemId} className={`px-3 py-2 rounded-lg text-xs ${
                                remaining < 0 ? 'bg-rose-100 text-rose-700 border border-rose-200' : 
                                percentUsed > 80 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                                'bg-blue-100 text-blue-700 border border-blue-200'
                              }`}>
                                <div className="font-semibold truncate">{item?.name}</div>
                                <div className="flex items-center justify-between mt-0.5">
                                  <span>-{qty}</span>
                                  <span className="font-bold">{remaining} left</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Add to Cart Section */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <h3 className="font-semibold text-slate-900 text-sm mb-4 flex items-center gap-2">
                      <Plus size={16} className="text-blue-600" />
                      Add Items or Packages
                    </h3>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Combobox
                          options={getDropdownOptions()}
                          value={selectedOption}
                          onChange={(value) => setSelectedOption(value)}
                          placeholder="Select item or package..."
                        />
                      </div>
                      <input
                        type="number"
                        className="w-20 px-3 py-2.5 text-sm text-center font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                        onFocus={(e) => e.target.select()}
                        min="1"
                        placeholder="Qty"
                      />
                      <button
                        type="button"
                        onClick={addToCart}
                        disabled={!selectedOption || !quantity}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">State *</label>
                      <Combobox
                        options={states.map(state => ({ value: state, label: state }))}
                        value={formData.state}
                        onChange={(value) => setFormData({ ...formData, state: value })}
                        placeholder="Select State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">City *</label>
                      <Combobox
                        options={cities.map(city => ({ value: city, label: city }))}
                        value={formData.city}
                        onChange={(value) => setFormData({ ...formData, city: value })}
                        placeholder="Select City"
                        disabled={!formData.state}
                      />
                    </div>
                    <Input label="Pin Code" value={formData.pinCode} onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })} required />
                    <Input label="Area" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} required />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Campaign (Optional)</label>
                      <Combobox
                        options={[{ value: '', label: 'No Campaign' }, ...campaigns.sort((a, b) => a.name.localeCompare(b.name)).map((c) => ({ value: c._id, label: c.name }))]}
                        value={formData.campaignId}
                        onChange={(value) => setFormData({ ...formData, campaignId: value })}
                        placeholder="Select Campaign"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={cart.length === 0}>
                      Record Distribution ({cart.length} items)
                    </Button>
                  </div>
                </form>
              )}

              {activeTab === 'damage' && (
                <form onSubmit={handleDamage} className="space-y-6">
                  {user?.role === 'ADMIN' && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Volunteer</label>
                      <Combobox
                        options={volunteers.sort((a, b) => a.name.localeCompare(b.name)).map((v) => ({ value: v._id, label: `${v.name}${v.role === 'ADMIN' ? ' (Admin)' : ''}` }))}
                        value={selectedVolunteer}
                        onChange={(value) => setSelectedVolunteer(value)}
                        placeholder="Select Volunteer"
                      />
                    </div>
                  )}

                  {/* Cart Display for Damage */}
                  {cart.length > 0 && (
                    <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
                      {/* Cart Header */}
                      <div className="bg-gradient-to-r from-red-500 to-orange-600 px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white">
                          <AlertTriangle size={18} className="animate-pulse" />
                          <h3 className="font-semibold text-sm">Damaged Items</h3>
                        </div>
                        <span className="bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-xs font-medium text-white">
                          {cart.length} {cart.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                      
                      {/* Cart Items */}
                      <div className="divide-y divide-slate-100">
                        {cart.map(item => (
                          <div key={item.id} className="p-4 hover:bg-red-50/50 transition-colors group">
                            <div className="flex items-center gap-3">
                              {/* Icon */}
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center text-xl shrink-0">
                                📋
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 flex items-center justify-between gap-3">
                                <h4 className="font-medium text-slate-900 text-sm">{item.name}</h4>
                                
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-500 font-medium">Qty:</span>
                                  <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === '') {
                                        updateCartQuantity(item.id, '');
                                        return;
                                      }
                                      const num = parseInt(val);
                                      if (num > 0) updateCartQuantity(item.id, num);
                                    }}
                                    className="w-20 px-2.5 py-1 text-sm font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    min="1"
                                  />
                                  
                                  <button
                                    type="button"
                                    onClick={() => removeFromCart(item.id)}
                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-lg transition-all"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add to Cart Section */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <h3 className="font-semibold text-slate-900 text-sm mb-4 flex items-center gap-2">
                      <Plus size={16} className="text-red-600" />
                      Add Damaged Items
                    </h3>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Combobox
                          options={items.filter(item => item.isActive).sort((a, b) => a.name.localeCompare(b.name)).map(item => {
                            const remaining = getRemainingStock(item._id);
                            return {
                              value: `item_${item._id}`,
                              label: `📋 ${item.name} (${remaining} ${item.unit} available)`,
                              disabled: remaining === 0
                            };
                          })}
                          value={selectedOption}
                          onChange={(value) => setSelectedOption(value)}
                          placeholder="Select item..."
                        />
                      </div>
                      <input
                        type="number"
                        className="w-20 px-3 py-2.5 text-sm text-center font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                        onFocus={(e) => e.target.select()}
                        min="1"
                        placeholder="Qty"
                      />
                      <button
                        type="button"
                        onClick={addToCart}
                        disabled={!selectedOption || !quantity}
                        className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-orange-600 text-white text-sm font-medium rounded-xl hover:from-red-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" variant="danger" disabled={cart.length === 0}>
                      Report Damage ({cart.length} items)
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Package size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">
              {selectedVolunteer ? 'Volunteer Stock' : 'Central Stock'}
            </h2>
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
        </Card>
      </div>
    </div>
    </>
  );
}
