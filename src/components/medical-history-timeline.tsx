'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
  UserAppointment,
  Payment, 
  Invoice, 
  DiagnosticAppointment,
  ClinicalNote 
} from '@/types';
import { patientService } from '@/services/patientService';
import PatientPaymentService from '@/services/patientPaymentService';
import PatientInvoiceService from '@/services/patientInvoiceService';
import { diagnosticAppointmentsService } from '@/services/diagnosticAppointmentsService';
import { clinicalNotesService } from '@/services/clinicalNotesService';
import CustomDropdown from '@/components/ui/custom-dropdown';
import { cn } from '@/utils';

interface MedicalHistoryEvent {
  id: string;
  type: 'appointment' | 'payment' | 'invoice' | 'diagnostic' | 'clinical_note';
  date: string;
  time: string;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'cancelled' | 'planned';
  amount?: number;
  method?: string;
  createdBy?: string;
  referenceId?: string;
  actions?: {
    view?: () => void;
    download?: () => void;
    print?: () => void;
  };
}

interface MedicalHistoryTimelineProps {
  patientId: string;
}

export default function MedicalHistoryTimeline({ patientId }: MedicalHistoryTimelineProps) {
  const [medicalHistoryEvents, setMedicalHistoryEvents] = useState<MedicalHistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>("All Types");
  const [statusFilter, setStatusFilter] = useState<string>("All Status");
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sorting states
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  

  console.log('MedicalHistoryTimeline rendered with patientId:', patientId);

  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        
        console.log('Fetching timeline data for patient:', patientId);
        console.log('Token available:', !!token);
        
        // Mock data for testing - similar to payment history structure
        const mockEvents: MedicalHistoryEvent[] = [
          {
            id: 'mock-1',
            type: 'appointment',
            date: '2025-01-16',
            time: '02:00 PM',
            title: 'Appointment',
            description: 'Regular consultation with Dr. Emily Davis',
            status: 'completed',
            createdBy: 'Dr. Emily Davis',
            referenceId: 'APT-001',
            actions: {
              view: () => console.log('View appointment')
            }
          },
          {
            id: 'mock-2',
            type: 'payment',
            date: '2025-01-16',
            time: '03:00 PM',
            title: 'Payment',
            description: 'Payment for consultation services',
            status: 'completed',
            amount: 1500,
            method: 'GPay',
            referenceId: 'Recpt002',
            actions: {
              view: () => console.log('View payment'),
              download: () => console.log('Download receipt')
            }
          },
          {
            id: 'mock-3',
            type: 'invoice',
            date: '2025-01-15',
            time: '11:30 AM',
            title: 'Invoice',
            description: 'Comprehensive Hearing Assessment',
            status: 'pending',
            amount: 500,
            referenceId: 'INV-2025-001',
            actions: {
              view: () => console.log('View invoice'),
              print: () => console.log('Print invoice')
            }
          },
          {
            id: 'mock-4',
            type: 'diagnostic',
            date: '2025-01-15',
            time: '10:00 AM',
            title: 'Diagnostic Completed',
            description: 'Comprehensive Hearing Assessment completed',
            status: 'completed',
            createdBy: 'Dr. Sarah Johnson',
            referenceId: 'DIAG-001',
            actions: {
              view: () => console.log('View diagnostic')
            }
          },
          {
            id: 'mock-5',
            type: 'diagnostic',
            date: '2025-01-15',
            time: '09:30 AM',
            title: 'Diagnostic Plan',
            description: 'Comprehensive Hearing Assessment planned',
            status: 'completed',
            createdBy: 'Dr. Sarah Johnson',
            referenceId: 'PLAN-001'
          },
          {
            id: 'mock-6',
            type: 'appointment',
            date: '2025-01-15',
            time: '09:00 AM',
            title: 'Appointment',
            description: 'Initial consultation with Dr. Sarah Johnson',
            status: 'completed',
            createdBy: 'Dr. Sarah Johnson',
            referenceId: 'APT-002'
          }
        ];

        // Try to fetch real data, but fall back to mock data if there are issues
        try {
          const [
            appointmentsResponse,
            paymentsResponse,
            invoicesResponse,
            diagnosticAppointmentsResponse,
            clinicalNotesResponse
          ] = await Promise.allSettled([
            patientService.getUserAppointments(patientId, token || undefined),
            PatientPaymentService.getPatientPayments(patientId).catch(err => {
              console.warn('Failed to fetch patient payments:', err.message);
              return { status: 'rejected', reason: err };
            }),
            PatientInvoiceService.getPatientInvoices(patientId).catch(err => {
              console.warn('Failed to fetch patient invoices:', err.message);
              return { status: 'rejected', reason: err };
            }),
            diagnosticAppointmentsService.getDiagnosticAppointments(token || undefined),
            clinicalNotesService.getClinicalNotes(patientId, 1, 50, token || undefined)
          ]);

          console.log('API Responses:', {
            appointments: appointmentsResponse.status === 'fulfilled' ? appointmentsResponse.value : appointmentsResponse.reason,
            payments: paymentsResponse.status === 'fulfilled' ? paymentsResponse.value : paymentsResponse.reason,
            invoices: invoicesResponse.status === 'fulfilled' ? invoicesResponse.value : invoicesResponse.reason,
            diagnostics: diagnosticAppointmentsResponse.status === 'fulfilled' ? diagnosticAppointmentsResponse.value : diagnosticAppointmentsResponse.reason,
            clinicalNotes: clinicalNotesResponse.status === 'fulfilled' ? clinicalNotesResponse.value : clinicalNotesResponse.reason
          });

          const events: MedicalHistoryEvent[] = [];

        // Process appointments
        if (appointmentsResponse.status === 'fulfilled' && appointmentsResponse.value?.data?.appointments) {
          const appointments = appointmentsResponse.value.data.appointments;
          console.log(`Processing ${appointments.length} appointments`);
          appointments.forEach((appointment: UserAppointment) => {
            const appointmentDate = new Date(appointment.appointmentDate);
            const appointmentTime = new Date(appointment.appointmentTime);
            
            events.push({
              id: `appointment-${appointment.id}`,
              type: 'appointment',
              date: appointmentDate.toISOString().split('T')[0],
              time: appointmentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              }),
              title: 'Appointment',
              description: appointment.procedures || 'Consultation appointment',
              status: appointment.visitStatus === 'check_in' ? 'completed' : 'pending',
              createdBy: appointment.audiologist?.name || 'Unknown Doctor',
              referenceId: `APT-${appointment.id}`,
              actions: {
                view: () => window.open(`/appointments/${appointment.id}`, '_blank')
              }
            });
          });
        }

        // Process payments
        if (paymentsResponse.status === 'fulfilled' && paymentsResponse.value && 'data' in paymentsResponse.value && paymentsResponse.value.data?.payments) {
          const payments = paymentsResponse.value.data.payments;
          console.log(`Processing ${payments.length} payments`);
          payments.forEach((payment: Payment) => {
            const paymentDate = new Date(payment.paymentDate);
            const paymentTime = new Date(payment.createdAt);
            
            events.push({
              id: `payment-${payment.id}`,
              type: 'payment',
              date: paymentDate.toISOString().split('T')[0],
              time: paymentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              }),
              title: 'Payment',
              description: payment.description || 'Payment received',
              status: payment.status === 'Completed' ? 'completed' : 'pending',
              amount: payment.amount,
              method: payment.method,
              referenceId: payment.receiptNumber,
              actions: {
                view: () => window.open(`/billing/payments/${payment.id}`, '_blank'),
                download: () => {
                  // Implement download functionality
                  console.log('Download payment receipt:', payment.id);
                }
              }
            });
          });
        } else if (paymentsResponse.status === 'rejected') {
          console.log('Patient payments API failed, trying to fetch all payments and filter...');
          // Try to fetch all payments and filter by patient name (fallback approach)
          try {
            const allPaymentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://eljay-api.vizdale.com/api/v1'}/payments?page=1&limit=1000`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            if (allPaymentsResponse.ok) {
              const allPaymentsData = await allPaymentsResponse.json();
              const patientPayments = allPaymentsData.data.payments.filter((payment: Payment) => 
                payment.patientId === patientId
              );
              
              console.log(`Found ${patientPayments.length} payments for patient via fallback method`);
              patientPayments.forEach((payment: Payment) => {
                const paymentDate = new Date(payment.paymentDate);
                const paymentTime = new Date(payment.createdAt);
                
                events.push({
                  id: `payment-${payment.id}`,
                  type: 'payment',
                  date: paymentDate.toISOString().split('T')[0],
                  time: paymentTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  }),
                  title: 'Payment',
                  description: payment.description || 'Payment received',
                  status: payment.status === 'Completed' ? 'completed' : 'pending',
                  amount: payment.amount,
                  method: payment.method,
                  referenceId: payment.receiptNumber,
                  actions: {
                    view: () => window.open(`/billing/payments/${payment.id}`, '_blank'),
                    download: () => {
                      console.log('Download payment receipt:', payment.id);
                    }
                  }
                });
              });
            }
          } catch (fallbackError) {
            console.warn('Fallback payment fetch also failed:', fallbackError);
          }
        }

        // Process invoices
        if (invoicesResponse.status === 'fulfilled' && invoicesResponse.value && 'data' in invoicesResponse.value && invoicesResponse.value.data?.invoices) {
          const invoices = invoicesResponse.value.data.invoices;
          console.log(`Processing ${invoices.length} invoices`);
          invoices.forEach((invoice: Invoice) => {
            const invoiceDate = new Date(invoice.invoiceDate);
            const invoiceTime = new Date(invoice.createdAt);
            
            events.push({
              id: `invoice-${invoice.id}`,
              type: 'invoice',
              date: invoiceDate.toISOString().split('T')[0],
              time: invoiceTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              }),
              title: 'Invoice',
              description: invoice.screenings?.[0]?.diagnosticName || 'Service Invoice',
              status: invoice.paymentStatus === 'Paid' ? 'completed' : 'pending',
              amount: invoice.totalAmount,
              referenceId: invoice.invoiceNumber,
              actions: {
                view: () => window.open(`/billing/invoices/${invoice.id}`, '_blank'),
                print: () => {
                  // Implement print functionality
                  console.log('Print invoice:', invoice.id);
                }
              }
            });
          });
        } else if (invoicesResponse.status === 'rejected') {
          console.log('Patient invoices API failed, trying to fetch all invoices and filter...');
          // Try to fetch all invoices and filter by patient name (fallback approach)
          try {
            const allInvoicesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://eljay-api.vizdale.com/api/v1'}/invoices?page=1&limit=1000`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            if (allInvoicesResponse.ok) {
              const allInvoicesData = await allInvoicesResponse.json();
              const patientInvoices = allInvoicesData.data.invoices.filter((invoice: Invoice) => 
                invoice.patientId === patientId
              );
              
              console.log(`Found ${patientInvoices.length} invoices for patient via fallback method`);
              patientInvoices.forEach((invoice: Invoice) => {
                const invoiceDate = new Date(invoice.invoiceDate);
                const invoiceTime = new Date(invoice.createdAt);
                
                events.push({
                  id: `invoice-${invoice.id}`,
                  type: 'invoice',
                  date: invoiceDate.toISOString().split('T')[0],
                  time: invoiceTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                  }),
                  title: 'Invoice',
                  description: invoice.screenings?.[0]?.diagnosticName || 'Service Invoice',
                  status: invoice.paymentStatus === 'Paid' ? 'completed' : 'pending',
                  amount: invoice.totalAmount,
                  referenceId: invoice.invoiceNumber,
                  actions: {
                    view: () => window.open(`/billing/invoices/${invoice.id}`, '_blank'),
                    print: () => {
                      console.log('Print invoice:', invoice.id);
                    }
                  }
                });
              });
            }
          } catch (fallbackError) {
            console.warn('Fallback invoice fetch also failed:', fallbackError);
          }
        }

        // Process diagnostic appointments
        if (diagnosticAppointmentsResponse.status === 'fulfilled' && diagnosticAppointmentsResponse.value?.data?.appointments) {
          const diagnosticAppointments = diagnosticAppointmentsResponse.value.data.appointments;
          const patientDiagnostics = diagnosticAppointments.filter(
            (diagnostic: DiagnosticAppointment) => diagnostic.userId === patientId
          );
          console.log(`Processing ${patientDiagnostics.length} diagnostic appointments for patient ${patientId}`);
          
          patientDiagnostics.forEach((diagnostic: DiagnosticAppointment) => {
            const diagnosticDate = new Date(diagnostic.appointmentDate);
            const diagnosticTime = new Date(diagnostic.createdAt);
            
            // Add diagnostic plan event
            events.push({
              id: `diagnostic-plan-${diagnostic.id}`,
              type: 'diagnostic',
              date: diagnosticDate.toISOString().split('T')[0],
              time: diagnosticTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              }),
              title: 'Diagnostic Plan',
              description: diagnostic.procedures || 'Diagnostic assessment planned',
              status: 'completed',
              createdBy: diagnostic.audiologist?.name || 'Unknown Doctor',
              referenceId: `PLAN-${diagnostic.id}`
            });

            // Add diagnostic completed event if status is completed
            if (diagnostic.status === 'completed') {
              events.push({
                id: `diagnostic-completed-${diagnostic.id}`,
                type: 'diagnostic',
                date: diagnosticDate.toISOString().split('T')[0],
                time: diagnosticTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                }),
                title: 'Diagnostic Completed',
                description: diagnostic.procedures || 'Diagnostic assessment completed',
                status: 'completed',
                createdBy: diagnostic.audiologist?.name || 'Unknown Doctor',
                referenceId: `DIAG-${diagnostic.id}`,
                actions: {
                  view: () => window.open(`/patients/${patientId}/diagnostics/${diagnostic.id}`, '_blank')
                }
              });
            }
          });
        }

        // Process clinical notes
        if (clinicalNotesResponse.status === 'fulfilled' && clinicalNotesResponse.value?.clinicalNotes) {
          const clinicalNotes = clinicalNotesResponse.value.clinicalNotes;
          console.log(`Processing ${clinicalNotes.length} clinical notes`);
          clinicalNotes.forEach((note: ClinicalNote) => {
            const noteDate = new Date(note.createdAt);
            
            events.push({
              id: `clinical-note-${note.id}`,
              type: 'clinical_note',
              date: noteDate.toISOString().split('T')[0],
              time: noteDate.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              }),
              title: 'Clinical Note',
              description: note.title,
              status: 'completed',
              referenceId: `NOTE-${note.id}`
            });
          });
        }

        // Sort events by date and time (newest first)
        events.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateB.getTime() - dateA.getTime();
        });

          console.log('Total events created:', events.length);
          console.log('Events by type:', {
            appointments: events.filter(e => e.type === 'appointment').length,
            payments: events.filter(e => e.type === 'payment').length,
            invoices: events.filter(e => e.type === 'invoice').length,
            diagnostics: events.filter(e => e.type === 'diagnostic').length,
            clinical_notes: events.filter(e => e.type === 'clinical_note').length
          });
          console.log('All events:', events);
          
          // Use real data if available, otherwise use mock data as fallback
          if (events.length > 0) {
            console.log('Using real data from APIs');
            setMedicalHistoryEvents(events);
          } else {
            console.log('No real data found, using mock data as fallback');
            setMedicalHistoryEvents(mockEvents);
          }
        } catch (apiError) {
          console.error('Error fetching real data, using mock data:', apiError);
          setMedicalHistoryEvents(mockEvents);
        }
      } catch (err) {
        console.error('Error fetching timeline data:', err);
        setError('Failed to load medical history timeline');
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchTimelineData();
    }
  }, [patientId]);

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    const filtered = medicalHistoryEvents.filter(event => {
      const matchesType = typeFilter === "All Types" || event.type === typeFilter.toLowerCase();
      const matchesStatus = statusFilter === "All Status" || event.status === statusFilter.toLowerCase();
      const matchesSearch = searchTerm === '' || 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.referenceId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesType && matchesStatus && matchesSearch;
    });

    // Sort events
    filtered.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortField) {
        case 'date':
          aValue = new Date(`${a.date}T${a.time}`).getTime();
          bValue = new Date(`${b.date}T${b.time}`).getTime();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'amount':
          aValue = a.amount || 0;
          bValue = b.amount || 0;
          break;
        default:
          aValue = new Date(`${a.date}T${a.time}`).getTime();
          bValue = new Date(`${b.date}T${b.time}`).getTime();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortDirection === 'asc' 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    return filtered;
  }, [medicalHistoryEvents, typeFilter, statusFilter, searchTerm, sortField, sortDirection]);

  // Helper functions
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'appointment': return 'bg-blue-100 text-blue-800';
      case 'payment': return 'bg-green-100 text-green-800';
      case 'invoice': return 'bg-orange-100 text-orange-800';
      case 'diagnostic': return 'bg-purple-100 text-purple-800';
      case 'clinical_note': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'planned': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return (
      <svg className={`w-4 h-4 ml-1 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    );
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading medical history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Medical History Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          {/* Section Header */}
          <div className="flex justify-between items-center p-6 mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-sm text-[#101828] font-sans">
                Medical History
              </h2>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">{filteredAndSortedEvents.length}</span>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
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
                  placeholder="Search medical history..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-100 placeholder-[#717182] h-9 w-full rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
            <CustomDropdown
              options={[
                { value: "All Types", label: "All Types" },
                { value: "appointment", label: "Appointments" },
                { value: "payment", label: "Payments" },
                { value: "invoice", label: "Invoices" },
                { value: "diagnostic", label: "Diagnostics" },
                { value: "clinical_note", label: "Clinical Notes" }
              ]}
              value={typeFilter}
              onChange={setTypeFilter}
              placeholder="All Types"
              className="h-9 text-xs"
              aria-label="Filter by type"
            />
            <CustomDropdown
              options={[
                { value: "All Status", label: "All Status" },
                { value: "completed", label: "Completed" },
                { value: "pending", label: "Pending" },
                { value: "cancelled", label: "Cancelled" },
                { value: "planned", label: "Planned" }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="All Status"
              className="h-9 text-xs"
              aria-label="Filter by status"
            />
          </div>

          {/* Medical History Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th 
                    className="text-left py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("date")}
                  >
                    Date & Time
                    {getSortIcon("date")}
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("type")}
                  >
                    Type
                    {getSortIcon("type")}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Description</th>
                  <th 
                    className="text-left py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("status")}
                  >
                    Status
                    {getSortIcon("status")}
                  </th>
                  <th 
                    className="text-left py-3 px-4 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("amount")}
                  >
                    Amount
                    {getSortIcon("amount")}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Reference</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Medical History Found</h3>
                      <p className="text-gray-500">No medical activities match your current filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedEvents.map((event) => (
                    <tr 
                      key={event.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => event.actions?.view?.()}
                    >
                      <td className="py-3 px-4 text-sm text-gray-900">
                        <div>
                          <div>{formatDate(event.date)}</div>
                          <div className="text-xs text-gray-500">{event.time}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getTypeColor(event.type))}>
                          {event.title}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={event.description}>
                          {event.description}
                        </div>
                        {event.createdBy && (
                          <div className="text-xs text-gray-500 mt-1">by {event.createdBy}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(event.status))}>
                          {event.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {event.amount ? formatCurrency(event.amount) : '-'}
                        {event.method && (
                          <div className="text-xs text-gray-500 mt-1">via {event.method}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {event.referenceId || '-'}
                      </td>
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex space-x-2">
                          {event.actions?.view && (
                            <button 
                              onClick={event.actions.view}
                              className="text-gray-400 hover:text-gray-600"
                              aria-label={`View ${event.title.toLowerCase()}`}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          )}
                          {event.actions?.download && (
                            <button 
                              onClick={event.actions.download}
                              className="text-gray-400 hover:text-gray-600"
                              aria-label={`Download ${event.title.toLowerCase()}`}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                          )}
                          {event.actions?.print && (
                            <button 
                              onClick={event.actions.print}
                              className="text-gray-400 hover:text-gray-600"
                              aria-label={`Print ${event.title.toLowerCase()}`}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 p-6">
            <p className="text-sm text-gray-600">
              Showing {filteredAndSortedEvents.length} of {medicalHistoryEvents.length} medical history entries
              {(typeFilter !== "All Types" || statusFilter !== "All Status" || searchTerm) && ' (filtered)'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}