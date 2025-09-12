'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/utils';
import { appointmentService } from '@/services/appointmentService';
import { patientService } from '@/services/patientService';
import { UpdateAppointmentData, UpdateUserData, AppointmentSummary } from '@/types';
import CustomDropdown from '@/components/ui/custom-dropdown';
import { useAuth } from '@/contexts/AuthContext';

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentSummary;
  onAppointmentUpdated: (updatedAppointment: AppointmentSummary) => void;
}

const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onAppointmentUpdated,
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form data for appointment updates
  const [appointmentData, setAppointmentData] = useState<UpdateAppointmentData>({
    appointmentDuration: 30,
    notes: '',
    visitStatus: undefined
  });

  // Form data for patient updates
  const [patientData, setPatientData] = useState<UpdateUserData>({
    fullname: '',
    email: '',
    phoneNumber: '',
    dob: '',
    gender: '',
    occupation: '',
    alternateNumber: ''
  });

  // No need to load audiologists and procedures since we're not editing them

  // Initialize form data when appointment changes
  useEffect(() => {
    if (appointment) {
      setAppointmentData({
        appointmentDuration: appointment.appointmentDuration || appointment.duration,
        notes: appointment.notes || '', // Get notes from appointment if available
        visitStatus: appointment.visitStatus || undefined
      });

      setPatientData({
        fullname: appointment.user?.fullname || '',
        email: appointment.user?.email || '',
        phoneNumber: appointment.user?.phoneNumber || '',
        dob: '', // Not in summary
        gender: appointment.user?.gender || '',
        occupation: '', // Not in summary
        alternateNumber: '' // Not in summary
      });
    }
  }, [appointment]);

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  const handleAppointmentInputChange = (field: keyof UpdateAppointmentData, value: string | number) => {
    setAppointmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePatientInputChange = (field: keyof UpdateUserData, value: string) => {
    setPatientData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Update appointment - only send supported fields based on API documentation
      const appointmentUpdateData: Record<string, string | number> = {};

      // Only include fields that have values and are supported by the API
      if (appointmentData.visitStatus) {
        appointmentUpdateData.visitStatus = appointmentData.visitStatus;
      }
      
      if (appointmentData.notes !== undefined) {
        appointmentUpdateData.notes = appointmentData.notes;
      }
      
      if (appointmentData.appointmentDuration) {
        appointmentUpdateData.appointmentDuration = appointmentData.appointmentDuration;
      }

      // Only send the appointment update if there are changes
      if (Object.keys(appointmentUpdateData).length > 0) {
        console.log('Sending appointment update:', appointmentUpdateData);
        await appointmentService.updateAppointment(appointment.id, appointmentUpdateData, token || undefined);
      }

      // Update patient if there are changes
      const patientUpdateData = Object.fromEntries(
        Object.entries(patientData).filter(([, value]) => value !== undefined && value !== '')
      );

      if (Object.keys(patientUpdateData).length > 0) {
        await patientService.updateUser(appointment.user?.id || '', patientUpdateData, token || undefined);
      }

      setSuccess('Appointment updated successfully!');
      
      // Call the callback with updated data
      onAppointmentUpdated({
        ...appointment,
        ...appointmentUpdateData,
        user: {
          ...appointment.user,
          ...patientUpdateData
        }
      } as AppointmentSummary);

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error: unknown) {
      console.error('Error updating appointment:', error);
      setError((error as Error).message || 'Failed to update appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 shadow-lg">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1" />
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
              title="Close modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Information Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: '#101828' }}>Patient Information</h2>
                  <p className="text-xs" style={{ color: '#4A5565' }}>Update patient details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={patientData.fullname || ''}
                    onChange={(e) => handlePatientInputChange('fullname', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={patientData.email || ''}
                    onChange={(e) => handlePatientInputChange('email', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={patientData.phoneNumber || ''}
                    onChange={(e) => handlePatientInputChange('phoneNumber', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
                    Gender
                  </label>
                  <CustomDropdown
                    options={[
                      { value: 'Male', label: 'Male' },
                      { value: 'Female', label: 'Female' }
                    ]}
                    value={patientData.gender || ''}
                    onChange={(value) => handlePatientInputChange('gender', value)}
                    placeholder="Select gender"
                  />
                </div>
              </div>
            </div>

            {/* Appointment Information Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: '#101828' }}>Appointment Details</h2>
                  <p className="text-xs" style={{ color: '#4A5565' }}>Update appointment information</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="180"
                    step="15"
                    value={appointmentData.appointmentDuration || 30}
                    onChange={(e) => handleAppointmentInputChange('appointmentDuration', parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
                    placeholder="Enter duration in minutes"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
                    Visit Status
                  </label>
                  <CustomDropdown
                    options={[
                      { value: 'check_in', label: 'Check In' },
                      { value: 'no_show', label: 'No Show' },
                      { value: 'absent', label: 'Absent' }
                    ]}
                    value={appointmentData.visitStatus || ''}
                    onChange={(value) => handleAppointmentInputChange('visitStatus', value as 'check_in' | 'no_show' | 'absent')}
                    placeholder="Select status"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
                    Notes
                  </label>
                  <textarea
                    value={appointmentData.notes || ''}
                    onChange={(e) => handleAppointmentInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-sm"
                    style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
                    placeholder="Add notes for this appointment..."
                  />
                </div>
              </div>
              
              {/* Read-only information */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="text-sm font-medium mb-2" style={{ color: '#0A0A0A' }}>Current Appointment Information (Read-only)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs" style={{ color: '#717182' }}>
                  <div><span className="font-medium">Date:</span> {appointment?.date ? new Date(appointment.date).toLocaleDateString() : 'N/A'}</div>
                  <div><span className="font-medium">Time:</span> {appointment?.time ? new Date(appointment.time).toLocaleTimeString() : 'N/A'}</div>
                  <div><span className="font-medium">Audiologist:</span> {appointment?.audiologist?.name || 'N/A'}</div>
                  <div><span className="font-medium">Procedures:</span> {appointment?.procedures || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-lg border transition-colors bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "px-6 py-2 rounded-lg transition-colors flex items-center space-x-2",
                  loading
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-orange-600 hover:bg-orange-700 text-white"
                )}
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>
                  {loading ? 'Updating...' : 'Update Appointment'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAppointmentModal;
