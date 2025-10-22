/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { useNotification, getNotificationIcon, getRelativeTime } from '@/contexts/NotificationContext';
import { cn } from '@/utils';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    getNotificationStats 
  } = useNotification();
  const router = useRouter();
  const [activeTab] = useState<'all' | 'unread' | 'action_required'>('all');

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


  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="text-gray-600">
                <Bell size={24} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Notifications</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {stats.unread} new
                  </span>
                </div>
              </div>
            </div>
            
            {stats.unread > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
              >
                Mark All Read
              </button>
            )}
          </div>

        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg border border-gray-200 max-h-[600px] overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-3 flex justify-center">
                <Bell size={48} />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                {activeTab === 'unread' 
                  ? 'No unread notifications' 
                  : activeTab === 'action_required'
                  ? 'No action required'
                  : 'No notifications'}
              </h3>
              <p className="text-xs text-gray-500">
                {activeTab === 'unread' 
                  ? 'All caught up! You have no unread notifications.' 
                  : activeTab === 'action_required'
                  ? 'Great! No notifications require immediate action.'
                  : 'You have no notifications at this time.'}
              </p>
            </div>
          ) : (
            <>
              {/* NEW Section */}
              {filteredNotifications.filter(n => !n.isRead).length > 0 && (
                <>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      NEW ({filteredNotifications.filter(n => !n.isRead).length})
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {filteredNotifications.filter(n => !n.isRead).map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer',
                          notification.priority === 'high' && 'bg-red-50',
                          notification.priority === 'urgent' && 'bg-red-50'
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type, notification.priority)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </h4>
                              <span className="text-xs text-gray-400">
                                {getRelativeTime(notification.createdAt)}
                              </span>
                            </div>
                            
                            <p className="text-xs text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            
                            {notification.isActionRequired && (
                              <div className="flex items-center space-x-1">
                                <span className="text-red-500 text-xs">!</span>
                                <span className="text-xs text-red-600 font-medium">High Priority</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* EARLIER Section */}
              {filteredNotifications.filter(n => n.isRead).length > 0 && (
                <>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      EARLIER
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {filteredNotifications.filter(n => n.isRead).map((notification) => (
                      <div
                        key={notification.id}
                        className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type, notification.priority)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </h4>
                              <span className="text-xs text-gray-400">
                                {getRelativeTime(notification.createdAt)}
                              </span>
                            </div>
                            
                            <p className="text-xs text-gray-600">
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {filteredNotifications.length > 0 && (
          <div className="flex items-center justify-start mt-4 px-2">
            <button
              onClick={markAllAsRead}
              className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
            >
              Mark All Read
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
