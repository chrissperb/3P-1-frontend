const Pedido = require('../models/pedido/Pedido');
const Produto = require('../models/produto/Produto');

class PedidoController {
    
    static async criarPedido(req, res) {
        try {
            const { cliente, endereco, itens } = req.body;
            
            let totalCalculado = 0;
            const itensProcessados = [];

            for (let itemCarrinho of itens) {
                const produtoDb = await Produto.findOne({ id: itemCarrinho.produtoId });

                if (!produtoDb) {
                    return res.status(404).json({ erro: `Produto ID ${itemCarrinho.produtoId} não existe.` });
                }

                if (produtoDb.quantidade < itemCarrinho.quantidade) {
                    return res.status(400).json({ 
                        erro: `Estoque insuficiente para a roupinha: ${produtoDb.nome}. Temos apenas ${produtoDb.quantidade} unidades.` 
                    });
                }

                const precoUnitario = produtoDb.precoVenda || produtoDb.preco;
                const subtotal = precoUnitario * itemCarrinho.quantidade;
                
                totalCalculado += subtotal;

                itensProcessados.push({
                    produtoId: produtoDb.id,
                    nome: produtoDb.nome,
                    quantidade: itemCarrinho.quantidade,
                    precoUnitario: precoUnitario,
                    subtotal: subtotal
                });

                produtoDb.quantidade -= itemCarrinho.quantidade;
                await produtoDb.save(); 
            }

            const novoPedido = new Pedido({
                cliente,
                endereco,
                itens: itensProcessados,
                totalFinal: totalCalculado,
                status: 'Pago' 
            });

            const pedidoSalvo = await novoPedido.save();

            res.status(201).json({ 
                mensagem: 'Venda finalizada com sucesso! 🦋', 
                pedido: pedidoSalvo 
            });

        } catch (error) {
            console.error("Erro ao processar pedido:", error);
            res.status(500).json({ erro: 'Falha interna ao finalizar a venda.' });
        }
    }

    static async listarPedidos(req, res) {
        try {
            const pedidos = await Pedido.find().sort({ createdAt: -1 });
            res.status(200).json(pedidos);
        } catch (error) {
            console.error("Erro ao listar pedidos:", error);
            res.status(500).json({ erro: 'Falha ao buscar o histórico de vendas.' });
        }
    }
}

module.exports = PedidoController;