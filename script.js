const WPP_NUMBER = "593939166222";
let cart = [];
let currentCurrency = 'USD';
let currentRate = 1;

const currencyMap = {
    'EC': 'USD', 'US': 'USD', 'SV': 'USD', 'PA': 'USD',
    'PE': 'PEN', 'CO': 'COP', 'AR': 'ARS', 'CL': 'CLP', 
    'MX': 'MXN', 'BR': 'BRL', 'UY': 'UYU', 'PY': 'PYG', 
    'BO': 'BOB', 'VE': 'VES'
};

const toastMessages = [
    "🟢 Activación completada",
    "🟢 Servicio Premium activado",
    "🟢 Nuevo cliente conectado",
    "🟢 Mundial 2026 disponible",
    "🟢 IPTV Premium disponible",
    "🟢 Soporte técnico conectado"
];

let currentContactMethod = 'whatsapp';

async function initApp() {
    await fetchExchangeRates();
    await detectUserCountry();
    calculateSavings();
    startToastRotator();
    loadWorldCupMatches();
    simulateOnlineUsers();
}

async function fetchExchangeRates() {
    try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        window.rates = data.rates;
    } catch (e) {
        window.rates = { USD:1, PEN:3.8, COP:4000, ARS:1000, CLP:950, MXN:17, BRL:5, UYU:39, PYG:7300, BOB:6.9, VES:36 };
    }
}

async function detectUserCountry() {
    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        document.getElementById('user-location').innerText = `${data.country_name}`;
        if (currencyMap[data.country_code]) {
            currentCurrency = currencyMap[data.country_code];
            document.getElementById('currency-selector').value = currentCurrency;
        }
    } catch (e) {
        document.getElementById('user-location').innerText = `Latinoamérica`;
    }
    applyCurrencyUpdate();
}

function updatePricesManually() {
    currentCurrency = document.getElementById('currency-selector').value;
    applyCurrencyUpdate();
}

function formatMoney(amount, currency) {
    if(currency === 'PYG' || currency === 'COP' || currency === 'CLP') {
        return new Intl.NumberFormat('es-LA', { style: 'currency', currency: currency, minimumFractionDigits: 0 }).format(amount);
    }
    return new Intl.NumberFormat('es-LA', { style: 'currency', currency: currency }).format(amount);
}

function applyCurrencyUpdate() {
    currentRate = window.rates[currentCurrency] || 1;
    document.querySelectorAll('.current-currency-label').forEach(el => el.innerText = currentCurrency);

    document.querySelectorAll('.local-price').forEach(el => {
        const usdPrice = parseFloat(el.getAttribute('data-usd'));
        el.innerText = formatMoney(usdPrice * currentRate, currentCurrency);
    });

    document.querySelectorAll('.usd-reference').forEach(el => {
        if(currentCurrency === 'USD') el.style.display = 'none';
        else {
            el.style.display = 'block';
            el.innerText = `~ $${parseFloat(el.getAttribute('data-usd')).toFixed(2)} USD`;
        }
    });

    updateCartUI();
    calculateSavings();
}

function updateDropdownPrice(selectElement) {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const usdPrice = parseFloat(selectedOption.getAttribute('data-usd'));
    const parentCard = selectElement.closest('.card');
    
    if(parentCard) {
        const displayElement = parentCard.querySelector('.local-price');
        if(displayElement) {
            displayElement.setAttribute('data-usd', usdPrice);
            displayElement.innerText = formatMoney(usdPrice * currentRate, currentCurrency);
        }
    }
}

function calculateSavings() {
    const select = document.getElementById('calc-service');
    const option = select.options[select.selectedIndex];
    const usdClick = parseFloat(option.value);
    const usdOfficial = parseFloat(option.getAttribute('data-official'));
    
    const savingsLocal = (usdOfficial * currentRate) - (usdClick * currentRate);
    const percent = Math.round(((usdOfficial - usdClick) / usdOfficial) * 100);

    document.getElementById('calc-official').innerText = formatMoney(usdOfficial * currentRate, currentCurrency);
    document.getElementById('calc-click').innerText = formatMoney(usdClick * currentRate, currentCurrency);
    document.getElementById('calc-savings').innerHTML = `${formatMoney(savingsLocal, currentCurrency)} <br><small>(${percent}% OFF)</small>`;
}

function toggleCart() { 
    document.getElementById('cart-sidebar').classList.toggle('active'); 
}

function toggleMenu() {
    document.getElementById('nav-links').classList.toggle('active');
}

function addToCart(name, priceUSD) {
    const existing = cart.find(i => i.name === name);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, priceUSD, qty: 1 });
    }
    updateCartUI();
    document.getElementById('cart-sidebar').classList.add('active');
}

function addDropdownToCart(baseName, selectId) {
    const select = document.getElementById(selectId);
    const opt = select.options[select.selectedIndex];
    addToCart(`${baseName} (${opt.text.split('-')[0].trim()})`, parseFloat(opt.getAttribute('data-usd')));
}

function removeFromCart(name) {
    cart = cart.filter(i => i.name !== name);
    updateCartUI();
}

function updateCartUI() {
    const itemsContainer = document.getElementById('cart-items');
    const emptyMsg = document.getElementById('cart-empty-msg');
    const totalsSection = document.getElementById('cart-totals-section');
    
    itemsContainer.innerHTML = '';
    let subtotalUSD = 0;
    let qtyTotal = 0;

    if (cart.length === 0) {
        emptyMsg.style.display = 'block';
        totalsSection.style.display = 'none';
        document.getElementById('cart-count').innerText = "0";
        return;
    }

    emptyMsg.style.display = 'none';
    totalsSection.style.display = 'block';

    cart.forEach(item => {
        subtotalUSD += item.priceUSD * item.qty;
        qtyTotal += item.qty;
        const localPrice = formatMoney(item.priceUSD * currentRate, currentCurrency);
        const itemTotalLocal = formatMoney(item.priceUSD * currentRate * item.qty, currentCurrency);
        
        itemsContainer.innerHTML += `
            <div class="cart-item">
                <div style="flex:1;">
                    <h4 style="font-size:14px">${item.name}</h4>
                    <small>${localPrice} x ${item.qty} = <b>${itemTotalLocal}</b></small>
                </div>
                <button onclick="removeFromCart('${item.name}')" style="color:var(--primary-red); padding:5px;"><i class="fas fa-trash"></i></button>
            </div>`;
    });

    document.getElementById('cart-count').innerText = qtyTotal;
    document.getElementById('cart-total-local').innerText = formatMoney(subtotalUSD * currentRate, currentCurrency);
    document.getElementById('cart-total-usd').innerText = `$${subtotalUSD.toFixed(2)} USD`;
}

function processCheckout() {
    if (cart.length === 0) return;
    let text = `🚀 *NUEVO PEDIDO INTERNACIONAL*%0A%0A📍 *Ubicación:* ${document.getElementById('user-location').innerText}%0A💱 *Moneda:* ${currentCurrency}%0A🛒 *Resumen:*%0A`;
    cart.forEach(i => { text += `▪ ${i.qty}x ${i.name} -> ${formatMoney(i.priceUSD * currentRate * i.qty, currentCurrency)}%0A`; });
    
    text += `%0A💰 *TOTAL:* ${document.getElementById('cart-total-local').innerText}%0A💵 *Ref USD:* ${document.getElementById('cart-total-usd').innerText}%0A`;
    text += `%0A💳 *Deseo finalizar mi pedido.*`;
    
    window.open(`https://wa.me/${WPP_NUMBER}?text=${text}`, '_blank');
}

function setContactMethod(method) {
    currentContactMethod = method;
}

function submitContactForm(e) {
    e.preventDefault();
    const name = document.getElementById('contact-name').value;
    const last = document.getElementById('contact-last').value;
    const country = document.getElementById('contact-country').value;
    const phone = document.getElementById('contact-phone').value;
    const msg = document.getElementById('contact-msg').value;

    const text = `🌎 *CONTACTO PLATAFORMA*%0A%0A👤 ${name} ${last}%0A📍 País: ${country}%0A📱 Tel: ${phone}%0A💬 Mensaje: ${msg}`;
    
    if(currentContactMethod === 'whatsapp') {
        window.open(`https://wa.me/${WPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
    } else {
        window.open(`https://t.me/streamid`, '_blank');
    }
}

function showToast(msg) {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast'; t.innerHTML = msg;
    c.appendChild(t);
    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translateX(-100%)';
        setTimeout(() => t.remove(), 500);
    }, 4000);
}

function startToastRotator() {
    let index = 0;
    setInterval(() => {
        showToast(toastMessages[index]);
        index = (index + 1) % toastMessages.length;
    }, 12000); 
}

async function loadWorldCupMatches() {
    const container = document.getElementById('matches-container');
    try {
        const response = await fetch('https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=2026-06-11&s=Soccer');
        const data = await response.json();
        
        if (data.events && data.events.length > 0) {
            let html = '';
            data.events.slice(0, 4).forEach(match => {
                html += `
                <div style="background:var(--bg-card); padding:20px; border-radius:10px; margin-bottom:15px; border:1px solid #333; text-align:center;">
                    <div style="color:#aaa; font-size:12px; margin-bottom:10px;">${match.strEvent}</div>
                    <div style="font-weight:bold; font-size:1.2rem; margin-bottom:10px;">${match.strHomeTeam} vs ${match.strAwayTeam}</div>
                    <div style="color:var(--gold); font-size:14px;"><i class="far fa-clock"></i> ${match.strTime} (UTC)</div>
                </div>`;
            });
            container.innerHTML = html;
        } else {
            showFallbackMatches(container);
        }
    } catch (error) {
        showFallbackMatches(container);
    }
}

function showFallbackMatches(container) {
    container.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <i class="fas fa-futbol" style="font-size: 3rem; color: var(--gold); margin-bottom: 20px;"></i>
            <h3 style="margin-bottom: 15px;">⚽ Próximamente disponibles</h3>
            <p style="color: #aaa; margin-bottom: 20px; font-size: 14px;">Los horarios oficiales del Mundial 2026 se actualizarán automáticamente.</p>
            <a href="https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures?country=EC&wtw-filter=ALL" target="_blank" class="btn btn-primary" style="display: inline-block;">
                <i class="far fa-calendar-alt"></i> Ver Calendario Oficial FIFA
            </a>
        </div>
    `;
}

function simulateOnlineUsers() {
    const onlineCountEl = document.getElementById('online-count');
    setInterval(() => {
        const base = 120;
        const random = Math.floor(Math.random() * 40);
        onlineCountEl.innerText = base + random;
    }, 5000);
}

document.addEventListener('DOMContentLoaded', initApp);