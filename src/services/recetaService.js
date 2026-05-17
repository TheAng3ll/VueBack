import { query } from '../config/database.js';

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
  LEFT JOIN fotos f
    ON f.entidad_id = r.id
    AND f.entidad_tipo = 'RECETA'
    AND f.es_principal = TRUE
  GROUP BY r.id, f.url
`;

const RECETA_POR_ID_SQL = RECETAS_CON_INGREDIENTES_SQL.replace(
  /\s+GROUP BY r\.id, f\.url\s*$/,
  '\n  WHERE r.id = $1\n  GROUP BY r.id, f.url\n  LIMIT 1\n'
);

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
