import { useState, useEffect } from 'react';

export default function FormProduto({ produtoEditado, maxId, aoSalvar, aoCancelar }) {
    // Estados para controlar os campos do formulário
    const [id, setId] = useState('');
    const [nome, setNome] = useState('');
    const [categoria, setCategoria] = useState('');
    const [quantidade, setQuantidade] = useState(1);
    const [preco, setPreco] = useState(0);
    const [precoVenda, setPrecoVenda] = useState(0);
    const [carregando, setCarregando] = useState(false);

    // Preenche os dados se for Edição, ou gera o próximo ID se for Novo
    useEffect(() => {
        if (produtoEditado) {
            setId(produtoEditado.id);
            setNome(produtoEditado.nome);
            setCategoria(produtoEditado.categoria);
            setQuantidade(produtoEditado.quantidade);
            setPreco(produtoEditado.preco || 0);
            setPrecoVenda(produtoEditado.precoVenda || 0);
        } else {
            setId(maxId + 1);
        }
    }, [produtoEditado, maxId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCarregando(true);

        const dadosProduto = {
            id: parseInt(id),
            nome: nome.trim(),
            categoria: categoria.trim().toLowerCase(),
            quantidade: parseInt(quantidade),
            preco: parseFloat(preco),
            precoVenda: parseFloat(precoVenda)
        };

        const url = produtoEditado
            ? `${import.meta.env.VITE_API_URL}/produtos/${produtoEditado.id}`
            : `${import.meta.env.VITE_API_URL}/produtos`;

        const method = produtoEditado ? 'PUT' : 'POST';

        try {
            const token = localStorage.getItem('token');
            const resposta = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dadosProduto)
            });

            if (resposta.ok) {
                aoSalvar();
            } else {
                const erro = await resposta.json();
                alert(`Erro: ${erro.mensagem || 'Falha ao salvar.'}`);
            }
        } catch (erro) {
            console.error(erro);
            alert('Erro de ligação ao servidor.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="form-produto-card">
            <h3 className="form-produto-titulo">
                {produtoEditado ? '✏️ Editar Produto' : '✨ Criar Novo Produto'}
            </h3>

            <form onSubmit={handleSubmit} className="form-produto">
                {/* LINHA 1: ID e Nome */}
                <div className="form-linha">
                    <div className="form-campo flex-1">
                        <label>ID</label>
                        <input type="number" required value={id} onChange={e => setId(e.target.value)} className="form-input" />
                    </div>
                    <div className="form-campo flex-3">
                        <label>Nome da Roupinha</label>
                        <input type="text" required value={nome} onChange={e => setNome(e.target.value)} className="form-input" />
                    </div>
                </div>

                {/* LINHA 2: Categoria e Estoque */}
                <div className="form-linha">
                    <div className="form-campo flex-2">
                        <label>Categoria</label>
                        <input type="text" required value={categoria} onChange={e => setCategoria(e.target.value)} placeholder="Ex: vestido, cueca..." className="form-input" />
                    </div>
                    <div className="form-campo flex-1">
                        <label>Estoque (Qtd)</label>
                        <input type="number" required min="0" value={quantidade} onChange={e => setQuantidade(e.target.value)} className="form-input" />
                    </div>
                </div>

                {/* LINHA 3: Custos e Preços */}
                <div className="form-linha">
                    <div className="form-campo flex-1">
                        <label>Preço de Custo (R$)</label>
                        <input type="number" required step="0.01" value={preco} onChange={e => setPreco(e.target.value)} className="form-input form-input-custo" title="Usado para calcular o valor do patrimônio" />
                    </div>
                    <div className="form-campo flex-1">
                        <label>Preço de Venda (R$)</label>
                        <input type="number" required step="0.01" value={precoVenda} onChange={e => setPrecoVenda(e.target.value)} className="form-input form-input-venda" title="Preço que o cliente final vai pagar" />
                    </div>
                </div>

                {/* BOTÕES */}
                <div className="form-botoes">
                    <button type="submit" disabled={carregando} className="btn-salvar">
                        {carregando ? 'A Salvar...' : '💾 Salvar Produto'}
                    </button>
                    <button type="button" onClick={aoCancelar} className="btn-cancelar">
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}