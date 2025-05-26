"use client";

import React from 'react';
import type { CalendarEvent } from '@/types/event';
import { formatTime, parseISO } from '@/lib/date-utils';
import { cn } from '@/lib/utils';
import { EVENT_COLORS } from './event-colors';

interface EventItemProps {
  event: CalendarEvent;
  onClick: () => void;
}

export function EventItem({ event, onClick }: EventItemProps) {
  const eventColorMeta = EVENT_COLORS.find(c => c.hex === event.color) || EVENT_COLORS.find(c => c.name === "Default Blue");
  const bgColorClass = eventColorMeta ? eventColorMeta.tailwindClass : 'bg-primary';
  
  // For dark theme, ensure text on colored backgrounds is light
  const textColorClass = "text-white"; 

  return (
    <button
      onClick={onClick}
      title={`${event.title}\n${formatTime(parseISO(event.start))} - ${formatTime(parseISO(event.end))}\n${event.description || ''}`}
      className={cn(
        "w-full text-left p-1 mb-0.5 rounded-md text-xs overflow-hidden truncate hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring",
        bgColorClass,
        textColorClass
      )}
      style={{ backgroundColor: event.color }} // Direct style for precise color
    >
      {!event.allDay && (
        <span className="font-medium mr-1">{formatTime(parseISO(event.start))}</span>
      )}
      {event.title}
    </button>
  );
}
