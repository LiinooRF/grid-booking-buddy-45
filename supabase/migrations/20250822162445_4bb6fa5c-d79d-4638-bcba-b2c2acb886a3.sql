-- Create user roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Drop existing overly permissive policies on reservations
DROP POLICY IF EXISTS "Reservations are viewable by everyone" ON public.reservations;
DROP POLICY IF EXISTS "Anyone can update reservations" ON public.reservations;

-- Create secure RLS policies for reservations
CREATE POLICY "Only admins can view all reservations" 
ON public.reservations 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update reservations" 
ON public.reservations 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete reservations" 
ON public.reservations 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Allow public to create reservations but restrict to pending status only
CREATE POLICY "Anyone can create pending reservations" 
ON public.reservations 
FOR INSERT 
WITH CHECK (status = 'pending');

-- Update equipment RLS to allow admin management
DROP POLICY IF EXISTS "Only admins can manage equipment" ON public.equipment;

CREATE POLICY "Only admins can manage equipment" 
ON public.equipment 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Update closed_days RLS to use proper admin check
DROP POLICY IF EXISTS "Only admins can manage closed days" ON public.closed_days;

CREATE POLICY "Only admins can manage closed days" 
ON public.closed_days 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));