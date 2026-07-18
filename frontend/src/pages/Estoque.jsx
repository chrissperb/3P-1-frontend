import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FormProduto from '../components/FormProduto';
import ModalConfirmacao from '../components/ModalConfirmacao';

export default function Estoque() {
    const [produtos, setProdutos] = useState([]);
    const [busca, setBusca] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [exibirForm, setExibirForm] = useState(false);
    const [produtoEditado, setProdutoEditado] = useState(null);
    const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
    const [produtoParaExcluir, setProdutoParaExcluir] = useState(null);

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

    const prepararExclusao = (produto) => {
        setProdutoParaExcluir(produto);
        setModalExcluirAberto(true);
    };

    const confirmarExclusao = async () => {
        if (!produtoParaExcluir) return;

        const { id } = produtoParaExcluir;

        try {
            const token = localStorage.getItem('token');
            const resposta = await fetch(`${import.meta.env.VITE_API_URL}/produtos/${id}`, {
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
        } finally {
            setModalExcluirAberto(false);
            setProdutoParaExcluir(null);
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
        <div className="estoque-container">
            {/* CABEÇALHO */}
            <div className="estoque-header">
                <h2>📦 Gestão de Estoque</h2>
                {!exibirForm && (
                    <button
                        onClick={prepararNovoProduto}
                        className="btn-novo-produto"
                    >
                        + Novo Produto
                    </button>
                )}
            </div>

            {/* MENSAGEM DE ERRO */}
            {erro && (
                <div className="estoque-erro">
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
                    <div className="busca-container">
                        <input
                            type="text"
                            placeholder="🔍 Procurar produto pelo nome..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            className="busca-input"
                        />
                    </div>

                    <div className="tabela-container">
                        {carregando ? (
                            <p className="carregando-texto">A carregar produtos...</p>
                        ) : (
                            <>
                                <table className="estoque-tabela">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nome</th>
                                            <th>Categoria</th>
                                            <th>Estoque</th>
                                            <th>Preço Venda</th>
                                            <th className="text-center">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {produtosFiltrados.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="tabela-vazia">
                                                    Nenhum produto encontrado.
                                                </td>
                                            </tr>
                                        ) : (
                                            produtosFiltrados.map(produto => (
                                                <tr key={produto._id}>
                                                    <td className="bold">{produto.id}</td>
                                                    <td>{produto.nome}</td>
                                                    <td className="capitalize">{produto.categoria}</td>
                                                    <td className={produto.quantidade > 0 ? 'estoque-status-ok' : 'estoque-status-esgotado'}>
                                                        {produto.quantidade} un
                                                    </td>
                                                    <td>R$ {produto.precoVenda.toFixed(2)}</td>

                                                    <td className="text-center">
                                                        <button
                                                            onClick={() => prepararEdicao(produto)}
                                                            className="btn-acao"
                                                            title="Editar Produto"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={() => prepararExclusao(produto)}
                                                            className="btn-acao"
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

                                {/* Exibição alternativa em Cards para Mobile */}
                                <div className="estoque-cards-mobile">
                                    {produtosFiltrados.length === 0 ? (
                                        <p className="tabela-vazia">Nenhum produto encontrado.</p>
                                    ) : (
                                        produtosFiltrados.map(produto => (
                                            <div key={produto._id} className="estoque-card-item" data-testid="estoque-card">
                                                <div className="estoque-card-row header-row">
                                                    <span className="card-product-id">#{produto.id}</span>
                                                    <span className="card-product-category capitalize">{produto.categoria}</span>
                                                </div>
                                                <h4 className="estoque-card-nome">{produto.nome}</h4>
                                                <div className="estoque-card-row body-row">
                                                    <div className="estoque-card-stat">
                                                        <span className="label">Estoque</span>
                                                        <span className={produto.quantidade > 0 ? 'estoque-status-ok value' : 'estoque-status-esgotado value'}>
                                                            {produto.quantidade} un
                                                        </span>
                                                    </div>
                                                    <div className="estoque-card-stat">
                                                        <span className="label">Preço Venda</span>
                                                        <span className="value">R$ {produto.precoVenda.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                <div className="estoque-card-actions">
                                                    <button
                                                        onClick={() => prepararEdicao(produto)}
                                                        className="btn-acao-card btn-editar"
                                                        title="Editar Produto"
                                                    >
                                                        ✏️ Editar
                                                    </button>
                                                    <button
                                                        onClick={() => prepararExclusao(produto)}
                                                        className="btn-acao-card btn-excluir"
                                                        title="Excluir Produto"
                                                    >
                                                        🗑️ Excluir
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}

            <ModalConfirmacao
                isOpen={modalExcluirAberto}
                titulo="⚠️ Excluir Produto"
                mensagem={`Tem certeza que deseja excluir definitivamente o produto "${produtoParaExcluir?.nome}"?`}
                confirmText="Excluir"
                cancelText="Cancelar"
                tipo="danger"
                onConfirm={confirmarExclusao}
                onCancel={() => {
                    setModalExcluirAberto(false);
                    setProdutoParaExcluir(null);
                }}
            />
        </div>
    );
}