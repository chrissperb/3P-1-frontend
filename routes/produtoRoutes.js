const express = require('express');
const router = express.Router();
const ProdutoController = require('../controllers/ProdutoController');

const { verificarToken, apenasAdmin } = require('../middlewares/authMiddleware');

// Rotas para a raiz de produtos (/api/produtos)
router.post('/produtos', verificarToken, ProdutoController.criarProduto);
router.get('/produtos', verificarToken, ProdutoController.listarProdutos);

// Rotas que dependem de um ID específico
router.get('/produtos/:id', verificarToken, apenasAdmin, ProdutoController.buscarPorId);
router.put('/produtos/:id', verificarToken, apenasAdmin, ProdutoController.atualizarProduto);
router.delete('/produtos/:id', verificarToken, apenasAdmin, ProdutoController.deletarProduto);

module.exports = router;