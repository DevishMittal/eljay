'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils';

// Sample data for expenses
const expenseData = [
  {
    id: 1,
    date: '22 Jun 2025',
    expenseNumber: 'EXP-2025-014',
    category: 'Equipment',
    description: 'Hearing Aid Testing Equipment',
    amount: '₹15,000',
    status: 'Approved',
    createdBy: 'Dr. Michael Chen'
  },
  {
    id: 2,
    date: '21 Jun 2025',
    expenseNumber: 'EXP-2025-013',
    category: 'Office Supplies',
    description: 'Office Stationery and Supplies',
    amount: '₹5,000',
    status: 'Pending',
    createdBy: 'Dr. Sarah Johnson'
  },
  {
    id: 3,
    date: '20 Jun 2025',
    expenseNumber: 'EXP-2025-012',
    category: 'Marketing',
    description: 'Digital Marketing Campaign',
    amount: '₹25,000',
    status: 'Approved',
    createdBy: 'Dr. Emily Davis'
  }
];

const summaryCards = [
  {
    title: 'Total Expenses',
    value: '₹1,25,000',
    icon: '💸',
    color: 'text-red-600'
  },
  {
    title: 'Pending Approval',
    value: '₹15,000',
    icon: '⏳',
    color: 'text-yellow-600'
  },
  {
    title: 'Approved Expenses',
    value: '12',
    icon: '✅',
    color: 'text-green-600'
  },
  {
    title: 'Rejected Expenses',
    value: '1',
    icon: '❌',
    color: 'text-red-600'
  }
];

export default function ExpensesPage() {
  const [selectedExpenses, setSelectedExpenses] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelectAll = () => {
    if (selectedExpenses.length === expenseData.length) {
      setSelectedExpenses([]);
    } else {
      setSelectedExpenses(expenseData.map(expense => expense.id));
    }
  };

  const handleSelectExpense = (id: number) => {
    setSelectedExpenses(prev => 
      prev.includes(id) 
        ? prev.filter(expenseId => expenseId !== id)
        : [...prev, id]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Equipment':
        return 'bg-blue-100 text-blue-800';
      case 'Office Supplies':
        return 'bg-green-100 text-green-800';
      case 'Marketing':
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
              Expenses
            </h1>
            <p className="text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
              Track and manage business expenses.
            </p>
          </div>
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            + New Expense
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
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

        {/* Expense List Section */}
        <Card className="bg-white">
          <CardContent className="p-6">
            {/* Section Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                  Expenses
                </h2>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                  {expenseData.length}
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
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-[#F9FAFB] border-[#E5E7EB] placeholder-[#717182]"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="bg-white border-gray-300 text-gray-700">
                  All Categories
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

            {/* Expense Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedExpenses.length === expenseData.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                        aria-label="Select all expenses"
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Expense #</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Created By</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseData.map((expense) => (
                    <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedExpenses.includes(expense.id)}
                          onChange={() => handleSelectExpense(expense.id)}
                          className="rounded border-gray-300"
                          aria-label={`Select expense ${expense.expenseNumber}`}
                        />
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{expense.date}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{expense.expenseNumber}</td>
                      <td className="py-3 px-4">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getCategoryColor(expense.category))}>
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{expense.description}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{expense.amount}</td>
                      <td className="py-3 px-4">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(expense.status))}>
                          {expense.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{expense.createdBy}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button 
                            className="text-gray-400 hover:text-gray-600"
                            aria-label={`View expense ${expense.expenseNumber}`}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button 
                            className="text-gray-400 hover:text-gray-600"
                            aria-label={`Edit expense ${expense.expenseNumber}`}
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
                Showing 1 to {expenseData.length} of {expenseData.length} expenses.
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select 
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                  aria-label="Number of expenses to display per page"
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
