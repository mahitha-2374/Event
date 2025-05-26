'use server';

/**
 * @fileOverview Suggests available time slots for new events, considering the user's existing schedule.
 *
 * - suggestAvailableTimeSlots - A function that suggests available time slots.
 * - SuggestAvailableTimeSlotsInput - The input type for the suggestAvailableTimeSlots function.
 * - SuggestAvailableTimeSlotsOutput - The return type for the suggestAvailableTimeSlots function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAvailableTimeSlotsInputSchema = z.object({
  existingEvents: z
    .array(
      z.object({
        title: z.string(),
        start: z.string().datetime(),
        end: z.string().datetime(),
      })
    )
    .describe('The user\'s existing events, including title, start time, and end time.'),
  newEventDurationMinutes: z
    .number()
    .describe('The duration of the new event in minutes.'),
  preferredStartTime: z
    .string()
    .datetime()
    .optional()
    .describe('The user\'s preferred start time for the new event.'),
  preferredEndTime: z
    .string()
    .datetime()
    .optional()
    .describe('The user\'s preferred end time for the new event.'),
});
export type SuggestAvailableTimeSlotsInput = z.infer<
  typeof SuggestAvailableTimeSlotsInputSchema
>;

const SuggestAvailableTimeSlotsOutputSchema = z.object({
  availableTimeSlots: z
    .array(
      z.object({
        start: z.string().datetime(),
        end: z.string().datetime(),
      })
    )
    .describe('A list of available time slots for the new event.'),
});
export type SuggestAvailableTimeSlotsOutput = z.infer<
  typeof SuggestAvailableTimeSlotsOutputSchema
>;

export async function suggestAvailableTimeSlots(
  input: SuggestAvailableTimeSlotsInput
): Promise<SuggestAvailableTimeSlotsOutput> {
  return suggestAvailableTimeSlotsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAvailableTimeSlotsPrompt',
  input: {schema: SuggestAvailableTimeSlotsInputSchema},
  output: {schema: SuggestAvailableTimeSlotsOutputSchema},
  prompt: `You are a smart schedule assistant that helps users find available time slots for new events.

  Consider the user\'s existing events and the duration of the new event.

  Suggest available time slots that do not overlap with existing events.

  Existing Events:
  {{#each existingEvents}}
  - Title: {{title}}, Start: {{start}}, End: {{end}}
  {{/each}}

  New Event Duration: {{newEventDurationMinutes}} minutes

  Preferred Start Time: {{preferredStartTime}}

  Preferred End Time: {{preferredEndTime}}

  Available Time Slots:
  `,
});

const suggestAvailableTimeSlotsFlow = ai.defineFlow(
  {
    name: 'suggestAvailableTimeSlotsFlow',
    inputSchema: SuggestAvailableTimeSlotsInputSchema,
    outputSchema: SuggestAvailableTimeSlotsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
