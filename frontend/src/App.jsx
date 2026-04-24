import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Pdv from './pages/Pdv';
import Estoque from './pages/Estoque';
import Relatorios from './pages/Relatorios';
import Login from './pages/Login';

export default function App() {
  const navigate = useNavigate();

  const fazerLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div>
      <nav style={{ padding: '15px', backgroundColor: '#fdf2f7', borderBottom: '3px solid #1abc9c', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <h1 style={{ margin: 0, color: '#9b59b6', fontSize: '1.2rem' }}>🦋 Borbolêlalá</h1>
          <Link to="/" style={{ textDecoration: 'none', color: '#34495e', fontWeight: 'bold' }}>PDV</Link>
          <Link to="/estoque" style={{ textDecoration: 'none', color: '#34495e', fontWeight: 'bold' }}>Estoque</Link>
          <Link to="/relatorios" style={{ textDecoration: 'none', color: '#34495e', fontWeight: 'bold' }}>Relatórios</Link>
        </div>

        {/* Botão de Logout que aparece no menu */}
        <button onClick={fazerLogout} style={{ backgroundColor: 'transparent', border: '1px solid #e74c3c', color: '#e74c3c', padding: '5px 15px', borderRadius: '20px', cursor: 'pointer' }}>
          Sair
        </button>
      </nav>

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