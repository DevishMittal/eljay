
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DatePicker from '@/components/ui/date-picker';
import { CustomDropdown } from '@/components/ui/custom-dropdown';
import ExpenseService from '@/services/expenseService';
import { Expense, UpdateExpenseData } from '@/types';

export default function EditExpensePage() {
  const params = useParams();
  const expenseId = params.id as string;

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [expenseDate, setExpenseDate] = useState<string>('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [vendor, setVendor] = useState('');
  const [remarks, setRemarks] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [taxAmount, setTaxAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [approvedBy, setApprovedBy] = useState('');

  const fetchExpense = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ExpenseService.getExpense(expenseId);
      const expenseData = response.data;
      setExpense(expenseData);
      
      // Set form values
      setExpenseDate(expenseData.date.split('T')[0]); // Convert ISO date to YYYY-MM-DD string
      setCategory(expenseData.category);
      setDescription(expenseData.description);
      setVendor(expenseData.vendor);
      setRemarks(expenseData.remarks || '');
      setExpenseAmount(expenseData.amount.toString());
      setTaxAmount(expenseData.taxAmount.toString());
      setPaymentMethod(expenseData.paymentMethod);
      setApprovedBy(expenseData.approvedBy || '');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to fetch expense details');
      console.error('Error fetching expense:', error);
    } finally {
      setLoading(false);
    }
  }, [expenseId]);

  useEffect(() => {
    if (expenseId) {
      fetchExpense();
    }
  }, [expenseId, fetchExpense]);

  const handleBack = () => {
    window.location.href = `/billing/expenses/${expenseId}`;
  };

  const handleSaveChanges = async () => {
    if (!expenseDate || !category || !description || !expenseAmount || !vendor) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updateData: UpdateExpenseData = {
        date: expenseDate, // DatePicker already returns YYYY-MM-DD string format
        category,
        description,
        amount: parseFloat(expenseAmount),
        taxAmount: parseFloat(taxAmount),
        paymentMethod: paymentMethod as 'Cash' | 'Card' | 'Credit Card' | 'Cheque' | 'Bank Transfer',
        vendor,
        approvedBy: approvedBy || undefined,
        remarks: remarks || undefined
      };

      await ExpenseService.updateExpense(expenseId, updateData);
      
      // Navigate back to expense detail page
      window.location.href = `/billing/expenses/${expenseId}`;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to update expense');
      console.error('Error updating expense:', error);
    } finally {
      setSaving(false);
    }
  };

  const calculateTotal = (expense: string, tax: string) => {
    return parseFloat(expense || '0') + parseFloat(tax || '0');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 space-y-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !expense) {
    return (
      <MainLayout>
        <div className="p-6 space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-medium text-red-800">Error Loading Expense</h3>
                <p className="text-red-600">{error || 'Expense not found'}</p>
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={handleBack} className="bg-red-600 hover:bg-red-700">
                Go Back
              </Button>
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
            <h1 className="text-2xl font-semibold text-gray-900" style={{ fontFamily: 'Segoe UI' }}>
              Edit Expense
            </h1>
            <p className="text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
              {expense.expenseNumber}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handleBack}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-red-800 font-medium">Error</h4>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expense Number
                    </label>
                    <Input
                      value={expense.expenseNumber}
                      className="bg-gray-50 border-gray-300"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <DatePicker
                      value={expenseDate}
                      onChange={setExpenseDate}
                      placeholder="dd - mm - yyyy"
                      className="w-full"
                      required
                      aria-label="Select expense date"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <CustomDropdown
                      options={ExpenseService.getExpenseCategories().map(cat => ({
                        value: cat,
                        label: cat
                      }))}
                      value={category}
                      onChange={setCategory}
                      placeholder="Select category"
                      aria-label="Select category"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method *
                    </label>
                    <CustomDropdown
                      options={ExpenseService.getPaymentMethods().map(method => ({
                        value: method,
                        label: method
                      }))}
                      value={paymentMethod}
                      onChange={setPaymentMethod}
                      placeholder="Select payment method"
                      aria-label="Select payment method"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description & Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detailed description of the expense"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 h-24 resize-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor *
                    </label>
                    <Input
                      value={vendor}
                      onChange={(e) => setVendor(e.target.value)}
                      placeholder="Enter vendor name"
                      className="bg-white border-gray-300"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expense Amount *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                      <Input
                        type="number"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        className="pl-8 bg-white border-gray-300"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                      <Input
                        type="number"
                        value={taxAmount}
                        onChange={(e) => setTaxAmount(e.target.value)}
                        className="pl-8 bg-white border-gray-300"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approved By
                    </label>
                    <Input
                      value={approvedBy}
                      onChange={(e) => setApprovedBy(e.target.value)}
                      placeholder="Enter approver name"
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remarks
                    </label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Additional notes or comments"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 h-24 resize-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expense Number:</span>
                    <span className="text-gray-900">{expense.expenseNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="text-gray-900">{expenseDate ? new Date(expenseDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    }) : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="text-gray-900">{category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vendor:</span>
                    <span className="text-gray-900">{vendor}</span>
                  </div>
                  {approvedBy && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Approved By:</span>
                      <span className="text-gray-900">{approvedBy}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expense Amount:</span>
                    <span className="text-gray-900">₹{parseFloat(expenseAmount || '0').toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax Amount:</span>
                    <span className="text-gray-900">₹{parseFloat(taxAmount || '0').toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                      <span className="text-lg font-semibold text-gray-900">
                        ₹{calculateTotal(expenseAmount, taxAmount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
