/**
 * CLICK TV - Lógica de Negocio
 */

// Base de Datos de Productos
const PRODUCTS = [
    { id: 1, name: "Netflix Premium (Perfil)", price: 5.00, category: "streaming", tag: "HOT", icon: "fa-film" },
    { id: 2, name: "Disney+ Premium (Perfil)", price: 5.00, category: "streaming", tag: "POPULAR", icon: "fa-magic" },
    { id: 3, name: "IPTV Ultra HD (1 Mes)", price: 7.00, category: "iptv", tag: "TOP", icon: "fa-tv" },
    { id: 4, name: "IPTV Básico (1 Mes)", price: 3.50, category: "iptv", tag: "OFERTA", icon: "fa-satellite-dish" },
    { id: 5, name: "Combo Plus (Disney+Star)", price: 8.00, category: "streaming", tag: "MEJOR PRECIO", icon: "fa-layer-group" },
    { id: 6, name: "Canva Pro Anual", price: 10.00, category: "apps", tag: "NUEVO", icon: "fa-palette" },
    { id: 7, name: "Crunchyroll Fan", price: 3.00, category: "apps", tag: "HOT", icon: "fa-clapperboard" },
    { id: 8, name: "HBO Max (Cuenta)", price: 5.00, category: "streaming", tag: "POPULAR", icon: "fa-tv" },
    { id: 9, name: "NBA League Pass", price: 6.00, category: "sports", tag: "TEMPORADA", icon: "fa-basketball" },
    { id: 10, name: "DAZN Sports Premium", price: 6.00, category: "sports", tag: "HOT", icon: "fa-football" },
    { id: 11, name: "YouTube Premium", price: 4.50, category: "apps", tag: "TOP", icon: "fa-play" },
    { id: 12, name: "Spotify Premium", price: 4.00, category: "apps", tag: "POPULAR", icon: "fa-music" }
];

let cart = JSON.parse(localStorage.getItem('clicktv_cart')) || [];
const WPP_NUMBER = "593939166222";

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(PRODUCTS);
    updateCartUI();
    updateSavings();

    // Buscador en tiempo real
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = PRODUCTS.filter(p => p.name.toLowerCase().includes(term));
        renderProducts(filtered);
    });
});

// Renderizar Catálogo
function renderProducts(array) {
    const container = document.getElementById('catalog-container');
    if(!container) return;
    
    container.innerHTML = array.map(p => `
        <div class="product-card">
            ${p.tag ? `<span class="product-tag">${p.tag}</span>` : ''}
            <div class="card-info">
                <i class="fas ${p.icon} fa-3x" style="color: var(--primary); margin-bottom: 15px;"></i>
                <h3>${p.name}</h3>
                <span class="price">$${p.price.toFixed(2)}</span>
                <div class="card-btns">
                    <button class="btn btn-primary btn-full" onclick="addToCart(${p.id})">
                        <i class="fas fa-cart-plus"></i> Añadir
                    </button>
                    <button class="btn btn-gold btn-full" style="margin-top:8px" onclick="buyNow('${p.name}', ${p.price})">
                        <i class="fab fa-whatsapp"></i> Comprar YA
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Filtrado
function filterProducts(category) {
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');

    if(category === 'all') return renderProducts(PRODUCTS);
    const filtered = PRODUCTS.filter(p => p.category === category);
    renderProducts(filtered);
}

// Lógica de Carrito
function addToCart(id) {
    const product = PRODUCTS.find(p => p.id === id);
    if(product) {
        cart.push(product);
        localStorage.setItem('clicktv_cart', JSON.stringify(cart));
        updateCartUI();
        showToast(`Añadido: ${product.name}`);
    }
}

function updateCartUI() {
    const list = document.getElementById('cart-items');
    const count = document.getElementById('cart-count');
    const total = document.getElementById('cart-total');
    
    count.innerText = cart.length;
    
    let totalValue = 0;
    list.innerHTML = cart.map((item, index) => {
        totalValue += item.price;
        return `
            <div class="cart-item">
                <div>
                    <strong>${item.name}</strong><br>
                    <small>$${item.price.toFixed(2)}</small>
                </div>
                <button onclick="removeFromCart(${index})" style="background:none; border:none; color:red; cursor:pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');
    
    total.innerText = `$${totalValue.toFixed(2)}`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('clicktv_cart', JSON.stringify(cart));
    updateCartUI();
}

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('active');
}

// Calculadora
function updateSavings() {
    const select = document.getElementById('calc-service');
    const official = parseFloat(select.options[select.selectedIndex].dataset.official);
    const internal = parseFloat(select.value);
    
    const saved = official - internal;
    const percent = Math.round((saved / official) * 100);

    document.getElementById('official-price').innerText = `$${official.toFixed(2)}`;
    document.getElementById('internal-price').innerText = `$${internal.toFixed(2)}`;
    document.getElementById('saved-price').innerText = `$${saved.toFixed(2)}`;
    document.getElementById('saved-percent').innerText = `${percent}% AHORRO`;
}

// Checkout WhatsApp
function buyNow(name, price) {
    const msg = encodeURIComponent(`Hola Click TV! 👋 Deseo comprar de inmediato: *${name}* ($${price.toFixed(2)}). ¿Me dan los datos de pago?`);
    window.open(`https://wa.me/${WPP_NUMBER}?text=${msg}`, '_blank');
}

function checkoutWhatsApp() {
    if(cart.length === 0) return alert("Tu carrito está vacío");
    
    let itemsStr = cart.map(i => `- ${i.name} ($${i.price.toFixed(2)})`).join('%0A');
    const total = document.getElementById('cart-total').innerText;
    
    const msg = `🛒 *NUEVO PEDIDO CLICK TV*%0A%0A${itemsStr}%0A%0A*TOTAL: ${total}*%0A%0A_Por favor enviarme instrucciones de pago._`;
    window.open(`https://wa.me/${WPP_NUMBER}?text=${msg}`, '_blank');
}

// Utilitarios
function showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 20px; left: 20px; background: #333; color: #fff;
        padding: 12px 25px; border-radius: 8px; z-index: 3000; box-shadow: var(--shadow);
        border-left: 4px solid var(--primary); animation: slideIn 0.3s ease;
    `;
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}

function toggleMenu() {
    document.getElementById('nav-menu').classList.toggle('active');
}
