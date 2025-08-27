'use client';

import { useState } from 'react';
import { CreatePatientData } from '@/types';
import { patientService } from '@/services/patientService';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddPatientModal({ isOpen, onClose, onSuccess }: AddPatientModalProps) {
  const [formData, setFormData] = useState<CreatePatientData>({
    full_name: '',
    mobile_number: '',
    email_address: '',
    dob: '',
    gender: 'Male',
    occupation: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof CreatePatientData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.full_name.trim()) {
      setError('Full name is required');
      return;
    }
    if (!formData.mobile_number.trim()) {
      setError('Mobile number is required');
      return;
    }
    if (!formData.email_address.trim()) {
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
    if (!formData.address.trim()) {
      setError('Address is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await patientService.createPatient(formData);
      
      // Reset form
      setFormData({
        full_name: '',
        mobile_number: '',
        email_address: '',
        dob: '',
        gender: 'Male',
        occupation: '',
        address: ''
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
        full_name: '',
        mobile_number: '',
        email_address: '',
        dob: '',
        gender: 'Male',
        occupation: '',
        address: ''
      });
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
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
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    disabled={loading}
                    required
                    title="Select date of birth"
                    placeholder="Select date of birth"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#0A0A0A' }}>
                    Gender *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value as 'Male' | 'Female')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    disabled={loading}
                    required
                    title="Select gender"
                    aria-label="Select gender"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
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
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile_number}
                    onChange={(e) => handleInputChange('mobile_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter mobile number"
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
                    value={formData.email_address}
                    onChange={(e) => handleInputChange('email_address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter email address"
                    disabled={loading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#0A0A0A' }}>
                    Address *
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter address"
                    rows={3}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
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
