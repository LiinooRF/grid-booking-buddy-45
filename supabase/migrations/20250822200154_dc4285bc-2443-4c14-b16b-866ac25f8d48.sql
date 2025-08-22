-- Revert security restrictions: Restore original permissive policies for closed_days
-- This restores the ability for anyone to manage closed days

-- Drop the restrictive admin-only policies
DROP POLICY IF EXISTS "Only admins can insert closed days" ON public.closed_days;
DROP POLICY IF EXISTS "Only admins can update closed days" ON public.closed_days;
DROP POLICY IF EXISTS "Only admins can delete closed days" ON public.closed_days;

-- Restore original permissive policies that allow anyone to manage closed days
CREATE POLICY "Anyone can insert closed days" 
ON public.closed_days 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update closed days" 
ON public.closed_days 
FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can delete closed days" 
ON public.closed_days 
FOR DELETE 
USING (true);