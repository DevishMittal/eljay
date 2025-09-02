'use client';

import React, { useState } from 'react';

interface StockEntry {
  id: number;
  itemName: string;
  quantity: string;
  serialNumber: string;
  color: string;
  restockingDate: string;
  itemTags: string;
}

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddStockModal({ isOpen, onClose }: AddStockModalProps) {
  const [stockDate, setStockDate] = useState('2025-07-25');
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([
    {
      id: 1,
      itemName: '',
      quantity: '',
      serialNumber: '',
      color: 'No color specified',
      restockingDate: '',
      itemTags: ''
    }
  ]);

  const addStockEntry = () => {
    const newEntry: StockEntry = {
      id: stockEntries.length + 1,
      itemName: '',
      quantity: '',
      serialNumber: '',
      color: 'No color specified',
      restockingDate: '',
      itemTags: ''
    };
    setStockEntries([...stockEntries, newEntry]);
  };

  const updateStockEntry = (id: number, field: keyof StockEntry, value: string) => {
    setStockEntries(stockEntries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const removeStockEntry = (id: number) => {
    if (stockEntries.length > 1) {
      setStockEntries(stockEntries.filter(entry => entry.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Stock entries:', stockEntries);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                Add Stock to Inventory
              </h2>
              <p className="text-sm text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                Add stock for one or multiple items. Date will be automatically set to today.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#4A5565] hover:text-[#101828] transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Stock Addition Date */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
              Stock Addition Date:
            </label>
            <input
              type="date"
              value={stockDate}
              onChange={(e) => setStockDate(e.target.value)}
              className="px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              style={{ fontFamily: 'Segoe UI' }}
            />
          </div>

          {/* Stock Entries */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                Stock Entries
              </h3>
              <button
                type="button"
                onClick={addStockEntry}
                className="flex items-center gap-2 px-4 py-2 bg-[#f97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors text-sm"
                style={{ fontFamily: 'Segoe UI' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Item
              </button>
            </div>

            <div className="space-y-6">
              {stockEntries.map((entry) => (
                <div key={entry.id} className="border border-[#E5E7EB] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                        {entry.id}
                      </span>
                    </div>
                    {stockEntries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStockEntry(entry.id)}
                        className="text-red-500 hover:text-red-700"
                        aria-label={`Remove entry ${entry.id}`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Item Name *
                      </label>
                      <select
                        required
                        value={entry.itemName}
                        onChange={(e) => updateStockEntry(entry.id, 'itemName', e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                        style={{ fontFamily: 'Segoe UI' }}
                        aria-label="Select item name"
                      >
                        <option value="">Select an item</option>
                        <option value="Hearing Aid Cleaning Kit">Hearing Aid Cleaning Kit</option>
                        <option value="Oticon ConnectClip">Oticon ConnectClip</option>
                        <option value="Oticon More 1 Universal">Oticon More 1 Universal</option>
                        <option value="Phonak Audéo Paradise P90 Left">Phonak Audéo Paradise P90 Left</option>
                        <option value="Phonak Audéo Paradise P90 Right">Phonak Audéo Paradise P90 Right</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Quantity *
                      </label>
                      <input
                        type="number"
                        required
                        value={entry.quantity}
                        onChange={(e) => updateStockEntry(entry.id, 'quantity', e.target.value)}
                        placeholder="e.g., 10"
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                        style={{ fontFamily: 'Segoe UI' }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Serial Number
                      </label>
                      <input
                        type="text"
                        value={entry.serialNumber}
                        onChange={(e) => updateStockEntry(entry.id, 'serialNumber', e.target.value)}
                        placeholder="e.g., SN123456"
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                        style={{ fontFamily: 'Segoe UI' }}
                      />
                      <div className="text-xs text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
                        Optional - for tracked items
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Color
                      </label>
                      <select
                        value={entry.color}
                        onChange={(e) => updateStockEntry(entry.id, 'color', e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                        style={{ fontFamily: 'Segoe UI' }}
                        aria-label="Select color"
                      >
                        <option value="No color specified">No color specified</option>
                        <option value="Blue">Blue</option>
                        <option value="Silver">Silver</option>
                        <option value="Beige">Beige</option>
                        <option value="Black">Black</option>
                        <option value="White">White</option>
                        <option value="Brown">Brown</option>
                      </select>
                      <div className="text-xs text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
                        Optional - item color/finish
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Restocking Date
                      </label>
                      <input
                        type="date"
                        value={entry.restockingDate}
                        onChange={(e) => updateStockEntry(entry.id, 'restockingDate', e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                        style={{ fontFamily: 'Segoe UI' }}
                      />
                      <div className="text-xs text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
                        Optional - for restocking schedule
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Item Tags
                      </label>
                      <select
                        value={entry.itemTags}
                        onChange={(e) => updateStockEntry(entry.id, 'itemTags', e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                        style={{ fontFamily: 'Segoe UI' }}
                        aria-label="Select item tags"
                      >
                        <option value="">Select tags</option>
                        <option value="Premium">Premium</option>
                        <option value="Standard">Standard</option>
                        <option value="Rechargeable">Rechargeable</option>
                        <option value="Bluetooth">Bluetooth</option>
                      </select>
                      <div className="text-xs text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
                        Optional - select relevant tags for this item
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-[#E5E7EB] bg-white text-[#4A5565] rounded-lg hover:bg-[#F9FAFB] transition-colors"
              style={{ fontFamily: 'Segoe UI' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#f97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors"
              style={{ fontFamily: 'Segoe UI' }}
            >
              Add Stock ({stockEntries.length} items)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
