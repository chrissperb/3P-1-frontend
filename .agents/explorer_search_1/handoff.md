# Relatórios Search Implementation Plan & Exploration Handoff

## 1. Observation

### Codebase Analysis Summary
- **Target File**: `/home/christian-sperb/Documents/projects/unyleya/3P-1-frontend/frontend/src/pages/Relatorios.jsx`
  - **Data Fetching**: Inside a `useEffect` hook, the page fetches systems data via:
    ```javascript
    const [resProdutos, resPedidos] = await Promise.all([
        fetch(import.meta.env.VITE_API_URL + '/produtos', { headers }),
        fetch(import.meta.env.VITE_API_URL + '/pedidos', { headers })
    ]);
    ```
    The products are set to `todosProdutos` state and orders (pedidos) to `todosPedidos` state (Lines 62-63).
  - **Date range filtering**: Handled via `pedidosFiltrados` memoized array using `useMemo` (Lines 177-186):
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
  - **Sorting**: Sorter logic sorting filtered orders by date (newest first) to produce `pedidosOrdenados` (Lines 188-190):
    ```javascript
    const pedidosOrdenados = useMemo(() => {
        return [...pedidosFiltrados].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [pedidosFiltrados]);
    ```
  - **Table Layout**: Orders are rendered within `tabela-pedidos-container` (Lines 574-677). The component iterates over `pedidosOrdenados` using `.map()`:
    ```jsx
    {pedidosOrdenados.map(pedido => { ... })}
    ```
    - Column 1: Date / Time (`formatarData(pedido.createdAt)`)
    - Column 2: Customer Name (`pedido.cliente || 'Consumidor Final'`)
    - Column 3: Summary & Detail button (`pedido.itens ? pedido.itens.length : 0` items)
    - Column 4: Total (`R$ {pedido.totalFinal.toFixed(2)}`)
    - Column 5: Status Select & Delete Button (`pedido.status || 'Pago'`)
    - Sub-row detailing order items (renders conditionally if `pedidoExpandido === pedido._id`): List of items detailing name (`item.nome || 'Produto #' + item.produtoId`) and subtotal.

- **Test File**: `/home/christian-sperb/Documents/projects/unyleya/3P-1-frontend/frontend/src/__tests__/Relatorios.test.jsx`
  - Leverages Vitest and `@testing-library/react`.
  - Mocks `recharts` to prevent rendering issues and mocks `CardResumo` for assertions.
  - Mock orders `mockPedidos` is defined (Lines 51-68):
    - `ped1` (cliente: 'Christian', status: 'Pago', itens: `Produto A`)
    - `ped2` (cliente: 'Maria', status: 'Cancelado', itens: `[]`)
  - Currently contains tests verifying mathematical calculations, orders rendering, detail expanding, status modification PUT triggers, deletions, and date filtering logic.

- **Styling File**: `/home/christian-sperb/Documents/projects/unyleya/3P-1-frontend/frontend/src/index.css`
  - Defines global Glassmorphic variables (Lines 12-15):
    ```css
    --glass-bg: rgba(255, 255, 255, 0.45);
    --glass-border: rgba(255, 255, 255, 0.3);
    --glass-shadow: 0 8px 32px 0 rgba(155, 89, 182, 0.1);
    --glass-blur: blur(12px);
    ```
  - Stylings for `tabela-pedidos-container` and `tabela-pedidos-titulo` exist from Line 1199 onwards.

---

## 2. Logic Chain

1. **State Addition**:
   To enable real-time search, a new state `termoBusca` should be declared in `Relatorios.jsx`:
   ```javascript
   const [termoBusca, setTermoBusca] = useState('');
   ```

2. **Filtration Hook**:
   Create a new computed memoised value `pedidosFiltradosPorBusca` that filters `pedidosOrdenados` using `termoBusca`. By referencing `pedidosOrdenados` as the base, the sorted date ordering is preserved automatically:
   ```javascript
   const pedidosFiltradosPorBusca = useMemo(() => {
       if (!termoBusca.trim()) {
           return pedidosOrdenados;
       }
       const termo = termoBusca.toLowerCase().trim();
       return pedidosOrdenados.filter(pedido => {
           // 1. Customer name
           const cliente = (pedido.cliente || 'Consumidor Final').toLowerCase();
           
           // 2. Order status
           const status = (pedido.status || 'Pago').toLowerCase();
           
           // 3. Item names inside the order
           const contemProduto = pedido.itens && pedido.itens.some(item => {
               const nomeProduto = (item.nome || `Produto #${item.produtoId}`).toLowerCase();
               return nomeProduto.includes(termo);
           });

           return cliente.includes(termo) || status.includes(termo) || contemProduto;
       });
   }, [pedidosOrdenados, termoBusca]);
   ```

3. **JSX Adaptation**:
   - Replace the table loop mapping: change `{pedidosOrdenados.map(...)}` to `{pedidosFiltradosPorBusca.map(...)}`.
   - Update empty state conditionals. If `pedidosFiltrados` has data but `pedidosFiltradosPorBusca` is empty, we show the message: `"Nenhum pedido encontrado para a sua busca."`
   ```jsx
   {carregando ? (
       <p className="historico-mensagem">A carregar histórico...</p>
   ) : pedidosFiltrados.length === 0 ? (
       <p className="historico-mensagem vazia">Nenhuma venda registada neste período.</p>
   ) : (
       <div className="tabela-pedidos-wrapper">
           {pedidosFiltradosPorBusca.length === 0 ? (
               <p className="historico-mensagem vazia" data-testid="busca-vazia-mensagem">
                   Nenhum pedido encontrado para a sua busca.
               </p>
           ) : (
               <table className="tabela-pedidos">
                   ...
   ```

4. **UI Header and Glassmorphism Styles**:
   Restructure the header container of the table to align the Title and the Search Input side by side.
   - **JSX Layout**:
     ```jsx
     <div className="tabela-pedidos-header">
         <h3 className="tabela-pedidos-titulo">
             📋 Histórico de Vendas
         </h3>
         <div className="busca-pedidos-container">
             <span className="busca-pedidos-icone">🔍</span>
             <input
                 type="text"
                 placeholder="Buscar por cliente, produto ou status..."
                 value={termoBusca}
                 onChange={(e) => setTermoBusca(e.target.value)}
                 className="busca-pedidos-input"
             />
         </div>
     </div>
     ```
   - **CSS Styles (`index.css`)**:
     ```css
     .tabela-pedidos-header {
         display: flex;
         flex-direction: column;
         gap: 15px;
         margin-bottom: 20px;
         border-bottom: 2px solid #ecf0f1;
         padding-bottom: 10px;
     }

     @media (min-width: 768px) {
         .tabela-pedidos-header {
             flex-direction: row;
             justify-content: space-between;
             align-items: center;
         }
     }

     .tabela-pedidos-titulo {
         margin: 0 !important;
         border-bottom: none !important;
         padding-bottom: 0 !important;
     }

     /* Glassmorphism search wrapper */
     .busca-pedidos-container {
         display: flex;
         align-items: center;
         background: rgba(255, 255, 255, 0.25);
         backdrop-filter: blur(8px);
         -webkit-backdrop-filter: blur(8px);
         border: 1px solid rgba(255, 255, 255, 0.35);
         border-radius: 20px;
         padding: 8px 16px;
         width: 100%;
         box-shadow: 0 4px 15px rgba(155, 89, 182, 0.05);
         transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
     }

     @media (min-width: 768px) {
         .busca-pedidos-container {
             width: 320px;
         }
     }

     .busca-pedidos-container:focus-within {
         background: rgba(255, 255, 255, 0.55);
         border-color: rgba(155, 89, 182, 0.45);
         box-shadow: 0 4px 20px rgba(155, 89, 182, 0.12);
     }

     .busca-pedidos-icone {
         font-size: 0.95rem;
         margin-right: 8px;
         color: #7f8c8d;
         user-select: none;
     }

     .busca-pedidos-input {
         border: none;
         background: transparent;
         outline: none;
         width: 100%;
         font-size: 0.9rem;
         color: #2c3e50;
     }

     .busca-pedidos-input::placeholder {
         color: #95a5a6;
     }
     ```

5. **Responsiveness (Mobile-First)**:
   - On small screens, `.tabela-pedidos-header` matches `flex-direction: column` and `align-items: stretch`, stretching the search input full-width below the title for comfortable tapping.
   - On larger screens (`@media (min-width: 768px)`), it switches to a horizontal layout `row`, placing the title on the left, the search field on the right, and clamping the width of the input to `320px`.

6. **Test Extensions (`Relatorios.test.jsx`)**:
   Adding three comprehensive integration test cases inside the `describe` block:
   ```javascript
   it('Deve filtrar os pedidos em tempo real por nome do cliente', async () => {
       render(<BrowserRouter><Relatorios /></BrowserRouter>);
       await screen.findByText('Christian');
       
       const inputBusca = screen.getByPlaceholderText(/Buscar por cliente, produto ou status/i);
       expect(inputBusca).toBeInTheDocument();

       expect(screen.getByText('Christian')).toBeInTheDocument();
       expect(screen.getByText('Maria')).toBeInTheDocument();

       // Filtra por "Christian"
       fireEvent.change(inputBusca, { target: { value: 'Christian' } });
       expect(screen.getByText('Christian')).toBeInTheDocument();
       expect(screen.queryByText('Maria')).not.toBeInTheDocument();

       // Filtra por "Maria"
       fireEvent.change(inputBusca, { target: { value: 'Maria' } });
       expect(screen.queryByText('Christian')).not.toBeInTheDocument();
       expect(screen.getByText('Maria')).toBeInTheDocument();
   });

   it('Deve filtrar os pedidos em tempo real por nome do produto comprado', async () => {
       render(<BrowserRouter><Relatorios /></BrowserRouter>);
       await screen.findByText('Christian');

       const inputBusca = screen.getByPlaceholderText(/Buscar por cliente, produto ou status/i);

       // Filtra por "Produto A" (comprado por Christian, mas não por Maria)
       fireEvent.change(inputBusca, { target: { value: 'Produto A' } });
       expect(screen.getByText('Christian')).toBeInTheDocument();
       expect(screen.queryByText('Maria')).not.toBeInTheDocument();
   });

   it('Deve exibir mensagem amigavel quando nenhum pedido corresponder a busca', async () => {
       render(<BrowserRouter><Relatorios /></BrowserRouter>);
       await screen.findByText('Christian');

       const inputBusca = screen.getByPlaceholderText(/Buscar por cliente, produto ou status/i);

       // Filtra por termo inexistente
       fireEvent.change(inputBusca, { target: { value: 'Produto Inexistente' } });
       expect(screen.getByText('Nenhum pedido encontrado para a sua busca.')).toBeInTheDocument();
       expect(screen.queryByText('Christian')).not.toBeInTheDocument();
       expect(screen.queryByText('Maria')).not.toBeInTheDocument();
   });
   ```

---

## 3. Caveats

- **Sandbox restrictions**: The `run_command` tool fails due to socket connection reset by peer, meaning tests cannot be verified inside this explorer session. Verification depends entirely on the downstream agent's execution of test commands in a valid terminal environment.
- **Product Name fallback**: Orders may contain items without explicit `item.nome` (which will fallback to `Produto #id`). The filter handles this by checking `item.nome || 'Produto #' + item.produtoId`.

---

## 4. Conclusion

The implementation of a real-time order history search is fully conceptualized, clean, and safe:
- **Filtering Scope**: Restrained purely to the sales history table using a localized `useMemo` filter (`pedidosFiltradosPorBusca`) to avoid corrupting overall dashboard metrics.
- **Styling**: Leverages pre-existing glassmorphic configurations with modern Flexbox spacing, guaranteeing mobile responsiveness.
- **Testing**: Highly coverable using existing mocked endpoints and Vitest APIs.

---

## 5. Verification Method

To verify the implementation once applied:
1. Navigate to the `frontend/` directory in a terminal.
2. Execute the test command:
   ```bash
   npm run test -- src/__tests__/Relatorios.test.jsx
   ```
   All tests (original + the 3 new ones) should pass.
3. Start the application locally:
   ```bash
   npm run dev
   ```
4. Log into the system, go to the reports panel (`/relatorios`), verify that the search input is placed beside the title and behaves responsively, typing terms updates the table instantly, and an invalid search displays the message: `"Nenhum pedido encontrado para a sua busca."`
