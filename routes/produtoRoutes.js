const express = require('express');
const router = express.Router();
const ProdutoController = require('../controllers/ProdutoController');

// Rotas para a raiz de produtos (/api/produtos)
router.post('/produtos', ProdutoController.criarProduto);
router.get('/produtos', ProdutoController.listarProdutos);

// Rotas que dependem de um ID específico
router.get('/produtos/:id', ProdutoController.buscarPorId);
router.put('/produtos/:id', ProdutoController.atualizarProduto);
router.delete('/produtos/:id', ProdutoController.deletarProduto);

module.exports = router;