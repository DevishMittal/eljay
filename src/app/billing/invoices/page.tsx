'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils';

// Sample data for invoices
const invoiceData = [
  {
    id: 1,
    date: '22 Jun 2025',
    invoiceNumber: 'EHC-2025-014',
    type: 'B2C',
    patientOrg: 'Robert Wilson',
    items: 'Starkey Livio Al 2400 He...',
    amount: '₹66,670',
    paid: '₹30,000',
    status: 'Partial',
    createdBy: 'Dr. Michael Chen'
  },
  {
    id: 2,
    date: '21 Jun 2025',
    invoiceNumber: 'EHC-2025-013',
    type: 'B2B',
    patientOrg: 'Lisa Wang Finance Pro Group',
    items: '3 screenings',
    amount: '₹45,000',
    paid: '₹45,000',
    status: 'Paid',
    createdBy: 'Dr. Sarah Johnson'
  },
  {
    id: 3,
    date: '20 Jun 2025',
    invoiceNumber: 'EHC-2025-012',
    type: 'B2C',
    patientOrg: 'John Smith',
    items: 'Hearing Aid Consultation',
    amount: '₹25,000',
    paid: '₹0',
    status: 'Pending',
    createdBy: 'Dr. Emily Davis'
  },
  {
    id: 4,
    date: '19 Jun 2025',
    invoiceNumber: 'EHC-2025-011',
    type: 'B2B',
    patientOrg: 'ABC Corporation',
    items: 'Workplace Hearing Assessment',
    amount: '₹80,000',
    paid: '₹40,000',
    status: 'Partial',
    createdBy: 'Dr. Michael Chen'
  },
  {
    id: 5,
    date: '18 Jun 2025',
    invoiceNumber: 'EHC-2025-010',
    type: 'B2C',
    patientOrg: 'Maria Garcia',
    items: 'Custom Hearing Protection',
    amount: '₹15,000',
    paid: '₹15,000',
    status: 'Paid',
    createdBy: 'Dr. Sarah Johnson'
  }
];

const summaryCards = [
  {
    title: 'Total Invoiced',
    value: '₹5,09,130',
    icon: '📄',
    color: 'text-green-600'
  },
  {
    title: 'Outstanding',
    value: '₹2,40,516',
    icon: '⚠️',
    color: 'text-yellow-600'
  },
  {
    title: 'Paid Invoices',
    value: '9',
    icon: '✅',
    color: 'text-green-600'
  },
  {
    title: 'Overdue',
    value: '8',
    icon: '🚨',
    color: 'text-red-600'
  }
];

export default function InvoicesPage() {
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewInvoiceDropdown, setShowNewInvoiceDropdown] = useState(false);

  const handleSelectAll = () => {
    if (selectedInvoices.length === invoiceData.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(invoiceData.map(invoice => invoice.id));
    }
  };

  const handleSelectInvoice = (id: number) => {
    setSelectedInvoices(prev => 
      prev.includes(id) 
        ? prev.filter(invoiceId => invoiceId !== id)
        : [...prev, id]
    );
  };

  const handleNewInvoiceClick = () => {
    setShowNewInvoiceDropdown(!showNewInvoiceDropdown);
  };

  const handleInvoiceTypeSelect = (type: 'B2C' | 'B2B') => {
    setShowNewInvoiceDropdown(false);
    if (type === 'B2C') {
      window.location.href = '/billing/invoices/create/b2c';
    } else {
      window.location.href = '/billing/invoices/create/b2b';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'B2C':
        return 'bg-green-100 text-green-800';
      case 'B2B':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
              Invoices
            </h1>
            <p className="text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
              Manage patient invoices and billing records.
            </p>
          </div>
          <div className="relative">
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleNewInvoiceClick}
            >
              + New Invoice
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
            
            {/* Dropdown Menu */}
            {showNewInvoiceDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-2">
                  <button
                    onClick={() => handleInvoiceTypeSelect('B2C')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start space-x-3"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">B2C Invoice</div>
                      <div className="text-sm text-gray-500">Individual patient services</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleInvoiceTypeSelect('B2B')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start space-x-3"
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">B2B Invoice</div>
                      <div className="text-sm text-gray-500">Organization screenings</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card, index) => (
            <Card key={index} className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                      {card.title}
                    </p>
                    <p className={cn("text-xl font-semibold", card.color)} style={{ fontFamily: 'Segoe UI' }}>
                      {card.value}
                    </p>
                  </div>
                  <div className="text-2xl">{card.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Invoice List Section */}
        <Card className="bg-white">
          <CardContent className="p-6">
            {/* Section Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                  Invoices
                </h2>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                  20
                </span>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-[#F9FAFB] border-[#E5E7EB] placeholder-[#717182]"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="bg-white border-gray-300 text-gray-700">
                  All Types
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
                <Button variant="outline" className="bg-white border-gray-300 text-gray-700">
                  All Patients
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
                <Button variant="outline" className="bg-white border-gray-300 text-gray-700">
                  All Status
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
              </div>
            </div>

            {/* Invoice Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.length === invoiceData.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                        aria-label="Select all invoices"
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Date
                      <svg className="inline w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Invoice #
                      <svg className="inline w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Type
                      <svg className="inline w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Patient/Org
                      <svg className="inline w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Items</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Amount
                      <svg className="inline w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Paid</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Status
                      <svg className="inline w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Created By</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={() => handleSelectInvoice(invoice.id)}
                          className="rounded border-gray-300"
                          aria-label={`Select invoice ${invoice.invoiceNumber}`}
                        />
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{invoice.date}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{invoice.invoiceNumber}</td>
                      <td className="py-3 px-4">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getTypeColor(invoice.type))}>
                          {invoice.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{invoice.patientOrg}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{invoice.items}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{invoice.amount}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{invoice.paid}</td>
                      <td className="py-3 px-4">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(invoice.status))}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{invoice.createdBy}</td>
                                             <td className="py-3 px-4">
                         <div className="flex space-x-2">
                           <button 
                             onClick={() => window.location.href = `/billing/invoices/${invoice.id}`}
                             className="text-gray-400 hover:text-gray-600"
                             aria-label={`View invoice ${invoice.invoiceNumber}`}
                           >
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                             </svg>
                           </button>
                           <button 
                             onClick={() => window.location.href = `/billing/invoices/${invoice.id}/edit`}
                             className="text-gray-400 hover:text-gray-600"
                             aria-label={`Edit invoice ${invoice.invoiceNumber}`}
                           >
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                             </svg>
                           </button>
                         </div>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing 1 to 20 of 20 invoices.
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select 
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                  aria-label="Number of invoices to display per page"
                >
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
