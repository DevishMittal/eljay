/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils';

// Sample data for diagnostics
const diagnostics = [
  { id: 1, name: 'Pure Tone Audiometry', unitCost: 800 },
  { id: 2, name: 'Tympanometry', unitCost: 400 },
  { id: 3, name: 'Comprehensive Hearing Assessment', unitCost: 2500 },
  { id: 4, name: 'Hearing Aid Consultation', unitCost: 1200 },
  { id: 5, name: 'Follow-up Care Plan', unitCost: 800 }
];

interface ScreeningItem {
  id: number;
  sNo: number;
  dateOfScreening: string;
  opIpNo: string;
  bioName: string;
  diagnosticId: number;
  diagnosticName: string;
  amount: number;
  discount: number;
  total: number;
}

export default function B2BInvoicePage() {
  const [invoiceNumber, setInvoiceNumber] = useState('EHC-B2B-2025-06-001');
  const [invoiceDate, setInvoiceDate] = useState('28-06-2025');
  const [patientName, setPatientName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [sgstRate, setSgstRate] = useState(9);
  const [cgstRate, setCgstRate] = useState(9);
  const [notes, setNotes] = useState('');
  const [warrantyInfo, setWarrantyInfo] = useState('');
  const [screenings, setScreenings] = useState<ScreeningItem[]>([
    {
      id: 1,
      sNo: 1,
      dateOfScreening: '28-06-2025',
      opIpNo: 'OP12345',
      bioName: 'John Smith',
      diagnosticId: 1,
      diagnosticName: 'Pure Tone Audiometry',
      amount: 800,
      discount: 0,
      total: 800
    },
    {
      id: 2,
      sNo: 2,
      dateOfScreening: '28-06-2025',
      opIpNo: 'OP12346',
      bioName: 'Sarah Johnson',
      diagnosticId: 2,
      diagnosticName: 'Tympanometry',
      amount: 400,
      discount: 50,
      total: 350
    }
  ]);

  const addScreening = () => {
    const newScreening: ScreeningItem = {
      id: Date.now(),
      sNo: screenings.length + 1,
      dateOfScreening: '28-06-2025',
      opIpNo: '',
      bioName: '',
      diagnosticId: 0,
      diagnosticName: '',
      amount: 0,
      discount: 0,
      total: 0
    };
    setScreenings([...screenings, newScreening]);
  };

  const removeScreening = (id: number) => {
    const updatedScreenings = screenings.filter(screening => screening.id !== id);
    const renumberedScreenings = updatedScreenings.map((screening, index) => ({
      ...screening,
      sNo: index + 1
    }));
    setScreenings(renumberedScreenings);
  };

  const updateScreening = (id: number, field: keyof ScreeningItem, value: any) => {
    setScreenings(screenings.map(screening => {
      if (screening.id === id) {
        const updatedScreening = { ...screening, [field]: value };
        if (field === 'amount' || field === 'discount') {
          updatedScreening.total = updatedScreening.amount - updatedScreening.discount;
        }
        return updatedScreening;
      }
      return screening;
    }));
  };

  const handleDiagnosticSelect = (screeningId: number, diagnosticId: number) => {
    const diagnostic = diagnostics.find(d => d.id === diagnosticId);
    if (diagnostic) {
      updateScreening(screeningId, 'diagnosticId', diagnosticId);
      updateScreening(screeningId, 'diagnosticName', diagnostic.name);
      updateScreening(screeningId, 'amount', diagnostic.unitCost);
      updateScreening(screeningId, 'total', diagnostic.unitCost);
    }
  };

  const calculateSubtotal = () => {
    return screenings.reduce((sum, screening) => sum + screening.total, 0);
  };

  const calculateTotalDiscount = () => {
    return screenings.reduce((sum, screening) => sum + screening.discount, 0) + overallDiscount;
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

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
              Create B2B Invoice
            </h1>
            <p className="text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
              Create a new invoice for corporate hearing screening services.
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="border-gray-300">
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              Save Invoice
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Information */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-[#101828] mb-4" style={{ fontFamily: 'Segoe UI' }}>
                  Invoice Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice Number*
                    </label>
                    <Input
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice Date
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
                      Patient Name*
                    </label>
                    <Input
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Enter patient name"
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Name*
                    </label>
                    <Input
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="Hospital/Company Name"
                      className="bg-white border-gray-300"
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
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date of Screening</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">OP/IP No*</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Bio Name*</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Diagnostic Name*</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Amount*</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Discount</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {screenings.map((screening) => (
                        <tr key={screening.id} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-sm text-gray-900">{screening.sNo}</td>
                          <td className="py-3 px-4">
                            <Input
                              type="date"
                              value={screening.dateOfScreening}
                              onChange={(e) => updateScreening(screening.id, 'dateOfScreening', e.target.value)}
                              className="w-32 bg-white border-gray-300"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              value={screening.opIpNo}
                              onChange={(e) => updateScreening(screening.id, 'opIpNo', e.target.value)}
                              placeholder="OP/IP Number"
                              className="w-24 bg-white border-gray-300"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              value={screening.bioName}
                              onChange={(e) => updateScreening(screening.id, 'bioName', e.target.value)}
                              placeholder="Patient Name"
                              className="w-32 bg-white border-gray-300"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <select
                              value={screening.diagnosticId}
                              onChange={(e) => handleDiagnosticSelect(screening.id, parseInt(e.target.value))}
                              className="w-48 px-3 py-2 border border-gray-300 rounded-md bg-white"
                              aria-label="Select diagnostic for this screening"
                            >
                              <option value={0}>Select diagnostic</option>
                              {diagnostics.map(diagnostic => (
                                <option key={diagnostic.id} value={diagnostic.id}>
                                  {diagnostic.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              type="number"
                              value={screening.amount}
                              onChange={(e) => updateScreening(screening.id, 'amount', parseInt(e.target.value) || 0)}
                              className="w-20 bg-white border-gray-300"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              type="number"
                              value={screening.discount}
                              onChange={(e) => updateScreening(screening.id, 'discount', parseInt(e.target.value) || 0)}
                              className="w-20 bg-white border-gray-300"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => removeScreening(screening.id)}
                              className="text-red-500 hover:text-red-700"
                              aria-label={`Remove screening ${screening.sNo}`}
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
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                      aria-label="Select payment status"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Partial">Partial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Overall Discount (₹)
                    </label>
                    <Input
                      type="number"
                      value={overallDiscount}
                      onChange={(e) => setOverallDiscount(parseInt(e.target.value) || 0)}
                      className="bg-white border-gray-300"
                    />
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
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional notes for this invoice"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white h-20 resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* General Warranty Information */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-[#101828] mb-4" style={{ fontFamily: 'Segoe UI' }}>
                  General Warranty Information
                </h2>
                <textarea
                  value={warrantyInfo}
                  onChange={(e) => setWarrantyInfo(e.target.value)}
                  placeholder="General warranty terms and conditions"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white h-20 resize-none"
                />
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
                      <span>Total Amount:</span>
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
