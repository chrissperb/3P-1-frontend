/**
 * Borbolêlalá - Sistema de Gestão de Vendas (Frontend MVP)
 * @description Lógica de catálogo, carrinho e API externa.
 */

// 1. MOCK DATA (Simulando o Banco de Dados MongoDB)
const products = [
    { id: 1, name: "Macacão Algodão Egípcio", price: 89.90, category: "macacoes", sizes: ["P", "M", "G"] },
    { id: 2, name: "Body Manga Curta Floral", price: 45.00, category: "macacoes", sizes: ["0-3m", "3-6m"] },
    { id: 3, name: "Kit Saída Maternidade", price: 159.90, category: "kits", sizes: ["RN"] },
    { id: 4, name: "Conjunto Moletom Dino", price: 110.00, category: "kits", sizes: ["1", "2", "3"] },
    { id: 5, name: "Vestido Borboletas", price: 79.90, category: "macacoes", sizes: ["M", "G"] },
    { id: 6, name: "Kit 3 Paninhos de Boca", price: 39.90, category: "kits", sizes: ["U"] },
];

// Estado da Aplicação
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
        // Clonar objeto para evitar referência
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

// Filtros de Categoria
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Remove active class de todos
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        renderCatalog(e.target.dataset.cat);
    });
});

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
    renderCatalog();
});