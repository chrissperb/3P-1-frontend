# Handoff Report — Review of Accordion Implementation on Relatorios.jsx

## 1. Observation
* **Failing Frontend Test Suite**: Running `npm run test` in `/home/christian-sperb/Documents/projects/unyleya/3P-1-frontend/frontend` fails with exit code 1. Specifically, the test `"Deve iniciar com as seções colapsadas, expandir ao clicar, e colapsar ao clicar novamente"` in `/home/christian-sperb/Documents/projects/unyleya/3P-1-frontend/frontend/src/__tests__/Relatorios.test.jsx` fails at line 339:
  ```javascript
  339|         const maisVendidosHeader = screen.getByRole('heading', { name: /Produtos Mais Vendidos/i });
  ```
  The error output from Vitest is:
  ```
  TestingLibraryElementError: Unable to find an accessible element with the role "heading" and name `/Produtos Mais Vendidos/i`
  ```
* **HTML Accessibility Role Override**: In `frontend/src/pages/Relatorios.jsx` (lines 538-548), the accordion header is defined as:
  ```javascript
  538:                         <h4
  539:                             className="card-lista-titulo"
  540:                             style={{ cursor: 'pointer' }}
  541:                             onClick={() => setMaisVendidosAberto(!maisVendidosAberto)}
  542:                             onKeyDown={(e) => handleToggleKeyDown(e, setMaisVendidosAberto, maisVendidosAberto)}
  543:                             role="button"
  544:                             tabIndex={0}
  545:                             aria-expanded={maisVendidosAberto}
  546:                         >
  ```
  This pattern is replicated for `menosVendidosHeader` (lines 576-586) and `estoqueBaixoHeader` (lines 614-624).
* **Instant Unmounting of Children**: In `frontend/src/pages/Relatorios.jsx` (lines 551-570), the content is conditionally rendered using `maisVendidosAberto && (...)`:
  ```javascript
  549:                         <div className={`accordion-content ${maisVendidosAberto ? 'expanded' : ''}`}>
  550:                             <div className="accordion-inner">
  551:                                 {maisVendidosAberto && (
  ```
  This pattern is repeated for `menosVendidosAberto` (lines 589-608) and `estoqueBaixoAberto` (lines 627-646).
* **Production Build Output**: Running `npm run build` in `/home/christian-sperb/Documents/projects/unyleya/3P-1-frontend/frontend` succeeds cleanly with the output:
  ```
  dist/index.html                   0.57 kB │ gzip:   0.40 kB
  dist/assets/index-D6cM-Y7Y.css   24.76 kB │ gzip:   4.75 kB
  dist/assets/index-BNs4HWhU.js   673.88 kB │ gzip: 189.50 kB
  ✓ built in 941ms
  ```
* **Backend Test Output**: Running `npm run test` from the root directory succeeds with:
  ```
  Test Suites: 11 passed, 11 total
  Tests:       64 passed, 64 total
  ```

---

## 2. Logic Chain
1. The test `Relatorios.test.jsx:339` attempts to query elements using `screen.getByRole('heading', { name: /Produtos Mais Vendidos/i })`.
2. In `Relatorios.jsx`, the `h4` tag has `role="button"` explicitly set. According to ARIA specs, setting `role="button"` on a heading tag overrides its implicit semantic role from `heading` to `button` in the accessibility tree.
3. Therefore, testing-library's DOM query for `role="heading"` cannot locate the elements (since they are now classified as `role="button"`). This directly causes the test to fail.
4. Additionally, since the child contents are conditionally rendered via `{maisVendidosAberto && (...)}`, they are immediately removed from the DOM when `maisVendidosAberto` becomes false.
5. Because the children are unmounted instantly, they cannot be animated out during the 0.35s height collapse transition. The items disappear instantly, and the container collapses empty, breaking the visual flow of the collapse animation.
6. The test suite has no tests evaluating keyboard navigation (`onKeyDown` with `Enter` or `Space` key events), creating a gap in robustness/coverage.

---

## 3. Caveats
* **JSDOM vs. Real Browser Layout**: Testing-library tests use `jsdom` which simulates the DOM but does not calculate CSS layouts or animations. Thus, the visual defect (items disappearing instantly during collapse) was not caught by the automated test suite, only by static review.

---

## 4. Conclusion
* **Verdict**: `REQUEST_CHANGES`
* **Summary of Issues**:
  1. **Broken Test**: Overriding the role of `h4` headings with `role="button"` causes the test suite to fail as `screen.getByRole('heading')` can no longer find them.
  2. **UX/Transition Defect**: Instant unmounting of the child elements on collapse breaks the CSS height animation, causing items to snap out of existence.
  3. **Accessibility (A11y) Best Practices**: Setting `role="button"` directly on `h4` breaks page outline structure for screen readers. Buttons should be nested inside headings.
  4. **Coverage Gaps**: Keyboard triggers (`onKeyDown` handling Enter/Space) are implemented but completely untested in the unit tests.

---

## 5. Verification Method
To verify the fixes independently:
1. Run the Vitest test runner inside the frontend folder:
   ```bash
   cd frontend
   npx vitest run
   ```
   All tests (40/40) must pass.
2. Build the project:
   ```bash
   npm run build
   ```
   The build must succeed with zero errors.

---

# Quality Review Report

**Verdict**: `REQUEST_CHANGES`

## Findings

### Critical Finding 1: Mismatch in Accessibility Roles causing Unit Test Failure
* **What**: The unit test `Relatorios.test.jsx` fails because it queries the Accordion triggers by `role="heading"`, but the implementation overrides it to `role="button"`.
* **Where**: `frontend/src/pages/Relatorios.jsx:543`, `581`, `619` and `frontend/src/__tests__/Relatorios.test.jsx:339`, `340`, `341`.
* **Why**: Placing `role="button"` on `<h4>` makes it a button, not a heading, in the accessibility tree.
* **Suggestion**: Nest a standard `<button>` element inside the `<h4>` heading:
  ```jsx
  <h4 className="card-lista-titulo">
      <button
          type="button"
          className="accordion-trigger"
          onClick={() => setMaisVendidosAberto(!maisVendidosAberto)}
          onKeyDown={(e) => handleToggleKeyDown(e, setMaisVendidosAberto, maisVendidosAberto)}
          aria-expanded={maisVendidosAberto}
      >
          {maisVendidosAberto ? '▲' : '▼'} 🔥 Produtos Mais Vendidos
      </button>
  </h4>
  ```
  This is semantically correct, preserves heading structure, and fixes the test without modifying the test queries.

### Major Finding 2: Broken Visual Transition on Collapse
* **What**: The lists disappear instantly instead of sliding up during collapse.
* **Where**: `frontend/src/pages/Relatorios.jsx:551`, `589`, `627`.
* **Why**: Conditionally rendering `{state && <Child />}` unmounts the child immediately, preventing the CSS grid height transition from showing the shrinking content.
* **Suggestion**: Keep the child elements mounted in the DOM, and use the `aria-hidden` attribute to handle accessibility when closed:
  ```jsx
  <div className={`accordion-content ${maisVendidosAberto ? 'expanded' : ''}`}>
      <div className="accordion-inner">
          <ul className="lista-itens" aria-hidden={!maisVendidosAberto}>
              {produtosMaisVendidos.length === 0 ? (
                  <p className="lista-vazia">Nenhuma venda registrada no período.</p>
              ) : (
                  produtosMaisVendidos.map(...)
              )}
          </ul>
      </div>
  </div>
  ```

### Minor Finding 3: Missing Test Coverage for Keyboard Navigation
* **What**: Keyboard accessibility (`handleToggleKeyDown` supporting Space and Enter keys) has zero test coverage.
* **Where**: `frontend/src/__tests__/Relatorios.test.jsx`.
* **Why**: It is important to ensure that custom keydown handlers function correctly.
* **Suggestion**: Add a test case triggering `{ key: ' ' }` (Space) and `{ key: 'Enter' }` on the accordion elements.

---

## Verified Claims
* **Backend tests pass** -> verified via running `npm run test` on the root workspace outside sandbox -> **PASS**
* **Frontend build succeeds** -> verified via running `npm run build` in `frontend/` -> **PASS**
* **Existing dashboard features** -> verified via source code review (calculations, details toggle, charts, and database routes are preserved) -> **PASS**

## Coverage Gaps
* **Keyboard navigation testing**: No tests trigger key events on the accordion headings.
* **UX/Animation transition testing**: Unit tests run in jsdom and cannot detect layout/animation issues.

---

# Adversarial Review Report

**Overall risk assessment**: `MEDIUM`

## Challenges

### Medium Challenge 1: Heading Role Overrides & Screen Reader Navigation
* **Assumption challenged**: The assumption that adding `role="button"` directly on `h4` is fully accessible.
* **Attack scenario**: Screen reader users navigating page structure by headings (e.g., press 'H' in NVDA/JAWS) will miss "Produtos Mais Vendidos", "Produtos Menos Vendidos", and "Saúde do Estoque" entirely because they are no longer headings.
* **Blast radius**: Low-vision/blind users lose the semantic outline of the report dashboard sections.
* **Mitigation**: Nest buttons inside the heading tags.

### Low Challenge 2: Potential NaN in Valor de Estoque
* **Assumption challenged**: Assuming `p.quantidade` is always defined.
* **Attack scenario**: If a product record has `quantidade` as null or undefined, the expression `p.quantidade * (p.preco || 0)` evaluates to `NaN`, rendering the "Valor em Estoque" card as `NaN` or crashing.
* **Blast radius**: UI display error for the stock summary.
* **Mitigation**: Add a fallback to the calculation: `(p.quantidade || 0) * (p.preco || 0)`.

---

## Stress Test Results
* **Zero Products in Database** -> Stock value card should render `R$ 0.00` -> **PASS**
* **No Orders in Period** -> Dashboard calculates faturamento as `R$ 0.00` and ticket medio as `R$ 0.00` with no division by zero errors -> **PASS**
