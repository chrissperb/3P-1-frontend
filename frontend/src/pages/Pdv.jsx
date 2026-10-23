import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Endereço fixo da loja (remetente da etiqueta)
const ENDERECO_LOJA = {
    name: "CHRISTIAN SPERB",
    address: "MANOEL DOMINGOS FERREIRA",
    city: "GAROPABA",
    state_abbr: "SC",
    district: "Campo Duna",
    complement: "Casa",
    number: "445"
};

const ENDERECO_DESTINO_VAZIO = {
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: ''
};

// Traduz o corpo de erro da API (inclusive validações da SuperFrete) em texto legível.
const extrairMensagemErro = (erro) => {
    if (!erro) return 'Falha no servidor';

    if (erro.errors && typeof erro.errors === 'object') {
        const detalhes = Object.entries(erro.errors).flatMap(([campo, mensagens]) => {
            const lista = Array.isArray(mensagens) ? mensagens : [mensagens];
            return lista.map(mensagem => `${campo}: ${mensagem}`);
        });

        if (detalhes.length > 0) return detalhes.join('\n');
    }

    if (Array.isArray(erro.message)) return erro.message.join('\n');
    return erro.message || erro.erro || erro.error || 'Falha no servidor';
};

const validarDestinatario = ({ nome, documento, email, cep, endereco }) => {
    const erros = [];

    if (!nome.trim()) erros.push('Nome do destinatário');

    const documentoLimpo = documento.replace(/\D/g, '');
    if (documentoLimpo.length !== 11 && documentoLimpo.length !== 14) {
        erros.push('CPF/CNPJ (11 ou 14 dígitos)');
    }

    if (!/^\d{8}$/.test(cep)) erros.push('CEP de destino (8 dígitos)');
    if (!endereco.logradouro.trim()) erros.push('Logradouro');
    if (!endereco.numero.trim()) erros.push('Número');
    if (!endereco.bairro.trim()) erros.push('Bairro');
    if (!endereco.cidade.trim()) erros.push('Cidade');
    if (!/^[A-Za-z]{2}$/.test(endereco.uf.trim())) erros.push('UF (2 letras)');

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        erros.push('E-mail válido');
    }

    return erros;
};

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

    // 📦 DADOS DO DESTINATÁRIO (ETIQUETA)
    const [documentoDestino, setDocumentoDestino] = useState('');
    const [emailDestino, setEmailDestino] = useState('');
    const [enderecoDestino, setEnderecoDestino] = useState(ENDERECO_DESTINO_VAZIO);
    const [buscandoCep, setBuscandoCep] = useState(false);

    // 🛡️ SEGURO / VALOR DECLARADO
    const [seguroAtivo, setSeguroAtivo] = useState(false);
    const [valorDeclarado, setValorDeclarado] = useState('');

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

    // 2.1 SEGURO: QUALQUER ALTERAÇÃO INVALIDA A COTAÇÃO ANTERIOR
    const limparOpcoesFrete = () => {
        setOpcoesFrete([]);
        setFreteSelecionado(0);
        setNomeFreteSelecionado('');
    };

    const alterarSeguro = (ativo) => {
        setSeguroAtivo(ativo);
        limparOpcoesFrete();
    };

    const alterarValorDeclarado = (valor) => {
        setValorDeclarado(valor);
        limparOpcoesFrete();
    };

    const obterValorSeguro = () => (seguroAtivo ? Number(valorDeclarado) : 0);

    const seguroValido = () => {
        if (!seguroAtivo) return true;
        const valor = Number(valorDeclarado);
        return Number.isFinite(valor) && valor > 0;
    };

    // 3. CALCULAR FRETE COM DIMENSÕES DINÂMICAS E CEP ORIGEM EDITÁVEL
    const calcularFrete = async () => {
        if (cepOrigem.length < 8 || cepDestino.length < 8) {
            alert("Por favor, insira um CEP válido.");
            return;
        }

        if (!seguroValido()) {
            alert("Informe um valor declarado maior que zero.");
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
                options: {
                    own_hand: false,
                    receipt: false,
                    insurance_value: obterValorSeguro(),
                    use_insurance_value: seguroAtivo
                },
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

    // 3.1 BUSCAR ENDEREÇO PELO CEP (ViaCEP) E PREENCHER O DESTINATÁRIO
    const alterarCepDestino = (valor) => {
        const cepLimpo = valor.replace(/\D/g, '');
        if (cepLimpo !== cepDestino) {
            setEnderecoDestino(ENDERECO_DESTINO_VAZIO);
        }
        setCepDestino(cepLimpo);
    };

    const atualizarEnderecoDestino = (campo, valor) => {
        setEnderecoDestino((enderecoAtual) => ({ ...enderecoAtual, [campo]: valor }));
    };

    const buscarEnderecoPorCep = async () => {
        const cepLimpo = cepDestino.replace(/\D/g, '');
        if (!/^\d{8}$/.test(cepLimpo)) return;

        setBuscandoCep(true);
        try {
            const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            if (!resposta.ok) return;

            const dados = await resposta.json();
            if (dados.erro) {
                alert("CEP não encontrado. Preencha o endereço manualmente.");
                return;
            }

            setEnderecoDestino((enderecoAtual) => ({
                ...enderecoAtual,
                logradouro: dados.logradouro || '',
                bairro: dados.bairro || '',
                cidade: dados.localidade || '',
                uf: dados.uf || ''
            }));
        } catch (erro) {
            console.error("Erro ao buscar CEP:", erro);
            alert("Não foi possível buscar o CEP. Preencha o endereço manualmente.");
        } finally {
            setBuscandoCep(false);
        }
    };

    // 3.2 GERAR E IMPRIMIR ETIQUETA SUPERFRETE
    const gerarEImprimirEtiqueta = async () => {
        const errosDestinatario = validarDestinatario({
            nome: cliente,
            documento: documentoDestino,
            email: emailDestino,
            cep: cepDestino,
            endereco: enderecoDestino
        });

        if (errosDestinatario.length > 0) {
            alert(`Preencha os dados do destinatário:\n- ${errosDestinatario.join('\n- ')}`);
            return;
        }

        if (!seguroValido()) {
            alert("Informe um valor declarado maior que zero.");
            return;
        }

        if (cepOrigem.length < 8) {
            alert("Por favor, insira um CEP de origem válido.");
            return;
        }

        setGerandoEtiqueta(true);
        try {
            const token = localStorage.getItem('token');

            const payloadEtiqueta = {
                from: {
                    ...ENDERECO_LOJA,
                    postal_code: cepOrigem.replace(/\D/g, '')
                },
                to: {
                    name: cliente.trim(),
                    address: enderecoDestino.logradouro.trim(),
                    city: enderecoDestino.cidade.trim(),
                    state_abbr: enderecoDestino.uf.trim().toUpperCase(),
                    postal_code: cepDestino.replace(/\D/g, ''),
                    email: emailDestino.trim(),
                    complement: enderecoDestino.complemento.trim(),
                    number: enderecoDestino.numero.trim(),
                    district: enderecoDestino.bairro.trim(),
                    document: documentoDestino.replace(/\D/g, '')
                },
                options: {
                    tags: [],
                    non_commercial: true,
                    insurance_value: obterValorSeguro(),
                    use_insurance_value: seguroAtivo
                },
                products: [{
                    name: 'Vestuário',
                    quantity: 1,
                    unitary_value: obterValorSeguro()
                }],
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
                const erro = await respostaEtiqueta.json().catch(() => null);
                console.error("Resposta de erro ao gerar etiqueta:", erro);
                alert(`Erro ao gerar etiqueta:\n${extrairMensagemErro(erro)}`);
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
                const erro = await respostaImpressao.json().catch(() => null);
                console.error("Resposta de erro ao buscar PDF da etiqueta:", erro);
                alert(`Erro ao buscar PDF da etiqueta:\n${extrairMensagemErro(erro)}`);
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
                logradouro: enderecoDestino.logradouro !== '' ? enderecoDestino.logradouro : 'Retirada na Loja',
                bairro: enderecoDestino.bairro !== '' ? enderecoDestino.bairro : '-',
                cidade: enderecoDestino.cidade !== '' ? enderecoDestino.cidade : 'Loja Física',
                estado: enderecoDestino.uf !== '' ? enderecoDestino.uf : 'LF'
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
                setDocumentoDestino('');
                setEmailDestino('');
                setEnderecoDestino(ENDERECO_DESTINO_VAZIO);
                setSeguroAtivo(false);
                setValorDeclarado('');
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

                        {/* DADOS DO DESTINATÁRIO E FRETE */}
                        <div className="frete-container">
                            <h4>📦 Dados do destinatário</h4>

                            <label className="frete-label" htmlFor="cliente">Nome do destinatário</label>
                            <input
                                id="cliente"
                                type="text"
                                value={cliente}
                                onChange={(e) => setCliente(e.target.value)}
                                className="frete-input frete-input-cliente"
                                placeholder="Ex: Maria da Silva"
                            />

                            <div className="frete-destinatario-grid">
                                <div>
                                    <label className="frete-label-sm" htmlFor="documentoDestino">CPF/CNPJ</label>
                                    <input
                                        id="documentoDestino"
                                        type="text"
                                        inputMode="numeric"
                                        value={documentoDestino}
                                        onChange={(e) => setDocumentoDestino(e.target.value.replace(/\D/g, ''))}
                                        className="frete-input"
                                        placeholder="Somente números"
                                    />
                                </div>
                                <div>
                                    <label className="frete-label-sm" htmlFor="emailDestino">E-mail (opcional)</label>
                                    <input
                                        id="emailDestino"
                                        type="email"
                                        value={emailDestino}
                                        onChange={(e) => setEmailDestino(e.target.value)}
                                        className="frete-input"
                                        placeholder="cliente@email.com"
                                    />
                                </div>
                                <div>
                                    <label className="frete-label-sm" htmlFor="cepDestino">CEP Destino</label>
                                    <input
                                        id="cepDestino"
                                        type="text"
                                        placeholder="CEP do Destino"
                                        maxLength="8"
                                        value={cepDestino}
                                        onChange={(e) => alterarCepDestino(e.target.value)}
                                        onBlur={buscarEnderecoPorCep}
                                        className="frete-input"
                                    />
                                </div>
                                <div>
                                    <label className="frete-label-sm" htmlFor="logradouroDestino">Logradouro</label>
                                    <input
                                        id="logradouroDestino"
                                        type="text"
                                        value={enderecoDestino.logradouro}
                                        onChange={(e) => atualizarEnderecoDestino('logradouro', e.target.value)}
                                        className="frete-input"
                                        placeholder="Rua, avenida..."
                                    />
                                </div>
                                <div>
                                    <label className="frete-label-sm" htmlFor="numeroDestino">Número</label>
                                    <input
                                        id="numeroDestino"
                                        type="text"
                                        value={enderecoDestino.numero}
                                        onChange={(e) => atualizarEnderecoDestino('numero', e.target.value)}
                                        className="frete-input"
                                        placeholder="123"
                                    />
                                </div>
                                <div>
                                    <label className="frete-label-sm" htmlFor="complementoDestino">Complemento</label>
                                    <input
                                        id="complementoDestino"
                                        type="text"
                                        value={enderecoDestino.complemento}
                                        onChange={(e) => atualizarEnderecoDestino('complemento', e.target.value)}
                                        className="frete-input"
                                        placeholder="Apto, casa..."
                                    />
                                </div>
                                <div className="frete-campo-largo">
                                    <label className="frete-label-sm" htmlFor="bairroDestino">Bairro</label>
                                    <input
                                        id="bairroDestino"
                                        type="text"
                                        value={enderecoDestino.bairro}
                                        onChange={(e) => atualizarEnderecoDestino('bairro', e.target.value)}
                                        className="frete-input"
                                        placeholder="Bairro"
                                    />
                                </div>
                                <div>
                                    <label className="frete-label-sm" htmlFor="cidadeDestino">Cidade</label>
                                    <input
                                        id="cidadeDestino"
                                        type="text"
                                        value={enderecoDestino.cidade}
                                        onChange={(e) => atualizarEnderecoDestino('cidade', e.target.value)}
                                        className="frete-input"
                                        placeholder="Cidade"
                                    />
                                </div>
                                <div>
                                    <label className="frete-label-sm" htmlFor="ufDestino">UF</label>
                                    <input
                                        id="ufDestino"
                                        type="text"
                                        maxLength="2"
                                        value={enderecoDestino.uf}
                                        onChange={(e) => atualizarEnderecoDestino('uf', e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase())}
                                        className="frete-input"
                                        placeholder="SC"
                                    />
                                </div>
                            </div>

                            {buscandoCep && <p className="frete-cep-status">Buscando endereço pelo CEP...</p>}

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

                            {/* 🛡️ SEGURO / VALOR DECLARADO */}
                            <div className="frete-seguro-row">
                                <label className="switch" htmlFor="seguroAtivo">
                                    <input
                                        id="seguroAtivo"
                                        type="checkbox"
                                        role="switch"
                                        aria-label="Adicionar seguro (valor declarado)"
                                        checked={seguroAtivo}
                                        onChange={(e) => alterarSeguro(e.target.checked)}
                                    />
                                    <span className="switch-slider" aria-hidden="true"></span>
                                </label>
                                <span className="frete-label-sm">Adicionar seguro (valor declarado)</span>
                            </div>

                            {seguroAtivo && (
                                <div className="frete-seguro-valor">
                                    <label className="frete-label-sm" htmlFor="valorDeclarado">Valor declarado (R$)</label>
                                    <input
                                        id="valorDeclarado"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={valorDeclarado}
                                        onChange={(e) => alterarValorDeclarado(e.target.value)}
                                        className="frete-input"
                                        placeholder="0,00"
                                    />
                                </div>
                            )}

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