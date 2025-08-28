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

  // State for appointments - convert from const to state
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      date: new Date(2025, 7, 24), // Aug 24, 2025 (Sunday)
      time: '10:30',
      patient: 'Jennifer Walsh',
      type: 'Comprehensive Hearing Assessment',
      duration: 60
    },
    {
      id: '2',
      date: new Date(2025, 7, 24), // Aug 24, 2025 (Sunday)
      time: '14:00',
      patient: 'Mark Stevens',
      type: 'Hearing Aid Consultation',
      duration: 30
    },
    {
      id: '3',
      date: new Date(2025, 7, 25), // Aug 25, 2025 (Monday)
      time: '10:00',
      patient: 'Rachel Green',
      type: 'Tympanometry',
      duration: 30
    },
    {
      id: '4',
      date: new Date(2025, 7, 25), // Aug 25, 2025 (Monday)
      time: '11:30',
      patient: 'Kevin Brown',
      type: 'BERA Testing',
      duration: 45
    },
    {
      id: '5',
      date: new Date(2025, 7, 25), // Aug 25, 2025 (Monday)
      time: '14:30',
      patient: 'Amy Foster',
      type: 'Initial Consultation',
      duration: 60
    },
    {
      id: '6',
      date: new Date(2025, 7, 26), // Aug 26, 2025 (Tuesday)
      time: '11:00',
      patient: 'Catherine Moore',
      type: 'Hearing Aid Trial',
      duration: 45
    },
    {
      id: '7',
      date: new Date(2025, 7, 26), // Aug 26, 2025 (Tuesday)
      time: '14:00',
      patient: 'Ryan Cooper',
      type: 'Comprehensive Assessment',
      duration: 60
    },
    {
      id: '8',
      date: new Date(2025, 7, 27), // Aug 27, 2025 (Wednesday)
      time: '10:30',
      patient: 'Nathan Clarke',
      type: 'Workplace Hearing Assessment',
      duration: 45
    },
    {
      id: '9',
      date: new Date(2025, 7, 27), // Aug 27, 2025 (Wednesday)
      time: '13:30',
      patient: 'David Wilson',
      type: 'Hearing Aid Maintenance',
      duration: 30
    },
    {
      id: '10',
      date: new Date(2025, 7, 27), // Aug 27, 2025 (Wednesday)
      time: '15:00',
      patient: 'Grace Thompson',
      type: 'Hearing Assessment',
      duration: 60
    },
    {
      id: '11',
      date: new Date(2025, 7, 28), // Aug 28, 2025 (Thursday)
      time: '10:30',
      patient: 'Robert Lee',
      type: 'Hearing Aid Programming',
      duration: 30
    },
    {
      id: '12',
      date: new Date(2025, 7, 28), // Aug 28, 2025 (Thursday)
      time: '14:00',
      patient: 'James Miller',
      type: 'Hearing Aid Repair',
      duration: 45
    },
    {
      id: '13',
      date: new Date(2025, 7, 29), // Aug 29, 2025 (Friday)
      time: '11:00',
      patient: 'Robert Lee',
      type: 'Hearing Aid Programming',
      duration: 30
    },
    {
      id: '14',
      date: new Date(2025, 7, 29), // Aug 29, 2025 (Friday)
      time: '14:30',
      patient: 'Anna Garcia',
      type: 'Professional Assessment',
      duration: 60
    },
    {
      id: '15',
      date: new Date(2025, 7, 30), // Aug 30, 2025 (Saturday)
      time: '10:00',
      patient: 'Thomas Anderson',
      type: 'Weekend Consultation',
      duration: 45
    },
    {
      id: '16',
      date: new Date(2025, 7, 30), // Aug 30, 2025 (Saturday)
      time: '11:30',
      patient: 'Jennifer Walsh',
      type: 'Follow-up Assessment',
      duration: 30
    }
  ]);

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
      type: newAppointment.type,
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
          <TasksAnalytics />
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