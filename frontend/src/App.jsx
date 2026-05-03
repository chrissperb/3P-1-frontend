import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Pdv from './pages/Pdv';
import Estoque from './pages/Estoque';
import Relatorios from './pages/Relatorios';
import Login from './pages/Login';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const fazerLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nomeUsuario');
    navigate('/login');
  };

  const nomeCompleto = localStorage.getItem('nomeUsuario') || 'Equipe';
  const primeiroNome = nomeCompleto.split(' ')[0];

  const exibirMenu = location.pathname !== '/login';

  return (
    <div>
      {exibirMenu && (
        <nav style={{
          padding: '15px',
          backgroundColor: '#fdf2f7',
          borderBottom: '3px solid #1abc9c',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <h1 style={{ margin: 0, color: '#9b59b6', fontSize: '1.2rem' }}>🦋 Borbolêlalá</h1>
            <Link to="/" style={{ textDecoration: 'none', color: '#34495e', fontWeight: 'bold' }}>PDV</Link>
            <Link to="/estoque" style={{ textDecoration: 'none', color: '#34495e', fontWeight: 'bold' }}>Estoque</Link>
            <Link to="/relatorios" style={{ textDecoration: 'none', color: '#34495e', fontWeight: 'bold' }}>Relatórios</Link>
          </div>

          {/* Bloco do Usuário e Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: '#7f8c8d', fontSize: '0.95rem', fontWeight: '500' }}>
              Olá, <strong style={{ color: '#9b59b6' }}>{primeiroNome}</strong> 👋
            </span>

            {/* Divisória */}
            <div style={{ width: '1px', height: '24px', backgroundColor: '#bdc3c7' }}></div>

            {/* Botão de Logout com Hover */}
            <button
              onClick={fazerLogout}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #fadbd8',
                color: '#e74c3c',
                padding: '6px 16px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#fadbd8'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = 'transparent'; }}
            >
              Sair
            </button>
          </div>
        </nav>
      )}

      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Pdv />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route path="/relatorios" element={<Relatorios />} />
        </Routes>
      </div>
    </div>
  );
}