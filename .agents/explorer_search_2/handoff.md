# Handoff Report: Planejamento do Campo de Busca em Tempo Real com Glassmorphism

Este documento detalha o planejamento técnico para a implementação do campo de busca em tempo real com Glassmorphism na página de Relatórios e a extensão correspondente do arquivo de testes.

## 1. Observation

Durante a análise exploratória do repositório, foram observados os seguintes arquivos e trechos de código:

### A. Carregamento e Estado dos Pedidos (`Relatorios.jsx`)
No arquivo `/home/christian-sperb/Documents/projects/unyleya/3P-1-frontend/frontend/src/pages/Relatorios.jsx`:
- **Carregamento dos dados:** Os pedidos são carregados através de uma requisição HTTP do tipo `fetch` no `useEffect` de inicialização (linhas 44-73):
  ```javascript
  const [todosPedidos, setTodosPedidos] = useState([]);
  ...
  const [resProdutos, resPedidos] = await Promise.all([
      fetch(import.meta.env.VITE_API_URL + '/produtos', { headers }),
      fetch(import.meta.env.VITE_API_URL + '/pedidos', { headers })
  ]);
  ...
  setTodosPedidos(pedidos);
  ```
- **Filtragem por período:** É feita em memória através de um `useMemo` dependente de `todosPedidos`, `dataInicial` e `dataFinal` (linhas 177-186):
  ```javascript
  const pedidosFiltrados = useMemo(() => {
      return todosPedidos.filter(pedido => {
          if (!pedido.createdAt) return false;
          const dataLocal = new Date(pedido.createdAt);
          const dataPedidoStr = formatarDataInput(dataLocal);
          if (dataInicial && dataPedidoStr < dataInicial) return false;
          if (dataFinal && dataPedidoStr > dataFinal) return false;
          return true;
      });
  }, [todosPedidos, dataInicial, dataFinal]);
  ```
- **Ordenação:** Os pedidos filtrados são ordenados por data decrescente (linhas 188-190):
  ```javascript
  const pedidosOrdenados = useMemo(() => {
      return [...pedidosFiltrados].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [pedidosFiltrados]);
  ```
- **Renderização da Tabela:** Atualmente, a tabela itera diretamente sobre `pedidosOrdenados` (linhas 596-672):
  ```javascript
  {pedidosOrdenados.map(pedido => {
      ...
  })}
  ```
- **Estrutura do Cabeçalho da Tabela:** Localizado nas linhas 574-578:
  ```javascript
  {/* TABELA DE HISTÓRICO DE PEDIDOS */}
  <div className="tabela-pedidos-container">
      <h3 className="tabela-pedidos-titulo">
          📋 Histórico de Vendas
      </h3>
  ```

### B. Estilos Atuais (`index.css`)
No arquivo `/home/christian-sperb/Documents/projects/unyleya/3P-1-frontend/frontend/src/index.css` (linhas 1199-1216):
- O container `.tabela-pedidos-container` já possui propriedades de Glassmorphism:
  ```css
  .tabela-pedidos-container {
      margin-top: 30px;
      background: rgba(255, 255, 255, 0.45);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 8px 32px 0 rgba(155, 89, 182, 0.08);
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  }
  ```
- O título possui uma borda inferior atuando como divisor (linhas 1211-1216):
  ```css
  .tabela-pedidos-titulo {
      margin: 0 0 20px 0;
      color: #2c3e50;
      border-bottom: 2px solid #ecf0f1;
      padding-bottom: 10px;
  }
  ```

### C. Estrutura de Testes (`Relatorios.test.jsx`)
No arquivo `/home/christian-sperb/Documents/projects/unyleya/3P-1-frontend/frontend/src/__tests__/Relatorios.test.jsx`:
- Um conjunto de dados mockados `mockPedidos` está configurado para os testes (linhas 51-68):
  - `ped1`: cliente `"Christian"`, status `"Pago"`, itens contendo `"Produto A"`.
  - `ped2`: cliente `"Maria"`, status `"Cancelado"`, sem itens.
- Os testes atuais usam `@testing-library/react` para simular interações e validar os elementos da tela.

---

## 2. Logic Chain

A partir das observações descritas acima, a estratégia de design e implementação é estruturada nos seguintes passos lógicos:

1. **Escopo de Filtragem:** 
   O campo de busca deve filtrar apenas a listagem da tabela de histórico de vendas, não devendo alterar os cards de resumo e gráficos (que já dependem de `pedidosFiltrados` por período). Portanto, precisamos criar um novo estado `busca` e um novo `useMemo` chamado `pedidosPesquisados` que filtre os pedidos a partir do array `pedidosOrdenados` (que já está filtrado por data e ordenado).
2. **Critérios de Busca (Case-Insensitive):** 
   A busca deve contemplar o cliente (`pedido.cliente`), os itens comprados (`item.nome`) e o status (`pedido.status`). Como o cliente e o status podem vir nulos ou indefinidos da API, utilizaremos fallbacks idênticos aos da renderização da tabela: `'Consumidor Final'` para o cliente e `'Pago'` para o status.
3. **Mensagem de Feedback de Busca Vazia:**
   Se a busca não retornar resultados mas o período tiver registros (`pedidosFiltrados.length > 0` e `pedidosPesquisados.length === 0`), devemos renderizar um parágrafo amigável: `"Nenhum pedido encontrado para a sua busca."`
4. **Layout Glassmorphism & Alinhamento:**
   O campo de busca deve ficar ao lado do título `"Histórico de Vendas"`. Para isso, propomos agrupar o título e o campo de busca em um novo elemento wrapper (`.tabela-pedidos-header`) configurado com `display: flex; justify-content: space-between; align-items: center;`. O campo de busca será estilizado com Glassmorphism (`backdrop-filter: blur`, bordas finas semi-transparentes e fundo translúcido) e conterá um ícone de lupa `🔍`.
5. **Responsividade (Mobile-First):**
   Para telas pequenas, os elementos devem empilhar verticalmente e ocupar toda a largura disponível. Adicionaremos `flex-wrap: wrap` e uma regra de `@media (max-width: 640px)` para mudar a direção para `column` e definir a largura do input de busca para `100%`.
6. **Extensão de Testes:**
   Como já temos um setup robusto em `Relatorios.test.jsx`, podemos testar a busca simulando a digitação no input usando `fireEvent.change` e verificando se os registros corretos aparecem/desaparecem e se a mensagem de busca vazia é exibida.

---

## 3. Caveats

- **Desempenho:** A filtragem em tempo real é realizada em memória (`useMemo`). Para grandes volumes de dados (milhares de pedidos), a busca em tempo real pode sofrer um leve lag. Porém, como a lista de pedidos já é filtrada previamente por período (com um padrão de 7 dias), a quantidade de registros em memória será tipicamente controlada.
- **Fallbacks nos Campos:** Se um pedido tiver itens com IDs de produto mas sem nome (`item.nome` nulo), a lógica fará fallback para `'Produto #' + item.produtoId`. A busca por nome não detectará o item a menos que o usuário busque pelo ID formatado.
- **Estilos:** O `backdrop-filter` requer que a cor de fundo (`background`) tenha alguma transparência (ex: `rgba(255, 255, 255, 0.25)`) para que o efeito de desfoque seja perceptível.

---

## 4. Conclusion

A implementação proposta é técnica e esteticamente viável, preservando a coerência visual do dashboard e integrando-se perfeitamente com os fluxos de carregamento de dados e testes existentes.

### Proposta Técnica de Alteração de Código

#### A. Alterações em `Relatorios.jsx`

1. **Adicionar o Estado de Busca:**
   ```javascript
   const [busca, setBusca] = useState('');
   ```

2. **Adicionar a Lógica do Filtro de Pesquisa (`useMemo`):**
   ```javascript
   const pedidosPesquisados = useMemo(() => {
       const query = busca.trim().toLowerCase();
       if (!query) return pedidosOrdenados;

       return pedidosOrdenados.filter(pedido => {
           const clienteMatches = (pedido.cliente || 'Consumidor Final')
               .toLowerCase()
               .includes(query);

           const statusMatches = (pedido.status || 'Pago')
               .toLowerCase()
               .includes(query);

           const itensMatches = pedido.itens && pedido.itens.some(item => 
               (item.nome || `Produto #${item.produtoId}`)
                   .toLowerCase()
                   .includes(query)
           );

           return clienteMatches || statusMatches || itensMatches;
       });
   }, [pedidosOrdenados, busca]);
   ```

3. **Substituir a Estrutura do Cabeçalho e Renderizar a Busca:**
   ```html
   {/* TABELA DE HISTÓRICO DE PEDIDOS */}
   <div className="tabela-pedidos-container">
       <div className="tabela-pedidos-header">
           <h3 className="tabela-pedidos-titulo">
               📋 Histórico de Vendas
           </h3>
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

4. **Tratar o Estado de Busca Vazia na Tabela:**
   Substituir a condição de renderização para contemplar `pedidosPesquisados`:
   ```javascript
   {carregando ? (
       <p className="historico-mensagem">A carregar histórico...</p>
   ) : pedidosFiltrados.length === 0 ? (
       <p className="historico-mensagem vazia">Nenhuma venda registada neste período.</p>
   ) : pedidosPesquisados.length === 0 ? (
       <p className="historico-mensagem vazia">Nenhum pedido encontrado para a sua busca.</p>
   ) : (
       <div className="tabela-pedidos-wrapper">
           <table className="tabela-pedidos">
               ...
               <tbody>
                   {pedidosPesquisados.map(pedido => {
                       ...
   ```

#### B. Alterações em `index.css`

Adicionar as novas classes CSS no final do arquivo ou na seção de estilos da tabela:
```css
/* Novo cabeçalho da tabela flexível */
.tabela-pedidos-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #ecf0f1;
    padding-bottom: 10px;
    margin-bottom: 20px;
    gap: 16px;
    flex-wrap: wrap;
}

/* Remove a borda inferior anterior do título */
.tabela-pedidos-titulo {
    margin: 0;
    border-bottom: none;
    padding-bottom: 0;
}

/* Container de busca com efeito Glassmorphism */
.busca-pedidos-container {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-radius: 20px;
    padding: 6px 14px;
    width: 100%;
    max-width: 320px;
    box-shadow: 0 4px 12px rgba(155, 89, 182, 0.05);
    transition: all 0.3s ease;
}

.busca-pedidos-container:focus-within {
    background: rgba(255, 255, 255, 0.4);
    border-color: rgba(155, 89, 182, 0.6);
    box-shadow: 0 4px 16px rgba(155, 89, 182, 0.15);
}

.busca-icone {
    margin-right: 8px;
    font-size: 14px;
    color: #7f8c8d;
    user-select: none;
}

.busca-pedidos-input {
    background: transparent;
    border: none;
    outline: none;
    width: 100%;
    font-size: 14px;
    color: #2c3e50;
}

.busca-pedidos-input::placeholder {
    color: #95a5a6;
}

/* Responsividade Mobile-First */
@media (max-width: 640px) {
    .tabela-pedidos-header {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
    }
    
    .busca-pedidos-container {
        max-width: 100%;
    }
}
```

#### C. Proposta de Extensão em `Relatorios.test.jsx`

Adicionar o seguinte bloco de testes dentro do `describe` em `Relatorios.test.jsx`:
```javascript
    describe('Testes do Campo de Busca em Tempo Real', () => {
        it('Deve filtrar os pedidos na tabela pelo nome do cliente', async () => {
            render(<BrowserRouter><Relatorios /></BrowserRouter>);
            await screen.findByText('Christian');

            const inputBusca = screen.getByPlaceholderText(/Buscar por cliente, produto ou status/i);
            
            // Digitar "Christian" e validar filtragem
            fireEvent.change(inputBusca, { target: { value: 'Christian' } });
            expect(screen.getByText('Christian')).toBeInTheDocument();
            expect(screen.queryByText('Maria')).not.toBeInTheDocument();

            // Digitar "Maria" e validar filtragem
            fireEvent.change(inputBusca, { target: { value: 'maria' } });
            expect(screen.getByText('Maria')).toBeInTheDocument();
            expect(screen.queryByText('Christian')).not.toBeInTheDocument();
        });

        it('Deve filtrar os pedidos na tabela pelo nome do produto comprado', async () => {
            render(<BrowserRouter><Relatorios /></BrowserRouter>);
            await screen.findByText('Christian');

            const inputBusca = screen.getByPlaceholderText(/Buscar por cliente, produto ou status/i);
            
            // Digitar "Produto A" (comprado apenas por Christian)
            fireEvent.change(inputBusca, { target: { value: 'Produto A' } });
            expect(screen.getByText('Christian')).toBeInTheDocument();
            expect(screen.queryByText('Maria')).not.toBeInTheDocument();
        });

        it('Deve filtrar os pedidos na tabela pelo status do pedido', async () => {
            render(<BrowserRouter><Relatorios /></BrowserRouter>);
            await screen.findByText('Christian');

            const inputBusca = screen.getByPlaceholderText(/Buscar por cliente, produto ou status/i);
            
            // Digitar "Cancelado" (status do pedido da Maria)
            fireEvent.change(inputBusca, { target: { value: 'Cancelado' } });
            expect(screen.getByText('Maria')).toBeInTheDocument();
            expect(screen.queryByText('Christian')).not.toBeInTheDocument();
        });

        it('Deve exibir mensagem amigável quando nenhum pedido corresponder à busca', async () => {
            render(<BrowserRouter><Relatorios /></BrowserRouter>);
            await screen.findByText('Christian');

            const inputBusca = screen.getByPlaceholderText(/Buscar por cliente, produto ou status/i);
            
            // Digitar termo inexistente
            fireEvent.change(inputBusca, { target: { value: 'InexistenteXYZ' } });
            expect(screen.queryByText('Christian')).not.toBeInTheDocument();
            expect(screen.queryByText('Maria')).not.toBeInTheDocument();
            expect(screen.getByText('Nenhum pedido encontrado para a sua busca.')).toBeInTheDocument();
        });
    });
```

---

## 5. Verification Method

Para verificar a integridade física e conceitual da proposta técnica:
1. **Inspeção do Arquivo de Handoff:**
   Garantir que este arquivo `handoff.md` está no caminho `/home/christian-sperb/Documents/projects/unyleya/3P-1-frontend/.agents/explorer_search_2/handoff.md` e contém as cinco seções estruturadas.
2. **Execução de Testes Unitários:**
   Após a aplicação do patch por um agente implementador, executar a suíte de testes do frontend com o comando:
   ```bash
   npm run test
   ```
   Todas as suítes (incluindo os novos testes de busca) devem passar com sucesso.
3. **Condição de Invalidação:**
   A proposta seria invalidada se a API do endpoint `/pedidos` mudasse o formato da propriedade `itens` ou `cliente`, ou se o ambiente de frontend mudasse de React/Vite para outro framework sem compatibilidade com o hook `useMemo`.
