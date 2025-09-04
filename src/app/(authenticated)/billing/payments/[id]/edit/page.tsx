'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PaymentService from '@/services/paymentService';
import { useAuth } from '@/contexts/AuthContext';
import { Payment } from '@/types';

export default function EditPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { token, isAuthenticated, authLoading } = useAuth();
  const resolvedParams = use(params);
  
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [paymentDate, setPaymentDate] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [status, setStatus] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [receivedBy, setReceivedBy] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [notes, setNotes] = useState('');

  const fetchPayment = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await PaymentService.getPayment(resolvedParams.id);
      const paymentData = response.data;
      setPayment(paymentData);
      
      // Set form values
      setPaymentDate(PaymentService.formatDateForAPI(paymentData.paymentDate));
      setAmount(paymentData.amount.toString());
      setMethod(paymentData.method);
      setStatus(paymentData.status);
      setTransactionId(paymentData.transactionId);
      setReceivedBy(paymentData.receivedBy);
      setPaymentType(paymentData.paymentType);
      setNotes(paymentData.notes || '');
    } catch (err) {
      console.error('Error fetching payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payment');
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
    fetchPayment();
  }, [authLoading, isAuthenticated, router, fetchPayment]);

  const handleSaveChanges = useCallback(async () => {
    if (!token || !payment) return;

    // Validation
    if (!paymentDate || !amount || !method || !status || !receivedBy) {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const updateData = {
        paymentDate: PaymentService.formatDateForAPI(paymentDate),
        amount: parseFloat(amount),
        method: method as 'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Cheque',
        status: status as 'Pending' | 'Completed' | 'Failed' | 'Cancelled',
        transactionId,
        receivedBy,
        paymentType: paymentType as 'Full' | 'Partial',
        notes: notes || undefined
      };

      await PaymentService.updatePayment(resolvedParams.id, updateData);
      
      // Navigate back to payment detail page
      router.push(`/billing/payments/${resolvedParams.id}`);
    } catch (err) {
      console.error('Error updating payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to update payment');
    } finally {
      setSaving(false);
    }
  }, [token, payment, paymentDate, amount, method, status, transactionId, receivedBy, paymentType, notes, router, resolvedParams.id]);

  const handleCancel = () => {
    router.push(`/billing/payments/${resolvedParams.id}`);
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Error state
  if (error && !payment) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-lg text-red-600 mb-4">{error}</div>
              <Button onClick={fetchPayment} className="bg-red-600 hover:bg-red-700">
                Retry
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // No payment data
  if (!payment) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">Payment not found</div>
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
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-800"
              aria-label="Go back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                Edit Payment
              </h1>
              <p className="text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
                Receipt #{payment.receiptNumber}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Payment Details Section */}
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                  Payment Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Read-only fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receipt Number
                  </label>
                  <Input
                    value={payment.receiptNumber}
                    className="bg-gray-50 border-gray-300"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Name
                  </label>
                  <Input
                    value={payment.patientName}
                    className="bg-gray-50 border-gray-300"
                    readOnly
                  />
                </div>

                {/* Editable fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Date *
                  </label>
                  <Input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="bg-white border-gray-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-8 bg-white border-gray-300"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    aria-label="Select payment method"
                    required
                  >
                    <option value="">Select payment method</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Status *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    aria-label="Select payment status"
                    required
                  >
                    <option value="">Select payment status</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Failed">Failed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID
                  </label>
                  <Input
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID (optional)"
                    className="bg-white border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Received By *
                  </label>
                  <Input
                    value={receivedBy}
                    onChange={(e) => setReceivedBy(e.target.value)}
                    placeholder="Enter staff name"
                    className="bg-white border-gray-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Type *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentType"
                        value="Full"
                        checked={paymentType === 'Full'}
                        onChange={(e) => setPaymentType(e.target.value)}
                        className="mr-2 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">Full</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentType"
                        value="Partial"
                        checked={paymentType === 'Partial'}
                        onChange={(e) => setPaymentType(e.target.value)}
                        className="mr-2 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">Partial</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes about this payment..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 h-24 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary Section */}
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                  Payment Summary
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">Payment Amount:</span>
                    <span className="text-lg font-semibold text-gray-900">₹{parseFloat(amount) || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Payment:</span>
                    <span className="text-lg font-semibold text-green-600">₹{parseFloat(amount) || 0}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Updated Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Receipt Number:</span>
                      <span className="text-gray-900">{payment.receiptNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Patient Name:</span>
                      <span className="text-gray-900">{payment.patientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="text-gray-900">{paymentDate || 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method:</span>
                      <span className="text-gray-900">{method || 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="text-gray-900">{status || 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Received By:</span>
                      <span className="text-gray-900">{receivedBy || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="text-gray-900">{paymentType || 'Not selected'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
