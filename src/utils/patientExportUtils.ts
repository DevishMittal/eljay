import { Patient } from '@/types';
import { convertToCSV, downloadCSV, formatDateForExport } from './exportUtils';

/**
 * Patient export utility functions
 */

export interface PatientExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  format?: 'csv' | 'pdf';
}

/**
 * Export selected patients to CSV format
 */
export function exportPatientsToCSV(
  patients: Patient[],
  options: PatientExportOptions = {}
): void {
  if (!patients || patients.length === 0) {
    alert('No patients selected for export');
    return;
  }

  const filename = options.filename || `patients_export_${new Date().toISOString().split('T')[0]}.csv`;
  
  // Prepare data for CSV export
  const csvData = patients.map(patient => ({
    'Patient ID': patient.patient_id || '',
    'Full Name': patient.full_name || '',
    'Email': patient.email_address || '',
    'Mobile Number': patient.mobile_number || '',
    'Date of Birth': patient.dob ? formatDateForExport(patient.dob) : '',
    'Age': patient.age || (patient.dob ? calculateAge(patient.dob) : ''),
    'Gender': patient.gender || '',
    'Occupation': patient.occupation || '',
    'Customer Type': patient.type || '',
    'Hospital Name': patient.hospital_name || '',
    'OP/IP Number': patient.opipNumber || '',
    'Alternate Number': patient.alternative_number || '',
    'Country Code': patient.countrycode || '',
    'Status': patient.status || '',
    'Last Visit': patient.last_visited ? formatDateForExport(patient.last_visited) : 'Never',
    'Created Date': patient.created_at ? formatDateForExport(patient.created_at) : '',
    'Updated Date': patient.updated_at ? formatDateForExport(patient.updated_at) : ''
  }));

  const csvContent = convertToCSV(csvData);
  downloadCSV(csvContent, filename);
}

/**
 * Calculate age from date of birth
 */
function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Export patients to PDF format (using browser's print to PDF)
 */
export function exportPatientsToPDF(
  patients: Patient[],
  options: PatientExportOptions = {}
): void {
  if (!patients || patients.length === 0) {
    alert('No patients selected for export');
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }

  const patientHTML = generatePatientReportHTML(patients, options);
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${options.filename || `Patient Report ${new Date().toISOString().split('T')[0]}`}</title>
        <style>
          ${getPatientReportPrintStyles()}
        </style>
      </head>
      <body>
        ${patientHTML}
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
}

/**
 * Generate HTML for patient report printing
 */
function generatePatientReportHTML(patients: Patient[], options: PatientExportOptions = {}): string {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'status-default';
    return status === 'New' ? 'status-new' : 'status-existing';
  };

  const getTypeColor = (type: string) => {
    if (!type) return 'type-default';
    return type === 'B2B' ? 'type-b2b' : 'type-b2c';
  };

  return `
    <div class="patient-report-container">
      <!-- Header -->
      <div class="patient-header">
        <div class="company-info">
          <div class="logo-and-address">
            <img src="/pdf-view-logo.png" alt="Eljay Hearing Care" class="company-logo" />
            <div class="company-address-section">
              <p class="company-title">Hearing Centre Adyar</p>
              <p class="company-address">No 75, Dhanalkshmi Avenue, Adyar, Chennai - 600020</p>
            </div>
          </div>
        </div>
        <div class="contact-info">
          <p>GST: 33BXCFA4838GL2U | Phone: +91 6385 054 111</p>
        </div>
      </div>

      <!-- Report Title -->
      <div class="report-title">
        <h2>PATIENT REPORT</h2>
        <p class="report-subtitle">Generated on ${formatDate(new Date().toISOString())} • ${patients.length} patients</p>
      </div>

      <!-- Patient Summary -->
      <div class="patient-summary">
        <h3>Summary</h3>
        <div class="summary-stats">
          <div class="stat-item">
            <span class="stat-label">Total Patients:</span>
            <span class="stat-value">${patients.length}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">B2C Patients:</span>
            <span class="stat-value">${patients.filter(p => p.type === 'B2C').length}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">B2B Patients:</span>
            <span class="stat-value">${patients.filter(p => p.type === 'B2B').length}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">New Patients:</span>
            <span class="stat-value">${patients.filter(p => p.status === 'New').length}</span>
          </div>
        </div>
      </div>

      <!-- Patient Details Table -->
      <div class="patient-details">
        <h3>Patient Details</h3>
        <div class="table-container">
          <table class="patient-table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Type</th>
                <th>Status</th>
                <th>Last Visit</th>
              </tr>
            </thead>
            <tbody>
              ${patients.map(patient => `
                <tr>
                  <td>${patient.patient_id || 'N/A'}</td>
                  <td>${patient.full_name || 'N/A'}</td>
                  <td>${patient.email_address || 'N/A'}</td>
                  <td>${patient.mobile_number || 'N/A'}</td>
                  <td>${patient.age || (patient.dob ? calculateAge(patient.dob) : 'N/A')}</td>
                  <td>${patient.gender || 'N/A'}</td>
                  <td><span class="type-badge ${getTypeColor(patient.type || '')}">${patient.type || 'B2C'}</span></td>
                  <td><span class="status-badge ${getStatusColor(patient.status || '')}">${patient.status || 'New'}</span></td>
                  <td>${patient.last_visited ? formatDate(patient.last_visited) : 'Never'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Additional Information -->
      <div class="additional-info">
        <div class="terms-section">
          <h4>Report Information</h4>
          <ul>
            <li>This report contains patient information as of ${formatDate(new Date().toISOString())}</li>
            <li>Patient data is confidential and should be handled according to privacy policies</li>
            <li>For any queries regarding this report, please contact the administration</li>
          </ul>
        </div>
      </div>

      <!-- Footer -->
      <div class="patient-footer">
        <p class="footer-text">Thank you for using Eljay Hearing Care patient management system.</p>
        <p class="footer-text">This is a computer-generated report and does not require a signature.</p>
      </div>
    </div>
  `;
}

/**
 * Get CSS styles for patient report printing
 */
function getPatientReportPrintStyles(): string {
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

    .patient-report-container {
      max-width: 1000px;
      margin: 0 auto;
    }

    .patient-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #333;
    }

    .logo-and-address {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .company-logo {
      width: 120px;
      height: auto;
      object-fit: contain;
      margin-bottom: 10px;
    }

    .company-title {
      font-size: 18px;
      font-weight: bold;
      margin: 0 0 10px 0;
      color: #1f2937;
    }

    .company-address {
      margin: 5px 0;
      color: #6b7280;
      font-size: 14px;
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

    .report-subtitle {
      font-size: 16px;
      color: #6b7280;
      margin: 0;
    }

    .patient-summary {
      margin-bottom: 30px;
    }

    .patient-summary h3 {
      font-size: 18px;
      font-weight: bold;
      margin: 0 0 15px 0;
      color: #1f2937;
    }

    .summary-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      background-color: #f9fafb;
      padding: 20px;
      border-radius: 8px;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .stat-item:last-child {
      border-bottom: none;
    }

    .stat-label {
      font-weight: 500;
      color: #374151;
    }

    .stat-value {
      font-weight: bold;
      color: #1f2937;
      font-size: 16px;
    }

    .patient-details {
      margin-bottom: 30px;
    }

    .patient-details h3 {
      font-size: 18px;
      font-weight: bold;
      margin: 0 0 15px 0;
      color: #1f2937;
    }

    .table-container {
      overflow-x: auto;
    }

    .patient-table {
      width: 100%;
      border-collapse: collapse;
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .patient-table th {
      background-color: #f3f4f6;
      padding: 12px 8px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
      font-size: 12px;
    }

    .patient-table td {
      padding: 10px 8px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 12px;
      color: #374151;
    }

    .patient-table tr:hover {
      background-color: #f9fafb;
    }

    .type-badge,
    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .type-b2b {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .type-b2c {
      background-color: #f3f4f6;
      color: #374151;
    }

    .type-default {
      background-color: #f3f4f6;
      color: #374151;
    }

    .status-new {
      background-color: #fef3c7;
      color: #92400e;
    }

    .status-existing {
      background-color: #dcfce7;
      color: #166534;
    }

    .status-default {
      background-color: #f3f4f6;
      color: #374151;
    }

    .additional-info {
      margin-bottom: 30px;
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

    .patient-footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #d1d5db;
      color: #6b7280;
    }

    .footer-text {
      margin: 5px 0;
      font-size: 14px;
    }
  `;
}
