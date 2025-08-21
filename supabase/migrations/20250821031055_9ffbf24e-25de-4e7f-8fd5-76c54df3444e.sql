-- Prevent overlapping reservations at DB level
-- Create or replace validation trigger
CREATE OR REPLACE FUNCTION public.prevent_overlapping_reservations()
RETURNS trigger AS $$
BEGIN
  -- Basic validations
  IF NEW.end_time <= NEW.start_time THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: end_time debe ser mayor que start_time' USING ERRCODE = 'P0001';
  END IF;

  -- Prevent overlaps for same equipment on non-cancelled statuses
  IF EXISTS (
    SELECT 1
    FROM public.reservations r
    WHERE r.equipment_id = NEW.equipment_id
      AND r.id IS DISTINCT FROM NEW.id
      AND r.status IN ('pending','confirmed','arrived','active')
      AND NEW.status IN ('pending','confirmed','arrived','active')
      AND tstzrange(r.start_time, r.end_time, '[)') && tstzrange(NEW.start_time, NEW.end_time, '[)')
  ) THEN
    RAISE EXCEPTION 'OVERLAP_CONFLICT: Ya existe una reserva que se solapa para este equipo y horario' USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS reservations_no_overlap ON public.reservations;
CREATE TRIGGER reservations_no_overlap
BEFORE INSERT OR UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.prevent_overlapping_reservations();