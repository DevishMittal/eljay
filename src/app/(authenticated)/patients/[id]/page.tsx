/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { use } from 'react';
import { ActivityIcon, NotepadText, Search, Volume2 } from 'lucide-react';
import MainLayout from '@/components/layout/main-layout';
import { CustomDropdown } from '@/components/ui/custom-dropdown';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Patient, UpdateUserData, UserAppointment, ClinicalNote, DiagnosticAppointment, Invoice, Payment } from '@/types';
import { patientService } from '@/services/patientService';
import PatientService from '@/services/patientService';
import { appointmentService } from '@/services/appointmentService';
import { clinicalNotesService } from '@/services/clinicalNotesService';
import { diagnosticAppointmentsService } from '@/services/diagnosticAppointmentsService';
import PatientInvoiceService from '@/services/patientInvoiceService';
import PatientPaymentService from '@/services/patientPaymentService';
import PatientPaymentHistoryService, { PaymentHistoryEvent } from '@/services/patientPaymentHistoryService';
import DatePicker from '@/components/ui/date-picker';
import WalkInAppointmentModal from '@/components/modals/walk-in-appointment-modal';
import ClinicalNoteModal from '@/components/modals/clinical-note-modal';
import CreateDiagnosticPlanModal from '@/components/modals/create-diagnostic-plan-modal';
import { useAuth } from '@/contexts/AuthContext';
import { checkPatientProcedures, PatientProcedureInfo } from '@/utils/procedureUtils';
import FileUploadModal from '@/components/modals/file-upload-modal';
import FileList from '@/components/ui/file-list';
import { fileService, UploadedFile } from '@/services/fileService';
import MedicalHistoryTimeline from '@/components/medical-history-timeline';

export default function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { token } = useAuth();
  const [activeSection, setActiveSection] = useState<'profile' | 'emr' | 'billing'>('profile');
  const [activeSubTab, setActiveSubTab] = useState<'information' | 'appointments' | 'diagnostics' | 'clinical-notes' | 'patient-files' | 'medical-history' | 'overview' | 'invoices' | 'payments' | 'payment-history'>('information');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(true);
  const [activeProfileButton, setActiveProfileButton] = useState<'information' | 'appointments'>('information');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<UserAppointment[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [procedureInfo, setProcedureInfo] = useState<PatientProcedureInfo>({
    hasHAT: false,
    hasOAE: false,
    hatAppointments: [],
    oaeAppointments: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<UpdateUserData>({});
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  
  // Clinical Notes state
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
  const [clinicalNotesLoading, setClinicalNotesLoading] = useState(false);
  const [showClinicalNoteModal, setShowClinicalNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<ClinicalNote | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);

  // Category dropdown state
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');

  const categories = [
    { value: 'All Categories', label: 'All Categories' },
    { value: 'General', label: 'General' },
    { value: 'Diagnosis', label: 'Diagnosis' },
    { value: 'Treatment', label: 'Treatment' },
    { value: 'Follow-up', label: 'Follow-up' },
    { value: 'Test Results', label: 'Test Results' },
    { value: 'Prescription', label: 'Prescription' },
    { value: 'Referral', label: 'Referral' }
  ];

  // Diagnostic Appointments state
  const [diagnosticAppointments, setDiagnosticAppointments] = useState<DiagnosticAppointment[]>([]);
  const [diagnosticAppointmentsLoading, setDiagnosticAppointmentsLoading] = useState(false);
  const [showDiagnosticPlanModal, setShowDiagnosticPlanModal] = useState(false);

  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);

  // Billing state
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryEvent[]>([]);
  const [billingSummary, setBillingSummary] = useState({
    totalPaid: 0,
    outstanding: 0,
    totalInvoices: 0
  });

  // Check patient procedures
  const checkProcedures = useCallback(async () => {
    if (!resolvedParams.id || !token) return;
    
    try {
      const info = await checkPatientProcedures(resolvedParams.id, token);
      setProcedureInfo(info);
    } catch (error) {
      console.error('Error checking patient procedures:', error);
    }
  }, [resolvedParams.id, token]);

  const fetchPatient = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await patientService.getPatientById(resolvedParams.id, token || undefined);
      setPatient(response.patient);
      
      // Check procedures after patient is loaded
      await checkProcedures();
    } catch (err) {
      setError('Failed to fetch patient details. Please try again.');
      console.error('Error fetching patient:', err);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id, token, checkProcedures]);

  const fetchAppointments = useCallback(async () => {
    if (!patient) return;
    
    try {
      setAppointmentsLoading(true);
      const response = await appointmentService.getAppointmentsByUserId(patient.id, token || undefined);
      
      // Transform the appointments to match UserAppointment format
      const transformedAppointments: UserAppointment[] = response.data.appointments.map((appointment: any) => ({
        id: appointment.id,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        appointmentDuration: appointment.appointmentDuration,
        procedures: appointment.procedures,
        visitStatus: appointment.visitStatus,
        referralSource: appointment.referralSource,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
        audiologist: appointment.audiologist
      }));
      
      setAppointments(transformedAppointments);
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

  const fetchDiagnosticAppointments = useCallback(async () => {
    if (!patient || !token) return;
    
    try {
      setDiagnosticAppointmentsLoading(true);
      const response = await diagnosticAppointmentsService.getDiagnosticAppointments(token);
      setDiagnosticAppointments(response.data.appointments);
    } catch (err) {
      console.error('Error fetching diagnostic appointments:', err);
      // Don't show error for diagnostic appointments, just log it
    } finally {
      setDiagnosticAppointmentsLoading(false);
    }
  }, [patient, token]);

  const fetchInvoices = useCallback(async () => {
    if (!patient || !token) return;
    
    try {
      setInvoicesLoading(true);
      const response = await PatientInvoiceService.getAllInvoices();
      
      // Filter invoices for this specific patient
      const patientInvoices = response.data.invoices.filter(invoice => 
        invoice.patientName.toLowerCase() === patient.full_name.toLowerCase()
      );
      
      setInvoices(patientInvoices);
      
      // Calculate billing summary
      const totalPaid = patientInvoices
        .filter(invoice => invoice.paymentStatus === 'Paid')
        .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
      
      const outstanding = patientInvoices
        .filter(invoice => invoice.paymentStatus === 'Pending')
        .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
      
      setBillingSummary({
        totalPaid,
        outstanding,
        totalInvoices: patientInvoices.length
      });
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setInvoicesLoading(false);
    }
  }, [patient, token]);

  const fetchPayments = useCallback(async () => {
    if (!patient || !token) return;
    
    try {
      setPaymentsLoading(true);
      const response = await PatientPaymentService.getAllPayments();
      
      // Filter payments for this specific patient
      const patientPayments = response.data.payments.filter(payment => 
        payment.patientName.toLowerCase() === patient.full_name.toLowerCase()
      );
      
      setPayments(patientPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setPaymentsLoading(false);
    }
  }, [patient, token]);

  const fetchFiles = useCallback(async () => {
    if (!patient || !token) return;
    
    try {
      setFilesLoading(true);
      const response = await fileService.getFiles(patient.id, token);
      setUploadedFiles(response.data);
      
      // Log successful file fetch
      console.log(`Successfully fetched ${response.data.length} files for user ${patient.id}`);
    } catch (error) {
      console.error('Error fetching files:', error);
      // Don't set error state for file fetching issues since it might be expected
      // Just log it and continue with empty file list
      setUploadedFiles([]);
    } finally {
      setFilesLoading(false);
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
      // Fetch diagnostic appointments when EMR section is opened
      fetchDiagnosticAppointments();
      // Fetch files when EMR section is opened
      fetchFiles();
    }
  }, [fetchClinicalNotes, fetchDiagnosticAppointments, fetchFiles, activeSection, patient]);

  useEffect(() => {
    if (patient && activeSection === 'billing') {
      // Fetch invoices and payments when billing section is opened
      fetchInvoices();
      fetchPayments();
    }
  }, [fetchInvoices, fetchPayments, activeSection, patient]);

  // Create payment history when both invoices and payments are available
  useEffect(() => {
    if (invoices.length > 0 || payments.length > 0) {
      const history = PatientPaymentHistoryService.createPaymentHistory(invoices, payments);
      setPaymentHistory(history);
    }
  }, [invoices, payments]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getCountryName = (countrycode: string) => {
    const countryMap: { [key: string]: string } = {
      '+91': 'India'
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
        fullname: patient?.full_name || '',
        phoneNumber: patient?.mobile_number || '',
        email: patient?.email_address || '',
        dob: patient?.dob || '',
        gender: patient?.gender || 'Male',
        occupation: patient?.occupation || '',
        alternateNumber: patient?.alternative_number || '',
        countrycode: patient?.countrycode || '+91',
        hospitalName: patient?.hospital_name || '',
        opipNumber: patient?.opipNumber || ''
      });
    }
  };

  const handleInputChange = (field: keyof UpdateUserData, value: string) => {
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

      // Format the DOB to YYYY-MM-DD format for API
      const formattedData = { ...editFormData };
      if (formattedData.dob) {
        // If it's an ISO string, extract just the date part
        if (formattedData.dob.includes('T')) {
          formattedData.dob = formattedData.dob.split('T')[0];
        }
        // Ensure it's in YYYY-MM-DD format
        const dobDate = new Date(formattedData.dob);
        if (!isNaN(dobDate.getTime())) {
          formattedData.dob = dobDate.toISOString().split('T')[0];
        }
      }

      // Note: OP/IP number is not required for saving, but affects profile completion status
      // Profile is considered incomplete for B2B patients without OP/IP number

      await patientService.updateUser(patient?.id || '', formattedData, token || undefined);
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
    // Refresh appointments list and procedure information
    if (patient) {
      fetchAppointments();
      checkProcedures(); // Refresh procedure information to show new forms if needed
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

  const handleDiagnosticPlanClick = (appointmentId: string) => {
    // Navigate to individual diagnostic plan page
    router.push(`/patients/${patient?.id}/diagnostics/${appointmentId}`);
  };

  const handleAppointmentClick = (appointmentId: string) => {
    // Navigate to individual diagnostic page for the appointment
    router.push(`/patients/${patient?.id}/diagnostics/${appointmentId}`);
  };

  const handleDiagnosticPlanCreated = useCallback((newAppointment: any) => {
    // Refresh the diagnostics list
    fetchDiagnosticAppointments();
    // You can also add a success message here if needed
  }, [fetchDiagnosticAppointments]);

  const handleFileUploaded = (file: UploadedFile) => {
    // Add the new file to the list
    setUploadedFiles(prev => [file, ...prev]);
    setSuccess('File uploaded successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleFileDeleted = (fileId: string) => {
    // Remove the file from the list
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    setSuccess('File deleted successfully');
    setTimeout(() => setSuccess(null), 3000);
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

  // Get appointment status color
  const getAppointmentStatusColor = (status?: string | null, appointmentDate?: string) => {
    // Check if appointment date has passed and no status is set
    if (!status && appointmentDate) {
      const appointmentDateTime = new Date(appointmentDate);
      const now = new Date();
      if (appointmentDateTime < now) {
        return 'bg-orange-100 text-orange-800'; // Absent for past appointments
      }
    }
    
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case 'check_in':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'absent':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get appointment status text
  const getAppointmentStatusText = (status?: string | null, appointmentDate?: string) => {
    // Check if appointment date has passed and no status is set
    if (!status && appointmentDate) {
      const appointmentDateTime = new Date(appointmentDate);
      const now = new Date();
      if (appointmentDateTime < now) {
        return 'Absent'; // Absent for past appointments
      }
    }
    
    if (!status) return 'Pending';
    
    switch (status) {
      case 'check_in':
        return 'Checked In';
      case 'cancelled':
        return 'Cancelled';
      case 'absent':
        return 'Absent';
      default:
        return 'Pending';
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
                        <ActivityIcon size={16} />
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
              <div>
                <button
                  onClick={() => {
                    setActiveSection('billing');
                    setIsProfileDropdownOpen(false);
                  }}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors rounded-lg ${
                    activeSection === 'billing'
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 15 15" stroke="currentColor">
                    <path d="M12.4668 3.56689H3.13346C2.48913 3.56689 1.9668 4.08923 1.9668 4.73356V10.5669C1.9668 11.2112 2.48913 11.7336 3.13346 11.7336H12.4668C13.1111 11.7336 13.6335 11.2112 13.6335 10.5669V4.73356C13.6335 4.08923 13.1111 3.56689 12.4668 3.56689Z" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1.9668 6.48389H13.6335" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-xs font-medium">Billing</span>
                </div>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${activeSection === 'billing' ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                </button>

                {/* Billing Dropdown Content */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out !border-l-2 !border-orange-200 ${
                  activeSection === 'billing' ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="mt-2 space-y-1">
                    <button
                      onClick={() => {
                        setActiveSubTab('overview');
                        scrollToSection('billing-overview');
                      }}
                      className={`w-full text-left px-6 py-2 text-xs transition-colors rounded-md mx-4 ${
                        activeSubTab === 'overview'
                          ? 'text-orange-700 bg-orange-100'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g clipPath="url(#clip0_1_45437)">
                            <path d="M8.85026 1.81689H3.60026C3.29084 1.81689 2.99409 1.93981 2.7753 2.1586C2.55651 2.3774 2.43359 2.67414 2.43359 2.98356V12.3169C2.43359 12.6263 2.55651 12.9231 2.7753 13.1419C2.99409 13.3606 3.29084 13.4836 3.60026 13.4836H10.6003C10.9097 13.4836 11.2064 13.3606 11.4252 13.1419C11.644 12.9231 11.7669 12.6263 11.7669 12.3169V4.73356L8.85026 1.81689Z" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8.26562 1.81689V4.15023C8.26562 4.45965 8.38854 4.75639 8.60733 4.97519C8.82613 5.19398 9.12287 5.31689 9.43229 5.31689H11.7656" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M5.93229 5.90039H4.76562" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9.43229 8.23389H4.76562" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9.43229 10.5669H4.76562" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                          </g>
                        </svg>
                        <span>Overview</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setActiveSubTab('invoices');
                        scrollToSection('billing-invoices');
                      }}
                      className={`w-full text-left px-6 py-2 text-xs transition-colors rounded-md mx-4 ${
                        activeSubTab === 'invoices'
                          ? 'text-orange-700 bg-orange-100'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <svg width="26" height="26" viewBox="0 0 25 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g clipPath="url(#clip0_1_45442)">
                            <path d="M2.43359 1.81689V13.4836L3.60026 12.9002L4.76693 13.4836L5.93359 12.9002L7.10026 13.4836L8.26693 12.9002L9.43359 13.4836L10.6003 12.9002L11.7669 13.4836V1.81689L10.6003 2.40023L9.43359 1.81689L8.26693 2.40023L7.10026 1.81689L5.93359 2.40023L4.76693 1.81689L3.60026 2.40023L2.43359 1.81689Z" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9.43229 5.31689H5.93229C5.62287 5.31689 5.32613 5.43981 5.10733 5.6586C4.88854 5.8774 4.76563 6.17414 4.76562 6.48356C4.76563 6.79298 4.88854 7.08973 5.10733 7.30852C5.32613 7.52731 5.62287 7.65023 5.93229 7.65023H8.26562C8.57504 7.65023 8.87179 7.77314 9.09058 7.99194C9.30937 8.21073 9.43229 8.50748 9.43229 8.81689C9.43229 9.12631 9.30937 9.42306 9.09058 9.64185C8.87179 9.86064 8.57504 9.98356 8.26562 9.98356H4.76562" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7.09961 10.8586V4.44189" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                          </g>
                        </svg>
                        <span>Invoices</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setActiveSubTab('payments');
                        scrollToSection('billing-payments');
                      }}
                      className={`w-full text-left px-6 py-2 text-xs transition-colors rounded-md mx-4 ${
                        activeSubTab === 'payments'
                          ? 'text-orange-700 bg-orange-100'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <svg width="26" height="26" viewBox="0 0 25 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g clipPath="url(#clip0_1_45448)">
                            <path d="M11.1829 4.73372V2.98372C11.1829 2.82901 11.1215 2.68064 11.0121 2.57124C10.9027 2.46185 10.7543 2.40039 10.5996 2.40039H3.01628C2.70686 2.40039 2.41011 2.52331 2.19132 2.7421C1.97253 2.96089 1.84961 3.25764 1.84961 3.56706C1.84961 3.87648 1.97253 4.17322 2.19132 4.39202C2.41011 4.61081 2.70686 4.73372 3.01628 4.73372H11.7663C11.921 4.73372 12.0694 4.79518 12.1788 4.90458C12.2882 5.01397 12.3496 5.16235 12.3496 5.31706V7.65039M12.3496 7.65039H10.5996C10.2902 7.65039 9.99344 7.77331 9.77465 7.9921C9.55586 8.21089 9.43294 8.50764 9.43294 8.81706C9.43294 9.12648 9.55586 9.42322 9.77465 9.64201C9.99344 9.86081 10.2902 9.98372 10.5996 9.98372H12.3496C12.5043 9.98372 12.6527 9.92227 12.7621 9.81287C12.8715 9.70347 12.9329 9.5551 12.9329 9.40039V8.23372C12.9329 8.07901 12.8715 7.93064 12.7621 7.82124C12.6527 7.71185 12.5043 7.65039 12.3496 7.65039Z" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M1.84961 3.56689V11.7336C1.84961 12.043 1.97253 12.3397 2.19132 12.5585C2.41011 12.7773 2.70686 12.9002 3.01628 12.9002H11.7663C11.921 12.9002 12.0694 12.8388 12.1788 12.7294C12.2882 12.62 12.3496 12.4716 12.3496 12.3169V9.98356" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                          </g>
                        </svg>
                        <span>Payments</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setActiveSubTab('payment-history');
                        scrollToSection('billing-payment-history');
                      }}
                      className={`w-full text-left px-6 py-2 text-xs transition-colors rounded-md mx-4 ${
                        activeSubTab === 'payment-history'
                          ? 'text-orange-700 bg-orange-100'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <svg width="26" height="26" viewBox="0 0 25 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g clipPath="url(#clip0_1_45454)">
                            <path d="M11.7656 3.56689H2.43229C1.78796 3.56689 1.26562 4.08923 1.26562 4.73356V10.5669C1.26562 11.2112 1.78796 11.7336 2.43229 11.7336H11.7656C12.41 11.7336 12.9323 11.2112 12.9323 10.5669V4.73356C12.9323 4.08923 12.41 3.56689 11.7656 3.56689Z" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M1.26562 6.48389H12.9323" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                          </g>
                        </svg>
                        <span>Payment History</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
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
                <h1 className="text-sm font-semibold text-gray-900">{patient.full_name}</h1>
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
                      <h2 className="text-sm font-semibold text-gray-900">Patient Information</h2>
                      {/* Profile Completion Status for B2B patients */}
                      {patient.type === 'B2B' && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          PatientService.isProfileComplete(patient)
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {PatientService.isProfileComplete(patient) ? 'Complete Profile' : 'Incomplete Profile'}
                        </span>
                      )}
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
                      <h3 className="font-medium text-gray-900 mb-4 text-xs">Personal Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.fullname || ''}
                              onChange={(e) => handleInputChange('fullname', e.target.value)}
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
                      <h3 className="font-medium text-gray-900 mb-4 text-xs">Contact Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number *</label>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={editFormData.phoneNumber || ''}
                              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
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
                                { value: '+91', label: '+91 (India)' }
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
                              value={editFormData.alternateNumber || ''}
                              onChange={(e) => handleInputChange('alternateNumber', e.target.value)}
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
                              value={editFormData.email || ''}
                              onChange={(e) => handleInputChange('email', e.target.value)}
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

                        {/* Hospital field - only show for B2B patients */}
                        {patient.type === 'B2B' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Hospital Name</label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editFormData.hospitalName || ''}
                                onChange={(e) => handleInputChange('hospitalName', e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="Enter hospital name"
                                aria-label="Hospital name"
                              />
                            ) : (
                              <div className="w-full px-3 py-2 text-xs bg-gray-50 rounded-lg text-gray-600">
                                {patient.hospital_name || 'Not provided'}
                              </div>
                            )}
                          </div>
                        )}

                        {/* OP/IP/UHID Number field - only show for B2B patients */}
                        {patient.type === 'B2B' && (
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              OP/IP/UHID Number
                              {!PatientService.isProfileComplete(patient) && (
                                <span className="text-orange-600 ml-1">(Required for complete profile)</span>
                              )}
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editFormData.opipNumber || ''}
                                onChange={(e) => handleInputChange('opipNumber', e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="Enter OP/IP/UHID number"
                                aria-label="OP/IP/UHID number"
                              />
                            ) : (
                              <div className={`w-full px-3 py-2 text-xs rounded-lg ${!PatientService.isProfileComplete(patient) ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-gray-50 text-gray-600'}`}>
                                {patient.opipNumber || 'Not provided - Profile incomplete'}
                              </div>
                            )}
                            {!PatientService.isProfileComplete(patient) && (
                              <p className="text-xs text-orange-600 mt-1">Adding this will complete the patient profile</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment History Section */}
                <div id="appointment-history" className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex justify-end mb-4">
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
                      <h3 className="text-xs font-medium mb-2 text-gray-900">No appointments yet</h3>
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
                                <p className="text-xs text-gray-500">
                                  {patientService.formatDate(appointment.appointmentDate)} at {patientService.formatTime(appointment.appointmentTime)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-medium text-gray-900">{appointment.appointmentDuration} minutes</div>
                              <div className="text-xs text-gray-500">
                                {appointment.referralSource ? appointment.referralSource.sourceName : 'Direct'}
                              </div>
                              {/* Appointment Status */}
                              <div className="mt-1">
                                <span className={`px-2 py-1 text-xs rounded-full ${getAppointmentStatusColor(appointment.visitStatus, appointment.appointmentDate)}`}>
                                  {getAppointmentStatusText(appointment.visitStatus, appointment.appointmentDate)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs">
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
                      <div className="w-5 h-5 rounded flex items-center justify-center">
                        <ActivityIcon size={16} className="text-black" />
                      </div>
                      <h2 className="text-sm font-semibold text-gray-900">Diagnostics</h2>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{diagnosticAppointments.length} Plans</span>
                    </div>
                    <button 
                      onClick={() => setShowDiagnosticPlanModal(true)}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-orange-700 transition-colors text-xs"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Create Diagnostic Plan</span>
                    </button>
                  </div>

                  {/* Appointment History for Diagnostics */}
                  <div className="mb-8">
                    {appointmentsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="mt-2 text-gray-600 text-xs">Loading appointments...</p>
                      </div>
                    ) : appointments.length === 0 ? (
                      <div className="text-center ">
                        {/* <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div> */}
                        {/* <p className="text-gray-500 text-xs">No appointments found</p> */}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {appointments.slice(0, 5).map((appointment) => (
                          <div 
                            key={appointment.id} 
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => handleAppointmentClick(appointment.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-medium text-gray-900 text-sm">{appointment.procedures || 'General Appointment'}</h4>
                                  <span className={`px-2 py-1 text-xs rounded-full ${getAppointmentStatusColor(appointment.visitStatus, appointment.appointmentDate)}`}>
                                    {getAppointmentStatusText(appointment.visitStatus, appointment.appointmentDate)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                  <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>{new Date(appointment.appointmentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                  </div>
                                  <span className="text-gray-400">•</span>
                                  <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{new Date(appointment.appointmentTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                                  </div>
                                  <span className="text-gray-400">•</span>
                                  <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>{appointment.audiologist?.name || 'Not assigned'}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-gray-500">{appointment.appointmentDuration || 30} min</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {appointments.length > 5 && (
                          <button 
                            onClick={() => setActiveSubTab('appointments')}
                            className="w-full text-center py-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                          >
                            View all {appointments.length} appointments
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Diagnostic Plans */}
                  <div className="space-y-4 mb-8">
                   
                    {diagnosticAppointmentsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="mt-2 text-gray-600 text-xs">Loading diagnostic plans...</p>
                      </div>
                    ) : diagnosticAppointments.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <h3 className="text-xs font-medium mb-2 text-gray-900">No diagnostic plans yet</h3>
                        <p className="text-gray-500 text-xs mb-6">Create your first diagnostic plan to get started</p>
                        <button 
                          onClick={() => setShowDiagnosticPlanModal(true)}
                          className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 mx-auto hover:bg-orange-700 transition-colors text-xs"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <span>Create First Plan</span>
                        </button>
                      </div>
                    ) : (
                      diagnosticAppointments.map((appointment) => (
                        <div 
                          key={appointment.id} 
                          className="border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handleDiagnosticPlanClick(appointment.id)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-medium text-gray-900 text-xs">{appointment.procedures || 'Not specified'}</h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${diagnosticAppointmentsService.getStatusColor(appointment.status || 'planned')}`}>
                                  {appointment.status || 'planned'}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-600">
                                <div className="flex items-center">
                                  <span className="font-bold text-gray-900 ml-1">₹{appointment.cost ? appointment.cost.toLocaleString() : 'Not specified'}</span>
                                  <span className="">:  Cost</span>
                                </div>
                                <span className="text-gray-400">•</span>
                                <div className="flex items-center">
                                  <span className="font-medium">Planned:</span>
                                  <span className="ml-1">{appointment.appointmentDate ? diagnosticAppointmentsService.formatDate(appointment.appointmentDate) : 'Not scheduled'}</span>
                                </div>
                                <span className="text-gray-400">•</span>
                                <div className="flex items-center">
                                  <span className="font-medium">Assigned to:</span>
                                  <span className="ml-1">{appointment.audiologist?.name || 'Not assigned'}</span>
                                </div>
                                <span className="text-gray-400">•</span>
                                <div className="flex items-center">
                                  <span className="font-medium">Files:</span>
                                  <span className="ml-1">{appointment.files ? appointment.files : 'No files'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Separator Line */}
                  <hr className="my-6 border-gray-200" />


                  {/* Specialized Procedures Section - Only show if patient has HAT or OAE procedures */}
                  {(procedureInfo.hasHAT || procedureInfo.hasOAE) && (
                    <div className="rounded-md pt-6">
                      <h3 className="font-semibold text-gray-900 mb-4 text-xs">Specialized Procedures</h3>
                      <div className="space-y-3">
                        {/* HAT Procedure - Only show if patient has HAT appointments */}
                        {procedureInfo.hasHAT && (
                          <div 
                            className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-colors"
                            onClick={() => router.push(`/patients/${patient?.id}/hat`)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Volume2 size={16} className="text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 text-xs">Hearing Aid Trial (HAT)</h4>
                                <p className="text-gray-600 text-xs">Record hearing aid trial sessions</p>
                                <p className="text-blue-600 text-xs mt-1">
                                  {procedureInfo.hatAppointments.length} appointment{procedureInfo.hatAppointments.length !== 1 ? 's' : ''} scheduled
                                </p>
                              </div>
                              <div className="text-right text-gray-500 text-xs">
                                <div>Last updated</div>
                                <div>Never</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* OAE Testing Procedure - Only show if patient has OAE appointments */}
                        {procedureInfo.hasOAE && (
                          <div
                            className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-colors"
                            onClick={() => router.push(`/patients/${patient?.id}/oae`)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 text-xs">OAE Testing</h4>
                                <p className="text-gray-600 text-xs">Otoacoustic Emissions testing for hearing assessment</p>
                                <p className="text-green-600 text-xs mt-1">
                                  {procedureInfo.oaeAppointments.length} appointment{procedureInfo.oaeAppointments.length !== 1 ? 's' : ''} scheduled
                                </p>
                              </div>
                              <div className="text-right text-gray-500 text-xs">
                                <div>Last updated</div>
                                <div>Never</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Clinical Notes Section */}
                <div id="clinical-notes" className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="mb-6 flex gap-2 items-center">
                    <NotepadText size={16} className="text-gray-900" />
                    <h2 className="text-sm font-semibold text-gray-900">Clinical Notes</h2>
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center relative">
                      <input
                        type="text"
                        placeholder="Search notes..."
                        className="pl-9 pr-3 py-2 bg-gray-100 rounded-lg text-xs w-96 "
                      />
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <div className="flex items-center space-x-3">
                      <CustomDropdown
                        options={categories}
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        placeholder="Select category"
                        className="min-w-[140px] h-10"
                        aria-label="Filter by category"
                      />
                      <button
                        onClick={handleAddClinicalNote}
                        className="bg-orange-600 text-white px-4 py-1 rounded-lg font-medium flex items-center space-x-2 hover:bg-orange-700 transition-colors"
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
                      <h3 className="text-xs font-medium mb-2 text-gray-900">No clinical notes yet</h3>
                      <p className="text-gray-500 text-xs mb-6">Start documenting patient care with your first clinical note</p>
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
                                <h3 className="font-medium text-gray-900 text-xs">{note.title}</h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(note.category)}`}>
                                  {note.category}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">{note.content}</p>
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
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h2 className="text-sm font-semibold text-gray-900">Patient Files</h2>
                    </div>
                    <button 
                      onClick={() => setShowFileUploadModal(true)}
                      className="bg-orange-600 text-white px-4 py-1 rounded-lg text-xs flex items-center space-x-2 hover:bg-orange-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>Upload File</span>
                    </button>
                  </div>
                  
                  <FileList 
                    files={uploadedFiles}
                    onFileDeleted={handleFileDeleted}
                    isLoading={filesLoading}
                    token={token || undefined}
                  />
                </div>

                {/* Medical History Section */}
                <div id="medical-history" className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-sm font-semibold mb-6 text-gray-900">Medical History Timeline</h2>
                  <MedicalHistoryTimeline patientId={resolvedParams.id} />
                </div>
              </div>
            )}

            {activeSection === 'billing' && (
              <div className="space-y-6">
                {/* Billing Overview Section */}
                <div id="billing-overview" className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-semibold text-gray-900">Billing Overview</h2>
                  </div>
                  
                  {/* Financial Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">
                            {invoicesLoading ? '...' : `₹${billingSummary.totalPaid.toLocaleString()}`}
                          </h3>
                          <p className="text-xs text-gray-600">Total Paid</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">
                            {invoicesLoading ? '...' : `₹${billingSummary.outstanding.toLocaleString()}`}
                          </h3>
                          <p className="text-xs text-gray-600">Outstanding</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">
                            {invoicesLoading ? '...' : billingSummary.totalInvoices}
                          </h3>
                          <p className="text-xs text-gray-600">Total Invoices</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Billing Invoices Section */}
                <div id="billing-invoices" className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h2 className="text-sm font-semibold text-gray-900">Invoices</h2>
                    </div>
                    <button 
                      onClick={() => window.open('/billing/invoices/create/b2c', '_blank')}
                      className="text-xs bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-orange-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Create Invoice</span>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {invoicesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                        <span className="ml-2 text-gray-600">Loading invoices...</span>
                      </div>
                    ) : invoices.length === 0 ? (
                      <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="text-xs font-medium mb-2 text-gray-900">No invoices found</h3>
                        <p className="text-gray-500">This patient has no invoices yet.</p>
                      </div>
                    ) : (
                      invoices.map((invoice) => (
                        <div key={invoice.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-medium text-gray-900">{invoice.invoiceNumber}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                invoice.paymentStatus === 'Paid' 
                                  ? 'bg-green-100 text-green-800' 
                                  : invoice.paymentStatus === 'Pending'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {invoice.paymentStatus}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-gray-900">₹{invoice.totalAmount.toLocaleString()}</div>
                              <div className="text-xs text-gray-600">{invoice.screenings.length} item(s)</div>
                            </div>
                          </div>
                          
                          {/* Invoice Details */}
                          <div className="mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs text-gray-600">
                              <div><span className="font-medium">Created:</span> {PatientInvoiceService.formatDateForDisplay(invoice.invoiceDate)}</div>
                              <div><span className="font-medium">Type:</span> {invoice.invoiceType}</div>
                            </div>
                            
                            {/* Items & Services */}
                            <div className="mb-4">
                              <h4 className="text-xs font-medium text-gray-900 mb-2">Items & Services</h4>
                              {invoice.screenings.map((screening, index) => (
                                <div key={screening.id || index} className="bg-gray-50 rounded-lg p-3 mb-2">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <h5 className="font-medium text-gray-900">{screening.diagnosticName}</h5>
                                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">service</span>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xs font-medium text-gray-900">₹{screening.amount.toLocaleString()}</div>
                                      {screening.discount > 0 && (
                                        <div className="text-xs text-red-600">- ₹{screening.discount.toLocaleString()} discount</div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    <div>OP Number: {screening.opNumber}</div>
                                    <div>Date: {PatientInvoiceService.formatDateForDisplay(screening.screeningDate)}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Cost Breakdown */}
                            <div className="bg-gray-50 rounded-lg p-3">
                              <h4 className="text-xs font-medium text-gray-900 mb-2">Cost Breakdown</h4>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Subtotal:</span>
                                  <span className="font-medium">₹{invoice.subtotal.toLocaleString()}</span>
                                </div>
                                {invoice.totalDiscount > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Discount:</span>
                                    <span className="font-medium text-red-600">- ₹{invoice.totalDiscount.toLocaleString()}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-gray-600">SGST ({invoice.sgstRate}%):</span>
                                  <span className="font-medium">₹{invoice.sgstAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">CGST ({invoice.cgstRate}%):</span>
                                  <span className="font-medium">₹{invoice.cgstAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-gray-200">
                                  <span className="font-medium text-gray-900">Total Amount:</span>
                                  <span className="font-bold text-gray-900">₹{invoice.totalAmount.toLocaleString()}</span>
                                </div>
                                {invoice.paymentStatus === 'Paid' && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Paid Amount:</span>
                                    <span className="font-medium text-green-600">₹{invoice.totalAmount.toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-gray-200">
                            <div className="text-xs text-gray-600">
                              Invoice: {invoice.invoiceNumber}
                            </div>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => window.open(`/billing/invoices/${invoice.id}`, '_blank')}
                                className="flex items-center space-x-1 px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span className="text-gray-600">View</span>
                              </button>
                              <button className="flex items-center space-x-1 px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-100 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-gray-600">Download</span>
                              </button>
                              <button className="flex items-center space-x-1 px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-100 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-gray-600">Email</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Billing Payments Section */}
                <div id="billing-payments" className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                      <h2 className="text-sm font-semibold text-gray-900">Recent Payments</h2>
                  </div>
                    <button 
                      onClick={() => window.open('/billing/payments/record', '_blank')}
                      className="text-xs bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-orange-700 transition-colors"
                    >
                  
                      <span>Record Payment</span>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {paymentsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                        <span className="ml-2 text-gray-600">Loading payments...</span>
                      </div>
                    ) : payments.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <h3 className="text-xs font-medium mb-2 text-gray-900">No payments found</h3>
                        <p className="text-gray-500">This patient has no payment records yet.</p>
                      </div>
                    ) : (
                      payments.map((payment) => (
                        <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-medium text-gray-900">{payment.receiptNumber}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${PatientPaymentService.getPaymentTypeColor(payment.paymentType)}`}>
                                {payment.paymentType}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-gray-900">₹{payment.amount.toLocaleString()}</div>
                              <div className="text-xs text-gray-600">Received by {payment.receivedBy}</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-xs text-gray-600">
                            <div><span className="font-medium">Date:</span> {PatientPaymentService.formatDateForDisplay(payment.paymentDate)}</div>
                            <div><span className="font-medium">Method:</span> 
                              <span className={`ml-1 px-2 py-1 text-xs rounded-full ${PatientPaymentService.getMethodColor(payment.method)}`}>
                                {payment.method}
                              </span>
                            </div>
                            <div><span className="font-medium">Transaction ID:</span> {payment.transactionId}</div>
                          </div>
                          
                          {/* Payment Status */}
                          <div className="mb-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-gray-900">Status:</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${PatientPaymentService.getStatusColor(payment.status)}`}>
                                {payment.status}
                              </span>
                            </div>
                          </div>
                          
                          {/* Notes if available */}
                          {payment.notes && (
                            <div className="mb-4">
                              <div className="text-xs text-gray-600">
                                <span className="font-medium">Notes:</span> {payment.notes}
                </div>
              </div>
            )}
                          
                          <div className="flex items-center justify-between pt-4  border-gray-200">
                            <div className="text-xs text-gray-600">
                              Receipt: {payment.receiptNumber}
            </div>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => window.open(`/billing/payments/${payment.id}`, '_blank')}
                                className="flex items-center space-x-1 px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span className="text-gray-600">View</span>
                              </button>
                              <button className="flex items-center space-x-1 px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-100 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-gray-600">Download</span>
                              </button>
                              <button className="flex items-center space-x-1 px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-100 transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-gray-600">Email</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Billing Payment History Section */}
                <div id="billing-payment-history" className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-sm font-semibold text-gray-900">Payment History</h2>
                  </div>
                  
                  <div className="space-y-6">
                    {paymentsLoading || invoicesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                        <span className="ml-2 text-gray-600">Loading payment history...</span>
                      </div>
                    ) : paymentHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-xs font-medium mb-2 text-gray-900">No payment history found</h3>
                        <p className="text-gray-500">This patient has no payment or invoice history yet.</p>
                      </div>
                    ) : (
                      (() => {
                        const groupedEvents = PatientPaymentHistoryService.groupEventsByDate(paymentHistory);
                        return Object.entries(groupedEvents).map(([date, events]) => (
                          <div key={date}>
                            <h3 className="text-sm font-medium mb-4 text-gray-900">{date}</h3>
                            <div className="space-y-3">
                              {events.map((event, index) => (
                                <div key={event.id} className="flex items-start space-x-4">
                                  {/* Event Icon */}
                                  <div className={`w-8 h-8 ${event.iconColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                    {event.type === 'invoice_generated' ? (
                                      <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    ) : (
                                      <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                      </svg>
                                    )}
                                  </div>
                                  
                                  {/* Event Content */}
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <span className="text-sm font-medium text-gray-900">{event.title}</span>
                                      <span className="text-xs text-gray-500">{event.time}</span>
                                      <span className={`px-2 py-1 text-xs rounded-full ${event.statusColor}`}>
                                        {event.status}
                                      </span>
                                    </div>
                                    
                                    <div className="text-xs text-gray-600">
                                      {event.type === 'invoice_generated' ? (
                                        <p>
                                          Invoice: {event.details.invoiceNumber} • 
                                          Amount: {PatientPaymentHistoryService.formatCurrency(event.details.amount)} • 
                                          Created by {event.details.createdBy}
                                        </p>
                                      ) : (
                                        <p>
                                          Amount: {PatientPaymentHistoryService.formatCurrency(event.details.amount)} • 
                                          Method: {event.details.method} • 
                                          Transaction ID: {event.details.transactionId} • 
                                          Processed by {event.details.processedBy}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Action Buttons */}
                                  <div className="flex items-center space-x-2">
                                    <button 
                                      onClick={() => {
                                        if (event.type === 'invoice_generated') {
                                          window.open(`/billing/invoices/${event.originalData.id}`, '_blank');
                                        } else {
                                          window.open(`/billing/payments/${event.originalData.id}`, '_blank');
                                        }
                                      }}
                                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                      title="View"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                    </button>
                                    <button 
                                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                      title="Download"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    </button>
                                    <button 
                                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                      title="Print"
                                    >
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ));
                      })()
                    )}
                  </div>
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

      {/* Create Diagnostic Plan Modal */}
      <CreateDiagnosticPlanModal
        isOpen={showDiagnosticPlanModal}
        onClose={() => setShowDiagnosticPlanModal(false)}
        onSuccess={handleDiagnosticPlanCreated}
        patientId={patient?.id || ''}
      />

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={showFileUploadModal}
        onClose={() => setShowFileUploadModal(false)}
        userId={patient?.id || ''}
        token={token || undefined}
        onFileUploaded={handleFileUploaded}
      />
    </MainLayout>
  );
}
