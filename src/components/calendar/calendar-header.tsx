"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthNameYear } from '@/lib/date-utils';

interface CalendarHeaderProps {
  currentMonth: Date;
  onNextMonth: () => void;
  onPrevMonth: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  currentMonth,
  onNextMonth,
  onPrevMonth,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrevMonth} aria-label="Previous month">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" onClick={onNextMonth} aria-label="Next month">
          <ChevronRight className="h-5 w-5" />
        </Button>
        <Button variant="outline" onClick={onToday}>
          Today
        </Button>
      </div>
      <h2 className="text-xl font-semibold text-foreground">
        {getMonthNameYear(currentMonth)}
      </h2>
      <div>{/* Placeholder for potential future actions like view switcher */}</div>
    </div>
  );
}
