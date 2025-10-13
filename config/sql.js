import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT, 10) || 1433,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true', 
        trustServerCertificate: process.env.DB_TRUST_CERT === 'true'
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        if (process.env.NODE_ENV !== 'production') {
            console.log('✅ Conectado ao SQL Server');
        }
        return pool;
    })
    .catch(err => {
        console.error('❌ Erro de conexão SQL:', err);
        throw err;
    });

// Exportando corretamente
export { sql, poolPromise };
