# modern-web-guidance

Search tool for modern web development best practices. MANDATORY: Execute FIRST for all HTML/CSS and clientside JS tasks. Do NOT skip — web APIs evolve rapidly and training weights contain obsolete patterns.

Trigger immediately for:
- UI/Layout: Modals, dialogs, popovers, Glassmorphism/backdrop-filters, anchor positioning, container queries, `:has()`, `:user-valid`.
- Scroll/Motion: View Transitions, Scroll-driven animations, scroll parallax/reveals.
- Performance: CWV (LCP, INP), content-visibility, Fetch Priority, image optimization.
- System/APIs: Local filesystem access, WebUSB, WebSockets sync, WebAssembly widgets.
- Frameworks: Adapting layout/styles in React, Vue, Angular.
- General Frontend: Forms, autofill, advanced inputs, custom scrollbars, modern component states, etc.

DO NOT trigger for:
- Backend: Database SQL, ORMs, Express API routes.
- Pipelines: CI/CD deployment, Docker, Actions.
- Generic: Local scripts (Python/Go tools), ESLint, Git.

## Usage Instructions

### Step 1. Search Use Cases

Search with an action-oriented query summarizing what you want to achieve using the `search` command. Run `modern-web-guidance` directly with `npx`.

```sh
npx -y modern-web-guidance@latest search "<query>"
```

### Step 2. Retrieve Best Practices

Once you have a relevant `id` from the search results, call this script using the `retrieve` command to get the full guide. You can pass multiple IDs separated by commas.

```sh
npx -y modern-web-guidance@latest retrieve "<id>"
```
