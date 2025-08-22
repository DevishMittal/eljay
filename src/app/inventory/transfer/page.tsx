'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { cn } from '@/utils';
import CreateTransferModal from '@/components/modals/create-transfer-modal';

interface TransferData {
  id: string;
  transferId: string;
  trackingNumber: string;
  type: 'Branch' | 'Repair' | 'Internal';
  fromLocation: string;
  toLocation: string;
  items: {
    count: number;
    description: string;
  };
  transferDate: string;
  transferredDate: string;
  transferredBy: string;
  status: 'Delivered' | 'In Transit' | 'Pending';
  urgency: 'High' | 'Medium' | 'Low';
  approvedBy: string;
  approvedByRole: string;
}

const transferData: TransferData[] = [
  {
    id: '1',
    transferId: 'TXN-001',
    trackingNumber: 'TRK123456',
    type: 'Branch',
    fromLocation: 'Main Warehouse',
    toLocation: 'Branch Office',
    items: {
      count: 2,
      description: 'Phonak Audéo Paradise P90-R'
    },
    transferDate: '15 Dec 2024',
    transferredDate: 'Not specified',
    transferredBy: 'Staff',
    status: 'Delivered',
    urgency: 'Medium',
    approvedBy: 'Dr. Sarah Johnson',
    approvedByRole: 'Approved by: Manager'
  },
  {
    id: '2',
    transferId: 'TXN-002',
    trackingNumber: 'TRK123457',
    type: 'Repair',
    fromLocation: 'Branch Office',
    toLocation: 'Repair Center',
    items: {
      count: 1,
      description: 'Oticon More 1'
    },
    transferDate: '16 Dec 2024',
    transferredDate: 'Not specified',
    transferredBy: 'Staff',
    status: 'In Transit',
    urgency: 'High',
    approvedBy: 'Dr. Michael Brow',
    approvedByRole: 'Approved by: Manager'
  },
  {
    id: '3',
    transferId: 'TXN-003',
    trackingNumber: 'TRK123458',
    type: 'Internal',
    fromLocation: 'Main Warehouse',
    toLocation: 'Branch Office',
    items: {
      count: 5,
      description: 'Widex EVOKE 440, Signia Pure Charge&Go X'
    },
    transferDate: '17 Dec 2024',
    transferredDate: 'Not specified',
    transferredBy: 'Staff',
    status: 'Pending',
    urgency: 'Low',
    approvedBy: 'Dr. Jennifer Lee',
    approvedByRole: 'Approved by: Manager'
  }
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Branch':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case 'Repair':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'Internal':
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      );
    default:
      return null;
  }
};

const getStatusBadge = (status: string) => {
  const statusMap: { [key: string]: { bg: string; text: string } } = {
    'Delivered': { bg: 'bg-green-100', text: 'text-green-800' },
    'In Transit': { bg: 'bg-blue-100', text: 'text-blue-800' },
    'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800' }
  };

  const config = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
      config.bg, config.text
    )} style={{ fontFamily: 'Segoe UI' }}>
      {status}
    </span>
  );
};

const getUrgencyBadge = (urgency: string) => {
  const urgencyMap: { [key: string]: { bg: string; text: string } } = {
    'High': { bg: 'bg-orange-100', text: 'text-orange-800' },
    'Medium': { bg: 'bg-blue-100', text: 'text-blue-800' },
    'Low': { bg: 'bg-gray-100', text: 'text-gray-600' }
  };

  const config = urgencyMap[urgency] || { bg: 'bg-gray-100', text: 'text-gray-800' };

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
      config.bg, config.text
    )} style={{ fontFamily: 'Segoe UI' }}>
      {urgency}
    </span>
  );
};

export default function InventoryTransferPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateTransferModal, setShowCreateTransferModal] = useState(false);

  const filteredTransfers = transferData.filter(transfer =>
    transfer.transferId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.toLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.items.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
              Inventory Transfer
            </h1>
            <p className="text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
              Manage inventory transfers between locations
            </p>
          </div>

          {/* Action Button */}
          <button 
            onClick={() => setShowCreateTransferModal(true)}
            className="flex items-center gap-2 px-6 py-2 bg-[#f97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors text-sm font-medium" 
            style={{ fontFamily: 'Segoe UI' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            + Create Transfer
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search transfers, locations, tracking numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] text-[#101828] placeholder-[#717182]"
                style={{ fontFamily: 'Segoe UI' }}
              />
              <svg
                className="absolute left-3 top-2.5 h-4 w-4 text-[#717182]"
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

          <button className="flex items-center gap-2 px-4 py-2 border border-[#E5E7EB] bg-white text-[#4A5565] rounded-lg hover:bg-[#F9FAFB] text-sm transition-colors" style={{ fontFamily: 'Segoe UI' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </button>
        </div>

        {/* Transfer Table */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                    Transfer ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                    From/To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                    Transfer Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                    Transferred Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                    Transferred By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                    Urgency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#E5E7EB]">
                {filteredTransfers.map((transfer) => (
                  <tr key={transfer.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                          {transfer.transferId}
                        </div>
                        <div className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                          Tracking: {transfer.trackingNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(transfer.type)}
                        <span className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                          {transfer.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                          From: {transfer.fromLocation}
                        </div>
                        <div className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                          To: {transfer.toLocation}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                          {transfer.items.count} items
                        </div>
                        <div className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                          {transfer.items.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                        {transfer.transferDate}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                        {transfer.transferredDate}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                        {transfer.transferredBy}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(transfer.status)}
                    </td>
                    <td className="px-6 py-4">
                      {getUrgencyBadge(transfer.urgency)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                          {transfer.approvedBy}
                        </div>
                        <div className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                          {transfer.approvedByRole}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Transfer Modal */}
        <CreateTransferModal 
          isOpen={showCreateTransferModal} 
          onClose={() => setShowCreateTransferModal(false)} 
        />
      </div>
    </MainLayout>
  );
}
