// ==========================================
//         VERIFICAÇÃO DE SEGURANÇA
// ==========================================
const token = localStorage.getItem('token');

if (!token) {
    window.location.href = '/login.html';
}

const headersComAutenticacao = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` 
};

/**
 * Borbolêlalá - Controle de Estoque (Backoffice)
 * @description Lógica de CRUD conectada à API do Backend.
 */

// ==========================================
// 1. ESTADO E SELETORES DOM
// ==========================================
let modoEdicao = false; 

const formProduto = document.getElementById('form-produto');
const btnCancelar = document.getElementById('btn-cancelar');
const formTitle = document.getElementById('form-title');
const estoqueTbody = document.getElementById('estoque-tbody');

// Inputs do Formulário
const inputId = document.getElementById('input-id');
const inputNome = document.getElementById('input-nome');
const inputCategoria = document.getElementById('input-categoria');
const inputTamanhos = document.getElementById('input-tamanhos');
const inputPreco = document.getElementById('input-preco');
const inputPrecoVenda = document.getElementById('input-preco-venda');
const inputQuantidade = document.getElementById('input-quantidade');

// ==========================================
// 2. BUSCAR E RENDERIZAR O ESTOQUE (READ)
// ==========================================
async function carregarEstoque() {
    estoqueTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Carregando estoque... 🦋</td></tr>';
    
    try {
        const resposta = await fetch('/api/produtos', {
            method: 'GET',
            headers: headersComAutenticacao 
        });

        if (resposta.status === 401 || resposta.status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/login.html';
            return;
        }

        if (!resposta.ok) {
            throw new Error('Falha ao buscar produtos');
        }

const produtosDoBanco = await resposta.json();
        estoqueTbody.innerHTML = ''; 

        if (!Array.isArray(produtosDoBanco) || produtosDoBanco.length === 0) {
            estoqueTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum produto cadastrado.</td></tr>';
            return;
        }

        const produtos = produtosDoBanco
            .filter(produto => produto.id != null)
            .sort((a, b) => a.id - b.id);

        if (!modoEdicao) {
            const maiorId = produtos.length > 0 ? produtos[produtos.length - 1].id : 0;
            document.getElementById('input-id').value = maiorId + 1;
        }

        produtos.forEach(produto => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #eee';
            
            const precoExibicao = (produto.precoVenda || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const tamanhosTexto = produto.tamanhos ? produto.tamanhos.join(', ') : 'U';

            tr.innerHTML = `
                <td style="padding: 10px;"><strong>${produto.id}</strong></td>
                <td style="padding: 10px;">
                    ${produto.nome} <br>
                    <small style="color: #888;">Tamanhos: ${tamanhosTexto}</small>
                </td>
                <td style="padding: 10px; text-transform: capitalize;">${produto.categoria}</td>
                <td style="padding: 10px; font-weight: bold; color: ${produto.quantidade <= 2 ? 'red' : 'green'};">${produto.quantidade} un</td>
                <td style="padding: 10px;">${precoExibicao}</td>
                <td style="padding: 10px;">
                    <button class="btn-edit" onclick='prepararEdicao(${JSON.stringify(produto)})' style="margin-right: 5px; cursor:pointer;">✏️</button>
                    <button class="btn-delete" onclick="deletarProduto(${produto.id})" style="cursor:pointer;">🗑️</button>
                </td>
            `;
            estoqueTbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Erro ao carregar estoque:", error);
        estoqueTbody.innerHTML = '<tr><td colspan="6" style="color:red; text-align:center;">Erro ao buscar produtos.</td></tr>';
    }
}

// ==========================================
// 3. SALVAR PRODUTO (CREATE / UPDATE)
// ==========================================
formProduto.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const dadosProduto = {
        id: parseInt(inputId.value),
        nome: inputNome.value.trim(),
        categoria: inputCategoria.value.trim().toLowerCase(),
        tamanhos: inputTamanhos.value.split(',').map(t => t.trim().toUpperCase()),
        preco: parseFloat(inputPreco.value),
        precoVenda: parseFloat(inputPrecoVenda.value),
        quantidade: parseInt(inputQuantidade.value)
    };

    if (isNaN(dadosProduto.id)) {
        alert('O ID do produto não pode ficar vazio. Recarregue a página para gerar um novo ID automaticamente.');
        return;
    }

    try {
        let url = '/api/produtos';
        let metodo = 'POST'; 

        if (modoEdicao) {
            url = `/api/produtos/${dadosProduto.id}`;
            metodo = 'PUT'; 
        }

        const resposta = await fetch(url, {
            method: metodo,
            headers: headersComAutenticacao, 
            body: JSON.stringify(dadosProduto)
        });

        if (resposta.status === 401 || resposta.status === 403) {
            alert('Sua sessão expirou ou você não tem permissão de Gerente para alterar produtos.');
            localStorage.removeItem('token');
            window.location.href = '/login.html';
            return;
        }

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || 'Falha ao salvar produto.');
        }

        alert(resultado.mensagem); 
        limparFormulario();
        carregarEstoque(); 

    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
});

// ==========================================
// 4. PREPARAR EDIÇÃO (Jogar dados para o form)
// ==========================================
window.prepararEdicao = (produto) => {
    modoEdicao = true;
    formTitle.innerText = `Editando Produto: ${produto.nome}`;
    btnCancelar.style.display = 'block';
    
    inputId.readOnly = true; 
    inputId.style.backgroundColor = '#eee';

    inputId.value = produto.id;
    inputNome.value = produto.nome;
    inputCategoria.value = produto.categoria;
    inputTamanhos.value = produto.tamanhos ? produto.tamanhos.join(', ') : 'U';
    inputPreco.value = produto.preco;
    inputPrecoVenda.value = produto.precoVenda;
    inputQuantidade.value = produto.quantidade;
};

// ==========================================
// 5. CANCELAR EDIÇÃO E LIMPAR FORMULÁRIO
// ==========================================
const limparFormulario = () => {
    formProduto.reset(); 
    modoEdicao = false;
    formTitle.innerText = 'Cadastrar Novo Produto';
    btnCancelar.style.display = 'none';
    
    inputId.readOnly = false;
    inputId.style.backgroundColor = '';
};

btnCancelar.addEventListener('click', limparFormulario);

// ==========================================
// 6. DELETAR PRODUTO (DELETE)
// ==========================================
window.deletarProduto = async (id) => {
    if (!confirm(`Tem certeza que deseja remover o produto ID ${id} do estoque? Essa ação não pode ser desfeita.`)) {
        return; 
    }

    try {
        const resposta = await fetch(`/api/produtos/${id}`, {
            method: 'DELETE',
            headers: headersComAutenticacao
        });

        if (resposta.status === 401 || resposta.status === 403) {
            alert('Sua sessão expirou ou você não tem permissão para deletar produtos.');
            localStorage.removeItem('token');
            window.location.href = '/login.html';
            return;
        }

        const resultado = await resposta.json();

        if (!resposta.ok) throw new Error(resultado.erro);

        alert(resultado.mensagem);
        carregarEstoque(); 

    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
};

// ==========================================
//                  LOGOUT
// ==========================================
const btnLogout = document.getElementById('btn-logout');

if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja encerrar a sessão?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            
            window.location.href = '/login.html';
        }
    });
}

// ==========================================
//          SAUDAÇÃO DO USUÁRIO LOGADO
// ==========================================
const userGreeting = document.getElementById('user-greeting');
const usuarioLogadoString = localStorage.getItem('usuario');

if (userGreeting && usuarioLogadoString) {
    const usuarioLogado = JSON.parse(usuarioLogadoString);
    const primeiroNome = usuarioLogado.nome.split(' ')[0];
    userGreeting.textContent = `Olá, ${primeiroNome} 👋`;
}

document.addEventListener('DOMContentLoaded', carregarEstoque);