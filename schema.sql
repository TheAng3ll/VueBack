-- Esquema Chefsito (PostgreSQL). Idempotente en desarrollo.
-- Ejecutar una vez antes de seed.sql (o tras DROP manual si recreas todo).

-- ---------- tipo ENUM ----------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_entidad') THEN
    CREATE TYPE tipo_entidad AS ENUM ('RECETA', 'INGREDIENTE', 'USUARIO');
  END IF;
END$$;

-- ---------- tablas ----------
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  biografia TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ingredientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(50),
  CONSTRAINT uq_ingredientes_nombre UNIQUE (nombre)
);

CREATE TABLE IF NOT EXISTS recetas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  instrucciones TEXT NOT NULL,
  tiempo_prep INTEGER,
  comensales INTEGER DEFAULT 1,
  porciones INTEGER,
  dificultad VARCHAR(20) CHECK (dificultad IN ('Fácil', 'Media', 'Difícil')),
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  autor_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fotos (
  id SERIAL PRIMARY KEY,
  url VARCHAR(500) NOT NULL,
  entidad_id INTEGER NOT NULL,
  entidad_tipo tipo_entidad NOT NULL,
  es_principal BOOLEAN DEFAULT FALSE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS receta_ingredientes (
  id SERIAL PRIMARY KEY,
  receta_id INTEGER NOT NULL REFERENCES recetas(id) ON DELETE CASCADE,
  ingrediente_id INTEGER NOT NULL REFERENCES ingredientes(id) ON DELETE CASCADE,
  cantidad DECIMAL(10, 2),
  unidad_medida VARCHAR(20),
  CONSTRAINT uq_receta_ingrediente UNIQUE (receta_id, ingrediente_id)
);

-- ---------- índices ----------
CREATE INDEX IF NOT EXISTS idx_fotos_entidad ON fotos(entidad_id, entidad_tipo);
CREATE INDEX IF NOT EXISTS idx_receta_ingredientes_receta ON receta_ingredientes(receta_id);
CREATE INDEX IF NOT EXISTS idx_receta_ingredientes_ingrediente ON receta_ingredientes(ingrediente_id);
