import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createHandler } from 'graphql-http/lib/use/express';
import { ruruHTML } from 'ruru/server';
import schema from './graphql/schema.js';
import imagenesRoutes from './routes/imagenesRoutes.js';

const defaultOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const corsOrigins = process.env.CORS_ORIGIN?.trim()
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
  : defaultOrigins;

const app = express();

app.use(
  cors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use('/api/imagenes', imagenesRoutes);

// GraphQL endpoint
app.all('/graphql', createHandler({ schema }));

// GraphiQL IDE
app.get('/', (_req, res) => {
  res.type('html');
  res.end(ruruHTML({ endpoint: '/graphql' }));
});

const PORT = Number(process.env.PORT || 4000);

const server = app.listen(PORT, () => {
  console.log(`Running a GraphQL API server at http://localhost:${PORT}/graphql`);
  console.log(`GraphiQL IDE at http://localhost:${PORT}/`);
  console.log('Mutation publicarReceta usa ingredientes: [IngredienteRecetaInput!]!');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\nPuerto ${PORT} en uso. Detén el proceso anterior y vuelve a ejecutar npm run dev:\n` +
        `  pids=$(lsof -t -iTCP:${PORT} -sTCP:LISTEN)\n` +
        `  if [ -n "$pids" ]; then kill $pids; fi\n`
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});