import mssql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

let pool;

export async function connectDB() {
  if (pool) return pool;

  try {
    pool = await mssql.connect({
      user: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || '',
      server: process.env.DB_SERVER || 'localhost',
      database: process.env.DB_NAME || 'IMAGEMUNIFORMES_pBI',
      port: Number(process.env.DB_PORT) || 1433,
      options: { 
        encrypt: process.env.DB_ENCRYPT === 'true' || false, 
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true' || true 
      }
    });
    console.log("Conectado ao SQL Server");
    return pool;
  } catch (err) {
    console.error("Erro ao conectar ao SQL Server:", err);
    throw err;
  }
}

export { mssql };