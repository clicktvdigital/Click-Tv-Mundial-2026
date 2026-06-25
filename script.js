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
    
    let container = document.getElementById("cart-items");
    let count = document.getElementById("cart-count");
    let empty = document.getElementById("cart-empty");
    let totals = document.getElementById("cart-totals-section");
    let totalEl = document.getElementById("cart-total-local");
    
    if (!container) return;
    
    let html = "";
    let total = 0;
    let items = 0;
    
    cart.forEach(i => {
        total += i.price * i.qty;
        items += i.qty;
        
        html += `
        <div class="cart-item">
            <b>${i.name}</b>
            <span>x${i.qty}</span>
        </div>`;
    });
    
    container.innerHTML = html;
    
    if (count) count.innerText = items;
    if (totalEl) totalEl.innerText = `$${total.toFixed(2)}`;
    
    if (cart.length === 0) {
        empty && (empty.style.display = "block");
        totals && (totals.style.display = "none");
    } else {
        empty && (empty.style.display = "none");
        totals && (totals.style.display = "block");
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

function calculateSavings() {
    
    const select = document.getElementById("calc-service");
    if (!select || !select.options) return;
    
    const option = select.options[select.selectedIndex];
    if (!option) return;
    
    const official = parseFloat(option.getAttribute("data-official"));
    const click = parseFloat(option.getAttribute("data-click"));
    
    if (isNaN(official) || isNaN(click)) return;
    
    const savings = official - click;
    const percent = Math.round((savings / official) * 100);
    
    const offEl = document.getElementById("calc-official");
    const clickEl = document.getElementById("calc-click");
    const saveEl = document.getElementById("calc-savings");
    
    if (offEl) offEl.innerText = `$${official.toFixed(2)}`;
    if (clickEl) clickEl.innerText = `$${click.toFixed(2)}`;
    if (saveEl) saveEl.innerText = `$${savings.toFixed(2)} (${percent}%)`;
}
function changeCurrency(cur) {
    currentCurrency = cur;
    currentRate = window.rates[cur] || 1;
    updateCartUI();
}

// placeholders para evitar errores HTML"
function filterProducts() {}
function filterCategory() {}
function updateDropdownPrice() {}

window.addEventListener("DOMContentLoaded", () => {
    
    // asegura calculadora
    if (document.getElementById("calc-service")) {
        calculateSavings();
    }
    
    // asegura carrito visible
    if (typeof updateCartUI === "function") {
        updateCartUI();
    }
    
});
window.addEventListener("DOMContentLoaded", () => {

    setTimeout(() => {
        calculateSavings();
    }, 300);

});