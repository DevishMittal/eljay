'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';

export interface Task {
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

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
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
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Helper functions
const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
};

const isOverdue = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const taskDate = new Date(date);
  taskDate.setHours(0, 0, 0, 0);
  return taskDate < today;
};

const isUpcoming = (date: Date): boolean => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  return date > tomorrow && date <= nextWeek;
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
  const [tasks, setTasks] = useState<Task[]>([
    // Sample tasks
    {
      id: '1',
      title: 'Review patient records',
      description: 'Review and update patient records for today\'s appointments',
      priority: 'High',
      dueDate: new Date(), // Today
      taskType: 'Patient Care',
      completed: false,
      setReminder: true,
      reminderTime: '15 minutes before',
      createdAt: new Date(Date.now() - 86400000), // Yesterday
    },
    {
      id: '2',
      title: 'Equipment maintenance',
      description: 'Perform routine maintenance on audiometry equipment',
      priority: 'Medium',
      dueDate: new Date(), // Today
      taskType: 'Equipment',
      completed: true,
      setReminder: false,
      createdAt: new Date(Date.now() - 172800000), // 2 days ago
      completedAt: new Date(),
    },
    {
      id: '3',
      title: 'Staff training session',
      description: 'Conduct training on new hearing aid technology',
      priority: 'Medium',
      dueDate: new Date(Date.now() + 86400000), // Tomorrow
      taskType: 'Training',
      completed: false,
      setReminder: true,
      reminderTime: '1 hour before',
      createdAt: new Date(),
    },
    {
      id: '4',
      title: 'Inventory check',
      description: 'Check and update inventory levels',
      priority: 'Low',
      dueDate: new Date(Date.now() - 86400000), // Yesterday (overdue)
      taskType: 'Administrative',
      completed: false,
      setReminder: false,
      createdAt: new Date(Date.now() - 259200000), // 3 days ago
    },
    {
      id: '5',
      title: 'Follow up with patients',
      description: 'Call patients for hearing aid adjustment feedback',
      priority: 'High',
      dueDate: new Date(Date.now() + 172800000), // Day after tomorrow
      taskType: 'Patient Care',
      completed: false,
      setReminder: true,
      reminderTime: '30 minutes before',
      createdAt: new Date(),
    },
  ]);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('eljay-tasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        // Convert date strings back to Date objects
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tasksWithDates = parsedTasks.map((task: any) => ({
          ...task,
          dueDate: new Date(task.dueDate),
          createdAt: new Date(task.createdAt),
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        }));
        setTasks(tasksWithDates);
      } catch (error) {
        console.error('Failed to load tasks from localStorage:', error);
      }
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('eljay-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Check for task reminders and create notifications
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      
      tasks.forEach(task => {
        if (task.setReminder && task.reminderTime && !task.completed) {
          const reminderTime = calculateReminderTime(task.dueDate, task.reminderTime, task.customReminderTime);
          
          // Check if reminder time has passed and we haven't created a notification yet
          if (now >= reminderTime && now <= new Date(reminderTime.getTime() + 60000)) { // Within 1 minute window
            addNotification({
              type: 'task_reminder',
              priority: task.priority.toLowerCase() as 'low' | 'medium' | 'high',
              title: 'Task Reminder',
              message: `Task "${task.title}" is due ${task.reminderTime === 'custom' ? 'at the scheduled time' : task.reminderTime}`,
              isActionRequired: true,
              relatedEntityId: task.id,
              relatedEntityType: 'task',
              actionUrl: '/dashboard',
              metadata: {
                taskTitle: task.title,
                taskDescription: task.description,
                dueDate: task.dueDate,
                reminderTime: task.reminderTime
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

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { 
            ...task, 
            completed: !task.completed,
            completedAt: !task.completed ? new Date() : undefined
          }
        : task
    ));
  };

  const getTodayTasks = () => {
    return tasks.filter(task => isToday(task.dueDate));
  };

  const getTomorrowTasks = () => {
    return tasks.filter(task => isTomorrow(task.dueDate));
  };

  const getOverdueTasks = () => {
    return tasks.filter(task => isOverdue(task.dueDate) && !task.completed);
  };

  const getUpcomingTasks = () => {
    return tasks.filter(task => isUpcoming(task.dueDate));
  };

  const getPendingTasks = () => {
    return tasks.filter(task => !task.completed && !isOverdue(task.dueDate) && !isToday(task.dueDate));
  };

  const getDoneTasks = () => {
    return tasks.filter(task => task.completed);
  };

  const getTaskStats = () => {
    const todayTasks = getTodayTasks();
    const tomorrowTasks = getTomorrowTasks();
    const overdueTasks = getOverdueTasks();
    const upcomingTasks = getUpcomingTasks();

    return {
      total: tasks.length,
      completed: tasks.filter(task => task.completed).length,
      today: todayTasks.length,
      tomorrow: tomorrowTasks.length,
      overdue: overdueTasks.length,
      upcoming: upcomingTasks.length,
    };
  };

  const value: TaskContextType = {
    tasks,
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
