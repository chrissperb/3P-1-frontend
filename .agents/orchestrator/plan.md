# Plano de Ação - Repaginada Visual Borbolêlalá & Campo de Busca em Tempo Real

Este plano detalha a modernização estética das telas da aplicação Borbolêlalá Moda Infantil e a implementação do campo de busca em tempo real com Glassmorphism na página de Relatórios.

## Objetivos
1. Criar a branch `feature/frontend-repaginado` a partir da `main`. (Concluído)
2. Implementar a estética Glassmorphism globalmente e nas páginas. (Concluído)
3. Aplicar gradientes modernos (asas de borboleta) nos fundos e botões. (Concluído)
4. Adicionar micro-animações interativas e transições fluidas. (Concluído)
5. Adicionar um campo de busca em tempo real sutil, prático e discreto na tabela de histórico de pedidos da página de relatórios (`Relatorios.jsx`).
6. Garantir que o campo de busca seja estilizado com Glassmorphism e responsivo (mobile-first).
7. Implementar lógica de busca case-insensitive por cliente, produtos comprados e status do pedido, exibindo mensagem amigável caso não haja correspondência.
8. Estender a suíte de testes unitários do frontend (`Relatorios.test.jsx`) para validar o fluxo de busca.
9. Garantir que 100% dos testes do frontend (Vitest) e do backend (Jest) passem.
10. Obter a aprovação final da Auditoria Forense.

## Marcos de Entrega (Milestones)

| # | Nome | Escopo | Responsável | Status |
|---|---|---|---|---|
| M11 | Criação da Branch e Baseline | Criar branch e rodar testes | Tech Lead (LT) | DONE |
| M12 | Global, App e Login Makeover | Glassmorphism global e tela de Login | Frontend Developer | DONE |
| M13 | PDV e Estoque Makeover | Estilização do PDV e Estoque | Frontend Developer | DONE |
| M14 | Relatórios e Dashboard Makeover | Estilização dos Relatórios e Recharts | Frontend Developer | DONE |
| M15 | Validação, Build e Auditoria | Testes finais, build e auditoria | QA / DevOps / Auditor | DONE |
| M16 | Busca em Tempo Real | Implementar campo de busca Glassmorphism e filtragem em `Relatorios.jsx` | Frontend Developer | IN_PROGRESS |
| M17 | Testes e Auditoria da Busca | Escrever testes de busca, rodar testes e auditoria forense | QA / Auditor | PLANNED |

## Síntese da Proposta Técnica (Consenso dos Exploradores)

### 1. Alterações em `Relatorios.jsx`
- **Estado**: Adicionar `const [busca, setBusca] = useState('');`.
- **Filtro de busca (`useMemo`)**:
  ```javascript
  const pedidosFiltradosPorBusca = useMemo(() => {
      const query = busca.trim().toLowerCase();
      if (!query) return pedidosOrdenados;

      return pedidosOrdenados.filter(pedido => {
          const cliente = (pedido.cliente || 'Consumidor Final').toLowerCase();
          const status = (pedido.status || 'Pago').toLowerCase();
          
          const matchesCliente = cliente.includes(query);
          const matchesStatus = status.includes(query);
          
          const matchesItens = pedido.itens 
              ? pedido.itens.some(item => 
                  (item.nome || `Produto #${item.produtoId}`).toLowerCase().includes(query)
                )
              : false;

          return matchesCliente || matchesStatus || matchesItens;
      });
  }, [pedidosOrdenados, busca]);
  ```
- **Tabela**: Renderizar a tabela iterando sobre `pedidosFiltradosPorBusca` em vez de `pedidosOrdenados`.
- **Mensagem de Busca Vazia**: Se `pedidosFiltrados.length > 0` e `pedidosFiltradosPorBusca.length === 0`, exibir:
  `Nenhum pedido encontrado para a sua busca` (ou com a classe `.historico-mensagem.vazia`).
- **Cabeçalho da Tabela**: Agrupar o título `📋 Histórico de Vendas` e o container de busca em `.tabela-pedidos-header`.
  ```jsx
  <div className="tabela-pedidos-header">
      <h3 className="tabela-pedidos-titulo">📋 Histórico de Vendas</h3>
      <div className="busca-pedidos-container">
          <span className="busca-icone">🔍</span>
          <input
              type="text"
              placeholder="Buscar por cliente, produto ou status..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="busca-pedidos-input"
          />
      </div>
  </div>
  ```

### 2. Estilos em `src/index.css`
- Criar `.tabela-pedidos-header` com flex layout (empilhado em coluna no mobile, horizontal e space-between no desktop).
- Remover a borda inferior anterior do `.tabela-pedidos-titulo`.
- Estilizar `.busca-pedidos-container` com Glassmorphism:
  - `background: rgba(255, 255, 255, 0.25);`
  - `backdrop-filter: blur(8px);`
  - `border: 1px solid rgba(255, 255, 255, 0.4);`
  - `border-radius: 20px;`
  - Suave transição e focus-within.

### 3. Extensões de Teste em `Relatorios.test.jsx`
Escrever os seguintes casos de teste:
1. `Deve filtrar a lista de vendas por cliente de maneira case-insensitive na busca`
2. `Deve filtrar a lista de vendas por produto do item de maneira case-insensitive na busca`
3. `Deve filtrar a lista de vendas por status do pedido de maneira case-insensitive na busca`
4. `Deve mostrar a mensagem de busca vazia se nenhum pedido corresponder`
