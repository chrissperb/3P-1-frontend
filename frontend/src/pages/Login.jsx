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
        } catch (error) {
            setErro('Erro de conexão com o servidor.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', color: '#9b59b6', marginBottom: '20px' }}>🦋 Borbolêlalá</h2>
                <h3 style={{ textAlign: 'center', color: '#34495e', marginTop: 0 }}>Acesso ao Sistema</h3>

                {erro && <p style={{ color: '#e74c3c', backgroundColor: '#fadbd8', padding: '10px', borderRadius: '4px', textAlign: 'center' }}>{erro}</p>}

                <form onSubmit={fazerLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', color: '#7f8c8d' }}>E-mail</label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #bdc3c7' }}
                        />
                    </div>
                    <div>
                        <label htmlFor="senha" style={{ display: 'block', marginBottom: '5px', color: '#7f8c8d' }}>Senha</label>
                        <input
                            id="senha"
                            type="password"
                            required
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #bdc3c7' }}
                        />
                    </div>
                    <button type="submit" style={{ padding: '12px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
}