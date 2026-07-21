const express = require('express');
const router = express.Router();
const FreteController = require('../controllers/FreteController');

router.post('/frete', FreteController.calcular);
router.post('/frete/etiqueta', FreteController.gerarEtiqueta);
router.post('/frete/imprimir', FreteController.imprimirEtiqueta);

module.exports = router;