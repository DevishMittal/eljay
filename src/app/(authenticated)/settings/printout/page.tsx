/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/utils';
import MainLayout from '@/components/layout/main-layout';
import { PrintSettings, PrintPageSettings, PrintHeaderSettings, PrintFooterSettings } from '@/types';

const PrintoutPage = () => {
  const [activeTab, setActiveTab] = useState('printout');
  
  // Print settings state
  const [selectedDocumentType, setSelectedDocumentType] = useState<'b2cInvoice' | 'b2bInvoice' | 'payments' | 'expenses' | 'transfers'>('b2cInvoice');
  const [selectedSubTab, setSelectedSubTab] = useState<'pageSettings' | 'header' | 'footer'>('pageSettings');
  
  // Default print settings
  const [printSettings, setPrintSettings] = useState<PrintSettings>(() => ({
    b2cInvoice: {
      pageSettings: {
        paperSize: 'A4',
        orientation: 'Portrait',
        printerType: 'Color',
        margins: { top: 0.00, left: 0.00, bottom: 0.00, right: 0.00 }
      },
      headerSettings: {
        includeHeader: true,
        leftText: 'No 75, Dhanalkshmi Avenue, Adyar, Chennai - 600020',
        rightText: 'GST: 33BXCFA4838GL2U | Phone: +91 6385 054 111',
        logo: { uploaded: true, type: 'Square', alignment: 'Left' }
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
        signatureNote: 'This is a computer-generated invoice and does not require a signature.'
      }
    },
    b2bInvoice: {
      pageSettings: {
        paperSize: 'A4',
        orientation: 'Portrait',
        printerType: 'Color',
        margins: { top: 0.00, left: 0.00, bottom: 0.00, right: 0.00 }
      },
      headerSettings: {
        includeHeader: true,
        leftText: 'No 75, Dhanalkshmi Avenue, Adyar, Chennai - 600020',
        rightText: 'GST: 33BXCFA4838GL2U | Phone: +91 6385 054 111',
        logo: { uploaded: true, type: 'Square', alignment: 'Left' }
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
        thankYouMessage: 'Thank you for partnering with Eljay Hearing Care for your corporate wellness program.',
        signatureNote: 'This is a computer-generated invoice and does not require a signature.'
      }
    },
    payments: {
      pageSettings: {
        paperSize: 'A4',
        orientation: 'Portrait',
        printerType: 'Color',
        margins: { top: 0.00, left: 0.00, bottom: 0.00, right: 0.00 }
      },
      headerSettings: {
        includeHeader: true,
        leftText: 'No 75, Dhanalkshmi Avenue, Adyar, Chennai - 600020',
        rightText: 'GST: 33BXCFA4838GL2U | Phone: +91 6385 054 111',
        logo: { uploaded: true, type: 'Square', alignment: 'Left' }
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
        signatureNote: 'This is a computer-generated invoice and does not require a signature.'
      }
    },
    expenses: {
      pageSettings: {
        paperSize: 'A4',
        orientation: 'Portrait',
        printerType: 'Color',
        margins: { top: 0.00, left: 0.00, bottom: 0.00, right: 0.00 }
      },
      headerSettings: {
        includeHeader: true,
        leftText: 'No 75, Dhanalkshmi Avenue, Adyar, Chennai - 600020',
        rightText: 'GST: 33BXCFA4838GL2U | Phone: +91 6385 054 111',
        logo: { uploaded: true, type: 'Square', alignment: 'Left' }
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
        thankYouMessage: 'Thank you for your business with Eljay Hearing Care.',
        signatureNote: 'This is a computer-generated expense receipt and does not require a signature.'
      }
    },
    transfers: {
      pageSettings: {
        paperSize: 'A4',
        orientation: 'Portrait',
        printerType: 'Color',
        margins: { top: 0.00, left: 0.00, bottom: 0.00, right: 0.00 }
      },
      headerSettings: {
        includeHeader: true,
        leftText: 'No 75, Dhanalkshmi Avenue, Adyar, Chennai - 600020',
        rightText: 'GST: 33BXCFA4838GL2U | Phone: +91 6385 054 111',
        logo: { uploaded: true, type: 'Square', alignment: 'Left' }
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
        thankYouMessage: 'Thank you for your business with Eljay Hearing Care.',
        signatureNote: 'This is a computer-generated transfer report and does not require a signature.'
      }
    }
  }));

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
          ['b2cInvoice', 'b2bInvoice', 'payments', 'expenses', 'transfers'].forEach(docType => {
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
                 { id: 'payments', label: 'Payments' },
                 { id: 'expenses', label: 'Expenses' },
                 { id: 'transfers', label: 'Transfers' }
               ].map((tab) => (
                 <button
                   key={tab.id}
                   onClick={() => setSelectedDocumentType(tab.id as any)}
                   className={cn(
                     'px-3 py-2 text-xs font-medium rounded-md transition-colors',
                     selectedDocumentType === tab.id
                       ? 'bg-orange-600 text-white'
                       : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
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
                     'px-3 py-2 text-xs font-medium rounded-md transition-colors',
                     selectedSubTab === tab.id
                       ? 'bg-orange-600 text-white'
                       : 'bg-gray-100 text-gray-700 hover:bg-orange-100'
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
             <div className="flex space-x-2 mt-6">
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
                 className="px-3 py-2 text-xs bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-orange-50 transition-colors"
               >
                 Show Full Size Preview
               </button>
               <button 
                 onClick={() => {
                   // Save settings for current document type
                   localStorage.setItem(`printSettings_${selectedDocumentType}`, JSON.stringify(printSettings[selectedDocumentType]));
                   const typeLabels = {
                     b2cInvoice: 'B2C Invoice',
                     b2bInvoice: 'B2B Invoice', 
                     payments: 'Payments',
                     expenses: 'Expenses',
                     transfers: 'Transfers'
                   };
                   alert(`Settings saved for ${typeLabels[selectedDocumentType]}`);
                 }}
                 className="px-3 py-2 text-xs bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-orange-50 transition-colors"
               >
                 Save
               </button>
               <button 
                 onClick={() => {
                   // Save settings for all document types
                   const settingsToSave = {
                     b2cInvoice: printSettings.b2cInvoice,
                     b2bInvoice: printSettings.b2bInvoice,
                     payments: printSettings.payments,
                     expenses: printSettings.expenses,
                     transfers: printSettings.transfers
                   };
                   localStorage.setItem('printSettings_all', JSON.stringify(settingsToSave));
                   alert('Settings saved for all document types');
                 }}
                 className="px-3 py-2 text-xs bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
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
     <div className="space-y-4">
       <h3 className="text-sm font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
         PAGE SETUP
       </h3>
       
       {/* Margins */}
       <div>
         <label className="block text-xs font-medium text-gray-700 mb-1">Margins</label>
         <div className="grid grid-cols-2 gap-2">
           <div>
             <label className="block text-xs text-gray-600 mb-1">Top Margin</label>
             <select 
               value={settings.margins.top}
               onChange={(e) => onChange({ 
                 ...settings, 
                 margins: { ...settings.margins, top: parseFloat(e.target.value) }
               })}
               className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
               title="Select top margin"
               aria-label="Top margin"
             >
              <option value={0.0}>0.00 inches</option>
               <option value={0.25}>0.25 inches</option>
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
               className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
               title="Select left margin"
               aria-label="Left margin"
             >
               <option value={0.0}>0.00 inches</option>
               <option value={0.25}>0.25 inches</option>
               <option value={0.5}>0.50 inches</option>
               <option value={0.75}>0.75 inches</option>
               <option value={1.0}>1.00 inches</option>
               <option value={1.5}>1.50 inches</option>
               <option value={2.0}>2.00 inches</option>
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
               className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
               title="Select bottom margin"
               aria-label="Bottom margin"
             >
               <option value={0.0}>0.00 inches</option>
               <option value={0.25}>0.25 inches</option>
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
               className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
               title="Select right margin"
               aria-label="Right margin"
             >
               <option value={0.0}>0.00 inches</option>
              <option value={0.25}>0.25 inches</option>
               <option value={0.5}>0.50 inches</option>
               <option value={0.75}>0.75 inches</option>
               <option value={1.0}>1.00 inches</option>
               <option value={1.5}>1.50 inches</option>
               <option value={2.0}>2.00 inches</option>
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
     <div className="space-y-4">
       <h3 className="text-sm font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
         CUSTOMIZE HEADER
       </h3>
       
       {/* Include Header */}
       <div>
         <label className="block text-xs font-medium text-gray-700 mb-1">Include Header</label>
         <div className="space-y-1">
           <label className="flex items-center text-xs">
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
           <label className="flex items-center text-xs">
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


       {/* Left Text */}
       <div>
         <label className="block text-xs font-medium text-gray-700 mb-1">Left Text</label>
         <input
           type="text"
           value={settings.leftText}
           onChange={(e) => onChange({ ...settings, leftText: e.target.value })}
           className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
           placeholder="Enter left side text (e.g., address)"
           title="Enter text for the left side of the header"
         />
         <p className="text-xs text-gray-500 mt-1">Use || to add line breaks</p>
       </div>

       {/* Right Text */}
       <div>
         <label className="block text-xs font-medium text-gray-700 mb-1">Right Text</label>
         <input
           type="text"
           value={settings.rightText}
           onChange={(e) => onChange({ ...settings, rightText: e.target.value })}
           className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
           placeholder="Enter right side text (e.g., GST, phone)"
           title="Enter text for the right side of the header"
         />
         <p className="text-xs text-gray-500 mt-1">Use || to add line breaks</p>
       </div>

       {/* Logo Information */}
       <div className="p-3 bg-blue-50 rounded-md">
         <p className="text-xs text-blue-700">
           <strong>Note:</strong> The logo will be automatically included in the header when available.
         </p>
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
     <div className="space-y-4">
       <h3 className="text-sm font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
         CUSTOMIZE FOOTER
       </h3>
       
       {/* Top Margin */}
       <div>
         <label className="block text-xs font-medium text-gray-700 mb-1">Top Margin:</label>
         <input
           type="number"
           step="0.01"
           value={settings.topMargin}
           onChange={(e) => onChange({ ...settings, topMargin: parseFloat(e.target.value) })}
           className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
           placeholder="0.00"
           title="Enter top margin for footer in inches"
         />
       </div>

       {/* Thank You Message */}
       <div>
         <label className="block text-xs font-medium text-gray-700 mb-1">Thank You Message:</label>
         <textarea
           value={settings.thankYouMessage || ''}
           onChange={(e) => onChange({ ...settings, thankYouMessage: e.target.value })}
           className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
           rows={2}
           placeholder="Thank you for choosing Eljay Hearing Care for your audiology needs."
           title="Enter thank you message for the footer"
         />
         <p className="text-xs text-gray-500 mt-1">Use || to add line breaks</p>
       </div>

       {/* Signature Note */}
       <div>
         <label className="block text-xs font-medium text-gray-700 mb-1">Signature Note:</label>
         <textarea
           value={settings.signatureNote || ''}
           onChange={(e) => onChange({ ...settings, signatureNote: e.target.value })}
           className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
           rows={2}
           placeholder="This is a computer-generated invoice and does not require a signature."
           title="Enter signature note for the footer"
         />
         <p className="text-xs text-gray-500 mt-1">Use || to add line breaks</p>
       </div>


       {/* Footer Information */}
       <div className="p-3 bg-blue-50 rounded-md">
         <p className="text-xs text-blue-700">
           <strong>Note:</strong> The footer will display:
         </p>
         <ul className="text-xs text-blue-600 mt-1 ml-4 list-disc">
           <li>Your custom thank you message</li>
           <li>Your custom signature note with generated date</li>
         </ul>
         <p className="text-xs text-blue-600 mt-2">
           Use || as a separator to create line breaks within any text field.
         </p>
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
    <div className="border border-gray-300 rounded-lg bg-gray-50 invoice-preview">
      <div 
        className="bg-white rounded shadow-sm"
        style={{
          padding: `${Math.max(settings.pageSettings.margins.top * 4, 18)}px ${Math.max(settings.pageSettings.margins.right * 4, 18)}px ${Math.max(settings.pageSettings.margins.bottom * 4, 18)}px ${Math.max(settings.pageSettings.margins.left * 4, 18)}px`
        }}
      >
        {/* Header */}
        {settings.headerSettings.includeHeader && (
          <div className="!border-b border-gray-300 pb-2 mb-3">
              <div className="flex justify-between items-start">
                <div>
                  {settings.headerSettings.logo.uploaded && (
                    <div className="mb-1" style={{ 
                      display: 'flex', 
                      alignItems: 'flex-end', 
                      overflow: 'hidden',
                      height: '2.5rem',
                      // Force left edge for B2C invoice preview so logo is flush left
                      justifyContent: (documentType === 'b2cInvoice')
                        ? 'flex-start'
                        : (settings.headerSettings.logo.alignment === 'Centre' ? 'center' : 
                           settings.headerSettings.logo.alignment === 'Right' ? 'flex-end' : 'flex-start')
                    }}>
                      <img 
                        src="/pdf-view-logo.png" 
                        alt="Logo" 
                        style={{
                          maxHeight: '3.5rem',
                          maxWidth: '6rem',
                          width: 'auto',
                          height: '100%',
                          objectFit: 'contain'
                        }}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (!target.dataset.fallback) {
                            target.src = '/pdf-view-logo.svg';
                            target.dataset.fallback = '1';
                          }
                        }}
                      />
                    </div>
                  )}
                  <div>
                  {settings.headerSettings.leftText?.split(' || ').map((text, index) => (
                    <p key={index} className="text-xs text-gray-600 leading-tight">{text}</p>
                  )) || (
                    <p className="text-xs text-gray-600 leading-tight">{settings.headerSettings.leftText}</p>
                  )}
                </div>
              </div>
                <div className="text-right">
                  <div className="inline-block bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold mb-1">
                    Fully Paid
                  </div>
                <div className="text-xs text-gray-600">
                  {settings.headerSettings.rightText.split(' || ').map((text, index) => (
                    <p key={index} className="leading-tight">{text}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Details */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <h3 className="font-semibold mb-1 text-sm">
              {documentType === 'b2cInvoice' || documentType === 'b2bInvoice' ? 'Bill To' : 
               documentType === 'payments' ? 'Payment To' : 
               documentType === 'expenses' ? 'Expense Details' : 'Transfer Details'}
            </h3>
            <p className="font-medium text-xs">
              {documentType === 'b2cInvoice' ? 'Robert Paterson' :
               documentType === 'b2bInvoice' ? 'Apollo Hospitals' :
               documentType === 'payments' ? 'John Doe' : 
               documentType === 'expenses' ? 'Office Supplies' : 'Main Branch to Adyar Branch'}
            </p>
            <p className="text-xs text-gray-600">
              {documentType === 'b2cInvoice' ? 'Individual Patient' :
               documentType === 'b2bInvoice' ? 'Corporate Account' :
               documentType === 'payments' ? 'Payment Recipient' : 
               documentType === 'expenses' ? 'Business Expense' : 'Inventory Transfer'}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1 text-sm">
              {documentType === 'b2cInvoice' || documentType === 'b2bInvoice' ? 'Invoice Details' :
               documentType === 'payments' ? 'Payment Details' : 
               documentType === 'expenses' ? 'Expense Details' : 'Transfer Details'}
            </h3>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>
                  {documentType === 'b2cInvoice' || documentType === 'b2bInvoice' ? 'Invoice Number:' :
                   documentType === 'payments' ? 'Receipt Number:' : 
                   documentType === 'expenses' ? 'Expense Number:' : 'Transfer Number:'}
                </span>
                <span className="font-medium">
                  {documentType === 'b2cInvoice' || documentType === 'b2bInvoice' ? 'EHC-2025-014' :
                   documentType === 'payments' ? 'PAY-2025-014' : 
                   documentType === 'expenses' ? 'EXP-2025-014' : 'TRF-2025-014'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>
                  {documentType === 'b2cInvoice' || documentType === 'b2bInvoice' ? 'Invoice Date:' :
                   documentType === 'payments' ? 'Payment Date:' : 
                   documentType === 'expenses' ? 'Expense Date:' : 'Transfer Date:'}
                </span>
                <span>22 Jun 2025</span>
              </div>
              {(documentType === 'b2cInvoice' || documentType === 'b2bInvoice') && (
                <>
                  <div className="flex justify-between">
                    <span>Due Date:</span>
                    <span>24 Jul 2025</span>
                  </div>
                </>
              )}
              {documentType === 'transfers' && (
                <>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-green-600">Delivered</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Urgency:</span>
                    <span>Medium</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span>Created By:</span>
                <span>Staff</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="mb-3">
          <h3 className="font-semibold mb-2 text-sm">
            {documentType === 'b2cInvoice' || documentType === 'b2bInvoice' ? 'Services & Items' :
             documentType === 'payments' ? 'Payment Details' : 
             documentType === 'expenses' ? 'Expense Items' : 'Transferred Items'}
          </h3>
          <table className="w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-2 py-1 text-left">#</th>
                {(documentType === 'b2cInvoice' || documentType === 'b2bInvoice') ? (
                  <>
                    <th className="border border-gray-300 px-2 py-1 text-left">Service/Item</th>
                    <th className="border border-gray-300 px-2 py-1 text-center">Qty</th>
                    <th className="border border-gray-300 px-2 py-1 text-right">Unit Cost</th>
                    <th className="border border-gray-300 px-2 py-1 text-right">Discount</th>
                    <th className="border border-gray-300 px-2 py-1 text-right">Total</th>
                  </>
                ) : documentType === 'payments' ? (
                  <>
                    <th className="border border-gray-300 px-2 py-1 text-left">Payment Method</th>
                    <th className="border border-gray-300 px-2 py-1 text-center">Status</th>
                    <th className="border border-gray-300 px-2 py-1 text-right">Amount</th>
                    <th className="border border-gray-300 px-2 py-1 text-right">Date</th>
                  </>
                ) : documentType === 'expenses' ? (
                  <>
                    <th className="border border-gray-300 px-2 py-1 text-left">Expense Item</th>
                    <th className="border border-gray-300 px-2 py-1 text-center">Category</th>
                    <th className="border border-gray-300 px-2 py-1 text-right">Amount</th>
                    <th className="border border-gray-300 px-2 py-1 text-right">Date</th>
                  </>
                ) : (
                  <>
                    <th className="border border-gray-300 px-2 py-1 text-left">Item Name</th>
                    <th className="border border-gray-300 px-2 py-1 text-center">Item Code</th>
                    <th className="border border-gray-300 px-2 py-1 text-center">Brand</th>
                    <th className="border border-gray-300 px-2 py-1 text-center">Quantity</th>
                    <th className="border border-gray-300 px-2 py-1 text-left">Remarks</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {(documentType === 'b2cInvoice' || documentType === 'b2bInvoice') ? (
                <>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">1</td>
                    <td className="border border-gray-300 px-2 py-1">
                      <div>
                        <p className="font-medium text-xs">Starkey Livio AI 2400 Hearing Aid</p>
                        <p className="text-xs text-gray-600">AI-powered hearing aid with health monitoring</p>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">1</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">₹69,000</td>
                    <td className="border border-gray-300 px-3 py-2 text-right text-red-600">-₹4,000</td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-medium">₹65,000</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">2</td>
                    <td className="border border-gray-300 px-2 py-1">
                      <div>
                        <p className="font-medium text-xs">Smart Charger</p>
                        <p className="text-xs text-gray-600">Wireless charging case with smartphone app</p>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">1</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">₹7,000</td>
                    <td className="border border-gray-300 px-3 py-2 text-right text-red-600">-₹500</td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-medium">₹6,500</td>
                  </tr>
                </>
              ) : documentType === 'payments' ? (
                <>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">1</td>
                    <td className="border border-gray-300 px-2 py-1">
                      <div>
                        <p className="font-medium text-xs">Payment Receipt</p>
                        <p className="text-xs text-gray-600">Receipt #PAY-2025-014</p>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Completed</span>
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-medium">₹25,000</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">22 Jun 2025</td>
                  </tr>
                </>
              ) : documentType === 'expenses' ? (
                <>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">1</td>
                    <td className="border border-gray-300 px-2 py-1">
                      <div>
                        <p className="font-medium">Office Stationery</p>
                        <p className="text-sm text-gray-600">Pens, papers, and office supplies</p>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Office</span>
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-medium">₹2,500</td>
                    <td className="border border-gray-300 px-2 py-1 text-right">22 Jun 2025</td>
                  </tr>
                </>
              ) : (
                <>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">1</td>
                    <td className="border border-gray-300 px-2 py-1">
                      <div>
                        <p className="font-medium">Starkey Livio AI 2400</p>
                        <p className="text-sm text-gray-600">AI-powered hearing aid</p>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">STK-AI2400</td>
                    <td className="border border-gray-300 px-2 py-1 text-center">Starkey</td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-medium">2</td>
                    <td className="border border-gray-300 px-2 py-1">For new patient fittings</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1">2</td>
                    <td className="border border-gray-300 px-2 py-1">
                      <div>
                        <p className="font-medium">Smart Charger</p>
                        <p className="text-sm text-gray-600">Wireless charging case</p>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-center">STK-CHG01</td>
                    <td className="border border-gray-300 px-2 py-1 text-center">Starkey</td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-medium">1</td>
                    <td className="border border-gray-300 px-2 py-1">Accessory for hearing aids</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Document Summary */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <h3 className="font-semibold mb-1 text-sm">
              {documentType === 'b2cInvoice' || documentType === 'b2bInvoice' ? 'Additional Information' :
               documentType === 'payments' ? 'Payment Notes' : 
               documentType === 'expenses' ? 'Expense Notes' : 'Transfer Notes'}
            </h3>
            <p className="text-xs text-gray-600">
              {documentType === 'b2cInvoice' || documentType === 'b2bInvoice' ? 'Warranty: 3 years warranty + health tracking' :
               documentType === 'payments' ? 'Payment processed successfully via cash' : 
               documentType === 'expenses' ? 'Expense approved for office operations' : 'Transfer completed successfully. Items received in good condition.'}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1 text-sm">
              {documentType === 'b2cInvoice' || documentType === 'b2bInvoice' ? 'Invoice Summary' :
               documentType === 'payments' ? 'Payment Summary' : 
               documentType === 'expenses' ? 'Expense Summary' : 'Transfer Summary'}
            </h3>
            <div className="space-y-1 text-xs">
              {(documentType === 'b2cInvoice' || documentType === 'b2bInvoice') ? (
                <>
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
                </>
              ) : documentType === 'payments' ? (
                <>
                  <div className="flex justify-between">
                    <span>Payment Amount:</span>
                    <span>₹25,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span>Cash</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-green-600">Completed</span>
                  </div>
                </>
              ) : documentType === 'expenses' ? (
                <>
                  <div className="flex justify-between">
                    <span>Expense Amount:</span>
                    <span>₹2,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span>Office Supplies</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-green-600">Approved</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>Total Items:</span>
                    <span>2</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Quantity:</span>
                    <span>3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transfer Type:</span>
                    <span>Branch Transfer</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-green-600">Delivered</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="!border-t border-gray-300 pt-2 text-center text-xs text-gray-600"
          style={{ marginTop: `${Math.max(settings.footerSettings.topMargin * 4, 8)}px` }}
        >
          {settings.footerSettings.thankYouMessage && (
            <div className="mb-1">
              {settings.footerSettings.thankYouMessage.split(' || ').map((text, index) => (
                <p key={index} className="leading-tight">{text}</p>
              ))}
            </div>
          )}
          {settings.footerSettings.signatureNote && (
            <div className="mb-1">
              {settings.footerSettings.signatureNote.split(' || ').map((text, index) => (
                <p key={index} className="leading-tight">{text} • Generated on {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintoutPage;
