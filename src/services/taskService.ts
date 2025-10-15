import { AuthService } from './authService';

const API_BASE_URL = 'https://eljay-api.vizdale.com/api/v1';

// Task types matching backend schema
export interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null; // ISO date string
  priority: 'low' | 'medium' | 'high';
  type: 'general' | 'follow_up' | 'equipment_maintenance' | 'review_results' | 'schedule_appointment';
  status: 'pending' | 'in_progress' | 'completed';
  reminderAt: string | null; // ISO datetime string
  assignedToId: string | null;
  appointmentId: string | null;
  organizationId: string;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
  assignedTo?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  appointment?: {
    id: string;
    appointmentDate: string;
    appointmentTime: string;
  } | null;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: string; // ISO date string
  priority?: 'low' | 'medium' | 'high';
  type?: 'general' | 'follow_up' | 'equipment_maintenance' | 'review_results' | 'schedule_appointment';
  status?: 'pending' | 'in_progress' | 'completed';
  reminder?: string | null; // ISO datetime string
  assignedToId?: string;
  appointmentId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  dueDate?: string | null;
  priority?: 'low' | 'medium' | 'high';
  type?: 'general' | 'follow_up' | 'equipment_maintenance' | 'review_results' | 'schedule_appointment';
  status?: 'pending' | 'in_progress' | 'completed';
  reminder?: string | null;
  assignedToId?: string | null;
  appointmentId?: string | null;
}

export interface TaskFilters {
  status?: string;
  type?: string;
  assignedToId?: string;
  appointmentId?: string;
  q?: string; // search query
  dueFrom?: string; // ISO date string
  dueTo?: string; // ISO date string
  page?: number;
  limit?: number;
}

export interface TaskResponse {
  status: 'success' | 'error';
  data: Task;
  message?: string;
}

export interface TasksListResponse {
  status: 'success' | 'error';
  data: {
    tasks: Task[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
  message?: string;
}

export interface ApiError {
  status: 'error';
  message: string;
  errors?: any;
}

class TaskService {
  private getAuthToken(): string {
    const { token } = AuthService.getAuthData();
    if (!token) {
      throw new Error('No authentication token found');
    }
    return token;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        status: 'error',
        message: 'Network error occurred'
      }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async createTask(taskData: CreateTaskInput): Promise<TaskResponse> {
    return this.makeRequest<TaskResponse>('/appointments/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async getTasks(filters: TaskFilters = {}): Promise<TasksListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/appointments/tasks${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<TasksListResponse>(endpoint);
  }

  async getTaskById(id: string): Promise<TaskResponse> {
    return this.makeRequest<TaskResponse>(`/appointments/tasks/${id}`);
  }

  async updateTask(id: string, taskData: UpdateTaskInput): Promise<TaskResponse> {
    return this.makeRequest<TaskResponse>(`/appointments/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  }

  async deleteTask(id: string): Promise<{ status: 'success' | 'error'; message: string }> {
    return this.makeRequest<{ status: 'success' | 'error'; message: string }>(`/appointments/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Helper method to get tasks with common filters
  async getTasksByStatus(status: string): Promise<Task[]> {
    const response = await this.getTasks({ status });
    return response.data.tasks;
  }

  async getTasksByType(type: string): Promise<Task[]> {
    const response = await this.getTasks({ type });
    return response.data.tasks;
  }

  async getTasksByAssignee(assignedToId: string): Promise<Task[]> {
    const response = await this.getTasks({ assignedToId });
    return response.data.tasks;
  }

  async searchTasks(query: string): Promise<Task[]> {
    const response = await this.getTasks({ q: query });
    return response.data.tasks;
  }

  async getTasksByDateRange(dueFrom: string, dueTo: string): Promise<Task[]> {
    const response = await this.getTasks({ dueFrom, dueTo });
    return response.data.tasks;
  }

  // Helper method to get overdue tasks
  async getOverdueTasks(): Promise<Task[]> {
    const today = new Date().toISOString().split('T')[0];
    const response = await this.getTasks({ dueTo: today, status: 'pending' });
    return response.data.tasks;
  }

  // Helper method to get today's tasks
  async getTodayTasks(): Promise<Task[]> {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const response = await this.getTasks({ 
      dueFrom: today, 
      dueTo: tomorrowStr 
    });
    return response.data.tasks;
  }

  // Helper method to get pending tasks
  async getPendingTasks(): Promise<Task[]> {
    return this.getTasksByStatus('pending');
  }

  // Helper method to get completed tasks
  async getCompletedTasks(): Promise<Task[]> {
    return this.getTasksByStatus('completed');
  }
}

export const taskService = new TaskService();
export default taskService;
