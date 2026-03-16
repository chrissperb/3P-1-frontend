const Pedido = require('../models/pedido/Pedido');
const Produto = require('../models/produto/Produto');

class PedidoService {
    
    static async processarCheckout({ cliente, endereco, itens }) {
        let totalCalculado = 0;
        const itensProcessados = [];

        for (let itemCarrinho of itens) {
            const produtoDb = await Produto.findOne({ id: itemCarrinho.produtoId });

            if (!produtoDb) throw new Error(`Produto ID ${itemCarrinho.produtoId} não existe.`);
            if (produtoDb.quantidade < itemCarrinho.quantidade) {
                throw new Error(`Estoque insuficiente para: ${produtoDb.nome}. Temos apenas ${produtoDb.quantidade} unidades.`);
            }

            const precoUnitario = produtoDb.precoVenda || produtoDb.preco;
            const subtotal = precoUnitario * itemCarrinho.quantidade;
            totalCalculado += subtotal;

            itensProcessados.push({
                produtoId: produtoDb.id, nome: produtoDb.nome, 
                quantidade: itemCarrinho.quantidade, precoUnitario, subtotal
            });

            produtoDb.quantidade -= itemCarrinho.quantidade;
            await produtoDb.save(); 
        }

        const novoPedido = new Pedido({
            cliente, endereco, itens: itensProcessados, totalFinal: totalCalculado, status: 'Pago'
        });

        return await novoPedido.save();
    }

    static async listarTodos() {
        return await Pedido.find().sort({ createdAt: -1 });
    }

    static async atualizarStatus(pedidoId, novoStatus) {
        const pedidoAtualizado = await Pedido.findByIdAndUpdate(
            pedidoId, 
            { status: novoStatus }, 
            { returnDocument: 'after' }
        );
        
        if (!pedidoAtualizado) throw new Error('Pedido não encontrado.');
        return pedidoAtualizado;
    }

    static async deletarPedido(pedidoId) {
        const pedido = await Pedido.findById(pedidoId);
        if (!pedido) throw new Error('Pedido não encontrado para exclusão.');

        for (let item of pedido.itens) {
            const produtoDb = await Produto.findOne({ id: item.produtoId });
            if (produtoDb) {
                produtoDb.quantidade += item.quantidade; // Soma de volta
                await produtoDb.save();
            }
        }

        await Pedido.findByIdAndDelete(pedidoId);
        
        return { mensagem: 'Pedido excluído com sucesso e estoque restaurado!' };
    }
}


module.exports = PedidoService;