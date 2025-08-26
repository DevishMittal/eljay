import type { Metadata } from 'next';
import MainLayout from '@/components/layout/main-layout';
import TasksAnalytics from '@/components/layout/tasks-analytics';

export const metadata: Metadata = {
  title: 'Appointments',
  description: 'Manage appointments and schedule for hearing care patients.',
  keywords: ['appointments', 'calendar', 'schedule', 'hearing care'],
};

export default function AppointmentsPage() {
  const timeSlots = [
    '8:00', '8:30', '9:00', '9:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
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
    { day: 0, time: '10:30', patient: 'Jennifer Walsh', type: 'Comprehensive He...' },
    { day: 0, time: '14:00', patient: 'Mark Stevens', type: 'Hearing Aid Consu...' },
    { day: 1, time: '10:00', patient: 'Rachel Green', type: 'Tympanometry' },
    { day: 1, time: '11:30', patient: 'Kevin Brown', type: 'BERA Testing' },
    { day: 1, time: '14:30', patient: 'Amy Foster', type: 'Initial Consultation' },
    { day: 2, time: '11:00', patient: 'Catherine Moore', type: 'Hearing Aid Trial' },
    { day: 2, time: '14:00', patient: 'Ryan Cooper', type: 'Comprehensive As...' },
    { day: 3, time: '10:30', patient: 'Nathan Clarke', type: 'Workplace Hearing...' },
    { day: 3, time: '13:30', patient: 'David Wilson', type: 'Hearing Aid Maint...' },
    { day: 3, time: '15:00', patient: 'Grace Thompson', type: 'Hearing Assessment' },
    { day: 4, time: '10:30', patient: 'Robert Lee', type: 'Hearing Aid Progra...' },
    { day: 4, time: '14:00', patient: 'James Miller', type: 'Hearing Aid Repair' },
    { day: 5, time: '11:00', patient: 'Robert Lee', type: 'Hearing Aid Progra...' },
    { day: 5, time: '14:30', patient: 'Anna Garcia', type: 'Professional Asses...' },
    { day: 6, time: '10:00', patient: 'Thomas Anders...', type: 'Weekend Consulta...' },
    { day: 6, time: '11:30', patient: 'Jennifer Walsh', type: 'Follow-up Assessm...' }
  ];

  return (
    <MainLayout showTasksSidebar={true}>
      <div className="flex h-full">
        {/* Main Calendar Area - Fixed width, scrollable content */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Fixed Header */}
          <div className="flex-shrink-0 p-4">
            {/* Header with title, date navigation, and filters all on one line */}
            <div className="flex items-center justify-between bg-white">
              {/* Title */}
              <h1 className="text-xl font-bold" style={{ color: '#101828' }}>Appointment Calendar</h1>
              
              {/* Date Navigation - Centered */}
              <div className="flex items-center space-x-4">
                <button 
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  aria-label="Previous week"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-md font-medium text-black">Jun 22 - 28, 2025</span>
                <button 
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  aria-label="Next week"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              {/* View Filters */}
              <div className="flex items-center space-x-2">
                <button 
                  className="px-3 py-1 text-sm bg-white border order text-black rounded-md"
                  style={{ boxShadow: '0px 1px 2px -1px #0000001A, 0px 1px 3px 0px #0000001A' }}
                >
                  Today
                </button>
                <div className="flex bg-gray-100 rounded-md p-1">
                  <button className="px-3 py-1 text-sm bg-gray-100 text-black rounded-md">Day</button>
                  <button 
                    className="px-3 py-1 text-sm bg-white border order text-black rounded-md"
                    style={{ boxShadow: '0px 1px 2px -1px #0000001A, 0px 1px 3px 0px #0000001A' }}
                  >
                    Week
                  </button>
                  <button className="px-3 py-1 text-sm bg-gray-100 text-black rounded-md">Month</button>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 overflow-hidden pb-4">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full" style={{ borderWidth: '0.5px' }}>
              {/* Calendar Header */}
              <div className="grid grid-cols-8  border-gray-200 sticky top-0 z-10 bg-white" style={{ borderBottomWidth: '0.5px' }}>
                <div className="p-3  border-gray-200" style={{ backgroundColor: '#F9FAFB', borderRightWidth: '0.5px' }}>
                  <span className="text-xs font-medium" style={{ color: '#6A7282' }}>TIME</span>
                </div>
                {days.map((day, index) => (
                  <div 
                    key={index} 
                    className={`p-3  border-gray-200 last:-0 ${index === 6 ? '' : ''}`}
                    style={{ 
                      backgroundColor: index === 6 ? '#EFF6FF' : '#F9FAFB',
                      borderRight: index === 6 ? 'none' : '0.5px solid #E5E7EB'
                    }}
                  >
                    <div className="text-center">
                      <div className="text-xs font-medium" style={{ color: index === 6 ? '#155DFC' : '#6A7282' }}>{day.day}</div>
                      <div className="text-sm font-bold" style={{ color: index === 6 ? '#155DFC' : '#6A7282' }}>{day.date}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Calendar Body - Scrollable with hidden scrollbar */}
              <div className="grid grid-cols-8 overflow-y-auto scrollbar-hide" style={{ height: 'calc(100vh - 200px)' }}>
                {/* Time Column */}
                <div className=" border-gray-200" style={{ borderRightWidth: '0.5px' }}>
                  {timeSlots.map((time, index) => (
                    <div 
                      key={index} 
                      className="h-16  border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer" 
                      style={{ borderBottomWidth: '0.5px' }}
                    >
                      <span className="text-xs" style={{ color: '#6A7282' }}>{time}</span>
                    </div>
                  ))}
                </div>

                {/* Day Columns */}
                {days.map((day, dayIndex) => (
                  <div 
                    key={dayIndex} 
                    className="relative"
                    style={{ 
                      borderRight: dayIndex === 6 ? 'none' : '0.5px solid #E5E7EB',
                      backgroundColor: dayIndex === 6 ? '#EFF6FF' : 'transparent'
                    }}
                  >
                    {timeSlots.map((time, timeIndex) => {
                      const appointment = appointments.find(apt => 
                        apt.day === dayIndex && apt.time === time
                      );
                      
                      return (
                        <div 
                          key={timeIndex} 
                          className="h-16  border-gray-200 relative hover:bg-gray-50 transition-colors cursor-pointer" 
                          style={{ borderBottomWidth: '0.5px' }}
                        >
                          {appointment && (
                            <div 
                              className="absolute inset-1 rounded-sm p-2 text-xs overflow-hidden"
                              style={{ 
                                backgroundColor: '#EFF6FF',
                                borderLeft: '2px solid #2B7FFF'
                              }}
                            >
                              <div className="flex items-center space-x-1 mb-1">
                                <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M6.91663 1.66666V2.83332" stroke="#6A7282" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M3.41663 1.66666V2.83332" stroke="#6A7282" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M3.41663 2.25H2.83329C2.52387 2.25 2.22713 2.37292 2.00833 2.59171C1.78954 2.8105 1.66663 3.10725 1.66663 3.41667V5.75C1.66663 6.67826 2.03537 7.5685 2.69175 8.22487C3.34813 8.88125 4.23837 9.25 5.16663 9.25C6.09488 9.25 6.98512 8.88125 7.6415 8.22487C8.29788 7.5685 8.66663 6.67826 8.66663 5.75V3.41667C8.66663 3.10725 8.54371 2.8105 8.32492 2.59171C8.10612 2.37292 7.80938 2.25 7.49996 2.25H6.91663" stroke="#6A7282" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M5.16663 9.25C5.16663 10.1783 5.53538 11.0685 6.19175 11.7249C6.84813 12.3813 7.73837 12.75 8.66663 12.75C9.59488 12.75 10.4851 12.3813 11.1415 11.7249C11.7979 11.0685 12.1666 10.1783 12.1666 9.25V7.5" stroke="#6A7282" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M12.1667 7.49999C12.811 7.49999 13.3333 6.97766 13.3333 6.33332C13.3333 5.68899 12.811 5.16666 12.1667 5.16666C11.5223 5.16666 11 5.68899 11 6.33332C11 6.97766 11.5223 7.49999 12.1667 7.49999Z" stroke="#6A7282" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span className="font-medium truncate text-xs" style={{ color: '#1C398E' }}>{appointment.patient}</span>
                              </div>
                              <div className="truncate text-xs" style={{ color: '#1C398E' }}>{appointment.type}</div>
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
        </div>

        {/* Tasks & Analytics Sidebar - Fixed width, no scroll */}
        <div className="flex-shrink-0">
          <TasksAnalytics />
        </div>
      </div>
    </MainLayout>
  );
}
