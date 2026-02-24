class Produto {
    constructor(id, nome, preco) {
        this.validarPreco(preco);
        this.id = id;
        this.nome = nome;
        this.preco = parseFloat(preco);
    }

    validarPreco(preco) {
        if (isNaN(preco) || preco <= 0) {
            throw new Error("O preço deve ser um número maior que zero.");
        }
    }

    obterDetalhes() {
        return `[ID: ${this.id}] ${this.nome} - R$ ${this.preco.toFixed(2)}`;
    }
}

module.exports = Produto;