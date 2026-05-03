import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FormProduto from '../components/FormProduto';

export default function Estoque() {
    const [produtos, setProdutos] = useState([]);
    const [busca, setBusca] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [exibirForm, setExibirForm] = useState(false);
    const [produtoEditado, setProdutoEditado] = useState(null);

    const navigate = useNavigate();

    // 1. Buscando os dados
    useEffect(() => {
        const buscarProdutos = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const resposta = await fetch(import.meta.env.VITE_API_URL + '/produtos', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (resposta.status === 401 || resposta.status === 403) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    throw new Error("Sessão expirada. Por favor, faça login novamente.");
                }

                if (!resposta.ok) throw new Error(`Erro na API: ${resposta.status}`);

                const dados = await resposta.json();
                const produtosLimpos = dados
                    .filter(p => p.id != null)
                    .sort((a, b) => a.id - b.id);

                setProdutos(produtosLimpos);
            } catch (err) {
                setErro(err.message);
            } finally {
                setCarregando(false);
            }
        };

        buscarProdutos();
    }, [navigate]);

    const deletarProduto = async (id, nome) => {
        if (!window.confirm(`⚠️ Tem certeza que deseja excluir definitivamente o produto "${nome}"?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const resposta = await fetch(import.meta.env.VITE_API_URL + '/produtos/${id}', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (resposta.ok) {
                setProdutos(produtos.filter(produto => produto.id !== id));
            } else {
                alert('Erro ao excluir o produto. Verifique suas permissões de Admin.');
            }
        } catch (erro) {
            console.error('Erro de conexão ao excluir:', erro);
            alert('Erro de conexão com o servidor.');
        }
    };

    const prepararEdicao = (produto) => {
        setProdutoEditado(produto);
        setExibirForm(true);
    };

    const prepararNovoProduto = () => {
        setProdutoEditado(null);
        setExibirForm(true);
    };

    // Recarrega a lista do banco de dados quando o form é salvo
    const aoSalvarFormulario = () => {
        setExibirForm(false);
        setCarregando(true);
        window.location.reload();
    };

    // Descobre o maior ID para passar para o Form
    const maxId = produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) : 0;

    // Filtro Dinâmico
    const produtosFiltrados = produtos.filter(produto =>
        produto.nome.toLowerCase().includes(busca.toLowerCase())
    );

    return (
        <div>
            {/* CABEÇALHO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#2c3e50', margin: 0 }}>📦 Gestão de Estoque</h2>
                {!exibirForm && (
                    <button
                        onClick={prepararNovoProduto}
                        style={{ backgroundColor: '#9b59b6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        + Novo Produto
                    </button>
                )}
            </div>

            {/* MENSAGEM DE ERRO */}
            {erro && (
                <div style={{ backgroundColor: '#fadbd8', color: '#e74c3c', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
                    {erro}
                </div>
            )}

            {/* RENDERIZAÇÃO CONDICIONAL */}
            {exibirForm ? (
                // SE VERDADEIRO: MOSTRA O FORMULÁRIO DE CADASTRO/EDIÇÃO
                <FormProduto
                    produtoEditado={produtoEditado}
                    maxId={maxId}
                    aoSalvar={aoSalvarFormulario}
                    aoCancelar={() => setExibirForm(false)}
                />
            ) : (
                // SE FALSO: MOSTRA A BARRA DE BUSCA E A SUA TABELA
                <>
                    <div style={{ marginBottom: '20px' }}>
                        <input
                            type="text"
                            placeholder="🔍 Procurar produto pelo nome..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            style={{ padding: '12px', width: '100%', maxWidth: '400px', borderRadius: '6px', border: '1px solid #bdc3c7', fontSize: '1rem' }}
                        />
                    </div>

                    <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '15px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
                        {carregando ? (
                            <p style={{ textAlign: 'center', color: '#7f8c8d' }}>A carregar produtos...</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #ecf0f1', color: '#9b59b6' }}>
                                        <th style={{ padding: '12px' }}>ID</th>
                                        <th style={{ padding: '12px' }}>Nome</th>
                                        <th style={{ padding: '12px' }}>Categoria</th>
                                        <th style={{ padding: '12px' }}>Estoque</th>
                                        <th style={{ padding: '12px' }}>Preço Venda</th>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {produtosFiltrados.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#e74c3c' }}>
                                                Nenhum produto encontrado.
                                            </td>
                                        </tr>
                                    ) : (
                                        produtosFiltrados.map(produto => (
                                            <tr key={produto._id} style={{ borderBottom: '1px solid #ecf0f1' }}>
                                                <td style={{ padding: '12px', fontWeight: 'bold' }}>{produto.id}</td>
                                                <td style={{ padding: '12px' }}>{produto.nome}</td>
                                                <td style={{ padding: '12px', textTransform: 'capitalize' }}>{produto.categoria}</td>
                                                <td style={{ padding: '12px', color: produto.quantidade > 0 ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>
                                                    {produto.quantidade} un
                                                </td>
                                                <td style={{ padding: '12px' }}>R$ {produto.precoVenda.toFixed(2)}</td>

                                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                                    <button
                                                        onClick={() => prepararEdicao(produto)}
                                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', marginRight: '10px' }}
                                                        title="Editar Produto"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => deletarProduto(produto.id, produto.nome)}
                                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                                        title="Excluir Produto"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}