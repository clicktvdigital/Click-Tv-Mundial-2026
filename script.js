
/**
 * CLICKTV ENGINE 3.0 FINAL
 * Stable Production Ecommerce System
 * FIXED: catalog, cart, calculator, filters
 */

"use strict";

/* ================= STATE ================= */
let cart = JSON.parse(localStorage.getItem("clicktv_cart")) || [];

const WPP_NUMBER = "593939166222";

/* ================= PRODUCTS ================= */
const PRODUCTS = [
    { id: 1, name: "Netflix Premium", price: 5, category: "streaming" },
    { id: 2, name: "Disney+ Premium", price: 5, category: "streaming" },
    { id: 3, name: "IPTV Ultra", price: 7, category: "iptv" },
    { id: 4, name: "HBO Max", price: 6, category: "streaming" },
    { id: 5, name: "Canva Pro", price: 3, category: "apps" },
    { id: 6, name: "DAZN Sports", price: 6, category: "sports" }
];

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
    renderProducts(PRODUCTS);
    updateCartUI();
    updateSavings();
});

/* ================= RENDER CATALOG ================= */
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

/* ================= FILTERS ================= */
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
    const totalEl = document.getElementById("cart-total");

    if (!box) return;

    let total = 0;

    box.innerHTML = cart.map((item, i) => {
        total += item.price;

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
    if (totalEl) totalEl.innerText = `$${total.toFixed(2)}`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
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

/* ================= CALCULATOR ================= */
function updateSavings() {

    const select = document.getElementById("calc-service");
    if (!select) return;

    const opt = select.options[select.selectedIndex];

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
    set("saved-percent", `${percent}% AHORRO`);
}

/* ================= WHATSAPP ================= */
function buyNow(name, price) {

    const msg = encodeURIComponent(
        `🛒 CLICKTV ORDER\n\n📦 ${name}\n💰 $${price}`
    );

    window.open(`https://wa.me/${WPP_NUMBER}?text=${msg}`, "_blank");
}

function checkoutWhatsApp() {

    if (cart.length === 0) return alert("Carrito vacío");

    let total = 0;

    const items = cart.map(i => {
        total += i.price;
        return `- ${i.name} ($${i.price})`;
    }).join("\n");

    const msg = encodeURIComponent(
        `🛒 CLICKTV ORDER\n\n${items}\n\nTOTAL: $${total}`
    );

    window.open(`https://wa.me/${WPP_NUMBER}?text=${msg}`, "_blank");
}

/* ================= MENU ================= */
function toggleMenu() {
    document.getElementById("nav-menu")?.classList.toggle("active");
}