# 🚀 Como Rodar o Sistema CLI (Command Line Interface)
**1.** Certifique-se de ter o **Node.js** (versão 18 ou superior) instalado em sua máquina.

**2.** Abra o seu terminal.

**3.** Navegue até a pasta raiz onde o arquivo `cli.js` está localizado.

**4.** Execute o comando abaixo:
```bash
node cli.js
```

**5.** Siga as instruções do menu interativo exibido na tela.

## ✨ Funcionalidades Implementadas e Conceitos Aplicados
**1. Cadastro Dinâmico de Produtos (POO)** 
- **Herança:** Utilização de uma classe base Produto que dita as regras fundamentais (como validação de preço), expandida pelas subclasses ProdutoVestuario e KitProduto para atender às especificidades do catálogo de moda infantil (tamanhos, kits de maternidade, etc.).

- **Polimorfismo:** O método obterDetalhes() se comporta de maneira diferente dependendo do tipo de produto instanciado, exibindo ícones e informações customizadas na listagem.

- **Encapsulamento e Validação:** Regras estritas bloqueiam a criação de produtos com preços inválidos (negativos ou zerados).

**2. Gestão de Pedidos e Carrinho**
- Soma automática do valor total do pedido.

- Associação direta entre o cliente e os itens selecionados do catálogo.

**3. Integração Assíncrona com API (ViaCEP)**
- Utilização da API nativa fetch do **Node.js** aliada a `async/await` e `Promises`.

- Busca em tempo real do endereço do cliente com base no CEP informado no momento do fechamento do pedido, com tratamento rigoroso de erros (CEP inválido ou não encontrado).

**4. Persistência de Dados em Arquivo**
- Geração de um "recibo" digital. Ao finalizar uma venda, o sistema utiliza o módulo `fs/promises` (File System) para criar e salvar um arquivo **.json** contendo todos os dados do pedido e endereço de entrega.

## 🛠️ Tecnologias Utilizadas
- `Node.js` (Ambiente de Execução)

- Módulos Nativos: `readline` (Interação no terminal), `fs/promises` (Manipulação de arquivos) e `fetch` (Requisições HTTP).

- JavaScript Moderno (ES6+): Classes, Arrow Functions, Destructuring e Async/Await.

---
Desenvolvido com 💜 pela equipe de TI da Borbolêlalá.