"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter, // Not directly used but good to have
} from '@/components/ui/dialog';
import { EventForm } from './event-form';
import type { CalendarEvent } from '@/types/event';
import { useEvents } from '@/hooks/use-events-store';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';

interface EventFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
  initialDate?: Date;
}

export function EventFormDialog({ isOpen, onClose, event, initialDate }: EventFormDialogProps) {
  const { deleteEvent: deleteEventFromStore, getEventById } = useEvents();
  const { toast } = useToast();

  const handleDelete = (eventId: string) => {
    const eventToDelete = getEventById(eventId); // Get original event if it's an occurrence
    if (eventToDelete) {
      deleteEventFromStore(eventToDelete.id); // Delete the base event
      toast({ title: 'Event Deleted', description: `"${eventToDelete.title}" has been removed.` });
      onClose();
    }
  };
  
  // Determine the event to pass to the form. If `event` is an occurrence,
  // we need to pass the original base event for editing its properties.
  const eventForForm = event?.id.includes('-occurrence-') 
    ? getEventById(event.id.split('-occurrence-')[0] || "") 
    : event;


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] md:max-w-[600px] lg:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{eventForForm?.id ? 'Edit Event' : 'Add New Event'}</DialogTitle>
          <DialogDescription>
            {eventForForm?.id ? 'Update the details of your event.' : 'Fill in the details for your new event.'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-160px)] p-0 pr-6"> {/* Adjust max-h as needed, added padding-right for scrollbar */}
          <EventForm
            event={eventForForm}
            initialDate={initialDate}
            onClose={onClose}
            onDelete={eventForForm?.id ? handleDelete : undefined}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
