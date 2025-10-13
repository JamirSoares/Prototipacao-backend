// src/routes/relatorioCRoutes.js

import express from 'express';
import * as controller from '../controllers/RelatorioCController.js';

const router = express.Router();

// Rotas principais
router.get('/', controller.getAll);
router.get('/filters', controller.getFilterOptions);

router.post('/bulk', controller.insertBulk);

router.put('/:id', controller.updateById);  // <--- aqui é a rota de edição

router.get('/:id', controller.getById);

export default router;
