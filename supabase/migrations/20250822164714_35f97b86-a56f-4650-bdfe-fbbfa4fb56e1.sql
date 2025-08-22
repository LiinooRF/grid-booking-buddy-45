-- Recrear todos los triggers de validación que se perdieron en el rollback

-- TRIGGER 1: Prevenir solapamientos de reservas
CREATE TRIGGER prevent_overlapping_reservations_trigger
    BEFORE INSERT OR UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_overlapping_reservations();

-- TRIGGER 2: Prevenir reservas en días cerrados  
CREATE TRIGGER prevent_closed_days_trigger
    BEFORE INSERT OR UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_closed_days();

-- TRIGGER 3: Prevenir reservas en equipos en mantenimiento
CREATE TRIGGER prevent_maintenance_trigger
    BEFORE INSERT OR UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_maintenance();

-- TRIGGER 4: Aplicar límite de 5 días
CREATE TRIGGER enforce_five_day_limit_trigger
    BEFORE INSERT OR UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_five_day_limit();

-- TRIGGER 5: Actualizar timestamp automáticamente
CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at
    BEFORE UPDATE ON public.equipment
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_closed_days_updated_at
    BEFORE UPDATE ON public.closed_days
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();