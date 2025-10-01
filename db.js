// db.js
const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true, // se estiver usando Azure
    trustServerCertificate: true, // se for local
  },
};

let pool;

async function getPool() {
  if (pool) return pool; // reusa pool já criado
  pool = await sql.connect(config);
  console.log('Conectado ao SQL Server ✅');
  return pool;
}

module.exports = {
  sql,
  pool: getPool(), // exporta a promise do pool
};
