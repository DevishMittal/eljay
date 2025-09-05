/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/main-layout';
import Link from 'next/link';
import { Volume2, User, Building, Calendar, CheckCircle, AlertCircle, Clock, Plus, Edit, MoreHorizontal } from 'lucide-react';
import { patientService } from '@/services/patientService';
import { useAuth } from '@/contexts/AuthContext';

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

interface OAEFormData {
  patientName: string;
  patientId: string;
  classification: string;
  babyDateOfBirth: string;
  babyGender: string;
  contactNumber: string;
  babyMotherName: string;
  opIpUhidNumber: string;
  hospitalName: string;
  audiologistName: string;
  doctorName: string;
  testSessions: TestSession[];
}

export default function OAERecordPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id: patientId } = params;
  const { token } = useAuth();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<OAEFormData>({
    patientName: 'Baby Miller',
    patientId: 'PAT011',
    classification: 'B2B',
    babyDateOfBirth: '15/6/2025',
    babyGender: 'Female',
    contactNumber: '+1 234 567 8910',
    babyMotherName: 'Jennifer Miller',
    opIpUhidNumber: 'SH-2025-NBH-001234',
    hospitalName: 'Sunrise Hospital',
    audiologistName: 'Dr. Emily Rodriguez',
    doctorName: 'Dr. Emily Rodriguez',
    testSessions: [
      {
        id: '1',
        sessionNumber: 1,
        testDate: '20/6/2025',
        testReason: 'Initial Screening',
        testResults: 'B/L Refer (Both ears refer)',
        conductedBy: 'Dr. Emily Rodriguez',
        equipmentUsed: 'OAE Screener - Model XYZ',
        testNotes: 'Initial screening - both ears failed. Baby was restless during testing.',
        status: 'refer'
      },
      {
        id: '2',
        sessionNumber: 2,
        testDate: '23/6/2025',
        testReason: 'Follow-up (Refer Result)',
        testResults: 'R:Pass/L:Refer (Right pass, Left refer)',
        conductedBy: 'Dr. Emily Rodriguez',
        equipmentUsed: 'OAE Screener - Model XYZ',
        testNotes: 'Follow-up test - right ear now passing, left ear still refers. Some improvement noted.',
        status: 'mixed'
      }
    ]
  });

  useEffect(() => {
    const fetchPatient = async () => {
      if (patientId && token) {
        try {
          const response = await patientService.getPatientById(patientId, token);
          setPatient(response.patient);
        } catch (error) {
          console.error('Error fetching patient:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPatient();
  }, [patientId, token]);

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

  const getResultColor = (result: string) => {
    if (result.includes('B/L Pass')) return 'bg-green-100 text-green-800';
    if (result.includes('B/L Refer')) return 'bg-red-100 text-red-800';
    return 'bg-orange-100 text-orange-800';
  };

  const failedSessions = formData.testSessions.filter(session => session.status !== 'pass').length;
  const totalSessions = formData.testSessions.length;

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
            <div>
              <h1 className="text-sm font-bold text-gray-900">View OAE Record</h1>
              <p className="text-xs text-gray-600">Patient: {formData.patientName} • {totalSessions} test sessions</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Session {totalSessions}</span>
              </span>
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{failedSessions} Failed</span>
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Options menu"
              title="Options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <button 
              onClick={() => router.push(`/patients/${patientId}/oae`)}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2 text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Test Session</span>
            </button>
            <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2 text-xs">
              <Edit className="w-4 h-4" />
              <span>Edit</span>
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
                <p className="text-xs text-gray-900">{formData.babyDateOfBirth} (2 months old)</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Baby Mother Name</label>
                <p className="text-xs text-gray-900">{formData.babyMotherName}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Baby Gender</label>
                <p className="text-xs text-gray-900">{formData.babyGender}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">OP/IP/UHID Number</label>
                <p className="text-xs text-gray-900 flex items-center space-x-1">
                  <span>{formData.opIpUhidNumber}</span>
                  <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contact Number</label>
                <p className="text-xs text-gray-900 flex items-center space-x-1">
                  <span>{formData.contactNumber}</span>
                  <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Hospital Name</label>
              <p className="text-xs text-gray-900 flex items-center space-x-1">
                <span>{formData.hospitalName}</span>
                <Building className="w-3 h-3 text-gray-400" />
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Doctor Name</label>
              <p className="text-xs text-gray-900 flex items-center space-x-1">
                <span>{formData.doctorName}</span>
                <User className="w-3 h-3 text-gray-400" />
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Audiologist Name</label>
              <p className="text-xs text-gray-900 flex items-center space-x-1">
                <span>{formData.audiologistName}</span>
                <User className="w-3 h-3 text-gray-400" />
              </p>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Volume2 size={16} className="text-gray-600" />
              <h3 className="text-xs font-semibold text-gray-900">Test Results</h3>
              <span className="text-xs text-gray-500">Test Sessions</span>
            </div>
            <div className="text-xs text-gray-600">
              Total: {totalSessions} sessions Failed: {failedSessions}
            </div>
          </div>

          <div className="space-y-4">
            {formData.testSessions.map((session, index) => (
              <div key={session.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                      Session {session.sessionNumber}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getResultColor(session.testResults)}`}>
                      {session.testResults}
                    </span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Needs Follow-up
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {session.testDate}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Reason</label>
                      <p className="text-xs text-gray-900">{session.testReason}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Conducted By</label>
                      <p className="text-xs text-gray-900">{session.conductedBy}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Equipment</label>
                      <p className="text-xs text-gray-900">{session.equipmentUsed}</p>
                    </div>
                  </div>
                </div>

                {session.testNotes && (
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                    <p className="text-xs text-gray-900">{session.testNotes}</p>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <div>
                      <h4 className="text-xs font-semibold text-yellow-800">Test Failed - Action Required</h4>
                      <p className="text-xs text-yellow-700">
                        {session.testResults.includes('B/L Refer') 
                          ? 'Both ears failed - priority follow-up needed.'
                          : session.testResults.includes('R:Pass/L:Refer')
                          ? 'Left ear failed - monitor and retest.'
                          : 'Right ear failed - monitor and retest.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Failed Test Pattern Analysis */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle size={16} className="text-red-600" />
            <h3 className="text-xs font-semibold text-gray-900">Failed Test Pattern Analysis</h3>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gray-700">• {failedSessions} of {totalSessions} tests have failed</p>
            <p className="text-xs text-gray-700">• Most recent result: {formData.testSessions[formData.testSessions.length - 1]?.testResults}</p>
            <p className="text-xs text-gray-700">• Continue testing until B/L Pass is achieved</p>
            <p className="text-xs text-gray-700">• Next follow-up scheduled: 26/6/2025</p>
          </div>
        </div>

        {/* Record Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-xs font-semibold text-gray-900 mb-4">Record Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Created Date</label>
              <p className="text-xs text-gray-900">20/6/2025 at 12:00 am</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Created By</label>
              <p className="text-xs text-gray-900">{formData.audiologistName}</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
