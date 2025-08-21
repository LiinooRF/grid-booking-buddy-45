-- Fix security warnings for functions with search_path
-- Update existing functions to set search_path for security

-- Update the timestamp function to set search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Update the overlap prevention function to set search_path  
CREATE OR REPLACE FUNCTION public.prevent_overlapping_reservations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;