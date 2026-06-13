// Click TV Streaming 2026 - Main JavaScript
// Premium Streaming Platform for Latin America

// ============ CONFIGURATION ============
const CONFIG = {
    whatsappNumber: '593939166222',
    telegramChannel: 'https://t.me/s/streamid',
    whatsappGroup: 'https://chat.whatsapp.com/K4g6hAvXy2VDQiwgLD3TNP',
    currencies: {
        USD: { symbol: '$', rate: 1, name: 'Dólar' },
        PEN: { symbol: 'S/', rate: 3.75, name: 'Sol Peruano' },
        COP: { symbol: '$', rate: 4150, name: 'Peso Colombiano' },
        ARS: { symbol: '$', rate: 950, name: 'Peso Argentino' },
        CLP: { symbol: '$', rate: 920, name: 'Peso Chileno' },
        MXN: { symbol: '$', rate: 18, name: 'Peso Mexicano' },
        BRL: { symbol: 'R$', rate: 5.10, name: 'Real Brasileño' }
    },
    countries: {
        EC: { prefix: '+593', flag: '🇪🇨', name: 'Ecuador' },
        PE: { prefix: '+51', flag: '🇵🇪', name: 'Perú' },
        CO: { prefix: '+57', flag: '🇨🇴', name: 'Colombia' },
        AR: { prefix: '+54', flag: '🇦🇷', name: 'Argentina' },
        CL: { prefix: '+56', flag: '🇨🇱', name: 'Chile' },
        MX: { prefix: '+52', flag: '🇲🇽', name: 'México' },
        BR: { prefix: '+55', flag: '🇧🇷', name: 'Brasil' },
        US: { prefix: '+1', flag: '🇺🇸', name: 'Estados Unidos' }
    },
    couponCode: 'MUNDIAL2026',
    couponDiscount: 0.05
};

// ============ STATE ============
let state = {
    cart: [],
    currency: 'USD',
    couponApplied: false
};

// ============ PRODUCTS DATA ============
const PRODUCTS = {
    streaming: [
        { id: 'paramount-1', name: 'Paramount+', plan: '1 Mes', price: 5, icon: 'P+', devices: 4, badge: 'popular' },
        { id: 'paramount-3', name: 'Paramount+', plan: '3 Meses', price: 13, icon: 'P+', devices: 4 },
        { id: 'paramount-6', name: 'Paramount+', plan: '6 Meses', price: 24, icon: 'P+', devices: 4, badge: 'off' },
        { id: 'paramount-12', name: 'Paramount+', plan: '12 Meses', price: 45, icon: 'P+', devices: 4 },
        { id: 'dazn-1', name: 'DAZN', plan: '1 Mes', price: 5, icon: 'DZN', devices: 2, badge: 'popular' },
        { id: 'dazn-3', name: 'DAZN', plan: '3 Meses', price: 14, icon: 'DZN', devices: 2 },
        { id: 'dazn-6', name: 'DAZN', plan: '6 Meses', price: 26, icon: 'DZN', devices: 2 },
        { id: 'dazn-12', name: 'DAZN', plan: '12 Meses', price: 48, icon: 'DZN', devices: 2 },
        { id: 'directv-1', name: 'DIRECTV GO', plan: '1 Mes', price: 15, icon: 'DTV', devices: 3 },
        { id: 'directv-3', name: 'DIRECTV GO', plan: '3 Meses', price: 42, icon: 'DTV', devices: 3, badge: 'popular' },
        { id: 'directv-6', name: 'DIRECTV GO', plan: '6 Meses', price: 78, icon: 'DTV', devices: 3 },
        { id: 'directv-12', name: 'DIRECTV GO', plan: '12 Meses', price: 140, icon: 'DTV', devices: 3, badge: 'off' }
    ],
    iptv: [
        { id: 'iptv-1', name: 'IPTV Premium', plan: '1 Mes', price: 8, icon: 'IPTV', devices: 1, channels: '16,000+' },
        { id: 'iptv-3', name: 'IPTV Premium', plan: '3 Meses', price: 22, icon: 'IPTV', devices: 1, channels: '16,000+', badge: 'popular' },
        { id: 'iptv-6', name: 'IPTV Premium', plan: '6 Meses', price: 40, icon: 'IPTV', devices: 1, channels: '16,000+' },
        { id: 'iptv-12', name: 'IPTV Premium', plan: '12 Meses', price: 70, icon: 'IPTV', devices: 1, channels: '16,000+', badge: 'off' }
    ],
    iptvMulti: [
        { id: 'iptv-2d-1', name: 'IPTV 2 Dispositivos', plan: '1 Mes', price: 14, icon: 'IPTV2', devices: 2 },
        { id: 'iptv-2d-3', name: 'IPTV 2 Dispositivos', plan: '3 Meses', price: 38, icon: 'IPTV2', devices: 2 },
        { id: 'iptv-2d-6', name: 'IPTV 2 Dispositivos', plan: '6 Meses', price: 70, icon: 'IPTV2', devices: 2 },
        { id: 'iptv-2d-12', name: 'IPTV 2 Dispositivos', plan: '12 Meses', price: 120, icon: 'IPTV2', devices: 2, badge: 'off' }
    ],
    android: [
        { id: 'stbemu', name: 'STBEmu', plan: 'Config App', price: 9, icon: 'STB', desc: 'Simulador STB' },
        { id: 'tvpato2', name: 'TV Pato 2', plan: 'App Premium', price: 5, icon: 'TV2', desc: 'TV en vivo', badge: 'popular' },
        { id: 'teatv', name: 'TeaTV', plan: 'App Premium', price: 5, icon: 'Tea', desc: 'Películas/Series' },
        { id: 'tivimate', name: 'TiviMate', plan: 'Premium', price: 7, icon: 'TVM', desc: 'IPTV Player' },
        { id: 'smarters', name: 'Smarters Pro', plan: 'Premium', price: 6, icon: 'SMP', desc: 'IPTV Player' }
    ]
};

// ============ WORLD CUP MATCHES ============
const WORLD_CUP_MATCHES = [
    {
        id: 'wc-1',
        teamA: { name: 'Mexico', code: 'MEX', flag: '🇲🇽' },
        teamB: { name: 'Ecuador', code: 'ECU', flag: '🇪🇨' },
        scoreA: null,
        scoreB: null,
        status: 'scheduled',
        date: '2026-06-11',
        time: '13:00',
        stadium: 'Estadio Azteca',
        city: 'Ciudad de México'
    },
    {
        id: 'wc-2',
        teamA: { name: 'Argentina', code: 'ARG', flag: '🇦🇷' },
        teamB: { name: 'Brasil', code: 'BRA', flag: '🇧🇷' },
        scoreA: null,
        scoreB: null,
        status: 'scheduled',
        date: '2026-06-14',
        time: '17:00',
        stadium: 'SoFi Stadium',
        city: 'Los Ángeles'
    },
    {
        id: 'wc-3',
        teamA: { name: 'Estados Unidos', code: 'USA', flag: '🇺🇸' },
        teamB: { name: 'Canadá', code: 'CAN', flag: '🇨🇦' },
        scoreA: null,
        scoreB: null,
        status: 'scheduled',
        date: '2026-06-12',
        time: '14:00',
        stadium: 'AT&T Stadium',
        city: 'Dallas'
    }
];

// ============ REVIEWS DATA ============
const REVIEWS = [
    { id: 1, name: 'Cliente Verificado MX', location: 'México', stars: 5, text: 'Excelente servicio, activación inmediata. Ya puedo ver Mundial 2026 en mi TV Box sin cortes.' },
    { id: 2, name: 'Cliente Verificado CO', location: 'Colombia', stars: 5, text: 'DAZN funciona perfecto para ver los partidos. Muy recomendado.' },
    { id: 3, name: 'Cliente Verificado PE', location: 'Perú', stars: 5, text: 'Paramount+ sin problemas, excelente calidad.' },
    { id: 4, name: 'Cliente Verificado AR', location: 'Argentina', stars: 5, text: 'IPTV premium con todos los canales. Soporte por WhatsApp muy rapido.' },
    { id: 5, name: 'Cliente Verificado CL', location: 'Chile', stars: 5, text: 'Disfrutando el mundial con mis hijos Gracias por el servicio.' },
    { id: 6, name: 'Cliente Verificado EC', location: 'Ecuador', stars: 5, text: 'DIRECTV GO a precio justo, funciona excelente.' }
];

// ============ ACTIVITY MESSAGES ============
const ACTIVITY_MESSAGES = [
    'Un usuario de México compro Paramount+ 3 meses',
    'Alguien de Argentina activo IPTV Premium',
    'Se vendio DAZN 1 mes en Colombia',
    'Un cliente de Peru completo su pedido',
    'Alguien en Chile activo su cuenta correctamente',
    'Un usuario de Ecuador compro DIRECTV GO'
];

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', function() {
    loadStateFromStorage();
    initLocation();
    initCurrency();
    renderProducts();
    renderMatches();
    renderReviews();
    updateCartUI();
    initActivityNotifications();
    initOnlineCounter();
    calcSavings();
});

// ============ STORAGE ============
function loadStateFromStorage() {
    try {
        const savedCart = localStorage.getItem('clicktv_cart');
        const savedCurrency = localStorage.getItem('clicktv_currency');
        if (savedCart) state.cart = JSON.parse(savedCart);
        if (savedCurrency) state.currency = savedCurrency;
    } catch (e) {
        console.log('Storage not available');
    }
}

function saveStateToStorage() {
    try {
        localStorage.setItem('clicktv_cart', JSON.stringify(state.cart));
        localStorage.setItem('clicktv_currency', state.currency);
    } catch (e) {
        console.log('Storage not available');
    }
}

// ============ LOCATION ============
function initLocation() {
    detectCountry().then(country => {
        const locationEl = document.getElementById('user-location');
        if (locationEl && country) {
            locationEl.textContent = country;
        }
    });
}

async function detectCountry() {
    try {
        // Try timezone detection
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz.includes('America/Bogota')) return 'Colombia';
        if (tz.includes('America/Lima')) return 'Perú';
        if (tz.includes('America/Guayaquil')) return 'Ecuador';
        if (tz.includes('America/Santiago')) return 'Chile';
        if (tz.includes('America/Buenos_Aires')) return 'Argentina';
        if (tz.includes('America/Mexico_City')) return 'México';
        if (tz.includes('America/Sao_Paulo')) return 'Brasil';
        return 'Latinoamérica';
    } catch {
        return 'Latinoamérica';
    }
}

// ============ CURRENCY ============
function initCurrency() {
    const selector = document.getElementById('currency-selector');
    if (selector) {
        selector.value = state.currency;
    }
}

function updateCurrency() {
    const selector = document.getElementById('currency-selector');
    if (selector) {
        state.currency = selector.value;
        saveStateToStorage();
        updateAllPrices();
        updateCartUI();
        renderProducts();
    }
}

function formatPrice(usdPrice, toCurrency = null) {
    const currency = toCurrency || state.currency;
    const currConfig = CONFIG.currencies[currency];
    const converted = usdPrice * currConfig.rate;
    return `${currConfig.symbol}${converted.toFixed(currency === 'COP' || currency === 'CLP' || currency === 'ARS' ? 0 : 2)}`;
}

function updateAllPrices() {
    // Update calculator
    calcSavings();
}

// ============ PRODUCTS RENDERING ============
function renderProducts() {
    renderStreamingProducts();
    renderIPTVProducts();
    renderAndroidProducts();
}

function renderStreamingProducts() {
    const container = document.getElementById('streaming-grid');
    if (!container) return;

    container.innerHTML = PRODUCTS.streaming.map(product => `
        <div class="product-card">
            <div class="product-brand brand-${product.name.toLowerCase().replace(/\s+/g, '-').replace('+', '')}">
                <span class="product-logo">${product.icon}</span>
                ${product.badge ? `<span class="product-badge badge-${product.badge}">${product.badge === 'popular' ? 'POPULAR' : product.badge === 'new' ? 'NUEVO' : 'OFERTA'}</span>` : ''}
            </div>
            <div class="product-body">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-plan">${product.plan} - ${product.devices} dispositivo${product.devices > 1 ? 's' : ''}</p>
                <div class="product-price">${formatPrice(product.price)} <span>USD</span></div>
                <button class="product-btn" onclick="addToCart('${product.id}', '${product.name}', '${product.plan}', ${product.price})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    Agregar
                </button>
            </div>
        </div>
    `).join('');
}

function renderIPTVProducts() {
    const container = document.getElementById('iptv-grid');
    if (!container) return;

    const allIPTV = [...PRODUCTS.iptv, ...PRODUCTS.iptvMulti];

    container.innerHTML = allIPTV.map(product => `
        <div class="product-card">
            <div class="product-brand brand-iptv">
                <span class="product-logo">${product.icon}</span>
                ${product.badge ? `<span class="product-badge badge-${product.badge}">${product.badge === 'popular' ? 'POPULAR' : 'OFERTA'}</span>` : ''}
            </div>
            <div class="product-body">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-plan">${product.plan} - ${product.devices} dispositivo${product.devices > 1 ? 's' : ''}${product.channels ? ` - ${product.channels} canales` : ''}</p>
                <div class="product-price">${formatPrice(product.price)} <span>USD</span></div>
                <button class="product-btn" onclick="addToCart('${product.id}', '${product.name}', '${product.plan}', ${product.price})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    Agregar
                </button>
            </div>
        </div>
    `).join('');
}

function renderAndroidProducts() {
    const container = document.getElementById('android-grid');
    if (!container) return;

    container.innerHTML = PRODUCTS.android.map(product => `
        <div class="product-card">
            <div class="product-brand brand-android">
                <span class="product-logo">${product.icon}</span>
                ${product.badge ? `<span class="product-badge badge-${product.badge}">POPULAR</span>` : ''}
            </div>
            <div class="product-body">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-plan">${product.plan}${product.desc ? ` - ${product.desc}` : ''}</p>
                <div class="product-price">${formatPrice(product.price)} <span>USD</span></div>
                <button class="product-btn" onclick="addToCart('${product.id}', '${product.name}', '${product.plan}', ${product.price})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    Agregar
                </button>
            </div>
        </div>
    `).join('');
}

// ============ MATCHES RENDERING ============
function renderMatches() {
    const container = document.getElementById('matches-container');
    if (!container) return;

    const today = new Date();
    const wcDate = new Date('2026-06-11');

    if (today < wcDate) {
        // Show "Coming Soon" before World Cup
        container.innerHTML = `
            <div class="match-card border-gold">
                <div class="match-header">
                    <span class="match-status status-scheduled">PRÓXIMAMENTE</span>
                    <span class="match-date">Junio 2026</span>
                </div>
                <div style="text-align: center; padding: 20px 0;">
                    <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="#ffcc00" stroke-width="2" style="margin: 0 auto 12px;">
                        <circle cx="24" cy="24" r="20"/>
                        <path d="M12 24c0-8 4-16 12-16s12 8 12 16-4 16-12 16-12-8-12-16"/>
                        <circle cx="24" cy="8" r="4"/>
                    </svg>
                    <p style="font-size: 16px; font-weight: 700; color: #ffcc00; margin-bottom: 8px;">Mundial FIFA 2026</p>
                    <p style="font-size: 12px; color: var(--gray-400);">
                        Estados Unidos, México y Canadá<br>
                        48 equipos por primera vez
                    </p>
                </div>
            </div>
        `;
    } else {
        // Show actual matches
        container.innerHTML = WORLD_CUP_MATCHES.map(match => `
            <div class="match-card ${match.status === 'live' ? 'border-live' : 'border-normal'}">
                <div class="match-header">
                    <span class="match-status status-${match.status}">
                        ${match.status === 'live' ? 'EN VIVO' : match.status === 'finished' ? 'FINALIZADO' : 'PROGRAMADO'}
                    </span>
                    <span class="match-date">${match.date} - ${match.time}</span>
                </div>
                <div class="match-teams">
                    <div class="team">
                        <span class="team-flag">${match.teamA.flag}</span>
                        <span class="team-name">${match.teamA.name}</span>
                        <span class="team-code">${match.teamA.code}</span>
                    </div>
                    <div class="vs-box">
                        <span class="vs-text">VS</span>
                        <span class="score ${match.status === 'live' ? 'score-live' : match.status === 'finished' ? 'score-gold' : 'score-gray'}">
                            ${match.scoreA !== null ? match.scoreA : '-'} - ${match.scoreB !== null ? match.scoreB : '-'}
                        </span>
                    </div>
                    <div class="team">
                        <span class="team-flag">${match.teamB.flag}</span>
                        <span class="team-name">${match.teamB.name}</span>
                        <span class="team-code">${match.teamB.code}</span>
                    </div>
                </div>
                <div class="match-info">
                    <span>${match.stadium}</span>
                    <span>${match.city}</span>
                </div>
            </div>
        `).join('');
    }
}

// ============ REVIEWS RENDERING ============
function renderReviews() {
    const container = document.getElementById('reviews-grid');
    if (!container) return;

    container.innerHTML = REVIEWS.slice(0, 4).map(review => `
        <div class="review-card">
            <div class="review-header">
                <div class="review-avatar">${review.name.charAt(0)}</div>
                <div class="review-meta">
                    <span class="review-name">${review.name}</span>
                    <span class="review-loc">${review.location}</span>
                </div>
                <div class="review-stars">
                    ${'<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor"/></svg>'.repeat(review.stars)}
                </div>
            </div>
            <p class="review-text">${review.text}</p>
        </div>
    `).join('');
}

// ============ CART FUNCTIONS ============
function addToCart(id, name, plan, price) {
    const existingItem = state.cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        state.cart.push({
            id,
            name,
            plan,
            price,
            quantity: 1
        });
    }

    saveStateToStorage();
    updateCartUI();
    showToast('success', `${name} - ${plan} agregado al carrito`);
}

function removeFromCart(id) {
    state.cart = state.cart.filter(item => item.id !== id);
    saveStateToStorage();
    updateCartUI();
}

function clearCart() {
    state.cart = [];
    state.couponApplied = false;
    document.getElementById('discount-row').style.display = 'none';
    saveStateToStorage();
    updateCartUI();
    showToast('success', 'Carrito vaciado');
}

function updateCartUI() {
    // Update badge count
    const countEl = document.getElementById('cart-count');
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (countEl) countEl.textContent = totalItems;

    // Update cart items
    const itemsContainer = document.getElementById('cart-items');
    if (itemsContainer) {
        if (state.cart.length === 0) {
            itemsContainer.innerHTML = '<div class="cart-empty"><p>Tu carrito está vacío</p></div>';
        } else {
            itemsContainer.innerHTML = state.cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <span class="cart-item-name">${item.name}</span>
                        <span class="cart-item-plan">${item.plan} x${item.quantity}</span>
                    </div>
                    <span class="cart-item-price">${formatPrice(item.price * item.quantity)}</span>
                    <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            `).join('');
        }
    }

    // Update totals
    const subtotalUSD = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = state.couponApplied ? subtotalUSD * CONFIG.couponDiscount : 0;
    const totalUSD = subtotalUSD - discount;

    // Always show USD for reference
    document.getElementById('cart-subtotal').textContent = formatPrice(subtotalUSD, 'USD');
    document.getElementById('cart-total').textContent = formatPrice(totalUSD, state.currency);
    document.getElementById('cart-usd-total').textContent = formatPrice(totalUSD, 'USD');

    // Update currency label
    const currencyLabel = document.getElementById('cart-currency');
    if (currencyLabel) {
        currencyLabel.textContent = `(${state.currency})`;
    }

    // Show/hide discount
    const discountRow = document.getElementById('discount-row');
    if (discountRow) {
        discountRow.style.display = discount > 0 ? 'flex' : 'none';
        document.getElementById('cart-discount').textContent = `-${formatPrice(discount, 'USD')}`;
    }
}

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

function applyCoupon() {
    const input = document.getElementById('coupon-input');
    if (!input) return;

    const code = input.value.trim().toUpperCase();

    if (code === CONFIG.couponCode && !state.couponApplied) {
        state.couponApplied = true;
        updateCartUI();
        showToast('success', `Cupón aplicado: ${CONFIG.couponDiscount * 100}% de descuento`);
    } else if (state.couponApplied) {
        showToast('error', 'El cupón ya fue aplicado');
    } else {
        showToast('error', 'Cupón inválido');
    }
}

function sendOrder() {
    if (state.cart.length === 0) {
        showToast('error', 'Agrega productos al carrito');
        return;
    }

    const subtotalUSD = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = state.couponApplied ? subtotalUSD * CONFIG.couponDiscount : 0;
    const totalUSD = subtotalUSD - discount;

    let message = '*NUEVO PEDIDO - CLICK TV*\n\n';
    message += 'Productos:\n';
    state.cart.forEach(item => {
        message += `- ${item.name} (${item.plan}) x${item.quantity}: $${item.price * item.quantity} USD\n`;
    });
    message += `\nSubtotal: $${subtotalUSD.toFixed(2)} USD`;
    if (discount > 0) {
        message += `\nDescuento (MUNDIAL2026): -$${discount.toFixed(2)} USD`;
    }
    message += `\n*Total: $${totalUSD.toFixed(2)} USD*\n`;
    message += `\nMoneda seleccionada: ${state.currency}`;

    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function sendReceipt() {
    const message = 'Hola, acabo de realizar un pago y quiero enviar mi comprobante.';
    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// ============ MENU FUNCTIONS ============
function toggleMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

// ============ CALCULATOR ============
function calcSavings() {
    const select = document.getElementById('calc-select');
    if (!select) return;

    const option = select.options[select.selectedIndex];
    const price = parseInt(option.value);
    const official = parseInt(option.dataset.official);

    const officialEl = document.getElementById('calc-official');
    const tvEl = document.getElementById('calc-tv');
    const saveEl = document.getElementById('calc-save');
    const percentEl = document.getElementById('calc-percent');

    if (officialEl) officialEl.textContent = `$${official}.00`;
    if (tvEl) tvEl.textContent = `$${price}.00`;
    if (saveEl) saveEl.textContent = `$${official - price}.00`;
    if (percentEl) {
        const percent = Math.round(((official - price) / official) * 100);
        percentEl.textContent = `(${percent}% OFF)`;
    }
}

// ============ CONTACT FORM ============
function updatePhonePrefix() {
    const select = document.getElementById('contact-country');
    const prefixEl = document.getElementById('phone-prefix');
    if (!select || !prefixEl) return;

    const option = select.options[select.selectedIndex];
    const prefix = option.dataset.prefix;
    prefixEl.textContent = prefix;
}

function submitContact(event) {
    event.preventDefault();

    const name = document.getElementById('contact-name').value;
    const lastname = document.getElementById('contact-lastname').value;
    const country = document.getElementById('contact-country').value;
    const prefix = document.getElementById('phone-prefix').textContent;
    const phone = document.getElementById('contact-phone').value;
    const email = document.getElementById('contact-email').value;
    const service = document.getElementById('contact-service').value;
    const message = document.getElementById('contact-message').value;

    let text = '*SOLICITUD DE CONTACTO - CLICK TV*\n\n';
    text += `*Nombre:* ${name} ${lastname}\n`;
    text += `*País:* ${country}\n`;
    text += `*Teléfono:* ${prefix}${phone}\n`;
    text += `*Email:* ${email}\n`;
    text += `*Servicio:* ${service || 'No especificado'}\n`;
    if (message) text += `*Mensaje:* ${message}\n`;

    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

// ============ SUPPORT ============
function openSupport() {
    const message = 'Hola, necesito soporte técnico.';
    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// ============ UTILITY FUNCTIONS ============
function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('success', 'Copiado al portapapeles');
    }).catch(() => {
        // Fallback
        const input = document.createElement('input');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showToast('success', 'Copiado al portapapeles');
    });
}

function showToast(type, message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${type === 'success'
                ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
                : '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'}
        </svg>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============ ACTIVITY NOTIFICATIONS ============
function initActivityNotifications() {
    // Show initial notification after 5 seconds
    setTimeout(showActivityNotification, 5000);

    // Then show random notifications every 30-60 seconds
    setInterval(() => {
        if (Math.random() > 0.5) {
            showActivityNotification();
        }
    }, 30000 + Math.random() * 30000);
}

function showActivityNotification() {
    const existing = document.querySelector('.activity-notification');
    if (existing) existing.remove();

    const randomMessage = ACTIVITY_MESSAGES[Math.floor(Math.random() * ACTIVITY_MESSAGES.length)];

    const notification = document.createElement('div');
    notification.className = 'activity-notification show';
    notification.innerHTML = `
        <button class="activity-close" onclick="this.parentElement.remove()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
        <div class="activity-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
        </div>
        <div class="activity-content">
            <p class="activity-text">${randomMessage}</p>
            <span class="activity-time">hace ${Math.floor(Math.random() * 5) + 1} min</span>
        </div>
    `;

    document.body.appendChild(notification);

    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// ============ ONLINE COUNTER ============
function initOnlineCounter() {
    const counterEl = document.getElementById('online-count');
    if (!counterEl) return;

    // Initial random count between 180-250
    let count = 180 + Math.floor(Math.random() * 70);
    counterEl.textContent = count;

    // Update every 10-30 seconds
    setInterval(() => {
        count += Math.floor(Math.random() * 10) - 3;
        count = Math.max(150, Math.min(300, count));
        counterEl.textContent = count;
    }, 10000 + Math.random() * 20000);
}

// ============ SMOOTH SCROLL ============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
