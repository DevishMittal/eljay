/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Settings, 
  Calendar, 
DollarSign, 
  User, 
  TestTube, 
  Clock, 
  AlertTriangle, 
  Package, 
  Timer, 
  CreditCard, 
  ClipboardList, 
  AlertCircle, 
  Bell 
} from 'lucide-react';
import { Notification, NotificationStats, CreateNotificationData } from '@/types';
import { generateRealTimeNotifications, checkNotificationTriggers } from '@/services/notificationService';

interface NotificationContextType {
  notifications: Notification[];
  isLoading: boolean;
  addNotification: (data: CreateNotificationData) => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  deleteNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
  refreshNotifications: () => Promise<void>;
  getUnreadNotifications: () => Notification[];
  getActionRequiredNotifications: () => Notification[];
  getNotificationsByType: (type: Notification['type']) => Notification[];
  getNotificationsByPriority: (priority: Notification['priority']) => Notification[];
  getNotificationStats: () => NotificationStats;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Helper function to generate notification icon based on type
export const getNotificationIcon = (type: Notification['type'], priority?: Notification['priority']) => {
  const baseSize = 18;
  
  // Color mapping based on notification type and priority
  const getIconColor = (type: Notification['type'], priority?: Notification['priority']) => {
    // High priority overrides type colors
    if (priority === 'urgent') return 'text-red-600';
    if (priority === 'high') return 'text-orange-600';
    
    // Type-specific colors
    switch (type) {
      case 'equipment_maintenance':
        return 'text-blue-600';
      case 'schedule_appointment':
        return 'text-green-600';
      case 'payment_overdue':
        return 'text-red-600';
      case 'new_patient_registration':
        return 'text-emerald-600';
      case 'lab_results_ready':
        return 'text-purple-600';
      case 'task_reminder':
        return 'text-amber-600';
      case 'system_alert':
        return 'text-red-600';
      case 'low_stock':
        return 'text-yellow-600';
      case 'pending_tasks':
        return 'text-indigo-600';
      case 'overdue_payment':
        return 'text-red-600';
      case 'todays_appointments':
        return 'text-cyan-600';
      case 'expired_items':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };
  
  const iconProps = { 
    size: baseSize, 
    className: getIconColor(type, priority) 
  };
  
  switch (type) {
    case 'equipment_maintenance':
      return <Settings {...iconProps} />;
    case 'schedule_appointment':
      return <Calendar {...iconProps} />;
    case 'payment_overdue':
      return <DollarSign {...iconProps} />;
    case 'new_patient_registration':
      return <User {...iconProps} />;
    case 'lab_results_ready':
      return <TestTube {...iconProps} />;
    case 'task_reminder':
      return <Clock {...iconProps} />;
    case 'system_alert':
      return <AlertTriangle {...iconProps} />;
    case 'low_stock':
      return <Package {...iconProps} />;
    case 'pending_tasks':
      return <Timer {...iconProps} />;
    case 'overdue_payment':
      return <CreditCard {...iconProps} />;
    case 'todays_appointments':
      return <ClipboardList {...iconProps} />;
    case 'expired_items':
      return <AlertCircle {...iconProps} />;
    default:
      return <Bell {...iconProps} />;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load real-time notifications on mount and periodically
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        
        // Load saved notifications from localStorage first
        const savedNotifications = localStorage.getItem('eljay-notifications');
        let existingNotifications: Notification[] = [];
        
        if (savedNotifications) {
          try {
            const parsedNotifications = JSON.parse(savedNotifications);
            existingNotifications = parsedNotifications.map((notification: any) => ({
              ...notification,
              createdAt: new Date(notification.createdAt),
              readAt: notification.readAt ? new Date(notification.readAt) : undefined,
            }));
          } catch (error) {
            console.error('Failed to load notifications from localStorage:', error);
          }
        }

        // Generate real-time notifications from API data
        const realTimeNotifications = await generateRealTimeNotifications();
        const triggerNotifications = await checkNotificationTriggers();
        
        // Combine existing and new notifications, avoiding duplicates
        const allNotifications = [...existingNotifications];
        const existingIds = new Set(existingNotifications.map(n => n.id));
        
        [...realTimeNotifications, ...triggerNotifications].forEach(notification => {
          if (!existingIds.has(notification.id)) {
            allNotifications.push(notification);
          }
        });

        // Sort by creation date (newest first)
        allNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        setNotifications(allNotifications);
          } catch {
            // Silent error handling
          } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();

    // Set up periodic refresh every 5 minutes
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
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

  const refreshNotifications = async () => {
    try {
      setIsLoading(true);
      
      // Generate fresh notifications from API data
      const realTimeNotifications = await generateRealTimeNotifications();
      const triggerNotifications = await checkNotificationTriggers();
      
      // Get existing notifications that are read (to preserve them)
      const existingReadNotifications = notifications.filter(n => n.isRead);
      const existingIds = new Set(existingReadNotifications.map(n => n.id));
      
      // Combine existing read notifications with new ones
      const allNotifications = [...existingReadNotifications];
      
      [...realTimeNotifications, ...triggerNotifications].forEach(notification => {
        if (!existingIds.has(notification.id)) {
          allNotifications.push(notification);
        }
      });

      // Sort by creation date (newest first)
      allNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setIsLoading(false);
    }
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
      low_stock: notifications.filter(n => n.type === 'low_stock').length,
      pending_tasks: notifications.filter(n => n.type === 'pending_tasks').length,
      overdue_payment: notifications.filter(n => n.type === 'overdue_payment').length,
      todays_appointments: notifications.filter(n => n.type === 'todays_appointments').length,
      expired_items: notifications.filter(n => n.type === 'expired_items').length,
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
    isLoading,
    addNotification,
    updateNotification,
    deleteNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    refreshNotifications,
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
