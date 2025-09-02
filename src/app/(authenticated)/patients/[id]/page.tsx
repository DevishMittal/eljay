/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { use } from 'react';
import MainLayout from '@/components/layout/main-layout';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Patient, UpdatePatientData, UserAppointment, ClinicalNote } from '@/types';
import { patientService } from '@/services/patientService';
import { clinicalNotesService } from '@/services/clinicalNotesService';
import CustomDropdown from '@/components/ui/custom-dropdown';
import DatePicker from '@/components/ui/date-picker';
import WalkInAppointmentModal from '@/components/modals/walk-in-appointment-modal';
import ClinicalNoteModal from '@/components/modals/clinical-note-modal';
import { useAuth } from '@/contexts/AuthContext';

export default function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const pathname = usePathname();
  const { token } = useAuth();
  const [activeSection, setActiveSection] = useState<'profile' | 'emr' | 'billing'>('profile');
  const [activeSubTab, setActiveSubTab] = useState<'information' | 'appointments' | 'diagnostics' | 'clinical-notes' | 'patient-files' | 'medical-history'>('information');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(true);
  const [activeProfileButton, setActiveProfileButton] = useState<'information' | 'appointments'>('information');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<UserAppointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<UpdatePatientData>({});
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  
  // Clinical Notes state
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
  const [clinicalNotesLoading, setClinicalNotesLoading] = useState(false);
  const [showClinicalNoteModal, setShowClinicalNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<ClinicalNote | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);

  const fetchPatient = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await patientService.getPatientById(resolvedParams.id, token || undefined);
      setPatient(response.patient);
    } catch (err) {
      setError('Failed to fetch patient details. Please try again.');
      console.error('Error fetching patient:', err);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id, token]);

  const fetchAppointments = useCallback(async () => {
    if (!patient) return;
    
    try {
      setAppointmentsLoading(true);
      const response = await patientService.getUserAppointments(patient.id, token || undefined);
      setAppointments(response.data.appointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      // Don't show error for appointments, just log it
    } finally {
      setAppointmentsLoading(false);
    }
  }, [patient, token]);

  const fetchClinicalNotes = useCallback(async () => {
    if (!patient || !token) return;
    
    try {
      setClinicalNotesLoading(true);
      const response = await clinicalNotesService.getClinicalNotes(patient.id, 1, 50, token);
      setClinicalNotes(response.clinicalNotes);
    } catch (err) {
      console.error('Error fetching clinical notes:', err);
      // Don't show error for clinical notes, just log it
    } finally {
      setClinicalNotesLoading(false);
    }
  }, [patient, token]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  useEffect(() => {
    if (patient && activeSection === 'profile' && activeSubTab === 'information') {
      fetchAppointments();
    }
  }, [fetchAppointments, activeSection, activeSubTab, patient]);

  useEffect(() => {
    if (patient && activeSection === 'emr') {
      // Fetch clinical notes when EMR section is opened
      fetchClinicalNotes();
    }
  }, [fetchClinicalNotes, activeSection, patient]);

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
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      await patientService.updateUser(patient?.id || '', editFormData, token || undefined);
      await fetchPatient(); // Refresh patient data
      setIsEditing(false);
      setSuccess('Patient information updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to update patient information');
      console.error('Error updating patient:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = () => {
    setShowAppointmentModal(true);
  };

  const handleCloseAppointmentModal = () => {
    setShowAppointmentModal(false);
  };

  const handleAppointmentCreated = (appointment: { id: string; date: Date; time: string; patient: string; type: string; duration: number; audiologist: string; notes: string; phoneNumber: string; email: string }) => {
    console.log('Appointment created:', appointment);
    setShowAppointmentModal(false);
    // Refresh appointments list
    if (patient) {
      fetchAppointments();
    }
  };

  const scrollToAppointmentHistory = () => {
    const appointmentHistoryElement = document.getElementById('appointment-history');
    if (appointmentHistoryElement) {
      appointmentHistoryElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToPatientInformation = () => {
    const patientInformationElement = document.getElementById('patient-information');
    if (patientInformationElement) {
      patientInformationElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToSection = (section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Clinical Notes handlers
  const handleAddClinicalNote = () => {
    setEditingNote(null);
    setIsEditingNote(false);
    setShowClinicalNoteModal(true);
  };

  const handleEditClinicalNote = (note: ClinicalNote) => {
    setEditingNote(note);
    setIsEditingNote(true);
    setShowClinicalNoteModal(true);
  };

  const handleDeleteClinicalNote = async (noteId: string) => {
    if (!patient || !token) return;
    
    if (!confirm('Are you sure you want to delete this clinical note?')) return;
    
    try {
      await clinicalNotesService.deleteClinicalNote(patient.id, noteId, token);
      // Refresh the list
      fetchClinicalNotes();
    } catch (err) {
      console.error('Error deleting clinical note:', err);
      alert('Failed to delete clinical note');
    }
  };

  const handleClinicalNoteSuccess = (note: ClinicalNote) => {
    // Refresh the list
    fetchClinicalNotes();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Diagnosis':
        return 'bg-blue-100 text-blue-800';
      case 'Follow-up':
        return 'bg-purple-100 text-purple-800';
      case 'Treatment':
        return 'bg-green-100 text-green-800';
      case 'Test Results':
        return 'bg-yellow-100 text-yellow-800';
      case 'Prescription':
        return 'bg-indigo-100 text-indigo-800';
      case 'Referral':
        return 'bg-pink-100 text-pink-800';
      case 'General':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
                      onClick={() => {
                        setActiveSubTab('information');
                        setActiveProfileButton('information');
                        scrollToPatientInformation();
                      }}
                      className={`w-full text-left px-6 py-2 text-xs transition-colors rounded-md mx-4 ${
                        activeProfileButton === 'information'
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
                      onClick={() => {
                        setActiveSubTab('information');
                        setActiveProfileButton('appointments');
                        scrollToAppointmentHistory();
                      }}
                      className={`w-full text-left px-6 py-2 text-xs transition-colors rounded-md mx-4 ${
                        activeProfileButton === 'appointments'
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
              <div>
                <button
                  onClick={() => {
                    setActiveSection('emr');
                    setIsProfileDropdownOpen(false);
                  }}
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
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${activeSection === 'emr' ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* EMR Dropdown Content */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out !border-l-2 !border-orange-200 ${
                  activeSection === 'emr' ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="mt-2 space-y-1">
                    <button
                      onClick={() => {
                        setActiveSubTab('diagnostics');
                        scrollToSection('diagnostics');
                      }}
                      className={`w-full text-left px-6 py-2 text-xs transition-colors rounded-md mx-4 ${
                        activeSubTab === 'diagnostics'
                          ? 'text-orange-700 bg-orange-100'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g clipPath="url(#clip0_1_44808)">
                            <path d="M12.9333 7.65023H11.4866C11.2317 7.64968 10.9836 7.73266 10.7803 7.88646C10.5769 8.04026 10.4296 8.25643 10.3608 8.50189L8.98993 13.3786C8.9811 13.4089 8.96268 13.4355 8.93743 13.4544C8.91219 13.4733 8.88149 13.4836 8.84993 13.4836C8.81838 13.4836 8.78768 13.4733 8.76243 13.4544C8.73719 13.4355 8.71877 13.4089 8.70993 13.3786L5.48993 1.92189C5.4811 1.8916 5.46268 1.86499 5.43743 1.84606C5.41219 1.82713 5.38149 1.81689 5.34993 1.81689C5.31838 1.81689 5.28768 1.82713 5.26243 1.84606C5.23719 1.86499 5.21877 1.8916 5.20993 1.92189L3.8391 6.79856C3.77054 7.04307 3.62407 7.25853 3.42194 7.41224C3.2198 7.56594 2.97304 7.6495 2.7191 7.65023H1.2666" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                          </g>
                        </svg>
                        <span>Diagnostics</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setActiveSubTab('clinical-notes');
                        scrollToSection('clinical-notes');
                      }}
                      className={`w-full text-left px-6 py-2 text-xs transition-colors rounded-md mx-4 ${
                        activeSubTab === 'clinical-notes'
                          ? 'text-orange-700 bg-orange-100'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g clipPath="url(#clip0_1_44814)">
                            <path d="M8.84993 1.81689H5.34993C5.02777 1.81689 4.7666 2.07806 4.7666 2.40023V3.56689C4.7666 3.88906 5.02777 4.15023 5.34993 4.15023H8.84993C9.1721 4.15023 9.43327 3.88906 9.43327 3.56689V2.40023C9.43327 2.07806 9.1721 1.81689 8.84993 1.81689Z" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9.43359 2.98389H10.6003C10.9097 2.98389 11.2064 3.1068 11.4252 3.3256C11.644 3.54439 11.7669 3.84113 11.7669 4.15055V12.3172C11.7669 12.6266 11.644 12.9234 11.4252 13.1422C11.2064 13.361 10.9097 13.4839 10.6003 13.4839H3.60026C3.29084 13.4839 2.99409 13.361 2.7753 13.1422C2.55651 12.9234 2.43359 12.6266 2.43359 12.3172V4.15055C2.43359 3.84113 2.55651 3.54439 2.7753 3.3256C2.99409 3.1068 3.29084 2.98389 3.60026 2.98389H4.76693" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7.1001 7.06689H9.43343" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7.1001 9.98389H9.43343" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M4.7666 7.06689H4.77244" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M4.7666 9.98389H4.77244" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                          </g>
                        </svg>
                        <span>Clinical Notes</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setActiveSubTab('patient-files');
                        scrollToSection('patient-files');
                      }}
                      className={`w-full text-left px-6 py-2 text-xs transition-colors rounded-md mx-4 ${
                        activeSubTab === 'patient-files'
                          ? 'text-orange-700 bg-orange-100'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g clipPath="url(#clip0_1_44820)">
                            <path d="M8.85026 1.81689H3.60026C3.29084 1.81689 2.99409 1.93981 2.7753 2.1586C2.55651 2.3774 2.43359 2.67414 2.43359 2.98356V12.3169C2.43359 12.6263 2.55651 12.9231 2.7753 13.1419C2.99409 13.3606 3.29084 13.4836 3.60026 13.4836H10.6003C10.9097 13.4836 11.2064 13.3606 11.4252 13.1419C11.644 12.9231 11.7669 12.6263 11.7669 12.3169V4.73356L8.85026 1.81689Z" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8.2666 1.81689V4.15023C8.2666 4.45965 8.38952 4.75639 8.60831 4.97519C8.8271 5.19398 9.12385 5.31689 9.43327 5.31689H11.7666" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5.93327 5.90039H4.7666" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9.43327 8.23389H4.7666" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9.43327 10.5669H4.7666" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                          </g>
                        </svg>
                        <span>Patient Files</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setActiveSubTab('medical-history');
                        scrollToSection('medical-history');
                      }}
                      className={`w-full text-left px-6 py-2 text-xs transition-colors rounded-md mx-4 ${
                        activeSubTab === 'medical-history'
                          ? 'text-orange-700 bg-orange-100'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g clipPath="url(#clip0_1_44826)">
                            <path d="M11.1833 8.81706C12.0524 7.96539 12.9333 6.94456 12.9333 5.60872C12.9333 4.75782 12.5952 3.94177 11.9936 3.34009C11.3919 2.73841 10.5758 2.40039 9.72493 2.40039C8.69827 2.40039 7.97493 2.69206 7.09993 3.56706C6.22493 2.69206 5.5016 2.40039 4.47493 2.40039C3.62403 2.40039 2.80798 2.73841 2.2063 3.34009C1.60462 3.94177 1.2666 4.75782 1.2666 5.60872C1.2666 6.95039 2.1416 7.97122 3.0166 8.81706L7.09993 12.9004L11.1833 8.81706Z" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                          </g>
                        </svg>
                        <span>Medical History</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Billing Section */}
              <Link
                href={`/patients/${patient.id}/billing`}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors rounded-lg ${
                  pathname?.includes('/billing')
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
              </Link>
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
                <div id="patient-information" className="bg-white rounded-lg border border-gray-200 p-6">
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
                        <h4 className="text-red-800 font-medium text-xs mb-1">Error Updating Patient</h4>
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

                  <div className="space-y-6">
                    {/* Personal Details Section */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4 text-sm">Personal Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.full_name || ''}
                              onChange={(e) => handleInputChange('full_name', e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Enter full name"
                              aria-label="Full name"
                            />
                          ) : (
                            <div className="w-full px-3 py-2 text-xs bg-gray-50 rounded-lg text-gray-900">
                              {patient.full_name}
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth *</label>
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
                            <div className="w-full px-3 py-2 text-xs bg-gray-50 rounded-lg text-gray-600">
                              {patient.dob ? `${patientService.formatDate(patient.dob)} (${patientService.calculateAge(patient.dob)} years)` : 'Not provided'}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Gender *</label>
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
                            <div className="w-full px-3 py-2 text-xs bg-gray-50 rounded-lg text-gray-900">
                              {patient.gender}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Occupation *</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.occupation || ''}
                              onChange={(e) => handleInputChange('occupation', e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Enter occupation"
                              aria-label="Occupation"
                            />
                          ) : (
                            <div className="w-full px-3 py-2 text-xs bg-gray-50 rounded-lg text-gray-600">
                              {patient.occupation || 'Not provided'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact Information Section */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4 text-sm">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number *</label>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={editFormData.mobile_number || ''}
                              onChange={(e) => handleInputChange('mobile_number', e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Enter phone number"
                              aria-label="Phone number"
                            />
                          ) : (
                            <div className="w-full px-3 py-2 text-xs bg-gray-50 rounded-lg text-gray-600">
                              {patient.mobile_number}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Country Code *</label>
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
                            <div className="w-full px-3 py-2 text-xs bg-gray-50 rounded-lg text-gray-600">
                              {patient.countrycode ? `${patient.countrycode} (${getCountryName(patient.countrycode)})` : 'Not provided'}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Alternate Number</label>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={editFormData.alternative_number || ''}
                              onChange={(e) => handleInputChange('alternative_number', e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Enter alternate number (optional)"
                              aria-label="Alternate number"
                            />
                          ) : (
                            <div className="w-full px-3 py-2 text-xs bg-gray-50 rounded-lg text-gray-600">
                              {patient.alternative_number || 'Not provided'}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Email Address *</label>
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
                            <div className="w-full px-3 py-2 text-xs bg-gray-50 rounded-lg text-gray-600">
                              {patient.email_address}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Customer Type *</label>
                          <div className="w-full px-3 py-2 text-xs bg-gray-50 rounded-lg text-gray-600">
                            {patient.type || 'Regular'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment History Section */}
                <div id="appointment-history" className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <h2 className="text-sm font-semibold text-gray-900">Appointment History</h2>
                      {appointments.length > 0 && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={handleBookAppointment}
                      className="bg-orange-600 text-white px-4 py-2 text-xs rounded-lg font-medium flex items-center space-x-2 hover:bg-orange-800 transition-colors"
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
                      <h3 className="text-sm font-medium mb-2 text-gray-900">No appointments yet</h3>
                      <p className="text-gray-500 mb-6">Schedule the first appointment for this patient</p>
                      <button 
                        onClick={handleBookAppointment}
                        className="bg-orange-600 text-white px-6 py-3 text-xs rounded-lg font-medium flex items-center space-x-2 mx-auto hover:bg-orange-800 transition-colors"
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
                                <h3 className="font-medium text-xs text-gray-900">{appointment.procedures}</h3>
                                <p className="text-sm text-gray-500">
                                  {patientService.formatDate(appointment.appointmentDate)} at {patientService.formatTime(appointment.appointmentTime)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">{appointment.appointmentDuration} minutes</div>
                              <div className="text-xs text-gray-500">
                                {appointment.referralSource ? appointment.referralSource.sourceName : 'Direct'}
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
              <div className="space-y-6">
                {/* Diagnostics Section */}
                <div id="diagnostics" className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <h2 className="text-lg font-semibold text-gray-900">Diagnostics</h2>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">5 Plans</span>
                    </div>
                    <button className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-orange-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Create Diagnostic Plan</span>
                    </button>
                  </div>
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium mb-2 text-gray-900">Diagnostics Coming Soon</h3>
                    <p className="text-gray-500 text-sm">Diagnostic functionality will be available soon.</p>
                  </div>
                </div>

                {/* Clinical Notes Section */}
                <div id="clinical-notes" className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Clinical Notes</h2>
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        placeholder="Search notes..."
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <select 
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        aria-label="Filter by category"
                      >
                        <option>All Categories</option>
                        <option>General</option>
                        <option>Diagnosis</option>
                        <option>Treatment</option>
                        <option>Follow-up</option>
                        <option>Test Results</option>
                        <option>Prescription</option>
                        <option>Referral</option>
                      </select>
                      <button 
                        onClick={handleAddClinicalNote}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-orange-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add Note</span>
                      </button>
                    </div>
                  </div>
                  
                  {clinicalNotesLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                  ) : clinicalNotes.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-medium mb-2 text-gray-900">No clinical notes yet</h3>
                      <p className="text-gray-500 text-sm mb-6">Start documenting patient care with your first clinical note</p>
                      <button 
                        onClick={handleAddClinicalNote}
                        className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 mx-auto hover:bg-orange-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add First Note</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {clinicalNotes.map((note) => (
                        <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-medium text-gray-900">{note.title}</h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(note.category)}`}>
                                  {note.category}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{note.content}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleEditClinicalNote(note)}
                                className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                                title="Edit note"
                                aria-label="Edit note"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleDeleteClinicalNote(note.id)}
                                className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                                title="Delete note"
                                aria-label="Delete note"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Patient Files Section */}
                <div id="patient-files" className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Patient Files</h2>
                    <button className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-orange-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>Upload File</span>
                    </button>
                  </div>
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium mb-2 text-gray-900">No files uploaded</h3>
                    <p className="text-gray-500 text-sm mb-6">Upload patient files and documents</p>
                    <button className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 mx-auto hover:bg-orange-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>Upload Files</span>
                    </button>
                  </div>
                </div>

                {/* Medical History Section */}
                <div id="medical-history" className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold mb-6 text-gray-900">Medical History Timeline</h2>
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium mb-2 text-gray-900">Medical History Coming Soon</h3>
                    <p className="text-gray-500 text-sm">Medical history functionality will be available soon.</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'billing' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <h2 className="text-sm font-semibold text-gray-900">Billing Information</h2>
                </div>
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium mb-2 text-gray-900">Billing functionality moved to separate page</h3>
                  <p className="text-gray-500">Click on the Billing tab in the sidebar to access billing information.</p>
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

      {/* Clinical Note Modal */}
      <ClinicalNoteModal
        isOpen={showClinicalNoteModal}
        onClose={() => setShowClinicalNoteModal(false)}
        onSuccess={handleClinicalNoteSuccess}
        note={editingNote}
        isEditing={isEditingNote}
        userId={patient?.id || ''}
      />
    </MainLayout>
  );
}
