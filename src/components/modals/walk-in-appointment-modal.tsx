/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/utils';
import { patientService } from '@/services/patientService';
import { appointmentService } from '@/services/appointmentService';
import { Audiologist, CreateAppointmentData, User, Doctor, Hospital, Diagnostic } from '@/types';
import CustomDropdown from '@/components/ui/custom-dropdown';
import DatePicker from '@/components/ui/date-picker';
import { useAuth } from '@/contexts/AuthContext';
import { doctorService } from '@/services/doctorService';
import HospitalService from '@/services/hospitalService';
import diagnosticsService from '@/services/diagnosticsService';

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

type FormStage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

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
  hospitalName: string; // For B2B patients
  opipNumber: string; // OP/IP/UHID number for B2B patients
  selectedAudiologist: string;
  appointmentType: string;
  appointmentDate: string;
  appointmentTime: string;
  notes: string;
  referralSource: string; // "Direct", "Doctor Referral", or "Hear.com"
  directSource: string;
  duration: string;
  selectedProcedures: string;
  referralDetails: {
    sourceName: string;
    contactNumber: string;
    hospital: string;
    specialization: string;
  };
  selectedReferralId: string;
}

const WalkInAppointmentModal: React.FC<WalkInAppointmentModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  selectedTime,
  onAppointmentCreated,
}) => {
  const { token } = useAuth();
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
    customerType: 'B2C',
    hospitalName: '',
    opipNumber: '',
    selectedAudiologist: '',
    appointmentType: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: '',
    referralSource: 'Direct',
    directSource: 'Walk-in',
    duration: '30',
    selectedProcedures: '',
    referralDetails: {
      sourceName: '',
      contactNumber: '',
      hospital: '',
      specialization: ''
    },
    selectedReferralId: ''
  });

  // API data states
  const [audiologists, setAudiologists] = useState<Audiologist[]>([]);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [existingUser, setExistingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userLookupLoading, setUserLookupLoading] = useState(false);
  const [selectedProcedureIds, setSelectedProcedureIds] = useState<string[]>([]);
  const [totalProcedureDuration, setTotalProcedureDuration] = useState(0);
  const [referralDoctors, setReferralDoctors] = useState<Doctor[]>([]); // State for referral doctors
  const [hospitals, setHospitals] = useState<Hospital[]>([]); // State for hospitals
  const [customHospitalName, setCustomHospitalName] = useState(''); // State for custom hospital name
  const [isOtherHospitalSelected, setIsOtherHospitalSelected] = useState(false); // State to track if "Other" is selected
  const [errorMessage, setErrorMessage] = useState(''); // State for error messages

  // Helper function to check if a diagnostic is HAT or OAE
  const isSpecialDiagnostic = (diagnosticName: string): 'HAT' | 'OAE' | null => {
    const lowerName = diagnosticName.toLowerCase();
    
    if (lowerName.includes('hat') || 
        lowerName.includes('hearing aid trial') || 
        lowerName.includes('hearing aided testing')) {
      return 'HAT';
    }
    
    if (lowerName.includes('oae') || 
        lowerName.includes('otoacoustic') || 
        lowerName.includes('emissions')) {
      return 'OAE';
    }
    
    return null;
  };

  // Load audiologists from API
  const loadAudiologists = useCallback(async () => {
    try {
      const response = await appointmentService.getAvailableAudiologists(token || undefined);
      setAudiologists(response.data);
      // Set first audiologist as default
      if (response.data.length > 0) {
        setFormData(prev => ({ ...prev, selectedAudiologist: response.data[0].id }));
      }
    } catch (error) {
      console.error('Error loading audiologists:', error);
    }
  }, [token]);

  // Load diagnostics from API
  const loadDiagnostics = useCallback(async () => {
    try {
      const response = await diagnosticsService.getDiagnostics(token || undefined);
      setDiagnostics(response.data);
    } catch (error) {
      console.error('Error loading diagnostics:', error);
    }
  }, [token]);

  // Load referral doctors from API
  const loadReferralDoctors = useCallback(async () => {
    try {
      const response = await doctorService.getDoctors(token || undefined);
      setReferralDoctors(response.data);
    } catch (error) {
      console.error('Error loading referral doctors:', error);
    }
  }, [token]);

  // Load hospitals from API
  const loadHospitals = useCallback(async () => {
    try {
      const response = await HospitalService.getHospitals();
      setHospitals(response.data.hospitals);
    } catch (error) {
      console.error('Error loading hospitals:', error);
    }
  }, []);

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
        customerType: 'B2C',
        hospitalName: '',
        opipNumber: '',
        selectedAudiologist: '',
        appointmentType: '',
        appointmentDate: '',
        appointmentTime: '',
        notes: '',
        referralSource: 'Direct',
        directSource: 'Walk-in',
        duration: '30',
        selectedProcedures: '',
        referralDetails: {
          sourceName: '',
          contactNumber: '',
          hospital: '',
          specialization: ''
        },
        selectedReferralId: ''
      });
      setExistingUser(null);
      setSelectedProcedureIds([]);
      setTotalProcedureDuration(0);
      setCustomHospitalName('');
      setIsOtherHospitalSelected(false);
      setErrorMessage(''); // Reset error message
      
      // Load audiologists and diagnostics
      loadAudiologists();
      loadDiagnostics();
      loadReferralDoctors(); // Load referral doctors when modal opens
      loadHospitals(); // Load hospitals when modal opens
    }
  }, [isOpen, loadAudiologists, loadDiagnostics, loadReferralDoctors, loadHospitals]);

  // Update form data when selectedDate or selectedTime changes
  useEffect(() => {
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, appointmentDate: dateString }));
    }
    if (selectedTime) {
      // Convert 24-hour format to 12-hour format for display
      const convertTimeTo12Hour = (time24: string): string => {
        const [hours, minutes] = time24.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
      };
      
      setFormData(prev => ({ ...prev, appointmentTime: convertTimeTo12Hour(selectedTime) }));
    }
  }, [selectedDate, selectedTime]);

  // Phone lookup functionality
  const handlePhoneLookup = async (): Promise<boolean> => {
    if (!formData.phoneNumber) return false;
    
    setUserLookupLoading(true);
    try {
      // Extract phone number (remove any formatting)
      const cleanPhone = formData.phoneNumber.replace(/[^\d]/g, '');
      
      const response = await patientService.lookupUser(cleanPhone, token || undefined);
      
      if (response.code === 200) {
        // User found, populate form with existing data
        setExistingUser(response.data);
        setFormData(prev => ({
          ...prev,
          fullName: response.data.fullname,
          email: response.data.email,
          mobileNumber: response.data.phoneNumber,
          dateOfBirth: response.data.dob?.split('T')[0] || '',
          gender: response.data.gender,
          alternateNumber: response.data.alternateNumber || '',
          occupation: response.data.occupation,
          customerType: response.data.customerType,
          hospitalName: response.data.hospitalName || '',
          opipNumber: response.data.opipNumber || '',
        }));
        return true; // User found
      } else {
        // User not found, populate mobile number with the phone number from stage 1
        setExistingUser(null);
        setFormData(prev => ({
          ...prev,
          mobileNumber: cleanPhone,
        }));
        return false; // User not found
      }
    } catch (error) {
      console.error('User lookup failed:', error);
      // User not found, populate mobile number with the phone number from stage 1
      setExistingUser(null);
      const cleanPhone = formData.phoneNumber.replace(/[^\d]/g, '');
      setFormData(prev => ({
        ...prev,
        mobileNumber: cleanPhone,
      }));
      return false; // User not found
    } finally {
      setUserLookupLoading(false);
    }
  };

  // const appointmentTypes = [
  //   'Initial Consultation',
  //   'Hearing Assessment', 
  //   'Hearing Aid Fitting',
  //   'Follow-up Appointment',
  //   'Emergency Consultation',
  // ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error message when user starts making changes
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  // Helper function to handle phone number input with 10-digit limit
  const handlePhoneInputChange = (field: keyof FormData, value: string) => {
    // Remove any non-digit characters
    const cleanValue = value.replace(/[^\d]/g, '');
    // Limit to 10 digits
    const limitedValue = cleanValue.slice(0, 10);
    handleInputChange(field, limitedValue);
    // Clear error message when user starts making changes
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  // Helper function to parse error messages from API responses
  const parseErrorMessage = (error: unknown): string => {
    // Debug logging to see the exact error structure
    console.log('Error received:', error);
    
    // Check if it's an axios error with response data
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { 
        response?: { 
          data?: { 
            message?: string;
            errors?: Array<{ field: string; message: string; value?: string }>;
            status?: string;
            error?: string;
          } 
        } 
      };
      
      console.log('Axios error response data:', axiosError.response?.data);
      
      // Handle validation errors with specific field information
      if (axiosError.response?.data?.errors && Array.isArray(axiosError.response.data.errors)) {
        const errors = axiosError.response.data.errors;
        
        // Check for phone number already registered
        const phoneError = errors.find(err => 
          err.field === 'phoneNumber' && 
          (err.message.toLowerCase().includes('already registered') || 
           err.message.toLowerCase().includes('already exists'))
        );
        if (phoneError) {
          return 'This phone number is already registered. Please use a different phone number or check if the patient already exists.';
        }
        
        // Check for email already registered
        const emailError = errors.find(err => 
          err.field === 'email' && 
          (err.message.toLowerCase().includes('already registered') || 
           err.message.toLowerCase().includes('already exists'))
        );
        if (emailError) {
          return 'This email address is already registered. Please use a different email or check if the patient already exists.';
        }
        
        // Check for appointment time conflicts
        const timeConflictError = errors.find(err => 
          err.field === 'appointmentTime' || 
          err.message.toLowerCase().includes('time slot') ||
          err.message.toLowerCase().includes('already booked') ||
          err.message.toLowerCase().includes('conflict')
        );
        if (timeConflictError) {
          return 'This time slot is already booked. Please select a different time slot.';
        }
        
        // Check for audiologist availability
        const audiologistError = errors.find(err => 
          err.field === 'audiologistId' || 
          err.message.toLowerCase().includes('audiologist') ||
          err.message.toLowerCase().includes('not available')
        );
        if (audiologistError) {
          return 'The selected audiologist is not available at the chosen time. Please select a different time or audiologist.';
        }
        
        // Check for date validation
        const dateError = errors.find(err => 
          err.field === 'appointmentDate' || 
          err.message.toLowerCase().includes('date') ||
          err.message.toLowerCase().includes('past')
        );
        if (dateError) {
          return 'Invalid appointment date. Please select a valid future date.';
        }
        
        // Return the first error message if no specific pattern matches
        if (errors.length > 0) {
          return errors[0].message;
        }
      }
      
      // Handle general error messages
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error;
      if (errorMessage) {
        const message = errorMessage.toLowerCase();
        
        // Check for specific error patterns in the main message
        if (message.includes('time slot is already booked')) {
          return 'This time slot is already booked. Please select a different time slot.';
        }
        if (message.includes('duplicate user information')) {
          return 'User information already exists. Please check if the patient is already registered.';
        }
        if (message.includes('validation failed')) {
          return 'Please check the information you entered and try again.';
        }
        if (message.includes('email') && message.includes('already') && message.includes('registered')) {
          return 'This email address is already registered. Please use a different email or check if the patient already exists.';
        }
        if (message.includes('phone') && message.includes('already') && message.includes('registered')) {
          return 'This phone number is already registered. Please use a different phone number or check if the patient already exists.';
        }
        if (message.includes('audiologist') && message.includes('not available')) {
          return 'The selected audiologist is not available at the chosen time. Please select a different time or audiologist.';
        }
        if (message.includes('appointment') && message.includes('conflict')) {
          return 'There is a scheduling conflict. Please choose a different date or time.';
        }
        if (message.includes('time slot') && message.includes('booked')) {
          return 'This time slot is already booked. Please select a different time slot.';
        }
        if (message.includes('invalid') && message.includes('date')) {
          return 'Invalid appointment date. Please select a valid future date.';
        }
        if (message.includes('invalid') && message.includes('time')) {
          return 'Invalid appointment time. Please select a valid time slot.';
        }
        if (message.includes('already booked') || message.includes('time slot taken')) {
          return 'This time slot is already booked. Please select a different time slot.';
        }
        if (message.includes('scheduling conflict') || message.includes('conflict')) {
          return 'There is a scheduling conflict. Please choose a different date or time.';
        }
        
        // Return the original message if no specific pattern matches
        return errorMessage;
      }
    }
    
    // Check for other error formats
    if (error && typeof error === 'object' && 'message' in error) {
      const errorWithMessage = error as { message: string };
      return errorWithMessage.message;
    }
    
    // Default error message
    return 'An unexpected error occurred. Please try again.';
  };



  const handleNext = async () => {
    // Handle phone lookup on stage 1
    if (currentStage === 1) {
      const userFound = await handlePhoneLookup();
      // If user exists and data is auto-filled, automatically proceed to next stage
      if (userFound) {
        setCurrentStage(2);
        return;
      }
    }
    
    if (currentStage < 8) {
      setCurrentStage(prev => (prev + 1) as FormStage);
    }
  };

  const handleBack = () => {
    if (currentStage > 1) {
      setCurrentStage(prev => (prev - 1) as FormStage);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMessage(''); // Clear any previous error messages
    try {
      let userId = existingUser?.id;

      // If no existing user, create one
      if (!userId) {
        const userData: any = {
          fullname: formData.fullName,
          countrycode: '+91', // Default country code
          phoneNumber: formData.phoneNumber,
          dob: formData.dateOfBirth,
          gender: formData.gender,
          occupation: formData.occupation,
          customerType: formData.customerType,
        };

        // Only include optional fields if they have values
        if (formData.email && formData.email.trim()) {
          userData.email = formData.email;
        }
        
        if (formData.alternateNumber && formData.alternateNumber.trim()) {
          userData.alternateNumber = formData.alternateNumber;
        }

        // Only include B2B fields when customer type is B2B and they have values
        if (formData.customerType === 'B2B') {
          if (formData.hospitalName && formData.hospitalName.trim()) {
            userData.hospitalName = formData.hospitalName;
          }
          if (formData.opipNumber && formData.opipNumber.trim()) {
            userData.opipNumber = formData.opipNumber;
          }
        }

        const userResponse = await patientService.createUser(userData, token || undefined);
        userId = userResponse.data.id;
      }

      if (!userId) {
        throw new Error('Failed to get user ID');
      }
      
      // Prepare referral source data
      let referralSourceData: {
        type: string;
        sourceName: string;
        contactNumber: string;
        hospital: string;
        specialization: string;
      } | undefined = undefined;
      
      if (formData.referralSource === 'Direct') {
        // For Direct referrals, send a referral source object
        referralSourceData = {
          type: 'direct',
          sourceName: 'Walk-in',
          contactNumber: '',
          hospital: '',
          specialization: ''
        };
      } else if (formData.referralSource === 'Doctor Referral') {
        if (formData.selectedReferralId) {
          // Use existing referral doctor - get the doctor details and send as referralSource object
          const selectedDoctor = referralDoctors.find(d => d.id === formData.selectedReferralId);
          if (selectedDoctor) {
            referralSourceData = {
              type: 'doctor',
              sourceName: selectedDoctor.name,
              contactNumber: selectedDoctor.phoneNumber,
              hospital: selectedDoctor.facilityName || '',
              specialization: selectedDoctor.specialization || ''
            };
          }
        } else {
          // Use custom referral details - send as new referral source
          referralSourceData = {
            type: 'doctor',
            sourceName: 'Self-referral',
            contactNumber: formData.referralDetails.contactNumber,
            hospital: formData.referralDetails.hospital,
            specialization: formData.referralDetails.specialization
          };
        }
      } else if (formData.referralSource === 'Hear.com') {
        // For Hear.com referrals, send as a new referral source
        referralSourceData = {
          type: 'doctor',
          sourceName: 'Hear.com',
          contactNumber: '',
          hospital: '',
          specialization: ''
        };
      }
      
      // Create appointment
      const appointmentData: CreateAppointmentData = {
        userId: userId,
        audiologistId: formData.selectedAudiologist,
        appointmentDate: formData.appointmentDate,
        appointmentTime: appointmentService.convertTo24Hour(formData.appointmentTime),
        appointmentDuration: parseInt(formData.duration),
        procedures: formData.selectedProcedures || 'General Consultation',
        hospitalName: formData.customerType === 'B2B' ? formData.hospitalName : undefined,
        referralSource: referralSourceData
      };
      
      // Ensure we have referralSource data
      if (!referralSourceData) {
        throw new Error('Referral source information is required');
      }
      
      const appointmentResponse = await appointmentService.createAppointment(appointmentData, token || undefined);
      
      // Create new appointment object for calendar
      const newAppointment = {
        id: appointmentResponse.data?.id || Date.now().toString(),
        date: selectedDate || new Date(formData.appointmentDate),
        time: appointmentService.convertTo24Hour(formData.appointmentTime),
        patient: formData.fullName,
        type: formData.selectedProcedures || 'Walk-in Appointment',
        duration: parseInt(formData.duration) || 30,
        audiologist: formData.selectedAudiologist,
        notes: formData.notes,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
      };

      // Pass the new appointment back to parent component
      onAppointmentCreated?.(newAppointment);
      
      console.log('Appointment created successfully:', appointmentResponse);
      onClose();
    } catch (error) {
      console.error('Error creating appointment:', error);
      const errorMsg = parseErrorMessage(error);
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    if (currentStage === 1) {
      if (!formData.phoneNumber || formData.phoneNumber.length < 10) {
        setErrorMessage('Please enter a valid 10-digit phone number.');
        return false;
      }
      if (userLookupLoading) {
        setErrorMessage('Looking up patient... Please wait.');
        return false;
      }
    }
    if (currentStage === 2) {
      // Stage 2 (patient details) - no validation, always allow proceeding
      return true;
    }
    if (currentStage === 3) {
      if (!formData.selectedAudiologist) {
        setErrorMessage('Please select an audiologist.');
        return false;
      }
    }
    if (currentStage === 4) {
      if (!formData.referralSource) {
        setErrorMessage('Please select how the patient was referred.');
        return false;
      }
      if (formData.referralSource === 'Doctor Referral' && !formData.selectedReferralId) {
        setErrorMessage('Please select a doctor referral source from the dropdown.');
        return false;
      }
    }
    if (currentStage === 5) {
      if (!formData.appointmentDate) {
        setErrorMessage('Please select appointment date.');
        return false;
      }
      if (!formData.appointmentTime) {
        setErrorMessage('Please select appointment time.');
        return false;
      }
      if (!formData.duration || parseInt(formData.duration) <= 0) {
        setErrorMessage('Please enter a valid appointment duration.');
        return false;
      }
    }
    if (currentStage === 6) {
      // Procedures are optional, so no validation needed
      return true;
    }
    if (currentStage === 7) {
      // Stage 7 is confirmation - no validation needed
      return true;
    }
    if (currentStage === 8) {
      // Stage 8 is notes - notes are optional, so no validation needed
      return true;
    }
    return true;
  };

  // Helper function to check if current stage is valid
  const isCurrentStageValid = () => {
    if (currentStage === 1) {
      return formData.phoneNumber && formData.phoneNumber.length >= 10 && !userLookupLoading;
    }
    if (currentStage === 2) {
      // Stage 2 (patient details) - always allow proceeding, no validation
      return true;
    }
    if (currentStage === 3) {
      return formData.selectedAudiologist;
    }
    if (currentStage === 4) {
      if (!formData.referralSource) return false;
      if (formData.referralSource === 'Doctor Referral') {
        return formData.selectedReferralId;
      }
      return true;
    }
    if (currentStage === 5) {
      return formData.appointmentDate && formData.appointmentTime && 
             formData.duration && parseInt(formData.duration) > 0;
    }
    if (currentStage === 6) {
      // Procedures are optional
      return true;
    }
    if (currentStage === 7) {
      // Confirmation stage
      return true;
    }
    if (currentStage === 8) {
      // Notes stage - optional
      return true;
    }
    return true;
  };

  if (!isOpen) return null;

  const renderProgressBar = () => {
    return (
      <div className="flex space-x-1 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((stage) => (
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
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: '#101828' }}>Phone Number Lookup</h2>
          <p className="text-xs" style={{ color: '#4A5565' }}>Enter patient phone number to check existing records</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
            Patient Phone Number *
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => handlePhoneInputChange('phoneNumber', e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
            placeholder="Enter phone number (e.g., 8025550104)"
            aria-label="Patient phone number"
            maxLength={10}
          />
        </div>

        <div className="bg-gray-50 rounded-lg p-3 flex items-center space-x-2">
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="text-xs" style={{ color: '#0A0A0A' }}>
            {existingUser ? `Found existing patient: ${existingUser.fullname}` : "We'll check if this patient exists in our system"}
          </span>
        </div>

        {userLookupLoading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Looking up patient...</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderStage2 = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: '#101828' }}>Patient Information</h2>
          <p className="text-xs" style={{ color: '#4A5565' }}>
            {existingUser ? 'Patient information auto-filled from existing records' : 'Complete patient information and classification'}
          </p>
        </div>
      </div>

      {existingUser && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-green-700">
              ✓ Patient found! Information has been auto-filled. You can proceed to the next step or modify any details if needed.
            </p>
          </div>
        </div>
      )}

             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
         <div>
           <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
             Full Name * {existingUser && <span className="text-green-600 text-xs">(Auto-filled)</span>}
           </label>
           <input
             type="text"
             id="fullName"
             value={formData.fullName}
             onChange={(e) => handleInputChange('fullName', e.target.value)}
             className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
               existingUser ? 'border-green-200 bg-green-50' : 'border-gray-200'
             }`}
             style={{ color: '#717182' }}
             placeholder="Enter patient full name"
             aria-label="Full name"
           />
         </div>

         <div>
           <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
             Email Address (Optional) {existingUser && <span className="text-green-600 text-xs">(Auto-filled)</span>}
           </label>
           <input
             type="email"
             id="email"
             value={formData.email}
             onChange={(e) => handleInputChange('email', e.target.value)}
             className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
               existingUser ? 'border-green-200 bg-green-50' : 'border-gray-200'
             }`}
             style={{ color: '#717182' }}
             placeholder="patient@example.com"
             aria-label="Email address"
           />
         </div>

         <div>
           <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
             Mobile Number {existingUser && <span className="text-green-600 text-xs">(Auto-filled)</span>}
           </label>
           <input
             type="tel"
             id="mobileNumber"
             value={formData.mobileNumber}
             onChange={(e) => handlePhoneInputChange('mobileNumber', e.target.value)}
             className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
               existingUser ? 'border-green-200 bg-green-50' : 'border-gray-200'
             }`}
             style={{ color: '#717182' }}
             placeholder="Enter your phone no."
             aria-label="Mobile number"
             maxLength={10}
           />
         </div>

         <div>
           <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
             Date of Birth {existingUser && <span className="text-green-600 text-xs">(Auto-filled)</span>}
           </label>
           <DatePicker
             value={formData.dateOfBirth}
             onChange={(date) => handleInputChange('dateOfBirth', date)}
             placeholder="Select date of birth"
             maxDate={new Date()} // Can't select future dates for DOB
             className={existingUser ? 'border-green-200 bg-green-50' : ''}
             aria-label="Date of birth"
           />
         </div>

                 <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
            Gender {existingUser && <span className="text-green-600 text-xs">(Auto-filled)</span>}
          </label>
          <CustomDropdown
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' }
            ]}
            value={formData.gender}
            onChange={(value) => handleInputChange('gender', value)}
            placeholder="Select gender"
            className={existingUser ? 'border-green-200 bg-green-50' : ''}
            aria-label="Gender"
          />
        </div>

         <div>
           <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
             Alternate Number {existingUser && <span className="text-green-600 text-xs">(Auto-filled)</span>}
           </label>
           <input
             type="tel"
             id="alternateNumber"
             value={formData.alternateNumber}
             onChange={(e) => handlePhoneInputChange('alternateNumber', e.target.value)}
             className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
               existingUser ? 'border-green-200 bg-green-50' : 'border-gray-200'
             }`}
             style={{ color: '#717182' }}
             placeholder="Optional alternate contact"
             aria-label="Alternate number"
             maxLength={10}
           />
         </div>

         <div>
           <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
             Occupation {existingUser && <span className="text-green-600 text-xs">(Auto-filled)</span>}
           </label>
           <input
             type="text"
             id="occupation"
             value={formData.occupation}
             onChange={(e) => handleInputChange('occupation', e.target.value)}
             className={`w-full px-3 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
               existingUser ? 'border-green-200 bg-green-50' : 'border-gray-200'
             }`}
             style={{ color: '#717182' }}
             placeholder="Patient's occupation"
             aria-label="Occupation"
           />
         </div>

         <div>
           <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
             Customer Type {existingUser && <span className="text-green-600 text-xs">(Auto-filled)</span>}
           </label>
           <CustomDropdown
             options={[
               { value: 'B2C', label: 'B2C' },
               { value: 'B2B', label: 'B2B' }
             ]}
             value={formData.customerType}
             onChange={(value) => {
               handleInputChange('customerType', value);
               // Reset hospital name and OP/IP number when changing customer type
               if (value === 'B2C') {
                 handleInputChange('hospitalName', '');
                 handleInputChange('opipNumber', '');
               }
               // Set referral source to Direct for B2B patients
               if (value === 'B2B') {
                 handleInputChange('referralSource', 'Direct');
                 handleInputChange('selectedReferralId', '');
                 setFormData(prev => ({
                   ...prev,
                   referralDetails: { sourceName: '', contactNumber: '', hospital: '', specialization: '' }
                 }));
               }
             }}
             placeholder="Select customer type"
             className={existingUser ? 'border-green-200 bg-green-50' : ''}
             aria-label="Customer type"
             disabled={!!existingUser}
           />
           {existingUser && (
             <p className="text-xs text-green-500 mt-1">
               ✓ This field is populated from existing user data
             </p>
           )}
         </div>

         {/* Hospital field - only show for B2B patients */}
         {formData.customerType === 'B2B' && (
           <div>
             <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
               Hospital Name {existingUser && <span className="text-green-600 text-xs">(Auto-filled)</span>} *
             </label>
             <div className="space-y-2">
               <CustomDropdown
                 options={[
                   ...hospitals.map(hospital => ({ value: hospital.name, label: hospital.name })),
                   { value: 'Other', label: 'Other' }
                 ]}
                 value={isOtherHospitalSelected ? 'Other' : formData.hospitalName}
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
                 className={existingUser ? 'border-green-200 bg-green-50' : ''}
                 aria-label="Hospital name"
                 disabled={!!existingUser}
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
                     className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                     style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
                     placeholder="Enter hospital name"
                     aria-label="Custom hospital name"
                   />
                 </div>
               )}
             </div>
             {existingUser && (
               <p className="text-xs text-green-500 mt-1">
                 ✓ This field is populated from existing user data
               </p>
             )}
           </div>
         )}

         {/* OP/IP Number field - only show for B2B patients */}
         {formData.customerType === 'B2B' && (
           <div>
             <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
               OP/IP/UHID Number {existingUser && <span className="text-green-600 text-xs">(Auto-filled)</span>} (Optional)
             </label>
             <input
               type="text"
               value={formData.opipNumber}
               onChange={(e) => handleInputChange('opipNumber', e.target.value)}
               className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
               style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
               placeholder="Enter OP/IP/UHID number (can be added later)"
               aria-label="OP/IP/UHID number"
             />
             <p className="text-xs text-gray-500 mt-1">Can be added later to complete profile</p>
             {existingUser && (
               <p className="text-xs text-green-500 mt-1">
                 ✓ This field is populated from existing user data
               </p>
             )}
           </div>
         )}
       </div>
    </div>
  );

  const renderStage3 = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: '#101828' }}>Select Audiologist</h2>
          <p className="text-xs" style={{ color: '#4A5565' }}>Choose an available audiologist for the appointment</p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
          Select Available Audiologist *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {audiologists.map((audiologist) => (
            <div
              key={audiologist.id}
              onClick={() => handleInputChange('selectedAudiologist', audiologist.id)}
              className={cn(
                'p-3 rounded-lg border cursor-pointer transition-all duration-200',
                formData.selectedAudiologist === audiologist.id
                  ? 'bg-gray-100 border-gray-300'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm" style={{ color: '#0A0A0A' }}>{audiologist.name}</div>
                  <div className="text-xs" style={{ color: '#717182' }}>
                    {audiologist.isAvailable ? 'Available' : 'Not Available'}
                  </div>
                </div>
                <div className={cn(
                  'w-4 h-4 rounded-full border-2',
                  formData.selectedAudiologist === audiologist.id
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-300'
                )}>
                  {formData.selectedAudiologist === audiologist.id && (
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
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: '#101828' }}>Referral Source</h2>
          <p className="text-xs" style={{ color: '#4A5565' }}>Select how the patient was referred to the clinic</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Main referral options */}
        {(formData.customerType === 'B2B' ? 
          [{ value: 'Direct', description: 'Patient came directly (Walk-in)' }] :
          [
            { value: 'Direct', description: 'Patient came directly (Walk-in)' },
            { value: 'Doctor Referral', description: 'Referred by a medical professional (Self-referral)' },
            { value: 'Hear.com', description: 'Referred through Hear.com' }
          ]
        ).map((option) => (
          <div
            key={option.value}
            onClick={() => {
              handleInputChange('referralSource', option.value);
              // Reset selectedReferralId when changing main referral
              if (option.value === 'Direct') {
                handleInputChange('selectedReferralId', '');
                setFormData(prev => ({
                  ...prev,
                  referralDetails: { sourceName: '', contactNumber: '', hospital: '', specialization: '' }
                }));
              }
            }}
            className={cn(
              'p-3 border rounded-lg cursor-pointer transition-colors',
              formData.referralSource === option.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm" style={{ color: '#0A0A0A' }}>
                  {option.value}
                </div>
                <div className="text-xs" style={{ color: '#4A5565' }}>
                  {option.description}
                </div>
              </div>
              {formData.referralSource === option.value && (
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Referral Details dropdown when "Doctor Referral" is selected */}
        {formData.referralSource === 'Doctor Referral' && (
          <div className="mt-4">
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
              Select Doctor Referral
            </label>
            <CustomDropdown
              options={referralDoctors.map(d => ({ value: d.id || '', label: d.name }))}
              value={formData.selectedReferralId}
              onChange={(value) => {
                handleInputChange('selectedReferralId', value);
                const selectedDoctor = referralDoctors.find(d => d.id === value);
                if (selectedDoctor) {
                  setFormData(prev => ({
                    ...prev,
                    referralDetails: {
                      sourceName: selectedDoctor.name,
                      contactNumber: selectedDoctor.phoneNumber,
                      hospital: selectedDoctor.facilityName || '',
                      specialization: selectedDoctor.specialization || ''
                    }
                  }));
                } else {
                  setFormData(prev => ({
                    ...prev,
                    referralDetails: { sourceName: '', contactNumber: '', hospital: '', specialization: '' }
                  }));
                }
              }}
              placeholder="Select doctor referral source"
              aria-label="Doctor referral source"
            />
            
            {/* Display doctor notes when a doctor is selected */}
            {formData.selectedReferralId && (() => {
              const selectedDoctor = referralDoctors.find(d => d.id === formData.selectedReferralId);
              return selectedDoctor?.notes ? (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="text-xs font-medium text-blue-900 mb-1">Doctor Notes:</div>
                      <div className="text-xs text-blue-800">{selectedDoctor.notes}</div>
                    </div>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}

        {/* Commented out custom referral source creation - not needed right now */}
        {/* 
        {formData.referralSource === 'Doctor Referral' && !formData.selectedReferralId && (
          <div className="mt-4">
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
              Custom Referral Details
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
                  Source Name *
                </label>
                <input
                  type="text"
                  id="customSourceName"
                  value={formData.referralDetails.sourceName}
                  onChange={(e) => updateReferralDetails('sourceName', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
                  placeholder="e.g., Dr. Smith"
                  aria-label="Custom source name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
                  Contact Number *
                </label>
                <input
                  type="tel"
                  id="customContactNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => updateReferralDetails('contactNumber', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
                  placeholder="e.g., 9876543210"
                  aria-label="Custom contact number"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
                  Hospital (if applicable)
                </label>
                <input
                  type="text"
                  id="customHospital"
                  value={formData.referralDetails.hospital}
                  onChange={(e) => updateReferralDetails('hospital', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
                  placeholder="e.g., ABC Hospital"
                  aria-label="Custom hospital"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
                  Specialization (if applicable)
                </label>
                <input
                  type="text"
                  id="customSpecialization"
                  value={formData.referralDetails.specialization}
                  onChange={(e) => updateReferralDetails('specialization', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
                  placeholder="e.g., ENT Specialist"
                  aria-label="Custom specialization"
                />
              </div>
            </div>
          </div>
        )}
        */}
      </div>
    </div>
  );

  const renderStage5 = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: '#101828' }}>Date, Time & Duration</h2>
          <p className="text-xs" style={{ color: '#4A5565' }}>Select the preferred date, time slot and duration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
            Appointment Date *
          </label>
          <DatePicker
            value={formData.appointmentDate}
            onChange={(date) => handleInputChange('appointmentDate', date)}
            placeholder="Select appointment date"
            minDate={new Date()} // Can't select past dates for appointments
            required
            aria-label="Appointment date"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
            Duration *
          </label>
          <div className="relative">
            <input
              type="number"
              id="duration"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm pr-10"
              style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
              placeholder="30"
              aria-label="Duration"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
          Available Time Slots *
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', 
            '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
            '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
            '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM'
          ].map((timeSlot) => (
            <button
              key={timeSlot}
              type="button"
              onClick={() => handleInputChange('appointmentTime', timeSlot)}
              className={cn(
                'px-3 py-2 rounded-lg border text-sm transition-all duration-200',
                formData.appointmentTime === timeSlot
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
              )}
            >
              {timeSlot}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 flex items-center space-x-2">
        <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-xs" style={{ color: '#0A0A0A' }}>Duration is customizable. Standard appointments are 30 minutes.</span>
      </div>
    </div>
  );

  const renderStage6 = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: '#101828' }}>Select Procedures</h2>
          <p className="text-xs" style={{ color: '#4A5565' }}>Choose the procedures and diagnostic tests needed</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
            Select Procedures/Diagnostics (Optional)
          </label>
          {totalProcedureDuration > 0 && (
            <div className="text-sm font-medium text-blue-600">
              Total: {totalProcedureDuration} minutes
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {diagnostics.map((diagnostic) => {
            const isSelected = selectedProcedureIds.includes(diagnostic.id);
            const specialType = isSpecialDiagnostic(diagnostic.name);
            return (
              <div
                key={diagnostic.id}
                onClick={() => {
                  const updatedIds = isSelected 
                    ? selectedProcedureIds.filter(procId => procId !== diagnostic.id)
                    : [...selectedProcedureIds, diagnostic.id];
                  setSelectedProcedureIds(updatedIds);
                  

                  // Calculate total duration (30 minutes per procedure as default)
                  const totalDuration = updatedIds.reduce((sum) => {
                    return sum + 30; // Default 30 minutes per procedure
                  }, 0);
                  setTotalProcedureDuration(totalDuration);
                  
                  // Update form data
                  const selectedNames = updatedIds.map(id => 
                    diagnostics.find(d => d.id === id)?.name
                  ).filter(Boolean).join(', ');
                  handleInputChange('selectedProcedures', selectedNames);
                  handleInputChange('duration', totalDuration.toString() || '30');
                }}
                className={cn(
                  'p-3 rounded-lg border cursor-pointer transition-all duration-200',
                  isSelected
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-gray-200 hover:border-gray-300',
                  specialType && 'ring-2 ring-orange-200 border-orange-300'
                )}
              >
                <div className="flex items-start space-x-3">
                  <div className={cn(
                    'w-4 h-4 border-2 mt-0.5 flex-shrink-0 flex items-center justify-center',
                    isSelected
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300 bg-white'
                  )}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-sm" style={{ color: '#0A0A0A' }}>
                        {diagnostic.name}
                        {specialType && (
                          <span className="ml-2 text-xs font-medium px-2 py-1 bg-orange-100 text-orange-700 rounded">
                            {specialType}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-medium px-2 py-1 bg-gray-100 rounded" style={{ color: '#717182' }}>
                        30 min
                      </div>
                    </div>
                    <div className="text-xs" style={{ color: '#717182' }}>{diagnostic.description}</div>
                    {specialType && (
                      <div className="text-xs text-orange-600 mt-1 font-medium">
                        {specialType === 'HAT' ? 'Shows HAT form in patient profile' : 'Shows OAE form in patient profile'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderStage7 = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: '#101828' }}>Confirmation</h2>
          <p className="text-xs" style={{ color: '#4A5565' }}>Review and confirm all appointment details</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-4">
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h3 className="font-semibold text-sm" style={{ color: '#0A0A0A' }}>Appointment Summary</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2 text-sm" style={{ color: '#0A0A0A' }}>Patient Information</h4>
            <div className="space-y-1 text-xs" style={{ color: '#717182' }}>
              <p><strong>Name:</strong> {formData.fullName || 'Not provided'}</p>
              <p><strong>Phone:</strong> {formData.phoneNumber || 'Not provided'}</p>
              <p><strong>Email:</strong> {formData.email || 'Not provided'}</p>
              <p><strong>Classification:</strong> {formData.customerType}</p>
              {formData.customerType === 'B2B' && formData.hospitalName && (
                <p><strong>Hospital:</strong> {formData.hospitalName}</p>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2 text-sm" style={{ color: '#0A0A0A' }}>Appointment Details</h4>
            <div className="space-y-1 text-xs" style={{ color: '#717182' }}>
              <p><strong>Audiologist:</strong> {audiologists.find(a => a.id === formData.selectedAudiologist)?.name || formData.selectedAudiologist}</p>
              <p><strong>Date:</strong> {formData.appointmentDate ? new Date(formData.appointmentDate).toLocaleDateString('en-GB') : 'Not selected'}</p>
              <p><strong>Time:</strong> {formData.appointmentTime || 'Not selected'}</p>
              <p><strong>Duration:</strong> {formData.duration} minutes</p>
              <p><strong>Referral Source:</strong> {formData.referralSource || 'Not selected'}{formData.referralSource === 'Direct' && formData.directSource ? ` (${formData.directSource})` : ''}</p>
            </div>
          </div>
          
          {selectedProcedureIds.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-sm" style={{ color: '#0A0A0A' }}>Selected Procedures</h4>
              <div className="space-y-1 text-xs" style={{ color: '#717182' }}>
                {selectedProcedureIds.map((diagnosticId) => {
                  const diagnostic = diagnostics.find(d => d.id === diagnosticId);
                  const specialType = diagnostic ? isSpecialDiagnostic(diagnostic.name) : null;
                  return diagnostic ? (
                    <div key={diagnosticId} className="flex items-center space-x-2">
                      <p>• {diagnostic.name} (30 min)</p>
                      {specialType && (
                        <span className="text-xs font-medium px-2 py-1 bg-orange-100 text-orange-700 rounded">
                          {specialType}
                        </span>
                      )}
                    </div>
                  ) : null;
                })}
                <p className="font-medium text-blue-600 mt-2">
                  Total Duration: {totalProcedureDuration} minutes
                </p>
              </div>
            </div>
          )}
          
          {formData.notes && (
            <div>
              <h4 className="font-semibold mb-2 text-sm" style={{ color: '#0A0A0A' }}>Notes</h4>
              <p className="text-xs" style={{ color: '#717182' }}>{formData.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );



  const renderStage8 = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: '#101828' }}>Additional Notes</h2>
          <p className="text-xs" style={{ color: '#4A5565' }}>Add any special instructions or notes for this appointment</p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-medium mb-1.5" style={{ color: '#0A0A0A' }}>
          Appointment Notes (Optional)
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={4}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
          style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
          placeholder="Add any special instructions or notes for this appointment..."
          aria-label="Appointment notes"
        />
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
      case 8: return renderStage8();
      default: return renderStage1();
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto border-2 shadow-lg">
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

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          )}

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
              disabled={isSubmitting || (currentStage === 1 && userLookupLoading) || !isCurrentStageValid()}
              className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {(isSubmitting || (currentStage === 1 && userLookupLoading)) && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>
                {currentStage === 7 ? (isSubmitting ? 'Creating...' : 'Confirm Appointment') : 
                 (currentStage === 1 && userLookupLoading ? 'Looking up...' : 'Continue')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalkInAppointmentModal;


