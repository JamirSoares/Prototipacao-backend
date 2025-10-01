const express = require('express');
const router = express.Router();
const atividadeController = require('../controllers/atividadeController');

router.post('/', atividadeController.createAtividade);
router.put('/:id', atividadeController.updateAtividade);
router.get('/', atividadeController.getAllAtividades);
router.get('/:id', atividadeController.getAtividadeById);

module.exports = router;
