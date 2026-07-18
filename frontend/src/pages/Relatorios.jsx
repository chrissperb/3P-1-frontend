import React, { useState, useEffect, useMemo, Fragment } from 'react';
import CardResumo from '../components/CardResumo';
import { useNavigate } from 'react-router-dom';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

const formatarDataInput = (data) => {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
};

export default function Relatorios() {
    const [todosProdutos, setTodosProdutos] = useState([]);
    const [todosPedidos, setTodosPedidos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [pedidoExpandido, setPedidoExpandido] = useState(null);
    const [busca, setBusca] = useState('');
    const [maisVendidosAberto, setMaisVendidosAberto] = useState(false);
    const [menosVendidosAberto, setMenosVendidosAberto] = useState(false);
    const [estoqueBaixoAberto, setEstoqueBaixoAberto] = useState(false);

    const handleToggleKeyDown = (e, setter, valorAtual) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setter(!valorAtual);
        }
    };

    // Filtro rápido e datas customizadas
    const [filtroRapido, setFiltroRapido] = useState('7d');
    const [dataInicial, setDataInicial] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return formatarDataInput(d);
    });
    const [dataFinal, setDataFinal] = useState(() => {
        return formatarDataInput(new Date());
    });

    const navigate = useNavigate();

    useEffect(() => {
        let isInitial = true;
        const buscarDadosDoSistema = async () => {
            if (isInitial) setCarregando(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) { navigate('/login'); return; }

                const headers = { 'Authorization': `Bearer ${token}` };

                const [resProdutos, resPedidos] = await Promise.all([
                    fetch(import.meta.env.VITE_API_URL + '/produtos', { headers }),
                    fetch(import.meta.env.VITE_API_URL + '/pedidos', { headers })
                ]);

                if (resProdutos.ok && resPedidos.ok) {
                    const produtos = await resProdutos.json();
                    const pedidos = await resPedidos.json();

                    setTodosProdutos(produtos);
                    setTodosPedidos(pedidos);
                }
            } catch (erro) {
                console.error("Erro ao buscar dados:", erro);
            } finally {
                if (isInitial) {
                    setCarregando(false);
                    isInitial = false;
                }
            }
        };

        buscarDadosDoSistema();

        const intervalId = setInterval(buscarDadosDoSistema, 5000);
        return () => clearInterval(intervalId);
    }, [navigate]);

    const aplicarFiltroRapido = (tipo) => {
        setFiltroRapido(tipo);
        const fim = new Date();
        if (tipo === '7d') {
            const inicio = new Date();
            inicio.setDate(fim.getDate() - 7);
            setDataInicial(formatarDataInput(inicio));
            setDataFinal(formatarDataInput(fim));
        } else if (tipo === '30d') {
            const inicio = new Date();
            inicio.setDate(fim.getDate() - 30);
            setDataInicial(formatarDataInput(inicio));
            setDataFinal(formatarDataInput(fim));
        } else if (tipo === 'mes') {
            const inicio = new Date(fim.getFullYear(), fim.getMonth(), 1);
            const ultimoDia = new Date(fim.getFullYear(), fim.getMonth() + 1, 0);
            setDataInicial(formatarDataInput(inicio));
            setDataFinal(formatarDataInput(ultimoDia));
        } else if (tipo === 'todo') {
            setDataInicial('');
            setDataFinal('');
        }
    };

    const handleDataInicialChange = (e) => {
        setDataInicial(e.target.value);
        setFiltroRapido('');
    };

    const handleDataFinalChange = (e) => {
        setDataFinal(e.target.value);
        setFiltroRapido('');
    };

    const atualizarStatusPedido = async (pedidoId, novoStatus) => {
        try {
            const token = localStorage.getItem('token');
            const resposta = await fetch(import.meta.env.VITE_API_URL + '/pedidos/' + pedidoId + '/status', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: novoStatus })
            });

            if (resposta.ok) {
                setTodosPedidos(listaAtual =>
                    listaAtual.map(pedido =>
                        pedido._id === pedidoId ? { ...pedido, status: novoStatus } : pedido
                    )
                );
            } else {
                alert("Erro ao atualizar o status no servidor.");
            }
        } catch (erro) {
            console.error(erro);
            alert("Erro de conexão ao tentar atualizar.");
        }
    };

    const deletarPedido = async (pedidoId) => {
        if (!window.confirm("Tem certeza que deseja excluir este pedido definitivamente?")) return;
        try {
            const token = localStorage.getItem('token');
            const resposta = await fetch(import.meta.env.VITE_API_URL + '/pedidos/' + pedidoId, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (resposta.ok) {
                setTodosPedidos(listaAtual =>
                    listaAtual.filter(pedido => pedido._id !== pedidoId)
                );
            } else {
                alert("Erro ao excluir o pedido no servidor.");
            }
        } catch (erro) {
            console.error(erro);
            alert("Erro de conexão ao tentar excluir.");
        }
    };

    const alternarDetalhes = (id) => {
        setPedidoExpandido(pedidoExpandido === id ? null : id);
    };

    const formatarData = (dataString) => {
        if (!dataString) return '--/--/----';
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-PT') + ' às ' + data.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    };

    const obterEstiloStatus = (status) => {
        switch (status) {
            case 'Pendente': return { bg: 'rgba(254, 249, 231, 0.65)', cor: '#f1c40f' };
            case 'Enviado': return { bg: 'rgba(243, 229, 245, 0.65)', cor: '#9b59b6' };
            case 'Entregue': return { bg: 'rgba(232, 248, 245, 0.65)', cor: '#1abc9c' };
            case 'Cancelado': return { bg: 'rgba(252, 228, 236, 0.65)', cor: '#e91e63' };
            case 'Pago':
            default: return { bg: 'rgba(234, 250, 241, 0.65)', cor: '#2ecc71' };
        }
    };

    // Computações em Memória via useMemo
    const pedidosFiltrados = useMemo(() => {
        return todosPedidos.filter(pedido => {
            if (!pedido.createdAt) return false;
            const dataLocal = new Date(pedido.createdAt);
            const dataPedidoStr = formatarDataInput(dataLocal);
            if (dataInicial && dataPedidoStr < dataInicial) return false;
            if (dataFinal && dataPedidoStr > dataFinal) return false;
            return true;
        });
    }, [todosPedidos, dataInicial, dataFinal]);

    const pedidosOrdenados = useMemo(() => {
        return [...pedidosFiltrados].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [pedidosFiltrados]);

    const pedidosFiltradosPorBusca = useMemo(() => {
        const query = busca.trim().toLowerCase();
        if (!query) return pedidosOrdenados;

        return pedidosOrdenados.filter(pedido => {
            const cliente = (pedido.cliente || 'Consumidor Final').toLowerCase();
            const status = (pedido.status || 'Pago').toLowerCase();

            const matchesCliente = cliente.includes(query);
            const matchesStatus = status.includes(query);

            const matchesItens = pedido.itens
                ? pedido.itens.some(item =>
                    (item.nome || `Produto #${item.produtoId}`).toLowerCase().includes(query)
                )
                : false;

            return matchesCliente || matchesStatus || matchesItens;
        });
    }, [pedidosOrdenados, busca]);

    const valorEstoque = useMemo(() => {
        return todosProdutos.reduce((acc, p) => {
            const qtd = Number(p.quantidade) || 0;
            const precoCusto = Number(p.preco) || 0;
            return acc + (qtd * precoCusto);
        }, 0);
    }, [todosProdutos]);

    const pedidosValidos = useMemo(() => {
        return pedidosFiltrados.filter(pedido => pedido.status !== 'Cancelado');
    }, [pedidosFiltrados]);

    const faturamentoLiquido = useMemo(() => {
        return pedidosValidos.reduce((acc, p) => acc + (p.totalFinal || 0), 0);
    }, [pedidosValidos]);

    const totalPedidosValidos = useMemo(() => {
        return pedidosValidos.length;
    }, [pedidosValidos]);

    const ticketMedio = useMemo(() => {
        return totalPedidosValidos > 0 ? (faturamentoLiquido / totalPedidosValidos) : 0;
    }, [faturamentoLiquido, totalPedidosValidos]);

    // Top Selling (Mais vendidos)
    const produtosMaisVendidos = useMemo(() => {
        const vendas = {};
        pedidosValidos.forEach(pedido => {
            if (pedido.itens) {
                pedido.itens.forEach(item => {
                    const key = item.produtoId || item.nome || 'Desconhecido';
                    if (!vendas[key]) {
                        vendas[key] = {
                            nome: item.nome || `Produto #${item.produtoId}`,
                            quantidade: 0,
                            faturamento: 0
                        };
                    }
                    vendas[key].quantidade += item.quantidade || 0;
                    const subtotal = item.subtotal ? item.subtotal : (item.precoUnitario || 0) * (item.quantidade || 0);
                    vendas[key].faturamento += subtotal;
                });
            }
        });

        return Object.values(vendas)
            .sort((a, b) => b.quantidade - a.quantidade);
    }, [pedidosValidos]);

    // Less Selling (Menos vendidos)
    const produtosMenosVendidos = useMemo(() => {
        const vendas = {};
        todosProdutos.forEach(p => {
            const key = p._id || p.id || p.nome;
            if (key) {
                vendas[key] = {
                    nome: p.nome,
                    quantidade: 0,
                    faturamento: 0
                };
            }
        });

        pedidosValidos.forEach(pedido => {
            if (pedido.itens) {
                pedido.itens.forEach(item => {
                    let key = item.produtoId;
                    if (!key || !vendas[key]) {
                        const dbProd = todosProdutos.find(p => p.nome === item.nome);
                        key = dbProd ? (dbProd._id || dbProd.id) : (item.produtoId || item.nome);
                    }
                    if (!vendas[key]) {
                        vendas[key] = {
                            nome: item.nome || `Produto #${item.produtoId}`,
                            quantidade: 0,
                            faturamento: 0
                        };
                    }
                    vendas[key].quantidade += item.quantidade || 0;
                    const subtotal = item.subtotal ? item.subtotal : (item.precoUnitario || 0) * (item.quantidade || 0);
                    vendas[key].faturamento += subtotal;
                });
            }
        });

        return Object.values(vendas)
            .sort((a, b) => a.quantidade - b.quantidade);
    }, [pedidosValidos, todosProdutos]);

    // Stock health
    const saudeDoEstoque = useMemo(() => {
        return todosProdutos.filter(p => p.quantidade <= 5);
    }, [todosProdutos]);

    // Trend chart data
    const obterDatasNoIntervalo = (inicioStr, fimStr) => {
        const datas = [];
        if (!inicioStr || !fimStr) {
            if (todosPedidos.length === 0) return [];
            const datasPedidos = todosPedidos
                .map(p => p.createdAt ? p.createdAt.substring(0, 10) : null)
                .filter(Boolean);
            if (datasPedidos.length === 0) return [];
            datasPedidos.sort();
            inicioStr = datasPedidos[0];
            fimStr = datasPedidos[datasPedidos.length - 1];
        }

        let dataAtual = new Date(inicioStr + 'T00:00:00');
        const dataFim = new Date(fimStr + 'T00:00:00');

        if (isNaN(dataAtual) || isNaN(dataFim)) return [];

        let count = 0;
        while (dataAtual <= dataFim && count < 366) {
            datas.push(formatarDataInput(dataAtual));
            dataAtual.setDate(dataAtual.getDate() + 1);
            count++;
        }
        return datas;
    };

    const dadosTendencia = useMemo(() => {
        const datas = obterDatasNoIntervalo(dataInicial, dataFinal);

        const faturamentoPorDia = {};
        datas.forEach(d => {
            faturamentoPorDia[d] = 0;
        });

        pedidosValidos.forEach(pedido => {
            if (!pedido.createdAt) return;
            const dataLocal = new Date(pedido.createdAt);
            const dia = formatarDataInput(dataLocal);
            if (faturamentoPorDia[dia] !== undefined) {
                faturamentoPorDia[dia] += pedido.totalFinal || 0;
            } else if (!dataInicial || !dataFinal) {
                faturamentoPorDia[dia] = (faturamentoPorDia[dia] || 0) + (pedido.totalFinal || 0);
            }
        });

        return Object.keys(faturamentoPorDia).sort().map(dia => {
            const partes = dia.split('-');
            const diaFormatado = partes.length === 3 ? `${partes[2]}/${partes[1]}` : dia;
            return {
                dataRaw: dia,
                data: diaFormatado,
                Faturamento: Number(faturamentoPorDia[dia].toFixed(2))
            };
        });
    }, [pedidosValidos, dataInicial, dataFinal, todosPedidos]);

    // Status chart data
    const dadosStatus = useMemo(() => {
        const statusContagem = {
            Pendente: 0,
            Pago: 0,
            Enviado: 0,
            Entregue: 0,
            Cancelado: 0
        };

        pedidosFiltrados.forEach(pedido => {
            const status = pedido.status || 'Pago';
            if (statusContagem[status] !== undefined) {
                statusContagem[status]++;
            } else {
                statusContagem[status] = 1;
            }
        });

        const cores = {
            Pendente: '#ffd54f',
            Pago: '#2ecc71',
            Enviado: '#9b59b6',
            Entregue: '#1abc9c',
            Cancelado: '#ff4081'
        };

        return Object.keys(statusContagem)
            .map(status => ({
                name: status,
                value: statusContagem[status],
                color: cores[status] || '#7f8c8d'
            }))
            .filter(item => item.value > 0);
    }, [pedidosFiltrados]);

    return (
        <div className="relatorios-container">
            {/* CABEÇALHO */}
            <div className="relatorios-header">
                <h2 className="relatorios-titulo">📊 Dashboard e Resultados</h2>
                <p className="relatorios-subtitulo">Acompanhe o desempenho da Borbolêlalá em tempo real.</p>
            </div>

            {/* PAINEL DE FILTROS */}
            <div className="painel-filtros">
                <h3 className="painel-filtros-titulo">⚙️ Configurar Período de Análise</h3>
                <div className="filtros-conteudo">
                    <div className="botoes-rapidos">
                        <button
                            onClick={() => aplicarFiltroRapido('7d')}
                            className={`btn-filtro-rapido ${filtroRapido === '7d' ? 'ativo' : ''}`}
                        >
                            Últimos 7 dias
                        </button>
                        <button
                            onClick={() => aplicarFiltroRapido('30d')}
                            className={`btn-filtro-rapido ${filtroRapido === '30d' ? 'ativo' : ''}`}
                        >
                            Últimos 30 dias
                        </button>
                        <button
                            onClick={() => aplicarFiltroRapido('mes')}
                            className={`btn-filtro-rapido ${filtroRapido === 'mes' ? 'ativo' : ''}`}
                        >
                            Este Mês
                        </button>
                        <button
                            onClick={() => aplicarFiltroRapido('todo')}
                            className={`btn-filtro-rapido ${filtroRapido === 'todo' ? 'ativo' : ''}`}
                        >
                            Todo o Período
                        </button>
                    </div>

                    <div className="filtros-datas">
                        <div className="campo-data">
                            <label htmlFor="dataInicial">Data Inicial</label>
                            <input
                                type="date"
                                id="dataInicial"
                                value={dataInicial}
                                onChange={handleDataInicialChange}
                                className="input-data"
                            />
                        </div>
                        <span className="divisor-datas">até</span>
                        <div className="campo-data">
                            <label htmlFor="dataFinal">Data Final</label>
                            <input
                                type="date"
                                id="dataFinal"
                                value={dataFinal}
                                onChange={handleDataFinalChange}
                                className="input-data"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* CARDS RESUMO */}
            <div className="dashboard-cards">
                <CardResumo titulo="Valor em Estoque (Custo)" valor={carregando ? '...' : `R$ ${valorEstoque.toFixed(2)}`} corBorda="#3498db" />
                <CardResumo titulo="Faturamento Líquido" valor={carregando ? '...' : `R$ ${faturamentoLiquido.toFixed(2)}`} corBorda="#2ecc71" />
                <CardResumo titulo="Vendas Válidas" valor={carregando ? '...' : totalPedidosValidos} corBorda="#f1c40f" />
                <CardResumo titulo="Ticket Médio" valor={carregando ? '...' : `R$ ${ticketMedio.toFixed(2)}`} corBorda="#9b59b6" />
            </div>

            {/* GRÁFICOS */}
            {!carregando && (
                <div className="dashboard-secao-graficos">
                    <div className="card-grafico">
                        <h4 className="card-grafico-titulo">📈 Tendência de Faturamento Líquido</h4>
                        <div className="container-grafico">
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={dadosTendencia} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#9b59b6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#fce4ec" stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="data" stroke="#7f8c8d" fontSize={12} tickLine={false} />
                                    <YAxis stroke="#7f8c8d" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Faturamento']} />
                                    <Area type="monotone" dataKey="Faturamento" stroke="#9b59b6" strokeWidth={3} fillOpacity={1} fill="url(#colorFaturamento)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="card-grafico">
                        <h4 className="card-grafico-titulo">📊 Distribuição por Status</h4>
                        <div className="container-grafico">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={dadosStatus}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {dadosStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} pedido(s)`, 'Quantidade']} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* RANKINGS E LISTAS */}
            {!carregando && (
                <div className="dashboard-secao-listas">
                    <div className="card-lista">
                        <h4 className="card-lista-titulo">
                            <button
                                type="button"
                                className="card-lista-header-toggle"
                                onClick={() => setMaisVendidosAberto(!maisVendidosAberto)}
                                onKeyDown={(e) => handleToggleKeyDown(e, setMaisVendidosAberto, maisVendidosAberto)}
                                aria-expanded={maisVendidosAberto}
                            >
                                <span>🔥 Produtos Mais Vendidos</span>
                                <span>{maisVendidosAberto ? '▲' : '▼'}</span>
                            </button>
                        </h4>
                        <div className={`accordion-content ${maisVendidosAberto ? 'expanded' : ''}`}>
                            <div className="accordion-inner">
                                {produtosMaisVendidos.length === 0 ? (
                                    <p className="lista-vazia">Nenhuma venda registrada no período.</p>
                                ) : (
                                    <ul className="lista-itens">
                                        {(maisVendidosAberto ? produtosMaisVendidos : produtosMaisVendidos.slice(0, 3)).map((prod, idx) => (
                                            <li key={idx} className="lista-item lista-item-top">
                                                <div className="item-info">
                                                    <span className="item-nome" title={prod.nome}>{prod.nome}</span>
                                                    <span className="item-detalhe">{prod.quantidade} unid. vendidas</span>
                                                </div>
                                                <div className="item-valores">
                                                    <span className="item-valor-destaque">R$ {prod.faturamento.toFixed(2)}</span>
                                                    <span className="item-valor-secundario">Total</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card-lista">
                        <h4 className="card-lista-titulo">
                            <button
                                type="button"
                                className="card-lista-header-toggle"
                                onClick={() => setMenosVendidosAberto(!menosVendidosAberto)}
                                onKeyDown={(e) => handleToggleKeyDown(e, setMenosVendidosAberto, menosVendidosAberto)}
                                aria-expanded={menosVendidosAberto}
                            >
                                <span>❄️ Produtos Menos Vendidos</span>
                                <span>{menosVendidosAberto ? '▲' : '▼'}</span>
                            </button>
                        </h4>
                        <div className={`accordion-content ${menosVendidosAberto ? 'expanded' : ''}`}>
                            <div className="accordion-inner">
                                {produtosMenosVendidos.length === 0 ? (
                                    <p className="lista-vazia">Nenhum produto cadastrado.</p>
                                ) : (
                                    <ul className="lista-itens">
                                        {(menosVendidosAberto ? produtosMenosVendidos : produtosMenosVendidos.slice(0, 3)).map((prod, idx) => (
                                            <li key={idx} className="lista-item lista-item-less">
                                                <div className="item-info">
                                                    <span className="item-nome" title={prod.nome}>{prod.nome}</span>
                                                    <span className="item-detalhe">{prod.quantidade} unid. vendidas</span>
                                                </div>
                                                <div className="item-valores">
                                                    <span className="item-valor-destaque" style={{ color: '#e74c3c' }}>R$ {prod.faturamento.toFixed(2)}</span>
                                                    <span className="item-valor-secundario">Total</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card-lista">
                        <h4 className="card-lista-titulo">
                            <button
                                type="button"
                                className="card-lista-header-toggle"
                                onClick={() => setEstoqueBaixoAberto(!estoqueBaixoAberto)}
                                onKeyDown={(e) => handleToggleKeyDown(e, setEstoqueBaixoAberto, estoqueBaixoAberto)}
                                aria-expanded={estoqueBaixoAberto}
                            >
                                <span>⚠️ Saúde do Estoque</span>
                                <span>{estoqueBaixoAberto ? '▲' : '▼'}</span>
                            </button>
                        </h4>
                        <div className={`accordion-content ${estoqueBaixoAberto ? 'expanded' : ''}`}>
                            <div className="accordion-inner">
                                {saudeDoEstoque.length === 0 ? (
                                    <p className="lista-vazia" style={{ color: '#27ae60' }}>Todos os produtos com estoque saudável!</p>
                                ) : (
                                    <ul className="lista-itens">
                                        {(estoqueBaixoAberto ? saudeDoEstoque : saudeDoEstoque.slice(0, 3)).map((prod, idx) => (
                                            <li key={idx} className="lista-item lista-item-alerta">
                                                <div className="item-info">
                                                    <span className="item-nome" title={prod.nome}>{prod.nome}</span>
                                                    <span className="item-detalhe">Estoque físico atual</span>
                                                </div>
                                                <div className="item-valores">
                                                    <span className="item-valor-destaque" style={{ color: '#e74c3c' }}>{prod.quantidade} unid.</span>
                                                    <span className="item-valor-secundario">Restantes</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TABELA DE HISTÓRICO DE PEDIDOS */}
            <div className="tabela-pedidos-container">
                <div className="tabela-pedidos-header">
                    <h3 className="tabela-pedidos-titulo">
                        📋 Histórico de Vendas
                    </h3>
                    <div className="busca-pedidos-container">
                        <span className="busca-icone">🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar por cliente, produto ou status..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            className="busca-pedidos-input"
                        />
                    </div>
                </div>

                {carregando ? (
                    <p className="historico-mensagem">A carregar histórico...</p>
                ) : pedidosFiltrados.length === 0 ? (
                    <p className="historico-mensagem vazia">Nenhuma venda registada neste período.</p>
                ) : pedidosFiltradosPorBusca.length === 0 ? (
                    <p className="historico-mensagem vazia">Nenhum pedido encontrado para a sua busca</p>
                ) : (
                    <div className="tabela-pedidos-wrapper">
                        <table className="tabela-pedidos">
                            <thead>
                                <tr>
                                    <th>Data / Hora</th>
                                    <th>Cliente</th>
                                    <th className="text-center">Resumo</th>
                                    <th>Total</th>
                                    <th>Status / Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedidosFiltradosPorBusca.map(pedido => {
                                    const estilo = obterEstiloStatus(pedido.status || 'Pago');
                                    const isCancelado = pedido.status === 'Cancelado';

                                    return (
                                        <Fragment key={pedido._id}>
                                            <tr className={`linha-pedido ${pedidoExpandido === pedido._id ? 'expandido' : ''} ${isCancelado ? 'cancelado' : ''}`}>
                                                <td>
                                                    {formatarData(pedido.createdAt)}
                                                </td>
                                                <td>
                                                    {pedido.cliente || 'Consumidor Final'}
                                                </td>
                                                <td>
                                                    <span>
                                                        {pedido.itens ? pedido.itens.length : 0} item(ns)
                                                    </span>
                                                    <button onClick={() => alternarDetalhes(pedido._id)} className="btn-ver-itens">
                                                        {pedidoExpandido === pedido._id ? '▲ Ocultar' : '▼ Ver Itens'}
                                                    </button>
                                                </td>
                                                <td>
                                                    R$ {pedido.totalFinal.toFixed(2)}
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <select
                                                            value={pedido.status || 'Pago'}
                                                            onChange={(e) => atualizarStatusPedido(pedido._id, e.target.value)}
                                                            className="status-select"
                                                            style={{ backgroundColor: estilo.bg, color: estilo.cor, border: `1px solid ${estilo.cor}` }}
                                                        >
                                                            <option value="Pendente">Pendente</option>
                                                            <option value="Pago">Pago</option>
                                                            <option value="Enviado">Enviado</option>
                                                            <option value="Entregue">Entregue</option>
                                                            <option value="Cancelado">Cancelado</option>
                                                        </select>
                                                        <button
                                                            onClick={() => deletarPedido(pedido._id)}
                                                            className="btn-deletar-pedido"
                                                            title="Excluir Pedido"
                                                        >
                                                            Excluir
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {pedidoExpandido === pedido._id && (
                                                <tr className="detalhes-linha">
                                                    <td colSpan="5" className="detalhes-container">
                                                        <h4 className="detalhes-titulo">📦 Detalhes do Pedido</h4>
                                                        {pedido.itens && pedido.itens.length > 0 ? (
                                                            <ul className="detalhes-itens">
                                                                {pedido.itens.map((item, idx) => (
                                                                    <li key={idx} className="detalhes-item">
                                                                        <span><strong>{item.quantidade}x</strong> {item.nome || `Produto #${item.produtoId}`}</span>
                                                                        <span>R$ {item.subtotal ? item.subtotal.toFixed(2) : (item.precoUnitario * item.quantidade).toFixed(2)}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p className="detalhes-sem-itens">Nenhum item registrado neste pedido.</p>
                                                        )}
                                                        {pedido.frete > 0 && (
                                                            <div className="detalhes-frete">
                                                                <span>Custo de Frete</span>
                                                                <span>R$ {pedido.frete.toFixed(2)}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}