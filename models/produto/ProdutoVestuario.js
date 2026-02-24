const Produto = require('./Produto');

class ProdutoVestuario extends Produto {
    constructor(id, nome, preco, tamanho) {
        super(id, nome, preco);
        this.tamanho = tamanho;
    }

    obterDetalhes() {
        return `👗 [ID: ${this.id}] ${this.nome} (Tam: ${this.tamanho}) - R$ ${this.preco.toFixed(2)}`;
    }
}

module.exports = ProdutoVestuario;