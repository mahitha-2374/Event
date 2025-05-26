import type { CalendarEvent, RecurrenceRule } from '@/types/event';
import {
  parseISO,
  addDays,
  addWeeks,
  addMonths,
  isWithinInterval,
  startOfDay,
  endOfDay,
  getDay as getDayOfWeek,
  getDate as getDayOfMonthFn, // Renamed to avoid conflict with local getDayOfMonth
  isBefore,
  isAfter,
  isSameDay,
  format,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  getHours,
  getMinutes,
  differenceInCalendarDays,
  differenceInCalendarWeeks,
  differenceInCalendarMonths,
  startOfWeek, // Added for weekly interval calculation
} from 'date-fns';
import { DATETIME_FORMAT } from './date-utils';

export function generateRecurringEvents(
  baseEvent: CalendarEvent,
  viewStartDate: Date,
  viewEndDate: Date
): CalendarEvent[] {
  const { recurrence, start: baseStartStr, end: baseEndStr, id } = baseEvent;

  const occurrences: CalendarEvent[] = [];
  const baseStartDate = parseISO(baseStartStr);
  const baseEndDate = parseISO(baseEndStr);

  if (!isValidDate(baseStartDate) || !isValidDate(baseEndDate)) {
    console.error("Invalid base event dates for event ID:", id);
    return []; // Cannot process if base dates are invalid
  }

  const durationMs = baseEndDate.getTime() - baseStartDate.getTime();

  // Handle non-recurring events or events with 'none' recurrence explicitly
  if (!recurrence || recurrence.frequency === 'none') {
    // Check if the single event instance overlaps with the view period
    if (
      isWithinInterval(baseStartDate, { start: viewStartDate, end: viewEndDate }) ||
      isWithinInterval(baseEndDate, { start: viewStartDate, end: viewEndDate }) ||
      (isBefore(baseStartDate, viewStartDate) && isAfter(baseEndDate, viewEndDate))
    ) {
      occurrences.push(baseEvent);
    }
    return occurrences;
  }
  
  let currentDate = startOfDay(baseStartDate); // Start iterating from the base event's date (day part)
  const recurrenceEndDate = recurrence.endDate ? parseISO(recurrence.endDate) : null;

  const maxIterations = 365 * 3; // Limit iterations (e.g., 3 years of daily events)
  let iterationCount = 0;

  while (iterationCount < maxIterations) {
    iterationCount++;

    if (isAfter(currentDate, endOfDay(viewEndDate)) && (!recurrenceEndDate || isAfter(currentDate, recurrenceEndDate))) {
      // If current date is already past both view end and recurrence end, no need to continue
      break;
    }
    
    if (recurrenceEndDate && isAfter(startOfDay(currentDate), startOfDay(recurrenceEndDate))) {
      break; // Stop if current date is past the recurrence end date
    }

    // Skip dates that are definitely too early to be relevant for the view window
    // (e.g., if base event starts much later than current view, but this might be complex)
    // For now, the main `while` condition using `viewEndDate` and `recurrenceEndDate` is key.

    let shouldGenerateThisIteration = false;
    const interval = recurrence.interval && recurrence.interval > 0 ? recurrence.interval : 1;

    // Only consider dates on or after the base start date for generating occurrences
    if (isSameDay(currentDate, baseStartDate) || isAfter(currentDate, baseStartDate)) {
      switch (recurrence.frequency) {
        case 'daily':
          if (differenceInCalendarDays(currentDate, baseStartDate) % interval === 0) {
            shouldGenerateThisIteration = true;
          }
          break;
        case 'weekly':
          if (recurrence.daysOfWeek?.includes(getDayOfWeek(currentDate))) {
            // Check if this week is an "interval week"
            // Compare the week of currentDate with the week of baseStartDate
            if (differenceInCalendarWeeks(startOfWeek(currentDate), startOfWeek(baseStartDate), { weekStartsOn: getDayOfWeek(baseStartDate) as any }) % interval === 0) {
               shouldGenerateThisIteration = true;
            }
          }
          break;
        case 'monthly':
          if (recurrence.dayOfMonth === getDayOfMonthFn(currentDate)) {
            if (differenceInCalendarMonths(currentDate, baseStartDate) % interval === 0) {
              shouldGenerateThisIteration = true;
            }
          }
          break;
      }
    }

    if (shouldGenerateThisIteration) {
      const occurrenceStartDateTime = setMilliseconds(setSeconds(setMinutes(setHours(currentDate, getHours(baseStartDate)), getMinutes(baseStartDate)), baseStartDate.getSeconds()), baseStartDate.getMilliseconds());
      const occurrenceEndDateTime = new Date(occurrenceStartDateTime.getTime() + durationMs);

      // Check if this generated occurrence overlaps with the view window
      if (
        isWithinInterval(occurrenceStartDateTime, { start: viewStartDate, end: viewEndDate }) ||
        isWithinInterval(occurrenceEndDateTime, { start: viewStartDate, end: viewEndDate }) ||
        (isBefore(occurrenceStartDateTime, viewStartDate) && isAfter(occurrenceEndDateTime, viewEndDate))
      ) {
        occurrences.push({
          ...baseEvent,
          id: `${id}-occurrence-${format(occurrenceStartDateTime, 'yyyyMMddHHmmss')}`,
          start: format(occurrenceStartDateTime, DATETIME_FORMAT),
          end: format(occurrenceEndDateTime, DATETIME_FORMAT),
        });
      }
    }
    
    // Optimization: if currentDate is already way past viewEndDate and we haven't found anything, break.
    // The main check for this is the `while` condition and the break for `recurrenceEndDate`.
    // Add a safety break if iterationCount gets too high without advancing past view window significantly.
    if (isAfter(currentDate, addMonths(viewEndDate, 3)) && occurrences.length === 0 && iterationCount > 100) {
        // If we are 3 months past view and still found nothing after 100 days, likely safe to break.
        // This is a heuristic to prevent extremely long loops for misconfigured recurrences far in future.
        break;
    }

    currentDate = addDays(currentDate, 1); // Always advance by one day
  }
  return occurrences;
}

function isValidDate(d: any): d is Date {
  return d instanceof Date && !isNaN(d.getTime());
}


export function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return events.sort((a, b) => {
    const startA = parseISO(a.start).getTime();
    const startB = parseISO(b.start).getTime();
    if (startA !== startB) {
      return startA - startB;
    }
    const endA = parseISO(a.end).getTime();
    const endB = parseISO(b.end).getTime();
    const durationA = endA - startA;
    const durationB = endB - startB;
    if (durationA !== durationB) {
      return durationA - durationB; // Shorter events first
    }
    return a.title.localeCompare(b.title);
  });
}
