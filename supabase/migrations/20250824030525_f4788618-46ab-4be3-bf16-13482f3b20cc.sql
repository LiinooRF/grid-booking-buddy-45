-- Add new fields to events table for better group management
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS external_link text,
ADD COLUMN IF NOT EXISTS max_groups integer,
ADD COLUMN IF NOT EXISTS participants_per_group integer;

-- Update existing events to have sensible defaults
UPDATE public.events 
SET participants_per_group = CASE 
  WHEN is_group_event = true AND max_participants IS NOT NULL THEN LEAST(max_participants, 5)
  ELSE NULL 
END,
max_groups = CASE 
  WHEN is_group_event = true AND max_participants IS NOT NULL AND participants_per_group IS NOT NULL 
  THEN CEIL(max_participants::float / participants_per_group::float)
  ELSE NULL 
END
WHERE external_link IS NULL;