'use client';

import React, { useState } from 'react';
import { cn } from '@/utils';

interface AddDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (doctorData: DoctorData) => void;
}

interface DoctorData {
  fullName: string;
  email: string;
  hospitalClinic: string;
  specialization: string;
  phone: string;
  bdmContact: string;
  location: string;
  bdmName: string;
  commissionRate: string;
}

const specializations = [
  'ENT (Otolaryngology)',
  'Neurology',
  'Family Medicine',
  'Pediatrics',
  'Internal Medicine',
  'Cardiology',
  'Orthopedics',
  'Dermatology',
  'Ophthalmology',
  'General Practice'
];

export default function AddDoctorModal({ isOpen, onClose, onSubmit }: AddDoctorModalProps) {
  const [formData, setFormData] = useState<DoctorData>({
    fullName: '',
    email: '',
    hospitalClinic: '',
    specialization: '',
    phone: '',
    bdmContact: '',
    location: '',
    bdmName: '',
    commissionRate: ''
  });

  const [errors, setErrors] = useState<Partial<DoctorData>>({});

  const handleInputChange = (field: keyof DoctorData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<DoctorData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.hospitalClinic.trim()) {
      newErrors.hospitalClinic = 'Hospital/Clinic is required';
    }
    if (!formData.specialization) {
      newErrors.specialization = 'Specialization is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    if (!formData.bdmContact.trim()) {
      newErrors.bdmContact = 'BDM Contact is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.bdmName.trim()) {
      newErrors.bdmName = 'BDM Name is required';
    }
    if (!formData.commissionRate.trim()) {
      newErrors.commissionRate = 'Commission rate is required';
    } else {
      const rate = parseFloat(formData.commissionRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        newErrors.commissionRate = 'Commission rate must be between 0 and 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        hospitalClinic: '',
        specialization: '',
        phone: '',
        bdmContact: '',
        location: '',
        bdmName: '',
        commissionRate: ''
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
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Dr. John Smith"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    errors.fullName ? "border-red-300" : "border-gray-300",
                    "bg-gray-50"
                  )}
                  style={{ color: '#101828' }}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Hospital/Clinic */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#101828' }}>
                  Hospital/Clinic *
                </label>
                <input
                  type="text"
                  placeholder="e.g., City General Hospital"
                  value={formData.hospitalClinic}
                  onChange={(e) => handleInputChange('hospitalClinic', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    errors.hospitalClinic ? "border-red-300" : "border-gray-300",
                    "bg-gray-50"
                  )}
                  style={{ color: '#101828' }}
                />
                {errors.hospitalClinic && (
                  <p className="text-red-500 text-xs mt-1">{errors.hospitalClinic}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#101828' }}>
                  Phone *
                </label>
                <input
                  type="tel"
                  placeholder="e.g., +91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    errors.phone ? "border-red-300" : "border-gray-300",
                    "bg-gray-50"
                  )}
                  style={{ color: '#101828' }}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#101828' }}>
                  Location *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Mumbai, Maharashtra"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    errors.location ? "border-red-300" : "border-gray-300",
                    "bg-gray-50"
                  )}
                  style={{ color: '#101828' }}
                />
                {errors.location && (
                  <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                )}
              </div>

              {/* BDM Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#101828' }}>
                  BDM Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Sarah Johnson"
                  value={formData.bdmName}
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

              {/* Commission Rate */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#101828' }}>
                  Commission Rate (%) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="e.g., 10.5"
                  value={formData.commissionRate}
                  onChange={(e) => handleInputChange('commissionRate', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    errors.commissionRate ? "border-red-300" : "border-gray-300",
                    "bg-gray-50"
                  )}
                  style={{ color: '#101828' }}
                />
                <p className="text-xs mt-1" style={{ color: '#717182' }}>
                  Percentage commission rate for referrals (0-100%)
                </p>
                {errors.commissionRate && (
                  <p className="text-red-500 text-xs mt-1">{errors.commissionRate}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#101828' }}>
                  Email *
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
                  Specialization *
                </label>
                <select
                  value={formData.specialization}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                    errors.specialization ? "border-red-300" : "border-gray-300",
                    "bg-gray-50"
                  )}
                  style={{ color: formData.specialization ? '#101828' : '#717182' }}
                  aria-label="Select doctor specialization"
                >
                  <option value="">Select specialization</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
                {errors.specialization && (
                  <p className="text-red-500 text-xs mt-1">{errors.specialization}</p>
                )}
              </div>

              {/* BDM Contact */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#101828' }}>
                  BDM Contact *
                </label>
                <input
                  type="tel"
                  placeholder="e.g., +91 87654 32109"
                  value={formData.bdmContact}
                  onChange={(e) => handleInputChange('bdmContact', e.target.value)}
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
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
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
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Add Doctor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
