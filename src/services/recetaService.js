import { getClient, query } from '../config/database.js';
import { normalizarUrlImagenReceta } from '../config/imagenes.js';
import { resolverIngredienteParaReceta } from './ingredienteService.js';

const MAX_RESULTADOS = 3;

const normalizarIngrediente = (valor = '') =>
  valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const sanitizarIngredientesEntrada = (ingredientes = []) =>
  [...new Set(ingredientes.map(normalizarIngrediente).filter(Boolean))];

const RECETAS_CON_INGREDIENTES_SQL = `
  SELECT
    r.id,
    COALESCE(r.nombre, r.titulo) AS nombre,
    r.titulo,
    r.descripcion,
    r.consejos,
    r.instrucciones,
    r.tiempo_prep,
    r.comensales,
    r.porciones,
    r.dificultad,
    r.usuario_id,
    r.autor_id,
    r.created_at,
    u.username AS autor_username,
    f.url AS imagen,
    COALESCE(
      (
        SELECT array_agg(i2.nombre ORDER BY i2.nombre)
        FROM receta_ingredientes ri2
        JOIN ingredientes i2 ON i2.id = ri2.ingrediente_id
        WHERE ri2.receta_id = r.id
      ),
      ARRAY[]::text[]
    ) AS ingredientes,
    COALESCE(
      (
        SELECT array_agg(
          COALESCE(NULLIF(trim(i2.descripcion), ''), i2.nombre) ORDER BY i2.nombre
        )
        FROM receta_ingredientes ri2
        JOIN ingredientes i2 ON i2.id = ri2.ingrediente_id
        WHERE ri2.receta_id = r.id
      ),
      ARRAY[]::text[]
    ) AS ingredientes_mostrar
  FROM recetas r
  LEFT JOIN usuarios u ON u.id = r.autor_id
  LEFT JOIN fotos f
    ON f.entidad_id = r.id
    AND f.entidad_tipo = 'RECETA'
    AND f.es_principal = TRUE
  GROUP BY r.id, f.url, u.username
`;

const LISTAR_RECETAS_SQL = `${RECETAS_CON_INGREDIENTES_SQL}
  ORDER BY r.created_at DESC
  LIMIT $1
`;

const RECETA_POR_ID_SQL = RECETAS_CON_INGREDIENTES_SQL.replace(
  /\s+GROUP BY r\.id, f\.url, u\.username\s*$/,
  '\n  WHERE r.id = $1\n  GROUP BY r.id, f.url, u.username\n  LIMIT 1\n'
);

export const listarRecetas = async (limite = 50) => {
  const max = Math.min(Math.max(Number(limite) || 50, 1), 100);
  const { rows } = await query(LISTAR_RECETAS_SQL, [max]);
  return rows;
};

export const obtenerRecetaPorId = async (id) => {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) {
    return null;
  }
  const { rows } = await query(RECETA_POR_ID_SQL, [numericId]);
  return rows[0] ?? null;
};

export const buscarRecetasPorIngredientes = async (ingredientes = []) => {
  const ingredientesUsuario = sanitizarIngredientesEntrada(ingredientes);
  if (!ingredientesUsuario.length) {
    return [];
  }

  const { rows } = await query(RECETAS_CON_INGREDIENTES_SQL);

  const ingredientesUsuarioSet = new Set(ingredientesUsuario);

  const resultados = rows
    .map((receta) => {
      const ingredientesReceta = sanitizarIngredientesEntrada(receta.ingredientes);
      const totalIngredientes = ingredientesReceta.length;

      if (!totalIngredientes) {
        return null;
      }

      const ingredientesEnComun = ingredientesReceta.filter((ingReceta) =>
        ingredientesUsuarioSet.has(ingReceta)
      ).length;

      const matchPorcentaje = Number(
        ((ingredientesEnComun / totalIngredientes) * 100).toFixed(2)
      );

      return {
        ...receta,
        matchPorcentaje,
      };
    })
    .filter((receta) => receta && receta.matchPorcentaje > 0)
    .sort((a, b) => b.matchPorcentaje - a.matchPorcentaje)
    .slice(0, MAX_RESULTADOS);

  return resultados;
};

const DIFICULTADES_VALIDAS = new Set(['Fácil', 'Media', 'Difícil']);

const normalizarItemsIngredientes = (ingredientes = []) => {
  const items = [];

  for (const raw of ingredientes) {
    if (typeof raw === 'string') {
      const nombre = raw.trim();
      if (nombre) {
        throw new Error(`Indica la descripción para el ingrediente "${nombre}".`);
      }
      continue;
    }

    const nombre = raw?.nombre?.trim();
    if (!nombre) continue;

    const descripcion = raw.descripcion?.trim();
    if (!descripcion) {
      throw new Error(`La descripción es obligatoria para "${nombre}".`);
    }

    items.push({ nombre, descripcion });
  }

  return items;
};

/**
 * Crea una receta con ingredientes (catálogo o nuevos) y foto opcional.
 * @param {object} datos
 */
export const crearReceta = async ({
  titulo,
  instrucciones,
  autorId,
  nombre = null,
  descripcion = null,
  consejos = null,
  tiempoPrep = null,
  comensales = 1,
  porciones = null,
  dificultad = null,
  ingredientes = [],
  imagenUrl = null,
}) => {
  const tituloLimpio = titulo?.trim();
  const instruccionesLimpias = instrucciones?.trim();
  const autor = Number(autorId);

  if (!tituloLimpio) throw new Error('El título es obligatorio.');
  if (!instruccionesLimpias) throw new Error('Las instrucciones son obligatorias.');
  if (!Number.isInteger(autor) || autor < 1) throw new Error('autorId inválido.');

  const itemsIngredientes = normalizarItemsIngredientes(ingredientes);
  if (!itemsIngredientes.length) {
    throw new Error('Agrega al menos un ingrediente.');
  }

  if (dificultad && !DIFICULTADES_VALIDAS.has(dificultad)) {
    throw new Error('Dificultad inválida. Usa: Fácil, Media o Difícil.');
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { rows: recetaRows } = await client.query(
      `INSERT INTO recetas (
        nombre, titulo, descripcion, consejos, instrucciones,
        tiempo_prep, comensales, porciones, dificultad, autor_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id`,
      [
        nombre?.trim() || tituloLimpio,
        tituloLimpio,
        descripcion?.trim() || null,
        consejos?.trim() || null,
        instruccionesLimpias,
        tiempoPrep != null ? Number(tiempoPrep) : null,
        comensales != null ? Number(comensales) : 1,
        porciones != null ? Number(porciones) : null,
        dificultad || null,
        autor,
      ]
    );

    const recetaId = recetaRows[0].id;

    for (const item of itemsIngredientes) {
      const ingredienteId = await resolverIngredienteParaReceta(client, item);
      if (!ingredienteId) continue;
      await client.query(
        `INSERT INTO receta_ingredientes (receta_id, ingrediente_id)
         VALUES ($1, $2)
         ON CONFLICT (receta_id, ingrediente_id) DO NOTHING`,
        [recetaId, ingredienteId]
      );
    }

    const urlImagen = normalizarUrlImagenReceta(imagenUrl);
    if (urlImagen) {
      await client.query(
        `INSERT INTO fotos (url, entidad_id, entidad_tipo, es_principal)
         VALUES ($1, $2, 'RECETA', TRUE)`,
        [urlImagen, recetaId]
      );
    }

    await client.query('COMMIT');
    return obtenerRecetaPorId(recetaId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
