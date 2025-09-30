import { Expense } from '../types';
import { PrintSettings } from '../types';

/**
 * Format currency for display
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date for display
 */
const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Get default expense print settings
 */
export const getDefaultExpensePrintSettings = (): PrintSettings['expenses'] => ({
  pageSettings: {
    paperSize: 'A4',
    orientation: 'Portrait',
    margins: {
      top: 0.1,
      right: 0.5,
      bottom: 0.5,
      left: 0.5,
    },
    printerType: 'Color',
  },
  headerSettings: {
    includeHeader: true,
    logo: {
      uploaded: true,
      type: 'Square',
      alignment: 'Left',
    },
    leftText: 'No 75, DhanaLakshmi Avenue, Adyar, Chennai - 600020.',
    rightText: 'GST: 33BXCFA4838GL2U | Phone: +91 6385 054 111',
  },
  footerSettings: {
    topMargin: 0.5,
    fullWidthContent: [],
    leftSignature: {
      name: '',
      title: '',
      organization: '',
    },
    rightSignature: {
      name: '',
      title: '',
      organization: '',
      date: '',
    },
    thankYouMessage: 'Thank you for your business!',
    signatureNote: 'This is a computer generated expense report.',
  },
});

/**
 * Get expense print settings from localStorage
 */
export const getExpensePrintSettings = (): PrintSettings['expenses'] => {
  try {
    // Try to load settings for all document types first
    const savedAllSettings = localStorage.getItem('printSettings_all');
    if (savedAllSettings) {
      const parsedSettings: PrintSettings = JSON.parse(savedAllSettings);
      return parsedSettings.expenses;
    }
    
    // If no global settings, try to load individual document type settings
    const savedSettings = localStorage.getItem('printSettings_expenses');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error('Error loading expense print settings:', error);
  }
    return getDefaultExpensePrintSettings();
};

/**
 * Save expense print settings to localStorage
 */
export const saveExpensePrintSettings = (settings: PrintSettings['expenses']): void => {
  try {
    // 1) Update global settings bucket
    try {
      const existingAll = localStorage.getItem('printSettings_all');
      let allSettings: PrintSettings | null = null;
      if (existingAll) {
        allSettings = JSON.parse(existingAll) as PrintSettings;
      }
      if (allSettings) {
        const updatedAll: PrintSettings = { ...allSettings, expenses: settings } as PrintSettings;
        localStorage.setItem('printSettings_all', JSON.stringify(updatedAll));
      } else {
        // Create a minimal structure with only expenses populated; others remain undefined at runtime access
        const minimalAll: Partial<PrintSettings> = { expenses: settings };
        localStorage.setItem('printSettings_all', JSON.stringify(minimalAll));
      }
    } catch {}

    // 2) Update per-document key
    localStorage.setItem('printSettings_expenses', JSON.stringify(settings));

    // 3) Backward-compat legacy key
    localStorage.setItem('expensePrintSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving expense print settings:', error);
  }
};

/**
 * Generate HTML for expense report
 */
const generateExpenseReportHTML = (expense: Expense, printSettings?: PrintSettings['expenses']): string => {
  // Use custom header settings if available
  const headerSettings = printSettings?.headerSettings;
  const showHeader = headerSettings?.includeHeader !== false;
  
  return `
    <div class="expense-container">
      <!-- Header -->
      ${showHeader ? `
      <div class="expense-header">
        <div class="flex justify-between items-start">
          <div>
            ${headerSettings?.logo?.uploaded ? '<div class="logo-box mb-1" style="height: 4rem; display: flex; align-items: center; overflow: hidden;"><img src="/pdf-view-logo.png" alt="Logo" class="w-32 h-full object-cover" /></div>' : ''}
            <div>
              ${(headerSettings?.leftText || 'No 75, DhanaLakshmi Avenue, Adyar, Chennai - 600020.').split(' || ').map(text => `<p class="text-sm text-gray-600">${text}</p>`).join('')}
            </div>
          </div>
          <div class="text-right">
            <div class="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mb-2">
              Approved
            </div>
            <div class="text-sm text-gray-600">
              ${(headerSettings?.rightText || 'GST: 33BXCFA4838GL2U | Phone: +91 6385 054 111').split(' || ').map(text => `<p>${text}</p>`).join('')}
            </div>
          </div>
        </div>
      </div>
      ` : ''}

      <!-- Document Details -->
      <div class="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h3 class="font-semibold mb-2">Expense Details</h3>
          <p class="font-medium">${expense.vendor}</p>
          <p class="text-sm text-gray-600">Business Expense</p>
      </div>
        <div>
          <h3 class="font-semibold mb-2">Expense Details</h3>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span>Expense Number:</span>
              <span class="font-medium">${expense.expenseNumber}</span>
            </div>
            <div class="flex justify-between">
              <span>Expense Date:</span>
              <span>${formatDate(expense.date)}</span>
            </div>
            <div class="flex justify-between">
              <span>Created By:</span>
              <span>Staff</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Table -->
      <div class="mb-6">
        <h3 class="font-semibold mb-3">Expense Items</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #d1d5db;">
          <thead>
            <tr style="background-color: #f9fafb;">
              <th style="border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; text-align: left;">#</th>
              <th style="border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; text-align: left;">Expense Item</th>
              <th style="border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; text-align: center;">Category</th>
              <th style="border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; text-align: right;">Amount</th>
              <th style="border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; text-align: right;">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #d1d5db; padding: 0.5rem 0.75rem;">1</td>
              <td style="border: 1px solid #d1d5db; padding: 0.5rem 0.75rem;">
                <div>
                  <p style="font-weight: 500; margin: 0;">${expense.description}</p>
                  <p style="font-size: 0.875rem; color: #4b5563; margin: 0;">${expense.vendor}</p>
                </div>
              </td>
              <td style="border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; text-align: center;">
                <span style="background-color: #dbeafe; color: #1e40af; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.75rem;">${expense.category}</span>
              </td>
              <td style="border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; text-align: right; font-weight: 500;">${formatCurrency(expense.amount)}</td>
              <td style="border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; text-align: right;">${formatDate(expense.date)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Document Summary -->
      <div class="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h3 class="font-semibold mb-2">Expense Notes</h3>
          <p class="text-sm text-gray-600">${expense.remarks || 'Expense approved for office operations'}</p>
        </div>
        <div>
          <h3 class="font-semibold mb-2">Expense Summary</h3>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
            <span>Expense Amount:</span>
              <span>${formatCurrency(expense.amount)}</span>
            </div>
            <div class="flex justify-between">
              <span>Category:</span>
              <span>${expense.category}</span>
          </div>
            <div class="flex justify-between">
              <span>Status:</span>
              <span class="text-green-600">Approved</span>
          </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div 
        class="doc-footer"
        style="margin-top: ${printSettings?.footerSettings?.topMargin || 0}in;"
      >
        ${printSettings?.footerSettings?.thankYouMessage ? `
          <div class="mb-1">
            ${printSettings.footerSettings.thankYouMessage.split(' || ').map(text => `<p class="leading-tight">${text}</p>`).join('')}
          </div>
        ` : ''}
        ${printSettings?.footerSettings?.signatureNote ? `
          <div class="mb-1">
            ${printSettings.footerSettings.signatureNote.split(' || ').map(text => `<p class="leading-tight">${text} • Generated on ${formatDate(expense.createdAt)}</p>`).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
};

/**
 * Get CSS styles for expense report printing
 */
const getExpenseReportPrintStyles = (printSettings?: PrintSettings['expenses']) => {
  const pageSettings = printSettings?.pageSettings;
  const margins = pageSettings?.margins || { top: 0.0, left: 0.0, bottom: 0.0, right: 0.0 };
  return `
    @page {
      margin: 2;
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: ${margins.top}in ${margins.right}in ${margins.bottom}in ${margins.left}in;
      color: #000;
      line-height: 1.6;
      font-size: 14px;
    }

    @media print {
      body {
        margin: 0;
        padding: ${margins.top}in ${margins.right}in ${margins.bottom}in ${margins.left}in;
      }
      
      .no-print {
        display: none !important;
      }
      
      .print-break {
        page-break-before: always;
      }
      
      .print-break-after {
        page-break-after: always;
      }
      
      .print-break-inside {
        page-break-inside: avoid;
      }
    }

    .expense-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .expense-header {
      border-bottom: 2px solid #d1d5db;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }

    .flex {
      display: flex;
    }

    .justify-between {
      justify-content: space-between;
    }

    .items-start {
      align-items: flex-start;
    }

    .flex-col {
      flex-direction: column;
    }

    .mr-4 {
      margin-right: 1rem;
    }

    .text-right {
      text-align: right;
    }

    .w-20 {
      width: 5rem;
    }

    .h-20 {
      height: 5rem;
    }

    .w-32 {
      width: 8rem;
    }

    .h-32 {
      height: 8rem;
    }

    .mb-3 {
      margin-bottom: 0.75rem;
    }

    .mb-2 {
      margin-bottom: 0.5rem;
    }

    .mb-1 {
      margin-bottom: 0.25rem;
    }

    .text-sm {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    .text-gray-600 {
      color: #4b5563;
    }

    .inline-block {
      display: inline-block;
    }

    .bg-green-100 {
      background-color: #dcfce7;
    }

    .text-green-800 {
      color: #166534;
    }

    .px-3 {
      padding-left: 0.75rem;
      padding-right: 0.75rem;
    }

    .py-1 {
      padding-top: 0.25rem;
      padding-bottom: 0.25rem;
    }

    .rounded-full {
      border-radius: 9999px;
    }

    .font-semibold {
      font-weight: 600;
    }

    .grid {
      display: grid;
    }

    .grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .gap-8 {
      gap: 2rem;
    }

    .mb-6 {
      margin-bottom: 1.5rem;
    }

    .font-medium {
      font-weight: 500;
    }

    .space-y-1 > * + * {
      margin-top: 0.25rem;
    }

    .w-full {
      width: 100%;
    }

    .border-collapse {
      border-collapse: collapse;
    }

    .border {
      border-width: 1px;
    }

    .border-gray-300 {
      border-color: #d1d5db;
    }

    .px-3 {
      padding-left: 0.75rem;
      padding-right: 0.75rem;
    }

    .py-2 {
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }

    .text-left {
      text-align: left;
    }

    .text-center {
      text-align: center;
    }

    .bg-gray-50 {
      background-color: #f9fafb;
    }

    .bg-blue-100 {
      background-color: #dbeafe;
    }

    .text-blue-800 {
      color: #1e40af;
    }

    .px-2 {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }

    .rounded-full {
      border-radius: 9999px;
    }

    .text-xs {
      font-size: 0.75rem;
      line-height: 1rem;
    }

    .text-green-600 {
      color: #16a34a;
    }

    .doc-footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #d1d5db;
      color: #6b7280;
    }

    .leading-tight {
      line-height: 1.25;
    }

    .mb-1 {
      margin-bottom: 0.25rem;
    }

    .object-contain {
      object-fit: contain;
    }
  `;
};

/**
 * Print expense report
 */
export const printExpenseReport = (expense: Expense): void => {
  const printSettings = getExpensePrintSettings();
  const html = generateExpenseReportHTML(expense, printSettings);
  const styles = getExpenseReportPrintStyles(printSettings);
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Expense Report - ${expense.expenseNumber}</title>
          <style>${styles}</style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
};

/**
 * Download expense report as PDF
 */
export const downloadExpenseReportAsPDF = (expense: Expense): void => {
  const printSettings = getExpensePrintSettings();
  const html = generateExpenseReportHTML(expense, printSettings);
  const styles = getExpenseReportPrintStyles(printSettings);
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Expense Report - ${expense.expenseNumber}</title>
          <style>${styles}</style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
};
