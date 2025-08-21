'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PatientBillingPage({ params }: { params: { id: string } }) {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'invoices' | 'payments' | 'payment-history'>('overview');
  const pathname = usePathname();
  const patient = {
    id: 'PAT008',
    name: 'Anna Rodriguez',
    type: 'B2C',
    status: 'New',
    lastUpdated: '5/6/2025'
  };

  const financialSummary = {
    totalPaid: '₹1,97,000',
    outstanding: '₹0',
    totalInvoices: 2
  };

  const invoices = [
    {
      id: 'INV-2025-001',
      status: 'paid',
      createdDate: '15/6/2025',
      dueDate: '15/7/2025',
      amount: '₹29,500.00',
      items: 1,
      services: [
        {
          name: 'Comprehensive Hearing Assessment',
          type: 'service',
          description: 'Complete hearing evaluation and assessment',
          cost: '₹29,500.00'
        }
      ]
    },
    {
      id: 'INV-2025-002',
      status: 'pending',
      createdDate: '20/6/2025',
      dueDate: '20/7/2025',
      amount: '₹1,67,930.00',
      items: 2,
      services: [
        {
          name: 'Hearing Aid Fitting',
          type: 'service',
          description: 'Professional hearing aid fitting and adjustment',
          cost: '₹45,000.00'
        },
        {
          name: 'Premium Hearing Aid',
          type: 'hearing aid',
          description: 'High-quality premium hearing aid device',
          cost: '₹1,22,930.00'
        }
      ]
    }
  ];

  const recentPayments = [
    {
      id: 'RCP-2025-001',
      status: 'Full',
      date: '15/6/2025',
      method: 'Card',
      transactionId: 'TXN123456789',
      amount: '₹29,500.00',
      receivedBy: 'Reception Staff',
      paidInvoices: ['INV-2025-001'],
      paidServices: ['Comprehensive Hearing Assessment']
    }
  ];

  const paymentHistory = [
    {
      date: 'Friday, June 20, 2025',
      entries: [
        {
          type: 'Invoice Generated',
          status: 'Pending',
          details: 'INV-2025-002 • ₹1,67,930.00 • Created by Dr. Sarah Johnson'
        }
      ]
    },
    {
      date: 'Sunday, June 15, 2025',
      entries: [
        {
          type: 'Invoice Generated',
          status: 'Paid',
          details: 'INV-2025-001 • ₹29,500.00 • Created by Dr. Sarah Johnson'
        },
        {
          type: 'Payment Received',
          status: 'completed',
          details: 'INV-2025-001 • ₹29,500.00 • Card • TXN123456789 • Processed by Reception Staff'
        }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'Paid':
      case 'Full':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'Pending':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'service':
        return 'bg-blue-100 text-blue-800';
      case 'hearing aid':
        return 'bg-blue-100 text-blue-800';
      case 'Invoice':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/patients" className="p-2 hover:bg-muted rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-medium text-lg">
                AR
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#101828' }}>{patient.name}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">{patient.type}</span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{patient.status}</span>
                </div>
                <p className="text-sm mt-1" style={{ color: '#4A5565' }}>
                  Patient ID: {patient.id} • Last updated: {patient.lastUpdated}
                </p>
              </div>
            </div>
          </div>
          <button className="flex items-center space-x-2 text-sm" style={{ color: '#717182' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
            <span>Options</span>
          </button>
        </div>

        {/* Patient Navigation */}
        <div className="bg-white rounded-lg border border-border p-4">
          <nav className="flex space-x-8">
            <Link href={`/patients/${patient.id}`} className="flex items-center space-x-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span style={{ color: '#717182' }}>Profile</span>
            </Link>
            <Link href={`/patients/${patient.id}/emr`} className="flex items-center space-x-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span style={{ color: '#717182' }}>EMR</span>
            </Link>
            <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg border-l-4 border-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span className="font-medium" style={{ color: '#101828' }}>Billing</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </nav>
        </div>

        {/* Billing Sub-navigation */}
        <div className="bg-white rounded-lg border border-border p-4">
          <nav className="flex space-x-6">
            <button 
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                activeSubTab === 'overview' 
                  ? 'bg-blue-50' 
                  : 'hover:bg-muted'
              }`}
              style={{ color: activeSubTab === 'overview' ? '#101828' : '#717182' }}
              onClick={() => setActiveSubTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                activeSubTab === 'invoices' 
                  ? 'bg-blue-50' 
                  : 'hover:bg-muted'
              }`}
              style={{ color: activeSubTab === 'invoices' ? '#101828' : '#717182' }}
              onClick={() => setActiveSubTab('invoices')}
            >
              Invoices
            </button>
            <button 
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                activeSubTab === 'payments' 
                  ? 'bg-blue-50' 
                  : 'hover:bg-muted'
              }`}
              style={{ color: activeSubTab === 'payments' ? '#101828' : '#717182' }}
              onClick={() => setActiveSubTab('payments')}
            >
              Payments
            </button>
            <button 
              className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                activeSubTab === 'payment-history' 
                  ? 'bg-blue-50' 
                  : 'hover:bg-muted'
              }`}
              style={{ color: activeSubTab === 'payment-history' ? '#101828' : '#717182' }}
              onClick={() => setActiveSubTab('payment-history')}
            >
              Payment History
            </button>
          </nav>
        </div>

        {/* Conditional Content Based on Active Tab */}
        {activeSubTab === 'overview' && (
          <div className="space-y-6">
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border border-border p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold" style={{ color: '#101828' }}>{financialSummary.totalPaid}</h3>
                    <p className="text-sm" style={{ color: '#717182' }}>Total Paid</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-border p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold" style={{ color: '#101828' }}>{financialSummary.outstanding}</h3>
                    <p className="text-sm" style={{ color: '#717182' }}>Outstanding</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-border p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold" style={{ color: '#101828' }}>{financialSummary.totalInvoices}</h3>
                    <p className="text-sm" style={{ color: '#717182' }}>Total Invoices</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Invoices */}
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium" style={{ color: '#0A0A0A' }}>{invoice.id}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold" style={{ color: '#0A0A0A' }}>{invoice.amount}</div>
                      <div className="text-sm" style={{ color: '#717182' }}>{invoice.items} item(s)</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm" style={{ color: '#717182' }}>
                    <div>
                      <span className="font-medium">Created:</span> {invoice.createdDate}
                    </div>
                    <div>
                      <span className="font-medium">Due:</span> {invoice.dueDate}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {invoice.services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(service.type)}`}>
                            {service.type}
                          </span>
                          <div>
                            <div className="font-medium" style={{ color: '#0A0A0A' }}>{service.name}</div>
                            <div className="text-sm" style={{ color: '#717182' }}>{service.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium" style={{ color: '#0A0A0A' }}>{service.cost}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-end space-x-2">
                    <button className="flex items-center space-x-1 px-3 py-1 text-sm border border-border rounded-md hover:bg-muted transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span style={{ color: '#717182' }}>View</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1 text-sm border border-border rounded-md hover:bg-muted transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span style={{ color: '#717182' }}>Download</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1 text-sm border border-border rounded-md hover:bg-muted transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span style={{ color: '#717182' }}>Email</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'invoices' && (
          <div className="bg-white rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="text-lg font-semibold" style={{ color: '#101828' }}>Invoices</h2>
              </div>
              <button className="bg-primary text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-primary/90 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>+ Create Invoice</span>
              </button>
            </div>

            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium" style={{ color: '#0A0A0A' }}>{invoice.id}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold" style={{ color: '#0A0A0A' }}>{invoice.amount}</div>
                      <div className="text-sm" style={{ color: '#717182' }}>{invoice.items} item(s)</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm" style={{ color: '#717182' }}>
                    <div>
                      <span className="font-medium">Created:</span> {invoice.createdDate}
                    </div>
                    <div>
                      <span className="font-medium">Due:</span> {invoice.dueDate}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {invoice.services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(service.type)}`}>
                            {service.type}
                          </span>
                          <div>
                            <div className="font-medium" style={{ color: '#0A0A0A' }}>{service.name}</div>
                            <div className="text-sm" style={{ color: '#717182' }}>{service.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium" style={{ color: '#0A0A0A' }}>{service.cost}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-end space-x-2">
                    <button className="flex items-center space-x-1 px-3 py-1 text-sm border border-border rounded-md hover:bg-muted transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span style={{ color: '#717182' }}>View</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1 text-sm border border-border rounded-md hover:bg-muted transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span style={{ color: '#717182' }}>Download</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1 text-sm border border-border rounded-md hover:bg-muted transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span style={{ color: '#717182' }}>Email</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'payments' && (
          <div className="bg-white rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <h2 className="text-lg font-semibold" style={{ color: '#101828' }}>Recent Payments</h2>
              </div>
              <button className="bg-primary text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 hover:bg-primary/90 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span>Record Payment</span>
              </button>
            </div>

            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium" style={{ color: '#0A0A0A' }}>{payment.id}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold" style={{ color: '#0A0A0A' }}>{payment.amount}</div>
                      <div className="text-sm" style={{ color: '#717182' }}>Received by {payment.receivedBy}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm" style={{ color: '#717182' }}>
                    <div>
                      <span className="font-medium">Date:</span> {payment.date}
                    </div>
                    <div>
                      <span className="font-medium">Method:</span> {payment.method}
                    </div>
                    <div>
                      <span className="font-medium">Transaction ID:</span> {payment.transactionId}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium mb-2" style={{ color: '#0A0A0A' }}>Paid Invoices & Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {payment.paidInvoices.map((invoice) => (
                        <span key={invoice} className={`px-2 py-1 text-xs rounded-full ${getTypeColor('Invoice')}`}>
                          {invoice}
                        </span>
                      ))}
                      {payment.paidServices.map((service) => (
                        <span key={service} className={`px-2 py-1 text-xs rounded-full ${getTypeColor('service')}`}>
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2">
                    <button className="flex items-center space-x-1 px-3 py-1 text-sm border border-border rounded-md hover:bg-muted transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span style={{ color: '#717182' }}>View</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1 text-sm border border-border rounded-md hover:bg-muted transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span style={{ color: '#717182' }}>Download</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1 text-sm border border-border rounded-md hover:bg-muted transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span style={{ color: '#717182' }}>Email</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'payment-history' && (
          <div className="bg-white rounded-lg border border-border p-6">
            <div className="flex items-center space-x-2 mb-6">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-semibold" style={{ color: '#101828' }}>Payment History</h2>
            </div>

            <div className="space-y-6">
              {paymentHistory.map((day, dayIndex) => (
                <div key={dayIndex}>
                  <h3 className="font-medium mb-4" style={{ color: '#0A0A0A' }}>{day.date}</h3>
                  <div className="space-y-3">
                    {day.entries.map((entry, entryIndex) => (
                      <div key={entryIndex} className="flex items-start space-x-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium" style={{ color: '#0A0A0A' }}>{entry.type}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(entry.status)}`}>
                              {entry.status}
                            </span>
                          </div>
                          <p className="text-sm" style={{ color: '#717182' }}>{entry.details}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-1 hover:bg-muted rounded-md transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button className="p-1 hover:bg-muted rounded-md transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          <button className="p-1 hover:bg-muted rounded-md transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
