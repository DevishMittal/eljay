/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InvoiceService from '@/services/invoiceService';
import HospitalService from '@/services/hospitalService';
import { CreateInvoiceData, InvoiceScreening } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import CustomDropdown from '@/components/ui/custom-dropdown';
import DatePicker from '@/components/ui/date-picker';
import { PROCEDURE_PRICING } from '@/utils/commissionUtils';

export default function B2BInvoicePage() {
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(new Date());
  const [primaryContact, setPrimaryContact] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'Pending' | 'Paid' | 'Cancelled'>('Pending');
  const [sgstRate, setSgstRate] = useState(9);
  const [cgstRate, setCgstRate] = useState(9);
  const [notes, setNotes] = useState('');
  const [warrantyInfo, setWarrantyInfo] = useState('');
  const [screenings, setScreenings] = useState<InvoiceScreening[]>([]);
  const [loading, setLoading] = useState(false);
  const [hospitalOptions, setHospitalOptions] = useState<{ value: string; label: string }[]>([]);

  // Diagnostic options for dropdown
  const diagnosticOptions = PROCEDURE_PRICING
    .filter(procedure => procedure.category === 'diagnostic')
    .map(procedure => ({
      value: procedure.name,
      label: procedure.name
    }));

  // Payment status options
  const paymentStatusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  // Authentication check
  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch hospitals on component mount
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await HospitalService.getHospitals();
        const hospitalList = response.data.hospitals;
        setHospitalOptions(hospitalList.map(hospital => ({
          value: hospital.name,
          label: hospital.name
        })));
      } catch (error) {
        console.error('Error fetching hospitals:', error);
      }
    };

    if (isAuthenticated && !authLoading) {
      fetchHospitals();
    }
  }, [isAuthenticated, authLoading]);

  // Auto-populate screenings when hospital is selected
  // Note: Auto-populating screenings from hospital pending invoices is not implemented
  // This would require a new API endpoint to fetch pending invoices for a specific hospital

  const addScreening = () => {
    const newScreening: InvoiceScreening = {
      screeningDate: new Date().toISOString().split('T')[0],
      opNumber: '',
      bioName: '',
      diagnosticName: '',
      amount: 0,
      discount: 0
    };
    setScreenings([...screenings, newScreening]);
  };

  const removeScreening = (index: number) => {
    const updatedScreenings = screenings.filter((_, i) => i !== index);
    setScreenings(updatedScreenings);
  };

  const updateScreening = (index: number, field: keyof InvoiceScreening, value: any) => {
    const updatedScreenings = [...screenings];
    updatedScreenings[index] = { ...updatedScreenings[index], [field]: value };
    setScreenings(updatedScreenings);
  };

  const calculateSubtotal = () => {
    return screenings.reduce((sum, screening) => sum + screening.amount, 0);
  };

  const calculateTotalDiscount = () => {
    return screenings.reduce((sum, screening) => sum + (screening.discount || 0), 0);
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

  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading authentication...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleSaveInvoice = async () => {
    if (!token) {
      alert('Authentication token not found. Please login again.');
      router.push('/login');
      return;
    }

    if (!invoiceDate || !primaryContact || !hospitalName || screenings.length === 0) {
      alert('Please fill in all required fields and add at least one screening');
      return;
    }

    // Validate screenings
    for (const screening of screenings) {
      if (!screening.screeningDate || !screening.opNumber || !screening.bioName || !screening.diagnosticName || screening.amount <= 0) {
        alert('Please fill in all required screening fields');
        return;
      }
    }

    try {
      setLoading(true);
      
      const invoiceData: CreateInvoiceData = {
        invoiceDate: InvoiceService.formatDateForAPI(invoiceDate.toISOString().split('T')[0]),
        patientName: primaryContact, // Map primaryContact to patientName for API
        organizationName: hospitalName, // Map hospitalName to organizationName for API
        invoiceType: 'B2B',
        screenings: screenings.map(screening => ({
          ...screening,
          screeningDate: InvoiceService.formatDateForAPI(screening.screeningDate)
        })),
        paymentStatus,
        sgstRate,
        cgstRate,
        notes,
        warranty: warrantyInfo
      };

      const response = await InvoiceService.createInvoice(invoiceData);
      console.log('Invoice created successfully:', response);
      
      // Navigate to the new invoice detail page
      window.location.href = `/billing/invoices/${response.data.id}`;
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    window.location.href = '/billing/invoices';
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-lg font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
              Create B2B Invoice
            </h1>
            <p className="text-xs text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
              Create screening-based invoice for B2B organization.
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="text-sm border-gray-300" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              className="text-sm bg-orange-600 hover:bg-orange-700 text-white"
              onClick={handleSaveInvoice}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
            {/* Invoice Information */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <h2 className="text-sm font-semibold text-[#101828] mb-4" style={{ fontFamily: 'Segoe UI' }}>
                  Invoice Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Invoice Date*
                    </label>
                    <DatePicker
                      value={invoiceDate?.toISOString().split('T')[0] || ''}
                      onChange={(date) => setInvoiceDate(new Date(date))}
                      placeholder="Select date"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Primary Contact*
                    </label>
                    <Input
                      value={primaryContact}
                      onChange={(e) => setPrimaryContact(e.target.value)}
                      placeholder="Enter primary contact name"
                      className="bg-white border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Hospital Name*
                    </label>
                    <CustomDropdown
                      options={hospitalOptions}
                      value={hospitalName}
                      onChange={(value) => setHospitalName(value)}
                      placeholder="Select Hospital"
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Screening Details */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    Screening Details
                  </h2>
                  <Button 
                    onClick={addScreening}
                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs"
                  >
                    + Add Screening
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">S.No</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">Date of Screening*</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">OP/IP No*</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">Bio Name*</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">Diagnostic Name*</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">Amount*</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">Discount</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {screenings.map((screening, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-xs text-gray-900">{index + 1}</td>
                          <td className="py-3 px-4">
                            <Input
                              type="date"
                              value={screening.screeningDate}
                              onChange={(e) => updateScreening(index, 'screeningDate', e.target.value)}
                              className="w-32 bg-white border-gray-300"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              value={screening.opNumber}
                              onChange={(e) => updateScreening(index, 'opNumber', e.target.value)}
                              placeholder="OP/IP Number"
                              className="w-24 bg-white border-gray-300"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              value={screening.bioName}
                              onChange={(e) => updateScreening(index, 'bioName', e.target.value)}
                              placeholder="Patient Name"
                              className="w-32 bg-white border-gray-300"
                            />
                          </td>
                                                     <td className="py-3 px-4">
                             <select
                               value={screening.diagnosticName}
                               onChange={(e) => updateScreening(index, 'diagnosticName', e.target.value)}
                               className="w-48 px-3 py-2 border border-gray-300 rounded-md bg-white text-xs"
                               aria-label={`Select diagnostic for screening ${index + 1}`}
                             >
                               <option value="">Select Diagnostic</option>
                               {diagnosticOptions.map((option) => (
                                 <option key={option.value} value={option.value}>
                                   {option.label}
                                 </option>
                               ))}
                             </select>
                           </td>
                          <td className="py-3 px-4">
                            <Input
                              type="number"
                              value={screening.amount}
                              onChange={(e) => updateScreening(index, 'amount', parseInt(e.target.value) || 0)}
                              className="w-20 bg-white border-gray-300"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              type="number"
                              value={screening.discount || 0}
                              onChange={(e) => updateScreening(index, 'discount', parseInt(e.target.value) || 0)}
                              className="w-20 bg-white border-gray-300"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => removeScreening(index)}
                              className="text-red-500 hover:text-red-700"
                              aria-label={`Remove screening ${index + 1}`}
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

            {/* Bottom Section - Two Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Invoice Settings */}
              <div className="space-y-6">
                {/* Invoice Settings */}
                <Card className="bg-white">
                  <CardContent className="p-6">
                    <h2 className="text-sm font-semibold text-[#101828] mb-4" style={{ fontFamily: 'Segoe UI' }}>
                      Invoice Settings
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Payment Status
                        </label>
                        <CustomDropdown
                          options={paymentStatusOptions}
                          value={paymentStatus}
                          onChange={(value) => setPaymentStatus(value as 'Pending' | 'Paid' | 'Cancelled')}
                          placeholder="Select Status"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Overall Discount (₹)
                        </label>
                        <Input
                          type="number"
                          value={calculateTotalDiscount()}
                          className="bg-white border-gray-300"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
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
                        <label className="block text-xs font-medium text-gray-700 mb-2">
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
                      <label className="block text-xs font-medium text-gray-700 mb-2">
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
                    <h2 className="text-sm font-semibold text-[#101828] mb-4" style={{ fontFamily: 'Segoe UI' }}>
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

              {/* Right Column - Invoice Summary */}
              <div>
                <Card className="bg-white sticky top-6">
                  <CardContent className="p-6">
                    <h2 className="text-sm font-semibold text-[#101828] mb-4" style={{ fontFamily: 'Segoe UI' }}>
                      Invoice Summary
                    </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Subtotal:</span>
                    <span className="text-xs font-medium">₹{calculateSubtotal().toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Total Discount:</span>
                    <span className="text-xs font-medium text-red-600">-₹{calculateTotalDiscount().toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Taxable Amount:</span>
                    <span className="text-xs font-medium">₹{calculateTaxableAmount().toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">SGST ({sgstRate}%):</span>
                    <span className="text-xs font-medium">₹{calculateTax().sgst.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">CGST ({cgstRate}%):</span>
                    <span className="text-xs font-medium">₹{calculateTax().cgst.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Total Tax:</span>
                    <span className="text-xs font-medium">₹{calculateTax().total.toLocaleString()}</span>
                  </div>
                  
                  <div className="pt-3">
                    <div className="flex justify-between text-sm font-semibold">
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
      </div>
    </MainLayout>
  );
}
