-- Fix critical security vulnerability: Restrict closed_days management to admins only
-- This prevents malicious users from disrupting business operations

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can delete closed days" ON public.closed_days;
DROP POLICY IF EXISTS "Anyone can insert closed days" ON public.closed_days;
DROP POLICY IF EXISTS "Anyone can update closed days" ON public.closed_days;

-- Create secure admin-only policies for management operations
CREATE POLICY "Only admins can insert closed days" 
ON public.closed_days 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update closed days" 
ON public.closed_days 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete closed days" 
ON public.closed_days 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Keep public read access so customers can see when business is closed
-- (The existing "Closed days are viewable by everyone" policy remains unchanged)