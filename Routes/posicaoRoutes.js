const express = require('express');
const router = express.Router();
const posicaoController = require('../controllers/posicaoController');

router.post('/', posicaoController.createPosicao);
router.put('/:id', posicaoController.updatePosicao);
router.get('/', posicaoController.getAllPosicoes);
router.get('/:id', posicaoController.getPosicaoById);

module.exports = router;
