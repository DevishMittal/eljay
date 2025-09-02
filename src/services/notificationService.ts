import { CreateNotificationData, Notification } from '@/types';

class NotificationService {
  private baseUrl = '/api/notifications'; // For future API integration

  // Notification templates for common scenarios
  static createEquipmentMaintenanceNotification(
    equipmentType: string,
    location?: string,
    scheduledDate?: string
  ): CreateNotificationData {
    return {
      type: 'equipment_maintenance',
      priority: 'medium',
      title: 'Equipment Maintenance',
      message: `${equipmentType} maintenance ${scheduledDate ? `scheduled for ${scheduledDate}` : 'required'}${location ? ` at ${location}` : ''}`,
      isActionRequired: true,
      actionUrl: '/settings/equipment',
      relatedEntityType: 'equipment',
      metadata: { equipmentType, location, scheduledDate }
    };
  }

  static createAppointmentNotification(
    patientName: string,
    appointmentType: string,
    appointmentId?: string
  ): CreateNotificationData {
    return {
      type: 'schedule_appointment',
      priority: 'medium',
      title: 'Schedule Appointment',
      message: `Confirm ${patientName} appointment for ${appointmentType}`,
      isActionRequired: true,
      actionUrl: '/appointments',
      relatedEntityType: 'appointment',
      relatedEntityId: appointmentId,
      metadata: { patientName, appointmentType }
    };
  }

  static createPaymentOverdueNotification(
    patientName: string,
    invoiceNumber: string,
    amount: number,
    daysOverdue: number
  ): CreateNotificationData {
    return {
      type: 'payment_overdue',
      priority: daysOverdue > 30 ? 'urgent' : daysOverdue > 7 ? 'high' : 'medium',
      title: 'Payment Overdue',
      message: `Invoice ${invoiceNumber} for ${patientName} is ${daysOverdue} days overdue (₹${amount.toLocaleString()})`,
      isActionRequired: true,
      actionUrl: `/billing/invoices/${invoiceNumber}`,
      relatedEntityType: 'invoice',
      relatedEntityId: invoiceNumber,
      metadata: { patientName, invoiceNumber, amount, daysOverdue }
    };
  }

  static createPaymentReminderNotification(
    patientName: string,
    invoiceNumber: string,
    amount: number,
    dueInDays: number
  ): CreateNotificationData {
    return {
      type: 'payment_overdue',
      priority: dueInDays <= 1 ? 'high' : 'medium',
      title: 'Payment Reminder',
      message: `Invoice ${invoiceNumber} payment due in ${dueInDays} day${dueInDays > 1 ? 's' : ''} (₹${amount.toLocaleString()})`,
      isActionRequired: dueInDays <= 1,
      actionUrl: `/billing/invoices/${invoiceNumber}`,
      relatedEntityType: 'invoice',
      relatedEntityId: invoiceNumber,
      metadata: { patientName, invoiceNumber, amount, dueInDays }
    };
  }

  static createNewPatientNotification(
    patientName: string,
    patientId: string,
    registrationType: string = 'general'
  ): CreateNotificationData {
    return {
      type: 'new_patient_registration',
      priority: 'low',
      title: 'New Patient Registration',
      message: `${patientName} has been registered${registrationType !== 'general' ? ` for ${registrationType}` : ''}`,
      isActionRequired: false,
      actionUrl: `/patients/${patientId}`,
      relatedEntityType: 'patient',
      relatedEntityId: patientId,
      metadata: { patientName, registrationType }
    };
  }

  static createLabResultsNotification(
    patientName: string,
    patientId: string,
    testType: string
  ): CreateNotificationData {
    return {
      type: 'lab_results_ready',
      priority: 'medium',
      title: 'Lab Results Ready',
      message: `${testType} results for ${patientName} are ready for review`,
      isActionRequired: true,
      actionUrl: `/patients/${patientId}/emr`,
      relatedEntityType: 'patient',
      relatedEntityId: patientId,
      metadata: { patientName, testType }
    };
  }

  static createTaskReminderNotification(
    taskTitle: string,
    taskId: string,
    dueTime: string
  ): CreateNotificationData {
    return {
      type: 'task_reminder',
      priority: 'medium',
      title: 'Task Reminder',
      message: `Reminder: ${taskTitle} is due ${dueTime}`,
      isActionRequired: true,
      actionUrl: '/dashboard',
      relatedEntityType: 'task',
      relatedEntityId: taskId,
      metadata: { taskTitle, dueTime }
    };
  }

  static createSystemAlertNotification(
    title: string,
    message: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
  ): CreateNotificationData {
    return {
      type: 'system_alert',
      priority,
      title,
      message,
      isActionRequired: priority === 'high' || priority === 'urgent',
      metadata: { alertType: 'system' }
    };
  }

  // Future API methods (for when backend is implemented)
  async getNotifications(page = 1, limit = 50, token?: string): Promise<{ notifications: Notification[]; total: number }> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers,
      });
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string, token?: string): Promise<void> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}/${notificationId}/read`, {
        method: 'PATCH',
        headers,
      });
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string, token?: string): Promise<void> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}/${notificationId}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async createNotification(data: CreateNotificationData, token?: string): Promise<Notification> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create notification');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
export { NotificationService };
