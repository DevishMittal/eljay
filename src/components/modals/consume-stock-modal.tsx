'use client';

import React, { useState } from 'react';

interface ConsumeStockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConsumeStockModal({ isOpen, onClose }: ConsumeStockModalProps) {
  const [formData, setFormData] = useState({
    selectedItem: '',
    consumptionDate: '2025-08-21',
    consumptionType: 'Services',
    quantity: '',
    serialNumbers: '',
    reason: '',
    authorizedBy: 'Current User',
    patientId: '',
    patientName: '',
    additionalNotes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Consume stock form submitted:', formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                Consume Stock
              </h2>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Select Item to Consume */}
          <div>
            <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
              Select Item to Consume *
            </label>
            <select
              required
              value={formData.selectedItem}
              onChange={(e) => setFormData({ ...formData, selectedItem: e.target.value })}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              style={{ fontFamily: 'Segoe UI' }}
              aria-label="Select item to consume"
            >
              <option value="">Choose an item from inventory</option>
              <option value="Hearing Aid Cleaning Kit">Hearing Aid Cleaning Kit</option>
              <option value="Oticon ConnectClip">Oticon ConnectClip</option>
              <option value="Oticon More 1 Universal">Oticon More 1 Universal</option>
              <option value="Phonak Audéo Paradise P90 Left">Phonak Audéo Paradise P90 Left</option>
              <option value="Phonak Audéo Paradise P90 Right">Phonak Audéo Paradise P90 Right</option>
            </select>
            <div className="text-xs text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
              Only items with available stock are shown
            </div>
          </div>

          {/* Consumption Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
              Consumption Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Consumption Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.consumptionDate}
                  onChange={(e) => setFormData({ ...formData, consumptionDate: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Consumption Type *
                </label>
                <select
                  required
                  value={formData.consumptionType}
                  onChange={(e) => setFormData({ ...formData, consumptionType: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                  aria-label="Select consumption type"
                >
                  <option value="Services">Services</option>
                  <option value="Sales">Sales</option>
                  <option value="Demo">Demo</option>
                  <option value="Warranty">Warranty</option>
                  <option value="Defective">Defective</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Quantity *
                </label>
                <input
                  type="number"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="e.g., 2"
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Serial Number(s)
                </label>
                <textarea
                  value={formData.serialNumbers}
                  onChange={(e) => setFormData({ ...formData, serialNumbers: e.target.value })}
                  placeholder="Enter serial numbers separated by commas (e.g., SN001, SN002)"
                  rows={2}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                />
                <div className="text-xs text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
                  Optional - for tracked items only
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                Reason *
              </label>
              <textarea
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="e.g., Patient fitting, Demonstration, Defective unit, Warranty expired"
                rows={3}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                style={{ fontFamily: 'Segoe UI' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                Authorized By
              </label>
              <input
                type="text"
                value={formData.authorizedBy}
                readOnly
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg bg-gray-50 text-[#4A5565]"
                style={{ fontFamily: 'Segoe UI' }}
              />
              <div className="text-xs text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
                This field is automatically filled
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
              Patient Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Patient ID
                </label>
                <input
                  type="text"
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  placeholder="e.g., PAT001"
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Patient Name
                </label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  placeholder="e.g., Robert Wilson"
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
              Additional Notes
            </label>
            <textarea
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              placeholder="Any additional notes about this stock consumption..."
              rows={3}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
              style={{ fontFamily: 'Segoe UI' }}
            />
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
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              style={{ fontFamily: 'Segoe UI' }}
            >
              Consume Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
