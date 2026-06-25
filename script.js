// ================= AMAZON PRO CART FIX (FINAL CLEAN) =================

let cart = [];
let currentCurrency = 'USD';
let currentRate = 1;
let currencyUpdating = false;

const WPP_NUMBER = "593939166222";

window.rates = { USD: 1, PEN: 3.8, COP: 4000, ARS: 1000, CLP: 950, MXN: 17 };

// ================= CART =================
function addToCart(name, priceUSD) {
    
    if (!name || isNaN(priceUSD)) return;
    
    const item = cart.find(i => i.name === name);
    
    if (item) item.qty++;
    else cart.push({ name, priceUSD, qty: 1 });
    
    updateCartUI();
    openCart();
}

function updateCartUI() {
    
    const items = document.getElementById("cart-items");
    const empty = document.getElementById("cart-empty");
    const totals = document.getElementById("cart-totals-section");
    const count = document.getElementById("cart-count");
    
    if (!items) return;
    
    let html = "";
    let total = 0;
    
    cart.forEach(i => {
        total += i.qty;
        
        html += `
        <div class="cart-item">
            <b>${i.name}</b>
            <span>x${i.qty}</span>
        </div>`;
    });
    
    items.innerHTML = html;
    
    if (count) count.innerText = total;
    
    if (cart.length === 0) {
        if (empty) empty.style.display = "block";
        if (totals) totals.style.display = "none";
    } else {
        if (empty) empty.style.display = "none";
        if (totals) totals.style.display = "block";
    }
}

// ================= DROPDOWN =================
function addDropdownToCart(baseName, selectId) {
    
    const select = document.getElementById(selectId);
    if (!select) return;
    
    const opt = select.options[select.selectedIndex];
    const price = parseFloat(opt.dataset.usd);
    
    if (isNaN(price)) return;
    
    const label = opt.text.split("-")[0].trim();
    
    addToCart(`${baseName} - ${label}`, price);
}

// ================= CART UI =================
function openCart() {
    const el = document.getElementById("cart-sidebar");
    if (el) el.classList.add("active");
}

function toggleCart() {
    const el = document.getElementById("cart-sidebar");
    if (el) el.classList.toggle("active");
}

// ================= BUY =================
function buyNow(name, price) {
    
    const msg = `🛒 CLICK TV\n\n📦 ${name}\n💰 $${price} USD`;
    
    window.open(
        `https://wa.me/${WPP_NUMBER}?text=${encodeURIComponent(msg)}`,
        "_blank"
    );
}

// ================= INIT =================
window.addEventListener("DOMContentLoaded", () => {
    updateCartUI();
});