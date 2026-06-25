/**
 * CLICK TV - CORE ENGINE V2.0
 * Specialized for High Performance Dynamic E-commerce
 */

"use strict";

// --- CONFIGURACIÓN Y ESTADO GLOBAL ---
const WPP_NUMBER = "593939166222";
const DEBUG_MODE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
let cart = JSON.parse(localStorage.getItem('clicktv_cart')) || [];

/* ================= CLICK TV CATALOGO CENTRAL ================= */
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
        name: "Paramount+",
        plans: [{ label: "1 Mes", price: 5 }]
    },
    {
        name: "HBO Max",
        plans: [{ label: "1 Mes", price: 6 }]
    },
    {
        name: "Apple TV+",
        plans: [{ label: "1 Mes", price: 3 }]
    },
    {
        name: "IPTV Básico",
        plans: [
            { label: "1 Dispositivo", price: 3 },
            { label: "2 Dispositivos", price: 5 },
            { label: "3 Dispositivos", price: 7 }
        ]
    },
    {
        name: "IPTV Ultra",
        plans: [
            { label: "1 Dispositivo", price: 7 },
            { label: "2 Dispositivos", price: 14 }
        ]
    },
    {
        name: "IPTV GX+",
        plans: [{ label: "1 Mes", price: 5 }]
    },
    {
        name: "IPTV Stella",
        plans: [{ label: "1 Mes", price: 5 }]
    },
    {
        name: "Canva Pro",
        plans: [{ label: "1 Mes", price: 3 }]
    },
    {
        name: "Duolingo Premium",
        plans: [{ label: "1 Mes", price: 4 }]
    },
    {
        name: "Crunchyroll",
        plans: [{ label: "1 Mes", price: 3 }]
    },
    {
        name: "DAZN",
        plans: [{ label: "1 Mes", price: 5 }]
    },
    {
        name: "NBA League Pass",
        plans: [{ label: "1 Mes", price: 5 }]
    },
    {
        name: "FIFA Mundial Pack",
        plans: [{ label: "Pack Completo", price: 10 }]
    },
    {
        name: "Outlook Mayorista",
        plans: [{ label: "Consulta", price: 2.75 }]
    },
    {
        name: "Panel IPTV Revendedores",
        plans: [{ label: "Consulta", price: 20 }]
    }
];

// --- SISTEMA DE LOGGING ---
const logger = {
    log: (msg) => { if (DEBUG_MODE) console.log(`[ClickTV Log]: ${msg}`); },
    error: (msg, err) => console.error(`[ClickTV Error]: ${msg}`, err)
};

/* ================= RENDER AUTOMATIC CATALOG ================= */
/**
 * Renderiza el catálogo optimizando el DOM con string join
 * para evitar múltiples reflujos (reflows).
 */
function renderCatalog() {
    const container = document.getElementById("catalog-container");
    if (!container) {
        logger.error("Contenedor 'catalog-container' no encontrado.");
        return;
    }

    try {
        if (!PRODUCTS || PRODUCTS.length === 0) {
            container.innerHTML = '<p class="msg-error">No hay productos disponibles actualmente.</p>';
            return;
        }

        const catalogHTML = PRODUCTS.map(product => {
            const plansHTML = product.plans.map(plan => `
                <div class="plan-row">
                    <span class="plan-info">${plan.label} - <b>$${parseFloat(plan.price).toFixed(2)}</b></span>
                    <div class="plan-actions">
                        <button class="btn-cart-add" onclick="addToCart('${product.name} ${plan.label}', ${plan.price})">
                            🛒 Carrito
                        </button>
                        <button class="btn-buy-now" onclick="buyNow('${product.name} ${plan.label}', ${plan.price})">
                            💳 Comprar
                        </button>
                    </div>
                </div>
            `).join('');

            return `
                <div class="product-card">
                    <div class="card-header">
                        <h3>${product.name}</h3>
                    </div>
                    <div class="card-body">
                        ${plansHTML}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = catalogHTML;
        logger.log("Catálogo renderizado correctamente.");
    } catch (error) {
        logger.error("Fallo al renderizar el catálogo:", error);
        container.innerHTML = '<p class="msg-error">Ocurrió un error al cargar los productos.</p>';
    }
}

/* ================= CARRITO DE COMPRAS ================= */

/**
 * Agrega un producto al carrito con validación de NaN
 */
function addToCart(name, price) {
    if (!name || isNaN(parseFloat(price))) {
        logger.error("Datos de producto inválidos para el carrito.");
        return;
    }

    try {
        const productPrice = parseFloat(price);
        const existingItem = cart.find(item => item.name === name);

        if (existingItem) {
            existingItem.qty++;
        } else {
            cart.push({ name, price: productPrice, qty: 1 });
        }

        saveCart();
        updateCartUI();
        openCart();
        logger.log(`Añadido al carrito: ${name}`);
    } catch (error) {
        logger.error("Error al añadir al carrito:", error);
    }
}

/**
 * Actualiza la interfaz del carrito y persiste los datos
 */
function updateCartUI() {
    const box = document.getElementById("cart-items");
    const count = document.getElementById("cart-count");
    const totalEl = document.getElementById("cart-total-local");

    if (!box) return;

    try {
        let html = "";
        let total = 0;
        let qtyTotal = 0;

        if (cart.length === 0) {
            html = '<p class="cart-empty-msg">Tu carrito está vacío</p>';
        } else {
            cart.forEach((item, index) => {
                const subtotal = item.price * item.qty;
                total += subtotal;
                qtyTotal += item.qty;

                html += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <b>${item.name}</b>
                        <span>$${item.price.toFixed(2)} x ${item.qty}</span>
                    </div>
                    <button class="btn-remove" onclick="removeFromCart(${index})">✕</button>
                </div>`;
            });
        }

        box.innerHTML = html;
        if (count) count.innerText = qtyTotal;
        if (totalEl) totalEl.innerText = `$${total.toFixed(2)}`;
    } catch (error) {
        logger.error("Error al actualizar la UI del carrito:", error);
    }
}

/**
 * Elimina un item completo o decrementa cantidad
 */
function removeFromCart(index) {
    if (cart[index]) {
        if (cart[index].qty > 1) {
            cart[index].qty--;
        } else {
            cart.splice(index, 1);
        }
        saveCart();
        updateCartUI();
    }
}

function saveCart() {
    localStorage.setItem('clicktv_cart', JSON.stringify(cart));
}

/* ================= UTILIDADES UI ================= */

function openCart() {
    const sidebar = document.getElementById("cart-sidebar");
    if (sidebar) sidebar.classList.add("active");
}

function toggleCart() {
    const sidebar = document.getElementById("cart-sidebar");
    if (sidebar) sidebar.classList.toggle("active");
}

function toggleMenu() {
    const nav = document.getElementById("nav-links");
    if (nav) nav.classList.toggle("active");
}

/* ================= CALCULADORA DE AHORRO ================= */
/**
 * Calcula el ahorro de forma segura validando data-attributes
 */
function calculateSavings() {
    const select = document.getElementById("calc-service");
    if (!select) return;

    try {
        const option = select.options[select.selectedIndex];
        if (!option) return;

        const official = parseFloat(option.dataset.official) || 0;
        const click = parseFloat(option.dataset.click) || 0;

        const offEl = document.getElementById("calc-official");
        const clickEl = document.getElementById("calc-click");
        const saveEl = document.getElementById("calc-savings");

        if (official === 0) return;

        const savings = official - click;
        const percent = Math.round((savings / official) * 100);

        if (offEl) offEl.innerText = `$${official.toFixed(2)}`;
        if (clickEl) clickEl.innerText = `$${click.toFixed(2)}`;
        if (saveEl) saveEl.innerText = `$${savings.toFixed(2)} (${percent}%)`;
    } catch (error) {
        logger.error("Error en la calculadora de ahorro:", error);
    }
}

/* ================= WHATSAPP CHECKOUT ================= */

function buyNow(name, price) {
    if (!name || isNaN(price)) return;

    const msg = `🛒 *NUEVO PEDIDO CLICK TV*\n\n📦 *Producto:* ${name}\n💰 *Precio:* $${parseFloat(price).toFixed(2)} USD\n\n📌 _Deseo activar este servicio de inmediato._`;

    const url = `https://wa.me/${WPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
}

/**
 * Procesa el carrito completo para checkout vía WhatsApp
 */
function processCheckout() {
    if (cart.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    let total = 0;
    let msg = `🛒 *PEDIDO MÚLTIPLE - CLICK TV*\n\n`;

    cart.forEach(item => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        msg += `▪ ${item.name} (x${item.qty}) - $${subtotal.toFixed(2)}\n`;
    });

    msg += `\n💵 *TOTAL A PAGAR: $${total.toFixed(2)} USD*\n\n✅ _Confirmar pedido para recibir datos de pago._`;

    const url = `https://wa.me/${WPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
}

/* ================= SISTEMA DE TOASTS (ACTIVITY) ================= */
const CITIES = ["Quito", "Guayaquil", "Lima", "Bogotá", "Santiago", "CDMX", "Caracas"];
const ITEMS = ["Netflix", "Disney+", "IPTV Premium", "DAZN", "HBO Max", "Crunchyroll"];

function showToast() {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];

    const div = document.createElement("div");
    div.className = "toast";
    div.innerHTML = `🟢 <b>${city}</b>: Activó ${item}`;

    container.appendChild(div);

    setTimeout(() => {
        div.style.opacity = "0";
        setTimeout(() => div.remove(), 500);
    }, 4500);
}

/* ================= INICIALIZACIÓN UNIFICADA ================= */

function initializeClickTV() {
    logger.log("Iniciando Click TV Core...");

    // Renderizado de Catálogo
    renderCatalog();

    // Sincronización de Carrito (LocalStorage -> UI)
    updateCartUI();

    // Eventos Iniciales
    const calcService = document.getElementById("calc-service");
    if (calcService) {
        calculateSavings();
        calcService.addEventListener("change", calculateSavings);
    }

    // Asegurar Toast Container
    if (!document.getElementById("toast-container")) {
        const tc = document.createElement("div");
        tc.id = "toast-container";
        document.body.appendChild(tc);
    }

    // Actividades Live
    setInterval(showToast, 7000);
    
    logger.log("Click TV Core Listo.");
}

// Único Event Listener de Carga
document.addEventListener("DOMContentLoaded", initializeClickTV);

// Protección contra Errores Globales
window.addEventListener("error", (e) => {
    logger.error("Capturado error global:", e.message);
});

// Exportar funciones críticas al objeto Window para asegurar compatibilidad con onclick HTML
Object.assign(window, {
    addToCart,
    buyNow,
    toggleCart,
    toggleMenu,
    calculateSavings,
    processCheckout,
    removeFromCart
});