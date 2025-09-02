'use client';

import { useState, useEffect, useCallback } from 'react';
import MainLayout from '@/components/layout/main-layout';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClinicalNote } from '@/types';
import { clinicalNotesService } from '@/services/clinicalNotesService';
import { useAuth } from '@/contexts/AuthContext';
import ClinicalNoteModal from '@/components/modals/clinical-note-modal';

export default function PatientEMRPage({ params }: { params: { id: string } }) {
  const { token } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'diagnostics' | 'clinical-notes' | 'patient-files' | 'medical-history'>('diagnostics');
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClinicalNoteModal, setShowClinicalNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<ClinicalNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const pathname = usePathname();
  const patient = {
    id: params.id,
    name: 'Anna Rodriguez',
    type: 'B2C',
    status: 'New',
    lastUpdated: '5/6/2025'
  };

  const diagnosticPlans = [
    {
      name: 'Comprehensive Hearing Assessment',
      status: 'planned',
      cost: '₹25,000',
      plannedDate: '25/7/2025',
      assignedTo: 'Dr. Sarah Johnson',
      files: 0
    },
    {
      name: 'Hearing Aid Trial',
      status: 'completed',
      cost: '₹5,000',
      plannedDate: '30/7/2025',
      assignedTo: 'Dr. Sarah Johnson',
      files: 0
    },
    {
      name: 'OAE Screening',
      status: 'planned',
      cost: '₹8,000',
      plannedDate: '5/8/2025',
      assignedTo: 'Dr. Emily Davis',
      files: 0
    },
    {
      name: 'Follow-up Hearing Test',
      status: 'completed',
      cost: '₹15,000',
      plannedDate: '15/6/2025',
      assignedTo: 'Dr. Sarah Johnson',
      files: 0
    },
    {
      name: 'Hearing Aid Fitting & Programming',
      status: 'planned',
      cost: '₹12,000',
      plannedDate: '10/8/2025',
      assignedTo: 'Dr. Sarah Johnson',
      files: 0
    }
  ];



  const medicalHistory = [
    {
      date: 'Thursday, January 16, 2025',
      entries: [
        {
          time: '03:00 pm',
          type: 'Payment',
          status: 'completed',
          details: {
            receiptId: 'Recpt002',
            amountPaid: '1500',
            method: 'GPay'
          }
        },
        {
          time: '02:00 pm',
          type: 'Appointment',
          status: 'completed',
          details: {
            patient: 'Anna Rodriguez',
            time: '02:00 PM to 02:30 PM',
            createdBy: 'Dr. Emily Davis'
          }
        }
      ]
    },
    {
      date: 'Wednesday, January 15, 2025',
      entries: [
        {
          time: '11:30 am',
          type: 'Invoice',
          status: 'Pending',
          details: {
            service: 'Comprehensive Hearing Assessment',
            invoiceId: 'INV-2025-001',
            amount: '₹500.00',
            paidAmount: '₹0.00',
            dueAmount: '₹500.00'
          }
        },
        {
          time: '11:00 am',
          type: 'Payment',
          status: 'completed',
          details: {
            receiptId: 'Recpt001',
            amountPaid: '500',
            method: 'Cash'
          }
        },
        {
          time: '10:00 am',
          type: 'Diagnostic Completed',
          status: 'completed',
          details: {
            patient: 'Anna Rodriguez',
            diagnosticName: 'Comprehensive Hearing Assessment'
          }
        },
        {
          time: '09:30 am',
          type: 'Diagnostic Plan',
          status: 'completed',
          details: {
            patient: 'Anna Rodriguez',
            diagnosticName: 'Comprehensive Hearing Assessment'
          }
        },
        {
          time: '09:00 am',
          type: 'Appointment',
          status: 'completed',
          details: {
            patient: 'Anna Rodriguez',
            time: '09:00 AM to 09:30 AM',
            createdBy: 'Dr. Sarah Johnson'
          }
        }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pending':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fetch clinical notes
  const fetchClinicalNotes = useCallback(async () => {
    if (!token || !patient.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await clinicalNotesService.getClinicalNotes(patient.id, 1, 50, token);
      setClinicalNotes(response.clinicalNotes);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch clinical notes');
      console.error('Error fetching clinical notes:', err);
    } finally {
      setLoading(false);
    }
  }, [token, patient.id]);

  // Load clinical notes when component mounts or tab changes
  useEffect(() => {
    if (activeSubTab === 'clinical-notes') {
      fetchClinicalNotes();
    }
  }, [activeSubTab, fetchClinicalNotes]);

  const handleAddClinicalNote = () => {
    setEditingNote(null);
    setIsEditing(false);
    setShowClinicalNoteModal(true);
  };

  const handleEditClinicalNote = (note: ClinicalNote) => {
    setEditingNote(note);
    setIsEditing(true);
    setShowClinicalNoteModal(true);
  };

  const handleDeleteClinicalNote = async (noteId: string) => {
    if (!token || !patient.id) return;
    
    if (window.confirm('Are you sure you want to delete this clinical note?')) {
      try {
        await clinicalNotesService.deleteClinicalNote(patient.id, noteId, token);
        fetchClinicalNotes(); // Refresh the list
      } catch (err: any) {
        setError(err.message || 'Failed to delete clinical note');
        console.error('Error deleting clinical note:', err);
      }
    }
  };

  const handleClinicalNoteSuccess = (note: ClinicalNote) => {
    if (isEditing) {
      // Update existing note in the list
      setClinicalNotes(prev => prev.map(n => n.id === note.id ? note : n));
    } else {
      // Add new note to the list
      setClinicalNotes(prev => [note, ...prev]);
    }
    setShowClinicalNoteModal(false);
    setEditingNote(null);
    setIsEditing(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Diagnosis':
        return 'bg-blue-100 text-blue-800';
      case 'Follow-up':
        return 'bg-purple-100 text-purple-800';
      case 'Treatment':
        return 'bg-green-100 text-green-800';
      case 'Test Results':
        return 'bg-yellow-100 text-yellow-800';
      case 'Prescription':
        return 'bg-indigo-100 text-indigo-800';
      case 'Referral':
        return 'bg-pink-100 text-pink-800';
      case 'General':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/patients" className="p-2 hover:bg-muted rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-medium text-lg">
                AR
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#101828' }}>{patient.name}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">{patient.type}</span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{patient.status}</span>
                </div>
                <p className="text-sm mt-1" style={{ color: '#4A5565' }}>
                  Patient ID: {patient.id} • Last updated: {patient.lastUpdated}
                </p>
              </div>
            </div>
          </div>
          <button className="flex items-center space-x-2 text-sm" style={{ color: '#717182' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
            <span>Options</span>
          </button>
        </div>

        {/* Patient Navigation */}
        <div className="bg-white rounded-lg border border-border p-4">
          <nav className="flex space-x-8">
            <Link href={`/patients/${patient.id}`} className="flex items-center space-x-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span style={{ color: '#717182' }}>Profile</span>
            </Link>
            <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg border-l-4 border-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium" style={{ color: '#101828' }}>EMR</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <Link href={`/patients/${patient.id}/billing`} className="flex items-center space-x-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span style={{ color: '#717182' }}>Billing</span>
            </Link>
          </nav>
        </div>

        {/* EMR Sub-navigation */}
        <div className="bg-white rounded-lg border border-border p-4">
          <nav className="flex space-x-6">
            <button 
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                activeSubTab === 'diagnostics' 
                  ? 'bg-blue-50' 
                  : 'hover:bg-muted'
              }`}
              style={{ color: activeSubTab === 'diagnostics' ? '#101828' : '#717182' }}
              onClick={() => setActiveSubTab('diagnostics')}
            >
              Diagnostics
            </button>
            <button 
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                activeSubTab === 'clinical-notes' 
                  ? 'bg-blue-50' 
                  : 'hover:bg-muted'
              }`}
              style={{ color: activeSubTab === 'clinical-notes' ? '#101828' : '#717182' }}
              onClick={() => setActiveSubTab('clinical-notes')}
            >
              Clinical Notes
            </button>
            <button 
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                activeSubTab === 'patient-files' 
                  ? 'bg-blue-50' 
                  : 'hover:bg-muted'
              }`}
              style={{ color: activeSubTab === 'patient-files' ? '#101828' : '#717182' }}
              onClick={() => setActiveSubTab('patient-files')}
            >
              Patient Files
            </button>
            <button 
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                activeSubTab === 'medical-history' 
                  ? 'bg-blue-50' 
                  : 'hover:bg-muted'
              }`}
              style={{ color: activeSubTab === 'medical-history' ? '#101828' : '#717182' }}
              onClick={() => setActiveSubTab('medical-history')}
            >
              Medical History
            </button>
          </nav>
        </div>

        {/* Conditional Content Based on Active Tab */}
        {activeSubTab === 'diagnostics' && (
        <div className="space-y-6">
        {/* Diagnostics Section */}
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold" style={{ color: '#101828' }}>Diagnostics</h2>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">5 Plans</span>
            </div>
            <button className="bg-primary text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-primary/90 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>+ Create Diagnostic Plan</span>
            </button>
          </div>

          <div className="space-y-4">
            {diagnosticPlans.map((plan, index) => (
              <div key={index} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium" style={{ color: '#0A0A0A' }}>{plan.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(plan.status)}`}>
                    {plan.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm" style={{ color: '#717182' }}>
                  <div>
                    <span className="font-medium">Cost:</span> {plan.cost}
                  </div>
                  <div>
                    <span className="font-medium">Planned:</span> {plan.plannedDate}
                  </div>
                  <div>
                    <span className="font-medium">Assigned to:</span> {plan.assignedTo}
                  </div>
                  <div>
                    <span className="font-medium">Files:</span> {plan.files}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Specialized Procedures */}
        <div className="bg-white rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#101828' }}>Specialized Procedures</h2>
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium" style={{ color: '#0A0A0A' }}>Hearing Aid Trial (HAT)</h3>
                  <p className="text-sm" style={{ color: '#717182' }}>Record hearing aid trial sessions.</p>
                </div>
              </div>
              <span className="text-sm" style={{ color: '#717182' }}>Last updated: Never</span>
            </div>
          </div>
        </div>
        </div>
        )}

        {activeSubTab === 'clinical-notes' && (
          <div className="bg-white rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold" style={{ color: '#101828' }}>Clinical Notes</h2>
              <div className="flex items-center space-x-3">
                <select 
                  className="px-3 py-2 border border-border rounded-lg text-sm" 
                  style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
                  aria-label="Filter by category"
                >
                  <option>All Categories</option>
                  <option>Diagnosis</option>
                  <option>Treatment</option>
                  <option>Follow-up</option>
                  <option>Test Results</option>
                  <option>Prescription</option>
                  <option>Referral</option>
                  <option>General</option>
                </select>
                <button 
                  onClick={handleAddClinicalNote}
                  className="bg-primary text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-primary/90 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>+ Add Note</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-red-800 font-medium text-sm mb-1">Error Loading Notes</h4>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading clinical notes...</p>
              </div>
            ) : clinicalNotes.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2 text-gray-900">No clinical notes yet</h3>
                <p className="text-sm mb-6 text-gray-500">Start documenting patient care with clinical notes</p>
                <button 
                  onClick={handleAddClinicalNote}
                  className="bg-primary text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 mx-auto hover:bg-primary/90 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add First Note</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {clinicalNotes.map((note) => (
                  <div key={note.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium" style={{ color: '#0A0A0A' }}>{note.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(note.category)}`}>
                            {note.category}
                          </span>
                        </div>
                        <p className="text-sm mb-2" style={{ color: '#717182' }}>{note.content}</p>
                        <p className="text-xs" style={{ color: '#717182' }}>
                          Created: {new Date(note.createdAt).toLocaleDateString()} • 
                          Updated: {new Date(note.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditClinicalNote(note)}
                          className="p-1 hover:bg-muted rounded-md transition-colors"
                          title="Edit note"
                          aria-label="Edit note"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteClinicalNote(note.id)}
                          className="p-1 hover:bg-muted rounded-md transition-colors"
                          title="Delete note"
                          aria-label="Delete note"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'patient-files' && (
          <div className="bg-white rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold" style={{ color: '#101828' }}>Patient Files</h2>
              <button className="bg-primary text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-primary/90 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Upload Files</span>
              </button>
            </div>

            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2" style={{ color: '#101828' }}>No files uploaded</h3>
              <p className="text-sm mb-6" style={{ color: '#4A5565' }}>Upload patient files and documents</p>
              <button className="bg-primary text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 mx-auto hover:bg-primary/90 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Upload Files</span>
              </button>
            </div>
          </div>
        )}

        {activeSubTab === 'medical-history' && (
          <div className="bg-white rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold mb-6" style={{ color: '#101828' }}>Medical History Timeline</h2>
            
            <div className="space-y-6">
              {medicalHistory.map((day, dayIndex) => (
                <div key={dayIndex}>
                <h3 className="font-medium mb-4" style={{ color: '#0A0A0A' }}>{day.date}</h3>
                <div className="space-y-3">
                  {day.entries.map((entry, entryIndex) => (
                    <div key={entryIndex} className="flex items-start space-x-4">
                      <div className="text-sm font-medium" style={{ color: '#717182' }}>{entry.time}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium" style={{ color: '#0A0A0A' }}>{entry.type}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(entry.status)}`}>
                            {entry.status}
                          </span>
                        </div>
                        <div className="text-sm space-y-1" style={{ color: '#717182' }}>
                          {entry.type === 'Payment' && (
                            <>
                              <p>Receipt ID: {entry.details.receiptId}</p>
                              <p>Amount Paid: {entry.details.amountPaid}</p>
                              <p>Via {entry.details.method}</p>
                            </>
                          )}
                          {entry.type === 'Appointment' && (
                            <>
                              <p>{entry.details.patient}</p>
                              <p>{entry.details.time}</p>
                              <p>Created by {entry.details.createdBy}</p>
                            </>
                          )}
                          {entry.type === 'Invoice' && (
                            <>
                              <p>{entry.details.service}</p>
                              <p>Invoice ID: {entry.details.invoiceId}</p>
                              <p>Invoice Amount: {entry.details.amount}</p>
                              <p>Paid Amount: {entry.details.paidAmount}</p>
                              <p>Due Amount: {entry.details.dueAmount}</p>
                            </>
                          )}
                          {entry.type === 'Diagnostic Completed' && (
                            <>
                              <p>{entry.details.patient}</p>
                              <p>Diagnostic Name: {entry.details.diagnosticName}</p>
                            </>
                          )}
                          {entry.type === 'Diagnostic Plan' && (
                            <>
                              <p>{entry.details.patient}</p>
                              <p>Diagnostic Name: {entry.details.diagnosticName}</p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 hover:bg-muted rounded-md transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="p-1 hover:bg-muted rounded-md transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>

      {/* Clinical Note Modal */}
      <ClinicalNoteModal
        isOpen={showClinicalNoteModal}
        onClose={() => setShowClinicalNoteModal(false)}
        onSuccess={handleClinicalNoteSuccess}
        note={editingNote}
        isEditing={isEditing}
        userId={patient.id}
      />
    </MainLayout>
  );
}
