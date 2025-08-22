'use client';

import React, { useState } from 'react';
import { cn } from '@/utils';
import Image from 'next/image';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className={cn('w-full bg-white border-custom-b px-6 py-4', className)}>
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
              placeholder="Search audiologists, patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F9FAFB] border border-search-border rounded-lg text-sm text-[#4A5565] placeholder:text-search-placeholder"
            />
          </div>
        </div>

        {/* Right Side - Notifications and Profile */}
        <div className="flex items-center space-x-4">
          {/* Bell Icon with Notification Badge */}
          <div className="relative">
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Image
                src="/bell-icon.svg"
                alt="Notifications"
                width={15}
                height={15}
                className="w-6 h-6"
              />
              {/* Notification Badge */}
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                9+
              </span>
            </button>
          </div>

          {/* Profile Section */}
          <div className="flex items-center space-x-3">
            {/* Profile Avatar */}
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-foreground">SJ</span>
            </div>
            
            {/* Profile Info */}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[#101828]">Dr. Sarah Johnson</span>
              <span className="text-xs text-[#667085]">Lead Audiologist</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
