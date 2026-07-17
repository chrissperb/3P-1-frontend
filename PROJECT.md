# Project: Borbolêlalá Moda Infantil - Frontend Modernization

## Architecture
A aplicação utiliza uma arquitetura clássica Client-Server:
- **Frontend**: Aplicação Single Page Application (SPA) reativa construída com React, Vite e React Router. O design será mobile-first, lúdico e premium. Toda a estilização inline será migrada para o arquivo `frontend/src/index.css`.
- **Backend**: API REST baseada em Node.js com Express e Mongoose (MongoDB). Fornece endpoints para autenticação, gerenciamento de estoque, checkout de vendas (PDV), cálculo de frete (proxy) e relatórios.

## Code Layout
```
/ (Backend Root)
├── controllers/          # Controllers da API (Auth, Pedido, Produto, Frete)
├── models/               # Modelos Mongoose (Usuario, Pedido, Produto)
├── routes/               # Rotas Express
├── services/             # Regras de Negócio / Serviços
├── __tests__/            # Testes do Backend (Jest)
├── server.js             # Arquivo de Inicialização do Servidor
└── frontend/             # Root do Frontend React
    ├── src/
    │   ├── components/   # Componentes reutilizáveis (CardResumo, FormProduto)
    │   ├── pages/        # Telas (Login, Pdv, Estoque, Relatorios)
    │   ├── App.jsx       # Layout global e navegação
    │   ├── index.css     # Estilos globais da aplicação
    │   └── main.jsx      # Ponto de entrada do React
    └── __tests__/        # Testes do Frontend (Vitest)
```

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M0 | Baseline de Testes | Executar os testes atuais e confirmar sucesso (100%) | none | DONE: Backend 64/64, Frontend 29/29 pass |
| M1 | Modernização do Login | Migrar estilos inline de `Login.jsx` para `index.css`, criar layout mobile-first/premium | M0 | DONE: Inline styles migrated, ESLint warning fixed |
| M2 | Modernização do Menu e App | Migrar estilos inline de `App.jsx` para `index.css` e responsividade de navegação | M1 | DONE: Inline styles migrated, mobile-first design, App.test.jsx added |
| M3 | Modernização do Estoque | Migrar estilos inline de `Estoque.jsx` e `FormProduto.jsx` para `index.css` | M2 | DONE: Inline styles migrated, API URL fixed in FormProduto |
| M4 | Modernização do PDV | Migrar estilos de `Pdv.jsx` para `index.css`, manter carrinho e cálculo de frete | M3 | DONE: Inline styles migrated, dynamic class and disabled rules added |
| M5 | Modernização de Relatórios | Migrar estilos de `Relatorios.jsx` e `CardResumo.jsx` para `index.css` | M4 | DONE: Inline styles migrated, dynamic borders and select colors retained |
| M6 | Testes Finais e Auditoria | Garantir que todos os testes passem (frontend + backend) e validação da auditoria forense | M5 | DONE: All tests passing, Forensic Audit CLEAN |
| M7 | Análise e Diagnóstico (Dashboard) | Analisar a página de relatórios, verificar dependências e rodar baseline de testes | M6 | DONE |
| M8 | Implementação do Dashboard | Integrar Recharts, filtros flexíveis, métricas avançadas (ticket médio, saúde do estoque, top/less sold) | M7 | DONE: Recharts integrated, metrics calculated, and visual UI styled |
| M9 | Ampliação de Testes (Vitest) | Escrever testes unitários em `Relatorios.test.jsx` cobrindo novos componentes e lógica | M8 | DONE: Covered Recharts mocking, filters, deletion, and ticket calculations |
| M10 | Validação Final e Auditoria Forense (Dashboard) | Rodar testes de frontend e backend e obter auditoria forense CLEAN | M9 | DONE: Forensic Audit verdict is CLEAN |
| M11 | Criação da Branch e Baseline | Criar branch `feature/frontend-repaginado` e rodar baseline de testes | M10 | DONE: Branch created, 98 tests pass |
| M12 | Global, App e Login Makeover | Implementar Glassmorphism, gradientes e micro-animações globais e na tela de Login | M11 | DONE: Global styles, App layout, and Login screen redesigned, 98 tests pass |
| M13 | PDV e Estoque Makeover | Aplicar estilo Glassmorphism e micro-animações no PDV e Estoque | M12 | DONE: PDV and Estoque screens redesigned, 98 tests pass |
| M14 | Relatórios e Dashboard Makeover | Modernizar tela de relatórios e Recharts com Glassmorphism | M13 | DONE: Relatorios/Dashboard and Recharts redesigned, 98 tests pass |
| M15 | Validação, Build e Auditoria | Executar todos os testes, rodar build de produção e passar na auditoria forense | M14 | DONE: 98 tests pass, build is clean, Forensic Audit verdict is CLEAN |
| M16 | Busca em Tempo Real | Adicionar barra de busca Glassmorphism e lógica de busca em tempo real na página de relatórios | M15 | DONE: Real-time search field with Glassmorphism implemented and responsive |
| M17 | Testes e Auditoria da Busca | Escrever testes unitários para a busca em Relatorios.test.jsx, verificar testes e passar na auditoria forense | M16 | DONE: 39 tests passed, Vite build successful, Forensic Audit CLEAN |


## Interface Contracts
### Frontend ↔ Backend API
- **Autenticação**: `POST /api/usuarios/login` -> Entrada: `{ email, senha }`, Retorno: `{ token, usuario }`
- **Estoque (CRUD)**:
  - `GET /api/produtos` -> Retorno: lista de produtos
  - `POST /api/produtos` -> Entrada: dados do produto, Retorno: produto criado
  - `PUT /api/produtos/:id` -> Entrada: dados atualizados, Retorno: produto atualizado
  - `DELETE /api/produtos/:id` -> Retorno: status de sucesso
- **PDV (Checkout)**: `POST /api/pedidos` -> Entrada: `{ cliente, endereco, itens }` (itens contém `produtoId`, `quantidade`), Retorno: pedido criado e estoque debitado.
- **Frete (Proxy)**: `POST /api/frete` -> Entrada: dados de cubagem e CEP, Retorno: opções de frete calculadas pela SuperFrete API.
- **Relatórios**:
  - `GET /api/pedidos` -> Retorno: lista de pedidos realizados
  - `DELETE /api/pedidos/:id` -> Retorno: pedido removido e estoque estornado
