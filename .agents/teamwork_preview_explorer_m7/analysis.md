# Análise Técnica para Implementação de Dashboard Analítico - Borbolêlalá Moda Infantil

Este relatório apresenta o estudo de viabilidade, mapeamento do estado atual e a estratégia detalhada para implementar um dashboard analítico completo no painel administrativo da **Borbolêlalá Moda Infantil**.

---

## 1. Resumo Executivo
* **Objetivo:** Transformar a tela de relatórios atual em um painel interativo com gráficos de tendência de faturamento, distribuição de status de pedidos, novas métricas (Ticket Médio, Top/Less Selling e Saúde do Estoque) e filtros temporais avançados.
* **Compatibilidade:** O frontend utiliza **React 19.2.4**. Identificamos um conflito potencial de *peer dependencies* ao instalar o `recharts`, que é solucionado com a flag `--legacy-peer-deps` ou overrides no `package.json`.
* **Segurança e Testabilidade:** A estrutura atual de testes da aplicação é robusta. A integração de gráficos requer a criação de mocks para o `recharts` no Vitest/JSDOM para evitar falhas de renderização tridimensional/SVG. As funcionalidades críticas existentes (alteração de status de pedidos e detalhamento de itens) serão mantidas integralmente intactas.

---

## 2. Análise do Estado Atual (`Relatorios.jsx`)

### 2.1. Busca de Dados
A página realiza uma requisição concorrente (`Promise.all`) utilizando a API nativa `fetch` para obter a lista de produtos e pedidos:
```javascript
const [resProdutos, resPedidos] = await Promise.all([
    fetch(import.meta.env.VITE_API_URL + '/produtos', { headers }),
    fetch(import.meta.env.VITE_API_URL + '/pedidos', { headers })
]);
```
* **Gatilho:** O `useEffect` monitora a variável `dias`. Sempre que o número de dias é alterado (via botões de `+` e `-`), uma nova requisição é disparada ao backend, o que gera tráfego de rede redundante, pois as rotas `/produtos` e `/pedidos` trazem todos os registros, sem filtros no banco de dados.

### 2.2. Processamento e Cálculos
Os dados são filtrados e agregados em memória no próprio frontend:
1. **Patrimônio de Estoque (Custo):** 
   ```javascript
   const totalPatrimonio = produtos.reduce((acc, p) => acc + (p.quantidade * (p.preco || 0)), 0);
   ```
2. **Pedidos no Período:** Filtrados com base no estado `dias`:
   ```javascript
   const dataLimite = new Date();
   dataLimite.setDate(dataLimite.getDate() - dias);
   const pedidosNoPeriodo = pedidos.filter(pedido => new Date(pedido.createdAt) >= dataLimite);
   ```
3. **Pedidos Válidos (para faturamento):** Ignora pedidos com status `"Cancelado"`:
   ```javascript
   const pedidosValidos = listaPedidos.filter(pedido => pedido.status !== 'Cancelado');
   const qtdPedidosValidos = pedidosValidos.length;
   const totalVendasValidas = pedidosValidos.reduce((acc, p) => acc + p.totalFinal, 0);
   ```

### 2.3. Interface e Interações Administrativas
* **Cards Resumo:** Exibe "Valor em Estoque (Custo)", "Faturamento Líquido" e "Vendas Válidas".
* **Controles:** Incremento/decremento de dias unitários.
* **Tabela de Pedidos:** 
  * Expansão para detalhar itens e frete (`alternarDetalhes`).
  * Edição do status do pedido através de um `<select>` que dispara uma chamada `PUT` para o backend `/pedidos/:id/status` via `atualizarStatusPedido`.

---

## 3. Análise dos Testes Existentes (`Relatorios.test.jsx`)

O arquivo de testes utiliza **Vitest**, `@testing-library/react` e **JSDOM**.

### 3.1. Estrutura de Mock Atual
1. **Router:** Mock do `useNavigate` para validar redirecionamento sem token:
   ```javascript
   const mockedNavigate = vi.fn();
   vi.mock('react-router-dom', async () => { ... });
   ```
2. **Cards:** Mock do componente `CardResumo` para simplificar a asserção no DOM:
   ```javascript
   vi.mock('../components/CardResumo', () => ({
       default: ({ titulo, valor }) => <div data-testid="card-resumo"><h3>{titulo}</h3><p>{valor}</p></div>
   }));
   ```
3. **API e LocalStorage:** Interceptação global do `fetch` retornando arrays mockados de produtos e pedidos.

### 3.2. Casos de Teste Mapeados
* Renderização inicial dos cards com cálculos exatos de estoque e faturamento líquido.
* Listagem de pedidos, garantindo opacidade/exclusão de pedidos cancelados na soma total.
* Comportamento interativo de exibir itens ao clicar em "Ver Itens".
* Atualização assíncrona do status de pedidos via dropdown (chamada HTTP PUT).
* Alteração de período de dias pelos botões de `+` e `-`.
* Fluxo de redirecionamento para `/login` caso não haja token no `localStorage`.
* Exibição de mensagem para períodos sem vendas.
* Tratamento de falhas e erros de conexão na rota de status do servidor.

---

## 4. Resolução da Dependência do Recharts no React 19

O `package.json` possui `"react": "^19.2.4"` e `"react-dom": "^19.2.4"`.
A biblioteca `recharts` ainda declara *peer dependencies* voltadas para o React 16/17/18.

### 4.1. Como instalar sem conflitos?
Para evitar erros de bloqueio do gerenciador de pacotes npm, existem duas estratégias recomendadas:

#### Opção A: Instalação com a flag `--legacy-peer-deps` (Mais Simples)
Executar o comando:
```bash
npm install recharts --legacy-peer-deps
```
Esta flag indica ao npm que ele deve ignorar conflitos de dependências de pares e prosseguir com a instalação. Como o `recharts` é compatível com React 19 em nível de execução, ele funcionará sem problemas.

#### Opção B: Declaração de `overrides` no `package.json` (Mais Robusta para CI/CD)
Adicionar o bloco abaixo no `package.json` para forçar o npm a resolver as referências de React internas do `recharts` diretamente para a versão instalada no projeto (19.2.4):
```json
"overrides": {
  "recharts": {
    "react": "$react",
    "react-dom": "$react-dom"
  }
}
```
Após adicionar isso ao arquivo, basta rodar `npm install recharts`.

---

## 5. Estratégia de Implementação do Dashboard

### 5.1. Painel de Filtros Avançados (Melhoria de Performance)
**Problema Atual:** Disparar requisições HTTP a cada mudança de período prejudica a performance e o servidor.
**Solução Proposta:** 
1. Buscar todos os produtos e a lista completa de pedidos no carregamento inicial (`useEffect` apenas com `navigate` ou sem dependências de tempo).
2. Armazenar a lista bruta de pedidos em um estado: `const [todosPedidos, setTodosPedidos] = useState([]);`.
3. Criar os seguintes estados para os filtros:
   * `const [filtroRapido, setFiltroRapido] = useState('7d'); // '7d', '30d', 'mes', 'tudo', 'custom'`
   * `const [dataInicio, setDataInicio] = useState('');`
   * `const [dataFim, setDataFim] = useState('');`
4. Utilizar `useMemo` para computar a lista filtrada de pedidos localmente:
```javascript
const pedidosFiltrados = useMemo(() => {
    const hoje = new Date();
    let limiteInicio = null;
    let limiteFim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);

    if (filtroRapido === '7d') {
        limiteInicio = new Date();
        limiteInicio.setDate(hoje.getDate() - 7);
        limiteInicio.setHours(0, 0, 0, 0);
    } else if (filtroRapido === '30d') {
        limiteInicio = new Date();
        limiteInicio.setDate(hoje.getDate() - 30);
        limiteInicio.setHours(0, 0, 0, 0);
    } else if (filtroRapido === 'mes') {
        limiteInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    } else if (filtroRapido === 'custom') {
        if (dataInicio) limiteInicio = new Date(dataInicio + 'T00:00:00');
        if (dataFim) limiteFim = new Date(dataFim + 'T23:59:59');
    }

    return todosPedidos.filter(pedido => {
        const dataPedido = new Date(pedido.createdAt);
        if (limiteInicio && dataPedido < limiteInicio) return false;
        if (limiteFim && dataPedido > limiteFim) return false;
        return true;
    });
}, [todosPedidos, filtroRapido, dataInicio, dataFim]);
```

### 5.2. Novos Cards de Informação e Listas
Além das três métricas atuais (Estoque, Faturamento, Vendas Válidas), incluiremos as seguintes computadas sobre `pedidosFiltrados`:

#### A. Ticket Médio
* **Cálculo:** `faturamentoLiquido / qtdVendasValidas`
* **Código:**
  ```javascript
  const ticketMedio = qtdPedidosValidos > 0 ? totalVendasValidas / qtdPedidosValidos : 0;
  ```

#### B. Top Selling (Mais vendidos no período)
* **Cálculo:** Mapear e somar as quantidades de cada produto contidas em pedidos válidos.
* **Código:**
  ```javascript
  const topSelling = useMemo(() => {
      const counts = {};
      pedidosFiltrados
          .filter(p => p.status !== 'Cancelado')
          .forEach(p => {
              p.itens?.forEach(item => {
                  const nome = item.nome || `Produto #${item.produtoId}`;
                  counts[nome] = (counts[nome] || 0) + item.quantidade;
              });
          });
      return Object.entries(counts)
          .map(([nome, quantidade]) => ({ nome, quantidade }))
          .sort((a, b) => b.quantidade - a.quantidade)
          .slice(0, 5);
  }, [pedidosFiltrados]);
  ```

#### C. Less/No Selling (Sem vendas / Menos vendidos no período)
* **Cálculo:** Comparar o catálogo de produtos ativo com os produtos vendidos no período selecionado, ordenando crescentemente (com 0 vendas no topo).
* **Código:**
  ```javascript
  const lessSelling = useMemo(() => {
      const counts = {};
      pedidosFiltrados
          .filter(p => p.status !== 'Cancelado')
          .forEach(p => {
              p.itens?.forEach(item => {
                  const nome = item.nome || `Produto #${item.produtoId}`;
                  counts[nome] = (counts[nome] || 0) + item.quantidade;
              });
          });
      // Mapeia todos os produtos cadastrados
      const listaMenosVendidos = produtos.map(p => {
          const quantidadeVendida = counts[p.nome] || 0;
          return { nome: p.nome, quantidade: quantidadeVendida };
      });
      return listaMenosVendidos
          .sort((a, b) => a.quantidade - b.quantidade)
          .slice(0, 5);
  }, [pedidosFiltrados, produtos]);
  ```

#### D. Saúde do Estoque (Produtos com estoque <= 5 unidades)
* **Cálculo:** Filtrar os produtos do banco cuja quantidade física disponível no estoque seja 5 ou menos. Esta métrica representa o estado atual (tempo real) e é independente do intervalo de datas do filtro.
* **Código:**
  ```javascript
  const saudeEstoque = useMemo(() => {
      return produtos
          .filter(p => p.quantidade <= 5)
          .map(p => ({ nome: p.nome, quantidade: p.quantidade }))
          .sort((a, b) => a.quantidade - b.quantidade);
  }, [produtos]);
  ```

### 5.3. Integração de Gráficos (Recharts)

Para criar uma experiência moderna, serão adicionados dois gráficos logo abaixo dos cards de resumo.

#### Gráfico 1: Tendência de Faturamento por Dia (Gráfico de Linha ou Área)
Este gráfico exibirá o faturamento diário. Para evitar distorções ou "buracos" no gráfico, criaremos uma série temporal contínua preenchendo os dias sem vendas com `R$ 0.00`.
* **Estrutura dos Dados:**
  ```javascript
  const dadosGraficoFaturamento = useMemo(() => {
      const faturamentoPorDia = {};
      
      // Agrupar vendas válidas por dia (formato DD/MM)
      pedidosFiltrados
          .filter(p => p.status !== 'Cancelado')
          .forEach(p => {
              const data = new Date(p.createdAt);
              const diaMes = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
              faturamentoPorDia[diaMes] = (faturamentoPorDia[diaMes] || 0) + p.totalFinal;
          });

      // Se for período curto (ex: últimos 7 ou 30 dias), podemos ordenar as chaves cronologicamente
      return Object.entries(faturamentoPorDia)
          .map(([data, faturamento]) => ({ data, faturamento }))
          .sort((a, b) => {
              const [diaA, mesA] = a.data.split('/').map(Number);
              const [diaB, mesB] = b.data.split('/').map(Number);
              return new Date(2026, mesA - 1, diaA) - new Date(2026, mesB - 1, diaB);
          });
  }, [pedidosFiltrados]);
  ```
* **Componentização:**
  ```jsx
  <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={dadosGraficoFaturamento}>
          <defs>
              <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2ecc71" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2ecc71" stopOpacity={0}/>
              </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="data" />
          <YAxis tickFormatter={(val) => `R$ ${val}`} />
          <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Faturamento']} />
          <Area type="monotone" dataKey="faturamento" stroke="#2ecc71" fillOpacity={1} fill="url(#colorFaturamento)" />
      </AreaChart>
  </ResponsiveContainer>
  ```

#### Gráfico 2: Distribuição de Status de Pedidos (Gráfico de Pizza)
Exibe visualmente a proporção de pedidos em cada estágio do fluxo operacional da loja (Pendente, Pago, Enviado, Entregue, Cancelado).
* **Estrutura dos Dados:**
  ```javascript
  const dadosGraficoStatus = useMemo(() => {
      const statusCounts = { Pendente: 0, Pago: 0, Enviado: 0, Entregue: 0, Cancelado: 0 };
      pedidosFiltrados.forEach(p => {
          const status = p.status || 'Pago';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      return Object.entries(statusCounts)
          .filter(([_, value]) => value > 0) // exibe apenas status que possuem pelo menos 1 pedido
          .map(([name, value]) => ({ name, value }));
  }, [pedidosFiltrados]);
  ```
* **Cores Consistentes:**
  ```javascript
  const CORES_STATUS = {
      Pendente: '#f1c40f', // Amarelo
      Pago: '#27ae60',     // Verde
      Enviado: '#3498db',  // Azul
      Entregue: '#1abc9c', // Teal
      Cancelado: '#e74c3c'  // Vermelho
  };
  ```
* **Componentização:**
  ```jsx
  <ResponsiveContainer width="100%" height={300}>
      <PieChart>
          <Pie
              data={dadosGraficoStatus}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
          >
              {dadosGraficoStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CORES_STATUS[entry.name] || '#95a5a6'} />
              ))}
          </Pie>
          <Tooltip />
          <Legend />
      </PieChart>
  </ResponsiveContainer>
  ```

---

## 6. Mapeamento de Testes Unitários de Interface com Recharts

A renderização de gráficos do Recharts no ambiente de testes do Vitest/JSDOM pode gerar erros devido à falta de suporte para o tamanho do layout (`ResizeObserver`) e elementos SVG em mock.

### 6.1. Mock do Recharts nos Testes
Para garantir que todos os testes unitários continuem passando sem lançar erros no terminal, devemos adicionar o mock completo do `recharts` no topo do arquivo `Relatorios.test.jsx`:

```javascript
vi.mock('recharts', () => {
    return {
        ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
        AreaChart: ({ children, data }) => <div data-testid="area-chart" data-data={JSON.stringify(data)}>{children}</div>,
        Area: () => <div />,
        PieChart: ({ children, data }) => <div data-testid="pie-chart" data-data={JSON.stringify(data)}>{children}</div>,
        Pie: ({ children }) => <g>{children}</g>,
        Cell: () => <path />,
        XAxis: () => <div />,
        YAxis: () => <div />,
        CartesianGrid: () => <div />,
        Tooltip: () => <div />,
        Legend: () => <div />
    };
});
```

### 6.2. Atualizações Necessárias nos Casos de Testes
O teste `Deve alterar os dias do filtro ao clicar nos botões + e -` precisará ser reestruturado, dado que substituiremos os botões de controle de dias por botões/dropdown de filtros rápidos.
**Exemplo de atualização do teste:**
```javascript
it('Deve alterar o filtro temporal ao selecionar uma opção de período rápido', async () => {
    render(<BrowserRouter><Relatorios /></BrowserRouter>);
    await screen.findByText('Christian');

    // Supondo o uso de botões para filtro rápido
    const botao30Dias = screen.getByRole('button', { name: /30 dias/i });
    fireEvent.click(botao30Dias);

    // Verifica se os gráficos e cards foram recalculados
    // O mock do fetch não deve ser reexecutado se usarmos a otimização de filtro em memória.
});
```

Com essas diretrizes, a equipe de implementação poderá construir o dashboard analítico com alto desempenho, visual moderno, código limpo e sem quebrar as suítes de testes automatizados da Borbolêlalá.
