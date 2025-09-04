/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils';
import InvoiceService from '@/services/invoiceService';
import { Invoice } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);
  const [viewMode, setViewMode] = useState<'invoice' | 'pdf'>('invoice');
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = useCallback(async () => {
    if (!token) {
      setError('Authentication token not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await InvoiceService.getInvoice(resolvedParams.id);
      setInvoice(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching invoice:', err);
      setError(err.message || 'Failed to fetch invoice details');
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id, token]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (token) {
      fetchInvoice();
    }
  }, [authLoading, isAuthenticated, token, fetchInvoice, router]);

  const handleEdit = () => {
    window.location.href = `/billing/invoices/${resolvedParams.id}/edit`;
  };

  const handleDownload = () => {
    // TODO: Download PDF
    console.log('Download PDF');
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return InvoiceService.formatDateForDisplay(dateString);
  };

  if (authLoading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading authentication...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading invoice...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !invoice) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-lg text-red-600 mb-4">{error || 'Invoice not found'}</div>
              {error && (error.includes('token') || error.includes('authentication')) ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Please try logging in again.</p>
                  <Button onClick={() => router.push('/login')} className="bg-red-600 hover:bg-red-700">
                    Go to Login
                  </Button>
                </div>
              ) : (
                <Button onClick={fetchInvoice} className="ml-4">Retry</Button>
              )}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                Invoice {invoice.invoiceNumber}
              </h1>
              <p className="text-[#4A5565] text-sm" style={{ fontFamily: 'Segoe UI' }}>
                {invoice.invoiceType === 'B2C' ? 'B2C Invoice - Service Based' : 'B2B Invoice - Organization Based'}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant={viewMode === 'invoice' ? 'default' : 'outline'}
              onClick={() => setViewMode('invoice')}
              className={cn(
                viewMode === 'invoice' ? 'bg-red-600 hover:bg-red-700 text-white' : 'border-gray-300'
              )}
            >
              Invoice View
            </Button>
            <Button 
              variant={viewMode === 'pdf' ? 'default' : 'outline'}
              onClick={() => setViewMode('pdf')}
              className={cn(
                viewMode === 'pdf' ? 'bg-red-600 hover:bg-red-700 text-white' : 'border-gray-300'
              )}
            >
              PDF View
            </Button>
            <Button variant="outline" onClick={handleDownload} className="border-gray-300">
              Download
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </Button>
            <Button variant="outline" onClick={handlePrint} className="border-gray-300">
              Print
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </Button>
            <Button onClick={handleEdit} className="bg-red-600 hover:bg-red-700 text-white">
              Edit
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Invoice Content */}
        <Card className="bg-white max-w-4xl mx-auto">
          <CardContent className="p-8">
            {/* Company Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                  Eljay Hearing Care
                </h2>
                <p className="text-[#4A5565] text-sm" style={{ fontFamily: 'Segoe UI' }}>
                  Professional Audiology Services
                </p>
                <p className="text-[#4A5565] text-sm mt-1" style={{ fontFamily: 'Segoe UI' }}>
                  123 Healthcare Avenue, Medical District, Chennai, Tamil Nadu 600001
                </p>
                <p className="text-[#4A5565] text-sm mt-1" style={{ fontFamily: 'Segoe UI' }}>
                  GST: 33ABCDE1234F1Z5
                </p>
              </div>
              <div className="text-right">
                <div className={cn(
                  "inline-block px-3 py-1 rounded-full text-sm font-medium mb-2",
                  invoice.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                  invoice.paymentStatus === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                )}>
                  {invoice.paymentStatus}
                </div>
                <p className="text-[#4A5565] text-sm" style={{ fontFamily: 'Segoe UI' }}>
                  Phone: +91 44 1234 5678
                </p>
                <p className="text-[#4A5565] text-sm" style={{ fontFamily: 'Segoe UI' }}>
                  Email: info@eljayhearing.com
                </p>
                <p className="text-[#4A5565] text-sm" style={{ fontFamily: 'Segoe UI' }}>
                  Website: www.eljayhearing.com
                </p>
              </div>
            </div>

            {/* Bill To and Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium text-gray-700">Bill To</span>
                </div>
                <p className="font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                  {invoice.invoiceType === 'B2C' ? invoice.patientName : invoice.organizationName}
                </p>
                <p className="text-[#4A5565] text-sm" style={{ fontFamily: 'Segoe UI' }}>
                  {invoice.invoiceType === 'B2C' ? 'Individual Patient' : 'Organization'}
                </p>
                {invoice.invoiceType === 'B2C' && (
                  <p className="text-[#4A5565] text-sm" style={{ fontFamily: 'Segoe UI' }}>
                    Organization: {invoice.organizationName}
                  </p>
                )}
              </div>
              
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-medium text-gray-700">Invoice Details</span>
                </div>
                <p className="text-[#4A5565] text-sm" style={{ fontFamily: 'Segoe UI' }}>
                  Invoice Number: {invoice.invoiceNumber}
                </p>
                <p className="text-[#4A5565] text-sm" style={{ fontFamily: 'Segoe UI' }}>
                  Invoice Date: {formatDate(invoice.invoiceDate)}
                </p>
                <p className="text-[#4A5565] text-sm" style={{ fontFamily: 'Segoe UI' }}>
                  Type: {invoice.invoiceType}
                </p>
                <p className="text-[#4A5565] text-sm" style={{ fontFamily: 'Segoe UI' }}>
                  Created: {formatDate(invoice.createdAt)}
                </p>
              </div>
            </div>

            {/* Services & Items Table */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">S.No</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date of Screening</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">OP/IP No</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Bio Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Diagnostic Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Discount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.screenings.map((screening, index) => (
                    <tr key={screening.id || index} className="border-b border-gray-100">
                      <td className="py-4 px-4 text-sm text-[#4A5565]">{screening.serialNumber || index + 1}</td>
                      <td className="py-4 px-4 text-sm text-[#4A5565]">{formatDate(screening.screeningDate)}</td>
                      <td className="py-4 px-4 text-sm text-[#4A5565]">{screening.opNumber}</td>
                      <td className="py-4 px-4 text-sm text-[#4A5565]">{screening.bioName}</td>
                      <td className="py-4 px-4 text-sm text-[#4A5565]">{screening.diagnosticName}</td>
                      <td className="py-4 px-4 text-sm text-[#4A5565]">₹{screening.amount.toLocaleString()}</td>
                      <td className="py-4 px-4 text-sm text-red-600">
                        {screening.discount > 0 ? `-₹${screening.discount.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-[#101828]">₹{(screening.amount - (screening.discount || 0)).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Notes, Terms, Tax Info */}
              <div className="space-y-6">
                {invoice.notes && (
                  <div>
                    <h3 className="font-semibold text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                      Notes
                    </h3>
                    <p className="text-sm text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                      {invoice.notes}
                    </p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                    Terms & Conditions
                  </h3>
                  <ul className="text-sm text-[#4A5565] space-y-1" style={{ fontFamily: 'Segoe UI' }}>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      Payment is due within 30 days of invoice date.
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      All services provided are subject to professional terms.
                    </li>
                    {invoice.warranty && (
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        Warranty terms apply as per individual service agreements.
                      </li>
                    )}
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      For any queries, please contact us at the above details.
                    </li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-xs text-blue-700" style={{ fontFamily: 'Segoe UI' }}>
                    * Tax (SGST/CGST) applies only to services and accessories. Hearing aids are tax-exempt as per government regulations.
                  </p>
                </div>
              </div>
              
              {/* Right Column - Invoice Summary */}
              <div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-[#101828] mb-4" style={{ fontFamily: 'Segoe UI' }}>
                    Invoice Summary
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#4A5565]">Subtotal:</span>
                      <span className="text-sm font-medium">₹{invoice.subtotal.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-[#4A5565]">Total Discount:</span>
                      <span className="text-sm font-medium text-red-600">-₹{invoice.totalDiscount.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-[#4A5565]">Taxable Amount:</span>
                      <span className="text-sm font-medium">₹{invoice.taxableAmount.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-[#4A5565]">SGST ({invoice.sgstRate}%):</span>
                      <span className="text-sm font-medium">₹{invoice.sgstAmount.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-[#4A5565]">CGST ({invoice.cgstRate}%):</span>
                      <span className="text-sm font-medium">₹{invoice.cgstAmount.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-[#4A5565]">Total Tax:</span>
                      <span className="text-sm font-medium">₹{invoice.totalTax.toLocaleString()}</span>
                    </div>
                    
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="font-semibold text-[#101828]">Total Amount:</span>
                        <span className="font-semibold text-[#101828]">₹{invoice.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-[#4A5565] max-w-4xl mx-auto" style={{ fontFamily: 'Segoe UI' }}>
          <p>Thank you for choosing Eljay Hearing Care for your audiology needs.</p>
          <p className="mt-1">This is a computer-generated invoice and does not require a signature.</p>
          <p className="mt-1">Generated on {formatDate(invoice.createdAt)}</p>
        </div>
      </div>
    </MainLayout>
  );
}
