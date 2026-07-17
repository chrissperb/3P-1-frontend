# Relatório de Análise Técnica - Borbolêlalá Moda Infantil

Este relatório apresenta o mapeamento detalhado do codebase do frontend e backend do sistema de gestão e PDV **Borbolêlalá Moda Infantil**, destacando a arquitetura atual, mapeando todos os estilos inline no React para subsidiar a modernização visual e identificando gargalos e regras de negócios no backend.

---

## 1. Resumo Executivo
O sistema Borbolêlalá possui uma arquitetura desacoplada client-server funcional, mas apresenta alto acoplamento visual devido ao uso maciço de estilizações inline no frontend React. Os testes automatizados (Jest no backend e Vitest no frontend) encontram-se 100% operacionais e com alta cobertura, porém foi identificado um ponto crítico na persistência financeira dos pedidos, no qual os custos de frete não são armazenados no banco de dados e nem somados ao valor total no backend.

---

## 2. Estrutura Geral do Codebase

A aplicação é dividida em dois blocos principais dentro da raiz do projeto:
- **Backend (Diretório Raiz):** API RESTful desenvolvida em Node.js com Express e Mongoose (MongoDB). A documentação é interativa via Swagger em `/api-docs`.
- **Frontend (Diretório `/frontend`):** Single Page Application (SPA) reativa desenvolvida com React e Vite.

---

## 3. Análise do Frontend e Mapeamento de Estilos Inline

Todos os componentes React principais utilizam o atributo `style` para estilização dos elementos HTML. A migração desses estilos para classes CSS centralizadas no `frontend/src/index.css` é necessária para garantir a padronização e facilitar a modernização visual.

Abaixo, detalhamos cada arquivo e seus respectivos estilos inline identificados:

### 3.1 `frontend/src/App.jsx`
Responsável pelo layout global do menu de navegação e container de rotas:
- **`nav` (Linha 25-34):** Define padding (`15px`), fundo claro (`#fdf2f7`), borda verde inferior (`borderBottom: '3px solid #1abc9c'`), comportamento flexbox (`display: 'flex'`, `justifyContent: 'space-between'`, `alignItems: 'center'`) e quebras responsivas (`flexWrap: 'wrap'`, `gap: '10px'`).
- **`div` interna do menu (Linha 35):** Flexbox (`display: 'flex'`, `gap: '20px'`, `alignItems: 'center'`).
- **`h1` (Linha 36):** Título 🦋 Borbolêlalá com cor roxa (`#9b59b6`), tamanho `1.2rem` e margem zerada.
- **Links (`Link`) (Linhas 37-39):** Links para PDV, Estoque e Relatórios com cor escura (`#34495e`), negrito e sem sublinhado (`textDecoration: 'none'`).
- **Bloco do Usuário (Linha 43):** Flexbox (`display: 'flex'`, `alignItems: 'center'`, `gap: '15px'`).
- **Saudação (Linha 44-45):** Texto cinza escuro (`#7f8c8d`) com fonte média (`0.95rem`) e nome em destaque com roxo (`#9b59b6`).
- **Divisória vertical (Linha 49):** Largura `1px`, altura `24px` e cor cinza (`#bdc3c7`).
- **Botão de Logout (Linha 54-63):** Fundo transparente, borda rosa (`#fadbd8`), texto vermelho (`#e74c3c`), padding (`6px 16px`), bordas arredondadas (`20px`) e cursor pointer.
- **Hover Dinâmico (Linhas 64-65):** Implementado diretamente via JavaScript (`onMouseEnter` e `onMouseLeave`) mudando a cor de fundo do DOM para `#fadbd8`.
- **Container Principal (Linha 73):** Div que envolve todas as telas com padding de `20px`.

### 3.2 `frontend/src/pages/Login.jsx`
Interface de login da aplicação:
- **Container externo (Linha 38):** Flexbox centralizado com altura mínima (`display: 'flex'`, `justifyContent: 'center'`, `alignItems: 'center'`, `height: '80vh'`).
- **Card de Login (Linha 39):** Fundo branco, padding (`40px`), bordas arredondadas (`8px`), sombra suave (`boxShadow: '0 4px 10px rgba(0,0,0,0.1)'`), largura total (`100%`) e limite máximo (`maxWidth: '400px'`).
- **Títulos (Linha 40-41):** Título principal roxo (`#9b59b6`) e subtítulo escuro (`#34495e`) centralizados.
- **Banner de Erro (Linha 43):** Texto vermelho (`#e74c3c`) sobre fundo rosa escuro (`#fadbd8`), padding (`10px`), centralizado e com bordas arredondadas (`4px`).
- **Formulário (Linha 45):** Direção vertical com espaçamento (`display: 'flex'`, `flexDirection: 'column'`, `gap: '15px'`).
- **Labels (Linha 47, 58):** Texto em bloco com cor cinza escuro (`#7f8c8d`) e margem inferior de `5px`.
- **Inputs de Email e Senha (Linha 54, 65):** Largura total, padding (`10px`), borda cinza (`1px solid #bdc3c7`) e bordas arredondadas (`4px`).
- **Botão Entrar (Linha 68):** Padding (`12px`), fundo azul (`#3498db`), texto branco, sem bordas, bordas arredondadas (`4px`), negrito, cursor pointer e margem superior (`10px`).

### 3.3 `frontend/src/pages/Pdv.jsx`
Frente de caixa da aplicação (PDV):
- **Container principal (Linha 182):** Flexbox com espaçamento lateral e quebra (`display: 'flex'`, `gap: '20px'`, `flexWrap: 'wrap'`).
- **Catálogo de produtos (Linha 184):** Flexbox ocupando 60% da largura, largura mínima `300px`.
- **Título do PDV (Linha 185):** Cor escura (`#2c3e50`) e sem margem superior.
- **Barra de categorias (Linha 187):** Alinhamento flexbox horizontal (`display: 'flex'`, `gap: '10px'`, `flexWrap: 'wrap'`, `marginBottom: '20px'`).
- **Botões de categoria (Linha 189):** Padding (`8px 16px`), arredondados (`20px`), sem bordas, cursor pointer, negrito e alteração dinâmica de cores baseada na categoria ativa (roxo `#9b59b6` e texto branco se ativo; cinza `#ecf0f1` e texto escuro `#2c3e50` se inativo).
- **Grid de Produtos (Linha 198):** Grid layout responsivo (`display: 'grid'`, `gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))'`, `gap: '15px'`).
- **Card do Produto (Linha 200):** Fundo branco, padding (`15px`), bordas arredondadas (`8px`), sombra (`boxShadow`), alinhamento centralizado e flexbox vertical para esticar e alinhar o botão de adicionar na base.
- **Textos do Produto (Linha 202-203):** Nome escuro (`#34495e`) e estoque secundário cinza (`#7f8c8d`, `0.8rem`).
- **Preço (Linha 206):** Texto verde em destaque (`#27ae60`), negrito e tamanho `1.2rem`.
- **Botão Adicionar (Linha 209):** Largura total, padding (`10px`), fundo azul (`#3498db`), texto branco, cursor pointer e negrito.
- **Barra Lateral do Checkout (Linha 220):** Flexbox ocupando 30% da largura, largura mínima `300px`, fundo branco, padding (`20px`), bordas arredondadas (`8px`), sombra e alinhamento no topo (`alignSelf: 'flex-start'`).
- **Título da Barra Lateral (Linha 221):** Cor escura, linha divisória na base (`borderBottom: '2px solid #ecf0f1'`) e padding inferior.
- **Itens do Carrinho (Linha 229-231):** Div do carrinho com rolagem (`maxHeight: '200px'`, `overflowY: 'auto'`). Itens individuais em flexbox com espaçamento (`justifyContent: 'space-between'`), linha de divisão na base (`borderBottom: '1px solid #f9f9f9'`).
- **Botão Remover (Linha 236):** Sem fundo, sem borda, texto vermelho (`#e74c3c`), cursor pointer e tamanho `1.2rem`.
- **Seção de Frete (Linha 242):** Caixa em fundo rosa suave (`#fdf2f7`), margem e cantos arredondados.
- **Grid de Dimensões (Linha 249-264):** Grid em duas colunas (`display: 'grid'`, `gridTemplateColumns: '1fr 1fr'`, `gap: '8px'`). Inputs de peso e dimensões com largura total e padding de `6px`.
- **Botão de Buscar Frete (Linha 270):** Padding (`8px 12px`), fundo roxo (`#9b59b6`), texto branco e alteração de cursor se desabilitado (`not-allowed`).
- **Opções de Frete (Linha 277-290):** Lista vertical de opções de frete (flex, gap). Exibição do rádio alinhado com o texto.
- **Seção de Totais (Linha 300):** Linha divisória (`borderTop: '2px solid #ecf0f1'`), linhas de subtotal e frete em flexbox (cinza `#7f8c8d`), linha de total geral em destaque (`fontSize: '1.2rem'`, negrito, cor `#2c3e50`).
- **Botão Finalizar Venda (Linha 313):** Largura total, padding (`15px`), cor verde (`#2ecc71`) ou cinza se desabilitado (`#95a5a6`), texto branco, negrito e cursor condicional.

### 3.4 `frontend/src/pages/Estoque.jsx`
Gestão de estoque (Backoffice):
- **Cabeçalho (Linha 110):** Flexbox com distribuição de espaço (`display: 'flex'`, `justifyContent: 'space-between'`, `alignItems: 'center'`, `marginBottom: '20px'`).
- **Título (Linha 111):** Cor escura (`#2c3e50`) e sem margem.
- **Botão "+ Novo Produto" (Linha 115):** Fundo roxo (`#9b59b6`), texto branco, padding (`10px 20px`), cantos arredondados (`4px`), sem bordas, cursor pointer e negrito.
- **Banner de Erro (Linha 124):** Texto vermelho (`#e74c3c`) com fundo rosa claro (`#fadbd8`), padding (`10px`), bordas arredondadas e margem na base.
- **Barra de Pesquisa (Linha 141-147):** Container com margem. Input com padding (`12px`), largura total, máximo `400px`, arredondado (`6px`), borda cinza clara e tamanho de fonte `1rem`.
- **Container da Tabela (Linha 151):** Fundo branco, arredondado (`8px`), padding (`15px`), sombra e rolagem horizontal se necessário (`overflowX: 'auto'`).
- **Carregamento (Linha 153):** Texto centralizado na cor cinza (`#7f8c8d`).
- **Tabela (Linha 155):** Largura total, sem espaço entre bordas (`borderCollapse: 'collapse'`) e alinhamento à esquerda.
- **Linha do Cabeçalho (Linha 157):** Borda inferior roxa (`borderBottom: '2px solid #ecf0f1'`, `color: '#9b59b6'`).
- **Células do Cabeçalho e Dados (Linha 158-163, 176-178):** Padding interno de `12px`.
- **Mensagem de Tabela Vazia (Linha 169):** Linha com preenchimento (`padding: '20px'`), centralizado e cor vermelha (`#e74c3c`).
- **Linha de Dados do Produto (Linha 175):** Borda inferior cinza clara (`borderBottom: '1px solid #ecf0f1'`).
- **Coluna de Quantidade Estocada (Linha 179):** Cor dinâmica: verde (`#27ae60`) se estoque > 0, vermelho (`#e74c3c`) se estiver esgotado. Em negrito.
- **Coluna de Preço de Venda (Linha 182):** Padding de `12px`.
- **Ações (Editar/Excluir) (Linhas 184, 187, 194):** Células centralizadas. Botões sem fundo e sem borda (`background: 'transparent'`, `border: 'none'`), cursor pointer e tamanho do emoji `1.2rem`.

### 3.5 `frontend/src/pages/Relatorios.jsx`
Painel gerencial e histórico de pedidos:
- **Cabeçalho (Linha 113-115):** Div com margem na base. Título em cor escura (`#2c3e50`) e parágrafo cinza (`#7f8c8d`).
- **Container dos Cards (Linha 118):** Flexbox com espaçamento (`display: 'flex'`, `gap: '20px'`, `flexWrap: 'wrap'`, `marginBottom: '30px'`).
- **Painel do Contador de Dias (Linha 125):** Padding (`20px`), fundo branco, bordas arredondadas (`8px`), sombra leve e display inline-block.
- **Título do Contador (Linha 126):** Margem zerada, fonte menor (`1rem`) e cor cinza (`#7f8c8d`).
- **Controles do Contador (Linha 127-130):** Alinhamento flexbox horizontal. Botões de "+" e "-" com padding (`8px 20px`), tamanho de fonte grande (`1.5rem`), cursor pointer, sem bordas, arredondados (`4px`) e cores de fundo específicas (vermelho `#e74c3c` para subtrair; verde `#2ecc71` para somar).
- **Texto dos Dias (Linha 129):** Fonte `1.2rem`, negrito, centralizado e cor escura (`#2c3e50`).
- **Container da Tabela de Pedidos (Linha 135):** Margem superior, fundo branco, arredondado (`8px`), padding (`20px`) e sombra.
- **Título da Tabela (Linha 136):** Cor escura, borda inferior cinza e padding na base.
- **Carregadores e Mensagens Vazias (Linhas 141, 143):** Textos cinzas e centralizados.
- **Tabela e Cabeçalho (Linha 145-148):** Semelhantes à tabela de estoque, com borda inferior roxa.
- **Linha do Pedido (Linha 163-167):** Borda cinza, fundo especial roxo muito suave (`#fdf8fa`) se o pedido for expandido, e opacidade reduzida (`opacity: 0.6`) caso o pedido esteja cancelado.
- **Células de Dados (Linhas 168, 171, 174):** Fontes menores, cores condicionalmente tachadas (`line-through`) se o pedido for cancelado.
- **Botão "Ver Itens" (Linha 178):** Fundo roxo (`#9b59b6`), texto branco, sem bordas, cantos arredondados (`4px`), padding menor (`4px 8px`), fonte pequena (`0.8rem`) e cursor pointer.
- **Célula de Valor Total (Linha 182):** Cor dinâmica: vermelha (`#e74c3c`) se o pedido for cancelado, verde (`#27ae60`) se estiver ativo. Em negrito.
- **Seletor de Status (Linha 189):** Cores de fundo e do texto dinâmicas com base no status do pedido (retornadas por `obterEstiloStatus()`). Borda fina com a mesma cor do status, arredondado (`20px`), negrito, cursor pointer e sem contorno azul de foco (`outline: 'none'`).
- **Painel de Detalhes Expandidos (Linha 201-202):** Fundo roxo suave (`#fdf8fa`), padding interno de `15px 30px` e borda inferior cinza.
- **Título de Detalhes (Linha 203):** Cor roxa e fonte pequena (`0.9rem`).
- **Lista de Itens (Linha 205-207):** Sem marcadores (`listStyle: 'none'`), padding e margem zerados. Itens individuais em flexbox (`justifyContent: 'space-between'`), com borda pontilhada cinza na base (`borderBottom: '1px dashed #bdc3c7'`) e cor escura.
- **Custo do Frete do Detalhe (Linha 217):** Flexbox com espaçamento cinza.

### 3.6 `frontend/src/components/CardResumo.jsx`
Componente reutilizável de cards estatísticos:
- **Card Container (Linha 4-12):** Fundo branco, padding (`20px`), cantos arredondados (`8px`), sombra leve, largura mínima (`220px`), flexível e borda esquerda de destaque dinâmica (`borderLeft: 5px solid ${corBorda}`).
- **Título (Linha 13):** Cinza escuro (`#7f8c8d`), fonte pequena (`0.85rem`) e letras maiúsculas.
- **Valor (Linha 16):** Margem zerada, fonte grande (`1.8rem`), negrito e cor escura (`#2c3e50`).

### 3.7 `frontend/src/components/FormProduto.jsx`
Formulário de cadastro/edição de produtos:
- **Card Container (Linha 72):** Fundo branco, padding (`25px`), arredondado e sombra.
- **Título (Linha 73):** Roxo (`#9b59b6`) e sem margem superior.
- **Formulário (Linha 77):** Flexbox vertical com espaçamento de `15px`.
- **Linhas Flexbox (Linhas 79, 91, 103, 115):** Flexbox horizontal com espaçamento (`gap: '15px'`), distribuindo a proporção dos campos usando `flex: '1'`, `flex: '2'` ou `flex: '3'`.
- **Labels (Linhas 81, 85, etc.):** Exibição em bloco com cor cinza clara e margem na base de `5px`.
- **Inputs (Linhas 82, 86, etc.):** Largura total, padding (`10px`), arredondados (`4px`) e borda cinza.
- **Destaques de Inputs (Linhas 106, 110):** Input de preço de custo com fundo vermelho claro suave (`#f9ebea`) e preço de venda com fundo verde claro suave (`#eafaf1`).
- **Botão de Salvar (Linha 116):** Flexível, padding (`12px`), fundo verde (`#2ecc71`), texto branco, sem bordas, arredondado, cursor pointer e negrito.
- **Botão de Cancelar (Linha 119):** Flexível, padding (`12px`), fundo vermelho (`#e74c3c`), texto branco, sem bordas, arredondado, cursor pointer e negrito.

---

## 4. Análise do Backend e Arquitetura de Banco de Dados

### 4.1 Modelagem MongoDB (via Mongoose)

O banco de dados é modelado com três coleções principais:

1. **`Produto` (Schema em `models/produto/Produto.js`):**
   - `id`: Tipo `Number`, obrigatório, único. É a chave primária de controle do estoque do negócio.
   - `nome`: Tipo `String`, obrigatório.
   - `categoria`: Tipo `String`, obrigatório (armazenada em minúsculas).
   - `quantidade`: Tipo `Number`, obrigatório, padrão `0`.
   - `preco`: Tipo `Number` (Preço de custo), obrigatório, padrão `0`.
   - `precoVenda`: Tipo `Number`, opcional, padrão `0`.
   - `tamanhos`: Array de `String`, padrão `['U']`.

2. **`Pedido` (Schema em `models/pedido/Pedido.js`):**
   - `cliente`: Tipo `String`, obrigatório.
   - `endereco`: Objeto com propriedades opcionais (`cep`, `logradouro`, `bairro`, `cidade`, `estado`).
   - `itens`: Coleção de subdocumentos do tipo `ItemPedidoSchema`:
     - `produtoId`: Tipo `Number`, obrigatório.
     - `nome`: Tipo `String`, obrigatório.
     - `quantidade`: Tipo `Number`, obrigatório, valor mínimo `1`.
     - `precoUnitario`: Tipo `Number`, obrigatório.
     - `subtotal`: Tipo `Number`, obrigatório.
   - `totalFinal`: Tipo `Number`, obrigatório, valor mínimo `0`.
   - `status`: Tipo `String`, enum contendo `['Pendente', 'Pago', 'Enviado', 'Cancelado']`, padrão `'Pendente'`.
   - *Timestamps*: Armazena automaticamente `createdAt` e `updatedAt`.

3. **`Usuario` (Schema em `models/usuario/Usuario.js`):**
   - `nome`: Tipo `String`, obrigatório.
   - `email`: Tipo `String`, único, obrigatório, convertido em minúsculas.
   - `senha`: Tipo `String`, obrigatória e protegida por `select: false` para não ser retornada em buscas padrões do banco.
   - `role`: Tipo `String`, enum contendo `['admin', 'vendedor']`, padrão `'vendedor'`.

---

## 5. Lógica de Negócios e Rotas Express

O backend centraliza a lógica de negócios e as validações nos serviços (`services/`). Abaixo detalhamos os fluxos e identificamos um ponto crítico:

### 5.1 Fluxo de Checkout e Estoque (`PedidoService.processarCheckout`)
Quando o frontend realiza uma venda, o endpoint `POST /api/pedidos` é acionado:
1. O backend itera sobre cada item do carrinho.
2. Faz uma busca no banco pelo produto (`Produto.findOne({ id: itemCarrinho.produtoId })`).
3. Valida se o produto existe e se possui estoque suficiente (`produtoDb.quantidade < itemCarrinho.quantidade`). Caso falte estoque, lança um erro (`400 Bad Request`) e encerra o processo, sem persistir nada (garante a atomicidade manual por produto).
4. Calcula o subtotal de cada item e debita a quantidade do estoque do produto (`produtoDb.quantidade -= itemCarrinho.quantidade`), salvando a alteração no banco de dados.
5. Salva o pedido na coleção correspondente com o status inicial `'Pago'`.

### 5.2 Fluxo de Cancelamento com Estorno (`PedidoService.deletarPedido`)
Ao deletar um pedido (`DELETE /api/pedidos/:id`), exclusivo para administradores:
1. O backend localiza o pedido correspondente.
2. Itera sobre a lista de `itens` do pedido.
3. Para cada item, localiza o produto no estoque (`Produto.findOne({ id: item.produtoId })`) e adiciona a quantidade de volta ao estoque física (`produtoDb.quantidade += item.quantidade`).
4. Salva a atualização do produto.
5. Deleta o pedido do banco de dados definitivamente.

### 5.3 Lógica de Cálculo de Frete (`FreteService.calcularFrete`)
O backend funciona como um Proxy de requisição. A rota `POST /api/frete` recebe os parâmetros do frontend e redireciona para a API Sandbox da SuperFrete (`https://sandbox.superfrete.com/api/v0/calculator`), injetando os cabeçalhos de segurança apropriados e o token de autorização (`process.env.SUPER_FRETE_TOKEN`). Isso impede a exposição de chaves privadas no cliente frontend.

### 5.4 ⚠️ PONTO CRÍTICO IDENTIFICADO (Divergência Financeira de Frete)
Durante a análise dos modelos e dos serviços do backend, identificou-se uma grave inconsistência de lógica referente ao frete:
- **No Frontend (`Pdv.jsx`):** O usuário preenche as dimensões, calcula o frete e seleciona uma das opções de transporte. Esse valor é adicionado ao total geral exibido em tela. O frontend envia esse valor no payload de fechamento na propriedade `frete` (ex: `frete: freteSelecionado`).
- **No Mongoose Schema (`Pedido.js`):** **Não existe a propriedade `frete` definida no schema de pedidos.**
- **No Checkout do Backend (`PedidoService.processarCheckout`):** O backend recebe o corpo da requisição contendo o frete, porém ele **não é salvo** no banco de dados. Além disso, o cálculo do `totalFinal` do pedido é feito de forma estrita somando apenas o subtotal dos produtos (`totalCalculado += subtotal`), ignorando qualquer valor de frete enviado.
- **Impacto:** O valor do faturamento líquido e o total de vendas salvos no banco de dados divergem do valor real cobrado do cliente no momento da finalização do PDV. Além disso, em relatórios financeiros futuros, não há histórico de quanto foi pago de frete por cada venda no banco de dados.

---

## 6. Configurações de Testes e Execução

O projeto possui duas suítes completas de testes automatizados, integradas via esteira de CI/CD (GitHub Actions):

### 6.1 Testes do Backend (Jest)
Os testes unitários e de integração de backend utilizam mocks estritos de banco de dados e são executados com o Jest.
- **Configuração:** `jest.config.js` na raiz.
- **Comando de Execução:**
  ```bash
  npm test
  ```
- **Resultado da Execução Realizada:**
  - 11 suítes de teste executadas com sucesso.
  - 64 testes passaram sem falhas.
  - Abrange controllers (`FreteController`, `ProdutoController`, `UsuarioController`, `PedidoController`), services (`FreteService`, `ProdutoService`, `UsuarioService`, `PedidoService`) e middlewares (`authMiddleware`, `errorHandler`).

### 6.2 Testes do Frontend (Vitest)
Os testes de interface simulam interações do usuário, mockando chamadas de API e validando elementos HTML acessíveis.
- **Configuração:** `frontend/vite.config.js` integrado com Vitest.
- **Comando de Execução (dentro da pasta `/frontend`):**
  ```bash
  npm test
  ```
- **Resultado da Execução Realizada:**
  - 4 arquivos de testes executados com sucesso (`Estoque.test.jsx`, `Login.test.jsx`, `Pdv.test.jsx`, `Relatorios.test.jsx`).
  - 29 testes individuais passaram sem falhas.
