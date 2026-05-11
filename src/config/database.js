import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'chefsito',
  user: process.env.DB_USER || 'chefsito_user',
  password: process.env.DB_PASSWORD || 'chefsito_pass',
});

pool.on('error', (error) => {
  console.error('Unexpected error on idle PostgreSQL client', error);
});

export const query = (text, params = []) => pool.query(text, params);
export const getClient = () => pool.connect();
export const closePool = () => pool.end();

export default pool;
