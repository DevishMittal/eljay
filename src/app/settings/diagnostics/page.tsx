'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils';
import MainLayout from '@/components/layout/main-layout';

const DiagnosticsPage = () => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('diagnostics');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: ''
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

  const diagnosticsData = [
    {
      id: 1,
      name: 'Pure Tone Audiometry',
      category: 'Hearing Assessment',
      price: '$150',
      description: 'Standard hearing test'
    },
    {
      id: 2,
      name: 'Tympanometry',
      category: 'Hearing Assessment',
      price: '$100',
      description: 'Middle ear function test'
    },
    {
      id: 3,
      name: 'OAE Testing',
      category: 'Hearing Assessment',
      price: '$120',
      description: 'Otoacoustic emissions test'
    },
    {
      id: 4,
      name: 'Hearing Aid Fitting',
      category: 'Hearing Aid Services',
      price: '$250',
      description: 'Initial hearing aid fitting and programming'
    },
    {
      id: 5,
      name: 'Balance Assessment',
      category: 'Balance Testing',
      price: '$200',
      description: 'Comprehensive balance evaluation'
    },
    {
      id: 6,
      name: 'Tinnitus Consultation',
      category: 'Tinnitus Evaluation',
      price: '$180',
      description: 'Tinnitus assessment and management'
    }
  ];

  const categories = [
    'Hearing Assessment',
    'Hearing Aid Services',
    'Balance Testing',
    'Tinnitus Evaluation'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save the data to your backend
    console.log('New diagnostic:', formData);
    setShowAddModal(false);
    setFormData({ name: '', category: '', price: '', description: '' });
  };

  const handleCancel = () => {
    setShowAddModal(false);
    setFormData({ name: '', category: '', price: '', description: '' });
  };

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

        {/* Diagnostics Content */}
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
              Diagnostics
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-[#f97316] text-white px-4 py-2 rounded-md hover:bg-[#ea580c] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium" style={{ fontFamily: 'Segoe UI' }}>Add Diagnostic</span>
            </button>
          </div>

          {/* Diagnostics Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    Diagnostic Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    Category
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    Price
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    Description
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {diagnosticsData.map((diagnostic) => (
                  <tr key={diagnostic.id} className="border-b border-border hover:bg-muted/30">
                    <td className="py-3 px-4 text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {diagnostic.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block bg-[#F3F3F5] text-[#717182] px-3 py-1 rounded-full text-sm" style={{ fontFamily: 'Segoe UI' }}>
                        {diagnostic.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#101828] font-semibold" style={{ fontFamily: 'Segoe UI' }}>
                      {diagnostic.price}
                    </td>
                    <td className="py-3 px-4 text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                      {diagnostic.description}
                    </td>
                                         <td className="py-3 px-4">
                       <div className="flex items-center space-x-2">
                         <button 
                           className="p-1 hover:bg-muted rounded transition-colors"
                           aria-label={`Edit ${diagnostic.name}`}
                         >
                           <svg className="w-4 h-4 text-[#4A5565]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                           </svg>
                         </button>
                         <button 
                           className="p-1 hover:bg-muted rounded transition-colors"
                           aria-label={`Delete ${diagnostic.name}`}
                         >
                           <svg className="w-4 h-4 text-[#4A5565]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                           </svg>
                         </button>
                       </div>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Diagnostic Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#101828] mb-1" style={{ fontFamily: 'Segoe UI' }}>
                    Add New Diagnostic
                  </h3>
                  <p className="text-[#4A5565] text-sm" style={{ fontFamily: 'Segoe UI' }}>
                    Fill in the details to add a new diagnostic to your catalog.
                  </p>
                </div>
                                 <button
                   onClick={handleCancel}
                   className="text-[#4A5565] hover:text-[#101828] transition-colors"
                   aria-label="Close modal"
                 >
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-[#0A0A0A] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                    Diagnostic Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md bg-[#F3F3F5] text-[#717182] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                    style={{ fontFamily: 'Segoe UI' }}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-[#0A0A0A] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md bg-[#F3F3F5] text-[#717182] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                    style={{ fontFamily: 'Segoe UI' }}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-semibold text-[#0A0A0A] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                    Price ($)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md bg-[#F3F3F5] text-[#717182] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                    style={{ fontFamily: 'Segoe UI' }}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-[#0A0A0A] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md bg-[#F3F3F5] text-[#717182] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent resize-none"
                    style={{ fontFamily: 'Segoe UI' }}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 border border-[#E5E7EB] text-[#4A5565] rounded-md hover:bg-muted transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="font-medium" style={{ fontFamily: 'Segoe UI' }}>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 bg-[#f97316] text-white px-4 py-2 rounded-md hover:bg-[#ea580c] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium" style={{ fontFamily: 'Segoe UI' }}>Add Diagnostic</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default DiagnosticsPage;
