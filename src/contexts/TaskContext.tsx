'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';
import { taskService } from '@/services/taskService';
import { Task, CreateTaskInput, UpdateTaskInput, LegacyTask, convertNewToLegacyTask, convertLegacyToNewTask } from '@/types/task.types';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  addTask: (task: CreateTaskInput) => Promise<void>;
  updateTask: (id: string, updates: UpdateTaskInput) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<void>;
  getTodayTasks: () => Task[];
  getTomorrowTasks: () => Task[];
  getOverdueTasks: () => Task[];
  getUpcomingTasks: () => Task[];
  getPendingTasks: () => Task[];
  getDoneTasks: () => Task[];
  getTaskStats: () => {
    total: number;
    completed: number;
    today: number;
    tomorrow: number;
    overdue: number;
    upcoming: number;
  };
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Helper functions for date comparison with ISO strings
const isToday = (dateString: string | null): boolean => {
  if (!dateString) return false;
  const today = new Date();
  const taskDate = new Date(dateString);
  return taskDate.toDateString() === today.toDateString();
};

const isTomorrow = (dateString: string | null): boolean => {
  if (!dateString) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const taskDate = new Date(dateString);
  return taskDate.toDateString() === tomorrow.toDateString();
};

const isOverdue = (dateString: string | null): boolean => {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDate = new Date(dateString);
  taskDate.setHours(0, 0, 0, 0);
  return taskDate < today;
};

const isUpcoming = (dateString: string | null): boolean => {
  if (!dateString) return false;
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const taskDate = new Date(dateString);
  
  return taskDate > tomorrow && taskDate <= nextWeek;
};

// Helper function to calculate reminder time
const calculateReminderTime = (dueDate: Date, reminderTime: string, customTime?: string): Date => {
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

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { addNotification } = useNotification();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load tasks from API on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskService.getTasks({ limit: 100 }); // Get all tasks
      if (response.status === 'success') {
        setTasks(response.data.tasks);
      } else {
        throw new Error(response.message || 'Failed to load tasks');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tasks';
      setError(errorMessage);
      console.error('Failed to load tasks:', err);
      addNotification({
        type: 'system_alert',
        priority: 'high',
        title: 'Error Loading Tasks',
        message: errorMessage,
        isActionRequired: false,
      });
    } finally {
      setLoading(false);
    }
  };

  // Check for task reminders and create notifications
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      
      tasks.forEach(task => {
        if (task.reminderAt && task.status !== 'completed') {
          const reminderTime = new Date(task.reminderAt);
          
          // Check if reminder time has passed and we haven't created a notification yet
          if (now >= reminderTime && now <= new Date(reminderTime.getTime() + 60000)) { // Within 1 minute window
            addNotification({
              type: 'task_reminder',
              priority: task.priority,
              title: 'Task Reminder',
              message: `Task "${task.title}" is due soon`,
              isActionRequired: true,
              relatedEntityId: task.id,
              relatedEntityType: 'task',
              actionUrl: '/dashboard',
              metadata: {
                taskTitle: task.title,
                taskDescription: task.description,
                dueDate: task.dueDate,
              }
            });
          }
        }
      });
    };

    // Check reminders every minute
    const interval = setInterval(checkReminders, 60000);
    
    // Initial check
    checkReminders();

    return () => clearInterval(interval);
  }, [tasks, addNotification]);

  const addTask = async (taskData: CreateTaskInput) => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskService.createTask(taskData);
      if (response.status === 'success') {
        setTasks(prev => [...prev, response.data]);
        addNotification({
          type: 'task_reminder',
          priority: 'medium',
          title: 'Task Created',
          message: `Task "${taskData.title}" has been created successfully`,
          isActionRequired: false,
        });
      } else {
        throw new Error(response.message || 'Failed to create task');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      setError(errorMessage);
      console.error('Failed to create task:', err);
      addNotification({
        type: 'system_alert',
        priority: 'high',
        title: 'Error Creating Task',
        message: errorMessage,
        isActionRequired: false,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id: string, updates: UpdateTaskInput) => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskService.updateTask(id, updates);
      if (response.status === 'success') {
        setTasks(prev => prev.map(task => 
          task.id === id ? response.data : task
        ));
        addNotification({
          type: 'task_reminder',
          priority: 'medium',
          title: 'Task Updated',
          message: `Task has been updated successfully`,
          isActionRequired: false,
        });
      } else {
        throw new Error(response.message || 'Failed to update task');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      console.error('Failed to update task:', err);
      addNotification({
        type: 'system_alert',
        priority: 'high',
        title: 'Error Updating Task',
        message: errorMessage,
        isActionRequired: false,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskService.deleteTask(id);
      if (response.status === 'success') {
        setTasks(prev => prev.filter(task => task.id !== id));
        addNotification({
          type: 'task_reminder',
          priority: 'medium',
          title: 'Task Deleted',
          message: 'Task has been deleted successfully',
          isActionRequired: false,
        });
      } else {
        throw new Error(response.message || 'Failed to delete task');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      setError(errorMessage);
      console.error('Failed to delete task:', err);
      addNotification({
        type: 'system_alert',
        priority: 'high',
        title: 'Error Deleting Task',
        message: errorMessage,
        isActionRequired: false,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (id: string) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await updateTask(id, { status: newStatus });
    } catch (err) {
      console.error('Failed to toggle task completion:', err);
      // Error handling is done in updateTask
    }
  };

  const getTodayTasks = () => {
    return tasks.filter(task => isToday(task.dueDate));
  };

  const getTomorrowTasks = () => {
    return tasks.filter(task => isTomorrow(task.dueDate));
  };

  const getOverdueTasks = () => {
    return tasks.filter(task => isOverdue(task.dueDate) && task.status !== 'completed');
  };

  const getUpcomingTasks = () => {
    return tasks.filter(task => isUpcoming(task.dueDate));
  };

  const getPendingTasks = () => {
    return tasks.filter(task => task.status === 'pending' && !isOverdue(task.dueDate) && !isToday(task.dueDate));
  };

  const getDoneTasks = () => {
    return tasks.filter(task => task.status === 'completed');
  };

  const refreshTasks = async () => {
    await loadTasks();
  };

  const getTaskStats = () => {
    const todayTasks = getTodayTasks();
    const tomorrowTasks = getTomorrowTasks();
    const overdueTasks = getOverdueTasks();
    const upcomingTasks = getUpcomingTasks();

    return {
      total: tasks.length,
      completed: tasks.filter(task => task.status === 'completed').length,
      today: todayTasks.length,
      tomorrow: tomorrowTasks.length,
      overdue: overdueTasks.length,
      upcoming: upcomingTasks.length,
    };
  };

  const value: TaskContextType = {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    getTodayTasks,
    getTomorrowTasks,
    getOverdueTasks,
    getUpcomingTasks,
    getPendingTasks,
    getDoneTasks,
    getTaskStats,
    refreshTasks,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}
