import { query } from '../config/database.js';

const LIMITE_BUSQUEDA = 12;

/**
 * @param {string} [termino]
 */
export const buscarIngredientesCatalogo = async (termino = '') => {
  const q = termino.trim();
  if (q.length < 1) return [];

  const patron = `%${q}%`;

  const { rows } = await query(
    `SELECT id, nombre, descripcion
     FROM ingredientes
     WHERE nombre ILIKE $1 OR COALESCE(descripcion, '') ILIKE $1
     ORDER BY nombre ASC, id DESC
     LIMIT $2`,
    [patron, LIMITE_BUSQUEDA]
  );

  return rows;
};

/**
 * Inserta un ingrediente (sin categoría) y devuelve su id.
 */
export const insertarIngrediente = async (client, nombre, descripcion = null) => {
  const nombreLimpio = nombre?.trim();
  if (!nombreLimpio) return null;

  const descLimpia = descripcion?.trim() || null;

  const { rows } = await client.query(
    `INSERT INTO ingredientes (nombre, descripcion) VALUES ($1, $2) RETURNING id`,
    [nombreLimpio, descLimpia]
  );

  return rows[0]?.id ?? null;
};

/**
 * Resuelve el id de ingrediente para enlazar a la receta.
 * Siempre inserta una fila nueva (nombre + descripción) propia de esta receta.
 * @param {import('pg').PoolClient} client
 * @param {{ nombre: string, descripcion?: string|null }} item
 */
export const resolverIngredienteParaReceta = async (client, item) => {
  const nombreLimpio = item.nombre?.trim();
  const descLimpia = item.descripcion?.trim();
  if (!nombreLimpio) return null;
  if (!descLimpia) {
    throw new Error(`La descripción es obligatoria para "${nombreLimpio}".`);
  }
  return insertarIngrediente(client, nombreLimpio, descLimpia);
};
