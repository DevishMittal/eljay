/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { cn } from '@/utils';
import Image from 'next/image'; // Import for using SVG as <Image>
import { appointmentService } from '@/services/appointmentService';
import { staffService } from '@/services/staffService';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import EditAppointmentModal from '@/components/modals/edit-appointment-modal';
import {
  CalendarView,
  CalendarDate,
  Appointment,
  getToday,
  getCalendarDate,
  getWeekDays,
  getMonthCalendar,
  getPreviousPeriod,
  getNextPeriod,
  getDateRangeText,
  generateTimeSlots,
  getAppointmentsForDate,
  getAppointmentsForTimeSlot
} from '@/utils/calendar';

interface DynamicCalendarProps {
  appointments?: Appointment[];
  onTimeSlotClick?: (date: Date, timeSlot: string) => void;
  onDateChange?: (date: Date) => void;
  onViewChange?: (view: CalendarView) => void;
  className?: string;
}

export default function DynamicCalendar({
  appointments = [],
  onTimeSlotClick,
  onDateChange,
  onViewChange,
  className
}: DynamicCalendarProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [currentDate, setCurrentDate] = useState(getToday());
  const [currentView, setCurrentView] = useState<CalendarView>('week');
  const [hoveredAppointment, setHoveredAppointment] = useState<Appointment | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentSummary, setAppointmentSummary] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isUpdatingNotes, setIsUpdatingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'check_in' | 'absent' | 'no_show' | null>(null);
  const [statusReason, setStatusReason] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [notesUpdateSuccess, setNotesUpdateSuccess] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [staffIdToName, setStaffIdToName] = useState<Record<string, string>>({});

  // Load staff (audiologists) for name resolution
  useEffect(() => {
    const loadStaff = async () => {
      try {
        const response = await staffService.getStaff(token || undefined);
        const onlyAudiologists = (response.data || []).filter((s: any) => {
          const role = (s.role || '').toLowerCase();
          return role === 'audiologist' || role === 'senior audiologist';
        });
        const map: Record<string, string> = {};
        onlyAudiologists.forEach((s: any) => {
          if (s.id) map[s.id] = s.name || '';
        });
        setStaffIdToName(map);
      } catch (e) {
        // Non-blocking
        console.error('Failed to load staff for audiologist names', e);
      }
    };
    loadStaff();
  }, [token]);

  // Generate time slots
  const timeSlots = useMemo(() => generateTimeSlots(8, 20, 30), []);

  // Get calendar data based on current view
  const calendarData = useMemo(() => {
    switch (currentView) {
      case 'day':
        return [getCalendarDate(currentDate)];
      case 'week':
        return getWeekDays(currentDate);
      case 'month':
        return getMonthCalendar(currentDate);
      default:
        return getWeekDays(currentDate);
    }
  }, [currentDate, currentView]);

  // Navigate to previous period
  const handlePrevious = () => {
    const newDate = getPreviousPeriod(currentDate, currentView);
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  // Navigate to next period
  const handleNext = () => {
    const newDate = getNextPeriod(currentDate, currentView);
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  // Go to today
  const handleToday = () => {
    const today = getToday();
    setCurrentDate(today);
    setCurrentView('week'); // Switch to week view when clicking Today
    onDateChange?.(today);
    onViewChange?.('week');
  };

  // Change view
  const handleViewChange = (view: CalendarView) => {
    setCurrentView(view);
    onViewChange?.(view);
  };

  // Handle time slot click
  const handleTimeSlotClick = (date: Date, timeSlot: string) => {
    onTimeSlotClick?.(date, timeSlot);
  };

  // Handle appointment click
  const handleAppointmentClick = async (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsModalOpen(true);
    setIsDropdownOpen(false); // Close dropdown when opening modal
    setIsEditingNotes(false); // Reset notes editing state
    setNotesUpdateSuccess(false); // Reset success state
    
    // Set initial data from the appointment object
    setNotesText(appointment.notes || '');
    
    // Always fetch fresh data from the API to get the latest notes and status
    try {
      await refreshAppointmentSummary(appointment.id);
    } catch (error) {
      console.error('Failed to refresh appointment summary, using initial data:', error);
      setAppointmentSummary(null);
    }
    
    // Don't call onAppointmentClick here as we want to show our own modal
  };

  // Handle click outside dropdown
  const handleClickOutside = () => {
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
    }
  };

  // Open status modal
  const openStatusModal = (status: 'check_in' | 'absent' | 'no_show') => {
    setSelectedStatus(status);
    setStatusReason('');
    setStatusNotes('');
    setIsStatusModalOpen(true);
    setIsDropdownOpen(false);
  };

  // Handle status update
  const handleStatusUpdate = async (status: 'check_in' | 'absent' | 'no_show', reason?: string, notes?: string) => {
    if (!selectedAppointment || !token) return;
    
    setIsUpdatingStatus(true);
    try {
      // Prepare update data based on status
      const updateData: any = { 
        visitStatus: status
      };
      if (reason) updateData.reason = reason;
      if (notes && notes.trim() !== '') updateData.notes = notes;
      
      await appointmentService.updateAppointment(selectedAppointment.id, updateData, token);
      
      // Update the appointment summary with new status
      if (appointmentSummary) {
        setAppointmentSummary({
          ...appointmentSummary,
          visitStatus: status,
          reason: reason || appointmentSummary.reason,
          notes: notes || appointmentSummary.notes
        });
      }
      
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Error updating appointment status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle collect payment navigation
  const handleCollectPayment = () => {
    if (!selectedAppointment || !appointmentSummary) return;
    
    // Close the modal first
    setIsDetailsModalOpen(false);
    setSelectedAppointment(null);
    
    // Navigate to B2C invoice creation page with patient data
    const patientData = appointmentSummary.patient;
    if (patientData) {
      const params = new URLSearchParams({
        patientId: patientData.id,
        patientName: patientData.fullname,
        patientPhone: patientData.phoneNumber || ''
      });
      
      router.push(`/billing/invoices/create/b2c?${params.toString()}`);
    } else {
      // Fallback to appointment data if summary patient data is not available
      const params = new URLSearchParams({
        patientName: selectedAppointment.patient,
        patientPhone: selectedAppointment.phoneNumber || ''
      });
      
      router.push(`/billing/invoices/create/b2c?${params.toString()}`);
    }
  };

  // Handle edit appointment
  const handleEditAppointment = () => {
    if (!appointmentSummary) return;
    
    setEditingAppointment(appointmentSummary);
    setIsEditModalOpen(true);
    // Close the details modal
    setIsDetailsModalOpen(false);
    setSelectedAppointment(null);
  };

  // Handle appointment updated from edit modal
  const handleAppointmentUpdated = (updatedAppointment: any) => {
    // Update the appointment summary with new data
    setAppointmentSummary(updatedAppointment);
    
    // Close the edit modal
    setIsEditModalOpen(false);
    setEditingAppointment(null);
    
    // Show success message
    alert('Appointment updated successfully!');
    
    // Refresh the calendar by calling the parent component's refresh function if available
    // For now, we'll just log the success
    console.log('Appointment updated:', updatedAppointment);
  };

  // Check if patient profile is complete
  const isPatientProfileComplete = (patient: any) => {
    if (!patient) return false;
    
    // Check required fields
    const requiredFields = ['fullname', 'email', 'phoneNumber', 'dob', 'gender'];
    return requiredFields.every(field => patient[field] && patient[field].trim() !== '');
  };

  // Handle redirect to patient edit page
  const handleEditPatientProfile = (patientId: string) => {
    router.push(`/patients/${patientId}`);
  };

  // Refresh appointment summary data - fetch from appointments API and filter by ID
  const refreshAppointmentSummary = async (appointmentId: string) => {
    try {
      // Fetch all appointments and find the specific one
      const appointmentsResponse = await appointmentService.getAppointments(1, 100, token || undefined);
      
      // Find the specific appointment in the list
      const foundAppointment = appointmentsResponse.data.appointments.find(
        (apt: any) => apt.id === appointmentId
      );
      
      if (foundAppointment) {
        setAppointmentSummary(foundAppointment);
        setNotesText(foundAppointment.notes || '');
      } else {
        setAppointmentSummary(null);
        setNotesText('');
      }
    } catch (error) {
      console.error('Error refreshing appointment data:', error);
      setAppointmentSummary(null);
      setNotesText('');
    }
  };

  // Handle notes update - only update the specific appointment
  const handleNotesUpdate = async () => {
    if (!selectedAppointment) return;
    
    setIsUpdatingNotes(true);
    setNotesUpdateSuccess(false);
    
    try {
      // Update notes via API
      const response = await appointmentService.updateAppointment(
        selectedAppointment.id,
        { notes: notesText },
        token || undefined
      );
      
      if (response.status === 'success') {
        // Refresh the appointment data to get the latest from the server
        await refreshAppointmentSummary(selectedAppointment.id);
        
        setIsEditingNotes(false);
        setNotesUpdateSuccess(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setNotesUpdateSuccess(false);
        }, 3000);
      } else {
        console.error('Failed to update notes:', response);
      }
    } catch (error) {
      console.error('Error updating notes:', error);
    } finally {
      setIsUpdatingNotes(false);
    }
  };

  // Get status color based on visit status
  const getStatusColor = (status?: string | null, appointmentDate?: string) => {
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
      case 'no_show':
        return 'bg-red-100 text-red-800';
      case 'absent':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status text
  const getStatusText = (status?: string | null, appointmentDate?: string) => {
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
      case 'no_show':
        return 'No Show';
      case 'absent':
        return 'Absent';
      default:
        return 'Pending';
    }
  };

  // Render appointment tooltip
  const renderAppointmentTooltip = (appointment: Appointment) => {
    if (!hoveredAppointment || hoveredAppointment.id !== appointment.id) return null;

    return (
      <div
        className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-3 max-w-xs"
        style={{
          left: tooltipPosition.x,
          top: tooltipPosition.y,
          transform: 'translate(-50%, -100%)',
          marginTop: '-12px'
        }}
      >
        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 !border-t-4 border-l-transparent border-r-transparent !border-t-white"></div>
        
        {/* Patient Information Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              {/* Use doctor-referrals.svg instead of profile svg */}
              <Image
                src="/sidebar/doctor-referrals.svg"
                alt="Doctor Referrals"
                width={15}
                height={15}
                className="w-3 h-3"
              />
            </div>
            <div>
              <div className="font-semibold text-sm text-gray-900">{appointment.patient}</div>
              <div className="text-xs text-gray-500">Patient</div>
            </div>
          </div>
          <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            Pending
          </div>
        </div>

        {/* Appointment Details */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs text-gray-700">{appointment.type || 'Follow-up Consultation'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs text-gray-700">{
              (appointmentSummary?.staffId && staffIdToName[appointmentSummary.staffId]) ||
              (((appointment as any).staffId) && staffIdToName[(appointment as any).staffId]) ||
              appointmentSummary?.audiologist?.name ||
              appointment.audiologist || ''
            }</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-gray-700">
              {appointment.time} 
              {appointment.totalDuration && appointment.totalDuration !== appointment.duration ? 
                ` (${appointment.duration} + ${appointment.totalDuration - appointment.duration} min)` : 
                ` (${appointment.duration} min)`
              }
            </span>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-1 pt-1">
          <div className="text-xs text-gray-600">
            Contact: {appointment.phoneNumber || 'fsfs'}
          </div>
        </div>
      </div>
    );
  };

  // Render appointment component
  const renderAppointment = (appointment: Appointment) => (
    <div
      key={appointment.id}
      className="absolute inset-1 rounded-sm p-2 text-xs overflow-hidden cursor-pointer hover:shadow-md transition-shadow bg-blue-50 border-l-2 !border-blue-500"
      onClick={(e) => {
        e.stopPropagation(); // Prevent the time slot click from firing
        handleAppointmentClick(appointment);
      }}
      onMouseEnter={(e) => {
        setHoveredAppointment(appointment);
        setTooltipPosition({ x: e.clientX, y: e.clientY - 10 });
      }}
      onMouseMove={(e) => {
        if (hoveredAppointment?.id === appointment.id) {
          setTooltipPosition({ x: e.clientX, y: e.clientY - 10 });
        }
      }}
      onMouseLeave={() => setHoveredAppointment(null)}
    >
      <div className="flex items-center space-x-1 mb-1">
        {/* Use doctor-referrals.svg instead of profile svg */}
        <Image
          src="/sidebar/doctor-referrals.svg"
          alt="Doctor Referrals"
          width={10}
          height={10}
          className="w-2.5 h-2.5 flex-shrink-0 text-gray-500"
        />
        <span className="font-medium truncate text-blue-900">{appointment.patient}</span>
      </div>
      <div className="truncate text-blue-800">{appointment.type}</div>
      <div className="text-xs text-blue-600 mt-1">
        {appointment.totalDuration && appointment.totalDuration !== appointment.duration ? 
          `${appointment.duration}+${appointment.totalDuration - appointment.duration}min` : 
          `${appointment.duration}min`
        }
      </div>
      
      {/* Render tooltip */}
      {renderAppointmentTooltip(appointment)}
    </div>
  );

  // Render appointment details modal
  const renderAppointmentDetailsModal = () => {
    if (!isDetailsModalOpen || !selectedAppointment) return null;

    const appointment = selectedAppointment;

    return (
      <div className="fixed inset-0 backdrop-blur-xs bg-opacity-40 flex items-center justify-center z-50 p-4" onClick={handleClickOutside}>
        <div className="bg-white rounded-xl w-[30rem] max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Appointment Details</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Patient appointment information and management options for {appointmentSummary?.patient?.fullname || appointment.patient}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                 <button
                   onClick={handleEditAppointment}
                   className="p-1.5 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                   aria-label="Edit appointment"
                   title="Edit appointment details"
                 >
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                   </svg>
                 </button>
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedAppointment(null);
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Separator Line */}
            <hr className="my-4 border-gray-200" />

            {/* Patient Information Section */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 ">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    {/* Use doctor-referrals.svg instead of profile svg */}
                    <Image
                      src="/sidebar/doctor-referrals.svg"
                      alt="Doctor Referrals"
                      width={24}
                      height={24}
                      className="w-6 h-6 text-blue-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-gray-900 text-base">
                      {appointmentSummary?.patient?.fullname || appointment.patient}
                    </h3>
                    {/* <p className="text-xs text-gray-500">Patient ID: PAT999</p> */}
                    <p className="text-xs text-gray-600">
                      {appointmentSummary?.patient?.phoneNumber || appointment.phoneNumber || 'No contact number'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {appointmentSummary?.patient?.email || 'No email'}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex justify-end">
                    <div className={`w-20 rounded-full text-xs text-center ${getStatusColor(appointmentSummary?.visitStatus, appointmentSummary?.date)}`}>
                      {getStatusText(appointmentSummary?.visitStatus, appointmentSummary?.date)}
                    </div>
                  </div>
                  {isPatientProfileComplete(appointmentSummary?.patient) ? (
                    <div className="flex items-center justify-end space-x-1 text-green-600 text-xs">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Complete profile</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEditPatientProfile(appointmentSummary?.patient?.id || appointmentSummary?.userId)}
                      className="flex items-center justify-end space-x-1 text-orange-600 text-xs hover:text-orange-700 transition-colors cursor-pointer"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span>Incomplete profile</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            <hr className="my-4 border-gray-200" />

            {/* Appointment Details Section */}
            <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3 ">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold text-gray-900 text-xs">
                    {appointmentSummary?.procedures || appointment.type || 'In-Clinic Appointment'}
                  </span>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={isUpdatingStatus}
                    className="px-4 py-1.5 bg-gray-100 text-gray-700 text-sm rounded border hover:bg-gray-200 transition-colors cursor-pointer flex items-center space-x-2 disabled:opacity-50"
                  >
                    <span>Mark as...</span>
                    <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
                      <div className="py-1">
                        <div 
                          className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                          onClick={() => handleStatusUpdate('check_in')}
                        >
                          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Check In</span>
                        </div>
                        <div 
                          className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                          onClick={() => handleStatusUpdate('absent')}
                        >
                          <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span>Absent</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <hr className="my-3 border-gray-200" />
              <div className="flex items-center justify-between text-xs">
                <p className="text-gray-700">
                  <span className="font-medium text-gray-400 ">Audiologist:</span> <span className="font-semibold">
                    {
                      (appointmentSummary?.staffId && staffIdToName[appointmentSummary.staffId]) ||
                      (((appointment as any).staffId) && staffIdToName[(appointment as any).staffId]) ||
                      appointmentSummary?.audiologist?.name ||
                      appointment.audiologist || ''
                    }
                  </span>
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Time:</span> <span className="font-semibold">
                    {appointmentSummary ? 
                      (() => {
                        const time = appointmentSummary.appointmentTime;
                        
                        if (time) {
                          try {
                            const date = new Date(time);
                            if (!isNaN(date.getTime())) {
                              // Use UTC methods to avoid timezone conversion issues
                              const hours = date.getUTCHours();
                              const minutes = date.getUTCMinutes();
                              const period = hours >= 12 ? 'PM' : 'AM';
                              const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                              return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
                            }
                          } catch (error) {
                            console.error('Error formatting time:', error);
                          }
                        }
                        
                        return 'N/A';
                      })() :
                      appointment.time
                    }
                  </span>
                </p>
              </div>
            </div>

            {/* Duration Information Section */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Duration Information</h3>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500">Appointment Duration</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {appointment.duration || appointmentSummary?.appointmentDuration || 30} minutes
                      </div>
                    </div>
                  </div>
                  
                  {(appointmentSummary?.totalDuration || appointment.totalDuration) && 
                   (() => {
                     const totalDur = appointment.totalDuration || 
                       (appointmentSummary?.totalDuration ? 
                         (typeof appointmentSummary.totalDuration === 'string' ? 
                           parseInt(appointmentSummary.totalDuration) : 
                           appointmentSummary.totalDuration
                         ) : 
                         undefined
                       );
                     const apptDur = appointment.duration || appointmentSummary?.appointmentDuration;
                     return totalDur && totalDur !== apptDur;
                   })() && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500">Total Duration (with procedures)</div>
                        <div className="text-sm font-semibold text-gray-900">
                          {appointment.totalDuration || 
                            (appointmentSummary?.totalDuration ? 
                              (typeof appointmentSummary.totalDuration === 'string' ? 
                                parseInt(appointmentSummary.totalDuration) : 
                                appointmentSummary.totalDuration
                              ) : 
                              undefined
                            )
                          } minutes
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Planned Procedures Section */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Planned Procedures</h3>
              <div className="bg-white rounded-lg p-2 border border-gray-200">
                <div className="flex items-center space-x-3 rounded-full ">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-xs text-gray-900">
                    {appointmentSummary?.procedures || appointment.type || 'Follow-up Consultation'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm">Notes</h3>
                {notesUpdateSuccess && (
                  <div className="flex items-center space-x-1 text-green-600 text-xs">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Updated successfully</span>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-2 border border-gray-200 ">
                {isEditingNotes ? (
                  <div className="space-y-3">
                    <textarea
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      className="w-full p-3 text-xs border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Add notes for this patient..."
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setIsEditingNotes(false);
                          setNotesText(appointment.notes || '');
                          setNotesUpdateSuccess(false);
                        }}
                        className="px-3 py-1 text-xs border border-red-500 rounded-md text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleNotesUpdate}
                        disabled={isUpdatingNotes}
                        className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isUpdatingNotes && (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        )}
                        <span>{isUpdatingNotes ? 'Saving...' : 'Save'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      setIsEditingNotes(true);
                      setNotesUpdateSuccess(false);
                    }}
                  >
                    <p className="text-xs text-gray-500 italic">
                      {appointmentSummary?.notes || notesText || selectedAppointment?.notes || "No notes available. Click to add notes for this patient."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-3 pt-4 ">
              <button
                onClick={handleCollectPayment}
                className="px-10 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer flex items-center space-x-2 text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>Collect Payment</span>
              </button>
              
              <button
                onClick={() => openStatusModal('no_show')}
                disabled={isUpdatingStatus}
                className="px-6 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer flex items-center space-x-2 text-sm font-medium disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Cancel Appointment</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    const dayData = calendarData[0] as CalendarDate;
    const dayAppointments = getAppointmentsForDate(appointments, dayData.date);

    return (
      <div className="flex-1 overflow-hidden">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full">
          {/* Day Header */}
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{dayData.day}</div>
              <div className="text-sm text-gray-600">{dayData.dayName}</div>
              <div className="text-sm text-gray-600">{dayData.monthName} {dayData.year}</div>
            </div>
          </div>

          {/* Time Slots */}
          <div className="overflow-y-auto scrollbar-hide h-[calc(100vh-200px)] ">
            {timeSlots.map((slot) => {
              const slotAppointments = getAppointmentsForTimeSlot(dayAppointments, dayData.date, slot.time);
              
              return (
                <div
                  key={slot.time}
                  className="h-16 border-b border-gray-200 hover:bg-blue-50 transition-colors cursor-pointer relative flex group"
                  onClick={() => handleTimeSlotClick(dayData.date, slot.time)}
                >
                  <div className="w-20 p-3 border-gray-200 bg-gray-50 flex items-center justify-center">
                    <span className="text-xs text-gray-600 text-center group-hover:text-blue-600 transition-colors">{slot.time}</span>
                  </div>
                  <div className="flex-1 relative">
                    {slotAppointments.map(renderAppointment)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const weekDays = calendarData as CalendarDate[];

    return (
      <div className="flex-1 overflow-hidden">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full">
          {/* Week Header */}
          <div className="grid grid-cols-8  border-gray-200 sticky top-0 z-10 bg-white">
            <div className="p-3 bg-gray-50 border-gray-200 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">TIME</span>
            </div>
            {weekDays.map((day) => (
              <div
                key={day.date.toISOString()}
                className={cn(
                  "p-3 border-r border-gray-200 last:border-r-0",
                  day.isToday ? "bg-blue-50" : "bg-gray-50"
                )}
              >
                <div className="text-center">
                  <div className={cn(
                    "text-xs font-medium",
                    day.isToday ? "text-blue-600" : "text-gray-600"
                  )}>
                    {day.dayNameShort}
                  </div>
                  <div className={cn(
                    "text-sm font-bold",
                    day.isToday ? "text-blue-600" : "text-gray-600"
                  )}>
                    {day.day}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Week Body */}
          <div className="grid grid-cols-8 overflow-y-auto scrollbar-hide h-[calc(100vh-200px)]">
            {/* Time Column */}
            <div className="border-gray-200 bg-gray-50">
              {timeSlots.map((slot) => (
                <div
                  key={slot.time}
                  className="h-16 border-b border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xs text-gray-600 text-center">{slot.time}</span>
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {weekDays.map((day) => (
              <div
                key={day.date.toISOString()}
                className={cn(
                  "relative border-gray-200 last:border-r-0",
                  day.isToday ? "bg-blue-50/30" : "transparent"
                )}
              >
                {timeSlots.map((slot) => {
                  const dayAppointments = getAppointmentsForDate(appointments, day.date);
                  const slotAppointments = getAppointmentsForTimeSlot(dayAppointments, day.date, slot.time);
                  
                  return (
                    <div
                      key={slot.time}
                      className="h-16 border-b border-gray-200 relative hover:bg-gray-100 transition-colors cursor-pointer group"
                      onClick={() => handleTimeSlotClick(day.date, slot.time)}
                    >
                      {slotAppointments.map(renderAppointment)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render month view
  const renderMonthView = () => {
    const monthWeeks = calendarData as CalendarDate[][];

    return (
      <div className="flex-1 overflow-hidden">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full">
          {/* Month Header */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
              <div key={day} className="p-3 bg-gray-50  border-gray-200 last:-0">
                <div className="text-center text-xs font-medium text-gray-600">{day}</div>
              </div>
            ))}
          </div>

          {/* Month Body */}
          <div className="grid grid-rows-6 h-full">
            {monthWeeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 border-b border-gray-200 last:border-b-0">
                {week.map((day) => {
                  const dayAppointments = getAppointmentsForDate(appointments, day.date);
                  
                  return (
                    <div
                      key={day.date.toISOString()}
                      className={cn(
                        "border-r border-gray-200 last:border-r-0 p-2 cursor-pointer hover:bg-gray-50 transition-colors min-h-[120px] relative",
                        !day.isCurrentMonth && "bg-gray-50/50 text-gray-400",
                        day.isToday && "bg-blue-50"
                      )}
                      onClick={() => handleTimeSlotClick(day.date, '09:00')}
                    >
                      <div className={cn(
                        "text-sm font-medium mb-1",
                        day.isToday && "text-blue-600",
                        !day.isCurrentMonth && "text-gray-400"
                      )}>
                        {day.day}
                      </div>
                      
                      {/* Appointments */}
                      <div className="space-y-1">
                        {dayAppointments.slice(0, 3).map((appointment) => (
                          <div
                            key={appointment.id}
                            className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate cursor-pointer hover:bg-blue-200 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAppointmentClick(appointment);
                            }}
                            onMouseEnter={(e) => {
                              setHoveredAppointment(appointment);
                              setTooltipPosition({ x: e.clientX, y: e.clientY - 10 });
                            }}
                            onMouseMove={(e) => {
                              if (hoveredAppointment?.id === appointment.id) {
                                setTooltipPosition({ x: e.clientX, y: e.clientY - 10 });
                              }
                            }}
                            onMouseLeave={() => setHoveredAppointment(null)}
                            title={`${appointment.time} - ${appointment.patient}: ${appointment.type} (${appointment.totalDuration && appointment.totalDuration !== appointment.duration ? `${appointment.duration}+${appointment.totalDuration - appointment.duration}min` : `${appointment.duration}min`})`}
                          >
                            {/* Use doctor-referrals.svg before patient name */}
                            <span className="inline-block align-middle mr-1">
                              <Image
                                src="/sidebar/doctor-referrals.svg"
                                alt="Doctor Referrals"
                                width={10}
                                height={10}
                                className="w-2.5 h-2.5"
                              />
                            </span>
                            {appointment.time} {appointment.patient}
                            {/* Render tooltip for month view appointments too */}
                            {renderAppointmentTooltip(appointment)}
                          </div>
                        ))}
                        {dayAppointments.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{dayAppointments.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex-shrink-0 p-4">
        <div className="flex items-center justify-between bg-white">
          {/* Title */}
          <h1 className="text-md font-semibold text-black">
            Appointment Calendar
            {appointments.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({appointments.length} appointment{appointments.length !== 1 ? 's' : ''})
              </span>
            )}
          </h1>
          
          {/* Date Navigation */}
          <div className="flex items-center">
            <button
              onClick={handlePrevious}
              className=" hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              aria-label={`Previous ${currentView}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-md font-medium text-black min-w-[150px] text-center">
              {getDateRangeText(currentDate, currentView)}
            </span>
            <button
              onClick={handleNext}
              className="hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              aria-label={`Next ${currentView}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* View Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToday}
              className="px-3 py-1 text-xs font-semibold bg-white border border-gray-300 text-black rounded-md hover:bg-gray-50 transition-colors cursor-pointer shadow"
            >
              Today
            </button>
            <div className="flex bg-gray-100 rounded-md p-1">
              {(['day', 'week', 'month'] as CalendarView[]).map((view) => (
                <button
                  key={view}
                  onClick={() => handleViewChange(view)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-md transition-colors capitalize cursor-pointer",
                    currentView === view
                      ? "bg-white border border-gray-300 text-black shadow font-semibold"
                      : "bg-gray-100 text-black hover:bg-gray-200"
                  )}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      {currentView === 'day' && renderDayView()}
      {currentView === 'week' && renderWeekView()}
      {currentView === 'month' && renderMonthView()}

      {/* Appointment Details Modal */}
      {renderAppointmentDetailsModal()}

      {/* Edit Appointment Modal */}
      {editingAppointment && (
        <EditAppointmentModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingAppointment(null);
          }}
          appointment={editingAppointment}
          onAppointmentUpdated={handleAppointmentUpdated}
        />
      )}

      {/* Status Update Modal */}
      {isStatusModalOpen && selectedStatus && (
        <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4  border-2 border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedStatus === 'absent' && 'Mark as Absent'}
                {selectedStatus === 'no_show' && 'Cancel Appointment'}
              </h3>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {(selectedStatus === 'no_show' || selectedStatus === 'absent') && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Reason <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value)}
                      className="text-xs w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      aria-label="Select reason for no show or absent"
                    >
                      <option value="">Select a reason</option>
                      <option value="Patient did not arrive">Patient did not arrive</option>
                      <option value="Patient cancelled last minute">Patient cancelled last minute</option>
                      <option value="Patient forgot appointment">Patient forgot appointment</option>
                      <option value="Transportation issues">Transportation issues</option>
                      <option value="Emergency situation">Emergency situation</option>
                      <option value="Weather conditions">Weather conditions</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      rows={3}
                      className="text-xs w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add any additional notes..."
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // For no_show and absent, require reason
                  if ((selectedStatus === 'no_show' || selectedStatus === 'absent') && !statusReason.trim()) {
                    alert('Please select a reason.');
                    return;
                  }
                  
                  handleStatusUpdate(selectedStatus, statusReason, statusNotes);
                  setIsStatusModalOpen(false);
                }}
                disabled={isUpdatingStatus}
                className={`px-4 py-2 text-xs font-medium text-white rounded-md ${
                  selectedStatus === 'absent' ? 'bg-orange-600 hover:bg-orange-700' :
                  selectedStatus === 'no_show' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-orange-600 hover:bg-orange-700'
                } ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isUpdatingStatus ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
