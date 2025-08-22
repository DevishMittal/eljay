'use client';

import React, { useState } from 'react';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddItemModal({ isOpen, onClose }: AddItemModalProps) {
  const [formData, setFormData] = useState({
    itemName: '',
    brandName: '',
    itemType: 'Accessories',
    formFactor: 'Not Applicable',
    minimumStock: '',
    itemCode: '',
    mrp: '',
    category: 'Accessories',
    maximumStock: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                Add New Inventory Item
              </h2>
              <p className="text-sm text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                Create a new inventory item by filling out the required information below.
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
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
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
                >
                  <option value="Accessories">Accessories</option>
                  <option value="Hearing Aid">Hearing Aid</option>
                  <option value="Battery">Battery</option>
                  <option value="Cleaning">Cleaning</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Form Factor *
                </label>
                <div className="text-xs text-[#4A5565] mb-1" style={{ fontFamily: 'Segoe UI' }}>
                  (Not applicable for this item type)
                </div>
                <select
                  required
                  value={formData.formFactor}
                  onChange={(e) => setFormData({ ...formData, formFactor: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                >
                  <option value="Not Applicable">Not Applicable</option>
                  <option value="ITE">ITE</option>
                  <option value="ITC">ITC</option>
                  <option value="BTE">BTE</option>
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
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                >
                  <option value="Accessories">Accessories</option>
                  <option value="Hearing Aid">Hearing Aid</option>
                  <option value="Battery">Battery</option>
                  <option value="Cleaning">Cleaning</option>
                </select>
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[#E5E7EB]">
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
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
