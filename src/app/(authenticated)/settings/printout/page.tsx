/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils';
import MainLayout from '@/components/layout/main-layout';
import { PrintSettings, PrintPageSettings, PrintHeaderSettings, PrintFooterSettings } from '@/types';

const PrintoutPage = () => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('printout');
  
  // Print settings state
  const [selectedDocumentType, setSelectedDocumentType] = useState<'b2cInvoice' | 'b2bInvoice' | 'payments'>('b2cInvoice');
  const [selectedSubTab, setSelectedSubTab] = useState<'pageSettings' | 'header' | 'footer'>('pageSettings');
  
  // Default print settings
  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    b2cInvoice: {
      pageSettings: {
        paperSize: 'A4',
        orientation: 'Portrait',
        printerType: 'Color',
        margins: { top: 2.00, left: 0.25, bottom: 0.50, right: 0.25 }
      },
      headerSettings: {
        includeHeader: true,
        headerText: 'Hearing Centre Adyar',
        leftText: 'No 75, Dhanalkshmi Avenue, Adyar, Chennai - 600020',
        rightText: 'GST: 33BXCFA4838GL2U | Phone: +91 6385 054 111',
        logo: { uploaded: true, type: 'Square', alignment: 'Left' }
      },
      footerSettings: {
        topMargin: 0.00,
        fullWidthContent: ['This is a digitally generated invoice and doesn\'t need seal and signature.'],
        leftSignature: {
          name: 'Dr. Sarah Johnson',
          title: 'Senior Audiologist',
          organization: 'Eloy Hearing Care Management'
        },
        rightSignature: {
          name: 'Authorized Signatory',
          title: 'Eloy Hearing Care Management',
          organization: 'Eloy Hearing Care Management',
          date: '8 Sep, 2025'
        }
      }
    },
    b2bInvoice: {
      pageSettings: {
        paperSize: 'A4',
        orientation: 'Portrait',
        printerType: 'Color',
        margins: { top: 2.00, left: 0.25, bottom: 0.50, right: 0.25 }
      },
      headerSettings: {
        includeHeader: true,
        headerText: 'Hearing Centre Adyar',
        leftText: 'No 75, Dhanalkshmi Avenue, Adyar, Chennai - 600020',
        rightText: 'GST: 33BXCFA4838GL2U | Phone: +91 6385 054 111',
        logo: { uploaded: true, type: 'Square', alignment: 'Left' }
      },
      footerSettings: {
        topMargin: 0.00,
        fullWidthContent: ['This is a digitally generated invoice and doesn\'t need seal and signature.'],
        leftSignature: {
          name: 'Dr. Sarah Johnson',
          title: 'Senior Audiologist',
          organization: 'Eloy Hearing Care Management'
        },
        rightSignature: {
          name: 'Authorized Signatory',
          title: 'Eloy Hearing Care Management',
          organization: 'Eloy Hearing Care Management',
          date: '8 Sep, 2025'
        }
      }
    },
    payments: {
      pageSettings: {
        paperSize: 'A4',
        orientation: 'Portrait',
        printerType: 'Color',
        margins: { top: 2.00, left: 0.25, bottom: 0.50, right: 0.25 }
      },
      headerSettings: {
        includeHeader: true,
        headerText: 'Hearing Centre Adyar',
        leftText: 'No 75, Dhanalkshmi Avenue, Adyar, Chennai - 600020',
        rightText: 'GST: 33BXCFA4838GL2U | Phone: +91 6385 054 111',
        logo: { uploaded: true, type: 'Square', alignment: 'Left' }
      },
      footerSettings: {
        topMargin: 0.00,
        fullWidthContent: ['This is a digitally generated invoice and doesn\'t need seal and signature.'],
        leftSignature: {
          name: 'Dr. Sarah Johnson',
          title: 'Senior Audiologist',
          organization: 'Eloy Hearing Care Management'
        },
        rightSignature: {
          name: 'Authorized Signatory',
          title: 'Eloy Hearing Care Management',
          organization: 'Eloy Hearing Care Management',
          date: '8 Sep, 2025'
        }
      }
    }
  });

  // Load saved settings on component mount
  useEffect(() => {
    const loadSavedSettings = () => {
      try {
        // Try to load settings for all document types first
        const savedAllSettings = localStorage.getItem('printSettings_all');
        if (savedAllSettings) {
          const parsedSettings = JSON.parse(savedAllSettings);
          setPrintSettings(parsedSettings);
        } else {
          // If no global settings, try to load individual document type settings
          ['b2cInvoice', 'b2bInvoice', 'payments'].forEach(docType => {
            const savedSettings = localStorage.getItem(`printSettings_${docType}`);
            if (savedSettings) {
              const parsedSettings = JSON.parse(savedSettings);
              setPrintSettings(prev => ({
                ...prev,
                [docType]: parsedSettings
              }));
            }
          });
        }
      } catch (error) {
        console.error('Error loading saved print settings:', error);
      }
    };

    loadSavedSettings();
  }, []);

  const tabs = [
    {
      id: 'profile',
      title: 'Profile',
      href: '/settings',
      icon: (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.0348 1.86523H4.03483C3.3905 1.86523 2.86816 2.38757 2.86816 3.0319V12.3652C2.86816 13.0096 3.3905 13.5319 4.03483 13.5319H11.0348C11.6792 13.5319 12.2015 13.0096 12.2015 12.3652V3.0319C12.2015 2.38757 11.6792 1.86523 11.0348 1.86523Z" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5.78491 13.5326V11.1992H9.28491V13.5326" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5.20166 4.19922H5.20749" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.86816 4.19922H9.874" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7.53491 4.19922H7.54075" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7.53491 6.5332H7.54075" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7.53491 8.86523H7.54075" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.86816 6.5332H9.874" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.86816 8.86523H9.874" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5.20166 6.5332H5.20749" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5.20166 8.86523H5.20749" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'diagnostics',
      title: 'Diagnostics',
      href: '/settings/diagnostics',
      icon: (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.88542 1.86523H3.63542C3.326 1.86523 3.02925 1.98815 2.81046 2.20694C2.59167 2.42574 2.46875 2.72248 2.46875 3.0319V12.3652C2.46875 12.6747 2.59167 12.9714 2.81046 13.1902C3.02925 13.409 3.326 13.5319 3.63542 13.5319H10.6354C10.9448 13.5319 11.2416 13.409 11.4604 13.1902C11.6792 12.9714 11.8021 12.6747 11.8021 12.3652V4.7819L8.88542 1.86523Z" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.30176 1.86523V4.19857C8.30176 4.50799 8.42467 4.80473 8.64347 5.02353C8.86226 5.24232 9.15901 5.36523 9.46842 5.36523H11.8018" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5.96842 5.94922H4.80176" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.46842 8.2832H4.80176" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.46842 10.6152H4.80176" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'staff',
      title: 'Staff',
      href: '/settings/staff',
      icon: (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.1882 12.9492V11.7826C10.1882 11.1637 9.94232 10.5702 9.50473 10.1326C9.06715 9.69505 8.47366 9.44922 7.85482 9.44922H4.35482C3.73598 9.44922 3.14249 9.69505 2.7049 10.1326C2.26732 10.5702 2.02148 11.1637 2.02148 11.7826V12.9492" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10.1885 2.52344C10.6888 2.65315 11.132 2.94534 11.4483 3.35414C11.7646 3.76294 11.9363 4.26521 11.9363 4.7821C11.9363 5.299 11.7646 5.80127 11.4483 6.21007C11.132 6.61887 10.6888 6.91105 10.1885 7.04077" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.6885 12.9496V11.7829C13.6881 11.2659 13.516 10.7637 13.1993 10.3551C12.8825 9.94647 12.4391 9.65464 11.9385 9.52539" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6.10482 7.11589C7.39348 7.11589 8.43815 6.07122 8.43815 4.78255C8.43815 3.49389 7.39348 2.44922 6.10482 2.44922C4.81615 2.44922 3.77148 3.49389 3.77148 4.78255C3.77148 6.07122 4.81615 7.11589 6.10482 7.11589Z" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'doctors',
      title: 'Doctors',
      href: '/settings/doctors',
      icon: (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.37158 1.86523V3.0319" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3.87158 1.86523V3.0319" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3.87158 2.44922H3.28825C2.97883 2.44922 2.68208 2.57214 2.46329 2.79093C2.2445 3.00972 2.12158 3.30647 2.12158 3.61589V5.94922C2.12158 6.87748 2.49033 7.76771 3.14671 8.42409C3.80309 9.08047 4.69332 9.44922 5.62158 9.44922C6.54984 9.44922 7.44008 9.08047 8.09646 8.42409C8.75283 7.76771 9.12158 6.87748 9.12158 5.94922V3.61589C9.12158 3.30647 8.99867 3.00972 8.77987 2.79093C8.56108 2.57214 8.26433 2.44922 7.95492 2.44922H7.37158" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5.62158 9.44922C5.62158 10.3775 5.99033 11.2677 6.64671 11.9241C7.30309 12.5805 8.19332 12.9492 9.12158 12.9492C10.0498 12.9492 10.9401 12.5805 11.5965 11.9241C12.2528 11.2677 12.6216 10.3775 12.6216 9.44922V7.69922" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12.6217 7.69857C13.2661 7.69857 13.7884 7.17623 13.7884 6.5319C13.7884 5.88757 13.2661 5.36523 12.6217 5.36523C11.9774 5.36523 11.4551 5.88757 11.4551 6.5319C11.4551 7.17623 11.9774 7.69857 12.6217 7.69857Z" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'hospitals',
      title: 'Hospitals',
      href: '/settings/hospitals',
      icon: (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.0348 1.86523H4.03483C3.3905 1.86523 2.86816 2.38757 2.86816 3.0319V12.3652C2.86816 13.0096 3.3905 13.5319 4.03483 13.5319H11.0348C11.6792 13.5319 12.2015 13.0096 12.2015 12.3652V3.0319C12.2015 2.38757 11.6792 1.86523 11.0348 1.86523Z" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7.53491 5.36523V9.86523" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.78491 7.61523H5.28491" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'printout',
      title: 'Printout',
      href: '/settings/printout',
      icon: (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.69466 11.1992H2.52799C2.21858 11.1992 1.92183 11.0763 1.70304 10.8575C1.48424 10.6387 1.36133 10.342 1.36133 10.0326V7.11589C1.36133 6.80647 1.48424 6.50972 1.70304 6.29093C1.92183 6.07214 2.21858 5.94922 2.52799 5.94922H11.8613C12.1707 5.94922 12.4675 6.07214 12.6863 6.29093C12.9051 6.50972 13.028 6.80647 13.028 7.11589V10.0326C13.028 10.342 12.9051 10.6387 12.6863 10.8575C12.4675 11.0763 12.1707 11.1992 11.8613 11.1992H10.6947" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3.69482 5.94857V2.44857C3.69482 2.29386 3.75628 2.14548 3.86568 2.03609C3.97507 1.92669 4.12345 1.86523 4.27816 1.86523H10.1115C10.2662 1.86523 10.4146 1.92669 10.524 2.03609C10.6334 2.14548 10.6948 2.29386 10.6948 2.44857V5.94857" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10.1115 8.86523H4.27816C3.95599 8.86523 3.69482 9.1264 3.69482 9.44857V12.9486C3.69482 13.2707 3.95599 13.5319 4.27816 13.5319H10.1115C10.4337 13.5319 10.6948 13.2707 10.6948 12.9486V9.44857C10.6948 9.1264 10.4337 8.86523 10.1115 8.86523Z" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
            Settings
          </h1>
          <p className="text-[#4A5565] text-sm" style={{ fontFamily: 'Segoe UI' }}>
            Manage your organization settings and configurations
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#ECECF0] rounded-full p-1 mb-6">
          <div className="flex">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  'flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-full flex-1 justify-center',
                  activeTab === tab.id
                    ? 'text-[#0A0A0A] bg-white shadow-sm'
                    : 'text-[#0A0A0A] hover:bg-white/50'
                )}
                style={{ fontFamily: 'Segoe UI' }}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Printout Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Print Settings Panel */}
          <div className="bg-white rounded-lg border border-border p-6">
            <h2 className="text-lg font-semibold text-[#101828] mb-6" style={{ fontFamily: 'Segoe UI' }}>
              Print Settings
            </h2>
            
            {/* Document Type Tabs */}
            <div className="flex space-x-1 mb-6">
              {[
                { id: 'b2cInvoice', label: 'B2C Invoice' },
                { id: 'b2bInvoice', label: 'B2B Invoice' },
                { id: 'payments', label: 'Payments' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedDocumentType(tab.id as any)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                    selectedDocumentType === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                  style={{ fontFamily: 'Segoe UI' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sub Tabs */}
            <div className="flex space-x-1 mb-6">
              {[
                { id: 'pageSettings', label: 'Page Settings' },
                { id: 'header', label: 'Header' },
                { id: 'footer', label: 'Footer' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedSubTab(tab.id as any)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                    selectedSubTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                  style={{ fontFamily: 'Segoe UI' }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Settings Content */}
            <div className="space-y-6">
              {selectedSubTab === 'pageSettings' && (
                <PageSettingsComponent 
                  settings={printSettings[selectedDocumentType].pageSettings}
                  onChange={(newSettings) => {
                    setPrintSettings(prev => ({
                      ...prev,
                      [selectedDocumentType]: {
                        ...prev[selectedDocumentType],
                        pageSettings: newSettings
                      }
                    }));
                  }}
                />
              )}
              
              {selectedSubTab === 'header' && (
                <HeaderSettingsComponent 
                  settings={printSettings[selectedDocumentType].headerSettings}
                  onChange={(newSettings) => {
                    setPrintSettings(prev => ({
                      ...prev,
                      [selectedDocumentType]: {
                        ...prev[selectedDocumentType],
                        headerSettings: newSettings
                      }
                    }));
                  }}
                />
              )}
              
              {selectedSubTab === 'footer' && (
                <FooterSettingsComponent 
                  settings={printSettings[selectedDocumentType].footerSettings}
                  onChange={(newSettings) => {
                    setPrintSettings(prev => ({
                      ...prev,
                      [selectedDocumentType]: {
                        ...prev[selectedDocumentType],
                        footerSettings: newSettings
                      }
                    }));
                  }}
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-8">
              <button 
                onClick={() => {
                  // Show full size preview in new window
                  const previewWindow = window.open('', '_blank', 'width=800,height=600');
                  if (previewWindow) {
                    previewWindow.document.write(`
                      <html>
                        <head>
                          <title>Print Preview</title>
                          <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            .preview-container { max-width: 800px; margin: 0 auto; }
                          </style>
                        </head>
                        <body>
                          <div class="preview-container">
                            ${document.querySelector('.invoice-preview')?.innerHTML || 'Preview not available'}
                          </div>
                        </body>
                      </html>
                    `);
                  }
                }}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Show Full Size Preview
              </button>
              <button 
                onClick={() => {
                  // Save settings for current document type
                  localStorage.setItem(`printSettings_${selectedDocumentType}`, JSON.stringify(printSettings[selectedDocumentType]));
                  alert(`Settings saved for ${selectedDocumentType === 'b2cInvoice' ? 'B2C Invoice' : selectedDocumentType === 'b2bInvoice' ? 'B2B Invoice' : 'Payments'}`);
                }}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Save
              </button>
              <button 
                onClick={() => {
                  // Save settings for all document types
                  localStorage.setItem('printSettings_all', JSON.stringify(printSettings));
                  alert('Settings saved for all document types');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save For All
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="bg-white rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-[#101828] mb-4" style={{ fontFamily: 'Segoe UI' }}>
              Preview
            </h3>
            <InvoicePreview 
              documentType={selectedDocumentType}
              settings={printSettings[selectedDocumentType]}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Page Settings Component
const PageSettingsComponent = ({ settings, onChange }: { 
  settings: PrintPageSettings; 
  onChange: (settings: PrintPageSettings) => void 
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-md font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
        PAGE SETUP
      </h3>
      
      {/* Paper Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Paper Size</label>
        <select 
          value={settings.paperSize}
          onChange={(e) => onChange({ ...settings, paperSize: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Select paper size for printing"
          aria-label="Paper size"
        >
          <option value="A4">A4</option>
          <option value="A3">A3</option>
          <option value="Letter">Letter</option>
          <option value="Legal">Legal</option>
        </select>
      </div>

      {/* Orientation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Orientation</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="orientation"
              value="Portrait"
              checked={settings.orientation === 'Portrait'}
              onChange={(e) => onChange({ ...settings, orientation: e.target.value as any })}
              className="mr-2"
            />
            Portrait
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="orientation"
              value="Landscape"
              checked={settings.orientation === 'Landscape'}
              onChange={(e) => onChange({ ...settings, orientation: e.target.value as any })}
              className="mr-2"
            />
            Landscape
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-1">* Applicable only on Print Size Preview</p>
      </div>

      {/* Printer Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Printer Type</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="printerType"
              value="Color"
              checked={settings.printerType === 'Color'}
              onChange={(e) => onChange({ ...settings, printerType: e.target.value as any })}
              className="mr-2"
            />
            Colour - Paper / Laser
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="printerType"
              value="Black"
              checked={settings.printerType === 'Black'}
              onChange={(e) => onChange({ ...settings, printerType: e.target.value as any })}
              className="mr-2"
            />
            Black - Dot Matrix / Thermal printers
          </label>
        </div>
      </div>

      {/* Margins */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Margins</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Top Margin</label>
            <select 
              value={settings.margins.top}
              onChange={(e) => onChange({ 
                ...settings, 
                margins: { ...settings.margins, top: parseFloat(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select top margin"
              aria-label="Top margin"
            >
              <option value={0.5}>0.50 inches</option>
              <option value={1.0}>1.00 inches</option>
              <option value={1.5}>1.50 inches</option>
              <option value={2.0}>2.00 inches</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Left Margin</label>
            <select 
              value={settings.margins.left}
              onChange={(e) => onChange({ 
                ...settings, 
                margins: { ...settings.margins, left: parseFloat(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select left margin"
              aria-label="Left margin"
            >
              <option value={0.25}>0.25 inches</option>
              <option value={0.5}>0.50 inches</option>
              <option value={0.75}>0.75 inches</option>
              <option value={1.0}>1.00 inches</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Bottom Margin</label>
            <select 
              value={settings.margins.bottom}
              onChange={(e) => onChange({ 
                ...settings, 
                margins: { ...settings.margins, bottom: parseFloat(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select bottom margin"
              aria-label="Bottom margin"
            >
              <option value={0.5}>0.50 inches</option>
              <option value={1.0}>1.00 inches</option>
              <option value={1.5}>1.50 inches</option>
              <option value={2.0}>2.00 inches</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Right Margin</label>
            <select 
              value={settings.margins.right}
              onChange={(e) => onChange({ 
                ...settings, 
                margins: { ...settings.margins, right: parseFloat(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select right margin"
              aria-label="Right margin"
            >
              <option value={0.25}>0.25 inches</option>
              <option value={0.5}>0.50 inches</option>
              <option value={0.75}>0.75 inches</option>
              <option value={1.0}>1.00 inches</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// Header Settings Component
const HeaderSettingsComponent = ({ settings, onChange }: { 
  settings: PrintHeaderSettings; 
  onChange: (settings: PrintHeaderSettings) => void 
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-md font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
        CUSTOMIZE HEADER
      </h3>
      
      {/* Include Header */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Include Header</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="includeHeader"
              value="yes"
              checked={settings.includeHeader}
              onChange={(e) => onChange({ ...settings, includeHeader: true })}
              className="mr-2"
            />
            Yes
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="includeHeader"
              value="no"
              checked={!settings.includeHeader}
              onChange={(e) => onChange({ ...settings, includeHeader: false })}
              className="mr-2"
            />
            No
          </label>
        </div>
      </div>

      {/* Header Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Header Text</label>
        <input
          type="text"
          value={settings.headerText}
          onChange={(e) => onChange({ ...settings, headerText: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter header text"
          title="Enter the header text for the document"
        />
        <p className="text-xs text-gray-500 mt-1">Preview: {settings.headerText}</p>
      </div>

      {/* Left Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Left Text</label>
        <input
          type="text"
          value={settings.leftText}
          onChange={(e) => onChange({ ...settings, leftText: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter left side text (e.g., address)"
          title="Enter text for the left side of the header"
        />
      </div>

      {/* Right Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Right Text</label>
        <input
          type="text"
          value={settings.rightText}
          onChange={(e) => onChange({ ...settings, rightText: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter right side text (e.g., GST, phone)"
          title="Enter text for the right side of the header"
        />
      </div>

      {/* Logo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <div className="text-sm text-gray-500">Clinic Logo</div>
          {settings.logo.uploaded && (
            <div className="mt-2">
              <span className="text-xs text-green-600">Clinic Logo Uploaded</span>
            </div>
          )}
        </div>
      </div>

      {/* Logo Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="logoType"
              value="Square"
              checked={settings.logo.type === 'Square'}
              onChange={(e) => onChange({ 
                ...settings, 
                logo: { ...settings.logo, type: e.target.value as any }
              })}
              className="mr-2"
            />
            Square
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="logoType"
              value="Narrow"
              checked={settings.logo.type === 'Narrow'}
              onChange={(e) => onChange({ 
                ...settings, 
                logo: { ...settings.logo, type: e.target.value as any }
              })}
              className="mr-2"
            />
            Narrow
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="logoType"
              value="Wide"
              checked={settings.logo.type === 'Wide'}
              onChange={(e) => onChange({ 
                ...settings, 
                logo: { ...settings.logo, type: e.target.value as any }
              })}
              className="mr-2"
            />
            Wide
          </label>
        </div>
      </div>

      {/* Logo Alignment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="logoAlignment"
              value="Left"
              checked={settings.logo.alignment === 'Left'}
              onChange={(e) => onChange({ 
                ...settings, 
                logo: { ...settings.logo, alignment: e.target.value as any }
              })}
              className="mr-2"
            />
            Left
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="logoAlignment"
              value="Centre"
              checked={settings.logo.alignment === 'Centre'}
              onChange={(e) => onChange({ 
                ...settings, 
                logo: { ...settings.logo, alignment: e.target.value as any }
              })}
              className="mr-2"
            />
            Centre
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="logoAlignment"
              value="Right"
              checked={settings.logo.alignment === 'Right'}
              onChange={(e) => onChange({ 
                ...settings, 
                logo: { ...settings.logo, alignment: e.target.value as any }
              })}
              className="mr-2"
            />
            Right
          </label>
        </div>
      </div>
    </div>
  );
};

// Footer Settings Component
const FooterSettingsComponent = ({ settings, onChange }: { 
  settings: PrintFooterSettings; 
  onChange: (settings: PrintFooterSettings) => void 
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-md font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
        CUSTOMIZE FOOTER
      </h3>
      
      {/* Top Margin */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Top Margin:</label>
        <input
          type="number"
          step="0.01"
          value={settings.topMargin}
          onChange={(e) => onChange({ ...settings, topMargin: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0.00"
          title="Enter top margin for footer in inches"
        />
      </div>

      {/* Full Width Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Full Width Content</label>
        <div className="space-y-2">
          {settings.fullWidthContent.map((content, index) => (
            <textarea
              key={index}
              value={content}
              onChange={(e) => {
                const newContent = [...settings.fullWidthContent];
                newContent[index] = e.target.value;
                onChange({ ...settings, fullWidthContent: newContent });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Enter footer content"
              title="Enter content for the footer section"
            />
          ))}
        </div>
      </div>

      {/* Left Signature */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Left Signature*</label>
        <div className="space-y-2">
          <input
            type="text"
            value={settings.leftSignature.name}
            onChange={(e) => onChange({ 
              ...settings, 
              leftSignature: { ...settings.leftSignature, name: e.target.value }
            })}
            placeholder="Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={settings.leftSignature.title}
            onChange={(e) => onChange({ 
              ...settings, 
              leftSignature: { ...settings.leftSignature, title: e.target.value }
            })}
            placeholder="Title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={settings.leftSignature.organization}
            onChange={(e) => onChange({ 
              ...settings, 
              leftSignature: { ...settings.leftSignature, organization: e.target.value }
            })}
            placeholder="Organization"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Right Signature */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Right Signature*</label>
        <div className="space-y-2">
          <input
            type="text"
            value={settings.rightSignature.name}
            onChange={(e) => onChange({ 
              ...settings, 
              rightSignature: { ...settings.rightSignature, name: e.target.value }
            })}
            placeholder="Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={settings.rightSignature.title}
            onChange={(e) => onChange({ 
              ...settings, 
              rightSignature: { ...settings.rightSignature, title: e.target.value }
            })}
            placeholder="Title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={settings.rightSignature.organization}
            onChange={(e) => onChange({ 
              ...settings, 
              rightSignature: { ...settings.rightSignature, organization: e.target.value }
            })}
            placeholder="Organization"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={settings.rightSignature.date}
            onChange={(e) => onChange({ 
              ...settings, 
              rightSignature: { ...settings.rightSignature, date: e.target.value }
            })}
            placeholder="Date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">* Signature fields are not added to Emails.</p>
      </div>
    </div>
  );
};

// Invoice Preview Component
const InvoicePreview = ({ documentType, settings }: { 
  documentType: string; 
  settings: any 
}) => {
  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 invoice-preview">
      <div className="bg-white p-6 rounded shadow-sm">
        {/* Header */}
        {settings.headerSettings.includeHeader && (
          <div className="border-b-2 border-gray-300 pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <img src="/logo.png" alt="Logo" className="w-12 h-12" />
                  <div>
                    <h2 className="text-lg font-bold text-orange-600">ELJAY PROFESSIONALS IN HEARING CARE SINCE 1976</h2>
                    <p className="text-sm text-gray-600">{settings.headerSettings.leftText}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold mb-2">
                  Fully Paid
                </div>
                <div className="text-sm text-gray-600">
                  <p>Phone: +91 44 1234 5678</p>
                  <p>Email: info@eljayhearing.com</p>
                  <p>Website: www.eljayhearing.com</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Details */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Bill To</h3>
            <p className="font-medium">Robert Paterson</p>
            <p className="text-sm text-gray-600">Individual Patient</p>
            <p className="text-sm text-gray-600">Patient ID: PAT001</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Invoice Details</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Invoice Number:</span>
                <span className="font-medium">EHC-2025-014</span>
              </div>
              <div className="flex justify-between">
                <span>Invoice Date:</span>
                <span>22 Jun 2025</span>
              </div>
              <div className="flex justify-between">
                <span>Due Date:</span>
                <span>24 Jul 2025</span>
              </div>
              <div className="flex justify-between">
                <span>Created By:</span>
                <span>Dr. Michael Chen</span>
              </div>
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Service/Item</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-3 py-2 text-left">#</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Service/Item</th>
                <th className="border border-gray-300 px-3 py-2 text-center">Qty</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Unit Cost</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Discount</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-3 py-2">1</td>
                <td className="border border-gray-300 px-3 py-2">
                  <div>
                    <p className="font-medium">Starkey Livio AI 2400 Hearing Aid</p>
                    <p className="text-sm text-gray-600">AI-powered hearing aid with health monitoring</p>
                  </div>
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center">1</td>
                <td className="border border-gray-300 px-3 py-2 text-right">₹69,000</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-red-600">-₹4,000</td>
                <td className="border border-gray-300 px-3 py-2 text-right font-medium">₹65,000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2">2</td>
                <td className="border border-gray-300 px-3 py-2">
                  <div>
                    <p className="font-medium">Smart Charger</p>
                    <p className="text-sm text-gray-600">Wireless charging case with smartphone app</p>
                  </div>
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center">1</td>
                <td className="border border-gray-300 px-3 py-2 text-right">₹7,000</td>
                <td className="border border-gray-300 px-3 py-2 text-right text-red-600">-₹500</td>
                <td className="border border-gray-300 px-3 py-2 text-right font-medium">₹6,500</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Invoice Summary */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Additional Information</h3>
            <p className="text-sm text-gray-600">Warranty: 3 years warranty + health tracking</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Invoice Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹76,000</span>
              </div>
              <div className="flex justify-between">
                <span>Total Discount:</span>
                <span className="text-red-600">-₹4,500</span>
              </div>
              <div className="flex justify-between">
                <span>Taxable Amount:</span>
                <span>₹71,500</span>
              </div>
              <div className="flex justify-between">
                <span>SGST (9%):</span>
                <span>₹585</span>
              </div>
              <div className="flex justify-between">
                <span>CGST (9%):</span>
                <span>₹585</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {settings.footerSettings.fullWidthContent.length > 0 && (
          <div className="border-t border-gray-300 pt-4 mt-6">
            <div className="text-center text-sm text-gray-600 mb-4">
              {settings.footerSettings.fullWidthContent.map((content, index) => (
                <p key={index} className="mb-1">{content}</p>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-8 mt-6">
              <div className="text-center">
                <div className="border-t border-gray-400 w-24 mx-auto mb-2"></div>
                <p className="font-medium text-sm">{settings.footerSettings.leftSignature.name}</p>
                <p className="text-xs text-gray-600">{settings.footerSettings.leftSignature.title}</p>
                <p className="text-xs text-gray-600">{settings.footerSettings.leftSignature.organization}</p>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-400 w-24 mx-auto mb-2"></div>
                <p className="font-medium text-sm">{settings.footerSettings.rightSignature.name}</p>
                <p className="text-xs text-gray-600">{settings.footerSettings.rightSignature.title}</p>
                <p className="text-xs text-gray-600">{settings.footerSettings.rightSignature.organization}</p>
                <p className="text-xs text-gray-600">Date: {settings.footerSettings.rightSignature.date}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintoutPage;
