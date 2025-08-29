'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification, NotificationStats, CreateNotificationData } from '@/types';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (data: CreateNotificationData) => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  deleteNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
  getUnreadNotifications: () => Notification[];
  getActionRequiredNotifications: () => Notification[];
  getNotificationsByType: (type: Notification['type']) => Notification[];
  getNotificationsByPriority: (priority: Notification['priority']) => Notification[];
  getNotificationStats: () => NotificationStats;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Helper function to generate notification icon based on type
export const getNotificationIcon = (type: Notification['type']): string => {
  switch (type) {
    case 'equipment_maintenance':
      return '⚙️';
    case 'schedule_appointment':
      return '📅';
    case 'payment_overdue':
      return '💰';
    case 'new_patient_registration':
      return '👤';
    case 'lab_results_ready':
      return '🔬';
    case 'task_reminder':
      return '⏰';
    case 'system_alert':
      return '🚨';
    default:
      return '🔔';
  }
};

// Helper function to get priority color
export const getPriorityColor = (priority: Notification['priority']): string => {
  switch (priority) {
    case 'low':
      return 'text-green-600 bg-green-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'high':
      return 'text-orange-600 bg-orange-100';
    case 'urgent':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

// Helper function to format relative time
export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([
    // Sample notifications based on the images shown
    {
      id: '1',
      type: 'equipment_maintenance',
      priority: 'medium',
      title: 'Equipment Maintenance',
      message: 'Calibrate equipment for newborn hearing screening at Sunrise Hospital',
      isRead: false,
      isActionRequired: true,
      createdAt: new Date(Date.now() - 60000), // 1 minute ago
      actionUrl: '/settings/equipment',
      relatedEntityType: 'equipment',
      metadata: { location: 'Sunrise Hospital', equipmentType: 'newborn_screening' }
    },
    {
      id: '2',
      type: 'schedule_appointment',
      priority: 'medium',
      title: 'Schedule Appointment',
      message: 'Confirm Baby Miller appointment and testing protocols',
      isRead: false,
      isActionRequired: true,
      createdAt: new Date(Date.now() - 60000), // 1 minute ago
      actionUrl: '/appointments',
      relatedEntityType: 'appointment',
      relatedEntityId: 'baby-miller-001',
      metadata: { patientName: 'Baby Miller', appointmentType: 'testing_protocols' }
    },
    {
      id: '3',
      type: 'payment_overdue',
      priority: 'high',
      title: 'Payment Overdue',
      message: 'Invoice #INV-2024-001 for John Smith is 7 days overdue (₹2,500)',
      isRead: false,
      isActionRequired: true,
      createdAt: new Date(Date.now() - 14400000), // 4 hours ago
      actionUrl: '/billing/invoices/INV-2024-001',
      relatedEntityType: 'invoice',
      relatedEntityId: 'INV-2024-001',
      metadata: { patientName: 'John Smith', amount: 2500, daysOverdue: 7 }
    },
    {
      id: '4',
      type: 'lab_results_ready',
      priority: 'medium',
      title: 'Lab Results Ready',
      message: 'Audiogram results for Maria Garcia are ready for review',
      isRead: false,
      isActionRequired: true,
      createdAt: new Date(Date.now() - 14400000), // 4 hours ago
      actionUrl: '/patients/maria-garcia-001/emr',
      relatedEntityType: 'patient',
      relatedEntityId: 'maria-garcia-001',
      metadata: { patientName: 'Maria Garcia', testType: 'audiogram' }
    },
    {
      id: '5',
      type: 'new_patient_registration',
      priority: 'low',
      title: 'New Patient Registration',
      message: 'Baby Miller has been registered for newborn hearing screening',
      isRead: false,
      isActionRequired: false,
      createdAt: new Date(Date.now() - 21600000), // 6 hours ago
      actionUrl: '/patients/baby-miller-001',
      relatedEntityType: 'patient',
      relatedEntityId: 'baby-miller-001',
      metadata: { patientName: 'Baby Miller', registrationType: 'newborn_screening' }
    },
    {
      id: '6',
      type: 'equipment_maintenance',
      priority: 'medium',
      title: 'Equipment Maintenance',
      message: 'OAE equipment calibration scheduled for tomorrow',
      isRead: false,
      isActionRequired: true,
      createdAt: new Date(Date.now() - 28800000), // 8 hours ago
      actionUrl: '/settings/equipment',
      relatedEntityType: 'equipment',
      metadata: { equipmentType: 'OAE', scheduledDate: 'tomorrow' }
    },
    {
      id: '7',
      type: 'payment_overdue',
      priority: 'low',
      title: 'Payment Reminder',
      message: 'Invoice #INV-2024-002 payment due in 2 days (₹1,200)',
      isRead: false,
      isActionRequired: false,
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      actionUrl: '/billing/invoices/INV-2024-002',
      relatedEntityType: 'invoice',
      relatedEntityId: 'INV-2024-002',
      metadata: { patientName: 'Sarah Wilson', amount: 1200, dueInDays: 2 }
    },
    {
      id: '8',
      type: 'system_alert',
      priority: 'low',
      title: 'System Update',
      message: 'System maintenance scheduled for tonight at 11 PM',
      isRead: false,
      isActionRequired: false,
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      metadata: { maintenanceTime: '11 PM', estimatedDuration: '2 hours' }
    }
  ]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('eljay-notifications');
    if (savedNotifications) {
      try {
        const parsedNotifications = JSON.parse(savedNotifications);
        // Convert date strings back to Date objects
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const notificationsWithDates = parsedNotifications.map((notification: any) => ({
          ...notification,
          createdAt: new Date(notification.createdAt),
          readAt: notification.readAt ? new Date(notification.readAt) : undefined,
        }));
        setNotifications(notificationsWithDates);
      } catch (error) {
        console.error('Failed to load notifications from localStorage:', error);
      }
    }
  }, []);

  // Save notifications to localStorage whenever notifications change
  useEffect(() => {
    localStorage.setItem('eljay-notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (data: CreateNotificationData) => {
    const newNotification: Notification = {
      ...data,
      id: Date.now().toString(),
      isRead: false,
      isActionRequired: data.isActionRequired || false,
      createdAt: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const updateNotification = (id: string, updates: Partial<Notification>) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, ...updates } : notification
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id 
        ? { ...notification, isRead: true, readAt: new Date() }
        : notification
    ));
  };

  const markAllAsRead = () => {
    const now = new Date();
    setNotifications(prev => prev.map(notification => ({
      ...notification,
      isRead: true,
      readAt: notification.readAt || now
    })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getUnreadNotifications = () => {
    return notifications.filter(notification => !notification.isRead);
  };

  const getActionRequiredNotifications = () => {
    return notifications.filter(notification => notification.isActionRequired && !notification.isRead);
  };

  const getNotificationsByType = (type: Notification['type']) => {
    return notifications.filter(notification => notification.type === type);
  };

  const getNotificationsByPriority = (priority: Notification['priority']) => {
    return notifications.filter(notification => notification.priority === priority);
  };

  const getNotificationStats = (): NotificationStats => {
    const total = notifications.length;
    const unread = getUnreadNotifications().length;
    const actionRequired = getActionRequiredNotifications().length;

    const byPriority = {
      low: notifications.filter(n => n.priority === 'low').length,
      medium: notifications.filter(n => n.priority === 'medium').length,
      high: notifications.filter(n => n.priority === 'high').length,
      urgent: notifications.filter(n => n.priority === 'urgent').length,
    };

    const byType = {
      equipment_maintenance: notifications.filter(n => n.type === 'equipment_maintenance').length,
      schedule_appointment: notifications.filter(n => n.type === 'schedule_appointment').length,
      payment_overdue: notifications.filter(n => n.type === 'payment_overdue').length,
      new_patient_registration: notifications.filter(n => n.type === 'new_patient_registration').length,
      lab_results_ready: notifications.filter(n => n.type === 'lab_results_ready').length,
      task_reminder: notifications.filter(n => n.type === 'task_reminder').length,
      system_alert: notifications.filter(n => n.type === 'system_alert').length,
    };

    return {
      total,
      unread,
      actionRequired,
      byPriority,
      byType,
    };
  };

  const value: NotificationContextType = {
    notifications,
    addNotification,
    updateNotification,
    deleteNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    getUnreadNotifications,
    getActionRequiredNotifications,
    getNotificationsByType,
    getNotificationsByPriority,
    getNotificationStats,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
