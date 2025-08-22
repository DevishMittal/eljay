'use client';

import React from 'react';
import MainLayout from '@/components/layout/main-layout';

export default function InventoryTransferPage() {
  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
            Inventory Transfer
          </h1>
          <p className="text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
            Manage inventory transfers between branches and locations
          </p>
        </div>

        {/* Content Placeholder - Ready for your design */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#4A5565]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.96663 2.5L2.6333 4.83333L4.96663 7.16667" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.6333 4.83398H11.9666" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.6333 13.0007L11.9666 10.6673L9.6333 8.33398" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.9666 10.666H2.6333" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
              Inventory Transfer
            </h3>
            <p className="text-[#4A5565] mb-6" style={{ fontFamily: 'Segoe UI' }}>
              Ready for your design implementation. This section will contain inventory transfer functionality 
              including inter-branch transfers, location changes, and transfer tracking.
            </p>
            <button className="px-6 py-2 bg-[#f97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors text-sm font-medium" style={{ fontFamily: 'Segoe UI' }}>
              Create Transfer
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
