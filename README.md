# Chefsito — Backend (VueBack)

API **GraphQL** y REST ligero para imágenes, construida con **Node.js**, **Express** y **PostgreSQL**. Alimenta el frontend [VueFront](../VueFront/README.md): listado y detalle de recetas, búsqueda por ingredientes con porcentaje de match, catálogo de ingredientes, publicación de recetas y subida de fotos.

## Requisitos

- **Node.js** 18+
- **npm** 9+
- **PostgreSQL** 17 (Docker en la raíz del monorepo o instalación local)

## Instalación

```bash
cd VueBack
npm install
```

Copia variables de entorno (crea `.env` a partir de este ejemplo):

```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=chefsito
DB_USER=chefsito_user
DB_PASSWORD=chefsito_pass
PORT=4000

# Opcional
# CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
# IMAGENES_RECETAS_DIR=/ruta/absoluta/a/VueFront/public/imagenes
```

Notas:

- Con **Docker** del repo (`docker-compose.yml` en la raíz), PostgreSQL expone **`5433`** en el host → usa `DB_PORT=5433`.
- PostgreSQL local suele usar **`5432`**.
- Sin `CORS_ORIGIN`, se permiten `http://localhost:5173` y `http://127.0.0.1:5173`.
- Las imágenes de recetas se guardan por defecto en `VueFront/public/imagenes` (servidas por Vite como `/imagenes/...`).

## Base de datos

### Docker (recomendado en desarrollo)

Desde la raíz del proyecto `ChefVue`:

```bash
docker compose up -d
```

Contenedor: `chefsito_db` — puerto host **5433** → 5432 interno.

### Esquema y datos

```bash
# Dentro del contenedor o con psql local apuntando a chefsito
psql -h localhost -p 5433 -U chefsito_user -d chefsito -f VueBack/schema.sql
psql -h localhost -p 5433 -U chefsito_user -d chefsito -f VueBack/seed.sql
```

O con `docker exec`:

```bash
docker exec -i chefsito_db psql -U chefsito_user -d chefsito < VueBack/schema.sql
docker exec -i chefsito_db psql -U chefsito_user -d chefsito < VueBack/seed.sql
```

| Archivo | Uso |
|---------|-----|
| `schema.sql` | Tablas: `usuarios`, `ingredientes`, `recetas`, `receta_ingredientes`, `fotos` |
| `seed.sql` | Datos iniciales de desarrollo |
| `reset_dev.sql` | Limpieza / reinicio del esquema cuando haga falta |

### Seeds adicionales (opcional)

```bash
npm run seed:elaboradas   # Recetas elaboradas con ingredientes enlazados
npm run seed:bulk         # Volumen alto de recetas de prueba
```

Requieren usuarios existentes (p. ej. tras `seed.sql`).

## Levantar el servidor

```bash
npm run dev    # node --watch (recarga al cambiar código)
npm run start  # sin watch
```

| Endpoint | URL |
|----------|-----|
| GraphQL | http://localhost:4000/graphql |
| IDE (Ruru) | http://localhost:4000/ |
| Subir imagen receta | `POST http://localhost:4000/api/imagenes/receta` |

### Puerto 4000 ocupado o esquema desactualizado

Si el front reporta campos GraphQL inexistentes (p. ej. `listarRecetas`), suele haber un proceso viejo:

```bash
pids=$(lsof -t -iTCP:4000 -sTCP:LISTEN)
if [ -n "$pids" ]; then kill $pids; echo "Terminado(s): $pids"; fi
npm run dev
```

## Integración con el frontend

VueFront (Vite) hace proxy de `/graphql` y `/api` hacia `localhost:4000`. Arranca **VueBack antes** que el front en desarrollo.

## API GraphQL

### Queries

| Campo | Argumentos | Descripción |
|-------|------------|-------------|
| `hello` | — | Health check |
| `listarRecetas` | `limite: Int` | Feed: recetas recientes (default 50, máx. 100) |
| `buscarRecetas` | `ingredientes: [String]` | Match por ingredientes (máx. 3 resultados) |
| `receta` | `id: Int!` | Detalle por ID |
| `buscarIngredientes` | `termino: String` | Autocompletado del catálogo |

### Mutations

| Campo | Descripción |
|-------|-------------|
| `publicarReceta` | Crea receta, enlaza ingredientes (existentes o nuevos) y foto opcional |
| `registrarUsuario` | Placeholder (no persiste aún) |

### Tipo `Receta` (campos principales)

`id`, `nombre`, `titulo`, `descripcion`, `consejos`, `instrucciones`, `ingredientes`, `ingredientesMostrar`, `matchPorcentaje`, `tiempo_prep`, `comensales`, `porciones`, `dificultad`, `imagen`, `autor_id`, `autor_username`, `created_at`

### Input `IngredienteRecetaInput`

```graphql
input IngredienteRecetaInput {
  nombre: String!
  descripcion: String!
}
```

Usado en `publicarReceta(ingredientes: [IngredienteRecetaInput!]!)`.

## Ejemplos GraphQL

Listar recetas (feed):

```graphql
query Listar {
  listarRecetas(limite: 20) {
    id
    nombre
    descripcion
    ingredientesMostrar
    tiempo_prep
    porciones
    imagen
    autor_username
    created_at
  }
}
```

Buscar por ingredientes:

```graphql
query Buscar {
  buscarRecetas(ingredientes: ["huevo", "tomate", "queso"]) {
    id
    nombre
    descripcion
    ingredientes
    matchPorcentaje
    tiempo_prep
    imagen
  }
}
```

Detalle:

```graphql
query Detalle {
  receta(id: 1) {
    id
    nombre
    descripcion
    consejos
    instrucciones
    ingredientesMostrar
    tiempo_prep
    porciones
    dificultad
    imagen
  }
}
```

Publicar receta:

```graphql
mutation Publicar {
  publicarReceta(
    titulo: "Tostada rápida"
    instrucciones: "1. Tostar el pan.\n2. Servir."
    autorId: 1
    descripcion: "Desayuno sencillo"
    tiempoPrep: 10
    comensales: 2
    dificultad: "Fácil"
    ingredientes: [
      { nombre: "pan de caja", descripcion: "2 rebanadas" }
      { nombre: "mantequilla", descripcion: "1 cucharada" }
    ]
    imagenUrl: "/imagenes/mi_receta.jpeg"
  ) {
    id
    nombre
    imagen
  }
}
```

## REST — Imágenes

`POST /api/imagenes/receta`

- **Content-Type:** `multipart/form-data`
- **Campo archivo:** `imagen`
- **Campo opcional:** `titulo` (para el nombre del archivo)
- **Límite:** 5 MB; formatos JPG, PNG, WEBP, GIF
- **Respuesta:** `{ "url": "/imagenes/nombre_timestamp.jpeg", "filename": "..." }`

La URL devuelta se pasa a `publicarReceta(imagenUrl: ...)` o la consume el front vía proxy.

## Lógica de negocio

### Búsqueda por ingredientes (`buscarRecetas`)

1. Normaliza texto (minúsculas, sin tildes, trim) y quita duplicados.
2. Carga recetas con ingredientes desde `receta_ingredientes` + catálogo.
3. Calcula `matchPorcentaje = (ingredientes_en_común / total_ingredientes_receta) × 100`.
4. Filtra match &gt; 0, ordena descendente y devuelve **hasta 3** recetas.

### Publicar receta (`publicarReceta`)

- Transacción: insert en `recetas`, resolución/creación de filas en `ingredientes`, enlaces en `receta_ingredientes`, foto principal en `fotos` si hay `imagenUrl`.
- Dificultad válida: `Fácil`, `Media`, `Difícil`.

### Listado (`listarRecetas`)

Orden por `created_at` descendente; incluye imagen principal y `autor_username`.

## Estructura del proyecto

```text
VueBack/
├── src/
│   ├── config/
│   │   ├── database.js       # Pool pg
│   │   └── imagenes.js       # Rutas y validación de uploads
│   ├── graphql/
│   │   ├── schema.js
│   │   ├── queries/
│   │   │   ├── recetaQueries.js
│   │   │   └── ingredienteQueries.js
│   │   ├── mutations/
│   │   │   ├── recetaMutations.js
│   │   │   └── usuarioMutations.js
│   │   └── types/
│   │       ├── RecetaType.js
│   │       ├── IngredienteType.js
│   │       └── UsuarioType.js
│   ├── routes/
│   │   └── imagenesRoutes.js
│   ├── services/
│   │   ├── recetaService.js
│   │   └── ingredienteService.js
│   └── server.js
├── scripts/
│   ├── seed-bulk-recipes.mjs
│   └── seed-recetas-elaboradas.mjs
├── sql/                      # Migraciones puntuales (si aplica)
├── schema.sql
├── seed.sql
├── reset_dev.sql
└── package.json
```

## Stack

- Node.js (ES Modules)
- Express 5
- GraphQL 16 + `graphql-http`
- PostgreSQL (`pg`)
- Multer (subida de imágenes)
- CORS
- Ruru (IDE GraphQL en `/`)
- dotenv

## Scripts npm

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor con `--watch` |
| `npm run start` | Servidor sin watch |
| `npm run seed:elaboradas` | Seed de recetas elaboradas |
| `npm run seed:bulk` | Seed masivo de recetas |

## Recomendaciones para Git

- No subir `node_modules/`
- No subir `.env` con secretos reales
- Mantener un `.env.example` sin contraseñas (recomendado)

## Licencia

Proyecto **privado**. Uso según acuerdo del autor.
