const Produto = require('./Produto'); 

class KitProduto extends Produto {
    constructor(id, nome, preco, quantidadePecas) {
        super(id, nome, preco);
        this.quantidadePecas = quantidadePecas;
    }

    obterDetalhes() {
        return `🎁 [ID: ${this.id}] ${this.nome} (${this.quantidadePecas} peças) - R$ ${this.preco.toFixed(2)}`;
    }
}

module.exports = KitProduto;