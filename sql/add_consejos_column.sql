-- Ejecutar una vez en bases ya creadas (antes solo existía schema sin esta columna).
ALTER TABLE recetas ADD COLUMN IF NOT EXISTS consejos TEXT;
