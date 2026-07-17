## 2026-07-16T09:51:37Z
Você é o Agent Frontend Developer da equipe. Seu objetivo neste sub-marco (M13) é aplicar a repaginada estética no PDV (Frente de Caixa) e no Estoque da aplicação Borbolêlalá.

Seu diretório de trabalho dedicado é /home/christian-sperb/Documents/projects/unyleya/3P-1-frontend/.agents/worker_m13.

Instruções Detalhadas de Implementação:
1. **index.css (Estilização de PDV e Estoque)**:
   - Certifique-se de que todas as alterações estéticas sigam a estética Glassmorphism:
     * Fundo translúcido para os cartões de produtos (`.card-produto`), barra lateral de checkout (`.pdv-checkout-sidebar`), container de frete (`.frete-container`), tabela de estoque (`.tabela-container`) e formulário de produtos (`.form-produto-card`).
     * Use fundos como `background: rgba(255, 255, 255, 0.45);` ou `background: rgba(255, 255, 255, 0.7);`
     * Adicione `backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);` a esses painéis.
     * Bordas finas semi-transparentes: `border: 1px solid rgba(255, 255, 255, 0.3);` ou `border: 1px solid rgba(155, 89, 182, 0.1);`
     * Sombras profundas e suaves: `box-shadow: 0 8px 32px 0 rgba(155, 89, 182, 0.08);`
   - Adicione micro-animações no hover e transições:
     * Efeito Hover nos cartões de produtos (`.card-produto`): `transform: translateY(-5px);` com transição suave.
     * Transições de estado fluidas (`transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)`).
     * Efeito de brilho gradiente que se expande ou pulsa levemente no hover dos botões de ação:
       - `.btn-adicionar` (no PDV)
       - `.btn-finalizar-venda` (no PDV)
       - `.btn-buscar-frete` (no PDV)
       - `.btn-novo-produto` (no Estoque)
       - `.btn-salvar` (no Estoque)
       - `.btn-cancelar` (no Estoque)
   - Certifique-se de que os botões de ação fiquem visualmente premium e modernos.
   - Melhore o visual dos inputs do frete e busca para harmonizar com a estética Glassmorphism.
   - Ajuste o cabeçalho das tabelas e as cores dos botões de ações (✏️, 🗑️) para parecerem modernos e combinarem com a paleta lúdica da marca.

2. **Login/Navbar/App e Lógica de Negócio**:
   - NÃO modifique as lógicas funcionais (carrinho, checkout, buscas, etc.).
   - Certifique-se de manter os nomes de classes e estruturas DOM que os testes utilizam.
   - Mantenha a Nunito font em todos os elementos.

3. **Validação**:
   - Execute os testes unitários do frontend (`npm run test` na pasta do frontend) e garanta que todos os 34 testes passem com sucesso.
   - Execute os testes do backend na raiz (`npm run test`) e garanta que todos os 64 testes passem.
   - Execute o build do frontend na pasta `/frontend` (`npm run build`) para verificar que o bundle é criado de forma limpa.

4. **Entregável**:
   - Salve o relatório em `/home/christian-sperb/Documents/projects/unyleya/3P-1-frontend/.agents/worker_m13/handoff.md` detalhando as mudanças estéticas do PDV e Estoque e resultados de testes/build.
