'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils';

// Sample data for expenses matching the image
const expenseData = [
  {
    id: 1,
    date: '12 Jun 2025',
    expenseNumber: 'EXP-2025-010',
    category: 'Travel',
    description: 'Travel expenses for medical... Flights, hotel, and meals for ...',
    amount: '₹22,000',
    tax: '₹3,960',
    paymentMethod: 'Cash',
    vendor: 'Various Vendors'
  },
  {
    id: 2,
    date: '10 Jun 2025',
    expenseNumber: 'EXP-2025-009',
    category: 'Marketing',
    description: 'Website maintenance and ... Annual hosting renewal and',
    amount: '₹15,000',
    tax: '₹2,700',
    paymentMethod: 'Card',
    vendor: 'TechSolutions ...'
  },
  {
    id: 3,
    date: '08 Jun 2025',
    expenseNumber: 'EXP-2025-008',
    category: 'Supplies',
    description: 'Hearing aid batteries bulk ... Mixed sizes - 312, 13, 675 zi...',
    amount: '₹12,000',
    tax: '₹2,160',
    paymentMethod: 'Cheque',
    vendor: 'Battery World ...'
  },
  {
    id: 4,
    date: '05 Jun 2025',
    expenseNumber: 'EXP-2025-007',
    category: 'Equipment',
    description: 'New audiometer purchase ... Professional grade diagnostic',
    amount: '₹45,000',
    tax: '₹8,100',
    paymentMethod: 'Card',
    vendor: 'Medical Equipment Co.'
  },
  {
    id: 5,
    date: '03 Jun 2025',
    expenseNumber: 'EXP-2025-006',
    category: 'Office',
    description: 'Office supplies and stationery ... Paper, pens, folders, and',
    amount: '₹8,500',
    tax: '₹1,530',
    paymentMethod: 'Cash',
    vendor: 'Office Supplies Ltd.'
  },
  {
    id: 6,
    date: '01 Jun 2025',
    expenseNumber: 'EXP-2025-005',
    category: 'Utilities',
    description: 'Electricity and water bills ... Monthly utility payments for',
    amount: '₹18,000',
    tax: '₹3,240',
    paymentMethod: 'Bank Transfer',
    vendor: 'City Utilities Board'
  },
  {
    id: 7,
    date: '30 May 2025',
    expenseNumber: 'EXP-2025-004',
    category: 'Insurance',
    description: 'Professional liability insurance ... Annual premium payment',
    amount: '₹25,000',
    tax: '₹4,500',
    paymentMethod: 'Card',
    vendor: 'Healthcare Insurance Co.'
  },
  {
    id: 8,
    date: '28 May 2025',
    expenseNumber: 'EXP-2025-003',
    category: 'Training',
    description: 'Staff training and certification ... Professional development',
    amount: '₹35,000',
    tax: '₹6,300',
    paymentMethod: 'Cheque',
    vendor: 'Training Institute'
  },
  {
    id: 9,
    date: '25 May 2025',
    expenseNumber: 'EXP-2025-002',
    category: 'Maintenance',
    description: 'Equipment maintenance and repair ... Regular service and',
    amount: '₹12,500',
    tax: '₹2,250',
    paymentMethod: 'Cash',
    vendor: 'Service Center'
  },
  {
    id: 10,
    date: '22 May 2025',
    expenseNumber: 'EXP-2025-001',
    category: 'Software',
    description: 'Practice management software ... Annual license renewal',
    amount: '₹40,000',
    tax: '₹7,200',
    paymentMethod: 'Card',
    vendor: 'Software Solutions Inc.'
  }
];

const summaryCards = [
  {
    title: 'Total Expenses',
    value: '₹2,49,000',
    icon: (
      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      </div>
    ),
    color: 'text-red-600'
  },
  {
    title: 'Cash Expenses',
    value: '₹NaN',
    icon: (
      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
        <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      </div>
    ),
    color: 'text-yellow-600'
  },
  {
    title: 'Categories',
    value: '1',
    icon: (
      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
    ),
    color: 'text-blue-600'
  },
  {
    title: 'Average Expense',
    value: '₹24,900',
    icon: (
      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      </div>
    ),
    color: 'text-purple-600'
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Travel':
        return 'bg-purple-100 text-purple-800';
      case 'Marketing':
        return 'bg-blue-100 text-blue-800';
      case 'Supplies':
        return 'bg-blue-100 text-blue-800';
      case 'Equipment':
        return 'bg-green-100 text-green-800';
      case 'Office':
        return 'bg-orange-100 text-orange-800';
      case 'Utilities':
        return 'bg-red-100 text-red-800';
      case 'Insurance':
        return 'bg-indigo-100 text-indigo-800';
      case 'Training':
        return 'bg-pink-100 text-pink-800';
      case 'Maintenance':
        return 'bg-gray-100 text-gray-800';
      case 'Software':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'Cash':
        return 'bg-green-100 text-green-800';
      case 'Card':
        return 'bg-blue-100 text-blue-800';
      case 'Cheque':
        return 'bg-orange-100 text-orange-800';
      case 'Bank Transfer':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNewExpense = () => {
    window.location.href = '/billing/expenses/add';
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
              Monitor clinic expenses and costs
            </p>
          </div>
          <Button 
            onClick={handleNewExpense}
            className="bg-[#FF6900] hover:bg-orange-300 text-white"
          >
            + New Expense
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
                  {card.icon}
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
              <h2 className="text-lg font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                Expenses {expenseData.length}
              </h2>
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
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                  </svg>
                  All Categorie
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
                <Button variant="outline" className="bg-white border-gray-300 text-gray-700">
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                  </svg>
                  All Payment
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
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer">
                      Date
                      <svg className="w-4 h-4 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Expense #</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer">
                      Category
                      <svg className="w-4 h-4 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer">
                      Amount
                      <svg className="w-4 h-4 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer">
                      Payment Method
                      <svg className="w-4 h-4 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Vendor</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                                     {expenseData.map((expense) => (
                     <tr 
                       key={expense.id} 
                       className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                       onClick={() => window.location.href = `/billing/expenses/${expense.expenseNumber}`}
                     >
                                             <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
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
                      <td className="py-3 px-4 text-sm text-gray-900 max-w-xs truncate">{expense.description}</td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{expense.amount}</div>
                          <div className="text-xs text-gray-500">Tax: {expense.tax}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getMethodColor(expense.paymentMethod))}>
                          {expense.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 max-w-xs truncate">{expense.vendor}</td>
                                             <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                         <div className="flex space-x-2">
                           <button 
                             onClick={() => window.location.href = `/billing/expenses/${expense.expenseNumber}`}
                             className="text-gray-400 hover:text-gray-600"
                             aria-label={`View expense ${expense.expenseNumber}`}
                           >
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                             </svg>
                           </button>
                           <button 
                             onClick={() => window.location.href = `/billing/expenses/${expense.expenseNumber}/edit`}
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
                Showing 1 to {expenseData.length} of {expenseData.length} expenses
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
