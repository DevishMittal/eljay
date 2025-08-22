/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils';

// Sample data for services
const services = [
  {
    id: 1,
    name: 'Pure Tone Audiometry',
    description: 'Detailed hearing threshold testing across frequencies',
    unitCost: 1200
  },
  {
    id: 2,
    name: 'Hearing Aid Fitting',
    description: 'Custom hearing aid fitting and programming',
    unitCost: 2500
  },
  {
    id: 3,
    name: 'Tympanometry',
    description: 'Middle ear function assessment',
    unitCost: 800
  },
  {
    id: 4,
    name: 'BERA Testing',
    description: 'Brainstem evoked response audiometry',
    unitCost: 1500
  }
];

// Sample patients
const patients = [
  { id: 1, name: 'Robert Wilson', patientId: 'PAT001' },
  { id: 2, name: 'John Smith', patientId: 'PAT002' },
  { id: 3, name: 'Maria Garcia', patientId: 'PAT003' }
];

interface InvoiceItem {
  id: number;
  serviceId: number;
  serviceName: string;
  description: string;
  qty: number;
  unitCost: number;
  discount: number;
  total: number;
}

export default function B2CInvoicePage() {
  const [invoiceNumber, setInvoiceNumber] = useState('EHC-2025-06-001');
  const [invoiceDate, setInvoiceDate] = useState('28-06-2025');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [sgstRate, setSgstRate] = useState(9);
  const [cgstRate, setCgstRate] = useState(9);
  const [notes, setNotes] = useState('');
  const [warrantyInfo, setWarrantyInfo] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now(),
      serviceId: 0,
      serviceName: '',
      description: '',
      qty: 1,
      unitCost: 0,
      discount: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: number, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate total
        if (field === 'qty' || field === 'unitCost' || field === 'discount') {
          updatedItem.total = (updatedItem.qty * updatedItem.unitCost) - updatedItem.discount;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleServiceSelect = (itemId: number, serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      updateItem(itemId, 'serviceId', serviceId);
      updateItem(itemId, 'serviceName', service.name);
      updateItem(itemId, 'description', service.description);
      updateItem(itemId, 'unitCost', service.unitCost);
      updateItem(itemId, 'total', service.unitCost);
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTotalDiscount = () => {
    return items.reduce((sum, item) => sum + item.discount, 0) + overallDiscount;
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
              Create B2C Invoice
            </h1>
            <p className="text-[#4A5565] mt-1" style={{ fontFamily: 'Segoe UI' }}>
              Create a new invoice for individual patient services.
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      Patient*
                    </label>
                                         <select
                       value={selectedPatient}
                       onChange={(e) => setSelectedPatient(e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                       aria-label="Select patient for this invoice"
                     >
                      <option value="">Select patient</option>
                      {patients.map(patient => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name} ({patient.patientId})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services & Items */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-[#101828]" style={{ fontFamily: 'Segoe UI' }}>
                    Services & Items
                  </h2>
                  <Button 
                    onClick={addItem}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Add Item
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Service/Item*</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Qty*</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Unit Cost*</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Discount</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Total</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100">
                                                     <td className="py-3 px-4">
                             <select
                               value={item.serviceId}
                               onChange={(e) => handleServiceSelect(item.id, parseInt(e.target.value))}
                               className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                               aria-label="Select service for this item"
                             >
                               <option value={0}>Select service</option>
                               {services.map(service => (
                                 <option key={service.id} value={service.id}>
                                   {service.name}
                                 </option>
                               ))}
                             </select>
                            {item.description && (
                              <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              type="number"
                              value={item.qty}
                              onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                              className="w-20 bg-white border-gray-300"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              type="number"
                              value={item.unitCost}
                              onChange={(e) => updateItem(item.id, 'unitCost', parseInt(e.target.value) || 0)}
                              className="w-24 bg-white border-gray-300"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <Input
                              type="number"
                              value={item.discount}
                              onChange={(e) => updateItem(item.id, 'discount', parseInt(e.target.value) || 0)}
                              className="w-20 bg-white border-gray-300"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium">₹{item.total.toLocaleString()}</span>
                          </td>
                          <td className="py-3 px-4">
                                                         <button
                               onClick={() => removeItem(item.id)}
                               className="text-red-500 hover:text-red-700"
                               aria-label={`Remove item ${item.serviceName || 'service'}`}
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
                      <span>Final Amount:</span>
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
