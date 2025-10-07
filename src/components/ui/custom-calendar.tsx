'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { cn } from '@/utils';

interface CustomCalendarProps {
  value?: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  className?: string;
  context?: 'dob' | 'appointment' | 'general'; // Context for different use cases
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  disabledDates = [],
  className = "",
  context = 'general',
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    return value || new Date();
  });

  // Auto-set date restrictions based on context
  const effectiveMinDate = useMemo(() => {
    if (minDate) return minDate; // Use provided minDate if available
    
    switch (context) {
      case 'dob':
        // For date of birth, allow dates from 100 years ago to today
        const hundredYearsAgo = new Date();
        hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);
        return hundredYearsAgo;
      case 'appointment':
        // For appointments, don't allow past dates
        return new Date();
      case 'general':
      default:
        // For general use, no restrictions
        return undefined;
    }
  }, [minDate, context]);

  const effectiveMaxDate = useMemo(() => {
    if (maxDate) return maxDate; // Use provided maxDate if available
    
    switch (context) {
      case 'dob':
        // For date of birth, don't allow future dates
        return new Date();
      case 'appointment':
        // For appointments, allow up to 60 days in the future
        const sixtyDaysFromNow = new Date();
        sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
        return sixtyDaysFromNow;
      case 'general':
      default:
        // For general use, no restrictions
        return undefined;
    }
  }, [maxDate, context]);

  // Dropdown state management
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownListRef = useRef<HTMLDivElement>(null);

  // Calculate calendar grid start date
  const startDate = useMemo(() => {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const date = new Date(firstDayOfMonth);
    date.setDate(date.getDate() - firstDayOfMonth.getDay());
    return date;
  }, [currentMonth]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate year range (1925 to current year + 10)
  const currentYear = new Date().getFullYear();
  const startYear = 1925;
  const endYear = currentYear + 10;
  const yearRange = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
        setShowMonthDropdown(false);
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
        setShowYearDropdown(false);
      }
    };

    if (showMonthDropdown || showYearDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMonthDropdown, showYearDropdown]);

  // Scroll year dropdown to show years around 1975 when opened
  useEffect(() => {
    if (showYearDropdown && yearDropdownListRef.current) {
      // Calculate index for year 1975
      const targetYear = 1975;
      const yearIndex = targetYear - startYear;
      
      // Scroll to show the target year in the middle of the dropdown
      const itemHeight = 32; // Approximate height of each year item (py-2 = 8px top + 8px bottom + text height)
      const containerHeight = 192; // max-h-48 = 192px
      const scrollPosition = Math.max(0, (yearIndex * itemHeight) - (containerHeight / 2));
      
      yearDropdownListRef.current.scrollTop = scrollPosition;
    }
  }, [showYearDropdown, startYear]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: Date[] = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }, [startDate]);

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Dropdown selection handlers
  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), monthIndex, 1));
    setShowMonthDropdown(false);
  };

  const handleYearSelect = (year: number) => {
    setCurrentMonth(prev => new Date(year, prev.getMonth(), 1));
    setShowYearDropdown(false);
  };

  const toggleMonthDropdown = () => {
    setShowMonthDropdown(prev => !prev);
    setShowYearDropdown(false);
  };

  const toggleYearDropdown = () => {
    setShowYearDropdown(prev => !prev);
    setShowMonthDropdown(false);
  };

  // Date validation functions
  const isDateDisabled = (date: Date) => {
    // Helper function to normalize dates to start of day for comparison
    const normalizeDate = (d: Date) => {
      const normalized = new Date(d);
      normalized.setHours(0, 0, 0, 0);
      return normalized;
    };
    
    // Check if date is before effectiveMinDate (compare only date part, not time)
    if (effectiveMinDate && normalizeDate(date) < normalizeDate(effectiveMinDate)) return true;
    
    // Check if date is after effectiveMaxDate (compare only date part, not time)
    if (effectiveMaxDate && normalizeDate(date) > normalizeDate(effectiveMaxDate)) return true;
    
    // Check if date is in disabledDates array
    return disabledDates.some(disabledDate => 
      date.toDateString() === disabledDate.toDateString()
    );
  };


  const isSelected = (date: Date) => {
    return value && date.toDateString() === value.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const handleDateClick = (date: Date) => {
    if (!isDateDisabled(date)) {
      onChange(date);
    }
  };

  return (
    <div className={cn("bg-white border border-gray-200 rounded-lg shadow-sm p-3", className)}>
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-2">
        {/* Left side - Previous month */}
        <button
          onClick={goToPreviousMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Previous month"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Center - Month/Year dropdowns */}
        <div className="flex items-center space-x-1">
          {/* Month Dropdown */}
          <div className="relative" ref={monthDropdownRef}>
            <button
              onClick={toggleMonthDropdown}
              className="px-2 py-1 text-xs font-semibold text-gray-900 hover:bg-gray-100 rounded transition-colors flex items-center space-x-1"
            >
              <span>{monthNames[currentMonth.getMonth()]}</span>
              <svg 
                className={cn("w-3 h-3 transition-transform", showMonthDropdown && "rotate-180")} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
             {showMonthDropdown && (
               <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto scrollbar-hide">
                 {monthNames.map((month, index) => (
                  <button
                    key={month}
                    onClick={() => handleMonthSelect(index)}
                    className={cn(
                      "w-full px-3 py-2 text-xs text-left hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg",
                      index === currentMonth.getMonth() && "bg-orange-100 text-orange-700 font-semibold"
                    )}
                  >
                    {month}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Year Dropdown */}
          <div className="relative" ref={yearDropdownRef}>
            <button
              onClick={toggleYearDropdown}
              className="px-2 py-1 text-xs font-semibold text-gray-900 hover:bg-gray-100 rounded transition-colors flex items-center space-x-1"
            >
              <span>{currentMonth.getFullYear()}</span>
              <svg 
                className={cn("w-3 h-3 transition-transform", showYearDropdown && "rotate-180")} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
             {showYearDropdown && (
               <div ref={yearDropdownListRef} className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto scrollbar-hide">
                 {yearRange.map((year) => (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    className={cn(
                      "w-full px-3 py-2 text-xs text-left hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg",
                      year === currentMonth.getFullYear() && "bg-orange-100 text-orange-700 font-semibold"
                    )}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side - Next month */}
        <button
          onClick={goToNextMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Next month"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((day) => (
          <div
            key={day}
            className="h-6 flex items-center justify-center text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const disabled = isDateDisabled(date);
          const selected = isSelected(date);
          const currentMonth = isCurrentMonth(date);

          return (
            <button
              key={index}
              onClick={() => handleDateClick(date)}
              disabled={disabled}
              className={cn(
                "h-6 w-6 flex items-center justify-center text-xs rounded transition-all duration-200",
                "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50",
                {
                  // Current month dates
                  "text-gray-900": currentMonth && !selected,
                  
                  // Other month dates (grayed out)
                  "text-gray-400": !currentMonth,
                  
                  // Selected date
                  "bg-orange-500 text-white font-semibold hover:bg-orange-600": selected,
                  
                  // Disabled dates
                  "text-gray-300 cursor-not-allowed hover:bg-transparent": disabled,
                  
                  // Weekend styling (optional)
                  "text-red-600": currentMonth && (date.getDay() === 0 || date.getDay() === 6) && !selected && !disabled,
                }
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Footer with selected date info */}
      {value && (
        <div className="mt-3 pt-2 !border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            Selected: <span className="font-medium text-gray-900">{value.toLocaleDateString('en-US', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomCalendar;
