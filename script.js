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

const ACTIVITY_MESSAGES = [
    { icon: 'fa-check-circle', text: '🟢 Activación completada' },
    { icon: 'fa-user-plus', text: '🟢 Nuevo cliente conectado' },
    { icon: 'fa-crown', text: '🟢 Servicio Premium disponible' },
    { icon: 'fa-futbol', text: '🟢 Mundial 2026 activo' },
    { icon: 'fa-satellite', text: '🟢 IPTV Premium disponible' },
    { icon: 'fa-headset', text: '🟢 Soporte técnico conectado' }
];

// ─── TheSportsDB ─────────────────────────────────────────────────────────────
// API gratuita, sin API key, sin límite diario conocido.
// Liga FIFA World Cup 2026: leagueId=4429  (The Sports DB)
const TSDB_BASE = 'https://www.thesportsdb.com/api/v1/json/3';
const WORLD_CUP_LEAGUE = '4429';   // FIFA World Cup
const WORLD_CUP_SEASON = '2025-2026';

// Plataformas por país (para mostrar en el fallback y en tarjetas sin dato de API)
const LATAM_PLATFORMS = 'DIRECTV GO / Paramount+ / DAZN / Disney+';

// ─── Helpers de fecha ─────────────────────────────────────────────────────────
function toLocalDateStr(utcDateStr, utcTimeStr) {
    // TheSportsDB entrega fecha "2026-06-15" y hora "20:00:00" en UTC
    if (!utcDateStr) return null;
    const iso = utcTimeStr ? `${utcDateStr}T${utcTimeStr}Z` : `${utcDateStr}T00:00:00Z`;
    return new Date(iso);
}

function isSameLocalDay(date, referenceDate) {
    return date.getFullYear() === referenceDate.getFullYear() &&
           date.getMonth()    === referenceDate.getMonth()    &&
           date.getDate()     === referenceDate.getDate();
}

function formatLocalTime(date) {
    return date.toLocaleTimeString('es-LA', { hour: '2-digit', minute: '2-digit' });
}

function formatLocalDate(date) {
    return date.toLocaleDateString('es-LA', { day: 'numeric', month: 'short' });
}

// ─── Fetch partidos desde TheSportsDB ────────────────────────────────────────
async function fetchWorldCupMatches() {
    // Intenta obtener los eventos de la temporada del Mundial 2026
    const url = `${TSDB_BASE}/eventsseason.php?id=${WORLD_CUP_LEAGUE}&s=${WORLD_CUP_SEASON}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.events || [];          // array de partidos o vacío
}

// Clasifica los partidos en categorías por fecha local
function classifyMatches(events) {
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const tomorrow  = new Date(today); tomorrow.setDate(today.getDate() + 1);

    const result = { ayer: [], hoy: [], manana: [], proximos: [] };

    events.forEach(ev => {
        const dt = toLocalDateStr(ev.dateEvent, ev.strTime);
        if (!dt || isNaN(dt)) return;

        if (isSameLocalDay(dt, yesterday)) result.ayer.push(ev);
        else if (isSameLocalDay(dt, today))    result.hoy.push(ev);
        else if (isSameLocalDay(dt, tomorrow)) result.manana.push(ev);
        else if (dt > tomorrow) result.proximos.push(ev);
    });

    // Próximos: solo los 8 siguientes
    result.proximos = result.proximos.slice(0, 8);

    return result;
}

// ─── Render partidos ──────────────────────────────────────────────────────────
function renderMatchCard(ev, tab) {
    const dt = toLocalDateStr(ev.dateEvent, ev.strTime);
    const isFinished = ev.intHomeScore !== null && ev.intHomeScore !== '';
    const isLive = false; // TheSportsDB gratuito no da estado live en tiempo real

    const statusClass = isFinished ? 'status-finished' : 'status-upcoming';
    let timeLabel;

    if (isFinished) {
        timeLabel = 'FINALIZADO';
    } else if (dt && !isNaN(dt)) {
        if (tab === 'proximos') {
            timeLabel = `${formatLocalDate(dt)} ${formatLocalTime(dt)}`;
        } else {
            timeLabel = formatLocalTime(dt);
        }
    } else {
        timeLabel = ev.strTime || '—';
    }

    const scoreA = isFinished ? (ev.intHomeScore ?? '-') : '-';
    const scoreB = isFinished ? (ev.intAwayScore ?? '-') : '-';

    const stadium = ev.strVenue   || ev.strStadium || '—';
    const city    = ev.strCity    || ev.strCountry || '—';
    const round   = ev.strRound   || ev.intRound   || '';

    return `
        <div class="match-card">
            <div class="match-header">
                <span class="match-status ${statusClass}">${timeLabel}</span>
                ${round ? `<span class="match-round">${round}</span>` : ''}
            </div>
            <div class="match-teams">
                <div class="team">
                    ${ev.strHomeTeamBadge ? `<img src="${ev.strHomeTeamBadge}" class="team-badge" alt="${ev.strHomeTeam}" loading="lazy">` : ''}
                    <span>${ev.strHomeTeam || '—'}</span>
                </div>
                <div class="match-score">${scoreA} - ${scoreB}</div>
                <div class="team">
                    ${ev.strAwayTeamBadge ? `<img src="${ev.strAwayTeamBadge}" class="team-badge" alt="${ev.strAwayTeam}" loading="lazy">` : ''}
                    <span>${ev.strAwayTeam || '—'}</span>
                </div>
            </div>
            <div class="match-info">
                <span><i class="fas fa-map-marker-alt"></i> ${stadium}</span>
                <span><i class="fas fa-city"></i> ${city}</span>
            </div>
            <div class="match-platform">
                Transmite: <b>${LATAM_PLATFORMS}</b>
            </div>
        </div>`;
}

function renderMatches(tab, classifiedMatches) {
    const container = document.getElementById('matches-container');
    const matches = classifiedMatches[tab] || [];

    if (matches.length === 0) {
        container.innerHTML = `
            <p style="text-align:center;color:#888;grid-column:1/-1;padding:30px 0;">
                Sin partidos para este período.<br>
                <a href="https://www.fifa.com/fifaplus/es/tournaments/mens/worldcup/canadamexicousa2026/articles/world-cup-2026-schedule-fixtures-results" 
                   target="_blank" rel="noopener" class="btn btn-primary btn-sm" style="margin-top:16px;display:inline-flex;">
                    <i class="fas fa-calendar-alt"></i>&nbsp; Ver Calendario Oficial FIFA
                </a>
            </p>`;
        return;
    }

    container.innerHTML = matches.map(ev => renderMatchCard(ev, tab)).join('');
}

// ─── Setup tabs ───────────────────────────────────────────────────────────────
let classifiedMatches = { ayer: [], hoy: [], manana: [], proximos: [] };

function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderMatches(btn.dataset.tab, classifiedMatches);
        });
    });
}

// ─── Fallback cuando la API falla ─────────────────────────────────────────────
function renderApiFallback() {
    const container = document.getElementById('matches-container');
    container.innerHTML = `
        <div style="text-align:center;grid-column:1/-1;padding:40px 20px;">
            <p style="color:#aaa;margin-bottom:20px;">
                <i class="fas fa-exclamation-circle" style="color:#f90;font-size:2rem;"></i><br><br>
                No pudimos cargar los partidos en este momento.
            </p>
            <a href="https://www.fifa.com/fifaplus/es/tournaments/mens/worldcup/canadamexicousa2026/articles/world-cup-2026-schedule-fixtures-results"
               target="_blank" rel="noopener" class="btn btn-primary">
                <i class="fas fa-calendar-alt"></i>&nbsp; Ver Calendario Oficial FIFA
            </a>
        </div>`;
}

// ─── Init Mundial ─────────────────────────────────────────────────────────────
async function initWorldCup() {
    const container = document.getElementById('matches-container');
    container.innerHTML = `<p style="text-align:center;color:#aaa;grid-column:1/-1;padding:30px 0;">
        <i class="fas fa-spinner fa-spin"></i>&nbsp; Cargando partidos…</p>`;

    try {
        const events = await fetchWorldCupMatches();

        if (!events || events.length === 0) {
            // Si la liga aún no tiene eventos, mostrar fallback amigable
            renderApiFallback();
            return;
        }

        classifiedMatches = classifyMatches(events);

        // Renderizar la tab activa por defecto (hoy; si no hay, proximos)
        const defaultTab = classifiedMatches.hoy.length > 0 ? 'hoy' : 'proximos';
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.tab === defaultTab);
        });
        renderMatches(defaultTab, classifiedMatches);

    } catch (err) {
        console.warn('TheSportsDB error:', err);
        renderApiFallback();
    }
}

// ─── Resto de funciones (sin cambios) ─────────────────────────────────────────
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
        document.getElementById('user-location').innerText = 'Global';
    }
    applyCurrencyUpdate();
}

document.getElementById('currency-selector').addEventListener('change', (e) => {
    currentCurrency = e.target.value;
    applyCurrencyUpdate();
});

function formatMoney(amount, currency) {
    if (['PYG','COP','CLP'].includes(currency)) {
        return new Intl.NumberFormat('es-LA', { style:'currency', currency, minimumFractionDigits:0 }).format(amount);
    }
    return new Intl.NumberFormat('es-LA', { style:'currency', currency }).format(amount);
}

function applyCurrencyUpdate() {
    currentRate = window.rates[currentCurrency] || 1;
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

function calculateSavings() {
    const select = document.getElementById('calc-service');
    const option = select.options[select.selectedIndex];
    const usdClick = parseFloat(option.value);
    const usdOfficial = parseFloat(option.getAttribute('data-official'));
    const savingsLocal = (usdOfficial * currentRate) - (usdClick * currentRate);
    const percent = Math.round(((usdOfficial - usdClick) / usdOfficial) * 100);

    document.getElementById('calc-official').innerText = formatMoney(usdOfficial * currentRate, currentCurrency);
    document.getElementById('calc-click').innerText    = formatMoney(usdClick    * currentRate, currentCurrency);
    document.getElementById('calc-savings').innerHTML  = `${formatMoney(savingsLocal, currentCurrency)} <br><small>(${percent}% OFF)</small>`;
}

function toggleCart() { document.getElementById('cart-sidebar').classList.toggle('active'); }
function toggleMenu() { document.getElementById('nav-links').classList.toggle('active'); }

function addToCart(name, priceUSD) {
    const existing = cart.find(i => i.name === name);
    if (existing) existing.qty++;
    else cart.push({ name, priceUSD, qty: 1 });
    updateCartUI();
    showToast(` Agregado: ${name}`);
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

function applyCoupon() {
    const code = document.getElementById('coupon-code').value.toUpperCase();
    if (code === 'MUNDIAL2026') {
        discountPercent = 0.05;
        showToast('🎁 Cupón aplicado: 5% OFF extra');
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

    cart.forEach(item => {
        subtotalUSD += item.priceUSD * item.qty;
        qtyTotal += item.qty;
        itemsContainer.innerHTML += `
            <div class="cart-item">
                <div>
                    <h4>${item.name}</h4>
                    <small>${formatMoney(item.priceUSD * currentRate, currentCurrency)} x ${item.qty}</small>
                </div>
                <i class="fas fa-trash" onclick="removeFromCart('${item.name.replace(/'/g,"\\'")}')"></i>
            </div>`;
    });

    const discountUSD = subtotalUSD * discountPercent;
    const totalUSD    = subtotalUSD - discountUSD;

    document.getElementById('cart-count').innerText       = qtyTotal;
    document.getElementById('cart-subtotal').innerText    = formatMoney(subtotalUSD * currentRate, currentCurrency);
    document.getElementById('cart-discount').innerText    = formatMoney(discountUSD * currentRate, currentCurrency);
    document.getElementById('cart-total-local').innerText = formatMoney(totalUSD    * currentRate, currentCurrency);
    document.getElementById('cart-total-usd').innerText   = `$${totalUSD.toFixed(2)} USD`;
}

function toggleCheckoutInfo() {
    const info = document.getElementById('checkout-info');
    info.style.display = info.style.display === 'none' ? 'block' : 'none';
}

function copyText(text) {
    navigator.clipboard.writeText(text).then(() => showToast(`✅ Copiado: ${text}`));
}

function processCheckout() {
    if (cart.length === 0) return alert('El carrito está vacío.');
    const location = document.getElementById('user-location').innerText;
    let text = `🚀 *NUEVO PEDIDO - MUNDIAL 2026*%0A%0A`;
    text += ` *Ubicación:* ${location}%0A`;
    text += `💱 *Moneda:* ${currentCurrency}%0A%0A`;
    text += `🛒 *Resumen:*%0A`;
    cart.forEach(i => {
        text += `▪ ${i.qty}x ${i.name} -> ${formatMoney(i.priceUSD * currentRate * i.qty, currentCurrency)}%0A`;
    });
    text += `%0A💰 *TOTAL:* ${document.getElementById('cart-total-local').innerText}%0A`;
    text += `💵 *Ref USD:* ${document.getElementById('cart-total-usd').innerText}%0A`;
    if (discountPercent > 0) text += `%0A🎁 *(Cupón MUNDIAL2026 aplicado)*%0A`;
    text += `%0A💳 *Hola, deseo proceder con el pago.*`;
    window.open(`https://wa.me/${WPP_NUMBER}?text=${text}`, '_blank');
}

function sendCartReceipt() {
    if (cart.length === 0) return alert('Tu carrito está vacío.');
    const total = document.getElementById('cart-total-local').innerText;
    let text = `💳 *COMPROBANTE DE PAGO*%0A%0AHola, acabo de realizar el pago por *${total}*.%0A%0A*(Adjunto aquí la imagen de mi comprobante)*.`;
    window.open(`https://wa.me/${WPP_NUMBER}?text=${text}`, '_blank');
}

function submitContactForm(e) {
    e.preventDefault();
    const f = e.target;
    let text = ` *CONTACTO INTERNACIONAL*%0A%0A`;
    text += `👤 *Nombre:* ${f.nombre.value} ${f.apellido.value}%0A`;
    text += ` *País:* ${f.pais.value}%0A`;
    text += `📱 *Celular:* ${f.celular.value}%0A`;
    text += `📧 *Correo:* ${f.correo.value}%0A`;
    text += `📺 *Servicio:* ${f.servicio.value}%0A`;
    if (f.mensaje.value) text += `💬 *Mensaje:* ${f.mensaje.value}%0A`;
    window.open(`https://wa.me/${WPP_NUMBER}?text=${text}`, '_blank');
}

function showToast(msg) {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 4000);
}

function startLiveSalesNotifications() {
    setInterval(() => {
        const msg = ACTIVITY_MESSAGES[Math.floor(Math.random() * ACTIVITY_MESSAGES.length)];
        showToast(`<i class="fas ${msg.icon}"></i> ${msg.text}`);
    }, 20000);
}

function animateStats() {
    const targets = { 'stat-clients': 5000, 'stat-activations': 12000 };
    Object.entries(targets).forEach(([id, target]) => {
        const el = document.getElementById(id);
        let current = 0;
        const step = target / 100;
        const interval = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(interval); }
            el.innerText = '+' + Math.floor(current).toLocaleString();
        }, 20);
    });
    setInterval(() => {
        document.getElementById('online-count').innerText = (180 + Math.floor(Math.random() * 50)).toLocaleString();
    }, 5000);
}

function loadActivityFeed() {
    const feed = document.getElementById('activity-feed');
    feed.innerHTML = ACTIVITY_MESSAGES.map(a => `
        <div class="activity-item">
            <i class="fas ${a.icon}"></i>
            <span>${a.text}</span>
        </div>`).join('');
}

async function initApp() {
    await fetchExchangeRates();
    await detectUserCountry();
    calculateSavings();
    setupTabs();
    await initWorldCup();        // ← carga real desde TheSportsDB
    startLiveSalesNotifications();
    animateStats();
    loadActivityFeed();
}

document.addEventListener('DOMContentLoaded', initApp);
