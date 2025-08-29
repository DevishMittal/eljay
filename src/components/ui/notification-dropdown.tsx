/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useNotification, getNotificationIcon, getPriorityColor, getRelativeTime } from '@/contexts/NotificationContext';
import { cn } from '@/utils';
import { useRouter } from 'next/navigation';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ 
  isOpen, 
  onClose, 
  className 
}) => {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    getNotificationStats 
  } = useNotification();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'action_required'>('all');

  const stats = getNotificationStats();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Filter notifications based on active tab
  const filteredNotifications = React.useMemo(() => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'action_required':
        return notifications.filter(n => n.isActionRequired && !n.isRead);
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
    
    onClose();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDeleteNotification = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={cn(
        'absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50',
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <span className="text-sm text-gray-500">{stats.unread} unread</span>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              activeTab === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={cn(
              'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              activeTab === 'unread'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Unread ({stats.unread})
          </button>
          <button
            onClick={() => setActiveTab('action_required')}
            className={cn(
              'flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              activeTab === 'action_required'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            Action ({stats.actionRequired})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-2">🔔</div>
            <p className="text-gray-500 text-sm">
              {activeTab === 'unread' 
                ? 'No unread notifications' 
                : activeTab === 'action_required'
                ? 'No action required'
                : 'No notifications'}
            </p>
          </div>
        ) : (
          <div className="py-2">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  'px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors',
                  !notification.isRead 
                    ? 'bg-blue-50 border-l-blue-500' 
                    : 'border-l-transparent',
                  notification.priority === 'urgent' && 'border-l-red-500',
                  notification.priority === 'high' && 'border-l-orange-500',
                  notification.priority === 'medium' && 'border-l-yellow-500',
                  notification.priority === 'low' && 'border-l-green-500'
                )}
              >
                <div className="flex items-start space-x-3">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <div className="flex items-center space-x-2">
                        {/* Priority Badge */}
                        <span className={cn(
                          'inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium',
                          getPriorityColor(notification.priority)
                        )}>
                          {notification.priority}
                        </span>
                        
                        {/* Action Required Badge */}
                        {notification.isActionRequired && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            task
                          </span>
                        )}
                        
                        {/* Delete Button */}
                        <button
                          onClick={(e) => handleDeleteNotification(e, notification.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Delete notification"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 mb-1">
                      {notification.message}
                    </p>
                    
                    <p className="text-xs text-gray-400">
                      {getRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {stats.unread > 0 && (
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Mark All Read
            </button>
            <button
              onClick={() => {
                router.push('/notifications');
                onClose();
              }}
              className="text-sm text-gray-600 hover:text-gray-700"
            >
              View All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
