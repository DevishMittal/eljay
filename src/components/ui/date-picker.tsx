'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils';
import CustomCalendar from './custom-calendar';

interface DatePickerProps {
  value?: string | Date; // Accept both string and Date
  onChange: (date: string) => void; // Return string in YYYY-MM-DD format
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  required?: boolean;
  'aria-label'?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date",
  className = "",
  disabled = false,
  minDate,
  maxDate,
  disabledDates,
  required = false,
  'aria-label': ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        inputRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };



  // Convert value to Date object for internal use
  const getDateValue = (): Date | undefined => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    
    // Handle string dates (YYYY-MM-DD format from backend)
    // Parse manually to avoid timezone issues
    const dateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateMatch) {
      const [, year, month, day] = dateMatch;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return isNaN(date.getTime()) ? undefined : date;
    }
    
    // Fallback to regular parsing
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
  };

  const handleCalendarChange = (date: Date) => {
    // Convert Date to YYYY-MM-DD string for backend (avoiding timezone issues)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    onChange(dateString);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleClearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    inputRef.current?.focus();
  };


  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={getDateValue() ? getDateValue()!.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }) : ''}
          onClick={handleInputClick}
          readOnly
          disabled={disabled}
          required={required}
          aria-label={ariaLabel}
          placeholder={placeholder}
          className={cn(
            "w-full px-3 py-2.5 pr-16 rounded-lg border text-sm transition-all duration-200 cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            disabled 
              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" 
              : getDateValue() 
                ? "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
          )}
        />

        {/* Calendar Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg 
            className={cn(
              "w-4 h-4",
              disabled ? "text-gray-400" : "text-gray-500"
            )} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Clear Button */}
        {getDateValue() && !disabled && (
          <button
            type="button"
            onClick={handleClearDate}
            className="absolute inset-y-0 right-8 flex items-center pr-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Clear date"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Custom Calendar Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50">
          <CustomCalendar
            value={getDateValue()}
            onChange={handleCalendarChange}
            minDate={minDate}
            maxDate={maxDate}
            disabledDates={disabledDates}
            className="shadow-lg border-2 border-gray-200"
          />
        </div>
      )}

    </div>
  );
};

export default DatePicker;
