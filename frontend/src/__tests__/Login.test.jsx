import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { vi } from 'vitest';

// 1. Mock do React Router
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockedNavigate };
});

// 2. Mock do Fetch Global e Variáveis de Ambiente
global.fetch = vi.fn();
import.meta.env.VITE_API_URL = 'http://localhost:3000';

describe('Componente Login - Testes de Autenticação', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('Deve renderizar os campos de email, senha e botão de entrar', () => {
        render(<BrowserRouter><Login /></BrowserRouter>);

        expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
        expect(screen.getByLabelText('Senha')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    });

    it('Deve realizar login com sucesso e redirecionar para a home', async () => {
        const mockRespostaSucesso = {
            token: 'meu-token-jwt-secreto',
            usuario: { nome: 'Christian Admin' }
        };

        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockRespostaSucesso
        });

        render(<BrowserRouter><Login /></BrowserRouter>);

        fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'admin@borbole.com' } });
        fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha123' } });

        fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                'http://localhost:3000/login',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ email: 'admin@borbole.com', senha: 'senha123' })
                })
            );

            expect(localStorage.getItem('token')).toBe('meu-token-jwt-secreto');
            expect(localStorage.getItem('nomeUsuario')).toBe('Christian Admin');

            expect(mockedNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('Deve exibir mensagem de erro se as credenciais estiverem incorretas', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ mensagem: 'Email ou senha incorretos.' })
        });

        render(<BrowserRouter><Login /></BrowserRouter>);

        fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'errado@email.com' } });
        fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senhaerrada' } });
        fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

        const mensagemErro = await screen.findByText('Email ou senha incorretos.');
        expect(mensagemErro).toBeInTheDocument();

        expect(localStorage.getItem('token')).toBeNull();

        expect(mockedNavigate).not.toHaveBeenCalled();
    });

    it('Deve exibir erro de conexão caso o servidor falhe ou esteja fora do ar', async () => {
        fetch.mockRejectedValueOnce(new Error('Network error'));

        render(<BrowserRouter><Login /></BrowserRouter>);

        fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'admin@email.com' } });
        fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '123' } });
        fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

        const mensagemErroRede = await screen.findByText('Erro de conexão com o servidor.');
        expect(mensagemErroRede).toBeInTheDocument();
    });
});