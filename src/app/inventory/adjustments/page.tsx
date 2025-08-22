'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { cn } from '@/utils';
import AddStockModal from '@/components/modals/add-stock-modal';
import ConsumeStockModal from '@/components/modals/consume-stock-modal';

type TabType = 'transaction-history' | 'stock-additions' | 'stock-consumptions';

interface TransactionData {
  id: string;
  date: string;
  time: string;
  item: string;
  quantity: string;
  type: string;
  supplier?: {
    name: string;
    contact: string;
    phone: string;
  };
  batch?: string;
  expiry?: string;
  purchasePrice?: string;
  warranty?: string;
  patient?: {
    name: string;
    id: string;
  };
  reason?: string;
  invoice?: string;
  authorizedBy: string;
}

const transactionData: TransactionData[] = [
  {
    id: '1',
    date: '10 Jun 2025',
    time: '12:00 am',
    item: 'Phonak Audéo Paradise P90 Left',
    quantity: '+10',
    type: 'addition',
    supplier: {
      name: 'Phonak India Pvt Ltd',
      contact: 'Amit Sharma',
      phone: '+91 22 4567 8901'
    },
    batch: 'PHK2025L001',
    expiry: 'Exp: 10 Sept 2026',
    purchasePrice: '₹47,500',
    warranty: '24 months',
    authorizedBy: 'Dr. Sarah Johnson'
  },
  {
    id: '2',
    date: '05 May 2025',
    time: '12:00 am',
    item: 'Zinc-Air Battery Size 312',
    quantity: '+300',
    type: 'addition',
    supplier: {
      name: 'PowerOne Battery Distributors',
      contact: 'Suresh Reddy',
      phone: '+91 40 7890 1234'
    },
    batch: 'P1-312-2025',
    expiry: 'Exp: 31 Dec 2026',
    purchasePrice: '₹85',
    warranty: '',
    authorizedBy: 'Dr. Michael Chen'
  },
  {
    id: '3',
    date: '15 Jun 2025',
    time: '12:00 am',
    item: 'Phonak Audéo Paradise P90 Left',
    quantity: '-2',
    type: 'consumption',
    patient: {
      name: 'Robert Wilson',
      id: 'PAT001'
    },
    reason: 'Sales',
    invoice: 'INV004',
    authorizedBy: 'Dr. Sarah Johnson'
  },
  {
    id: '4',
    date: '28 May 2025',
    time: '12:00 am',
    item: 'Zinc-Air Battery Size 312',
    quantity: '-50',
    type: 'consumption',
    reason: 'Battery replacement service',
    invoice: '-',
    authorizedBy: 'Dr. Jennifer Lee'
  }
];

export default function InventoryAdjustmentsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('transaction-history');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showConsumeStockModal, setShowConsumeStockModal] = useState(false);

  const filteredTransactions = transactionData.filter(transaction =>
    transaction.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.supplier?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.patient?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stockAdditions = filteredTransactions.filter(t => t.type === 'addition');
  const stockConsumptions = filteredTransactions.filter(t => t.type === 'consumption');

  const getQuantityBadge = (quantity: string, type: string) => {
    const isPositive = quantity.startsWith('+');
    return (
      <span className={cn(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
        isPositive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      )} style={{ fontFamily: 'Segoe UI' }}>
        {quantity}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeMap: { [key: string]: { bg: string; text: string; label: string } } = {
      'Sales': { bg: 'bg-green-100', text: 'text-green-800', label: 'Sales' },
      'Services': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Services' },
      'Demo': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Demo' },
      'Warranty': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Warranty' },
      'Defective': { bg: 'bg-red-100', text: 'text-red-800', label: 'Defective' }
    };

    const config = typeMap[type] || { bg: 'bg-gray-100', text: 'text-gray-800', label: type };
    
    return (
      <span className={cn(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
        config.bg, config.text
      )} style={{ fontFamily: 'Segoe UI' }}>
        {config.label}
      </span>
    );
  };

  const renderTransactionHistory = () => (
    <div className="space-y-6">
      {/* Recent Stock Additions */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
        <div className="p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <h3 className="text-lg font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
              Recent Stock Additions
            </h3>
          </div>
          <p className="text-sm text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
            Latest {stockAdditions.length} stock addition transactions
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                  Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                  Authorized By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#E5E7EB]">
              {stockAdditions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.date}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.item}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getQuantityBadge(transaction.quantity, transaction.type)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                        {transaction.supplier?.name}
                      </div>
                      <div className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                        {transaction.supplier?.contact}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.batch}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.purchasePrice}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.authorizedBy}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-[#4A5565] hover:text-[#101828] transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Stock Consumptions */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
        <div className="p-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="text-lg font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
              Recent Stock Consumptions
            </h3>
          </div>
          <p className="text-sm text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
            Latest {stockConsumptions.length} stock consumption transactions
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                  Patient/Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                  Authorized By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#E5E7EB]">
              {stockConsumptions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.date}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.item}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getQuantityBadge(transaction.quantity, transaction.type)}
                  </td>
                  <td className="px-6 py-4">
                    {getTypeBadge(transaction.reason || '')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                        {transaction.patient?.name || transaction.reason}
                      </div>
                      {transaction.patient?.id && (
                        <div className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                          ID: {transaction.patient.id}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.invoice}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.authorizedBy}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-[#4A5565] hover:text-[#101828] transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderStockAdditions = () => (
    <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
      <div className="p-6 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <h3 className="text-lg font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
            All Stock Additions
          </h3>
        </div>
        <p className="text-sm text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
          Complete history of stock additions - {stockAdditions.length} records
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                Item Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                Supplier Information
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                Batch & Expiry
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                Purchase Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                Warranty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                Authorized By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#E5E7EB]">
            {stockAdditions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-[#F9FAFB] transition-colors">
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.date}
                    </div>
                    <div className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.time}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    {transaction.item}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getQuantityBadge(transaction.quantity, transaction.type)}
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.supplier?.name}
                    </div>
                    <div className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.supplier?.contact}
                    </div>
                    <div className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.supplier?.phone}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.batch}
                    </div>
                    <div className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.expiry}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    {transaction.purchasePrice}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    {transaction.warranty || '-'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    {transaction.authorizedBy}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-[#4A5565] hover:text-[#101828] transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStockConsumptions = () => (
    <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
      <div className="p-6 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="text-lg font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
            All Stock Consumptions
          </h3>
        </div>
        <p className="text-sm text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
          Complete history of stock consumptions - {stockConsumptions.length} records
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                Item Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                Patient/Reason
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                Invoice
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                Authorized By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#E5E7EB]">
            {stockConsumptions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-[#F9FAFB] transition-colors">
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.date}
                    </div>
                    <div className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.time}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    {transaction.item}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getQuantityBadge(transaction.quantity, transaction.type)}
                </td>
                <td className="px-6 py-4">
                  {getTypeBadge(transaction.reason || '')}
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.patient?.name || transaction.reason}
                    </div>
                    {transaction.patient?.id && (
                      <div className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                        ID: {transaction.patient.id}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    {transaction.invoice}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    {transaction.authorizedBy}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-[#4A5565] hover:text-[#101828] transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
              Inventory Adjustment
            </h1>
            <p className="text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
              Manage stock additions, consumptions, and view transaction history
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => setShowAddStockModal(true)}
              className="flex items-center gap-2 px-6 py-2 bg-[#f97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors text-sm font-medium" 
              style={{ fontFamily: 'Segoe UI' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              Add Stock
            </button>
            <button 
              onClick={() => setShowConsumeStockModal(true)}
              className="flex items-center gap-2 px-6 py-2 border border-[#E5E7EB] bg-white text-[#4A5565] rounded-lg hover:bg-[#F9FAFB] transition-colors text-sm" 
              style={{ fontFamily: 'Segoe UI' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Consume Stock
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search transactions, items, suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] text-[#101828] placeholder-[#717182] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
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
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#ECECF0] rounded-full p-1 mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('transaction-history')}
              className={cn(
                'flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-full flex-1 justify-center',
                activeTab === 'transaction-history'
                  ? 'text-[#0A0A0A] bg-white shadow-sm'
                  : 'text-[#0A0A0A] hover:bg-white/50'
              )}
              style={{ fontFamily: 'Segoe UI' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Transaction History</span>
            </button>
            <button
              onClick={() => setActiveTab('stock-additions')}
              className={cn(
                'flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-full flex-1 justify-center',
                activeTab === 'stock-additions'
                  ? 'text-[#0A0A0A] bg-white shadow-sm'
                  : 'text-[#0A0A0A] hover:bg-white/50'
              )}
              style={{ fontFamily: 'Segoe UI' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span>Stock Additions</span>
            </button>
            <button
              onClick={() => setActiveTab('stock-consumptions')}
              className={cn(
                'flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-full flex-1 justify-center',
                activeTab === 'stock-consumptions'
                  ? 'text-[#0A0A0A] bg-white shadow-sm'
                  : 'text-[#0A0A0A] hover:bg-white/50'
              )}
              style={{ fontFamily: 'Segoe UI' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Stock Consumptions</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'transaction-history' && renderTransactionHistory()}
        {activeTab === 'stock-additions' && renderStockAdditions()}
        {activeTab === 'stock-consumptions' && renderStockConsumptions()}

        {/* Modals */}
        <AddStockModal 
          isOpen={showAddStockModal} 
          onClose={() => setShowAddStockModal(false)} 
        />
        <ConsumeStockModal 
          isOpen={showConsumeStockModal} 
          onClose={() => setShowConsumeStockModal(false)} 
        />
      </div>
    </MainLayout>
  );
}
