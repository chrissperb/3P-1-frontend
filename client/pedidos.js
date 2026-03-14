// ==========================================
// 0. VERIFICAÇÃO DE SEGURANÇA (Porteiro)
// ==========================================
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/login.html';
}

const headersComAutenticacao = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

// ==========================================
// 1. SAUDAÇÃO E LOGOUT
// ==========================================
const usuarioLogadoString = localStorage.getItem('usuario');
if (usuarioLogadoString) {
    const usuarioLogado = JSON.parse(usuarioLogadoString);
    document.getElementById('user-greeting').textContent = `Olá, ${usuarioLogado.nome.split(' ')[0]} 👋`;
}

document.getElementById('btn-logout').addEventListener('click', () => {
    if (confirm('Tem certeza que deseja encerrar a sessão?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/login.html';
    }
});

// ==========================================
// 2. CARREGAR E RENDERIZAR PEDIDOS
// ==========================================
const pedidosTbody = document.getElementById('pedidos-tbody');

async function carregarPedidos() {
    pedidosTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Carregando histórico... ⏳</td></tr>';
    
    try {
        const resposta = await fetch('/api/pedidos', {
            method: 'GET',
            headers: headersComAutenticacao
        });

        if (resposta.status === 401 || resposta.status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/login.html';
            return;
        }

        const pedidos = await resposta.json();
        pedidosTbody.innerHTML = '';

        if (!Array.isArray(pedidos) || pedidos.length === 0) {
            pedidosTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum pedido encontrado.</td></tr>';
            return;
        }

        pedidos.forEach(pedido => {
            const tr = document.createElement('tr');
            
            const dataPedido = new Date(pedido.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            const totalFormatado = (pedido.totalFinal || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            
            const itensTexto = pedido.itens.map(i => `${i.quantidade}x ${i.nome}`).join('<br>');

            tr.innerHTML = `
                <td style="font-size: 0.9em;">
                    <strong>${dataPedido}</strong><br>
                    <small style="color: #888;">ID: ${pedido._id.substring(0, 8)}...</small>
                </td>
                <td>
                    <strong>${pedido.cliente}</strong><br>
                    <small>${pedido.endereco.logradouro}, ${pedido.endereco.cidade}-${pedido.endereco.estado}</small>
                </td>
                <td style="font-size: 0.9em;">${itensTexto}</td>
                <td style="font-weight: bold; color: var(--primary-color);">${totalFormatado}</td>
                <td>
                    <select class="status-select" onchange="atualizarStatus('${pedido._id}', this.value)">
                        <option value="Pago" ${pedido.status === 'Pago' ? 'selected' : ''}>Pago</option>
                        <option value="Enviado" ${pedido.status === 'Enviado' ? 'selected' : ''}>Enviado</option>
                        <option value="Entregue" ${pedido.status === 'Entregue' ? 'selected' : ''}>Entregue</option>
                        <option value="Cancelado" ${pedido.status === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </td>
                <td>
                    <button class="btn-delete-solid" onclick="deletarPedido('${pedido._id}')">🗑️ Excluir</button>
                </td>
            `;
            pedidosTbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
        pedidosTbody.innerHTML = '<tr><td colspan="6" style="color:red; text-align:center;">Erro ao buscar pedidos.</td></tr>';
    }
}

// ==========================================
// 3. ATUALIZAR STATUS DO PEDIDO
// ==========================================
window.atualizarStatus = async (id, novoStatus) => {
    try {
        const resposta = await fetch(`/api/pedidos/${id}/status`, {
            method: 'PUT',
            headers: headersComAutenticacao,
            body: JSON.stringify({ status: novoStatus })
        });

        if (resposta.status === 401 || resposta.status === 403) {
            alert('Apenas gerentes podem alterar o status dos pedidos.');
            carregarPedidos(); 
            return;
        }

        if (!resposta.ok) throw new Error('Falha ao atualizar status.');
        
    } catch (error) {
        alert(`Erro: ${error.message}`);
        carregarPedidos(); 
    }
};

// ==========================================
// 4. DELETAR PEDIDO E ESTORNAR ESTOQUE
// ==========================================
window.deletarPedido = async (id) => {
    if (!confirm('Tem certeza que deseja cancelar e excluir esta venda? Os itens voltarão para o estoque!')) {
        return;
    }

    try {
        const resposta = await fetch(`/api/pedidos/${id}`, {
            method: 'DELETE',
            headers: headersComAutenticacao
        });

        if (resposta.status === 401 || resposta.status === 403) {
            alert('Apenas gerentes podem excluir pedidos.');
            return;
        }

        const resultado = await resposta.json();
        if (!resposta.ok) throw new Error(resultado.erro);

        alert('Venda cancelada! As roupinhas voltaram para o estoque. 🦋');
        carregarPedidos(); 

    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
};

document.addEventListener('DOMContentLoaded', carregarPedidos);