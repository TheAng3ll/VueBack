-- Solo desarrollo: borra tablas y el tipo ENUM para volver a crear desde cero.
-- Orden: 1) este archivo  2) schema.sql  3) seed.sql

DROP TABLE IF EXISTS receta_ingredientes CASCADE;
DROP TABLE IF EXISTS fotos CASCADE;
DROP TABLE IF EXISTS recetas CASCADE;
DROP TABLE IF EXISTS ingredientes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

DROP TYPE IF EXISTS tipo_entidad CASCADE;
