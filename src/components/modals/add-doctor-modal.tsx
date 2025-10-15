'use client';

import React, { useState } from 'react';
import { cn } from '@/utils';
import CustomDropdown from '@/components/ui/custom-dropdown';
import { CreateDoctorData } from '@/types';

interface AddDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (doctorData: CreateDoctorData) => void;
}

const specializations = [
  { value: 'ENT', label: 'ENT' },
  { value: 'Neurology', label: 'Neurology' },
  { value: 'Pediatrician', label: 'Pediatrician' },
  { value: 'General Medicine', label: 'General Medicine' },
  { value: 'Others', label: 'Others' }
];

export default function AddDoctorModal({ isOpen, onClose, onSubmit }: AddDoctorModalProps) {
  const [formData, setFormData] = useState<CreateDoctorData>({
    name: '',
    email: '',
    phoneNumber: '',
    countrycode: '+91',
    specialization: '',
    bdmContact: '',
    bdmName: '',
    commissionRate: 0,
    facilityName: '',
    notes: '',
    diagnosticProceduresCommission: '50',
    hearingAidsBelow15kCommission: '15',
    hearingAidsBetween15kAnd20kCommission: '20',
    hearingAidsAbove20kCommission: '25'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CreateDoctorData, value: string | number) => {
    // Handle phone number validation for exactly 10 digits
    if (field === 'phoneNumber' || field === 'bdmContact') {
      const numericValue = String(value).replace(/\D/g, ''); // Remove non-numeric characters
      if (numericValue.length <= 10) {
        setFormData(prev => ({ ...prev, [field]: numericValue }));
        // Clear error when user starts typing
        if (errors[field]) {
          setErrors(prev => ({ ...prev, [field]: '' }));
        }
      }
      return;
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.facilityName?.trim()) {
      newErrors.facilityName = 'Hospital/Clinic is required';
    }
    if (!formData.specialization) {
      newErrors.specialization = 'Specialization is required';
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone is required';
    }
    // BDM Contact is now optional
    // Location field removed - not in API
    if (!formData.bdmName?.trim()) {
      newErrors.bdmName = 'BDM Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Convert empty strings to undefined for optional fields (omit from API call)
      const submitData = {
        ...formData,
        bdmContact: formData.bdmContact?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        diagnosticProceduresCommission: formData.diagnosticProceduresCommission?.trim() || undefined,
        hearingAidsBelow15kCommission: formData.hearingAidsBelow15kCommission?.trim() || undefined,
        hearingAidsBetween15kAnd20kCommission: formData.hearingAidsBetween15kAnd20kCommission?.trim() || undefined,
        hearingAidsAbove20kCommission: formData.hearingAidsAbove20kCommission?.trim() || undefined
      };
      onSubmit(submitData);
      // Reset form
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        countrycode: '+91',
        specialization: '',
        bdmContact: '',
        bdmName: '',
        commissionRate: 0,
        facilityName: '',
        notes: '',
        diagnosticProceduresCommission: '50',
        hearingAidsBelow15kCommission: '15',
        hearingAidsBetween15kAnd20kCommission: '20',
        hearingAidsAbove20kCommission: '25'
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold" style={{ color: '#101828' }}>
              Add New Doctor
            </h2>
            <p className="text-sm mt-1" style={{ color: '#717182' }}>
              Add a new referring doctor to the system with their contact details and commission information.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#101828' }}>
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Dr. John Smith"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    errors.name ? "border-red-300" : "border-gray-300",
                    "bg-gray-50"
                  )}
                  style={{ color: '#101828' }}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Hospital/Clinic */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#101828' }}>
                  Hospital/Clinic <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., City General Hospital"
                  value={formData.facilityName || ''}
                  onChange={(e) => handleInputChange('facilityName', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    errors.facilityName ? "border-red-300" : "border-gray-300",
                    "bg-gray-50"
                  )}
                  style={{ color: '#101828' }}
                />
                {errors.facilityName && (
                  <p className="text-red-500 text-xs mt-1">{errors.facilityName}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#101828' }}>
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  maxLength={10}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    errors.phoneNumber ? "border-red-300" : "border-gray-300",
                    "bg-gray-50"
                  )}
                  style={{ color: '#101828' }}
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                )}
              </div>


              {/* BDM Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#101828' }}>
                  BDM Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Sarah Johnson"
                  value={formData.bdmName || ''}
                  onChange={(e) => handleInputChange('bdmName', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    errors.bdmName ? "border-red-300" : "border-gray-300",
                    "bg-gray-50"
                  )}
                  style={{ color: '#101828' }}
                />
                <p className="text-xs mt-1" style={{ color: '#717182' }}>
                  Business Development Manager assigned to this doctor
                </p>
                {errors.bdmName && (
                  <p className="text-red-500 text-xs mt-1">{errors.bdmName}</p>
                )}
              </div>

              {/* Commission Rate Fields Section */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="text-sm font-semibold mb-3" style={{ color: '#101828' }}>
                  Commission Rates
                </h3>
                
                {/* Diagnostic Commission Rate */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1" style={{ color: '#101828' }}>
                    Diagnostic Procedures Commission (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="50"
                    value={formData.diagnosticProceduresCommission || ''}
                    onChange={(e) => handleInputChange('diagnosticProceduresCommission', e.target.value)}
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                      "border-gray-300 bg-white"
                    )}
                    style={{ color: '#101828' }}
                  />
                  <p className="text-xs mt-1" style={{ color: '#717182' }}>
                    Default: 50%
                  </p>
                </div>

                {/* Hearing Aid Commission Rates */}
                <div className="space-y-3">
                  <p className="text-sm font-medium" style={{ color: '#101828' }}>
                    Hearing Aid Commission Rates
                  </p>
                  
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#101828' }}>
                      Below ₹15,000 (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="15"
                      value={formData.hearingAidsBelow15kCommission || ''}
                      onChange={(e) => handleInputChange('hearingAidsBelow15kCommission', e.target.value)}
                      className={cn(
                        "w-full px-2 py-1.5 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                        "border-gray-300 bg-white"
                      )}
                      style={{ color: '#101828' }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#101828' }}>
                      ₹15,000 - ₹20,000 (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="20"
                      value={formData.hearingAidsBetween15kAnd20kCommission || ''}
                      onChange={(e) => handleInputChange('hearingAidsBetween15kAnd20kCommission', e.target.value)}
                      className={cn(
                        "w-full px-2 py-1.5 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                        "border-gray-300 bg-white"
                      )}
                      style={{ color: '#101828' }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#101828' }}>
                      Above ₹20,000 (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="25"
                      value={formData.hearingAidsAbove20kCommission || ''}
                      onChange={(e) => handleInputChange('hearingAidsAbove20kCommission', e.target.value)}
                      className={cn(
                        "w-full px-2 py-1.5 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                        "border-gray-300 bg-white"
                      )}
                      style={{ color: '#101828' }}
                    />
                  </div>
                </div>

                <p className="text-xs mt-3" style={{ color: '#717182' }}>
                  You can set commission to 0 for specific cases by manual override
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#101828' }}>
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g., doctor@hospital.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    errors.email ? "border-red-300" : "border-gray-300",
                    "bg-gray-50"
                  )}
                  style={{ color: '#101828' }}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Specialization */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#101828' }}>
                  Specialization <span className="text-red-500">*</span>
                </label>
                <CustomDropdown
                  options={specializations}
                  value={formData.specialization}
                  onChange={(value) => handleInputChange('specialization', value)}
                  placeholder="Select specialization"
                  className={cn(
                    errors.specialization ? "border-red-300" : ""
                  )}
                  aria-label="Select doctor specialization"
                />
                {errors.specialization && (
                  <p className="text-red-500 text-xs mt-1">{errors.specialization}</p>
                )}
              </div>

              {/* BDM Contact */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#101828' }}>
                  BDM Contact (optional)
                </label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit BDM contact"
                  value={formData.bdmContact || ''}
                  onChange={(e) => handleInputChange('bdmContact', e.target.value)}
                  maxLength={10}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    errors.bdmContact ? "border-red-300" : "border-gray-300",
                    "bg-gray-50"
                  )}
                  style={{ color: '#101828' }}
                />
                {errors.bdmContact && (
                  <p className="text-red-500 text-xs mt-1">{errors.bdmContact}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#101828' }}>
                  Doctor Notes (optional)
                </label>
                <textarea
                  placeholder="Enter any notes about this doctor (optional)"
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical",
                    "border-gray-300 bg-gray-50"
                  )}
                  style={{ color: '#101828' }}
                />
                <p className="text-xs mt-1" style={{ color: '#717182' }}>
                  These notes will be displayed when selecting this doctor during appointment booking
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 !!border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              style={{ color: '#101828' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
            >
              Add Doctor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
