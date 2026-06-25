<script>
window.onerror = function(message, source, lineno, colno, error) {
    console.log("⚠️ Error capturado:", message);
    return true; // evita crash total
};
</script>

// Configuración de Backend (Supabase)
const SUPABASE_URL = 'TU_SUPABASE_URL';
const SUPABASE_KEY = 'TU_SUPABASE_KEY';
// const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let cart = JSON.parse(localStorage.getItem('clicktv_cart')) || [];
let currentCurrency = 'USD';
let rates = { USD: 1, PEN: 3.75, COP: 3950, MXN: 17.20 };
let discountPercent = 0;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    detectUserCountry();
    renderComments();
    startOnlineCounter();
});

// --- Lógica del Carrito ---

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('active');
}

function addToCart(name, priceUSD) {
    const existing = cart.find(i => i.name === name);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, priceUSD, qty: 1 });
    }
    saveAndSync();
    showToast(`✅ ${name} agregado`);
}

function addDropdownToCart(baseName, selectId) {
    const select = document.getElementById(selectId);
    const opt = select.options[select.selectedIndex];
    const finalName = `${baseName} - ${opt.text.split('-')[0].trim()}`;
    const price = parseFloat(opt.getAttribute('data-usd'));
    addToCart(finalName, price);
}

function updateCartUI() {
    const container = document.getElementById('cart-items');
    if (!container) return;

    const countLabel = document.getElementById('cart-count');
    const subtotalLabel = document.getElementById('cart-subtotal-local');
    const totalLabel = document.getElementById('cart-total-local');

    if (!countLabel || !subtotalLabel || !totalLabel) return;
    container.innerHTML = '';
    let subtotalUSD = 0;
    let totalItems = 0;

    cart.forEach((item, index) => {
        subtotalUSD += (item.priceUSD * item.qty);
        totalItems += item.qty;
        
        container.innerHTML += `
            <div class="cart-item-row">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>${formatMoney(item.priceUSD * rates[currentCurrency], currentCurrency)}</p>
                </div>
                <div class="item-qty">
                    <button onclick="changeQty(${index}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button onclick="changeQty(${index}, 1)">+</button>
                </div>
            </div>
        `;
    });

    const totalUSD = subtotalUSD * (1 - discountPercent);
    countLabel.innerText = totalItems;
    subtotalLabel.innerText = formatMoney(subtotalUSD * rates[currentCurrency], currentCurrency);
    totalLabel.innerText = formatMoney(totalUSD * rates[currentCurrency], currentCurrency);
    
    document.getElementById('cart-total-usd').innerText = `$${totalUSD.toFixed(2)} USD`;
}

function changeQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    saveAndSync();
}

function saveAndSync() {
    localStorage.setItem('clicktv_cart', JSON.stringify(cart));
    updateCartUI();
}

// --- Checkout & Pagos ---

function processCheckout() {
    if (cart.length === 0) return showToast("El carrito está vacío");
    
    let message = `🚀 *NUEVO PEDIDO CLICK TV*%0A%0A`;
    cart.forEach(i => message += `• ${i.name} (x${i.qty})%0A`);
    message += `%0A💰 *Total:* ${document.getElementById('cart-total-local').innerText}`;
    
    window.open(`https://wa.me/593939166222?text=${message}`, '_blank');
}

function payWithPayPal() {
    const total = document.getElementById('cart-total-usd').innerText.replace('$', '').replace(' USD', '');
    showToast("Redirigiendo a PayPal...");
    // Integración SDK PayPal aquí
    window.open(`https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=TU_EMAIL&amount=${total}&currency_code=USD&item_name=ClickTV_Order`, '_blank');
}

// --- Utilidades ---

function formatMoney(amount, currency) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: currency,
    }).format(amount);
}

function applyCoupon() {
    const code = document.getElementById('coupon-code').value.toUpperCase();
    if (code === 'CLICKTV2026') {
        discountPercent = 0.10;
        showToast("🎁 Cupón del 10% aplicado");
    } else {
        showToast("❌ Cupón inválido");
    }
    updateCartUI();
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'ios-toast';
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- Comentarios ---
function addComment() {
    const name = document.getElementById('comment-name').value;
    const text = document.getElementById('comment-text').value;
    if(!name || !text) return;
    
    let comments = JSON.parse(localStorage.getItem('click_comments')) || [];
    comments.unshift({ name, text, date: new Date().toLocaleDateString() });
    localStorage.setItem('click_comments', JSON.stringify(comments));
    renderComments();
}

function renderComments() {
    const list = document.getElementById('comments-list');
    let comments = JSON.parse(localStorage.getItem('click_comments')) || [];
    list.innerHTML = comments.map(c => `
        <div class="comment-card">
            <strong>${c.name}</strong> <small>${c.date}</small>
            <p>${c.text}</p>
        </div>
    `).join('');
}
function updateDropdownPrice(select) {
    const opt = select.options[select.selectedIndex];
    const price = opt.getAttribute("data-usd");

    const card = select.closest(".card");
    if (!card) return;

    const priceLabel = card.querySelector(".local-price");
    if (priceLabel) {
        priceLabel.innerText = `$${price}.00`;
    }
}
function startOnlineCounter() {
    const el = document.getElementById("online-count");
    if (!el) return;

    setInterval(() => {
        let base = 540;
        let random = Math.floor(Math.random() * 20);
        el.innerText = base + random;
    }, 4000);
}
function detectUserCountry() {
    const el = document.getElementById("user-location");
    if (!el) return;

    fetch("https://ipapi.co/json/")
        .then(res => res.json())
        .then(data => {
            el.innerText = data.country_name || "LATAM";
        })
        .catch(() => {
            el.innerText = "LATAM";
        });
}
function renderMatches() {
    const container = document.getElementById("matches-container");
    if (!container) return;

    container.innerHTML = `
        <div class="match-card">
            <h3>⚽ Mundial 2026 en vivo</h3>
            <p>Partidos actualizándose automáticamente</p>
            <span style="color:#00ff88;">EN VIVO</span>
        </div>
    `;
}
function toggleMenu() {
    const menu = document.querySelector('.nav-menu');
    if (!menu) return;
    menu.classList.toggle('active');
}



window.addEventListener("DOMContentLoaded", () => {
    console.log("SYSTEM INIT OK");

    if (typeof toggleCart !== "function") {
        console.warn("toggleCart missing");
    }

    if (document.getElementById("streaming-grid")) {
        console.log("catalog container OK");
    }

    if (document.getElementById("matches-container")) {
        console.log("matches container OK");
    }
});
window.addEventListener("error", function(e) {
    console.log("⚠️ Error capturado:", e.message);
});