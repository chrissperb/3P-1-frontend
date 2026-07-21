import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Pdv from '../pages/Pdv';
import { vi } from 'vitest';

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockedNavigate };
});

// Mock do Fetch Global
global.fetch = vi.fn();

import.meta.env.VITE_API_URL = 'http://localhost:3000';

describe('Componente PDV - Testes de Comportamento', () => {

    const mockProdutos = [
        { id: 1, nome: 'Vestido Floral', categoria: 'vestido', precoVenda: 100, quantidade: 10 },
        { id: 2, nome: 'Cueca Kids', categoria: 'cueca', precoVenda: 20, quantidade: 5 }
    ];

    beforeEach(() => {
        vi.resetAllMocks();
        localStorage.setItem('token', 'token-valido');

        fetch.mockResolvedValue({
            status: 200,
            ok: true,
            json: async () => mockProdutos
        });
    });

    it('Deve carregar e exibir os produtos do catálogo', async () => {
        render(<BrowserRouter><Pdv /></BrowserRouter>);

        expect(screen.getByText(/A carregar catálogo/i)).toBeInTheDocument();

        const produtoNome = await screen.findByText('Vestido Floral');
        expect(produtoNome).toBeInTheDocument();
    });

    it('Deve adicionar um produto ao carrinho ao clicar no botão', async () => {
        render(<BrowserRouter><Pdv /></BrowserRouter>);

        const botoesAdicionar = await screen.findAllByText('+ Adicionar');
        fireEvent.click(botoesAdicionar[0]);

        const itemNoCarrinho = await screen.findByText(/1x R\$ 100\.00/i);
        expect(itemNoCarrinho).toBeInTheDocument();
    });

    it('Deve simular o cálculo de frete quando um CEP é inserido', async () => {
        fetch.mockResolvedValueOnce({ status: 200, ok: true, json: async () => mockProdutos })
            .mockResolvedValueOnce({
                status: 200,
                ok: true,
                json: async () => [{ name: 'SEDEX', price: '25.00', delivery_time: '2' }]
            });

        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Vestido Floral');

        const botoesAdicionar = await screen.findAllByText('+ Adicionar');
        fireEvent.click(botoesAdicionar[0]);

        const inputCepOrigem = screen.getByPlaceholderText(/CEP Origem/i);
        expect(inputCepOrigem.value).toBe('88495000');

        const inputCep = screen.getByPlaceholderText(/CEP do Destino/i);
        fireEvent.change(inputCep, { target: { value: '88495000' } });

        const botaoBuscar = screen.getByText(/Buscar/i);
        fireEvent.click(botaoBuscar);

        const opcaoFrete = await screen.findByText(/SEDEX - R\$ 25.00/i);
        expect(opcaoFrete).toBeInTheDocument();
    });

    it('Deve permitir editar o CEP de origem para o cálculo do frete', async () => {
        fetch.mockResolvedValueOnce({ status: 200, ok: true, json: async () => mockProdutos })
            .mockResolvedValueOnce({
                status: 200,
                ok: true,
                json: async () => [{ name: 'PAC', price: '18.00', delivery_time: '5' }]
            });

        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Vestido Floral');

        const botoesAdicionar = await screen.findAllByText('+ Adicionar');
        fireEvent.click(botoesAdicionar[0]);

        const inputCepOrigem = screen.getByPlaceholderText(/CEP Origem/i);
        fireEvent.change(inputCepOrigem, { target: { value: '01001000' } });
        expect(inputCepOrigem.value).toBe('01001000');

        const inputCepDestino = screen.getByPlaceholderText(/CEP do Destino/i);
        fireEvent.change(inputCepDestino, { target: { value: '88495000' } });

        const botaoBuscar = screen.getByText(/Buscar/i);
        fireEvent.click(botaoBuscar);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3000/frete',
                expect.objectContaining({
                    body: expect.stringContaining('"postal_code":"01001000"')
                })
            );
        });
    });

    it('Deve executar o fluxo completo de gerar e imprimir etiqueta de frete', async () => {
        fetch.mockResolvedValueOnce({ status: 200, ok: true, json: async () => mockProdutos })
            .mockResolvedValueOnce({ status: 200, ok: true, json: async () => ({ id: 'TAG-12345' }) })
            .mockResolvedValueOnce({ status: 200, ok: true, json: async () => ({ url: 'https://sandbox.superfrete.com/print/TAG-12345.pdf' }) });

        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Vestido Floral');

        const botoesAdicionar = await screen.findAllByText('+ Adicionar');
        fireEvent.click(botoesAdicionar[0]);

        const inputCepDestino = screen.getByPlaceholderText(/CEP do Destino/i);
        fireEvent.change(inputCepDestino, { target: { value: '88495000' } });

        const botaoGerarEtiqueta = screen.getByText(/Gerar etiqueta/i);
        fireEvent.click(botaoGerarEtiqueta);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3000/frete/etiqueta',
                expect.objectContaining({ method: 'POST' })
            );
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3000/frete/imprimir',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ orders: ['TAG-12345'] })
                })
            );
        });
    });

    it('Deve exibir alerta de sucesso ao finalizar uma venda', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

        fetch.mockResolvedValueOnce({ status: 200, ok: true, json: async () => mockProdutos })
            .mockResolvedValueOnce({ status: 200, ok: true, json: async () => ({ mensagem: 'Sucesso' }) });

        render(<BrowserRouter><Pdv /></BrowserRouter>);

        const botoesAdicionar = await screen.findAllByText('+ Adicionar');
        fireEvent.click(botoesAdicionar[0]);

        const botaoFinalizar = screen.getByText(/Finalizar Venda/i);
        fireEvent.click(botaoFinalizar);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('sucesso'));
        });
    });

    it('Deve filtrar os produtos ao clicar em uma categoria', async () => {
        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Vestido Floral');

        expect(screen.getByText('Vestido Floral')).toBeInTheDocument();
        expect(screen.getByText('Cueca Kids')).toBeInTheDocument();

        const botaoCategoriaVestido = screen.getByText('vestido');
        fireEvent.click(botaoCategoriaVestido);

        expect(screen.getByText('Vestido Floral')).toBeInTheDocument();
        expect(screen.queryByText('Cueca Kids')).not.toBeInTheDocument();
    });

    it('Deve remover um item do carrinho ao clicar na lixeira', async () => {
        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Vestido Floral');

        const botoesAdicionar = await screen.findAllByText('+ Adicionar');
        fireEvent.click(botoesAdicionar[0]);

        expect(screen.getByText(/1x R\$ 100\.00/i)).toBeInTheDocument();

        const botaoLixeira = screen.getByText('🗑️');
        fireEvent.click(botaoLixeira);

        expect(screen.getByText('O carrinho está vazio.')).toBeInTheDocument();
    });

    it('Deve bloquear e alertar se o usuário tentar adicionar mais do que o estoque disponível', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });
        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Cueca Kids');

        const botoesAdicionar = await screen.findAllByText('+ Adicionar');

        for (let i = 0; i < 6; i++) {
            fireEvent.click(botoesAdicionar[1]);
        }

        expect(alertSpy).toHaveBeenCalledWith('Estoque máximo atingido para este produto!');

        expect(screen.getByText(/5x R\$ 20\.00/i)).toBeInTheDocument();
    });

    it('Deve alertar o usuário se o backend retornar erro na finalização da venda', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

        fetch.mockResolvedValueOnce({ status: 200, ok: true, json: async () => mockProdutos })
            .mockResolvedValueOnce({
                status: 400,
                ok: false,
                json: async () => ({ erro: 'Estoque insuficiente no servidor.' })
            });

        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Vestido Floral');

        const botoesAdicionar = await screen.findAllByText('+ Adicionar');
        fireEvent.click(botoesAdicionar[0]);

        const botaoFinalizar = screen.getByText(/Finalizar Venda/i);
        fireEvent.click(botaoFinalizar);

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Erro: Estoque insuficiente no servidor.'));
        });
    });

    it('Deve gerenciar a abertura e fechamento do drawer do carrinho apenas via botão flutuante', async () => {
        render(<BrowserRouter><Pdv /></BrowserRouter>);

        await screen.findByText('Vestido Floral');

        // Pega o botão flutuante e o container do carrinho
        const botaoFlutuante = screen.getByTestId('floating-cart-btn');
        const checkoutSidebar = screen.getByText('🛒 Carrinho e Entrega').closest('.pdv-checkout-sidebar');

        // Estado inicial: fechado (não deve ter a classe carrinho-aberto)
        expect(checkoutSidebar).not.toHaveClass('carrinho-aberto');

        // Clicar no botão flutuante -> abre o carrinho (deve ter a classe carrinho-aberto)
        fireEvent.click(botaoFlutuante);
        expect(checkoutSidebar).toHaveClass('carrinho-aberto');

        // Clicar no botão de fechar -> fecha o carrinho
        const botaoFechar = screen.getByRole('button', { name: /Fechar carrinho/i });
        fireEvent.click(botaoFechar);
        expect(checkoutSidebar).not.toHaveClass('carrinho-aberto');

        // Clicar em "+ Adicionar" -> adiciona item mas NÃO abre o carrinho automaticamente
        const botoesAdicionar = await screen.findAllByText('+ Adicionar');
        fireEvent.click(botoesAdicionar[0]);
        expect(checkoutSidebar).not.toHaveClass('carrinho-aberto');
    });
});