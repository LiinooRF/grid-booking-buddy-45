-- Fix the equipment types to match what the component expects
UPDATE public.equipment 
SET type = 'PC' 
WHERE type = 'PC Gaming';

UPDATE public.equipment 
SET type = 'CONSOLE' 
WHERE type IN ('PlayStation 5', 'Nintendo Switch');