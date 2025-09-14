/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InvoiceService from '@/services/invoiceService';
import { patientService } from '@/services/patientService';
import OutstandingPaymentsService from '@/services/outstandingPaymentsService';
import DiagnosticsService from '@/services/diagnosticsService';
import { InventoryService } from '@/services/inventoryService';
import { CreateInvoiceData, InvoiceService as InvoiceServiceType, OutstandingPayment, AppliedAdvancePayment, Patient, Diagnostic, InventoryItem } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomDropdown from '@/components/ui/custom-dropdown';
import DatePicker from '@/components/ui/date-picker';

export default function B2CInvoicePage() {
  const { token, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(new Date());
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [outstandingPayments, setOutstandingPayments] = useState<OutstandingPayment[]>([]);
  const [selectedPayments, setSelectedPayments] = useState<{ [key: string]: number }>({});
  const [paymentStatus, setPaymentStatus] = useState<'Pending' | 'Paid' | 'Cancelled'>('Pending');
  const [sgstRate, setSgstRate] = useState<number>(0);
  const [cgstRate, setCgstRate] = useState<number>(0);
  const [sgstRateInput, setSgstRateInput] = useState<string>('');
  const [cgstRateInput, setCgstRateInput] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [warrantyInfo, setWarrantyInfo] = useState('');
  const [services, setServices] = useState<InvoiceServiceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingOutstandingPayments, setLoadingOutstandingPayments] = useState(false);
  const [loadingDiagnostics, setLoadingDiagnostics] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);

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

  // Load patients and diagnostics on component mount
  useEffect(() => {
    if (token) {
      loadPatients();
      loadDiagnostics();
      loadInventory();
    }
  }, [token]);

  // Load outstanding payments when patient is selected
  useEffect(() => {
    if (selectedPatient && token) {
      loadOutstandingPayments(selectedPatient.id);
    } else {
      setOutstandingPayments([]);
      setSelectedPayments({});
    }
  }, [selectedPatient, token]);

  // Handle URL parameters for prefilling patient data
  useEffect(() => {
    const patientId = searchParams.get('patientId');
    const patientName = searchParams.get('patientName');
    const patientPhone = searchParams.get('patientPhone');
    
    if (patientId && patients.length > 0) {
      const patient = patients.find(p => p.id === patientId);
      if (patient) {
        setSelectedPatient(patient);
        setPatientSearchTerm(`${patient.full_name} - ${patient.mobile_number}`);
      }
    } else if (patientName && patientPhone && patients.length > 0) {
      // Try to find patient by name and phone
      const patient = patients.find(p => 
        p.full_name.toLowerCase().includes(patientName.toLowerCase()) &&
        p.mobile_number.includes(patientPhone)
      );
      if (patient) {
        setSelectedPatient(patient);
        setPatientSearchTerm(`${patient.full_name} - ${patient.mobile_number}`);
      }
    }
  }, [searchParams, patients]);

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      const response = await patientService.getPatients(1, 100, token || undefined);
      setPatients(response.patients);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  const loadDiagnostics = async () => {
    try {
      setLoadingDiagnostics(true);
      const response = await DiagnosticsService.getDiagnostics(token || undefined);
      setDiagnostics(response.data);
    } catch (error) {
      console.error('Error loading diagnostics:', error);
    } finally {
      setLoadingDiagnostics(false);
    }
  };

  const loadInventory = async () => {
    try {
      setLoadingInventory(true);
      const response = await InventoryService.getInventoryItems(1, 50); // Get more items for better selection
      setInventoryItems(response.items);
    } catch (error) {
      console.error('Error loading inventory items:', error);
    } finally {
      setLoadingInventory(false);
    }
  };

  const loadOutstandingPayments = async (patientId: string) => {
    try {
      setLoadingOutstandingPayments(true);
      const response = await OutstandingPaymentsService.getOutstandingPayments(patientId, token || undefined);
      setOutstandingPayments(response.data.outstandingPayments);
    } catch (error) {
      console.error('Error loading outstanding payments:', error);
      setOutstandingPayments([]);
    } finally {
      setLoadingOutstandingPayments(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.full_name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
    patient.mobile_number.includes(patientSearchTerm)
  );

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientSearchTerm(`${patient.full_name} - ${patient.mobile_number}`);
    setShowPatientDropdown(false);
  };

  const handlePatientSearchChange = (value: string) => {
    setPatientSearchTerm(value);
    setShowPatientDropdown(true);
    if (!value) {
      setSelectedPatient(null);
    }
  };

  const addService = () => {
    const newService: InvoiceServiceType & { diagnosticId?: string; inventoryId?: string } = {
      serviceName: '',
      description: '',
      quantity: 1,
      unitCost: 0,
      discount: 0,
      total: 0,
      diagnosticId: '',
      inventoryId: ''
    };
    setServices([...services, newService]);
  };

  const removeService = (index: number) => {
    const updatedServices = services.filter((_, i) => i !== index);
    setServices(updatedServices);
  };

  const updateService = (index: number, field: keyof InvoiceServiceType | 'diagnosticId' | 'inventoryId', value: any) => {
    const updatedServices = [...services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    
    // If diagnostic is selected, auto-populate name, description, and unit cost
    if (field === 'diagnosticId' && value) {
      const selectedDiagnostic = diagnostics.find(d => d.id === value);
      if (selectedDiagnostic) {
        updatedServices[index].serviceName = selectedDiagnostic.name;
        updatedServices[index].description = selectedDiagnostic.description;
        updatedServices[index].unitCost = selectedDiagnostic.price;
        // Clear inventory selection when diagnostic is selected
        (updatedServices[index] as any).inventoryId = '';
      }
    }
    
    // If inventory item is selected, auto-populate name, description, and MRP as unit cost
    if (field === 'inventoryId' && value) {
      const selectedInventoryItem = inventoryItems.find(item => item.id === value);
      if (selectedInventoryItem) {
        updatedServices[index].serviceName = selectedInventoryItem.itemName;
        updatedServices[index].description = selectedInventoryItem.description;
        updatedServices[index].unitCost = selectedInventoryItem.mrp;
        // Clear diagnostic selection when inventory is selected
        (updatedServices[index] as any).diagnosticId = '';
      }
    }
    
    // Calculate total when quantity, unitCost, or discount changes
    if (field === 'quantity' || field === 'unitCost' || field === 'discount' || field === 'diagnosticId' || field === 'inventoryId') {
      const service = updatedServices[index];
      const total = (service.quantity * service.unitCost) - service.discount;
      updatedServices[index].total = Math.max(0, total);
    }
    
    setServices(updatedServices);
  };

  const handlePaymentSelection = (paymentId: string, amount: number) => {
    setSelectedPayments(prev => ({
      ...prev,
      [paymentId]: amount
    }));
  };

  const calculateSubtotal = () => {
    return services.reduce((sum, service) => sum + (service.quantity * service.unitCost), 0);
  };

  const calculateTotalDiscount = () => {
    return services.reduce((sum, service) => sum + service.discount, 0);
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
    const appliedAmount = Object.values(selectedPayments).reduce((sum, amount) => sum + amount, 0);
    return calculateTaxableAmount() + tax.total - appliedAmount;
  };

  const calculateTotalFromOutstandingReceipts = () => {
    return Object.values(selectedPayments).reduce((sum, amount) => sum + amount, 0);
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

    if (!invoiceDate || !selectedPatient || services.length === 0) {
      alert('Please fill in all required fields and add at least one service');
      return;
    }

    // Validate services
    for (const service of services) {
      if (!service.serviceName || !service.description || service.quantity <= 0 || service.unitCost <= 0) {
        alert('Please fill in all required service fields');
        return;
      }
    }

    try {
      setLoading(true);
      
      const appliedAdvancePayments: AppliedAdvancePayment[] = Object.entries(selectedPayments)
        .filter(([_, amount]) => amount > 0)
        .map(([paymentId, amount]) => ({
          paymentId,
          appliedAmount: amount
        }));
      
      const invoiceData: CreateInvoiceData = {
        invoiceDate: invoiceDate.toISOString().split('T')[0],
        patientName: selectedPatient.full_name,
        patientId: selectedPatient.id,
        invoiceType: 'B2C',
        services: services.map(service => ({
          serviceName: service.serviceName,
          description: service.description,
          quantity: service.quantity,
          unitCost: service.unitCost,
          discount: service.discount
        })),
        overallDiscount: 0,
        paymentStatus,
        sgstRate,
        cgstRate,
        notes,
        appliedAdvancePayments: appliedAdvancePayments.length > 0 ? appliedAdvancePayments : undefined
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
              Create B2C Invoice
            </h1>
            <p className="text-xs text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
              Create service-based invoice for individual patient.
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="border-gray-300 text-sm" onClick={handleCancel}>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Invoice Number*
                  </label>
                  <Input
                    value="EHC-2025-09-001"
                    className="bg-gray-50 border-gray-300"
                    readOnly
                  />
                </div>
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
                <div className="relative">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                    Patient*
                    </label>
                  <div className="relative">
                    <Input
                      value={patientSearchTerm}
                      onChange={(e) => handlePatientSearchChange(e.target.value)}
                      placeholder="Select patient"
                      className="bg-white border-gray-300 pr-8"
                      onFocus={() => setShowPatientDropdown(true)}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Patient Dropdown */}
                  {showPatientDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      <div className="p-3 border-b border-gray-200">
                    <Input
                          placeholder="Search patients..."
                          value={patientSearchTerm}
                          onChange={(e) => setPatientSearchTerm(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="py-1">
                        {loadingPatients ? (
                          <div className="px-3 py-2 text-sm text-gray-500">Loading patients...</div>
                        ) : filteredPatients.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-gray-500">No patients found</div>
                        ) : (
                          filteredPatients.map((patient) => (
                            <div
                              key={patient.id}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                              onClick={() => handlePatientSelect(patient)}
                            >
                              <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{patient.full_name}</div>
                                <div className="text-xs text-gray-500">{patient.mobile_number}</div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              </CardContent>
            </Card>

          {/* Outstanding Receipts */}
          {selectedPatient && outstandingPayments.length > 0 && (
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    Outstanding Receipts
                  </h2>
                  <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {outstandingPayments.length} Available
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-4">
                  Select advance payments to apply to this invoice from {selectedPatient.full_name}.
                </p>
                
                <div className="space-y-3">
                  {outstandingPayments.map((payment) => (
                    <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedPayments[payment.id] > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handlePaymentSelection(payment.id, payment.availableAmount);
                              } else {
                                handlePaymentSelection(payment.id, 0);
                              }
                            }}
                            className="mr-3"
                            aria-label={`Select payment ${payment.receiptNumber}`}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{payment.receiptNumber}</div>
                            <div className="text-xs text-gray-500 mt-1">{payment.description}</div>
                            <div className="text-xs text-gray-500">Date: {payment.date}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">₹{payment.availableAmount.toLocaleString()} Available</div>
                          {selectedPayments[payment.id] > 0 && (
                            <div className="text-xs text-blue-600 mt-1">
                              Applied: ₹{selectedPayments[payment.id].toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {payment.paymentMethod}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Total from Outstanding Receipts:</span>
                    <span>₹{calculateTotalFromOutstandingReceipts().toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Services & Items */}
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                  Services & Items
                  </h2>
                  <Button 
                  onClick={addService}
                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs"
                  >
                  + Add Item
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">Service/Item*</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">Qty*</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">Unit Cost*</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">Discount</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">Total</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                    {services.map((service, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div className="space-y-2">
                            <select
                              value={(service as any).diagnosticId || (service as any).inventoryId || ''}
                              onChange={(e) => {
                                const selectedValue = e.target.value;
                                if (selectedValue.startsWith('diag_')) {
                                  updateService(index, 'diagnosticId', selectedValue.replace('diag_', ''));
                                } else if (selectedValue.startsWith('inv_')) {
                                  updateService(index, 'inventoryId', selectedValue.replace('inv_', ''));
                                } else {
                                  // Clear both selections
                                  updateService(index, 'diagnosticId', '');
                                  updateService(index, 'inventoryId', '');
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-xs"
                              aria-label={`Select service for item ${index + 1}`}
                            >
                              <option value="">Select Service/Item</option>
                              <optgroup label="🏥 Diagnostic Services">
                                {diagnostics.map((diagnostic) => (
                                  <option key={`diag_${diagnostic.id}`} value={`diag_${diagnostic.id}`}>
                                    {diagnostic.name} - {diagnostic.category} (₹{diagnostic.price})
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="📦 Inventory Items">
                                {inventoryItems.map((item) => (
                                  <option key={`inv_${item.id}`} value={`inv_${item.id}`}>
                                    {item.itemName} - {item.brand} (₹{item.mrp})
                                  </option>
                                ))}
                              </optgroup>
                            </select>
                            <Input
                              value={service.serviceName}
                              onChange={(e) => updateService(index, 'serviceName', e.target.value)}
                              placeholder="Service/Item name (Auto-filled or manual)"
                              className="w-full bg-white border-gray-300"
                            />
                            <Input
                              value={service.description}
                              onChange={(e) => updateService(index, 'description', e.target.value)}
                              placeholder="Description (Auto-filled or manual)"
                              className="w-full bg-white border-gray-300"
                            />
                          </div>
                        </td>
                          <td className="py-3 px-4">
                            <Input
                            type="number"
                            value={service.quantity}
                            onChange={(e) => updateService(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-20 bg-white border-gray-300"
                            min="1"
                          />
                           </td>
                        <td className="py-3 px-4">
                          <Input
                            type="number"
                            value={service.unitCost}
                            onChange={(e) => updateService(index, 'unitCost', parseInt(e.target.value) || 0)}
                            className="w-24 bg-white border-gray-300"
                            min="0"
                            placeholder="Auto-filled or manual"
                          />
                        </td>
                          <td className="py-3 px-4">
                            <Input
                              type="number"
                            value={service.discount}
                            onChange={(e) => updateService(index, 'discount', parseInt(e.target.value) || 0)}
                              className="w-20 bg-white border-gray-300"
                            min="0"
                            />
                          </td>
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium">
                            ₹{(service.total || ((service.quantity * service.unitCost) - service.discount)).toLocaleString()}
                          </div>
                        </td>
                          <td className="py-3 px-4">
                            <button
                            onClick={() => removeService(index)}
                              className="text-red-500 hover:text-red-700"
                            aria-label={`Remove service ${index + 1}`}
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
                      <span className="text-xs font-medium">₹{(calculateTaxableAmount() + calculateTax().total).toLocaleString()}</span>
                  </div>
                  
                  <div className="pt-3">
                    <div className="flex justify-between text-sm font-semibold">
                        <span>Final Amount:</span>
                      <span>₹{calculateFinalAmount().toLocaleString()}</span>
                    </div>
                  </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-700">
                      * Tax (SGST/CGST) applies only to services and accessories. Hearing aids are tax-exempt.
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