

/**
 * CLICKTV ENGINE 4.0 PRO FINAL
 * Stable Ecommerce System - Production Ready
 * Optimized, Safe, Scalable
 */

"use strict";

/* ================= CONFIG ================= */
const WPP_NUMBER = "593939166222";

let cart = JSON.parse(localStorage.getItem("clicktv_cart")) || [];

/* ================= PRODUCTS ================= */
const PRODUCTS = [
    {
        name: "Netflix",
        plans: [
            { label: "1 Mes", price: 5 },
            { label: "3 Meses", price: 12 },
            { label: "6 Meses", price: 20 }
        ]
    },
    {
        name: "Disney+",
        plans: [
            { label: "1 Mes", price: 5 },
            { label: "3 Meses", price: 10 }
        ]
    },
    {
        name: "Prime Video",
        plans: [
            { label: "1 Mes", price: 4 },
            { label: "3 Meses", price: 8 }
        ]
    },
    {
        name: "IPTV Básico",
        plans: [
            { label: "1 Dispositivo", price: 3 },
            { label: "2 Dispositivos", price: 5 }
        ]
    }
];

/* ================= UTILS SAFE ================= */
const $ = (id) => document.getElementById(id);

const safeNumber = (val, fallback = 0) =>
    isNaN(parseFloat(val)) ? fallback : parseFloat(val);

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
    renderCatalog();
    updateCartUI();
    initCalculator();

    console.log("CLICKTV ENGINE 4.0 READY 🚀");
}

/* ================= CATALOG ================= */
function renderCatalog() {

    const container = $("catalog-container");
    if (!container) return;

    container.innerHTML = PRODUCTS.map(product => {

        const plansHTML = product.plans.map(plan => `
            <div class="plan">
                <strong>${plan.label}</strong> - $${plan.price}

                <div class="plan-actions">
                    <button onclick="addToCart('${product.name} ${plan.label}', ${plan.price})">
                        🛒 Carrito
                    </button>

                    <button onclick="buyNow('${product.name} ${plan.label}', ${plan.price})">
                        💳 Comprar
                    </button>
                </div>
            </div>
        `).join("");

        return `
            <div class="card">
                <h3>${product.name}</h3>
                ${plansHTML}
            </div>
        `;
    }).join("");
}

/* ================= CART ENGINE ================= */
function addToCart(name, price) {

    if (!name || !price) return;

    const item = cart.find(p => p.name === name);

    if (item) {
        item.qty += 1;
    } else {
        cart.push({
            name,
            price: safeNumber(price),
            qty: 1
        });
    }

    saveCart();
    updateCartUI();
    openCart();
}

function updateCartUI() {

    const box = $("cart-items");
    const count = $("cart-count");
    const totalEl = $("cart-total-local") || $("cart-total");

    if (!box) return;

    let total = 0;
    let qty = 0;

    box.innerHTML = cart.length
        ? cart.map((item, i) => {

            total += item.price * item.qty;
            qty += item.qty;

            return `
                <div class="cart-item">
                    <div>
                        <b>${item.name}</b><br>
                        <small>$${item.price} x ${item.qty}</small>
                    </div>

                    <button onclick="removeFromCart(${i})">✕</button>
                </div>
            `;
        }).join("")
        : "<p>🛒 Carrito vacío</p>";

    if (count) count.innerText = qty;
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

/* ================= CART UI ================= */
function openCart() {
    $("cart-sidebar")?.classList.add("active");
}

function toggleCart() {
    $("cart-sidebar")?.classList.toggle("active");
}

function toggleMenu() {
    $("nav-links")?.classList.toggle("active");
}

/* ================= WHATSAPP ================= */
function buyNow(name, price) {

    const msg = encodeURIComponent(
        `🛒 CLICKTV ORDER\n\n📦 ${name}\n💰 $${price}`
    );

    window.open(
        `https://wa.me/${WPP_NUMBER}?text=${msg}`,
        "_blank"
    );
}

/* ================= CALCULATOR ================= */
function initCalculator() {

    const select = $("calc-service");
    if (!select) return;

    calculateSavings();

    select.addEventListener("change", calculateSavings);
}

function calculateSavings() {

    const select = $("calc-service");
    if (!select) return;

    const opt = select.options[select.selectedIndex];

    const official = safeNumber(opt?.dataset?.official);
    const click = safeNumber(opt?.dataset?.click || opt?.value);

    if (!official) return;

    const saved = official - click;
    const percent = Math.round((saved / official) * 100);

    setText("calc-official", `$${official.toFixed(2)}`);
    setText("calc-click", `$${click.toFixed(2)}`);
    setText("calc-savings", `$${saved.toFixed(2)} (${percent}%)`);
}

function setText(id, value) {
    const el = $(id);
    if (el) el.innerText = value;
}

/* ================= ERROR SAFE ================= */
window.addEventListener("error", (e) => {
    console.error("CLICKTV ERROR:", e.message);
});