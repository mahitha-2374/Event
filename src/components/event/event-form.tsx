"use client";

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Trash2, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO, setHours, setMinutes, isValid as isValidDate } from 'date-fns';
import { useEvents } from '@/hooks/use-events-store';
import type { CalendarEvent, RecurrenceFrequency, RecurrenceRule } from '@/types/event';
import { EVENT_COLORS, DEFAULT_EVENT_COLOR } from './event-colors';
import { useToast } from '@/hooks/use-toast';
import { DATETIME_FORMAT } from '@/lib/date-utils';

const eventFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  allDay: z.boolean(),
  startDate: z.date({ required_error: "Start date is required." }),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)").optional(),
  endDate: z.date({ required_error: "End date is required." }),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)").optional(),
  color: z.string(),
  recurrenceFrequency: z.enum(['none', 'daily', 'weekly', 'monthly']),
  recurrenceInterval: z.coerce.number().min(1).optional(),
  recurrenceDaysOfWeek: z.array(z.coerce.number().min(0).max(6)).optional(),
  recurrenceDayOfMonth: z.coerce.number().min(1).max(31).optional(),
  recurrenceEndDate: z.date().optional(),
}).refine(data => {
  if (data.allDay) return true;
  if (!data.startTime || !data.endTime) return false; // time is required for non-allDay
  const startDateTime = setMinutes(setHours(data.startDate, parseInt(data.startTime.split(':')[0])), parseInt(data.startTime.split(':')[1]));
  const endDateTime = setMinutes(setHours(data.endDate, parseInt(data.endTime.split(':')[0])), parseInt(data.endTime.split(':')[1]));
  return endDateTime >= startDateTime;
}, {
  message: 'End date/time must be after start date/time',
  path: ['endDate'],
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  event?: CalendarEvent | null;
  initialDate?: Date;
  onClose: () => void;
  onDelete?: (eventId: string) => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' }, { value: 1, label: 'Monday' }, { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' }, { value: 4, label: 'Thursday' }, { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export function EventForm({ event, initialDate, onClose, onDelete }: EventFormProps) {
  const { addEvent, updateEvent } = useEvents();
  const { toast } = useToast();

  const defaultStartTime = initialDate ? format(initialDate, 'HH:mm') : '09:00';
  const defaultEndTime = initialDate 
    ? format(setHours(initialDate, getHours(initialDate) + 1), 'HH:mm') 
    : '10:00';

  const defaultValues: EventFormValues = {
    title: event?.title || '',
    description: event?.description || '',
    allDay: event?.allDay || false,
    startDate: event ? parseISO(event.start) : initialDate || new Date(),
    startTime: event && !event.allDay ? format(parseISO(event.start), 'HH:mm') : defaultStartTime,
    endDate: event ? parseISO(event.end) : initialDate || new Date(),
    endTime: event && !event.allDay ? format(parseISO(event.end), 'HH:mm') : defaultEndTime,
    color: event?.color || DEFAULT_EVENT_COLOR,
    recurrenceFrequency: event?.recurrence?.frequency || 'none',
    recurrenceInterval: event?.recurrence?.interval || 1,
    recurrenceDaysOfWeek: event?.recurrence?.daysOfWeek || [],
    recurrenceDayOfMonth: event?.recurrence?.dayOfMonth || (event ? getDayOfMonth(parseISO(event.start)) : getDayOfMonth(initialDate || new Date())),
    recurrenceEndDate: event?.recurrence?.endDate ? parseISO(event.recurrence.endDate) : undefined,
  };

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
  });

  const { control, handleSubmit, watch, setValue, formState: { errors } } = form;
  const allDay = watch('allDay');
  const recurrenceFrequency = watch('recurrenceFrequency');

  useEffect(() => {
    if (event) {
        form.reset(defaultValues);
    } else if (initialDate) {
        form.reset({
            ...defaultValues,
            startDate: initialDate,
            endDate: initialDate,
            startTime: defaultStartTime,
            endTime: defaultEndTime,
            recurrenceDayOfMonth: getDayOfMonth(initialDate)
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, initialDate, form.reset]);


  const onSubmit = (data: EventFormValues) => {
    const startDateTime = data.allDay 
      ? setHours(setMinutes(data.startDate,0),0) 
      : setMinutes(setHours(data.startDate, parseInt(data.startTime!.split(':')[0])), parseInt(data.startTime!.split(':')[1]));
    
    const endDateTime = data.allDay 
      ? setHours(setMinutes(data.endDate,59),23)
      : setMinutes(setHours(data.endDate, parseInt(data.endTime!.split(':')[0])), parseInt(data.endTime!.split(':')[1]));

    const recurrence: RecurrenceRule = {
      frequency: data.recurrenceFrequency as RecurrenceFrequency,
      interval: data.recurrenceInterval,
      daysOfWeek: data.recurrenceFrequency === 'weekly' ? data.recurrenceDaysOfWeek : undefined,
      dayOfMonth: data.recurrenceFrequency === 'monthly' ? data.recurrenceDayOfMonth : undefined,
      endDate: data.recurrenceEndDate ? format(data.recurrenceEndDate, DATETIME_FORMAT) : undefined,
    };
    
    const eventData = {
      title: data.title,
      description: data.description,
      allDay: data.allDay,
      start: format(startDateTime, DATETIME_FORMAT),
      end: format(endDateTime, DATETIME_FORMAT),
      color: data.color,
      recurrence,
    };

    if (event?.id) {
      updateEvent(event.id, eventData);
      toast({ title: 'Event Updated', description: `"${data.title}" has been updated.` });
    } else {
      addEvent(eventData);
      toast({ title: 'Event Created', description: `"${data.title}" has been added to your calendar.` });
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-1">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...form.register('title')} placeholder="e.g., Team Meeting" />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...form.register('description')} placeholder="Optional details" />
      </div>
      
      <div className="flex items-center space-x-2">
        <Controller
            name="allDay"
            control={control}
            render={({ field }) => (
                <Checkbox id="allDay" checked={field.value} onCheckedChange={field.onChange} />
            )}
        />
        <Label htmlFor="allDay" className="font-normal">All-day event</Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
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
          {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
        </div>
        {!allDay && (
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input id="startTime" type="time" {...form.register('startTime')} />
            {errors.startTime && <p className="text-sm text-destructive">{errors.startTime.message}</p>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
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
          {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
        </div>
        {!allDay && (
          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input id="endTime" type="time" {...form.register('endTime')} />
            {errors.endTime && <p className="text-sm text-destructive">{errors.endTime.message}</p>}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Color</Label>
        <Controller
            name="color"
            control={control}
            render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="w-full">
                        <div className="flex items-center">
                           <Palette className="mr-2 h-4 w-4" />
                           <SelectValue placeholder="Select event color" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {EVENT_COLORS.map(color => (
                            <SelectItem key={color.hex} value={color.hex}>
                                <div className="flex items-center">
                                    <span className={cn("w-4 h-4 rounded-full mr-2", color.tailwindClass)} style={{backgroundColor: color.hex }}></span>
                                    {color.name}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        />
      </div>

      <div className="space-y-2">
        <Label>Recurrence</Label>
        <Controller
            name="recurrenceFrequency"
            control={control}
            render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select recurrence" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                </Select>
            )}
        />
      </div>

      {recurrenceFrequency !== 'none' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="recurrenceInterval">Repeat every</Label>
            <Input id="recurrenceInterval" type="number" min="1" {...form.register('recurrenceInterval')} />
            <span className="text-sm text-muted-foreground ml-2">
                {recurrenceFrequency === 'daily' ? 'day(s)' : recurrenceFrequency === 'weekly' ? 'week(s)' : 'month(s)'}
            </span>
            {errors.recurrenceInterval && <p className="text-sm text-destructive">{errors.recurrenceInterval.message}</p>}
          </div>

          {recurrenceFrequency === 'weekly' && (
            <div className="space-y-2">
              <Label>Repeat on</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <Controller
                    key={day.value}
                    name="recurrenceDaysOfWeek"
                    control={control}
                    render={({ field }) => (
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id={`day-${day.value}`}
                                checked={field.value?.includes(day.value)}
                                onCheckedChange={(checked) => {
                                    const newValue = checked
                                        ? [...(field.value || []), day.value]
                                        : (field.value || []).filter(v => v !== day.value);
                                    field.onChange(newValue);
                                }}
                            />
                            <Label htmlFor={`day-${day.value}`} className="font-normal">{day.label}</Label>
                        </div>
                    )}
                  />
                ))}
              </div>
              {errors.recurrenceDaysOfWeek && <p className="text-sm text-destructive">{errors.recurrenceDaysOfWeek.message}</p>}
            </div>
          )}

          {recurrenceFrequency === 'monthly' && (
             <div className="space-y-2">
                <Label htmlFor="recurrenceDayOfMonth">Day of month</Label>
                <Controller
                    name="recurrenceDayOfMonth"
                    control={control}
                    render={({ field }) => (
                        <Input 
                            id="recurrenceDayOfMonth" 
                            type="number" 
                            min="1" 
                            max="31" 
                            value={field.value}
                            onChange={field.onChange}
                        />
                    )}
                />
                {errors.recurrenceDayOfMonth && <p className="text-sm text-destructive">{errors.recurrenceDayOfMonth.message}</p>}
            </div>
          )}
        
          <div className="space-y-2">
            <Label htmlFor="recurrenceEndDate">Ends on (optional)</Label>
            <Controller
                name="recurrenceEndDate"
                control={control}
                render={({ field }) => (
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, 'PPP') : <span>Never</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                    </PopoverContent>
                </Popover>
                )}
            />
            {errors.recurrenceEndDate && <p className="text-sm text-destructive">{errors.recurrenceEndDate.message}</p>}
          </div>
        </>
      )}

      <div className="flex justify-between items-center pt-4">
        <div>
            {event?.id && onDelete && (
            <Button type="button" variant="destructive" onClick={() => onDelete(event.id)} className="mr-2">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
            )}
        </div>
        <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
                Cancel
            </Button>
            <Button type="submit">{event?.id ? 'Save Changes' : 'Create Event'}</Button>
        </div>
      </div>
    </form>
  );
}

// Helper to get day of month, safely
function getDayOfMonth(date: Date): number {
    if (isValidDate(date)) {
        return parseInt(format(date, 'd'), 10);
    }
    return 1; // Default
}
function getHours(date: Date): number {
    if (isValidDate(date)) {
        return parseInt(format(date, 'HH'), 10);
    }
    return 0;
}
function getMinutes(date: Date): number {
    if(isValidDate(date)) {
        return parseInt(format(date, 'mm'), 10);
    }
    return 0;
}
