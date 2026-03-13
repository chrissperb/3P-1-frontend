// ==========================================
//        VERIFICAÇÃO DE SEGURANÇA
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
 * Borbolêlalá - Sistema de Gestão de Vendas (Frontend MVP)
 * @description Lógica de catálogo, carrinho e API externa.
 */

// Estado da Aplicação
let products = [];
let cart = [];
let discountPercent = 0;

// Seletores DOM
const productGrid = document.getElementById('product-grid');
const cartItemsContainer = document.getElementById('cart-items');
const subtotalDisplay = document.getElementById('subtotal-display');
const totalDisplay = document.getElementById('total-display');
const discountInput = document.getElementById('discount-input');
const btnCep = document.getElementById('btn-cep');
const cepInput = document.getElementById('cep-input');

// ==========================================
// 1. CARREGAMENTO E RENDERIZAÇÃO
// ==========================================

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const updateTotals = () => {
    const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
    const discountValue = subtotal * (discountPercent / 100);
    const total = subtotal - discountValue;

    subtotalDisplay.innerText = formatCurrency(subtotal);
    totalDisplay.innerText = formatCurrency(total);
};

const renderCart = () => {
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-msg">Nenhum item.</p>';
        updateTotals();
        return;
    }

    cart.forEach((item, index) => {
        const itemRow = document.createElement('div');
        itemRow.className = 'cart-item';
        itemRow.innerHTML = `
            <span>${item.name} <br><small>(${formatCurrency(item.price)})</small></span>
            <button onclick="removeFromCart(${index})" style="background:none; border:none; color:red; cursor:pointer;">&times;</button>
        `;
        cartItemsContainer.appendChild(itemRow);
    });

    updateTotals();
};

const renderFilters = () => {
    const filtersContainer = document.getElementById('dynamic-filters');
    filtersContainer.innerHTML = ''; 

    const todasCategorias = products.map(p => p.category);
    const categoriasUnicas = ['all', ...new Set(todasCategorias)];

    categoriasUnicas.forEach(cat => {
        const btn = document.createElement('button');
        
        btn.className = `filter-btn ${cat === 'all' ? 'active' : ''}`;
        btn.dataset.cat = cat;
        
        if (cat === 'all') {
            btn.textContent = 'Todos';
        } else {
            btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        }

        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            renderCatalog(e.target.dataset.cat);
        });

        filtersContainer.appendChild(btn);
    });
};

const renderCatalog = (filter = 'all') => {
    productGrid.innerHTML = '';
    
    const filtered = filter === 'all' 
        ? products 
        : products.filter(p => p.category === filter);

    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <h3>${product.name}</h3>
            <p style="font-size:0.8rem; color:#888">Tamanhos: ${product.sizes.join(', ')}</p>
            <p class="price">${formatCurrency(product.price)}</p>
            <button class="btn-add" onclick="addToCart(${product.id})">Adicionar</button>
        `;
        productGrid.appendChild(card);
    });
};

// BUSCA OS PRODUTOS NO BACKEND
async function carregarCatalogo() {
    productGrid.innerHTML = '<p style="text-align:center;">Carregando roupinhas... 🦋</p>';
    
    try {
        const resposta = await fetch('/api/produtos', {
            method: 'GET',
            headers: headersComAutenticacao 
        });

        if (!resposta.ok) {
            if (resposta.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login.html';
                return;
            }
            throw new Error('Falha ao buscar produtos');
        }

        const dadosDoBanco = await resposta.json();

        products = dadosDoBanco
            .filter(p => p.quantidade > 0)
            .map(p => ({
                id: p.id,
                name: p.nome,
                price: p.precoVenda || p.preco || 0, 
                category: p.categoria ? p.categoria.toLowerCase() : 'outros',
                sizes: p.tamanhos && p.tamanhos.length > 0 ? p.tamanhos : ['U']
            }));

        renderFilters();
        renderCatalog();

    } catch (error) {
        console.error("Erro ao carregar da API:", error);
        productGrid.innerHTML = '<p style="color:red; text-align:center;">Erro ao carregar o catálogo.</p>';
    }
}

// ==========================================
// 2. LÓGICA DE CARRINHO E DESCONTO
// ==========================================

window.addToCart = (id) => {
    const product = products.find(p => p.id === id);
    if (product) {
        cart.push({ ...product }); 
        renderCart();
    }
};

window.removeFromCart = (index) => {
    cart.splice(index, 1);
    renderCart();
};

discountInput.addEventListener('input', (e) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val)) val = 0;
    discountPercent = val;
    updateTotals();
});

// ==========================================
// 3. CONSUMO DE API EXTERNA (Cálculo de Frete)
// ==========================================
const pesoInput = document.getElementById('peso-input');
const alturaInput = document.getElementById('altura-input');
const larguraInput = document.getElementById('largura-input');
const comprimentoInput = document.getElementById('comprimento-input');

btnCep.addEventListener('click', async () => {
    const cepDestino = cepInput.value.replace(/\D/g, '');
    const resultDiv = document.getElementById('address-result');
    
    if (cepDestino.length !== 8) {
        alert('CEP de destino inválido. Digite 8 números.');
        return;
    }

    const peso = parseFloat(pesoInput.value) || 0;
    const altura = parseInt(alturaInput.value) || 0;
    const largura = parseInt(larguraInput.value) || 0;
    const comprimento = parseInt(comprimentoInput.value) || 0;

    if (peso === 0 || altura === 0) {
        alert('Para calcular o frete, preencha o peso e as medidas do pacote.');
        return;
    }

    try {
        const payload = {
            from: { postal_code: "88495000" },
            to: { postal_code: cepDestino },
            services: '1,2,17',
            options: {
                own_hand: false,
                receipt: false,
                insurance_value: 0,
                use_insurance_value: false
            },
            package: { weight: peso, height: altura, width: largura, length: comprimento }
        };

        const response = await fetch('/api/frete', {
            method: 'POST',
            headers: headersComAutenticacao,
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Erro repassado pela API:", data);
            throw new Error('A API recusou o cálculo. Verifique os dados digitados.');
        }

        const arrayServicos = Array.isArray(data) ? data : (data.services || [data]); 
        
        resultDiv.innerHTML = arrayServicos.map(opcao => {
            const nome = opcao.name || opcao.service_name || 'Frete';
            const prazo = opcao.delivery_time || opcao.custom_delivery_time || '?';
            const preco = opcao.price || opcao.custom_price || '0.00';
            
            return `
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid #ccc; padding:5px 0;">
                    <span><strong>${nome}</strong> (${prazo} dias)</span>
                    <span style="font-weight:bold; color:var(--primary-color);">R$ ${preco}</span>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = '<p style="color:red; text-align:center;">Erro ao conectar com a Super Frete.</p>';
    }
});

// ==========================================
// 4. FINALIZAR VENDA (Checkout PDV)
// ==========================================
const btnFinalize = document.getElementById('btn-finalize');

btnFinalize.addEventListener('click', async () => {
    if (cart.length === 0) {
        alert('O carrinho está vazio! Adicione roupinhas antes de finalizar.');
        return;
    }

    const itensAgrupados = [];
    cart.forEach(itemCarrinho => {
        const itemExistente = itensAgrupados.find(i => i.produtoId === itemCarrinho.id);
        
        if (itemExistente) {
            itemExistente.quantidade += 1; 
        } else {
            itensAgrupados.push({ produtoId: itemCarrinho.id, quantidade: 1 });
        }
    });

    const cepInformado = document.getElementById('cep-input').value.replace(/\D/g, '');
    
    const payloadVenda = {
        cliente: "Cliente PDV (Balcão)", 
        endereco: {
            cep: cepInformado.length === 8 ? cepInformado : "00000000",
            logradouro: cepInformado.length === 8 ? "Endereço a combinar" : "Retirada na Loja",
            bairro: "-",
            cidade: "Sua Cidade",
            estado: "SC"
        },
        itens: itensAgrupados 
    };

    try {
        btnFinalize.textContent = "Processando... 🦋";
        btnFinalize.disabled = true; 

        const resposta = await fetch('/api/pedidos', {
            method: 'POST',
            headers: headersComAutenticacao, 
            body: JSON.stringify(payloadVenda)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            throw new Error(resultado.erro || 'Erro desconhecido ao finalizar.');
        }

        alert(resultado.mensagem);
        
        cart = []; 
        renderCart(); 
        document.getElementById('cep-input').value = '';
        document.getElementById('address-result').classList.add('hidden');
        document.getElementById('peso-input').value = '';
        
        carregarCatalogo(); 

    } catch (error) {
        alert(`Não foi possível finalizar: ${error.message}`);
    } finally {
        btnFinalize.textContent = "Finalizar Venda";
        btnFinalize.disabled = false;
    }
});

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

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarCatalogo();
});