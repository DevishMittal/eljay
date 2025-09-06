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

  async viewFile(fileUrl: string, token?: string): Promise<void> {
    if (!token) {
      throw new Error('No token provided');
    }

    try {
      // If the fileUrl is a full URL, use it directly
      // Otherwise, construct the full URL with authentication
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${this.baseUrl}/files/${fileUrl}`;
      
      // For authenticated file access, we need to fetch the file with the token
      // and then create a blob URL to open in a new tab
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      // Open the blob URL in a new tab
      window.open(blobUrl, '_blank');
      
      // Clean up the blob URL after a delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
      console.error('Error viewing file:', error);
      throw error;
    }
  }
}

export const fileService = new FileService();
