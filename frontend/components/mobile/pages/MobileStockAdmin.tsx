'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { stockAPI, itemsAPI, usersAPI, packagesAPI } from '@/services/api';
import { Item, User, StockItem, Package as PackageType } from '@/types';
import { Package, Plus, Minus, X, ShoppingCart, ArrowRightLeft, Undo2 } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import { ToastContainer } from '@/components/ui/toast';
import MobilePageContainer from '../MobilePageContainer';

type CartItem = {
  id: string;
  type: 'item' | 'package';
  referenceId: string;
  name: string;
  quantity: number | '';
  items?: Array<{ itemId: string; quantity: number; name: string }>;
};

export default function MobileStockAdmin() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [myStock, setMyStock] = useState<StockItem[]>([]);
  const [centralStock, setCentralStock] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'add' | 'assign' | 'return' | 'transfer'>('add');
  const [stockItems, setStockItems] = useState<Array<{ type: 'item'; referenceId: string; quantity: number }>>([{ type: 'item', referenceId: '', quantity: 0 }]);
  const [returnItems, setReturnItems] = useState<Array<{ itemId: string; quantity: number }>>([{ itemId: '', quantity: 0 }]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [selectedVolunteer, setSelectedVolunteer] = useState('');
  const [selectedTransferVolunteer, setSelectedTransferVolunteer] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [itemsRes, packagesRes, usersRes, stockRes, centralRes] = await Promise.all([
        itemsAPI.getAll(1, 100),
        packagesAPI.getAll(1, 100),
        usersAPI.getAll(1, 100),
        stockAPI.getVolunteerStock(user?._id || ''),
        stockAPI.getCentralStock()
      ]);
      setItems(itemsRes.data.data.data || itemsRes.data.data.items || []);
      setPackages(packagesRes.data.data.data || []);
      const allUsers = usersRes.data.data.data || usersRes.data.data.users || [];
      setVolunteers(allUsers.filter((u: User) => u.role === 'VOLUNTEER' || u.role === 'ADMIN'));
      setMyStock(stockRes.data.success ? stockRes.data.data : []);
      setCentralStock(centralRes.data.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRemainingStock = (itemId: string) => {
    const impact = calculateStockImpact();
    const stock = centralStock.find(s => s.itemId === itemId);
    return (stock?.stock || 0) - (impact[itemId] || 0);
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
          label: `📋 ${item.name} (${remaining} ${item.unit})`,
          disabled: remaining === 0 || inCart
        };
      });

    return [...packageOptions, ...itemOptions];
  };

  const addToCart = () => {
    if (!selectedOption || !quantity || quantity <= 0) return;

    const [type, id] = selectedOption.split('_');

    if (type === 'item') {
      const remaining = getRemainingStock(id);
      if (remaining < quantity) {
        setToast({ message: 'Insufficient stock!', type: 'error' });
        return;
      }
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
      const maxQty = getMaxPackageQuantity(id);
      if (maxQty < quantity) {
        setToast({ message: 'Insufficient stock!', type: 'error' });
        return;
      }
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
    setCart(cart.map(c => c.id === id ? { ...c, quantity: newQuantity } : c));
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const itemsToAdd = stockItems.filter(s => s.referenceId).map(s => ({ itemId: s.referenceId, quantity: s.quantity }));
      await stockAPI.addStock({ items: itemsToAdd });
      setToast({ message: 'Stock added successfully!', type: 'success' });
      setStockItems([{ type: 'item', referenceId: '', quantity: 0 }]);
      loadData();
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || 'Error adding stock', type: 'error' });
    }
  };

  const handleAssignStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setToast({ message: 'Please add items to cart', type: 'error' });
      return;
    }
    if (!selectedVolunteer) {
      setToast({ message: 'Please select a volunteer', type: 'error' });
      return;
    }

    try {
      const itemsToAssign = cart.filter(c => c.type === 'item').map(c => ({ itemId: c.referenceId, quantity: c.quantity }));
      const packagesToAssign = cart.filter(c => c.type === 'package').map(c => ({ packageId: c.referenceId, quantity: c.quantity }));

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
      loadData();
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || 'Error assigning stock', type: 'error' });
    }
  };

  const handleReturnStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await stockAPI.returnStock({ volunteerId: user?._id, items: returnItems });
      setToast({ message: 'Stock returned successfully!', type: 'success' });
      setReturnItems([{ itemId: '', quantity: 0 }]);
      loadData();
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || 'Error returning stock', type: 'error' });
    }
  };

  if (loading) {
    return (
      <MobilePageContainer title="Stock Management">
        <div className="text-center py-12 text-slate-500">Loading...</div>
      </MobilePageContainer>
    );
  }

  return (
    <MobilePageContainer title="Stock Management">
      <ToastContainer toast={toast} onClose={() => setToast(null)} />
      <div className="space-y-6">
        {/* Tab Switcher - 4 Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-white rounded-2xl p-2 shadow-sm border border-slate-100">
          <button
            onClick={() => setActiveTab('add')}
            className={`px-3 py-3 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'add'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Add Stock
          </button>
          <button
            onClick={() => setActiveTab('assign')}
            className={`px-3 py-3 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'assign'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Assign
          </button>
          <button
            onClick={() => setActiveTab('return')}
            className={`px-3 py-3 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'return'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Return
          </button>
          <button
            onClick={() => setActiveTab('transfer')}
            className={`px-3 py-3 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'transfer'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Transfer
          </button>
        </div>

        {/* Add Stock Section */}
        {activeTab === 'add' && (
          <form onSubmit={handleAddStock} className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-4">Add Stock to Central</h3>

              <div className="space-y-4">
                {stockItems.map((item, index) => (
                  <div key={index} className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Item</label>
                      <Combobox
                        options={items.sort((a, b) => a.name.localeCompare(b.name)).map(i => ({ value: i._id, label: `${i.name} (${i.unit})` }))}
                        value={item.referenceId}
                        onChange={(value) => {
                          const updated = [...stockItems];
                          updated[index].referenceId = value;
                          setStockItems(updated);
                        }}
                        placeholder="Select Item"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Quantity</label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...stockItems];
                          updated[index].quantity = parseInt(e.target.value) || 0;
                          setStockItems(updated);
                        }}
                        min="1"
                      />
                    </div>

                    {stockItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setStockItems(stockItems.filter((_, i) => i !== index))}
                        className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
                      >
                        Remove Item
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setStockItems([...stockItems, { type: 'item', referenceId: '', quantity: 0 }])}
                className="w-full mt-4 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add Another Item
              </button>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Add Stock
            </button>
          </form>
        )}

        {/* Assign Stock Section */}
        {activeTab === 'assign' && (
          <form onSubmit={handleAssignStock} className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Select Volunteer</label>
              <Combobox
                options={volunteers.sort((a, b) => a.name.localeCompare(b.name)).map(v => ({ value: v._id, label: v.name }))}
                value={selectedVolunteer}
                onChange={setSelectedVolunteer}
                placeholder="Choose volunteer"
              />
            </div>

            {/* Cart Display */}
            {cart.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={18} />
                    <span className="font-semibold text-sm">Cart</span>
                  </div>
                  <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-medium">
                    {cart.length} items
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {cart.map(item => (
                    <div key={item.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-slate-900 text-sm">{item.name}</h4>
                          {item.type === 'package' && item.items && (
                            <div className="text-xs text-slate-500 mt-1">
                              {item.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Qty:</span>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateCartQuantity(item.id, parseInt(e.target.value) || '')}
                          className="w-16 px-2 py-1 text-sm border border-slate-200 rounded-lg"
                          min="1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-4 text-sm">Add Items</h3>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Item or Package</label>
                  <Combobox
                    options={getDropdownOptions()}
                    value={selectedOption}
                    onChange={setSelectedOption}
                    placeholder="Select item or package"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Quantity</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                    min="1"
                    placeholder="0"
                  />
                </div>

                <button
                  type="button"
                  onClick={addToCart}
                  disabled={!selectedOption || !quantity}
                  className="w-full px-4 py-2 bg-blue-100 text-blue-600 rounded-xl font-medium hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={cart.length === 0 || !selectedVolunteer}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Assign Stock ({cart.length})
            </button>
          </form>
        )}

        {/* Return Stock Section */}
        {activeTab === 'return' && (
          <form onSubmit={handleReturnStock} className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-4">Return Stock to Central</h3>

              {myStock.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No stock assigned to you</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {returnItems.map((item, index) => (
                    <div key={index} className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">Item</label>
                        <Combobox
                          options={myStock.sort((a, b) => a.item.name.localeCompare(b.item.name)).map(s => ({ value: s.itemId, label: `${s.item.name} (${s.stock} available)` }))}
                          value={item.itemId}
                          onChange={(value) => {
                            const updated = [...returnItems];
                            updated[index].itemId = value;
                            setReturnItems(updated);
                          }}
                          placeholder="Select Item"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">Quantity</label>
                        <input
                          type="number"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...returnItems];
                            updated[index].quantity = parseInt(e.target.value) || 0;
                            setReturnItems(updated);
                          }}
                          min="1"
                        />
                      </div>

                      {returnItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setReturnItems(returnItems.filter((_, i) => i !== index))}
                          className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
                        >
                          Remove Item
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setReturnItems([...returnItems, { itemId: '', quantity: 0 }])}
                    className="w-full px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Add Another Item
                  </button>
                </div>
              )}
            </div>

            {myStock.length > 0 && (
              <button
                type="submit"
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Undo2 size={18} /> Return Stock
              </button>
            )}
          </form>
        )}

        {/* Transfer Stock Section */}
        {activeTab === 'transfer' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-900 mb-4">Transfer Stock to Volunteer</h3>

              {myStock.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No stock assigned to you</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Select Volunteer</label>
                    <Combobox
                      options={volunteers.sort((a, b) => a.name.localeCompare(b.name)).map(v => ({ value: v._id, label: v.name }))}
                      value={selectedTransferVolunteer}
                      onChange={setSelectedTransferVolunteer}
                      placeholder="Choose volunteer"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Item to Transfer</label>
                    <Combobox
                      options={myStock.sort((a, b) => a.item.name.localeCompare(b.item.name)).map(s => ({ value: s.itemId, label: `${s.item.name} (${s.stock} available)` }))}
                      value={selectedOption}
                      onChange={setSelectedOption}
                      placeholder="Select Item"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Quantity</label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                      min="1"
                      placeholder="0"
                    />
                  </div>

                  <button
                    type="button"
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowRightLeft size={18} /> Transfer Stock
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MobilePageContainer>
  );
}
