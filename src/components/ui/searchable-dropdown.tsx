import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils';

export interface SearchableOption {
  id: string;
  name: string;
  subtitle?: string;
  additionalInfo?: string;
}

interface SearchableDropdownProps {
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  maxHeight?: string;
  showCount?: boolean;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  className = '',
  disabled = false,
  maxHeight = 'max-h-64',
  showCount = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.subtitle && option.subtitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (option.additionalInfo && option.additionalInfo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get selected option
  const selectedOption = options.find(option => option.id === value);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          onChange(filteredOptions[highlightedIndex].id);
          setIsOpen(false);
          setSearchTerm('');
          setHighlightedIndex(-1);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
    }
  };

  // Handle option selection
  const handleOptionSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlighted index when search term changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchTerm]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          'w-full px-3 py-2.5 rounded-lg border text-left transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          disabled 
            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
            : isOpen
              ? 'bg-white border-blue-500 text-gray-900'
              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300',
          'flex items-center justify-between'
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen ? 'true' : 'false'}
        aria-label={placeholder}
      >
        <div className="flex-1 min-w-0">
          {selectedOption ? (
            <div>
              <div className="font-medium text-sm truncate" style={{ color: '#0A0A0A' }}>
                {selectedOption.name}
              </div>
              {selectedOption.subtitle && (
                <div className="text-xs truncate" style={{ color: '#717182' }}>
                  {selectedOption.subtitle}
                </div>
              )}
            </div>
          ) : (
            <span className="text-sm" style={{ color: '#717182' }}>
              {placeholder}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2 ml-2">
          {showCount && options.length > 0 && (
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full" style={{ color: '#717182' }}>
              {options.length}
            </span>
          )}
          <svg
            className={cn(
              'w-4 h-4 transition-transform',
              isOpen ? 'rotate-180' : '',
              disabled ? 'text-gray-400' : 'text-gray-500'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={cn(
          'absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg',
          maxHeight,
          'overflow-hidden'
        )}>
          {/* Search Input */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ backgroundColor: '#F3F3F5', color: '#717182' }}
              />
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto scrollbar-hide" style={{ maxHeight: 'calc(100% - 60px)' }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleOptionSelect(option.id)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    'w-full px-3 py-2 text-left transition-colors',
                    'hover:bg-gray-50 focus:outline-none focus:bg-gray-50',
                    highlightedIndex === index ? 'bg-gray-50' : '',
                    value === option.id ? 'bg-blue-50' : ''
                  )}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        'font-medium text-sm',
                        value === option.id ? 'text-blue-900' : 'text-gray-900'
                      )}>
                        {option.name}
                      </div>
                      {option.subtitle && (
                        <div className="text-xs text-gray-600 mt-0.5">
                          {option.subtitle}
                        </div>
                      )}
                      {option.additionalInfo && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {option.additionalInfo}
                        </div>
                      )}
                    </div>
                    {value === option.id && (
                      <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-sm text-gray-500">
                {searchTerm ? 'No options found matching your search' : 'No options available'}
              </div>
            )}
          </div>

          {/* Footer with count */}
          {filteredOptions.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-100 bg-gray-50">
              <div className="text-xs text-gray-600">
                {filteredOptions.length === options.length 
                  ? `${options.length} options available`
                  : `${filteredOptions.length} of ${options.length} options`
                }
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;