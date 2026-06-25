

/**
 * CLICKTV ENGINE 4.0 FINAL
 * Stable Production Ready System
 */

"use strict";

/* ================= STATE ================= */
let cart = JSON.parse(localStorage.getItem("clicktv_cart")) || [];
const WPP = "593939166222";

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
    renderProducts(PRODUCTS);
    updateCartUI();
    updateSavings();
});

/* ================= PRODUCTS ================= */
const PRODUCTS = [
    { id: 1, name: "Netflix", price: 5, category: "streaming" },
    { id: 2, name: "Disney+", price: 5, category: "streaming" },
    { id: 3, name: "IPTV Ultra", price: 7, category: "iptv" },
    { id: 4, name: "HBO Max", price: 6, category: "streaming" },
    { id: 5, name: "Canva Pro", price: 3, category: "apps" },
    { id: 6, name: "DAZN", price: 6, category: "sports" }
];

/* ================= RENDER ================= */
function renderProducts(list) {

    const container = document.getElementById("catalog-container");
    if (!container) return;

    container.innerHTML = list.map(p => `
        <div class="product-card">
            <h3>${p.name}</h3>
            <p>$${p.price.toFixed(2)}</p>

            <button onclick="addToCart(${p.id})">🛒 Añadir</button>
            <button onclick="buyNow('${p.name}', ${p.price})">💳 Comprar</button>
        </div>
    `).join("");
}

/* ================= FILTERS (FIXED) ================= */
function filterProducts(category, e) {

    const buttons = document.querySelectorAll(".filter-btn");
    buttons.forEach(b => b.classList.remove("active"));

    if (e?.target) e.target.classList.add("active");

    if (category === "all") {
        renderProducts(PRODUCTS);
        return;
    }

    const filtered = PRODUCTS.filter(p => p.category === category);
    renderProducts(filtered);
}

/* ================= CART ================= */
function addToCart(id) {

    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;

    cart.push(product);
    saveCart();
    updateCartUI();
    openCart();
}

function updateCartUI() {

    const box = document.getElementById("cart-items");
    const count = document.getElementById("cart-count");
    const total = document.getElementById("cart-total");

    if (!box) return;

    let sum = 0;

    box.innerHTML = cart.map((item, i) => {
        sum += item.price;

        return `
        <div class="cart-item">
            <div>
                <b>${item.name}</b><br>
                <small>$${item.price}</small>
            </div>
            <button onclick="removeFromCart(${i})">✕</button>
        </div>`;
    }).join("");

    if (count) count.innerText = cart.length;
    if (total) total.innerText = `$${sum.toFixed(2)}`;
}

function removeFromCart(i) {
    cart.splice(i, 1);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem("clicktv_cart", JSON.stringify(cart));
}

function openCart() {
    document.getElementById("cart-sidebar")?.classList.add("active");
}

function toggleCart() {
    document.getElementById("cart-sidebar")?.classList.toggle("active");
}

/* ================= CALCULATOR SAFE ================= */
function updateSavings() {

    const select = document.getElementById("calc-service");
    if (!select) return;

    const opt = select.options[select.selectedIndex];
    if (!opt) return;

    const official = Number(opt.dataset.official || 0);
    const internal = Number(opt.value || 0);

    if (!official) return;

    const saved = official - internal;
    const percent = Math.round((saved / official) * 100);

    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    };

    set("official-price", `$${official.toFixed(2)}`);
    set("internal-price", `$${internal.toFixed(2)}`);
    set("saved-price", `$${saved.toFixed(2)}`);
    set("saved-percent", `${percent}% OFF`);
}

/* ================= WHATSAPP ================= */
function buyNow(name, price) {

    const msg = encodeURIComponent(`CLICKTV ORDER: ${name} - $${price}`);

    window.open(`https://wa.me/${WPP}?text=${msg}`, "_blank");
}

function checkoutWhatsApp() {

    if (cart.length === 0) return alert("Carrito vacío");

    let total = 0;

    const items = cart.map(i => {
        total += i.price;
        return `- ${i.name} ($${i.price})`;
    }).join("\n");

    const msg = encodeURIComponent(`ORDER:\n\n${items}\n\nTOTAL: $${total}`);

    window.open(`https://wa.me/${WPP}?text=${msg}`, "_blank");
}

/* ================= MENU ================= */
function toggleMenu() {
    document.getElementById("nav-menu")?.classList.toggle("active");
}