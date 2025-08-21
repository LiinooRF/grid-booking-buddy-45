-- Allow updates on reservations so admin actions work
CREATE POLICY "Anyone can update reservations"
ON public.reservations
FOR UPDATE
USING (true)
WITH CHECK (true);