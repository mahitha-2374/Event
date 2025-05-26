"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SmartScheduleForm } from './smart-schedule-form';
import { Sparkles, CalendarPlus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { EventFormDialog } from '@/components/event/event-form-dialog'; // To create event from suggestion
import { CalendarEvent } from '@/types/event';
import { getEventDurationMinutes } from '@/lib/date-utils';

interface SuggestedSlot {
  start: string;
  end: string;
}

export function SmartScheduleDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestedSlot[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventFormData, setEventFormData] = useState<Partial<CalendarEvent> | null>(null);
  const { toast } = useToast();

  const handleSuggestions = (slots: SuggestedSlot[]) => {
    setSuggestions(slots);
  };

  const handleSelectSlot = (slot: SuggestedSlot) => {
    const startDate = parseISO(slot.start);
    const endDate = parseISO(slot.end);
    
    setEventFormData({
        start: slot.start,
        end: slot.end,
        title: "New AI Scheduled Event", // Default title
        allDay: getEventDurationMinutes(slot.start, slot.end) >= 23 * 60, // crude all day check
    });
    setShowEventForm(true);
    setIsOpen(false); // Close AI dialog
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Sparkles className="mr-2 h-4 w-4" /> Smart Schedule
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Smart Schedule Assistant</DialogTitle>
            <DialogDescription>
              Let AI help you find the best time for your new event.
            </DialogDescription>
          </DialogHeader>
          <SmartScheduleForm onSuggestions={handleSuggestions} />
          {suggestions.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Suggested Slots:</h3>
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {suggestions.map((slot, index) => (
                  <li key={index}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left"
                      onClick={() => handleSelectSlot(slot)}
                    >
                      <CalendarPlus className="mr-2 h-4 w-4 text-green-500" />
                      {format(parseISO(slot.start), 'MMM d, h:mm a')} - {format(parseISO(slot.end), 'h:mm a')}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {showEventForm && eventFormData && (
        <EventFormDialog
          isOpen={showEventForm}
          onClose={() => {
            setShowEventForm(false);
            setEventFormData(null);
          }}
          // Pass a structure that EventForm expects for a new event.
          // EventFormDialog internally handles `initialDate` from `eventFormData.start`
          // or can be modified to take full partial event.
          // For now, we'll assume EventFormDialog can create a new event from a start date.
          // The best way is to pass the `event` prop as a partial CalendarEvent.
          // `event` prop in EventFormDialog should ideally accept `Partial<CalendarEvent>` for new events.
          // Let's modify EventFormDialog to accept initial values for a new event.
          // For now, we make it work by setting an "initialDate" derived from the slot.
          // This would typically mean EventForm itself needs to be able to take more complete initial data.
          // Casting to any for now, but ideally EventFormDialog/EventForm would handle partial event data for creation.
          event={{
            id: '', // empty for new event
            title: eventFormData.title || 'New Event',
            start: eventFormData.start!,
            end: eventFormData.end!,
            allDay: !!eventFormData.allDay,
            color: eventFormData.color || '', // default handled in form
            description: eventFormData.description || '',
            recurrence: eventFormData.recurrence || { frequency: 'none' },
          } as CalendarEvent} // Pass as a full event structure for creation.
        />
      )}
    </>
  );
}
