/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import MainLayout from "@/components/layout/main-layout";
import { cn } from "@/utils";
import InvoiceService from "@/services/invoiceService";
import { Invoice } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { FileText, AlertCircle, CheckCircle, PlusIcon } from "lucide-react";
import CustomDropdown from "@/components/ui/custom-dropdown";
import { convertToCSV, downloadCSV, formatCurrencyForExport, formatDateForExport, formatDateTimeForExport } from "@/utils/exportUtils";

export default function InvoicesPage() {
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewInvoiceDropdown, setShowNewInvoiceDropdown] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    totalTax: 0,
    count: 0,
  });

  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>("All Types");
  const [patientTypeFilter, setPatientTypeFilter] = useState<string>("All Patients");
  const [statusFilter, setStatusFilter] = useState<string>("All Status");
  
  // Sorting states
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const fetchInvoices = useCallback(async () => {
    if (!token) {
      setError("Authentication token not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await InvoiceService.getInvoices();
      setInvoices(response.data.invoices);
      setSummary(response.data.summary);
      setError(null);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setError("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleDeleteInvoice = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.');
    if (!confirmed) return;
    try {
      await InvoiceService.deleteInvoice(id);
      // Refresh list
      fetchInvoices();
    } catch (err) {
      console.error('Failed to delete invoice:', err);
      alert('Failed to delete invoice. Please try again.');
    }
  };

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (token) {
      fetchInvoices();
    }
  }, [token, fetchInvoices, isAuthenticated, router, authLoading]);

  const handleSelectAll = () => {
    if (selectedInvoices.length === invoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(invoices.map((invoice) => invoice.id));
    }
  };

  const handleSelectInvoice = (id: string) => {
    setSelectedInvoices((prev) =>
      prev.includes(id)
        ? prev.filter((invoiceId) => invoiceId !== id)
        : [...prev, id]
    );
  };

  const handleNewInvoiceClick = () => {
    setShowNewInvoiceDropdown(!showNewInvoiceDropdown);
  };

  const handleInvoiceTypeSelect = (type: "B2C" | "B2B") => {
    setShowNewInvoiceDropdown(false);
    if (type === "B2C") {
      window.location.href = "/billing/invoices/create/b2c";
    } else {
      window.location.href = "/billing/invoices/create/b2b";
    }
  };

  // Handle export functionality
  const handleExportSelected = () => {
    if (selectedInvoices.length === 0) {
      alert('Please select invoices to export');
      return;
    }

    // Get selected invoice data
    const selectedInvoiceData = invoices.filter(invoice => 
      selectedInvoices.includes(invoice.id)
    );

    // Prepare CSV data with all invoice details
    const csvData = selectedInvoiceData.map(invoice => ({
      'Invoice Number': invoice.invoiceNumber || 'N/A',
      'Invoice Date': formatDateForExport(invoice.invoiceDate),
      'Invoice Type': invoice.invoiceType || 'N/A',
      'Patient Name': invoice.patientName || 'N/A',
      'Organization Name': invoice.organizationName || 'N/A',
      'Payment Status': invoice.paymentStatus || 'N/A',
      'Subtotal': formatCurrencyForExport(invoice.subtotal || 0),
      'Total Discount': formatCurrencyForExport(invoice.totalDiscount || 0),
      'Taxable Amount': formatCurrencyForExport(invoice.taxableAmount || 0),
      'SGST Rate (%)': `${invoice.sgstRate || 0}%`,
      'CGST Rate (%)': `${invoice.cgstRate || 0}%`,
      'SGST Amount': formatCurrencyForExport(invoice.sgstAmount || 0),
      'CGST Amount': formatCurrencyForExport(invoice.cgstAmount || 0),
      'Total Tax': formatCurrencyForExport(invoice.totalTax || 0),
      'Total Amount': formatCurrencyForExport(invoice.totalAmount || 0),
      'Overall Discount': formatCurrencyForExport(invoice.overallDiscount || 0),
      'Notes': invoice.notes || 'N/A',
      'Warranty': invoice.warranty || 'N/A',
      'Created Date': formatDateTimeForExport(invoice.createdAt),
      'Updated Date': formatDateTimeForExport(invoice.updatedAt),
      'Number of Screenings': invoice.screenings?.length || 0,
      'Number of Services': invoice.services?.length || 0,
      'Applied Advance Payments': invoice.appliedAdvancePayments?.length || 0
    }));

    // Generate CSV content
    const csvContent = convertToCSV(csvData);
    
    // Download CSV file
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `invoices_export_${timestamp}.csv`;
    downloadCSV(csvContent, filename);
  };

  const handleBulkDelete = async () => {
    if (selectedInvoices.length === 0) {
      alert('Please select invoices to delete');
      return;
    }
    const confirmed = window.confirm(`Delete ${selectedInvoices.length} selected invoice(s)? This cannot be undone.`);
    if (!confirmed) return;
    try {
      const tasks = selectedInvoices.map((id) => InvoiceService.deleteInvoice(id));
      const results = await Promise.allSettled(tasks);
      const failed = results.filter(r => r.status === 'rejected').length;
      if (failed > 0) {
        alert(`Deleted ${selectedInvoices.length - failed} invoice(s), ${failed} failed.`);
      }
      setSelectedInvoices([]);
      fetchInvoices();
    } catch (err) {
      console.error('Bulk delete failed:', err);
      alert('Failed to delete selected invoices.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Partial":
        return "bg-yellow-100 text-yellow-800";
      case "Pending":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "B2C":
        return "bg-green-100 text-green-800";
      case "B2B":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return InvoiceService.formatDateForDisplay(dateString);
  };

  // Filter and sort logic
  const filteredAndSortedInvoices = useMemo(() => {
    const filtered = invoices.filter((invoice) => {
      // Search filter
      const matchesSearch = 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.organizationName && invoice.organizationName.toLowerCase().includes(searchTerm.toLowerCase()));

      // Type filter
      const matchesType = typeFilter === "All Types" || invoice.invoiceType === typeFilter;

      // Patient type filter
      const matchesPatientType = patientTypeFilter === "All Patients" || 
        (patientTypeFilter === "Direct" && invoice.invoiceType === "B2C") ||
        (patientTypeFilter === "Organizations" && invoice.invoiceType === "B2B");

      // Status filter
      const matchesStatus = statusFilter === "All Status" || invoice.paymentStatus === statusFilter;

      return matchesSearch && matchesType && matchesPatientType && matchesStatus;
    });

    // Sort logic
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
          case "date":
            aValue = new Date(a.invoiceDate);
            bValue = new Date(b.invoiceDate);
            break;
          case "invoiceNumber":
            aValue = a.invoiceNumber;
            bValue = b.invoiceNumber;
            break;
          case "type":
            aValue = a.invoiceType;
            bValue = b.invoiceType;
            break;
          case "patient":
            aValue = a.invoiceType === "B2C" ? a.patientName : a.organizationName;
            bValue = b.invoiceType === "B2C" ? b.patientName : b.organizationName;
            break;
          case "amount":
            aValue = a.totalAmount;
            bValue = b.totalAmount;
            break;
          case "status":
            aValue = a.paymentStatus;
            bValue = b.paymentStatus;
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
  }, [invoices, searchTerm, typeFilter, patientTypeFilter, statusFilter, sortField, sortDirection]);

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

  const summaryCards = [
    {
      title: "Total Invoiced",
      value: formatCurrency(summary.totalAmount),
      icon: FileText,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-700",
    },
    {
      title: "Total Tax",
      value: formatCurrency(summary.totalTax),
      icon: AlertCircle,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-700",
    },
    {
      title: "Invoice Count",
      value: summary.count.toString(),
      icon: CheckCircle,
      bgColor: "bg-green-100",
      iconColor: "text-green-700",
    },
    {
      title: "Average Invoice",
      value:
        summary.count > 0
          ? formatCurrency(summary.totalAmount / summary.count)
          : "₹0",
      icon: AlertCircle,
      bgColor: "bg-red-100",
      iconColor: "text-red-700",
    },
  ];

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
    router.push("/login");
    return null;
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading invoices...</div>
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
              {error.includes("token") || error.includes("authentication") ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Please try logging in again.
                  </p>
                  <button
                    onClick={() => router.push("/login")}
                    className="bg-red-600 hover:bg-red-700 text-white inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-10 px-4 py-2"
                  >
                    Go to Login
                  </button>
                </div>
              ) : (
                <button
                  onClick={fetchInvoices}
                  className="ml-4 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-10 px-4 py-2"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start border-b-1 border-gray-300 pb-6 mb-6">
          <div>
            <h1
              className="text-2xl font-semibold text-[#101828]"
              style={{ fontFamily: "Segoe UI" }}
            >
              Invoices
            </h1>
            <p
              className="text-[#4A5565] mt-1"
              style={{ fontFamily: "Segoe UI" }}
            >
              Manage patient invoices and billing records.
            </p>
          </div>
          <div className="relative">
            <button
              className="bg-orange-600 hover:bg-orange-500 text-white text-xs inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background px-3 py-1.5"
              onClick={handleNewInvoiceClick}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              New Invoice
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showNewInvoiceDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-2">
                  <button
                    onClick={() => handleInvoiceTypeSelect("B2C")}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start space-x-3"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        B2C Invoice
                      </div>
                      <div className="text-sm text-gray-500">
                        Individual patient services
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleInvoiceTypeSelect("B2B")}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start space-x-3"
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-purple-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        B2B Invoice
                      </div>
                      <div className="text-sm text-gray-500">
                        Organization screenings
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
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
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        card.bgColor
                      )}
                    >
                      <IconComponent
                        className={cn("w-5 h-5", card.iconColor)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Invoice List Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="">
            {/* Section Header */}
            <div className="flex justify-between items-center p-6 mb-6">
              <div className="flex items-center space-x-2">
                <h2
                  className="text-sm  text-[#101828]"
                  style={{ fontFamily: "Segoe UI" }}
                >
                  Invoices
                </h2>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                  {filteredAndSortedInvoices.length}
                </span>
              </div>
              <div className="flex gap-2">
                {selectedInvoices.length > 0 && (
                  <>
                    <button
                      onClick={handleExportSelected}
                      className="flex items-center gap-2 px-4 py-1.5 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 text-sm transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export ({selectedInvoices.length})
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center gap-2 px-4 py-1.5 border border-red-300 bg-white text-red-600 rounded-lg hover:bg-red-50 text-sm transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m-3 0h14" />
                      </svg>
                      Delete ({selectedInvoices.length})
                    </button>
                  </>
                )}
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
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-100 placeholder-[#717182] h-9 w-full rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <CustomDropdown
                  options={[
                    { value: "All Types", label: "All Types" },
                    { value: "B2C", label: "B2C" },
                    { value: "B2B", label: "B2B" }
                  ]}
                  value={typeFilter}
                  onChange={setTypeFilter}
                  placeholder="All Types"
                  className="h-9 text-xs"
                  aria-label="Filter by invoice type"
                />
                <CustomDropdown
                  options={[
                    { value: "All Patients", label: "All Patients" },
                    { value: "Direct", label: "Direct" },
                    { value: "Organizations", label: "Organizations" }
                  ]}
                  value={patientTypeFilter}
                  onChange={setPatientTypeFilter}
                  placeholder="All Patients"
                  className="h-9 text-xs"
                  aria-label="Filter by patient type"
                />
                <CustomDropdown
                  options={[
                    { value: "All Status", label: "All Status" },
                    { value: "Pending", label: "Pending" },
                    { value: "Paid", label: "Paid" },
                    { value: "Cancelled", label: "Cancelled" }
                  ]}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  placeholder="All Status"
                  className="h-9 text-xs"
                  aria-label="Filter by invoice status"
                />
              </div>
            </div>

            {/* Invoice Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.length === invoices.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                        aria-label="Select all invoices"
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
                      onClick={() => handleSort("invoiceNumber")}
                    >
                      Invoice #
                      {getSortIcon("invoiceNumber")}
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
                      onClick={() => handleSort("patient")}
                    >
                      Patient/Org
                      {getSortIcon("patient")}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Items
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
                      onClick={() => handleSort("status")}
                    >
                      Status
                      {getSortIcon("status")}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={() => handleSelectInvoice(invoice.id)}
                          className="rounded border-gray-300"
                          aria-label={`Select invoice ${invoice.invoiceNumber}`}
                        />
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {formatDate(invoice.invoiceDate)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            getTypeColor(invoice.invoiceType)
                          )}
                        >
                          {invoice.invoiceType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {invoice.invoiceType === "B2C"
                          ? invoice.patientName
                          : invoice.organizationName}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {invoice.screenings.length}{" "}
                        {invoice.screenings.length === 1 ? "item" : "items"}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.totalAmount)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            getStatusColor(invoice.paymentStatus)
                          )}
                        >
                          {invoice.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              (window.location.href = `/billing/invoices/${invoice.id}`)
                            }
                            className="text-gray-400 hover:text-gray-600"
                            aria-label={`View invoice ${invoice.invoiceNumber}`}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() =>
                              (window.location.href = `/billing/invoices/${invoice.id}/edit`)
                            }
                            className="text-gray-400 hover:text-gray-600"
                            aria-label={`Edit invoice ${invoice.invoiceNumber}`}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="text-gray-400 hover:text-red-600"
                            aria-label={`Delete invoice ${invoice.invoiceNumber}`}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m-3 0h14"
                              />
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
            <div className="flex justify-between items-center mt-6 pt-4 !border-t border-gray-200 p-6">
              <p className="text-sm text-gray-600">
                Showing 1 to {filteredAndSortedInvoices.length} of {filteredAndSortedInvoices.length} invoices.
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                  aria-label="Number of invoices to display per page"
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
