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
      setHydrated: () => {
        if (!get()._isHydrated) { // Prevent unnecessary updates if already hydrated
          set({ _isHydrated: true });
        }
      },
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
        const originalEventId = eventId.includes('-occurrence-') ? eventId.split('-occurrence-')[0] : eventId;
        return get().events.find((event) => event.id === originalEventId);
      },
      getEventsForPeriod: (viewStart, viewEnd) => {
        if (!get()._isHydrated) return [];
        const allEvents = get().events;
        const periodStart = startOfDay(viewStart);
        const periodEnd = endOfDay(viewEnd);
        
        let occurrences: CalendarEvent[] = [];
        allEvents.forEach((event) => {
          if (event.recurrence && event.recurrence.frequency !== 'none') {
            occurrences.push(...generateRecurringEvents(event, periodStart, periodEnd));
          } else {
            const eventStart = parseISO(event.start);
            const eventEnd = parseISO(event.end);
             if (
              (eventStart >= periodStart && eventStart <= periodEnd) ||
              (eventEnd >= periodStart && eventEnd <= periodEnd) ||
              (eventStart < periodStart && eventEnd > periodEnd)
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
        // This is called when rehydration is done.
        // We ensure setHydrated is called here.
        if (state) {
          state.setHydrated();
        }
      },
      // Fallback for older versions or if onRehydrateStorage is not sufficient
      // This will ensure _isHydrated is set eventually on the client.
      // However, onRehydrateStorage should be the primary mechanism.
      // Forcing hydration status like this might be redundant if onRehydrateStorage works as expected.
      // Post-rehydration, if _isHydrated is still false, this is a safety net.
      // hydratedState => {
      //   if (hydratedState && !hydratedState._isHydrated) {
      //     hydratedState.setHydrated();
      //   }
      // }
    }
  )
);

export const useHydratedEventsStore = <T>(selector: (state: EventsState) => T): T | undefined => {
  const state = useEventsStore(selector);
  const isHydrated = useEventsStore((s) => s._isHydrated);
  return isHydrated ? state : undefined;
};

export const useEvents = () => {
  const store = useEventsStore();
  const isHydrated = useEventsStore((s) => s._isHydrated);
  
  // The store itself now handles setting _isHydrated via onRehydrateStorage.
  // No need for extra useEffect here or global calls.

  return { ...store, isHydrated };
};

export default useEventsStore;

// Removed global call: useEventsStore.getState().setHydrated();
// onRehydrateStorage is the correct place for this.
