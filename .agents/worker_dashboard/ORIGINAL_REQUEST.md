## 2026-07-15T22:23:08-03:00
Por favor, realize a implementação do dashboard analítico na página de relatórios da Borbolêlalá Moda Infantil.

Diretório de trabalho do subagente: /home/christian-sperb/Documents/projects/unyleya/3P-1-frontend/.agents/worker_dashboard

Instruções Detalhadas de Implementação:

1. **Instalação do Recharts:**
   - Adicione e instale o pacote `recharts` no diretório `/home/christian-sperb/Documents/projects/unyleya/3P-1-frontend/frontend`.
   - Se houver conflitos de dependências com o React 19, utilize `--legacy-peer-deps` ou adicione `"overrides"` em `package.json`.

2. **Interface e Lógica no Frontend (`frontend/src/pages/Relatorios.jsx`):**
   - Substitua o contador de dias por um painel de filtros contendo:
     - Botões rápidos: "Últimos 7 dias", "Últimos 30 dias", "Este Mês", "Todo o Período".
     - Filtro customizado: campos `<input type="date">` para Data Inicial e Data Final.
   - Otimize as buscas de dados: busque todos os pedidos e produtos uma única vez no carregamento (ou use `useEffect` sem dependência de tempo, re-buscando apenas se necessário) e realize os filtros e computações em memória via `useMemo` para evitar chamadas HTTP excessivas e desnecessárias.
   - Implemente os cálculos e exibições das seguintes estatísticas:
     - **Ticket Médio:** `faturamentoLiquido / totalPedidosValidos` (apenas pedidos não cancelados). Exiba como um card de resumo.
     - **Produtos Mais Vendidos (Top Selling):** Uma lista ordenada dos 5 produtos com maior quantidade vendida no período, mostrando quantidade e faturamento gerado.
     - **Produtos Menos/Sem Vendas (Less Selling):** Uma lista ordenada de até 5 produtos com menor quantidade vendida (incluindo 0 vendas no topo) no período selecionado.
     - **Saúde do Estoque:** Um painel/sinalização listando todos os produtos com quantidade em estoque física igual ou inferior a 5 unidades. Note que a saúde do estoque físico atual reflete o estado do banco e não depende do filtro de datas do período.
   - **Gráficos Recharts (pelo menos 2 gráficos interativos e responsivos):**
     - **Gráfico de Tendência (Área ou Linha):** Faturamento líquido diário agrupado por data (`createdAt`) no período selecionado. Preencha dias sem vendas com valor zero para manter a linha contínua.
     - **Gráfico de Status dos Pedidos (Pizza ou Rosca):** Distribuição dos pedidos pelos status (Pendente, Pago, Enviado, Entregue, Cancelado). Utilize a paleta de cores correspondente:
       * Pendente: `#f1c40f` (Amarelo)
       * Pago: `#27ae60` (Verde)
       * Enviado: `#3498db` (Azul)
       * Entregue: `#1abc9c` (Teal)
       * Cancelado: `#e74c3c` (Vermelho)
   - Preserve todas as funcionalidades administrativas da tela de relatórios (listagem de pedidos abaixo, botão "Ver Itens" para expandir, alteração de status via dropdown e exclusão/cancelamento de pedido).

3. **Estilização (`frontend/src/index.css`):**
   - Estilize o painel de filtros, as listas de rankings e a área de gráficos de forma moderna, responsiva (mobile-first) e premium, utilizando a tipografia Nunito e a paleta de cores lúdica da Borbolêlalá.

4. **Verificação Inicial:**
   - Execute o build do Vite (`npm run build` na pasta `frontend`) para garantir que o build passa com sucesso.
   - Verifique que os testes unitários do backend no root (`npm run test`) passam com sucesso.
