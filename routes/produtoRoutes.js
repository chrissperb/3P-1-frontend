const express = require('express');
const router = express.Router();
const ProdutoController = require('../controllers/ProdutoController');

const { verificarToken, apenasAdmin } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/produtos:
 *   get:
 *     summary: Lista todo o catálogo de produtos
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retorna a lista de produtos cadastrados.
 *       401:
 *         description: Não autorizado (Token ausente ou inválido).
 *   post:
 *     summary: Cadastra um novo produto (Apenas Gerentes)
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 101
 *               nome:
 *                 type: string
 *                 example: Vestido Borboleta
 *               categoria:
 *                 type: string
 *                 example: vestidos
 *               tamanhos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: ["P", "M"]
 *               precoVenda:
 *                 type: number
 *                 example: 89.90
 *               quantidade:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       201:
 *         description: Produto cadastrado com sucesso.
 */
// Rotas para a raiz de produtos (/api/produtos)
router.post('/produtos', verificarToken, ProdutoController.criarProduto);
router.get('/produtos', verificarToken, ProdutoController.listarProdutos);

// Rotas que dependem de um ID específico
router.get('/produtos/:id', verificarToken, apenasAdmin, ProdutoController.buscarPorId);
router.put('/produtos/:id', verificarToken, apenasAdmin, ProdutoController.atualizarProduto);
router.delete('/produtos/:id', verificarToken, apenasAdmin, ProdutoController.deletarProduto);

module.exports = router;