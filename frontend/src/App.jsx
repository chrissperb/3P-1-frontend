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
        <nav className="main-nav">
          <div className="nav-menu">
            <h1 className="nav-brand animated-butterfly">🦋 Borbolêlalá</h1>
            <Link to="/" className="nav-link">PDV</Link>
            <Link to="/estoque" className="nav-link">Estoque</Link>
            <Link to="/relatorios" className="nav-link">Relatórios</Link>
          </div>

          {/* Bloco do Usuário e Logout */}
          <div className="nav-user-area">
            <span className="nav-user-text">
              Olá, <strong>{primeiroNome}</strong> 👋
            </span>

            {/* Divisória */}
            <div className="nav-divider"></div>

            {/* Botão de Logout com Hover */}
            <button
              onClick={fazerLogout}
              className="logout-button"
            >
              Sair
            </button>
          </div>
        </nav>
      )}

      <div className="main-content">
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