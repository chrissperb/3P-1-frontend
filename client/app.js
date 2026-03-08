/**
 * Borbolêlalá - Sistema de Gestão de Vendas (Frontend MVP)
 * @description Lógica de catálogo, carrinho e API externa.
 */

// Estado da Aplicação
let products = []
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

async function carregarCatalogo() {
    productGrid.innerHTML = '<p style="text-align:center;">Carregando roupinhas... 🦋</p>';
    
    try {
        const resposta = await fetch('/api/produtos');
        const dadosDoBanco = await resposta.json();

        products = dadosDoBanco.map(p => ({
            id: p.id,
            name: p.nome,
            price: p.precoVenda || p.preco || 0, 
            category: p.categoria ? p.categoria.toLowerCase() : 'outros',
            sizes: ['U']
        }));

        renderFilters();
        renderCatalog();

    } catch (error) {
        console.error("Erro ao carregar da API:", error);
        productGrid.innerHTML = '<p style="color:red; text-align:center;">Erro ao carregar o catálogo.</p>';
    }
}

// 2. FUNÇÕES DE RENDERIZAÇÃO
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
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

// 3. LÓGICA DE NEGÓCIO (Calculadora)
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

const updateTotals = () => {
    const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
    const discountValue = subtotal * (discountPercent / 100);
    const total = subtotal - discountValue;

    subtotalDisplay.innerText = formatCurrency(subtotal);
    totalDisplay.innerText = formatCurrency(total);
};

// Event Listener para Desconto
discountInput.addEventListener('input', (e) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val)) val = 0;
    discountPercent = val;
    updateTotals();
});

// Filtros de Categoria Dinâmicos
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

// 4. CONSUMO DE API EXTERNA (ViaCEP)
btnCep.addEventListener('click', async () => {
    const cep = cepInput.value.replace(/\D/g, '');
    const resultDiv = document.getElementById('address-result');
    
    if (cep.length !== 8) {
        alert('CEP inválido. Digite 8 números.');
        return;
    }

    try {
        resultDiv.classList.remove('hidden');
        resultDiv.innerHTML = '<p>Buscando...</p>';
        
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            resultDiv.innerHTML = '<p style="color:red">CEP não encontrado.</p>';
        } else {
            resultDiv.innerHTML = `
                <p><strong>Cidade:</strong> ${data.localidade} - ${data.uf}</p>
                <p><strong>Rua:</strong> ${data.logradouro}</p>
                <p style="font-size:0.8rem; color:green; margin-top:5px">Frete Grátis para esta região!</p>
            `;
        }
    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = '<p style="color:red">Erro ao buscar CEP.</p>';
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarCatalogo();
    renderCatalog();
});