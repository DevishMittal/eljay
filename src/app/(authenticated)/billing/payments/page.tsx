'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { cn } from '@/utils';
import PaymentService from '@/services/paymentService';
import { Payment } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { CreditCard, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import CustomDropdown from '@/components/ui/custom-dropdown';

export default function PaymentsPage() {
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState('25');

  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>("All Types");
  const [methodFilter, setMethodFilter] = useState<string>("All Methods");
  const [statusFilter, setStatusFilter] = useState<string>("All Status");
  
  // Sorting states
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const fetchPayments = useCallback(async () => {
    if (!token) {
      setError('Authentication token not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await PaymentService.getPayments(1, 10);
      setPayments(response.data.payments);
      setTotalAmount(response.data.summary.totalAmount);
      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching payments:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payments';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (token) {
      fetchPayments();
    }
  }, [token, fetchPayments, isAuthenticated, router, authLoading]);

  // Calculate summary data from payments
  const completedPayments = payments.filter(p => p.status === 'Completed');
  const pendingPayments = payments.filter(p => p.status === 'Pending');
  const averagePayment = payments.length > 0 ? totalAmount / payments.length : 0;

  const summaryCards = [
    {
      title: "Total Received",
      value: PaymentService.formatCurrency(totalAmount),
      icon: CreditCard,
      bgColor: "bg-green-100",
      iconColor: "text-green-700",
    },
    {
      title: "Pending",
      value: pendingPayments.length.toString(),
      icon: Clock,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-700",
    },
    {
      title: "Completed",
      value: completedPayments.length.toString(),
      icon: CheckCircle,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-700",
    },
    {
      title: "Average Payment",
      value: PaymentService.formatCurrency(averagePayment),
      icon: TrendingUp,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-700",
    },
  ];

  const handleSelectAll = () => {
    if (selectedPayments.length === payments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(payments.map(payment => payment.id));
    }
  };

  const handleSelectPayment = (id: string) => {
    setSelectedPayments(prev => 
      prev.includes(id) 
        ? prev.filter(paymentId => paymentId !== id)
        : [...prev, id]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'UPI':
        return 'bg-purple-100 text-purple-800';
      case 'Card':
        return 'bg-blue-100 text-blue-800';
      case 'Cash':
        return 'bg-green-100 text-green-800';
      case 'Bank Transfer':
        return 'bg-orange-100 text-orange-800';
      case 'Cheque':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    if (type === 'Full') {
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-blue-100 text-blue-800';
  };

  const handleNewPayment = () => {
    router.push('/billing/payments/record');
  };

  // Filter and sort logic
  const filteredAndSortedPayments = useMemo(() => {
    const filtered = payments.filter((payment) => {
      // Search filter
      const matchesSearch = 
        payment.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.receivedBy.toLowerCase().includes(searchTerm.toLowerCase());

      // Type filter
      const matchesType = typeFilter === "All Types" || payment.paymentType === typeFilter;

      // Method filter
      const matchesMethod = methodFilter === "All Methods" || payment.method === methodFilter;

      // Status filter
      const matchesStatus = statusFilter === "All Status" || payment.status === statusFilter;

      return matchesSearch && matchesType && matchesMethod && matchesStatus;
    });

    // Sort logic
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue: string | number | Date;
        let bValue: string | number | Date;

        switch (sortField) {
          case "date":
            aValue = new Date(a.paymentDate);
            bValue = new Date(b.paymentDate);
            break;
          case "receiptNumber":
            aValue = a.receiptNumber;
            bValue = b.receiptNumber;
            break;
          case "patient":
            aValue = a.patientName;
            bValue = b.patientName;
            break;
          case "type":
            aValue = a.paymentType;
            bValue = b.paymentType;
            break;
          case "amount":
            aValue = a.amount;
            bValue = b.amount;
            break;
          case "method":
            aValue = a.method;
            bValue = b.method;
            break;
          case "status":
            aValue = a.status;
            bValue = b.status;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [payments, searchTerm, typeFilter, methodFilter, statusFilter, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return (
        <svg className="inline w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === "asc" ? (
      <svg className="inline w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    ) : (
      <svg className="inline w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
      </svg>
    );
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
            <div className="text-lg">Loading payments...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-lg text-red-600 mb-4">{error}</div>
              {error.includes('token') || error.includes('authentication') ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Please try logging in again.</p>
                  <button onClick={() => router.push('/login')} className="bg-red-600 hover:bg-red-700 text-white inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-10 px-4 py-2">
                    Go to Login
                  </button>
                </div>
              ) : (
                <button onClick={fetchPayments} className="ml-4 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-10 px-4 py-2">Retry</button>
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
              Payments
            </h1>
            <p className="text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
              Track payment receipts and transactions
            </p>
          </div>
          <button
            className="bg-orange-600 hover:bg-orange-500 text-white text-xs inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background px-3 py-1.5"
            onClick={handleNewPayment}
          >
            + New Payment
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

        {/* Payment List Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            {/* Section Header */}
            <div className="flex justify-between items-center p-6 mb-6">
              <div className="flex items-center space-x-3">
                <h2 className="text-sm text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                  Payments
                </h2>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">{filteredAndSortedPayments.length}</span>
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
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-100 placeholder-[#717182] h-9 w-full rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <CustomDropdown
                  options={[
                    { value: "All Types", label: "All Types" },
                    { value: "Full", label: "Full" },
                    { value: "Partial", label: "Partial" }
                  ]}
                  value={typeFilter}
                  onChange={setTypeFilter}
                  placeholder="All Types"
                  className="h-9 text-xs"
                  aria-label="Filter by payment type"
                />
                <CustomDropdown
                  options={[
                    { value: "All Methods", label: "All Methods" },
                    { value: "Cash", label: "Cash" },
                    { value: "Card", label: "Card" },
                    { value: "UPI", label: "UPI" },
                    { value: "Bank Transfer", label: "Bank Transfer" },
                    { value: "Cheque", label: "Cheque" }
                  ]}
                  value={methodFilter}
                  onChange={setMethodFilter}
                  placeholder="All Methods"
                  className="h-9 text-xs"
                  aria-label="Filter by payment method"
                />
                <CustomDropdown
                  options={[
                    { value: "All Status", label: "All Status" },
                    { value: "Completed", label: "Completed" },
                    { value: "Pending", label: "Pending" },
                    { value: "Failed", label: "Failed" }
                  ]}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  placeholder="All Status"
                  className="h-9 text-xs"
                  aria-label="Filter by payment status"
                />
              </div>
            </div>

            {/* Payment Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedPayments.length === payments.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                        aria-label="Select all payments"
                      />
                    </th>
                    <th 
                      className="text-left py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("date")}
                    >
                      Date
                      {getSortIcon("date")}
                    </th>
                    <th 
                      className="text-left py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("receiptNumber")}
                    >
                      Receipt #
                      {getSortIcon("receiptNumber")}
                    </th>
                    <th 
                      className="text-left py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("patient")}
                    >
                      Patient
                      {getSortIcon("patient")}
                    </th>
                    <th 
                      className="text-left py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("type")}
                    >
                      Type
                      {getSortIcon("type")}
                    </th>
                    <th 
                      className="text-left py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("amount")}
                    >
                      Amount
                      {getSortIcon("amount")}
                    </th>
                    <th 
                      className="text-left py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("method")}
                    >
                      Method
                      {getSortIcon("method")}
                    </th>
                    <th 
                      className="text-left py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("status")}
                    >
                      Status
                      {getSortIcon("status")}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Received By</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedPayments.map((payment) => (
                    <tr 
                      key={payment.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => window.location.href = `/billing/payments/${payment.id}`}
                    >
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedPayments.includes(payment.id)}
                          onChange={() => handleSelectPayment(payment.id)}
                          className="rounded border-gray-300"
                          aria-label={`Select payment ${payment.receiptNumber}`}
                        />
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{PaymentService.formatDateForDisplay(payment.paymentDate)}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{payment.receiptNumber}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {payment.patientName}
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getTypeColor(payment.paymentType))}>
                          {payment.paymentType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{PaymentService.formatCurrency(payment.amount)}</td>
                      <td className="py-3 px-4">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getMethodColor(payment.method))}>
                          {payment.method}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(payment.status))}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{payment.receivedBy}</td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => window.location.href = `/billing/payments/${payment.id}`}
                            className="text-gray-400 hover:text-gray-600"
                            aria-label={`View payment ${payment.receiptNumber}`}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => window.location.href = `/billing/payments/${payment.id}/edit`}
                            className="text-gray-400 hover:text-gray-600"
                            aria-label={`Edit payment ${payment.receiptNumber}`}
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
                Showing 1 to {filteredAndSortedPayments.length} of {filteredAndSortedPayments.length} payments
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Show:</span>
                <CustomDropdown
                  options={[
                    { value: '25', label: '25' },
                    { value: '50', label: '50' },
                    { value: '100', label: '100' }
                  ]}
                  value={itemsPerPage}
                  onChange={setItemsPerPage}
                  className="w-20"
                  aria-label="Number of payments to display per page"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
