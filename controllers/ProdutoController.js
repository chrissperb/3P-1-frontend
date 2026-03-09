const Produto = require('../models/produto/Produto');

class ProdutoController {
    
    static async listarProdutos(req, res) {
        try {
            const produtosDoBanco = await Produto.find();
            res.status(200).json(produtosDoBanco); 
        } catch (error) {
            console.error("Erro no ProdutoController:", error);
            res.status(500).json({ erro: 'Falha ao buscar o catálogo no banco de dados' });
        }
    }
    
}

module.exports = ProdutoController;