// ================= CLICK TV ENGINE FIX =================

let cart = [];
let currentCurrency = "USD";
let currentRate = 1;

window.rates = window.rates || { USD: 1 };

const WPP_NUMBER = "593939166222";

// ================= INIT =================
window.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    fetchExchangeRates();
    updateCartUI();
}

// ================= EXCHANGE =================
function fetchExchangeRates() {
    window.rates = { USD: 1, PEN: 3.8, COP: 4000, ARS: 1000, CLP: 950, MXN: 17 };
}

// ================= CART =================
function addToCart(name, priceUSD) {

    if (!name || isNaN(priceUSD)) return;

    const item = cart.find(i => i.name === name);

    if (item) item.qty++;
    else cart.push({ name, priceUSD: Number(priceUSD), qty: 1 });

    updateCartUI();

    const sidebar = document.getElementById("cart-sidebar");
    if (sidebar) sidebar.classList.add("active");
}

function updateCartUI() {

    const container = document.getElementById("cart-items");
    const count = document.getElementById("cart-count");
    const empty = document.getElementById("cart-empty");
    const totals = document.getElementById("cart-totals-section");

    if (!container) return;

    let html = "";
    let totalItems = 0;

    cart.forEach(item => {
        totalItems += item.qty;

        html += `
            <div class="cart-item">
                <b>${item.name}</b>
                <span>x${item.qty}</span>
            </div>
        `;
    });

    container.innerHTML = html;

    if (count) count.innerText = totalItems;

    if (cart.length === 0) {
        if (empty) empty.style.display = "block";
        if (totals) totals.style.display = "none";
    } else {
        if (empty) empty.style.display = "none";
        if (totals) totals.style.display = "block";
    }
}

// ================= BUY =================
function buyNow(name, price) {

    const msg = `🛒 CLICK TV\n\n📦 ${name}\n💰 $${price} USD`;

    window.open(
        `https://wa.me/${WPP_NUMBER}?text=${encodeURIComponent(msg)}`,
        "_blank"
    );
}

// ================= DROPDOWN =================
function addDropdownToCart(base, selectId) {

    const select = document.getElementById(selectId);
    if (!select) return;

    const opt = select.options[select.selectedIndex];
    const price = parseFloat(opt.dataset.usd);

    if (isNaN(price)) return;

    const label = opt.text.split("-")[0].trim();

    addToCart(`${base} - ${label}`, price);
}

// ================= CHECKOUT =================
function processCheckout() {

    if (!cart.length) return;

    let text = "🛒 CLICK TV ORDER\n\n";
    let total = 0;

    cart.forEach(i => {
        text += `📦 ${i.name} x${i.qty} = $${i.priceUSD * i.qty}\n`;
        total += i.priceUSD * i.qty;
    });

    text += `\n💰 TOTAL: $${total} USD`;

    window.open(
        `https://wa.me/${WPP_NUMBER}?text=${encodeURIComponent(text)}`,
        "_blank"
    );
}

// ================= UI HELPERS =================
function toggleCart() {
    document.getElementById("cart-sidebar")?.classList.toggle("active");
}

function toggleMenu() {
    document.getElementById("nav-links")?.classList.toggle("active");
}

// ================= CALCULADORA PRO =================
function calculateSavings(){

    const select = document.getElementById("calc-service");
    if(!select) return;

    const opt = select.options[select.selectedIndex];

    const official = parseFloat(opt.dataset.official);
    const click = parseFloat(opt.dataset.click);

    if(isNaN(official) || isNaN(click)) return;

    const savings = official - click;
    const percent = Math.round((savings / official) * 100);

    const offEl = document.getElementById("calc-official");
    const clickEl = document.getElementById("calc-click");
    const saveEl = document.getElementById("calc-savings");

    if(offEl) offEl.innerText = `$${official}`;
    if(clickEl) clickEl.innerText = `$${click}`;
    if(saveEl) saveEl.innerText = `$${savings} (${percent}%)`;
}

function changeCurrency(cur) {
    currentCurrency = cur;
    currentRate = window.rates[cur] || 1;
    updateCartUI();
}

// placeholders para evitar errores HTML
function filterProducts() {}
function filterCategory() {}
function updateDropdownPrice() {}