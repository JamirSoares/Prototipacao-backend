const express = require('express');
const router = express.Router();
const partePecaController = require('../controllers/partePecaController');

router.post('/', partePecaController.createPartePeca);
router.put('/:id', partePecaController.updatePartePeca);
router.get('/', partePecaController.getAllPartePeca);
router.get('/:id', partePecaController.getPartePecaById);

module.exports = router;
