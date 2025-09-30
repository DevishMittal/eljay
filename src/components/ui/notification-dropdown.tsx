/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useNotification, getNotificationIcon, getRelativeTime } from '@/contexts/NotificationContext';
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
    getNotificationStats 
  } = useNotification();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Show all notifications in dropdown
  const filteredNotifications = notifications;

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


  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={cn(
        'absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🔔</span>
          <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {stats.unread} new
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close notifications"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-400 text-3xl mb-2">🔔</div>
            <p className="text-xs text-gray-500">No notifications</p>
          </div>
        ) : (
          <>
            {/* NEW Section */}
            {filteredNotifications.filter(n => !n.isRead).length > 0 && (
              <>
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                  <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    NEW ({filteredNotifications.filter(n => !n.isRead).length})
                  </h4>
                </div>
                <div className="divide-y divide-gray-100">
                  {filteredNotifications.filter(n => !n.isRead).map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        'px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer',
                        notification.priority === 'high' && 'bg-red-50',
                        notification.priority === 'urgent' && 'bg-red-50'
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          <span className="text-base">{getNotificationIcon(notification.type)}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-xs font-medium text-gray-900">
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
                  <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    EARLIER
                  </h4>
                </div>
                <div className="divide-y divide-gray-100">
                  {filteredNotifications.filter(n => n.isRead).map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          <span className="text-base">{getNotificationIcon(notification.type)}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-xs font-medium text-gray-900">
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
        <div className="flex items-center justify-between p-3 !border-t border-gray-200">
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
          >
            Mark All Read
          </button>
          <button
            onClick={() => {
              router.push('/notifications');
              onClose();
            }}
            className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
          >
            View All
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
