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

// Legacy interface for backward compatibility during transition
export interface LegacyTask {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: Date;
  taskType: 'General' | 'Patient Care' | 'Administrative' | 'Equipment' | 'Training';
  completed: boolean;
  setReminder: boolean;
  reminderTime?: '5 minutes before' | '15 minutes before' | '30 minutes before' | '1 hour before' | '2 hours before' | '1 day before' | 'custom';
  customReminderTime?: string;
  createdAt: Date;
  completedAt?: Date;
}

// Utility functions to convert between legacy and new formats
export const convertLegacyToNewTask = (legacyTask: LegacyTask): Task => {
  return {
    id: legacyTask.id,
    title: legacyTask.title,
    description: legacyTask.description || null,
    dueDate: legacyTask.dueDate.toISOString().split('T')[0],
    priority: legacyTask.priority.toLowerCase() as 'low' | 'medium' | 'high',
    type: mapLegacyTaskType(legacyTask.taskType),
    status: legacyTask.completed ? 'completed' : 'pending',
    reminderAt: legacyTask.setReminder ? calculateReminderTime(legacyTask.dueDate, legacyTask.reminderTime, legacyTask.customReminderTime)?.toISOString() || null : null,
    assignedToId: null,
    appointmentId: null,
    organizationId: '', // Will be set by the context
    createdAt: legacyTask.createdAt.toISOString(),
    updatedAt: legacyTask.createdAt.toISOString(),
  };
};

export const convertNewToLegacyTask = (newTask: Task): LegacyTask => {
  return {
    id: newTask.id,
    title: newTask.title,
    description: newTask.description || '',
    priority: capitalizeFirst(newTask.priority) as 'Low' | 'Medium' | 'High',
    dueDate: newTask.dueDate ? new Date(newTask.dueDate) : new Date(),
    taskType: mapNewTaskType(newTask.type),
    completed: newTask.status === 'completed',
    setReminder: !!newTask.reminderAt,
    reminderTime: newTask.reminderAt ? '15 minutes before' : undefined,
    customReminderTime: undefined,
    createdAt: new Date(newTask.createdAt),
    completedAt: newTask.status === 'completed' ? new Date(newTask.updatedAt) : undefined,
  };
};

// Helper functions
const mapLegacyTaskType = (taskType: string): 'general' | 'follow_up' | 'equipment_maintenance' | 'review_results' | 'schedule_appointment' => {
  switch (taskType) {
    case 'Patient Care':
      return 'follow_up';
    case 'Equipment':
      return 'equipment_maintenance';
    case 'Administrative':
      return 'review_results';
    case 'Training':
      return 'general';
    default:
      return 'general';
  }
};

const mapNewTaskType = (type: string): 'General' | 'Patient Care' | 'Administrative' | 'Equipment' | 'Training' => {
  switch (type) {
    case 'follow_up':
      return 'Patient Care';
    case 'equipment_maintenance':
      return 'Equipment';
    case 'review_results':
      return 'Administrative';
    case 'schedule_appointment':
      return 'General';
    default:
      return 'General';
  }
};

const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const calculateReminderTime = (dueDate: Date, reminderTime?: string, customTime?: string): Date | null => {
  if (reminderTime === 'custom' && customTime) {
    return new Date(customTime);
  }
  
  const reminderDate = new Date(dueDate);
  
  switch (reminderTime) {
    case '5 minutes before':
      reminderDate.setMinutes(reminderDate.getMinutes() - 5);
      break;
    case '15 minutes before':
      reminderDate.setMinutes(reminderDate.getMinutes() - 15);
      break;
    case '30 minutes before':
      reminderDate.setMinutes(reminderDate.getMinutes() - 30);
      break;
    case '1 hour before':
      reminderDate.setHours(reminderDate.getHours() - 1);
      break;
    case '2 hours before':
      reminderDate.setHours(reminderDate.getHours() - 2);
      break;
    case '1 day before':
      reminderDate.setDate(reminderDate.getDate() - 1);
      break;
    default:
      reminderDate.setMinutes(reminderDate.getMinutes() - 15); // Default to 15 minutes
  }
  
  return reminderDate;
};
