# Project: Borbolêlalá Moda Infantil - Accordion Component
# Scope: Accordion Component on Relatorios.jsx

## Architecture
- React frontend: `frontend/src/pages/Relatorios.jsx`
- Recharts dashboard sections: "Produtos Mais Vendidos", "Produtos Menos Vendidos", "Saúde do Estoque"
- Unit tests: `frontend/src/__tests__/Relatorios.test.jsx`

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|---|---|---|---|
| M18 | Implementar Accordion | Transformar as 3 seções em painéis retráteis, iniciar contraídas por padrão com indicadores ▲/▼ e transição suave | none | DONE |
| M19 | Testes do Accordion | Estender Relatorios.test.jsx para verificar que iniciam fechadas e expandem ao clicar | M18 | DONE |
| M20 | Validação e Auditoria | Garantir que testes passem, Vite build funciona e auditoria forense é CLEAN | M19 | IN_PROGRESS |

## Interface Contracts
- React useState controls the expansion state for each of the three accordions in Relatorios.jsx.
- Transition CSS styles to be defined in React or index.css for smooth collapse/expand animation.
