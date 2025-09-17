// Global color storage for custom colors
export interface ColorOption {
  value: string;
  label: string;
  hex?: string;
}

// Default color options with hex codes
export const defaultColorOptions: ColorOption[] = [
  { value: 'Blue', label: 'Blue', hex: '#3B82F6' },
  { value: 'Silver', label: 'Silver', hex: '#9CA3AF' },
  { value: 'Beige', label: 'Beige', hex: '#F5F5DC' },
  { value: 'Black', label: 'Black', hex: '#000000' },
  { value: 'White', label: 'White', hex: '#FFFFFF' },
  { value: 'Brown', label: 'Brown', hex: '#8B4513' },
  { value: 'Gold', label: 'Gold', hex: '#FFD700' },
  { value: 'Red', label: 'Red', hex: '#EF4444' },
  { value: 'Green', label: 'Green', hex: '#10B981' },
  { value: 'Purple', label: 'Purple', hex: '#8B5CF6' },
  { value: 'Pink', label: 'Pink', hex: '#EC4899' },
  { value: 'Orange', label: 'Orange', hex: '#F97316' },
  { value: 'Yellow', label: 'Yellow', hex: '#EAB308' },
  { value: 'Gray', label: 'Gray', hex: '#6B7280' },
];

class ColorStorage {
  private customColors: ColorOption[] = [];
  private listeners: (() => void)[] = [];
  private readonly storageKey = 'custom-colors';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          this.customColors = JSON.parse(stored);
        }
      }
    } catch (error) {
      console.error('Failed to load colors from storage:', error);
      this.customColors = [];
    }
  }

  private saveToStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.storageKey, JSON.stringify(this.customColors));
      }
    } catch (error) {
      console.error('Failed to save colors to storage:', error);
    }
  }

  addColor(color: ColorOption) {
    if (!this.customColors.some(c => c.value.toLowerCase() === color.value.toLowerCase())) {
      this.customColors.push(color);
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  getAllColors(): ColorOption[] {
    return [...defaultColorOptions, ...this.customColors];
  }

  // Method to initialize colors from existing data (e.g., from API responses)
  initializeColorsFromData(colorStrings: string[]) {
    const newColors: ColorOption[] = [];
    
    colorStrings.forEach(colorString => {
      if (colorString) {
        const colors = colorString.split(',').map(c => c.trim());
        colors.forEach(colorName => {
          if (colorName && !this.getAllColors().some(c => c.value.toLowerCase() === colorName.toLowerCase())) {
            // Add unknown colors with a default gray color
            newColors.push({
              value: colorName,
              label: colorName,
              hex: '#6B7280'
            });
          }
        });
      }
    });

    if (newColors.length > 0) {
      this.customColors.push(...newColors);
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  getColorHex(colorValue: string): string {
    const allColors = this.getAllColors();
    const color = allColors.find(c => c.value === colorValue);
    if (color?.hex) {
      return color.hex;
    }
    
    // Try to parse if it's already a hex color
    if (colorValue.startsWith('#') && colorValue.length === 7) {
      return colorValue;
    }
    
    // Default gray if nothing found
    return '#6B7280';
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Method to clear all custom colors (useful for testing or reset)
  clearCustomColors() {
    this.customColors = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export const colorStorage = new ColorStorage();

// Utility function to get color hex
export const getColorHex = (colorValue: string): string => {
  return colorStorage.getColorHex(colorValue);
};