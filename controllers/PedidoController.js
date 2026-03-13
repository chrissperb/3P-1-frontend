const PedidoService = require('../services/PedidoService');

class PedidoController {
    
    static async criarPedido(req, res) {
        try {
            const pedidoSalvo = await PedidoService.processarCheckout(req.body);
            res.status(201).json({ mensagem: 'Venda finalizada com sucesso!', pedido: pedidoSalvo });
        } catch (error) {
            res.status(400).json({ erro: error.message });
        }
    }

    static async listarPedidos(req, res) {
        try {
            const pedidos = await PedidoService.listarTodos();
            res.status(200).json(pedidos);
        } catch (error) {
            console.error("Erro ao listar pedidos:", error);
            res.status(500).json({ erro: 'Falha ao buscar o histórico de vendas.' });
        }
    }
}

module.exports = PedidoController;