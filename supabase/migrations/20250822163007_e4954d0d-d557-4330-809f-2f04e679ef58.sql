-- Add database triggers for business rule enforcement and security

-- Trigger to enforce 5-day reservation limit
CREATE OR REPLACE FUNCTION public.enforce_five_day_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if start date is within 5 days from today
  IF NEW.start_time::date > current_date + interval '5 days' THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: Las reservas solo se pueden hacer hasta 5 días en el futuro' USING ERRCODE = 'P0001';
  END IF;
  
  -- Check if start date is not in the past
  IF NEW.start_time::date < current_date THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: No se pueden hacer reservas para fechas pasadas' USING ERRCODE = 'P0001';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to prevent reservations on closed days
CREATE OR REPLACE FUNCTION public.prevent_closed_days()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the reservation date is a closed day
  IF EXISTS (
    SELECT 1 
    FROM public.closed_days 
    WHERE date = NEW.start_time::date
  ) THEN
    DECLARE
      closure_reason TEXT;
    BEGIN
      SELECT reason INTO closure_reason 
      FROM public.closed_days 
      WHERE date = NEW.start_time::date;
      
      RAISE EXCEPTION 'CLOSED_DAY_ERROR: El %s está cerrado por: %s', 
        NEW.start_time::date, 
        closure_reason 
        USING ERRCODE = 'P0001';
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to prevent reservations on equipment in maintenance
CREATE OR REPLACE FUNCTION public.prevent_maintenance()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if equipment is in maintenance mode
  IF EXISTS (
    SELECT 1 
    FROM public.equipment 
    WHERE id = NEW.equipment_id 
    AND maintenance_mode = true
  ) THEN
    DECLARE
      maintenance_reason TEXT;
      equipment_name TEXT;
    BEGIN
      SELECT e.name, e.maintenance_reason 
      INTO equipment_name, maintenance_reason
      FROM public.equipment e 
      WHERE e.id = NEW.equipment_id;
      
      RAISE EXCEPTION 'MAINTENANCE_ERROR: El equipo % está en mantenimiento: %s', 
        equipment_name, 
        COALESCE(maintenance_reason, 'Razón no especificada')
        USING ERRCODE = 'P0001';
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attach triggers to reservations table (drop if exists first)
DROP TRIGGER IF EXISTS enforce_five_day_limit_trigger ON public.reservations;
CREATE TRIGGER enforce_five_day_limit_trigger
  BEFORE INSERT OR UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_five_day_limit();

DROP TRIGGER IF EXISTS prevent_overlapping_reservations_trigger ON public.reservations;
CREATE TRIGGER prevent_overlapping_reservations_trigger
  BEFORE INSERT OR UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_overlapping_reservations();

DROP TRIGGER IF EXISTS prevent_closed_days_trigger ON public.reservations;
CREATE TRIGGER prevent_closed_days_trigger
  BEFORE INSERT OR UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_closed_days();

DROP TRIGGER IF EXISTS prevent_maintenance_trigger ON public.reservations;
CREATE TRIGGER prevent_maintenance_trigger
  BEFORE INSERT OR UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_maintenance();

-- Add helpful indexes for performance
CREATE INDEX IF NOT EXISTS idx_reservations_equipment_start_time 
ON public.reservations (equipment_id, start_time);

CREATE INDEX IF NOT EXISTS idx_reservations_start_time 
ON public.reservations (start_time);

CREATE INDEX IF NOT EXISTS idx_closed_days_date 
ON public.closed_days (date);

CREATE INDEX IF NOT EXISTS idx_equipment_maintenance 
ON public.equipment (maintenance_mode);