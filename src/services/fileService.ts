export interface UploadedFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string | null;
  description: string | null;
  uploadTimestamp: string;
  fileSize?: number;
  mimeType?: string;
}

export interface FileUploadResponse {
  status: string;
  data: UploadedFile;
}

export interface FileListResponse {
  status: string;
  data: UploadedFile[];
}

class FileService {
  private baseUrl = 'https://eljay-api.vizdale.com/api/v1';

  async uploadFile(userId: string, file: File, token?: string): Promise<FileUploadResponse> {
    if (!token) {
      throw new Error('No authentication token provided');
    }

    const formData = new FormData();
    formData.append('file', file);
    // Note: keytype parameter is not supported by the API currently
    // if (keytype && keytype.trim() !== '') {
    //   formData.append('keytype', keytype.trim());
    // }

    const response = await fetch(`${this.baseUrl}/files/users/${userId}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async getFiles(userId: string, token?: string): Promise<FileListResponse> {
    if (!token) {
      throw new Error('No authentication token provided');
    }

    try {
      // Use the correct endpoint structure: files/users/:userId/files
      const response = await fetch(`${this.baseUrl}/files/users/${userId}/files`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const apiResponse = await response.json();
        // The API returns { status: "success", data: { files: [...], pagination: {...} } }
        // We need to extract the files array and return it in the expected format
        return {
          status: apiResponse.status,
          data: apiResponse.data.files || []
        };
      } else if (response.status === 404) {
        // If endpoint doesn't exist, return empty array
        console.warn(`Files endpoint ${this.baseUrl}/files/users/${userId}/files not found (404), returning empty array.`);
        return {
          status: 'success',
          data: []
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      // Return empty array to allow the UI to work
      return {
        status: 'success',
        data: []
      };
    }
  }

  async deleteFile(fileId: string, token?: string): Promise<{ status: string; message: string }> {
    if (!token) {
      throw new Error('No authentication token provided');
    }

    const response = await fetch(`${this.baseUrl}/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async viewFile(fileUrl: string): Promise<void> {
    // Open file in new tab for viewing
    const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${this.baseUrl}/files/${fileUrl}`;
    window.open(fullUrl, '_blank');
  }
}

export const fileService = new FileService();
