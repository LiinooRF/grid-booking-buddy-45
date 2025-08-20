-- Crear tabla de equipos/dispositivos
CREATE TABLE public.equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'PC', 'PS5', 'Xbox', etc.
  status TEXT NOT NULL DEFAULT 'available', -- 'available', 'occupied', 'maintenance'
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de reservas
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id),
  user_name TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  hours INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'active', 'completed', 'cancelled'
  ticket_number TEXT NOT NULL UNIQUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Políticas para equipos (lectura pública)
CREATE POLICY "Equipment is viewable by everyone" 
ON public.equipment 
FOR SELECT 
USING (true);

-- Políticas para reservas (lectura pública para mostrar ocupados)
CREATE POLICY "Reservations are viewable by everyone" 
ON public.reservations 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create reservations" 
ON public.reservations 
FOR INSERT 
WITH CHECK (true);

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para timestamps
CREATE TRIGGER update_equipment_updated_at
    BEFORE UPDATE ON public.equipment
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar equipos de ejemplo
INSERT INTO public.equipment (name, type, description) VALUES
('PC Gaming 1', 'PC', 'PC Gaming con RTX 4060, 16GB RAM'),
('PC Gaming 2', 'PC', 'PC Gaming con RTX 4060, 16GB RAM'),
('PC Gaming 3', 'PC', 'PC Gaming con RTX 4060, 16GB RAM'),
('PlayStation 5 - Estación 1', 'PS5', 'PS5 con controles DualSense'),
('PlayStation 5 - Estación 2', 'PS5', 'PS5 con controles DualSense'),
('Xbox Series X', 'Xbox', 'Xbox Series X con Game Pass');