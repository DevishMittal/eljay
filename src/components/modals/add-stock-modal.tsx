'use client';

import React, { useState, useRef, useEffect } from 'react';
import CustomDropdown from '@/components/ui/custom-dropdown';
import CustomCalendar from '@/components/ui/custom-calendar';
import ColorSelector from '@/components/ui/color-selector';
import TagsSelector from '@/components/ui/tags-selector';
import { InventoryService } from '@/services/inventoryService';
import { InventoryItem } from '@/types';

interface StockEntry {
  id: number;
  itemId: string;
  itemName: string;
  quantity: string;
  serialNumber: string;
  expiryDate: Date | null;
  supplierName: string;
  purchasePrice: string;
  warranty: string;
  authorizedBy: string;
  color: string[];
  tags: string[];
}

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddStockModal({ isOpen, onClose, onSuccess }: AddStockModalProps) {
  const [stockDate, setStockDate] = useState(new Date());
  const [isStockDateOpen, setIsStockDateOpen] = useState(false);
  const [openExpiryCalendarId, setOpenExpiryCalendarId] = useState<number | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stockDateButtonRef = useRef<HTMLButtonElement>(null);

  // Fetch inventory items when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchInventoryItems();
    }
  }, [isOpen]);

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

  // Close expiry date calendar on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openExpiryCalendarId !== null) {
        const calendarElement = document.querySelector(`[data-calendar-id="${openExpiryCalendarId}"]`);
        if (calendarElement && !calendarElement.contains(event.target as Node)) {
          setOpenExpiryCalendarId(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openExpiryCalendarId]);

  // Fetch inventory items
  const fetchInventoryItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await InventoryService.getInventoryItems(1, 100); // Get first 100 items
      setInventoryItems(response.items);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inventory items';
      setError(errorMessage);
      console.error('Error fetching inventory items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Dropdown options
  const itemNameOptions = [
    { value: '', label: 'Select an item' },
    ...inventoryItems.map(item => ({
      value: item.id,
      label: `${item.itemName} (${item.itemCode})`
    }))
  ];

  const [stockEntries, setStockEntries] = useState<StockEntry[]>([
    {
      id: 1,
      itemId: '',
      itemName: '',
      quantity: '',
      serialNumber: '',
      expiryDate: null,
      supplierName: '',
      purchasePrice: '',
      warranty: '',
      authorizedBy: 'Current User',
      color: [],
      tags: []
    }
  ]);

  const addStockEntry = () => {
    const newEntry: StockEntry = {
      id: stockEntries.length + 1,
      itemId: '',
      itemName: '',
      quantity: '',
      serialNumber: '',
      expiryDate: null,
      supplierName: '',
      purchasePrice: '',
      warranty: '',
      authorizedBy: 'Current User',
      color: [],
      tags: []
    };
    setStockEntries([...stockEntries, newEntry]);
  };

  const updateStockEntry = (id: number, field: keyof StockEntry, value: string | Date | string[]) => {
    setStockEntries(stockEntries.map(entry => {
      if (entry.id === id) {
        const updatedEntry = { ...entry, [field]: value };
        
        // If itemId is being updated, also update itemName
        if (field === 'itemId' && typeof value === 'string') {
          const selectedItem = inventoryItems.find(item => item.id === value);
          if (selectedItem) {
            updatedEntry.itemName = selectedItem.itemName;
          }
        }
        
        return updatedEntry;
      }
      return entry;
    }));
  };

  const removeStockEntry = (id: number) => {
    if (stockEntries.length > 1) {
      setStockEntries(stockEntries.filter(entry => entry.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Process each stock entry
      const promises = stockEntries
        .filter(entry => entry.itemId && entry.quantity)
        .map(async (entry) => {
          const additionalData = {
            batchNumber: entry.serialNumber || undefined,
            expiryDate: entry.expiryDate ? entry.expiryDate.toISOString() : undefined,
            supplierName: entry.supplierName || undefined,
            purchasePrice: entry.purchasePrice ? parseFloat(entry.purchasePrice) : undefined,
            warranty: entry.warranty || undefined,
            authorizedBy: entry.authorizedBy || undefined,
          };

          return InventoryService.updateStock(
            entry.itemId,
            parseInt(entry.quantity),
            'add',
            additionalData
          );
        });

      await Promise.all(promises);
      
      // Call success callback and close modal
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add stock';
      setError(errorMessage);
      console.error('Error adding stock:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide border-2 shadow-lg">
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
                <div 
                  className="absolute z-[60] mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
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
                        Item Name <span className="text-red-500">*</span>
                      </label>
                      <CustomDropdown
                        options={itemNameOptions}
                        value={entry.itemId}
                        onChange={(value) => updateStockEntry(entry.id, 'itemId', value)}
                        placeholder="Select an item"
                        className="w-full"
                        aria-label="Select item name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
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
                        placeholder="e.g., SN-2024-001"
                        className="w-full px-3 py-1 bg-gray-100 rounded-lg focus:outline-none "
                        style={{ fontFamily: 'Segoe UI' }}
                      />
                      <div className="text-xs text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
                        Optional - serial or lot number
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Expiry Date
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenExpiryCalendarId(openExpiryCalendarId === entry.id ? null : entry.id)}
                          className="w-full px-3 py-1 bg-gray-100 rounded-lg  text-left flex items-center justify-between"
                          style={{ fontFamily: 'Segoe UI' }}
                        >
                          <span className="truncate">
                            {entry.expiryDate ? entry.expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Select date'}
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

                        {openExpiryCalendarId === entry.id && (
                          <div 
                            className="absolute z-[60] mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
                            data-calendar-id={entry.id}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <CustomCalendar
                              value={entry.expiryDate || undefined}
                              onChange={(date) => {
                                updateStockEntry(entry.id, 'expiryDate', date);
                                setOpenExpiryCalendarId(null);
                              }}
                              className="w-[18rem]"
                            />
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
                        Optional - expiry date for perishable items
                      </div>
                    </div>

                    <div>
                      <ColorSelector
                        selectedColors={entry.color}
                        onChange={(colors) => updateStockEntry(entry.id, 'color', colors)}
                        multiSelect={true}
                        placeholder="Select colors"
                        label="Color"
                      />
                    </div>

                    <div>
                      <TagsSelector
                        selectedTags={entry.tags}
                        onChange={(tags) => updateStockEntry(entry.id, 'tags', tags)}
                        placeholder="Select tags"
                        label="Tags"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Supplier Name
                      </label>
                      <input
                        type="text"
                        value={entry.supplierName}
                        onChange={(e) => updateStockEntry(entry.id, 'supplierName', e.target.value)}
                        placeholder="e.g., Hearing Aid Supplies Ltd"
                        className="w-full px-3 py-1 bg-gray-100 rounded-lg focus:outline-none "
                        style={{ fontFamily: 'Segoe UI' }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Purchase Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={entry.purchasePrice}
                        onChange={(e) => updateStockEntry(entry.id, 'purchasePrice', e.target.value)}
                        placeholder="e.g., 1500.00"
                        className="w-full px-3 py-1 bg-gray-100 rounded-lg focus:outline-none "
                        style={{ fontFamily: 'Segoe UI' }}
                      />
                      <div className="text-xs text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
                        Optional - cost per unit
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Warranty
                      </label>
                      <input
                        type="text"
                        value={entry.warranty}
                        onChange={(e) => updateStockEntry(entry.id, 'warranty', e.target.value)}
                        placeholder="e.g., 12 months"
                        className="w-full px-3 py-1 bg-gray-100 rounded-lg focus:outline-none "
                        style={{ fontFamily: 'Segoe UI' }}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Authorized By
                      </label>
                      <input
                        type="text"
                        value={entry.authorizedBy}
                        onChange={(e) => updateStockEntry(entry.id, 'authorizedBy', e.target.value)}
                        placeholder="e.g., John Smith"
                        className="w-full px-3 py-1 bg-gray-100 rounded-lg focus:outline-none "
                        style={{ fontFamily: 'Segoe UI' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm text-red-800" style={{ fontFamily: 'Segoe UI' }}>
                {error}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 ">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-1.5 text-sm border border-[#E5E7EB] bg-white text-[#4A5565] rounded-lg hover:bg-[#F9FAFB] transition-colors disabled:opacity-50 cursor-pointer"
              style={{ fontFamily: 'Segoe UI' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || stockEntries.every(entry => !entry.itemId || !entry.quantity)}
              className="px-6 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-[#ea580c] transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              style={{ fontFamily: 'Segoe UI' }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding Stock...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Add Stock ({stockEntries.filter(entry => entry.itemId && entry.quantity).length} items)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
