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

    static async atualizarStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body; 
            
            const pedidoAtualizado = await PedidoService.atualizarStatus(id, status);
            res.status(200).json({ mensagem: 'Status atualizado!', pedido: pedidoAtualizado });
        } catch (error) {
            res.status(404).json({ erro: error.message });
        }
    }

    static async deletarPedido(req, res) {
        try {
            const { id } = req.params;
            const resultado = await PedidoService.deletarPedido(id);
            res.status(200).json(resultado);
        } catch (error) {
            res.status(404).json({ erro: error.message });
        }
    }
}

module.exports = PedidoController;