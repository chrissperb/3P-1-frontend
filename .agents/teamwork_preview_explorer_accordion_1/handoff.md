# Handoff Report - Glassmorphism Accordions for Reports Page

## 1. Observation
The following file structures and properties were directly observed:

### A. Codebase Locations & Elements
- **File**: `frontend/src/pages/Relatorios.jsx`
  - **"Produtos Mais Vendidos" header** (line 528):
    ```jsx
    <h4 className="card-lista-titulo">🔥 Produtos Mais Vendidos</h4>
    ```
  - **"Produtos Menos Vendidos" header** (line 550):
    ```jsx
    <h4 className="card-lista-titulo">❄️ Menos Vendidos / Sem Vendas</h4>
    ```
  - **"Saúde do Estoque" header** (Alerta de Estoque Baixo, line 572):
    ```jsx
    <h4 className="card-lista-titulo">⚠️ Alerta de Estoque Baixo</h4>
    ```

- **File**: `frontend/src/index.css`
  - **Grid container styling** (lines 1623-1634):
    ```css
    .dashboard-secao-listas {
        display: grid;
        grid-template-columns: 1fr;
        gap: 20px;
        margin-bottom: 25px;
    }
    @media (min-width: 992px) {
        .dashboard-secao-listas {
            grid-template-columns: 1fr 1fr 1fr;
        }
    }
    ```
  - **List Card styling** (lines 1636-1647):
    ```css
    .card-lista {
        background: rgba(255, 255, 255, 0.45);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 8px 32px 0 rgba(155, 89, 182, 0.08);
        display: flex;
        flex-direction: column;
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    ```
  - **Card Header styling** (lines 1655-1666):
    ```css
    .card-lista-titulo {
        font-size: 1.1rem;
        font-weight: 700;
        color: #2c3e50;
        margin-top: 0;
        margin-bottom: 15px;
        padding-bottom: 8px;
        border-bottom: 2px solid #fdf2f7;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    ```

### B. Project Infrastructure
- **Vitest Configuration**: `frontend/package.json` contains:
  ```json
  "scripts": {
    "test": "vitest run"
  }
  ```
- **Test Suite**: `frontend/src/__tests__/Relatorios.test.jsx` verifies dashboard rendering, card summaries, filtering, and detail toggles.

---

## 2. Logic Chain
1. **Collapsing State**:
   - By creating three state variables in `Relatorios.jsx` using `useState(false)` (`maisVendidosAberto`, `menosVendidosAberto`, `estoqueBaixoAberto`), we ensure the sections start collapsed by default.

2. **Clickable Headers**:
   - Modifying the `<h4 className="card-lista-titulo">` headers to include a click handler toggles the respective state variables.
   - Adding a hover cursor indicator `cursor: pointer` makes it clear the header is clickable.

3. **Smooth Height Animation**:
   - Simply setting `height: 0` to `height: auto` does not trigger CSS transitions.
   - Two viable CSS strategies are identified:
     - **Option 1 (CSS Grid - Recommended)**: Wrapping content in a grid wrapper that shifts `grid-template-rows` from `0fr` (collapsed) to `1fr` (expanded). This is highly dynamic and requires no hardcoded height.
     - **Option 2 (CSS Max-Height)**: Transitioning `max-height` from `0` to a fixed boundary (e.g. `350px`).
   - The CSS Grid option is recommended for smoother visual rendering since it calculates heights on the fly and eliminates animation delays.

4. **Grid Stretching Resolution**:
   - The parent grid container (`.dashboard-secao-listas`) stretches all columns to match the height of the tallest item by default (`align-items: stretch`).
   - If one accordion expands, the other collapsed card borders will stretch unnecessarily, creating large blank cards. Applying `align-items: start;` resolves this behavior.

5. **Accessibility Integration**:
   - Adding `role="button"`, `aria-expanded`, `tabIndex={0}`, and an `onKeyDown` handler allows keyboard navigation and screen readers to interact correctly with the accordions.

---

## 3. Caveats
- Command runner connection resets prevented running `npm test` synchronously. Although this read-only proposal does not edit code directly, the implementing agent should run tests immediately after applying the patches to verify no visual regressions occur.

---

## 4. Conclusion & Proposed Implementation Plan
The design meets all user requirements. The following changes should be applied:

### Proposed JSX Changes: `frontend/src/pages/Relatorios.jsx`

#### Step 1: Initialize states (after line 30)
```jsx
    // Controle de expansão dos accordions (M5)
    const [maisVendidosAberto, setMaisVendidosAberto] = useState(false);
    const [menosVendidosAberto, setMenosVendidosAberto] = useState(false);
    const [estoqueBaixoAberto, setEstoqueBaixoAberto] = useState(false);
```

#### Step 2: Update "Produtos Mais Vendidos" Section (around line 527)
```jsx
                    <div className="card-lista">
                        <h4 
                            className="card-lista-titulo card-lista-header-toggleable"
                            onClick={() => setMaisVendidosAberto(!maisVendidosAberto)}
                            role="button"
                            aria-expanded={maisVendidosAberto}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setMaisVendidosAberto(!maisVendidosAberto);
                                }
                            }}
                        >
                            <span>🔥 Produtos Mais Vendidos</span>
                            <span className="accordion-indicator" aria-hidden="true">
                                {maisVendidosAberto ? '▲' : '▼'}
                            </span>
                        </h4>
                        <div className={`accordion-content ${maisVendidosAberto ? 'expanded' : ''}`}>
                            <div className="accordion-inner">
                                {produtosMaisVendidos.length === 0 ? (
                                    <p className="lista-vazia">Nenhuma venda registrada no período.</p>
                                ) : (
                                    <ul className="lista-itens">
                                        {produtosMaisVendidos.map((prod, idx) => (
                                            <li key={idx} className="lista-item lista-item-top">
                                                <div className="item-info">
                                                    <span className="item-nome" title={prod.nome}>{prod.nome}</span>
                                                    <span className="item-detalhe">{prod.quantidade} unid. vendidas</span>
                                                </div>
                                                <div className="item-valores">
                                                    <span className="item-valor-destaque">R$ {prod.faturamento.toFixed(2)}</span>
                                                    <span className="item-valor-secundario">Total</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
```

#### Step 3: Update "Produtos Menos Vendidos" Section (around line 549)
```jsx
                    <div className="card-lista">
                        <h4 
                            className="card-lista-titulo card-lista-header-toggleable"
                            onClick={() => setMenosVendidosAberto(!menosVendidosAberto)}
                            role="button"
                            aria-expanded={menosVendidosAberto}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setMenosVendidosAberto(!menosVendidosAberto);
                                }
                            }}
                        >
                            <span>❄️ Menos Vendidos / Sem Vendas</span>
                            <span className="accordion-indicator" aria-hidden="true">
                                {menosVendidosAberto ? '▲' : '▼'}
                            </span>
                        </h4>
                        <div className={`accordion-content ${menosVendidosAberto ? 'expanded' : ''}`}>
                            <div className="accordion-inner">
                                {produtosMenosVendidos.length === 0 ? (
                                    <p className="lista-vazia">Nenhum produto cadastrado.</p>
                                ) : (
                                    <ul className="lista-itens">
                                        {produtosMenosVendidos.map((prod, idx) => (
                                            <li key={idx} className="lista-item lista-item-less">
                                                <div className="item-info">
                                                    <span className="item-nome" title={prod.nome}>{prod.nome}</span>
                                                    <span className="item-detalhe">{prod.quantidade} unid. vendidas</span>
                                                </div>
                                                <div className="item-valores">
                                                    <span className="item-valor-destaque" style={{ color: '#e74c3c' }}>R$ {prod.faturamento.toFixed(2)}</span>
                                                    <span className="item-valor-secundario">Total</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
```

#### Step 4: Update "Alerta de Estoque Baixo" Section (around line 571)
```jsx
                    <div className="card-lista">
                        <h4 
                            className="card-lista-titulo card-lista-header-toggleable"
                            onClick={() => setEstoqueBaixoAberto(!estoqueBaixoAberto)}
                            role="button"
                            aria-expanded={estoqueBaixoAberto}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setEstoqueBaixoAberto(!estoqueBaixoAberto);
                                }
                            }}
                        >
                            <span>⚠️ Alerta de Estoque Baixo</span>
                            <span className="accordion-indicator" aria-hidden="true">
                                {estoqueBaixoAberto ? '▲' : '▼'}
                            </span>
                        </h4>
                        <div className={`accordion-content ${estoqueBaixoAberto ? 'expanded' : ''}`}>
                            <div className="accordion-inner">
                                {saudeDoEstoque.length === 0 ? (
                                    <p className="lista-vazia" style={{ color: '#27ae60' }}>Todos os produtos com estoque saudável!</p>
                                ) : (
                                    <ul className="lista-itens">
                                        {saudeDoEstoque.map((prod, idx) => (
                                            <li key={idx} className="lista-item lista-item-alerta">
                                                <div className="item-info">
                                                    <span className="item-nome" title={prod.nome}>{prod.nome}</span>
                                                    <span className="item-detalhe">Estoque físico atual</span>
                                                </div>
                                                <div className="item-valores">
                                                    <span className="item-valor-destaque" style={{ color: '#e74c3c' }}>{prod.quantidade} unid.</span>
                                                    <span className="item-valor-secundario">Restantes</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
```

---

### Proposed CSS Changes: `frontend/src/index.css`

Add the following styles at the end of the **M5: RELATÓRIOS E DASHBOARD** section:

```css
/* Glassmorphism Accordion Headers */
.card-lista-header-toggleable {
    cursor: pointer;
    user-select: none;
    transition: var(--transition-smooth);
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.card-lista-header-toggleable:hover {
    color: #9b59b6;
    border-bottom-color: rgba(155, 89, 182, 0.4);
    background-color: rgba(255, 255, 255, 0.15); /* Glass-compatible subtle highlight */
    border-radius: 6px;
    padding-left: 6px;
    padding-right: 6px;
}

.card-lista-header-toggleable:focus-visible {
    outline: 2px solid #9b59b6;
    outline-offset: 4px;
    border-radius: 6px;
}

.accordion-indicator {
    font-size: 0.85rem;
    color: #7f8c8d;
    transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), color 0.3s ease;
}

.card-lista-header-toggleable:hover .accordion-indicator {
    color: #9b59b6;
}

/* Accordion Smooth Height Transition via CSS Grid */
.accordion-content {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.35s cubic-bezier(0.25, 0.8, 0.25, 1),
                opacity 0.3s ease-out;
    opacity: 0;
    overflow: hidden;
}

.accordion-content.expanded {
    grid-template-rows: 1fr;
    opacity: 1;
}

.accordion-inner {
    min-height: 0;
    padding-top: 15px; /* Adds space under the header when expanded */
}

/* Prevent collapsed cards in the section from being stretched by grid */
.dashboard-secao-listas {
    align-items: start;
}
```

---

## 5. Verification Method
1. **Visual and Behavioral Verification**:
   - Check that all three cards display correctly on screen in a collapsed state by default.
   - Hover over each title header to verify that the pointer cursor is displayed.
   - Click a header and verify that the height transition expands dynamically to fit all list items without delays.
   - Expand only one card and verify that the remaining collapsed cards maintain a small height instead of stretching.
2. **Regression Testing**:
   - In the frontend directory (`/home/christian-sperb/Documents/projects/unyleya/3P-1-frontend/frontend`), run `npm run test` or `vitest run` to ensure that existing test cases for reports and layout renderers are passing properly.
