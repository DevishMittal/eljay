'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/utils';
import CustomDropdown from '@/components/ui/custom-dropdown';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

interface UnifiedFilterProps {
  filters: FilterConfig[];
  className?: string;
  placeholder?: string;
  showActiveIndicator?: boolean;
}

export default function UnifiedFilter({
  filters,
  className = '',
  placeholder = 'Filter',
  showActiveIndicator = true
}: UnifiedFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  // Check if any filters are active (not default values)
  useEffect(() => {
    const active = new Set<string>();
    filters.forEach(filter => {
      const defaultValues = ['All Types', 'All Methods', 'All Status', 'All Categories', 'All Patients'];
      if (!defaultValues.includes(filter.value)) {
        active.add(filter.id);
      }
    });
    setActiveFilters(active);
  }, [filters]);

  const hasActiveFilters = activeFilters.size > 0;

  const handleFilterChange = (filterId: string, value: string) => {
    const filter = filters.find(f => f.id === filterId);
    if (filter) {
      filter.onChange(value);
    }
  };

  const clearAllFilters = () => {
    filters.forEach(filter => {
      const defaultValues = ['All Types', 'All Methods', 'All Status', 'All Categories', 'All Patients'];
      const defaultValue = defaultValues.find(val => filter.options.some(opt => opt.value === val)) || filter.options[0]?.value;
      if (defaultValue) {
        filter.onChange(defaultValue);
      }
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.unified-filter-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative unified-filter-container ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'border text-xs px-3 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors',
          hasActiveFilters || isOpen
            ? 'bg-orange-100 text-orange-700 border border-orange-200'
            : 'bg-white text-gray-700 hover:bg-gray-200'
        )}
        aria-label="Filter options"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
        </svg>
        <span>{placeholder}</span>
        {hasActiveFilters && showActiveIndicator && (
          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
        )}
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg border border-gray-200 shadow-lg z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Filter Options</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close filters"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {filters.map((filter) => (
              <div key={filter.id}>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {filter.label}
                </label>
                <CustomDropdown
                  options={filter.options}
                  value={filter.value}
                  onChange={(value) => handleFilterChange(filter.id, value)}
                  placeholder={`Select ${filter.label}`}
                  className="w-full text-sm"
                  aria-label={`Filter by ${filter.label.toLowerCase()}`}
                />
              </div>
            ))}

            {hasActiveFilters && (
              <div className="pt-2 !border-t border-gray-200">
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
