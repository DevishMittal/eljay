'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils';
import Image from 'next/image';
import { useNotification } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import NotificationDropdown from '@/components/ui/notification-dropdown';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { getNotificationStats } = useNotification();
  const { logout, organization } = useAuth();
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  
  const notificationStats = getNotificationStats();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className={cn('w-full bg-white border-custom-b px-6 py-2', className)}>
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg 
                className="h-5 w-5 text-search-placeholder" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[70%] pl-10 pr-4 py-2 bg-[#F9FAFB] border border-search-border rounded-lg text-xs text-[#4A5565] placeholder:text-search-placeholder"
            />
          </div>
        </div>

        {/* Right Side - Notifications and Profile */}
        <div className="flex items-center space-x-4">
          {/* Bell Icon with Notification Badge */}
          <div className="relative">
            <button 
              onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Image
                src="/bell-icon.svg"
                alt="Notifications"
                width={15}
                height={15}
                className="w-5 h-5"
              />
              {/* Dynamic Notification Badge */}
              {notificationStats.unread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notificationStats.unread > 99 ? '99+' : notificationStats.unread}
                </span>
              )}
            </button>
            
            {/* Notification Dropdown */}
            <NotificationDropdown
              isOpen={isNotificationDropdownOpen}
              onClose={() => setIsNotificationDropdownOpen(false)}
            />
          </div>

          {/* Profile Section */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center space-x-1 hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              {/* Profile Avatar */}
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-foreground">
                  {organization?.name?.charAt(0) || 'E'}
                </span>
              </div>
              
              {/* Profile Info */}
              <div className="flex flex-col">
                <span className="text-xs font-medium text-[#101828]">
                  {organization?.name || 'Eljay Hearing Care'}
                </span>
                <span className="text-xs text-[#667085]">Management System</span>
              </div>
              
              {/* Dropdown Arrow */}
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isProfileDropdownOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Profile Dropdown */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                    <div className="font-medium">{organization?.name}</div>
                    <div className="text-xs text-gray-500">{organization?.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
