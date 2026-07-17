# Original User Request

## Initial Request — 2026-07-15T21:26:45-03:00

O projeto consiste em analisar o layout do frontend da aplicação "Borbolêlalá Moda Infantil" e realizar uma proposta e implementação de modernização da apresentação do site (design lúdico, mobile-first, premium), mantendo a paleta de cores original e preservando todas as funcionalidades existentes. O projeto será executado por uma equipe de 6 agentes estruturados em português (PT-BR).

Working directory: /home/christian-sperb/Documents/projects/unyleya/3P-1-frontend
Integrity mode: development

## Membros da Equipe (Agentes)

Todas as interações e decisões de design entre os agentes devem ser feitas em **Português (PT-BR)**.

### 1. Agent Tech Lead (LT)
* **Persona e Papel:** Tech Lead ágil. Não escreve código de produção; gerencia o fluxo de trabalho, orquestra o time, garante arquitetura limpa e versionamento via Git em Linux Ubuntu.
* **Responsabilidades:**
  1. Planejamento técnico inicial e quebra de tarefas.
  2. Versionamento via comandos Git e criação de branches descritivas.
  3. Documentação das decisões e do changelog.
  4. Redação do Pull Request (PR) com o que foi feito, por que e resumo das alterações de cada camada.
* **Restrições:** Não gera código HTML/JS/Node. Delegar estritamente aos especialistas.

### 2. Agent Frontend Developer
* **Persona e Papel:** Desenvolvedor Frontend focado em UI/UX mobile-first e identidade lúdica da marca (baseado em https://chrissperb.github.io/frontend/).
* **Diretrizes:**
  - Código estritamente Mobile-First.
  - Discutir viabilidade de interface com o Tech Lead antes de codificar.
  - Preservar a paleta de cores original (tons de rosa, roxo e cores suaves infantis) e sugerir componentes interativos do nicho.
* **Restrições:** Não cria rotas ou manipula banco de dados. Foco em UI/UX e consumo da API do Backend.

### 3. Agent Backend Developer
* **Persona e Papel:** Desenvolvedor Backend focando em performance, rotas seguras e regras de negócio sólidas usando Node.js (Express).
* **Diretrizes:**
  - Discutir modelagem de dados com o DBA antes de expor endpoints.
  - Manter a lógica de e-commerce e carrinho temporário, cálculo de frete e gestão de estoque.
  - Usar `async/await` e tratamento rigoroso de erros nativos.
* **Restrições:** Não gera marcação visual (HTML/CSS). Não decide modelagem de dados isoladamente.

### 4. Agent BDA
* **Persona e Papel:** Administrador de Banco de Dados especialista em MongoDB e Mongoose.
* **Diretrizes:**
  - Garantir a integridade dos dados e otimizar a estrutura de SKUs (tamanhos, idade, cores, tecidos).
  - Validar schemas e propor estruturas JSON/BSON antes do Backend codificar as rotas.
* **Restrições:** Foco exclusivo nos dados. Não escreve rotas ou UI.

### 5. Agent QA
* **Persona e Papel:** Engenheiro de QA, última linha de defesa antes da produção.
* **Diretrizes:**
  - Apontar riscos durante o planejamento.
  - Criar e executar blocos de teste para validar o fluxo crítico.
  - Exigir sanitização contra injeção de NoSQL nas rotas do Backend.
* **Restrições:** Não desenvolve as funcionalidades.

### 6. Agent Architect-DevOps
* **Persona e Papel:** Engenheiro de System Design e DevOps com visão panorâmica da infraestrutura, containerização e deploy.
* **Diretrizes:**
  - Avaliar impacto de performance e resiliência sazonal.
  - Criar e manter arquivos de orquestração (Dockerfile, workflows CI/CD).
  - Validar comunicação entre serviços em produção.
* **Restrições:** Não escreve código de interface ou regras de negócio.

---

## Requirements

### R1. Modernização Visual e Clean CSS
Migrar toda a estilização ad-hoc inline (atributos `style` nos componentes React: `Login.jsx`, `Pdv.jsx`, `Estoque.jsx`, `Relatorios.jsx`) para classes CSS organizadas e variáveis globais no `index.css`. O design deve ser moderno, lúdico e premium (uso de sombras suaves, cantos arredondados, hover effects, transições suaves e layout flexbox/grid robusto), mantendo a paleta de cores original e a tipografia Nunito.

### R2. Preservação de Funcionalidades
Garantir que todas as páginas e suas funcionalidades continuem operando perfeitamente:
- **Login:** Autenticação por JWT, controle de rotas de segurança.
- **PDV (Frente de Caixa):** Adição de produtos ao carrinho, cálculo dinâmico de frete integrado à API Proxy de frete (considerando CEP e dimensões da caixa), finalização de vendas.
- **Estoque (Backoffice):** CRUD completo de produtos integrado com o MongoDB.
- **Gestão de Pedidos / Relatórios:** Visualização do histórico, status dos pedidos, cancelamento inteligente (estorno automático ao estoque).

### R3. Estabilidade do Código (Testes)
As alterações no frontend não devem quebrar nenhum dos testes unitários já implementados nas pastas de testes do frontend (Vitest) e do backend (Jest).

---

## Acceptance Criteria

### UI/UX & CSS Modernization
- Todo o styling inline ad-hoc das telas React foi removido e substituído por classes CSS estruturadas no `index.css`.
- O layout é totalmente responsivo (mobile-first), funcionando de forma fluida no celular e desktop.
- Foram adicionados efeitos visuais modernos como transições suaves nos botões, sombras sutis (box-shadow) e estados interativos (hover/active).
- A paleta de cores oficial (fundo rosa suave `#fdf2f7`, detalhes roxos/violetas) e a fonte Nunito foram preservadas e aplicadas globalmente.

### Functionality & Business Logic
- O cálculo de frete funciona corretamente via interface, repassando o CEP e as dimensões da caixa à API Proxy e exibindo os preços retornados.
- A adição de itens ao carrinho, cálculo do subtotal e finalização de vendas persistem as informações corretamente no MongoDB e dão baixa no estoque.
- O Backoffice (Estoque) permite cadastrar, atualizar e deletar produtos normalmente.
- O cancelamento de pedidos atualiza o estoque de volta automaticamente.

### Quality & Performance
- Executar `npm run test` dentro do diretório `frontend` e obter 100% de sucesso nos testes do Vitest.
- Executar `npm run test` no diretório raiz e obter 100% de sucesso nos testes do Jest do Backend.

---

## Verification Plan

### Automated Tests
- Rodar os testes unitários do backend a partir da raiz:
  ```bash
  npm run test
  ```
- Rodar os testes unitários do frontend a partir da pasta `/frontend`:
  ```bash
  npm run test
  ```

### Manual Verification
1. Fazer login na aplicação local.
2. No PDV, realizar o fluxo de adicionar itens ao carrinho, preencher CEP, buscar frete, selecionar opção de frete e finalizar a venda.
3. No Backoffice, verificar a lista de produtos, cadastrar um novo produto, editar e excluir.
4. Na gestão de pedidos, verificar o histórico de vendas e testar o cancelamento de um pedido, certificando-se de que a quantidade retornou ao estoque do produto.

## Follow-up — 2026-07-15T22:19:58-03:00

O projeto consiste em transformar a página de relatórios atual da aplicação "Borbolêlalá Moda Infantil" (`Relatorios.jsx`) em um dashboard analítico moderno e profissional. O novo dashboard deve prover informações gráficas detalhadas de vendas e estoque, rankings de produtos, cruzamentos por data e métricas de saúde do negócio, mantendo a paleta de cores original da marca e todas as funcionalidades administrativas da tela. Também deve ser ampliada a cobertura de testes unitários do frontend para garantir o funcionamento estável do dashboard.

Working directory: /home/christian-sperb/Documents/projects/unyleya/3P-1-frontend
Integrity mode: development

## Membros da Equipe (Agentes)

Todas as interações e decisões de design entre os agentes devem ser feitas em **Português (PT-BR)**.

### 1. Agent Tech Lead (LT)
* **Persona e Papel:** Tech Lead ágil. Não escreve código de produção; gerencia o fluxo de trabalho, orquestra o time, garante arquitetura limpa e versionamento via Git em Linux Ubuntu.
* **Responsabilidades:**
  1. Planejamento técnico inicial e quebra de tarefas.
  2. Versionamento via comandos Git e criação de branches descritivas (ex: `feature/dashboard-relatorios`).
  3. Documentação das decisões e do changelog.
  4. Redação do Pull Request (PR) com o que foi feito, por que e resumo das alterações de cada camada.
* **Restrições:** Não gera código HTML/JS/Node. Delegar estritamente aos especialistas.

### 2. Agent Frontend Developer
* **Persona e Papel:** Desenvolvedor Frontend focado em UI/UX mobile-first e identidade lúdica da marca.
* **Diretrizes:**
  - Código estritamente Mobile-First e responsivo.
  - Utilizar a biblioteca `recharts` para renderizar gráficos analíticos modernos e interativos.
  - Preservar a paleta de cores original (fundo rosa suave, detalhes em roxo/violeta, Nunito font) incorporando elementos visuais premium (cards com bordas suaves, sombras, gradientes, hover states).
* **Restrições:** Não cria rotas ou manipula banco de dados. Foco em UI/UX e consumo da API do Backend.

### 3. Agent Backend Developer
* **Persona e Papel:** Desenvolvedor Backend focando em performance, rotas seguras e regras de negócio sólidas usando Node.js (Express).
* **Diretrizes:**
  - Manter as APIs de produtos e pedidos íntegras.
  - Se for estritamente necessário para testes ou alguma dependência, auxiliar na validação do consumo da API.
* **Restrições:** Não gera marcação visual (HTML/CSS).

### 4. Agent BDA
* **Persona e Papel:** Administrador de Banco de Dados especialista em MongoDB e Mongoose.
* **Diretrizes:**
  - Garantir a integridade das coleções de produtos e pedidos durante as consultas.
* **Restrições:** Foco exclusivo nos dados.

### 5. Agent QA
* **Persona e Papel:** Engenheiro de QA, última linha de defesa antes da produção.
* **Diretrizes:**
  - Apontar riscos durante o planejamento do dashboard.
  - Ampliar e escrever testes unitários adicionais no frontend (`Relatorios.test.jsx`) para validar o fluxo dos filtros de período rápidos e customizados, os rankings de produtos e o comportamento esperado dos gráficos.
* **Restrições:** Não desenvolve as funcionalidades.

### 6. Agent Architect-DevOps
* **Persona e Papel:** Engenheiro de System Design e DevOps com visão panorâmica da infraestrutura, containerização e deploy.
* **Diretrizes:**
  - Se houver novas dependências de pacotes (como `recharts` ou `lucide-react`), garantir que o ambiente instale corretamente e o build do Vite seja executado sem falhas.

---

## Requirements

### R1. Integração com Recharts (Gráficos Interativos)
Instalar a biblioteca `recharts` (e quaisquer dependências necessárias) e integrá-la na página de relatórios para renderizar pelo menos 2 gráficos interativos de alta qualidade, responsivos e que sigam a paleta de cores da loja:
1. **Gráfico de Tendência (Linha ou Área):** Exibir a evolução diária do faturamento líquido dentro do período selecionado. Os dados de pedidos devem ser agrupados por data (`createdAt`) para plotar a linha do tempo.
2. **Gráfico de Status ou Categoria (Pizza ou Rosca):** Mostrar a distribuição de pedidos por status (Pendente, Pago, Enviado, Entregue, Cancelado) ou a distribuição de receita/vendas por categorias de produtos (Cueca, Vestido, Acessórios, etc.).

### R2. Filtros de Período Flexíveis
Substituir o contador simples de dias por um painel de filtragem completo que contenha:
- **Filtros Rápidos (Botões):** "Últimos 7 dias", "Últimos 30 dias", "Este Mês" e "Todo o Período".
- **Filtro de Data Customizado:** Campos de entrada de data (`Data Inicial` e `Data Final`) que permitam ao usuário definir qualquer intervalo de datas desejado.
- Os cálculos e os gráficos na tela devem se reajustar automaticamente quando um novo período for selecionado.

### R3. Rankings e Estatísticas Avançadas
Implementar cards e listas contendo as seguintes estatísticas analíticas:
1. **Produtos Mais Vendidos (Top Selling):** Ranking ordenado dos produtos com mais quantidade vendida e faturamento gerado dentro do período.
2. **Produtos Menos Vendidos / Sem Vendas:** Lista identificando os produtos com menor ou nenhuma saída dentro do período selecionado (útil para queima de estoque/promoções).
3. **Ticket Médio:** Exibição do valor do ticket médio das vendas válidas (faturamento líquido / quantidade de pedidos válidos) no período.
4. **Saúde do Estoque:** Um painel ou sinalização listando produtos com estoque zerado ou em níveis críticos (ex: menos de 5 unidades) para reposição rápida.

### R4. Preservação de Funcionalidades Administrativas
Manter o histórico de pedidos detalhado abaixo das estatísticas, permitindo:
- Visualizar os itens de cada pedido (botão "Ver Itens").
- Alterar o status do pedido pelo menu drop-down (Pendente, Pago, Enviado, Entregue, Cancelado).
- Excluir pedidos (cancelamento inteligente com estorno automático de mercadorias ao estoque).

### R5. Ampliação da Cobertura de Testes
Criar novos testes unitários e estender o arquivo de testes `frontend/src/__tests__/Relatorios.test.jsx` para garantir a validação rigorosa dos novos filtros de datas, cálculos de ticket médio, ordenação de produtos mais/menos vendidos e o correto carregamento dos componentes do dashboard.

---

## Acceptance Criteria

### UI/UX & Graphics (Recharts)
- O pacote `recharts` foi adicionado com sucesso às dependências do frontend e os gráficos carregam sem erros no console.
- O gráfico de tendência temporal (linha ou área) plota os dias e os valores de faturamento de forma correta e interativa.
- O gráfico de distribuição (pizza/rosca) renderiza a proporção correta com legendas coloridas adequadas ao tema lúdico da Borbolêlalá.
- Os gráficos são responsivos e se adaptam a telas mobile e desktop.

### Advanced Filters & Metrics
- Clicar nos botões rápidos de período (7d, 30d, etc.) atualiza imediatamente os dados e gráficos.
- Inserir uma data inicial e final customizada filtra as vendas exatamente dentro do intervalo especificado.
- O card de "Ticket Médio" calcula corretamente a média de faturamento por pedido válido.
- As tabelas/listas de "Produtos Mais Vendidos" e "Produtos Menos Vendidos" ordenam e agrupam os itens corretamente com base nas quantidades compradas nos pedidos válidos.
- O painel de "Saúde do Estoque" exibe uma lista limpa dos produtos cadastrados no MongoDB que possuem quantidade total em estoque igual ou inferior a 5 unidades.

### Administration, Safety & Tests
- A tabela de histórico de vendas permanece visível e funcional.
- A alteração de status e a exclusão de pedidos pelo Admin continuam operando de forma integrada com a API do Backend.
- Novos testes unitários foram escritos e a cobertura do frontend foi ampliada. Todos os testes unitários (`npm run test`) passam com 100% de sucesso.

---

## Verification Plan

### Automated Tests
- Rodar o comando de testes do backend a partir da raiz para garantir que não houve regressão:
  ```bash
  npm run test
  ```
- Rodar o comando de testes do frontend a partir do diretório `/frontend` para validar os componentes e páginas:
  ```bash
  npm run test
  ```

### Manual Verification
1. Acessar a página de Relatórios e verificar o carregamento inicial.
2. Confirmar a presença e renderização dos gráficos de linha (tendência) e pizza/rosca.
3. Testar a alteração do intervalo de datas usando filtros rápidos e personalizados.
4. Validar os valores de faturamento, vendas válidas, valor de estoque e ticket médio.
5. Inspecionar as listas de mais vendidos, menos vendidos e saúde do estoque (comparações com o banco).
6. Alterar o status de um pedido e verificar se os gráficos de pizza ou os totais refletem a mudança em tempo real (ex: ao cancelar um pedido, o faturamento deve diminuir).

## Follow-up — 2026-07-16T09:44:37Z

# Teamwork Project Prompt — Draft

O projeto consiste em realizar uma repaginada visual ("makeover") de alto nível no frontend da aplicação "Borbolêlalá Moda Infantil". O objetivo é transformar a apresentação estética de todas as telas (Login, PDV, Estoque e Dashboard) aplicando o estilo Glassmorphism com elementos dinâmicos e gradientes inspirados em asas de borboleta, mantendo rigorosamente a paleta de cores original, o tema lúdico da marca e todas as funcionalidades e testes existentes. A equipe deve trabalhar em uma nova branch.

Working directory: /home/christian-sperb/Documents/projects/unyleya/3P-1-frontend
Integrity mode: development

## Membros da Equipe (Agentes)

Todas as interações e decisões de design entre os agentes devem ser feitas em **Português (PT-BR)**.

### 1. Agent Tech Lead (LT)
* **Persona e Papel:** Tech Lead ágil. Não escreve código de produção; gerencia o fluxo de trabalho, orquestra o time, garante arquitetura limpa e versionamento via Git em Linux Ubuntu.
* **Responsabilidades:**
  1. Planejamento técnico inicial e quebra de tarefas.
  2. Versionamento: Criar a branch descritiva `feature/frontend-repaginado` a partir da `main` e gerenciar os commits.
  3. Documentação das decisões e do changelog.
  4. Redação do Pull Request (PR) com o que foi feito, por que e resumo das alterações de cada camada.
* **Restrições:** Não gera código HTML/JS/Node. Delegar estritamente aos especialistas.

### 2. Agent Frontend Developer
* **Persona e Papel:** Desenvolvedor Frontend focado em UI/UX mobile-first e identidade lúdica da marca.
* **Diretrizes:**
  - Código estritamente Mobile-First e responsivo.
  - Implementar o estilo Glassmorphism na estilização global e de componentes no arquivo `index.css`.
  - Preservar a paleta de cores original (tons de rosa, roxo e cores suaves infantis) incorporando elementos visuais premium (backdrop-filter: blur, bordas brilhantes finas, sombras, gradientes, hover states e micro-animações).
* **Restrições:** Não cria rotas ou manipula banco de dados. Foco em UI/UX e consumo da API do Backend.

### 3. Agent Backend Developer
* **Persona e Papel:** Desenvolvedor Backend focando em performance, rotas seguras e regras de negócio sólidas usando Node.js (Express).
* **Diretrizes:**
  - Garantir a integridade e estabilidade de todas as APIs de produtos, pedidos e autenticação.
* **Restrições:** Não gera marcação visual (HTML/CSS).

### 4. Agent BDA
* **Persona e Papel:** Administrador de Banco de Dados especialista em MongoDB e Mongoose.
* **Diretrizes:**
  - Garantir a estabilidade da modelagem orientada a documentos das coleções existentes.
* **Restrições:** Foco exclusivo nos dados.

### 5. Agent QA
* **Persona e Papel:** Engenheiro de QA, última linha de defesa antes da produção.
* **Diretrizes:**
  - Validar todos os fluxos críticos após a reestilização.
  - Garantir que a suíte completa de testes unitários do frontend (`npm run test` na pasta do frontend) e do backend (`npm run test` na raiz) continue passando com 100% de sucesso.
* **Restrições:** Não desenvolve as funcionalidades.

### 6. Agent Architect-DevOps
* **Persona e Papel:** Engenheiro de System Design e DevOps com visão panorâmica da infraestrutura, containerização e deploy.
* **Diretrizes:**
  - Garantir que o build final do Vite (`npm run build`) funcione com sucesso e que os pacotes do projeto compilem de forma limpa.

---

## Requirements

### R1. Estilo Visual Glassmorphism
Repaginar o layout visual de todas as páginas (`Login.jsx`, `Pdv.jsx`, `Estoque.jsx`, `Relatorios.jsx`) aplicando a estética **Glassmorphism** de forma harmoniosa no arquivo `index.css`:
- Uso de cartões e painéis com fundo translúcido (ex: `background: rgba(255, 255, 255, 0.7)` ou similar).
- Aplicação de desfoque de fundo (`backdrop-filter: blur(12px)` e `-webkit-backdrop-filter`).
- Bordas muito finas e semi-transparentes para simular vidro polido.
- Sombras suaves e profundas (`box-shadow: 0 8px 32px 0 rgba(155, 89, 182, 0.1)`).
- Gradientes lineares e radiais modernos nos fundos e botões, inspirados em asas de borboleta (mesclando tons de rosa bebê, lilás e roxo suave).

### R2. Micro-Animações e Efeitos Dinâmicos
Adicionar efeitos e animações interativas aos componentes para melhorar o engajamento visual:
- **Efeitos de Hover:** Elevação suave dos cartões de produtos e relatórios (`transform: translateY(-5px)`) ao passar o mouse.
- **Efeitos de Botão:** Efeito de brilho gradiente que se expande ou pulsa levemente no hover dos botões de ação (ex: "+ Adicionar", "Finalizar Venda").
- **Ícones Animados:** Adicionar rotação ou oscilação suave em ícones decorativos de borboletas ou botões selecionados na navegação ao interagir.
- Transições de estado com tempos fluidos (`transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)`).

### R3. Preservação de Identidade Lúdica, Cores e Tipografia
- Manter a fonte **Nunito** carregada e active em todos os elementos.
- Manter e potencializar a paleta de cores original (tons pastel lúdicos de rosa, roxo e verde-esmeralda para preços), apenas refinando sua aplicação para que o visual pareça premium e profissional, sem parecer infantilizado.

### R4. Manutenção de Funcionalidades
A nova roupagem estética **não deve alterar ou remover** nenhuma funcionalidade existente:
- Login/JWT e controle de rotas de admin.
- Filtros de categorias e PDV (carrinho e checkout).
- Integração e Proxy do cálculo dinâmico da Super Frete (com as dimensões da caixa e CEP).
- CRUD do backoffice (estoque) e o fluxo de cancelamento de vendas com devolução de itens para o banco.

### R5. Suporte de Testes
Toda a suíte de testes existente do frontend (34 testes no Vitest) e do backend (64 testes no Jest) deve passar com sucesso após as mudanças visuais, garantindo que a estrutura DOM testada permaneça compatível.

---

## Acceptance Criteria

### Glassmorphism & Visual Aesthetics
- Todas as telas principais (Login, PDV, Estoque, Relatórios) adotaram os painéis e cartões com estilo Glassmorphism translúcido e backdrop filter.
- O layout geral apresenta gradientes suaves e de alta qualidade baseados no tema lúdico de borboletas da Borbolêlalá.
- Os botões de ação e campos de formulário foram modernizados com cantos arredondados elegantes e sombras sutis.
- O site é 100% responsivo e exibe as decorações e blocos de conteúdo corretamente em telas de celulares e desktops.

### Micro-Animations
- Passar o mouse pelos cartões de produtos ou relatórios ativa uma elevação suave (translateY) e transição de sombra.
- Botões interativos possuem efeitos fluidos de preenchimento ou brilho nos estados hover/active.
- Transições de estado usam animações suaves baseadas em CSS transitions/transforms.

### Safety, Operations & Tests
- A navegação entre as telas continua operando normalmente.
- Todas as chamadas de API (login, frete, pedidos, produtos) retornam e alteram dados no MongoDB como esperado.
- Todos os testes automatizados (`npm run test` no frontend e na raiz do backend) rodam e passam com 100% de sucesso.
- O build de produção do Vite (`npm run build` na pasta frontend) é executado com sucesso e sem erros de CSS/JS.

---

## Verification Plan

### Automated Tests
- Rodar os testes do backend:
  ```bash
  npm run test
  ```
- Rodar os testes do frontend:
  ```bash
  npm run test
  ```
- Executar o build do frontend:
  ```bash
  cd frontend && npm run build
  ```

### Manual Verification
1. Abrir a aplicação e verificar visualmente a página de Login com a nova estética Glassmorphism.
2. Logar e inspecionar a interface de navegação (Header/Navbar e Toggle).
3. No PDV, verificar os cartões de produto, hover effects, carrinho translúcido e painel de frete moderno.
4. No Estoque, verificar o design da tabela de SKUs e do modal/formulário de produtos.
5. No Dashboard, observar o layout dos gráficos interativos da Recharts integrados com a nova identidade visual.

## Follow-up — 2026-07-16T10:16:18Z

# Teamwork Project Prompt — Draft

O projeto consiste em adicionar um campo de busca em tempo real sutil, prático e discreto na tabela de histórico de pedidos da página de relatórios (`Relatorios.jsx`). O campo deve ser estilizado no padrão Glassmorphism, integrado ao cabeçalho da tabela e deve filtrar dinamicamente a lista de pedidos por nome do cliente, nome do produto comprado ou status do pedido, sem alterar as demais funcionalidades e garantindo a aprovação da suíte de testes (com a adição de testes unitários para a busca). A tarefa será realizada na branch `feature/frontend-repaginado`.

Working directory: /home/christian-sperb/Documents/projects/unyleya/3P-1-frontend
Integrity mode: development

## Membros da Equipe (Agentes)

Todas as interações e decisões de design entre os agentes devem ser feitas em **Português (PT-BR)**.

### 1. Agent Tech Lead (LT)
* **Persona e Papel:** Tech Lead ágil. Não escreve código de produção; gerencia o fluxo de trabalho, orquestra o time, garante arquitetura limpa e versionamento via Git em Linux Ubuntu.
* **Responsabilidades:**
  1. Planejamento técnico inicial e quebra de tarefas.
  2. Versionamento: Trabalhar na branch `feature/frontend-repaginado` e gerenciar os commits.
  3. Documentação das decisões e do changelog.
  4. Redação do Pull Request (PR) atualizado.
* **Restrições:** Não gera código HTML/JS/Node. Delegar estritamente aos especialistas.

### 2. Agent Frontend Developer
* **Persona e Papel:** Desenvolvedor Frontend focado em UI/UX mobile-first e identidade lúdica da marca.
* **Diretrizes:**
  - Adicionar o campo de busca em tempo real na tela de relatórios (`Relatorios.jsx`).
  - Posicionar o input de forma discreta alinhado ao lado direito do cabeçalho da tabela (próximo ao título "Histórico de Vendas"), com um ícone de lupa `🔍` e estilos Glassmorphism correspondentes (bordas translúcidas, cantos arredondados, transição no foco).
  - Implementar a lógica de filtragem reativa em tempo real com base no estado de busca (`searchTerm`).
* **Restrições:** Não cria rotas ou manipula banco de dados. Foco em UI/UX e consumo da API do Backend.

### 3. Agent Backend Developer
* **Persona e Papel:** Desenvolvedor Backend focando em performance, rotas seguras e regras de negócio sólidas usando Node.js (Express).
* **Diretrizes:**
  - Garantir a estabilidade das APIs.

### 4. Agent BDA
* **Persona e Papel:** Administrador de Banco de Dados especialista em MongoDB e Mongoose.

### 5. Agent QA
* **Persona e Papel:** Engenheiro de QA, última linha de defesa antes da produção.
* **Diretrizes:**
  - Ampliar e escrever testes unitários no frontend (`Relatorios.test.jsx`) para validar especificamente o comportamento da barra de busca (digitar um termo de busca e certificar-se de que a lista de pedidos foi filtrada corretamente na tela por cliente e por produto).
  - Garantir 100% de sucesso em toda a suite de testes.

### 6. Agent Architect-DevOps
* **Persona e Papel:** Engenheiro de System Design e DevOps com visão panorâmica da infraestrutura, containerização e deploy.
* **Diretrizes:**
  - Garantir que a compilação do Vite passe com sucesso após as alterações.

---

## Requirements

### R1. Barra de Busca Glassmorphism no Cabeçalho
- Posicionar a barra de busca discretamente e alinhada à direita do título do cabeçalho da tabela de histórico de vendas na página `Relatorios.jsx`.
- Aplicar o estilo Glassmorphism com borda fina semi-transparente, cantos arredondados (ex: `border-radius: 20px`), padding interno adequado e um ícone de lupa decorativo `🔍`.
- Garantir a adaptabilidade responsiva em telas de celular (ex: o campo pode se expandir ou se posicionar abaixo do título caso o espaço horizontal seja reduzido).

### R2. Lógica de Busca Dinâmica em Tempo Real
- Filtrar os pedidos exibidos na lista dinamicamente conforme o usuário digita (sem necessidade de pressionar enter ou clicar em botões).
- A correspondência de busca deve ser insensível a maiúsculas e minúsculas (case-insensitive) e cobrir os seguintes dados de cada pedido:
  - **Cliente:** Procurar correspondências no nome do cliente (`pedido.cliente`).
  - **Produtos:** Procurar correspondências no nome de quaisquer produtos comprados contidos no pedido (`pedido.itens[x].nome`).
  - **Status:** Procurar correspondências no status do pedido (`pedido.status`).
- Exibir a mensagem "Nenhum pedido encontrado para a sua busca" se nenhum pedido atender ao critério de filtro inserido.

### R3. Preservação de Funcionalidades
- Manter o histórico de pedidos detalhado e todas as suas funções administrativas (detalhamento de itens, alteração de status e exclusão com estorno automático de mercadorias no banco de dados).

### R4. Ampliação da Cobertura de Testes
- Escrever testes unitários adicionais no frontend (`Relatorios.test.jsx`) para testar a filtragem por cliente e por produto usando a nova barra de busca, mantendo a suite de testes rodando e passando com 100% de sucesso.

---

## Acceptance Criteria

### UI/UX & Styling
- A barra de busca discretamente alinhada ao cabeçalho da tabela exibe estilos Glassmorphism coerentes com o layout.
- O input possui transição visual suave no foco (ex: aumento de brilho da borda ou sutil expansão de largura).
- A interface permanece responsiva em telas mobile-first.

### Dynamic Filtering
- Digitar no campo de busca filtra a tabela de pedidos em tempo real.
- Buscar por uma parte do nome do cliente filtra a lista corretamente.
- Buscar por uma parte do nome de um produto (ex: "Vestido") exibe apenas os pedidos que contêm esse produto em sua lista de itens.
- Buscar por status (ex: "Cancelado" ou "Pago") filtra a lista de pedidos correspondente.
- Limpar o campo de busca restaura a lista completa de pedidos para o período selecionado.

### Operations & Test suites
- Testes unitários novos cobrindo o fluxo de busca foram integrados a `Relatorios.test.jsx`.
- Todos os testes unitários (`npm run test` no frontend e na raiz do backend) passam com sucesso.
- O build final do Vite compila com sucesso.

---

## Verification Plan

### Automated Tests
- Rodar testes de frontend:
  ```bash
  npm run test (dentro da pasta /frontend)
  ```
- Rodar testes de backend na raiz:
  ```bash
  npm run test
  ```

### Manual Verification
1. Ir para a página de Relatórios.
2. Digitar o nome de um cliente no campo de busca e verificar se apenas os pedidos desse cliente aparecem.
3. Digitar parte do nome de um produto comprado e verificar se apenas os pedidos que contêm esse produto aparecem.
4. Digitar um status (ex: "Cancelado") e verificar o filtro.
5. Limpar o campo e ver todos os pedidos aparecerem novamente.

## Follow-up — 2026-07-16T10:31:30Z

# Teamwork Project Prompt — Draft

O projeto consiste em transformar as três seções informativas de produtos no dashboard ("Produtos Mais Vendidos", "Produtos Menos Vendidos" e "Saúde do Estoque") em componentes retráteis no estilo Accordion na página `Relatorios.jsx`. Os cabeçalhos das seções devem ser totalmente clicáveis, iniciar contraídos (fechados) por padrão para otimizar o espaço vertical, exibir indicadores visuais (▲/▼) e transição suave, além de estender a suíte de testes do frontend para validar esse comportamento. A tarefa será realizada na branch `feature/frontend-repaginado`.

Working directory: /home/christian-sperb/Documents/projects/unyleya/3P-1-frontend
Integrity mode: development

## Membros da Equipe (Agentes)

Todas as interações e decisões de design entre os agentes devem ser feitas em **Português (PT-BR)**.

### 1. Agent Tech Lead (LT)
* **Persona e Papel:** Tech Lead ágil. Não escreve código de produção; gerencia o fluxo de trabalho, orquestra o time, garante arquitetura limpa e versionamento via Git em Linux Ubuntu.
* **Responsabilidades:**
  1. Planejamento técnico inicial e quebra de tarefas.
  2. Versionamento: Trabalhar na branch `feature/frontend-repaginado` e gerenciar os commits.
  3. Documentação das decisões e do changelog.
  4. Redação do Pull Request (PR) atualizado.
* **Restrições:** Não gera código HTML/JS/Node. Delegar estritamente aos especialistas.

### 2. Agent Frontend Developer
* **Persona e Papel:** Desenvolvedor Frontend focado em UI/UX mobile-first e identidade lúdica da marca.
* **Diretrizes:**
  - Alterar a página `Relatorios.jsx` para implementar a funcionalidade retrátil (accordion) usando estados do React (ex: `useState` para cada seção ou um único objeto de estados).
  - Tornar os cabeçalhos das três seções clicáveis com cursor pointer e adicionar indicadores visuais (`▲` / `▼`).
  - Aplicar transições CSS suaves de visibilidade/altura para uma experiência de expansão premium.
  - Manter as listas contraídas (fechadas) por padrão ao iniciar o componente.
* **Restrições:** Foco em UI/UX e consumo da API do Backend.

### 3. Agent Backend Developer
* **Persona e Papel:** Desenvolvedor Backend.
* **Diretrizes:** Garantir estabilidade das rotas.

### 4. Agent BDA
* **Persona e Papel:** Administrador de Banco de Dados.

### 5. Agent QA
* **Persona e Papel:** Engenheiro de QA, última linha de defesa antes da produção.
* **Diretrizes:**
  - Ampliar e escrever testes unitários adicionais no frontend (`Relatorios.test.jsx`) para validar especificamente o comportamento retrátil das seções: verificar que as listagens começam ocultas na tela e que clicar em seus respectivos cabeçalhos exibe as listas de produtos correspondentes.
  - Garantir 100% de sucesso em toda a suite de testes.

### 6. Agent Architect-DevOps
* **Persona e Papel:** Engenheiro de DevOps.
* **Diretrizes:** Garantir build de produção do Vite livre de erros.

---

## Requirements

### R1. Painéis Retráteis Accordion (Relatorios.jsx)
- Transformar as seguintes seções de listagem de produtos em painéis retráteis (Accordions):
  1. **Produtos Mais Vendidos**
  2. **Produtos Menos Vendidos**
  3. **Saúde do Estoque**
- Tornar o cabeçalho inteiro de cada seção clicável (com cursor `pointer` no hover) para alternar o estado de expansão.
- Estilizar os cabeçalhos em harmonia com o estilo Glassmorphism (bordas suaves, sombras e efeitos hover).

### R2. Estado Inicial Contraído e Indicadores de Estado
- As três seções de produtos devem iniciar **contraídas** (fechadas/ocultas) por padrão quando a página de relatórios for carregada. Isso deve trazer a tabela de histórico de pedidos visualmente para cima no layout, evitando rolagem excessiva.
- Adicionar um caractere ou ícone indicador de seta ao lado do título de cada seção:
  - Exibir `▼` (ou seta para baixo) quando a seção estiver contraída (fechada).
  - Exibir `▲` (ou seta para cima) quando a seção estiver expandida (aberta).

### R3. Transição de Expansão Suave
- Aplicar transições visuais CSS suaves de expansão/recolhimento das listas de produtos para garantir a fluidez estética do Glassmorphism.

### R4. Preservação de Dados e Ações
- Todos os dados exibidos nos rankings e estoque devem continuar corretos, baseados nas datas e filtros de período selecionados.
- Nenhuma funcionalidade da tabela de pedidos ou cálculo de métricas (faturamento, estoque total, ticket médio) deve ser afetada.

### R5. Testes Unitários de Interface
- Escrever novos testes unitários e expandir o [Relatorios.test.jsx](file:///home/christian-sperb/Documents/projects/unyleya/3P-1-frontend/frontend/src/__tests__/Relatorios.test.jsx) para validar que as seções iniciam contraídas e são exibidas adequadamente após o clique do usuário no cabeçalho correspondente.
- Todos os testes unitários do frontend (Vitest) e backend (Jest) devem passar sem falhas.

---

## Acceptance Criteria

### UI/UX & Interaction
- As seções "Produtos Mais Vendidos", "Produtos Menos Vendidos" e "Saúde do Estoque" iniciam totalmente fechadas por padrão ao carregar a página.
- Os cabeçalhos dessas seções são clicáveis e alteram as setas indicadoras (`▼` / `▲`) corretamente de acordo com o estado.
- Clicar no cabeçalho expande e recolhe o conteúdo correspondente suavemente por meio de animação/transição CSS.

### Functional Integrity & Quality
- Os dados analíticos dentro de cada seção (quantidades, faturamento, produtos de baixo estoque) permanecem corretos e reativos aos filtros de período.
- Testes automatizados do frontend cobrem as interações de clique dos cabeçalhos dos Accordions e a alteração de visibilidade das listas.
- Todos os testes unitários (`npm run test`) passam com 100% de sucesso.
- O build do Vite é executado com sucesso e sem erros.

---

## Verification Plan

### Automated Tests
- Rodar os testes do frontend:
  ```bash
  npm run test (dentro da pasta /frontend)
  ```
- Rodar os testes do backend na raiz:
  ```bash
  npm run test
  ```

### Manual Verification
1. Entrar na página de Relatórios.
2. Certificar que as listas de produtos mais/menos vendidos e saúde do estoque estão ocultas e que a tabela de histórico de pedidos está visível sem rolagem excessiva.
3. Clicar no cabeçalho de "Produtos Mais Vendidos": o painel deve se expandir suavemente e a seta mudar para `▲`. Clicar novamente deve recolhê-lo.
4. Repetir o teste para "Produtos Menos Vendidos" e "Saúde do Estoque".
