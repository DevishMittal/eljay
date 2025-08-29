/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { useNotification, getNotificationIcon, getPriorityColor, getRelativeTime } from '@/contexts/NotificationContext';
import { cn } from '@/utils';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    getNotificationStats 
  } = useNotification();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'action_required'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const stats = getNotificationStats();

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
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleBulkMarkAsRead = () => {
    selectedNotifications.forEach(id => markAsRead(id));
    setSelectedNotifications([]);
  };

  const handleBulkDelete = () => {
    selectedNotifications.forEach(id => deleteNotification(id));
    setSelectedNotifications([]);
  };

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-1">
                {stats.unread} unread notifications • {stats.actionRequired} require action
              </p>
            </div>
            
            {stats.unread > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Mark All Read
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
              <div className="text-sm text-gray-600">Unread</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-orange-600">{stats.actionRequired}</div>
              <div className="text-sm text-gray-600">Action Required</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-red-600">{stats.byPriority.urgent + stats.byPriority.high}</div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4">
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors',
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
                'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors',
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
                'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors',
                activeTab === 'action_required'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              Action Required ({stats.actionRequired})
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800">
                {selectedNotifications.length} notification{selectedNotifications.length > 1 ? 's' : ''} selected
              </span>
              <div className="space-x-2">
                <button
                  onClick={handleBulkMarkAsRead}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Mark as Read
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-white rounded-lg border border-gray-200">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">🔔</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeTab === 'unread' 
                  ? 'No unread notifications' 
                  : activeTab === 'action_required'
                  ? 'No action required'
                  : 'No notifications'}
              </h3>
              <p className="text-gray-500">
                {activeTab === 'unread' 
                  ? 'All caught up! You have no unread notifications.' 
                  : activeTab === 'action_required'
                  ? 'Great! No notifications require immediate action.'
                  : 'You have no notifications at this time.'}
              </p>
            </div>
          ) : (
            <>
              {/* Select All Header */}
              <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Select all ({filteredNotifications.length})
                  </span>
                </label>
              </div>

              {/* Notifications */}
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'px-6 py-4 hover:bg-gray-50 border-l-4 transition-colors',
                      !notification.isRead 
                        ? 'bg-blue-50 border-l-blue-500' 
                        : 'border-l-transparent',
                      notification.priority === 'urgent' && 'border-l-red-500',
                      notification.priority === 'high' && 'border-l-orange-500',
                      notification.priority === 'medium' && 'border-l-yellow-500',
                      notification.priority === 'low' && 'border-l-green-500'
                    )}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => handleSelectNotification(notification.id)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />

                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {notification.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {/* Priority Badge */}
                            <span className={cn(
                              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                              getPriorityColor(notification.priority)
                            )}>
                              {notification.priority}
                            </span>
                            
                            {/* Action Required Badge */}
                            {notification.isActionRequired && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Action Required
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">
                            {getRelativeTime(notification.createdAt)}
                          </span>
                          
                          <div className="space-x-2">
                            {notification.actionUrl && (
                              <button
                                onClick={() => handleNotificationClick(notification)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                View Details
                              </button>
                            )}
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-gray-600 hover:text-gray-700 text-sm"
                              >
                                Mark as Read
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
