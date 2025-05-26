export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval?: number; // e.g., every 2 for weekly means every 2 weeks
  daysOfWeek?: number[]; // 0 (Sun) to 6 (Sat) for weekly
  dayOfMonth?: number; // 1-31 for monthly, for 'monthly' frequency
  endDate?: string; // ISO date string for when recurrence stops
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO datetime string
  end:string;   // ISO datetime string
  description?: string;
  color: string; // Hex color or a named color key from event-colors
  allDay: boolean;
  recurrence: RecurrenceRule;
}

// Example: An event that repeats every Tuesday and Thursday until a specific date.
// const weeklyEventExample: CalendarEvent = {
//   id: '2',
//   title: 'Team Meeting',
//   start: '2023-10-03T10:00:00.000Z', // First occurrence
//   end: '2023-10-03T11:00:00.000Z',
//   color: 'blue',
//   allDay: false,
//   recurrence: {
//     frequency: 'weekly',
//     interval: 1,
//     daysOfWeek: [2, 4], // Tuesday, Thursday
//     endDate: '2023-12-31T23:59:59.000Z',
//   },
// };

// Example: An event that repeats on the 15th of every month.
// const monthlyEventExample: CalendarEvent = {
//   id: '3',
//   title: 'Pay Bills',
//   start: '2023-10-15T09:00:00.000Z', // First occurrence
//   end: '2023-10-15T09:30:00.000Z',
//   color: 'green',
//   allDay: true,
//   recurrence: {
//     frequency: 'monthly',
//     interval: 1,
//     dayOfMonth: 15,
//   },
// };
