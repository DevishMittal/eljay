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
