## 2026-07-16T09:47:42Z
Você é o Agent Frontend Developer da equipe. Seu objetivo neste sub-marco (M12) é realizar a repaginada estética global, do App Shell e do Login no codebase do Borbolêlalá, aplicando Glassmorphism, gradientes de borboleta e micro-animações, mantendo Nunito e todos os testes existentes.

Seu diretório de trabalho dedicado é /home/christian-sperb/Documents/projects/unyleya/3P-1-frontend/.agents/worker_m12.

Instruções Detalhadas de Implementação:
1. **index.css (Estilos Globais, Gradientes e Glassmorphism)**:
   - Adicione variáveis e estilos globais no início de `frontend/src/index.css` para a paleta de cores e transições.
   - O plano de fundo geral (`body`) deve receber um gradiente linear/radial moderno baseado em asas de borboleta, misturando tons suaves de rosa bebê (#fdf2f7 ou #fce4ec), lilás (#ebd4ef ou #f3e5f5) e roxo suave (#d4b2e6 ou #e1bee7), com transição suave.
   - Defina classes utilitárias ou altere as regras de `.login-card` e `.main-nav` para aplicar a estética Glassmorphism:
     * Fundo translúcido: `background: rgba(255, 255, 255, 0.45);` ou similar.
     * Desfoque de fundo: `backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);`
     * Borda fina semi-transparente: `border: 1px solid rgba(255, 255, 255, 0.3);` ou `border: 1px solid rgba(155, 89, 182, 0.15);`
     * Sombras suaves e profundas: `box-shadow: 0 8px 32px 0 rgba(155, 89, 182, 0.1);`
     * Transições suaves em todos os elementos com `transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);`
   - Adicione animações no `index.css`:
     * Animação `@keyframes float` para ícones/borboletas (oscilação/flutuação vertical suave).
     * Animação `@keyframes pulseGlow` ou efeitos de preenchimento/brilho no hover de botões (`.login-button`).

2. **Login Page (`frontend/src/pages/Login.jsx`)**:
   - Ajuste o JSX e certifique-se de que a estrutura HTML de labels, inputs e botões seja mantida idêntica para não quebrar os testes unitários.
   - Aplique uma classe de flutuação no emoji `🦋` se desejar (ex: envolve-lo em um `<span className="animated-butterfly">🦋</span>`).
   - Os inputs (`.login-input`) devem ter um efeito de brilho sutil no foco.

3. **App Shell (`frontend/src/App.jsx`)**:
   - Mantenha a estrutura geral e os elementos existentes para não quebrar os testes.
   - Certifique-se de que a marca `🦋 Borbolêlalá` possua a classe animada para a borboleta flutuar/oscilar suavemente.
   - Aplique as classes de Glassmorphism na barra de navegação `.main-nav`.

4. **Testes e Build**:
   - Execute os testes do frontend na pasta `/frontend` (`npm run test`) para garantir que os testes continuam passando.
   - Execute os testes do backend na raiz (`npm run test`) para garantir regressão zero.
   - Execute o build do frontend na pasta `/frontend` (`npm run build`) para verificar que o build do Vite funciona sem erros.

5. **Entregável**:
   - Crie o relatório em `/home/christian-sperb/Documents/projects/unyleya/3P-1-frontend/.agents/worker_m12/handoff.md` detalhando as mudanças estéticas aplicadas e os resultados dos testes/build.
