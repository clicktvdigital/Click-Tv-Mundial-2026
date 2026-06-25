const products = [];
const WPP_NUMBER = "593939166222";
let cart = [];
let currentCurrency = 'USD';
let currentRate = 1;
let discountPercent = 0;

const currencyMap = {
    'EC': 'USD', 'US': 'USD', 'SV': 'USD', 'PA': 'USD',
    'PE': 'PEN', 'CO': 'COP', 'AR': 'ARS', 'CL': 'CLP', 
    'MX': 'MXN'
};

const activities = [
    "🟢 Cliente de Quito activó IPTV Premium",
    "🟢 Cliente de Lima adquirió Disney+",
    "🟢 Cliente de Bogotá adquirió Paramount+",
    "🟢 Cliente de Guayaquil activó DAZN",
    "🟢 Cliente de Santiago adquirió Netflix",
    "🟢 Cliente de México activó IPTV Ultra"
];

async function initApp() {
    try {
        await fetchExchangeRates();

        // PROTEGIDO
        detectUserCountry().catch(() => {
            const el = document.getElementById('user-location');
            if (el) el.innerText = 'Latinoamérica';
        });

        // PROTEGIDO
        fetchWorldCupMatches().catch(() => {
            console.warn("matches error");
        });

        if (typeof startToastRotator === "function") startToastRotator();
        if (typeof simulateOnlineUsers === "function") simulateOnlineUsers();
let cartRendering = false;
        updateCartUI();
        applyCurrencyUpdate();

    } catch(err) {
        console.error("ERROR INIT:", err);
    }
}

async function fetchExchangeRates() {
    window.rates = { USD: 1, PEN: 3.80, COP: 4000, ARS: 1000, CLP: 950, MXN: 17 };
}

async function detectUserCountry() {
    const locationEl = document.getElementById('user-location');
    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if(locationEl) locationEl.innerText = `🌎 ${data.country_name}`;
    } catch (e) {
        if(locationEl) locationEl.innerText = 'Latinoamérica';
    }
}

function formatMoney(amount, currency) {
    const value = Number(amount);
    switch(currency){
        case 'USD': return `$${value.toFixed(2)} USD`;
        case 'PEN': return `S/ ${value.toFixed(2)}`;
        case 'COP': return `$${Math.round(value).toLocaleString('es-CO')} COP`;
        case 'ARS': return `$${Math.round(value).toLocaleString('es-AR')} ARS`;
        case 'CLP': return `$${Math.round(value).toLocaleString('es-CL')} CLP`;
        case 'MXN': return `$${value.toFixed(2)} MXN`;
        default: return `$${value.toFixed(2)} ${currency}`;
    }
}

let currencyUpdating = false;

function applyCurrencyUpdate() {
    if (currencyUpdating) return;

    currencyUpdating = true;

    currentRate = window.rates[currentCurrency] || 1;

    document.querySelectorAll('.local-price').forEach(el => {
        const usdPrice = parseFloat(el.getAttribute('data-usd'));
        el.innerText = formatMoney(usdPrice * currentRate, currentCurrency);
    });

    updateCartUI();

    setTimeout(() => {
        currencyUpdating = false;
    }, 50);
}

function toggleMenu() {
    document.getElementById('nav-links').classList.toggle('active');
}

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('active');
}

function addToCart(name, priceUSD) {
    const existing = cart.find(i => i.name === name);
    if (existing) existing.qty++;
    else cart.push({ name, priceUSD, qty: 1 });
    updateCartUI();
    document.getElementById('cart-sidebar').classList.add('active');
}

function updateCartUI() {
    if (cartRendering) return;
    cartRendering = true;

    const itemsContainer = document.getElementById('cart-items');
    const totalsSection = document.getElementById('cart-totals-section');
    const subtotalEl = document.getElementById('cart-subtotal-local');
    const totalEl = document.getElementById('cart-total-local');
    const countEl = document.getElementById('cart-count');

    if (!itemsContainer) {
    cartRendering = false;
    console.warn("Cart container no encontrado");
    return;
}

    itemsContainer.innerHTML = '';

    if (cart.length === 0) {
        itemsContainer.innerHTML = `
            <div class="empty-cart">
                🛒 Tu carrito está vacío
            </div>
        `;
        if (totalsSection) totalsSection.style.display = 'none';

        cartRendering = false;
        return;
    }

    let subtotalUSD = 0;

    cart.forEach(item => {
        subtotalUSD += item.priceUSD * item.qty;

        itemsContainer.innerHTML += `
        <div class="cart-item">
            <h4>${item.name}</h4>
            <p>x${item.qty}</p>
        </div>`;
    });

    if (totalsSection) totalsSection.style.display = 'block';

    if (subtotalEl) subtotalEl.innerText =
        formatMoney(subtotalUSD * currentRate, currentCurrency);

    if (totalEl) totalEl.innerText =
        formatMoney(subtotalUSD * currentRate, currentCurrency);

    if (countEl) countEl.innerText =
        cart.reduce((a, b) => a + b.qty, 0);

    cartRendering = false;
}

const teamFlags = { Ecuador: "🇪🇨", Spain: "🇪🇸", Belgium: "🇧🇪", Uruguay: "🇺🇾", France: "🇫🇷" };

async function fetchWorldCupMatches() {
    const container = document.getElementById('matches-container');
    if (!container) return;
    const events = window.worldcupMatches || [];
    if (!events.length) {
    container.innerHTML = `<div class="empty-matches">No hay partidos disponibles</div>`;
    return;
}
    let html = '';
    events.forEach(m => {
        html += `
        <div class="match-card">
            <div class="match-teams">
                <span>${teamFlags[m.strHomeTeam] || ''} ${m.strHomeTeam}</span> VS 
                <span>${teamFlags[m.strAwayTeam] || ''} ${m.strAwayTeam}</span>
            </div>
            <div class="match-info"><span class="countdown" data-date="${m.dateEvent}" data-time="${m.strTime}"></span></div>
        </div>`;
    });
    container.innerHTML = html;
    startCountdowns();
}

function startCountdowns(){
    countdownIntervals.forEach(clearInterval);
    countdownIntervals = [];

    document.querySelectorAll('.countdown').forEach(el=>{
        if (!el.dataset.date || !el.dataset.time) return;

const matchDate = new Date(`${el.dataset.date}T${el.dataset.time}`);

        const interval = setInterval(() => {
            const diff = matchDate - new Date();
            if(diff <= 0) el.innerHTML = 'EN VIVO';
            else el.innerHTML = `⏳ Faltan ${Math.floor(diff/1000/60)} min`;
        }, 1000);

        countdownIntervals.push(interval);
    });
}

function addDropdownToCart(baseName, selectId) {
    const select = document.getElementById(selectId);
    const opt = select.options[select.selectedIndex];
    addToCart(`${baseName} - ${opt.text.split('-')[0].trim()}`, parseFloat(opt.getAttribute('data-usd')));
}

window.addEventListener('load', initApp);