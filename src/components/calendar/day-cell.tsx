"use client";

import React from 'react';
import type { CalendarEvent } from '@/types/event';
import { EventItem } from '@/components/event/event-item';
import { cn } from '@/lib/utils';
import { isSameDay, isSameMonth, isToday as isTodayFn, format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DayCellProps {
  day: Date;
  currentMonth: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDayClick: (date: Date) => void;
}

export function DayCell({ day, currentMonth, events, onEventClick, onDayClick }: DayCellProps) {
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isCurrentDay = isTodayFn(day);

  return (
    <div
      className={cn(
        "relative flex flex-col border border-border/50 min-h-[100px] md:min-h-[120px] p-1.5 group",
        isCurrentMonth ? 'bg-card' : 'bg-muted/30 text-muted-foreground/70',
        isCurrentDay && 'bg-accent/20',
        'transition-colors duration-150 ease-in-out hover:bg-accent/10'
      )}
      onClick={() => onDayClick(day)}
      role="gridcell"
      aria-label={`Date ${format(day, 'MMMM d, yyyy')}, ${events.length} events`}
    >
      <div className="flex justify-between items-center mb-1">
        <span
          className={cn(
            "text-xs font-medium rounded-full h-6 w-6 flex items-center justify-center",
            isCurrentDay && "bg-primary text-primary-foreground",
            !isCurrentDay && isCurrentMonth && "text-foreground",
            !isCurrentMonth && "text-muted-foreground/50"
          )}
        >
          {format(day, 'd')}
        </span>
      </div>
      <ScrollArea className="flex-grow overflow-y-auto text-xs max-h-[80px] md:max-h-[100px]">
        <div className="space-y-0.5">
          {events.map((event) => (
            <EventItem
              key={event.id}
              event={event}
              onClick={() => onEventClick(event)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
