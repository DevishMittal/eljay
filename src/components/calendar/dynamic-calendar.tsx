'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/utils';
import {
  CalendarView,
  CalendarDate,
  TimeSlot,
  Appointment,
  getToday,
  getCalendarDate,
  getWeekDays,
  getMonthCalendar,
  getPreviousPeriod,
  getNextPeriod,
  getDateRangeText,
  generateTimeSlots,
  getAppointmentsForDate,
  getAppointmentsForTimeSlot,
  isSameDay
} from '@/utils/calendar';

interface DynamicCalendarProps {
  appointments?: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onTimeSlotClick?: (date: Date, timeSlot: string) => void;
  onDateChange?: (date: Date) => void;
  onViewChange?: (view: CalendarView) => void;
  className?: string;
}

export default function DynamicCalendar({
  appointments = [],
  onAppointmentClick,
  onTimeSlotClick,
  onDateChange,
  onViewChange,
  className
}: DynamicCalendarProps) {
  const [currentDate, setCurrentDate] = useState(getToday());
  const [currentView, setCurrentView] = useState<CalendarView>('week');

  // Generate time slots
  const timeSlots = useMemo(() => generateTimeSlots(8, 23, 30), []);

  // Get calendar data based on current view
  const calendarData = useMemo(() => {
    switch (currentView) {
      case 'day':
        return [getCalendarDate(currentDate)];
      case 'week':
        return getWeekDays(currentDate);
      case 'month':
        return getMonthCalendar(currentDate);
      default:
        return getWeekDays(currentDate);
    }
  }, [currentDate, currentView]);

  // Navigate to previous period
  const handlePrevious = () => {
    const newDate = getPreviousPeriod(currentDate, currentView);
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  // Navigate to next period
  const handleNext = () => {
    const newDate = getNextPeriod(currentDate, currentView);
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  // Go to today
  const handleToday = () => {
    const today = getToday();
    setCurrentDate(today);
    setCurrentView('week'); // Switch to week view when clicking Today
    onDateChange?.(today);
    onViewChange?.('week');
  };

  // Change view
  const handleViewChange = (view: CalendarView) => {
    setCurrentView(view);
    onViewChange?.(view);
  };

  // Handle time slot click
  const handleTimeSlotClick = (date: Date, timeSlot: string) => {
    onTimeSlotClick?.(date, timeSlot);
  };

  // Handle appointment click
  const handleAppointmentClick = (appointment: Appointment) => {
    onAppointmentClick?.(appointment);
  };

  // Render appointment component
  const renderAppointment = (appointment: Appointment) => (
    <div
      key={appointment.id}
      className="absolute inset-1 rounded-sm p-2 text-xs overflow-hidden cursor-pointer hover:shadow-md transition-shadow bg-blue-50 border-l-2 border-blue-500"
      onClick={() => handleAppointmentClick(appointment)}
      title={`${appointment.patient} - ${appointment.type}`}
    >
      <div className="flex items-center space-x-1 mb-1">
        <svg className="w-2.5 h-2.5 flex-shrink-0 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="font-medium truncate text-blue-900">{appointment.patient}</span>
      </div>
      <div className="truncate text-blue-800">{appointment.type}</div>
    </div>
  );

  // Render day view
  const renderDayView = () => {
    const dayData = calendarData[0] as CalendarDate;
    const dayAppointments = getAppointmentsForDate(appointments, dayData.date);

    return (
      <div className="flex-1 overflow-hidden">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full">
          {/* Day Header */}
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{dayData.day}</div>
              <div className="text-sm text-gray-600">{dayData.dayName}</div>
              <div className="text-sm text-gray-600">{dayData.monthName} {dayData.year}</div>
            </div>
          </div>

          {/* Time Slots */}
          <div className="overflow-y-auto scrollbar-hide h-[calc(100vh-250px)]">
            {timeSlots.map((slot) => {
              const slotAppointments = getAppointmentsForTimeSlot(dayAppointments, dayData.date, slot.time);
              
              return (
                <div
                  key={slot.time}
                  className="h-16 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer relative flex"
                  onClick={() => handleTimeSlotClick(dayData.date, slot.time)}
                >
                  <div className="w-20 p-3 border-r border-gray-200 bg-gray-50">
                    <span className="text-xs text-gray-600">{slot.display12}</span>
                  </div>
                  <div className="flex-1 relative">
                    {slotAppointments.map(renderAppointment)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const weekDays = calendarData as CalendarDate[];

    return (
      <div className="flex-1 overflow-hidden">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full">
          {/* Week Header */}
          <div className="grid grid-cols-8 border-b border-gray-200 sticky top-0 z-10 bg-white">
            <div className="p-3 bg-gray-50 border-r border-gray-200">
              <span className="text-xs font-medium text-gray-600">TIME</span>
            </div>
            {weekDays.map((day, index) => (
              <div
                key={day.date.toISOString()}
                className={cn(
                  "p-3 border-r border-gray-200 last:border-r-0",
                  day.isToday ? "bg-blue-50" : "bg-gray-50"
                )}
              >
                <div className="text-center">
                  <div className={cn(
                    "text-xs font-medium",
                    day.isToday ? "text-blue-600" : "text-gray-600"
                  )}>
                    {day.dayNameShort}
                  </div>
                  <div className={cn(
                    "text-sm font-bold",
                    day.isToday ? "text-blue-600" : "text-gray-600"
                  )}>
                    {day.day}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Week Body */}
          <div className="grid grid-cols-8 overflow-y-auto scrollbar-hide h-[calc(100vh-250px)]">
            {/* Time Column */}
            <div className="border-r border-gray-200">
              {timeSlots.map((slot) => (
                <div
                  key={slot.time}
                  className="h-16 border-b border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xs text-gray-600">{slot.display12}</span>
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {weekDays.map((day) => (
              <div
                key={day.date.toISOString()}
                className={cn(
                  "relative border-r border-gray-200 last:border-r-0",
                  day.isToday ? "bg-blue-50/30" : "transparent"
                )}
              >
                {timeSlots.map((slot) => {
                  const dayAppointments = getAppointmentsForDate(appointments, day.date);
                  const slotAppointments = getAppointmentsForTimeSlot(dayAppointments, day.date, slot.time);
                  
                  return (
                    <div
                      key={slot.time}
                      className="h-16 border-b border-gray-100 relative hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleTimeSlotClick(day.date, slot.time)}
                    >
                      {slotAppointments.map(renderAppointment)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render month view
  const renderMonthView = () => {
    const monthWeeks = calendarData as CalendarDate[][];

    return (
      <div className="flex-1 overflow-hidden">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full">
          {/* Month Header */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
              <div key={day} className="p-3 bg-gray-50 border-r border-gray-200 last:border-r-0">
                <div className="text-center text-xs font-medium text-gray-600">{day}</div>
              </div>
            ))}
          </div>

          {/* Month Body */}
          <div className="grid grid-rows-6 h-full">
            {monthWeeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 border-b border-gray-200 last:border-b-0">
                {week.map((day) => {
                  const dayAppointments = getAppointmentsForDate(appointments, day.date);
                  
                  return (
                    <div
                      key={day.date.toISOString()}
                      className={cn(
                        "border-r border-gray-200 last:border-r-0 p-2 cursor-pointer hover:bg-gray-50 transition-colors min-h-[120px] relative",
                        !day.isCurrentMonth && "bg-gray-50/50 text-gray-400",
                        day.isToday && "bg-blue-50"
                      )}
                      onClick={() => handleTimeSlotClick(day.date, '09:00')}
                    >
                      <div className={cn(
                        "text-sm font-medium mb-1",
                        day.isToday && "text-blue-600",
                        !day.isCurrentMonth && "text-gray-400"
                      )}>
                        {day.day}
                      </div>
                      
                      {/* Appointments */}
                      <div className="space-y-1">
                        {dayAppointments.slice(0, 3).map((appointment) => (
                          <div
                            key={appointment.id}
                            className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate cursor-pointer hover:bg-blue-200 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAppointmentClick(appointment);
                            }}
                            title={`${appointment.time} - ${appointment.patient}: ${appointment.type}`}
                          >
                            {appointment.time} {appointment.patient}
                          </div>
                        ))}
                        {dayAppointments.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{dayAppointments.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex-shrink-0 p-4">
        <div className="flex items-center justify-between bg-white">
          {/* Title */}
          <h1 className="text-xl font-bold text-gray-900">Appointment Calendar</h1>
          
          {/* Date Navigation */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrevious}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={`Previous ${currentView}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-md font-medium text-black min-w-[200px] text-center">
              {getDateRangeText(currentDate, currentView)}
            </span>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={`Next ${currentView}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* View Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToday}
              className="px-3 py-1 text-sm bg-white border border-gray-300 text-black rounded-md hover:bg-gray-50 transition-colors shadow-sm"
            >
              Today
            </button>
            <div className="flex bg-gray-100 rounded-md p-1">
              {(['day', 'week', 'month'] as CalendarView[]).map((view) => (
                <button
                  key={view}
                  onClick={() => handleViewChange(view)}
                  className={cn(
                    "px-3 py-1 text-sm rounded-md transition-colors capitalize",
                    currentView === view
                      ? "bg-white border border-gray-300 text-black shadow-sm"
                      : "bg-gray-100 text-black hover:bg-gray-200"
                  )}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      {currentView === 'day' && renderDayView()}
      {currentView === 'week' && renderWeekView()}
      {currentView === 'month' && renderMonthView()}
    </div>
  );
}
