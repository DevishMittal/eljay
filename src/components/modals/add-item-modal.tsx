'use client';

import React, { useState, useEffect } from 'react';
import { InventoryService } from '@/services/inventoryService';
import { InventoryItem } from '@/types';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingItem?: InventoryItem;
  isEditMode?: boolean;
}

export default function AddItemModal({ isOpen, onClose, onSuccess, editingItem, isEditMode = false }: AddItemModalProps) {
  const initialFormData = {
    itemName: '',
    itemCode: '',
    brand: '',
    itemType: 'accessories',
    category: 'accessories',
    description: '',
    mrp: '',
    color: '',
    currentStock: '',
    minimumStock: '',
    maximumStock: '',
    status: 'Active',
    expiresAt: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes or when editing item changes
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingItem) {
        // Populate form with editing item data
        setFormData({
          itemName: editingItem.itemName,
          itemCode: editingItem.itemCode,
          brand: editingItem.brand,
          itemType: editingItem.itemType,
          category: editingItem.category,
          description: editingItem.description,
          mrp: editingItem.mrp.toString(),
          color: editingItem.color,
          currentStock: editingItem.currentStock.toString(),
          minimumStock: editingItem.minimumStock.toString(),
          maximumStock: editingItem.maximumStock.toString(),
          status: editingItem.status,
          expiresAt: editingItem.expiresAt ? editingItem.expiresAt.split('T')[0] : ''
        });
      } else {
        setFormData(initialFormData);
      }
      setError(null);
    }
  }, [isOpen, editingItem, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      // Validate required fields
      if (!formData.itemName || !formData.brand || !formData.mrp || !formData.currentStock || !formData.minimumStock || !formData.maximumStock) {
        setError('Please fill in all required fields');
        return;
      }

      // Validate numeric fields
      if (isNaN(parseFloat(formData.mrp)) || isNaN(parseInt(formData.currentStock)) || isNaN(parseInt(formData.minimumStock)) || isNaN(parseInt(formData.maximumStock))) {
        setError('Please enter valid numbers for MRP and stock fields');
        return;
      }

      const payload = {
        ...formData,
        mrp: parseFloat(formData.mrp),
        currentStock: parseInt(formData.currentStock),
        minimumStock: parseInt(formData.minimumStock),
        maximumStock: parseInt(formData.maximumStock),
      };

      // Only add expiresAt if it's provided and convert to proper ISO format
      if (formData.expiresAt) {
        try {
          // Parse the date and ensure it's in the correct format
          const date = new Date(formData.expiresAt + 'T00:00:00.000Z');
          if (!isNaN(date.getTime())) {
            // Check if the date is not in the past
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (date < today) {
              setError('Expiry date cannot be in the past');
              return;
            }
            payload.expiresAt = date.toISOString();
          } else {
            setError('Please enter a valid expiry date');
            return;
          }
        } catch (dateError) {
          setError('Please enter a valid expiry date');
          return;
        }
      }

      if (isEditMode && editingItem) {
        // Update existing item
        await InventoryService.updateInventoryItem(editingItem.id, payload);
      } else {
        // Create new item
        await InventoryService.createInventoryItem(payload);
      }
      
      onSuccess?.();
      onClose();
    } catch (err) {
      let errorMessage = isEditMode ? 'Failed to update inventory item' : 'Failed to create inventory item';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = String(err.message);
      }
      
      // Handle specific validation errors
      if (errorMessage.includes('Validation failed') || errorMessage.includes('Invalid datetime')) {
        errorMessage = 'Please check your input. Make sure all required fields are filled and dates are in correct format.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  backdrop-blur-xs bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
                         <div>
               <h2 className="text-xl font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                 {isEditMode ? 'Edit Inventory Item' : 'Add New Inventory Item'}
               </h2>
               <p className="text-sm text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                 {isEditMode 
                   ? 'Update the inventory item information below.' 
                   : 'Create a new inventory item by filling out the required information below.'
                 }
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  placeholder="e.g., Phonak Audéo Paradise P90"
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Brand *
                </label>
                <input
                  type="text"
                  required
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g., Phonak"
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Item Type *
                </label>
                <select
                  required
                  value={formData.itemType}
                  onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                  aria-label="Select item type"
                >
                  <option value="accessories">Accessories</option>
                  <option value="hearing_aid">Hearing Aid</option>
                  <option value="battery">Battery</option>
                  <option value="cleaning">Cleaning</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                  aria-label="Select category"
                >
                  <option value="accessories">Accessories</option>
                  <option value="hearing_aid">Hearing Aid</option>
                  <option value="battery">Battery</option>
                  <option value="cleaning">Cleaning</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Minimum Stock *
                </label>
                <input
                  type="number"
                  required
                  value={formData.minimumStock}
                  onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
                  placeholder="e.g., 5"
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Item Code
                </label>
                <input
                  type="text"
                  value={formData.itemCode}
                  onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                  placeholder="e.g., PHK-AP90-312"
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                />
                <div className="text-xs text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
                  Optional: Unique identifier or SKU for the item
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  MRP (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                  placeholder="e.g., 135000"
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Color *
                </label>
                <input
                  type="text"
                  required
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="e.g., Blue, Silver, Black"
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Current Stock *
                </label>
                <input
                  type="number"
                  required
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                  placeholder="e.g., 10"
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Maximum Stock *
                </label>
                <input
                  type="number"
                  required
                  value={formData.maximumStock}
                  onChange={(e) => setFormData({ ...formData, maximumStock: e.target.value })}
                  placeholder="e.g., 50"
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                  aria-label="Select expiry date"
                />
                <div className="text-xs text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
                  Optional: Leave empty if no expiry date. Use YYYY-MM-DD format (e.g., 2025-12-31)
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter item description, features, specifications..."
              rows={4}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              style={{ fontFamily: 'Segoe UI' }}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-[#E5E7EB] bg-white text-[#4A5565] rounded-lg hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
              style={{ fontFamily: 'Segoe UI' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#f97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors disabled:opacity-50 flex items-center gap-2"
              style={{ fontFamily: 'Segoe UI' }}
            >
                             {loading ? (
                 <>
                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                   {isEditMode ? 'Updating...' : 'Adding...'}
                 </>
               ) : (
                 isEditMode ? 'Update Item' : 'Add Item'
               )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
