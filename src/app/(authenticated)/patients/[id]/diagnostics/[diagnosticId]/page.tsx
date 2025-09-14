'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/main-layout';
import Link from 'next/link';
import { DiagnosticAppointment, ClinicalNote, CreateClinicalNoteData } from '@/types';
import { appointmentService } from '@/services/appointmentService';
import { fileService, UploadedFile } from '@/services/fileService';
import { clinicalNotesService } from '@/services/clinicalNotesService';
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
  const [documents, setDocuments] = useState<UploadedFile[]>([]);
  const [comments, setComments] = useState<ClinicalNote[]>([]);
  const [documentDescription, setDocumentDescription] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [addingComment, setAddingComment] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fileService.getFiles(id, token);
      setDocuments(response.data);
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  }, [id, token]);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    if (!token) return;
    try {
      const response = await clinicalNotesService.getClinicalNotes(id, 1, 50, token);
      setComments(response.clinicalNotes);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  }, [id, token]);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    setUploading(true);
    try {
      await fileService.uploadFile(id, file, token);
      setDocumentDescription('');
      await fetchDocuments();
    } catch (err) {
      console.error('Error uploading file:', err);
    } finally {
      setUploading(false);
    }
  };

  // Handle comment creation
  const handleAddComment = async () => {
    if (!commentContent.trim() || !token) return;

    setAddingComment(true);
    try {
      const commentData: CreateClinicalNoteData = {
        title: 'Diagnostic Plan Comment',
        content: commentContent,
        category: 'General'
      };
      await clinicalNotesService.createClinicalNote(id, commentData, token);
      setCommentContent('');
      setShowCommentModal(false);
      await fetchComments();
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setAddingComment(false);
    }
  };

  // Handle file deletion
  const handleDeleteFile = async (fileId: string) => {
    if (!token) return;
    try {
      await fileService.deleteFile(fileId, token);
      await fetchDocuments();
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  };

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await appointmentService.getAppointmentSummary(
          diagnosticId, 
          token || undefined
        );
        // Map the appointment response to diagnostic plan format for compatibility
        const appointmentData = response.data;
        const mappedDiagnosticPlan: DiagnosticAppointment = {
          id: appointmentData.id,
          appointmentDate: appointmentData.date,
          appointmentTime: appointmentData.time,
          appointmentDuration: appointmentData.duration,
          procedures: appointmentData.procedures,
          status: appointmentData.visitStatus === 'check_in' ? 'completed' : 
                 appointmentData.visitStatus === 'cancelled' ? 'cancelled' : 'planned',
          cost: 0, // Cost not available in appointment API
          audiologist: appointmentData.audiologist,
          audiologistId: appointmentData.audiologist?.id || '',
          userId: appointmentData.patient?.id || id,
          user: appointmentData.patient,
          referralSourceId: appointmentData.referralSource?.id || '',
          files: 0, // Will be fetched separately
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setDiagnosticPlan(mappedDiagnosticPlan);
      } catch (err) {
        setError('Failed to fetch appointment details. Please try again.');
        console.error('Error fetching appointment details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAppointmentDetails();
      fetchDocuments();
      fetchComments();
    }
  }, [diagnosticId, token, id, fetchDocuments, fetchComments]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading appointment details...</p>
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
            <p className="text-red-600 mb-4">{error || 'Appointment not found'}</p>
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
            <Link href={`/patients/${id}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">{diagnosticPlan.procedures || 'Appointment Details'}</h1>
              <p className="text-xs text-gray-600">
                Patient: {diagnosticPlan.user?.fullname || 'Not specified'} • Assigned to: {diagnosticPlan.audiologist?.name || 'Not assigned'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
              {diagnosticPlan.status || 'planned'}
            </span>
          </div>
        </div>

        {/* Appointment Overview Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Appointment Overview</h2>
          
          {/* Single line overview */}
          <div className="flex items-center justify-between  border-gray-200 pb-3 mb-3">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-gray-900">
                  {diagnosticPlan.appointmentDate ? new Date(diagnosticPlan.appointmentDate).toLocaleDateString('en-GB', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  }) : 'Not scheduled'}
                  {diagnosticPlan.appointmentTime && ` at ${new Date(diagnosticPlan.appointmentTime).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit', 
                    hour12: true 
                  })}`}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 22 22">
                  <path d="M17.125 18.875V17.125C17.125 16.1967 16.7563 15.3065 16.0999 14.6501C15.4435 13.9937 14.5533 13.625 13.625 13.625H8.375C7.44674 13.625 6.5565 13.9937 5.90013 14.6501C5.24375 15.3065 4.875 16.1967 4.875 17.125V18.875" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M11 10.125C12.933 10.125 14.5 8.558 14.5 6.625C14.5 4.692 12.933 3.125 11 3.125C9.067 3.125 7.5 4.692 7.5 6.625C7.5 8.558 9.067 10.125 11 10.125Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-xs text-gray-900">{diagnosticPlan.audiologist?.name || 'Not assigned'}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="text-xs text-gray-900">₹{diagnosticPlan.cost ? diagnosticPlan.cost.toLocaleString() : 'Not specified'}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 15 15">
                  <g clipPath="url(#clip0_1_44808)">
                    <path d="M12.9333 7.65023H11.4866C11.2317 7.64968 10.9836 7.73266 10.7803 7.88646C10.5769 8.04026 10.4296 8.25643 10.3608 8.50189L8.98993 13.3786C8.9811 13.4089 8.96268 13.4355 8.93743 13.4544C8.91219 13.4733 8.88149 13.4836 8.84993 13.4836C8.81838 13.4836 8.78768 13.4733 8.76243 13.4544C8.73719 13.4355 8.71877 13.4089 8.70993 13.3786L5.48993 1.92189C5.4811 1.8916 5.46268 1.86499 5.43743 1.84606C5.41219 1.82713 5.38149 1.81689 5.34993 1.81689C5.31838 1.81689 5.28768 1.82713 5.26243 1.84606C5.23719 1.86499 5.21877 1.8916 5.20993 1.92189L3.8391 6.79856C3.77054 7.04307 3.62407 7.25853 3.42194 7.41224C3.2198 7.56594 2.97304 7.6495 2.7191 7.65023H1.2666" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_1_44808">
                      <rect width="14" height="14" fill="white" transform="translate(0.100098 0.650391)"/>
                    </clipPath>
                  </defs>
                </svg>
                <span className="text-xs text-gray-900">{diagnosticPlan.procedures || 'Not specified'}</span>
              </div>
            </div>
          </div>
          
          {/* Notes section */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Appointment Notes</label>
            <p className="text-xs text-gray-600">
              {diagnosticPlan.procedures ? `Appointment for ${diagnosticPlan.procedures}` : 'No specific notes available for this appointment.'}
              {diagnosticPlan.status === 'completed' && ' - Appointment completed.'}
              {diagnosticPlan.status === 'cancelled' && ' - Appointment was cancelled.'}
            </p>
          </div>
        </div>

        {/* Documents Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Documents</h2>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Document description..."
                value={documentDescription}
                onChange={(e) => setDocumentDescription(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-xs w-48"
              />
              <label className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors text-xs flex items-center space-x-2 cursor-pointer">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Upload</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
          
          <div className="space-y-3">
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 text-gray-400">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500">No documents uploaded</p>
                <p className="text-xs text-gray-400 mt-1">Upload documents related to this diagnostic plan</p>
              </div>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-xs">{doc.fileName}</h4>
                      <p className="text-xs text-gray-600">
                        {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(2)} KB` : 'Unknown size'} • 
                        Uploaded {new Date(doc.uploadTimestamp).toLocaleDateString()}
                      </p>
                      {doc.description && (
                        <p className="text-xs text-gray-500 mt-1">{doc.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={async () => {
                        try {
                          await fileService.viewFile(doc.id, token || undefined);
                        } catch (error) {
                          console.error('Error viewing file:', error);
                          alert('Failed to open file. Please try again.');
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="View document"
                      title="View document"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    {/* <button 
                      onClick={() => window.open(doc.fileUrl, '_blank')}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Download document"
                      title="Download document"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button> */}
                    <button 
                      onClick={() => handleDeleteFile(doc.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      aria-label="Delete document"
                      title="Delete document"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Comments & Notes Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Comments & Notes</h2>
            <button 
              onClick={() => setShowCommentModal(!showCommentModal)}
              className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors text-xs flex items-center space-x-2"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Comment</span>
            </button>
          </div>
          
          {/* Inline Comment Form */}
          {showCommentModal && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <textarea
                placeholder="Enter your internal comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs h-20 resize-none"
                rows={3}
              />
              
              <div className="flex items-center justify-end space-x-3 mt-3">
                <button 
                  onClick={() => {
                    setShowCommentModal(false);
                    setCommentContent('');
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Cancel</span>
                </button>
                <button 
                  onClick={handleAddComment}
                  disabled={addingComment || !commentContent.trim()}
                  className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors text-xs flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Save Comment</span>
                </button>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            {comments.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-gray-500">No comments yet</p>
                <p className="text-xs text-gray-400 mt-1">Add the first comment above</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-l-4 border-gray-300 pl-3 py-2 bg-gray-50 rounded-r">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-xs text-gray-900">Staff Member</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
