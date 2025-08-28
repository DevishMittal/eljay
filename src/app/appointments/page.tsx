'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/main-layout';
import TasksAnalytics from '@/components/layout/tasks-analytics';
import DynamicCalendar from '@/components/calendar/dynamic-calendar';
import WalkInAppointmentModal from '@/components/modals/walk-in-appointment-modal';
import { Appointment, CalendarView } from '@/utils/calendar';

// Define the type for new appointments from modal
interface NewAppointment {
  id: string;
  date: Date;
  time: string;
  patient: string;
  type: string;
  duration: number;
  audiologist: string;
  notes: string;
  phoneNumber: string;
  email: string;
}

export default function AppointmentsPage() {
  // State for walk-in appointment modal
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('09:00');

  // State for appointments - start with empty array
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Handle appointment click - just log for now, will add view functionality later
  const handleAppointmentClick = (appointment: Appointment) => {
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
    // Convert the new appointment to match the Appointment type
    const appointment: Appointment = {
      id: newAppointment.id,
      date: newAppointment.date,
      time: newAppointment.time,
      patient: newAppointment.patient,
      type: newAppointment.type || 'Walk-in Appointment',
      duration: newAppointment.duration,
    };
    
    // Add the new appointment to the state
    setAppointments(prev => [...prev, appointment]);
    console.log('New appointment added:', appointment);
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

  return (
    <MainLayout showTasksSidebar={true}>
      <div className="flex h-full">
        {/* Main Calendar Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <DynamicCalendar
            appointments={appointments}
            onAppointmentClick={handleAppointmentClick}
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