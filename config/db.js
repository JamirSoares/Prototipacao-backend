import mssql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

let pool;

export async function connectDB() {
  if (pool) return pool;

  try {
    pool = await mssql.connect({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      server: process.env.DB_SERVER,
      database: process.env.DB_DATABASE,
      port: parseInt(process.env.DB_PORT, 10),
      options: {
        encrypt: false,
        trustServerCertificate: true
      }
    });

    console.log("✅ Conectado ao SQL Server local (SQLEXPRESS)");
    return pool;
  } catch (err) {
    console.error("❌ Erro ao conectar ao SQL Server:", err);
    throw err;
  }
}

export { mssql };
