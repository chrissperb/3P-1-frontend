const express = require('express');
const router = express.Router();
const PedidoController = require('../controllers/PedidoController');
const { verificarToken, apenasAdmin } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/pedidos:
 *   post:
 *     summary: Finaliza uma venda (Checkout do PDV)
 *     tags: [Pedidos]
 *     description: Salva o pedido, calcula totais e dá baixa automática no estoque.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cliente:
 *                 type: string
 *                 example: Cliente PDV (Balcão)
 *               endereco:
 *                 type: object
 *                 properties:
 *               cep:
 *                 type: string
 *                 example: 88000000
 *               logradouro:
 *                 type: string
 *                 example: Retirada na Loja
 *               itens:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     produtoId:
 *                       type: integer
 *                       example: 101
 *                     quantidade:
 *                       type: integer
 *                       example: 1
 *     responses:
 *       201:
 *         description: Venda finalizada com sucesso.
 *       400:
 *         description: Erro de negócio (ex. Estoque insuficiente).
 */
router.post('/pedidos', verificarToken, PedidoController.criarPedido); 
router.get('/pedidos', verificarToken, PedidoController.listarPedidos); 
router.put('/pedidos/:id/status', verificarToken, apenasAdmin, PedidoController.atualizarStatus);
router.delete('/pedidos/:id', verificarToken, apenasAdmin, PedidoController.deletarPedido);

module.exports = router;