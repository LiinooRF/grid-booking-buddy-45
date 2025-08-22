-- Add maintenance mode field to equipment table
ALTER TABLE public.equipment 
ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS maintenance_reason TEXT;

-- Create table for closed days
CREATE TABLE IF NOT EXISTS public.closed_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on closed_days
ALTER TABLE public.closed_days ENABLE ROW LEVEL SECURITY;

-- Create policies for closed_days (admin only operations)
CREATE POLICY "Closed days are viewable by everyone" 
ON public.closed_days 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage closed days" 
ON public.closed_days 
FOR ALL 
USING (false) -- This will block all operations by default
WITH CHECK (false);

-- Add trigger for closed_days updated_at
CREATE TRIGGER update_closed_days_updated_at
BEFORE UPDATE ON public.closed_days
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();