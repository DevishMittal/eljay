'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils';
import MainLayout from '@/components/layout/main-layout';

const StaffPage = () => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('staff');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    role: '',
    email: '',
    phone: '',
    specialization: '',
    permissions: {
      patientManagement: false,
      appointmentsCalendar: false,
      diagnosticsTesting: false,
      inventoryManagement: false
    }
  });

  const tabs = [
    {
      id: 'profile',
      title: 'Profile',
      href: '/settings',
      icon: (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.0348 1.86523H4.03483C3.3905 1.86523 2.86816 2.38757 2.86816 3.0319V12.3652C2.86816 13.0096 3.3905 13.5319 4.03483 13.5319H11.0348C11.6792 13.5319 12.2015 13.0096 12.2015 12.3652V3.0319C12.2015 2.38757 11.6792 1.86523 11.0348 1.86523Z" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5.78491 13.5326V11.1992H9.28491V13.5326" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5.20166 4.19922H5.20749" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.86816 4.19922H9.874" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7.53491 4.19922H7.54075" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7.53491 6.5332H7.54075" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7.53491 8.86523H7.54075" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.86816 6.5332H9.874" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.86816 8.86523H9.874" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5.20166 6.5332H5.20749" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5.20166 8.86523H5.20749" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'diagnostics',
      title: 'Diagnostics',
      href: '/settings/diagnostics',
      icon: (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.88542 1.86523H3.63542C3.326 1.86523 3.02925 1.98815 2.81046 2.20694C2.59167 2.42574 2.46875 2.72248 2.46875 3.0319V12.3652C2.46875 12.6747 2.59167 12.9714 2.81046 13.1902C3.02925 13.409 3.326 13.5319 3.63542 13.5319H10.6354C10.9448 13.5319 11.2416 13.409 11.4604 13.1902C11.6792 12.9714 11.8021 12.6747 11.8021 12.3652V4.7819L8.88542 1.86523Z" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.30176 1.86523V4.19857C8.30176 4.50799 8.42467 4.80473 8.64347 5.02353C8.86226 5.24232 9.15901 5.36523 9.46842 5.36523H11.8018" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5.96842 5.94922H4.80176" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.46842 8.2832H4.80176" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.46842 10.6152H4.80176" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'staff',
      title: 'Staff',
      href: '/settings/staff',
      icon: (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.1882 12.9492V11.7826C10.1882 11.1637 9.94232 10.5702 9.50473 10.1326C9.06715 9.69505 8.47366 9.44922 7.85482 9.44922H4.35482C3.73598 9.44922 3.14249 9.69505 2.7049 10.1326C2.26732 10.5702 2.02148 11.1637 2.02148 11.7826V12.9492" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10.1885 2.52344C10.6888 2.65315 11.132 2.94534 11.4483 3.35414C11.7646 3.76294 11.9363 4.26521 11.9363 4.7821C11.9363 5.299 11.7646 5.80127 11.4483 6.21007C11.132 6.61887 10.6888 6.91105 10.1885 7.04077" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.6885 12.9496V11.7829C13.6881 11.2659 13.516 10.7637 13.1993 10.3551C12.8825 9.94647 12.4391 9.65464 11.9385 9.52539" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6.10482 7.11589C7.39348 7.11589 8.43815 6.07122 8.43815 4.78255C8.43815 3.49389 7.39348 2.44922 6.10482 2.44922C4.81615 2.44922 3.77148 3.49389 3.77148 4.78255C3.77148 6.07122 4.81615 7.11589 6.10482 7.11589Z" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'doctors',
      title: 'Doctors',
      href: '/settings/doctors',
      icon: (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.37158 1.86523V3.0319" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3.87158 1.86523V3.0319" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3.87158 2.44922H3.28825C2.97883 2.44922 2.68208 2.57214 2.46329 2.79093C2.2445 3.00972 2.12158 3.30647 2.12158 3.61589V5.94922C2.12158 6.87748 2.49033 7.76771 3.14671 8.42409C3.80309 9.08047 4.69332 9.44922 5.62158 9.44922C6.54984 9.44922 7.44008 9.08047 8.09646 8.42409C8.75283 7.76771 9.12158 6.87748 9.12158 5.94922V3.61589C9.12158 3.30647 8.99867 3.00972 8.77987 2.79093C8.56108 2.57214 8.26433 2.44922 7.95492 2.44922H7.37158" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5.62158 9.44922C5.62158 10.3775 5.99033 11.2677 6.64671 11.9241C7.30309 12.5805 8.19332 12.9492 9.12158 12.9492C10.0498 12.9492 10.9401 12.5805 11.5965 11.9241C12.2528 11.2677 12.6216 10.3775 12.6216 9.44922V7.69922" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12.6217 7.69857C13.2661 7.69857 13.7884 7.17623 13.7884 6.5319C13.7884 5.88757 13.2661 5.36523 12.6217 5.36523C11.9774 5.36523 11.4551 5.88757 11.4551 6.5319C11.4551 7.17623 11.9774 7.69857 12.6217 7.69857Z" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'printout',
      title: 'Printout',
      href: '/settings/printout',
      icon: (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.69466 11.1992H2.52799C2.21858 11.1992 1.92183 11.0763 1.70304 10.8575C1.48424 10.6387 1.36133 10.342 1.36133 10.0326V7.11589C1.36133 6.80647 1.48424 6.50972 1.70304 6.29093C1.92183 6.07214 2.21858 5.94922 2.52799 5.94922H11.8613C12.1707 5.94922 12.4675 6.07214 12.6863 6.29093C12.9051 6.50972 13.028 6.80647 13.028 7.11589V10.0326C13.028 10.342 12.9051 10.6387 12.6863 10.8575C12.4675 11.0763 12.1707 11.1992 11.8613 11.1992H10.6947" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3.69482 5.94857V2.44857C3.69482 2.29386 3.75628 2.14548 3.86568 2.03609C3.97507 1.92669 4.12345 1.86523 4.27816 1.86523H10.1115C10.2662 1.86523 10.4146 1.92669 10.524 2.03609C10.6334 2.14548 10.6948 2.29386 10.6948 2.44857V5.94857" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10.1115 8.86523H4.27816C3.95599 8.86523 3.69482 9.1264 3.69482 9.44857V12.9486C3.69482 13.2707 3.95599 13.5319 4.27816 13.5319H10.1115C10.4337 13.5319 10.6948 13.2707 10.6948 12.9486V9.44857C10.6948 9.1264 10.4337 8.86523 10.1115 8.86523Z" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  const staffData = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      role: 'Senior Audiologist',
      email: 'sarah.johnson@eljayhearing.com',
      phone: '+1 (555) 123-4568',
      specialization: 'Pediatric Audiology',
      permissions: ['Patient', 'Appointments', 'Diagnostics', '+3']
    },
    {
      id: 2,
      name: 'Dr. Michael Brown',
      role: 'Audiologist',
      email: 'michael.brown@eljayhearing.com',
      phone: '+1 (555) 123-4569',
      specialization: 'Hearing Aids',
      permissions: ['Patient', 'Appointments', 'Diagnostics', '+2']
    },
    {
      id: 3,
      name: 'Jennifer Lee',
      role: 'Hearing Aid Specialist',
      email: 'jennifer.lee@eljayhearing.com',
      phone: '+1 (555) 123-4570',
      specialization: '',
      permissions: ['Patient', 'Appointments', 'HAT', '+1']
    },
    {
      id: 4,
      name: 'Maria Garcia',
      role: 'Administrative Staff',
      email: 'maria.garcia@eljayhearing.com',
      phone: '+1 (555) 123-4571',
      specialization: '',
      permissions: ['Appointments', 'Billing', 'Expense', '+1']
    }
  ];

  const roles = [
    'Senior Audiologist',
    'Audiologist',
    'Hearing Aid Specialist',
    'Administrative Staff',
    'Receptionist',
    'Technician'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [name]: checked
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically save the data to your backend
    console.log('New staff member:', formData);
    setShowAddModal(false);
    setFormData({
      fullName: '',
      role: '',
      email: '',
      phone: '',
      specialization: '',
      permissions: {
        patientManagement: false,
        appointmentsCalendar: false,
        diagnosticsTesting: false,
        inventoryManagement: false
      }
    });
  };

  const handleCancel = () => {
    setShowAddModal(false);
    setFormData({
      fullName: '',
      role: '',
      email: '',
      phone: '',
      specialization: '',
      permissions: {
        patientManagement: false,
        appointmentsCalendar: false,
        diagnosticsTesting: false,
        inventoryManagement: false
      }
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
        <div className="bg-[#ECECF0] rounded-full p-1 mb-6">
          <div className="flex">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  'flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-full flex-1 justify-center',
                  activeTab === tab.id
                    ? 'text-[#0A0A0A] bg-white shadow-sm'
                    : 'text-[#0A0A0A] hover:bg-white/50'
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

        {/* Staff Content */}
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
              Staff
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-[#f97316] text-white px-4 py-2 rounded-md hover:bg-[#ea580c] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium" style={{ fontFamily: 'Segoe UI' }}>Add Staff Member</span>
            </button>
          </div>

          {/* Staff Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    Role
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    Phone
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    Specialization
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    Permissions
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {staffData.map((staff) => (
                  <tr key={staff.id} className="border-b border-border hover:bg-muted/30">
                    <td className="py-3 px-4 text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                      {staff.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block bg-[#F3F3F5] text-[#717182] px-3 py-1 rounded-full text-sm" style={{ fontFamily: 'Segoe UI' }}>
                        {staff.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                      {staff.email}
                    </td>
                    <td className="py-3 px-4 text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                      {staff.phone}
                    </td>
                    <td className="py-3 px-4 text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                      {staff.specialization || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {staff.permissions.map((permission, index) => (
                          <span 
                            key={index}
                            className="inline-block bg-[#F3F3F5] text-[#717182] px-2 py-1 rounded-full text-xs" 
                            style={{ fontFamily: 'Segoe UI' }}
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="p-1 hover:bg-muted rounded transition-colors"
                          aria-label={`Edit ${staff.name}`}
                        >
                          <svg className="w-4 h-4 text-[#4A5565]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          className="p-1 hover:bg-muted rounded transition-colors"
                          aria-label={`Delete ${staff.name}`}
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

        {/* Add Staff Member Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#101828] mb-1" style={{ fontFamily: 'Segoe UI' }}>
                    Add New Staff Member
                  </h3>
                  <p className="text-[#4A5565] text-sm" style={{ fontFamily: 'Segoe UI' }}>
                    Fill in the details to add a new staff member to your team.
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
                {/* Personal Details Section */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    Personal Details
                  </h4>
                  
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
                    <label htmlFor="role" className="block text-sm font-semibold text-[#0A0A0A] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md bg-[#F3F3F5] text-[#717182] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                      style={{ fontFamily: 'Segoe UI' }}
                      required
                    >
                      <option value="">Select role</option>
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
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
                    <label htmlFor="specialization" className="block text-sm font-semibold text-[#0A0A0A] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                      Specialization (Optional)
                    </label>
                    <input
                      type="text"
                      id="specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-md bg-[#F3F3F5] text-[#717182] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:border-transparent"
                      style={{ fontFamily: 'Segoe UI' }}
                    />
                  </div>
                </div>

                {/* Module Permissions Section */}
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    Module Permissions
                  </h4>
                  <p className="text-[#4A5565] text-sm" style={{ fontFamily: 'Segoe UI' }}>
                    Select the modules and features this staff member can access.
                  </p>
                  
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="patientManagement"
                        checked={formData.permissions.patientManagement}
                        onChange={handleCheckboxChange}
                        className="mt-1 w-4 h-4 text-[#f97316] border-[#E5E7EB] rounded focus:ring-[#f97316] focus:ring-2"
                      />
                      <div>
                        <span className="text-sm font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                          Patient Management
                        </span>
                        <p className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                          View and manage patient records
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="appointmentsCalendar"
                        checked={formData.permissions.appointmentsCalendar}
                        onChange={handleCheckboxChange}
                        className="mt-1 w-4 h-4 text-[#f97316] border-[#E5E7EB] rounded focus:ring-[#f97316] focus:ring-2"
                      />
                      <div>
                        <span className="text-sm font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                          Appointments & Calendar
                        </span>
                        <p className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                          Schedule and manage appointments
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="diagnosticsTesting"
                        checked={formData.permissions.diagnosticsTesting}
                        onChange={handleCheckboxChange}
                        className="mt-1 w-4 h-4 text-[#f97316] border-[#E5E7EB] rounded focus:ring-[#f97316] focus:ring-2"
                      />
                      <div>
                        <span className="text-sm font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                          Diagnostics & Testing
                        </span>
                        <p className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                          Perform and review diagnostic tests
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="inventoryManagement"
                        checked={formData.permissions.inventoryManagement}
                        onChange={handleCheckboxChange}
                        className="mt-1 w-4 h-4 text-[#f97316] border-[#E5E7EB] rounded focus:ring-[#f97316] focus:ring-2"
                      />
                      <div>
                        <span className="text-sm font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                          Inventory Management
                        </span>
                        <p className="text-xs text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                          Manage stock and inventory items
                        </p>
                      </div>
                    </label>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="font-medium" style={{ fontFamily: 'Segoe UI' }}>Add Staff Member</span>
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

export default StaffPage;
