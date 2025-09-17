import { InventoryTransfer } from '@/types';

/**
 * Print utility functions for inventory transfer reports
 */

export interface TransferPrintOptions {
  title?: string;
  filename?: string;
  includeStyles?: boolean;
  customStyles?: string;
}

/**
 * Print inventory transfer report with proper formatting
 */
export const printInventoryTransferReport = (transfer: InventoryTransfer, options: TransferPrintOptions = {}) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }

  const transferHTML = generateTransferReportHTML(transfer, options);
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${options.title || `Transfer Report ${transfer.trackingNumber}`}</title>
        <style>
          ${getTransferReportPrintStyles()}
          ${options.customStyles || ''}
        </style>
      </head>
      <body>
        ${transferHTML}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};

/**
 * Download inventory transfer report as PDF (using browser's print to PDF)
 */
export const downloadInventoryTransferReportAsPDF = (transfer: InventoryTransfer, options: TransferPrintOptions = {}) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }

  const transferHTML = generateTransferReportHTML(transfer, options);
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${options.title || `Transfer Report ${transfer.trackingNumber}`}</title>
        <style>
          ${getTransferReportPrintStyles()}
          ${options.customStyles || ''}
        </style>
      </head>
      <body>
        ${transferHTML}
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
 * Generate HTML for inventory transfer report printing
 */
const generateTransferReportHTML = (transfer: InventoryTransfer, options: TransferPrintOptions = {}) => {
  // Options can be used for future customization
  const {} = options;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusBadgeHTML = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'Delivered': 'background: #10B981; color: white;',
      'In Transit': 'background: #3B82F6; color: white;',
      'Pending': 'background: #F59E0B; color: white;',
      'Cancelled': 'background: #EF4444; color: white;'
    };
    
    const style = statusColors[status] || 'background: #6B7280; color: white;';
    return `<span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; ${style}">${status}</span>`;
  };

  const getUrgencyBadgeHTML = (urgency: string) => {
    const urgencyColors: { [key: string]: string } = {
      'High': 'background: #FEE2E2; color: #DC2626;',
      'Medium': 'background: #FEF3C7; color: #D97706;',
      'Low': 'background: #E0F2FE; color: #0284C7;'
    };
    
    const style = urgencyColors[urgency] || 'background: #F3F4F6; color: #6B7280;';
    return `<span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; ${style}">${urgency}</span>`;
  };

  return `
    <div class="transfer-report">
      <!-- Header -->
      <div class="header">
        <div class="company-info">
          <h1>ElJay Hearing Centre</h1>
          <p>Professional Hearing Solutions</p>
        </div>
        <div class="document-info">
          <h2>INVENTORY TRANSFER REPORT</h2>
          <p><strong>Transfer #:</strong> ${transfer.trackingNumber}</p>
          <p><strong>Generated:</strong> ${formatDate(new Date().toISOString())} at ${formatTime(new Date().toISOString())}</p>
        </div>
      </div>

      <!-- Transfer Details -->
      <div class="transfer-details">
        <h3>Transfer Information</h3>
        <div class="details-grid">
          <div class="detail-item">
            <span class="label">Transfer Date:</span>
            <span class="value">${formatDate(transfer.transferredDate)}</span>
          </div>
          <div class="detail-item">
            <span class="label">From Location:</span>
            <span class="value">${transfer.fromLocation}</span>
          </div>
          <div class="detail-item">
            <span class="label">To Location:</span>
            <span class="value">${transfer.toLocation}</span>
          </div>
          <div class="detail-item">
            <span class="label">Status:</span>
            <span class="value">${getStatusBadgeHTML(transfer.status)}</span>
          </div>
          <div class="detail-item">
            <span class="label">Urgency:</span>
            <span class="value">${getUrgencyBadgeHTML(transfer.urgencyLevel)}</span>
          </div>
          <div class="detail-item">
            <span class="label">Transferred By:</span>
            <span class="value">${transfer.transferredBy}</span>
          </div>
          <div class="detail-item">
            <span class="label">Transfer Type:</span>
            <span class="value">${transfer.transferType}</span>
          </div>
          ${transfer.approvedBy ? `
          <div class="detail-item">
            <span class="label">Approved By:</span>
            <span class="value">${transfer.approvedBy}</span>
          </div>
          ` : ''}
          ${transfer.shippingCost ? `
          <div class="detail-item">
            <span class="label">Shipping Cost:</span>
            <span class="value">₹${transfer.shippingCost}</span>
          </div>
          ` : ''}
        </div>
      </div>

      <!-- Items Table -->
      <div class="items-section">
        <h3>Transferred Items</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Item Code</th>
              <th>Brand</th>
              <th>Quantity</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${transfer.transferItems.map(item => `
              <tr>
                <td>${item.inventoryItem.itemName}</td>
                <td>${item.inventoryItem.itemCode || '-'}</td>
                <td>${item.inventoryItem.brand || '-'}</td>
                <td class="quantity">${item.quantity}</td>
                <td>${item.itemRemarks || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Summary -->
      <div class="summary-section">
        <h3>Transfer Summary</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="label">Total Items:</span>
            <span class="value">${transfer.transferItems.length}</span>
          </div>
          <div class="summary-item">
            <span class="label">Total Quantity:</span>
            <span class="value">${transfer.transferItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
        </div>
      </div>

      ${transfer.additionalNotes ? `
      <!-- Notes -->
      <div class="notes-section">
        <h3>Transfer Notes</h3>
        <p>${transfer.additionalNotes}</p>
      </div>
      ` : ''}

      <!-- Footer -->
      <div class="footer">
        <div class="signatures">
          <div class="signature-block">
            <div class="signature-line"></div>
            <p>Transferred By</p>
            <p>Staff Name: _________________</p>
            <p>Date: ${formatDate(transfer.transferredDate)}</p>
          </div>
          <div class="signature-block">
            <div class="signature-line"></div>
            <p>Received By</p>
            <p>Staff Name: _________________</p>
            <p>Date: _________________</p>
          </div>
        </div>
        <div class="company-footer">
          <p>ElJay Hearing Centre - Professional Hearing Solutions</p>
          <p>This is a computer-generated document and does not require a signature.</p>
        </div>
      </div>
    </div>
  `;
};

/**
 * CSS styles for transfer report printing
 */
const getTransferReportPrintStyles = () => {
  return `
    @page {
      size: A4;
      margin: 15mm;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 11px;
      line-height: 1.4;
      color: #333;
      background: white;
    }

    .transfer-report {
      max-width: 100%;
      margin: 0 auto;
    }

    /* Header Styles */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e5e7eb;
    }

    .company-info h1 {
      font-size: 20px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 4px;
    }

    .company-info p {
      font-size: 12px;
      color: #6b7280;
    }

    .document-info {
      text-align: right;
    }

    .document-info h2 {
      font-size: 16px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 8px;
    }

    .document-info p {
      font-size: 10px;
      color: #6b7280;
      margin-bottom: 2px;
    }

    /* Section Styles */
    h3 {
      font-size: 14px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 12px;
      padding-bottom: 4px;
      border-bottom: 1px solid #e5e7eb;
    }

    .transfer-details,
    .items-section,
    .summary-section,
    .notes-section {
      margin-bottom: 20px;
    }

    /* Details Grid */
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 20px;
      margin-bottom: 15px;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
    }

    .detail-item .label {
      font-weight: 500;
      color: #6b7280;
      width: 120px;
      flex-shrink: 0;
    }

    .detail-item .value {
      font-weight: 500;
      color: #1f2937;
      text-align: right;
    }

    /* Table Styles */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }

    .items-table th {
      background-color: #f9fafb;
      padding: 8px 6px;
      text-align: left;
      font-weight: 600;
      font-size: 10px;
      color: #374151;
      border: 1px solid #e5e7eb;
    }

    .items-table td {
      padding: 6px;
      border: 1px solid #e5e7eb;
      font-size: 10px;
      color: #1f2937;
    }

    .items-table .quantity {
      text-align: center;
      font-weight: 500;
    }

    .items-table tbody tr:nth-child(even) {
      background-color: #f9fafb;
    }

    /* Summary Grid */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 10px;
      background-color: #f9fafb;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .summary-item .label {
      font-weight: 500;
      color: #6b7280;
    }

    .summary-item .value {
      font-weight: bold;
      color: #1f2937;
      font-size: 12px;
    }

    /* Notes Section */
    .notes-section p {
      background-color: #f9fafb;
      padding: 10px;
      border-radius: 4px;
      border-left: 3px solid #3b82f6;
      font-style: italic;
      color: #374151;
    }

    /* Footer Styles */
    .footer {
      margin-top: 30px;
      page-break-inside: avoid;
    }

    .signatures {
      display: flex;
      justify-content: space-around;
      margin-bottom: 20px;
    }

    .signature-block {
      text-align: center;
      min-width: 150px;
    }

    .signature-line {
      height: 1px;
      background-color: #6b7280;
      margin-bottom: 8px;
      width: 120px;
      margin-left: auto;
      margin-right: auto;
    }

    .signature-block p {
      font-size: 9px;
      color: #6b7280;
      margin-bottom: 2px;
    }

    .signature-block p:first-of-type {
      font-weight: 500;
      color: #1f2937;
    }

    .company-footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px solid #e5e7eb;
    }

    .company-footer p {
      font-size: 9px;
      color: #6b7280;
      margin-bottom: 2px;
    }

    .company-footer p:first-child {
      font-weight: 500;
      color: #1f2937;
    }

    /* Print-specific styles */
    @media print {
      .transfer-report {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }

      .items-table {
        page-break-inside: auto;
      }

      .items-table tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }
    }
  `;
};