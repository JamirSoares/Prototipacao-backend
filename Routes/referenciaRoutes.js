import express from 'express';
import { connectDB } from '../config/db.js';
import mssql from 'mssql';
import cache from '../utils/cache.js';

const router = express.Router();

// GET /api/referencias - Busca todas as referências com pelo menos 8 caracteres
router.get('/', async (req, res) => {
  try {
    // Try cache first
    const cacheKey = 'referencias_list';
    const cached = cache.get(cacheKey);
    if (cached) return res.json(cached);

    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT cad_referencia_id 
      FROM cad_referencia  
      WHERE LEN(cad_referencia_id) >= 8
      ORDER BY cad_referencia_id
    `);

    const data = result.recordset || [];
    cache.set(cacheKey, data, 5 * 60 * 1000); // 5 minutes
    res.json(data);
  } catch (err) {
    console.error('Erro ao buscar referências:', err.message);
    res.status(500).json({ message: 'Erro ao buscar referências', error: err.message });
  }
});

export default router;

