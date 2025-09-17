'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, X, Palette } from 'lucide-react';
import { colorStorage, getColorHex, type ColorOption } from '@/utils/colorStorage';

interface ColorSelectorProps {
  selectedColors: string[];
  onChange: (colors: string[]) => void;
  multiSelect?: boolean;
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
  onColorOptionsChange?: (colors: ColorOption[]) => void;
}

export default function ColorSelector({
  selectedColors,
  onChange,
  multiSelect = false,
  placeholder = 'Select color(s)',
  className = '',
  label,
  required = false,
  onColorOptionsChange,
}: ColorSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [colorOptions, setColorOptions] = useState<ColorOption[]>(colorStorage.getAllColors());
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pickedColor, setPickedColor] = useState('#3B82F6');
  const [customColorName, setCustomColorName] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to color storage updates
  useEffect(() => {
    const unsubscribe = colorStorage.subscribe(() => {
      setColorOptions(colorStorage.getAllColors());
    });
    return unsubscribe;
  }, []);

  // Filter colors based on search query
  const filteredColors = colorOptions.filter(color =>
    color.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show add new option if search query doesn't match any existing color
  const showAddNewOption = searchQuery.trim() && 
    !colorOptions.some(color => color.label.toLowerCase() === searchQuery.toLowerCase());

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowColorPicker(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current && !showColorPicker) {
      searchInputRef.current.focus();
    }
  }, [isOpen, showColorPicker]);

  const handleColorSelect = (color: ColorOption) => {
    if (multiSelect) {
      if (selectedColors.includes(color.value)) {
        // Remove color if already selected
        onChange(selectedColors.filter(c => c !== color.value));
      } else {
        // Add color to selection
        onChange([...selectedColors, color.value]);
      }
    } else {
      // Single select mode
      onChange([color.value]);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleRemoveColor = (colorToRemove: string) => {
    onChange(selectedColors.filter(c => c !== colorToRemove));
  };

  const handleAddNewColor = () => {
    const colorName = customColorName.trim() || `Custom Color ${colorOptions.length + 1}`;
    if (colorName && !colorOptions.some(c => c.label.toLowerCase() === colorName.toLowerCase())) {
      const newColor: ColorOption = {
        value: colorName,
        label: colorName,
        hex: pickedColor
      };
      
      // Add to global storage
      colorStorage.addColor(newColor);
      
      // Notify parent component of color options change
      if (onColorOptionsChange) {
        onColorOptionsChange(colorStorage.getAllColors());
      }
      
      if (multiSelect) {
        if (!selectedColors.includes(colorName)) {
          onChange([...selectedColors, colorName]);
        }
      } else {
        onChange([colorName]);
      }
      
      setCustomColorName('');
      setSearchQuery('');
      setShowColorPicker(false);
      if (!multiSelect) {
        setIsOpen(false);
      }
    }
  };

  const handleAddSearchedColor = () => {
    const colorName = searchQuery.trim();
    if (colorName && !colorOptions.some(c => c.label.toLowerCase() === colorName.toLowerCase())) {
      const newColor: ColorOption = {
        value: colorName,
        label: colorName,
        hex: '#6B7280' // Default gray for quick-added colors
      };
      
      // Add to global storage
      colorStorage.addColor(newColor);
      
      // Notify parent component of color options change
      if (onColorOptionsChange) {
        onColorOptionsChange(colorStorage.getAllColors());
      }
      
      if (multiSelect) {
        if (!selectedColors.includes(colorName)) {
          onChange([...selectedColors, colorName]);
        }
      } else {
        onChange([colorName]);
      }
      
      setSearchQuery('');
      if (!multiSelect) {
        setIsOpen(false);
      }
    }
  };

  const getDisplayText = () => {
    if (selectedColors.length === 0) return placeholder;
    if (!multiSelect) return selectedColors[0];
    if (selectedColors.length === 1) return selectedColors[0];
    return `${selectedColors[0]} +${selectedColors.length - 1} more`;
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
          {label} {required && '*'}
        </label>
      )}
      
      <div ref={dropdownRef} className="relative">
        {/* Selected colors display (for multi-select) */}
        {multiSelect && selectedColors.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {selectedColors.map((color) => (
              <span
                key={color}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg text-xs"
                style={{ fontFamily: 'Segoe UI' }}
              >
                <div
                  className="w-3 h-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: getColorHex(color) }}
                />
                {color}
                <button
                  type="button"
                  onClick={() => handleRemoveColor(color)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Remove color"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Main selector button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-1 bg-gray-100 rounded-lg text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
          style={{ fontFamily: 'Segoe UI' }}
        >
          <div className="flex items-center gap-2">
            {!multiSelect && selectedColors.length > 0 && (
              <div
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: getColorHex(selectedColors[0]) }}
              />
            )}
            <span className={selectedColors.length === 0 ? 'text-gray-500' : 'text-gray-900'}>
              {getDisplayText()}
            </span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown menu */}
        {isOpen && !showColorPicker && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search colors..."
                  className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                  style={{ fontFamily: 'Segoe UI' }}
                />
              </div>
            </div>

            {/* Color options */}
            <div className="max-h-40 overflow-y-auto">
              {filteredColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 ${
                    selectedColors.includes(color.value) ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                  style={{ fontFamily: 'Segoe UI' }}
                >
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="text-sm">{color.label}</span>
                  {selectedColors.includes(color.value) && (
                    <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}

              {/* Add new color option from search */}
              {showAddNewOption && (
                <button
                  type="button"
                  onClick={handleAddSearchedColor}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-blue-600 border-t border-gray-200"
                  style={{ fontFamily: 'Segoe UI' }}
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Add &quot;{searchQuery}&quot; as new color</span>
                </button>
              )}

              {/* Permanent Add New Color with Color Picker */}
              <button
                type="button"
                onClick={() => setShowColorPicker(true)}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-blue-600 border-t border-gray-200"
                style={{ fontFamily: 'Segoe UI' }}
              >
                <Palette className="w-4 h-4" />
                <span className="text-sm">Add custom color with picker</span>
              </button>

              {filteredColors.length === 0 && !showAddNewOption && (
                <div className="px-3 py-2 text-sm text-gray-500" style={{ fontFamily: 'Segoe UI' }}>
                  No colors found
                </div>
              )}
            </div>
          </div>
        )}

        {/* Color Picker Modal */}
        {isOpen && showColorPicker && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Create Custom Color</h4>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                  style={{ backgroundColor: pickedColor }}
                />
                <input
                  type="color"
                  value={pickedColor}
                  onChange={(e) => setPickedColor(e.target.value)}
                  className="w-16 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={customColorName}
                  onChange={(e) => setCustomColorName(e.target.value)}
                  placeholder="Color name (optional)"
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  style={{ fontFamily: 'Segoe UI' }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddNewColor}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  style={{ fontFamily: 'Segoe UI' }}
                >
                  Add Color
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowColorPicker(false);
                    setCustomColorName('');
                    setPickedColor('#3B82F6');
                  }}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                  style={{ fontFamily: 'Segoe UI' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}