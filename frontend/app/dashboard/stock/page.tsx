'use client';

import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/useIsMobile';
import MobileStock from '@/components/mobile-volunteer/mobile-pages/stock';
import MobileStockAdmin from '@/components/mobile/pages/MobileStockAdmin';
import { useEffect, useState } from 'react';
import { stockAPI, itemsAPI, usersAPI, reportsAPI, packagesAPI } from '@/services/api';
import { Item, User, StockItem, Package as PackageType } from '@/types';
import { Warehouse, Package, TrendingUp, AlertCircle, Plus, Minus, Undo2, Info, ArrowRightLeft, ShoppingCart, X } from 'lucide-react';
import PageHeader from '@/components/ui/page-header';
import ContentCard from '@/components/ui/content-card';
import FormSection from '@/components/ui/form-section';
import FormField from '@/components/ui/form-field';
import Button from '@/components/ui/button';
import { ToastContainer } from '@/components/ui/toast';
import TransferStockModal from '@/components/ui/transfer-stock-modal';
import { Combobox } from '@/components/ui/combobox';
import { motion } from 'framer-motion';
import DataTable from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';

type CartItem = {
  id: string;
  type: 'item' | 'package';
  referenceId: string;
  name: string;
  quantity: number | '';
  items?: Array<{ itemId: string; quantity: number; name: string }>;
};

export default function StockPage() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [items, setItems] = useState<Item[]>([]);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [myStock, setMyStock] = useState<StockItem[]>([]);
  const [centralStock, setCentralStock] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'add' | 'assign' | 'return' | 'transfer'>('add');
  const [stockItems, setStockItems] = useState<Array<{ type: 'item' | 'package'; referenceId: string; quantity: number }>>([{ type: 'item', referenceId: '', quantity: 0 }]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [returnItems, setReturnItems] = useState<Array<{ itemId: string; quantity: number }>>([{ itemId: '', quantity: 0 }]);
  const [returnNotes, setReturnNotes] = useState('');
  const [stockSummary, setStockSummary] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0, pageSize: 5 });
  const [loading, setLoading] = useState(false);
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadData();
      if (user.role === 'ADMIN') {
        loadStockSummary(1);
      }
      loadCentralStock();
    }
  }, [user]);

  const loadCentralStock = async () => {
    try {
      const stockRes = await stockAPI.getCentralStock();
      setCentralStock(stockRes.data.data);
    } catch (error) {
      console.error('Error loading central stock:', error);
    }
  };

  const loadStockSummary = async (page: number) => {
    setLoading(true);
    try {
      const stockRes = await reportsAPI.getStockSummary(page);
      const result = stockRes.data.data;
      setStockSummary(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Error loading stock summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVolunteerStockDetails = async (itemId: string, itemName: string) => {
    try {
      const volunteerRes = await reportsAPI.getVolunteerStock(1, 100);
      const allVolunteers = volunteerRes.data.data.data;
      const volunteerDetails = [];
      
      for (const v of allVolunteers) {
        const itemStock = v.items.find((i: any) => i.item.id === itemId);
        if (itemStock && itemStock.stock > 0) {
          volunteerDetails.push({
            volunteer: v.volunteer.name,
            item: itemStock.item.name,
            quantity: itemStock.stock,
            unit: itemStock.item.unit
          });
        }
      }
      
      setSelectedItemDetails(volunteerDetails);
      setShowVolunteerModal(true);
    } catch (error) {
      console.error('Error loading volunteer details:', error);
    }
  };

  const loadData = async () => {
    try {
      if (user?.role === 'ADMIN') {
        const volunteerId = user._id || user.id;
        const [itemsRes, packagesRes, usersRes, stockRes] = await Promise.all([
          itemsAPI.getAll(1, 100),
          packagesAPI.getAll(1, 100),
          usersAPI.getAll(1, 100),
          stockAPI.getVolunteerStock(volunteerId)
        ]);
        setItems(itemsRes.data.data.data || itemsRes.data.data.items || []);
        setPackages(packagesRes.data.data.data || []);
        const allUsers = usersRes.data.data.data || usersRes.data.data.users || [];
        setVolunteers(allUsers.filter((u: User) => u.role === 'VOLUNTEER' || u.role === 'ADMIN'));
        const stockData = stockRes.data.success ? stockRes.data.data : [];
        setMyStock(stockData);
      } else if (user?.role === 'VOLUNTEER') {
        const volunteerId = user._id || user.id;
        const [stockRes, usersRes, itemsRes, packagesRes, centralStockRes] = await Promise.all([
          stockAPI.getVolunteerStock(volunteerId),
          usersAPI.getAll(1, 100),
          itemsAPI.getAll(1, 100),
          packagesAPI.getAll(1, 100),
          stockAPI.getCentralStock()
        ]);
        const stockData = stockRes.data.success ? stockRes.data.data : [];
        console.log('About to setMyStock with:', stockData);
        setMyStock(stockData);
        console.log('After setMyStock called');
        const allUsers = usersRes.data.data.data || usersRes.data.data.users || [];
        setVolunteers(allUsers.filter((u: User) => u.role === 'VOLUNTEER' || u.role === 'ADMIN'));
        setItems(itemsRes.data.data.data || itemsRes.data.data.items || []);
        setPackages(packagesRes.data.data.data || []);
        setCentralStock(centralStockRes.data.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addStockItem = () => {
    setStockItems([...stockItems, { type: 'item', referenceId: '', quantity: 0 }]);
  };

  const removeStockItem = (index: number) => {
    setStockItems(stockItems.filter((_, i) => i !== index));
  };

  const updateStockItem = (index: number, field: 'type' | 'referenceId' | 'quantity', value: any) => {
    const updated = [...stockItems];
    if (field === 'referenceId') {
      const [type, id] = value.split('_');
      updated[index].type = type as 'item' | 'package';
      updated[index].referenceId = id;
    } else {
      updated[index][field] = value;
    }
    setStockItems(updated);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'bg-red-100 text-red-700 border-red-200', label: 'Empty', icon: '🔴', badge: 'bg-red-500' };
    if (stock < 10) return { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Low Stock', icon: '🟡', badge: 'bg-orange-500' };
    return { color: 'bg-green-100 text-green-700 border-green-200', label: 'Good Stock', icon: '🟢', badge: 'bg-green-500' };
  };

  const calculateStockImpact = () => {
    const impact: Record<string, number> = {};
    cart.forEach(entry => {
      if (typeof entry.quantity !== 'number') return;
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
    const stock = centralStock.find(s => s.itemId === itemId);
    return (stock?.stock || 0) - (impact[itemId] || 0);
  };

  const getMaxPackageQuantity = (packageId: string) => {
    const pkg = packages.find(p => p._id === packageId);
    if (!pkg) return 0;
    
    const impact = calculateStockImpact();
    const maxPackages = pkg.items.map(pkgItem => {
      const itemId = typeof pkgItem.itemId === 'string' ? pkgItem.itemId : pkgItem.itemId._id;
      const stock = centralStock.find(s => s.itemId === itemId);
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
    
    const existingIndex = cart.findIndex(c => c.type === type && c.referenceId === id);
    
    if (existingIndex !== -1) {
      setToast({ message: 'Item already in cart. Update quantity in cart.', type: 'warning' });
      return;
    }
    
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
    setSelectedOption('');
    setQuantity('');
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateCartQuantity = (id: string, newQuantity: number | '') => {
    if (newQuantity === '') {
      setCart(cart.map(c => c.id === id ? { ...c, quantity: '' } : c));
      return;
    }

    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    const cartItem = cart.find(c => c.id === id);
    if (!cartItem) return;

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

    if (cartItem.type === 'item') {
      const stock = centralStock.find(s => s.itemId === cartItem.referenceId);
      const available = (stock?.stock || 0) - (otherImpact[cartItem.referenceId] || 0);
      if (newQuantity > available) {
        setToast({ message: `Only ${available} available!`, type: 'error' });
        return;
      }
    } else {
      const pkg = packages.find(p => p._id === cartItem.referenceId);
      if (!pkg) return;

      for (const pkgItem of pkg.items) {
        const itemId = typeof pkgItem.itemId === 'string' ? pkgItem.itemId : pkgItem.itemId._id;
        const stock = centralStock.find(s => s.itemId === itemId);
        const available = (stock?.stock || 0) - (otherImpact[itemId] || 0);
        const required = pkgItem.quantity * newQuantity;
        
        if (required > available) {
          const item = items.find(i => i._id === itemId);
          setToast({ message: `Insufficient ${item?.name}. Max ${Math.floor(available / pkgItem.quantity)} packages`, type: 'error' });
          return;
        }
      }
    }

    setCart(cart.map(c => c.id === id ? { ...c, quantity: newQuantity } : c));
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
          label: `   ${pkg.name} (${maxQty} available)`,
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
          label: `   ${item.name} (${remaining} ${item.unit} available)`,
          disabled: remaining === 0 || inCart
        };
      });
    
    return [
      { value: 'header_packages', label: '📦 PACKAGES', disabled: true },
      ...packageOptions,
      { value: 'header_items', label: '📋 ITEMS', disabled: true },
      ...itemOptions
    ];
  };

  const totalStock = myStock.reduce((sum, item) => sum + item.stock, 0);
  const lowStockCount = myStock.filter(item => item.stock < 10 && item.stock > 0).length;

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const itemsToAdd = stockItems.filter(s => s.type === 'item').map(s => ({ itemId: s.referenceId, quantity: s.quantity }));
      await stockAPI.addStock({ items: itemsToAdd });
      setToast({ message: 'Stock added successfully!', type: 'success' });
      setStockItems([{ type: 'item', referenceId: '', quantity: 0 }]);
      if (user?.role === 'ADMIN') {
        loadStockSummary(pagination.currentPage);
      }
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || 'Error adding stock', type: 'error' });
    }
  };

  const handleAssignStock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      setToast({ message: 'Please add items or packages to cart', type: 'error' });
      return;
    }
    
    if (!selectedVolunteer) {
      setToast({ message: 'Please select a volunteer', type: 'error' });
      return;
    }
    
    try {
      const itemsToAssign = cart
        .filter(c => c.type === 'item')
        .map(c => ({ itemId: c.referenceId, quantity: c.quantity }));
      const packagesToAssign = cart
        .filter(c => c.type === 'package')
        .map(c => ({ packageId: c.referenceId, quantity: c.quantity }));
      
      if (itemsToAssign.length > 0) {
        await stockAPI.assignStock({ volunteerId: selectedVolunteer, items: itemsToAssign });
      }
      
      if (packagesToAssign.length > 0) {
        for (const pkg of packagesToAssign) {
          await packagesAPI.assign({ ...pkg, volunteerId: selectedVolunteer, requestId: `assign-${Date.now()}` });
        }
      }
      
      setToast({ message: 'Stock assigned successfully!', type: 'success' });
      setCart([]);
      setSelectedVolunteer('');
      setSelectedOption('');
      setQuantity('');
      if (user?.role === 'ADMIN') {
        loadStockSummary(pagination.currentPage);
        loadCentralStock();
      }
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || 'Error assigning stock', type: 'error' });
    }
  };

  const handleReturnStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await stockAPI.returnStock({ volunteerId: user?._id, items: returnItems, notes: returnNotes });
      setToast({ message: 'Stock returned successfully!', type: 'success' });
      setReturnItems([{ itemId: '', quantity: 0 }]);
      setReturnNotes('');
      setStockItems([{ itemId: '', quantity: 0 }]);
      loadData();
      if (user?.role === 'ADMIN') {
        loadStockSummary(pagination.currentPage);
      }
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || 'Error returning stock', type: 'error' });
    }
  };

  if (user?.role === 'ADMIN' && isMobile) {
    return <MobileStockAdmin />;
  }

  if (user?.role === 'VOLUNTEER') {
    console.log('Rendering volunteer view, isMobile:', isMobile, 'myStock:', myStock);
    
    if (isMobile) {
      return <MobileStock />;
    }

    const handleRequestStock = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (cart.length === 0) {
        setToast({ message: 'Please add items or packages to cart', type: 'error' });
        return;
      }
      
      try {
        const itemsToRequest = cart
          .filter(c => c.type === 'item')
          .map(c => ({ itemId: c.referenceId, quantity: c.quantity }));
        const packagesToRequest = cart
          .filter(c => c.type === 'package')
          .map(c => ({ packageId: c.referenceId, quantity: c.quantity }));
        
        if (itemsToRequest.length > 0) {
          await stockAPI.selfAssignStock({ items: itemsToRequest });
        }
        
        if (packagesToRequest.length > 0) {
          for (const pkg of packagesToRequest) {
            await packagesAPI.selfAssign({ ...pkg, requestId: `request-${Date.now()}` });
          }
        }
        
        setToast({ message: 'Stock requested successfully!', type: 'success' });
        setCart([]);
        setSelectedOption('');
        setQuantity('');
        loadData();
        loadCentralStock();
      } catch (error: any) {
        setToast({ message: error.response?.data?.error || 'Error requesting stock', type: 'error' });
      }
    };

    return (
      <>
        <ToastContainer toast={toast} onClose={() => setToast(null)} />
        <div className="space-y-6">
          <ContentCard>
            <div className="border-b border-slate-200">
              <div className="flex gap-1 p-2">
                <button
                  onClick={() => setActiveTab('add')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    activeTab === 'add'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Request Stock
                </button>
                <button
                  onClick={() => setActiveTab('transfer')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    activeTab === 'transfer'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Transfer Stock
                </button>
                <button
                  onClick={() => setActiveTab('return')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    activeTab === 'return'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Return Stock
                </button>
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'add' && (
                <form onSubmit={handleRequestStock} className="space-y-6">
                  <FormSection
                    title="Request Stock from Central Warehouse"
                    description="Request items and packages to be assigned to you from central inventory"
                  >
                    {/* Cart Display */}
                    {cart.length > 0 && (
                      <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-white">
                            <ShoppingCart size={18} className="animate-pulse" />
                            <h3 className="font-semibold text-sm">Request Cart</h3>
                          </div>
                          <span className="bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-xs font-medium text-white">
                            {cart.length} {cart.length === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                        
                        <div className="divide-y divide-slate-100">
                          {cart.map(item => (
                            <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors group">
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                                  item.type === 'package' 
                                    ? 'bg-gradient-to-br from-purple-100 to-pink-100' 
                                    : 'bg-gradient-to-br from-blue-100 to-cyan-100'
                                }`}>
                                  {item.type === 'package' ? '📦' : '📋'}
                                </div>
                                
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
                                  
                                  {item.type === 'package' && item.items && (
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                      {item.items.map((pkgItem, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md text-xs text-slate-600">
                                          {pkgItem.name} ×{pkgItem.quantity * (typeof item.quantity === 'number' ? item.quantity : 0)}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  
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
                        
                        <div className="bg-slate-50 px-5 py-4 border-t border-slate-200">
                          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Stock Impact</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(calculateStockImpact()).map(([itemId, qty]) => {
                              const item = items.find(i => i._id === itemId);
                              const remaining = getRemainingStock(itemId);
                              const centralStockItem = centralStock.find(s => s.itemId === itemId);
                              const totalStock = centralStockItem?.stock || 0;
                              const percentUsed = totalStock > 0 ? ((qty / totalStock) * 100) : 0;
                              return (
                                <div key={itemId} className={`px-3 py-2 rounded-lg text-xs ${
                                  remaining < 0 ? 'bg-rose-100 text-rose-700 border border-rose-200' : 
                                  percentUsed > 80 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                                  'bg-blue-100 text-blue-700 border border-blue-200'
                                }`}>
                                  <div className="font-semibold truncate">{item?.name || 'Unknown'}</div>
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
                    <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
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
                  </FormSection>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={cart.length === 0}>
                      Request Stock ({cart.length} items)
                    </Button>
                  </div>
                </form>
              )}

              {activeTab === 'transfer' && (
                <div className="space-y-6">
                  <FormSection
                    title="Transfer Stock to Another Volunteer"
                    description="Move your assigned items to another volunteer in the field"
                  >
                    {myStock.length === 0 ? (
                      <div className="md:col-span-2 text-center py-12">
                        <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <p className="text-slate-600 font-medium">No stock assigned to you</p>
                        <p className="text-sm text-slate-500 mt-2">Request stock first to transfer items</p>
                      </div>
                    ) : (
                      <div className="md:col-span-2">
                        <Button
                          type="button"
                          variant="primary"
                          icon={ArrowRightLeft}
                          onClick={() => setShowTransferModal(true)}
                          fullWidth
                        >
                          Open Transfer Interface
                        </Button>
                      </div>
                    )}
                  </FormSection>
                </div>
              )}

              {activeTab === 'return' && (
                <form onSubmit={handleReturnStock} className="space-y-6">
                  <FormSection
                    title="Return Stock to Central Warehouse"
                    description="Return your assigned items back to central inventory"
                  >
                    {myStock.length === 0 ? (
                      <div className="md:col-span-2 text-center py-12">
                        <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <p className="text-slate-600 font-medium">No stock assigned to you</p>
                        <p className="text-sm text-slate-500 mt-2">Request stock first to return items</p>
                      </div>
                    ) : (
                      <>
                        {returnItems.map((item, index) => (
                          <div key={index} className="md:col-span-2 flex gap-4">
                            <FormField label="Item" required fullWidth>
                              <Combobox
                                options={myStock.sort((a, b) => a.item.name.localeCompare(b.item.name)).map((s) => ({ value: s.itemId, label: `${s.item.name} (Available: ${s.stock} ${s.item.unit})` }))}
                                value={item.itemId}
                                onChange={(value) => {
                                  const updated = [...returnItems];
                                  updated[index].itemId = value;
                                  setReturnItems(updated);
                                }}
                                placeholder="Select Item"
                              />
                            </FormField>
                            <FormField label="Quantity" required>
                              <input
                                type="number"
                                className="input"
                                value={item.quantity}
                                onChange={(e) => {
                                  const updated = [...returnItems];
                                  updated[index].quantity = parseInt(e.target.value);
                                  setReturnItems(updated);
                                }}
                                min="1"
                                required
                              />
                            </FormField>
                            {returnItems.length > 1 && (
                              <div className="flex items-end">
                                <Button
                                  type="button"
                                  variant="danger"
                                  icon={Minus}
                                  onClick={() => setReturnItems(returnItems.filter((_, i) => i !== index))}
                                />
                              </div>
                            )}
                          </div>
                        ))}

                        <FormField label="Notes (Optional)" fullWidth>
                          <textarea
                            className="input"
                            rows={3}
                            value={returnNotes}
                            onChange={(e) => setReturnNotes(e.target.value)}
                            placeholder="Reason for return..."
                          />
                        </FormField>
                      </>
                    )}
                  </FormSection>

                  {myStock.length > 0 && (
                    <div className="flex justify-between pt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        icon={Plus}
                        onClick={() => setReturnItems([...returnItems, { itemId: '', quantity: 0 }])}
                      >
                        Add Another Item
                      </Button>
                      <Button type="submit" icon={Undo2}>
                        Return Stock
                      </Button>
                    </div>
                  )}
                </form>
              )}
            </div>
          </ContentCard>

          <ContentCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">My Stock</h2>
                  <p className="text-sm text-slate-500 mt-1">Your current inventory status</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm text-slate-500">Total Items</p>
                    <p className="text-2xl font-bold text-slate-900">{myStock.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-500">Total Quantity</p>
                    <p className="text-2xl font-bold text-slate-900">{totalStock}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-500">Low Stock</p>
                    <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
                  </div>
                </div>
              </div>

              {myStock.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="w-20 h-20 mx-auto mb-4 text-slate-300" />
                  <p className="text-lg font-medium text-slate-600">No stock assigned yet</p>
                  <p className="text-sm text-slate-500 mt-2">Request stock from the Request Stock tab</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Item</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Category</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Stock</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Unit</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {myStock.map((stock) => {
                        const status = getStockStatus(stock.stock);
                        return (
                          <tr key={stock.itemId} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm font-medium text-slate-900">{stock.item.name}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{stock.item.category}</td>
                            <td className="px-4 py-3 text-sm font-bold text-slate-900">{stock.stock}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{stock.item.unit}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                {status.icon} {status.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </ContentCard>

          <TransferStockModal
            isOpen={showTransferModal}
            onClose={() => setShowTransferModal(false)}
            currentUser={user}
            volunteers={volunteers}
            myStock={myStock}
            onSuccess={() => {
              setToast({ message: 'Stock transferred successfully!', type: 'success' });
              loadData();
            }}
            onError={(message) => setToast({ message, type: 'error' })}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer toast={toast} onClose={() => setToast(null)} />
      <div className="space-y-6">
      <ContentCard>
        <div className="border-b border-slate-200">
          <div className="flex gap-1 p-2">
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'add'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Add to Central
            </button>
            <button
              onClick={() => setActiveTab('assign')}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'assign'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Assign to Volunteer
            </button>
            <button
              onClick={() => setActiveTab('return')}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'return'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Return Stock
            </button>
            <button
              onClick={() => setActiveTab('transfer')}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === 'transfer'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Transfer Stock
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'add' && (
            <form onSubmit={handleAddStock} className="space-y-6">
              <FormSection
                title="Add Stock to Central Inventory"
                description="Add new items to the central warehouse"
              >
                {stockItems.map((item, index) => (
                  <div key={index} className="md:col-span-2 flex gap-4">
                    <FormField label="Item" required fullWidth>
                      <Combobox
                        options={items?.sort((a, b) => a.name.localeCompare(b.name)).map((i) => ({ value: `item_${i._id}`, label: `${i.name} (${i.unit})` })) || []}
                        value={item.referenceId ? `item_${item.referenceId}` : ''}
                        onChange={(value) => updateStockItem(index, 'referenceId', value)}
                        placeholder="Select Item"
                      />
                    </FormField>
                    <FormField label="Quantity" required>
                      <input
                        type="number"
                        className="input"
                        value={item.quantity}
                        onChange={(e) => updateStockItem(index, 'quantity', parseInt(e.target.value))}
                        min="1"
                        required
                      />
                    </FormField>
                    {stockItems.length > 1 && (
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="danger"
                          icon={Minus}
                          onClick={() => removeStockItem(index)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </FormSection>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="secondary" icon={Plus} onClick={addStockItem}>
                  Add Another Item
                </Button>
                <Button type="submit">Add Stock</Button>
              </div>
            </form>
          )}

          {activeTab === 'assign' && (
            <form onSubmit={handleAssignStock} className="space-y-6">
              <FormSection
                title="Assign Stock to Volunteer"
                description="Transfer items or packages from central to field volunteer"
              >
                <FormField label="Select Volunteer" required fullWidth>
                  <Combobox
                    options={volunteers?.sort((a, b) => a.name.localeCompare(b.name)).map((v) => ({ value: v._id, label: `${v.name}${v.role === 'ADMIN' ? ' (Admin)' : ''}` })) || []}
                    value={selectedVolunteer}
                    onChange={(value) => setSelectedVolunteer(value)}
                    placeholder="Select Volunteer"
                  />
                </FormField>
              </FormSection>

              {/* Cart Display */}
              {cart.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                      <ShoppingCart size={18} className="animate-pulse" />
                      <h3 className="font-semibold text-sm">Assignment Cart</h3>
                    </div>
                    <span className="bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-xs font-medium text-white">
                      {cart.length} {cart.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  
                  <div className="divide-y divide-slate-100">
                    {cart.map(item => (
                      <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors group">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                            item.type === 'package' 
                              ? 'bg-gradient-to-br from-purple-100 to-pink-100' 
                              : 'bg-gradient-to-br from-blue-100 to-cyan-100'
                          }`}>
                            {item.type === 'package' ? '📦' : '📋'}
                          </div>
                          
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
                            
                            {item.type === 'package' && item.items && (
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {item.items.map((pkgItem, idx) => (
                                  <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-md text-xs text-slate-600">
                                    {pkgItem.name} ×{pkgItem.quantity * (typeof item.quantity === 'number' ? item.quantity : 0)}
                                  </span>
                                ))}
                              </div>
                            )}
                            
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
                  
                  <div className="bg-slate-50 px-5 py-4 border-t border-slate-200">
                    <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-3">Stock Impact</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(calculateStockImpact()).map(([itemId, qty]) => {
                        const item = items.find(i => i._id === itemId);
                        const remaining = getRemainingStock(itemId);
                        const centralStockItem = centralStock.find(s => s.itemId === itemId);
                        const totalStock = centralStockItem?.stock || 0;
                        const percentUsed = totalStock > 0 ? ((qty / totalStock) * 100) : 0;
                        return (
                          <div key={itemId} className={`px-3 py-2 rounded-lg text-xs ${
                            remaining < 0 ? 'bg-rose-100 text-rose-700 border border-rose-200' : 
                            percentUsed > 80 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                            'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}>
                            <div className="font-semibold truncate">{item?.name || 'Unknown'}</div>
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

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={cart.length === 0}>
                  Assign Stock ({cart.length} items)
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'transfer' && (
            <div className="space-y-6">
              <FormSection
                title="Transfer Stock to Another Volunteer"
                description="Move your assigned items to another volunteer in the field"
              >
                {myStock.length === 0 ? (
                  <div className="md:col-span-2 text-center py-12">
                    <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-600 font-medium">No stock assigned to you</p>
                    <p className="text-sm text-slate-500 mt-2">You need assigned stock to transfer items</p>
                  </div>
                ) : (
                  <>
                    <div className="md:col-span-2">
                      <Button
                        type="button"
                        variant="primary"
                        icon={ArrowRightLeft}
                        onClick={() => setShowTransferModal(true)}
                        fullWidth
                      >
                        Open Transfer Interface
                      </Button>
                      <p className="text-sm text-slate-500 mt-3 text-center">
                        Transfer your stock to other volunteers for field-level resource rebalancing
                      </p>
                    </div>
                  </>
                )}
              </FormSection>
            </div>
          )}

          {activeTab === 'return' && (
            <form onSubmit={handleReturnStock} className="space-y-6">
              <FormSection
                title="Return Stock to Central Warehouse"
                description="Return your assigned items back to central inventory"
              >
                {myStock.length === 0 ? (
                  <div className="md:col-span-2 text-center py-12">
                    <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-600 font-medium">No stock assigned to you</p>
                    <p className="text-sm text-slate-500 mt-2">You need assigned stock to return items</p>
                  </div>
                ) : (
                  <>
                    {returnItems.map((item, index) => (
                      <div key={index} className="md:col-span-2 flex gap-4">
                        <FormField label="Item" required fullWidth>
                          <Combobox
                            options={myStock.sort((a, b) => a.item.name.localeCompare(b.item.name)).map((s) => ({ value: s.itemId, label: `${s.item.name} (Available: ${s.stock} ${s.item.unit})` }))}
                            value={item.itemId}
                            onChange={(value) => {
                              const updated = [...returnItems];
                              updated[index].itemId = value;
                              setReturnItems(updated);
                            }}
                            placeholder="Select Item"
                          />
                        </FormField>
                        <FormField label="Quantity" required>
                          <input
                            type="number"
                            className="input"
                            value={item.quantity}
                            onChange={(e) => {
                              const updated = [...returnItems];
                              updated[index].quantity = parseInt(e.target.value);
                              setReturnItems(updated);
                            }}
                            min="1"
                            required
                          />
                        </FormField>
                        {returnItems.length > 1 && (
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="danger"
                              icon={Minus}
                              onClick={() => setReturnItems(returnItems.filter((_, i) => i !== index))}
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    <FormField label="Notes (Optional)" fullWidth>
                      <textarea
                        className="input"
                        rows={3}
                        value={returnNotes}
                        onChange={(e) => setReturnNotes(e.target.value)}
                        placeholder="Reason for return..."
                      />
                    </FormField>
                  </>
                )}
              </FormSection>

              {myStock.length > 0 && (
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    icon={Plus}
                    onClick={() => setReturnItems([...returnItems, { itemId: '', quantity: 0 }])}
                  >
                    Add Another Item
                  </Button>
                  <Button type="submit" icon={Undo2}>
                    Return Stock
                  </Button>
                </div>
              )}
            </form>
          )}
        </div>
      </ContentCard>

      <TransferStockModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        currentUser={user}
        volunteers={volunteers}
        myStock={myStock}
        onSuccess={() => {
          setToast({ message: 'Stock transferred successfully!', type: 'success' });
          loadData();
          if (user?.role === 'ADMIN') {
            loadStockSummary(pagination.currentPage);
          }
        }}
        onError={(message) => setToast({ message, type: 'error' })}
      />

      <ContentCard>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Stock Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Item</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Central Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">With Volunteers</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Total Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
                ) : stockSummary.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No stock data available</td></tr>
                ) : (
                  stockSummary.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-900">{row.item.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{row.item.category}</td>
                      <td className="px-4 py-3 text-sm text-slate-900">{row.centralStock}</td>
                      <td className="px-4 py-3 text-sm text-slate-900">{row.volunteerStock}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">{row.centralStock + row.volunteerStock}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => loadVolunteerStockDetails(row.item.id || row.item._id, row.item.name)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View volunteer details"
                        >
                          <Info className="text-blue-600" size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={loadStockSummary}
          />
        </div>
      </ContentCard>
    </div>

    {showVolunteerModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Info className="text-blue-600" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Volunteer Stock Details</h2>
                  <p className="text-sm text-slate-500">Item distribution across volunteers</p>
                </div>
              </div>
              <button
                onClick={() => setShowVolunteerModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-6">
            {selectedItemDetails && selectedItemDetails.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Volunteer</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Item</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Quantity</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedItemDetails.map((detail: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-900">{detail.volunteer}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{detail.item}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-900">{detail.quantity}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{detail.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">No volunteers have this item</div>
            )}
          </div>
        </motion.div>
      </div>
    )}
    </>
  );
}
