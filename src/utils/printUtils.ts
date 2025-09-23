import { Invoice, Payment, PrintSettings } from '@/types';

/**
 * Print utility functions for invoices and other documents
 */

export interface PrintOptions {
  title?: string;
  filename?: string;
  includeStyles?: boolean;
  customStyles?: string;
}

/**
 * Load print settings from localStorage
 */
export const getPrintSettings = (documentType: 'b2cInvoice' | 'b2bInvoice' | 'payments'): PrintSettings['b2cInvoice'] | PrintSettings['b2bInvoice'] | PrintSettings['payments'] => {
  try {
    // Try to load settings for all document types first
    const savedAllSettings = localStorage.getItem('printSettings_all');
    if (savedAllSettings) {
      const parsedSettings: PrintSettings = JSON.parse(savedAllSettings);
      return parsedSettings[documentType];
    }
    
    // If no global settings, try to load individual document type settings
    const savedSettings = localStorage.getItem(`printSettings_${documentType}`);
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    
    // Return default settings if nothing is saved
    return getDefaultPrintSettings();
  } catch (error) {
    console.error('Error loading print settings:', error);
    return getDefaultPrintSettings();
  }
};

/**
 * Get default print settings for a document type
 */
const getDefaultPrintSettings = () => {
  const defaultSettings = {
    pageSettings: {
      paperSize: 'A4' as const,
      orientation: 'Portrait' as const,
      printerType: 'Color' as const,
      margins: { top: 2.00, left: 0.25, bottom: 0.50, right: 0.25 }
    },
    headerSettings: {
      includeHeader: true,
      headerText: 'Hearing Centre Adyar',
      leftText: 'No 75, Dhanalkshmi Avenue, Adyar, Chennai - 600020',
      rightText: 'GST: 33BXCFA4838GL2U | Phone: +91 6385 054 111',
      logo: { uploaded: true, type: 'Square' as const, alignment: 'Left' as const }
    },
            footerSettings: {
              topMargin: 0.00,
              fullWidthContent: [],
              leftSignature: {
                name: '',
                title: '',
                organization: ''
              },
              rightSignature: {
                name: '',
                title: '',
                organization: '',
                date: ''
              },
              thankYouMessage: 'Thank you for choosing Eljay Hearing Care for your audiology needs.',
              signatureNote: 'This is a computer-generated invoice and does not require a signature.',
              additionalText: ''
            }
  };
  
  return defaultSettings;
};

/**
 * Test function to verify print settings are loaded correctly
 */
export const testPrintSettings = (documentType: 'b2cInvoice' | 'b2bInvoice' | 'payments') => {
  const settings = getPrintSettings(documentType);
  console.log(`Print settings for ${documentType}:`, settings);
  return settings;
};

/**
 * Print a specific element by ID
 */
export const printElement = (elementId: string, title?: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }

  // Get the element's HTML
  const elementHTML = element.outerHTML;
  
  // Create the print document
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title || 'Print Document'}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 20px;
            color: #000;
            line-height: 1.6;
          }
          @media print {
            body { margin: 0; padding: 15px; }
            .no-print { display: none !important; }
            .print-break { page-break-before: always; }
            .print-break-after { page-break-after: always; }
            .print-break-inside { page-break-inside: avoid; }
          }
          
          .print-header {
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          
          .print-title {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
          }
          
          .print-date {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          
          .text-right {
            text-align: right;
          }
          
          .text-center {
            text-align: center;
          }
          
          .font-bold {
            font-weight: bold;
          }
          
          .text-sm {
            font-size: 0.875rem;
          }
          
          .text-xs {
            font-size: 0.75rem;
          }
          
          .mb-4 {
            margin-bottom: 1rem;
          }
          
          .mt-4 {
            margin-top: 1rem;
          }
          
          .p-4 {
            padding: 1rem;
          }
          
          .bg-gray-50 {
            background-color: #f9fafb;
          }
          
          .border {
            border: 1px solid #e5e7eb;
          }
          
          .rounded {
            border-radius: 0.25rem;
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1 class="print-title">${title || 'Document'}</h1>
          <div class="print-date">${new Date().toLocaleDateString()}</div>
        </div>
        ${elementHTML}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};

/**
 * Print invoice with proper formatting
 */
export const printInvoice = (invoice: Invoice, options: PrintOptions = {}, payments: Payment[] = []) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }

  // Get document type based on invoice type
  const documentType = invoice.invoiceType === 'B2C' ? 'b2cInvoice' : 'b2bInvoice';
  const printSettings = getPrintSettings(documentType);
  
  const invoiceHTML = generateInvoiceHTML(invoice, payments, printSettings);
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${options.title || `Invoice ${invoice.invoiceNumber}`}</title>
        <style>
          ${getInvoicePrintStyles(printSettings)}
          ${options.customStyles || ''}
        </style>
      </head>
      <body>
        ${invoiceHTML}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};

/**
 * Download invoice as PDF (using browser's print to PDF)
 */
export const downloadInvoiceAsPDF = (invoice: Invoice, options: PrintOptions = {}, payments: Payment[] = []) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }

  // Get document type based on invoice type
  const documentType = invoice.invoiceType === 'B2C' ? 'b2cInvoice' : 'b2bInvoice';
  const printSettings = getPrintSettings(documentType);
  
  const invoiceHTML = generateInvoiceHTML(invoice, payments, printSettings);
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${options.title || `Invoice ${invoice.invoiceNumber}`}</title>
        <style>
          ${getInvoicePrintStyles(printSettings)}
          ${options.customStyles || ''}
        </style>
      </head>
      <body>
        ${invoiceHTML}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  
  // Wait for content to load, then trigger print dialog
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    
    // Close window after a delay to allow user to save PDF
    setTimeout(() => {
      printWindow.close();
    }, 1000);
  };
};

/**
 * Generate HTML for invoice printing
 */
const generateInvoiceHTML = (invoice: Invoice, payments: Payment[] = [], printSettings?: PrintSettings['b2cInvoice'] | PrintSettings['b2bInvoice']) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Use custom header settings if available
  const headerSettings = printSettings?.headerSettings;
  const showHeader = headerSettings?.includeHeader !== false;
  
  return `
    <div class="invoice-container">
      <!-- Header -->
      ${showHeader ? `
      <div class="invoice-header">
        <div class="company-info">
          <div class="logo-and-address">
            ${headerSettings?.logo?.uploaded ? '<img src="/pdf-view-logo.png" alt="Eljay Hearing Care" class="company-logo" />' : ''}
            <div class="company-address-section">
              <h2 class="company-title">${headerSettings?.headerText || 'Hearing Centre Adyar'}</h2>
              <p class="company-address">${headerSettings?.leftText || 'No 75, DhanaLakshmi Avenue, Adyar, Chennai - 600020.'}</p>
            </div>
          </div>
        </div>
        <div class="invoice-status">
          <div class="status-badge status-${invoice.paymentStatus.toLowerCase().replace(' ', '-')}">
            ${invoice.paymentStatus}
          </div>
          <div class="contact-info">
            ${(headerSettings?.rightText || 'GST: 33BXCFA4838GL2U | Phone: +91 6385 054 111').split(' || ').map(text => `<p>${text}</p>`).join('')}
          </div>
        </div>
      </div>
      ` : ''}

      <!-- Bill To and Invoice Details -->
      <div class="invoice-details">
        <div class="bill-to">
          <h3>Bill To</h3>
          <p class="customer-name">${invoice.invoiceType === 'B2C' ? invoice.patientName : invoice.organizationName}</p>
          <p class="customer-type">${invoice.invoiceType === 'B2C' ? 'Individual Patient' : 'Corporate Account'}</p>
          ${invoice.invoiceType === 'B2C' ? '<p class="customer-id">Patient ID: PAT001</p>' : ''}
          ${invoice.invoiceType === 'B2B' ? `<p class="customer-contact">Primary Contact: ${invoice.patientName}</p>` : ''}
        </div>
        <div class="invoice-info">
          <h3>Invoice Details</h3>
          <div class="info-row">
            <span>Invoice Number:</span>
            <span class="info-value">${invoice.invoiceNumber}</span>
          </div>
          <div class="info-row">
            <span>Invoice Date:</span>
            <span class="info-value">${formatDate(invoice.invoiceDate)}</span>
          </div>
          <div class="info-row">
            <span>Due Date:</span>
            <span class="info-value">${formatDate(invoice.invoiceDate)}</span>
          </div>
          <div class="info-row">
            <span>Created By:</span>
            <span class="info-value">Staff</span>
          </div>
        </div>
      </div>

      <!-- Services Table -->
      <div class="services-section">
        <h3>${invoice.invoiceType === 'B2C' ? 'Services & Items' : 'Screening Details'}</h3>
        <table class="services-table">
          <thead>
            <tr>
              ${invoice.invoiceType === 'B2C' ? `
                <th>Service/Item</th>
                <th class="text-center">Qty</th>
                <th class="text-right">Unit Cost</th>
                <th class="text-right">Discount</th>
                <th class="text-right">Total</th>
              ` : `
                <th>S.No</th>
                <th>Date</th>
                <th>OP/IP No</th>
                <th>Bio Name</th>
                <th>Diagnostic</th>
                <th class="text-right">Amount</th>
                <th class="text-right">Discount</th>
                <th class="text-right">Total</th>
              `}
            </tr>
          </thead>
          <tbody>
            ${invoice.invoiceType === 'B2C' ? 
              (invoice.services?.map((service) => `
                <tr>
                  <td>
                    <div class="service-details">
                      <p class="service-name">${service.serviceName}</p>
                      <p class="service-patient">${service.description}</p>
                      ${service.description ? '<p class="service-date">Warranty: 3 years warranty + health tracking</p>' : ''}
                    </div>
                  </td>
                  <td class="text-center">${service.quantity}</td>
                  <td class="text-right">₹${service.unitCost.toLocaleString()}</td>
                  <td class="text-right text-red">${service.discount > 0 ? `-₹${service.discount.toLocaleString()}` : '-'}</td>
                  <td class="text-right font-bold">₹${(service.total || ((service.quantity * service.unitCost) - service.discount)).toLocaleString()}</td>
                </tr>
              `).join('') || '') :
              (invoice.screenings?.map((screening, index) => `
                <tr>
                  <td>${screening.serialNumber || index + 1}</td>
                  <td>${formatDate(screening.screeningDate)}</td>
                  <td>${screening.opNumber}</td>
                  <td>${screening.bioName}</td>
                  <td>${screening.diagnosticName}</td>
                  <td class="text-right">₹${screening.amount.toLocaleString()}</td>
                  <td class="text-right text-red">${screening.discount > 0 ? `-₹${screening.discount.toLocaleString()}` : '-'}</td>
                  <td class="text-right font-bold">₹${(screening.amount - (screening.discount || 0)).toLocaleString()}</td>
                </tr>
              `).join('') || '')
            }
          </tbody>
        </table>
      </div>

      <!-- Payment Details Section -->
      ${payments.length > 0 ? `
        <div class="payment-details-section">
          <h3>Payment Details</h3>
          <table class="payment-table">
            <thead>
              <tr>
                <th>Receipt Number</th>
                <th>Date</th>
                <th>Payment Method</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${payments.map(payment => `
                <tr>
                  <td>${payment.receiptNumber}</td>
                  <td>${formatDate(payment.paymentDate)}</td>
                  <td>
                    <span class="payment-method-badge method-${payment.method.toLowerCase()}">${payment.method}</span>
                  </td>
                  <td class="text-right font-bold">₹${payment.amount.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="payment-summary">
            <div class="payment-total">
              <span>Total Payments Received:</span>
              <span class="font-bold">₹${payments.reduce((total, payment) => total + payment.amount, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Two Column Layout: Additional Info and Invoice Summary -->
      <div class="summary-section">
        <div class="additional-info">
          <h3>Additional Information</h3>
          
          ${invoice.warranty ? `
            <div class="warranty-section">
              <h4>General Warranty Information</h4>
              <p>${invoice.warranty}</p>
            </div>
          ` : ''}
          
          ${invoice.notes ? `
            <div class="notes-section">
              <h4>Notes</h4>
              <p>${invoice.notes}</p>
            </div>
          ` : ''}
          
          ${invoice.invoiceType === 'B2B' ? `
            <div class="terms-section">
              <h4>Corporate Terms & Conditions</h4>
              <ul>
                <li>Payment terms: Net 30 days from invoice date</li>
                <li>All screenings conducted as per corporate agreement</li>
                <li>Reports will be provided within 48 hours of screening</li>
                <li>Follow-up consultations available on request</li>
                <li>For billing queries, contact: accounts@eljayhearing.com</li>
              </ul>
            </div>
          ` : ''}
        </div>

        <div class="invoice-summary">
          <h3>Invoice Summary</h3>
          <div class="summary-table">
            <div class="summary-row">
              <span>${invoice.invoiceType === 'B2C' ? 'Subtotal:' : 'Screening Subtotal:'}</span>
              <span class="text-right">₹${invoice.subtotal.toLocaleString()}</span>
            </div>
            <div class="summary-row">
              <span>Total Discount:</span>
              <span class="text-right text-red">-₹${invoice.totalDiscount.toLocaleString()}</span>
            </div>
            <div class="summary-row">
              <span>Taxable Amount:</span>
              <span class="text-right">₹${invoice.taxableAmount.toLocaleString()}</span>
            </div>
            <div class="summary-row">
              <span>SGST (${invoice.sgstRate}%):</span>
              <span class="text-right">₹${invoice.sgstAmount.toLocaleString()}</span>
            </div>
            <div class="summary-row">
              <span>CGST (${invoice.cgstRate}%):</span>
              <span class="text-right">₹${invoice.cgstAmount.toLocaleString()}</span>
            </div>
            <div class="summary-row">
              <span>Total Tax:</span>
              <span class="text-right">₹${invoice.totalTax.toLocaleString()}</span>
            </div>
            <div class="summary-row total-row">
              <span class="font-bold">Total Amount:</span>
              <span class="text-right font-bold">₹${invoice.totalAmount.toLocaleString()}</span>
            </div>
            
            ${payments.length > 0 ? `
              <div class="summary-row">
                <span>Amount Paid:</span>
                <span class="text-right text-green">₹${payments.reduce((total, payment) => total + payment.amount, 0).toLocaleString()}</span>
              </div>
              <div class="summary-row balance-row">
                <span class="font-bold">Balance Due:</span>
                <span class="text-right font-bold text-red">₹${Math.max(0, invoice.totalAmount - payments.reduce((total, payment) => total + payment.amount, 0)).toLocaleString()}</span>
              </div>
            ` : ''}
            
            ${invoice.invoiceType === 'B2B' ? `
              <div class="payment-instructions">
                <h5>Payment Instructions</h5>
                <p>Bank: HDFC Bank Ltd.</p>
                <p>Account: Eljay Hearing Care Pvt Ltd</p>
                <p>A/C No: 50200012345678</p>
                <p>IFSC: HDFC0001234</p>
                <p><strong>Please mention invoice number in transfer details</strong></p>
              </div>
            ` : ''}
          </div>
        </div>
      </div>

              <!-- Footer -->
              <div class="invoice-footer" style="margin-top: ${printSettings?.footerSettings?.topMargin || 0}in;">
                ${printSettings?.footerSettings?.thankYouMessage ? `
                  ${printSettings.footerSettings.thankYouMessage.split(' || ').map(text => `<p>${text}</p>`).join('')}
                ` : ''}
                ${printSettings?.footerSettings?.signatureNote ? `
                  ${printSettings.footerSettings.signatureNote.split(' || ').map(text => `<p>${text}</p>`).join('')}
                ` : ''}
                ${printSettings?.footerSettings?.additionalText ? `
                  ${printSettings.footerSettings.additionalText.split(' || ').map(text => `<p>${text}</p>`).join('')}
                ` : ''}
                <p>Generated on ${formatDate(invoice.createdAt)}</p>
              </div>
    </div>
  `;
};

/**
 * Get CSS styles for invoice printing
 */
const getInvoicePrintStyles = (printSettings?: PrintSettings['b2cInvoice'] | PrintSettings['b2bInvoice']) => {
  const pageSettings = printSettings?.pageSettings;
  const margins = pageSettings?.margins || { top: 2.00, left: 0.25, bottom: 0.50, right: 0.25 };
  
  return `
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

    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #333;
    }

    .company-info {
      flex: 1;
    }

    .logo-and-address {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .company-logo {
      width: 80px;
      height: auto;
      margin-bottom: 10px;
    }

    .company-address-section {
      margin-top: 0;
    }

    .company-address {
      margin: 2px 0;
      color: #6b7280;
      font-size: 12px;
    }

    .invoice-status {
      text-align: right;
    }

    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 15px;
    }

    .status-paid {
      background-color: #dcfce7;
      color: #166534;
    }

    .status-pending {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .status-cancelled {
      background-color: #fee2e2;
      color: #dc2626;
    }

    .contact-info p {
      margin: 3px 0;
      font-size: 14px;
      color: #6b7280;
    }

    .invoice-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 30px;
    }

    .bill-to h3,
    .invoice-info h3 {
      font-size: 18px;
      font-weight: bold;
      margin: 0 0 15px 0;
      color: #1f2937;
    }

    .customer-name {
      font-weight: bold;
      font-size: 16px;
      margin: 5px 0;
      color: #1f2937;
    }

    .customer-type,
    .customer-id,
    .customer-contact {
      margin: 3px 0;
      color: #6b7280;
      font-size: 14px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin: 8px 0;
      font-size: 14px;
    }

    .info-value {
      font-weight: bold;
      color: #1f2937;
    }

    .services-section {
      margin-bottom: 30px;
    }

    .services-section h3 {
      font-size: 18px;
      font-weight: bold;
      margin: 0 0 15px 0;
      color: #1f2937;
    }

    .payment-details-section {
      margin-bottom: 30px;
    }

    .payment-details-section h3 {
      font-size: 18px;
      font-weight: bold;
      margin: 0 0 15px 0;
      color: #1f2937;
    }

    .payment-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }

    .payment-table th,
    .payment-table td {
      border: 1px solid #d1d5db;
      padding: 12px 8px;
      text-align: left;
    }

    .payment-table th {
      background-color: #f9fafb;
      font-weight: bold;
      color: #374151;
    }

    .payment-method-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: bold;
    }

    .method-cash {
      background-color: #dcfce7;
      color: #166534;
    }

    .method-card {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .method-upi {
      background-color: #f3e8ff;
      color: #7c3aed;
    }

    .method-netbanking {
      background-color: #fef3c7;
      color: #92400e;
    }

    .method-cheque {
      background-color: #f3f4f6;
      color: #374151;
    }

    .payment-summary {
      margin-top: 15px;
      padding: 15px;
      background-color: #eff6ff;
      border-radius: 6px;
    }

    .payment-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      color: #1e40af;
    }

    .services-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }

    .services-table th,
    .services-table td {
      border: 1px solid #d1d5db;
      padding: 12px 8px;
      text-align: left;
    }

    .services-table th {
      background-color: #f9fafb;
      font-weight: bold;
      color: #374151;
    }

    .service-details p {
      margin: 2px 0;
    }

    .service-name {
      font-weight: bold;
      color: #1f2937;
    }

    .service-patient {
      color: #6b7280;
      font-size: 13px;
    }

    .service-date {
      color: #3b82f6;
      font-size: 12px;
    }

    .text-right {
      text-align: right;
    }

    .text-center {
      text-align: center;
    }

    .text-red {
      color: #dc2626;
    }

    .text-green {
      color: #059669;
    }

    .font-bold {
      font-weight: bold;
    }

    .warranty-section,
    .notes-section {
      margin-bottom: 20px;
    }

    .warranty-section h4,
    .notes-section h4 {
      font-size: 16px;
      font-weight: bold;
      margin: 0 0 10px 0;
      color: #374151;
    }

    .balance-row {
      border-top: 2px solid #d1d5db;
      padding-top: 12px;
      margin-top: 15px;
      font-size: 16px;
    }

    .summary-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 30px;
    }

    .additional-info h3,
    .invoice-summary h3 {
      font-size: 18px;
      font-weight: bold;
      margin: 0 0 15px 0;
      color: #1f2937;
    }

    .notes-section,
    .terms-section {
      margin-bottom: 20px;
    }

    .notes-section h4,
    .terms-section h4 {
      font-size: 16px;
      font-weight: bold;
      margin: 0 0 10px 0;
      color: #374151;
    }

    .terms-section ul {
      margin: 0;
      padding-left: 20px;
    }

    .terms-section li {
      margin: 5px 0;
      font-size: 14px;
      color: #6b7280;
    }

    .tax-info {
      background-color: #eff6ff;
      padding: 12px;
      border-radius: 6px;
      margin-top: 15px;
    }

    .tax-info p {
      margin: 0;
      font-size: 12px;
      color: #1e40af;
    }

    .summary-table {
      background-color: #f9fafb;
      padding: 20px;
      border-radius: 8px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin: 8px 0;
      font-size: 14px;
    }

    .total-row {
      border-top: 2px solid #d1d5db;
      padding-top: 12px;
      margin-top: 15px;
      font-size: 16px;
    }

    .invoice-footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #d1d5db;
      color: #6b7280;
    }

    .invoice-footer p {
      margin: 5px 0;
      font-size: 14px;
    }

    .company-title {
      font-size: 18px;
      font-weight: bold;
      margin: 0 0 10px 0;
      color: #1f2937;
    }

    .payment-instructions {
      background-color: #f9fafb;
      padding: 15px;
      border-radius: 6px;
      margin-top: 15px;
    }

    .payment-instructions h5 {
      font-size: 14px;
      font-weight: bold;
      margin: 0 0 10px 0;
      color: #374151;
    }

    .payment-instructions p {
      margin: 3px 0;
      font-size: 12px;
      color: #6b7280;
    }

    .status-partially-paid {
      background-color: #fef3c7;
      color: #92400e;
    }
  `;
};

/**
 * Print current page (hide non-printable elements)
 */
export const printCurrentPage = () => {
  // Add print styles to hide non-printable elements
  const style = document.createElement('style');
  style.textContent = `
    @media print {
      .no-print,
      nav,
      .sidebar,
      .header,
      .footer,
      button:not(.print-button),
      .print-actions {
        display: none !important;
      }
      
      body {
        margin: 0;
        padding: 20px;
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
  `;
  
  document.head.appendChild(style);
  
  // Print the page
  window.print();
  
  // Remove the style after printing
  setTimeout(() => {
    document.head.removeChild(style);
  }, 1000);
};

/**
 * Print specific section with custom styling
 */
export const printSection = (elementId: string, options: PrintOptions = {}) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }

  const elementHTML = element.outerHTML;
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${options.title || 'Print Document'}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 20px;
            color: #000;
            line-height: 1.6;
          }
          @media print {
            body { margin: 0; padding: 15px; }
            .no-print { display: none !important; }
            .print-break { page-break-before: always; }
            .print-break-after { page-break-after: always; }
            .print-break-inside { page-break-inside: avoid; }
          }
          ${options.customStyles || ''}
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1 class="print-title">${options.title || 'Document'}</h1>
          <div class="print-date">${new Date().toLocaleDateString()}</div>
        </div>
        ${elementHTML}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};
