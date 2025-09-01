-- Create comments table for user feedback
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('positive', 'negative', 'suggestion')),
  message TEXT NOT NULL,
  games_request TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert comments (for anonymous users)
CREATE POLICY "Anyone can submit comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (true);

-- Create policy to restrict reading (only for admin purposes)
CREATE POLICY "No public reading of comments" 
ON public.comments 
FOR SELECT 
USING (false);