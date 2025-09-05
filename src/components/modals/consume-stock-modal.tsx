'use client';

import React, { useState, useRef, useEffect } from 'react';
import CustomCalendar from '@/components/ui/custom-calendar';
import CustomDropdown from '@/components/ui/custom-dropdown';
import { InventoryService } from '@/services/inventoryService';
import { InventoryItem } from '@/types';

interface ConsumeStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ConsumeStockModal({ isOpen, onClose, onSuccess }: ConsumeStockModalProps) {
  const [formData, setFormData] = useState({
    selectedItem: '',
    consumptionDate: new Date(),
    consumptionType: 'Services',
    quantity: '',
    serialNumbers: '',
    reason: '',
    authorizedBy: 'Current User',
    patientId: '',
    patientName: '',
    additionalNotes: ''
  });
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch inventory items when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchInventoryItems();
    }
  }, [isOpen]);

  // Fetch inventory items
  const fetchInventoryItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await InventoryService.getInventoryItems(1, 100); // Get first 100 items
      // Filter items that have stock available
      const itemsWithStock = response.items.filter(item => item.currentStock > 0);
      setInventoryItems(itemsWithStock);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inventory items';
      setError(errorMessage);
      console.error('Error fetching inventory items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Dropdown options
  const itemOptions = [
    { value: '', label: 'Choose an item from inventory' },
    ...inventoryItems.map(item => ({
      value: item.id,
      label: `${item.itemName} (${item.itemCode}) - Stock: ${item.currentStock}`
    }))
  ];

  const consumptionTypeOptions = [
    { value: 'Services', label: 'Services' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Demo', label: 'Demo' },
    { value: 'Warranty', label: 'Warranty' },
    { value: 'Defective', label: 'Defective' },
  ];

  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCalendar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.selectedItem || !formData.quantity) {
        throw new Error('Please select an item and enter quantity');
      }

      const additionalData = {
        authorizedBy: formData.authorizedBy || undefined,
        // Add consumption-specific data if needed
        reason: formData.reason || undefined,
        consumptionType: formData.consumptionType || undefined,
        patientId: formData.patientId || undefined,
        patientName: formData.patientName || undefined,
        additionalNotes: formData.additionalNotes || undefined,
      };

      await InventoryService.updateStock(
        formData.selectedItem,
        parseInt(formData.quantity),
        'consume',
        additionalData
      );
      
      // Call success callback and close modal
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to consume stock';
      setError(errorMessage);
      console.error('Error consuming stock:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            
            <div>
              <h2 className="text-lg font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                Consume Stock
              </h2>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Select Item to Consume */}
          <div>
            <label className="block text-xs font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
              Select Item to Consume *
            </label>
            <CustomDropdown
              options={itemOptions}
              value={formData.selectedItem}
              onChange={(value) => setFormData({ ...formData, selectedItem: value })}
              placeholder="Choose an item from inventory"
              aria-label="Select item to consume"
            />
            <div className="text-xs text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
              Only items with available stock are shown
            </div>
          </div>

          {/* Consumption Details */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
              Consumption Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-xs font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Consumption Date *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    readOnly
                    value={formData.consumptionDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full px-3 py-1 bg-gray-100 rounded-lg  focus:border-transparent cursor-pointer"
                    style={{ fontFamily: 'Segoe UI' }}
                    placeholder="Select date"
                    aria-label="Consumption date"
                    title="Consumption date"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label="Open calendar"
                    title="Open calendar"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                {showCalendar && (
                  <div 
                    ref={calendarRef} 
                    className="absolute top-full mt-1 z-[60]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <CustomCalendar
                      value={formData.consumptionDate}
                      onChange={(date) => {
                        setFormData({ ...formData, consumptionDate: date });
                        setShowCalendar(false);
                      }}
                      className="shadow-lg"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Consumption Type *
                </label>
                <CustomDropdown
                  options={consumptionTypeOptions}
                  value={formData.consumptionType}
                  onChange={(value) => setFormData({ ...formData, consumptionType: value })}
                  placeholder="Select consumption type"
                  aria-label="Select consumption type"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Quantity *
                </label>
                <input
                  type="number"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="e.g., 2"
                  className="w-full px-3 py-1 bg-gray-100 rounded-lg  focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Serial Number(s)
                </label>
                <textarea
                  value={formData.serialNumbers}
                  onChange={(e) => setFormData({ ...formData, serialNumbers: e.target.value })}
                  placeholder="Enter serial numbers separated by commas (e.g., SN001, SN002)"
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-100 rounded-lg  focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                />
                <div className="text-xs text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
                  Optional - for tracked items only
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                Reason *
              </label>
              <textarea
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="e.g., Patient fitting, Demonstration, Defective unit, Warranty expired"
                rows={3}
                className="w-full px-3 py-2 bg-gray-100 rounded-lg  focus:border-transparent"
                style={{ fontFamily: 'Segoe UI' }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                Authorized By
              </label>
              <input
                type="text"
                value={formData.authorizedBy}
                readOnly
                className="w-full px-3 py-2 bg-gray-100 rounded-lg text-[#4A5565]  focus:border-transparent"
                style={{ fontFamily: 'Segoe UI' }}
              />
              <div className="text-xs text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
                This field is automatically filled
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
              Patient Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Patient ID
                </label>
                <input
                  type="text"
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  placeholder="e.g., PAT001"
                  className="w-full px-3 py-1 bg-gray-100 rounded-lg  focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Patient Name
                </label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  placeholder="e.g., Robert Wilson"
                  className="w-full px-3 py-1 bg-gray-100 rounded-lg  focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
              Additional Notes
            </label>
            <textarea
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              placeholder="Any additional notes about this stock consumption..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-100 rounded-lg  focus:border-transparent"
              style={{ fontFamily: 'Segoe UI' }}
            />
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
          <div className="flex justify-end gap-3 pt-6">
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
              disabled={loading || !formData.selectedItem || !formData.quantity}
              className="px-6 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              style={{ fontFamily: 'Segoe UI' }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Consuming Stock...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                  Consume Stock
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
