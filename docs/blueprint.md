# **App Name**: Eventide Calendar

## Core Features:

- Monthly Calendar View: Display a traditional monthly calendar view with the current day highlighted and navigation between months.
- Add Event: Allow users to add new events via a form including title, date/time (with picker), description, recurrence options (daily, weekly, monthly, custom) and an optional event color or category.
- Edit Event: Enable users to click on events to open an edit form to update event details.
- Delete Event: Provide an option to delete events from either the calendar view or event details form.
- Recurring Events: Implement recurrence options for events: daily, weekly (on selected days), monthly (on a specific day), and custom patterns.
- Smart Schedule Assistant: Suggest available time slots, considering existing events, to avoid overlapping events. It works as a planning TOOL that looks at the existing agenda of the user.
- Local Data Persistence: Persist event data using local storage to ensure data retention across page refreshes.

## Style Guidelines:

- Primary color: Muted teal (#63B5FF) to suggest calmness.
- Background color: Dark gray (#333) to ensure that calendar entries and text will be easy to read in dark theme.
- Accent color: Pale orange (#FF9E63) for focus elements and highlights.
- Clean and readable sans-serif font for all text elements.
- Simple and clear icons to represent event categories and actions.
- Clean and spacious layout to avoid clutter, with a focus on usability.
- Use a modern JavaScript framework or library (e.g., React, Vue.js, or Angular).
- Date Handling: Use a date manipulation library like Moment.js or date-fns for handling dates and times.
- Drag-and-Drop: Implement drag-and-drop functionality using a library like React DnD or interact.js, or build a custom implementation if preferred.