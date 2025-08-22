-- Hotfix: desactivar validación de horario para desbloquear inserciones mientras ajustamos el cliente
DROP TRIGGER IF EXISTS enforce_business_hours_trigger ON public.reservations;