'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Plus, Minus } from 'lucide-react';
import Button from '@/components/ui/button';
import FormField from '@/components/ui/form-field';
import { stockAPI } from '@/services/api';
import { User, StockItem } from '@/types';

interface TransferStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  volunteers: User[];
  myStock: StockItem[];
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function TransferStockModal({
  isOpen,
  onClose,
  currentUser,
  volunteers,
  myStock,
  onSuccess,
  onError
}: TransferStockModalProps) {
  const [toVolunteerId, setToVolunteerId] = useState('');
  const [transferItems, setTransferItems] = useState<Array<{ itemId: string; quantity: number }>>([
    { itemId: '', quantity: 0 }
  ]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await stockAPI.transferStock({
        fromVolunteerId: currentUser._id,
        toVolunteerId,
        items: transferItems,
        notes
      });

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      onError(error.response?.data?.error || 'Error transferring stock');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setToVolunteerId('');
    setTransferItems([{ itemId: '', quantity: 0 }]);
    setNotes('');
  };

  const addTransferItem = () => {
    setTransferItems([...transferItems, { itemId: '', quantity: 0 }]);
  };

  const removeTransferItem = (index: number) => {
    setTransferItems(transferItems.filter((_, i) => i !== index));
  };

  const updateTransferItem = (index: number, field: 'itemId' | 'quantity', value: any) => {
    const updated = [...transferItems];
    updated[index][field] = value;
    setTransferItems(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col"
      >
        <div className="p-6 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <ArrowRightLeft className="text-purple-600" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Transfer Stock</h2>
                <p className="text-sm text-slate-500">Transfer items to another volunteer</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            <FormField label="Transfer To" required fullWidth>
              <select
                className="input"
                value={toVolunteerId}
                onChange={(e) => setToVolunteerId(e.target.value)}
                required
              >
                <option value="">Select Volunteer (Total: {volunteers.length})</option>
                {volunteers
                  .filter((v) => v._id !== currentUser._id)
                  .map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.name} - {v.email}
                    </option>
                  ))}
              </select>
            </FormField>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Items to Transfer</label>
              {transferItems.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <FormField label="Item" required fullWidth>
                    <select
                      className="input"
                      value={item.itemId}
                      onChange={(e) => updateTransferItem(index, 'itemId', e.target.value)}
                      required
                    >
                      <option value="">Select Item</option>
                      {myStock.map((s) => (
                        <option key={s.itemId} value={s.itemId}>
                          {s.item.name} (Available: {s.stock} {s.item.unit})
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Quantity" required>
                    <input
                      type="number"
                      className="input"
                      value={item.quantity}
                      onChange={(e) => updateTransferItem(index, 'quantity', parseInt(e.target.value))}
                      min="1"
                      max={myStock.find((s) => s.itemId === item.itemId)?.stock || 999999}
                      required
                    />
                  </FormField>
                  {transferItems.length > 1 && (
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="danger"
                        icon={Minus}
                        onClick={() => removeTransferItem(index)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="secondary"
              icon={Plus}
              onClick={addTransferItem}
              fullWidth
            >
              Add Another Item
            </Button>

            <FormField label="Notes (Optional)" fullWidth>
              <textarea
                className="input"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reason for transfer..."
              />
            </FormField>
          </div>

          <div className="flex gap-3 p-6 border-t border-slate-200 bg-white flex-shrink-0 rounded-b-2xl">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              fullWidth
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Transferring...' : 'Transfer Stock'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
