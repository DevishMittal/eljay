'use client';

import { useState, useEffect, useCallback } from 'react';
import { use } from 'react';
import MainLayout from '@/components/layout/main-layout';
import Link from 'next/link';
import { Patient, UpdatePatientData, UserAppointment } from '@/types';
import { patientService } from '@/services/patientService';
import CustomDropdown from '@/components/ui/custom-dropdown';
import DatePicker from '@/components/ui/date-picker';

export default function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [activeSection, setActiveSection] = useState<'profile' | 'emr' | 'billing'>('profile');
  const [activeSubTab, setActiveSubTab] = useState<'information' | 'appointments'>('information');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<UserAppointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<UpdatePatientData>({});

  const fetchPatient = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await patientService.getPatientById(resolvedParams.id);
      setPatient(response.patient);
    } catch (err) {
      setError('Failed to fetch patient details. Please try again.');
      console.error('Error fetching patient:', err);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  const fetchAppointments = useCallback(async () => {
    if (!patient) return;
    
    try {
      setAppointmentsLoading(true);
      const response = await patientService.getUserAppointments(patient.id);
      setAppointments(response.data.appointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      // Don't show error for appointments, just log it
    } finally {
      setAppointmentsLoading(false);
    }
  }, [patient]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  useEffect(() => {
    if (patient && activeSection === 'profile' && activeSubTab === 'information') {
      fetchAppointments();
    }
  }, [fetchAppointments, activeSection, activeSubTab, patient]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getCountryName = (countrycode: string) => {
    const countryMap: { [key: string]: string } = {
      '+91': 'India',
      '+34': 'Spain',
      '+1': 'USA/Canada',
      '+44': 'UK',
      '+33': 'France',
      '+49': 'Germany'
    };
    return countryMap[countrycode] || 'Unknown';
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setIsEditing(false);
      setEditFormData({});
    } else {
      // Start editing
      setIsEditing(true);
      setEditFormData({
        full_name: patient?.full_name || '',
        mobile_number: patient?.mobile_number || '',
        email_address: patient?.email_address || '',
        dob: patient?.dob || '',
        gender: patient?.gender || 'Male',
        occupation: patient?.occupation || '',
        alternative_number: patient?.alternative_number || '',
        countrycode: patient?.countrycode || '+91'
      });
    }
  };

  const handleInputChange = (field: keyof UpdatePatientData, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = async () => {
    if (!patient) return;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await patientService.updatePatient(patient.patient_id, editFormData);
      await fetchPatient(); // Refresh patient data
      setIsEditing(false);
      setEditFormData({});
      setSuccess('Patient information updated successfully!');
      
      // Clear success message after a delay
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error updating patient:', err);
      setError('Failed to update patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = () => {
    // TODO: Implement appointment booking modal
    console.log('Book appointment for patient:', patient?.patient_id);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading patient details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !patient) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <p className="text-red-600 mb-4">{error || 'Patient not found'}</p>
            <div className="space-x-3">
              <button 
                onClick={fetchPatient}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/patients"
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back to Patients
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

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
                      className={`w-full text-left px-6 py-2 text-xs transition-colors rounded-md mx-4 ${
                        activeSubTab === 'appointments'
                          ? 'text-orange-700 bg-orange-100'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
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
                onClick={() => setActiveSection('emr')}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors rounded-lg ${
                  activeSection === 'emr'
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
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
                onClick={() => setActiveSection('billing')}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors rounded-lg ${
                  activeSection === 'billing'
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
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
                  <span className="text-orange-600 font-regular text-xs">{getInitials(patient.full_name)}</span>
                </div>
                <h1 className="text-md font-semibold text-gray-900">{patient.full_name}</h1>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleEditToggle}
                  disabled={loading}
                  className="px-4 py-2 text-xs text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
                {isEditing && (
                  <button
                    onClick={handleSaveEdit}
                    disabled={loading}
                    className="text-xs px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-800 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {loading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                )}
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
                      <h2 className="text-lg font-semibold text-gray-900">Patient Information</h2>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleEditToggle}
                        disabled={loading}
                        className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        {isEditing ? 'Cancel' : 'Edit'}
                      </button>
                      {isEditing && (
                        <button
                          onClick={handleSaveEdit}
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
                          <span>{loading ? 'Saving...' : 'Save'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="text-red-800 font-medium text-sm mb-1">Error Updating Patient</h4>
                        <p className="text-red-600 text-sm">{error}</p>
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
                        <h4 className="text-green-800 font-medium text-sm mb-1">Success!</h4>
                        <p className="text-green-600 text-sm">{success}</p>
                      </div>
                    </div>
                  </div>
                )}

                  <div className="space-y-6">
                    {/* Personal Details Section */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Personal Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.full_name || ''}
                              onChange={(e) => handleInputChange('full_name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Enter full name"
                              aria-label="Full name"
                            />
                          ) : (
                            <div className="w-full px-3 py-2 bg-gray-50 rounded-lg text-gray-900">
                              {patient.full_name}
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                          {isEditing ? (
                            <DatePicker
                              value={editFormData.dob || ''}
                              onChange={(date) => handleInputChange('dob', date)}
                              placeholder="Select date of birth"
                              maxDate={new Date()}
                              disabled={loading}
                              aria-label="Date of birth"
                            />
                          ) : (
                            <div className="w-full px-3 py-2 bg-gray-50 rounded-lg text-gray-600">
                              {patient.dob ? `${patientService.formatDate(patient.dob)} (${patientService.calculateAge(patient.dob)} years)` : 'Not provided'}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                          {isEditing ? (
                            <CustomDropdown
                              options={[
                                { value: 'Male', label: 'Male' },
                                { value: 'Female', label: 'Female' },
                                { value: 'Other', label: 'Other' }
                              ]}
                              value={editFormData.gender || 'Male'}
                              onChange={(value) => handleInputChange('gender', value as 'Male' | 'Female')}
                              placeholder="Select gender"
                              disabled={loading}
                              aria-label="Select gender"
                            />
                          ) : (
                            <div className="w-full px-3 py-2 bg-gray-50 rounded-lg text-gray-600">
                              {patient.gender}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Occupation *</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.occupation || ''}
                              onChange={(e) => handleInputChange('occupation', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Enter occupation"
                              aria-label="Occupation"
                            />
                          ) : (
                            <div className="w-full px-3 py-2 bg-gray-50 rounded-lg text-gray-600">
                              {patient.occupation || 'Not provided'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact Information Section */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={editFormData.mobile_number || ''}
                              onChange={(e) => handleInputChange('mobile_number', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Enter phone number"
                              aria-label="Phone number"
                            />
                          ) : (
                            <div className="w-full px-3 py-2 bg-gray-50 rounded-lg text-gray-600">
                              {patient.mobile_number}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Country Code *</label>
                          {isEditing ? (
                            <CustomDropdown
                              options={[
                                { value: '+91', label: '+91 (India)' },
                                { value: '+34', label: '+34 (Spain)' },
                                { value: '+1', label: '+1 (USA/Canada)' },
                                { value: '+44', label: '+44 (UK)' },
                                { value: '+33', label: '+33 (France)' },
                                { value: '+49', label: '+49 (Germany)' }
                              ]}
                              value={editFormData.countrycode || patient.countrycode || '+91'}
                              onChange={(value) => handleInputChange('countrycode', value)}
                              placeholder="Select country code"
                              disabled={loading}
                              aria-label="Select country code"
                            />
                          ) : (
                            <div className="w-full px-3 py-2 bg-gray-50 rounded-lg text-gray-600">
                              {patient.countrycode ? `${patient.countrycode} (${getCountryName(patient.countrycode)})` : 'Not provided'}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Number</label>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={editFormData.alternative_number || ''}
                              onChange={(e) => handleInputChange('alternative_number', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Enter alternate number (optional)"
                              aria-label="Alternate number"
                            />
                          ) : (
                            <div className="w-full px-3 py-2 bg-gray-50 rounded-lg text-gray-600">
                              {patient.alternative_number || 'Not provided'}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                          {isEditing ? (
                            <input
                              type="email"
                              value={editFormData.email_address || ''}
                              onChange={(e) => handleInputChange('email_address', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Enter email address"
                              aria-label="Email address"
                            />
                          ) : (
                            <div className="w-full px-3 py-2 bg-gray-50 rounded-lg text-gray-600">
                              {patient.email_address}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type *</label>
                          <div className="w-full px-3 py-2 bg-gray-50 rounded-lg text-gray-600">
                            {patient.type || 'Regular'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment History Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <h2 className="text-lg font-semibold text-gray-900">Appointment History</h2>
                      {appointments.length > 0 && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={handleBookAppointment}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-orange-800 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Book Appointment</span>
                    </button>
                  </div>

                  {appointmentsLoading ? (
                    <div className="text-center py-16">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading appointments...</p>
                    </div>
                  ) : appointments.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium mb-2 text-gray-900">No appointments yet</h3>
                      <p className="text-gray-500 mb-6">Schedule the first appointment for this patient</p>
                      <button 
                        onClick={handleBookAppointment}
                        className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 mx-auto hover:bg-orange-800 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Book First Appointment</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {appointments.map((appointment) => (
                        <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">{appointment.procedures}</h3>
                                <p className="text-sm text-gray-500">
                                  {patientService.formatDate(appointment.appointmentDate)} at {patientService.formatTime(appointment.appointmentTime)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">{appointment.appointmentDuration} minutes</div>
                              <div className="text-xs text-gray-500">
                                {appointment.referralSource}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-4 text-gray-600">
                              <div className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>{appointment.audiologist.name}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>{appointment.audiologist.email}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="p-1 hover:bg-gray-200 rounded-md transition-colors" title="View details">
                                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button className="p-1 hover:bg-gray-200 rounded-md transition-colors" title="Edit appointment">
                                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'emr' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h2 className="text-lg font-semibold text-gray-900">Electronic Medical Records</h2>
                </div>
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-gray-900">EMR Coming Soon</h3>
                  <p className="text-gray-500">Electronic Medical Records functionality will be available soon.</p>
                </div>
              </div>
            )}

            {activeSection === 'billing' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <h2 className="text-lg font-semibold text-gray-900">Billing Information</h2>
                </div>
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-gray-900">Billing Coming Soon</h3>
                  <p className="text-gray-500">Billing functionality will be available soon.</p>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
