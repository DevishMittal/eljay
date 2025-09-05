/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils';
import InvoiceService from '@/services/invoiceService';
import { Invoice, UpdateInvoiceData, InvoiceScreening } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [invoiceDate, setInvoiceDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'Pending' | 'Paid' | 'Cancelled'>('Pending');
  const [sgstRate, setSgstRate] = useState(9);
  const [cgstRate, setCgstRate] = useState(9);
  const [screenings, setScreenings] = useState<InvoiceScreening[]>([]);

  const fetchInvoice = useCallback(async () => {
    if (!token) {
      setError('Authentication token not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await InvoiceService.getInvoice(resolvedParams.id);
      const invoiceData = response.data;
      setInvoice(invoiceData);
      
      // Set form state
      setInvoiceDate(invoiceData.invoiceDate);
      setPaymentStatus(invoiceData.paymentStatus);
      setSgstRate(invoiceData.sgstRate);
      setCgstRate(invoiceData.cgstRate);
      setScreenings(invoiceData.screenings);
      
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

  const addScreening = () => {
    const newScreening: InvoiceScreening = {
      screeningDate: '',
      opNumber: '',
      bioName: '',
      diagnosticName: '',
      amount: 0,
      discount: 0
    };
    setScreenings([...screenings, newScreening]);
  };

  const removeScreening = (index: number) => {
    const updatedScreenings = screenings.filter((_, i) => i !== index);
    setScreenings(updatedScreenings);
  };

  const updateScreening = (index: number, field: keyof InvoiceScreening, value: any) => {
    const updatedScreenings = [...screenings];
    updatedScreenings[index] = { ...updatedScreenings[index], [field]: value };
    setScreenings(updatedScreenings);
  };

  const calculateSubtotal = () => {
    return screenings.reduce((sum, screening) => sum + screening.amount, 0);
  };

  const calculateTotalDiscount = () => {
    return screenings.reduce((sum, screening) => sum + (screening.discount || 0), 0);
  };

  const calculateTaxableAmount = () => {
    return calculateSubtotal() - calculateTotalDiscount();
  };

  const calculateTax = () => {
    const taxableAmount = calculateTaxableAmount();
    const sgst = (taxableAmount * sgstRate) / 100;
    const cgst = (taxableAmount * cgstRate) / 100;
    return { sgst, cgst, total: sgst + cgst };
  };

  const calculateFinalAmount = () => {
    const tax = calculateTax();
    return calculateTaxableAmount() + tax.total;
  };

  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading authentication...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleSave = async () => {
    if (!token) {
      alert('Authentication token not found. Please login again.');
      router.push('/login');
      return;
    }

    if (!invoice) return;

    try {
      setSaving(true);
      
      const updateData: UpdateInvoiceData = {
        invoiceDate: InvoiceService.formatDateForAPI(invoiceDate),
        paymentStatus,
        sgstRate,
        cgstRate,
        screenings: screenings.map(screening => ({
          ...screening,
          screeningDate: InvoiceService.formatDateForAPI(screening.screeningDate)
        }))
      };

      await InvoiceService.updateInvoice(resolvedParams.id, updateData);
      console.log('Invoice updated successfully');
      
      // Navigate back to invoice detail page
      window.location.href = `/billing/invoices/${resolvedParams.id}`;
    } catch (error: any) {
      console.error('Error updating invoice:', error);
      setError(error.message || 'Failed to update invoice. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    window.location.href = `/billing/invoices/${resolvedParams.id}`;
  };

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
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
              Edit Invoice {invoice.invoiceNumber}
            </h1>
            <p className="text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
              Edit invoice details and items.
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="border-gray-300" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white" 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                {error.includes('token') || error.includes('authentication') ? (
                  <div className="mt-3">
                    <Button 
                      onClick={() => router.push('/login')} 
                      className="bg-red-600 hover:bg-red-700 text-white text-sm"
                    >
                      Go to Login
                    </Button>
                  </div>
                ) : (
                  <div className="mt-3">
                    <Button 
                      onClick={() => setError(null)} 
                      className="bg-red-600 hover:bg-red-700 text-white text-sm"
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Information */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-[#101828] mb-4" style={{ fontFamily: 'Segoe UI' }}>
                  Invoice Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice Number
                    </label>
                    <Input
                      value={invoice.invoiceNumber}
                      className="bg-gray-50 border-gray-300"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice Date*
                    </label>
                    <Input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <Input
                      value={invoice.invoiceType}
                      className="bg-gray-50 border-gray-300"
                      readOnly
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Screening Details */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    Screening Details
                  </h2>
                  <Button 
                    onClick={addScreening}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    + Add Screening
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">S.No</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date of Screening*</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">OP/IP No*</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Bio Name*</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Diagnostic Name*</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Amount*</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Discount</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {screenings.map((screening, index) => (
                        <tr key={screening.id || index} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-sm text-gray-900">{screening.serialNumber || index + 1}</td>
                          <td className="py-3 px-4">
                            <Input
                              type="date"
                              value={screening.screeningDate}
                              onChange={(e) => updateScreening(index, 'screeningDate', e.target.value)}
                              className="w-32 bg-white border-gray-300"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              value={screening.opNumber}
                              onChange={(e) => updateScreening(index, 'opNumber', e.target.value)}
                              placeholder="OP/IP Number"
                              className="w-24 bg-white border-gray-300"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              value={screening.bioName}
                              onChange={(e) => updateScreening(index, 'bioName', e.target.value)}
                              placeholder="Patient Name"
                              className="w-32 bg-white border-gray-300"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              value={screening.diagnosticName}
                              onChange={(e) => updateScreening(index, 'diagnosticName', e.target.value)}
                              placeholder="Diagnostic Name"
                              className="w-48 bg-white border-gray-300"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              type="number"
                              value={screening.amount}
                              onChange={(e) => updateScreening(index, 'amount', parseInt(e.target.value) || 0)}
                              className="w-20 bg-white border-gray-300"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              type="number"
                              value={screening.discount || 0}
                              onChange={(e) => updateScreening(index, 'discount', parseInt(e.target.value) || 0)}
                              className="w-20 bg-white border-gray-300"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => removeScreening(index)}
                              className="text-red-500 hover:text-red-700"
                              aria-label={`Remove screening ${index + 1}`}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Settings */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-[#101828] mb-4" style={{ fontFamily: 'Segoe UI' }}>
                  Invoice Settings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Status
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as 'Pending' | 'Paid' | 'Cancelled')}
                      
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                      aria-label="Select payment status"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SGST Rate (%)
                    </label>
                    <Input
                      type="number"
                      value={sgstRate}
                      onChange={(e) => setSgstRate(parseInt(e.target.value) || 0)}
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CGST Rate (%)
                    </label>
                    <Input
                      type="number"
                      value={cgstRate}
                      onChange={(e) => setCgstRate(parseInt(e.target.value) || 0)}
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-white sticky top-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-[#101828] mb-4" style={{ fontFamily: 'Segoe UI' }}>
                  Invoice Summary
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{calculateSubtotal().toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Discount:</span>
                    <span className="font-medium text-red-600">-₹{calculateTotalDiscount().toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxable Amount:</span>
                    <span className="font-medium">₹{calculateTaxableAmount().toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">SGST ({sgstRate}%):</span>
                    <span className="font-medium">₹{calculateTax().sgst.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">CGST ({cgstRate}%):</span>
                    <span className="font-medium">₹{calculateTax().cgst.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Tax:</span>
                    <span className="font-medium">₹{calculateTax().total.toLocaleString()}</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Final Amount:</span>
                      <span>₹{calculateFinalAmount().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    *Tax (SGST/CGST) applies only to services and accessories. Hearing aids are tax-exempt.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
