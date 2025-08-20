-- Update PC names to PC1, PC2, PC3, PC4, PC5, PC6
UPDATE public.equipment 
SET name = 'PC' || ROW_NUMBER() OVER (ORDER BY created_at)
WHERE type = 'PC Gaming';

-- Update console names to CON1, CON2
UPDATE public.equipment 
SET name = 'CON' || ROW_NUMBER() OVER (ORDER BY created_at)
WHERE type IN ('PlayStation 5', 'Nintendo Switch');