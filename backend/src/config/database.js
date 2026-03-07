import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: false // Supabase requiere SSL
  },
  max: 10, // connectionLimit equivalente
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Helper para mantener compatibilidad con mysql2
export const query = async (text, params) => {
  const result = await pool.query(text, params);
  return [result.rows, result.fields];
};

export default pool;
