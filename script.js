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
    await fetchExchangeRates();
    await detectUserCountry();
    calculateSavings();
    startToastRotator();
    simulateOnlineUsers();
    fetchWorldCupMatches();
    
    // Setup Menu Mayoristas toggle
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if(e.target.getAttribute('href') === '#mayoristas') {
                e.preventDefault();
                document.getElementById('mayoristas').style.display = 'block';
                document.getElementById('mayoristas').scrollIntoView();
            }
            document.getElementById('nav-links').classList.remove('active');
        });
    });

    // Setup Mundial Tabs
    const tabs = document.querySelectorAll('#mundial-tabs .tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            // Filtrado visual simulado ya que se alimenta de API o fallback
            fetchWorldCupMatches();
        });
    });
}

async function fetchExchangeRates() {
    try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        alert(JSON.stringify(data).substring(0,500));
        window.rates = data.rates;
    } catch (e) {
        window.rates = { USD:1, PEN:3.8, COP:4000, ARS:1000, CLP:950, MXN:17 };
    }
}

async function detectUserCountry() {
    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        const locationEl = document.getElementById('user-location');

const countryFlags = {
    EC: "🇪🇨",
    PE: "🇵🇪",
    CO: "🇨🇴",
    AR: "🇦🇷",
    CL: "🇨🇱",
    MX: "🇲🇽",
    US: "🇺🇸",
    ES: "🇪🇸"
};

if(locationEl){
    locationEl.innerText =
        `${countryFlags[data.country_code] || "🌎"} ${data.country_name}`;
}
        if (currencyMap[data.country_code]) {
            currentCurrency = currencyMap[data.country_code];
            document.getElementById('currency-selector').value = currentCurrency;
        }
    } catch (e) {
        const locationEl = document.getElementById('user-location');

if(locationEl){
    locationEl.innerText = 'Latinoamérica';
}
    }
    applyCurrencyUpdate();
}

const currencySelector = document.getElementById('currency-selector');

if (currencySelector) {
currencySelector.addEventListener('change', (e) => {
currentCurrency = e.target.value;
applyCurrencyUpdate();
});
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

document.getElementById('calc-official').innerText =
    formatMoney(usdOfficial * currentRate, currentCurrency);

document.getElementById('calc-click').innerText =
    formatMoney(usdClick * currentRate, currentCurrency);

document.getElementById('calc-savings').innerHTML =
    `${formatMoney(savingsLocal, currentCurrency)} <br><small>(${percent}% OFF)</small>`;

}


function toggleMenu() {
const nav = document.getElementById('nav-links');
if(nav){
nav.classList.toggle('active');
}
}

function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');

    if(cartSidebar){
        cartSidebar.classList.toggle('active');
    }
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

if(cartSidebar){
    cartSidebar.classList.add('active');
}
}
function saveCart(){
    localStorage.setItem(
        'clicktv_cart',
        JSON.stringify(cart)
    );
}
const savedCart =
    localStorage.getItem('clicktv_cart');

if(savedCart){
    cart = JSON.parse(savedCart);
    updateCartUI();
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
        const itemTotalLocal = formatMoney(item.priceUSD * currentRate * item.qty, currentCurrency);
        
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
    const t = document.createElement('div');
    t.className = 'toast'; t.innerHTML = msg;
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
    Ecuador: "🇪🇨",
    Germany: "🇩🇪",
    Scotland: "🏴",
    Haiti: "🇭🇹",
    "Ivory Coast": "🇨🇮",
    "Curaçao": "🇨🇼",
    Mexico: "🇲🇽",
    Canada: "🇨🇦",
    USA: "🇺🇸",
    Japan: "🇯🇵",
    Sweden: "🇸🇪",
    Tunisia: "🇹🇳",
    Netherlands: "🇳🇱",
    Spain: "🇪🇸",
    France: "🇫🇷",
    Brazil: "🇧🇷",
    Argentina: "🇦🇷",
    England: "🏴",
    Portugal: "🇵🇹",
Uruguay: "🇺🇾",
Paraguay: "🇵🇾",
Bolivia: "🇧🇴",
Venezuela: "🇻🇪",
Australia: "🇦🇺",
Belgium: "🇧🇪",
Croatia: "🇭🇷",
Denmark: "🇩🇰",
Switzerland: "🇨🇭"
};
const teamNamesES = {
    "Haiti": "Haití",
    "Scotland": "Escocia",
    "Germany": "Alemania",
    "Curaçao": "Curazao",
    "Ivory Coast": "Costa de Marfil",
    "Ecuador": "Ecuador",
    "USA": "Estados Unidos",
    "Mexico": "México",
    "Canada": "Canadá",
    "England": "Inglaterra",
    "Netherlands": "Países Bajos",
    "Switzerland": "Suiza",
    "Sweden": "Suecia",
    "Japan": "Japón"
};
const FOOTBALL_API_KEY = '467c885c07fa49baa40ac78cf636f8b0';
async function fetchWorldCupMatches() {

    const container =
        document.getElementById('matches-container');

    if (!container) return;

    try {

        const res = await fetch(
            'https://api.football-data.org/v4/competitions/WC/matches',
            {
                headers: {
                    'X-Auth-Token': FOOTBALL_API_KEY
                }
            }
        );

        const data = await res.json();
        alert(JSON.stringify(data).substring(0,500));
console.log(data);
        const now = new Date();

        const upcomingMatches = data.matches
            .filter(match =>
                new Date(match.utcDate) > now
            )
            .sort((a,b) =>
                new Date(a.utcDate) -
                new Date(b.utcDate)
            )
            .slice(0,4);

        let html = '';

        upcomingMatches.forEach(match => {

            const localTime =
                new Date(match.utcDate)
                .toLocaleTimeString(
                    'es-EC',
                    {
                        timeZone:'America/Guayaquil',
                        hour:'2-digit',
                        minute:'2-digit'
                    }
                );

            html += `
            <div class="match-card">

                <div class="match-header">
                    <span>🏆 Mundial FIFA 2026</span>
                    <span class="match-status status-upcoming">
                        Próximo Partido
                    </span>
                </div>

                <div class="match-teams">

                    <span class="team">
                        ⚽ ${match.homeTeam.name}
                    </span>

                    <span class="match-vs">
                        VS
                    </span>

                    <span class="team">
                        ⚽ ${match.awayTeam.name}
                    </span>

                </div>

                <div class="match-info">
                    <i class="far fa-clock"></i>
                    ${localTime} 🇪🇨
                </div>

            </div>`;
        });

        container.innerHTML = html;

    } catch(error) {

        console.error(error);

        showMatchFallback(container);

    }
}

function showMatchFallback(container) {
    container.innerHTML = `
        <div style="text-align:center;padding:30px;grid-column:1/-1;">
            <i class="fas fa-futbol"
               style="font-size:3rem;color:#f5b400;margin-bottom:15px;">
            </i>

            <h3 style="margin-bottom:10px;">
                ⚽ Fixture en actualización
            </h3>

            <p style="color:#aaa;margin-bottom:20px;">
                Consulta el calendario oficial FIFA.
            </p>

            <a href="https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures"
               target="_blank"
               class="btn btn-primary">
                Ver Fixture Oficial FIFA
            </a>
        </div>
    `;
}
document.addEventListener('DOMContentLoaded', initApp);

// Dark mode persistence
if(localStorage.getItem('theme')==='dark'){document.documentElement.classList.add('dark');}

