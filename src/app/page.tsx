"use client"; // This page is interactive and uses client-side state/hooks

import React from 'react';
import { CalendarView } from '@/components/calendar/calendar-view';
import { SmartScheduleDialog } from '@/components/ai/smart-schedule-dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { EventFormDialog } from '@/components/event/event-form-dialog'; // For manual "Add Event"
import { useEvents } from '@/hooks/use-events-store'; // To trigger re-renders or access store state if needed


export default function HomePage() {
  const [isManualEventFormOpen, setIsManualEventFormOpen] = React.useState(false);
  // This useEvents hook call is primarily to ensure this component re-renders if events change,
  // which might be needed if other parts of the UI depend on it. For CalendarView itself, it has its own subscription.
  const { isHydrated } = useEvents(); 

  if (!isHydrated) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4 md:p-8 bg-background">
        <h1 className="text-4xl font-bold text-primary mb-4">Eventide Calendar</h1>
        <p className="text-muted-foreground">Loading your calendar...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen items-stretch p-4 md:p-6 lg:p-8 bg-background">
      <header className="mb-6">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">
            Eventide Calendar
          </h1>
          <div className="flex gap-2">
            <Button onClick={() => setIsManualEventFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Event
            </Button>
            <SmartScheduleDialog />
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto">
        <CalendarView />
      </main>

      <EventFormDialog
        isOpen={isManualEventFormOpen}
        onClose={() => setIsManualEventFormOpen(false)}
        initialDate={new Date()} // Default to today for new manual event
      />

      <footer className="mt-8 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Eventide Calendar. Crafted with care.</p>
      </footer>
    </div>
  );
}
