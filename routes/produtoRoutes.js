const express = require('express');
const router = express.Router();

const ProdutoController = require('../controllers/ProdutoController');

router.get('/produtos', ProdutoController.listarProdutos);

module.exports = router;