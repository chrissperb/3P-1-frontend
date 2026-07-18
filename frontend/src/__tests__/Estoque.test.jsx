import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Estoque from '../pages/Estoque';
import { vi } from 'vitest';

// 1. Mock do Navegador (Router)
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockedNavigate };
});

// 2. Mock do Fetch Global
global.fetch = vi.fn();
import.meta.env.VITE_API_URL = 'http://localhost:3000';

// 3. MOCK DO COMPONENTE FILHO (FormProduto)
vi.mock('../components/FormProduto', () => ({
    default: ({ aoCancelar }) => (
        <div data-testid="form-produto-mock">
            <h2>Tela de Formulário</h2>
            <button onClick={aoCancelar}>Cancelar</button>
        </div>
    )
}));

describe('Componente Estoque - Testes de Interface', () => {

    const mockProdutos = [
        { _id: '1', id: 1, nome: 'Vestido Infantil', categoria: 'vestido', quantidade: 10, precoVenda: 89.90 },
        { _id: '2', id: 2, nome: 'Bermuda Jeans', categoria: 'bermuda', quantidade: 0, precoVenda: 45.00 }
    ];

    beforeEach(() => {
        vi.resetAllMocks();
        localStorage.setItem('token', 'token-valido');
    });

    it('Deve carregar e exibir os produtos na tabela', async () => {
        fetch.mockResolvedValueOnce({ status: 200, ok: true, json: async () => mockProdutos });

        render(<BrowserRouter><Estoque /></BrowserRouter>);

        expect(screen.getByText('A carregar produtos...')).toBeInTheDocument();

        const vestidos = await screen.findAllByText('Vestido Infantil');
        expect(vestidos[0]).toBeInTheDocument();
        expect(screen.getAllByText('Bermuda Jeans')[0]).toBeInTheDocument();

        expect(screen.getAllByText('10 un')[0]).toBeInTheDocument();
    });

    it('Deve filtrar os produtos quando o usuário digitar na barra de busca', async () => {
        fetch.mockResolvedValueOnce({ status: 200, ok: true, json: async () => mockProdutos });

        render(<BrowserRouter><Estoque /></BrowserRouter>);
        await screen.findAllByText('Vestido Infantil');

        const inputBusca = screen.getByPlaceholderText('🔍 Procurar produto pelo nome...');

        fireEvent.change(inputBusca, { target: { value: 'Bermuda' } });

        expect(screen.queryByText('Vestido Infantil')).not.toBeInTheDocument();
        expect(screen.getAllByText('Bermuda Jeans')[0]).toBeInTheDocument();

        fireEvent.change(inputBusca, { target: { value: 'Jaqueta' } });
        expect(screen.getAllByText('Nenhum produto encontrado.')[0]).toBeInTheDocument();
    });

    it('Deve abrir o FormProduto ao clicar em Novo Produto', async () => {
        fetch.mockResolvedValueOnce({ status: 200, ok: true, json: async () => mockProdutos });

        render(<BrowserRouter><Estoque /></BrowserRouter>);
        await screen.findAllByText('Vestido Infantil');

        const botaoNovo = screen.getByText('+ Novo Produto');
        fireEvent.click(botaoNovo);

        expect(screen.queryByPlaceholderText('🔍 Procurar produto pelo nome...')).not.toBeInTheDocument();

        expect(screen.getByTestId('form-produto-mock')).toBeInTheDocument();
        expect(screen.getByText('Tela de Formulário')).toBeInTheDocument();
    });

    it('Deve deletar um produto após confirmação (window.confirm)', async () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        fetch.mockResolvedValueOnce({ status: 200, ok: true, json: async () => mockProdutos })
            .mockResolvedValueOnce({ status: 200, ok: true });

        render(<BrowserRouter><Estoque /></BrowserRouter>);
        await screen.findAllByText('Vestido Infantil');

        const botoesDeletar = screen.getAllByTitle('Excluir Produto');
        fireEvent.click(botoesDeletar[0]);

        expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('Tem certeza que deseja excluir definitivamente'));

        expect(fetch).toHaveBeenCalledWith('http://localhost:3000/produtos/1', expect.objectContaining({ method: 'DELETE' }));

        await waitFor(() => {
            expect(screen.queryByText('Vestido Infantil')).not.toBeInTheDocument();
        });
    });

    it('Deve redirecionar para login se o token estiver expirado (401)', async () => {
        fetch.mockResolvedValueOnce({ status: 401, ok: false });

        render(<BrowserRouter><Estoque /></BrowserRouter>);

        await waitFor(() => {
            expect(mockedNavigate).toHaveBeenCalledWith('/login');
        });
    });

    it('Não deve deletar o produto se o usuário cancelar a confirmação', async () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

        fetch.mockResolvedValueOnce({ status: 200, ok: true, json: async () => mockProdutos });

        render(<BrowserRouter><Estoque /></BrowserRouter>);
        await screen.findAllByText('Vestido Infantil');

        const botoesDeletar = screen.getAllByTitle('Excluir Produto');
        fireEvent.click(botoesDeletar[0]);

        expect(confirmSpy).toHaveBeenCalled();

        expect(fetch).not.toHaveBeenCalledWith(
            expect.stringContaining('/produtos/1'),
            expect.objectContaining({ method: 'DELETE' })
        );

        expect(screen.getAllByText('Vestido Infantil')[0]).toBeInTheDocument();
    });

    it('Deve abrir o formulário com os dados do produto ao clicar em Editar', async () => {
        fetch.mockResolvedValueOnce({ status: 200, ok: true, json: async () => mockProdutos });

        render(<BrowserRouter><Estoque /></BrowserRouter>);
        await screen.findAllByText('Vestido Infantil');

        const botoesEditar = screen.getAllByTitle('Editar Produto');
        fireEvent.click(botoesEditar[0]);

        expect(screen.queryByPlaceholderText('🔍 Procurar produto pelo nome...')).not.toBeInTheDocument();
        expect(screen.getByTestId('form-produto-mock')).toBeInTheDocument();
    });

    it('Deve exibir o banner de erro caso a API falhe no carregamento inicial', async () => {
        fetch.mockResolvedValueOnce({
            status: 500,
            ok: false
        });

        render(<BrowserRouter><Estoque /></BrowserRouter>);

        await waitFor(() => {
            expect(screen.queryByText('A carregar produtos...')).not.toBeInTheDocument();
        });

        const bannerErro = screen.getByText(/Erro na API: 500/i);
        expect(bannerErro).toBeInTheDocument();
    });

    it('Deve renderizar os cards de produtos responsivos para mobile', async () => {
        fetch.mockResolvedValueOnce({ status: 200, ok: true, json: async () => mockProdutos });

        render(<BrowserRouter><Estoque /></BrowserRouter>);
        await screen.findAllByText('Vestido Infantil');

        const cards = screen.getAllByTestId('estoque-card');
        expect(cards).toHaveLength(2);

        expect(screen.getAllByText('Vestido Infantil')).toHaveLength(2);
        expect(screen.getAllByText('10 un')).toHaveLength(2);
    });
});