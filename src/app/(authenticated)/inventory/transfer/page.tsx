"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/main-layout";
import { cn } from "@/utils";
import CreateTransferModal from "@/components/modals/create-transfer-modal";
import { InventoryTransferService } from "@/services/inventoryTransferService";
import { InventoryTransfer } from "@/types";


const getTypeIcon = (type: string) => {
  switch (type) {
    case "Branch":
      return (
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
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      );
    case "Repair":
      return (
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case "Internal":
      return (
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
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      );
    case "External":
      return (
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
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      );
    default:
      return null;
  }
};

const getStatusBadge = (status: string) => {
  const statusMap: { [key: string]: { bg: string; text: string } } = {
    Delivered: { bg: "bg-green-100", text: "text-green-800" },
    "In Transit": { bg: "bg-blue-100", text: "text-blue-800" },
    Pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
    Cancelled: { bg: "bg-red-100", text: "text-red-800" },
  };

  const config = statusMap[status] || {
    bg: "bg-gray-100",
    text: "text-gray-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
        config.bg,
        config.text
      )}
      style={{ fontFamily: "Segoe UI" }}
    >
      {status}
    </span>
  );
};

const getUrgencyBadge = (urgency: string) => {
  const urgencyMap: { [key: string]: { bg: string; text: string } } = {
    Critical: { bg: "bg-red-100", text: "text-red-800" },
    High: { bg: "bg-orange-100", text: "text-orange-800" },
    Medium: { bg: "bg-blue-100", text: "text-blue-800" },
    Low: { bg: "bg-gray-100", text: "text-gray-600" },
  };

  const config = urgencyMap[urgency] || {
    bg: "bg-gray-100",
    text: "text-gray-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
        config.bg,
        config.text
      )}
      style={{ fontFamily: "Segoe UI" }}
    >
      {urgency}
    </span>
  );
};

export default function InventoryTransferPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateTransferModal, setShowCreateTransferModal] = useState(false);
  const [transfers, setTransfers] = useState<InventoryTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch transfers on component mount
  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        setLoading(true);
        const response = await InventoryTransferService.getInventoryTransfers();
        setTransfers(response.transfers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch transfers');
        console.error('Error fetching transfers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransfers();
  }, []);

  const filteredTransfers = transfers.filter(
    (transfer) =>
      transfer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.trackingNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transfer.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.toLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.transferItems.some(item => 
        item.inventoryItem.itemName.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleTransferCreated = async () => {
    try {
      const response = await InventoryTransferService.getInventoryTransfers();
      setTransfers(response.transfers);
    } catch (err) {
      console.error('Error refreshing transfers:', err);
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="space-y-2">
            <h1
              className="text-2xl font-semibold text-[#101828]"
              style={{ fontFamily: "Segoe UI" }}
            >
              Inventory Transfer
            </h1>
            <p className="text-[#4A5565]" style={{ fontFamily: "Segoe UI" }}>
              Manage inventory transfers between locations
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => setShowCreateTransferModal(true)}
            className="flex items-center gap-2 px-6 py-1.5 bg-primary text-white rounded-lg hover:bg-[#ea580c] transition-colors text-sm font-medium"
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
            Create Transfer
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative ">
              <input
                type="text"
                placeholder="Search transfers, locations, tracking numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-100 placeholder-[#717182] h-9 w-full rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ fontFamily: "Segoe UI" }}
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <button
            className="flex items-center gap-2 px-4 py-1.5 border border-[#E5E7EB] bg-white text-[#4A5565] rounded-lg hover:bg-[#F9FAFB] text-sm transition-colors"
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
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filter
          </button>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="text-sm text-[#4A5565]" style={{ fontFamily: "Segoe UI" }}>
              Loading transfers...
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-800" style={{ fontFamily: "Segoe UI" }}>
              Error: {error}
            </div>
          </div>
        )}

        {/* Transfer Table */}
        {!loading && !error && (
          <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider"
                      style={{ fontFamily: "Segoe UI" }}
                    >
                      Transfer ID
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider"
                      style={{ fontFamily: "Segoe UI" }}
                    >
                      Type
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider"
                      style={{ fontFamily: "Segoe UI" }}
                    >
                      From/To
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider"
                      style={{ fontFamily: "Segoe UI" }}
                    >
                      Items
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider"
                      style={{ fontFamily: "Segoe UI" }}
                    >
                      Transferred Date
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider"
                      style={{ fontFamily: "Segoe UI" }}
                    >
                      Transferred By
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider"
                      style={{ fontFamily: "Segoe UI" }}
                    >
                      Status
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider"
                      style={{ fontFamily: "Segoe UI" }}
                    >
                      Urgency
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider"
                      style={{ fontFamily: "Segoe UI" }}
                    >
                      Approved By
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider"
                      style={{ fontFamily: "Segoe UI" }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E5E7EB]">
                  {filteredTransfers.map((transfer) => (
                    <tr
                      key={transfer.id}
                      className="hover:bg-[#F9FAFB] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div
                            className="text-xs font-medium text-[#101828]"
                            style={{ fontFamily: "Segoe UI" }}
                          >
                            {transfer.id.slice(0, 8)}...
                          </div>
                          <div
                            className="text-xs text-[#4A5565]"
                            style={{ fontFamily: "Segoe UI" }}
                          >
                            Tracking: {transfer.trackingNumber}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(transfer.transferType)}
                          <span
                            className="text-xs text-[#101828]"
                            style={{ fontFamily: "Segoe UI" }}
                          >
                            {transfer.transferType}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div
                            className="text-xs text-[#101828]"
                            style={{ fontFamily: "Segoe UI" }}
                          >
                            From: {transfer.fromLocation}
                          </div>
                          <div
                            className="text-xs text-[#101828]"
                            style={{ fontFamily: "Segoe UI" }}
                          >
                            To: {transfer.toLocation}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div
                            className="text-xs font-medium text-[#101828]"
                            style={{ fontFamily: "Segoe UI" }}
                          >
                            {transfer.transferItems.length} items
                          </div>
                          <div
                            className="text-xs text-[#4A5565] cursor-pointer hover:text-[#101828] transition-colors"
                            style={{ fontFamily: "Segoe UI" }}
                            onClick={() => window.location.href = `/inventory/transfer/${transfer.id}`}
                            title="Click to view transfer details"
                          >
                            {transfer.transferItems.slice(0, 2).map(item => item.inventoryItem.itemName).join(', ')}
                            {transfer.transferItems.length > 2 && '...'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-xs text-[#101828]"
                          style={{ fontFamily: "Segoe UI" }}
                        >
                          {new Date(transfer.transferredDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-xs text-[#101828]"
                          style={{ fontFamily: "Segoe UI" }}
                        >
                          {transfer.transferredBy}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(transfer.status)}
                      </td>
                      <td className="px-6 py-4">
                        {getUrgencyBadge(transfer.urgencyLevel)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div
                            className="text-xs font-medium text-[#101828]"
                            style={{ fontFamily: "Segoe UI" }}
                          >
                            {transfer.approvedBy || 'Not approved'}
                          </div>
                          {transfer.approvedAt && (
                            <div
                              className="text-xs text-[#4A5565]"
                              style={{ fontFamily: "Segoe UI" }}
                            >
                              {new Date(transfer.approvedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => window.location.href = `/inventory/transfer/${transfer.id}`}
                          className="text-gray-600 hover:text-gray-800 transition-colors"
                          aria-label="View transfer details"
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Transfer Modal */}
        <CreateTransferModal
          isOpen={showCreateTransferModal}
          onClose={() => setShowCreateTransferModal(false)}
          onTransferCreated={handleTransferCreated}
        />
      </div>
    </MainLayout>
  );
}
