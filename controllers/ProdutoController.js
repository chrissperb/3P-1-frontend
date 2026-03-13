const ProdutoService = require('../services/ProdutoService');

class ProdutoController {
    
    static async criarProduto(req, res) {
        try {
            const produtoSalvo = await ProdutoService.criar(req.body);
            res.status(201).json({ mensagem: 'Produto cadastrado com sucesso!', produto: produtoSalvo });
        } catch (error) {
            const status = error.message.includes('ID') ? 400 : 500;
            res.status(status).json({ erro: error.message });
        }
    }

    static async listarProdutos(req, res) {
        try {
            const produtos = await ProdutoService.listarTodos();
            res.status(200).json(produtos); 
        } catch (error) {
            res.status(500).json({ erro: 'Falha ao buscar o catálogo.' });
        }
    }

    static async buscarPorId(req, res) {
        try {
            const id = parseInt(req.params.id);
            const produto = await ProdutoService.buscarPorId(id);
            res.status(200).json(produto);
        } catch (error) {
            res.status(404).json({ erro: error.message });
        }
    }

    static async atualizarProduto(req, res) {
        try {
            const id = parseInt(req.params.id);
            const produtoAtualizado = await ProdutoService.atualizar(id, req.body);
            res.status(200).json({ mensagem: 'Estoque atualizado!', produto: produtoAtualizado });
        } catch (error) {
            res.status(404).json({ erro: error.message });
        }
    }

    static async deletarProduto(req, res) {
        try {
            const id = parseInt(req.params.id);
            await ProdutoService.deletar(id);
            res.status(200).json({ mensagem: 'Produto removido do catálogo com sucesso.' });
        } catch (error) {
            res.status(404).json({ erro: error.message });
        }
    }
}

module.exports = ProdutoController;