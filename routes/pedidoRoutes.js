const express = require('express');
const router = express.Router();
const PedidoController = require('../controllers/PedidoController');

const { verificarToken, apenasAdmin } = require('../middlewares/authMiddleware');

router.post('/pedidos', verificarToken, PedidoController.criarPedido); 
router.get('/pedidos', verificarToken, PedidoController.listarPedidos); 
module.exports = router;