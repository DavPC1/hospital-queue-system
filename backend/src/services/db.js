// backend/src/services/db.js
import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const config = {
  server: process.env.SQL_SERVER,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: process.env.SQL_ENCRYPT === 'true',
    trustServerCertificate: true
  }
};

let pool;

export async function getConnection() {
  if (pool) return pool;
  pool = await sql.connect(config);
  console.log('✅ Conexión establecida con SQL Server');
  return pool;
}

export async function closeConnection() {
  if (pool) { await pool.close(); pool = null; }
}
