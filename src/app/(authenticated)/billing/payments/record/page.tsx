'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DatePicker from '@/components/ui/date-picker';
import CustomDropdown from '@/components/ui/custom-dropdown';
import RupeeIcon from '@/components/ui/rupee-icon';
import PaymentService from '@/services/paymentService';
import { patientService } from '@/services/patientService';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';

export default function RecordPaymentPage() {
  const router = useRouter();
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  
  const [paymentDate, setPaymentDate] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientId, setPatientId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [status, setStatus] = useState('Completed');
  const [transactionId, setTransactionId] = useState('');
  const [receivedBy, setReceivedBy] = useState('');
  const [paymentType, setPaymentType] = useState('Advance');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoadingUsers(true);
      const response = await patientService.getUsers(1, 100, token);
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, [token]);

  useEffect(() => {
    if (token && isAuthenticated) {
      fetchUsers();
    }
  }, [token, isAuthenticated, fetchUsers]);

  const handleSavePayment = useCallback(async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    // Validation
    if (!paymentDate || !patientId || !amount || !method || !receivedBy) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate transaction ID for specific payment methods
    const requiresTransactionId = ['Cheque', 'Bank Transfer', 'Card'].includes(method);
    if (requiresTransactionId && !transactionId) {
      const fieldName = method === 'Cheque' ? 'Cheque Number' : 
                       method === 'Card' ? 'Card Last 4 Digits' : 'Transaction ID';
      setError(`${fieldName} is required for ${method} payments`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const paymentData = {
        paymentDate: PaymentService.formatDateForAPI(paymentDate),
        patientName,
        patientId,
        amount: parseFloat(amount),
        method: method as 'Cash' | 'Card' | 'UPI' | 'Bank Transfer' | 'Cheque',
        status: status as 'Pending' | 'Completed' | 'Failed' | 'Cancelled',
        transactionId: transactionId || undefined,
        receivedBy: receivedBy || undefined,
        paymentType: paymentType as 'Full' | 'Advance',
        description: description || undefined,
        notes: notes || undefined
      };

      const response = await PaymentService.createPayment(paymentData);
      
      // Navigate to the new payment detail page using the ID from response
      router.push(`/billing/payments/${response.data.id}`);
    } catch (err) {
      console.error('Error creating payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  }, [token, paymentDate, patientName, patientId, amount, method, status, transactionId, receivedBy, paymentType, description, notes, router]);

  const handleUserChange = (selectedUserId: string) => {
    setPatientId(selectedUserId);
    const selectedUser = users.find(u => u.id === selectedUserId);
    if (selectedUser) {
      setPatientName(selectedUser.fullname || '');
    }
  };

  const handleCancel = () => {
    router.push('/billing/payments');
  };

  // Redirect if not authenticated
  if (authLoading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-md">Loading...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
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
                Record Payment
              </h1>
              <p className="text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
                Create a new payment record
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="text-sm border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </Button>
            <Button
              onClick={handleSavePayment}
              disabled={loading}
              className="text-sm bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
            >
            
              {loading ? 'Creating...' : 'Save Payment'}
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
                  <RupeeIcon className="w-4 h-4 text-orange-600" />
                </div>
                <h2 className="text-md font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                  Payment Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Date *
                  </label>
                  <DatePicker
                    value={paymentDate}
                    onChange={setPaymentDate}
                    placeholder="Select payment date"
                    className="w-full"
                    required
                    aria-label="Payment date"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Patient (B2C Only) *
                  </label>
                  <CustomDropdown
                    options={[
                      { value: '', label: 'Select a patient' },
                      ...users
                        .filter(user => user.customerType === 'B2C')
                        .map(user => ({
                          value: user.id,
                          label: `${user.fullname} (${user.phoneNumber})`
                        }))
                    ]}
                    value={patientId}
                    onChange={handleUserChange}
                    placeholder="Select a B2C patient"
                    className="w-full"
                    aria-label="Select patient"
                    disabled={loadingUsers}
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
                      value={amount || ''}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-8 bg-white border-gray-300"
                      placeholder="0.00"
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
                  <CustomDropdown
                    options={[
                      { value: '', label: 'Select payment method' },
                      { value: 'Cash', label: 'Cash' },
                      { value: 'Card', label: 'Card' },
                      { value: 'UPI', label: 'UPI' },
                      { value: 'Bank Transfer', label: 'Bank Transfer' },
                      { value: 'Cheque', label: 'Cheque' }
                    ]}
                    value={method}
                    onChange={setMethod}
                    placeholder="Select payment method"
                    className="w-full"
                    aria-label="Select payment method"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Status *
                  </label>
                  <CustomDropdown
                    options={[
                      { value: 'Pending', label: 'Pending' },
                      { value: 'Completed', label: 'Completed' },
                      { value: 'Failed', label: 'Failed' },
                      { value: 'Cancelled', label: 'Cancelled' }
                    ]}
                    value={status}
                    onChange={setStatus}
                    placeholder="Select payment status"
                    className="w-full"
                    aria-label="Select payment status"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {method === 'Cheque' ? 'Cheque Number' : 
                     method === 'Card' ? 'Card Last 4 Digits' : 'Transaction ID'}
                    {['Cheque', 'Bank Transfer', 'Card'].includes(method) ? ' *' : ''}
                  </label>
                  <Input
                    value={transactionId || ''}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder={
                      method === 'Cheque' ? 'Enter cheque number' :
                      method === 'Card' ? 'Enter last 4 digits of card' :
                      method === 'Bank Transfer' ? 'Enter transaction ID' :
                      'Enter transaction ID (optional)'
                    }
                    className="bg-white border-gray-300"
                    required={['Cheque', 'Bank Transfer', 'Card'].includes(method)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Received By *
                  </label>
                  <Input
                    value={receivedBy || ''}
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
                        value="Advance"
                        checked={paymentType === 'Advance'}
                        onChange={(e) => setPaymentType(e.target.value)}
                        className="mr-2 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">Advance Payment</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Only advance payments are available for B2C customers
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Input
                  value={description || ''}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter payment description"
                  className="bg-white border-gray-300 mb-4"
                />
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <h2 className="text-md font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                  Payment Summary
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">Payment Amount:</span>
                    <span className="text-md font-semibold text-gray-900">₹{parseFloat(amount) || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Payment:</span>
                    <span className="text-md font-semibold text-green-600">₹{parseFloat(amount) || 0}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Detailed Summary</h3>
                  <div className="space-y-2 text-sm">
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
                      <span className="text-gray-900">{status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Received By:</span>
                      <span className="text-gray-900">{receivedBy || 'Not specified'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="text-gray-900">{paymentType === 'Full' ? 'Full Payment' : 'Advance Payment'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Description:</span>
                      <span className="text-gray-900">{description || 'Not specified'}</span>
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
