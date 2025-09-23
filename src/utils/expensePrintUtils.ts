import { Expense } from '@/types';

/**
 * Print utility functions for expense reports
 */

export interface PrintOptions {
  title?: string;
  filename?: string;
  includeStyles?: boolean;
  customStyles?: string;
}

/**
 * Print expense report with proper formatting
 */
export const printExpenseReport = (expense: Expense, options: PrintOptions = {}) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }

  const expenseHTML = generateExpenseReportHTML(expense, options);
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${options.title || `Expense Report ${expense.expenseNumber}`}</title>
        <style>
          ${getExpenseReportPrintStyles()}
          ${options.customStyles || ''}
        </style>
      </head>
      <body>
        ${expenseHTML}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};

/**
 * Download expense report as PDF (using browser's print to PDF)
 */
export const downloadExpenseReportAsPDF = (expense: Expense, options: PrintOptions = {}) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }

  const expenseHTML = generateExpenseReportHTML(expense, options);
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${options.title || `Expense Report ${expense.expenseNumber}`}</title>
        <style>
          ${getExpenseReportPrintStyles()}
          ${options.customStyles || ''}
        </style>
      </head>
      <body>
        ${expenseHTML}
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
 * Generate HTML for expense report printing
 */
const generateExpenseReportHTML = (expense: Expense, options: PrintOptions = {}) => {
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Travel':
        return 'category-travel';
      case 'Marketing':
        return 'category-marketing';
      case 'Supplies':
        return 'category-supplies';
      case 'Equipment':
        return 'category-equipment';
      case 'Office':
        return 'category-office';
      case 'Utilities':
        return 'category-utilities';
      case 'Insurance':
        return 'category-insurance';
      case 'Training':
        return 'category-training';
      case 'Maintenance':
        return 'category-maintenance';
      case 'Software':
        return 'category-software';
      default:
        return 'category-default';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'Cash':
        return 'method-cash';
      case 'Card':
        return 'method-card';
      case 'Credit Card':
        return 'method-credit-card';
      case 'Cheque':
        return 'method-cheque';
      case 'Bank Transfer':
        return 'method-bank';
      default:
        return 'method-default';
    }
  };

  return `
    <div class="expense-report-container">
      <!-- Header -->
      <div class="expense-report-header">
        <div class="company-info">
          <h1 class="company-name">Eljay Hearing Care</h1>
          <p class="company-details">Professional Audiology Services</p>
          <p class="company-address">123 Healthcare Avenue, Medical District</p>
          <p class="company-address">Chennai, Tamil Nadu 600001</p>
          <p class="company-gst">GST: 33ABCDE1234F1Z5</p>
        </div>
        <div class="expense-status">
          <div class="contact-info">
            <p>Phone: +91 44 1234 5678</p>
            <p>Email: info@eljayhearing.com</p>
            <p>Website: www.eljayhearing.com</p>
          </div>
        </div>
      </div>

      <!-- Report Title -->
      <div class="report-title">
        <h2>EXPENSE REPORT</h2>
        <p class="expense-number">Expense #${expense.expenseNumber}</p>
      </div>

      <!-- Expense Details -->
      <div class="expense-details">
        <div class="expense-info">
          <h3>Expense Information</h3>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Expense Number:</span>
              <span class="info-value">${expense.expenseNumber}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Expense Date:</span>
              <span class="info-value">${formatDate(expense.date)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Category:</span>
              <span class="info-value category-badge ${getCategoryColor(expense.category)}">${expense.category}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Payment Method:</span>
              <span class="info-value method-badge ${getMethodColor(expense.paymentMethod)}">${expense.paymentMethod}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Vendor:</span>
              <span class="info-value">${expense.vendor}</span>
            </div>
            ${expense.approvedBy ? `
              <div class="info-row">
                <span class="info-label">Approved By:</span>
                <span class="info-value">${expense.approvedBy}</span>
              </div>
            ` : ''}
            <div class="info-row">
              <span class="info-label">Created Date:</span>
              <span class="info-value">${formatDate(expense.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Description Section -->
      <div class="description-section">
        <h3>Description</h3>
        <div class="description-content">
          <p class="description-text">${expense.description}</p>
          ${expense.remarks ? `
            <div class="remarks-section">
              <h4>Remarks</h4>
              <p class="remarks-text">${expense.remarks}</p>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Financial Summary -->
      <div class="financial-summary">
        <h3>Financial Summary</h3>
        <div class="summary-table">
          <div class="summary-row">
            <span>Expense Amount:</span>
            <span class="text-right">${formatCurrency(expense.amount)}</span>
          </div>
          <div class="summary-row">
            <span>Tax Amount:</span>
            <span class="text-right">${formatCurrency(expense.taxAmount)}</span>
          </div>
          <div class="summary-row total-row">
            <span class="font-bold">Total Amount:</span>
            <span class="text-right font-bold">${formatCurrency(expense.totalAmount)}</span>
          </div>
        </div>
      </div>

      <!-- Additional Information -->
      <div class="additional-info">
        <div class="terms-section">
          <h4>Terms & Conditions</h4>
          <ul>
            <li>This expense report confirms the business expense incurred</li>
            <li>All expenses are subject to company expense policies</li>
            <li>Please keep this report for your records</li>
            <li>For any queries regarding this expense, please contact the finance department</li>
          </ul>
        </div>

        <div class="tax-info">
          <p>* This expense report is generated automatically and does not require a signature</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="expense-report-footer">
        <p>Thank you for maintaining accurate expense records for Eljay Hearing Care.</p>
        <p>This is a computer-generated expense report and does not require a signature.</p>
        <p>Generated on ${formatDate(expense.createdAt)}</p>
      </div>
    </div>
  `;
};

/**
 * Get CSS styles for expense report printing
 */
const getExpenseReportPrintStyles = () => {
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

    .expense-report-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .expense-report-header {
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

    .expense-status {
      text-align: right;
    }

    .contact-info p {
      margin: 3px 0;
      font-size: 14px;
      color: #6b7280;
    }

    .report-title {
      text-align: center;
      margin-bottom: 30px;
    }

    .report-title h2 {
      font-size: 24px;
      font-weight: bold;
      margin: 0 0 10px 0;
      color: #1f2937;
    }

    .expense-number {
      font-size: 16px;
      color: #6b7280;
      margin: 0;
    }

    .expense-details {
      margin-bottom: 30px;
    }

    .expense-info h3 {
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

    .category-badge,
    .method-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }

    .category-travel {
      background-color: #fef3c7;
      color: #92400e;
    }

    .category-marketing {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .category-supplies {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .category-equipment {
      background-color: #dcfce7;
      color: #166534;
    }

    .category-office {
      background-color: #fed7aa;
      color: #ea580c;
    }

    .category-utilities {
      background-color: #fee2e2;
      color: #dc2626;
    }

    .category-insurance {
      background-color: #e0e7ff;
      color: #3730a3;
    }

    .category-training {
      background-color: #fce7f3;
      color: #be185d;
    }

    .category-maintenance {
      background-color: #f3f4f6;
      color: #374151;
    }

    .category-software {
      background-color: #ccfbf1;
      color: #0f766e;
    }

    .category-default {
      background-color: #f3f4f6;
      color: #374151;
    }

    .method-cash {
      background-color: #dcfce7;
      color: #166534;
    }

    .method-card {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .method-credit-card {
      background-color: #e0e7ff;
      color: #3730a3;
    }

    .method-cheque {
      background-color: #fed7aa;
      color: #ea580c;
    }

    .method-bank {
      background-color: #ede9fe;
      color: #7c3aed;
    }

    .method-default {
      background-color: #f3f4f6;
      color: #374151;
    }

    .description-section {
      margin-bottom: 30px;
    }

    .description-section h3 {
      font-size: 18px;
      font-weight: bold;
      margin: 0 0 15px 0;
      color: #1f2937;
    }

    .description-content {
      background-color: #f9fafb;
      padding: 20px;
      border-radius: 8px;
    }

    .description-text {
      margin: 0 0 15px 0;
      font-size: 14px;
      color: #374151;
      line-height: 1.6;
    }

    .remarks-section {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #e5e7eb;
    }

    .remarks-section h4 {
      font-size: 16px;
      font-weight: bold;
      margin: 0 0 10px 0;
      color: #374151;
    }

    .remarks-text {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
      line-height: 1.6;
    }

    .financial-summary {
      margin-bottom: 30px;
    }

    .financial-summary h3 {
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

    .terms-section {
      margin-bottom: 20px;
    }

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

    .expense-report-footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #d1d5db;
      color: #6b7280;
    }

    .expense-report-footer p {
      margin: 5px 0;
      font-size: 14px;
    }
  `;
};
