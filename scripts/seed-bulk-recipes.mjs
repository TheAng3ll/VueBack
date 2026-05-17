/**
 * Rellena la tabla recetas (y receta_ingredientes) hasta un mínimo global.
 * Por defecto: 100 recetas en total. Idempotente: solo inserta las que falten.
 *
 * Uso desde VueBack: npm run seed:bulk
 */

import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });

const TARGET = Number(process.env.SEED_RECETAS_MIN ?? 100);

const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'chefsito',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

const proteins = ['huevo', 'pechuga de pollo', 'carne molida', 'atun'];
const veggies = ['tomate', 'cebolla', 'pimiento', 'zanahoria', 'espinaca', 'papa'];
const carbs = ['arroz', 'pasta', 'pan', 'tortilla de maiz', 'avena', 'frijol cocido'];

function cantidadCarb(n) {
  const m = {
    arroz: 1,
    pasta: 200,
    pan: 4,
    'tortilla de maiz': 4,
    avena: 0.75,
    'frijol cocido': 1
  };
  return m[n] ?? 1;
}
function unidadCarb(n) {
  const m = {
    arroz: 'taza',
    pasta: 'gramos',
    pan: 'rebanadas',
    'tortilla de maiz': 'piezas',
    avena: 'taza',
    'frijol cocido': 'taza'
  };
  return m[n] ?? 'porción';
}
function cantidadProtein(n) {
  if (n === 'huevo') return 2;
  if (n === 'atun') return 1;
  return 200;
}
function unidadProtein(n) {
  if (n === 'huevo') return 'piezas';
  if (n === 'atun') return 'lata';
  return 'gramos';
}
function cantidadVeg(n) {
  if (n === 'espinaca') return 80;
  if (n === 'zanahoria' || n === 'papa' || n === 'tomate' || n === 'cebolla' || n === 'pimiento') return 1;
  return 1;
}
function unidadVeg(n) {
  if (n === 'espinaca') return 'gramos';
  return 'piezas';
}

function tituloBase(ca, pr, ve) {
  const label =
    ca === 'frijol cocido'
      ? 'Frijoles cocidos'
      : ca.charAt(0).toUpperCase() + ca.slice(1);
  return `${label} con ${pr} y ${ve}`;
}

function instrucciones(titulo, ca, pr, ve) {
  return (
    `Preparación de «${titulo}»: cocinar o integrar ${ca}, ${pr} y ${ve} con aceite de oliva. ` +
    `Sazonar con sal y pimienta al gusto. Servir caliente y revisar el punto de cocción.`
  );
}

function descripcionCorta(ca, pr, ve) {
  return `Plato combinando ${ca}, ${pr} y ${ve}; ideal para el buscador por ingredientes.`;
}

/** Genera candidatos (titulo + filas de ingredientes) sin repetir titulo */
function* candidatos(excluirTitulos) {
  const difs = ['Fácil', 'Fácil', 'Media'];
  let idx = 0;
  for (const ca of carbs) {
    for (const pr of proteins) {
      for (const ve of veggies) {
        const titulo = tituloBase(ca, pr, ve);
        if (excluirTitulos.has(titulo)) continue;
        const dificultad = difs[idx % difs.length];
        const comensales = 1 + (idx % 4);
        const tiempo_prep = 15 + ((idx * 7) % 55);
        const porciones = comensales;
        const autorOffset = idx % 8;

        const main = new Set([ca, pr, ve]);
        const baseIngs = [
          { nombre: ca, cantidad: cantidadCarb(ca), unidad_medida: unidadCarb(ca) },
          { nombre: pr, cantidad: cantidadProtein(pr), unidad_medida: unidadProtein(pr) },
          { nombre: ve, cantidad: cantidadVeg(ve), unidad_medida: unidadVeg(ve) },
          { nombre: 'aceite de oliva', cantidad: 1, unidad_medida: 'cda' },
          { nombre: 'sal', cantidad: 1, unidad_medida: 'cdita' },
          { nombre: 'pimienta', cantidad: 0.5, unidad_medida: 'cdita' }
        ];
        if (idx % 2 === 0 && !main.has('ajo')) {
          baseIngs.push({ nombre: 'ajo', cantidad: 1, unidad_medida: 'dientes' });
        }
        if (idx % 3 === 0 && !main.has('cebolla')) {
          baseIngs.push({ nombre: 'cebolla', cantidad: 0.25, unidad_medida: 'piezas' });
        }
        if (idx % 5 === 0 && !main.has('limon')) {
          baseIngs.push({ nombre: 'limon', cantidad: 0.5, unidad_medida: 'piezas' });
        }

        yield {
          titulo,
          descripcion: descripcionCorta(ca, pr, ve),
          instrucciones: instrucciones(titulo, ca, pr, ve),
          tiempo_prep,
          comensales,
          porciones,
          dificultad,
          autorOffset,
          ingredientes: baseIngs
        };
        idx += 1;
      }
    }
  }
}

async function main() {
  const [{ c: actual }] = (await pool.query('SELECT count(*)::int AS c FROM recetas')).rows;
  const need = Math.max(0, TARGET - actual);
  console.log(`Recetas actuales: ${actual}. Objetivo: ${TARGET}. A insertar: ${need}.`);
  if (need === 0) {
    await pool.end();
    return;
  }

  const titulosDb = await pool.query('SELECT titulo FROM recetas');
  const usados = new Set(titulosDb.rows.map((r) => r.titulo));

  const autores = (await pool.query('SELECT id FROM usuarios ORDER BY id')).rows.map((r) => r.id);
  if (autores.length === 0) throw new Error('No hay usuarios; ejecuta seed.sql antes.');

  const ingRows = await pool.query('SELECT id, nombre FROM ingredientes ORDER BY id');
  const byNombre = new Map();
  for (const r of ingRows.rows) {
    if (!byNombre.has(r.nombre)) byNombre.set(r.nombre, r.id);
  }

  const toInsert = [];
  for (const c of candidatos(usados)) {
    if (toInsert.length >= need) break;
    const missing = c.ingredientes.filter((i) => !byNombre.has(i.nombre));
    if (missing.length) {
      console.warn('Omitido (ingrediente inexistente):', c.titulo, missing.map((m) => m.nombre));
      continue;
    }
    toInsert.push(c);
    usados.add(c.titulo);
  }

  if (toInsert.length < need) {
    throw new Error(
      `Solo se pudieron generar ${toInsert.length} recetas nuevas; faltaban ${need}. Amplía combinaciones en el script.`
    );
  }

  const client = await pool.connect();
  let inserted = 0;
  try {
    await client.query('BEGIN');
    for (const r of toInsert) {
      const autorId = autores[r.autorOffset % autores.length];
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
          autorId
        ]
      );
      const recetaId = ins.rows[0].id;

      for (const line of r.ingredientes) {
        const iid = byNombre.get(line.nombre);
        await client.query(
          `INSERT INTO receta_ingredientes (receta_id, ingrediente_id, cantidad, unidad_medida)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (receta_id, ingrediente_id) DO NOTHING`,
          [recetaId, iid, line.cantidad, line.unidad_medida]
        );
      }
      inserted += 1;
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  const [{ c: fin }] = (await pool.query('SELECT count(*)::int AS c FROM recetas')).rows;
  console.log(`Insertadas ${inserted} recetas. Total ahora: ${fin}.`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
