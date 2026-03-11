const express = require('express');
const router = express.Router();
const PedidoController = require('../controllers/PedidoController');

router.post('/pedidos', PedidoController.criarPedido); 
router.get('/pedidos', PedidoController.listarPedidos); 
module.exports = router;