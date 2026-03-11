const Produto = require('../models/produto/Produto');

class ProdutoController {
    
    static async criarProduto(req, res) {
        try {
            const novoProduto = new Produto(req.body);
            const produtoSalvo = await novoProduto.save();
            res.status(201).json({ mensagem: 'Produto cadastrado com sucesso! 🦋', produto: produtoSalvo });
        } catch (error) {
            console.error("Erro ao criar produto:", error);
            if (error.code === 11000) {
                return res.status(400).json({ erro: 'Já existe um produto com este ID numérico.' });
            }
            res.status(500).json({ erro: 'Falha ao cadastrar produto.' });
        }
    }

    static async listarProdutos(req, res) {
        try {
            const produtosDoBanco = await Produto.find();
            res.status(200).json(produtosDoBanco); 
        } catch (error) {
            console.error("Erro ao listar produtos:", error);
            res.status(500).json({ erro: 'Falha ao buscar o catálogo.' });
        }
    }

    static async buscarPorId(req, res) {
        try {
            const idBusca = parseInt(req.params.id);
            const produto = await Produto.findOne({ id: idBusca });
            
            if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });
            
            res.status(200).json(produto);
        } catch (error) {
            console.error("Erro ao buscar produto:", error);
            res.status(500).json({ erro: 'Erro interno ao buscar produto.' });
        }
    }

    static async atualizarProduto(req, res) {
        try {
            const idBusca = parseInt(req.params.id);
            const produtoAtualizado = await Produto.findOneAndUpdate(
                { id: idBusca }, 
                req.body, 
                { new: true, runValidators: true } 
            );

            if (!produtoAtualizado) return res.status(404).json({ erro: 'Produto não encontrado para atualização.' });

            res.status(200).json({ mensagem: 'Estoque atualizado!', produto: produtoAtualizado });
        } catch (error) {
            console.error("Erro ao atualizar produto:", error);
            res.status(500).json({ erro: 'Falha ao atualizar o produto.' });
        }
    }

    static async deletarProduto(req, res) {
        try {
            const idBusca = parseInt(req.params.id);
            const produtoDeletado = await Produto.findOneAndDelete({ id: idBusca });

            if (!produtoDeletado) return res.status(404).json({ erro: 'Produto não encontrado para exclusão.' });

            res.status(200).json({ mensagem: 'Produto removido do catálogo com sucesso.' });
        } catch (error) {
            console.error("Erro ao deletar produto:", error);
            res.status(500).json({ erro: 'Falha ao deletar o produto.' });
        }
    }
}

module.exports = ProdutoController;