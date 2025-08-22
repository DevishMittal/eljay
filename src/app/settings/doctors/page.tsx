'use client';

import React from 'react';
import MainLayout from '@/components/layout/main-layout';

const DoctorsPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
            Settings
          </h1>
          <p className="text-[#4A5565] text-sm" style={{ fontFamily: 'Segoe UI' }}>
            Manage your organization settings and configurations
          </p>
        </div>

        <div className="bg-white rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-[#101828] mb-4" style={{ fontFamily: 'Segoe UI' }}>
            Doctors Settings
          </h2>
          <p className="text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
            Doctors management configuration page coming soon...
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default DoctorsPage;
