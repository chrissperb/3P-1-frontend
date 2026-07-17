# Handoff Report: Accordion Component Testing Strategy

## 1. Observation

Direct observations from the current codebase files:

1. **File:** `frontend/src/__tests__/Relatorios.test.jsx`
   - **Mocks & Environment:**
     - Mock routing is set up at lines 7-11.
     - Mock summaries are done at lines 14-21.
     - `fetch` is mocked at line 39.
     - `mockProdutos` (lines 46-49) provides:
       - `Produto A` (qty 10, price 50)
       - `Produto B` (qty 5, price 100)
     - `mockPedidos` (lines 51-68) provides:
       - A "Pago" order for customer "Christian" containing `2x` `Produto A`.
       - A "Cancelado" order for customer "Maria" containing no items.
   - **Current Testing Logic:**
     - Component renders under `<BrowserRouter>` wrapped around `<Relatorios />` (e.g. line 88).
     - Tests wait for loading status text `"A carregar histórico..."` to disappear before assertions (lines 90-92).

2. **File:** `frontend/src/pages/Relatorios.jsx`
   - **Ranking/List Headers:**
     - Line 528: `<h4 className="card-lista-titulo">🔥 Produtos Mais Vendidos</h4>`
     - Line 549: `<h4 className="card-lista-titulo">❄️ Menos Vendidos / Sem Vendas</h4>`
     - Line 572: `<h4 className="card-lista-titulo">⚠️ Alerta de Estoque Baixo</h4>`
   - **Static Render behavior:**
     - The ranking lists (`ul.lista-itens`) are rendered unconditionally as long as `!carregando` is true (lines 525-593). There is no accordion state or dynamic visibility toggle behavior present.

---

## 2. Logic Chain

1. **Section Renaming & UI Adjustments:**
   - The user requests Accordion behavior for three specific titles: `"Produtos Mais Vendidos"`, `"Produtos Menos Vendidos"`, and `"Saúde do Estoque"`.
   - The corresponding headers in `Relatorios.jsx` must be modified to use these strings (optionally retaining or omitting the emojis) and to prepend/append the arrow indicator: `▼` when collapsed, `▲` when expanded.
   - Three boolean state variables must be added to the React component (e.g. `maisVendidosAberto`, `menosVendidosAberto`, and `saudeEstoqueAberto`) initialized to `false` to ensure sections start collapsed by default.

2. **Initial State Verification:**
   - On initial mount, we verify that the headers exist and have the `▼` indicator.
   - Since the lists are collapsed, their internal elements/unique phrases (like `"unid. vendidas"` or `"Estoque físico atual"`) should not exist in the DOM (`expect(...).not.toBeInTheDocument()`), confirming they are hidden/unrendered by default.

3. **Expand Verification:**
   - Simulating click events via `fireEvent.click(header)` will toggle the states.
   - We verify the header updates its indicator text to `▲` (and no longer contains `▼`).
   - We verify the respective content renders correctly based on the mock data (e.g. `"Produto A"` and `"2 unid. vendidas"` for "Produtos Mais Vendidos"; `"Produto B"` and `"0 unid. vendidas"` for "Produtos Menos Vendidos"; `"Estoque físico atual"` and `"5 unid."` for "Saúde do Estoque").
   - We check that other sections remain collapsed while only one expands (isolating the accordion states).

4. **Collapse Verification:**
   - Simulating a second click on the header toggles the state back to `false`.
   - We verify the header text indicator reverts to `▼` and the content elements disappear from the DOM.

---

## 3. Caveats

- **Read-Only Constraint:** The source code and tests were not modified during this exploration. The actual modifications to `Relatorios.jsx` and the test addition must be completed by the implementation agent.
- **Header Naming:** The recommendations assume the heading texts match the regexes `/Produtos Mais Vendidos/i`, `/Produtos Menos Vendidos/i`, and `/Saúde do Estoque/i`. Emojis can be kept as long as the text content contains these substrings.
- **Conditional Rendering vs CSS hiding:** If the accordion hides content via CSS (e.g., `display: none` or a class `.collapsed`), the test assertion should use `not.toBeVisible()` instead of `not.toBeInTheDocument()`. The recommended strategy uses conditional rendering (`{isOpen && ...}`), which is standard React practice and aligns with `not.toBeInTheDocument()`.

---

## 4. Conclusion

We have designed a testing strategy that comprehensively covers all 4 criteria of the new Accordion behavior.

### Recommended Test Code Changes (to append to `frontend/src/__tests__/Relatorios.test.jsx`)

```jsx
    it('Deve iniciar com as seções colapsadas, expandir ao clicar, e colapsar ao clicar novamente', async () => {
        render(<BrowserRouter><Relatorios /></BrowserRouter>);

        // Aguarda o carregamento dos dados e o desaparecimento da mensagem de loading
        await waitFor(() => {
            expect(screen.queryByText('A carregar histórico...')).not.toBeInTheDocument();
        });

        // 1. VERIFICAR QUE AS SEÇÕES INICIAM COLAPSADAS E COM INDICADOR '▼'
        const maisVendidosHeader = screen.getByRole('heading', { name: /Produtos Mais Vendidos/i });
        const menosVendidosHeader = screen.getByRole('heading', { name: /Produtos Menos Vendidos/i });
        const saudeEstoqueHeader = screen.getByRole('heading', { name: /Saúde do Estoque/i });

        expect(maisVendidosHeader.textContent).toContain('▼');
        expect(menosVendidosHeader.textContent).toContain('▼');
        expect(saudeEstoqueHeader.textContent).toContain('▼');

        // O conteúdo interno (listas de itens e detalhes do ranking) não deve ser visível ou renderizado
        expect(screen.queryByText(/unid. vendidas/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Estoque físico atual/i)).not.toBeInTheDocument();

        // 2. EXPANDIR "Produtos Mais Vendidos" CLICANDO NO CABEÇALHO
        fireEvent.click(maisVendidosHeader);
        expect(maisVendidosHeader.textContent).toContain('▲');
        expect(maisVendidosHeader.textContent).not.toContain('▼');

        // Confirmar exibição do conteúdo correto da seção baseada nos dados mocked
        expect(screen.getByText('Produto A')).toBeInTheDocument();
        expect(screen.getByText(/2 unid. vendidas/i)).toBeInTheDocument();

        // Garantir que as demais seções continuam colapsadas
        expect(menosVendidosHeader.textContent).toContain('▼');
        expect(saudeEstoqueHeader.textContent).toContain('▼');

        // 3. EXPANDIR "Produtos Menos Vendidos" CLICANDO NO CABEÇALHO
        fireEvent.click(menosVendidosHeader);
        expect(menosVendidosHeader.textContent).toContain('▲');
        expect(menosVendidosHeader.textContent).not.toContain('▼');

        // Confirmar exibição do conteúdo correto (Produto B com 0 unid. vendidas)
        expect(screen.getByText(/0 unid. vendidas/i)).toBeInTheDocument();

        // 4. EXPANDIR "Saúde do Estoque" CLICANDO NO CABEÇALHO
        fireEvent.click(saudeEstoqueHeader);
        expect(saudeEstoqueHeader.textContent).toContain('▲');
        expect(saudeEstoqueHeader.textContent).not.toContain('▼');

        // Confirmar exibição do conteúdo correto (Produto B com quantidade 5 <= limite)
        expect(screen.getByText(/Estoque físico atual/i)).toBeInTheDocument();
        expect(screen.getByText(/5 unid./i)).toBeInTheDocument();

        // 5. CLICAR NOVAMENTE PARA COLAPSAR "Produtos Mais Vendidos"
        fireEvent.click(maisVendidosHeader);
        expect(maisVendidosHeader.textContent).toContain('▼');
        expect(maisVendidosHeader.textContent).not.toContain('▲');
        expect(screen.queryByText(/2 unid. vendidas/i)).not.toBeInTheDocument(); // Deve sumir

        // 6. CLICAR NOVAMENTE PARA COLAPSAR "Produtos Menos Vendidos"
        fireEvent.click(menosVendidosHeader);
        expect(menosVendidosHeader.textContent).toContain('▼');
        expect(menosVendidosHeader.textContent).not.toContain('▲');
        expect(screen.queryByText(/0 unid. vendidas/i)).not.toBeInTheDocument(); // Deve sumir

        // 7. CLICAR NOVAMENTE PARA COLAPSAR "Saúde do Estoque"
        fireEvent.click(saudeEstoqueHeader);
        expect(saudeEstoqueHeader.textContent).toContain('▼');
        expect(saudeEstoqueHeader.textContent).not.toContain('▲');
        expect(screen.queryByText(/Estoque físico atual/i)).not.toBeInTheDocument(); // Deve sumir
    });
```

### Proposed Component State Implementation (in `frontend/src/pages/Relatorios.jsx`)

1. **State initialization:**
   ```javascript
   const [maisVendidosAberto, setMaisVendidosAberto] = useState(false);
   const [menosVendidosAberto, setMenosVendidosAberto] = useState(false);
   const [saudeEstoqueAberto, setSaudeEstoqueAberto] = useState(false);
   ```

2. **Accordion Header & Content Toggles:**
   - **Produtos Mais Vendidos:**
     ```jsx
     <h4 className="card-lista-titulo" style={{ cursor: 'pointer' }} onClick={() => setMaisVendidosAberto(!maisVendidosAberto)}>
         {maisVendidosAberto ? '▲' : '▼'} Produtos Mais Vendidos
     </h4>
     {maisVendidosAberto && (
         // original list content and empty state logic
     )}
     ```
   - **Produtos Menos Vendidos:**
     ```jsx
     <h4 className="card-lista-titulo" style={{ cursor: 'pointer' }} onClick={() => setMenosVendidosAberto(!menosVendidosAberto)}>
         {menosVendidosAberto ? '▲' : '▼'} Produtos Menos Vendidos
     </h4>
     {menosVendidosAberto && (
         // original list content and empty state logic
     )}
     ```
   - **Saúde do Estoque:**
     ```jsx
     <h4 className="card-lista-titulo" style={{ cursor: 'pointer' }} onClick={() => setSaudeEstoqueAberto(!saudeEstoqueAberto)}>
         {saudeEstoqueAberto ? '▲' : '▼'} Saúde do Estoque
     </h4>
     {saudeEstoqueAberto && (
         // original list content and empty state logic
     )}
     ```

---

## 5. Verification Method

To verify the testing strategy independently:
1. Implement the state and toggle layout changes in `frontend/src/pages/Relatorios.jsx` as shown above.
2. Append the `it('Deve iniciar com as seções colapsadas, ...')` test block inside the `describe` block in `frontend/src/__tests__/Relatorios.test.jsx`.
3. Open a terminal in the `frontend` folder.
4. Run the project tests using:
   ```bash
   npm run test
   ```
   or
   ```bash
   npx vitest run frontend/src/__tests__/Relatorios.test.jsx
   ```
5. Ensure all existing tests and the new Accordion test pass successfully.
