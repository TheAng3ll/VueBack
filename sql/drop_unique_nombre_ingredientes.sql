-- Permite varias filas con el mismo `nombre` y distinta `descripcion` (PK sigue siendo `id`).
ALTER TABLE ingredientes DROP CONSTRAINT IF EXISTS uq_ingredientes_nombre;

CREATE INDEX IF NOT EXISTS idx_ingredientes_nombre ON ingredientes (nombre);
