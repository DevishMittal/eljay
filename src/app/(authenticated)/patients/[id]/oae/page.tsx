/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/main-layout';
import Link from 'next/link';
import { Volume2, User, Building, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { patientService } from '@/services/patientService';
import { useAuth } from '@/contexts/AuthContext';

interface OAEFormData {
  // Patient Information
  patientName: string;
  patientId: string;
  classification: string;
  babyDateOfBirth: string;
  babyGender: string;
  contactNumber: string;
  babyMotherName: string;
  opIpUhidNumber: string;
  
  // Hospital & Medical Staff
  hospitalName: string;
  audiologistName: string;
  doctorName: string;
  
  // Test Session
  testDate: string;
  testReason: string;
  testResults: string;
  conductedBy: string;
  equipmentUsed: string;
  testNotes: string;
}

interface TestSession {
  id: string;
  sessionNumber: number;
  testDate: string;
  testReason: string;
  testResults: string;
  conductedBy: string;
  equipmentUsed: string;
  testNotes: string;
  status: 'pass' | 'refer' | 'mixed';
}

export default function OAEFormPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id: patientId } = params;
  const { token } = useAuth();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showNewTestSession, setShowNewTestSession] = useState(false);
  const [testSessions, setTestSessions] = useState<TestSession[]>([]);
  const [currentSession, setCurrentSession] = useState<number>(1);

  const [formData, setFormData] = useState<OAEFormData>({
    patientName: '',
    patientId: '',
    classification: 'B2B',
    babyDateOfBirth: '',
    babyGender: '',
    contactNumber: '',
    babyMotherName: '',
    opIpUhidNumber: '',
    hospitalName: 'Sunrise Hospital',
    audiologistName: 'Dr. Emily Rodriguez',
    doctorName: 'Dr. Emily Rodriguez',
    testDate: new Date().toLocaleDateString('en-GB'),
    testReason: 'Initial Screening',
    testResults: '',
    conductedBy: 'Dr. Emily Rodriguez',
    equipmentUsed: 'OAE Screener - Model XYZ',
    testNotes: ''
  });

  useEffect(() => {
    const fetchPatient = async () => {
      if (patientId && token) {
        try {
          const response = await patientService.getPatientById(patientId, token);
          setPatient(response.patient);
          setFormData(prev => ({
            ...prev,
            patientName: response.patient.full_name,
            patientId: response.patient.id,
            babyMotherName: response.patient.full_name
          }));
        } catch (error) {
          console.error('Error fetching patient:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPatient();
  }, [patientId, token]);

  const handleInputChange = (field: keyof OAEFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveForm = () => {
    // Save form logic here
    console.log('Saving OAE form:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowNewTestSession(false);
  };

  const handleAddTestSession = () => {
    setShowNewTestSession(true);
    setCurrentSession(prev => prev + 1);
  };

  const getTestResultStatus = (result: string) => {
    if (result === 'B/L Pass (Both ears pass)') return 'pass';
    if (result === 'B/L Refer (Both ears refer)') return 'refer';
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

  const testResultOptions = [
    'B/L Pass (Both ears pass)',
    'R:Pass/L:Refer (Right pass, Left refer)',
    'R:Refer/L:Pass (Right refer, Left pass)',
    'B/L Refer (Both ears refer)'
  ];

  const testReasonOptions = [
    'Initial Screening',
    'Follow-up (Refer Result)',
    'Routine Check',
    'Parent Request'
  ];

  const genderOptions = ['Male', 'Female'];
  const hospitalOptions = ['Sunrise Hospital', 'City Medical Center', 'Regional Hospital'];
  const doctorOptions = ['Dr. Emily Rodriguez', 'Dr. Michael Chen', 'Dr. Sarah Johnson'];
  const equipmentOptions = ['OAE Screener - Model XYZ', 'OAE Screener - Model ABC', 'OAE Screener - Model DEF'];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
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
                <h1 className="text-sm font-bold text-gray-900">New OAE Testing Form</h1>
                <p className="text-xs text-gray-600">Newborn Hearing Screening - Otoacoustic Emissions Testing</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Session {currentSession}</span>
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center space-x-1">
                <span>2 Failed</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-xs"
            >
              X Cancel
            </button>
            <button 
              onClick={handleSaveForm}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2 text-xs"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* Patient Information - First Block */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <User size={16} className="text-gray-600" />
            <h3 className="text-xs font-semibold text-gray-900">Patient Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Patient Name</label>
              <p className="text-xs text-gray-900">{formData.patientName}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Patient ID</label>
              <p className="text-xs text-gray-900">{formData.patientId}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Classification</label>
              <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                {formData.classification}
              </span>
            </div>
          </div>
        </div>

        {/* Patient Information - Second Block */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <User size={16} className="text-gray-600" />
            <h3 className="text-xs font-semibold text-gray-900">Patient Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Baby Date of Birth</label>
                <input
                  type="text"
                  value={formData.babyDateOfBirth}
                  onChange={(e) => handleInputChange('babyDateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="14-06-2025"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Baby Gender</label>
                <select
                  value={formData.babyGender}
                  onChange={(e) => handleInputChange('babyGender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  aria-label="Baby Gender"
                >
                  <option value="">Select gender</option>
                  {genderOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="text"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="+1 234 567 8910"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Baby Mother Name</label>
                <input
                  type="text"
                  value={formData.babyMotherName}
                  onChange={(e) => handleInputChange('babyMotherName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="Jennifer Miller"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">OP/IP/UHID Number</label>
                <input
                  type="text"
                  value={formData.opIpUhidNumber}
                  onChange={(e) => handleInputChange('opIpUhidNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="SH-2025-NBH-001234"
                />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Hospital Name</label>
                <select
                  value={formData.hospitalName}
                  onChange={(e) => handleInputChange('hospitalName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  aria-label="Hospital Name"
                >
                  {hospitalOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Audiologist Name</label>
                <select
                  value={formData.audiologistName}
                  onChange={(e) => handleInputChange('audiologistName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  aria-label="Audiologist Name"
                >
                  {doctorOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Doctor Name</label>
                <select
                  value={formData.doctorName}
                  onChange={(e) => handleInputChange('doctorName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  aria-label="Doctor Name"
                >
                  {doctorOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* New Test Session */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Volume2 size={16} className="text-gray-600" />
            <h3 className="text-xs font-semibold text-gray-900">New Test Session</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Test Date *</label>
                <input
                  type="text"
                  value={formData.testDate}
                  onChange={(e) => handleInputChange('testDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  placeholder="02-09-2025"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Test Reason *</label>
                <select
                  value={formData.testReason}
                  onChange={(e) => handleInputChange('testReason', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  aria-label="Test Reason"
                >
                  {testReasonOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Test Results *</label>
                <select
                  value={formData.testResults}
                  onChange={(e) => handleInputChange('testResults', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  aria-label="Test Results"
                >
                  <option value="">Select test results</option>
                  {testResultOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Conducted By *</label>
                <select
                  value={formData.conductedBy}
                  onChange={(e) => handleInputChange('conductedBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  aria-label="Conducted By"
                >
                  {doctorOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Equipment Used</label>
                <select
                  value={formData.equipmentUsed}
                  onChange={(e) => handleInputChange('equipmentUsed', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                  aria-label="Equipment Used"
                >
                  {equipmentOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Test Results Status Display */}
          {formData.testResults && (
            <div className="mt-4">
              {formData.testResults === 'B/L Pass (Both ears pass)' ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="text-xs font-semibold text-green-800">Screening Complete</h4>
                    <p className="text-xs text-green-700">Both ears have passed the hearing screening. No further OAE testing required.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <h4 className="text-xs font-semibold text-yellow-800">Follow-up Testing Recommended</h4>
                    <p className="text-xs text-yellow-700">Since the result is not &quot;B/L Pass&quot;, additional testing sessions should be scheduled. Continue testing until both ears pass or clinical decision is made for referral.</p>
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
      </div>
    </MainLayout>
  );
}
