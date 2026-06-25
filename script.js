// ================= AMAZON PRO ENGINE (CLEAN VERSION) =================

let countdownIntervals = [];
let cart = [];
let currentCurrency = 'USD';
let currentRate = 1;
let currencyUpdating = false;

window.rates = window.rates || { USD: 1 };

const WPP_NUMBER = "593939166222";

const currencyMap = {
    'EC': 'USD', 'US': 'USD', 'SV': 'USD', 'PA': 'USD',
    'PE': 'PEN', 'CO': 'COP', 'AR': 'ARS', 'CL': 'CLP',
    'MX': 'MXN'
};

// ================= INIT =================
async function initApp() {
    try {
        await fetchExchangeRates();

        detectUserCountry().catch(() => {
            const el = document.getElementById('user-location');
            if (el) el.innerText = 'Latinoamérica';
        });

        fetchWorldCupMatches().catch(console.error);

        updateCartUI();
        applyCurrencyUpdate();

    } catch (err) {
        console.error("INIT ERROR:", err);
    }
}

// ================= EXCHANGE =================
async function fetchExchangeRates() {
    window.rates = { USD: 1, PEN: 3.80, COP: 4000, ARS: 1000, CLP: 950, MXN: 17 };
}

function detectUserCountry() {
    return fetch('https://ipapi.co/json/')
        .then(r => r.json())
        .then(d => {
            const el = document.getElementById('user-location');
            if (el) el.innerText = `🌎 ${d.country_name}`;
        });
}

// ================= MONEY =================
function formatMoney(amount, currency) {
    const v = Number(amount);

    switch (currency) {
        case 'USD': return `$${v.toFixed(2)} USD`;
        case 'PEN': return `S/ ${v.toFixed(2)}`;
        case 'COP': return `$${Math.round(v).toLocaleString('es-CO')} COP`;
        case 'ARS': return `$${Math.round(v).toLocaleString('es-AR')} ARS`;
        case 'CLP': return `$${Math.round(v).toLocaleString('es-CL')} CLP`;
        case 'MXN': return `$${v.toFixed(2)} MXN`;
        default: return `$${v.toFixed(2)} ${currency}`;
    }
}

// ================= CURRENCY =================
function applyCurrencyUpdate() {
    
    if (currencyUpdating) return;
    currencyUpdating = true;
    
    if (!window.rates) {
        window.rates = { USD: 1 };
    }
    
    currentRate = window.rates[currentCurrency] || 1;
    
    document.querySelectorAll('.local-price').forEach(el => {
        
        const usd = parseFloat(el.dataset.usd);
        
        if (isNaN(usd)) return;
        
        el.innerText = formatMoney(usd * currentRate, currentCurrency);
    });
    
    updateCartUI();
    
    setTimeout(() => currencyUpdating = false, 100);
}

// ================= CART CORE =================
function addToCart(name, priceUSD) {
    if (!name || isNaN(priceUSD)) return;

    const item = cart.find(i => i.name === name);

    if (item) item.qty++;
    else cart.push({ name, priceUSD, qty: 1 });

    updateCartUI();

    const sidebar = document.getElementById('cart-sidebar');
    if (sidebar) sidebar.classList.add('active');
}

function updateCartUI() {
    
    const container = document.getElementById("cart-items");
    const count = document.getElementById("cart-count");
    const empty = document.getElementById("cart-empty");
    const totals = document.getElementById("cart-totals-section");
    const subtotal = document.getElementById("cart-subtotal-local");
    const total = document.getElementById("cart-total-local");
    
    if (!container) return;
    
    let html = "";
    let totalItems = 0;
    let totalUSD = 0;
    
    cart.forEach(item => {
        totalItems += item.qty;
        totalUSD += item.priceUSD * item.qty;
        
        html += `
            <div class="cart-item">
                <b>${item.name}</b>
                <span>x${item.qty}</span>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // EMPTY STATE CONTROL PERFECTO
    if (cart.length === 0) {
        
        if (empty) empty.style.display = "block";
        if (totals) totals.style.display = "none";
        
    } else {
        
        if (empty) empty.style.display = "none";
        if (totals) totals.style.display = "block";
        
    }
    
    // TOTALS (IMPORTANTE)
    if (subtotal) subtotal.innerText = `$${totalUSD.toFixed(2)}`;
    if (total) total.innerText = `$${totalUSD.toFixed(2)}`;
    
    // COUNTER SAFE
    if (count) count.innerText = totalItems;
}
// ================= DROPDOWN =================
function addDropdownToCart(baseName, selectId) {
    
    const select = document.getElementById(selectId);
    if (!select) return;
    
    const opt = select.options[select.selectedIndex];
    if (!opt) return;
    
    const price = parseFloat(opt.dataset.usd || "0");
    
    if (isNaN(price) || price <= 0) return;
    
    const label = opt.text.split('-')[0].trim();
    
    addToCart(`${baseName} - ${label}`, price);
}
// ================= BUY NOW =================
function buyNow(name, priceUSD) {

    const msg = `🛒 CLICK TV ORDER\n\n📦 ${name}\n💰 $${priceUSD} USD`;

    window.open(
        `https://wa.me/${WPP_NUMBER}?text=${encodeURIComponent(msg)}`,
        "_blank"
    );
}

function buyNowDropdown(baseName, selectId) {

    const select = document.getElementById(selectId);
    if (!select) return;

    const opt = select.options[select.selectedIndex];
    const price = parseFloat(opt.dataset.usd);
    const label = opt.text.split('-')[0].trim();

    buyNow(`${baseName} - ${label}`, price);
}

// ================= MENU =================
function toggleMenu() {
    document.getElementById('nav-links')?.classList.toggle('active');
}

function toggleCart() {
    document.getElementById('cart-sidebar')?.classList.toggle('active');
}

// ================= WORLD CUP (SAFE) =================
function fetchWorldCupMatches() {
    const container = document.getElementById('matches-container');
    if (!container) return;

    const events = window.worldcupMatches || [];

    if (!events.length) {
        container.innerHTML = `<div class="empty-matches">⚽ Cargando partidos...</div>`;
        return;
    }

    container.innerHTML = events.map(m => `
        <div class="match-card">
            <div>${m.strHomeTeam} VS ${m.strAwayTeam}</div>
            <div class="countdown">⏳</div>
        </div>
    `).join('');
}

// ================= START =================
window.addEventListener('DOMContentLoaded', initApp);

