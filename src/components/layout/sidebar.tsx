'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils';
import Image from 'next/image';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    {
      title: 'Appointments',
      href: '/appointments',
      icon: '/sidebar/appointments.svg',
      isActive: pathname === '/appointments' || pathname === '/'
    },
    {
      title: 'Patients',
      href: '/patients',
      icon: '/sidebar/patients.svg',
      isActive: pathname === '/patients'
    },
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: '/sidebar/dashboard.svg',
      isActive: pathname === '/dashboard'
    },
    {
      title: 'Doctor Referrals',
      href: '/doctor-referrals',
      icon: '/sidebar/doctor-referrals.svg',
      isActive: pathname === '/doctor-referrals'
    },
    {
      title: 'Billing',
      href: '/billing',
      icon: '/sidebar/billing.svg',
      isActive: pathname === '/billing'
    },
    {
      title: 'Commissions',
      href: '/commissions',
      icon: '/sidebar/commisions.svg',
      isActive: pathname === '/commissions'
    },
    {
      title: 'Inventory',
      href: '/inventory',
      icon: '/sidebar/invventory.svg',
      isActive: pathname === '/inventory'
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: '/sidebar/settings.svg',
      isActive: pathname === '/settings'
    }
  ];

  return (
    <aside className={cn(
      'bg-white border-r border-border flex flex-col transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64',
      className
    )}>
      {/* Logo Section */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Image
              src="/logo.svg"
              alt="Eljay Logo"
              width={35}
              height={36}
              className="w-8 h-8"
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-[#101828]">Eljay</span>
              <span className="text-xs text-[#667085]">Hearing Care Management</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center px-4 py-3 text-sm transition-colors',
                  isCollapsed ? 'justify-center' : 'space-x-3',
                  item.isActive
                    ? 'bg-[#F3F4F6] text-[#101828] font-semibold'
                    : 'text-[#4A5565] font-normal hover:text-[#F9FAFB] hover:bg-muted'
                )}
                style={{ fontFamily: 'Segoe UI' }}
              >
                <div className="flex-shrink-0">
                  <Image
                    src={item.icon}
                    alt={`${item.title} icon`}
                    width={15}
                    height={15}
                    className="w-4 h-4"
                  />
                </div>
                {!isCollapsed && (
                  <span>{item.title}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse Button */}
      <div className="p-4 border-t border-border">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors',
            isCollapsed ? 'justify-center' : 'space-x-2'
          )}
        >
          <svg
            className={cn(
              'w-4 h-4 transition-transform',
              isCollapsed ? 'rotate-180' : ''
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {!isCollapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
