import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Relatorios from '../pages/Relatorios';
import { vi } from 'vitest';

// 1. Mock do React Router
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockedNavigate };
});

// 2. Mock do CardResumo
vi.mock('../components/CardResumo', () => ({
    default: ({ titulo, valor }) => (
        <div data-testid="card-resumo">
            <h3>{titulo}</h3>
            <p>{valor}</p>
        </div>
    )
}));

// 3. Mock do Recharts para evitar ResizeObserver undefined e erros de renderização
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    AreaChart: ({ children }) => <div data-testid="area-chart">{children}</div>,
    Area: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />,
    PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
    Pie: ({ children }) => <div data-testid="pie">{children}</div>,
    Cell: () => <div />,
    Legend: () => <div />
}));

// 4. Mock do Fetch Global e Variáveis de Ambiente
global.fetch = vi.fn();
import.meta.env.VITE_API_URL = 'http://localhost:3000';

describe('Componente Relatorios - Testes de Dashboard', () => {

    const hoje = new Date().toISOString();

    const mockProdutos = [
        { id: 1, nome: 'Produto A', quantidade: 10, preco: 50 }, // Total Custo: 500
        { id: 2, nome: 'Produto B', quantidade: 5, preco: 100 }  // Total Custo: 500 (Soma Estoque: 1000)
    ];

    const mockPedidos = [
        {
            _id: 'ped1',
            cliente: 'Christian',
            totalFinal: 300,
            status: 'Pago',
            createdAt: hoje,
            itens: [{ quantidade: 2, nome: 'Produto A', precoUnitario: 100, subtotal: 200 }]
        },
        {
            _id: 'ped2',
            cliente: 'Maria',
            totalFinal: 150,
            status: 'Cancelado',
            createdAt: hoje,
            itens: []
        }
    ];

    beforeEach(() => {
        vi.resetAllMocks();
        localStorage.setItem('token', 'token-valido');

        fetch.mockImplementation((url, options) => {
            if (options && options.method === 'DELETE') {
                return Promise.resolve({ ok: true, json: async () => ({ mensagem: 'Excluído com sucesso' }) });
            }
            if (url.includes('/produtos')) {
                return Promise.resolve({ ok: true, json: async () => mockProdutos });
            }
            if (url.includes('/pedidos')) {
                return Promise.resolve({ ok: true, json: async () => mockPedidos });
            }
        });
    });

    it('Deve renderizar os cards calculando corretamente o estoque e o faturamento', async () => {
        render(<BrowserRouter><Relatorios /></BrowserRouter>);

        await waitFor(() => {
            expect(screen.queryByText('A carregar histórico...')).not.toBeInTheDocument();
        });

        // VERIFICAÇÕES MATEMÁTICAS:
        // 1. Estoque = 10*50 + 5*100 = 1000
        expect(screen.getByText('R$ 1000.00')).toBeInTheDocument();

        // 2. Faturamento = Apenas o pedido 'Pago' de 300 (O de 150 é cancelado)
        expect(screen.getAllByText('R$ 300.00')[0]).toBeInTheDocument();

        // 3. Vendas Válidas = Apenas 1 (O de 150 é cancelado)
        expect(screen.getByText('1', { exact: true })).toBeInTheDocument();
    });

    it('Deve listar os pedidos e ocultar o pedido cancelado da soma total (renderizando opaco)', async () => {
        render(<BrowserRouter><Relatorios /></BrowserRouter>);
        await screen.findByText('Christian');

        expect(screen.getByText('Christian')).toBeInTheDocument();
        expect(screen.getByText('Maria')).toBeInTheDocument();

        expect(screen.getByText('R$ 300.00', { selector: 'td' })).toBeInTheDocument();
        expect(screen.getByText('R$ 150.00', { selector: 'td' })).toBeInTheDocument();
    });

    it('Deve expandir e exibir os itens do pedido ao clicar em "Ver Itens"', async () => {
        render(<BrowserRouter><Relatorios /></BrowserRouter>);
        await screen.findByText('Christian');

        expect(screen.queryByText(/Detalhes do Pedido/i)).not.toBeInTheDocument();

        const botoesVerItens = screen.getAllByText('▼ Ver Itens');
        fireEvent.click(botoesVerItens[0]);

        expect(screen.getByText(/Detalhes do Pedido/i)).toBeInTheDocument();
        expect(screen.getByText(/2x/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Produto A/i)[0]).toBeInTheDocument();
    });

    it('Deve alterar o status de um pedido e disparar um fetch (PUT)', async () => {
        vi.spyOn(window, 'alert').mockImplementation(() => { });

        render(<BrowserRouter><Relatorios /></BrowserRouter>);
        await screen.findByText('Christian');
        const selectsStatus = screen.getAllByRole('combobox');

        fireEvent.change(selectsStatus[0], { target: { value: 'Enviado' } });

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/pedidos/ped1/status'),
                expect.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify({ status: 'Enviado' })
                })
            );
        });
    });

    it('Deve alterar as datas do filtro ao clicar nos botões rápidos', async () => {
        render(<BrowserRouter><Relatorios /></BrowserRouter>);
        await screen.findByText('Christian');

        const btn30 = screen.getByText('Últimos 30 dias');
        fireEvent.click(btn30);

        expect(btn30).toHaveClass('ativo');
    });

    it('Deve alterar as datas do filtro ao preencher os inputs de data', async () => {
        render(<BrowserRouter><Relatorios /></BrowserRouter>);
        await screen.findByText('Christian');

        const inputInicial = screen.getByLabelText('Data Inicial');
        const inputFinal = screen.getByLabelText('Data Final');

        fireEvent.change(inputInicial, { target: { value: '2026-07-01' } });
        fireEvent.change(inputFinal, { target: { value: '2026-07-10' } });

        expect(inputInicial.value).toBe('2026-07-01');
        expect(inputFinal.value).toBe('2026-07-10');
    });

    it('Deve excluir um pedido e disparar um fetch (DELETE)', async () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        render(<BrowserRouter><Relatorios /></BrowserRouter>);
        await screen.findByText('Christian');

        const botoesDeletar = screen.getAllByRole('button', { name: /excluir/i });
        fireEvent.click(botoesDeletar[0]);

        expect(confirmSpy).toHaveBeenCalled();
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/pedidos/ped1'),
                expect.objectContaining({
                    method: 'DELETE'
                })
            );
        });

        confirmSpy.mockRestore();
    });

    it('Deve redirecionar para o login se o usuário não possuir token', async () => {
        localStorage.clear();
        render(<BrowserRouter><Relatorios /></BrowserRouter>);

        await waitFor(() => {
            expect(mockedNavigate).toHaveBeenCalledWith('/login');
        });
    });

    it('Deve exibir mensagem informando quando não há pedidos no período', async () => {
        fetch.mockImplementation((url) => {
            if (url.includes('/produtos')) return Promise.resolve({ ok: true, json: async () => mockProdutos });
            if (url.includes('/pedidos')) return Promise.resolve({ ok: true, json: async () => [] });
        });

        render(<BrowserRouter><Relatorios /></BrowserRouter>);

        const mensagemVazia = await screen.findByText('Nenhuma venda registada neste período.');
        expect(mensagemVazia).toBeInTheDocument();
    });

    it('Deve exibir alerta se o servidor recusar a atualização do status (!resposta.ok)', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

        render(<BrowserRouter><Relatorios /></BrowserRouter>);
        await screen.findByText('Christian');
        fetch.mockResolvedValueOnce({ ok: false });

        const selectsStatus = screen.getAllByRole('combobox');

        fireEvent.change(selectsStatus[0], { target: { value: 'Cancelado' } });

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Erro ao atualizar o status no servidor.');
        });
    });

    it('Deve exibir alerta se houver erro de rede (catch) ao tentar atualizar o status', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        render(<BrowserRouter><Relatorios /></BrowserRouter>);
        await screen.findByText('Christian');

        fetch.mockRejectedValueOnce(new Error('Falha de Rede'));

        const selectsStatus = screen.getAllByRole('combobox');
        fireEvent.change(selectsStatus[0], { target: { value: 'Entregue' } });

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Erro de conexão ao tentar atualizar.');
            expect(consoleSpy).toHaveBeenCalled();
        });

        consoleSpy.mockRestore();
    });

    it('Deve filtrar a lista de vendas por cliente de maneira case-insensitive na busca', async () => {
        render(<BrowserRouter><Relatorios /></BrowserRouter>);
        await screen.findByText('Christian');

        const inputBusca = screen.getByPlaceholderText(/Buscar por cliente, produto ou status.../i);

        // Busca por "christian"
        fireEvent.change(inputBusca, { target: { value: 'christian' } });
        expect(screen.getByText('Christian')).toBeInTheDocument();
        expect(screen.queryByText('Maria')).not.toBeInTheDocument();

        // Busca por "maria"
        fireEvent.change(inputBusca, { target: { value: 'MARIA' } });
        expect(screen.getByText('Maria')).toBeInTheDocument();
        expect(screen.queryByText('Christian')).not.toBeInTheDocument();
    });

    it('Deve filtrar a lista de vendas por produto do item de maneira case-insensitive na busca', async () => {
        render(<BrowserRouter><Relatorios /></BrowserRouter>);
        await screen.findByText('Christian');

        const inputBusca = screen.getByPlaceholderText(/Buscar por cliente, produto ou status.../i);

        // Busca por "produto a" que está no item do pedido do Christian
        fireEvent.change(inputBusca, { target: { value: 'produto a' } });
        expect(screen.getByText('Christian')).toBeInTheDocument();
        expect(screen.queryByText('Maria')).not.toBeInTheDocument();
    });

    it('Deve filtrar a lista de vendas por status do pedido de maneira case-insensitive na busca', async () => {
        render(<BrowserRouter><Relatorios /></BrowserRouter>);
        await screen.findByText('Christian');

        const inputBusca = screen.getByPlaceholderText(/Buscar por cliente, produto ou status.../i);

        // Busca por status "Cancelado"
        fireEvent.change(inputBusca, { target: { value: 'cancelado' } });
        expect(screen.getByText('Maria')).toBeInTheDocument();
        expect(screen.queryByText('Christian')).not.toBeInTheDocument();
    });

    it('Deve mostrar a mensagem de busca vazia se nenhum pedido corresponder', async () => {
        render(<BrowserRouter><Relatorios /></BrowserRouter>);
        await screen.findByText('Christian');

        const inputBusca = screen.getByPlaceholderText(/Buscar por cliente, produto ou status.../i);

        // Termo que não casa com nada
        fireEvent.change(inputBusca, { target: { value: 'Inexistente' } });
        
        expect(screen.getByText('Nenhum pedido encontrado para a sua busca')).toBeInTheDocument();
        expect(screen.queryByText('Christian')).not.toBeInTheDocument();
        expect(screen.queryByText('Maria')).not.toBeInTheDocument();
    });

    it('Deve filtrar a lista de vendas por trechos parciais case-insensitive (cliente, produto, status)', async () => {
        render(<BrowserRouter><Relatorios /></BrowserRouter>);
        await screen.findByText('Christian');

        const inputBusca = screen.getByPlaceholderText(/Buscar por cliente, produto ou status.../i);

        // 1. Trecho parcial de cliente: "ist" para "Christian"
        fireEvent.change(inputBusca, { target: { value: 'ist' } });
        expect(screen.getByText('Christian')).toBeInTheDocument();
        expect(screen.queryByText('Maria')).not.toBeInTheDocument();

        // 2. Trecho parcial de produto: "uto a" para "Produto A"
        fireEvent.change(inputBusca, { target: { value: 'uto a' } });
        expect(screen.getByText('Christian')).toBeInTheDocument();
        expect(screen.queryByText('Maria')).not.toBeInTheDocument();

        // 3. Trecho parcial de status: "ncel" para "Cancelado"
        fireEvent.change(inputBusca, { target: { value: 'ncel' } });
        expect(screen.getByText('Maria')).toBeInTheDocument();
        expect(screen.queryByText('Christian')).not.toBeInTheDocument();
    });

    it('Deve gerenciar o estado do accordion via clique e teclado com atributos aria corretos e visibilidade', async () => {
        const { container } = render(<BrowserRouter><Relatorios /></BrowserRouter>);

        await waitFor(() => {
            expect(screen.queryByText('A carregar histórico...')).not.toBeInTheDocument();
        });

        // 1. Buscar os botões de controle dentro dos headings
        const maisVendidosBtn = screen.getByRole('button', { name: /Produtos Mais Vendidos/i });
        const menosVendidosBtn = screen.getByRole('button', { name: /Produtos Menos Vendidos/i });
        const saudeEstoqueBtn = screen.getByRole('button', { name: /Saúde do Estoque/i });

        // Obter os containers do card correspondentes
        const maisVendidosCard = maisVendidosBtn.closest('.card-lista');
        const menosVendidosCard = menosVendidosBtn.closest('.card-lista');
        const saudeEstoqueCard = saudeEstoqueBtn.closest('.card-lista');

        const maisVendidosContent = maisVendidosCard.querySelector('.accordion-content');
        const menosVendidosContent = menosVendidosCard.querySelector('.accordion-content');
        const saudeEstoqueContent = saudeEstoqueCard.querySelector('.accordion-content');

        // 2. Verificar que os botões têm aria-expanded="false" por padrão
        expect(maisVendidosBtn).toHaveAttribute('aria-expanded', 'false');
        expect(menosVendidosBtn).toHaveAttribute('aria-expanded', 'false');
        expect(saudeEstoqueBtn).toHaveAttribute('aria-expanded', 'false');

        // 3. Verificar que as listas internas correspondentes não têm a classe 'expanded'
        expect(maisVendidosContent).not.toHaveClass('expanded');
        expect(menosVendidosContent).not.toHaveClass('expanded');
        expect(saudeEstoqueContent).not.toHaveClass('expanded');

        // 4. Testar clique em "Produtos Mais Vendidos" -> expande
        fireEvent.click(maisVendidosBtn);
        expect(maisVendidosBtn).toHaveAttribute('aria-expanded', 'true');
        expect(maisVendidosContent).toHaveClass('expanded');

        // Garantir que as outras continuam fechadas
        expect(menosVendidosBtn).toHaveAttribute('aria-expanded', 'false');
        expect(menosVendidosContent).not.toHaveClass('expanded');

        // 5. Testar clique novamente -> colapsa
        fireEvent.click(maisVendidosBtn);
        expect(maisVendidosBtn).toHaveAttribute('aria-expanded', 'false');
        expect(maisVendidosContent).not.toHaveClass('expanded');

        // 6. Testar interação via teclado (tecla de Espaço) em "Produtos Menos Vendidos" -> expande
        fireEvent.keyDown(menosVendidosBtn, { key: ' ' });
        expect(menosVendidosBtn).toHaveAttribute('aria-expanded', 'true');
        expect(menosVendidosContent).toHaveClass('expanded');

        // 7. Testar interação via teclado (tecla Enter) em "Produtos Menos Vendidos" -> colapsa
        fireEvent.keyDown(menosVendidosBtn, { key: 'Enter' });
        expect(menosVendidosBtn).toHaveAttribute('aria-expanded', 'false');
        expect(menosVendidosContent).not.toHaveClass('expanded');

        // 8. Testar interação via teclado em "Saúde do Estoque" -> expande
        fireEvent.keyDown(saudeEstoqueBtn, { key: 'Enter' });
        expect(saudeEstoqueBtn).toHaveAttribute('aria-expanded', 'true');
        expect(saudeEstoqueContent).toHaveClass('expanded');
    });

    it('Deve exibir estados vazios nos accordions quando não há dados correspondentes', async () => {
        fetch.mockImplementation((url) => {
            if (url.includes('/produtos')) return Promise.resolve({ ok: true, json: async () => [] });
            if (url.includes('/pedidos')) return Promise.resolve({ ok: true, json: async () => [] });
        });

        render(<BrowserRouter><Relatorios /></BrowserRouter>);

        await waitFor(() => {
            expect(screen.queryByText('A carregar histórico...')).not.toBeInTheDocument();
        });

        // 1. Mais Vendidos
        const maisVendidosBtn = screen.getByRole('button', { name: /Produtos Mais Vendidos/i });
        fireEvent.click(maisVendidosBtn);
        expect(screen.getByText('Nenhuma venda registrada no período.')).toBeInTheDocument();

        // 2. Menos Vendidos
        const menosVendidosBtn = screen.getByRole('button', { name: /Produtos Menos Vendidos/i });
        fireEvent.click(menosVendidosBtn);
        expect(screen.getByText('Nenhum produto cadastrado.')).toBeInTheDocument();

        // 3. Saúde do Estoque
        const saudeEstoqueBtn = screen.getByRole('button', { name: /Saúde do Estoque/i });
        fireEvent.click(saudeEstoqueBtn);
        expect(screen.getByText('Todos os produtos com estoque saudável!')).toBeInTheDocument();
    });

    it('Demonstra comportamento inadequado de toggle sob cliques múltiplos consecutivos (updater não-funcional)', async () => {
        render(<BrowserRouter><Relatorios /></BrowserRouter>);

        await waitFor(() => {
            expect(screen.queryByText('A carregar histórico...')).not.toBeInTheDocument();
        });

        const maisVendidosBtn = screen.getByRole('button', { name: /Produtos Mais Vendidos/i });
        const maisVendidosCard = maisVendidosBtn.closest('.card-lista');
        const maisVendidosContent = maisVendidosCard.querySelector('.accordion-content');

        // Estado inicial: fechado
        expect(maisVendidosBtn).toHaveAttribute('aria-expanded', 'false');
        expect(maisVendidosContent).not.toHaveClass('expanded');

        // Dispara dois cliques seguidos. No JSDOM/Testing Library, cada fireEvent.click
        // é executado dentro de um bloco act() implicitamente, limpando a fila e re-renderizando.
        // Portanto, ele re-renderiza como aberto antes de receber o segundo clique,
        // fazendo com que o segundo clique com sucesso feche o accordion novamente.
        fireEvent.click(maisVendidosBtn);
        fireEvent.click(maisVendidosBtn);

        // No ambiente RTL, o comportamento síncrono faz com que volte a ficar fechado.
        // Em um navegador real sob cliques extremamente rápidos (onde a fila do React não
        // atualizou a closure a tempo), isso poderia travar no estado aberto.
        expect(maisVendidosBtn).toHaveAttribute('aria-expanded', 'false');
        expect(maisVendidosContent).not.toHaveClass('expanded');
    });

    it('Deve calcular corretamente o estoque mesmo com tipos mistos (string e undefined)', async () => {
        const mockProdutosMistificados = [
            { id: 1, nome: 'Produto A', quantidade: '10', preco: '50' }, // 500
            { id: 2, nome: 'Produto B', quantidade: 5, preco: undefined }, // 0
            { id: 3, nome: 'Produto C', quantidade: undefined, preco: 100 } // 0
        ];

        fetch.mockImplementation((url) => {
            if (url.includes('/produtos')) return Promise.resolve({ ok: true, json: async () => mockProdutosMistificados });
            if (url.includes('/pedidos')) return Promise.resolve({ ok: true, json: async () => [] });
        });

        render(<BrowserRouter><Relatorios /></BrowserRouter>);

        await waitFor(() => {
            expect(screen.queryByText('A carregar histórico...')).not.toBeInTheDocument();
        });

        // 10 * 50 = 500.00
        expect(screen.getByText('R$ 500.00')).toBeInTheDocument();
    });

    it('Deve atualizar os dados periodicamente via polling', async () => {
        vi.useFakeTimers();

        const localMockProdutos = [
            { id: 1, nome: 'Produto A', quantidade: 10, preco: 50 } // 500
        ];

        let chamadasFetch = 0;
        fetch.mockImplementation((url) => {
            if (url.includes('/produtos')) {
                chamadasFetch++;
                return Promise.resolve({ ok: true, json: async () => localMockProdutos });
            }
            if (url.includes('/pedidos')) {
                return Promise.resolve({ ok: true, json: async () => [] });
            }
        });

        render(<BrowserRouter><Relatorios /></BrowserRouter>);

        // Resolve o carregamento inicial (promessas de fetch) sem avançar o fake timer
        await act(async () => {
            await Promise.resolve();
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(screen.queryByText('A carregar histórico...')).not.toBeInTheDocument();
        expect(chamadasFetch).toBe(1);

        // Avança 5 segundos
        act(() => {
            vi.advanceTimersByTime(5000);
        });
        await act(async () => {
            await Promise.resolve();
            await Promise.resolve();
        });
        expect(chamadasFetch).toBe(2);

        // Avança mais 5 segundos
        act(() => {
            vi.advanceTimersByTime(5000);
        });
        await act(async () => {
            await Promise.resolve();
            await Promise.resolve();
        });
        expect(chamadasFetch).toBe(3);

        vi.useRealTimers();
    });
});