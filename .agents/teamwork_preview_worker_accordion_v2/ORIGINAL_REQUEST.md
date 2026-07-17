## 2026-07-16T21:37:39Z
Implement the updated Accordion component and test fixes on the Reports page.

Task Details:
1. Modify `frontend/src/pages/Relatorios.jsx`:
   - Keep the state variables: `maisVendidosAberto`, `menosVendidosAberto`, and `estoqueBaixoAberto` (initialized to `false`).
   - Keep/update the keyboard listener handler function `handleToggleKeyDown`.
   - Update the HTML structure of the three product list cards:
     - Wrap the header trigger in a `<button type="button" className="card-lista-header-toggle" onClick={...} onKeyDown={...} aria-expanded={...}>` nested inside the `<h4>` heading. This preserves heading semantics for screen reader navigation while correctly presenting the toggle button.
     - Always render the content of the list in the DOM. Do NOT conditionally unmount it (i.e. remove `{maisVendidosAberto && ...}`). Instead, wrap the content container in `<div className={`accordion-content ${state ? 'expanded' : ''}`}> <div className="accordion-inner"> ...original list/empty content... </div> </div>`. This ensures the CSS transition can animate height and opacity smoothly on collapse as well as expand.
2. Modify `frontend/src/index.css`:
   - Set `.dashboard-secao-listas { align-items: start; }` to prevent collapsed cards from stretching.
   - Update/add CSS rules for the accordion content, inner, and button classes:
     ```css
     .card-lista-header-toggle {
         background: none;
         border: none;
         font: inherit;
         color: inherit;
         cursor: pointer;
         display: flex;
         width: 100%;
         justify-content: space-between;
         align-items: center;
         padding: 0;
         outline: none;
         transition: var(--transition-smooth);
     }
     .card-lista-header-toggle:hover {
         color: #9b59b6;
     }
     .card-lista-header-toggle:focus-visible {
         outline: 2px solid #9b59b6;
         outline-offset: 4px;
         border-radius: 4px;
     }
     .accordion-content {
         display: grid;
         grid-template-rows: 0fr;
         transition: grid-template-rows 0.35s ease, opacity 0.35s ease, visibility 0.35s ease;
         opacity: 0;
         overflow: hidden;
         visibility: hidden;
     }
     .accordion-content.expanded {
         grid-template-rows: 1fr;
         opacity: 1;
         visibility: visible;
     }
     .accordion-inner {
         min-height: 0;
         padding-top: 15px;
     }
     ```
3. Update `frontend/src/__tests__/Relatorios.test.jsx`:
   - Replace/append the unit test suite for the accordion functionality.
   - Test that the buttons have `aria-expanded="false"` by default, and that the inner lists are not visible (use `expect(screen.queryByText(...)).not.toBeVisible()`).
   - Test that clicking the button toggles `aria-expanded` to `"true"` and makes the content visible (use `expect(screen.getByText(...)).toBeVisible()`).
   - Test that clicking again hides the content and toggles `aria-expanded` back to `"false"`.
   - Test that keyboard interaction (e.g. Space or Enter keys) toggles the accordion expansion states correctly (using `fireEvent.keyDown(button, { key: ' ' })` or similar).
4. Run the frontend tests via `npm run test` or `vitest` (use BypassSandbox if you encounter connection resets) to verify that all 40+ tests pass with 100% success.
5. Run the backend tests from the root directory to confirm no regressions.
6. Run the Vite production build (`npm run build` in `frontend/`) and ensure it succeeds.

Working Directory: `/home/christian-sperb/Documents/projects/unyleya/3P-1-frontend/.agents/teamwork_preview_worker_accordion_v2`
