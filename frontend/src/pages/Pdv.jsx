import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Pdv() {
    const [produtos, setProdutos] = useState([]);
    const [categoriaAtiva, setCategoriaAtiva] = useState('Todas');
    const [carrinho, setCarrinho] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [carrinhoAbertoMobile, setCarrinhoAbertoMobile] = useState(false);

    // Estados do Cliente e Finalização
    const [cliente, setCliente] = useState('');
    const [finalizando, setFinalizando] = useState(false);

    // 🦋 ESTADOS DO FRETE E DIMENSÕES DO PACOTE
    const [cepOrigem, setCepOrigem] = useState('88495000');
    const [cepDestino, setCepDestino] = useState('');
    const [pesoCaixa, setPesoCaixa] = useState('0.3');
    const [alturaCaixa, setAlturaCaixa] = useState('4');
    const [larguraCaixa, setLarguraCaixa] = useState('11');
    const [comprimentoCaixa, setComprimentoCaixa] = useState('16');

    const [opcoesFrete, setOpcoesFrete] = useState([]);
    const [freteSelecionado, setFreteSelecionado] = useState(0);
    const [nomeFreteSelecionado, setNomeFreteSelecionado] = useState('');
    const [servicoFreteId, setServicoFreteId] = useState(1);
    const [carregandoFrete, setCarregandoFrete] = useState(false);
    const [gerandoEtiqueta, setGerandoEtiqueta] = useState(false);

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // 3. CALCULAR FRETE COM DIMENSÕES DINÂMICAS E CEP ORIGEM EDITÁVEL
    const calcularFrete = async () => {
        if (cepOrigem.length < 8 || cepDestino.length < 8) {
            alert("Por favor, insira um CEP válido.");
            return;
        }

        setCarregandoFrete(true);
        setOpcoesFrete([]);

        try {
            const token = localStorage.getItem('token');

            // Usando os estados das dimensões e CEP de origem preenchidos pelo usuário
            const payload = {
                from: { postal_code: cepOrigem.replace(/\D/g, '') },
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

    // 3.1 GERAR E IMPRIMIR ETIQUETA SUPERFRETE
    const gerarEImprimirEtiqueta = async () => {
        if (cepOrigem.length < 8 || cepDestino.length < 8) {
            alert("Por favor, insira CEPs de origem e destino válidos.");
            return;
        }

        setGerandoEtiqueta(true);
        try {
            const token = localStorage.getItem('token');

            const payloadEtiqueta = {
                from: {
                    name: "CHRISTIAN SPERB",
                    address: "MANOEL DOMINGOS FERREIRA",
                    city: "GAROPABA",
                    state_abbr: "SC",
                    postal_code: cepOrigem.replace(/\D/g, ''),
                    district: "Campo Duna",
                    complement: "Casa",
                    number: "445"
                },
                to: {
                    name: cliente.trim() !== '' ? cliente : "Consumidor Final",
                    address: "MANOEL DOMINGOS FERREIRA",
                    city: "GAROPABA",
                    state_abbr: "SC",
                    postal_code: cepDestino.replace(/\D/g, ''),
                    email: "suporte@borbolelala.com.br",
                    complement: "",
                    number: "100",
                    district: "Centro",
                    document: "00000000000"
                },
                options: {
                    tags: []
                },
                volumes: {
                    height: parseFloat(alturaCaixa) || 4,
                    width: parseFloat(larguraCaixa) || 11,
                    length: parseFloat(comprimentoCaixa) || 16,
                    weight: parseFloat(pesoCaixa) || 0.3
                },
                platform: "Borbolêlalá Moda Infantil",
                service: servicoFreteId || 1
            };

            const respostaEtiqueta = await fetch(`${import.meta.env.VITE_API_URL}/frete/etiqueta`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payloadEtiqueta)
            });

            if (!respostaEtiqueta.ok) {
                const erro = await respostaEtiqueta.json();
                alert(`Erro ao gerar etiqueta: ${erro.message || erro.erro || 'Falha no servidor'}`);
                return;
            }

            const dadosEtiqueta = await respostaEtiqueta.json();
            const tagId = dadosEtiqueta.id || (dadosEtiqueta.orders && dadosEtiqueta.orders[0]) || dadosEtiqueta.order_id;

            if (!tagId) {
                alert("Erro: ID de etiqueta não retornado pela SuperFrete.");
                return;
            }

            const respostaImpressao = await fetch(`${import.meta.env.VITE_API_URL}/frete/imprimir`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orders: [tagId] })
            });

            if (!respostaImpressao.ok) {
                const erro = await respostaImpressao.json();
                alert(`Erro ao buscar PDF da etiqueta: ${erro.message || erro.erro || 'Falha no servidor'}`);
                return;
            }

            const dadosImpressao = await respostaImpressao.json();
            const downloadUrl = dadosImpressao.url || dadosImpressao.link;

            if (downloadUrl) {
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.download = `etiqueta-${tagId}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                alert("Etiqueta gerada com sucesso!");
            }
        } catch (erro) {
            console.error("Erro na geração de etiqueta:", erro);
            alert("Erro de conexão ao gerar/imprimir etiqueta.");
        } finally {
            setGerandoEtiqueta(false);
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
                setCarrinhoAbertoMobile(false);

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
        <div className="pdv-container">
            {/* LADO ESQUERDO: CATÁLOGO */}
            <div className="pdv-catalogo">
                <h2 className="pdv-titulo">🛍️ Frente de Caixa</h2>

                <div className="pdv-categorias">
                    {categorias.map(cat => (
                        <button key={cat} onClick={() => setCategoriaAtiva(cat)} className={`btn-categoria ${categoriaAtiva === cat ? 'ativo' : ''}`}>
                            {cat}
                        </button>
                    ))}
                </div>

                {carregando ? (
                    <p>A carregar catálogo...</p>
                ) : (
                    <div className="pdv-grid-produtos">
                        {produtosFiltrados.map(produto => (
                            <div key={produto._id || produto.id} className="card-produto">
                                <div className="card-produto-topo">
                                    <h4 className="card-produto-nome">{produto.nome}</h4>
                                    <p className="card-produto-estoque">Estoque: {produto.quantidade}</p>
                                </div>
                                <div className="card-produto-base">
                                    <p className="card-produto-preco">
                                        R$ {produto.precoVenda.toFixed(2)}
                                    </p>
                                    <button onClick={() => adicionarAoCarrinho(produto)} className="btn-adicionar">
                                        + Adicionar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* LADO DIREITO: CARRINHO E CHECKOUT */}
            <div className={`pdv-checkout-sidebar ${carrinhoAbertoMobile ? 'carrinho-aberto' : ''}`}>
                <div className="sidebar-header-mobile">
                    <h3 className="checkout-titulo">
                        🛒 Carrinho e Entrega
                    </h3>
                    <button
                        onClick={() => setCarrinhoAbertoMobile(false)}
                        className="btn-fechar-carrinho-mobile"
                        aria-label="Fechar carrinho"
                    >
                        ✕
                    </button>
                </div>

                {carrinho.length === 0 ? (
                    <p className="carrinho-vazio">O carrinho está vazio.</p>
                ) : (
                    <>
                        <div className="carrinho-itens">
                            {carrinho.map(item => (
                                <div key={item.id} className="carrinho-item">
                                    <div className="carrinho-item-info">
                                        <p>{item.nome}</p>
                                        <p>{item.quantidadeComprada}x R$ {item.precoVenda.toFixed(2)}</p>
                                    </div>
                                    <button onClick={() => removerDoCarrinho(item.id)} className="btn-remover-item">🗑️</button>
                                </div>
                            ))}
                        </div>

                        {/* DADOS OPCIONAIS E FRETE */}
                        <div className="frete-container">
                            <label className="frete-label">👤 Nome do Cliente (Opcional):</label>
                            <input type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} className="frete-input frete-input-cliente" placeholder="Ex: Consumidor Final" />

                            <h4>🚚 Cálculo de Frete</h4>

                            {/* 🦋 GRID COMPACTO DE DIMENSÕES */}
                            <div className="frete-dimensoes-grid">
                                <div>
                                    <label>Peso (kg)</label>
                                    <input type="number" step="0.1" value={pesoCaixa} onChange={(e) => setPesoCaixa(e.target.value)} />
                                </div>
                                <div>
                                    <label>Altura (cm)</label>
                                    <input type="number" value={alturaCaixa} onChange={(e) => setAlturaCaixa(e.target.value)} />
                                </div>
                                <div>
                                    <label>Largura (cm)</label>
                                    <input type="number" value={larguraCaixa} onChange={(e) => setLarguraCaixa(e.target.value)} />
                                </div>
                                <div>
                                    <label>Comprim. (cm)</label>
                                    <input type="number" value={comprimentoCaixa} onChange={(e) => setComprimentoCaixa(e.target.value)} />
                                </div>
                            </div>

                            <div className="frete-ceps-grid">
                                <div>
                                    <label className="frete-label-sm">CEP Origem</label>
                                    <input
                                        type="text"
                                        placeholder="CEP Origem"
                                        maxLength="8"
                                        value={cepOrigem}
                                        onChange={(e) => setCepOrigem(e.target.value.replace(/\D/g, ''))}
                                        className="frete-input frete-input-cep"
                                    />
                                </div>
                                <div>
                                    <label className="frete-label-sm">CEP Destino</label>
                                    <input
                                        type="text"
                                        placeholder="CEP do Destino"
                                        maxLength="8"
                                        value={cepDestino}
                                        onChange={(e) => setCepDestino(e.target.value.replace(/\D/g, ''))}
                                        className="frete-input frete-input-cep"
                                    />
                                </div>
                            </div>

                            <div className="frete-busca-row">
                                <button onClick={calcularFrete} disabled={carregandoFrete || cepOrigem.length !== 8 || cepDestino.length !== 8} className="btn-buscar-frete" style={{ width: '100%' }}>
                                    {carregandoFrete ? '⏳ Buscando...' : '🚚 Buscar Frete'}
                                </button>
                            </div>

                            {/* OPÇÕES DE FRETE RETORNADAS PELA API E BOTÃO DE ETIQUETA */}
                            {opcoesFrete.length > 0 && (
                                <div className="frete-opcoes">
                                    {opcoesFrete.filter(opcao => !opcao.error && !opcao.has_error && opcao.price).map((opcao, index) => (
                                        <label key={index} className="frete-opcao-item">
                                            <input
                                                type="radio"
                                                name="opcaoFrete"
                                                value={opcao.price}
                                                onChange={() => {
                                                    setFreteSelecionado(parseFloat(opcao.price));
                                                    setNomeFreteSelecionado(opcao.name);
                                                    setServicoFreteId(opcao.id || opcao.service || 1);
                                                }}
                                            />
                                            <div>
                                                <strong>{opcao.name} - R$ {parseFloat(opcao.price).toFixed(2)}</strong>
                                                <span>Entrega em média {opcao.delivery_time} dias úteis</span>
                                            </div>
                                        </label>
                                    ))}

                                    <button
                                        onClick={gerarEImprimirEtiqueta}
                                        disabled={gerandoEtiqueta || cepOrigem.length !== 8 || cepDestino.length !== 8}
                                        className="btn-gerar-etiqueta"
                                        style={{ width: '100%', marginTop: '12px' }}
                                    >
                                        {gerandoEtiqueta ? '⏳ Gerando...' : '🏷️ Gerar etiqueta de frete'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* TOTAIS E CHECKOUT */}
                        <div className="checkout-totais">
                            <div className="total-linha">
                                <span>Subtotal:</span>
                                <span>R$ {subtotalProdutos.toFixed(2)}</span>
                            </div>
                            <div className="total-linha">
                                <span>Frete ({nomeFreteSelecionado || 'Nenhum'}):</span>
                                <span>R$ {freteSelecionado.toFixed(2)}</span>
                            </div>
                            <div className="total-linha-destaque">
                                <span>Total Geral:</span>
                                <span>R$ {totalFinal.toFixed(2)}</span>
                            </div>
                            <button onClick={finalizarVenda} disabled={finalizando} className="btn-finalizar-venda">
                                {finalizando ? 'A Processar...' : '✅ Finalizar Venda'}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Botão Flutuante de Carrinho para Mobile */}
            <button
                className="floating-cart-button"
                onClick={() => setCarrinhoAbertoMobile(true)}
                aria-label="Abrir carrinho"
                data-testid="floating-cart-btn"
            >
                <span className="cart-icon">🛒</span>
                {carrinho.length > 0 && (
                    <span className="cart-badge">
                        {carrinho.reduce((acc, item) => acc + item.quantidadeComprada, 0)}
                    </span>
                )}
            </button>
        </div>
    );
}