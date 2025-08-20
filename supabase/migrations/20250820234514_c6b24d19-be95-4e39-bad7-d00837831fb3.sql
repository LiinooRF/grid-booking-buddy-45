-- Delete all existing equipment first
DELETE FROM public.equipment;

-- Insert the correct 6 PCs with RTX 5070, 1 PS5, and 1 Nintendo Switch
INSERT INTO public.equipment (name, type, status, description) VALUES 
('PC1', 'PC Gaming', 'available', 'PC Gaming con NVIDIA RTX 5070'),
('PC2', 'PC Gaming', 'available', 'PC Gaming con NVIDIA RTX 5070'),
('PC3', 'PC Gaming', 'available', 'PC Gaming con NVIDIA RTX 5070'),
('PC4', 'PC Gaming', 'available', 'PC Gaming con NVIDIA RTX 5070'),
('PC5', 'PC Gaming', 'available', 'PC Gaming con NVIDIA RTX 5070'),
('PC6', 'PC Gaming', 'available', 'PC Gaming con NVIDIA RTX 5070'),
('CON1', 'PlayStation 5', 'available', 'PlayStation 5'),
('CON2', 'Nintendo Switch', 'available', 'Nintendo Switch 2');