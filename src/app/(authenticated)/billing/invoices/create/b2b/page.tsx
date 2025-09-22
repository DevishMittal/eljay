/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InvoiceService from '@/services/invoiceService';
import HospitalService from '@/services/hospitalService';
import PatientService from '@/services/patientService';
import DiagnosticsService from '@/services/diagnosticsService';
import PaymentService from '@/services/paymentService';
import { CreateInvoiceData, InvoiceScreening, Patient } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import CustomDropdown from '@/components/ui/custom-dropdown';
import DatePicker from '@/components/ui/date-picker';

export default function B2BInvoicePage() {
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(new Date());
  const [primaryContact, setPrimaryContact] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'Pending' | 'Paid' | 'Cancelled'>('Pending');
  const [sgstRate, setSgstRate] = useState<number>(0);
  const [cgstRate, setCgstRate] = useState<number>(0);
  const [sgstRateInput, setSgstRateInput] = useState<string>('');
  const [cgstRateInput, setCgstRateInput] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [warrantyInfo, setWarrantyInfo] = useState('');
  const [screenings, setScreenings] = useState<InvoiceScreening[]>([]);
  const [loading, setLoading] = useState(false);
  const [hospitalOptions, setHospitalOptions] = useState<{ value: string; label: string }[]>([]);
  const [hospitalPatients, setHospitalPatients] = useState<Patient[]>([]);
  const [diagnosticOptions, setDiagnosticOptions] = useState<{ value: string; label: string; price: number }[]>([]);
  const [fetchingPatients, setFetchingPatients] = useState(false);

  // Payment Details States for B2B (only partial payment)
  const [paymentDetails, setPaymentDetails] = useState<Array<{
    id: string;
    paymentDate: string;
    method: 'Cash' | 'Card' | 'UPI' | 'Netbanking' | 'Cheque' | '';
    amount: number;
    transactionId?: string;
    receivedBy?: string;
    description?: string;
    notes?: string;
  }>>([
    // Initialize with one default payment row for B2B
    {
      id: 'default-1',
      paymentDate: new Date().toISOString().split('T')[0],
      method: '' as 'Cash' | 'Card' | 'UPI' | 'Netbanking' | 'Cheque' | '',
      amount: 0,
      transactionId: '',
      receivedBy: '',
      description: '',
      notes: ''
    }
  ]);

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

  // Fetch diagnostics on component mount
  useEffect(() => {
    const fetchDiagnostics = async () => {
      try {
        if (!token) return;
        const response = await DiagnosticsService.getDiagnostics(token);
        const diagnostics = response.data;
        setDiagnosticOptions(diagnostics.map(diagnostic => ({
          value: diagnostic.name,
          label: diagnostic.name,
          price: diagnostic.price
        })));
      } catch (error) {
        console.error('Error fetching diagnostics:', error);
        alert('Failed to load diagnostic options. Please refresh the page.');
      }
    };

    if (isAuthenticated && !authLoading && token) {
      fetchDiagnostics();
    }
  }, [isAuthenticated, authLoading, token]);

  // Fetch patients when hospital is selected
  useEffect(() => {
    const fetchHospitalPatients = async () => {
      if (!hospitalName || !token) return;
      
      try {
        setFetchingPatients(true);
        const patientService = new PatientService();
        const patients = await patientService.getPatientsByHospital(hospitalName, token);
        setHospitalPatients(patients);
        
        // Auto-populate screenings based on hospital patients
        if (patients.length > 0) {
          const autoScreenings: InvoiceScreening[] = patients.map((patient, index) => ({
            screeningDate: new Date().toISOString().split('T')[0],
            opNumber: `OP-${(index + 1).toString().padStart(3, '0')}`, // Auto-generate OP number
            bioName: patient.full_name,
            diagnosticName: '',
            amount: 0,
            discount: 0
          }));
          setScreenings(autoScreenings);
        }
      } catch (error) {
        console.error('Error fetching hospital patients:', error);
        alert('Failed to load patients for this hospital. You can still manually enter patient details.');
      } finally {
        setFetchingPatients(false);
      }
    };

    fetchHospitalPatients();
  }, [hospitalName, token]);

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
    
    // Auto-populate amount when diagnostic is selected
    if (field === 'diagnosticName' && value) {
      const selectedDiagnostic = diagnosticOptions.find(option => option.value === value);
      if (selectedDiagnostic) {
        updatedScreenings[index].amount = selectedDiagnostic.price;
      }
    }
    
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

  // Payment Details Helper Functions for B2B
  const addPaymentDetail = () => {
    const newPayment = {
      id: Date.now().toString(),
      paymentDate: new Date().toISOString().split('T')[0],
      method: '' as 'Cash' | 'Card' | 'UPI' | 'Netbanking' | 'Cheque' | '',
      amount: 0,
      transactionId: '',
      receivedBy: '',
      description: '',
      notes: ''
    };
    setPaymentDetails([...paymentDetails, newPayment]);
  };

  const removePaymentDetail = (id: string) => {
    setPaymentDetails(paymentDetails.filter(payment => payment.id !== id));
  };

  const updatePaymentDetail = (id: string, field: string, value: any) => {
    setPaymentDetails(paymentDetails.map(payment => 
      payment.id === id ? { ...payment, [field]: value } : payment
    ));
  };

  const calculateTotalPaymentDetails = () => {
    return paymentDetails.reduce((sum, payment) => sum + payment.amount, 0);
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

    // Validate payment details if any are added (filter out empty default rows)
    const validPayments = paymentDetails.filter(payment => 
      payment.paymentDate && payment.method && payment.amount > 0
    );
    
    // Only validate if there are actual payment entries
    if (validPayments.length > 0) {
      for (const payment of validPayments) {
        if (!payment.paymentDate || !payment.method || payment.amount <= 0) {
          alert('Please fill in all required payment fields (date, method, amount)');
          return;
        }
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

      // Create payment records if any valid payment details are added
      if (validPayments.length > 0) {
        try {
          for (const payment of validPayments) {
            const paymentData = {
              paymentDate: payment.paymentDate,
              patientName: primaryContact, // Use primary contact as patient name for B2B
              amount: payment.amount,
              method: payment.method as 'Cash' | 'Card' | 'UPI' | 'Netbanking' | 'Cheque',
              status: 'Completed' as const,
              transactionId: payment.transactionId || '',
              receivedBy: payment.receivedBy || '',
              paymentType: 'Advance' as const,
              description: payment.description || `Payment for B2B Invoice ${response.data.invoiceNumber}`,
              notes: payment.notes || ''
            };
            
            await PaymentService.createPayment(paymentData);
          }
        } catch (paymentError) {
          console.error('Error creating payments:', paymentError);
          // Continue to navigate even if payment creation fails
          alert('Invoice created successfully, but there was an error creating payment records. You can add payments manually later.');
        }
      }
      
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
            <h1 className="text-lg font-semibold text-[#101828]">
              Create B2B Invoice
            </h1>
            <p className="text-xs text-[#4A5565] mt-1">
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
                <h2 className="text-sm font-semibold text-[#101828] mb-4">
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
                    {fetchingPatients && (
                      <p className="text-xs text-blue-600 mt-1">Loading patients...</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Screening Details */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-[#101828]">
                      Screening Details
                    </h2>
                    {hospitalPatients.length > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        Found {hospitalPatients.length} patient(s) from {hospitalName}. All fields can be manually edited.
                      </p>
                    )}
                    {hospitalName && hospitalPatients.length === 0 && !fetchingPatients && (
                      <p className="text-xs text-yellow-600 mt-1">
                        No patients found for {hospitalName}. You can manually enter patient details.
                      </p>
                    )}
                    {!hospitalName && (
                      <p className="text-xs text-gray-600 mt-1">
                        Select a hospital to auto-populate patients, or add screening rows manually.
                      </p>
                    )}
                  </div>
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
                            {hospitalPatients.length > 0 ? (
                              <select
                                value={screening.bioName}
                                onChange={(e) => updateScreening(index, 'bioName', e.target.value)}
                                className="w-32 px-2 py-2 border border-gray-300 rounded-md bg-white text-xs"
                                aria-label={`Select patient for screening ${index + 1}`}
                              >
                                <option value="">Select Patient</option>
                                {hospitalPatients.map((patient) => (
                                  <option key={patient.id} value={patient.full_name}>
                                    {patient.full_name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <Input
                                value={screening.bioName}
                                onChange={(e) => updateScreening(index, 'bioName', e.target.value)}
                                placeholder="Patient Name"
                                className="w-32 bg-white border-gray-300"
                              />
                            )}
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
                                   {option.label} - ₹{option.price}
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

            {/* Payment Details Section for B2B */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-[#101828]">
                      Payment Details
                    </h2>
                    <p className="text-xs text-gray-600 mt-1">
                      Add partial payment details for this B2B invoice
                    </p>
                  </div>
                  <Button 
                    onClick={addPaymentDetail}
                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs"
                    type="button"
                  >
                    + Add Payment
                  </Button>
                </div>

                {/* Always show payment table since we have at least one default row */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">Payment Date*</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">Payment Method*</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">Amount*</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">Transaction ID</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">Received By</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentDetails.map((payment) => (
                          <tr key={payment.id} className="border-b border-gray-100">
                            <td className="py-3 px-4">
                              <Input
                                type="date"
                                value={payment.paymentDate}
                                onChange={(e) => updatePaymentDetail(payment.id, 'paymentDate', e.target.value)}
                                className="w-32 bg-white border-gray-300"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={payment.method}
                                onChange={(e) => updatePaymentDetail(payment.id, 'method', e.target.value)}
                                className="w-32 px-3 py-2 border border-gray-300 rounded-md bg-white text-xs"
                                aria-label={`Payment method for payment ${payment.id}`}
                              >
                                <option value="">Select Method</option>
                                <option value="Cash">Cash</option>
                                <option value="Card">Card</option>
                                <option value="UPI">UPI</option>
                                <option value="Netbanking">Netbanking</option>
                                <option value="Cheque">Cheque</option>
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                                <Input
                                  type="number"
                                  value={payment.amount || ''}
                                  onChange={(e) => updatePaymentDetail(payment.id, 'amount', parseFloat(e.target.value) || 0)}
                                  className="pl-8 w-24 bg-white border-gray-300"
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Input
                                value={payment.transactionId || ''}
                                onChange={(e) => updatePaymentDetail(payment.id, 'transactionId', e.target.value)}
                                placeholder="Transaction ID"
                                className="w-32 bg-white border-gray-300"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <Input
                                value={payment.receivedBy || ''}
                                onChange={(e) => updatePaymentDetail(payment.id, 'receivedBy', e.target.value)}
                                placeholder="Staff name"
                                className="w-32 bg-white border-gray-300"
                              />
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => removePaymentDetail(payment.id)}
                                className="text-red-500 hover:text-red-700"
                                type="button"
                                aria-label={`Remove payment detail`}
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

                {/* Always show payment summary since we have at least one default row */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total Payment Amount:</span>
                    <span className="text-lg font-semibold text-gray-900">₹{calculateTotalPaymentDetails().toLocaleString()}</span>
                  </div>
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
                    <h2 className="text-sm font-semibold text-[#101828] mb-4">
                      Invoice Settings
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          SGST Rate (%)
                        </label>
                        <Input
                          type="number"
                          value={sgstRateInput}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSgstRateInput(value);
                            setSgstRate(parseFloat(value) || 0);
                          }}
                          onFocus={() => {
                            // Clear the field when focused if it's showing the default 0
                            if (sgstRateInput === '' && sgstRate === 0) {
                              setSgstRateInput('');
                            }
                          }}
                          placeholder="0"
                          className="bg-white border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          CGST Rate (%)
                        </label>
                        <Input
                          type="number"
                          value={cgstRateInput}
                          onChange={(e) => {
                            const value = e.target.value;
                            setCgstRateInput(value);
                            setCgstRate(parseFloat(value) || 0);
                          }}
                          onFocus={() => {
                            // Clear the field when focused if it's showing the default 0
                            if (cgstRateInput === '' && cgstRate === 0) {
                              setCgstRateInput('');
                            }
                          }}
                          placeholder="0"
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
                    <h2 className="text-sm font-semibold text-[#101828] mb-4">
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
                    <h2 className="text-sm font-semibold text-[#101828] mb-4">
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
                  
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Gross Total:</span>
                    <span className="text-xs font-medium">₹{calculateFinalAmount().toLocaleString()}</span>
                  </div>

                  {paymentDetails.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Payment Amount:</span>
                      <span className="text-xs font-medium text-green-600">-₹{calculateTotalPaymentDetails().toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="pt-3">
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Final Amount:</span>
                      <span>₹{Math.max(0, calculateFinalAmount() - calculateTotalPaymentDetails()).toLocaleString()}</span>
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
