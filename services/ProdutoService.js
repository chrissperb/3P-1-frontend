const Produto = require('../models/produto/Produto');

class ProdutoService {
    
    static async criar(dadosProduto) {
        const novoProduto = new Produto(dadosProduto);
        try {
            return await novoProduto.save();
        } catch (error) {
            if (error.code === 11000) {
                throw new Error('Já existe um produto com este ID numérico.');
            }
            throw error;
        }
    }

    static async listarTodos() {
        return await Produto.find();
    }

    static async buscarPorId(idBusca) {
        const produto = await Produto.findOne({ id: idBusca });
        if (!produto) throw new Error('Produto não encontrado.');
        return produto;
    }

    static async atualizar(idBusca, dadosAtualizacao) {
        const produtoAtualizado = await Produto.findOneAndUpdate(
            { id: idBusca }, 
            dadosAtualizacao, 
            { new: true, runValidators: true } 
        );
        if (!produtoAtualizado) throw new Error('Produto não encontrado para atualização.');
        return produtoAtualizado;
    }

    static async deletar(idBusca) {
        const produtoDeletado = await Produto.findOneAndDelete({ id: idBusca });
        if (!produtoDeletado) throw new Error('Produto não encontrado para exclusão.');
        return produtoDeletado;
    }
}

module.exports = ProdutoService;