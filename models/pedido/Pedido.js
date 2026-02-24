const fs = require('fs/promises');

class Pedido {
    constructor(cliente) {
        this.cliente = cliente;
        this.itens = [];
        this.endereco = null;
    }

    adicionarItem(produto, quantidade) {
        if (quantidade <= 0) throw new Error("A quantidade deve ser maior que zero.");
        this.itens.push({ produto, quantidade });
    }

    calcularTotal() {
        return this.itens.reduce((acc, item) => acc + (item.produto.preco * item.quantidade), 0);
    }

    async definirEndereco(cep) {
        const cepLimpo = cep.replace(/\D/g, '');
        if (cepLimpo.length !== 8) throw new Error("CEP inválido. Deve conter 8 dígitos.");

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await response.json();

            if (data.erro) throw new Error("CEP não encontrado.");

            this.endereco = {
                cep: data.cep, logradouro: data.logradouro, bairro: data.bairro,
                cidade: data.localidade, estado: data.uf
            };
            return this.endereco;
        } catch (erro) {
            throw new Error(`Falha ao buscar CEP: ${erro.message}`);
        }
    }

    async salvarPedido() {
        const dadosPedido = {
            data: new Date().toISOString(),
            cliente: this.cliente,
            endereco: this.endereco,
            itens: this.itens.map(i => ({
                nome: i.produto.nome,
                detalhes: i.produto.obterDetalhes(),
                quantidade: i.quantidade,
                subtotal: i.produto.preco * i.quantidade
            })),
            totalFinal: this.calcularTotal()
        };

        const nomeArquivo = `pedido_${Date.now()}.json`;
        await fs.writeFile(nomeArquivo, JSON.stringify(dadosPedido, null, 2));
        return nomeArquivo;
    }
}

module.exports = Pedido;