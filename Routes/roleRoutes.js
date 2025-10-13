// src/routes/roleRoutes.js
import express from 'express';
import * as controller from '../controllers/roleController.js';

const router = express.Router();

// ===================
// PERMISSÕES
// ===================
router.get('/permissoes', controller.getAllPermissoes);
router.get('/permissoes/:id', controller.getPermissaoById);
router.post('/permissoes', controller.createPermissao);
router.put('/permissoes/:id', controller.updatePermissao);
router.delete('/permissoes/:id', controller.deletePermissao);

// ===================
// AÇÕES
// ===================
router.get('/acoes', controller.getAllAcoes);
router.get('/acoes/:id', controller.getAcaoById);
router.post('/acoes', controller.createAcao);
router.put('/acoes/:id', controller.updateAcao);
router.delete('/acoes/:id', controller.deleteAcao);

// ===================
// ROLE_ACOES (vinculação)
// ===================
router.get('/role-acoes', controller.getAllRoleAcoes);
router.post('/role-acoes', controller.createRoleAcao);
router.delete('/role-acoes/:id', controller.deleteRoleAcao);

export default router;
