"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { InventoryService } from "@/services/inventoryService";
import { InventoryItem } from "@/types";
import CustomDropdown from "@/components/ui/custom-dropdown";
import CustomCalendar from "@/components/ui/custom-calendar";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingItem?: InventoryItem;
  isEditMode?: boolean;
}

export default function AddItemModal({
  isOpen,
  onClose,
  onSuccess,
  editingItem,
  isEditMode = false,
}: AddItemModalProps) {
  // Helper functions for date formatting/parsing (avoid timezone shifts)
  const formatDateToYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const parseYYYYMMDD = (value: string) => {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };

  const initialFormData = useMemo(
    () => ({
      itemName: "",
      itemCode: "",
      brand: "",
      itemType: "accessories",
      category: "accessories",
      description: "",
      mrp: "",
      color: "",
      currentStock: "",
      minimumStock: "",
      maximumStock: "",
      status: "Active",
      expiresAt: "",
    }),
    []
  );

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpiryOpen, setIsExpiryOpen] = useState(false);
  const expiryButtonRef = useRef<HTMLButtonElement>(null);
  const expiryPopoverRef = useRef<HTMLDivElement>(null);

  // Dropdown options
  const itemTypeOptions = [
    { value: "accessories", label: "Accessories" },
    { value: "hearing_aid", label: "Hearing Aid" },
    { value: "battery", label: "Battery" },
    { value: "cleaning", label: "Cleaning" },
  ];

  const categoryOptions = [
    { value: "accessories", label: "Accessories" },
    { value: "hearing_aid", label: "Hearing Aid" },
    { value: "battery", label: "Battery" },
    { value: "cleaning", label: "Cleaning" },
  ];

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
          expiresAt: editingItem.expiresAt
            ? editingItem.expiresAt.split("T")[0]
            : "",
        });
      } else {
        setFormData(initialFormData);
      }
      setError(null);
    }
  }, [isOpen, editingItem, isEditMode, initialFormData]);

  // Close expiry popover on outside click / Escape
  useEffect(() => {
    if (!isExpiryOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        expiryPopoverRef.current &&
        !expiryPopoverRef.current.contains(target) &&
        expiryButtonRef.current &&
        !expiryButtonRef.current.contains(target)
      ) {
        setIsExpiryOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsExpiryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExpiryOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (
        !formData.itemName ||
        !formData.brand ||
        !formData.mrp ||
        !formData.currentStock ||
        !formData.minimumStock ||
        !formData.maximumStock
      ) {
        setError("Please fill in all required fields");
        return;
      }

      // Validate numeric fields
      if (
        isNaN(parseFloat(formData.mrp)) ||
        isNaN(parseInt(formData.currentStock)) ||
        isNaN(parseInt(formData.minimumStock)) ||
        isNaN(parseInt(formData.maximumStock))
      ) {
        setError("Please enter valid numbers for MRP and stock fields");
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
          const date = new Date(formData.expiresAt + "T00:00:00.000Z");
          if (!isNaN(date.getTime())) {
            // Check if the date is not in the past
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (date < today) {
              setError("Expiry date cannot be in the past");
              return;
            }
            payload.expiresAt = date.toISOString();
          } else {
            setError("Please enter a valid expiry date");
            return;
          }
        } catch {
          setError("Please enter a valid expiry date");
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
      let errorMessage = isEditMode
        ? "Failed to update inventory item"
        : "Failed to create inventory item";

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "object" && err !== null && "message" in err) {
        errorMessage = String(err.message);
      }

      // Handle specific validation errors
      if (
        errorMessage.includes("Validation failed") ||
        errorMessage.includes("Invalid datetime")
      ) {
        errorMessage =
          "Please check your input. Make sure all required fields are filled and dates are in correct format.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  backdrop-blur-xs bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            
            <div>
              <h2
                className="text-lg font-semibold text-[#101828]"
                style={{ fontFamily: "Segoe UI" }}
              >
                {isEditMode ? "Edit Inventory Item" : "Add New Inventory Item"}
              </h2>
              <p
                className="text-sm text-[#4A5565]"
                style={{ fontFamily: "Segoe UI" }}
              >
                {isEditMode
                  ? "Update the inventory item information below."
                  : "Create a new inventory item by filling out the required information below."}
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
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label
                  className="block text-xs font-medium text-[#101828] mb-2"
                  style={{ fontFamily: "Segoe UI" }}
                >
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.itemName}
                  onChange={(e) =>
                    setFormData({ ...formData, itemName: e.target.value })
                  }
                  placeholder="e.g., Phonak Audéo Paradise P90"
                  className="w-full px-3 py-1 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: "Segoe UI" }}
                />
              </div>

              <div className="mt-7">
                <label
                  className="block text-xs font-medium text-[#101828] mb-2"
                  style={{ fontFamily: "Segoe UI" }}
                >
                  Brand *
                </label>
                <input
                  type="text"
                  required
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  placeholder="e.g., Phonak"
                  className="w-full px-3 py-1 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: "Segoe UI" }}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-[#101828] mb-2"
                  style={{ fontFamily: "Segoe UI" }}
                >
                  Item Type *
                </label>
                <CustomDropdown
                  options={itemTypeOptions}
                  value={formData.itemType}
                  onChange={(value) =>
                    setFormData({ ...formData, itemType: value })
                  }
                  placeholder="Select item type"
                  className="w-full h-10 "
                  aria-label="Select item type"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-[#101828] mb-2"
                  style={{ fontFamily: "Segoe UI" }}
                >
                  Category *
                </label>
                <CustomDropdown
                  options={categoryOptions}
                  value={formData.category}
                  onChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                  placeholder="Select category"
                  className="w-full h-10"
                  aria-label="Select category"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-[#101828] mb-2"
                  style={{ fontFamily: "Segoe UI" }}
                >
                  Minimum Stock *
                </label>
                <input
                  type="number"
                  required
                  value={formData.minimumStock}
                  onChange={(e) =>
                    setFormData({ ...formData, minimumStock: e.target.value })
                  }
                  placeholder="e.g., 5"
                  className="w-full px-3 py-1 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: "Segoe UI" }}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="mb-2">
                <label
                  className="block text-xs font-medium text-[#101828] mb-2"
                  style={{ fontFamily: "Segoe UI" }}
                >
                  Item Code
                </label>
                <input
                  type="text"
                  value={formData.itemCode}
                  onChange={(e) =>
                    setFormData({ ...formData, itemCode: e.target.value })
                  }
                  placeholder="e.g., PHK-AP90-312"
                  className="w-full px-3 py-1 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: "Segoe UI" }}
                />
                <div
                  className="text-xs text-[#4A5565] mt-1"
                  style={{ fontFamily: "Segoe UI" }}
                >
                  Optional: Unique identifier or SKU for the item
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-[#101828] mb-2"
                  style={{ fontFamily: "Segoe UI" }}
                >
                  MRP (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.mrp}
                  onChange={(e) =>
                    setFormData({ ...formData, mrp: e.target.value })
                  }
                  placeholder="e.g., 135000"
                  className="w-full px-3 py-1 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: "Segoe UI" }}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-[#101828] mb-2"
                  style={{ fontFamily: "Segoe UI" }}
                >
                  Color *
                </label>
                <input
                  type="text"
                  required
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  placeholder="e.g., Blue, Silver, Black"
                  className="w-full px-3 py-1 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: "Segoe UI" }}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-[#101828] mb-2"
                  style={{ fontFamily: "Segoe UI" }}
                >
                  Current Stock *
                </label>
                <input
                  type="number"
                  required
                  value={formData.currentStock}
                  onChange={(e) =>
                    setFormData({ ...formData, currentStock: e.target.value })
                  }
                  placeholder="e.g., 10"
                  className="w-full px-3 py-1 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: "Segoe UI" }}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-[#101828] mb-2"
                  style={{ fontFamily: "Segoe UI" }}
                >
                  Maximum Stock *
                </label>
                <input
                  type="number"
                  required
                  value={formData.maximumStock}
                  onChange={(e) =>
                    setFormData({ ...formData, maximumStock: e.target.value })
                  }
                  placeholder="e.g., 50"
                  className="w-full px-3 py-1 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
                  style={{ fontFamily: "Segoe UI" }}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-[#101828] mb-2"
                  style={{ fontFamily: "Segoe UI" }}
                >
                  Expiry Date
                </label>
                <div className="relative">
                  <button
                    ref={expiryButtonRef}
                    type="button"
                    aria-label="Select expiry date"
                    onClick={() => setIsExpiryOpen((o) => !o)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent text-left flex items-center justify-between"
                    style={{
                      fontFamily: "Segoe UI",
                      color: formData.expiresAt ? "#374151" : "#9CA3AF",
                    }}
                  >
                    <span className="truncate">
                      {formData.expiresAt ? formData.expiresAt : "Select date"}
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-500 ml-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V5a1 1 0 011-1h6a1 1 0 011 1v2m-9 4h10m-10 4h6M5 7h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z"
                      />
                    </svg>
                  </button>

                  {isExpiryOpen && (
                    <div
                      ref={expiryPopoverRef}
                      className="absolute z-50 left-0 right-auto mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
                    >
                      <CustomCalendar
                        value={
                          formData.expiresAt
                            ? parseYYYYMMDD(formData.expiresAt)
                            : undefined
                        }
                        onChange={(date) => {
                          setFormData({
                            ...formData,
                            expiresAt: formatDateToYYYYMMDD(date),
                          });
                          setIsExpiryOpen(false);
                        }}
                        minDate={(() => {
                          const t = new Date();
                          t.setHours(0, 0, 0, 0);
                          return t;
                        })()}
                        className="w-[18rem]"
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div
                    className="text-xs text-[#4A5565]"
                    style={{ fontFamily: "Segoe UI" }}
                  >
                    Optional: Leave empty if no expiry date. Use YYYY-MM-DD
                    format (e.g., 2025-12-31)
                  </div>
                  {formData.expiresAt && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, expiresAt: "" })
                      }
                      className="text-xs text-orange-600 hover:underline"
                    >
                      Clear date
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label
              className="block text-xs font-medium text-[#101828] mb-2"
              style={{ fontFamily: "Segoe UI" }}
            >
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter item description, features, specifications..."
              rows={4}
              className="w-full px-3 py-2 bg-gray-100 h-24 rounded-lg "
              style={{ fontFamily: "Segoe UI" }}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-6 ">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-1.5 text-sm  border border-[#E5E7EB] bg-white text-[#4A5565] rounded-lg hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
              style={{ fontFamily: "Segoe UI" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-[#ea580c] transition-colors disabled:opacity-50 flex items-center gap-2"
              style={{ fontFamily: "Segoe UI" }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEditMode ? "Updating..." : "Adding..."}
                </>
              ) : isEditMode ? (
                "Update Item"
              ) : (
                "Add Item"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
