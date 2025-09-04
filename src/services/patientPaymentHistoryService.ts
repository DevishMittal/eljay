import { Invoice, Payment } from '@/types';

export interface PaymentHistoryEvent {
  id: string;
  type: 'invoice_generated' | 'payment_received';
  title: string;
  date: string;
  time: string;
  status: string;
  statusColor: string;
  iconColor: string;
  icon: string;
  details: {
    invoiceNumber?: string;
    amount: number;
    createdBy?: string;
    method?: string;
    transactionId?: string;
    processedBy?: string;
  };
  originalData: Invoice | Payment;
}

class PatientPaymentHistoryService {
  // Combine invoices and payments into a chronological timeline
  static createPaymentHistory(invoices: Invoice[], payments: Payment[]): PaymentHistoryEvent[] {
    const events: PaymentHistoryEvent[] = [];

    // Add invoice events
    invoices.forEach(invoice => {
      events.push({
        id: `invoice-${invoice.id}`,
        type: 'invoice_generated',
        title: 'Invoice Generated',
        date: invoice.invoiceDate,
        time: '12:00 am', // Default time since API doesn't provide specific time
        status: invoice.paymentStatus,
        statusColor: this.getInvoiceStatusColor(invoice.paymentStatus),
        iconColor: this.getInvoiceIconColor(invoice.paymentStatus),
        icon: 'document',
        details: {
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.totalAmount,
          createdBy: 'Dr. Sarah Johnson' // Default since API doesn't provide this
        },
        originalData: invoice
      });
    });

    // Add payment events
    payments.forEach(payment => {
      events.push({
        id: `payment-${payment.id}`,
        type: 'payment_received',
        title: 'Payment Received',
        date: payment.paymentDate,
        time: '12:00 am', // Default time since API doesn't provide specific time
        status: payment.status === 'Completed' ? 'completed' : payment.status.toLowerCase(),
        statusColor: this.getPaymentStatusColor(payment.status),
        iconColor: this.getPaymentIconColor(payment.status),
        icon: 'receipt',
        details: {
          amount: payment.amount,
          method: payment.method,
          transactionId: payment.transactionId,
          processedBy: payment.receivedBy
        },
        originalData: payment
      });
    });

    // Sort by date (newest first)
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Group events by date
  static groupEventsByDate(events: PaymentHistoryEvent[]): { [date: string]: PaymentHistoryEvent[] } {
    const grouped: { [date: string]: PaymentHistoryEvent[] } = {};

    events.forEach(event => {
      const dateKey = this.formatDateForGrouping(event.date);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    return grouped;
  }

  // Format date for grouping (e.g., "Friday, June 20, 2025")
  static formatDateForGrouping(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Get invoice status color
  private static getInvoiceStatusColor(status: string): string {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-orange-100 text-orange-800';
      case 'Partial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Get payment status color
  private static getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Get invoice icon color based on status
  private static getInvoiceIconColor(status: string): string {
    switch (status) {
      case 'Paid':
        return 'bg-green-100';
      case 'Pending':
        return 'bg-orange-100';
      case 'Partial':
        return 'bg-yellow-100';
      default:
        return 'bg-gray-100';
    }
  }

  // Get payment icon color based on status
  private static getPaymentIconColor(status: string): string {
    switch (status) {
      case 'Completed':
        return 'bg-green-100';
      case 'Pending':
        return 'bg-yellow-100';
      case 'Failed':
        return 'bg-red-100';
      case 'Cancelled':
        return 'bg-gray-100';
      default:
        return 'bg-gray-100';
    }
  }

  // Format currency
  static formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString()}`;
  }

  // Get event icon SVG
  static getEventIcon(type: string, status: string): string {
    if (type === 'invoice_generated') {
      return `
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      `;
    } else {
      return `
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      `;
    }
  }
}

export default PatientPaymentHistoryService;
