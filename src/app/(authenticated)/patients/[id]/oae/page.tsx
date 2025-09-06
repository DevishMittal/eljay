/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/main-layout';
import Link from 'next/link';
import { Volume2, User, Building, Calendar, CheckCircle, AlertCircle, Clock, Phone, FileText, Hospital, UserCheck } from 'lucide-react';
import { patientService } from '@/services/patientService';
import { oaeService, OAEForm, CreateOAEFormData } from '@/services/oaeService';
import { useAuth } from '@/contexts/AuthContext';
import { CustomDropdown } from '@/components/ui/custom-dropdown';

interface FormData {
  // Patient Information
  patientName: string;
  patientId: string;
  classification: string;
  babyDateOfBirth: string;
  babyGender: string;
  contactNumber: string;
  babyMotherName: string;
  opNumber: string;
  
  // Hospital & Medical Staff
  hospitalName: string;
  audiologistId: string;
  doctorName: string;
  
  // Test Session
  testDate: string;
  testReason: string;
  testResults: string;
  conductedBy: string;
  equipmentUsed: string;
  testNotes: string;
  sessionNumber: number;
  failedAttempts: number;
}

export default function OAEFormPage({ params }: { params: { id: string } }) {
  const { id: patientId } = params;
  const { token } = useAuth();
  const [, setPatient] = useState<any>(null);
  const [oaeForms, setOaeForms] = useState<OAEForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    patientName: '',
    patientId: '',
    classification: 'B2B',
    babyDateOfBirth: '',
    babyGender: '',
    contactNumber: '',
    babyMotherName: '',
    opNumber: '',
    hospitalName: 'Sunrise Hospital',
    audiologistId: '',
    doctorName: 'Dr. Emily Rodriguez',
    testDate: new Date().toISOString().split('T')[0],
    testReason: 'Initial Screening',
    testResults: '',
    conductedBy: 'Dr. Emily Rodriguez',
    equipmentUsed: 'OAE Screener - Model XYZ',
    testNotes: '',
    sessionNumber: 1,
    failedAttempts: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (patientId && token) {
        try {
          setLoading(true);
          setError(null);

          // Fetch patient data
          const patientResponse = await patientService.getPatientById(patientId, token);
          setPatient(patientResponse.patient);

          // Fetch OAE forms for this patient
          const oaeResponse = await oaeService.getOAEFormsByPatient(patientId, token);
          setOaeForms(oaeResponse.oaeForms);

          // Set form data from patient
          setFormData(prev => ({
            ...prev,
            patientName: patientResponse.patient.full_name,
            patientId: patientResponse.patient.id,
            babyMotherName: patientResponse.patient.full_name,
            babyGender: patientResponse.patient.gender || '',
            contactNumber: patientResponse.patient.mobile_number || '',
            classification: patientResponse.patient.type || 'B2B',
            audiologistId: '451f0c8d-916f-422e-b12d-90fadeb8ebd0', // Default audiologist ID
            sessionNumber: oaeResponse.oaeForms.length + 1,
            failedAttempts: oaeResponse.summary.failed
          }));

          // Auto-switch to view mode if data exists
          if (oaeResponse.oaeForms.length > 0) {
            setIsEditing(false);
          } else {
            setIsEditing(true);
          }

        } catch (error) {
          console.error('Error fetching data:', error);
          setError('Failed to load patient data. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [patientId, token]);

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveForm = async () => {
    if (!token) return;

    try {
      setSaving(true);
      setError(null);

      const createData: CreateOAEFormData = {
        userId: '1563a429-7493-47a4-8167-2f3a18c503cc', // Default user ID
        audiologistId: formData.audiologistId,
        patientName: formData.patientName,
        patientId: formData.patientId,
        classification: formData.classification,
        babyDateOfBirth: formData.babyDateOfBirth,
        babyMotherName: formData.babyMotherName,
        babyGender: formData.babyGender,
        opNumber: formData.opNumber,
        contactNumber: formData.contactNumber,
        hospitalName: formData.hospitalName,
        doctorName: formData.doctorName,
        sessionNumber: formData.sessionNumber,
        testDate: formData.testDate,
        conductedBy: formData.conductedBy,
        testReason: formData.testReason,
        equipmentUsed: formData.equipmentUsed,
        testResults: formData.testResults,
        testNotes: formData.testNotes,
        failedAttempts: formData.failedAttempts
      };

      await oaeService.createOAEForm(createData, token);
      
      setSuccess('OAE form saved successfully!');
    setIsEditing(false);
      
      // Refresh data
      const oaeResponse = await oaeService.getOAEFormsByPatient(patientId, token);
      setOaeForms(oaeResponse.oaeForms);
      setFormData(prev => ({
        ...prev,
        sessionNumber: oaeResponse.oaeForms.length + 1,
        failedAttempts: oaeResponse.summary.failed
      }));

    } catch (error) {
      console.error('Error saving OAE form:', error);
      setError('Failed to save OAE form. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const getTestResultStatus = (result: string) => {
    if (result === 'Pass') return 'pass';
    if (result === 'Fail') return 'refer';
    return 'mixed';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-100 text-green-800';
      case 'refer': return 'bg-red-100 text-red-800';
      case 'mixed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4" />;
      case 'refer': return <AlertCircle className="w-4 h-4" />;
      case 'mixed': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '';
    const birth = new Date(birthDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days old`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} old`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} old`;
    }
  };

  // Dropdown options
  const testResultOptions = [
    { value: 'Pass', label: 'Pass' },
    { value: 'Fail', label: 'Fail' },
    { value: 'Refer', label: 'Refer' },
    { value: 'Incomplete', label: 'Incomplete' }
  ];

  const testReasonOptions = [
    { value: 'Initial Screening', label: 'Initial Screening' },
    { value: 'Follow-up (Refer Result)', label: 'Follow-up (Refer Result)' },
    { value: 'Routine Check', label: 'Routine Check' },
    { value: 'Parent Request', label: 'Parent Request' }
  ];

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' }
  ];

  const hospitalOptions = [
    { value: 'Sunrise Hospital', label: 'Sunrise Hospital' },
    { value: 'City Medical Center', label: 'City Medical Center' },
    { value: 'Regional Hospital', label: 'Regional Hospital' }
  ];

  const doctorOptions = [
    { value: 'Dr. Emily Rodriguez', label: 'Dr. Emily Rodriguez' },
    { value: 'Dr. Michael Chen', label: 'Dr. Michael Chen' },
    { value: 'Dr. Sarah Johnson', label: 'Dr. Sarah Johnson' }
  ];

  const equipmentOptions = [
    { value: 'OAE Screener - Model XYZ', label: 'OAE Screener - Model XYZ' },
    { value: 'OAE Screener - Model ABC', label: 'OAE Screener - Model ABC' },
    { value: 'OAE Screener - Model DEF', label: 'OAE Screener - Model DEF' }
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link href={`/patients/${patientId}`} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Volume2 size={16} className="text-green-600" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-900">
                  {isEditing ? 'Edit OAE Record' : 'OAE Record'}
                </h1>
                <p className="text-xs text-gray-600">Newborn Hearing Screening - Otoacoustic Emissions Testing</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Session {formData.sessionNumber}
              </span>
              {formData.failedAttempts > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center space-x-1">
                  <span>{formData.failedAttempts} Failed</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <>
            <button 
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-xs"
            >
              X Cancel
            </button>
            <button 
              onClick={handleSaveForm}
                  disabled={saving}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2 text-xs disabled:opacity-50"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : null}
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </>
            ) : (
              <button 
                onClick={handleEdit}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-xs"
              >
                Edit
            </button>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Patient Information - First Block */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <User size={16} className="text-gray-600" />
            <h3 className="text-xs font-semibold text-gray-900">Patient Information</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Patient Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => handleInputChange('patientName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="Patient Name"
                />
              ) : (
              <p className="text-xs text-gray-900">{formData.patientName}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Patient ID</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.patientId}
                  onChange={(e) => handleInputChange('patientId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="Patient ID"
                />
              ) : (
              <p className="text-xs text-gray-900">{formData.patientId}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Classification</label>
              {isEditing ? (
                <CustomDropdown
                  options={[
                    { value: 'B2B', label: 'B2B' },
                    { value: 'B2C', label: 'B2C' }
                  ]}
                  value={formData.classification}
                  onChange={(value) => handleInputChange('classification', value)}
                  placeholder="Select classification"
                />
              ) : (
              <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                {formData.classification}
              </span>
              )}
            </div>
          </div>
        </div>

        {/* Patient Information - Second Block */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <User size={16} className="text-gray-600" />
            <h3 className="text-xs font-semibold text-gray-900">Patient Information</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Baby Date of Birth</label>
                {isEditing ? (
                <input
                    type="date"
                  value={formData.babyDateOfBirth}
                  onChange={(e) => handleInputChange('babyDateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                    aria-label="Baby Date of Birth"
                  />
                ) : (
                  <div>
                    <p className="text-xs text-gray-900">{formatDate(formData.babyDateOfBirth)}</p>
                    <p className="text-xs text-gray-500">{calculateAge(formData.babyDateOfBirth)}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Baby Gender</label>
                {isEditing ? (
                  <CustomDropdown
                    options={genderOptions}
                  value={formData.babyGender}
                    onChange={(value) => handleInputChange('babyGender', value)}
                    placeholder="Select gender"
                  />
                ) : (
                  <p className="text-xs text-gray-900">{formData.babyGender}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contact Number</label>
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <Phone size={16} className="text-gray-400" />
                <input
                  type="text"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="+1 234 567 8910"
                />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Phone size={16} className="text-gray-400" />
                    <p className="text-xs text-gray-900">{formData.contactNumber}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Baby Mother Name</label>
                {isEditing ? (
                <input
                  type="text"
                  value={formData.babyMotherName}
                  onChange={(e) => handleInputChange('babyMotherName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="Jennifer Miller"
                />
                ) : (
                  <p className="text-xs text-gray-900">{formData.babyMotherName}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">OP/IP/UHID Number</label>
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <FileText size={16} className="text-gray-400" />
                <input
                  type="text"
                      value={formData.opNumber}
                      onChange={(e) => handleInputChange('opNumber', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="SH-2025-NBH-001234"
                />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <FileText size={16} className="text-gray-400" />
                    <p className="text-xs text-gray-900">{formData.opNumber}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hospital & Medical Staff */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Building size={16} className="text-gray-600" />
            <h3 className="text-xs font-semibold text-gray-900">Hospital & Medical Staff</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Hospital Name</label>
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <Hospital size={16} className="text-gray-400" />
                    <CustomDropdown
                      options={hospitalOptions}
                  value={formData.hospitalName}
                      onChange={(value) => handleInputChange('hospitalName', value)}
                      placeholder="Select hospital"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Hospital size={16} className="text-gray-400" />
                    <p className="text-xs text-gray-900">{formData.hospitalName}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Audiologist Name</label>
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <UserCheck size={16} className="text-gray-400" />
                    <CustomDropdown
                      options={doctorOptions}
                      value={formData.audiologistId}
                      onChange={(value) => handleInputChange('audiologistId', value)}
                      placeholder="Select audiologist"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <UserCheck size={16} className="text-gray-400" />
                    <p className="text-xs text-gray-900">{formData.audiologistId}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Doctor Name</label>
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <User size={16} className="text-gray-400" />
                    <CustomDropdown
                      options={doctorOptions}
                  value={formData.doctorName}
                      onChange={(value) => handleInputChange('doctorName', value)}
                      placeholder="Select doctor"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <User size={16} className="text-gray-400" />
                    <p className="text-xs text-gray-900">{formData.doctorName}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Test Results Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
            <Volume2 size={16} className="text-gray-600" />
              <h3 className="text-xs font-semibold text-gray-900">Test Results</h3>
            </div>
            {oaeForms.length > 0 && (
              <div className="text-xs text-gray-600">
                Total: {oaeForms.length} sessions Failed: {formData.failedAttempts}
              </div>
            )}
          </div>

          {/* Existing Test Sessions */}
          {oaeForms.length > 0 && (
            <div className="space-y-4 mb-6">
              {oaeForms.map((form) => (
                <div key={form.id} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        Session {form.sessionNumber}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full flex items-center space-x-1 ${getStatusColor(getTestResultStatus(form.testResults))}`}>
                        {getStatusIcon(getTestResultStatus(form.testResults))}
                        <span>{form.testResults}</span>
                      </span>
                      {form.testResults !== 'Pass' && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                          Needs Follow-up
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(form.testDate)}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-medium text-gray-700">Reason:</span>
                      <span className="ml-2 text-gray-900">{form.testReason}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Conducted By:</span>
                      <span className="ml-2 text-gray-900">{form.conductedBy}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Equipment:</span>
                      <span className="ml-2 text-gray-900">{form.equipmentUsed}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Notes:</span>
                      <span className="ml-2 text-gray-900">{form.testNotes}</span>
                    </div>
                  </div>

                  {form.testResults !== 'Pass' && (
                    <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <h4 className="text-xs font-semibold text-yellow-800">Test Failed - Action Required</h4>
                      </div>
                      <p className="text-xs text-yellow-700 mt-1">
                        {form.testResults === 'Fail' ? 'Test failed - priority follow-up needed' : 'Monitor and retest'}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {/* Failed Test Pattern Analysis */}
              {formData.failedAttempts > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <h4 className="text-xs font-semibold text-orange-800">Failed Test Pattern Analysis</h4>
                  </div>
                  <ul className="text-xs text-orange-700 space-y-1">
                    <li>• {formData.failedAttempts} of {oaeForms.length} tests have failed</li>
                    <li>• Most recent result: {oaeForms[oaeForms.length - 1]?.testResults}</li>
                    <li>• Continue testing until Pass is achieved</li>
                    <li>• Next follow-up scheduled: {formatDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString())}</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* New Test Session Form */}
          {isEditing && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-xs font-semibold text-gray-900 mb-4">New Test Session</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Test Date *</label>
                <input
                      type="date"
                  value={formData.testDate}
                  onChange={(e) => handleInputChange('testDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                      aria-label="Test Date"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Test Reason *</label>
                    <CustomDropdown
                      options={testReasonOptions}
                  value={formData.testReason}
                      onChange={(value) => handleInputChange('testReason', value)}
                      placeholder="Select test reason"
                    />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Test Results *</label>
                    <CustomDropdown
                      options={testResultOptions}
                  value={formData.testResults}
                      onChange={(value) => handleInputChange('testResults', value)}
                      placeholder="Select test results"
                    />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Conducted By *</label>
                    <CustomDropdown
                      options={doctorOptions}
                  value={formData.conductedBy}
                      onChange={(value) => handleInputChange('conductedBy', value)}
                      placeholder="Select doctor"
                    />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Equipment Used</label>
                    <CustomDropdown
                      options={equipmentOptions}
                  value={formData.equipmentUsed}
                      onChange={(value) => handleInputChange('equipmentUsed', value)}
                      placeholder="Select equipment"
                    />
              </div>
            </div>
          </div>
          
          {/* Test Results Status Display */}
          {formData.testResults && (
            <div className="mt-4">
                  {formData.testResults === 'Pass' ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="text-xs font-semibold text-green-800">Screening Complete</h4>
                        <p className="text-xs text-green-700">Test passed. No further OAE testing required.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <h4 className="text-xs font-semibold text-yellow-800">Follow-up Testing Recommended</h4>
                        <p className="text-xs text-yellow-700">Test did not pass. Additional testing sessions should be scheduled.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Test Notes</label>
            <textarea
              value={formData.testNotes}
              onChange={(e) => handleInputChange('testNotes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
              placeholder="Enter any test notes or observations for this session..."
            />
          </div>
        </div>
          )}
        </div>

        {/* Record Information */}
        {oaeForms.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar size={16} className="text-gray-600" />
              <h3 className="text-xs font-semibold text-gray-900">Record Information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-medium text-gray-700">Created Date:</span>
                <span className="ml-2 text-gray-900">{formatDate(oaeForms[0].createdAt)} at {new Date(oaeForms[0].createdAt).toLocaleTimeString()}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Created By:</span>
                <span className="ml-2 text-gray-900">{oaeForms[0].conductedBy}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
