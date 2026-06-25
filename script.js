
/**
 * CLICK TV - CORE ENGINE V2.0
 * Specialized for High Performance Streaming Ecommerce
 */

"use strict";

// --- CONFIGURACIÓN GLOBAL ---
const CONFIG = {
    WPP_NUMBER: "593939166222",
    CURRENCY: "USD",
    IS_DEV: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    TOAST_INTERVAL: 6000,
    ANIMATION_SPEED: 300
};

let cart = [];

// --- UTILS & LOGGER ---
const logger = {
    log: (msg, data = "") => { if (CONFIG.IS_DEV) console.log(`[ClickTV LOG]: ${msg}`, data); },
    error: (msg, err = "") => console.error(`[ClickTV ERROR]: ${msg}`, err)
};

// --- CORE SYSTEM: CARRITO ---

/**
 * Agrega productos al carrito con validación de tipos
 */
function addToCart(name, price) {
    try {
        if (!name || isNaN(parseFloat(price))) {
            logger.error("Datos de producto inválidos en addToCart", { name, price });
            return;
        }
        
        const cleanPrice = parseFloat(price);
        let item = cart.find(i => i.name === name);
        
        if (item) {
            item.qty++;
        } else {
            cart.push({ name, price: cleanPrice, qty: 1 });
        }
        
        logger.log(`Producto añadido: ${name}`);
        syncUI();
        openCart();
    } catch (e) {
        logger.error("Fallo crítico en addToCart", e);
    }
}

/**
 * Sincroniza todos los elementos visuales del carrito
 */
function syncUI() {
    const box = document.getElementById("cart-items");
    const count = document.getElementById("cart-count");
    const totalEl = document.getElementById("cart-total-local"); // ID opcional para mostrar total
    
    if (!box) return;
    
    let html = "";
    let totalQty = 0;
    let totalPrice = 0;
    
    if (cart.length === 0) {
        box.innerHTML = `<div class="cart-empty-msg" style="text-align:center; padding:20px; color:#888;">Tu carrito está vacío</div>`;
        if (count) count.innerText = "0";
        return;
    }
    
    cart.forEach((item, index) => {
        totalQty += item.qty;
        totalPrice += (item.price * item.qty);
        
        html += `
        <div class="cart-item" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px;">
            <div class="cart-info">
                <div style="font-weight:bold; font-size:14px;">${item.name}</div>
                <div style="font-size:12px; color:#666;">$${item.price.toFixed(2)} x ${item.qty}</div>
            </div>
            <div class="cart-actions" style="display:flex; gap:5px;">
                <button onclick="removeFromCart(${index})" style="background:none; border:none; color:red; cursor:pointer;">✕</button>
            </div>
        </div>`;
    });
    
    box.innerHTML = html;
    if (count) count.innerText = totalQty;
    if (totalEl) totalEl.innerText = `$${totalPrice.toFixed(2)}`;
}

/**
 * Elimina un item o reduce su cantidad
 */
function removeFromCart(index) {
    if (cart[index]) {
        if (cart[index].qty > 1) {
            cart[index].qty--;
        } else {
            cart.splice(index, 1);
        }
        syncUI();
    }
}

// --- NAVIGATION & UI CONTROLS ---

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

// --- CHECKOUT INTEGRATION ---

/**
 * Compra directa (Botón Activar Ahora)
 */
function buyNow(name, price) {
    if (!name) return;
    const cleanPrice = parseFloat(price).toFixed(2);
    const msg = `🛒 *CLICK TV - PEDIDO DIRECTO*\n\n` +
        `🚀 *Producto:* ${name}\n` +
        `💰 *Precio:* $${cleanPrice} USD\n\n` +
        `✅ Deseo activar este servicio ahora.`;
    
    const url = `https://wa.me/${CONFIG.WPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
}

/**
 * Checkout del carrito completo
 */
function processCheckout() {
    try {
        if (cart.length === 0) {
            alert("El carrito está vacío. Agrega productos antes de finalizar.");
            return;
        }
        
        let total = 0;
        let msg = `🛒 *CLICK TV - CHECKOUT CARRITO*\n\n`;
        
        cart.forEach(item => {
            const subtotal = item.price * item.qty;
            total += subtotal;
            msg += `▪ ${item.name} (x${item.qty}) - $${subtotal.toFixed(2)}\n`;
        });
        
        msg += `\n💵 *TOTAL A PAGAR: $${total.toFixed(2)} USD*`;
        msg += `\n\n📌 *Instrucciones:* Envía este mensaje para recibir los datos de pago y activación.`;
        
        window.open(`https://wa.me/${CONFIG.WPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    } catch (e) {
        logger.error("Error en proceso de Checkout", e);
    }
}

// --- CALCULADORA DE AHORRO ---

function calculateSavings() {
    const select = document.getElementById("calc-service");
    if (!select) return;
    
    const option = select.options[select.selectedIndex];
    if (!option) return;
    
    const official = parseFloat(option.dataset.official) || 0;
    const click = parseFloat(option.dataset.click) || 0;
    
    if (official === 0) return;
    
    const savings = official - click;
    const percent = Math.round((savings / official) * 100);
    
    // Actualización segura de elementos
    const elements = {
        off: document.getElementById("calc-official"),
        click: document.getElementById("calc-click"),
        save: document.getElementById("calc-savings")
    };
    
    if (elements.off) elements.off.innerText = `$${official.toFixed(2)}`;
    if (elements.click) elements.click.innerText = `$${click.toFixed(2)}`;
    if (elements.save) {
        elements.save.innerHTML = `<span style="color:#2ecc71">$${savings.toFixed(2)}</span> <small>(${percent}% Ahorro)</small>`;
    }
}

// --- SISTEMA DE TOASTS (LIVE ACTIVITY) ---

const SOCIAL_DATA = {
    cities: ["Quito", "Guayaquil", "Lima", "Bogotá", "Santiago", "CDMX", "Cuenca", "Manta", "Medellín"],
    products: ["Netflix 4K", "Disney+ Premium", "IPTV Ultra HD", "DAZN Sports", "Paramount+", "Combo Mundial", "HBO Max"]
};

function showToast() {
    const container = document.getElementById("toast-container");
    if (!container) return;
    
    const city = SOCIAL_DATA.cities[Math.floor(Math.random() * SOCIAL_DATA.cities.length)];
    const product = SOCIAL_DATA.products[Math.floor(Math.random() * SOCIAL_DATA.products.length)];
    
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.style.cssText = `
        background: rgba(0,0,0,0.85);
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        margin-top: 10px;
        font-size: 13px;
        border-left: 4px solid #2ecc71;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        animation: slideIn 0.5s forwards;
    `;
    
    toast.innerHTML = `<i class="fas fa-check-circle" style="color:#2ecc71"></i> Cliente de <b>${city}</b> activó <b>${product}</b>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = "slideOut 0.5s forwards";
        setTimeout(() => toast.remove(), 500);
    }, 4500);
}

// --- INITIALIZATION ---

document.addEventListener("DOMContentLoaded", () => {
    logger.log("Sistema Inicializado");
    
    // 1. Inicializar Carrito (verificar persistencia si fuera necesario)
    syncUI();
    
    // 2. Inicializar Calculadora
    if (document.getElementById("calc-service")) {
        calculateSavings();
    }
    
    // 3. Setup de Toasts
    if (!document.getElementById("toast-container")) {
        const tc = document.createElement("div");
        tc.id = "toast-container";
        tc.style.cssText = "position:fixed; bottom:20px; left:20px; z-index:100000;";
        document.body.appendChild(tc);
    }
    
    // Ejecución de Toasts
    setInterval(showToast, CONFIG.TOAST_INTERVAL);
    
    // 4. Debugging visual de carga
    logger.log("DOM Ready y Componentes montados");
});

// --- SEGURIDAD GLOBAL ---

window.addEventListener("error", (e) => {
    logger.error("Excepción detectada:", e.message);
});

// Exponer funciones necesarias al objeto Window para compatibilidad con atributos onclick de HTML
Object.assign(window, {
    addToCart,
    removeFromCart,
    buyNow,
    toggleCart,
    toggleMenu,
    calculateSavings,
    processCheckout
});