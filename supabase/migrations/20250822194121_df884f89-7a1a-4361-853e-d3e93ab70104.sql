-- Arreglar las validaciones de horario para que funcionen con zona horaria local chilena (UTC-3)
-- Primero, eliminar triggers existentes que causan problemas
DROP TRIGGER IF EXISTS enforce_business_hours_trigger ON public.reservations;

-- Recrear la función de horarios de negocio con manejo correcto de zona horaria
CREATE OR REPLACE FUNCTION public.enforce_business_hours()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Convertir los timestamps UTC a hora local chilena (UTC-3)
  -- En Chile: UTC-3 en invierno, UTC-3 en verano (no usan horario de verano desde 2019)
  DECLARE
    local_start_time time;
    local_end_time time;
    local_start_date date;
    local_end_date date;
  BEGIN
    -- Convertir UTC a hora local chilena (UTC-3)
    local_start_time := (NEW.start_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/Santiago')::time;
    local_end_time := (NEW.end_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/Santiago')::time;
    local_start_date := (NEW.start_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/Santiago')::date;
    local_end_date := (NEW.end_time AT TIME ZONE 'UTC' AT TIME ZONE 'America/Santiago')::date;
    
    -- Validar que el inicio sea desde las 12:00 PM (mediodía)
    IF local_start_time < time '12:00:00' THEN
      RAISE EXCEPTION 'BUSINESS_HOURS_ERROR: El horario de inicio debe ser a partir de 12:00 PM (hora local)' USING ERRCODE = 'P0001';
    END IF;

    -- Permitir reservas hasta medianoche (00:00:00 del día siguiente)
    -- Si la reserva cruza medianoche, verificar que termine exactamente a las 00:00:00
    IF local_end_date > local_start_date THEN
      IF local_end_time <> time '00:00:00' THEN
        RAISE EXCEPTION 'BUSINESS_HOURS_ERROR: Las reservas que cruzan medianoche deben terminar exactamente a las 00:00:00' USING ERRCODE = 'P0001';
      END IF;
    END IF;

    -- Si la reserva es el mismo día, verificar que termine antes o a la medianoche (24:00 = 00:00 del día siguiente)
    IF local_end_date = local_start_date AND local_end_time < local_start_time THEN
      RAISE EXCEPTION 'BUSINESS_HOURS_ERROR: La hora de fin debe ser posterior a la hora de inicio en el mismo día' USING ERRCODE = 'P0001';
    END IF;

    RETURN NEW;
  END;
END;
$function$;

-- Recrear el trigger
CREATE TRIGGER enforce_business_hours_trigger
  BEFORE INSERT OR UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_business_hours();