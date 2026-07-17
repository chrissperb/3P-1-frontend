# Relatório de Alterações - Modernização da Gestão de Estoque (M3)

Este documento detalha as modificações efetuadas na tela de Estoque (`frontend/src/pages/Estoque.jsx`), no componente de Formulário de Produto (`frontend/src/components/FormProduto.jsx`) e na folha de estilos global (`frontend/src/index.css`) para o projeto 'Borbolêlalá Moda Infantil'.

## 1. Eliminação de Estilizações Inline (Atributos `style`)

Todas as estilizações inline foram substituídas por classes semânticas e modernas, centralizadas em `frontend/src/index.css`.

### Arquivos Modificados
- **`frontend/src/pages/Estoque.jsx`**:
  - `<div>` principal alterado para usar `.estoque-container`.
  - Cabeçalho alterado para usar `.estoque-header`.
  - Botão "+ Novo Produto" alterado para usar `.btn-novo-produto`.
  - Container da barra de pesquisa alterado para usar `.busca-container` e o input para `.busca-input`.
  - Container da tabela alterado para usar `.tabela-container`.
  - Tabela principal alterada para usar `.estoque-tabela`.
  - Células e cabeçalhos estilizados semanticamente (ex: `.text-center`, `.bold`, `.capitalize`).
  - Cor do estoque ok/esgotado definida dinamicamente com `.estoque-status-ok` e `.estoque-status-esgotado`.
  - Botões de ação (editar e excluir) alterados para usar `.btn-acao`.
  - Banner de erro mapeado para usar `.estoque-erro`.
  - Parágrafo de carregamento alterado para usar `.carregando-texto`.

- **`frontend/src/components/FormProduto.jsx`**:
  - Card do formulário alterado para usar `.form-produto-card`.
  - Título do formulário (`h3`) alterado para usar `.form-produto-titulo`.
  - Elemento `<form>` alterado para usar `.form-produto`.
  - Linhas flexíveis do formulário alteradas para usar `.form-linha`.
  - Grupos de campos individuais (label + input) alterados para usar `.form-campo` com classes de proporção flexível (`.flex-1`, `.flex-2`, `.flex-3`).
  - Inputs em geral alterados para usar `.form-input`.
  - Inputs com cores específicas de fundo alterados para usar `.form-input-custo` (rosa suave `#f9ebea`) e `.form-input-venda` (verde suave `#eafaf1`).
  - Container dos botões inferiores alterado para usar `.form-botoes`.
  - Botões de "Salvar" e "Cancelar" alterados para usar `.btn-salvar` e `.btn-cancelar`.

## 2. Consistência na Chamada da API

- **`frontend/src/components/FormProduto.jsx`**:
  - A URL hardcoded `http://localhost:3000/api` utilizada nas requisições `POST` (criar) e `PUT` (editar) foi alterada para `import.meta.env.VITE_API_URL` por consistência com as demais páginas do frontend (como `Estoque.jsx` e `Pdv.jsx`).
  - A URL resultante agora utiliza `${import.meta.env.VITE_API_URL}/produtos` e `${import.meta.env.VITE_API_URL}/produtos/${id}`.

## 3. Responsividade e Mobile-First

- A tabela de estoque permite rolagem horizontal em telas menores por estar encapsulada no `.tabela-container` configurado com `overflow-x: auto`.
- As linhas do formulário (`.form-linha`) foram estilizadas de forma mobile-first com `flex-direction: column` por padrão.
- Em telas maiores (`@media (min-width: 768px)`), a direção do flexbox muda para `flex-direction: row`, organizando os campos lado a lado de acordo com suas respectivas proporções (`flex-1`, `flex-2`, `flex-3`).

## 4. Paleta de Cores Mantida

- Fundo global: `#fdf2f7` (suave rosa)
- Destaques em roxo (botões/títulos): `#9b59b6`
- Estoque Ok (quantidade > 0): `#27ae60` (verde)
- Estoque Esgotado (quantidade <= 0): `#e74c3c` (vermelho)
- Input de Preço de Custo: `#f9ebea` (rosa suave)
- Input de Preço de Venda: `#eafaf1` (verde suave)
