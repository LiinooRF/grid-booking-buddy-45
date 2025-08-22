-- Add function to prevent reservations during event blocks
CREATE OR REPLACE FUNCTION public.prevent_event_conflicts()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if there are any event blocks that conflict with this reservation
  IF EXISTS (
    SELECT 1 
    FROM public.event_blocks eb
    WHERE eb.equipment_ids @> ARRAY[NEW.equipment_id]
    AND tstzrange(eb.start_time, eb.end_time, '[)') && tstzrange(NEW.start_time, NEW.end_time, '[)')
  ) THEN
    DECLARE
      event_title TEXT;
    BEGIN
      SELECT eb.title INTO event_title
      FROM public.event_blocks eb
      WHERE eb.equipment_ids @> ARRAY[NEW.equipment_id]
      AND tstzrange(eb.start_time, eb.end_time, '[)') && tstzrange(NEW.start_time, NEW.end_time, '[)')
      LIMIT 1;
      
      RAISE EXCEPTION 'EVENT_CONFLICT: No se puede reservar durante el evento: %', 
        COALESCE(event_title, 'Evento sin título')
        USING ERRCODE = 'P0001';
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Create trigger to enforce event conflicts prevention
DROP TRIGGER IF EXISTS prevent_event_conflicts_trigger ON public.reservations;
CREATE TRIGGER prevent_event_conflicts_trigger
  BEFORE INSERT OR UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_event_conflicts();