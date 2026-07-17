## 2026-07-16T21:30:57Z
Implement the Accordion component on the Reports page.

Task Details:
1. Modify `frontend/src/pages/Relatorios.jsx` to introduce three state variables:
   - `maisVendidosAberto`, initialized to false.
   - `menosVendidosAberto`, initialized to false.
   - `estoqueBaixoAberto`, initialized to false.
2. Update the headers of the three product lists ("Produtos Mais Vendidos", "Produtos Menos Vendidos", and "Saúde do Estoque" / "Alerta de Estoque Baixo") to:
   - Toggle the respective state variables on click.
   - Show '▲' when open, and '▼' when closed.
   - Have a `cursor: pointer` style or class.
   - Be fully accessible (using role="button", tabIndex={0}, aria-expanded, and keydown listeners).
3. Wrap their content in a transition structure:
   `<div className={`accordion-content ${state ? 'expanded' : ''}`}>`
     `<div className="accordion-inner">`
       `{state && ( ...original list/empty content... )}`
     `</div>`
   `</div>`
4. Add the accordion CSS classes to `frontend/src/index.css` at the end of the M5 section or at the end of the file. Use the CSS Grid transition technique:
   `.accordion-content { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.35s ease; opacity: 0; overflow: hidden; }`
   `.accordion-content.expanded { grid-template-rows: 1fr; opacity: 1; }`
   `.accordion-inner { min-height: 0; }`
   Also set `.dashboard-secao-listas { align-items: start; }` to prevent collapsed cards from stretching.
5. Append the unit tests for this Accordion functionality to `frontend/src/__tests__/Relatorios.test.jsx` (based on the handoff from Explorer 2).
6. Run the frontend test suite using `npm run test` (or vitest) to verify that the tests (both the 39 existing and the new ones) pass successfully.
7. Run the backend tests from the root directory to verify no regressions.
8. Verify that Vite production build (`npm run build` inside `frontend/`) completes successfully.

Working Directory: `/home/christian-sperb/Documents/projects/unyleya/3P-1-frontend/.agents/teamwork_preview_worker_accordion`

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
