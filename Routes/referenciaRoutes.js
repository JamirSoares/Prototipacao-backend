import express from 'express';
import { connectDB } from '../config/db.js';
import mssql from 'mssql';

const router = express.Router();

// GET /api/referencias - Busca todas as referências com pelo menos 8 caracteres
router.get('/', async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT cad_referencia_id 
      FROM cad_referencia  
      WHERE LEN(cad_referencia_id) >= 8
      ORDER BY cad_referencia_id
    `);
    
    res.json(result.recordset || []);
  } catch (err) {
    console.error('Erro ao buscar referências:', err.message);
    res.status(500).json({ message: 'Erro ao buscar referências', error: err.message });
  }
});

export default router;

