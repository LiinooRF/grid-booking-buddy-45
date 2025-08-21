-- Arreglar los datos mezclados en las consolas
UPDATE equipment 
SET description = 'PlayStation 5' 
WHERE name = 'PlayStation 5' AND description = 'Nintendo Switch 2';

UPDATE equipment 
SET description = 'Nintendo Switch 2' 
WHERE name = 'Nintendo Switch 2' AND description = 'PlayStation 5';