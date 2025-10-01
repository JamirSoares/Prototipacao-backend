const express = require('express');
const router = express.Router();
const variacaoController = require('../controllers/variacaoController');

router.get('/', variacaoController.getAllVariacoes);
router.get('/:id', variacaoController.getVariacaoById);
router.post('/', variacaoController.createVariacao);
router.put('/:id', variacaoController.updateVariacao);
router.delete('/:id', variacaoController.deleteVariacao);

module.exports = router;
