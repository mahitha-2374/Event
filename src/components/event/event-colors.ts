export interface EventColor {
  name: string;
  hex: string;
  tailwindClass: string; // For easy styling of the color swatch
}

export const EVENT_COLORS: EventColor[] = [
  { name: 'Default Blue', hex: '#3B82F6', tailwindClass: 'bg-blue-500' }, // Blue-500
  { name: 'Teal', hex: '#14B8A6', tailwindClass: 'bg-teal-500' },       // Teal-500
  { name: 'Green', hex: '#22C55E', tailwindClass: 'bg-green-500' },     // Green-500
  { name: 'Yellow', hex: '#EAB308', tailwindClass: 'bg-yellow-500' },    // Yellow-500
  { name: 'Orange', hex: '#F97316', tailwindClass: 'bg-orange-500' },    // Orange-500
  { name: 'Red', hex: '#EF4444', tailwindClass: 'bg-red-500' },         // Red-500
  { name: 'Purple', hex: '#8B5CF6', tailwindClass: 'bg-purple-500' },   // Purple-500
  { name: 'Pink', hex: '#EC4899', tailwindClass: 'bg-pink-500' },       // Pink-500
  { name: 'Indigo', hex: '#6366F1', tailwindClass: 'bg-indigo-500' },   // Indigo-500
  { name: 'Gray', hex: '#6B7280', tailwindClass: 'bg-gray-500' },       // Gray-500
];

export const DEFAULT_EVENT_COLOR = EVENT_COLORS[0].hex;
