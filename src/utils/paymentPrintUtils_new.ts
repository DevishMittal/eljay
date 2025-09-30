import { Payment } from '../types';
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
 * Get default payment print settings
 */
export const getDefaultPaymentPrintSettings = (): PrintSettings['payments'] => ({
  pageSettings: {
    paperSize: 'A4',
    orientation: 'Portrait',
    margins: {
      top: 0.5,
      right: 0.5,
      bottom: 0.5,
      left: 0.5,
    },
    printerType: 'Color',
  },
  headerSettings: {
    includeHeader: true,
    headerText: 'Hearing Centre Adyar',
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
    signatureNote: 'This is a computer generated payment receipt.',
  },
});

/**
 * Get payment print settings from localStorage
 */
export const getPaymentPrintSettings = (): PrintSettings['payments'] => {
  try {
    const saved = localStorage.getItem('paymentPrintSettings');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading payment print settings:', error);
  }
  return getDefaultPaymentPrintSettings();
};

/**
 * Save payment print settings to localStorage
 */
export const savePaymentPrintSettings = (settings: PrintSettings['payments']): void => {
  try {
    localStorage.setItem('paymentPrintSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving payment print settings:', error);
  }
};

/**
 * Generate HTML for payment receipt
 */
const generatePaymentReceiptHTML = (payment: Payment, printSettings?: PrintSettings['payments']): string => {
  // Use custom header settings if available
  const headerSettings = printSettings?.headerSettings;
  const showHeader = headerSettings?.includeHeader !== false;
  
  return `
    <div class="payment-container">
      <!-- Header -->
      ${showHeader ? `
      <div class="payment-header">
        <div class="flex justify-between items-start">
          <div>
            <div class="flex flex-col items-start">
              ${headerSettings?.logo?.uploaded ? '<img src="/pdf-view-logo.png" alt="Logo" class="w-20 h-20 mb-3" />' : ''}
              <div>
                ${(headerSettings?.leftText || 'No 75, DhanaLakshmi Avenue, Adyar, Chennai - 600020.').split(' || ').map(text => `<p class="text-sm text-gray-600">${text}</p>`).join('')}
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mb-2">
              ${payment.status}
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
          <h3 class="font-semibold mb-2">Payment To</h3>
          <p class="font-medium">${payment.patientName}</p>
          <p class="text-sm text-gray-600">Payment Recipient</p>
        </div>
        <div>
          <h3 class="font-semibold mb-2">Payment Details</h3>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span>Receipt Number:</span>
              <span class="font-medium">${payment.receiptNumber}</span>
            </div>
            <div class="flex justify-between">
              <span>Payment Date:</span>
              <span>${formatDate(payment.paymentDate)}</span>
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
        <h3 class="font-semibold mb-3">Payment Details</h3>
        <table class="w-full border-collapse border border-gray-300">
          <thead>
            <tr class="bg-gray-50">
              <th class="border border-gray-300 px-3 py-2 text-left">#</th>
              <th class="border border-gray-300 px-3 py-2 text-left">Payment Method</th>
              <th class="border border-gray-300 px-3 py-2 text-center">Status</th>
              <th class="border border-gray-300 px-3 py-2 text-right">Amount</th>
              <th class="border border-gray-300 px-3 py-2 text-right">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-gray-300 px-3 py-2">1</td>
              <td class="border border-gray-300 px-3 py-2">
                <div>
                  <p class="font-medium">Payment Receipt</p>
                  <p class="text-sm text-gray-600">Receipt #${payment.receiptNumber}</p>
                </div>
              </td>
              <td class="border border-gray-300 px-3 py-2 text-center">
                <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">${payment.status}</span>
              </td>
              <td class="border border-gray-300 px-3 py-2 text-right font-medium">${formatCurrency(payment.amount)}</td>
              <td class="border border-gray-300 px-3 py-2 text-right">${formatDate(payment.paymentDate)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Document Summary -->
      <div class="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h3 class="font-semibold mb-2">Payment Notes</h3>
          <p class="text-sm text-gray-600">Payment processed successfully via ${payment.method.toLowerCase()}</p>
        </div>
        <div>
          <h3 class="font-semibold mb-2">Payment Summary</h3>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span>Payment Amount:</span>
              <span>${formatCurrency(payment.amount)}</span>
            </div>
            <div class="flex justify-between">
              <span>Payment Method:</span>
              <span>${payment.method}</span>
            </div>
            <div class="flex justify-between">
              <span>Status:</span>
              <span class="text-green-600">${payment.status}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div 
        class="!border-t border-gray-300 pt-4 text-center text-sm text-gray-600"
        style="margin-top: ${printSettings?.footerSettings?.topMargin || 0}in;"
      >
        ${printSettings?.footerSettings?.thankYouMessage ? `
          <div class="mb-1">
            ${printSettings.footerSettings.thankYouMessage.split(' || ').map(text => `<p class="leading-tight">${text}</p>`).join('')}
          </div>
        ` : ''}
        ${printSettings?.footerSettings?.signatureNote ? `
          <div class="mb-1">
            ${printSettings.footerSettings.signatureNote.split(' || ').map(text => `<p class="leading-tight">${text} • Generated on ${formatDate(payment.createdAt)}</p>`).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
};

/**
 * Get CSS styles for payment receipt printing
 */
const getPaymentReceiptPrintStyles = (_printSettings?: PrintSettings['payments']) => {
  return `
    * {
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      color: #000;
      line-height: 1.6;
      font-size: 14px;
    }

    @media print {
      body {
        margin: 0;
        padding: 15px;
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

    .payment-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .payment-header {
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

    .text-right {
      text-align: right;
    }

    .w-20 {
      width: 5rem;
    }

    .h-20 {
      height: 5rem;
    }

    .mb-3 {
      margin-bottom: 0.75rem;
    }

    .mb-2 {
      margin-bottom: 0.5rem;
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

    .text-green-600 {
      color: #16a34a;
    }

    .border-t {
      border-top-width: 1px;
    }

    .pt-4 {
      padding-top: 1rem;
    }

    .text-center {
      text-align: center;
    }

    .leading-tight {
      line-height: 1.25;
    }

    .mb-1 {
      margin-bottom: 0.25rem;
    }
  `;
};

/**
 * Print payment receipt
 */
export const printPaymentReceipt = (payment: Payment): void => {
  const printSettings = getPaymentPrintSettings();
  const html = generatePaymentReceiptHTML(payment, printSettings);
  const styles = getPaymentReceiptPrintStyles(printSettings);
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${payment.receiptNumber}</title>
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
 * Download payment receipt as PDF
 */
export const downloadPaymentReceiptAsPDF = (payment: Payment): void => {
  const printSettings = getPaymentPrintSettings();
  const html = generatePaymentReceiptHTML(payment, printSettings);
  const styles = getPaymentReceiptPrintStyles(printSettings);
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt - ${payment.receiptNumber}</title>
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
