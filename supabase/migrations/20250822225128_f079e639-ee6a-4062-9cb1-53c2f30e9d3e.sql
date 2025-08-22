-- Crear tabla para bloqueos de eventos administrativos
CREATE TABLE public.event_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  equipment_ids UUID[] NOT NULL DEFAULT '{}', -- Array de IDs de equipos bloqueados
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.event_blocks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Event blocks are viewable by everyone" 
ON public.event_blocks 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage event blocks" 
ON public.event_blocks 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_event_blocks_updated_at
BEFORE UPDATE ON public.event_blocks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Validación: end_time debe ser mayor que start_time
CREATE OR REPLACE FUNCTION public.validate_event_block_times()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.end_time <= NEW.start_time THEN
    RAISE EXCEPTION 'VALIDATION_ERROR: end_time debe ser mayor que start_time' USING ERRCODE = 'P0001';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_event_block_times_trigger
BEFORE INSERT OR UPDATE ON public.event_blocks
FOR EACH ROW
EXECUTE FUNCTION public.validate_event_block_times();

-- Habilitar realtime para actualizaciones en tiempo real
ALTER TABLE public.event_blocks REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_blocks;