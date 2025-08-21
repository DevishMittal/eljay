import type { Metadata } from 'next';
import MainLayout from '@/components/layout/main-layout';

export const metadata: Metadata = {
  title: 'Appointments',
  description: 'Manage appointments and schedule for hearing care patients.',
  keywords: ['appointments', 'calendar', 'schedule', 'hearing care'],
};

export default function AppointmentsPage() {
  const timeSlots = [
    '8:00', '8:30', '9:00', '9:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'
  ];

  const days = [
    { day: 'SUN', date: '22' },
    { day: 'MON', date: '23' },
    { day: 'TUE', date: '24' },
    { day: 'WED', date: '25' },
    { day: 'THU', date: '26' },
    { day: 'FRI', date: '27' },
    { day: 'SAT', date: '28' }
  ];

  const appointments = [
    { day: 1, time: '10:00', patient: 'Rachel Green', type: 'Tympanometry' },
    { day: 3, time: '10:30', patient: 'Jennifer Walsh', type: 'Comprehensive He...' },
    { day: 6, time: '10:00', patient: 'Thomas Anders...', type: 'Weekend Consulta...' },
    { day: 6, time: '14:00', patient: 'Jennifer Walsh', type: 'Follow-up Assessm...' }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Appointment Calendar</h1>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-border">
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Previous week"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-lg font-medium text-foreground">Jun 22 - 28, 2025</span>
            <button 
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Next week"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors">Today</button>
            <button className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors">Day</button>
            <button className="px-3 py-1 text-sm bg-accent text-accent-foreground rounded-md">Week</button>
            <button className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors">Month</button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          {/* Calendar Header */}
          <div className="grid grid-cols-8 border-b border-border">
            <div className="p-3 border-r border-border bg-muted/50">
              <span className="text-sm font-medium text-muted-foreground">Time</span>
            </div>
            {days.map((day, index) => (
              <div key={index} className="p-3 border-r border-border bg-muted/50 last:border-r-0">
                <div className="text-center">
                  <div className="text-sm font-medium text-foreground">{day.day}</div>
                  <div className="text-lg font-bold text-foreground">{day.date}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Calendar Body */}
          <div className="grid grid-cols-8">
            {/* Time Column */}
            <div className="border-r border-border">
              {timeSlots.map((time, index) => (
                <div key={index} className="h-16 border-b border-border flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">{time}</span>
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {days.map((day, dayIndex) => (
              <div key={dayIndex} className="border-r border-border last:border-r-0 relative">
                {timeSlots.map((time, timeIndex) => {
                  const appointment = appointments.find(apt => 
                    apt.day === dayIndex + 1 && apt.time === time
                  );
                  
                  return (
                    <div key={timeIndex} className="h-16 border-b border-border relative">
                      {appointment && (
                        <div className="absolute inset-1 bg-blue-100 border border-blue-200 rounded-md p-2 text-xs">
                          <div className="font-medium text-blue-900">{appointment.patient}</div>
                          <div className="text-blue-700">{appointment.type}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
