-- Habilitar replicación completa para actualizaciones en tiempo real
ALTER TABLE public.reservations REPLICA IDENTITY FULL;
ALTER TABLE public.event_blocks REPLICA IDENTITY FULL;

-- Intentar agregar reservations a la publicación (puede fallar si ya está)
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
    EXCEPTION
        WHEN duplicate_object THEN
            -- La tabla ya está en la publicación, continuar
            NULL;
    END;
END$$;