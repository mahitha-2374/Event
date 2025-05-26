
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
        start: z
          .string()
          .datetime()
          .describe(
            "Event start time in ISO 8601 format (e.g., YYYY-MM-DDTHH:mm:ss.sssZ)"
          ),
        end: z
          .string()
          .datetime()
          .describe(
            "Event end time in ISO 8601 format (e.g., YYYY-MM-DDTHH:mm:ss.sssZ)"
          ),
      })
    )
    .describe(
      "The user's existing events, including title, start time, and end time. Times must be in ISO 8601 format."
    ),
  newEventDurationMinutes: z
    .number()
    .describe('The duration of the new event in minutes.'),
  preferredStartTime: z
    .string()
    .datetime()
    .optional()
    .describe(
      "The user's preferred start time for the new event, in ISO 8601 format (e.g., YYYY-MM-DDTHH:mm:ss.sssZ)."
    ),
  preferredEndTime: z
    .string()
    .datetime()
    .optional()
    .describe(
      "The user's preferred end time for the new event, in ISO 8601 format (e.g., YYYY-MM-DDTHH:mm:ss.sssZ)."
    ),
});
export type SuggestAvailableTimeSlotsInput = z.infer<
  typeof SuggestAvailableTimeSlotsInputSchema
>;

const SuggestAvailableTimeSlotsOutputSchema = z.object({
  availableTimeSlots: z
    .array(
      z.object({
        start: z
          .string()
          .datetime()
          .describe(
            "Suggested slot start time in ISO 8601 format (e.g., YYYY-MM-DDTHH:mm:ss.sssZ)"
          ),
        end: z
          .string()
          .datetime()
          .describe(
            "Suggested slot end time in ISO 8601 format (e.g., YYYY-MM-DDTHH:mm:ss.sssZ)"
          ),
      })
    )
    .describe(
      'A list of available time slots for the new event. Each slot must have a start and end time in ISO 8601 format (e.g., YYYY-MM-DDTHH:mm:ss.sssZ).'
    ),
});
export type SuggestAvailableTimeSlotsOutput = z.infer<
  typeof SuggestAvailableTimeSlotsOutputSchema
>;

export async function suggestAvailableTimeSlots(
  input: SuggestAvailableTimeSlotsInput
): Promise<SuggestAvailableTimeSlotsOutput> {
  const result = await suggestAvailableTimeSlotsFlow(input);
  if (!result) {
    // This case can happen if the AI response doesn't match the output schema.
    console.error('AI flow returned null, possibly due to output validation failure.');
    throw new Error('Failed to get a valid response structure from AI.');
  }
  return result;
}

const prompt = ai.definePrompt({
  name: 'suggestAvailableTimeSlotsPrompt',
  input: {schema: SuggestAvailableTimeSlotsInputSchema},
  output: {schema: SuggestAvailableTimeSlotsOutputSchema},
  prompt: `You are an intelligent scheduling assistant. Your task is to identify and suggest available time slots for a new event based on a list of existing events and the desired duration for the new event.

Please consider the following information:
- Existing Events:
  {{#each existingEvents}}
  - Title: {{title}}, Start: {{start}}, End: {{end}} (Times are in ISO 8601 format)
  {{/each}}
  {{#unless existingEvents}}
  - No existing events provided for the search period.
  {{/unless}}
- New Event Duration: {{newEventDurationMinutes}} minutes.
{{#if preferredStartTime}}
- The user has a preferred start time for searching: {{preferredStartTime}} (ISO 8601 format).
{{/if}}
{{#if preferredEndTime}}
- The user has a preferred end time for searching: {{preferredEndTime}} (ISO 8601 format).
{{/if}}

Your goal is to find time slots that:
1. Do not overlap with any existing events.
2. Are at least {{newEventDurationMinutes}} minutes long.
3. If preferred start/end times are provided, try to find slots within that preferred window.
4. If no preferred times are given, search within a reasonable timeframe (e.g., typical working hours or based on the context of existing events).

CRITICAL: Your response MUST strictly adhere to the output schema. All start and end times for the suggested 'availableTimeSlots' MUST be valid ISO 8601 datetime strings (e.g., "YYYY-MM-DDTHH:mm:ss.sssZ" or "YYYY-MM-DDTHH:mm:ssZ").

Based on this, provide the 'availableTimeSlots'.
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
    // If output is null, it means Zod validation failed on the LLM's response.
    // The wrapper function `suggestAvailableTimeSlots` will handle throwing an error.
    return output;
  }
);

