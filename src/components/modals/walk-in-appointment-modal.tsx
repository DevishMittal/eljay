'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/utils';

interface NewAppointment {
  id: string;
  date: Date;
  time: string;
  patient: string;
  type: string;
  duration: number;
  audiologist: string;
  notes: string;
  phoneNumber: string;
  email: string;
}

interface WalkInAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  selectedTime?: string;
  onAppointmentCreated?: (appointment: NewAppointment) => void;
}

type FormStage = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface FormData {
  phoneNumber: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: string;
  gender: string;
  alternateNumber: string;
  occupation: string;
  customerType: string;
  selectedAudiologist: string;
  appointmentType: string;
  appointmentDate: string;
  appointmentTime: string;
  notes: string;
}

const WalkInAppointmentModal: React.FC<WalkInAppointmentModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  selectedTime,
  onAppointmentCreated,
}) => {
  const [currentStage, setCurrentStage] = useState<FormStage>(1);
  const [formData, setFormData] = useState<FormData>({
    phoneNumber: '',
    fullName: '',
    email: '',
    mobileNumber: '',
    dateOfBirth: '',
    gender: 'Male',
    alternateNumber: '',
    occupation: '',
    customerType: 'B2C (Direct Patient)',
    selectedAudiologist: 'Dr. Sarah Johnson',
    appointmentType: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: '',
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStage(1);
      setFormData({
        phoneNumber: '',
        fullName: '',
        email: '',
        mobileNumber: '',
        dateOfBirth: '',
        gender: 'Male',
        alternateNumber: '',
        occupation: '',
        customerType: 'B2C (Direct Patient)',
        selectedAudiologist: 'Dr. Sarah Johnson',
        appointmentType: '',
        appointmentDate: '',
        appointmentTime: '',
        notes: '',
      });
    }
  }, [isOpen]);

  // Update form data when selectedDate or selectedTime changes
  useEffect(() => {
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, appointmentDate: dateString }));
    }
    if (selectedTime) {
      setFormData(prev => ({ ...prev, appointmentTime: selectedTime }));
    }
  }, [selectedDate, selectedTime]);

  const audiologists = [
    'Dr. Sarah Johnson',
    'Dr. Michael Brown',
    'Dr. Jennifer Lee',
    'Dr. Alex Kumar',
    'Dr. Emily Davis',
  ];

  const appointmentTypes = [
    'Initial Consultation',
    'Hearing Assessment',
    'Hearing Aid Fitting',
    'Follow-up Appointment',
    'Emergency Consultation',
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStage < 7) {
      setCurrentStage(prev => (prev + 1) as FormStage);
    }
  };

  const handleBack = () => {
    if (currentStage > 1) {
      setCurrentStage(prev => (prev - 1) as FormStage);
    }
  };

  const handleSubmit = () => {
    // Create new appointment object
    const newAppointment = {
      id: Date.now().toString(), // Generate unique ID
      date: selectedDate || new Date(),
      time: formData.appointmentTime,
      patient: formData.fullName,
      type: formData.appointmentType,
      duration: 30, // Default duration
      audiologist: formData.selectedAudiologist,
      notes: formData.notes,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
    };

    // Pass the new appointment back to parent component
    onAppointmentCreated?.(newAppointment);
    
    console.log('Form submitted:', formData);
    console.log('New appointment created:', newAppointment);
    onClose();
  };

  if (!isOpen) return null;

  const renderProgressBar = () => {
    return (
      <div className="flex space-x-1 mb-6">
        {[1, 2, 3, 4, 5, 6, 7].map((stage) => (
          <div
            key={stage}
            className={cn(
              'h-2 flex-1 rounded-full transition-all duration-300',
              stage <= currentStage ? 'bg-blue-600' : 'bg-gray-200'
            )}
          />
        ))}
      </div>
    );
  };

  const renderStage1 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold" style={{ color: '#101828' }}>Phone Number Lookup</h2>
          <p className="text-sm" style={{ color: '#4A5565' }}>Enter patient phone number to check existing records</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#0A0A0A' }}>
            Patient Phone Number *
          </label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
            placeholder="+1 234 567 8900"
          />
        </div>

        <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-3">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="text-sm" style={{ color: '#0A0A0A' }}>We&apos;ll check if this patient exists in our system</span>
        </div>
      </div>
    </div>
  );

  const renderStage2 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold" style={{ color: '#101828' }}>Patient Information</h2>
          <p className="text-sm" style={{ color: '#4A5565' }}>Complete patient information and classification</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#0A0A0A' }}>
            Full Name *
          </label>
                     <input
             type="text"
             id="fullName"
             value={formData.fullName}
             onChange={(e) => handleInputChange('fullName', e.target.value)}
             className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
             style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
             aria-label="Full name"
           />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#0A0A0A' }}>
            Email Address
          </label>
                     <input
             type="email"
             id="email"
             value={formData.email}
             onChange={(e) => handleInputChange('email', e.target.value)}
             className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
             style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
             aria-label="Email address"
           />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#0A0A0A' }}>
            Mobile Number
          </label>
          <input
            type="tel"
            id="mobileNumber"
            value={formData.mobileNumber}
            onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
            placeholder="Enter mobile number"
            aria-label="Mobile number"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#0A0A0A' }}>
            Date of Birth
          </label>
          <input
            type="date"
            id="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
            aria-label="Date of birth"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#0A0A0A' }}>
            Gender
          </label>
          <select
            id="gender"
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
            aria-label="Gender"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#0A0A0A' }}>
            Alternate Number
          </label>
          <input
            type="tel"
            value={formData.alternateNumber}
            onChange={(e) => handleInputChange('alternateNumber', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
            placeholder="Optional alternate contact"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#0A0A0A' }}>
            Occupation
          </label>
          <input
            type="text"
            value={formData.occupation}
            onChange={(e) => handleInputChange('occupation', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
            placeholder="Patient's occupation"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#0A0A0A' }}>
            Customer Type
          </label>
          <select
            id="customerType"
            value={formData.customerType}
            onChange={(e) => handleInputChange('customerType', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
            aria-label="Customer type"
          >
            <option value="B2C (Direct Patient)">B2C (Direct Patient)</option>
            <option value="B2B (Corporate)">B2B (Corporate)</option>
            <option value="Insurance">Insurance</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStage3 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold" style={{ color: '#101828' }}>Select Audiologist</h2>
          <p className="text-sm" style={{ color: '#4A5565' }}>Choose an available audiologist for the appointment</p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-semibold mb-2" style={{ color: '#0A0A0A' }}>
          Select Available Audiologist *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {audiologists.map((audiologist) => (
            <div
              key={audiologist}
              onClick={() => handleInputChange('selectedAudiologist', audiologist)}
              className={cn(
                'p-4 rounded-lg border cursor-pointer transition-all duration-200',
                formData.selectedAudiologist === audiologist
                  ? 'bg-gray-100 border-gray-300'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium" style={{ color: '#0A0A0A' }}>{audiologist}</div>
                  <div className="text-sm" style={{ color: '#717182' }}>Available</div>
                </div>
                <div className={cn(
                  'w-4 h-4 rounded-full border-2',
                  formData.selectedAudiologist === audiologist
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-300'
                )}>
                  {formData.selectedAudiologist === audiologist && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStage4 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold" style={{ color: '#101828' }}>Appointment Type</h2>
          <p className="text-sm" style={{ color: '#4A5565' }}>Select the type of appointment</p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-semibold mb-2" style={{ color: '#0A0A0A' }}>
          Appointment Type *
        </label>
        <div className="grid grid-cols-1 gap-3">
          {appointmentTypes.map((type) => (
            <div
              key={type}
              onClick={() => handleInputChange('appointmentType', type)}
              className={cn(
                'p-4 rounded-lg border cursor-pointer transition-all duration-200',
                formData.appointmentType === type
                  ? 'bg-gray-100 border-gray-300'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium" style={{ color: '#0A0A0A' }}>{type}</div>
                <div className={cn(
                  'w-4 h-4 rounded-full border-2',
                  formData.appointmentType === type
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-300'
                )}>
                  {formData.appointmentType === type && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStage5 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold" style={{ color: '#101828' }}>Select Date & Time</h2>
          <p className="text-sm" style={{ color: '#4A5565' }}>Choose your preferred appointment date and time</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#0A0A0A' }}>
            Appointment Date *
          </label>
          <input
            type="date"
            id="appointmentDate"
            value={formData.appointmentDate}
            onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
            aria-label="Appointment date"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#0A0A0A' }}>
            Appointment Time *
          </label>
          <input
            type="time"
            id="appointmentTime"
            value={formData.appointmentTime}
            onChange={(e) => handleInputChange('appointmentTime', e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
            aria-label="Appointment time"
          />
        </div>
      </div>
    </div>
  );

  const renderStage6 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold" style={{ color: '#101828' }}>Additional Notes</h2>
          <p className="text-sm" style={{ color: '#4A5565' }}>Add any special requirements or notes</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: '#0A0A0A' }}>
          Notes (Optional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
          placeholder="Enter any additional notes or special requirements..."
        />
      </div>
    </div>
  );

  const renderStage7 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold" style={{ color: '#101828' }}>Confirmation</h2>
          <p className="text-sm" style={{ color: '#4A5565' }}>Review your appointment details</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2" style={{ color: '#0A0A0A' }}>Patient Information</h3>
            <div className="space-y-1 text-sm" style={{ color: '#717182' }}>
              <p><strong>Name:</strong> {formData.fullName}</p>
              <p><strong>Phone:</strong> {formData.phoneNumber}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Gender:</strong> {formData.gender}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2" style={{ color: '#0A0A0A' }}>Appointment Details</h3>
            <div className="space-y-1 text-sm" style={{ color: '#717182' }}>
              <p><strong>Audiologist:</strong> {formData.selectedAudiologist}</p>
              <p><strong>Type:</strong> {formData.appointmentType}</p>
              <p><strong>Date:</strong> {formData.appointmentDate}</p>
              <p><strong>Time:</strong> {formData.appointmentTime}</p>
            </div>
          </div>
        </div>
        {formData.notes && (
          <div>
            <h3 className="font-semibold mb-2" style={{ color: '#0A0A0A' }}>Notes</h3>
            <p className="text-sm" style={{ color: '#717182' }}>{formData.notes}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCurrentStage = () => {
    switch (currentStage) {
      case 1: return renderStage1();
      case 2: return renderStage2();
      case 3: return renderStage3();
      case 4: return renderStage4();
      case 5: return renderStage5();
      case 6: return renderStage6();
      case 7: return renderStage7();
      default: return renderStage1();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1" />
                         <button
               onClick={onClose}
               className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
               aria-label="Close modal"
             >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          {renderProgressBar()}

          {/* Form Content */}
          <div className="mb-6">
            {renderCurrentStage()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStage === 1}
              className={cn(
                'px-6 py-2 rounded-lg border transition-colors',
                currentStage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              Back
            </button>
            <button
              onClick={currentStage === 7 ? handleSubmit : handleNext}
              className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {currentStage === 7 ? 'Confirm Appointment' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalkInAppointmentModal;
