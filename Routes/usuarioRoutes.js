import express from 'express';
import * as controller from '../controllers/usuarioController.js';

const router = express.Router();

// Usuários
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/usuarios', controller.create);
router.put('/usuarios/:id', controller.updateById);
router.delete('/:id', controller.deleteById);

// Login
router.post('/login', controller.login);

// Recarregar DB (opcional, administrativo)
router.post('/reload', controller.reloadDB);

export default router;
