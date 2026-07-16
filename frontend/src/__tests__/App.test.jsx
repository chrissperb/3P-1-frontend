import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { vi } from 'vitest';

// Mock das páginas para focar o teste na estrutura do App, navbar e rotas.
vi.mock('../pages/Pdv', () => ({ default: () => <div data-testid="pdv-page">PDV Component</div> }));
vi.mock('../pages/Estoque', () => ({ default: () => <div data-testid="estoque-page">Estoque Component</div> }));
vi.mock('../pages/Relatorios', () => ({ default: () => <div data-testid="relatorios-page">Relatorios Component</div> }));
vi.mock('../pages/Login', () => ({ default: () => <div data-testid="login-page">Login Component</div> }));

describe('Componente App - Estrutura e Menu de Navegação', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('Deve renderizar a barra de navegação e as saudações ao usuário quando não estiver na rota de login', () => {
    localStorage.setItem('nomeUsuario', 'Ana Beatriz Souza');

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Verifica se a navbar existe
    const navbar = screen.getByRole('navigation');
    expect(navbar).toBeInTheDocument();
    expect(navbar).toHaveClass('main-nav');

    // Verifica a marca e links
    expect(screen.getByText('🦋 Borbolêlalá')).toBeInTheDocument();
    expect(screen.getByText('PDV')).toBeInTheDocument();
    expect(screen.getByText('Estoque')).toBeInTheDocument();
    expect(screen.getByText('Relatórios')).toBeInTheDocument();

    // Verifica saudação com primeiro nome
    expect(screen.getByText(/Olá,/i)).toBeInTheDocument();
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument();
  });

  it('Não deve renderizar a barra de navegação quando estiver na rota de login', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('Deve limpar o localStorage e redirecionar para a página de login ao clicar no botão Sair', () => {
    localStorage.setItem('token', 'meu-token-secreto');
    localStorage.setItem('nomeUsuario', 'Carlos Eduardo');

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    const botaoSair = screen.getByRole('button', { name: 'Sair' });
    fireEvent.click(botaoSair);

    // Verifica que limpou localStorage
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('nomeUsuario')).toBeNull();

    // Verifica redirecionamento para login
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
