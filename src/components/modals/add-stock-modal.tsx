'use client';

import React, { useState, useRef, useEffect } from 'react';
import CustomDropdown from '@/components/ui/custom-dropdown';
import CustomCalendar from '@/components/ui/custom-calendar';

interface StockEntry {
  id: number;
  itemName: string;
  quantity: string;
  serialNumber: string;
  color: string;
  restockingDate: Date | null;
  itemTags: string;
}

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddStockModal({ isOpen, onClose }: AddStockModalProps) {
  const [stockDate, setStockDate] = useState(new Date('2025-07-25'));
  const [isStockDateOpen, setIsStockDateOpen] = useState(false);
  const [isRestockingDateOpen, setIsRestockingDateOpen] = useState(false);
  const stockDateButtonRef = useRef<HTMLButtonElement>(null);
  const restockingDateButtonRef = useRef<HTMLButtonElement>(null);

  // Close stock date calendar on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        stockDateButtonRef.current &&
        !stockDateButtonRef.current.contains(event.target as Node)
      ) {
        setIsStockDateOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close restocking date calendar on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        restockingDateButtonRef.current &&
        !restockingDateButtonRef.current.contains(event.target as Node)
      ) {
        setIsRestockingDateOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dropdown options
  const itemNameOptions = [
    { value: '', label: 'Select an item' },
    { value: 'Hearing Aid Cleaning Kit', label: 'Hearing Aid Cleaning Kit' },
    { value: 'Oticon ConnectClip', label: 'Oticon ConnectClip' },
    { value: 'Oticon More 1 Universal', label: 'Oticon More 1 Universal' },
    { value: 'Phonak Audéo Paradise P90 Left', label: 'Phonak Audéo Paradise P90 Left' },
    { value: 'Phonak Audéo Paradise P90 Right', label: 'Phonak Audéo Paradise P90 Right' },
  ];

  const colorOptions = [
    { value: 'No color specified', label: 'No color specified' },
    { value: 'Blue', label: 'Blue' },
    { value: 'Silver', label: 'Silver' },
    { value: 'Beige', label: 'Beige' },
    { value: 'Black', label: 'Black' },
    { value: 'White', label: 'White' },
    { value: 'Brown', label: 'Brown' },
  ];

  const itemTagsOptions = [
    { value: '', label: 'Select tags' },
    { value: 'Premium', label: 'Premium' },
    { value: 'Standard', label: 'Standard' },
    { value: 'Rechargeable', label: 'Rechargeable' },
    { value: 'Bluetooth', label: 'Bluetooth' },
  ];
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([
    {
      id: 1,
      itemName: '',
      quantity: '',
      serialNumber: '',
      color: 'No color specified',
      restockingDate: null,
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
      restockingDate: null,
      itemTags: ''
    };
    setStockEntries([...stockEntries, newEntry]);
  };

  const updateStockEntry = (id: number, field: keyof StockEntry, value: string | Date) => {
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
           
            <div>
              <h2 className="text-lg font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                Add Stock to Inventory
              </h2>
              <p className="text-sm text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                Add stock for one or multiple items. Date will be automatically set to today.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#4A5565] hover:text-[#101828] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Separator Line */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Stock Addition Date */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
              Stock Addition Date:
            </label>
            <div className="relative">
              <button
                ref={stockDateButtonRef}
                type="button"
                onClick={() => setIsStockDateOpen(!isStockDateOpen)}
                className="w-full px-3 py-1 bg-gray-100 rounded-lg   text-left flex items-center justify-between"
                style={{ fontFamily: 'Segoe UI' }}
              >
                <span className="truncate">
                  {stockDate ? stockDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Select date'}
                </span>
                <svg
                  className="w-4 h-4 text-gray-500 ml-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V5a1 1 0 011-1h6a1 1 0 011 1v2m-9 4h10m-10 4h6M5 7h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z" />
                </svg>
              </button>

              {isStockDateOpen && (
                <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <CustomCalendar
                    value={stockDate}
                    onChange={(date) => {
                      setStockDate(date);
                      setIsStockDateOpen(false);
                    }}
                    className="w-[18rem]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Stock Entries */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                Stock Entries
              </h3>
              <button
                type="button"
                onClick={addStockEntry}
                className="flex items-center gap-2 px-4 py-1.5 bg-primary text-white rounded-lg hover:bg-[#ea580c] transition-colors text-sm cursor-pointer"
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
                        className="text-red-500 hover:text-red-700 cursor-pointer"
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
                      <label className="block text-xs font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Item Name *
                      </label>
                      <CustomDropdown
                        options={itemNameOptions}
                        value={entry.itemName}
                        onChange={(value) => updateStockEntry(entry.id, 'itemName', value)}
                        placeholder="Select an item"
                        className="w-full"
                        aria-label="Select item name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Quantity *
                      </label>
                      <input
                        type="number"
                        required
                        value={entry.quantity}
                        onChange={(e) => updateStockEntry(entry.id, 'quantity', e.target.value)}
                        placeholder="e.g., 10"
                        className="w-full px-3 py-1 bg-gray-100 rounded-lg focus:outline-none "
                        style={{ fontFamily: 'Segoe UI' }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Serial Number
                      </label>
                      <input
                        type="text"
                        value={entry.serialNumber}
                        onChange={(e) => updateStockEntry(entry.id, 'serialNumber', e.target.value)}
                        placeholder="e.g., SN123456"
                        className="w-full px-3 py-1 bg-gray-100 rounded-lg focus:outline-none "
                        style={{ fontFamily: 'Segoe UI' }}
                      />
                      <div className="text-xs text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
                        Optional - for tracked items
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Color
                      </label>
                      <CustomDropdown
                        options={colorOptions}
                        value={entry.color}
                        onChange={(value) => updateStockEntry(entry.id, 'color', value)}
                        placeholder="No color specified"
                        className="w-full"
                        aria-label="Select color"
                      />
                      <div className="text-xs text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
                        Optional - item color/finish
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Restocking Date
                      </label>
                      <div className="relative">
                        <button
                          ref={restockingDateButtonRef}
                          type="button"
                          onClick={() => setIsRestockingDateOpen(!isRestockingDateOpen)}
                          className="w-full px-3 py-1 bg-gray-100 rounded-lg  text-left flex items-center justify-between"
                          style={{ fontFamily: 'Segoe UI' }}
                        >
                          <span className="truncate">
                            {entry.restockingDate ? entry.restockingDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Select date'}
                          </span>
                          <svg
                            className="w-4 h-4 text-gray-500 ml-2 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V5a1 1 0 011-1h6a1 1 0 011 1v2m-9 4h10m-10 4h6M5 7h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z" />
                          </svg>
                        </button>

                        {isRestockingDateOpen && (
                          <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                            <CustomCalendar
                              value={entry.restockingDate || undefined}
                              onChange={(date) => {
                                updateStockEntry(entry.id, 'restockingDate', date);
                                setIsRestockingDateOpen(false);
                              }}
                              className="w-[18rem]"
                            />
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
                        Optional - for restocking schedule
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Item Tags
                      </label>
                      <CustomDropdown
                        options={itemTagsOptions}
                        value={entry.itemTags}
                        onChange={(value) => updateStockEntry(entry.id, 'itemTags', value)}
                        placeholder="Select tags"
                        className="w-full"
                        aria-label="Select item tags"
                      />
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
          <div className="flex justify-end gap-3 pt-6 ">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-1.5 text-sm border border-[#E5E7EB] bg-white text-[#4A5565] rounded-lg hover:bg-[#F9FAFB] transition-colors disabled:opacity-50 cursor-pointer"
              style={{ fontFamily: 'Segoe UI' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-[#ea580c] transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              style={{ fontFamily: 'Segoe UI' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Add Stock ({stockEntries.length} items)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
