-- Get the equipment IDs first and update them one by one
-- Update PCs to PC1, PC2, PC3, PC4, PC5, PC6
WITH pc_equipment AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.equipment 
  WHERE type = 'PC Gaming'
)
UPDATE public.equipment 
SET name = 'PC' || pc_equipment.rn
FROM pc_equipment
WHERE equipment.id = pc_equipment.id;

-- Update consoles to CON1, CON2
WITH console_equipment AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM public.equipment 
  WHERE type IN ('PlayStation 5', 'Nintendo Switch')
)
UPDATE public.equipment 
SET name = 'CON' || console_equipment.rn
FROM console_equipment
WHERE equipment.id = console_equipment.id;