'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { cn } from '@/utils';
import AddItemModal from '@/components/modals/add-item-modal';
import AddStockModal from '@/components/modals/add-stock-modal';
import ConsumeStockModal from '@/components/modals/consume-stock-modal';
import { InventoryService } from '@/services/inventoryService';
import { InventoryItem as InventoryItemType } from '@/types';

// Helper function to get status based on stock levels
const getStockStatus = (currentStock: number, minimumStock: number): string => {
  if (currentStock === 0) return 'Out of Stock';
  if (currentStock <= minimumStock) return 'Low Stock';
  return 'Normal';
};

// Helper function to get expiry info
const getExpiryInfo = (expiresAt: string): string | undefined => {
  if (!expiresAt) return undefined;
  
  const expiryDate = new Date(expiresAt);
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'Expired';
  if (diffDays <= 7) return `Expires in ${diffDays} days`;
  if (diffDays <= 30) return `Expires in ${diffDays} days`;
  return undefined;
};

const getColorSwatch = (color: string) => {
  const colorMap: { [key: string]: string } = {
    'Blue': '#3B82F6',
    'Silver': '#9CA3AF',
    'Beige': '#F5F5DC',
    'Black': '#000000',
    'White': '#FFFFFF',
    'Brown': '#8B4513'
  };
  return colorMap[color] || '#9CA3AF';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Normal':
      return 'bg-green-100 text-green-800';
    case 'Low Stock':
      return 'bg-yellow-100 text-yellow-800';
    case 'Out of Stock':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getExpiryColor = (expiryInfo: string) => {
  if (expiryInfo.includes('Expires in')) {
    return 'bg-orange-100 text-orange-800';
  }
  return 'bg-green-100 text-green-800';
};

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'branch' | 'network'>('branch');
  const [sortBy, setSortBy] = useState('name');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showConsumeStockModal, setShowConsumeStockModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItemType | null>(null);
  
  // API state
  const [inventoryItems, setInventoryItems] = useState<InventoryItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Fetch inventory items
  const fetchInventoryItems = async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await InventoryService.getInventoryItems(page, limit);
      setInventoryItems(response.items);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inventory items';
      setError(errorMessage);
      console.error('Error fetching inventory:', err);
      
      // If it's an authentication error, redirect to login
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        // Handle authentication error
        console.log('Authentication error, user should be redirected to login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load inventory on component mount
  useEffect(() => {
    fetchInventoryItems();
  }, []);

  // Refresh inventory after modal operations
  const refreshInventory = () => {
    fetchInventoryItems(pagination.page, pagination.limit);
  };

  // Handle edit item
  const handleEditItem = (item: InventoryItemType) => {
    setEditingItem(item);
    setShowEditItemModal(true);
  };

  // Handle delete item
  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        await InventoryService.deleteInventoryItem(itemId);
        refreshInventory();
      } catch (err) {
        console.error('Error deleting item:', err);
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  // Handle quick stock update
  const handleQuickStockUpdate = async (itemId: string, action: 'add' | 'consume') => {
    const quantity = prompt(`Enter quantity to ${action}:`, '1');
    if (quantity && !isNaN(parseInt(quantity))) {
      try {
        await InventoryService.updateStock(itemId, parseInt(quantity), action);
        refreshInventory();
      } catch (err) {
        console.error(`Error ${action}ing stock:`, err);
        alert(`Failed to ${action} stock. Please try again.`);
      }
    }
  };

  const filteredItems = inventoryItems.filter(item =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.itemName.localeCompare(b.itemName);
      case 'stock':
        return b.currentStock - a.currentStock;
      case 'mrp':
        return b.mrp - a.mrp;
      default:
        return 0;
    }
  });

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
              Inventory
            </h1>
            <p className="text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
              Managing inventory for Main Branch
            </p>
          </div>

                     {/* Action Buttons */}
           <div className="flex flex-col sm:flex-row gap-3">
             <button 
               onClick={() => setShowAddItemModal(true)}
               className="flex items-center gap-2 px-6 py-2 bg-[#f97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors text-sm font-medium" 
               style={{ fontFamily: 'Segoe UI' }}
             >
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
               </svg>
               Add Item
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
             <button 
               onClick={() => setShowAddStockModal(true)}
               className="flex items-center gap-2 px-6 py-2 border border-[#E5E7EB] bg-white text-[#4A5565] rounded-lg hover:bg-[#F9FAFB] transition-colors text-sm" 
               style={{ fontFamily: 'Segoe UI' }}
             >
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
               </svg>
               Add Stock
             </button>
             <button 
               onClick={() => window.print()}
               className="flex items-center gap-2 px-6 py-2 border border-[#E5E7EB] bg-white text-[#4A5565] rounded-lg hover:bg-[#F9FAFB] transition-colors text-sm" 
               style={{ fontFamily: 'Segoe UI' }}
             >
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
               </svg>
               Print
             </button>
           </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search items..."
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

          <div className="flex flex-col sm:flex-row gap-3">
            {/* View and Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('branch')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors',
                  viewMode === 'branch'
                    ? 'bg-[#F3F4F6] border-[#E5E7EB] text-[#101828]'
                    : 'bg-white border-[#E5E7EB] text-[#4A5565] hover:bg-[#F9FAFB]'
                )}
                style={{ fontFamily: 'Segoe UI' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Branch View
              </button>
              <button
                onClick={() => setViewMode('network')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-colors',
                  viewMode === 'network'
                    ? 'bg-[#F3F4F6] border-[#E5E7EB] text-[#101828]'
                    : 'bg-white border-[#E5E7EB] text-[#4A5565] hover:bg-[#F9FAFB]'
                )}
                style={{ fontFamily: 'Segoe UI' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Network View
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#4A5565] hover:bg-[#F9FAFB] text-sm transition-colors" style={{ fontFamily: 'Segoe UI' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-[#E5E7EB] rounded-lg bg-white text-[#4A5565] text-sm"
              style={{ fontFamily: 'Segoe UI' }}
              aria-label="Sort inventory items"
            >
              <option value="name">Item Name (A-Z)</option>
              <option value="stock">Stock (High to Low)</option>
              <option value="mrp">MRP (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                    Item Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                    Item Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                    Type & Ear
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                    MRP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                    Color
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#101828] uppercase tracking-wider" style={{ fontFamily: 'Segoe UI' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#E5E7EB]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f97316]"></div>
                        <span className="ml-2 text-[#4A5565]">Loading inventory...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center">
                      <div className="text-red-500">
                        <p className="font-medium">Error loading inventory</p>
                        <p className="text-sm">{error}</p>
                        <button 
                          onClick={() => fetchInventoryItems()}
                          className="mt-2 px-4 py-2 bg-[#f97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : sortedItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-[#4A5565]">
                      No inventory items found
                    </td>
                  </tr>
                ) : (
                  sortedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                            {item.itemName}
                          </div>
                          <div className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                            {item.brand}
                          </div>
                          <div className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                            {item.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                          {item.itemCode}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800" style={{ fontFamily: 'Segoe UI' }}>
                            {item.itemType}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800" style={{ fontFamily: 'Segoe UI' }}>
                            {item.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                          ₹{item.mrp.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border border-[#E5E7EB]"
                            style={{ backgroundColor: getColorSwatch(item.color) }}
                          />
                          <span className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                            {item.color}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                            {item.currentStock} {item.currentStock === 1 ? 'piece' : 'pieces'}
                          </div>
                          <div className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                            Min: {item.minimumStock}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          <span className={cn(
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                            getStatusColor(getStockStatus(item.currentStock, item.minimumStock))
                          )} style={{ fontFamily: 'Segoe UI' }}>
                            {getStockStatus(item.currentStock, item.minimumStock)}
                          </span>
                          {getExpiryInfo(item.expiresAt) && (
                            <span className={cn(
                              'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                              getExpiryColor(getExpiryInfo(item.expiresAt)!)
                            )} style={{ fontFamily: 'Segoe UI' }}>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {getExpiryInfo(item.expiresAt)}
                            </span>
                          )}
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800" style={{ fontFamily: 'Segoe UI' }}>
                            {item.status}
                          </span>
                        </div>
                      </td>
                                          <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditItem(item)}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                          aria-label={`Edit ${item.itemName}`}
                          title={`Edit ${item.itemName}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleQuickStockUpdate(item.id, 'add')}
                          className="text-green-600 hover:text-green-800 transition-colors p-1 rounded hover:bg-green-50"
                          aria-label={`Add stock to ${item.itemName}`}
                          title={`Add stock to ${item.itemName}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleQuickStockUpdate(item.id, 'consume')}
                          className="text-orange-600 hover:text-orange-800 transition-colors p-1 rounded hover:bg-orange-50"
                          aria-label={`Consume stock from ${item.itemName}`}
                          title={`Consume stock from ${item.itemName}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                          aria-label={`Delete ${item.itemName}`}
                          title={`Delete ${item.itemName}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
                 </div>
       </div>

       {/* Pagination */}
       {pagination.totalPages > 1 && (
         <div className="flex items-center justify-between bg-white px-6 py-3 border border-[#E5E7EB] rounded-lg">
           <div className="text-sm text-[#4A5565]">
             Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
           </div>
           <div className="flex items-center gap-2">
             <button
               onClick={() => fetchInventoryItems(pagination.page - 1, pagination.limit)}
               disabled={pagination.page === 1}
               className="px-3 py-1 border border-[#E5E7EB] rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F9FAFB]"
             >
               Previous
             </button>
             <span className="px-3 py-1 text-sm text-[#4A5565]">
               Page {pagination.page} of {pagination.totalPages}
             </span>
             <button
               onClick={() => fetchInventoryItems(pagination.page + 1, pagination.limit)}
               disabled={pagination.page === pagination.totalPages}
               className="px-3 py-1 border border-[#E5E7EB] rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F9FAFB]"
             >
               Next
             </button>
           </div>
         </div>
       )}

       {/* Modals */}
       <AddItemModal 
         isOpen={showAddItemModal} 
         onClose={() => setShowAddItemModal(false)}
         onSuccess={refreshInventory}
       />
       <AddStockModal 
         isOpen={showAddStockModal} 
         onClose={() => setShowAddStockModal(false)}
         onSuccess={refreshInventory}
       />
       <ConsumeStockModal 
         isOpen={showConsumeStockModal} 
         onClose={() => setShowConsumeStockModal(false)}
         onSuccess={refreshInventory}
       />
       {editingItem && (
         <AddItemModal 
           isOpen={showEditItemModal} 
           onClose={() => {
             setShowEditItemModal(false);
             setEditingItem(null);
           }}
           onSuccess={refreshInventory}
           editingItem={editingItem}
           isEditMode={true}
         />
       )}
     </MainLayout>
   );
 }
