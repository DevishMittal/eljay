'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/utils';

interface CustomCalendarProps {
  value?: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  className?: string;
  showToday?: boolean;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  disabledDates = [],
  className = "",
  showToday = true,
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    return value || new Date();
  });

  const today = new Date();
  
  // Get first day of the month and calculate calendar grid
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

  const goToPreviousYear = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear() - 1, prev.getMonth(), 1));
  };

  const goToNextYear = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear() + 1, prev.getMonth(), 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Date validation functions
  const isDateDisabled = (date: Date) => {
    // Check if date is before minDate
    if (minDate && date < minDate) return true;
    
    // Check if date is after maxDate
    if (maxDate && date > maxDate) return true;
    
    // Check if date is in disabledDates array
    return disabledDates.some(disabledDate => 
      date.toDateString() === disabledDate.toDateString()
    );
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
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
    <div className={cn("bg-white border border-gray-200 rounded-lg shadow-sm p-4", className)}>
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-1">
          <button
            onClick={goToPreviousYear}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Previous year"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Previous month"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <h2 className="text-xs font-semibold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          {showToday && (
            <button
              onClick={goToToday}
              className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
            >
              Today
            </button>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Next month"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={goToNextYear}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Next year"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const disabled = isDateDisabled(date);
          const today = isToday(date);
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
                  "text-gray-900": currentMonth && !selected && !today,
                  
                  // Other month dates (grayed out)
                  "text-gray-400": !currentMonth,
                  
                  // Today
                  "bg-orange-100 text-orange-700 font-semibold": today && !selected,
                  
                  // Selected date
                  "bg-orange-500 text-white font-semibold hover:bg-orange-600": selected,
                  
                  // Disabled dates
                  "text-gray-300 cursor-not-allowed hover:bg-transparent": disabled,
                  
                  // Weekend styling (optional)
                  "text-red-600": currentMonth && (date.getDay() === 0 || date.getDay() === 6) && !selected && !today && !disabled,
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
        <div className="mt-4 pt-3 !border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            Selected: <span className="font-medium text-gray-900">{value.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomCalendar;
