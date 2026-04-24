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
            ? `http://localhost:3000/api/produtos/${produtoEditado.id}`
            : 'http://localhost:3000/api/produtos';

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
        <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#9b59b6', marginTop: 0 }}>
                {produtoEditado ? '✏️ Editar Produto' : '✨ Criar Novo Produto'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* LINHA 1: ID e Nome */}
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: '1' }}>
                        <label style={{ display: 'block', color: '#7f8c8d', marginBottom: '5px' }}>ID</label>
                        <input type="number" required value={id} onChange={e => setId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #bdc3c7' }} />
                    </div>
                    <div style={{ flex: '3' }}>
                        <label style={{ display: 'block', color: '#7f8c8d', marginBottom: '5px' }}>Nome da Roupinha</label>
                        <input type="text" required value={nome} onChange={e => setNome(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #bdc3c7' }} />
                    </div>
                </div>

                {/* LINHA 2: Categoria e Estoque */}
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: '2' }}>
                        <label style={{ display: 'block', color: '#7f8c8d', marginBottom: '5px' }}>Categoria</label>
                        <input type="text" required value={categoria} onChange={e => setCategoria(e.target.value)} placeholder="Ex: vestido, cueca..." style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #bdc3c7' }} />
                    </div>
                    <div style={{ flex: '1' }}>
                        <label style={{ display: 'block', color: '#7f8c8d', marginBottom: '5px' }}>Estoque (Qtd)</label>
                        <input type="number" required min="0" value={quantidade} onChange={e => setQuantidade(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #bdc3c7' }} />
                    </div>
                </div>

                {/* LINHA 3: Custos e Preços */}
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: '1' }}>
                        <label style={{ display: 'block', color: '#7f8c8d', marginBottom: '5px' }}>Preço de Custo (R$)</label>
                        <input type="number" required step="0.01" value={preco} onChange={e => setPreco(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #bdc3c7', backgroundColor: '#f9ebea' }} title="Usado para calcular o valor do patrimônio" />
                    </div>
                    <div style={{ flex: '1' }}>
                        <label style={{ display: 'block', color: '#7f8c8d', marginBottom: '5px' }}>Preço de Venda (R$)</label>
                        <input type="number" required step="0.01" value={precoVenda} onChange={e => setPrecoVenda(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #bdc3c7', backgroundColor: '#eafaf1' }} title="Preço que o cliente final vai pagar" />
                    </div>
                </div>

                {/* BOTÕES */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="submit" disabled={carregando} style={{ flex: '1', padding: '12px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {carregando ? 'A Salvar...' : '💾 Salvar Produto'}
                    </button>
                    <button type="button" onClick={aoCancelar} style={{ flex: '1', padding: '12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}