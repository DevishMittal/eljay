import { Notification } from '@/types';

// API base URL - adjust based on your backend configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// Helper function to make authenticated API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  } catch {
    // Return empty data structure when API is not available
    return { data: [] };
  }
};

// Fetch today's appointments
export const fetchTodaysAppointments = async (): Promise<number> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await apiCall(`/appointments?startDate=${today}&endDate=${today}`);
    return response.data?.length || 0;
  } catch {
    return 0;
  }
};

// Fetch pending tasks
export const fetchPendingTasks = async (): Promise<number> => {
  try {
    const response = await apiCall('/appointments/tasks?status=pending');
    return response.data?.length || 0;
  } catch {
    return 0;
  }
};

// Fetch low stock items
export const fetchLowStockItems = async (): Promise<number> => {
  try {
    const response = await apiCall('/inventory?status=Low Stock');
    return response.data?.length || 0;
  } catch {
    return 0;
  }
};

// Fetch overdue payments
export const fetchOverduePayments = async (): Promise<number> => {
  try {
    const response = await apiCall('/payments?status=Overdue');
    return response.data?.length || 0;
  } catch {
    return 0;
  }
};

// Fetch expired inventory items
export const fetchExpiredItems = async (): Promise<number> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await apiCall(`/inventory?expiresBefore=${today}`);
    return response.data?.length || 0;
  } catch {
    return 0;
  }
};

// Fetch recent patient registrations
export const fetchRecentPatients = async (): Promise<number> => {
  try {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const response = await apiCall(`/users?startDate=${yesterday.toISOString().split('T')[0]}&endDate=${today.toISOString().split('T')[0]}`);
    return response.data?.length || 0;
  } catch {
    return 0;
  }
};

// Generate notifications based on real data
export const generateRealTimeNotifications = async (): Promise<Notification[]> => {
  const notifications: Notification[] = [];
  
  try {
    // Fetch all data in parallel
    const [
      todaysAppointments,
      pendingTasks,
      lowStockItems,
      overduePayments,
      expiredItems,
      recentPatients
    ] = await Promise.all([
      fetchTodaysAppointments(),
      fetchPendingTasks(),
      fetchLowStockItems(),
      fetchOverduePayments(),
      fetchExpiredItems(),
      fetchRecentPatients()
    ]);


    // Generate notifications based on real data
    if (pendingTasks > 0) {
      notifications.push({
        id: `pending-tasks-${Date.now()}`,
        type: 'pending_tasks',
        priority: 'high',
        title: 'Pending Tasks',
        message: `You have ${pendingTasks} pending tasks requiring attention`,
        isRead: false,
      isActionRequired: true,
        createdAt: new Date(),
      actionUrl: '/dashboard',
      relatedEntityType: 'task',
        metadata: { taskCount: pendingTasks }
      });
    }

    if (lowStockItems > 0) {
      notifications.push({
        id: `low-stock-${Date.now()}`,
        type: 'low_stock',
        priority: 'medium',
        title: 'Low Stock Alert',
        message: `${lowStockItems} inventory items are running low on stock`,
        isRead: false,
        isActionRequired: true,
        createdAt: new Date(),
        actionUrl: '/inventory',
        relatedEntityType: 'inventory',
        metadata: { itemCount: lowStockItems }
      });
    }

    if (overduePayments > 0) {
      notifications.push({
        id: `overdue-payment-${Date.now()}`,
        type: 'overdue_payment',
        priority: 'high',
        title: 'Overdue Payments',
        message: `${overduePayments} payments are overdue`,
        isRead: false,
        isActionRequired: true,
        createdAt: new Date(),
        actionUrl: '/billing/payments',
        relatedEntityType: 'payment',
        metadata: { paymentCount: overduePayments }
      });
    }

    if (todaysAppointments > 0) {
      notifications.push({
        id: `todays-appointments-${Date.now()}`,
        type: 'todays_appointments',
        priority: 'medium',
        title: 'Today\'s Appointments',
        message: `You have ${todaysAppointments} appointments scheduled for today`,
        isRead: false,
        isActionRequired: false,
        createdAt: new Date(),
        actionUrl: '/appointments',
        relatedEntityType: 'appointment',
        metadata: { appointmentCount: todaysAppointments }
      });
    }

    if (expiredItems > 0) {
      notifications.push({
        id: `expired-items-${Date.now()}`,
        type: 'expired_items',
        priority: 'high',
        title: 'Expired Items',
        message: `${expiredItems} inventory items have expired`,
        isRead: false,
        isActionRequired: true,
        createdAt: new Date(),
        actionUrl: '/inventory',
        relatedEntityType: 'inventory',
        metadata: { expiredCount: expiredItems }
      });
    }

    if (recentPatients > 0) {
      notifications.push({
        id: `new-patients-${Date.now()}`,
        type: 'new_patient_registration',
        priority: 'low',
        title: 'New Patient Registrations',
        message: `${recentPatients} new patients registered recently`,
        isRead: false,
        isActionRequired: false,
        createdAt: new Date(),
        actionUrl: '/patients',
        relatedEntityType: 'patient',
        metadata: { patientCount: recentPatients }
      });
    }

  } catch {
    // Silent error handling - no console output
  }

  return notifications;
};

// Check for specific notification triggers
export const checkNotificationTriggers = async (): Promise<Notification[]> => {
  const notifications: Notification[] = [];
  
  try {
    // Check for equipment maintenance reminders (if you have equipment tracking)
    const maintenanceReminders = await checkEquipmentMaintenance();
    notifications.push(...maintenanceReminders);

    // Check for lab results ready (if you have lab integration)
    const labResults = await checkLabResults();
    notifications.push(...labResults);

    // Check for system alerts
    const systemAlerts = await checkSystemAlerts();
    notifications.push(...systemAlerts);

    // Check for appointment reminders
    const appointmentReminders = await checkAppointmentReminders();
    notifications.push(...appointmentReminders);

    // Check for payment reminders
    const paymentReminders = await checkPaymentReminders();
    notifications.push(...paymentReminders);

    } catch {
    // Silent error handling - no console output
  }

  return notifications;
};

// Helper functions for specific checks
const checkEquipmentMaintenance = async (): Promise<Notification[]> => {
  // Implement equipment maintenance checks based on your backend
  // This would check for equipment that needs maintenance
  return [];
};

const checkLabResults = async (): Promise<Notification[]> => {
  // Implement lab results checks based on your backend
  // This would check for completed lab tests
  return [];
};

const checkSystemAlerts = async (): Promise<Notification[]> => {
  // Implement system alert checks
  // This could check for system health, backup status, etc.
  return [];
};

const checkAppointmentReminders = async (): Promise<Notification[]> => {
  const notifications: Notification[] = [];
  
  try {
    // Check for appointments starting in the next 30 minutes
    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    
    const response = await apiCall(`/appointments?startDate=${now.toISOString()}&endDate=${thirtyMinutesFromNow.toISOString()}`);
    const upcomingAppointments = response.data || [];
    
    upcomingAppointments.forEach((appointment: {
      id: string;
      user?: { fullname: string };
      appointmentDate: string;
      appointmentDuration: number;
    }) => {
      notifications.push({
        id: `appointment-reminder-${appointment.id}`,
        type: 'schedule_appointment',
        priority: 'medium',
        title: 'Upcoming Appointment',
        message: `Appointment with ${appointment.user?.fullname || 'Patient'} in 30 minutes`,
        isRead: false,
        isActionRequired: false,
        createdAt: new Date(),
        actionUrl: `/appointments/${appointment.id}`,
        relatedEntityType: 'appointment',
        relatedEntityId: appointment.id,
        metadata: { 
          patientName: appointment.user?.fullname,
          appointmentTime: appointment.appointmentDate,
          duration: appointment.appointmentDuration
        }
      });
    });
    } catch {
    // Silent error handling
  }
  
  return notifications;
};

const checkPaymentReminders = async (): Promise<Notification[]> => {
  const notifications: Notification[] = [];
  
  try {
    // Check for payments that are due soon (within 3 days)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const response = await apiCall(`/payments?dueDate=${threeDaysFromNow.toISOString().split('T')[0]}&status=Pending`);
    const duePayments = response.data || [];
    
    duePayments.forEach((payment: {
      id: string;
      amount: number;
      patientName: string;
      paymentDate: string;
    }) => {
      notifications.push({
        id: `payment-reminder-${payment.id}`,
        type: 'payment_overdue',
        priority: 'medium',
        title: 'Payment Due Soon',
        message: `Payment of ₹${payment.amount} from ${payment.patientName} is due soon`,
        isRead: false,
        isActionRequired: true,
        createdAt: new Date(),
        actionUrl: `/billing/payments/${payment.id}`,
        relatedEntityType: 'payment',
        relatedEntityId: payment.id,
        metadata: { 
          patientName: payment.patientName,
          amount: payment.amount,
          dueDate: payment.paymentDate
        }
      });
    });
    } catch {
    // Silent error handling
}

  return notifications;
};

