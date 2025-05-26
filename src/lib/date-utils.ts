import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addDays,
  addWeeks,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  isValid,
  differenceInCalendarDays,
  differenceInCalendarWeeks,
  differenceInCalendarMonths,
  isBefore,
  isAfter,
  getDay,
  getDate as getDayOfMonthFn,
  startOfDay, // Added
  endOfDay,   // Added
} from 'date-fns';
import type { CalendarEvent, RecurrenceRule } from '@/types/event';

export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSSX"; // ISO 8601 with Z
export const DISPLAY_DATE_FORMAT = 'MMMM d, yyyy';
export const DISPLAY_TIME_FORMAT = 'h:mm a';

export const formatDate = (date: Date | string, fmt = DATE_FORMAT): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt);
};

export const formatTime = (date: Date | string, fmt = DISPLAY_TIME_FORMAT): string => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt);
};

export const parseISODate = (dateString: string): Date => {
  return parseISO(dateString);
};

export const getMonthNameYear = (date: Date): string => {
  return format(date, 'MMMM yyyy');
};

export const getDaysInMonth = (date: Date): Date[] => {
  const start = startOfWeek(startOfMonth(date));
  const end = endOfWeek(endOfMonth(date));
  return eachDayOfInterval({ start, end });
};

export {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addDays,
  addWeeks,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  isValid,
  parseISO,
  getDay,
  format,
  getDayOfMonthFn,
  differenceInCalendarDays,
  differenceInCalendarWeeks,
  differenceInCalendarMonths,
  isBefore,
  isAfter,
  startOfDay, // Added
  endOfDay,   // Added
};

export function combineDateAndTime(date: Date, time: { hours: number; minutes: number }): Date {
  let newDate = setHours(date, time.hours);
  newDate = setMinutes(newDate, time.minutes);
  newDate = setSeconds(newDate, 0);
  newDate = setMilliseconds(newDate, 0);
  return newDate;
}

export function getEventDurationMinutes(start: string, end: string): number {
  const startDate = parseISO(start);
  const endDate = parseISO(end);
  if (!isValid(startDate) || !isValid(endDate)) return 0;
  const diffMillis = endDate.getTime() - startDate.getTime();
  return Math.round(diffMillis / (1000 * 60));
}
