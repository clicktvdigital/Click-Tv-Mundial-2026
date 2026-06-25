let cart = [];
let currentCurrency = 'USD';

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    renderCatalog(PRODUCTOS);
    initCalculator();
});

function renderCatalog(items) {
    const container = document.getElementById('catalog-container');
    container.innerHTML = '';

    items.forEach(p => {
        const localPrice = (p.precio * TASAS[currentCurrency]).toLocaleString();
        container.innerHTML += `
            <div class="card">
                ${p.hot ? '<span class="badge" style="position:absolute; top:10px; right:10px;">HOT 🔥</span>' : ''}
                <img src="${p.imagen}" alt="${p.nombre}">
                <h3>${p.nombre}</h3>
                <p class="price">${getSymbol()} ${localPrice}</p>
                <button class="btn-primary" onclick="addToCart(${p.id})">Añadir al Carrito</button>
                <button class="btn-outline" style="margin-top:8px; border:1px solid #333;" onclick="buyNow(${p.id})">Comprar YA</button>
            </div>
        `;
    });
}

function addToCart(id) {
    const product = PRODUCTOS.find(p => p.id === id);
    cart.push(product);
    updateCartUI();
    // Abrir carrito automáticamente al añadir
    document.getElementById('cart-sidebar').classList.add('active');
}

function updateCartUI() {
    const container = document.getElementById('cart-items');
    const count = document.getElementById('cart-count');
    const total = document.getElementById('cart-total');
    
    container.innerHTML = '';
    let totalValue = 0;

    cart.forEach((item, index) => {
        totalValue += item.precio;
        container.innerHTML += `
            <div class="flex-between" style="margin-bottom:15px; background:#1a1a1a; padding:10px; border-radius:8px;">
                <div>
                    <h4 style="font-size:14px;">${item.nombre}</h4>
                    <small>${getSymbol()} ${(item.precio * TASAS[currentCurrency]).toFixed(2)}</small>
                </div>
                <button onclick="removeItem(${index})" style="background:none; border:none; color:red; cursor:pointer;">&times;</button>
            </div>
        `;
    });

    count.innerText = cart.length;
    total.innerText = `${getSymbol()} ${(totalValue * TASAS[currentCurrency]).toLocaleString()}`;
}

function updateCurrency() {
    currentCurrency = document.getElementById('currency-selector').value;
    renderCatalog(PRODUCTOS);
    updateCartUI();
    calculateSavings();
}

function getSymbol() {
    const symbols = { USD: '$', PEN: 'S/', COP: '$', CLP: '$' };
    return symbols[currentCurrency];
}

function toggleCart() { document.getElementById('cart-sidebar').classList.toggle('active'); }
function toggleMenu() { document.getElementById('nav-menu').classList.toggle('active'); }

function removeItem(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function checkoutWhatsApp() {
    if(cart.length === 0) return alert("Tu carrito está vacío");
    let items = cart.map(i => `- ${i.nombre}`).join('%0A');
    let total = document.getElementById('cart-total').innerText;
    let msg = `Hola Click TV! 👋 Deseo realizar este pedido:%0A${items}%0A%0A*Total:* ${total}`;
    window.open(`https://wa.me/593939166222?text=${msg}`, '_blank');
}

function buyNow(id) {
    const p = PRODUCTOS.find(p => p.id === id);
    let msg = `Hola Click TV! 👋 Deseo comprar de inmediato: *${p.nombre}*`;
    window.open(`https://wa.me/593939166222?text=${msg}`, '_blank');
}

// Calculadora
function initCalculator() {
    const select = document.getElementById('calc-service');
    PRODUCTOS.forEach(p => {
        select.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
    });
    calculateSavings();
}

function calculateSavings() {
    const id = document.getElementById('calc-service').value;
    const p = PRODUCTOS.find(p => p.id == id);
    const rate = TASAS[currentCurrency];
    
    document.getElementById('price-off').innerText = `${getSymbol()} ${(p.precioOficial * rate).toLocaleString()}`;
    document.getElementById('price-click').innerText = `${getSymbol()} ${(p.precio * rate).toLocaleString()}`;
    document.getElementById('price-saved').innerText = `${getSymbol()} ${((p.precioOficial - p.precio) * rate).toLocaleString()}`;
}

function filterCatalog(cat) {
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    if(cat === 'todos') renderCatalog(PRODUCTOS);
    else renderCatalog(PRODUCTOS.filter(p => p.categoria === cat));
}