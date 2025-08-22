'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils';
import Image from 'next/image';
import MainLayout from '@/components/layout/main-layout';

const SettingsPage = () => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(() => {
    if (pathname === '/settings') return 'profile';
    if (pathname === '/settings/diagnostics') return 'diagnostics';
    if (pathname === '/settings/staff') return 'staff';
    if (pathname === '/settings/doctors') return 'doctors';
    if (pathname === '/settings/printout') return 'printout';
    return 'profile';
  });

  const tabs = [
    {
      id: 'profile',
      title: 'Profile',
      href: '/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'diagnostics',
      title: 'Diagnostics',
      href: '/settings/diagnostics',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      id: 'staff',
      title: 'Staff',
      href: '/settings/staff',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    {
      id: 'doctors',
      title: 'Doctors',
      href: '/settings/doctors',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      id: 'printout',
      title: 'Printout',
      href: '/settings/printout',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
      )
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
            Settings
          </h1>
          <p className="text-[#4A5565] text-sm" style={{ fontFamily: 'Segoe UI' }}>
            Manage your organization settings and configurations
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg border border-border mb-6">
          <div className="flex border-b border-border">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  'flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors border-b-2',
                  activeTab === tab.id
                    ? 'text-[#101828] border-[#f97316] bg-white'
                    : 'text-[#4A5565] border-transparent hover:text-[#101828] hover:bg-muted/50'
                )}
                style={{ fontFamily: 'Segoe UI' }}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Profile Content */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-[#101828] mb-6" style={{ fontFamily: 'Segoe UI' }}>
              Organization Profile
            </h2>
            
            <div className="flex items-start space-x-6 mb-8">
              {/* Organization Logo */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-24 h-24 bg-[#f97316] rounded-full flex items-center justify-center relative">
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    {/* Camera icon overlay */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-[#f97316] flex items-center justify-center">
                      <svg className="w-3 h-3 text-[#f97316]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 15.2a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4z"/>
                        <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-[#4A5565] mt-2 text-center" style={{ fontFamily: 'Segoe UI' }}>
                  Organization Logo
                </p>
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#101828] mb-1" style={{ fontFamily: 'Segoe UI' }}>
                  Eljay Hearing Care Management
                </h3>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0A0A0A] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                    Organization Name
                  </label>
                  <input
                    type="text"
                    id="organization-name"
                    name="organization-name"
                    defaultValue="Eljay Hearing Care Management"
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md bg-[#F3F3F5] text-[#717182] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                    style={{ fontFamily: 'Segoe UI' }}
                    aria-label="Organization Name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email-address" className="block text-sm font-semibold text-[#0A0A0A] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email-address"
                    name="email-address"
                    defaultValue="info@eljayhearing.com"
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md bg-[#F3F3F5] text-[#717182] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                    style={{ fontFamily: 'Segoe UI' }}
                    aria-label="Email Address"
                  />
                </div>
                
                <div>
                  <label htmlFor="gst-number" className="block text-sm font-semibold text-[#0A0A0A] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                    GST Number
                  </label>
                  <input
                    type="text"
                    id="gst-number"
                    name="gst-number"
                    defaultValue="GST123456789"
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md bg-[#F3F3F5] text-[#717182] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                    style={{ fontFamily: 'Segoe UI' }}
                    aria-label="GST Number"
                  />
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-semibold text-[#0A0A0A] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    defaultValue="123 Healthcare Ave, Medical District, City, State 12345"
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md bg-[#F3F3F5] text-[#717182] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                    style={{ fontFamily: 'Segoe UI' }}
                    aria-label="Address"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="phone-number" className="block text-sm font-semibold text-[#0A0A0A] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone-number"
                    name="phone-number"
                    defaultValue="+1 (555) 123-4567"
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md bg-[#F3F3F5] text-[#717182] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                    style={{ fontFamily: 'Segoe UI' }}
                    aria-label="Phone Number"
                  />
                </div>
                
                <div>
                  <label htmlFor="website" className="block text-sm font-semibold text-[#0A0A0A] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    defaultValue="www.eljayhearing.com"
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md bg-[#F3F3F5] text-[#717182] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                    style={{ fontFamily: 'Segoe UI' }}
                    aria-label="Website"
                  />
                </div>
              </div>
            </div>

            {/* Save Changes Button */}
            <div className="flex justify-end mt-8">
              <button className="flex items-center space-x-2 bg-[#f97316] text-white px-6 py-2 rounded-md hover:bg-[#ea580c] transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                </svg>
                <span className="font-medium" style={{ fontFamily: 'Segoe UI' }}>Save Changes</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
