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
// PARTIDOS MUNDIAL 2026 (JSON editable)
// Basado en cronograma oficial FIFA
// ==========================================
const WORLD_CUP_MATCHES = {
    hoy: [
        {
            teamA: { name: 'México', flag: '🇲🇽' },
            teamB: { name: 'Canadá', flag: '🇨🇦' },
            scoreA: '-', scoreB: '-',
            status: 'upcoming', time: '16:00',
            stadium: 'Estadio Azteca', city: 'Ciudad de México',
            platform: 'DIRECTV GO / Paramount+'
        },
        {
            teamA: { name: 'USA', flag: '🇺🇸' },
            teamB: { name: 'Ecuador', flag: '🇪🇨' },
            scoreA: '-', scoreB: '-',
            status: 'upcoming', time: '19:00',
            stadium: 'SoFi Stadium', city: 'Los Ángeles',
            platform: 'FOX / DIRECTV GO'
        }
    ],
    manana: [
        {
            teamA: { name: 'Argentina', flag: '🇦🇷' },
            teamB: { name: 'Brasil', flag: '🇧🇷' },
            scoreA: '-', scoreB: '-',
            status: 'upcoming', time: '16:00',
            stadium: 'MetLife Stadium', city: 'Nueva Jersey',
            platform: 'DIRECTV GO / TyC Sports'
        },
        {
            teamA: { name: 'España', flag: '🇪🇸' },
            teamB: { name: 'Colombia', flag: '🇨🇴' },
            scoreA: '-', scoreB: '-',
            status: 'upcoming', time: '19:00',
            stadium: 'AT&T Stadium', city: 'Dallas',
            platform: 'DAZN / Disney+'
        }
    ],
    proximos: [
        {
            teamA: { name: 'Perú', flag: '🇵🇪' },
            teamB: { name: 'Chile', flag: '🇨🇱' },
            scoreA: '-', scoreB: '-',
            status: 'upcoming', time: '15 Jun 17:00',
            stadium: 'BC Place', city: 'Vancouver',
            platform: 'Paramount+'
        },
        {
            teamA: { name: 'Francia', flag: '🇫🇷' },
            teamB: { name: 'Alemania', flag: '🇩🇪' },
            scoreA: '-', scoreB: '-',
            status: 'upcoming', time: '16 Jun 20:00',
            stadium: 'Hard Rock Stadium', city: 'Miami',
            platform: 'DAZN / DIRECTV GO'
        }
    ],
    grupos: [
        { group: 'A', teams: ['🇲🇽 México','🇨🇦 Canadá','🇯🇲 Jamaica','🇿🇦 Sudáfrica'] },
        { group: 'B', teams: ['🇦🇷 Argentina','🇦🇺 Australia','🇩🇰 Dinamarca','🇵🇈 Filipinas'] },
        { group: 'C', teams: ['🇲🇽 México B','🇪🇨 Ecuador','🇧🇴 Bolivia','🇨🇦 Canadá B'] },
        { group: 'D', teams: ['🇺🇸 USA','🇵🇾 Paraguay','🇦🇺 Australia B','🇭🇹 Haití'] }
    ]
};

// ==========================================
// INICIALIZACIÓN
// ==========================================
async function initApp() {
    await fetchExchangeRates();
    await detectUserCountry();
    calculateSavings();
    renderWorldCupMatches('hoy');
    startLiveSalesNotifications();
    setupTabs();
    setupMusicPlayer();
    animateStats();
    loadReviewsFromFirebase();
    loadActivityFromFirebase();
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
// CALCULADORA DE AHORRO
// ==========================================
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

// ==========================================
// MUNDIAL 2026
// ==========================================
function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderWorldCupMatches(btn.dataset.tab);
        });
    });
}

function renderWorldCupMatches(tab) {
    const container = document.getElementById('matches-container');
    
    if (tab === 'grupos') {
        container.innerHTML = WORLD_CUP_MATCHES.grupos.map(g => `
            <div class="match-card">
                <div class="match-header">
                    <span class="match-status status-upcoming">GRUPO ${g.group}</span>
                </div>
                <div style="padding:10px 0;">
                    ${g.teams.map(t => `<div style="padding:8px;border-bottom:1px dashed #333;font-weight:600;">${t}</div>`).join('')}
                </div>
            </div>
        `).join('');
        return;
    }
    
    const matches = WORLD_CUP_MATCHES[tab] || [];
    if (matches.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#888;grid-column:1/-1;">No hay partidos programados.</p>';
        return;
    }
    
    container.innerHTML = matches.map(m => {
        const isLive = m.status === 'live';
        const statusClass = isLive ? 'status-live' : (m.status === 'finished' ? 'status-finished' : 'status-upcoming');
        const statusText = isLive ? `EN VIVO ${m.time || ''}` : (m.status === 'finished' ? 'FINALIZADO' : m.time);
        
        return `
            <div class="match-card ${isLive ? 'live' : ''}">
                <div class="match-header">
                    <span class="match-status ${statusClass}">
                        ${isLive ? '<span class="live-dot"></span>' : ''}
                        ${statusText}
                    </span>
                </div>
                <div class="match-teams">
                    <div class="team">
                        <span class="team-flag">${m.teamA.flag}</span>
                        ${m.teamA.name}
                    </div>
                    <div class="match-score">${m.scoreA} - ${m.scoreB}</div>
                    <div class="team">
                        <span class="team-flag">${m.teamB.flag}</span>
                        ${m.teamB.name}
                    </div>
                </div>
                <div class="match-info">
                    <span><i class="fas fa-map-marker-alt"></i>${m.stadium}</span>
                    <span><i class="fas fa-city"></i>${m.city}</span>
                </div>
                <div class="match-platform">
                    Transmite: <b>${m.platform}</b>
                </div>
            </div>
        `;
    }).join('');
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
    text += `📍 *Ubicación:* ${location}%0A`;
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
    if (cart.length === 0) return alert("Tu carrito está vacío.");
    const total = document.getElementById('cart-total-local').innerText;
    let text = `💳 *COMPROBANTE DE PAGO*%0A%0AHola, acabo de realizar el pago por *${total}*.%0A%0A*(Adjunto aquí la imagen de mi comprobante)*.`;
    window.open(`https://wa.me/${WPP_NUMBER}?text=${text}`, '_blank');
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
// TOAST
// ==========================================
function showToast(msg) {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 4000);
}

// ==========================================
// NOTIFICACIONES EN VIVO
// ==========================================
function startLiveSalesNotifications() {
    const names = ['Carlos','Andrés','María','Lucía','Juan','Diego','Camila','Sofía','Luis','Pedro','Ana'];
    const lastInitials = ['M.','Z.','G.','V.','C.','P.','R.','S.','F.'];
    const locations = ['Quito','Guayaquil','Cuenca','Bogotá','Lima','Santiago','CDMX','Buenos Aires','Montevideo','Asunción'];
    const products = ['DIRECTV GO','Paramount+','DAZN','IBO Player','IPTV Premium','Flujo TV','Disney+'];
    
    setInterval(() => {
        const n = names[Math.floor(Math.random()*names.length)];
        const l = lastInitials[Math.floor(Math.random()*lastInitials.length)];
        const loc = locations[Math.floor(Math.random()*locations.length)];
        const p = products[Math.floor(Math.random()*products.length)];
        showToast(`<i class="fas fa-check-circle"></i> <b>${n} ${l}</b> de ${loc} adquirió <b>${p}</b>`);
    }, 20000);
}

// ==========================================
// ESTADÍSTICAS ANIMADAS
// ==========================================
function animateStats() {
    const targets = { 'stat-clients': 15420, 'stat-activations': 28900 };
    Object.entries(targets).forEach(([id, target]) => {
        const el = document.getElementById(id);
        let current = 0;
        const step = target / 100;
        const interval = setInterval(() => {
            current += step;
            if (current >= target) { current = target; clearInterval(interval); }
            el.innerText = Math.floor(current).toLocaleString();
        }, 20);
    });
    // Online count
    setInterval(() => {
        document.getElementById('online-count').innerText = (180 + Math.floor(Math.random()*50)).toLocaleString();
    }, 5000);
}

// ==========================================
// MÚSICA
// ==========================================
function setupMusicPlayer() {
    const audio = document.getElementById('bg-audio');
    if (audio) audio.volume = 0.3;
}

function toggleMusic() {
    const audio = document.getElementById('bg-audio');
    const btn = document.getElementById('music-btn');
    const muteBtn = document.getElementById('mute-btn');
    if (audio.paused) {
        audio.play().then(() => {
            btn.innerHTML = '<i class="fas fa-pause"></i>';
            muteBtn.style.display = 'block';
        }).catch(() => showToast('⚠️ Archivo de audio no disponible'));
    } else {
        audio.pause();
        btn.innerHTML = '<i class="fas fa-play"></i>';
    }
}

function toggleMute() {
    const audio = document.getElementById('bg-audio');
    const btn = document.getElementById('mute-btn');
    audio.muted = !audio.muted;
    btn.innerHTML = audio.muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
}

// ==========================================
// RESEÑAS
// ==========================================
function openReviewForm() {
    document.getElementById('review-modal').classList.add('active');
}
function closeReviewForm() {
    document.getElementById('review-modal').classList.remove('active');
}

async function submitReview(e) {
    e.preventDefault();
    const review = {
        name: document.getElementById('review-name').value,
        location: document.getElementById('review-location').value,
        rating: parseInt(document.getElementById('review-rating').value),
        text: document.getElementById('review-text').value,
        date: new Date().toISOString()
    };
    
    if (window.saveReviewToFirebase) {
        await window.saveReviewToFirebase(review);
        showToast('✅ Reseña enviada. ¡Gracias!');
    } else {
        // Fallback local
        const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
        reviews.push(review);
        localStorage.setItem('reviews', JSON.stringify(reviews));
        showToast('✅ Reseña enviada. ¡Gracias!');
    }
    closeReviewForm();
    loadReviewsFromFirebase();
    e.target.reset();
}

function loadReviewsFromFirebase() {
    const defaultReviews = [
        { name:'Carlos M.', location:'🇪🇨 Guayaquil', rating:5, text:'Compré DirecTV Go para el mundial. Activación rápida y sin cortes.' },
        { name:'Lucía F.', location:'🇵🇪 Lima', rating:5, text:'Excelente servicio, el plan anual de IBO Player me funciona perfecto en mi LG.' },
        { name:'Juan P.', location:'🇨🇴 Bogotá', rating:5, text:'Dudé al principio, pero me enviaron la cuenta de Paramount a los 5 minutos.' },
        { name:'Andrea V.', location:'🇦🇷 Buenos Aires', rating:5, text:'Pude pagar en mi moneda sin problema. Disney+ funcionando perfecto.' }
    ];
    
    if (window.loadReviewsFromFirebase)

