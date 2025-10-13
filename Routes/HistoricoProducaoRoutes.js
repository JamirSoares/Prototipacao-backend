// routes/historico.routes.js (Usando Módulos ES)
import express from 'express';
// Importa todas as funções exportadas do controller
import * as historicoController from '../controllers/HistoricoProducaoController.js'; // Note o .js e o * as

const router = express.Router();

// Rota para criar um novo registro
// POST /api/historico
router.post('/', historicoController.create);

// Rota para buscar todos os registros
// GET /api/historico
router.get('/', historicoController.findAll);

// Rota para buscar um único registro pelo ID
// GET /api/historico/:id
router.get('/:id', historicoController.findOne);

// Rota para atualizar um registro pelo ID
// PUT /api/historico/:id
router.put('/:id', historicoController.update);

// Rota para excluir um registro pelo ID
// DELETE /api/historico/:id
router.delete('/:id', historicoController.deleteRegistro); // Usando a função renomeada

export default router; // Exportação padrão