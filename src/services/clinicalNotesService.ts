import { ClinicalNote, CreateClinicalNoteData, UpdateClinicalNoteData } from '@/types';

const API_BASE_URL = 'https://eljay-api.vizdale.com/api/v1';

export const clinicalNotesService = {
  // Get clinical notes for a user
  async getClinicalNotes(
    userId: string, 
    page: number = 1, 
    limit: number = 10, 
    token?: string
  ): Promise<{ clinicalNotes: ClinicalNote[]; pagination: any }> {
    const response = await fetch(
      `${API_BASE_URL}/clinical-notes/users/${userId}/notes?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch clinical notes');
    }

    const data = await response.json();
    return data.data;
  },

  // Create a new clinical note
  async createClinicalNote(
    userId: string, 
    noteData: CreateClinicalNoteData, 
    token?: string
  ): Promise<ClinicalNote> {
    const response = await fetch(
      `${API_BASE_URL}/clinical-notes/users/${userId}/notes`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(noteData),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create clinical note');
    }

    const data = await response.json();
    return data.data;
  },

  // Update an existing clinical note
  async updateClinicalNote(
    userId: string, 
    noteId: string, 
    noteData: UpdateClinicalNoteData, 
    token?: string
  ): Promise<ClinicalNote> {
    const response = await fetch(
      `${API_BASE_URL}/clinical-notes/users/${userId}/notes/${noteId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(noteData),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update clinical note');
    }

    const data = await response.json();
    return data.data;
  },

  // Delete a clinical note
  async deleteClinicalNote(
    userId: string, 
    noteId: string, 
    token?: string
  ): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/clinical-notes/users/${userId}/notes/${noteId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete clinical note');
    }
  },
};
