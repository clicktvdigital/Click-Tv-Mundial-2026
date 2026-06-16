const WPP_NUMBER = "593939166222";
let cart = JSON.parse(localStorage.getItem('clicktv_cart')) || [];
let currentCurrency = 'USD';
let rates = { USD: 1, PEN: 3.80, COP: 4000, ARS: 1050, CLP: 950, MXN: 18 };

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    detectUserCountry();
    updateCartUI();
    renderMatches();
    simulateOnlineUsers();
}

function changeCurrency(val) {
    currentCurrency = val;
    applyCurrencyUpdate();
}

function applyCurrencyUpdate() {
    const rate = rates[currentCurrency];
    document.querySelectorAll('.local-price').forEach(el => {
        const usd = parseFloat(el.getAttribute('data-usd'));
        el.innerText = formatMoney(usd * rate, currentCurrency);
    });
    updateCartUI();
}

function formatMoney(amount, currency) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0
    }).format(amount);
}

function toggleMenu() {
    document.getElementById('nav-links').classList.toggle('active');
}

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('active');
}

function addToCart(name, priceUSD) {
    const item = cart.find(i => i.name === name);
    if (item) item.qty++;
    else cart.push({ name, priceUSD, qty: 1 });
    
    saveCart();
    updateCartUI();
    showToast(`✅ ${name} añadido`);
}

function addDropdownToCart(baseName, selectId) {
    const select = document.getElementById(selectId);
    const opt = select.options[select.selectedIndex];
    addToCart(`${baseName} (${opt.text.split('-')[0].trim()})`, parseFloat(opt.getAttribute('data-usd')));
}

function updateCartUI() {
    const container = document.getElementById('cart-items');
    const countEl = document.getElementById('cart-count');
    const totalEl = document.getElementById('cart-total-local');
    
    if(!container) return;
    
    container.innerHTML = '';
    let totalUSD = 0;
    let totalQty = 0;

    cart.forEach((item, index) => {
        totalUSD += item.priceUSD * item.qty;
        totalQty += item.qty;
        container.innerHTML += `
            <div class="cart-item" style="display:flex; justify-content:space-between; margin-bottom:10px; background:#1a1a1a; padding:10px; border-radius:5px;">
                <span>${item.name} (x${item.qty})</span>
                <button onclick="removeItem(${index})" style="color:red">X</button>
            </div>`;
    });

    countEl.innerText = totalQty;
    totalEl.innerText = formatMoney(totalUSD * rates[currentCurrency], currentCurrency);
}

function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('clicktv_cart', JSON.stringify(cart));
}

function processCheckout() {
    if (cart.length === 0) return showToast("El carrito está vacío");
    let text = `🚀 *NUEVO PEDIDO CLICK TV*%0A%0A`;
    cart.forEach(i => text += `• ${i.qty}x ${i.name}%0A`);
    text += `%0A💰 *Total:* ${document.getElementById('cart-total-local').innerText}`;
    window.open(`https://wa.me/${WPP_NUMBER}?text=${text}`, '_blank');
}

function renderMatches() {
    const container = document.getElementById('matches-container');
    const matches = [
        { home: "Ecuador 🇪🇨", away: "Costa de Marfil 🇨🇮", time: "18:00", date: "2026-06-17" },
        { home: "México 🇲🇽", away: "España 🇪🇸", time: "20:00", date: "2026-06-17" }
    ];

    container.innerHTML = matches.map(m => `
        <div class="match-card">
            <div class="match-teams"><span>${m.home}</span> VS <span>${m.away}</span></div>
            <div class="match-info">📅 ${m.date} | 🕒 ${m.time} (Ecuador)</div>
        </div>
    `).join('');
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = msg;
    document.getElementById('toast-container').appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function detectUserCountry() {
    fetch('https://ipapi.co/json/').then(res => res.json()).then(data => {
        document.getElementById('user-location').innerText = data.city + ", " + data.country_name;
    }).catch(() => {
        document.getElementById('user-location').innerText = "Latinoamérica";
    });
}

function simulateOnlineUsers() {
    setInterval(() => {
        const base = 250 + Math.floor(Math.random() * 50);
        document.getElementById('online-count').innerText = base;
    }, 5000);
}