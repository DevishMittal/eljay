'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Sample payment data - in real app this would come from API
const initialPaymentData = {
  id: 'RCP-2025-008',
  receiptNumber: 'RCP-2025-008',
  amount: '6750',
  paymentMethod: 'UPI',
  paymentDate: '2025-06-22',
  status: 'Completed',
  transactionId: 'UPI345678901',
  patient: {
    name: 'Lisa Wang',
    id: 'PAT008'
  },
  receivedBy: 'Dr. Sarah Johnson',
  createdDate: '22 Jun 2025, 00:00',
  currency: 'INR',
  notes: 'Corporate payment for employee hearing screening',
  paymentType: 'Full Payment'
};

export default function EditPaymentPage() {
  const params = useParams();
  const paymentId = params.id;

  const [paymentData, setPaymentData] = useState(initialPaymentData);
  const [patientName, setPatientName] = useState(paymentData.patient.name);
  const [paymentAmount, setPaymentAmount] = useState(paymentData.amount);
  const [paymentMethod, setPaymentMethod] = useState(paymentData.paymentMethod);
  const [paymentDate, setPaymentDate] = useState(paymentData.paymentDate);
  const [transactionId, setTransactionId] = useState(paymentData.transactionId);
  const [receivedBy, setReceivedBy] = useState(paymentData.receivedBy);
  const [notes, setNotes] = useState(paymentData.notes);
  const [paymentType, setPaymentType] = useState(paymentData.paymentType);

  const handleBack = () => {
    window.location.href = `/billing/payments/${paymentId}`;
  };

  const handleSaveChanges = () => {
    // Handle save changes logic here
    console.log('Saving payment changes:', {
      paymentId,
      patientName,
      paymentAmount,
      paymentMethod,
      paymentDate,
      transactionId,
      receivedBy,
      notes,
      paymentType
    });
    // Navigate back to payment detail page
    window.location.href = `/billing/payments/${paymentId}`;
  };

  const handleCancel = () => {
    window.location.href = `/billing/payments/${paymentId}`;
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBack}
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
                Receipt #{paymentData.receiptNumber}
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
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Changes
            </Button>
          </div>
        </div>

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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receipt Number *
                  </label>
                  <Input
                    value={paymentData.receiptNumber}
                    className="bg-gray-50 border-gray-300"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Date *
                  </label>
                  <Input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="bg-white border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Name *
                  </label>
                  <Input
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="bg-white border-gray-300"
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
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="pl-8 bg-white border-gray-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    aria-label="Select payment method"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID
                  </label>
                  <Input
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
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
                    className="bg-white border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Type
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentType"
                        value="Full Payment"
                        checked={paymentType === 'Full Payment'}
                        onChange={(e) => setPaymentType(e.target.value)}
                        className="mr-2 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">Full Payment</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentType"
                        value="Partial Payment"
                        checked={paymentType === 'Partial Payment'}
                        onChange={(e) => setPaymentType(e.target.value)}
                        className="mr-2 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">Partial Payment</span>
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
                <h2 className="text-lg font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                  Payment Summary
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">Payment Amount:</span>
                    <span className="text-lg font-semibold text-gray-900">₹{parseFloat(paymentAmount) || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Payment:</span>
                    <span className="text-lg font-semibold text-green-600">₹{parseFloat(paymentAmount) || 0}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Updated Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Receipt Number:</span>
                      <span className="text-gray-900">{paymentData.receiptNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="text-gray-900">{paymentDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method:</span>
                      <span className="text-gray-900">{paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Received By:</span>
                      <span className="text-gray-900">{receivedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="text-gray-900">{paymentType}</span>
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
