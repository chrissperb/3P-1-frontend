import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');

    const navigate = useNavigate();

    const fazerLogin = async (e) => {
        e.preventDefault();
        setErro('');

        try {
            const resposta = await fetch(import.meta.env.VITE_API_URL + '/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                localStorage.setItem('token', dados.token);
                localStorage.setItem('nomeUsuario', dados.usuario.nome);

                navigate('/');
            } else {
                setErro(dados.mensagem || 'Erro ao fazer login.');
            }
        } catch {
            setErro('Erro de conexão com o servidor.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title"><span className="animated-butterfly">🦋</span> Borbolêlalá</h2>
                <h3 className="login-subtitle">Acesso ao Sistema</h3>

                {erro && <p className="error-banner">{erro}</p>}

                <form onSubmit={fazerLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email" className="login-label">E-mail</label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="login-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="senha" className="login-label">Senha</label>
                        <input
                            id="senha"
                            type="password"
                            required
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className="login-input"
                        />
                    </div>
                    <button type="submit" className="login-button">
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
}