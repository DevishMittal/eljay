import { LoginCredentials, AuthResponse, Organization } from '@/types';

const API_BASE_URL = 'https://eljay-api.vizdale.com/api/v1';

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }

      const data: AuthResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('organization');
    
    // Clear cookies
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }

  static saveAuthData(token: string, refreshToken: string, organization: Organization): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('organization', JSON.stringify(organization));
    
    // Also set cookies for server-side authentication
    document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
    document.cookie = `refresh_token=${refreshToken}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Strict`;
  }

  static getAuthData(): {
    token: string | null;
    refreshToken: string | null;
    organization: Organization | null;
  } {
    const token = localStorage.getItem('auth_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const organization = localStorage.getItem('organization');

    return {
      token,
      refreshToken,
      organization: organization ? JSON.parse(organization) : null,
    };
  }

  static isAuthenticated(): boolean {
    const { token } = this.getAuthData();
    return !!token;
  }
}
