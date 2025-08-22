'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { cn } from '@/utils';
import AddItemModal from '@/components/modals/add-item-modal';
import AddStockModal from '@/components/modals/add-stock-modal';
import ConsumeStockModal from '@/components/modals/consume-stock-modal';

interface InventoryItem {
  id: string;
  name: string;
  brand: string;
  description: string;
  itemCode: string;
  type: string;
  ear?: string;
  mrp: number;
  color: string;
  stock: number;
  minStock: number;
  status: 'Normal' | 'Low Stock' | 'Out of Stock';
  expiryInfo?: string;
  isActive: boolean;
}

const inventoryData: InventoryItem[] = [
  {
    id: '1',
    name: 'Hearing Aid Cleaning Kit',
    brand: 'ProClean',
    description: 'Complete cleaning kit with brush, pick, and sanitizing wipes',
    itemCode: 'CLN-KIT-STD',
    type: 'accessories',
    mrp: 1250,
    color: 'Blue',
    stock: 25,
    minStock: 10,
    status: 'Normal',
    expiryInfo: 'Expires in 5 days',
    isActive: true
  },
  {
    id: '2',
    name: 'Oticon ConnectClip',
    brand: 'Oticon',
    description: 'Hands-free microphone and audio streamer',
    itemCode: 'OTC-CLIP-CON',
    type: 'accessories',
    mrp: 8500,
    color: 'Silver',
    stock: 4,
    minStock: 3,
    status: 'Normal',
    isActive: true
  },
  {
    id: '3',
    name: 'Oticon More 1 Universal',
    brand: 'Oticon',
    description: 'Revolutionary brain-first technology hearing aid with unive...',
    itemCode: 'OTC-MORE1-U',
    type: 'hearing_aid',
    ear: 'Universal',
    mrp: 72000,
    color: 'Silver',
    stock: 3,
    minStock: 2,
    status: 'Normal',
    isActive: true
  },
  {
    id: '4',
    name: 'Phonak Audéo Paradise P90 Left',
    brand: 'Phonak',
    description: 'Premium hearing aid with Bluetooth connectivity and rech...',
    itemCode: 'PHK-AP90-L',
    type: 'hearing_aid',
    ear: 'Left Ear',
    mrp: 67500,
    color: 'Beige',
    stock: 8,
    minStock: 3,
    status: 'Normal',
    isActive: true
  },
  {
    id: '5',
    name: 'Phonak Audéo Paradise P90 Right',
    brand: 'Phonak',
    description: 'Premium hearing aid with Bluetooth connectivity and rech...',
    itemCode: 'PHK-AP90-R',
    type: 'hearing_aid',
    ear: 'Right Ear',
    mrp: 67500,
    color: 'Beige',
    stock: 6,
    minStock: 3,
    status: 'Normal',
    isActive: true
  },
  {
    id: '6',
    name: 'Phonak TV Connector',
    brand: 'Phonak',
    description: 'Bluetooth TV streaming device for Phonak hearing aids',
    itemCode: 'PHK-TV-CON',
    type: 'accessories',
    mrp: 12500,
    color: 'Black',
    stock: 6,
    minStock: 2,
    status: 'Normal',
    isActive: true
  },
  {
    id: '7',
    name: 'Phonak Universal Charger Case',
    brand: 'Phonak',
    description: 'Universal wireless charging case for Phonak rechargeable...',
    itemCode: 'PHK-CHG-UNI',
    type: 'accessories',
    mrp: 4500,
    color: 'White',
    stock: 12,
    minStock: 5,
    status: 'Normal',
    isActive: true
  },
  {
    id: '8',
    name: 'ReSound ONE 9 Left',
    brand: 'ReSound',
    description: 'Organic hearing with M&RIE technology - Left Ear',
    itemCode: 'RS-ONE9-L',
    type: 'hearing_aid',
    ear: 'Left Ear',
    mrp: 65000,
    color: 'Brown',
    stock: 2,
    minStock: 3,
    status: 'Low Stock',
    isActive: true
  },
  {
    id: '9',
    name: 'ReSound ONE 9 Right',
    brand: 'ReSound',
    description: 'Organic hearing with M&RIE technology - Right Ear',
    itemCode: 'RS-ONE9-R',
    type: 'hearing_aid',
    ear: 'Right Ear',
    mrp: 65000,
    color: 'Brown',
    stock: 1,
    minStock: 3,
    status: 'Low Stock',
    isActive: true
  }
];

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

  const filteredItems = inventoryData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'stock':
        return b.stock - a.stock;
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
               + Add Item
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
              className="px-4 py-2 border border-[#E5E7EB] rounded-lg bg-white text-[#4A5565] text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
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
                {sortedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                          {item.name}
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
                          {item.type}
                        </span>
                        {item.ear && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800" style={{ fontFamily: 'Segoe UI' }}>
                            {item.ear}
                          </span>
                        )}
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
                          {item.stock} {item.stock === 1 ? 'piece' : 'pieces'}
                        </div>
                        <div className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                          Min: {item.minStock}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        <span className={cn(
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                          getStatusColor(item.status)
                        )} style={{ fontFamily: 'Segoe UI' }}>
                          {item.status}
                        </span>
                        {item.expiryInfo && (
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                            getExpiryColor(item.expiryInfo)
                          )} style={{ fontFamily: 'Segoe UI' }}>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {item.expiryInfo}
                          </span>
                        )}
                        {item.isActive && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800" style={{ fontFamily: 'Segoe UI' }}>
                            Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        className="text-[#4A5565] hover:text-[#101828] transition-colors"
                        aria-label={`Actions for ${item.name}`}
                        title={`Actions for ${item.name}`}
                      >
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

       {/* Modals */}
       <AddItemModal 
         isOpen={showAddItemModal} 
         onClose={() => setShowAddItemModal(false)} 
       />
       <AddStockModal 
         isOpen={showAddStockModal} 
         onClose={() => setShowAddStockModal(false)} 
       />
       <ConsumeStockModal 
         isOpen={showConsumeStockModal} 
         onClose={() => setShowConsumeStockModal(false)} 
       />
     </MainLayout>
   );
 }
