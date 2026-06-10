import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Pdv() {
    const [produtos, setProdutos] = useState([]);
    const [categoriaAtiva, setCategoriaAtiva] = useState('Todas');
    const [carrinho, setCarrinho] = useState([]);
    const [carregando, setCarregando] = useState(true);

    // Estados do Cliente e Finalização
    const [cliente, setCliente] = useState('');
    const [finalizando, setFinalizando] = useState(false);

    // 🦋 ESTADOS DO FRETE E DIMENSÕES DO PACOTE
    const [cepDestino, setCepDestino] = useState('');
    const [pesoCaixa, setPesoCaixa] = useState('0.3');
    const [alturaCaixa, setAlturaCaixa] = useState('4');
    const [larguraCaixa, setLarguraCaixa] = useState('11');
    const [comprimentoCaixa, setComprimentoCaixa] = useState('16');

    const [opcoesFrete, setOpcoesFrete] = useState([]);
    const [freteSelecionado, setFreteSelecionado] = useState(0);
    const [nomeFreteSelecionado, setNomeFreteSelecionado] = useState('');
    const [carregandoFrete, setCarregandoFrete] = useState(false);

    const navigate = useNavigate();

    // 1. Buscar Produtos
    const buscarProdutos = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/login'); return; }

            const resposta = await fetch(import.meta.env.VITE_API_URL + '/produtos', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (resposta.status === 401 || resposta.status === 403) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            const dados = await resposta.json();
            const produtosDisponiveis = dados.filter(p => p.id != null && p.quantidade > 0);
            setProdutos(produtosDisponiveis);
        } catch (erro) {
            console.error("Erro ao buscar catálogo:", erro);
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => { buscarProdutos(); }, []);

    const categorias = ['Todas', ...new Set(produtos.map(p => p.categoria))];
    const produtosFiltrados = categoriaAtiva === 'Todas' ? produtos : produtos.filter(p => p.categoria === categoriaAtiva);

    // 2. Lógica do Carrinho
    const adicionarAoCarrinho = (produto) => {
        setCarrinho((carrinhoAtual) => {
            const itemExistente = carrinhoAtual.find(item => item.id === produto.id);
            if (itemExistente) {
                if (itemExistente.quantidadeComprada >= produto.quantidade) {
                    alert('Estoque máximo atingido para este produto!');
                    return carrinhoAtual;
                }
                return carrinhoAtual.map(item => item.id === produto.id ? { ...item, quantidadeComprada: item.quantidadeComprada + 1 } : item);
            }
            return [...carrinhoAtual, { ...produto, quantidadeComprada: 1 }];
        });
    };

    const removerDoCarrinho = (produtoId) => setCarrinho(carrinho.filter(item => item.id !== produtoId));

    const subtotalProdutos = carrinho.reduce((acc, item) => acc + (item.precoVenda * item.quantidadeComprada), 0);
    const totalFinal = subtotalProdutos + freteSelecionado;

    // 3. CALCULAR FRETE COM DIMENSÕES DINÂMICAS
    const calcularFrete = async () => {
        if (cepDestino.length < 8) {
            alert("Por favor, insira um CEP válido.");
            return;
        }

        setCarregandoFrete(true);
        setOpcoesFrete([]);

        try {
            const token = localStorage.getItem('token');

            // Usando os estados das dimensões preenchidas pelo usuário
            const payload = {
                from: { postal_code: "88495000" },
                to: { postal_code: cepDestino.replace(/\D/g, '') },
                services: "1,2,17",
                options: { own_hand: false, receipt: false, insurance_value: 0, use_insurance_value: false },
                package: {
                    weight: parseFloat(pesoCaixa) || 0.3,
                    height: parseFloat(alturaCaixa) || 4,
                    width: parseFloat(larguraCaixa) || 11,
                    length: parseFloat(comprimentoCaixa) || 16
                }
            };

            const resposta = await fetch(`${import.meta.env.VITE_API_URL}/frete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (resposta.ok) {
                const dados = await resposta.json();
                setOpcoesFrete(dados);
            } else {
                alert("Erro ao calcular o frete. Verifique o CEP e as dimensões.");
            }
        } catch (erro) {
            console.error("Erro na API de frete:", erro);
            alert("Erro de conexão ao calcular frete.");
        } finally {
            setCarregandoFrete(false);
        }
    };

    // 4. FINALIZAR VENDA
    const finalizarVenda = async () => {
        if (carrinho.length === 0) return;
        setFinalizando(true);

        const pedido = {
            cliente: cliente.trim() !== '' ? cliente : 'Consumidor Final',
            itens: carrinho.map(item => ({
                produtoId: item.id,
                quantidade: item.quantidadeComprada
            })),
            endereco: {
                cep: cepDestino !== '' ? cepDestino : '00000000',
                logradouro: cepDestino !== '' ? 'Endereço a confirmar' : 'Retirada na Loja',
                cidade: cepDestino !== '' ? 'A confirmar' : 'Loja Física',
                estado: cepDestino !== '' ? 'NI' : 'LF'
            },
            frete: freteSelecionado // Salvamos o frete no banco para relatórios
        };

        try {
            const token = localStorage.getItem('token');
            const resposta = await fetch(import.meta.env.VITE_API_URL + '/pedidos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(pedido)
            });

            if (resposta.ok) {
                alert('🎉 Venda finalizada com sucesso! Estoque atualizado.');

                // Limpeza do carrinho
                setCarrinho([]);
                setCliente('');
                setCepDestino('');
                setFreteSelecionado(0);
                setNomeFreteSelecionado('');
                setOpcoesFrete([]);

                buscarProdutos();
            } else {
                const erro = await resposta.json();
                alert(`Erro: ${erro.mensagem || erro.erro || 'Não foi possível finalizar.'}`);
            }
        } catch (erro) {
            console.error(erro);
            alert("Erro de conexão com o servidor.");
        } finally {
            setFinalizando(false);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {/* LADO ESQUERDO: CATÁLOGO */}
            <div style={{ flex: '1 1 60%', minWidth: '300px' }}>
                <h2 style={{ color: '#2c3e50', marginTop: 0 }}>🛍️ Frente de Caixa</h2>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    {categorias.map(cat => (
                        <button key={cat} onClick={() => setCategoriaAtiva(cat)} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', textTransform: 'capitalize', backgroundColor: categoriaAtiva === cat ? '#9b59b6' : '#ecf0f1', color: categoriaAtiva === cat ? '#fff' : '#2c3e50' }}>
                            {cat}
                        </button>
                    ))}
                </div>

                {carregando ? (
                    <p>A carregar catálogo...</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                        {produtosFiltrados.map(produto => (
                            <div key={produto._id || produto.id} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', color: '#34495e' }}>{produto.nome}</h4>
                                    <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#7f8c8d' }}>Estoque: {produto.quantidade}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 15px 0', color: '#27ae60', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                        R$ {produto.precoVenda.toFixed(2)}
                                    </p>
                                    <button onClick={() => adicionarAoCarrinho(produto)} style={{ width: '100%', padding: '10px', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        + Adicionar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* LADO DIREITO: CARRINHO E CHECKOUT */}
            <div style={{ flex: '1 1 30%', minWidth: '300px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', alignSelf: 'flex-start' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' }}>
                    🛒 Carrinho e Entrega
                </h3>

                {carrinho.length === 0 ? (
                    <p style={{ color: '#7f8c8d', textAlign: 'center' }}>O carrinho está vazio.</p>
                ) : (
                    <>
                        <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '20px' }}>
                            {carrinho.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #f9f9f9', paddingBottom: '10px' }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem', color: '#34495e' }}>{item.nome}</p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#7f8c8d' }}>{item.quantidadeComprada}x R$ {item.precoVenda.toFixed(2)}</p>
                                    </div>
                                    <button onClick={() => removerDoCarrinho(item.id)} style={{ backgroundColor: 'transparent', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</button>
                                </div>
                            ))}
                        </div>

                        {/* DADOS OPCIONAIS E FRETE */}
                        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fdf2f7', borderRadius: '6px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '5px' }}>👤 Nome do Cliente (Opcional):</label>
                            <input type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '15px', border: '1px solid #bdc3c7', borderRadius: '4px' }} placeholder="Ex: Consumidor Final" />

                            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#34495e' }}>🚚 Cálculo de Frete</h4>

                            {/* 🦋 GRID COMPACTO DE DIMENSÕES */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>Peso (kg)</label>
                                    <input type="number" step="0.1" value={pesoCaixa} onChange={(e) => setPesoCaixa(e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #bdc3c7', borderRadius: '4px', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>Altura (cm)</label>
                                    <input type="number" value={alturaCaixa} onChange={(e) => setAlturaCaixa(e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #bdc3c7', borderRadius: '4px', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>Largura (cm)</label>
                                    <input type="number" value={larguraCaixa} onChange={(e) => setLarguraCaixa(e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #bdc3c7', borderRadius: '4px', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: '#7f8c8d' }}>Comprim. (cm)</label>
                                    <input type="number" value={comprimentoCaixa} onChange={(e) => setComprimentoCaixa(e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #bdc3c7', borderRadius: '4px', boxSizing: 'border-box' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '5px' }}>
                                <input type="text" placeholder="CEP do Destino" maxLength="8" value={cepDestino} onChange={(e) => setCepDestino(e.target.value.replace(/\D/g, ''))} style={{ flex: '1', padding: '8px', border: '1px solid #bdc3c7', borderRadius: '4px' }} />
                                <button onClick={calcularFrete} disabled={carregandoFrete || cepDestino.length !== 8} style={{ padding: '8px 12px', backgroundColor: '#9b59b6', color: '#fff', border: 'none', borderRadius: '4px', cursor: (carregandoFrete || cepDestino.length !== 8) ? 'not-allowed' : 'pointer' }}>
                                    {carregandoFrete ? '⏳' : 'Buscar'}
                                </button>
                            </div>

                            {/* OPÇÕES DE FRETE RETORNADAS PELA API */}
                            {opcoesFrete.length > 0 && (
                                <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {opcoesFrete.filter(opcao => !opcao.error && !opcao.has_error && opcao.price).map((opcao, index) => (
                                        <label key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#34495e', cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                name="opcaoFrete"
                                                value={opcao.price}
                                                onChange={() => {
                                                    setFreteSelecionado(parseFloat(opcao.price));
                                                    setNomeFreteSelecionado(opcao.name);
                                                }}
                                            />
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <strong>{opcao.name} - R$ {parseFloat(opcao.price).toFixed(2)}</strong>
                                                <span style={{ color: '#7f8c8d', fontSize: '0.75rem' }}>Entrega em média {opcao.delivery_time} dias úteis</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* TOTAIS E CHECKOUT */}
                        <div style={{ borderTop: '2px solid #ecf0f1', paddingTop: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem', color: '#7f8c8d' }}>
                                <span>Subtotal:</span>
                                <span>R$ {subtotalProdutos.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem', color: '#7f8c8d' }}>
                                <span>Frete ({nomeFreteSelecionado || 'Nenhum'}):</span>
                                <span>R$ {freteSelecionado.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.2rem', fontWeight: 'bold', color: '#2c3e50' }}>
                                <span>Total Geral:</span>
                                <span>R$ {totalFinal.toFixed(2)}</span>
                            </div>
                            <button onClick={finalizarVenda} disabled={finalizando} style={{ width: '100%', padding: '15px', backgroundColor: finalizando ? '#95a5a6' : '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1.1rem', fontWeight: 'bold', cursor: finalizando ? 'not-allowed' : 'pointer' }}>
                                {finalizando ? 'A Processar...' : '✅ Finalizar Venda'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}