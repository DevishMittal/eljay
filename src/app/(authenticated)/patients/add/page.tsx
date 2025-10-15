/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/main-layout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreateUserData } from '@/types';
import { patientService } from '@/services/patientService';
import CustomDropdown from '@/components/ui/custom-dropdown';
import DatePicker from '@/components/ui/date-picker';
import WalkInAppointmentModal from '@/components/modals/walk-in-appointment-modal';
import { useAuth } from '@/contexts/AuthContext';
import HospitalService from '@/services/hospitalService';

export default function AddPatientPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [activeSection, setActiveSection] = useState<'profile' | 'emr' | 'billing'>('profile');
  const [activeSubTab, setActiveSubTab] = useState<'information' | 'appointments'>('information');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(true);
  const [formData, setFormData] = useState<CreateUserData>({
    fullname: '',
    email: '',
    phoneNumber: '',
    dob: '',
    gender: 'Male',
    occupation: '',
    customerType: 'B2C',
    alternateNumber: '',
    countrycode: '+91',
    hospitalName: '',
    opipNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [hospitals, setHospitals] = useState<string[]>([]);
  const [customHospitalName, setCustomHospitalName] = useState('');
  const [isOtherHospitalSelected, setIsOtherHospitalSelected] = useState(false);

  const handleInputChange = (field: keyof CreateUserData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset hospital name when changing customer type to B2C
    if (field === 'customerType' && value === 'B2C') {
      setFormData(prev => ({
        ...prev,
        hospitalName: ''
      }));
      setCustomHospitalName('');
      setIsOtherHospitalSelected(false);
    }
  };

  // Load hospitals on component mount
  useEffect(() => {
    const loadHospitals = async () => {
      try {
        const response = await HospitalService.getHospitals();
        setHospitals(response.data.hospitals.map(hospital => hospital.name));
      } catch (error) {
        console.error('Error loading hospitals:', error);
      }
    };
    
    loadHospitals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullname.trim() || !formData.phoneNumber.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (formData.phoneNumber.length !== 10) {
      setError('Mobile number must be exactly 10 digits');
      return;
    }
    
    if (formData.customerType === 'B2B' && !formData.hospitalName) {
      setError('Please select a hospital for B2B patients');
      return;
    }

    // Note: OP/IP number is not required during patient creation
    // It can be added later during profile editing to complete the profile

    // Filter out empty optional fields to avoid backend validation issues
    const submitData = { ...formData };
    if (!submitData.alternateNumber?.trim()) {
      delete submitData.alternateNumber;
    }
    if (!submitData.opipNumber?.trim()) {
      delete submitData.opipNumber;
    }
    if (!submitData.email?.trim()) {
      delete submitData.email;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const response = await patientService.createUser(submitData, token || undefined);
      
      if (response.status === 'success') {
        setSuccess('Patient created successfully!');
        
        // Navigate back to patients list after a short delay
        setTimeout(() => {
          router.push('/patients');
        }, 1500);
      } else {
        setError('Failed to create patient. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create patient. Please try again.');
      console.error('Error creating patient:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/patients');
  };

  const handleBookAppointment = () => {
    setShowAppointmentModal(true);
  };

  const handleCloseAppointmentModal = () => {
    setShowAppointmentModal(false);
  };

  const handleAppointmentCreated = (appointment: any) => {
    console.log('Appointment created:', appointment);
    setShowAppointmentModal(false);
    // You can add additional logic here like showing a success message
  };

  return (
    <MainLayout className="!pt-2.5 !p-0 bg-white">
      <div className="flex h-full bg-gray-50">
        {/* Sidebar */}
        <div className="w-80 bg-white flex flex-col -mt-2">
          {/* Patient Records Header */}
          <div className="!border-b border-gray-200 p-4.5">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #FF6900 0%, #F54900 100%)'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.125 18.875V17.125C17.125 16.1967 16.7563 15.3065 16.0999 14.6501C15.4435 13.9937 14.5533 13.625 13.625 13.625H8.375C7.44674 13.625 6.5565 13.9937 5.90013 14.6501C5.24375 15.3065 4.875 16.1967 4.875 17.125V18.875" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M11 10.125C12.933 10.125 14.5 8.558 14.5 6.625C14.5 4.692 12.933 3.125 11 3.125C9.067 3.125 7.5 4.692 7.5 6.625C7.5 8.558 9.067 10.125 11 10.125Z" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-gray-600 text-xs font-medium">Patient Records</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 p-4">
            <nav className="space-y-2">
              {/* Profile Section */}
              <div>
                <button
                  onClick={() => {
                    setActiveSection('profile');
                    setIsProfileDropdownOpen(!isProfileDropdownOpen);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors rounded-lg ${
                    activeSection === 'profile' && isProfileDropdownOpen
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <svg width="16" height="16" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.125 18.875V17.125C17.125 16.1967 16.7563 15.3065 16.0999 14.6501C15.4435 13.9937 14.5533 13.625 13.625 13.625H8.375C7.44674 13.625 6.5565 13.9937 5.90013 14.6501C5.24375 15.3065 4.875 16.1967 4.875 17.125V18.875" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M11 10.125C12.933 10.125 14.5 8.558 14.5 6.625C14.5 4.692 12.933 3.125 11 3.125C9.067 3.125 7.5 4.692 7.5 6.625C7.5 8.558 9.067 10.125 11 10.125Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-xs font-medium">Profile</span>
                  </div>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Content with Animation */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out !border-l-2 !border-orange-200 ${
                  isProfileDropdownOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="mt-2 space-y-1">
                    <button
                      onClick={() => setActiveSubTab('information')}
                      className={`w-full text-left px-6 py-2 text-xs transition-colors rounded-md mx-4 ${
                        activeSubTab === 'information'
                          ? 'text-orange-700 bg-orange-100'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <svg width="16" height="16" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.125 18.875V17.125C17.125 16.1967 16.7563 15.3065 16.0999 14.6501C15.4435 13.9937 14.5533 13.625 13.625 13.625H8.375C7.44674 13.625 6.5565 13.9937 5.90013 14.6501C5.24375 15.3065 4.875 16.1967 4.875 17.125V18.875" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M11 10.125C12.933 10.125 14.5 8.558 14.5 6.625C14.5 4.692 12.933 3.125 11 3.125C9.067 3.125 7.5 4.692 7.5 6.625C7.5 8.558 9.067 10.125 11 10.125Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Patient Information</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveSubTab('appointments')}
                      className="w-full text-left px-6 py-2 text-xs transition-colors rounded-md mx-4 text-gray-400 cursor-not-allowed hover:bg-gray-50"
                      disabled
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Appointment History</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* EMR Section */}
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors text-gray-400 cursor-not-allowed rounded-lg hover:bg-gray-50"
                disabled
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs font-medium">EMR</span>
                </div>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Billing Section */}
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors text-gray-400 cursor-not-allowed rounded-lg hover:bg-gray-50"
                disabled
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span className="text-xs font-medium">Billing</span>
                </div>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Patient Header */}
          <div className="bg-white !border-b !border-l !border-gray-200 px-6 py-4 -mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/patients" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <div className="w-11 h-11 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-regular text-xs">NA</span>
                </div>
                <h1 className="text-md font-semibold text-gray-900">New Patient</h1>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="px-4 py-2 text-xs text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="text-xs px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-800 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>{loading ? 'Creating...' : 'Create Patient'}</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            <div className="p-8">
            {activeSection === 'profile' && activeSubTab === 'information' && (
              <div className="space-y-6">
                {/* Patient Information Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <svg width="16" height="16" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.125 18.875V17.125C17.125 16.1967 16.7563 15.3065 16.0999 14.6501C15.4435 13.9937 14.5533 13.625 13.625 13.625H8.375C7.44674 13.625 6.5565 13.9937 5.90013 14.6501C5.24375 15.3065 4.875 16.1967 4.875 17.125V18.875" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M11 10.125C12.933 10.125 14.5 8.558 14.5 6.625C14.5 4.692 12.933 3.125 11 3.125C9.067 3.125 7.5 4.692 7.5 6.625C7.5 8.558 9.067 10.125 11 10.125Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <h2 className="text-md font-semibold text-gray-900">Patient Information</h2>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="px-4 py-2 text-xs text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-4 py-2 text-xs bg-orange-600 text-white rounded-lg hover:bg-orange-800 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_145_14395)">
                              <path d="M9.36667 1.8501C9.6744 1.85448 9.96793 1.98028 10.1833 2.2001L12.4 4.41676C12.6198 4.63217 12.7456 4.9257 12.75 5.23343V11.1834C12.75 11.4928 12.6271 11.7896 12.4083 12.0084C12.1895 12.2272 11.8928 12.3501 11.5833 12.3501H3.41667C3.10725 12.3501 2.8105 12.2272 2.59171 12.0084C2.37292 11.7896 2.25 11.4928 2.25 11.1834V3.01676C2.25 2.70735 2.37292 2.4106 2.59171 2.19181C2.8105 1.97301 3.10725 1.8501 3.41667 1.8501H9.36667Z" stroke="white" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M10.4163 12.3503V8.26693C10.4163 8.11222 10.3549 7.96384 10.2455 7.85445C10.1361 7.74505 9.98772 7.68359 9.83301 7.68359H5.16634C5.01163 7.68359 4.86326 7.74505 4.75386 7.85445C4.64447 7.96384 4.58301 8.11222 4.58301 8.26693V12.3503" stroke="white" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M4.58301 1.8501V4.18343C4.58301 4.33814 4.64447 4.48651 4.75386 4.59591C4.86326 4.70531 5.01163 4.76676 5.16634 4.76676H9.24967" stroke="white" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                            </g>
                            <defs>
                              <clipPath id="clip0_145_14395">
                                <rect width="14" height="14" fill="white" transform="translate(0.5 0.100098)"/>
                              </clipPath>
                            </defs>
                          </svg>
                        )}
                        <span>{loading ? 'Creating...' : 'Save'}</span>
                      </button>
                    </div>
                  </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="text-red-800 font-medium text-xs mb-1">Error Creating Patient</h4>
                        <p className="text-red-600 text-xs">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="text-green-800 font-medium text-xs mb-1">Success!</h4>
                        <p className="text-green-600 text-xs">{success}</p>
                      </div>
                    </div>
                  </div>
                )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Details Section */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Personal Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={formData.fullname}
                            onChange={(e) => handleInputChange('fullname', e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Enter full name"
                            disabled={loading}
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth</label>
                          <DatePicker
                            value={formData.dob}
                            onChange={(date) => handleInputChange('dob', date)}
                            placeholder="29-08-2025"
                            maxDate={new Date()}
                            disabled={loading}
                            aria-label="Date of birth"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Gender <span className="text-red-500">*</span></label>
                          <CustomDropdown
                            options={[
                              { value: 'Male', label: 'Male' },
                              { value: 'Female', label: 'Female' },
                              { value: 'Other', label: 'Other' }
                            ]}
                            value={formData.gender}
                            onChange={(value) => handleInputChange('gender', value as 'Male' | 'Female')}
                            placeholder="Male"
                            disabled={loading}
                            aria-label="Select gender"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Occupation</label>
                          <input
                            type="text"
                            value={formData.occupation}
                            onChange={(e) => handleInputChange('occupation', e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Enter occupation"
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Information Section */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
                          <input
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                              if (value.length <= 10) {
                                handleInputChange('phoneNumber', value);
                              }
                            }}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Enter 10-digit mobile number"
                            disabled={loading}
                            required
                            maxLength={10}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Email Address (Optional)</label>
                          <input
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Enter email address"
                            disabled={loading}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Country Code <span className="text-red-500">*</span></label>
                          <CustomDropdown
                            options={[
                              { value: '+91', label: '+91 (India)' }
                            ]}
                            value={formData.countrycode}
                            onChange={(value) => handleInputChange('countrycode', value)}
                            placeholder="Select country code"
                            disabled={loading}
                            aria-label="Select country code"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Customer Type <span className="text-red-500">*</span></label>
                          <CustomDropdown
                            options={[
                              { value: 'B2C', label: 'B2C' },
                              { value: 'B2B', label: 'B2B' }
                            ]}
                            value={formData.customerType}
                            onChange={(value) => handleInputChange('customerType', value)}
                            placeholder="Select customer type"
                            disabled={loading}
                            aria-label="Select customer type"
                          />
                        </div>

                        {/* Hospital field - only show for B2B patients */}
                        {formData.customerType === 'B2B' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Hospital Name</label>
                            <div className="space-y-2">
                              <CustomDropdown
                                options={[
                                  ...hospitals.map(hospital => ({ value: hospital, label: hospital })),
                                  { value: 'Other', label: 'Other' }
                                ]}
                                value={isOtherHospitalSelected ? 'Other' : (formData.hospitalName || '')}
                                onChange={(value) => {
                                  if (value === 'Other') {
                                    setIsOtherHospitalSelected(true);
                                    setCustomHospitalName('');
                                    handleInputChange('hospitalName', '');
                                  } else {
                                    setIsOtherHospitalSelected(false);
                                    setCustomHospitalName('');
                                    handleInputChange('hospitalName', value);
                                  }
                                }}
                                placeholder="Select hospital"
                                disabled={loading}
                                aria-label="Hospital name"
                              />
                              
                              {/* Custom hospital input - only show when "Other" is selected */}
                              {isOtherHospitalSelected && (
                                <div>
                                  <input
                                    type="text"
                                    value={customHospitalName}
                                    onChange={(e) => {
                                      setCustomHospitalName(e.target.value);
                                      // Update the hospital name directly in form data
                                      handleInputChange('hospitalName', e.target.value);
                                    }}
                                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="Enter hospital name"
                                    disabled={loading}
                                    aria-label="Custom hospital name"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* OP/IP/UHID Number - Only for B2B patients, optional during creation */}
                        {formData.customerType === 'B2B' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">OP/IP/UHID Number (Optional)</label>
                            <input
                              type="text"
                              value={formData.opipNumber || ''}
                              onChange={(e) => handleInputChange('opipNumber', e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Enter OP/IP/UHID number (can be added later)"
                              disabled={loading}
                              aria-label="OP/IP/UHID number"
                            />
                            <p className="text-xs text-gray-500 mt-1">Can be added later to complete profile</p>
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Alternate Number</label>
                          <input
                            type="tel"
                            value={formData.alternateNumber || ''}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                              if (value.length <= 10) {
                                handleInputChange('alternateNumber', value);
                              }
                            }}
                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Enter 10-digit alternate number (optional)"
                            disabled={loading}
                            maxLength={10}
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Appointment History Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <h2 className="text-md font-semibold text-gray-900">Appointment History</h2>
                    </div>
                    <button 
                      onClick={handleBookAppointment}
                      className="text-sm bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-orange-800 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Book Appointment</span>
                    </button>
                  </div>

                  {/* Empty State */}
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium mb-2 text-gray-900">No appointments yet</h3>
                    <p className="text-gray-500 mb-6">Schedule the first appointment for this patient</p>
                    <button 
                      onClick={handleBookAppointment}
                      className="text-sm bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 mx-auto hover:bg-orange-800 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Book First Appointment</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'profile' && activeSubTab === 'appointments' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h2 className="text-md font-semibold text-gray-900">Appointment History</h2>
                </div>
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium mb-2 text-gray-900">No appointments yet</h3>
                  <p className="text-gray-500 mb-6">Schedule the first appointment for this patient.</p>
                  <button className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 mx-auto hover:bg-orange-800 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Book First Appointment</span>
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Walk-in Appointment Modal */}
      <WalkInAppointmentModal
        isOpen={showAppointmentModal}
        onClose={handleCloseAppointmentModal}
        onAppointmentCreated={handleAppointmentCreated}
      />
    </MainLayout>
  );
}
