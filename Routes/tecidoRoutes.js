const express = require('express');
const router = express.Router();
const tecidoController = require('../controllers/tecidoController');

router.post('/', tecidoController.createTecido);
router.put('/:id', tecidoController.updateTecido);
router.get('/', tecidoController.getAllTecidos);
router.get('/:id', tecidoController.getTecidoById);

module.exports = router;
