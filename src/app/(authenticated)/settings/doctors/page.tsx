'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils';
import MainLayout from '@/components/layout/main-layout';
import { doctorService } from '@/services/doctorService';
import { useAuth } from '@/contexts/AuthContext';
import { Doctor, CreateDoctorData } from '@/types';
import CustomDropdown from '@/components/ui/custom-dropdown';

const DoctorsPage = () => {
  const pathname = usePathname();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('doctors');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateDoctorData>({
    name: '',
    email: '',
    phoneNumber: '',
    countrycode: '+1',
    specialization: '',
    bdmName: '',
    bdmContact: '',
    commissionRate: 0,
    facilityName: ''
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

  const specializationOptions = specializations.map(spec => ({
    value: spec,
    label: spec
  }));

  const countryCodeOptions = [
    { value: '+1', label: '+1 (USA/Canada)' },
    { value: '+44', label: '+44 (UK)' },
    { value: '+61', label: '+61 (Australia)' },
    { value: '+91', label: '+91 (India)' },
    { value: '+86', label: '+86 (China)' }
  ];

  // Fetch doctors data
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await doctorService.getDoctors(token || undefined);
      setDoctors(response.data);
    } catch (err) {
      setError('Failed to load doctors');
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'commissionRate' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await doctorService.createDoctor(formData, token || undefined);
      await fetchDoctors(); // Refresh the list
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        countrycode: '+1',
        specialization: '',
        bdmName: '',
        bdmContact: '',
        commissionRate: 0,
        facilityName: ''
      });
    } catch (err) {
      console.error('Error creating doctor:', err);
      // You might want to show an error message to the user here
    }
  };

  const handleCancel = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingDoctor(null);
    setFormData({
      name: '',
      email: '',
      phoneNumber: '',
      countrycode: '+1',
      specialization: '',
      bdmName: '',
      bdmContact: '',
      commissionRate: 0,
      facilityName: ''
    });
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      email: doctor.email,
      phoneNumber: doctor.phoneNumber,
      countrycode: doctor.countrycode,
      specialization: doctor.specialization,
      bdmName: doctor.bdmName || '',
      bdmContact: doctor.bdmContact || '',
      commissionRate: doctor.commissionRate || 0,
      facilityName: doctor.facilityName || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;
    
    try {
      const updateData = {
        specialization: formData.specialization,
        phoneNumber: formData.phoneNumber,
        bdmName: formData.bdmName,
        bdmContact: formData.bdmContact,
        commissionRate: formData.commissionRate,
        facilityName: formData.facilityName
      };
      await doctorService.updateDoctor(editingDoctor.id, updateData, token || undefined);
      await fetchDoctors(); // Refresh the list
      setShowEditModal(false);
      setEditingDoctor(null);
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        countrycode: '+1',
        specialization: '',
        bdmName: '',
        bdmContact: '',
        commissionRate: 0,
        facilityName: ''
      });
    } catch (err) {
      console.error('Error updating doctor:', err);
      // You might want to show an error message to the user here
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await doctorService.deleteDoctor(id, token || undefined);
        await fetchDoctors(); // Refresh the list
      } catch (err) {
        console.error('Error deleting doctor:', err);
        // You might want to show an error message to the user here
      }
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-s font-semibold text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
            Settings
          </h1>
          <p className="text-[#4A5565] text-xs" style={{ fontFamily: 'Segoe UI' }}>
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
                  'flex items-center space-x-2 px-4 py-3 text-xs font-medium transition-all duration-200 rounded-full flex-1 justify-center',
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

        {/* Doctors Content */}
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-s font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
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
                <h3 className="text-xs font-semibold text-blue-900 mb-1" style={{ fontFamily: 'Segoe UI' }}>
                  Doctor Referral Management
                </h3>
                <p className="text-xs text-blue-700" style={{ fontFamily: 'Segoe UI' }}>
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-3 text-gray-600">Loading doctors...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={fetchDoctors}
                  className="text-orange-600 hover:text-orange-700 underline"
                >
                  Try again
                </button>
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No doctors found</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="text-orange-600 hover:text-orange-700 underline"
                >
                  Add your first doctor
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-[#101828] text-xs" style={{ fontFamily: 'Segoe UI' }}>
                      Doctor Name
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-[#101828] text-xs" style={{ fontFamily: 'Segoe UI' }}>
                      Specialization
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-[#101828] text-xs" style={{ fontFamily: 'Segoe UI' }}>
                      Hospital/Clinic
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-[#101828] text-xs" style={{ fontFamily: 'Segoe UI' }}>
                      Country Code
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-[#101828] text-xs" style={{ fontFamily: 'Segoe UI' }}>
                      Contact
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-[#101828] text-xs" style={{ fontFamily: 'Segoe UI' }}>
                      BDM
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-[#101828] text-xs" style={{ fontFamily: 'Segoe UI' }}>
                      Commission
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-[#101828] text-xs" style={{ fontFamily: 'Segoe UI' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doctor) => (
                    <tr key={doctor.id} className="border-b border-border hover:bg-muted/30">
                      <td className="py-3 px-4 text-[#101828] text-xs" style={{ fontFamily: 'Segoe UI' }}>
                        {doctor.name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block bg-[#F3F3F5] text-[#717182] px-3 py-1 rounded-full text-xs" style={{ fontFamily: 'Segoe UI' }}>
                          {doctor.specialization}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#4A5565] text-xs" style={{ fontFamily: 'Segoe UI' }}>
                        {doctor.facilityName || '-'}
                      </td>
                      <td className="py-3 px-4 text-[#4A5565] text-xs" style={{ fontFamily: 'Segoe UI' }}>
                        {doctor.countrycode}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[#4A5565] text-xs" style={{ fontFamily: 'Segoe UI' }}>
                          <div>{doctor.countrycode} {doctor.phoneNumber}</div>
                          <div className="text-xs">{doctor.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[#4A5565] text-xs" style={{ fontFamily: 'Segoe UI' }}>
                          {doctor.bdmName ? (
                            <>
                              <div className="font-medium">{doctor.bdmName}</div>
                              <div>{doctor.bdmContact}</div>
                            </>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#4A5565] text-xs" style={{ fontFamily: 'Segoe UI' }}>
                        {doctor.commissionRate ? `${doctor.commissionRate}%` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleEdit(doctor)}
                            className="p-1 hover:bg-muted rounded transition-colors"
                            aria-label={`Edit ${doctor.name}`}
                          >
                            <svg className="w-4 h-4 text-[#4A5565]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(doctor.id)}
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
            )}
          </div>
        </div>

        {/* Add Doctor Modal */}
        {showAddModal && (
          <div className="fixed inset-0 backdrop-blur-xs bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 shadow-lg mx-4">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900">Add New Doctor Referral</h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter full name..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Hospital/Clinic Name
                      </label>
                      <input
                        type="text"
                        name="facilityName"
                        value={formData.facilityName}
                        onChange={handleInputChange}
                        placeholder="Enter hospital/clinic name..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="Enter phone number..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        BDM Name
                      </label>
                      <input
                        type="text"
                        name="bdmName"
                        value={formData.bdmName}
                        onChange={handleInputChange}
                        placeholder="Enter BDM name..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Specialization
                      </label>
                      <CustomDropdown
                        options={specializationOptions}
                        value={formData.specialization}
                        onChange={(value) => setFormData(prev => ({ ...prev, specialization: value }))}
                        placeholder="Select specialization"
                        aria-label="Select specialization"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Country Code
                      </label>
                      <CustomDropdown
                        options={countryCodeOptions}
                        value={formData.countrycode}
                        onChange={(value) => setFormData(prev => ({ ...prev, countrycode: value }))}
                        placeholder="Select country code"
                        aria-label="Select country code"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email address..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        BDM Contact
                      </label>
                      <input
                        type="tel"
                        name="bdmContact"
                        value={formData.bdmContact}
                        onChange={handleInputChange}
                        placeholder="Enter BDM contact..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Commission Rate (%)
                      </label>
                      <input
                        type="number"
                        name="commissionRate"
                        value={formData.commissionRate}
                        onChange={handleInputChange}
                        placeholder="Enter commission rate..."
                        step="0.1"
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 text-xs font-medium text-white bg-gray-600 border border-transparent rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Add Doctor
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Doctor Modal */}
        {showEditModal && editingDoctor && (
          <div className="fixed inset-0 backdrop-blur-xs bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto border-2 shadow-lg mx-4">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900">Edit Doctor</h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Hospital/Clinic Name
                      </label>
                      <input
                        type="text"
                        name="facilityName"
                        value={formData.facilityName}
                        onChange={handleInputChange}
                        placeholder="Enter hospital/clinic name..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="Enter phone number..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        BDM Name
                      </label>
                      <input
                        type="text"
                        name="bdmName"
                        value={formData.bdmName}
                        onChange={handleInputChange}
                        placeholder="Enter BDM name..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Specialization
                      </label>
                      <CustomDropdown
                        options={specializationOptions}
                        value={formData.specialization}
                        onChange={(value) => setFormData(prev => ({ ...prev, specialization: value }))}
                        placeholder="Select specialization"
                        aria-label="Select specialization"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Country Code
                      </label>
                      <CustomDropdown
                        options={countryCodeOptions}
                        value={formData.countrycode}
                        onChange={(value) => setFormData(prev => ({ ...prev, countrycode: value }))}
                        placeholder="Select country code"
                        aria-label="Select country code"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        BDM Contact
                      </label>
                      <input
                        type="tel"
                        name="bdmContact"
                        value={formData.bdmContact}
                        onChange={handleInputChange}
                        placeholder="Enter BDM contact..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Commission Rate (%)
                      </label>
                      <input
                        type="number"
                        name="commissionRate"
                        value={formData.commissionRate}
                        onChange={handleInputChange}
                        placeholder="Enter commission rate..."
                        step="0.1"
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 text-xs font-medium text-white bg-gray-600 border border-transparent rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Update Doctor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default DoctorsPage;
