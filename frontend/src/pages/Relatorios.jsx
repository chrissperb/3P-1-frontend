import React, { useState, useEffect, Fragment } from 'react';
import CardResumo from '../components/CardResumo';
import { useNavigate } from 'react-router-dom';

export default function Relatorios() {
    const [dias, setDias] = useState(7);
    const [valorEstoque, setValorEstoque] = useState(0);
    const [carregando, setCarregando] = useState(true);
    const [listaPedidos, setListaPedidos] = useState([]);
    const [pedidoExpandido, setPedidoExpandido] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const buscarDadosDoSistema = async () => {
            setCarregando(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) { navigate('/login'); return; }

                const headers = { 'Authorization': `Bearer ${token}` };

                const [resProdutos, resPedidos] = await Promise.all([
                    fetch(import.meta.env.VITE_API_URL + '/api/produtos', { headers }),
                    fetch(import.meta.env.VITE_API_URL + '/api/pedidos', { headers })
                ]);

                if (resProdutos.ok && resPedidos.ok) {
                    const produtos = await resProdutos.json();
                    const pedidos = await resPedidos.json();

                    const totalPatrimonio = produtos.reduce((acc, p) => acc + (p.quantidade * (p.preco || 0)), 0);
                    setValorEstoque(totalPatrimonio);

                    const dataLimite = new Date();
                    dataLimite.setDate(dataLimite.getDate() - dias);

                    const pedidosNoPeriodo = pedidos.filter(pedido => {
                        const dataPedido = new Date(pedido.createdAt);
                        return dataPedido >= dataLimite;
                    });

                    const pedidosOrdenados = pedidosNoPeriodo.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                    setListaPedidos(pedidosOrdenados);
                }
            } catch (erro) {
                console.error("Erro ao buscar dados:", erro);
            } finally {
                setCarregando(false);
            }
        };

        buscarDadosDoSistema();
    }, [dias, navigate]);

    const atualizarStatusPedido = async (pedidoId, novoStatus) => {
        try {
            const token = localStorage.getItem('token');
            const resposta = await fetch(import.meta.env.VITE_API_URL + '/pedidos/${pedidoId}/status', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: novoStatus })
            });

            if (resposta.ok) {
                setListaPedidos(listaAtual =>
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

    const alternarDetalhes = (id) => {
        setPedidoExpandido(pedidoExpandido === id ? null : id);
    };

    const diminuirDias = () => { if (dias > 1) setDias(dias - 1); };
    const aumentarDias = () => { setDias(dias + 1); };

    const formatarData = (dataString) => {
        if (!dataString) return '--/--/----';
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-PT') + ' às ' + data.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    };

    const obterEstiloStatus = (status) => {
        switch (status) {
            case 'Pendente': return { bg: '#fef9e7', cor: '#f1c40f' };
            case 'Enviado': return { bg: '#ebf5fb', cor: '#3498db' };
            case 'Entregue': return { bg: '#e8f8f5', cor: '#1abc9c' };
            case 'Cancelado': return { bg: '#fadbd8', cor: '#e74c3c' };
            case 'Pago':
            default: return { bg: '#eafaf1', cor: '#27ae60' };
        }
    };

    // CÁLCULO DERIVADO 
    const pedidosValidos = listaPedidos.filter(pedido => pedido.status !== 'Cancelado');
    const qtdPedidosValidos = pedidosValidos.length;
    const totalVendasValidas = pedidosValidos.reduce((acc, p) => acc + p.totalFinal, 0);

    return (
        <div>
            {/* CABEÇALHO E CARDS */}
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ color: '#2c3e50', margin: '0 0 5px 0' }}>📊 Dashboard e Resultados</h2>
                <p style={{ color: '#7f8c8d', margin: 0 }}>Acompanhe o desempenho da Borbolêlalá em tempo real.</p>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
                <CardResumo titulo="Valor em Estoque (Custo)" valor={carregando ? '...' : `R$ ${valorEstoque.toFixed(2)}`} corBorda="#3498db" />
                <CardResumo titulo={`Faturamento Líquido (${dias} dias)`} valor={carregando ? '...' : `R$ ${totalVendasValidas.toFixed(2)}`} corBorda="#2ecc71" />
                <CardResumo titulo={`Vendas Válidas (${dias} dias)`} valor={carregando ? '...' : qtdPedidosValidos} corBorda="#f1c40f" />
            </div>

            {/* CONTADOR DE DIAS */}
            <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'inline-block' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: '#7f8c8d' }}>⚙️ Configurar Período de Análise</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={diminuirDias} style={{ padding: '8px 20px', fontSize: '1.5rem', cursor: 'pointer', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px' }}>-</button>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', minWidth: '80px', textAlign: 'center', color: '#2c3e50' }}>{dias} {dias === 1 ? 'Dia' : 'Dias'}</span>
                    <button onClick={aumentarDias} style={{ padding: '8px 20px', fontSize: '1.5rem', cursor: 'pointer', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px' }}>+</button>
                </div>
            </div>

            {/* TABELA DE PEDIDOS */}
            <div style={{ marginTop: '30px', backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' }}>
                    📋 Histórico de Vendas (Últimos {dias} dias)
                </h3>

                {carregando ? (
                    <p style={{ textAlign: 'center', color: '#7f8c8d' }}>A carregar histórico...</p>
                ) : listaPedidos.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '20px 0' }}>Nenhuma venda registada neste período.</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #ecf0f1', color: '#9b59b6' }}>
                                    <th style={{ padding: '12px' }}>Data / Hora</th>
                                    <th style={{ padding: '12px' }}>Cliente</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>Resumo</th>
                                    <th style={{ padding: '12px' }}>Total</th>
                                    <th style={{ padding: '12px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listaPedidos.map(pedido => {
                                    const estilo = obterEstiloStatus(pedido.status || 'Pago');
                                    const isCancelado = pedido.status === 'Cancelado';

                                    return (
                                        <Fragment key={pedido._id}>
                                            <tr style={{
                                                borderBottom: '1px solid #f9f9f9',
                                                backgroundColor: pedidoExpandido === pedido._id ? '#fdf8fa' : 'transparent',
                                                opacity: isCancelado ? 0.6 : 1
                                            }}>
                                                <td style={{ padding: '12px', fontSize: '0.9rem', color: '#7f8c8d' }}>
                                                    {formatarData(pedido.createdAt)}
                                                </td>
                                                <td style={{ padding: '12px', fontWeight: 'bold', color: '#34495e', textDecoration: isCancelado ? 'line-through' : 'none' }}>
                                                    {pedido.cliente || 'Consumidor Final'}
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                                    <span style={{ color: '#7f8c8d', marginRight: '10px' }}>
                                                        {pedido.itens ? pedido.itens.length : 0} item(ns)
                                                    </span>
                                                    <button onClick={() => alternarDetalhes(pedido._id)} style={{ backgroundColor: '#9b59b6', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                                                        {pedidoExpandido === pedido._id ? '▲ Ocultar' : '▼ Ver Itens'}
                                                    </button>
                                                </td>
                                                <td style={{ padding: '12px', color: isCancelado ? '#e74c3c' : '#27ae60', fontWeight: 'bold' }}>
                                                    R$ {pedido.totalFinal.toFixed(2)}
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <select
                                                        value={pedido.status || 'Pago'}
                                                        onChange={(e) => atualizarStatusPedido(pedido._id, e.target.value)}
                                                        style={{ backgroundColor: estilo.bg, color: estilo.cor, border: `1px solid ${estilo.cor}`, padding: '5px 10px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}
                                                    >
                                                        <option value="Pendente">Pendente</option>
                                                        <option value="Pago">Pago</option>
                                                        <option value="Enviado">Enviado</option>
                                                        <option value="Entregue">Entregue</option>
                                                        <option value="Cancelado">Cancelado</option>
                                                    </select>
                                                </td>
                                            </tr>

                                            {pedidoExpandido === pedido._id && (
                                                <tr style={{ backgroundColor: '#fdf8fa' }}>
                                                    <td colSpan="5" style={{ padding: '15px 30px', borderBottom: '2px solid #ecf0f1' }}>
                                                        <h4 style={{ margin: '0 0 10px 0', color: '#9b59b6', fontSize: '0.9rem' }}>📦 Detalhes do Pedido</h4>
                                                        {pedido.itens && pedido.itens.length > 0 ? (
                                                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                                {pedido.itens.map((item, idx) => (
                                                                    <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px dashed #bdc3c7', fontSize: '0.9rem', color: '#34495e' }}>
                                                                        <span><strong>{item.quantidade}x</strong> {item.nome || `Produto #${item.produtoId}`}</span>
                                                                        <span>R$ {item.subtotal ? item.subtotal.toFixed(2) : (item.precoUnitario * item.quantidade).toFixed(2)}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p style={{ margin: 0, color: '#e74c3c', fontSize: '0.9rem' }}>Nenhum item registrado neste pedido.</p>
                                                        )}
                                                        {pedido.frete > 0 && (
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', marginTop: '5px', fontSize: '0.9rem', color: '#7f8c8d' }}>
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