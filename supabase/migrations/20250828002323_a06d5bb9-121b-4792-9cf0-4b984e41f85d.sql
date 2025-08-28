-- Add start_time and end_time fields to events table
ALTER TABLE public.events 
ADD COLUMN start_time TIME,
ADD COLUMN end_time TIME;