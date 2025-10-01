const express = require('express');
const router = express.Router();
const processoController = require('../controllers/processoController');

router.post('/', processoController.createProcesso);
router.put('/:id', processoController.updateProcesso);
router.get('/', processoController.getAllProcessos);
router.get('/:id', processoController.getProcessoById);

module.exports = router;
