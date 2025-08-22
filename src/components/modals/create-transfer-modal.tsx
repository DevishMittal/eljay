'use client';

import React, { useState } from 'react';

interface TransferItem {
  id: number;
  item: string;
  quantity: string;
  condition: string;
  color: string;
  remarks: string;
}

interface CreateTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTransferModal({ isOpen, onClose }: CreateTransferModalProps) {
  const [formData, setFormData] = useState({
    transferType: 'Internal',
    urgencyLevel: 'Medium',
    fromLocation: '',
    toLocation: '',
    trackingNumber: '',
    shippingCost: '0.00',
    transferredDate: '2025-08-21',
    transferredBy: 'Staff',
    additionalNotes: ''
  });

  const [transferItems, setTransferItems] = useState<TransferItem[]>([
    {
      id: 1,
      item: '',
      quantity: '1',
      condition: 'New',
      color: '',
      remarks: ''
    }
  ]);

  const addTransferItem = () => {
    const newItem: TransferItem = {
      id: transferItems.length + 1,
      item: '',
      quantity: '1',
      condition: 'New',
      color: '',
      remarks: ''
    };
    setTransferItems([...transferItems, newItem]);
  };

  const updateTransferItem = (id: number, field: keyof TransferItem, value: string) => {
    setTransferItems(transferItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeTransferItem = (id: number) => {
    if (transferItems.length > 1) {
      setTransferItems(transferItems.filter(item => item.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Create transfer form submitted:', { formData, transferItems });
    onClose();
  };

  const totalItems = transferItems.length;
  const totalQuantity = transferItems.reduce((sum, item) => sum + parseInt(item.quantity || '0'), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#f97316] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                Create Inventory Transfer
              </h2>
              <p className="text-sm text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                Create a new inventory transfer between locations. All fields marked with * are required.
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Transfer Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
              Transfer Details
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Transfer Type *
                </label>
                <select
                  required
                  value={formData.transferType}
                  onChange={(e) => setFormData({ ...formData, transferType: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                  aria-label="Select transfer type"
                >
                  <option value="Internal">Internal</option>
                  <option value="Branch">Branch</option>
                  <option value="Repair">Repair</option>
                  <option value="External">External</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Urgency Level *
                </label>
                <select
                  required
                  value={formData.urgencyLevel}
                  onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                  aria-label="Select urgency level"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  From Location *
                </label>
                <select
                  required
                  value={formData.fromLocation}
                  onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                  aria-label="Select from location"
                >
                  <option value="">Select from location</option>
                  <option value="Main Warehouse">Main Warehouse</option>
                  <option value="Branch Office">Branch Office</option>
                  <option value="Repair Center">Repair Center</option>
                  <option value="Storage Facility">Storage Facility</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  To Location *
                </label>
                <select
                  required
                  value={formData.toLocation}
                  onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                  aria-label="Select to location"
                >
                  <option value="">Select to location</option>
                  <option value="Main Warehouse">Main Warehouse</option>
                  <option value="Branch Office">Branch Office</option>
                  <option value="Repair Center">Repair Center</option>
                  <option value="Storage Facility">Storage Facility</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={formData.trackingNumber}
                  onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                  placeholder="e.g., TRK123456"
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Shipping Cost (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.shippingCost}
                  onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Transferred Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.transferredDate}
                  onChange={(e) => setFormData({ ...formData, transferredDate: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                  Transferred By *
                </label>
                <select
                  required
                  value={formData.transferredBy}
                  onChange={(e) => setFormData({ ...formData, transferredBy: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: 'Segoe UI' }}
                  aria-label="Select transferred by"
                >
                  <option value="Staff">Staff</option>
                  <option value="Manager">Manager</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                Additional Notes
              </label>
              <textarea
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                placeholder="Any additional notes about this transfer..."
                rows={3}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                style={{ fontFamily: 'Segoe UI' }}
              />
            </div>
          </div>

          {/* Transfer Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                Transfer Items
              </h3>
              <button
                type="button"
                onClick={addTransferItem}
                className="flex items-center gap-2 px-4 py-2 bg-[#f97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors text-sm"
                style={{ fontFamily: 'Segoe UI' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                + Add Item
              </button>
            </div>

            <div className="space-y-4">
              {transferItems.map((item, index) => (
                <div key={item.id} className="border border-[#E5E7EB] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {index + 1}
                    </span>
                    {transferItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTransferItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        aria-label="Remove item"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Item *
                      </label>
                      <select
                        required
                        value={item.item}
                        onChange={(e) => updateTransferItem(item.id, 'item', e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                        style={{ fontFamily: 'Segoe UI' }}
                        aria-label="Select item"
                      >
                        <option value="">Select an item</option>
                        <option value="Phonak Audéo Paradise P90 Left">Phonak Audéo Paradise P90 Left</option>
                        <option value="Phonak Audéo Paradise P90 Right">Phonak Audéo Paradise P90 Right</option>
                        <option value="Oticon More 1 Universal">Oticon More 1 Universal</option>
                        <option value="Widex EVOKE 440">Widex EVOKE 440</option>
                        <option value="Signia Pure Charge&Go X">Signia Pure Charge&Go X</option>
                        <option value="Hearing Aid Cleaning Kit">Hearing Aid Cleaning Kit</option>
                        <option value="Zinc-Air Battery Size 312">Zinc-Air Battery Size 312</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Quantity *
                      </label>
                      <input
                        type="number"
                        required
                        value={item.quantity}
                        onChange={(e) => updateTransferItem(item.id, 'quantity', e.target.value)}
                        placeholder="1"
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                        style={{ fontFamily: 'Segoe UI' }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Condition
                      </label>
                      <select
                        value={item.condition}
                        onChange={(e) => updateTransferItem(item.id, 'condition', e.target.value)}
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                        style={{ fontFamily: 'Segoe UI' }}
                        aria-label="Select condition"
                      >
                        <option value="New">New</option>
                        <option value="Used">Used</option>
                        <option value="Refurbished">Refurbished</option>
                        <option value="Damaged">Damaged</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Color
                      </label>
                      <input
                        type="text"
                        value={item.color}
                        onChange={(e) => updateTransferItem(item.id, 'color', e.target.value)}
                        placeholder="e.g., Black, Brown, Silver"
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                        style={{ fontFamily: 'Segoe UI' }}
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Item Remarks
                      </label>
                      <input
                        type="text"
                        value={item.remarks}
                        onChange={(e) => updateTransferItem(item.id, 'remarks', e.target.value)}
                        placeholder="Any notes about this item..."
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                        style={{ fontFamily: 'Segoe UI' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transfer Summary */}
          <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
            <h3 className="text-lg font-medium text-[#101828] mb-4" style={{ fontFamily: 'Segoe UI' }}>
              Transfer Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                  Total Items:
                </span>
                <span className="ml-2 text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                  {totalItems}
                </span>
              </div>
              <div>
                <span className="text-sm text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                  Total Quantity:
                </span>
                <span className="ml-2 text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                  {totalQuantity} units
                </span>
              </div>
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
              Create Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
