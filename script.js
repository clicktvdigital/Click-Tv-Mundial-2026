const products = [];
const WPP_NUMBER = "593939166222";
const API_KEY = "7e284e79d45dced6ed3dd58cadca697c";
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
    console.log("INIT APP");
    try {
        console.log("1");
        await fetchExchangeRates();

        console.log("2");
        await detectUserCountry();

        console.log("3");
        await fetchWorldCupMatches();

        console.log("4");
        startToastRotator();

        console.log("5");
        simulateOnlineUsers();
        updateCartUI();
        applyCurrencyUpdate();

        console.log("6");

    } catch(err) {
        console.error("ERROR INIT:", err);
    }
}

async function fetchExchangeRates() {
    window.rates = {
        USD: 1,
        PEN: 3.80,
        COP: 4000,
        ARS: 1000,
        CLP: 950,
        MXN: 17
    };
}

async function detectUserCountry() {
    const locationEl = document.getElementById('user-location');
    try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 3000);
        const res = await fetch(
            'https://ipapi.co/json/',
            { signal: controller.signal }
        );
        const data = await res.json();
        if(locationEl){
            locationEl.innerText = `🌎 ${data.country_name}`;
        }
    } catch (e) {
        if(locationEl){
            locationEl.innerText = 'Latinoamérica';
        }
    }
}

function formatMoney(amount, currency) {
    const value = Number(amount);
    switch(currency){
        case 'USD':
            return `$${value.toFixed(2)} USD`;
        case 'PEN':
            return `S/ ${value.toFixed(2)}`;
        case 'COP':
            return `$${Math.round(value).toLocaleString('es-CO')} COP`;
        case 'ARS':
            return `$${Math.round(value).toLocaleString('es-AR')} ARS`;
        case 'CLP':
            return `$${Math.round(value).toLocaleString('es-CL')} CLP`;
        case 'MXN':
            return `$${value.toFixed(2)} MXN`;
        default:
            return `$${value.toFixed(2)} ${currency}`;
    }
}

function applyCurrencyUpdate() {
    currentRate = window.rates[currentCurrency] || 1;
    document.querySelectorAll('.current-currency-label').forEach(el => el.innerText = currentCurrency);

    document.querySelectorAll('.local-price').forEach(el => {
        const usdPrice = parseFloat(el.getAttribute('data-usd'));
        el.innerText = formatMoney(usdPrice * currentRate, currentCurrency);
    });

    document.querySelectorAll('.usd-reference').forEach(el => {
        if(currentCurrency === 'USD') {
            el.style.display = 'none';
        } else {
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
    if(!select) return;
    const option = select.options[select.selectedIndex];
    const usdClick = parseFloat(option.value);
    const usdOfficial = parseFloat(option.getAttribute('data-official'));

    const savingsLocal = (usdOfficial * currentRate) - (usdClick * currentRate);
    const percent = Math.round(((usdOfficial - usdClick) / usdOfficial) * 100);

    document.getElementById('calc-official').innerText = formatMoney(usdOfficial * currentRate, currentCurrency);
    document.getElementById('calc-click').innerText = formatMoney(usdClick * currentRate, currentCurrency);
    document.getElementById('calc-savings').innerHTML = `${formatMoney(savingsLocal, currentCurrency)} <br><small>(${percent}% OFF)</small>`;
}

function toggleMenu() {
    const nav = document.getElementById('nav-links');
    if(nav) nav.classList.toggle('active');
}

function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    if(cartSidebar) cartSidebar.classList.toggle('active');
}

function addToCart(name, priceUSD) {
    const existing = cart.find(i => i.name === name);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, priceUSD, qty: 1 });
    }
    updateCartUI();
    saveCart();
    const cartSidebar = document.getElementById('cart-sidebar');
    if(cartSidebar) cartSidebar.classList.add('active');
}

function saveCart(){
    localStorage.setItem('clicktv_cart', JSON.stringify(cart));
}

const savedCart = localStorage.getItem('clicktv_cart');
if(savedCart){
    cart = JSON.parse(savedCart);
}

function addDropdownToCart(baseName, selectId) {
    const select = document.getElementById(selectId);
    const opt = select.options[select.selectedIndex];
    addToCart(`${baseName} - ${opt.text.split('-')[0].trim()}`, parseFloat(opt.getAttribute('data-usd')));
}

function changeQty(name, delta) {
    const item = cart.find(i => i.name === name);
    if(item) {
        item.qty += delta;
        if(item.qty <= 0) {
            cart = cart.filter(i => i.name !== name);
        }
        updateCartUI();
        saveCart();
    }
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
    saveCart();
}

function updateCartUI() {
    const itemsContainer = document.getElementById('cart-items');
    const emptyMsg = document.getElementById('cart-empty-msg');
    const totalsSection = document.getElementById('cart-totals-section');
    
    if(!itemsContainer) return;

    itemsContainer.innerHTML = '';
    let subtotalUSD = 0;
    let qtyTotal = 0;

    if (cart.length === 0) {
        if(emptyMsg) emptyMsg.style.display = 'block';
        if(totalsSection) totalsSection.style.display = 'none';
        document.getElementById('cart-count').innerText = "0";
        return;
    }

    if(emptyMsg) emptyMsg.style.display = 'none';
    if(totalsSection) totalsSection.style.display = 'block';

    cart.forEach(item => {
        subtotalUSD += item.priceUSD * item.qty;
        qtyTotal += item.qty;
        itemsContainer.innerHTML += `
            <div class="cart-item">
                <div style="flex:1;">
                    <h4 style="font-size:12px; margin-bottom:5px;">${item.name}</h4>
                    <small>${formatMoney(item.priceUSD * currentRate, currentCurrency)}</small>
                </div>
                <div class="cart-qty-controls">
                    <button onclick="changeQty('${item.name}', -1)">-</button>
                    <span style="font-size:12px; font-weight:bold; padding:0 5px;">${item.qty}</span>
                    <button onclick="changeQty('${item.name}', 1)">+</button>
                </div>
            </div>`;
    });

    const discountUSD = subtotalUSD * discountPercent;
    const totalUSD = subtotalUSD - discountUSD;

    document.getElementById('cart-count').innerText = qtyTotal;
    document.getElementById('cart-subtotal-local').innerText = formatMoney(subtotalUSD * currentRate, currentCurrency);
    document.getElementById('cart-discount-local').innerText = "-" + formatMoney(discountUSD * currentRate, currentCurrency);
    document.getElementById('cart-total-local').innerText = formatMoney(totalUSD * currentRate, currentCurrency);
    document.getElementById('cart-total-usd').innerText = `$${totalUSD.toFixed(2)} USD`;
}

function processCheckout() {
    if (cart.length === 0) return;
    let text = `🚀 *NUEVO PEDIDO INTERNACIONAL*%0A%0A📍 *País:* ${document.getElementById('user-location').innerText}%0A💱 *Moneda:* ${currentCurrency}%0A🛒 *Resumen:*%0A`;
    cart.forEach(i => { text += `▪ ${i.qty}x ${i.name} -> ${formatMoney(i.priceUSD * currentRate * i.qty, currentCurrency)}%0A`; });
    text += `%0A💰 *TOTAL:* ${document.getElementById('cart-total-local').innerText}%0A💵 *Ref USD:* ${document.getElementById('cart-total-usd').innerText}%0A`;
    if(discountPercent > 0) text += `🎁 *(Descuento 5% Aplicado)*%0A`;
    text += `%0A💳 *Deseo finalizar mi pedido y enviar comprobante.*`;
    window.open(`https://wa.me/${WPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
}

function buyNow(name, priceUSD) {
    let text = `Hola, deseo comprar ${name} por $${priceUSD} USD.`;
    window.open(`https://wa.me/${WPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
}

function buyNowDropdown(baseName, selectId) {
    const select = document.getElementById(selectId);
    const opt = select.options[select.selectedIndex];
    const price = opt.getAttribute('data-usd');
    const planName = opt.text.split('-')[0].trim();
    let text = `Hola, deseo comprar ${baseName} (${planName}) por $${price} USD.`;
    window.open(`https://wa.me/${WPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast("✅ Cuenta copiada");
    });
}

function submitContactForm(e) {
    e.preventDefault();
    const name = document.getElementById('contact-name').value;
    const last = document.getElementById('contact-last').value;
    const country = document.getElementById('contact-country').value;
    const phone = document.getElementById('contact-phone').value;
    const msg = document.getElementById('contact-msg').value;
    const text = `🌎 *CONTACTO*%0A👤 ${name} ${last}%0A📍 País: ${country}%0A📱 Tel: ${phone}%0A💬 Mensaje: ${msg}`;
    if(window.currentContactMethod === 'telegram') {
        window.open(`https://t.me/streamid`, '_blank');
    } else {
        window.open(`https://wa.me/${WPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
    }
}

function setContactMethod(method){
    window.currentContactMethod = method;
}

function showToast(msg) {
    const c = document.getElementById('toast-container');
    if(!c) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = msg;
    c.appendChild(t);
    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translateX(-100%)';
        setTimeout(() => t.remove(), 500);
    }, 3500);
}

function startToastRotator() {
    let index = 0;
    setInterval(() => {
        showToast(activities[index]);
        index = (index + 1) % activities.length;
    }, 15000); 
}

function simulateOnlineUsers() {
    const onlineCountEl = document.getElementById('online-count');
    if(!onlineCountEl) return;
    function updateCount(){
        const base = 250;
        const random = Math.floor(Math.random() * 50);
        onlineCountEl.innerText = base + random;
    }
    updateCount();
    setInterval(updateCount, 6000);
}

const teamFlags = {
    Ecuador: "🇪🇨", Germany: "🇩🇪", Scotland: "🏴", Haiti: "🇭🇹", "Ivory Coast": "🇨🇮", Curaçao: "🇨🇼", Mexico: "🇲🇽", Canada: "🇨🇦", USA: "🇺🇸", Japan: "🇯🇵", Sweden: "🇸🇪", Tunisia: "🇹🇳", Netherlands: "🇳🇱", Spain: "🇪🇸", France: "🇫🇷", Brazil: "🇧🇷", Argentina: "🇦🇷", England: "🏴", Portugal: "🇵🇹", Uruguay: "🇺🇾", Paraguay: "🇵🇾", Bolivia: "🇧🇴", Venezuela: "🇻🇪", Australia: "🇦🇺", Belgium: "🇧🇪", Croatia: "🇭🇷", Denmark: "🇩🇰", Switzerland: "🇨🇭", Egypt: "🇪🇬", "Saudi Arabia": "🇸🇦", Morocco: "🇲🇦", Algeria: "🇩🇿", Nigeria: "🇳🇬", Cameroon: "🇨🇲", Senegal: "🇸🇳", Ghana: "🇬🇭", Chile: "🇨🇱", Peru: "🇵🇪", Colombia: "🇨🇴"
};

const teamNamesES = {
    Germany: "Alemania", Scotland: "Escocia", Haiti: "Haití", "Ivory Coast": "Costa de Marfil", Curaçao: "Curazao", Spain: "España", Belgium: "Bélgica", Egypt: "Egipto", "Saudi Arabia": "Arabia Saudita", Netherlands: "Países Bajos", Japan: "Japón", Sweden: "Suecia", Tunisia: "Túnez", France: "Francia", Brazil: "Brasil", Argentina: "Argentina", England: "Inglaterra", Portugal: "Portugal", Uruguay: "Uruguay", Paraguay: "Paraguay", Bolivia: "Bolivia", Venezuela: "Venezuela", Australia: "Australia", Croatia: "Croacia", Denmark: "Dinamarca", Switzerland: "Suiza", Morocco: "Marruecos", Algeria: "Argelia", Nigeria: "Nigeria", Cameroon: "Cameroón", Senegal: "Senegal", Ghana: "Ghana", Chile: "Chile", Peru: "Perú", Colombia: "Colombia", Mexico: "México", Canada: "Canadá", USA: "Estados Unidos"
};

async function fetchWorldCupMatches() {
    const container = document.getElementById('matches-container');
    if (!container) return;
    try {
        const events = [
  {
    strHomeTeam: "France",
    strAwayTeam: "Senegal",
    dateEvent: "2026-06-16",
    strTime: "14:00:00" // Ecuador
  },
  {
    strHomeTeam: "Iraq",
    strAwayTeam: "Norway",
    dateEvent: "2026-06-16",
    strTime: "17:00:00" // Ecuador
  },
  {
    strHomeTeam: "Argentina",
    strAwayTeam: "Algeria",
    dateEvent: "2026-06-16",
    strTime: "20:00:00" // Ecuador
  },
  {
    strHomeTeam: "Portugal",
    strAwayTeam: "DR Congo",
    dateEvent: "2026-06-17",
    strTime: "12:00:00" // Ecuador
  },
  {
    strHomeTeam: "England",
    strAwayTeam: "Croatia",
    dateEvent: "2026-06-17",
    strTime: "15:00:00" // Ecuador
  }
];
            


        const upcomingMatches = events.sort((a, b) => {
            const dateA = new Date(`${a.dateEvent}T${a.strTime}Z`);
            const dateB = new Date(`${b.dateEvent}T${b.strTime}Z`);
            return dateA - dateB;
        }).slice(0, 6);

        if(upcomingMatches.length === 0){
            showMatchFallback(container);
            return;
        }

        let html = '';
        upcomingMatches.forEach(m => {
            const localTime = new Date(`${m.dateEvent}T${m.strTime}`).toLocaleTimeString('es-EC', {
                timeZone: 'America/Guayaquil',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            html += `
            <div class="match-card">
                <div class="match-header">
                    <span>🏆 Mundial FIFA 2026</span>
                    <span class="match-status status-upcoming">⚽ Mundial 2026</span>
                </div>
                <div class="match-teams">
                    <span class="team">${teamFlags[m.strHomeTeam] || '⚽'} ${teamNamesES[m.strHomeTeam] || m.strHomeTeam}</span>
                    <span class="match-vs">VS</span>
                    <span class="team">${teamFlags[m.strAwayTeam] || '⚽'} ${teamNamesES[m.strAwayTeam] || m.strAwayTeam}</span>
                </div>
                <div class="match-info">
                    🕒 Hora Ecuador: ${localTime} 🇪🇨<br>
                    <span class="countdown" data-date="${m.dateEvent}" data-time="${m.strTime}"></span>
                </div>
            </div>`;
        });
        container.innerHTML = html;
        startCountdowns();
    } catch (error) {
        showMatchFallback(container);
    }
}

function showMatchFallback(container) {
    container.innerHTML = `<div style="text-align:center;padding:30px;grid-column:1/-1;"><h3>⚽ Fixture en actualización</h3><p>Consulta el calendario oficial FIFA.</p></div>`;
}

function startCountdowns(){
    document.querySelectorAll('.countdown').forEach(el=>{
        const date = el.dataset.date;
        const time = el.dataset.time;
        const matchDate = new Date(`${date}T${time}`);
        function update(){
            const diff = matchDate - new Date();
            if(diff <= 0){
                el.innerHTML = '🔴 EN VIVO';
                return;
            }
            const hours = Math.floor(diff/1000/60/60);
            const mins = Math.floor((diff/1000/60)%60);
            el.innerHTML = hours === 0 ? `🔥 ${mins} min` : `⏳ ${hours}h ${mins}m`;
        }
        update();
        setInterval(update, 60000);
    });
}

window.addEventListener('load', initApp);