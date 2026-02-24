const readline = require('readline');

// Importando cada classe de seu respectivo arquivo
const ProdutoVestuario = require('./models/produto/ProdutoVestuario.js');
const KitProduto = require('./models/produto/KitProduto.js');
const Pedido = require('./models/pedido/Pedido.js');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const catalogo = [];
const perguntar = (pergunta) => new Promise(resolve => rl.question(pergunta, resolve));

async function menu() {
    console.log("\n=== 🦋 Borbolêlalá CLI - Gestão Interna ===");
    console.log("1. Cadastrar Produto de Vestuário");
    console.log("2. Cadastrar Kit de Produtos");
    console.log("3. Listar Produtos");
    console.log("4. Calcular Média de Preços");
    console.log("5. Simular Pedido e Salvar JSON");
    console.log("0. Sair");
    
    const opcao = await perguntar("\nEscolha uma opção: ");

    try {
        switch (opcao) {
            case '1':
                const nomeV = await perguntar("Nome do produto: ");
                const precoV = await perguntar("Preço (ex: 45.90): ");
                const tamanho = await perguntar("Tamanho (ex: 0-3m, RN, M): ");
                catalogo.push(new ProdutoVestuario(catalogo.length + 1, nomeV, precoV, tamanho));
                console.log("✅ Vestuário cadastrado com sucesso!");
                break;
            case '2':
                const nomeK = await perguntar("Nome do Kit: ");
                const precoK = await perguntar("Preço do Kit: ");
                const pecas = await perguntar("Quantidade de peças: ");
                catalogo.push(new KitProduto(catalogo.length + 1, nomeK, precoK, parseInt(pecas)));
                console.log("✅ Kit cadastrado com sucesso!");
                break;
            case '3':
                console.log("\n--- Catálogo Atual ---");
                if (catalogo.length === 0) console.log("Catálogo vazio.");
                catalogo.forEach(p => console.log(p.obterDetalhes()));
                break;
            case '4':
                if (catalogo.length === 0) {
                    console.log("Adicione produtos primeiro.");
                } else {
                    const soma = catalogo.reduce((acc, p) => acc + p.preco, 0);
                    const media = soma / catalogo.length;
                    console.log(`\n📊 Média de Preços: R$ ${media.toFixed(2)}`);
                }
                break;
            case '5':
                if (catalogo.length === 0) {
                    console.log("Erro: O catálogo está vazio. Cadastre produtos antes de vender.");
                    break;
                }
                
                const nomeCliente = await perguntar("Nome da mamãe/papai: ");
                const novoPedido = new Pedido(nomeCliente); // Alterado para novoPedido
                
                console.log("\nProdutos disponíveis:");
                catalogo.forEach(p => console.log(p.obterDetalhes()));
                
                const idProduto = await perguntar("\nDigite o ID do produto que deseja vender: ");
                const produtoSelecionado = catalogo.find(p => p.id === parseInt(idProduto));
                
                if (!produtoSelecionado) throw new Error("Produto não encontrado.");
                
                const qtd = await perguntar("Quantidade: ");
                novoPedido.adicionarItem(produtoSelecionado, parseInt(qtd));

                const cep = await perguntar("Digite o CEP de entrega (somente números): ");
                console.log("Buscando endereço...");
                const endereco = await novoPedido.definirEndereco(cep);
                console.log(`📍 Entrega para: ${endereco.logradouro}, ${endereco.cidade}-${endereco.estado}`);

                const arquivo = await novoPedido.salvarPedido();
                console.log(`\n🎉 Pedido finalizado! Total: R$ ${novoPedido.calcularTotal().toFixed(2)}`);
                console.log(`📄 Salvo no arquivo: ${arquivo}`);
                break;
            case '0':
                console.log("Até logo! 🦋");
                rl.close();
                return;
            default:
                console.log("Opção inválida.");
        }
    } catch (erro) {
        console.error(`\n❌ ERRO: ${erro.message}`);
    }

    await menu();
}

menu();