/**
 * Utility functions for exporting data to CSV format
 */

export interface ExportOptions {
  filename: string;
  includeHeaders?: boolean;
}

/**
 * Converts an array of objects to CSV format
 */
export function convertToCSV(
  data: Array<Record<string, unknown>>,
  headers?: string[]
): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Use provided headers or extract from first object
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create header row
  const headerRow = csvHeaders.map(header => `"${header}"`).join(',');
  
  // Create data rows
  const dataRows = data.map(row => {
    return csvHeaders.map(header => {
      const value = row[header];
      // Handle null/undefined values
      if (value === null || value === undefined) {
        return '""';
      }
      // Escape quotes and wrap in quotes
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Downloads CSV content as a file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Prepend UTF-8 BOM so Excel correctly recognizes Unicode (₹ etc.)
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Formats currency values for CSV export
 */
export function formatCurrencyForExport(amount: number | string): string {
  if (amount === null || amount === undefined || amount === '') {
    return '₹0';
  }
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₹${numAmount.toLocaleString('en-IN')}`;
}

/**
 * Formats date values for CSV export
 */
export function formatDateForExport(dateString: string | Date): string {
  if (!dateString) {
    return '';
  }
  const date = new Date(dateString);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'N/A';
  }
  
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Formats datetime values for CSV export
 */
export function formatDateTimeForExport(dateString: string | Date): string {
  if (!dateString) {
    return '';
  }
  const date = new Date(dateString);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'N/A';
  }
  
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}
