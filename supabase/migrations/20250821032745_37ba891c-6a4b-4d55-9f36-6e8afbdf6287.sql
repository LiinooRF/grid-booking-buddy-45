-- Ensure triggers exist to enforce non-overlapping reservations and maintain updated_at

-- Helpful index for queries by equipment and time
CREATE INDEX IF NOT EXISTS idx_reservations_equipment_start_end
ON public.reservations (equipment_id, start_time, end_time);

-- Trigger to prevent overlapping reservations on INSERT/UPDATE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'prevent_overlaps_before_ins_upd'
  ) THEN
    CREATE TRIGGER prevent_overlaps_before_ins_upd
    BEFORE INSERT OR UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_overlapping_reservations();
  END IF;
END $$;

-- Trigger to auto-update updated_at on UPDATE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_reservations_updated_at'
  ) THEN
    CREATE TRIGGER set_reservations_updated_at
    BEFORE UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;