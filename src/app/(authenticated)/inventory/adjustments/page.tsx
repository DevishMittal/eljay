'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { cn } from '@/utils';
import AddStockModal from '@/components/modals/add-stock-modal';
import ConsumeStockModal from '@/components/modals/consume-stock-modal';
import { InventoryService } from '@/services/inventoryService';
import { InventoryTransaction } from '@/types';

type TabType = 'transaction-history' | 'stock-additions' | 'stock-consumptions';

export default function InventoryAdjustmentsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('transaction-history');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showConsumeStockModal, setShowConsumeStockModal] = useState(false);
  
  // API state
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Fetch transactions from API
  const fetchTransactions = async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await InventoryService.getInventoryTransactions(page, limit);
      
      
      // The API returns { data: { transactions: [], pagination: {} } }
      // The service extracts data.data, so response should have transactions and pagination
      if (response && 'transactions' in response && Array.isArray(response.transactions)) {
        setTransactions(response.transactions as InventoryTransaction[]);
        setPagination(response.pagination);
      } else if (response && 'items' in response && Array.isArray(response.items)) {
        // Fallback to items structure if needed
        setTransactions(response.items as InventoryTransaction[]);
        setPagination(response.pagination);
      } else {
        console.error('Unexpected response structure:', response);
        setTransactions([]);
        setPagination({ page: 1, limit: 10, total: 0, totalPages: 0 });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(errorMessage);
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Refresh transactions after modal operations
  const refreshTransactions = () => {
    fetchTransactions(pagination.page, pagination.limit);
  };

  const filteredTransactions = (transactions || []).filter(transaction =>
    transaction.item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.authorizedBy?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stockAdditions = filteredTransactions.filter(t => t.type === 'addition');
  const stockConsumptions = filteredTransactions.filter(t => t.type === 'consumption');

  const getQuantityBadge = (quantity: number, type: string) => {
    const isPositive = type === 'addition';
    return (
      <span className={cn(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
        isPositive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      )} style={{ fontFamily: 'Segoe UI' }}>
        {isPositive ? `+${quantity}` : `-${quantity}`}
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                  Actions
                </th> */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#E5E7EB]">
              {stockAdditions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {formatDate(transaction.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.item.itemName}
                    </div>
                    <div className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.item.itemCode} - {transaction.item.brand}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getQuantityBadge(transaction.quantity, transaction.type)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                        {transaction.supplierName || '-'}
                      </div>
                      <div className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                        {transaction.supplierContact || '-'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.batchNumber || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.purchasePrice ? `₹${transaction.purchasePrice.toLocaleString()}` : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.authorizedBy || '-'}
                    </span>
                  </td>
                  {/* <td className="px-6 py-4">
                    <button 
                      className="text-[#4A5565] hover:text-[#101828] transition-colors"
                      aria-label="View transaction details"
                      title="View transaction details"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </td> */}
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
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                  Actions
                </th> */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#E5E7EB]">
              {stockConsumptions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {formatDate(transaction.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.item.itemName}
                    </div>
                    <div className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.item.itemCode} - {transaction.item.brand}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getQuantityBadge(transaction.quantity, transaction.type)}
                  </td>
                  <td className="px-6 py-4">
                    {getTypeBadge('Consumption')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                        Stock Consumption
                      </div>
                      <div className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                        {transaction.type}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      -
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.authorizedBy || '-'}
                    </span>
                  </td>
                  {/* <td className="px-6 py-4">
                    <button 
                      className="text-[#4A5565] hover:text-[#101828] transition-colors"
                      aria-label="View transaction details"
                      title="View transaction details"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </td> */}
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
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                Actions
              </th> */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#E5E7EB]">
            {stockAdditions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-[#F9FAFB] transition-colors">
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {formatDate(transaction.createdAt)}
                    </div>
                    <div className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                      {formatTime(transaction.createdAt)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    {transaction.item.itemName}
                  </div>
                  <div className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                    {transaction.item.itemCode} - {transaction.item.brand}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getQuantityBadge(transaction.quantity, transaction.type)}
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.supplierName || '-'}
                    </div>
                    <div className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.supplierContact || '-'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.batchNumber || '-'}
                    </div>
                    <div className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.expiryDate ? `Exp: ${formatDate(transaction.expiryDate)}` : '-'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    {transaction.purchasePrice ? `₹${transaction.purchasePrice.toLocaleString()}` : '-'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    {transaction.warranty || '-'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    {transaction.authorizedBy || '-'}
                  </span>
                </td>
                {/* <td className="px-6 py-4">
                  <button 
                    className="text-[#4A5565] hover:text-[#101828] transition-colors"
                    aria-label="View transaction details"
                    title="View transaction details"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </td> */}
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
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                Actions
              </th> */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#E5E7EB]">
            {stockConsumptions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-[#F9FAFB] transition-colors">
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {formatDate(transaction.createdAt)}
                    </div>
                    <div className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                      {formatTime(transaction.createdAt)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    {transaction.item.itemName}
                  </div>
                  <div className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                    {transaction.item.itemCode} - {transaction.item.brand}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getQuantityBadge(transaction.quantity, transaction.type)}
                </td>
                <td className="px-6 py-4">
                  {getTypeBadge('Consumption')}
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      Stock Consumption
                    </div>
                    <div className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                      {transaction.type}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    -
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    {transaction.authorizedBy || '-'}
                  </span>
                </td>
                {/* <td className="px-6 py-4">
                  <button 
                    className="text-[#4A5565] hover:text-[#101828] transition-colors"
                    aria-label="View transaction details"
                    title="View transaction details"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f97316]"></div>
          <span className="ml-2 text-[#4A5565]">Loading transactions...</span>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-6 text-center">
          <div className="text-red-500">
            <p className="font-medium">Error loading transactions</p>
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => fetchTransactions()}
              className="mt-2 px-4 py-2 bg-[#f97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

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
              className="flex items-center gap-2 px-6 py-1.5 bg-primary text-white rounded-lg hover:bg-[#ea580c] transition-colors text-sm font-medium" 
              style={{ fontFamily: 'Segoe UI' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              Add Stock
            </button>
            <button 
              onClick={() => setShowConsumeStockModal(true)}
              className="flex items-center gap-2 px-6 py-1.5 border border-[#E5E7EB] bg-white text-[#4A5565] rounded-lg hover:bg-[#F9FAFB] transition-colors text-sm" 
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
            <div className="relative ">
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
              <input
                type="text"
                placeholder="Search transactions, items, suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-100 placeholder-[#717182] h-9 w-full rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
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
          onSuccess={refreshTransactions}
        />
        <ConsumeStockModal 
          isOpen={showConsumeStockModal} 
          onClose={() => setShowConsumeStockModal(false)}
          onSuccess={refreshTransactions}
        />
      </div>
    </MainLayout>
  );
}
