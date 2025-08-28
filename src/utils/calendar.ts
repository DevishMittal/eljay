/**
 * Calendar utility functions for dynamic date handling
 */

export type CalendarView = 'day' | 'week' | 'month';

export interface CalendarDate {
  date: Date;
  day: number;
  month: number;
  year: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  dayName: string;
  dayNameShort: string;
  monthName: string;
  monthNameShort: string;
}

export interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
  display12: string;
  display24: string;
}

export interface Appointment {
  id: string;
  date: Date;
  time: string;
  patient: string;
  type: string;
  duration: number; // in minutes
  color?: string;
  audiologist?: string;
  phoneNumber?: string;
  email?: string;
  notes?: string;
}

/**
 * Get today's date
 */
export function getToday(): Date {
  return new Date();
}

/**
 * Format date to string
 */
export function formatDate(date: Date, format: 'short' | 'medium' | 'long' = 'medium'): string {
  const optionsMap: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: 'short', day: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
  };
  
  return date.toLocaleDateString('en-US', optionsMap[format]);
}

/**
 * Get calendar date object
 */
export function getCalendarDate(date: Date, referenceDate?: Date): CalendarDate {
  const today = getToday();
  const refDate = referenceDate || today;
  
  return {
    date,
    day: date.getDate(),
    month: date.getMonth(),
    year: date.getFullYear(),
    isToday: isSameDay(date, today),
    isCurrentMonth: date.getMonth() === refDate.getMonth(),
    dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
    dayNameShort: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
    monthName: date.toLocaleDateString('en-US', { month: 'long' }),
    monthNameShort: date.toLocaleDateString('en-US', { month: 'short' })
  };
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
}

/**
 * Get start of week (Sunday)
 */
export function getStartOfWeek(date: Date): Date {
  const start = new Date(date);
  const day = start.getDay();
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Get end of week (Saturday)
 */
export function getEndOfWeek(date: Date): Date {
  const end = new Date(date);
  const day = end.getDay();
  end.setDate(end.getDate() + (6 - day));
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Get start of month
 */
export function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Get end of month
 */
export function getEndOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Get days in month
 */
export function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * Get week days for a given date
 */
export function getWeekDays(date: Date): CalendarDate[] {
  const startOfWeek = getStartOfWeek(date);
  const days: CalendarDate[] = [];
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(getCalendarDate(day, date));
  }
  
  return days;
}

/**
 * Get month calendar grid (6 weeks x 7 days)
 */
export function getMonthCalendar(date: Date): CalendarDate[][] {
  const startOfMonth = getStartOfMonth(date);
  const startOfCalendar = getStartOfWeek(startOfMonth);
  const weeks: CalendarDate[][] = [];
  
  for (let week = 0; week < 6; week++) {
    const weekDays: CalendarDate[] = [];
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startOfCalendar);
      currentDate.setDate(startOfCalendar.getDate() + (week * 7) + day);
      weekDays.push(getCalendarDate(currentDate, date));
    }
    weeks.push(weekDays);
  }
  
  return weeks;
}

/**
 * Navigate to previous period
 */
export function getPreviousPeriod(date: Date, view: CalendarView): Date {
  const newDate = new Date(date);
  
  switch (view) {
    case 'day':
      newDate.setDate(newDate.getDate() - 1);
      break;
    case 'week':
      newDate.setDate(newDate.getDate() - 7);
      break;
    case 'month':
      newDate.setMonth(newDate.getMonth() - 1);
      break;
  }
  
  return newDate;
}

/**
 * Navigate to next period
 */
export function getNextPeriod(date: Date, view: CalendarView): Date {
  const newDate = new Date(date);
  
  switch (view) {
    case 'day':
      newDate.setDate(newDate.getDate() + 1);
      break;
    case 'week':
      newDate.setDate(newDate.getDate() + 7);
      break;
    case 'month':
      newDate.setMonth(newDate.getMonth() + 1);
      break;
  }
  
  return newDate;
}

/**
 * Get date range text for display
 */
export function getDateRangeText(date: Date, view: CalendarView): string {
  switch (view) {
    case 'day':
      return formatDate(date, 'long');
    case 'week':
      const startOfWeek = getStartOfWeek(date);
      const endOfWeek = getEndOfWeek(date);
      const startMonth = startOfWeek.toLocaleDateString('en-US', { month: 'short' });
      const endMonth = endOfWeek.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      
      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startMonth} ${startOfWeek.getDate()} - ${endOfWeek.getDate()}, ${year}`;
      } else {
        return `${startMonth} ${startOfWeek.getDate()} - ${endMonth} ${endOfWeek.getDate()}, ${year}`;
      }
    case 'month':
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    default:
      return formatDate(date);
  }
}

/**
 * Generate time slots for a day
 */
export function generateTimeSlots(startHour: number = 8, endHour: number = 23, intervalMinutes: number = 30): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour < 12 ? 'AM' : 'PM';
      const time12 = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
      
      slots.push({
        time: time24,
        hour,
        minute,
        display12: time12,
        display24: time24
      });
    }
  }
  
  return slots;
}

/**
 * Get appointments for a specific date
 */
export function getAppointmentsForDate(appointments: Appointment[], date: Date): Appointment[] {
  return appointments.filter(apt => isSameDay(apt.date, date));
}

/**
 * Get appointments for a time slot
 */
export function getAppointmentsForTimeSlot(appointments: Appointment[], date: Date, timeSlot: string): Appointment[] {
  return appointments.filter(apt => 
    isSameDay(apt.date, date) && apt.time === timeSlot
  );
}

/**
 * Check if a date is in the current week
 */
export function isInCurrentWeek(date: Date, referenceDate: Date = getToday()): boolean {
  const startOfWeek = getStartOfWeek(referenceDate);
  const endOfWeek = getEndOfWeek(referenceDate);
  return date >= startOfWeek && date <= endOfWeek;
}

/**
 * Check if a date is in the current month
 */
export function isInCurrentMonth(date: Date, referenceDate: Date = getToday()): boolean {
  return date.getMonth() === referenceDate.getMonth() && 
         date.getFullYear() === referenceDate.getFullYear();
}

/**
 * Get week number of the year
 */
export function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
}
