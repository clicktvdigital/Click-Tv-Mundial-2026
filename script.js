const products = [];
const WPP_NUMBER = "593939166222";
let cart = [];
let currentCurrency = 'USD';
let currentRate = 1;
let discountPercent = 0;

async function initApp() {
    try {
        window.rates = { USD: 1, PEN: 3.80, COP: 4000, ARS: 1000, CLP: 950, MXN: 17 };
        await detectUserCountry();
        await fetchWorldCupMatches();
        startToastRotator();
        simulateOnlineUsers();
        updateCartUI();
        applyCurrencyUpdate();
    } catch(err) {
        console.error("ERROR INIT:", err);
    }
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

function applyCurrencyUpdate() {
    currentRate = window.rates[currentCurrency] || 1;
    document.querySelectorAll('.local-price').forEach(el => {
        const usdPrice = parseFloat(el.getAttribute('data-usd'));
        el.innerText = `$${(usdPrice * currentRate).toFixed(2)} ${currentCurrency}`;
    });
    updateCartUI();
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
    const itemsContainer = document.getElementById('cart-items');
    const totalsSection = document.getElementById('cart-totals-section');
    if(!itemsContainer) return;
    itemsContainer.innerHTML = '';
    let subtotalUSD = 0;
    cart.forEach(item => {
        subtotalUSD += item.priceUSD * item.qty;
        itemsContainer.innerHTML += `<div class="cart-item"><h4>${item.name}</h4><p>x${item.qty}</p></div>`;
    });
    if(totalsSection) totalsSection.style.display = cart.length > 0 ? 'block' : 'none';
    document.getElementById('cart-total-local').innerText = `$${(subtotalUSD * currentRate).toFixed(2)} ${currentCurrency}`;
    document.getElementById('cart-count').innerText = cart.length;
}

// FIX: Template Strings corregidos con backticks (`)
async function fetchWorldCupMatches() {
    const container = document.getElementById('matches-container');
    if (!container) return;
    const events = [
        { strHomeTeam: "Ecuador", strAwayTeam: "Ivory Coast", dateEvent: "2026-06-17", strTime: "18:00:00" }
    ];
    let html = '';
    events.forEach(m => {
        html += `
        <div class="match-card">
            <div class="match-teams"><span>${m.strHomeTeam}</span> VS <span>${m.strAwayTeam}</span></div>
            <div class="match-info"><span class="countdown" data-date="${m.dateEvent}" data-time="${m.strTime}"></span></div>
        </div>`;
    });
    container.innerHTML = html;
    startCountdowns();
}

function startCountdowns(){
    document.querySelectorAll('.countdown').forEach(el=>{
        const date = el.dataset.date;
        const time = el.dataset.time;
        const matchDate = new Date(`${date}T${time}Z`); // Corregido
        setInterval(() => {
            const diff = matchDate - new Date();
            if(diff <= 0) el.innerHTML = 'EN VIVO';
            else el.innerHTML = `⏳ Faltan ${Math.floor(diff/1000/60)} min`;
        }, 1000);
    });
}

function toggleMenu() {
    document.getElementById('nav-links').classList.toggle('active');
}

function addDropdownToCart(baseName, selectId) {
    const select = document.getElementById(selectId);
    const opt = select.options[select.selectedIndex];
    addToCart(`${baseName} - ${opt.text.split('-')[0].trim()}`, parseFloat(opt.getAttribute('data-usd')));
}

window.addEventListener('load', initApp);