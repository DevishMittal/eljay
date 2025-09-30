import { InventoryTransfer } from '../types';
import { PrintSettings } from '../types';

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
 * Get default transfer print settings
 */
export const getDefaultTransferPrintSettings = (): PrintSettings['transfers'] => ({
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
    signatureNote: 'This is a computer generated transfer report.',
  },
});

/**
 * Get transfer print settings from localStorage
 */
export const getTransferPrintSettings = (): PrintSettings['transfers'] => {
  try {
    // Try to load settings for all document types first
    const savedAllSettings = localStorage.getItem('printSettings_all');
    if (savedAllSettings) {
      const parsedSettings: PrintSettings = JSON.parse(savedAllSettings);
      return parsedSettings.transfers;
    }
    
    // If no global settings, try to load individual document type settings
    const savedSettings = localStorage.getItem('printSettings_transfers');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error('Error loading transfer print settings:', error);
  }
  return getDefaultTransferPrintSettings();
};

/**
 * Save transfer print settings to localStorage
 */
export const saveTransferPrintSettings = (settings: PrintSettings['transfers']): void => {
  try {
    localStorage.setItem('transferPrintSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving transfer print settings:', error);
  }
};

/**
 * Generate HTML for transfer report
 */
const generateTransferReportHTML = (transfer: InventoryTransfer, printSettings?: PrintSettings['transfers']): string => {
  // Use custom header settings if available
  const headerSettings = printSettings?.headerSettings;
  const showHeader = headerSettings?.includeHeader !== false;

  return `
    <div class="transfer-container">
      <!-- Header -->
      ${showHeader ? `
      <div class="transfer-header">
        <div class="flex justify-between items-start">
          <div>
            ${headerSettings?.logo?.uploaded ? '<img src="/pdf-view-logo.png" alt="Logo" class="w-32 h-32 mb-1 object-contain" />' : ''}
            <div>
              ${(headerSettings?.leftText || 'No 75, DhanaLakshmi Avenue, Adyar, Chennai - 600020.').split(' || ').map(text => `<p class="text-sm text-gray-600">${text}</p>`).join('')}
            </div>
          </div>
          <div class="text-right">
            <div class="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mb-2">
              ${transfer.status}
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
          <h3 class="font-semibold mb-2">Transfer Details</h3>
          <p class="font-medium">${transfer.fromLocation} to ${transfer.toLocation}</p>
          <p class="text-sm text-gray-600">Inventory Transfer</p>
          </div>
        <div>
          <h3 class="font-semibold mb-2">Transfer Details</h3>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span>Transfer Number:</span>
              <span class="font-medium">${transfer.trackingNumber}</span>
          </div>
            <div class="flex justify-between">
              <span>Transfer Date:</span>
              <span>${formatDate(transfer.transferredDate)}</span>
          </div>
            <div class="flex justify-between">
              <span>Status:</span>
              <span class="text-green-600">${transfer.status}</span>
          </div>
            <div class="flex justify-between">
              <span>Urgency:</span>
              <span>${transfer.urgencyLevel}</span>
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
        <h3 class="font-semibold mb-3">Transferred Items</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #d1d5db;">
          <thead>
            <tr style="background-color: #f9fafb;">
              <th style="border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; text-align: left;">#</th>
              <th style="border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; text-align: left;">Item Name</th>
              <th style="border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; text-align: center;">Item Code</th>
              <th style="border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; text-align: center;">Brand</th>
              <th style="border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; text-align: center;">Quantity</th>
              <th style="border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; text-align: left;">Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${transfer.transferItems.map((item, index) => `
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 0.5rem 0.75rem;">${index + 1}</td>
                <td style="border: 1px solid #d1d5db; padding: 0.5rem 0.75rem;">
                  <div>
                    <p style="font-weight: 500; margin: 0;">${item.inventoryItem.itemName}</p>
                    <p style="font-size: 0.875rem; color: #4b5563; margin: 0;">${item.inventoryItem.brand || 'N/A'}</p>
                  </div>
                </td>
                <td style="border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; text-align: center;">${item.inventoryItem.itemCode || '-'}</td>
                <td style="border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; text-align: center;">${item.inventoryItem.brand || '-'}</td>
                <td style="border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; text-align: center; font-weight: 500;">${item.quantity}</td>
                <td style="border: 1px solid #d1d5db; padding: 0.5rem 0.75rem;">${item.itemRemarks || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Document Summary -->
      <div class="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h3 class="font-semibold mb-2">Transfer Notes</h3>
          <p class="text-sm text-gray-600">${transfer.additionalNotes || 'Transfer completed successfully. Items received in good condition.'}</p>
        </div>
        <div>
          <h3 class="font-semibold mb-2">Transfer Summary</h3>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span>Total Items:</span>
              <span>${transfer.transferItems.length}</span>
            </div>
            <div class="flex justify-between">
              <span>Total Quantity:</span>
              <span>${transfer.transferItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div class="flex justify-between">
              <span>Transfer Type:</span>
              <span>${transfer.transferType}</span>
            </div>
            <div class="flex justify-between">
              <span>Status:</span>
              <span class="text-green-600">${transfer.status}</span>
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
            ${printSettings.footerSettings.signatureNote.split(' || ').map(text => `<p class="leading-tight">${text} • Generated on ${formatDate(transfer.createdAt)}</p>`).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
};

/**
 * Get CSS styles for transfer report printing
 */
const getTransferReportPrintStyles = (_printSettings?: PrintSettings['transfers']) => {
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

    .transfer-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .transfer-header {
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

    .object-contain {
      object-fit: contain;
    }
  `;
};

/**
 * Print transfer report
 */
export const printInventoryTransferReport = (transfer: InventoryTransfer): void => {
  const printSettings = getTransferPrintSettings();
  const html = generateTransferReportHTML(transfer, printSettings);
  const styles = getTransferReportPrintStyles(printSettings);
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transfer Report - ${transfer.trackingNumber}</title>
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
 * Download transfer report as PDF
 */
export const downloadInventoryTransferReportAsPDF = (transfer: InventoryTransfer): void => {
  const printSettings = getTransferPrintSettings();
  const html = generateTransferReportHTML(transfer, printSettings);
  const styles = getTransferReportPrintStyles(printSettings);
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transfer Report - ${transfer.trackingNumber}</title>
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
