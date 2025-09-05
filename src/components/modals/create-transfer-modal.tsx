"use client";

import React, { useState, useRef, useEffect } from "react";
import CustomCalendar from "@/components/ui/custom-calendar";
import CustomDropdown from "@/components/ui/custom-dropdown";
import { InventoryTransferService } from "@/services/inventoryTransferService";
import { InventoryService } from "@/services/inventoryService";
import { CreateTransferData, InventoryItem } from "@/types";

interface TransferItem {
  id: number;
  inventoryItemId: string;
  quantity: string;
  condition: string;
  color: string;
  itemRemarks: string;
}

interface CreateTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransferCreated?: () => void;
}

export default function CreateTransferModal({
  isOpen,
  onClose,
  onTransferCreated,
}: CreateTransferModalProps) {
  const [formData, setFormData] = useState({
    transferType: "Internal" as "Internal" | "Branch" | "Repair" | "External",
    urgencyLevel: "Medium" as "Low" | "Medium" | "High" | "Critical",
    fromLocation: "",
    toLocation: "",
    trackingNumber: "",
    shippingCost: 0,
    transferredDate: new Date(),
    transferredBy: "Staff",
    additionalNotes: "",
  });

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch inventory items when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchInventoryItems = async () => {
        try {
          const response = await InventoryService.getInventoryItems(1, 100);
          setInventoryItems(response.items);
        } catch (error) {
          console.error('Error fetching inventory items:', error);
        }
      };
      fetchInventoryItems();
    }
  }, [isOpen]);

  // Dropdown options
  const transferTypeOptions = [
    { value: "Internal", label: "Internal" },
    { value: "Branch", label: "Branch" },
    { value: "Repair", label: "Repair" },
    { value: "External", label: "External" },
  ];

  const urgencyLevelOptions = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
    { value: "Critical", label: "Critical" },
  ];

  const locationOptions = [
    { value: "", label: "Select location" },
    { value: "Main Warehouse", label: "Main Warehouse" },
    { value: "Branch Office", label: "Branch Office" },
    { value: "Repair Center", label: "Repair Center" },
    { value: "Storage Facility", label: "Storage Facility" },
  ];

  const transferredByOptions = [
    { value: "Staff", label: "Staff" },
    { value: "Manager", label: "Manager" },
    { value: "Supervisor", label: "Supervisor" },
    { value: "Admin", label: "Admin" },
  ];

  // Transfer items dropdown options
  const itemOptions = [
    { value: "", label: "Select an item" },
    ...inventoryItems.map(item => ({
      value: item.id,
      label: `${item.itemName} (${item.itemCode}) - Stock: ${item.currentStock}`,
    })),
  ];

  const conditionOptions = [
    { value: "New", label: "New" },
    { value: "Used", label: "Used" },
    { value: "Refurbished", label: "Refurbished" },
    { value: "Damaged", label: "Damaged" },
  ];

  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showCalendar]);

  const [transferItems, setTransferItems] = useState<TransferItem[]>([
    {
      id: 1,
      inventoryItemId: "",
      quantity: "1",
      condition: "New",
      color: "",
      itemRemarks: "",
    },
  ]);

  const addTransferItem = () => {
    const newItem: TransferItem = {
      id: transferItems.length + 1,
      inventoryItemId: "",
      quantity: "1",
      condition: "New",
      color: "",
      itemRemarks: "",
    };
    setTransferItems([...transferItems, newItem]);
  };

  const updateTransferItem = (
    id: number,
    field: keyof TransferItem,
    value: string
  ) => {
    setTransferItems(
      transferItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeTransferItem = (id: number) => {
    if (transferItems.length > 1) {
      setTransferItems(transferItems.filter((item) => item.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.fromLocation || !formData.toLocation || !formData.transferredBy) {
      alert('Please fill in all required fields');
      return;
    }

    if (transferItems.some(item => !item.inventoryItemId || !item.quantity)) {
      alert('Please fill in all item details');
      return;
    }

    try {
      setSubmitting(true);
      
      const transferData: CreateTransferData = {
        transferType: formData.transferType,
        urgencyLevel: formData.urgencyLevel,
        fromLocation: formData.fromLocation,
        toLocation: formData.toLocation,
        trackingNumber: formData.trackingNumber,
        shippingCost: formData.shippingCost,
        transferredDate: formData.transferredDate.toISOString().split("T")[0],
        transferredBy: formData.transferredBy,
        additionalNotes: formData.additionalNotes,
        transferItems: transferItems.map(item => ({
          inventoryItemId: item.inventoryItemId,
          quantity: parseInt(item.quantity),
          condition: item.condition,
          color: item.color,
          itemRemarks: item.itemRemarks,
        })),
      };

      await InventoryTransferService.createInventoryTransfer(transferData);
      
      // Reset form
      setFormData({
        transferType: "Internal",
        urgencyLevel: "Medium",
        fromLocation: "",
        toLocation: "",
        trackingNumber: "",
        shippingCost: 0,
        transferredDate: new Date(),
        transferredBy: "Staff",
        additionalNotes: "",
      });
      
      setTransferItems([{
        id: 1,
        inventoryItemId: "",
        quantity: "1",
        condition: "New",
        color: "",
        itemRemarks: "",
      }]);

      onTransferCreated?.();
      onClose();
    } catch (error) {
      console.error('Error creating transfer:', error);
      alert('Failed to create transfer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalItems = transferItems.length;
  const totalQuantity = transferItems.reduce(
    (sum, item) => sum + parseInt(item.quantity || "0"),
    0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto border-2 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 ">
          <div className="flex items-center gap-3">
            <div>
              <h2
                className="text-xl font-semibold text-[#101828]"
                style={{ fontFamily: "Segoe UI" }}
              >
                Create Inventory Transfer
              </h2>
              <p
                className="text-sm text-[#4A5565]"
                style={{ fontFamily: "Segoe UI" }}
              >
                Create a new inventory transfer between locations. All fields
                marked with * are required.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#4A5565] hover:text-[#101828] transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Transfer Details */}
          <div className="space-y-4">
            <h3
              className="text-lg font-medium text-[#101828]"
              style={{ fontFamily: "Segoe UI" }}
            >
              Transfer Details
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium text-[#101828] mb-2"
                  style={{ fontFamily: "Segoe UI" }}
                >
                  Transfer Type *
                </label>
                <CustomDropdown
                  options={transferTypeOptions}
                  value={formData.transferType}
                  onChange={(value) =>
                    setFormData({ ...formData, transferType: value as typeof formData.transferType })
                  }
                  placeholder="Select transfer type"
                  aria-label="Select transfer type"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-[#101828] mb-2"
                  style={{ fontFamily: "Segoe UI" }}
                >
                  Urgency Level *
                </label>
                <CustomDropdown
                  options={urgencyLevelOptions}
                  value={formData.urgencyLevel}
                  onChange={(value) =>
                    setFormData({ ...formData, urgencyLevel: value as typeof formData.urgencyLevel })
                  }
                  placeholder="Select urgency level"
                  aria-label="Select urgency level"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-[#101828] mb-2"
                  style={{ fontFamily: "Segoe UI" }}
                >
                  From Location *
                </label>
                <CustomDropdown
                  options={locationOptions}
                  value={formData.fromLocation}
                  onChange={(value) =>
                    setFormData({ ...formData, fromLocation: value })
                  }
                  placeholder="Select from location"
                  aria-label="Select from location"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-[#101828] mb-2"
                  style={{ fontFamily: "Segoe UI" }}
                >
                  To Location *
                </label>
                <CustomDropdown
                  options={locationOptions}
                  value={formData.toLocation}
                  onChange={(value) =>
                    setFormData({ ...formData, toLocation: value })
                  }
                  placeholder="Select to location"
                  aria-label="Select to location"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-[#101828] mb-2"
                  style={{ fontFamily: "Segoe UI" }}
                >
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={formData.trackingNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, trackingNumber: e.target.value })
                  }
                  placeholder="e.g., TRK123456"
                  className="w-full px-3 py-1 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: "Segoe UI" }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-[#101828] mb-2"
                  style={{ fontFamily: "Segoe UI" }}
                >
                  Shipping Cost (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.shippingCost}
                  onChange={(e) =>
                    setFormData({ ...formData, shippingCost: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                  className="w-full px-3 py-1 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: "Segoe UI" }}
                />
              </div>

              <div className="relative">
                <label
                  className="block text-sm font-medium text-[#101828] mb-2"
                  style={{ fontFamily: "Segoe UI" }}
                >
                  Transferred Date *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    readOnly
                    value={formData.transferredDate.toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full px-3 py-1 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent cursor-pointer"
                    style={{ fontFamily: "Segoe UI" }}
                    placeholder="Select date"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label="Open calendar"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
                {showCalendar && (
                  <div
                    ref={calendarRef}
                    className="absolute top-full mt-1 z-50"
                  >
                    <CustomCalendar
                      value={formData.transferredDate}
                      onChange={(date) => {
                        setFormData({ ...formData, transferredDate: date });
                        setShowCalendar(false);
                      }}
                      className="shadow-lg"
                    />
                  </div>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-[#101828] mb-2"
                  style={{ fontFamily: "Segoe UI" }}
                >
                  Transferred By *
                </label>
                <CustomDropdown
                  options={transferredByOptions}
                  value={formData.transferredBy}
                  onChange={(value) =>
                    setFormData({ ...formData, transferredBy: value })
                  }
                  placeholder="Select transferred by"
                  aria-label="Select transferred by"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium text-[#101828] mb-2"
                style={{ fontFamily: "Segoe UI" }}
              >
                Additional Notes
              </label>
              <textarea
                value={formData.additionalNotes}
                onChange={(e) =>
                  setFormData({ ...formData, additionalNotes: e.target.value })
                }
                placeholder="Any additional notes about this transfer..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                style={{ fontFamily: "Segoe UI" }}
              />
            </div>
          </div>

          {/* Transfer Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3
                className="text-lg font-medium text-[#101828]"
                style={{ fontFamily: "Segoe UI" }}
              >
                Transfer Items
              </h3>
              <button
                type="button"
                onClick={addTransferItem}
                className="flex items-center gap-2 px-4 py-1.5 bg-primary text-white rounded-lg hover:bg-[#ea580c] transition-colors text-sm"
                style={{ fontFamily: "Segoe UI" }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {transferItems.map((item, index) => (
                <div
                  key={item.id}
                  className="border border-[#E5E7EB] rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-sm font-medium text-[#101828]"
                      style={{ fontFamily: "Segoe UI" }}
                    >
                      {index + 1}
                    </span>
                    {transferItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTransferItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        aria-label="Remove item"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm font-medium text-[#101828] mb-2"
                        style={{ fontFamily: "Segoe UI" }}
                      >
                        Item *
                      </label>
                      <CustomDropdown
                        options={itemOptions}
                        value={item.inventoryItemId}
                        onChange={(value) =>
                          updateTransferItem(item.id, "inventoryItemId", value)
                        }
                        placeholder="Select an item"
                        aria-label="Select item"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium text-[#101828] mb-2"
                        style={{ fontFamily: "Segoe UI" }}
                      >
                        Quantity *
                      </label>
                      <input
                        type="number"
                        required
                        value={item.quantity}
                        onChange={(e) =>
                          updateTransferItem(
                            item.id,
                            "quantity",
                            e.target.value
                          )
                        }
                        placeholder="1"
                        className="w-full px-3 py-1 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                        style={{ fontFamily: "Segoe UI" }}
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium text-[#101828] mb-2"
                        style={{ fontFamily: "Segoe UI" }}
                      >
                        Condition
                      </label>
                      <CustomDropdown
                        options={conditionOptions}
                        value={item.condition}
                        onChange={(value) =>
                          updateTransferItem(item.id, "condition", value)
                        }
                        placeholder="Select condition"
                        aria-label="Select condition"
                      />
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium text-[#101828] mb-2"
                        style={{ fontFamily: "Segoe UI" }}
                      >
                        Color
                      </label>
                      <input
                        type="text"
                        value={item.color}
                        onChange={(e) =>
                          updateTransferItem(item.id, "color", e.target.value)
                        }
                        placeholder="e.g., Black, Brown, Silver"
                        className="w-full px-3 py-1 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                        style={{ fontFamily: "Segoe UI" }}
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label
                        className="block text-sm font-medium text-[#101828] mb-2"
                        style={{ fontFamily: "Segoe UI" }}
                      >
                        Item Remarks
                      </label>
                      <input
                        type="text"
                        value={item.itemRemarks}
                        onChange={(e) =>
                          updateTransferItem(item.id, "itemRemarks", e.target.value)
                        }
                        placeholder="Any notes about this item..."
                        className="w-full px-3 py-1 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                        style={{ fontFamily: "Segoe UI" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transfer Summary */}
          <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
            <h3
              className="text-lg font-medium text-[#101828] mb-4"
              style={{ fontFamily: "Segoe UI" }}
            >
              Transfer Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span
                  className="text-sm text-[#4A5565]"
                  style={{ fontFamily: "Segoe UI" }}
                >
                  Total Items:
                </span>
                <span
                  className="ml-2 text-sm font-medium text-[#101828]"
                  style={{ fontFamily: "Segoe UI" }}
                >
                  {totalItems}
                </span>
              </div>
              <div>
                <span
                  className="text-sm text-[#4A5565]"
                  style={{ fontFamily: "Segoe UI" }}
                >
                  Total Quantity:
                </span>
                <span
                  className="ml-2 text-sm font-medium text-[#101828]"
                  style={{ fontFamily: "Segoe UI" }}
                >
                  {totalQuantity} units
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 ]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-1.5 border border-[#E5E7EB] bg-white text-[#4A5565] rounded-lg hover:bg-[#F9FAFB] transition-colors"
              style={{ fontFamily: "Segoe UI" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-1.5 bg-primary text-white rounded-lg hover:bg-[#ea580c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "Segoe UI" }}
            >
              {submitting ? 'Creating...' : 'Create Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
