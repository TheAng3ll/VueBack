# VueBack - Backend de Chefsito

API GraphQL construida con Node.js, Express y PostgreSQL para el MVP de Chefsito.
Permite buscar recetas por ingredientes, consultar detalle por ID y deja la base lista para futuras mutaciones de usuarios.

## Descripcion corta

Backend GraphQL (Node + Express + PostgreSQL) para busqueda de recetas por ingredientes y detalle de receta.

## Stack

- Node.js (ES Modules)
- Express 5
- GraphQL (`graphql`, `graphql-http`)
- PostgreSQL (`pg`)
- CORS
- Ruru (IDE GraphQL web)

## Requisitos

- Node.js 18+
- npm 9+
- PostgreSQL (local o Docker)

## Instalacion

```bash
cd VueBack
npm install
```

## Variables de entorno

El proyecto usa `dotenv` y lee estas variables:

```env
DB_HOST=localhost
DB_PORT=5433
DB_NAME=chefsito
DB_USER=chefsito_user
DB_PASSWORD=chefsito_pass
# Opcional (coma separada):
# CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

Notas:
- Si usas PostgreSQL local por defecto, normalmente `DB_PORT=5432`.
- Si no defines `CORS_ORIGIN`, ya se permiten `http://localhost:5173` y `http://127.0.0.1:5173`.

## Scripts

- `npm run dev`: inicia servidor en modo watch
- `npm run start`: inicia servidor normal

## Levantar el servidor

```bash
npm run dev
```

Endpoints:
- GraphQL API: `http://localhost:4000/graphql`
- IDE GraphQL (Ruru): `http://localhost:4000/`

## Esquema y operaciones actuales

### Queries

- `hello: String`
- `buscarRecetas(ingredientes: [String]): [Receta]`
- `receta(id: Int!): Receta`

### Mutations

- `registrarUsuario(nombre: String, email: String, password: String): Usuario`
  - Actualmente esta mutacion es placeholder y no persiste datos todavia.

## Ejemplos GraphQL

Buscar recetas por ingredientes:

```graphql
query Buscar {
  buscarRecetas(ingredientes: ["huevo", "tomate", "queso"]) {
    id
    nombre
    descripcion
    ingredientes
    matchPorcentaje
    tiempo_prep
    porciones
    imagen
  }
}
```

Consultar receta por ID:

```graphql
query RecetaPorId {
  receta(id: 1) {
    id
    nombre
    descripcion
    instrucciones
    ingredientes
    tiempo_prep
    porciones
    dificultad
    imagen
  }
}
```

## Logica de matching

La busqueda por ingredientes:
- normaliza texto (minusculas, sin tildes, trim)
- elimina duplicados
- calcula `matchPorcentaje = (ingredientes_en_comun / total_ingredientes_receta) * 100`
- filtra resultados con match mayor a 0
- ordena de mayor a menor
- retorna maximo 3 recetas

## Estructura del proyecto

```text
VueBack/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── graphql/
│   │   ├── schema.js
│   │   ├── queries/
│   │   │   └── recetaQueries.js
│   │   ├── mutations/
│   │   │   └── usuarioMutations.js
│   │   └── types/
│   │       ├── RecetaType.js
│   │       └── UsuarioType.js
│   ├── services/
│   │   └── recetaService.js
│   └── server.js
├── schema.sql
├── seed.sql
├── reset_dev.sql
└── package.json
```

## Base de datos

Para preparar datos:
- crear estructura con `schema.sql`
- poblar con `seed.sql`
- limpiar/reiniciar con `reset_dev.sql` cuando sea necesario

## Recomendaciones para Git

- No subir `node_modules/`
- No subir `.env` real
- Subir un `.env.example` sin secretos (recomendado)
