"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { CalendarHeader } from './calendar-header';
import { DayCell } from './day-cell';
import { useEvents } from '@/hooks/use-events-store';
import {
  getDaysInMonth,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  setHours,
  setMinutes,
  parseISO,
} from '@/lib/date-utils';
import type { CalendarEvent } from '@/types/event';
import { EventFormDialog } from '@/components/event/event-form-dialog';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formInitialDate, setFormInitialDate] = useState<Date | undefined>(undefined);

  const { getEventsForPeriod, isHydrated } = useEvents();

  const monthDays = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);

  const eventsForMonth = useMemo(() => {
    if (!isHydrated) return [];
    const monthStart = startOfWeek(startOfMonth(currentMonth));
    const monthEnd = endOfWeek(endOfMonth(currentMonth));
    return getEventsForPeriod(monthStart, monthEnd);
  }, [currentMonth, getEventsForPeriod, isHydrated]);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  }, []);

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  }, []);

  const handleToday = useCallback(() => {
    setCurrentMonth(new Date());
  }, []);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setFormInitialDate(undefined); // Clear initial date when editing existing event
    setIsFormOpen(true);
  }, []);

  const handleDayClick = useCallback((date: Date) => {
    setSelectedEvent(null);
    setFormInitialDate(date);
    setIsFormOpen(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setSelectedEvent(null);
    setFormInitialDate(undefined);
  }, []);
  
  if (!isHydrated) {
    return <div className="flex items-center justify-center h-screen"><p>Loading calendar...</p></div>;
  }

  return (
    <div className="flex flex-col h-full bg-card shadow-lg rounded-lg overflow-hidden">
      <CalendarHeader
        currentMonth={currentMonth}
        onNextMonth={handleNextMonth}
        onPrevMonth={handlePrevMonth}
        onToday={handleToday}
      />
      <div className="grid grid-cols-7 border-t border-border">
        {DAY_NAMES.map((dayName) => (
          <div key={dayName} className="text-center py-2 border-b border-r border-border text-xs font-medium text-muted-foreground">
            {dayName}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 grid-rows-5 flex-grow">
        {monthDays.map((day) => {
          const dayEvents = eventsForMonth.filter(event => 
            format(parseISO(event.start), 'yyyy-MM-dd') <= format(day, 'yyyy-MM-dd') &&
            format(parseISO(event.end), 'yyyy-MM-dd') >= format(day, 'yyyy-MM-dd')
          );
          return (
            <DayCell
              key={day.toISOString()}
              day={day}
              currentMonth={currentMonth}
              events={dayEvents}
              onEventClick={handleEventClick}
              onDayClick={handleDayClick}
            />
          );
        })}
      </div>
      <EventFormDialog
        isOpen={isFormOpen}
        onClose={handleFormClose}
        event={selectedEvent}
        initialDate={formInitialDate}
      />
    </div>
  );
}
