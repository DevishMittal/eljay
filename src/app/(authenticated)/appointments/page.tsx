'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/main-layout';
import TasksAnalytics from '@/components/layout/tasks-analytics';
import DynamicCalendar from '@/components/calendar/dynamic-calendar';
import WalkInAppointmentModal from '@/components/modals/walk-in-appointment-modal';
import { Appointment as CalendarAppointment, CalendarView } from '@/utils/calendar';
import { Appointment } from '@/types';
import { appointmentService } from '@/services/appointmentService';
import { useAuth } from '@/contexts/AuthContext';

// Define the type for new appointments from modal
interface NewAppointment {
  id: string;
  date: Date;
  time: string;
  patient: string;
  type: string;
  duration: number;
  totalDuration?: number;
  audiologist: string;
  notes: string;
  phoneNumber: string;
  email: string;
}

export default function AppointmentsPage() {
  const { token } = useAuth();
  // State for walk-in appointment modal
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('09:00');

  // State for appointments - start with empty array
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [apiAppointments, setApiAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch appointments from API
  useEffect(() => {
    fetchAppointments();
  }, [currentPage, token]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await appointmentService.getAppointments(currentPage, 50, token || undefined); // Get more appointments for calendar
      setApiAppointments(response.data.appointments);
      
      // Convert API appointments to calendar format
      const calendarAppointments: CalendarAppointment[] = response.data.appointments.map(appointment => {
        // Extract time from the API response (format: "1970-01-01T10:30:00.000Z")
        const timeDate = new Date(appointment.appointmentTime);
        const hours = timeDate.getUTCHours().toString().padStart(2, '0');
        const minutes = timeDate.getUTCMinutes().toString().padStart(2, '0');
        const time24 = `${hours}:${minutes}`;
        
        return {
          id: appointment.id,
          date: new Date(new Date(appointment.appointmentDate).toDateString()),
          time: time24, // Use 24-hour format to match calendar time slots
          patient: appointment.user.fullname,
          type: appointment.procedures,
          duration: appointment.appointmentDuration,
          totalDuration: appointment.totalDuration ? parseInt(appointment.totalDuration) : undefined,
          audiologist: appointment.audiologist?.name,
          phoneNumber: appointment.user.phoneNumber,
        };
      });
      
      setAppointments(calendarAppointments);
    } catch (err) {
      setError('Failed to fetch appointments. Please try again.');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle appointment click - just log for now, will add view functionality later
  const handleAppointmentClick = (appointment: CalendarAppointment) => {
    console.log('Appointment clicked:', appointment);
    // TODO: Add appointment view/edit functionality
  };

  // Handle time slot click - open walk-in appointment modal with selected date/time
  const handleTimeSlotClick = (date: Date, timeSlot: string) => {
    setSelectedDate(date);
    setSelectedTimeSlot(timeSlot);
    setIsWalkInModalOpen(true);
  };

  // Handle new appointment creation from modal
  const handleAppointmentCreated = (newAppointment: NewAppointment) => {
    // Convert the new appointment time from 12-hour to 24-hour format if needed
    let time24 = newAppointment.time;
    if (newAppointment.time.includes('AM') || newAppointment.time.includes('PM')) {
      // Convert 12-hour format to 24-hour format
      const [time, period] = newAppointment.time.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      
      let hour24 = hours;
      if (period === 'PM' && hours !== 12) {
        hour24 = hours + 12;
      } else if (period === 'AM' && hours === 12) {
        hour24 = 0;
      }
      
      time24 = `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Convert the new appointment to match the CalendarAppointment type
    const appointment: CalendarAppointment = {
      id: newAppointment.id,
      date: new Date(newAppointment.date.toDateString()),
      time: time24, // Use 24-hour format
      patient: newAppointment.patient,
      type: newAppointment.type || 'Walk-in Appointment',
      duration: newAppointment.duration,
      totalDuration: newAppointment.totalDuration,
      audiologist: newAppointment.audiologist,
      phoneNumber: newAppointment.phoneNumber,
    };
    
    // Add the new appointment to the state
    setAppointments(prev => [...prev, appointment]);
    console.log('New appointment added:', appointment);
    
    // Refresh appointments from API to get the latest data
    fetchAppointments();
  };

  // Handle date change
  const handleDateChange = (date: Date) => {
    console.log('Date changed:', date);
    // TODO: Update URL or state if needed
  };

  // Handle view change
  const handleViewChange = (view: CalendarView) => {
    console.log('View changed:', view);
    // TODO: Save view preference
  };

  if (loading) {
    return (
      <MainLayout showTasksSidebar={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading appointments...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout showTasksSidebar={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchAppointments}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showTasksSidebar={true}>
      <div className="flex h-full">
        {/* Main Calendar Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <DynamicCalendar
            appointments={appointments}
            onTimeSlotClick={handleTimeSlotClick}
            onDateChange={handleDateChange}
            onViewChange={handleViewChange}
            className="h-full"
          />
        </div>

        {/* Tasks & Analytics Sidebar */}
        <div className="flex-shrink-0">
          <TasksAnalytics onAppointmentCreated={handleAppointmentCreated} />
        </div>
      </div>

      {/* Walk-in Appointment Modal */}
      <WalkInAppointmentModal
        isOpen={isWalkInModalOpen}
        onClose={() => setIsWalkInModalOpen(false)}
        selectedDate={selectedDate}
        selectedTime={selectedTimeSlot}
        onAppointmentCreated={handleAppointmentCreated}
      />
    </MainLayout>
  );
}