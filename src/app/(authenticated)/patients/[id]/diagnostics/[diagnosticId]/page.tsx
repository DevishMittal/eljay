'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/main-layout';
import Link from 'next/link';
import { DiagnosticAppointment } from '@/types';
import { diagnosticAppointmentsService } from '@/services/diagnosticAppointmentsService';
import { useAuth } from '@/contexts/AuthContext';

export default function DiagnosticPlanPage({ 
  params 
}: { 
  params: Promise<{ id: string; diagnosticId: string }> 
}) {
  const router = useRouter();
  const { token } = useAuth();
  const { id, diagnosticId } = use(params);
  const [diagnosticPlan, setDiagnosticPlan] = useState<DiagnosticAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiagnosticPlan = async () => {
      try {
        setLoading(true);
        setError(null);
        const appointment = await diagnosticAppointmentsService.getDiagnosticAppointmentById(
          diagnosticId, 
          token || undefined
        );
        setDiagnosticPlan(appointment);
      } catch (err) {
        setError('Failed to fetch diagnostic plan details. Please try again.');
        console.error('Error fetching diagnostic plan:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDiagnosticPlan();
    }
  }, [diagnosticId, token]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading diagnostic plan...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !diagnosticPlan) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <p className="text-red-600 mb-4">{error || 'Diagnostic plan not found'}</p>
            <button 
              onClick={() => router.back()}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Go Back
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/patients/${id}`} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{diagnosticPlan.procedures || 'Diagnostic Plan'}</h1>
              <p className="text-sm text-gray-600">
                Patient: {diagnosticPlan.user?.fullname || 'Not specified'} • Assigned to: {diagnosticPlan.audiologist?.name || 'Not assigned'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 text-xs rounded-full ${diagnosticAppointmentsService.getStatusColor(diagnosticPlan.status || 'planned')}`}>
              {diagnosticPlan.status || 'planned'}
            </span>
          </div>
        </div>

        {/* Diagnostic Overview Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Diagnostic Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Planned Date</label>
                  <p className="text-sm text-gray-900">
                    {diagnosticPlan.appointmentDate ? diagnosticAppointmentsService.formatDate(diagnosticPlan.appointmentDate) : 'Not scheduled'}
                    {diagnosticPlan.appointmentTime && ` at ${diagnosticAppointmentsService.formatTime(diagnosticPlan.appointmentTime)}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Assigned To</label>
                  <p className="text-sm text-gray-900">{diagnosticPlan.audiologist?.name || 'Not assigned'}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cost</label>
                  <p className="text-lg font-bold text-gray-900">₹{diagnosticPlan.cost ? diagnosticPlan.cost.toLocaleString() : 'Not specified'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <p className="text-sm text-gray-900">{diagnosticPlan.procedures || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <label className="block text-xs font-medium text-gray-700 mb-2">Notes</label>
            <p className="text-sm text-gray-600">
              Initial comprehensive hearing assessment including pure tone audiometry, speech audiometry, and tympanometry.
            </p>
          </div>
        </div>

        {/* Documents Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Document description..."
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-64"
              />
              <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Upload</span>
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {/* Document 1 */}
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">Pre_Assessment_Questionnaire.pdf</h4>
                  <p className="text-xs text-gray-600">152.77 KB • Uploaded 20/7/2025 by Reception Staff</p>
                  <p className="text-xs text-gray-500 mt-1">Patient completed pre-assessment questionnaire.</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  aria-label="View document"
                  title="View document"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button 
                  className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                  aria-label="Download document"
                  title="Download document"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button 
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  aria-label="Delete document"
                  title="Delete document"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Document 2 */}
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">Audiometry_Results_Draft.pdf</h4>
                  <p className="text-xs text-gray-600">229.07 KB • Uploaded 22/7/2025 by {diagnosticPlan.audiologist?.name || 'Dr. Sarah Johnson'}</p>
                  <p className="text-xs text-gray-500 mt-1">Initial audiometry test results - draft pending review.</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  aria-label="View document"
                  title="View document"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button 
                  className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                  aria-label="Download document"
                  title="Download document"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button 
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  aria-label="Delete document"
                  title="Delete document"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments & Notes Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Comments & Notes</h2>
            <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Comment</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Comment 1 */}
            <div className="border-l-4 border-orange-500 pl-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm text-gray-900">{diagnosticPlan.audiologist?.name || 'Dr. Sarah Johnson'}</span>
                <span className="text-xs text-gray-500">22/7/2025 at 02:30 pm</span>
              </div>
              <p className="text-sm text-gray-700">
                Preliminary results show moderate hearing loss in both ears. Will need follow-up testing next week.
              </p>
            </div>

            {/* Comment 2 */}
            <div className="border-l-4 border-orange-500 pl-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm text-gray-900">{diagnosticPlan.audiologist?.name || 'Dr. Sarah Johnson'}</span>
                <span className="text-xs text-gray-500">22/7/2025 at 10:15 am</span>
              </div>
              <p className="text-sm text-gray-700">
                Patient arrived on time and was cooperative during the initial assessment. No issues with equipment setup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
