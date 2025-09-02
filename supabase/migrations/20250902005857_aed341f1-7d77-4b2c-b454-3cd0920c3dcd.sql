-- Ensure RLS is enabled on comments and open minimal access for client-side admin
-- NOTE: This is required because the app uses a client-side password gate, not Supabase Auth

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view comments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'comments' AND policyname = 'Public can view comments'
  ) THEN
    CREATE POLICY "Public can view comments"
    ON public.comments
    FOR SELECT
    USING (true);
  END IF;
END$$;

-- Allow anyone to insert comments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'comments' AND policyname = 'Public can insert comments'
  ) THEN
    CREATE POLICY "Public can insert comments"
    ON public.comments
    FOR INSERT
    WITH CHECK (true);
  END IF;
END$$;

-- Allow anyone to delete comments (client-side gated by admin password)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'comments' AND policyname = 'Public can delete comments'
  ) THEN
    CREATE POLICY "Public can delete comments"
    ON public.comments
    FOR DELETE
    USING (true);
  END IF;
END$$;