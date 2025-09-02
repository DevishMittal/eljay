'use client';

import React, { useState, useEffect } from 'react';
import { ClinicalNote, CreateClinicalNoteData, UpdateClinicalNoteData } from '@/types';
import { clinicalNotesService } from '@/services/clinicalNotesService';
import { useAuth } from '@/contexts/AuthContext';
import CustomDropdown from '@/components/ui/custom-dropdown';

interface ClinicalNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (note: ClinicalNote) => void;
  note?: ClinicalNote | null;
  isEditing?: boolean;
  userId: string;
}

export default function ClinicalNoteModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  note, 
  isEditing = false 
}: ClinicalNoteModalProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState<CreateClinicalNoteData>({
    title: '',
    content: '',
    category: 'General'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (note && isEditing) {
      setFormData({
        title: note.title,
        content: note.content,
        category: note.category
      });
    } else {
      setFormData({
        title: '',
        content: '',
        category: 'General'
      });
    }
    setError(null);
  }, [note, isEditing]);

  const handleInputChange = (field: keyof CreateClinicalNoteData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!token) {
      setError('Authentication token not found');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let savedNote: ClinicalNote;
      
      if (isEditing && note) {
        // Update existing note
        const updateData: UpdateClinicalNoteData = {
          title: formData.title,
          content: formData.content,
          category: formData.category
        };
        savedNote = await clinicalNotesService.updateClinicalNote(userId, note.id, updateData, token);
      } else {
        // Create new note
        savedNote = await clinicalNotesService.createClinicalNote(userId, formData, token);
      }
      
      onSuccess(savedNote);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to save clinical note');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Edit Clinical Note' : 'Add Clinical Note'}
              </h2>
              <p className="text-sm text-gray-600">
                {isEditing ? 'Update the clinical note details' : 'Create a new clinical note for the patient'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-red-800 font-medium text-sm mb-1">Error</h4>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter note title"
                disabled={loading}
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <CustomDropdown
                options={[
                  { value: 'General', label: 'General' },
                  { value: 'Diagnosis', label: 'Diagnosis' },
                  { value: 'Treatment', label: 'Treatment' },
                  { value: 'Follow-up', label: 'Follow-up' },
                  { value: 'Test Results', label: 'Test Results' },
                  { value: 'Prescription', label: 'Prescription' },
                  { value: 'Referral', label: 'Referral' }
                ]}
                value={formData.category}
                onChange={(value) => handleInputChange('category', value)}
                placeholder="Select category"
                disabled={loading}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Enter clinical note content..."
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{loading ? 'Saving...' : (isEditing ? 'Update Note' : 'Add Note')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
