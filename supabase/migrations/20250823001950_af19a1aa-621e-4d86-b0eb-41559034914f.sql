-- Habilitar replicación completa para actualizaciones en tiempo real
ALTER TABLE public.reservations REPLICA IDENTITY FULL;
ALTER TABLE public.event_blocks REPLICA IDENTITY FULL;

-- Asegurar que las tablas estén en la publicación de tiempo real
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_blocks;