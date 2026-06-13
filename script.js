// ==========================================
// CONFIGURACIÓN GLOBAL
// ==========================================
const WPP_NUMBER = "593939166222";
let cart = [];
let discountPercent = 0;
let currentCurrency = 'USD';
let currentRate = 1;

const currencyMap = {
    'EC':'USD','US':'USD','SV':'USD','PA':'USD',
    'PE':'PEN','CO':'COP','AR':'ARS','CL':'CLP',
    'MX':'MXN','BR':'BRL','UY':'UYU','PY':'PYG',
    'BO':'BOB','VE':'VES'
};

// ==========================================
// INICIALIZACIÓN
// ==========================================
async function initApp() {
    await fetchExchangeRates();
    await detectUserCountry();
    calculateSavings();
    setupTabs();
    setupReviews();
    setupActivityFeed();
    startLiveNotifications();
    animateOnlineCount();
}

// ==========================================
// TIPOS DE CAMBIO
// ==========================================
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
        document.getElementById('user-location').innerText = `${data.city}, ${data.country_name}`;
        if (currencyMap[data.country_code]) {
            currentCurrency = currencyMap[data.country_code];
            document.getElementById('currency-selector').value = currentCurrency;
        }
    } catch (e) {
        document.getElementById('user-location').innerText = `Global`;
    }
    applyCurrencyUpdate();
}

document.getElementById('currency-selector').addEventListener('change', (e) => {
    currentCurrency = e.target.value;
    applyCurrencyUpdate();
});

function formatMoney(amount, currency) {
    if(['PYG','COP','CLP'].includes(currency)) {
        return new Intl.NumberFormat('es-LA', { style:'currency', currency, minimumFractionDigits:0 }).format(amount);
    }
    return new Intl.NumberFormat('es-LA', { style:'currency', currency }).format(amount);
}

function applyCurrencyUpdate() {
    currentRate = window.rates[currentCurrency] || 1;
    document.getElementById('current-currency-display').innerText = currentCurrency;
    
    document.querySelectorAll('.current-currency-label').forEach(el => {
        const usd = parseFloat(el.getAttribute('data-usd'));
        if (!isNaN(usd)) el.innerText = formatMoney(usd * currentRate, currentCurrency);
    });
    document.querySelectorAll('.usd-reference').forEach(el => {
        const usd = parseFloat(el.getAttribute('data-usd'));
        if (currentCurrency === 'USD') el.style.display = 'none';
        else {
            el.style.display = 'block';
            if (!isNaN(usd)) el.innerText = `~ $${usd.toFixed(2)} USD`;
        }
    });
    updateCartUI();
    calculateSavings();
}

function updateDropdownPrice(selectElement) {
    const opt = selectElement.options[selectElement.selectedIndex];
    const usd = parseFloat(opt.getAttribute('data-usd'));
    const card = selectElement.closest('.card');
    const priceEl = card.querySelector('.local-price');
    const refEl = card.querySelector('.usd-reference');
    priceEl.setAttribute('data-usd', usd);
    priceEl.innerText = formatMoney(usd * currentRate, currentCurrency);
    if (refEl) {
        refEl.setAttribute('data-usd', usd);
        if (currentCurrency === 'USD') refEl.style.display = 'none';
        else { refEl.style.display = 'block'; refEl.innerText = `~ $${usd.toFixed(2)} USD`; }
    }
}

// ==========================================
// CALCULADORA
// ==========================================
function calculateSavings() {
    const select = document.getElementById('calc-service');
    if (!select) return;
    const option = select.options[select.selectedIndex];
    const usdClick = parseFloat(option.value);
    const usdOfficial = parseFloat(option.getAttribute('data-official'));
    const savingsLocal = (usdOfficial * currentRate) - (usdClick * currentRate);
    const percent = Math.round(((usdOfficial - usdClick) / usdOfficial) * 100);
    
    document.getElementById('calc-official').innerText = formatMoney(usdOfficial * currentRate, currentCurrency);
    document.getElementById('calc-click').innerText = formatMoney(usdClick * currentRate, currentCurrency);
    document.getElementById('calc-savings').innerHTML = `${formatMoney(savingsLocal, currentCurrency)} <br><small>(${percent}% OFF)</small>`;
}

// ==========================================
// MUNDIAL TABS
// ==========================================
function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            showTabMessage(btn.dataset.tab);
        });
    });
}

function showTabMessage(tab) {
    const container = document.getElementById('matches-container');
    container.innerHTML = `
        <div class="match-info-box">
            <i class="fas fa-calendar-alt"></i>
            <h3>⚽ Información próximamente disponible</h3>
            <p>El calendario oficial de partidos del Mundial 2026 se publicará próximamente. Consulta el sitio oficial de FIFA para más detalles.</p>
            <a href="https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures" target="_blank" class="btn btn-primary">
                <i class="fas fa-external-link-alt"></i> Ver Calendario Oficial FIFA
            </a>
        </div>
    `;
}

// ==========================================
// CARRITO
// ==========================================
function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('active');
}

function toggleMenu() {
    document.getElementById('nav-links').classList.toggle('active');
}

function addToCart(name, priceUSD) {
    const existing = cart.find(i => i.name === name);
    if (existing) existing.qty++;
    else cart.push({ name, priceUSD, qty: 1 });
    updateCartUI();
    showToast(`🛒 Agregado: ${name}`);
    document.getElementById('cart-sidebar').classList.add('active');
}

function addDropdownToCart(baseName, selectId) {
    const select = document.getElementById(selectId);
    const opt = select.options[select.selectedIndex];
    const usd = parseFloat(opt.getAttribute('data-usd'));
    const planText = opt.text.split('-')[0].trim();
    addToCart(`${baseName} (${planText})`, usd);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function changeQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    updateCartUI();
}

function applyCoupon() {
    const code = document.getElementById('coupon-code').value.toUpperCase();
    if (code === 'CLICKTVMUNDIAL') {
        discountPercent = 0.05;
        showToast('🎁 Cupón aplicado: 5% OFF');
    } else {
        discountPercent = 0;
        showToast('❌ Cupón inválido');
    }
    updateCartUI();
}

function updateCartUI() {
    const itemsContainer = document.getElementById('cart-items');
    itemsContainer.innerHTML = '';
    let subtotalUSD = 0, qtyTotal = 0;
    
    cart.forEach((item, index) => {
        subtotalUSD += item.priceUSD * item.qty;
        qtyTotal += item.qty;
        itemsContainer.innerHTML += `
            <div class="cart-item">
                <div style="flex:1;">
                    <h4>${item.name}</h4>
                    <small>${formatMoney(item.priceUSD * currentRate, currentCurrency)} x ${item.qty}</small>
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="changeQty(${index}, -1)">−</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                    </div>
                </div>
                <i class="fas fa-trash" onclick="removeFromCart(${index})"></i>
            </div>
        `;
    });
    
    const discountUSD = subtotalUSD * discountPercent;
    const totalUSD = subtotalUSD - discountUSD;
    
    document.getElementById('cart-count').innerText = qtyTotal;
    document.getElementById('cart-subtotal').innerText = formatMoney(subtotalUSD * currentRate, currentCurrency);
    document.getElementById('cart-discount').innerText = formatMoney(discountUSD * currentRate, currentCurrency);
    document.getElementById('cart-total-local').innerText = formatMoney(totalUSD * currentRate, currentCurrency);
    document.getElementById('cart-total-usd').innerText = `$${totalUSD.toFixed(2)} USD`;
}

function processCheckout() {
    if (cart.length === 0) return alert('El carrito está vacío.');
    const location = document.getElementById('user-location').innerText;
    let text = `🚀 *NUEVO PEDIDO - CLICK TV MUNDIAL 2026*%0A%0A`;
    text += `📍 *Ubicación:* ${location}%0A`;
    text += `💱 *Moneda:* ${currentCurrency}%0A%0A`;
    text += `🛒 *Resumen:*%0A`;
    cart.forEach(i => {
        text += `▪ ${i.qty}x ${i.name} -> ${formatMoney(i.priceUSD * currentRate * i.qty, currentCurrency)}%0A`;
    });
    text += `%0A💰 *TOTAL:* ${document.getElementById('cart-total-local').innerText}%0A`;
    text += `💵 *Ref USD:* ${document.getElementById('cart-total-usd').innerText}%0A`;
    if (discountPercent > 0) text += `%0A🎁 *(Cupón CLICKTVMUNDIAL aplicado)*%0A`;
    text += `%0A💳 *Hola, deseo proceder con el pago.*`;
    window.open(`https://wa.me/${WPP_NUMBER}?text=${text}`, '_blank');
}

function sendCartReceipt() {
    if (cart.length === 0) return alert("Tu carrito está vacío.");
    const total = document.getElementById('cart-total-local').innerText;
    let text = `💳 *COMPROBANTE DE PAGO*%0A%0AHola, acabo de realizar el pago por *${total}*.%0A%0A*(Adjunto aquí la imagen de mi comprobante)*%0A%0A📧 *Email registrado:* clicktvprivado@gmail.com`;
    window.open(`https://wa.me/${WPP_NUMBER}?text=${text}`, '_blank');
}

// ==========================================
// COMPRAR AHORA (WhatsApp directo)
// ==========================================
function buyNow(name, priceUSD) {
    const text = `Hola, deseo comprar *${name}* por *$${priceUSD} USD*.%0A%0A📍 Mi ubicación: ${document.getElementById('user-location').innerText}%0A💱 Moneda: ${currentCurrency}`;
    window.open(`https://wa.me/${WPP_NUMBER}?text=${encodeURIComponent(text).replace(/%25/g, '%')}`, '_blank');
}

function buyNowDropdown(name, selectId) {
    const select = document.getElementById(selectId);
    const opt = select.options[select.selectedIndex];
    const usd = parseFloat(opt.getAttribute('data-usd'));
    const planText = opt.text;
    const text = `Hola, deseo comprar *${name}* - *${planText}* por *$${usd} USD*.%0A%0A📍 Mi ubicación: ${document.getElementById('user-location').innerText}%0A💱 Moneda: ${currentCurrency}`;
    window.open(`https://wa.me/${WPP_NUMBER}?text=${encodeURIComponent(text).replace(/%25/g, '%')}`, '_blank');
}

// ==========================================
// FORMULARIO
// ==========================================
function submitContactForm(e) {
    e.preventDefault();
    const f = e.target;
    let text = `🌎 *CONTACTO INTERNACIONAL*%0A%0A`;
    text += `👤 *Nombre:* ${f.nombre.value} ${f.apellido.value}%0A`;
    text += `🌐 *País:* ${f.pais.value}%0A`;
    text += `📱 *Celular:* ${f.celular.value}%0A`;
    text += `📧 *Correo:* ${f.correo.value}%0A`;
    text += `📺 *Servicio:* ${f.servicio.value}%0A`;
    if (f.mensaje.value) text += `💬 *Mensaje:* ${f.mensaje.value}%0A`;
    window.open(`https://wa.me/${WPP_NUMBER}?text=${text}`, '_blank');
}

// ==========================================
// SOPORTE
// ==========================================
function openSupport() {
    const text = `🎧 *SOPORTE TÉCNICO*%0A%0AHola equipo de Click TV. Necesito ayuda o más información sobre sus servicios.`;
    window.open(`https://wa.me/${WPP_NUMBER}?text=${text}`, '_blank');
}

// ==========================================
// UTILIDADES
// ==========================================
function copyText(elementId) {
    const text = document.getElementById(elementId).innerText;
    navigator.clipboard.writeText(text).then(() => {
        showToast(`✅ Copiado: ${text}`);
    }).catch(() => {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast(`✅ Copiado: ${text}`);
    });
}

function showToast(msg) {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = msg;
    c.appendChild(t);
    setTimeout(() => {
        t.style.animation = 'slideInUp 0.5s reverse';
        setTimeout(() => t.remove(), 500);
    }, 3500);
}

// ==========================================
// RESEÑAS SLIDER
// ==========================================
function setupReviews() {
    const reviews = [
        { stars: 5, text: "Excelente servicio, compré Paramount+ y vi el partido sin interrupciones. Activación rapidísima.", name: "Cliente Verificado", loc: "Quito - Ecuador" },
        { stars: 5, text: "Me sorprendió la facilidad de pago con PayPhone, en menos de 5 minutos ya tenía el IPTV instalado.", name: "Cliente Verificado", loc: "Lima - Perú" },
        { stars: 5, text: "El mejor catálogo para ver el Mundial. Con DIRECTV GO no me pierdo ni un solo detalle.", name: "Cliente Verificado", loc: "Bogotá - Colombia" },
        { stars: 5, text: "El soporte me ayudó paso a paso a instalar IBO Player en mi Smart TV. Servicio de 10.", name: "Cliente Verificado", loc: "Guayaquil - Ecuador" },
        { stars: 5, text: "Pude pagar en mi moneda sin problema. Disney+ funcionando perfecto con todos los partidos.", name: "Cliente Verificado", loc: "Santiago - Chile" },
        { stars: 5, text: "Netflix compartido a excelente precio. La cuenta funciona perfecto en mi Smart TV.", name: "Cliente Verificado", loc: "CDMX - México" },
        { stars: 5, text: "IPTV Premium con calidad 4K real. Los 104 partidos del Mundial sin cortes.", name: "Cliente Verificado", loc: "Buenos Aires - Argentina" },
        { stars: 5, text: "Spotify Premium activado en minutos. Ahorro total comparado con el precio oficial.", name: "Cliente Verificado", loc: "Montevideo - Uruguay" }
    ];
    
    const track = document.getElementById('reviews-track');
    // Duplicar para loop infinito
    const allReviews = [...reviews, ...reviews];
    track.innerHTML = allReviews.map(r => `
        <div class="review-card">
            <div class="stars">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</div>
            <p class="review-text">"${r.text}"</p>
            <div class="review-author">
                <div class="review-avatar">✓</div>
                <div class="review-info">
                    <b>${r.name}</b>
                    <small>${r.loc}</small>
                </div>
            </div>
        </div>
    `).join('');
}

// ==========================================
// ACTIVIDAD RECIENTE
// ==========================================
function setupActivityFeed() {
    const activities = [
        { icon: 'fa-check-circle', text: 'Cliente de Quito activó <b>IPTV Premium</b>' },
        { icon: 'fa-play-circle', text: 'Cliente de Lima adquirió <b>Disney+</b>' },
        { icon: 'fa-satellite-dish', text: 'Cliente de Bogotá adquirió <b>Paramount+</b>' },
        { icon: 'fa-bolt', text: 'Cliente de Guayaquil activó <b>IPTV Ultra</b>' },
        { icon: 'fa-tv', text: 'Cliente de Santiago adquirió <b>DAZN</b>' },
        { icon: 'fa-film', text: 'Cliente de CDMX activó <b>Netflix</b>' },
        { icon: 'fa-magic', text: 'Cliente de Buenos Aires adquirió <b>MAX</b>' },
        { icon: 'fa-star', text: 'Cliente de Montevideo activó <b>IBO Player</b>' }
    ];
    
    const feed = document.getElementById('activity-feed');
    feed.innerHTML = activities.map(a => `
        <div class="activity-item">
            <i class="fas ${a.icon}"></i>
            <span>🟢 ${a.text}</span>
        </div>
    `).join('');
}

// ==========================================
// NOTIFICACIONES EN VIVO
// ==========================================
function startLiveNotifications() {
    const messages = [
        '🟢 Cliente de Quito activó <b>IPTV Premium</b>',
        '🟢 Cliente de Lima adquirió <b>Disney+</b>',
        '🟢 Cliente de Bogotá adquirió <b>Paramount+</b>',
        '🟢 Cliente de Guayaquil activó <b>IPTV Ultra</b>',
        '🟢 Cliente de Santiago adquirió <b>DAZN</b>',
        '🟢 Cliente de CDMX activó <b>Netflix</b>',
        '🟢 Cliente de Buenos Aires adquirió <b>MAX</b>',
        '🟢 Cliente de Montevideo activó <b>IBO Player</b>'
    ];
    
    let index = 0;
    setInterval(() => {
        showToast(messages[index % messages.length]);
        index++;
    }, 18000);
}

// ==========================================
// CONTADOR ONLINE
// ==========================================
function animateOnlineCount() {
    const el = document.getElementById('online-count');
    setInterval(() => {
        el.innerText = (180 + Math.floor(Math.random() * 50)).toLocaleString();
    }, 5000);
}

// ==========================================
// INICIAR
// ==========================================
document.addEventListener('DOMContentLoaded', initApp); 