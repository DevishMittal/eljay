'use client';

import React from 'react';
import { cn } from '@/utils';
import Header from './header';
import Sidebar from './sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  showTasksSidebar?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  className,
  showTasksSidebar = false,
}) => {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />
        
        {/* Main Content */}
        <main className={cn('flex-1 bg-muted/30', showTasksSidebar ? '' : 'p-6', className)}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
