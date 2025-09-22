/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils';
import InvoiceService from '@/services/invoiceService';
import PaymentService from '@/services/paymentService';
import PatientPaymentService from '@/services/patientPaymentService';
import { Invoice, OutstandingPayment, Payment } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { printInvoice, downloadInvoiceAsPDF, printCurrentPage } from '@/utils/printUtils';

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);
  const [viewMode, setViewMode] = useState<'invoice' | 'pdf'>('invoice');
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appliedAdvancePayments, setAppliedAdvancePayments] = useState<OutstandingPayment[]>([]);
  const [invoicePayments, setInvoicePayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const fetchInvoicePayments = useCallback(async (patientId: string | null, invoiceNumber: string, patientName: string) => {
    try {
      setLoadingPayments(true);
      
      if (patientId) {
        // For B2C invoices with patientId
        const response = await PatientPaymentService.getPatientPayments(patientId);
        
        // Filter payments that are related to this invoice
        const relatedPayments = response.data.payments.filter(payment => 
          payment.description?.includes(invoiceNumber) || 
          payment.notes?.includes(invoiceNumber) ||
          payment.patientId === patientId
        );
        
        setInvoicePayments(relatedPayments);
      } else {
        // For B2B invoices without patientId, fetch all payments and filter by patient name and invoice
        const response = await PatientPaymentService.getAllPayments(1, 100);
        
        const relatedPayments = response.data.payments.filter(payment => 
          (payment.description?.includes(invoiceNumber) || 
           payment.notes?.includes(invoiceNumber)) &&
          payment.patientName === patientName
        );
        
        setInvoicePayments(relatedPayments);
      }
    } catch (error) {
      console.error('Error fetching invoice payments:', error);
      // Don't set error state, just log it as payments are optional
    } finally {
      setLoadingPayments(false);
    }
  }, []);

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
      
      // Fetch payments for this invoice
      fetchInvoicePayments(response.data.patientId || null, response.data.invoiceNumber, response.data.patientName);
      
      // If this is a B2C invoice with a patient ID, fetch outstanding payments to identify applied advance payments
      if (response.data.invoiceType === 'B2C' && response.data.patientId) {
        try {
          const outstandingResponse = await PaymentService.getOutstandingPayments(response.data.patientId);
          // Filter payments that have been applied (appliedAmount > 0)
          const appliedPayments = outstandingResponse.data.outstandingPayments.filter(
            payment => payment.appliedAmount > 0
          );
          setAppliedAdvancePayments(appliedPayments);
        } catch (paymentError) {
          console.warn('Could not fetch outstanding payments:', paymentError);
          // Continue without outstanding payments data
        }
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching invoice:', err);
      setError(err.message || 'Failed to fetch invoice details');
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id, token, fetchInvoicePayments]);

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
    if (!invoice) return;
    
    downloadInvoiceAsPDF(invoice, {
      title: `Invoice ${invoice.invoiceNumber}`,
      filename: `invoice-${invoice.invoiceNumber}.pdf`
    }, invoicePayments);
  };

  const handlePrint = () => {
    if (!invoice) return;
    
    if (viewMode === 'pdf') {
      // Print the PDF view
      printInvoice(invoice, {
        title: `Invoice ${invoice.invoiceNumber}`,
        filename: `invoice-${invoice.invoiceNumber}.pdf`
      }, invoicePayments);
    } else {
      // Print the current invoice view
      printCurrentPage();
    }
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
      <div className="w-full flex-shrink-0 p-3 md:p-6 bg-white ">
        <div className="w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-8 rounded-md gap-1.5 has-[>svg]:px-2.5 p-2 flex-shrink-0"
              aria-label="Go back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left w-4 h-4">
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 truncate">
                Invoice {invoice.invoiceNumber}
              </h1>
              <p className="text-sm lg:text-base text-gray-600 mt-1">
                {invoice.invoiceType === 'B2C' ? 'B2C Invoice - Service Based' : 'B2B Invoice - Organization Based'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('invoice')}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap font-medium h-8 rounded-md gap-1.5 has-[>svg]:px-2.5 px-2 lg:px-3 py-1 text-xs transition-all",
                  viewMode === 'invoice'
                    ? "bg-white text-gray-900 shadow-sm hover:bg-white hover:text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <span className="hidden sm:inline">Invoice View</span>
                <span className="sm:hidden">Invoice</span>
              </button>
              <button
                onClick={() => setViewMode('pdf')}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap font-medium h-8 rounded-md gap-1.5 has-[>svg]:px-2.5 px-2 lg:px-3 py-1 text-xs transition-all",
                  viewMode === 'pdf'
                    ? "bg-white text-gray-900 shadow-sm hover:bg-white hover:text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <span className="hidden sm:inline">PDF View</span>
                <span className="sm:hidden">PDF</span>
              </button>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={handleDownload}
                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 border bg-background text-foreground hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 has-[>svg]:px-2.5 gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download w-4 h-4">
                  <path d="M12 15V3"></path>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <path d="m7 10 5 5 5-5"></path>
                </svg>
                Download PDF
              </button>
              {/* <button
                onClick={handlePrint}
                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 border bg-background text-foreground hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 has-[>svg]:px-2.5 gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-printer w-4 h-4">
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"></path>
                  <rect x="6" y="14" width="12" height="8" rx="1"></rect>
                </svg>
                Print
              </button> */}
              <button
                onClick={handleEdit}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 px-4 py-1.5 has-[>svg]:px-3 gap-2 bg-orange-600 hover:bg-orange-700 text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square-pen w-4 h-4">
                  <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"></path>
                </svg>
                Edit
              </button>
            </div>

            {/* Tablet Dropdown */}
            <div className="hidden md:flex lg:hidden">
              <button 
                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 border bg-background text-foreground hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 has-[>svg]:px-2.5 p-2"
                aria-label="More options"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis-vertical w-4 h-4">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="12" cy="5" r="1"></circle>
                  <circle cx="12" cy="19" r="1"></circle>
                </svg>
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={handleDownload}
                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 border bg-background text-foreground hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 has-[>svg]:px-2.5 gap-1"
                aria-label="Download invoice"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download w-4 h-4">
                  <path d="M12 15V3"></path>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <path d="m7 10 5 5 5-5"></path>
                </svg>
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 border bg-background text-foreground hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 has-[>svg]:px-2.5 gap-1"
                aria-label="Print invoice"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-printer w-4 h-4">
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"></path>
                  <rect x="6" y="14" width="12" height="8" rx="1"></rect>
                </svg>
              </button>
              <button
                onClick={handleEdit}
                className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 h-8 rounded-md px-3 has-[>svg]:px-2.5 gap-1 bg-orange-600 hover:bg-orange-700 text-white"
                aria-label="Edit invoice"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square-pen w-4 h-4">
                  <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* Invoice View */}
        {viewMode === 'invoice' && (
          <div className="w-full p-3 md:p-6" id="invoice-content">
            <div className="w-full space-y-4 md:space-y-6">
              <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border w-full">
                <div className="p-4 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 md:gap-0 mb-6 md:mb-8">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Eljay Hearing Care</h2>
                      <p className="text-sm md:text-base text-gray-600 mb-1">
                        {invoice.invoiceType === 'B2C' ? 'Professionals in hearing care' : 'Professionals in hearing care'}
                      </p>
                      <p className="text-sm md:text-base text-gray-600 mb-1">No 75, DhanaLakshmi Avenue,  
                      Adyar </p>
                      <p className="text-sm md:text-base text-gray-600 mb-1">Chennai - 600020</p>
                    
                    </div>
                    <div className="text-left md:text-right">
                      <div className="mb-4">
                        <span className={cn(
                          "inline-flex items-center justify-center rounded-md border font-medium w-fit whitespace-nowrap shrink-0 px-4 py-2 text-sm",
                          invoice.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800 border-green-200' :
                          invoice.paymentStatus === 'Cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                          invoice.paymentStatus === 'Partially Paid' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-blue-100 text-blue-800 border-blue-200'
                        )}>
                          {invoice.paymentStatus}
                        </span>
                      </div>
                      <div className="text-sm md:text-base text-gray-600 space-y-1">
                        <p>Phone: +91 44 1234 5678</p>
                        <p>Email: {invoice.invoiceType === 'B2C' ? 'info@eljayhearing.com' : 'corporate@eljayhearing.com'}</p>
                        <p>Website: www.eljayhearing.com</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-border shrink-0 h-px w-full my-6 md:my-8"></div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Bill To
                      </h3>
                      <div className="space-y-2">
                        <p className="font-medium text-gray-900">
                          {invoice.invoiceType === 'B2C' ? invoice.patientName : invoice.organizationName}
                        </p>
                        <p className="text-sm md:text-base text-gray-600">
                          {invoice.invoiceType === 'B2C' ? 'Individual Patient' : 'Corporate Account'}
                        </p>
                        {invoice.invoiceType === 'B2C' && (
                          <p className="text-sm md:text-base text-gray-600">
                            Patient ID: PAT001
                          </p>
                        )}
                        {invoice.invoiceType === 'B2B' && (
                          <p className="text-sm md:text-base text-gray-600">
                            Primary Contact: {invoice.patientName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                          <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                          <path d="M10 9H8"></path>
                          <path d="M16 13H8"></path>
                          <path d="M16 17H8"></path>
                        </svg>
                        Invoice Details
                      </h3>
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                          <span className="text-sm md:text-base text-gray-600">Invoice Number:</span>
                          <span className="font-medium text-sm md:text-base">{invoice.invoiceNumber}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                          <span className="text-sm md:text-base text-gray-600">Invoice Date:</span>
                          <span className="font-medium text-sm md:text-base">{formatDate(invoice.invoiceDate)}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                          <span className="text-sm md:text-base text-gray-600">Due Date:</span>
                          <span className="font-medium text-sm md:text-base">{formatDate(invoice.invoiceDate)}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                          <span className="text-sm md:text-base text-gray-600">Created By:</span>
                          <span className="font-medium text-sm md:text-base">Dr. Michael Chen</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border w-full">
                <div className="px-6 pt-6">
                  <h4 className="text-base md:text-lg">
                    {invoice.invoiceType === 'B2C' ? 'Services & Items' : 'Screening Details'}
                  </h4>
                </div>
                <div className="px-6">
                  <div className="w-full overflow-x-auto">
                    <div className="relative w-full overflow-x-auto">
                      <table className="caption-bottom text-sm w-full min-w-[600px]">
                        <thead className="bg-gray-50">
                          <tr className="border-b transition-colors">
                            {invoice.invoiceType === 'B2C' ? (
                              <>
                                <th className="h-10 px-2 text-left align-middle whitespace-nowrap font-semibold text-gray-900 w-2/5 text-xs md:text-sm">Service/Item</th>
                                <th className="h-10 px-2 align-middle whitespace-nowrap font-semibold text-gray-900 text-center w-[80px] md:w-[100px] text-xs md:text-sm">Qty</th>
                                <th className="h-10 px-2 align-middle whitespace-nowrap font-semibold text-gray-900 text-right w-[120px] md:w-[140px] text-xs md:text-sm">Unit Cost</th>
                                <th className="h-10 px-2 align-middle whitespace-nowrap font-semibold text-gray-900 text-right w-[100px] md:w-[120px] text-xs md:text-sm">Discount</th>
                                <th className="h-10 px-2 align-middle whitespace-nowrap font-semibold text-gray-900 text-right w-[120px] md:w-[140px] text-xs md:text-sm">Total</th>
                              </>
                            ) : (
                              <>
                                <th className="h-10 px-2 text-left align-middle whitespace-nowrap font-semibold text-gray-900 w-[60px] text-xs md:text-sm">S.No</th>
                                <th className="h-10 px-2 text-left align-middle whitespace-nowrap font-semibold text-gray-900 w-[100px] text-xs md:text-sm">Date</th>
                                <th className="h-10 px-2 text-left align-middle whitespace-nowrap font-semibold text-gray-900 w-[100px] text-xs md:text-sm">OP/IP No</th>
                                <th className="h-10 px-2 text-left align-middle whitespace-nowrap font-semibold text-gray-900 w-[120px] text-xs md:text-sm">Bio Name</th>
                                <th className="h-10 px-2 text-left align-middle whitespace-nowrap font-semibold text-gray-900 w-[150px] text-xs md:text-sm">Diagnostic</th>
                                <th className="h-10 px-2 align-middle whitespace-nowrap font-semibold text-gray-900 text-right w-[100px] text-xs md:text-sm">Amount</th>
                                <th className="h-10 px-2 align-middle whitespace-nowrap font-semibold text-gray-900 text-right w-[100px] text-xs md:text-sm">Discount</th>
                                <th className="h-10 px-2 align-middle whitespace-nowrap font-semibold text-gray-900 text-right w-[100px] text-xs md:text-sm">Total</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {invoice.invoiceType === 'B2C' ? (
                            invoice.services?.map((service, index) => (
                              <tr key={service.id || index} className="hover:bg-muted/50 border-b transition-colors">
                                <td className="p-2 align-middle whitespace-nowrap">
                                  <div className="space-y-1">
                                    <p className="font-medium text-gray-900 text-xs md:text-sm">{service.serviceName}</p>
                                    <p className="text-xs text-gray-600">{service.description}</p>
                                  </div>
                                </td>
                                <td className="p-2 align-middle whitespace-nowrap text-center text-xs md:text-sm">{service.quantity}</td>
                                <td className="p-2 align-middle whitespace-nowrap text-right font-medium text-xs md:text-sm">₹{service.unitCost.toLocaleString()}</td>
                                <td className="p-2 align-middle whitespace-nowrap text-right text-red-600 text-xs md:text-sm">
                                  {service.discount > 0 ? `-₹${service.discount.toLocaleString()}` : '-'}
                                </td>
                                <td className="p-2 align-middle whitespace-nowrap text-right font-medium text-xs md:text-sm">
                                  ₹{(service.total || ((service.quantity * service.unitCost) - service.discount)).toLocaleString()}
                                </td>
                              </tr>
                            ))
                          ) : (
                            invoice.screenings?.map((screening, index) => (
                              <tr key={screening.id || index} className="hover:bg-muted/50 border-b transition-colors">
                                <td className="p-2 align-middle whitespace-nowrap text-xs md:text-sm">{screening.serialNumber || index + 1}</td>
                                <td className="p-2 align-middle whitespace-nowrap text-xs md:text-sm">{formatDate(screening.screeningDate)}</td>
                                <td className="p-2 align-middle whitespace-nowrap text-xs md:text-sm">{screening.opNumber}</td>
                                <td className="p-2 align-middle whitespace-nowrap text-xs md:text-sm">{screening.bioName}</td>
                                <td className="p-2 align-middle whitespace-nowrap text-xs md:text-sm">{screening.diagnosticName}</td>
                                <td className="p-2 align-middle whitespace-nowrap text-right font-medium text-xs md:text-sm">₹{screening.amount.toLocaleString()}</td>
                                <td className="p-2 align-middle whitespace-nowrap text-right text-red-600 text-xs md:text-sm">
                                  {screening.discount > 0 ? `-₹${screening.discount.toLocaleString()}` : '-'}
                                </td>
                                <td className="p-2 align-middle whitespace-nowrap text-right font-medium text-xs md:text-sm">
                                  ₹{(screening.amount - (screening.discount || 0)).toLocaleString()}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details Section */}
              {invoicePayments.length > 0 && (
                <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border w-full">
                  <div className="px-6 pt-6">
                    <h4 className="text-base md:text-lg font-semibold text-gray-900">Payment Details</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Payment records associated with this invoice
                    </p>
                  </div>
                  <div className="px-6 pb-6">
                    {loadingPayments ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-sm text-gray-500">Loading payment details...</div>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-2 font-semibold text-gray-900 text-sm">Receipt Number</th>
                              <th className="text-left py-3 px-2 font-semibold text-gray-900 text-sm">Date</th>
                              <th className="text-left py-3 px-2 font-semibold text-gray-900 text-sm">Payment Method</th>
                              <th className="text-right py-3 px-2 font-semibold text-gray-900 text-sm">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoicePayments.map((payment) => (
                              <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-2 text-sm text-gray-900 font-medium">
                                  {payment.receiptNumber}
                                </td>
                                <td className="py-3 px-2 text-sm text-gray-700">
                                  {PaymentService.formatDateForDisplay(payment.paymentDate)}
                                </td>
                                <td className="py-3 px-2">
                                  <span className={cn(
                                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                    PatientPaymentService.getMethodColor(payment.method)
                                  )}>
                                    {payment.method}
                                  </span>
                                </td>
                                <td className="py-3 px-2 text-sm font-semibold text-gray-900 text-right">
                                  ₹{payment.amount.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    {invoicePayments.length > 0 && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-blue-800">
                            Total Payments Received:
                          </span>
                          <span className="text-lg font-bold text-blue-800">
                            ₹{invoicePayments.reduce((total, payment) => total + payment.amount, 0).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-blue-700 mt-2">
                          These payments were recorded for this invoice.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Outstanding Receipts Applied Section */}
              {appliedAdvancePayments && appliedAdvancePayments.length > 0 && (
                <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border w-full">
                  <div className="px-6 pt-6">
                    <h4 className="text-base md:text-lg font-semibold text-gray-900">Outstanding Receipts Applied</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Advance payments applied to this invoice
                    </p>
                  </div>
                  <div className="px-6 pb-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-2 font-semibold text-gray-900 text-sm">Payment ID</th>
                            <th className="text-left py-3 px-2 font-semibold text-gray-900 text-sm">Receipt Number</th>
                            <th className="text-left py-3 px-2 font-semibold text-gray-900 text-sm">Payment Date</th>
                            <th className="text-left py-3 px-2 font-semibold text-gray-900 text-sm">Payment Method</th>
                            <th className="text-right py-3 px-2 font-semibold text-gray-900 text-sm">Applied Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appliedAdvancePayments.map((appliedPayment) => (
                            <tr key={appliedPayment.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-2 text-sm text-gray-900 font-medium">
                                #{appliedPayment.id}
                              </td>
                              <td className="py-3 px-2 text-sm text-gray-700">
                                {appliedPayment.receiptNumber}
                              </td>
                              <td className="py-3 px-2 text-sm text-gray-700">
                                {appliedPayment.date}
                              </td>
                              <td className="py-3 px-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {appliedPayment.paymentMethod}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-sm font-semibold text-gray-900 text-right">
                                ₹{appliedPayment.appliedAmount.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-800">
                          Total Advance Payments Applied:
                        </span>
                        <span className="text-lg font-bold text-green-800">
                          ₹{appliedAdvancePayments.reduce((total, payment) => total + payment.appliedAmount, 0).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-green-700 mt-2">
                        This amount has been deducted from your total invoice amount.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border w-full">
                  <div className="px-6 pt-6">
                    <h4 className="text-base md:text-lg">Additional Information</h4>
                  </div>
                  <div className="px-6 space-y-4">
                    {invoice.notes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 text-sm md:text-base">Notes</h4>
                        <p className="text-gray-700 text-xs md:text-sm">{invoice.notes}</p>
                      </div>
                    )}
                    {invoice.warranty && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 text-sm md:text-base">Warranty Information</h4>
                        <p className="text-gray-700 text-xs md:text-sm">{invoice.warranty}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 text-sm md:text-base">
                        {invoice.invoiceType === 'B2C' ? 'Terms & Conditions' : 'Corporate Terms & Conditions'}
                      </h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        {invoice.invoiceType === 'B2C' ? (
                          <>
                            <p>• Payment is due within 30 days of invoice date</p>
                            <p>• All services provided are subject to professional terms</p>
                            <p>• Warranty terms apply as per individual service agreements</p>
                            <p>• For any queries, please contact us at the above details</p>
                          </>
                        ) : (
                          <>
                            <p>• Payment terms: Net 30 days from invoice date</p>
                            <p>• All screenings conducted as per corporate agreement</p>
                            <p>• Reports will be provided within 48 hours of screening</p>
                            <p>• Follow-up consultations available on request</p>
                            <p>• For billing queries, contact: accounts@eljayhearing.com</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-700">
                        {invoice.invoiceType === 'B2C' 
                          ? '* Tax (SGST/CGST) applies only to services and accessories. Hearing aids are tax-exempt as per government regulations.'
                          : '* This invoice covers corporate hearing screening services as per the signed agreement dated 15 Jun 2025.'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border w-full">
                  <div className="px-6 pt-6">
                    <h4 className="text-base md:text-lg">Invoice Summary</h4>
                  </div>
                  <div className="px-6">
                    <div className="space-y-3">
                      <div className="flex justify-between py-1">
                        <span className="text-xs md:text-sm text-gray-600">
                          {invoice.invoiceType === 'B2C' ? 'Subtotal:' : 'Screening Subtotal:'}
                        </span>
                        <span className="text-xs md:text-sm font-medium text-gray-900">₹{invoice.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-xs md:text-sm text-gray-600">Total Discount:</span>
                        <span className="text-xs md:text-sm font-medium text-red-600">-₹{invoice.totalDiscount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-xs md:text-sm text-gray-600">Taxable Amount:</span>
                        <span className="text-xs md:text-sm font-medium text-gray-900">₹{invoice.taxableAmount.toLocaleString()}</span>
                      </div>
                      <div className="bg-border shrink-0 h-px w-full my-2"></div>
                      <div className="flex justify-between py-1">
                        <span className="text-xs md:text-sm text-gray-600">SGST ({invoice.sgstRate}%):</span>
                        <span className="text-xs md:text-sm font-medium text-gray-900">₹{invoice.sgstAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-xs md:text-sm text-gray-600">CGST ({invoice.cgstRate}%):</span>
                        <span className="text-xs md:text-sm font-medium text-gray-900">₹{invoice.cgstAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-xs md:text-sm text-gray-600">Total Tax:</span>
                        <span className="text-xs md:text-sm font-medium text-gray-900">₹{invoice.totalTax.toLocaleString()}</span>
                      </div>
                      <div className="bg-border shrink-0 h-px w-full my-2"></div>
                      <div className="flex justify-between py-2 bg-gray-50 px-3 rounded-lg">
                        <span className="text-sm md:text-base font-semibold text-gray-900">Total Amount:</span>
                        <span className="text-base md:text-lg font-bold text-gray-900">₹{invoice.totalAmount.toLocaleString()}</span>
                      </div>

                      {invoicePayments.length > 0 && (
                        <>
                          <div className="flex justify-between py-1 mt-3">
                            <span className="text-xs md:text-sm text-gray-600">Payment Received:</span>
                            <span className="text-xs md:text-sm font-medium text-green-600">
                              -₹{invoicePayments.reduce((total, payment) => total + payment.amount, 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="bg-border shrink-0 h-px w-full my-2"></div>
                          <div className="flex justify-between py-2 bg-green-50 px-3 rounded-lg">
                            <span className="text-sm md:text-base font-semibold text-green-800">Remaining Balance:</span>
                            <span className="text-base md:text-lg font-bold text-green-800">
                              ₹{Math.max(0, invoice.totalAmount - invoicePayments.reduce((total, payment) => total + payment.amount, 0)).toLocaleString()}
                            </span>
                          </div>
                        </>
                      )}
                      {appliedAdvancePayments && appliedAdvancePayments.length > 0 && (
                        <>
                          <div className="flex justify-between py-1 mt-3">
                            <span className="text-xs md:text-sm text-gray-600">Applied Advance Payments:</span>
                            <span className="text-xs md:text-sm font-medium text-green-600">
                              -₹{appliedAdvancePayments.reduce((total, payment) => total + payment.appliedAmount, 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="bg-border shrink-0 h-px w-full my-2"></div>
                          <div className="flex justify-between py-2 bg-green-50 px-3 rounded-lg">
                            <span className="text-sm md:text-base font-semibold text-green-800">Net Amount Due:</span>
                            <span className="text-base md:text-lg font-bold text-green-800">
                              ₹{(invoice.totalAmount - appliedAdvancePayments.reduce((total, payment) => total + payment.appliedAmount, 0)).toLocaleString()}
                            </span>
                          </div>
                        </>
                      )}
                      {invoice.invoiceType === 'B2C' && (
                        <>
                          <div className="flex justify-between py-1 mt-3">
                            <span className="text-xs md:text-sm text-gray-600">Amount Paid:</span>
                            <span className="text-xs md:text-sm font-medium text-gray-900">
                              ₹{(
                                invoice.paymentStatus === 'Paid' ? invoice.totalAmount : 
                                invoice.paymentStatus === 'Partially Paid' ? Math.floor(invoice.totalAmount * 0.45) : 0
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-xs md:text-sm text-gray-600">Balance Due:</span>
                            <span className="text-xs md:text-sm font-medium text-red-600">
                              ₹{(
                                invoice.paymentStatus === 'Paid' ? 0 : 
                                invoice.paymentStatus === 'Partially Paid' ? Math.floor(invoice.totalAmount * 0.55) :
                                invoice.totalAmount
                              ).toLocaleString()}
                            </span>
                          </div>
                        </>
                      )}
                      {invoice.invoiceType === 'B2B' && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <h5 className="font-medium text-gray-900 mb-2 text-xs md:text-sm">Payment Instructions</h5>
                          <div className="text-xs text-gray-600 space-y-1">
                            <p>Bank: HDFC Bank Ltd.</p>
                            <p>Account: Eljay Hearing Care Pvt Ltd</p>
                            <p>A/C No: 50200012345678</p>
                            <p>IFSC: HDFC0001234</p>
                            <p className="mt-2 font-medium">Please mention invoice number in transfer details</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border w-full">
                <div className="p-4 md:p-6">
                  <div className="text-center text-gray-600 space-y-2">
                    <p className="text-xs md:text-sm">
                      {invoice.invoiceType === 'B2C' 
                        ? 'Thank you for choosing Eljay Hearing Care for your audiology needs.'
                        : 'Thank you for partnering with Eljay Hearing Care for your corporate wellness program.'
                      }
                    </p>
                    <p className="text-xs">This is a computer-generated invoice and does not require a signature.</p>
                    {invoice.invoiceType === 'B2B' && (
                      <p className="text-xs">For corporate services inquiries: corporate@eljayhearing.com | +91 44 1234 5679</p>
                    )}
                    <p className="text-xs">Generated on {formatDate(invoice.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF View */}
        {viewMode === 'pdf' && (
          <Card className="bg-white max-w-4xl mx-auto">
          <CardContent className="p-8">
            {/* PDF content will go here - using same content as invoice view for now */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex flex-col items-start">
                <img src="/pdf-view-logo.png" alt="Eljay Hearing Care" className="w-20 h-auto mb-3" />
                <div>
                  <p className="text-[#4A5565] text-sm" style={{ fontFamily: 'Segoe UI' }}>
                    No 75, DhanaLakshmi Avenue,
                  </p>
                  <p className="text-[#4A5565] text-sm" style={{ fontFamily: 'Segoe UI' }}>
                    Adyar, Chennai - 600020.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={cn(
                  "inline-block px-3 py-1 rounded-full text-sm font-medium mb-2",
                  invoice.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                  invoice.paymentStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                  invoice.paymentStatus === 'Partially Paid' ? 'bg-yellow-100 text-yellow-800' :
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
                  {invoice.invoiceType === 'B2C' ? 'Individual Patient' : 'Corporate Account'}
                </p>
                {invoice.invoiceType === 'B2C' && (
                  <p className="text-[#4A5565] text-sm" style={{ fontFamily: 'Segoe UI' }}>
                    Patient ID: PAT001
                  </p>
                )}
                {invoice.invoiceType === 'B2B' && (
                  <p className="text-[#4A5565] text-sm" style={{ fontFamily: 'Segoe UI' }}>
                    Primary Contact: {invoice.patientName}
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
              <h3 className="text-lg font-semibold text-[#101828] mb-4" style={{ fontFamily: 'Segoe UI' }}>
                {invoice.invoiceType === 'B2C' ? 'Services & Items' : 'Screening Details'}
              </h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    {invoice.invoiceType === 'B2C' ? (
                      <>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Service/Item</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">Qty</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Unit Cost</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Discount</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Total</th>
                      </>
                    ) : (
                      <>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">S.No</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">OP/IP No</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Bio Name</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Diagnostic</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Discount</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Total</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {invoice.invoiceType === 'B2C' ? (
                    invoice.services?.map((service, index) => (
                      <tr key={service.id || index} className="border-b border-gray-100">
                        <td className="py-4 px-4 text-sm text-[#4A5565]">
                          <div>
                            <p className="font-medium text-[#101828]">{service.serviceName}</p>
                            <p className="text-xs text-gray-600">{service.description}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-[#4A5565] text-center">{service.quantity}</td>
                        <td className="py-4 px-4 text-sm text-[#4A5565] text-right">₹{service.unitCost.toLocaleString()}</td>
                        <td className="py-4 px-4 text-sm text-red-600 text-right">
                          {service.discount > 0 ? `-₹${service.discount.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-[#101828] text-right">
                          ₹{(service.total || ((service.quantity * service.unitCost) - service.discount)).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    invoice.screenings?.map((screening, index) => (
                      <tr key={screening.id || index} className="border-b border-gray-100">
                        <td className="py-4 px-4 text-sm text-[#4A5565]">{screening.serialNumber || index + 1}</td>
                        <td className="py-4 px-4 text-sm text-[#4A5565]">{formatDate(screening.screeningDate)}</td>
                        <td className="py-4 px-4 text-sm text-[#4A5565]">{screening.opNumber}</td>
                        <td className="py-4 px-4 text-sm text-[#4A5565]">{screening.bioName}</td>
                        <td className="py-4 px-4 text-sm text-[#4A5565]">{screening.diagnosticName}</td>
                        <td className="py-4 px-4 text-sm text-[#4A5565] text-right">₹{screening.amount.toLocaleString()}</td>
                        <td className="py-4 px-4 text-sm text-red-600 text-right">
                          {screening.discount > 0 ? `-₹${screening.discount.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-[#101828] text-right">₹{(screening.amount - (screening.discount || 0)).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Payment Details Section for PDF View */}
            {invoicePayments.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#101828] mb-4" style={{ fontFamily: 'Segoe UI' }}>
                  Payment Details
                </h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Receipt Number</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Payment Method</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoicePayments.map((payment) => (
                      <tr key={payment.id} className="border-b border-gray-100">
                        <td className="py-4 px-4 text-sm text-[#4A5565]">
                          {payment.receiptNumber}
                        </td>
                        <td className="py-4 px-4 text-sm text-[#4A5565]">
                          {PaymentService.formatDateForDisplay(payment.paymentDate)}
                        </td>
                        <td className="py-4 px-4 text-sm text-[#4A5565]">
                          <span className={cn(
                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                            PatientPaymentService.getMethodColor(payment.method)
                          )}>
                            {payment.method}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-[#101828] text-right">
                          ₹{payment.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-800">
                      Total Payments Received:
                    </span>
                    <span className="text-lg font-bold text-blue-800">
                      ₹{invoicePayments.reduce((total, payment) => total + payment.amount, 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    These payments were recorded for this invoice.
                  </p>
                </div>
              </div>
            )}

            {/* Outstanding Receipts Applied Section */}
            {appliedAdvancePayments && appliedAdvancePayments.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#101828] mb-4" style={{ fontFamily: 'Segoe UI' }}>
                  Outstanding Receipts Applied
                </h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Payment ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Receipt Number</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Payment Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Payment Method</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Applied Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appliedAdvancePayments.map((appliedPayment) => (
                      <tr key={appliedPayment.id} className="border-b border-gray-100">
                        <td className="py-4 px-4 text-sm text-[#4A5565]">
                          #{appliedPayment.id}
                        </td>
                        <td className="py-4 px-4 text-sm text-[#4A5565]">
                          {appliedPayment.receiptNumber}
                        </td>
                        <td className="py-4 px-4 text-sm text-[#4A5565]">
                          {appliedPayment.date}
                        </td>
                        <td className="py-4 px-4 text-sm text-[#4A5565]">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {appliedPayment.paymentMethod}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-[#101828] text-right">
                          ₹{appliedPayment.appliedAmount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-800">
                      Total Advance Payments Applied:
                    </span>
                    <span className="text-lg font-bold text-green-800">
                      ₹{appliedAdvancePayments.reduce((total, payment) => total + payment.appliedAmount, 0).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-2">
                    This amount has been deducted from your total invoice amount.
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Additional Information */}
              <div className="space-y-6">
                <h3 className="font-semibold text-[#101828] mb-4" style={{ fontFamily: 'Segoe UI' }}>
                  Additional Information
                    </h3>

                {invoice.warranty && (
                  <div>
                    <h4 className="font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                      General Warranty Information
                    </h4>
                    <p className="text-sm text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                      {invoice.warranty}
                    </p>
                  </div>
                )}

                {invoice.notes && (
                  <div>
                    <h4 className="font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                      Notes
                    </h4>
                    <p className="text-sm text-[#4A5565]" style={{ fontFamily: 'Segoe UI' }}>
                      {invoice.notes}
                    </p>
                  </div>
                )}

                {invoice.invoiceType === 'B2B' && (
                <div>
                    <h4 className="font-medium text-[#101828] mb-2" style={{ fontFamily: 'Segoe UI' }}>
                      Corporate Terms & Conditions
                    </h4>
                  <ul className="text-sm text-[#4A5565] space-y-1" style={{ fontFamily: 'Segoe UI' }}>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Payment terms: Net 30 days from invoice date.
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          All screenings conducted as per corporate agreement.
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Reports will be provided within 48 hours of screening.
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          Follow-up consultations available on request.
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          For billing queries, contact: accounts@eljayhearing.com.
                        </li>
                  </ul>
                </div>
                )}
              </div>

              {/* Right Column - Invoice Summary */}
              <div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-[#101828] mb-4" style={{ fontFamily: 'Segoe UI' }}>
                    Invoice Summary
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#4A5565]">
                        {invoice.invoiceType === 'B2C' ? 'Subtotal:' : 'Screening Subtotal:'}
                      </span>
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

                    <div className="!border-t pt-3">
                      <div className="flex justify-between">
                        <span className="font-semibold text-[#101828]">Total Amount:</span>
                        <span className="font-semibold text-[#101828]">₹{invoice.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    {invoicePayments.length > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-[#4A5565]">Payment Received:</span>
                          <span className="text-sm font-medium text-green-600">
                            -₹{invoicePayments.reduce((total, payment) => total + payment.amount, 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="!border-t pt-3">
                          <div className="flex justify-between">
                            <span className="font-semibold text-green-800">Remaining Balance:</span>
                            <span className="font-semibold text-green-800">
                              ₹{Math.max(0, invoice.totalAmount - invoicePayments.reduce((total, payment) => total + payment.amount, 0)).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {invoice.invoiceType === 'B2C' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-[#4A5565]">Amount Paid:</span>
                          <span className="text-sm font-medium">
                            ₹{(
                              invoice.paymentStatus === 'Paid' ? invoice.totalAmount : 
                              invoice.paymentStatus === 'Partially Paid' ? Math.floor(invoice.totalAmount * 0.45) : 0
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-[#4A5565]">Balance Due:</span>
                          <span className="text-sm font-medium text-red-600">
                            ₹{(
                              invoice.paymentStatus === 'Paid' ? 0 : 
                              invoice.paymentStatus === 'Partially Paid' ? Math.floor(invoice.totalAmount * 0.55) :
                              invoice.totalAmount
                            ).toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}

                    {invoice.invoiceType === 'B2B' && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-2 text-sm">Payment Instructions</h5>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>Bank: HDFC Bank Ltd.</p>
                          <p>Account: Eljay Hearing Care Pvt Ltd</p>
                          <p>A/C No: 50200012345678</p>
                          <p>IFSC: HDFC0001234</p>
                          <p className="mt-2 font-medium">Please mention invoice number in transfer details</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Footer */}
  
      </div>
    </MainLayout>
  );
}

