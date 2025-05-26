"use client";

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Sparkles, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO, setHours, setMinutes, isValid as isValidDate } from 'date-fns';
import { useEvents } from '@/hooks/use-events-store';
import { suggestAvailableTimeSlots, SuggestAvailableTimeSlotsInput } from '@/ai/flows/suggest-available-time-slots';
import { useToast } from '@/hooks/use-toast';
import type { CalendarEvent } from '@/types/event';
import { DATETIME_FORMAT } from '@/lib/date-utils';

const smartScheduleSchema = z.object({
  durationMinutes: z.coerce.number().min(5, 'Duration must be at least 5 minutes'),
  preferredDate: z.date().optional(),
  preferredStartTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)").optional(),
  preferredEndTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)").optional(),
}).refine(data => {
  if (data.preferredStartTime && data.preferredEndTime && data.preferredDate) {
    const start = setMinutes(setHours(data.preferredDate, parseInt(data.preferredStartTime.split(':')[0])), parseInt(data.preferredStartTime.split(':')[1]));
    const end = setMinutes(setHours(data.preferredDate, parseInt(data.preferredEndTime.split(':')[0])), parseInt(data.preferredEndTime.split(':')[1]));
    return end > start;
  }
  return true;
}, {
  message: 'Preferred end time must be after preferred start time',
  path: ['preferredEndTime'],
});

type SmartScheduleFormValues = z.infer<typeof smartScheduleSchema>;

interface SmartScheduleFormProps {
  onSuggestions: (slots: Array<{ start: string, end: string }>) => void;
}

export function SmartScheduleForm({ onSuggestions }: SmartScheduleFormProps) {
  const { getEventsForPeriod } = useEvents();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SmartScheduleFormValues>({
    resolver: zodResolver(smartScheduleSchema),
    defaultValues: {
      durationMinutes: 30,
      preferredDate: new Date(),
    },
  });
  const { control, handleSubmit, watch, formState: { errors } } = form;
  const preferredDate = watch('preferredDate');

  const onSubmit = async (data: SmartScheduleFormValues) => {
    setIsLoading(true);
    
    const searchStartDate = data.preferredDate ? setHours(setMinutes(data.preferredDate,0),0) : new Date();
    const searchEndDate = data.preferredDate ? setHours(setMinutes(data.preferredDate,59),23) : new Date(); // For simplicity, search on preferred date

    const existingEventsRaw = getEventsForPeriod(searchStartDate, searchEndDate);
    const existingEvents = existingEventsRaw.map(e => ({
        title: e.title,
        start: e.start, // Already ISO string
        end: e.end,     // Already ISO string
    }));

    const aiInput: SuggestAvailableTimeSlotsInput = {
      existingEvents,
      newEventDurationMinutes: data.durationMinutes,
      preferredStartTime: data.preferredDate && data.preferredStartTime 
        ? format(setMinutes(setHours(data.preferredDate, parseInt(data.preferredStartTime.split(':')[0])), parseInt(data.preferredStartTime.split(':')[1])), DATETIME_FORMAT)
        : undefined,
      preferredEndTime: data.preferredDate && data.preferredEndTime
        ? format(setMinutes(setHours(data.preferredDate, parseInt(data.preferredEndTime.split(':')[0])), parseInt(data.preferredEndTime.split(':')[1])), DATETIME_FORMAT)
        : undefined,
    };

    try {
      const result = await suggestAvailableTimeSlots(aiInput);
      if (result.availableTimeSlots && result.availableTimeSlots.length > 0) {
        onSuggestions(result.availableTimeSlots);
        toast({ title: "Time Slots Found", description: `${result.availableTimeSlots.length} suggestions available.` });
      } else {
        onSuggestions([]);
        toast({ title: "No Slots Found", description: "Could not find any available time slots with the given criteria.", variant: "destructive" });
      }
    } catch (error) {
      console.error("AI suggestion error:", error);
      toast({ title: "Error", description: "Failed to get suggestions from AI.", variant: "destructive" });
      onSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="durationMinutes">New Event Duration (minutes)</Label>
        <Input id="durationMinutes" type="number" {...form.register('durationMinutes')} />
        {errors.durationMinutes && <p className="text-sm text-destructive">{errors.durationMinutes.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredDate">Preferred Date (optional)</Label>
        <Controller
          name="preferredDate"
          control={control}
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
              </PopoverContent>
            </Popover>
          )}
        />
      </div>

      {preferredDate && (
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="preferredStartTime">Preferred Start Time (optional)</Label>
                <Input id="preferredStartTime" type="time" {...form.register('preferredStartTime')} />
                 {errors.preferredStartTime && <p className="text-sm text-destructive">{errors.preferredStartTime.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="preferredEndTime">Preferred End Time (optional)</Label>
                <Input id="preferredEndTime" type="time" {...form.register('preferredEndTime')} />
                {errors.preferredEndTime && <p className="text-sm text-destructive">{errors.preferredEndTime.message}</p>}
            </div>
        </div>
      )}
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? <Clock className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
        Find Available Slots
      </Button>
    </form>
  );
}
