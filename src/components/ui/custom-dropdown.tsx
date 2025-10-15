'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/utils';

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
  forceOpenUpwards?: boolean;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  disabled = false,
  'aria-label': ariaLabel,
  forceOpenUpwards = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handler functions
  const handleOptionSelect = useCallback((optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setFocusedIndex(-1);
    buttonRef.current?.focus();
  }, [onChange]);

  // Calculate dropdown position when opening
  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return 'bottom';
    
    // If forceOpenUpwards is true, always open upwards
    if (forceOpenUpwards) {
      return 'top';
    }
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = Math.min(240, options.length * 48); // Approximate height
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    
    // If there's not enough space below but enough space above, show on top
    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      return 'top';
    }
    
    return 'bottom';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex(prev => 
            prev < options.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex(prev => 
            prev > 0 ? prev - 1 : options.length - 1
          );
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (focusedIndex >= 0) {
            handleOptionSelect(options[focusedIndex].value);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setFocusedIndex(-1);
          buttonRef.current?.focus();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, focusedIndex, options, handleOptionSelect]);

  const handleToggleDropdown = () => {
    if (!disabled) {
      if (!isOpen) {
        const position = calculateDropdownPosition();
        setDropdownPosition(position);
      }
      setIsOpen(!isOpen);
    }
  };

  const selectedOption = options.find(option => option.value === value);

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {/* Dropdown Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggleDropdown}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={isOpen ? "true" : "false"}
        aria-haspopup="listbox"
        className={cn(
          "w-full px-3 py-2.5 rounded-lg border text-left transition-all duration-200 flex items-center justify-between",
          "focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-transparent",
          className.includes('text-xs') ? 'text-xs' : 'text-sm',
          disabled 
            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" 
            : "bg-white border-gray-200 text-gray-700 hover:border-gray-300 cursor-pointer"
        )}
        style={{ color: selectedOption ? '#717182' : '#9CA3AF' }}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={cn(
            "w-4 h-4 transition-transform duration-200 flex-shrink-0 ml-2",
            isOpen ? "transform rotate-180" : "",
            disabled ? "text-gray-400" : "text-gray-500"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className={cn(
          "dropdown-menu absolute left-0 right-0 z-50",
          dropdownPosition === 'top' ? "bottom-full mb-1" : "top-full mt-1"
        )}>
          <div role="listbox" className="max-h-60 overflow-auto" aria-label="Options list">
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={value === option.value ? "true" : "false"}
                onClick={() => handleOptionSelect(option.value)}
                className={cn(
                  "dropdown-item w-full px-3 py-2 text-left transition-colors",
                  className.includes('text-xs') ? 'text-xs' : 'text-sm',
                  value === option.value && "selected",
                  index === focusedIndex && "bg-gray-100"
                )}
              >
                <span>{option.label}</span>
                {value === option.value && (
                  <svg className="checkmark checkmark-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
