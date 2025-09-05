/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { cn } from '@/utils';
import ExpenseService from '@/services/expenseService';
import { Expense, ExpensesResponse } from '@/types';
import { DollarSign, Receipt, Calculator, TrendingDown, PlusIcon, Filter } from 'lucide-react';

export default function ExpensesPage() {
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalTax: 0,
    count: 0
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response: ExpensesResponse = await ExpenseService.getExpenses(page, 10);
      setExpenses(response.data.expenses);
      setSummary(response.data.summary);
      setPagination(response.data.pagination);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch expenses');
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedExpenses.length === expenses.length) {
      setSelectedExpenses([]);
    } else {
      setSelectedExpenses(expenses.map(expense => expense.id));
    }
  };

  const handleSelectExpense = (id: string) => {
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
      case 'Credit Card':
        return 'bg-indigo-100 text-indigo-800';
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

  const filteredExpenses = expenses.filter(expense =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.expenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const summaryCards = [
    {
      title: "Total Expenses",
      value: `₹${summary.totalAmount.toLocaleString()}`,
      icon: DollarSign,
      bgColor: "bg-red-100",
      iconColor: "text-red-700",
    },
    {
      title: "Total Tax",
      value: `₹${summary.totalTax.toLocaleString()}`,
      icon: Receipt,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-700",
    },
    {
      title: "Expense Count",
      value: summary.count.toString(),
      icon: Calculator,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-700",
    },
    {
      title: "Average Expense",
      value: summary.count > 0 ? `₹${Math.round(summary.totalAmount / summary.count).toLocaleString()}` : '₹0',
      icon: TrendingDown,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-700",
    },
  ];

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

  if (error) {
    return (
      <MainLayout>
        <div className="p-6 space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-medium text-red-800">Error Loading Expenses</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
            <div className="mt-4">
              <button onClick={() => fetchExpenses()} className="bg-red-600 hover:bg-red-700 text-white inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-10 px-4 py-2">
                Try Again
              </button>
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
              Expenses
            </h1>
            <p className="text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
              Monitor clinic expenses and costs
            </p>
          </div>
          <button
            className="bg-orange-600 hover:bg-orange-500 text-white text-xs inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background px-3 py-1.5"
            onClick={handleNewExpense}
          >
            <PlusIcon className="w-4 h-4 mr-2" /> New Expense
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-xs text-[#4A5565]"
                        style={{ fontFamily: "Segoe UI" }}
                      >
                        {card.title}
                      </p>
                      <p
                        className="text-xl font-semibold text-gray-900"
                        style={{ fontFamily: "Segoe UI" }}
                      >
                        {card.value}
                      </p>
                    </div>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${card.bgColor}`}
                    >
                      <IconComponent className={`w-5 h-5 ${card.iconColor}`} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Expense List Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="">
            {/* Section Header */}
            <div className="flex justify-between items-center p-6 mb-6">
              <div className="flex items-center space-x-3">
                <h2 className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                  Expenses
                </h2>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">{expenses.length}</span>
              </div>
              <div className="flex gap-2">
                <div className="relative w-64">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-100 placeholder-[#717182] h-9 w-full rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <button className="bg-white text-gray-700 hover:bg-gray-50 inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-9 px-3 py-2 text-sm">
                  <Filter className="w-4 h-4 mr-2"/>
                  All Categories
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button className="bg-white text-gray-700 hover:bg-gray-50 inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-9 px-3 py-2 text-sm">
                  <Filter className="w-4 h-4 mr-2"/>
                  All Payment Methods
                  <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
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
                        checked={selectedExpenses.length === expenses.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                        aria-label="Select all expenses"
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Date
                      <svg className="inline w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Expense #
                      <svg className="inline w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Category
                      <svg className="inline w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Amount
                      <svg className="inline w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Payment Method
                      <svg className="inline w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Vendor</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr 
                      key={expense.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => window.location.href = `/billing/expenses/${expense.id}`}
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
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {new Date(expense.date).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{expense.expenseNumber}</td>
                      <td className="py-3 px-4">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getCategoryColor(expense.category))}>
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 max-w-xs truncate">{expense.description}</td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">₹{expense.amount.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">Tax: ₹{expense.taxAmount.toLocaleString()}</div>
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
                            onClick={() => window.location.href = `/billing/expenses/${expense.id}`}
                            className="text-gray-400 hover:text-gray-600"
                            aria-label={`View expense ${expense.expenseNumber}`}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => window.location.href = `/billing/expenses/${expense.id}/edit`}
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
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 p-6">
              <p className="text-sm text-gray-600">
                Showing 1 to {expenses.length} of {pagination.total} expenses
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
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
