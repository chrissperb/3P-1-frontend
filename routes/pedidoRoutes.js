const express = require('express');
const router = express.Router();
const PedidoController = require('../controllers/PedidoController');
const { verificarToken, apenasAdmin } = require('../middlewares/authMiddleware');

router.post('/pedidos', verificarToken, PedidoController.criarPedido); 
router.get('/pedidos', verificarToken, PedidoController.listarPedidos); 
router.put('/pedidos/:id/status', verificarToken, apenasAdmin, PedidoController.atualizarStatus);
router.delete('/pedidos/:id', verificarToken, apenasAdmin, PedidoController.deletarPedido);

module.exports = router;