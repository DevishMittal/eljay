import { Payment } from '@/types';

/**
 * Print utility functions for payment receipts
 */

export interface PrintOptions {
  title?: string;
  filename?: string;
  includeStyles?: boolean;
  customStyles?: string;
}

/**
 * Print payment receipt with proper formatting
 */
export const printPaymentReceipt = (payment: Payment, options: PrintOptions = {}) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }

  const paymentHTML = generatePaymentReceiptHTML(payment, options);
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${options.title || `Payment Receipt ${payment.receiptNumber}`}</title>
        <style>
          ${getPaymentReceiptPrintStyles()}
          ${options.customStyles || ''}
        </style>
      </head>
      <body>
        ${paymentHTML}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};

/**
 * Download payment receipt as PDF (using browser's print to PDF)
 */
export const downloadPaymentReceiptAsPDF = (payment: Payment, options: PrintOptions = {}) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }

  const paymentHTML = generatePaymentReceiptHTML(payment, options);
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${options.title || `Payment Receipt ${payment.receiptNumber}`}</title>
        <style>
          ${getPaymentReceiptPrintStyles()}
          ${options.customStyles || ''}
        </style>
      </head>
      <body>
        ${paymentHTML}
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
 * Generate HTML for payment receipt printing
 */
const generatePaymentReceiptHTML = (payment: Payment, options: PrintOptions = {}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'status-completed';
      case 'Pending':
        return 'status-pending';
      case 'Failed':
        return 'status-failed';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'UPI':
        return 'method-upi';
      case 'Card':
        return 'method-card';
      case 'Cash':
        return 'method-cash';
      case 'Netbanking':
        return 'method-bank';
      case 'Cheque':
        return 'method-cheque';
      default:
        return 'method-default';
    }
  };

  const getTypeColor = (type: string) => {
    if (type === 'Full') {
      return 'type-full';
    }
    if (type === 'Advance') {
      return 'type-advance';
    }
    return 'type-default';
  };

  return `
    <div class="payment-receipt-container">
      <!-- Header -->
      <div class="payment-receipt-header">
        <div class="company-info">
          <h1 class="company-name">Eljay Hearing Care</h1>
          <p class="company-details">Professional Audiology Services</p>
          <p class="company-address">123 Healthcare Avenue, Medical District</p>
          <p class="company-address">Chennai, Tamil Nadu 600001</p>
          <p class="company-gst">GST: 33ABCDE1234F1Z5</p>
        </div>
        <div class="receipt-status">
          <div class="status-badge ${getStatusColor(payment.status)}">
            ${payment.status}
          </div>
          <div class="contact-info">
            <p>Phone: +91 44 1234 5678</p>
            <p>Email: info@eljayhearing.com</p>
            <p>Website: www.eljayhearing.com</p>
          </div>
        </div>
      </div>

      <!-- Receipt Title -->
      <div class="receipt-title">
        <h2>PAYMENT RECEIPT</h2>
        <p class="receipt-number">Receipt #${payment.receiptNumber}</p>
      </div>

      <!-- Payment Details -->
      <div class="payment-details">
        <div class="payment-info">
          <h3>Payment Information</h3>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Receipt Number:</span>
              <span class="info-value">${payment.receiptNumber}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Payment Date:</span>
              <span class="info-value">${formatDate(payment.paymentDate)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Amount:</span>
              <span class="info-value amount">${formatCurrency(payment.amount)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Payment Method:</span>
              <span class="info-value method-badge ${getMethodColor(payment.method)}">${payment.method}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Payment Type:</span>
              <span class="info-value type-badge ${getTypeColor(payment.paymentType)}">${payment.paymentType} Payment</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="info-value status-badge ${getStatusColor(payment.status)}">${payment.status}</span>
            </div>
            ${payment.transactionId ? `
              <div class="info-row">
                <span class="info-label">Transaction ID:</span>
                <span class="info-value">${payment.transactionId}</span>
              </div>
            ` : ''}
            <div class="info-row">
              <span class="info-label">Received By:</span>
              <span class="info-value">${payment.receivedBy}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Created Date:</span>
              <span class="info-value">${formatDate(payment.createdAt)}</span>
            </div>
          </div>
        </div>

        <div class="patient-info">
          <h3>Patient Information</h3>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Patient Name:</span>
              <span class="info-value">${payment.patientName}</span>
            </div>
            ${payment.patientId ? `
              <div class="info-row">
                <span class="info-label">Patient ID:</span>
                <span class="info-value">${payment.patientId}</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Payment Summary -->
      <div class="payment-summary">
        <h3>Payment Summary</h3>
        <div class="summary-table">
          <div class="summary-row">
            <span>Payment Amount:</span>
            <span class="text-right">${formatCurrency(payment.amount)}</span>
          </div>
          ${payment.paymentType === 'Advance' ? `
            <div class="summary-row">
              <span>Applied Amount:</span>
              <span class="text-right">${formatCurrency(payment.appliedAmount || 0)}</span>
            </div>
            <div class="summary-row">
              <span>Remaining Amount:</span>
              <span class="text-right">${formatCurrency(payment.remainingAmount || payment.amount)}</span>
            </div>
          ` : ''}
          <div class="summary-row total-row">
            <span class="font-bold">Total Payment:</span>
            <span class="text-right font-bold">${formatCurrency(payment.amount)}</span>
          </div>
        </div>
      </div>

      <!-- Additional Information -->
      <div class="additional-info">
        ${payment.description ? `
          <div class="description-section">
            <h4>Description</h4>
            <p>${payment.description}</p>
          </div>
        ` : ''}
        
        ${payment.notes ? `
          <div class="notes-section">
            <h4>Notes</h4>
            <p>${payment.notes}</p>
          </div>
        ` : ''}

        <div class="terms-section">
          <h4>Terms & Conditions</h4>
          <ul>
            <li>This receipt confirms the payment received for the services provided</li>
            <li>Please keep this receipt for your records</li>
            <li>For any queries regarding this payment, please contact us</li>
            <li>All payments are subject to our terms and conditions</li>
          </ul>
        </div>

        <div class="tax-info">
          <p>* This receipt is generated automatically and does not require a signature</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="payment-receipt-footer">
        <p>Thank you for choosing Eljay Hearing Care for your audiology needs.</p>
        <p>This is a computer-generated receipt and does not require a signature.</p>
        <p>Generated on ${formatDate(payment.createdAt)}</p>
      </div>
    </div>
  `;
};

/**
 * Get CSS styles for payment receipt printing
 */
const getPaymentReceiptPrintStyles = () => {
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

    .payment-receipt-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .payment-receipt-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #333;
    }

    .company-name {
      font-size: 28px;
      font-weight: bold;
      margin: 0 0 10px 0;
      color: #1f2937;
    }

    .company-details,
    .company-address,
    .company-gst {
      margin: 5px 0;
      color: #6b7280;
      font-size: 14px;
    }

    .receipt-status {
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

    .status-completed {
      background-color: #dcfce7;
      color: #166534;
    }

    .status-pending {
      background-color: #fef3c7;
      color: #92400e;
    }

    .status-failed {
      background-color: #fee2e2;
      color: #dc2626;
    }

    .status-cancelled {
      background-color: #f3f4f6;
      color: #374151;
    }

    .contact-info p {
      margin: 3px 0;
      font-size: 14px;
      color: #6b7280;
    }

    .receipt-title {
      text-align: center;
      margin-bottom: 30px;
    }

    .receipt-title h2 {
      font-size: 24px;
      font-weight: bold;
      margin: 0 0 10px 0;
      color: #1f2937;
    }

    .receipt-number {
      font-size: 16px;
      color: #6b7280;
      margin: 0;
    }

    .payment-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 30px;
    }

    .payment-info h3,
    .patient-info h3 {
      font-size: 18px;
      font-weight: bold;
      margin: 0 0 15px 0;
      color: #1f2937;
    }

    .info-grid {
      background-color: #f9fafb;
      padding: 20px;
      border-radius: 8px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin: 12px 0;
      font-size: 14px;
    }

    .info-label {
      font-weight: 500;
      color: #374151;
    }

    .info-value {
      font-weight: bold;
      color: #1f2937;
    }

    .info-value.amount {
      font-size: 18px;
      color: #059669;
    }

    .method-badge,
    .type-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }

    .method-upi {
      background-color: #ede9fe;
      color: #7c3aed;
    }

    .method-card {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .method-cash {
      background-color: #dcfce7;
      color: #166534;
    }

    .method-bank {
      background-color: #fed7aa;
      color: #ea580c;
    }

    .method-cheque {
      background-color: #f3f4f6;
      color: #374151;
    }

    .type-full {
      background-color: #ede9fe;
      color: #7c3aed;
    }

    .type-advance {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .payment-summary {
      margin-bottom: 30px;
    }

    .payment-summary h3 {
      font-size: 18px;
      font-weight: bold;
      margin: 0 0 15px 0;
      color: #1f2937;
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

    .text-right {
      text-align: right;
    }

    .font-bold {
      font-weight: bold;
    }

    .additional-info {
      margin-bottom: 30px;
    }

    .description-section,
    .notes-section,
    .terms-section {
      margin-bottom: 20px;
    }

    .description-section h4,
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

    .payment-receipt-footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #d1d5db;
      color: #6b7280;
    }

    .payment-receipt-footer p {
      margin: 5px 0;
      font-size: 14px;
    }
  `;
};
