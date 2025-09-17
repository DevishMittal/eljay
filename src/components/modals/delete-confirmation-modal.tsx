"use client";

import React from "react";
import { X, AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  loading?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  loading = false,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md border-2 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#101828]">
                Delete Item
              </h2>
              <p className="text-sm text-[#4A5565]">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-[#4A5565] hover:text-[#101828] transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Separator Line */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-6"></div>

        {/* Content */}
        <div className="p-6 pt-4">
          <p className="text-sm text-[#4A5565] mb-1">
            Are you sure you want to delete this inventory item?
          </p>
          <p className="text-sm font-medium text-[#101828] mb-4">
            &ldquo;{itemName}&rdquo;
          </p>
          <p className="text-xs text-red-600 bg-red-50 p-2 rounded border">
            Warning: This will permanently remove the item from your inventory and cannot be recovered.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 p-6 pt-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs border border-[#E5E7EB] bg-white text-[#4A5565] rounded-lg hover:bg-[#F9FAFB] transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                Deleting...
              </>
            ) : (
              "Delete Item"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}