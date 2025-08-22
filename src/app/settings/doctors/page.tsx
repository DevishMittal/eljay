'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils';
import MainLayout from '@/components/layout/main-layout';

const DoctorsPage = () => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('doctors');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    specialization: '',
    hospitalClinic: '',
    location: '',
    phone: '',
    email: '',
    bdmName: '',
    bdmContact: ''
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

  const doctorsData = [
    {
      id: 1,
      name: 'Dr. Robert Thompson',
      specialization: 'ENT (Otolaryngology)',
      hospitalClinic: 'City General Hospital',
      location: 'Downtown Medical Center',
      phone: '+1 (555) 987-6543',
      email: 'r.thompson@citygeneral.com',
      bdmName: 'Alex Kumar',
      bdmContact: '+1 (555) 111-2222'
    },
    {
      id: 2,
      name: 'Dr. Lisa Anderson',
      specialization: 'Neurology',
      hospitalClinic: 'Northside Medical Associates',
      location: 'Northside Clinic',
      phone: '+1 (555) 876-5432',
      email: 'l.anderson@northsidemedical.com',
      bdmName: 'David Wilson',
      bdmContact: '+1 (555) 333-4444'
    }
  ];

  const specializations = [
    'ENT (Otolaryngology)',
    'Neurology',
    'Cardiology',
    'Orthopedics',
    'Dermatology',
    'Ophthalmology',
    'Internal Medicine',
    'Family Medicine',
    'Pediatrics',
    'Psychiatry'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save the data to your backend
    console.log('New doctor:', formData);
    setShowAddModal(false);
    setFormData({
      fullName: '',
      specialization: '',
      hospitalClinic: '',
      location: '',
      phone: '',
      email: '',
      bdmName: '',
      bdmContact: ''
    });
  };

  const handleCancel = () => {
    setShowAddModal(false);
    setFormData({
      fullName: '',
      specialization: '',
      hospitalClinic: '',
      location: '',
      phone: '',
      email: '',
      bdmName: '',
      bdmContact: ''
    });
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

        {/* Doctors Content */}
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
              Doctor Network
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-[#f97316] text-white px-4 py-2 rounded-md hover:bg-[#ea580c] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium" style={{ fontFamily: 'Segoe UI' }}>Add Doctor</span>
            </button>
          </div>

          {/* Information Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1" style={{ fontFamily: 'Segoe UI' }}>
                  Doctor Referral Management
                </h3>
                <p className="text-sm text-blue-700" style={{ fontFamily: 'Segoe UI' }}>
                  Manage your basic doctor contact information here. For referral tracking, commission management, and detailed referral analytics, visit the dedicated{' '}
                  <span className="font-semibold text-blue-900 cursor-pointer hover:underline">
                    Doctor Referrals module
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Doctors Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    Doctor Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    Specialization
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    Hospital/Clinic
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    Location
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    Contact
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    BDM
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {doctorsData.map((doctor) => (
                  <tr key={doctor.id} className="border-b border-border hover:bg-muted/30">
                    <td className="py-3 px-4 text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {doctor.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block bg-[#F3F3F5] text-[#717182] px-3 py-1 rounded-full text-sm" style={{ fontFamily: 'Segoe UI' }}>
                        {doctor.specialization}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                      {doctor.hospitalClinic}
                    </td>
                    <td className="py-3 px-4 text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                      {doctor.location}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                        <div>{doctor.phone}</div>
                        <div className="text-sm">{doctor.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                        <div>{doctor.bdmName}</div>
                        <div className="text-sm">{doctor.bdmContact}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="p-1 hover:bg-muted rounded transition-colors"
                          aria-label={`Edit ${doctor.name}`}
                        >
                          <svg className="w-4 h-4 text-[#4A5565]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          className="p-1 hover:bg-muted rounded transition-colors"
                          aria-label={`Delete ${doctor.name}`}
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

        {/* Add Doctor Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#101828] mb-1" style={{ fontFamily: 'Segoe UI' }}>
                    Add New Doctor Referral
                  </h3>
                  <p className="text-[#4A5565] text-sm" style={{ fontFamily: 'Segoe UI' }}>
                    Fill in the details to add a new doctor to your referral network.
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

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-semibold text-[#0A0A0A] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md bg-[#F3F3F5] text-[#717182] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                        style={{ fontFamily: 'Segoe UI' }}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="hospitalClinic" className="block text-sm font-semibold text-[#0A0A0A] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Hospital/Clinic Name
                      </label>
                      <input
                        type="text"
                        id="hospitalClinic"
                        name="hospitalClinic"
                        value={formData.hospitalClinic}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md bg-[#F3F3F5] text-[#717182] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                        style={{ fontFamily: 'Segoe UI' }}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-[#0A0A0A] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md bg-[#F3F3F5] text-[#717182] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                        style={{ fontFamily: 'Segoe UI' }}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="bdmName" className="block text-sm font-semibold text-[#0A0A0A] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        BDM Name
                      </label>
                      <input
                        type="text"
                        id="bdmName"
                        name="bdmName"
                        value={formData.bdmName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md bg-[#F3F3F5] text-[#717182] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                        style={{ fontFamily: 'Segoe UI' }}
                        required
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="specialization" className="block text-sm font-semibold text-[#0A0A0A] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Specialization
                      </label>
                      <select
                        id="specialization"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md bg-[#F3F3F5] text-[#717182] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                        style={{ fontFamily: 'Segoe UI' }}
                        required
                      >
                        <option value="">Select specialization</option>
                        {specializations.map((spec) => (
                          <option key={spec} value={spec}>
                            {spec}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-semibold text-[#0A0A0A] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md bg-[#F3F3F5] text-[#717182] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                        style={{ fontFamily: 'Segoe UI' }}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-[#0A0A0A] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md bg-[#F3F3F5] text-[#717182] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                        style={{ fontFamily: 'Segoe UI' }}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="bdmContact" className="block text-sm font-semibold text-[#0A0A0A] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                        BDM Contact
                      </label>
                      <input
                        type="tel"
                        id="bdmContact"
                        name="bdmContact"
                        value={formData.bdmContact}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md bg-[#F3F3F5] text-[#717182] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                        style={{ fontFamily: 'Segoe UI' }}
                        required
                      />
                    </div>
                  </div>
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
                    <span className="font-medium" style={{ fontFamily: 'Segoe UI' }}>Add Doctor</span>
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

export default DoctorsPage;
