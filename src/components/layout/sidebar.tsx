'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils';
import Image from 'next/image';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
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
      isActive: pathname.startsWith('/billing'),
      hasSubItems: true,
      subItems: [
        {
          title: 'Invoices',
          href: '/billing/invoices',
          icon: '/sidebar/billing/invoices.svg',
          isActive: pathname === '/billing/invoices'
        },
        {
          title: 'Payments',
          href: '/billing/payments',
          icon: '/sidebar/billing/payments.svg',
          isActive: pathname === '/billing/payments'
        },
        {
          title: 'Expenses',
          href: '/billing/expenses',
          icon: '/sidebar/billing/expenses.svg',
          isActive: pathname === '/billing/expenses'
        }
      ]
    },

    {
      title: 'Inventory',
      href: '/inventory',
      icon: '/sidebar/invventory.svg',
      isActive: pathname.startsWith('/inventory'),
      hasSubItems: true,
      subItems: [
        {
          title: 'Overview',
          href: '/inventory',
          icon: '/sidebar/inventory/overview.svg',
          isActive: pathname === '/inventory'
        },
        {
          title: 'Adjustments',
          href: '/inventory/adjustments',
          icon: '/sidebar/inventory/adjustments.svg',
          isActive: pathname === '/inventory/adjustments'
        },
        {
          title: 'Transfer',
          href: '/inventory/transfer',
          icon: '/sidebar/inventory/transfer.svg',
          isActive: pathname === '/inventory/transfer'
        }
      ]
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: '/sidebar/settings.svg',
      isActive: pathname.startsWith('/settings')
    }
  ];

  // Auto-expand dropdowns when their sub-items are active
  useEffect(() => {
    const newExpandedItems: string[] = [];
    navigationItems.forEach((item) => {
      if (item.hasSubItems && item.subItems) {
        const hasActiveSubItem = item.subItems.some(subItem => subItem.isActive);
        if (hasActiveSubItem) {
          newExpandedItems.push(item.title);
        }
      }
    });
    setExpandedItems(newExpandedItems);
  }, [pathname]);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isExpanded = (title: string) => expandedItems.includes(title);

  return (
    <aside className={cn(
      'bg-white border-custom-r flex flex-col transition-all duration-300',
      isCollapsed ? 'w-14' : 'w-52',
      className
    )}>
      {/* Logo Section */}
      <div className="p-4 border-custom-b">
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
              <span className="text-base font-bold text-[#101828]">Eljay</span>
              <span className="text-xs text-[#667085]">Hearing Care Management</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.href} className={cn(!isCollapsed && 'px-2')}>
              {item.hasSubItems ? (
                <div>
                  <button
                    onClick={() => toggleExpanded(item.title)}
                    className={cn(
                      'flex items-center w-full px-3 py-2.5 text-xs transition-colors',
                      isCollapsed ? 'justify-center' : 'space-x-2',
                      'rounded-lg', // rounded rectangle
                      item.isActive
                        ? 'bg-[#F3F4F6] text-[#101828] font-semibold'
                        : 'text-[#4A5565] font-normal hover:bg-gray-100 hover:text-black hover:rounded-lg'
                    )}
                    style={{ fontFamily: 'Segoe UI' }}
                  >
                    <div className="flex-shrink-0">
                      <Image
                        src={item.icon}
                        alt={`${item.title} icon`}
                        width={15}
                        height={15}
                        className={cn(
                          'w-4 h-4 transition-colors',
                          item.isActive ? 'filter brightness-0' : ''
                        )}
                      />
                    </div>
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.title}</span>
                        <svg
                          className={cn(
                            'w-4 h-4 transition-transform',
                            isExpanded(item.title) ? 'rotate-180' : ''
                          )}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                  {!isCollapsed && isExpanded(item.title) && item.subItems && (
                    <ul className="ml-4 space-y-1">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.href} className="px-1">
                          <Link
                            href={subItem.href}
                            className={cn(
                              'flex items-center px-3 py-1.5 text-xs transition-colors space-x-2',
                              'rounded-lg', // rounded rectangle
                              subItem.isActive
                                ? 'bg-[#F3F4F6] text-[#101828] font-semibold'
                                : 'text-[#4A5565] font-normal hover:bg-gray-100 hover:text-black hover:rounded-lg'
                            )}
                            style={{ fontFamily: 'Segoe UI' }}
                          >
                            <div className="flex-shrink-0">
                              <Image
                                src={subItem.icon}
                                alt={`${subItem.title} icon`}
                                width={15}
                                height={15}
                                className={cn(
                                  'w-4 h-4 transition-colors',
                                  subItem.isActive ? 'filter brightness-0' : ''
                                )}
                              />
                            </div>
                            <span>{subItem.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2.5 text-xs transition-colors',
                    isCollapsed ? 'justify-center' : 'space-x-2',
                    'rounded-lg', // rounded rectangle
                    item.isActive
                      ? 'bg-[#F3F4F6] text-[#101828] font-semibold'
                      : 'text-[#4A5565] font-normal hover:bg-gray-100 hover:text-black hover:rounded-lg'
                  )}
                  style={{ fontFamily: 'Segoe UI' }}
                >
                  <div className="flex-shrink-0">
                    <Image
                      src={item.icon}
                      alt={`${item.title} icon`}
                      width={15}
                      height={15}
                      className={cn(
                        'w-4 h-4 transition-colors',
                        item.isActive ? 'filter brightness-0' : ''
                      )}
                    />
                  </div>
                  {!isCollapsed && (
                    <span>{item.title}</span>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse Button */}
      <div className="p-4 border-custom-t">
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
