'use client';

import { useState } from 'react';
import { CreateUserData } from '@/types';
import { patientService } from '@/services/patientService';
import CustomDropdown from '@/components/ui/custom-dropdown';
import DatePicker from '@/components/ui/date-picker';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddPatientModal({ isOpen, onClose, onSuccess }: AddPatientModalProps) {
  const [formData, setFormData] = useState<CreateUserData>({
    fullname: '',
    email: '',
    countrycode: '+82',
    phoneNumber: '',
    dob: '',
    gender: 'Male',
    occupation: '',
    customerType: 'B2C',
    alternateNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof CreateUserData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullname.trim()) {
      setError('Full name is required');
      return;
    }
    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email address is required');
      return;
    }
    if (!formData.dob) {
      setError('Date of birth is required');
      return;
    }
    if (!formData.occupation.trim()) {
      setError('Occupation is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await patientService.createUser(formData);
      
      // Reset form
      setFormData({
        fullname: '',
        email: '',
        countrycode: '+82',
        phoneNumber: '',
        dob: '',
        gender: 'Male',
        occupation: '',
        customerType: 'B2C',
        alternateNumber: ''
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to create patient. Please try again.');
      console.error('Error creating patient:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        fullname: '',
        email: '',
        countrycode: '+82',
        phoneNumber: '',
        dob: '',
        gender: 'Male',
        occupation: '',
        customerType: 'B2C',
        alternateNumber: ''
      });
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2  shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ color: '#101828' }}>Add New Patient</h2>
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
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold" style={{ color: '#0A0A0A' }}>Personal Information</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#0A0A0A' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullname}
                    onChange={(e) => handleInputChange('fullname', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter full name"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#0A0A0A' }}>
                    Date of Birth *
                  </label>
                  <DatePicker
                    value={formData.dob}
                    onChange={(date) => handleInputChange('dob', date)}
                    placeholder="Select date of birth"
                    maxDate={new Date()} // Can't select future dates for DOB
                    disabled={loading}
                    required
                    aria-label="Date of birth"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#0A0A0A' }}>
                    Gender *
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
                  <label className="block text-sm font-medium mb-1" style={{ color: '#0A0A0A' }}>
                    Occupation *
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter occupation"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-semibold" style={{ color: '#0A0A0A' }}>Contact Information</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#0A0A0A' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter phone number"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#0A0A0A' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter email address"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#0A0A0A' }}>
                    Country Code *
                  </label>
                  <CustomDropdown
                    options={[
                      { value: '+91', label: '+91 (India)' },

                  
                   
                    ]}
                    value={formData.countrycode}
                    onChange={(value) => handleInputChange('countrycode', value)}
                    placeholder="Select country code"
                    disabled={loading}
                    aria-label="Select country code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#0A0A0A' }}>
                    Customer Type *
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

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#0A0A0A' }}>
                    Alternate Number
                  </label>
                  <input
                    type="tel"
                    value={formData.alternateNumber}
                    onChange={(e) => handleInputChange('alternateNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
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
