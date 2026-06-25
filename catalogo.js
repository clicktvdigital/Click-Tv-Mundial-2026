
/**
 * CLICK TV - CORE CLEAN FINAL VERSION
 * Stable Ecommerce System (No Errors / Production Ready)
 */

"use strict";

/* ================= CONFIG ================= */
const WPP_NUMBER = "593939166222";

let cart = JSON.parse(localStorage.getItem("clicktv_cart")) || [];

/* ================= PRODUCTOS ================= */
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

/* ================= RENDER CATALOGO ================= */
function renderCatalog() {
    const container = document.getElementById("catalog-container");
    if (!container) return;

    let html = "";

    PRODUCTS.forEach(product => {

        let plansHTML = "";

        product.plans.forEach(plan => {
            plansHTML += `
                <div class="plan">
                    <strong>${plan.label}</strong> - $${plan.price}
                    <div>
                        <button onclick="addToCart('${product.name} ${plan.label}', ${plan.price})">
                            🛒 Carrito
                        </button>

                        <button onclick="buyNow('${product.name} ${plan.label}', ${plan.price})">
                            💳 Comprar
                        </button>
                    </div>
                </div>
            `;
        });

        html += `
            <div class="card">
                <h3>${product.name}</h3>
                ${plansHTML}
            </div>
        `;
    });

    container.innerHTML = html;
}

/* ================= CARRITO ================= */
function addToCart(name, price) {

    if (!name || isNaN(price)) return;

    let item = cart.find(p => p.name === name);

    if (item) {
        item.qty++;
    } else {
        cart.push({ name, price, qty: 1 });
    }

    saveCart();
    updateCartUI();
    openCart();
}

function updateCartUI() {

    const box = document.getElementById("cart-items");
    const count = document.getElementById("cart-count");
    const totalEl = document.getElementById("cart-total-local");

    if (!box) return;

    let html = "";
    let total = 0;
    let qty = 0;

    cart.forEach((item, i) => {

        total += item.price * item.qty;
        qty += item.qty;

        html += `
            <div class="cart-item">
                <span>${item.name} x${item.qty}</span>
                <b>$${item.price}</b>
                <button onclick="removeFromCart(${i})">X</button>
            </div>
        `;
    });

    box.innerHTML = html || "<p>Carrito vacío</p>";

    if (count) count.innerText = qty;
    if (totalEl) totalEl.innerText = "$" + total.toFixed(2);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem("clicktv_cart", JSON.stringify(cart));
}

/* ================= WHATSAPP ================= */
function buyNow(name, price) {

    const msg = `🛒 CLICK TV\n\n📦 ${name}\n💰 $${price}`;

    window.open(
        `https://wa.me/${WPP_NUMBER}?text=${encodeURIComponent(msg)}`,
        "_blank"
    );
}

/* ================= CALCULADORA ================= */
function calculateSavings() {

    const select = document.getElementById("calc-service");
    if (!select) return;

    const opt = select.options[select.selectedIndex];

    const official = parseFloat(opt.dataset.official || 0);
    const click = parseFloat(opt.dataset.click || 0);

    const save = official - click;
    const percent = official ? Math.round((save / official) * 100) : 0;

    const offEl = document.getElementById("calc-official");
    const clickEl = document.getElementById("calc-click");
    const saveEl = document.getElementById("calc-savings");

    if (offEl) offEl.innerText = "$" + official;
    if (clickEl) clickEl.innerText = "$" + click;
    if (saveEl) saveEl.innerText = `$${save} (${percent}%)`;
}

/* ================= UI ================= */
function openCart() {
    const c = document.getElementById("cart-sidebar");
    if (c) c.classList.add("active");
}

function toggleCart() {
    const c = document.getElementById("cart-sidebar");
    if (c) c.classList.toggle("active");
}

function toggleMenu() {
    const n = document.getElementById("nav-links");
    if (n) n.classList.toggle("active");
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {

    renderCatalog();
    updateCartUI();

    const calc = document.getElementById("calc-service");
    if (calc) {
        calculateSavings();
        calc.addEventListener("change", calculateSavings);
    }

    console.log("CLICK TV JS CLEAN LOADED");
});