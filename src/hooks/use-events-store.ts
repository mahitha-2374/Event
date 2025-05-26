"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CalendarEvent } from '@/types/event';
import { generateRecurringEvents, sortEvents } from '@/lib/event-utils';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import { startOfDay, endOfDay, parseISO } from 'date-fns';

interface EventsState {
  events: CalendarEvent[];
  addEvent: (eventData: Omit<CalendarEvent, 'id'>) => CalendarEvent;
  updateEvent: (eventId: string, updates: Partial<CalendarEvent>) => CalendarEvent | undefined;
  deleteEvent: (eventId: string) => void;
  getEventById: (eventId: string) => CalendarEvent | undefined;
  getEventsForPeriod: (viewStart: Date, viewEnd: Date) => CalendarEvent[];
  _isHydrated: boolean;
  setHydrated: () => void;
}

const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      events: [],
      _isHydrated: false,
      setHydrated: () => set({ _isHydrated: true }),
      addEvent: (eventData) => {
        const newEvent: CalendarEvent = { ...eventData, id: uuidv4() };
        set((state) => ({ events: [...state.events, newEvent] }));
        return newEvent;
      },
      updateEvent: (eventId, updates) => {
        let updatedEvent: CalendarEvent | undefined;
        set((state) => ({
          events: state.events.map((event) => {
            if (event.id === eventId) {
              updatedEvent = { ...event, ...updates };
              return updatedEvent;
            }
            return event;
          }),
        }));
        return updatedEvent;
      },
      deleteEvent: (eventId) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== eventId && !event.id.startsWith(`${eventId}-occurrence-`)),
        }));
      },
      getEventById: (eventId) => {
        // Find original event if ID is an occurrence ID
        const originalEventId = eventId.includes('-occurrence-') ? eventId.split('-occurrence-')[0] : eventId;
        return get().events.find((event) => event.id === originalEventId);
      },
      getEventsForPeriod: (viewStart, viewEnd) => {
        if (!get()._isHydrated) return []; // Don't compute if not hydrated
        const allEvents = get().events;
        const periodStart = startOfDay(viewStart);
        const periodEnd = endOfDay(viewEnd);
        
        let occurrences: CalendarEvent[] = [];
        allEvents.forEach((event) => {
          if (event.recurrence && event.recurrence.frequency !== 'none') {
            occurrences.push(...generateRecurringEvents(event, periodStart, periodEnd));
          } else {
            // Handle non-recurring events
            const eventStart = parseISO(event.start);
             if (
              (eventStart >= periodStart && eventStart <= periodEnd) || // Event starts within period
              (parseISO(event.end) >= periodStart && parseISO(event.end) <= periodEnd) || // Event ends within period
              (eventStart < periodStart && parseISO(event.end) > periodEnd) // Event spans over the period
            ) {
              occurrences.push(event);
            }
          }
        });
        return sortEvents(occurrences);
      },
    }),
    {
      name: 'eventide-calendar-events',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.setHydrated();
      },
    }
  )
);

// Custom hook to ensure store is hydrated before use on client
export const useHydratedEventsStore = <T>(selector: (state: EventsState) => T): T | undefined => {
  const state = useEventsStore(selector);
  const isHydrated = useEventsStore((s) => s._isHydrated);
  return isHydrated ? state : undefined;
};

// Hook to access the full store, ensuring hydration
export const useEvents = () => {
  const store = useEventsStore();
  const isHydrated = useEventsStore((s) => s._isHydrated);
  
  // On mount, explicitly call setHydrated if not already done by persist middleware
  // This is a bit of a workaround for ensuring hydration status is set early
  // React.useEffect(() => {
  //  if (!isHydrated && typeof window !== 'undefined') {
  //    store.setHydrated();
  //  }
  // }, [isHydrated, store]);

  return { ...store, isHydrated };
};


export default useEventsStore;

// Call setHydrated on initial client load, after store potentially rehydrated
if (typeof window !== 'undefined') {
  useEventsStore.getState().setHydrated();
}
