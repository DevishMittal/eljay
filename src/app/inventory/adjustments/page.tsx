'use client';

import React from 'react';
import MainLayout from '@/components/layout/main-layout';

export default function InventoryAdjustmentsPage() {
  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
            Inventory Adjustments
          </h1>
          <p className="text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
            Manage inventory adjustments and corrections
          </p>
        </div>

        {/* Content Placeholder - Ready for your design */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#4A5565]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.1335 7.74935H11.6868C11.4319 7.7488 11.1838 7.83178 10.9804 7.98558C10.7771 8.13938 10.6298 8.35555 10.561 8.60102L9.19013 13.4777C9.18129 13.508 9.16287 13.5346 9.13763 13.5535C9.11239 13.5724 9.08168 13.5827 9.05013 13.5827C9.01858 13.5827 8.98787 13.5724 8.96263 13.5535C8.93739 13.5346 8.91897 13.508 8.91013 13.4777L5.69013 2.02102C5.68129 1.99072 5.66287 1.96411 5.63763 1.94518C5.61239 1.92625 5.58168 1.91602 5.55013 1.91602C5.51858 1.91602 5.48787 1.92625 5.46263 1.94518C5.43739 1.96411 5.41897 1.99072 5.41013 2.02102L4.0393 6.89768C3.97073 7.14219 3.82427 7.35765 3.62213 7.51136C3.42 7.66506 3.17323 7.74862 2.9193 7.74935H1.4668" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
              Inventory Adjustments
            </h3>
            <p className="text-[#4A5565] mb-6" style={{ fontFamily: 'Segoe UI' }}>
              Ready for your design implementation. This section will contain inventory adjustment functionality 
              including stock corrections, damage reports, and quantity adjustments.
            </p>
            <button className="px-6 py-2 bg-[#f97316] text-white rounded-lg hover:bg-[#ea580c] transition-colors text-sm font-medium" style={{ fontFamily: 'Segoe UI' }}>
              Create Adjustment
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
