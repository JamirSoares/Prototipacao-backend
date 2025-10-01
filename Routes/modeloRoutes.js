const express = require('express');
const router = express.Router();
const modeloController = require('../controllers/modeloController');

router.post('/', modeloController.createModelo);
router.put('/:id', modeloController.updateModelo);
router.get('/', modeloController.getAllModelos);
router.get('/:id', modeloController.getModeloById);

module.exports = router;
