-- Crear validación de horario de operación (12:00-24:00, sin terminar después de medianoche excepto exactamente 00:00)
CREATE OR REPLACE FUNCTION public.enforce_business_hours()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Inicio no antes de 12:00 (mediodía)
  IF (NEW.start_time::time < time '12:00:00') THEN
    RAISE EXCEPTION 'BUSINESS_HOURS_ERROR: El horario de inicio debe ser a partir de 12:00 PM' USING ERRCODE = 'P0001';
  END IF;

  -- Fin permitido hasta las 00:00 exactas del día siguiente, pero no más allá ni cruzar a otro día con otra hora
  IF (NEW.end_time::date > NEW.start_time::date) THEN
    IF (NEW.end_time::time <> time '00:00:00' OR NEW.end_time::date <> NEW.start_time::date + interval '1 day') THEN
      RAISE EXCEPTION 'BUSINESS_HOURS_ERROR: La reserva no puede finalizar después de la medianoche' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Asociar el trigger a reservations
DROP TRIGGER IF EXISTS enforce_business_hours_trigger ON public.reservations;
CREATE TRIGGER enforce_business_hours_trigger
  BEFORE INSERT OR UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_business_hours();