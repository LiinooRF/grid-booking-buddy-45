-- Eliminar triggers existentes y recrearlos correctamente

-- Eliminar triggers existentes
DROP TRIGGER IF EXISTS prevent_overlapping_reservations_trigger ON public.reservations;
DROP TRIGGER IF EXISTS prevent_closed_days_trigger ON public.reservations;
DROP TRIGGER IF EXISTS prevent_maintenance_trigger ON public.reservations;
DROP TRIGGER IF EXISTS enforce_five_day_limit_trigger ON public.reservations;
DROP TRIGGER IF EXISTS update_reservations_updated_at ON public.reservations;
DROP TRIGGER IF EXISTS update_equipment_updated_at ON public.equipment;
DROP TRIGGER IF EXISTS update_closed_days_updated_at ON public.closed_days;

-- Recrear triggers en el orden correcto
CREATE TRIGGER prevent_overlapping_reservations_trigger
    BEFORE INSERT OR UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_overlapping_reservations();

CREATE TRIGGER prevent_closed_days_trigger
    BEFORE INSERT OR UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_closed_days();

CREATE TRIGGER prevent_maintenance_trigger
    BEFORE INSERT OR UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_maintenance();

CREATE TRIGGER enforce_five_day_limit_trigger
    BEFORE INSERT OR UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_five_day_limit();

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