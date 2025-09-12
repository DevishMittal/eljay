/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { CreateDiagnosticAppointmentData } from '@/types';
import CustomDropdown from '@/components/ui/custom-dropdown';
import DatePicker from '@/components/ui/date-picker';
import { diagnosticAppointmentsService } from '@/services/diagnosticAppointmentsService';
import { appointmentService } from '@/services/appointmentService';
import { useAuth } from '@/contexts/AuthContext';
import { Audiologist, Procedure, Doctor } from '@/types';

interface CreateDiagnosticPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (appointment: { status: string; data: any }) => void;
  patientId: string;
}

type FormStage = 1 | 2 | 3 | 4 | 5;

interface FormData {
  selectedAudiologist: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentDuration: string;
  procedures: string;
  referralSource: string;
  referralDetails: {
    sourceName: string;
    contactNumber: string;
    hospital: string;
    specialization: string;
  };
  selectedReferralId: string;
  notes: string;
}

export default function CreateDiagnosticPlanModal({
  isOpen,
  onClose,
  onSuccess,
  patientId
}: CreateDiagnosticPlanModalProps) {
  const { token } = useAuth();
  const [currentStage, setCurrentStage] = useState<FormStage>(1);
  const [formData, setFormData] = useState<FormData>({
    selectedAudiologist: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentDuration: '30',
    procedures: '',
    referralSource: 'Direct',
    referralDetails: {
      sourceName: '',
      contactNumber: '',
      hospital: '',
      specialization: ''
    },
    selectedReferralId: '',
    notes: ''
  });

  // API data states
  const [audiologists, setAudiologists] = useState<Audiologist[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [referralDoctors, setReferralDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProcedureIds, setSelectedProcedureIds] = useState<string[]>([]);
  const [totalProcedureDuration, setTotalProcedureDuration] = useState(0);

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

  // Load procedures from API
  const loadProcedures = useCallback(async () => {
    try {
      const response = await appointmentService.getProcedures(token || undefined);
      setProcedures(response.data);
    } catch (error) {
      console.error('Error loading procedures:', error);
    }
  }, [token]);

  // Load referral doctors from API - using a mock for now since getDoctors doesn't exist
  const loadReferralDoctors = useCallback(async () => {
    try {
      // Mock data for now - replace with actual API call when available
      const mockDoctors: Doctor[] = [
        {
          id: '1',
          name: 'Dr. John Smith',
          email: 'john.smith@example.com',
          countrycode: '+91',
          phoneNumber: '9876543210',
          specialization: 'ENT',
          qualification: 'MD',
          bdmName: 'John BDM',
          bdmContact: '9876543210',
          commissionRate: 10,
          facilityName: 'City Hospital',
          location: 'Mumbai',
          organizationId: 'org-1',
          isAvailable: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          appointments: []
        },
        {
          id: '2',
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@example.com',
          countrycode: '+91',
          phoneNumber: '9876543211',
          specialization: 'General Medicine',
          qualification: 'MD',
          bdmName: 'Sarah BDM',
          bdmContact: '9876543211',
          commissionRate: 12,
          facilityName: 'General Hospital',
          location: 'Delhi',
          organizationId: 'org-1',
          isAvailable: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          appointments: []
        }
      ];
      setReferralDoctors(mockDoctors);
    } catch (error) {
      console.error('Error loading referral doctors:', error);
    }
  }, []);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStage(1);
      setFormData({
        selectedAudiologist: '',
        appointmentDate: '',
        appointmentTime: '',
        appointmentDuration: '30',
        procedures: '',
        referralSource: 'Direct',
        referralDetails: {
          sourceName: '',
          contactNumber: '',
          hospital: '',
          specialization: ''
        },
        selectedReferralId: '',
        notes: ''
      });
      setSelectedProcedureIds([]);
      setTotalProcedureDuration(0);
      
      // Load data
      loadAudiologists();
      loadProcedures();
      loadReferralDoctors();
    }
  }, [isOpen, loadAudiologists, loadProcedures, loadReferralDoctors]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStage < 5) {
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

    setLoading(true);
    try {
      // Calculate total cost from selected procedures
      const totalCost = selectedProcedureIds.reduce((sum, procedureId) => {
        const procedure = procedures.find(p => p.id === procedureId);
        return sum + (procedure?.price || 0);
      }, 0);

      // Create diagnostic appointment
      const appointmentData: CreateDiagnosticAppointmentData = {
        userId: patientId,
        audiologistId: formData.selectedAudiologist,
        appointmentDate: formData.appointmentDate,
        appointmentTime: appointmentService.convertTo24Hour(formData.appointmentTime),
        appointmentDuration: totalProcedureDuration > 0 ? totalProcedureDuration : parseInt(formData.appointmentDuration),
        procedures: formData.procedures || 'General Diagnostic',
        cost: totalCost,
        status: 'planned'
        
      };

      const response = await diagnosticAppointmentsService.createDiagnosticAppointment(
        appointmentData, 
        token || undefined
      );

      onSuccess({ status: 'success', data: response });
      onClose();
    } catch (error) {
      console.error('Error creating diagnostic appointment:', error);
      alert('Failed to create diagnostic plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (currentStage === 1) {
      if (!formData.selectedAudiologist) {
        alert('Please select an audiologist.');
        return false;
      }
    }
    if (currentStage === 2) {
      if (!formData.referralSource) {
        alert('Please select how the patient was referred.');
        return false;
      }
      if (formData.referralSource === 'Doctor Referral' && !formData.selectedReferralId && !formData.referralDetails.sourceName) {
        alert('Please provide referral doctor information.');
        return false;
      }
    }
    if (currentStage === 3) {
      if (!formData.appointmentDate) {
        alert('Please select appointment date.');
        return false;
      }
      if (!formData.appointmentTime) {
        alert('Please select appointment time.');
        return false;
      }
      if (!formData.appointmentDuration) {
        alert('Please select appointment duration.');
        return false;
      }
    }
    if (currentStage === 4) {
      if (!formData.procedures) {
        alert('Please select at least one procedure.');
        return false;
      }
    }
    if (currentStage === 5) {
      // Stage 5 is confirmation - no validation needed
      return true;
    }
    return true;
  };

  if (!isOpen) return null;

  const renderProgressBar = () => {
    return (
      <div className="flex space-x-1 mb-6">
        {[1, 2, 3, 4, 5].map((stage) => (
          <div
            key={stage}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              stage <= currentStage ? 'bg-blue-600' : 'bg-gray-200'
            }`}
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Select Audiologist</h2>
          <p className="text-xs text-gray-600">Choose an available audiologist for the diagnostic plan</p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Select Available Audiologist *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {audiologists.map((audiologist) => (
            <div
              key={audiologist.id}
              onClick={() => handleInputChange('selectedAudiologist', audiologist.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                formData.selectedAudiologist === audiologist.id
                  ? 'bg-gray-100 border-gray-300'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-gray-900">{audiologist.name}</div>
                  <div className="text-xs text-gray-600">
                    {audiologist.isAvailable ? 'Available' : 'Not Available'}
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  formData.selectedAudiologist === audiologist.id
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-300'
                }`}>
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

  const renderStage2 = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Referral Source</h2>
          <p className="text-xs text-gray-600">Select how the patient was referred to the clinic</p>
        </div>
      </div>

      <div className="space-y-3">
        {[
          { value: 'Direct', description: 'Patient came directly' },
          { value: 'Doctor Referral', description: 'Referred by a medical professional' },
          { value: 'Hear.com', description: 'Referred through Hear.com' }
        ].map((option) => (
          <div
            key={option.value}
            onClick={() => {
              handleInputChange('referralSource', option.value);
              if (option.value === 'Direct') {
                handleInputChange('selectedReferralId', '');
                setFormData(prev => ({
                  ...prev,
                  referralDetails: { sourceName: '', contactNumber: '', hospital: '', specialization: '' }
                }));
              }
            }}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              formData.referralSource === option.value
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm text-gray-900">
                  {option.value}
                </div>
                <div className="text-xs text-gray-600">
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

        {formData.referralSource === 'Doctor Referral' && (
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
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
                }
              }}
              placeholder="Select doctor referral source"
            />
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Date, Time & Duration</h2>
          <p className="text-xs text-gray-600">Select the preferred date, time slot and duration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Appointment Date *
          </label>
          <DatePicker
            value={formData.appointmentDate}
            onChange={(date) => handleInputChange('appointmentDate', date)}
            placeholder="Select appointment date"
            minDate={new Date()}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Duration *
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.appointmentDuration}
              onChange={(e) => handleInputChange('appointmentDuration', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm pr-10"
              placeholder="30"
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
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
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
              className={`px-3 py-2 rounded-lg border text-sm transition-all duration-200 ${
                formData.appointmentTime === timeSlot
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {timeSlot}
            </button>
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Select Procedures</h2>
          <p className="text-xs text-gray-600">Choose the procedures and diagnostic tests needed</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Select Procedures/Diagnostics *
          </label>
          {totalProcedureDuration > 0 && (
            <div className="text-sm font-medium text-blue-600">
              Total: {totalProcedureDuration} minutes
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {procedures.map((procedure) => {
            const isSelected = selectedProcedureIds.includes(procedure.id);
            return (
              <div
                key={procedure.id}
                onClick={() => {
                  const updatedIds = isSelected 
                    ? selectedProcedureIds.filter(id => id !== procedure.id)
                    : [...selectedProcedureIds, procedure.id];
                  setSelectedProcedureIds(updatedIds);
                  
                  // Calculate total duration
                  const totalDuration = updatedIds.reduce((sum, id) => {
                    return sum + 30; // Default 30 minutes per procedure
                  }, 0);
                  setTotalProcedureDuration(totalDuration);
                  
                  // Update form data
                  const selectedNames = updatedIds.map(id => 
                    procedures.find(p => p.id === id)?.name
                  ).filter(Boolean).join(', ');
                  handleInputChange('procedures', selectedNames);
                  handleInputChange('appointmentDuration', totalDuration.toString() || '30');
                }}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-4 h-4 rounded border-2 mt-0.5 flex-shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <svg className="w-2.5 h-2.5 text-white m-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-sm text-gray-900">{procedure.name}</div>
                      <div className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-700">
                        30 min
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">{procedure.description}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderStage5 = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Confirmation</h2>
          <p className="text-xs text-gray-600">Review and confirm all diagnostic plan details</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-4">
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h3 className="font-semibold text-sm text-gray-900">Diagnostic Plan Summary</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2 text-sm text-gray-900">Appointment Details</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <p><strong>Audiologist:</strong> {audiologists.find(a => a.id === formData.selectedAudiologist)?.name || 'Not selected'}</p>
              <p><strong>Date:</strong> {formData.appointmentDate ? new Date(formData.appointmentDate).toLocaleDateString('en-GB') : 'Not selected'}</p>
              <p><strong>Time:</strong> {formData.appointmentTime || 'Not selected'}</p>
              <p><strong>Duration:</strong> {totalProcedureDuration > 0 ? totalProcedureDuration : formData.appointmentDuration} minutes</p>
              <p><strong>Referral Source:</strong> {formData.referralSource || 'Not selected'}</p>
            </div>
          </div>
          
          {selectedProcedureIds.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-sm text-gray-900">Selected Procedures</h4>
              <div className="space-y-1 text-xs text-gray-600">
                {selectedProcedureIds.map((procedureId) => {
                  const procedure = procedures.find(p => p.id === procedureId);
                  return procedure ? (
                    <p key={procedureId}>• {procedure.name} (30 min)</p>
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
              <h4 className="font-semibold mb-2 text-sm text-gray-900">Notes</h4>
              <p className="text-xs text-gray-600">{formData.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-medium text-gray-700 mb-1.5">
          Additional Notes (Optional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
          placeholder="Add any special instructions or notes for this diagnostic plan..."
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
      default: return renderStage1();
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 shadow-lg">
        <div className="flex items-center justify-between mb-6 p-6">
          <h2 className="text-xl font-semibold text-gray-900">Create Diagnostic Plan</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6">
          {renderProgressBar()}
        </div>

        {/* Form Content */}
        <div className="mb-6 px-6">
          {renderCurrentStage()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between px-6 pb-6">
          <button
            onClick={handleBack}
            disabled={currentStage === 1}
            className={`px-6 py-2 rounded-lg border transition-colors ${
              currentStage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Back
          </button>
          <button
            onClick={currentStage === 5 ? handleSubmit : handleNext}
            disabled={loading}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>
              {currentStage === 5 ? (loading ? 'Creating...' : 'Create Plan') : 'Continue'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
