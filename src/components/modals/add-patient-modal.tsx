/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { CreateUserData } from '@/types';
import { patientService } from '@/services/patientService';
import CustomDropdown from '@/components/ui/custom-dropdown';
import DatePicker from '@/components/ui/date-picker';
import { useAuth } from '@/contexts/AuthContext';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddPatientModal({ isOpen, onClose, onSuccess }: AddPatientModalProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState<CreateUserData>({
    fullname: '',
    email: '', // Initialize as empty string
    countrycode: '+91',
    phoneNumber: '',
    dob: '',
    gender: 'Male',
    occupation: '',
    customerType: 'B2C',
    alternateNumber: '', // Initialize as empty string
    hospitalName: '', // Initialize as empty string
    opipNumber: '' // Initialize as empty string
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof CreateUserData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value // Keep as string, don't convert to null
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullname.trim() || !formData.phoneNumber.trim() || !formData.gender) {
      setError('Please fill in all required fields (Name, Phone Number, and Gender)');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Prepare user data, only including fields that have values
      const userData: any = {
        fullname: formData.fullname,
        countrycode: formData.countrycode,
        phoneNumber: formData.phoneNumber,
        dob: formData.dob,
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
      
      const response = await patientService.createUser(userData, token || undefined);
      
      if (response.status === 'success') {
        // Call the callback with the created patient
        if (onSuccess) {
          onSuccess();
        }

        // Close modal and reset form
        handleClose();
      } else {
        setError('Failed to create patient. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create patient. Please try again.');
      console.error('Error creating patient:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        fullname: '',
        email: '',
        countrycode: '+91',
        phoneNumber: '',
        dob: '',
        gender: 'Male',
        occupation: '',
        customerType: 'B2C',
        alternateNumber: '',
        hospitalName: '',
        opipNumber: ''
      });
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide border-2  shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold" style={{ color: '#101828' }}>Add New Patient</h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Close modal"
              title="Close modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-xs">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold" style={{ color: '#0A0A0A' }}>Personal Information</h3>
                
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#0A0A0A' }}>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullname}
                    onChange={(e) => handleInputChange('fullname', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter full name"
                    disabled={loading}
                    required
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <DatePicker
                    value={formData.dob}
                    onChange={(date) => setFormData(prev => ({ ...prev, dob: date }))}
                    placeholder="Select date of birth..."
                    context="dob"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#0A0A0A' }}>
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <CustomDropdown
                    options={[
                      { value: 'Male', label: 'Male' },
                      { value: 'Female', label: 'Female' },
                      { value: 'Other', label: 'Other' }
                    ]}
                    value={formData.gender}
                    onChange={(value) => handleInputChange('gender', value as 'Male' | 'Female')}
                    placeholder="Select gender"
                    disabled={loading}
                    aria-label="Select gender"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#0A0A0A' }}>
                    Occupation
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter occupation"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-semibold" style={{ color: '#0A0A0A' }}>Contact Information</h3>
                
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#0A0A0A' }}>
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter phone number"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#0A0A0A' }}>
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter email address (optional)"
                    disabled={loading}
                  />
                </div>

                                        <div>
                          <label className="block text-xs font-medium mb-1" style={{ color: '#0A0A0A' }}>
                            Country Code <span className="text-red-500">*</span>
                          </label>
                          <CustomDropdown
                            options={[
                              { value: '+91', label: '+91 (India)' }
                            ]}
                            value={formData.countrycode}
                            onChange={(value) => handleInputChange('countrycode', value)}
                            placeholder="Select country code"
                            disabled={loading}
                            aria-label="Select country code"
                          />
                        </div>

                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#0A0A0A' }}>
                    Customer Type <span className="text-red-500">*</span>
                  </label>
                  <CustomDropdown
                    options={[
                      { value: 'B2C', label: 'B2C' },
                      { value: 'B2B', label: 'B2B' }
                    ]}
                    value={formData.customerType}
                    onChange={(value) => handleInputChange('customerType', value)}
                    placeholder="Select customer type"
                    disabled={loading}
                    aria-label="Select customer type"
                  />
                </div>

                {/* Hospital Name field - only show for B2B patients */}
                {formData.customerType === 'B2B' && (
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#0A0A0A' }}>
                      Hospital Name
                    </label>
                    <input
                      type="text"
                      value={formData.hospitalName || ''}
                      onChange={(e) => handleInputChange('hospitalName', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter hospital name"
                      disabled={loading}
                    />
                  </div>
                )}

                {/* OP/IP Number field - only show for B2B patients */}
                {formData.customerType === 'B2B' && (
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#0A0A0A' }}>
                      OP/IP/UHID Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.opipNumber || ''}
                      onChange={(e) => handleInputChange('opipNumber', e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter OP/IP/UHID number (can be added later)"
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">Can be added later to complete profile</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#0A0A0A' }}>
                    Alternate Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.alternateNumber || ''}
                    onChange={(e) => handleInputChange('alternateNumber', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter alternate number (optional)"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-xs text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-xs bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{loading ? 'Creating...' : 'Create Patient'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
