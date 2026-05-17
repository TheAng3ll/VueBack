/**
 * Inserta las 100 recetas elaboradas (catálogo compartido con el Excel) en PostgreSQL:
 * - recetas
 * - ingredientes (reutiliza fila si coincide nombre+descripcion+categoria; si no, INSERT)
 * - receta_ingredientes
 *
 * Requiere al menos un usuario (autor_id NOT NULL).
 *
 * Uso (desde VueBack/):
 *   npm run seed:elaboradas
 *
 * Si ya hay filas en `recetas`, el script aborta salvo:
 *   SEED_ELABORADAS_FORCE=1 npm run seed:elaboradas
 *   → borra todas las filas de receta_ingredientes y recetas, luego inserta las 100.
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { buildRecetasElaboradas, filasIngredientesDb } from '../../scripts/recipe-elaboradas-data.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });

const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'chefsito',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const force = process.env.SEED_ELABORADAS_FORCE === '1' || process.argv.includes('--force');

async function ensureIngrediente(client, row) {
  const nombre = row.nombre;
  const desc = row.categoria ? `Ingrediente (${row.categoria}) para recetas elaboradas` : null;
  const cat = row.categoria || null;
  const found = await client.query(
    `SELECT id FROM ingredientes
     WHERE nombre = $1
       AND descripcion IS NOT DISTINCT FROM $2
       AND categoria IS NOT DISTINCT FROM $3`,
    [nombre, desc, cat]
  );
  if (found.rows.length) return found.rows[0].id;
  const ins = await client.query(
    `INSERT INTO ingredientes (nombre, descripcion, categoria)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [nombre, desc, cat]
  );
  return ins.rows[0].id;
}

async function main() {
  const [{ c: nRecetas }] = (await pool.query('SELECT count(*)::int AS c FROM recetas')).rows;
  if (nRecetas > 0 && !force) {
    console.error(
      `Abortado: hay ${nRecetas} receta(s) en la base. Vacía recetas/receta_ingredientes o ejecuta con SEED_ELABORADAS_FORCE=1 (borra todas las recetas y vínculos).`
    );
    process.exitCode = 1;
    await pool.end();
    return;
  }

  const autores = (await pool.query('SELECT id FROM usuarios ORDER BY id')).rows.map((r) => r.id);
  if (autores.length === 0) {
    throw new Error('No hay usuarios; crea al menos uno (p. ej. seed.sql) antes de sembrar recetas.');
  }

  const recetas = buildRecetasElaboradas();
  if (recetas.length !== 100) {
    throw new Error(`Se esperaban 100 recetas, hay ${recetas.length}`);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (force && nRecetas > 0) {
      await client.query('DELETE FROM receta_ingredientes');
      await client.query('DELETE FROM recetas');
      console.log('Modo force: recetas y vínculos anteriores eliminados.');
    }

    let insRecetas = 0;
    let insLinks = 0;

    for (let idx = 0; idx < recetas.length; idx++) {
      const r = recetas[idx];
      const autorId = autores[idx % autores.length];
      const ingFilas = filasIngredientesDb(r.meta);

      const ins = await client.query(
        `INSERT INTO recetas (
          nombre, titulo, descripcion, instrucciones, tiempo_prep, comensales, porciones, dificultad, usuario_id, autor_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, $9)
        RETURNING id`,
        [
          r.titulo,
          r.titulo,
          r.descripcion,
          r.instrucciones,
          r.tiempo_prep,
          r.comensales,
          r.porciones,
          r.dificultad,
          autorId,
        ]
      );
      const recetaId = ins.rows[0].id;
      insRecetas += 1;

      for (const line of ingFilas) {
        const ingredienteId = await ensureIngrediente(client, line);
        await client.query(
          `INSERT INTO receta_ingredientes (receta_id, ingrediente_id, cantidad, unidad_medida)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (receta_id, ingrediente_id) DO NOTHING`,
          [recetaId, ingredienteId, line.cantidad, line.unidad_medida]
        );
        insLinks += 1;
      }
    }

    await client.query('COMMIT');
    console.log(`Listo: ${insRecetas} recetas, ${insLinks} filas en receta_ingredientes (incl. duplicados por receta).`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  const [{ c: totalR }] = (await pool.query('SELECT count(*)::int AS c FROM recetas')).rows;
  const [{ c: totalI }] = (await pool.query('SELECT count(*)::int AS c FROM ingredientes')).rows;
  const [{ c: totalRi }] = (await pool.query('SELECT count(*)::int AS c FROM receta_ingredientes')).rows;
  console.log(`Totales en DB: recetas=${totalR}, ingredientes=${totalI}, receta_ingredientes=${totalRi}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
