-- Relax RLS on event_blocks to allow management without admin role (temporary until auth is set)
-- Drop restrictive policy if exists
DO $$ BEGIN
  DROP POLICY IF EXISTS "Only admins can manage event blocks" ON public.event_blocks;
EXCEPTION WHEN others THEN NULL; END $$;

-- Ensure SELECT remains open (idempotent: drop-recreate)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Event blocks are viewable by everyone" ON public.event_blocks;
EXCEPTION WHEN others THEN NULL; END $$;

CREATE POLICY "Event blocks are viewable by everyone"
ON public.event_blocks
FOR SELECT
USING (true);

-- Allow inserts by anyone
CREATE POLICY "Anyone can insert event blocks"
ON public.event_blocks
FOR INSERT
WITH CHECK (true);

-- Allow updates by anyone
CREATE POLICY "Anyone can update event blocks"
ON public.event_blocks
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow deletes by anyone
CREATE POLICY "Anyone can delete event blocks"
ON public.event_blocks
FOR DELETE
USING (true);