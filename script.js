"use strict";

const WPP_PHONE = "593939166222";
let cart = [];
let discount = 0;
let exchangeRate = 1; // Base USD

// PAYPAL CONFIG
const PAYPAL_FEES = { percent: 0.054, fixed: 0.30 };

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    detectCountry();
    renderCatalog();
    updateOnlineUsers();
});

function initApp() {
    // Escuchadores de eventos
    document.getElementById('currency-selector').addEventListener('change', (e) => {
        changeCurrency(e.target.value);
    });
}

async function detectCountry() {
    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        document.getElementById('detected-country').innerText = data.country_name;
        // Auto-select currency based on country could go here
    } catch (e) {
        console.log("Error detectando país");
    }
}

function renderCatalog() {
    const wrapper = document.getElementById('catalog-wrapper');
    // Lógica para agrupar por categorías y renderizar
    // ... (Loop PRODUCT_DATA)
}

// LÓGICA DEL CARRITO
function addToCart(productId, planIndex) {
    const product = PRODUCT_DATA.find(p => p.id === productId);
    const item = {
        ...product,
        selectedPlan: product.options[planIndex],
        finalPrice: calculatePrice(product.price, planIndex)
    };
    cart.push(item);
    updateCartUI();
    showToast(`🟢 ${product.name} añadido al carrito`);
}

function updateCartUI() {
    const container = document.getElementById('cart-items-container');
    const count = document.getElementById('cart-count');
    
    count.innerText = cart.length;
    // Renderizado de items...
    
    calculateTotals();
}

function calculateTotals() {
    let subtotal = cart.reduce((acc, item) => acc + item.finalPrice, 0);
    let totalDiscount = subtotal * discount;
    let final = subtotal - totalDiscount;

    document.getElementById('cart-subtotal').innerText = `$${subtotal.toFixed(2)} USD`;
    document.getElementById('cart-total').innerText = `$${final.toFixed(2)} USD`;

    renderPayPalButton(final);
}

// INTEGRACIÓN PAYPAL CALCULADA
function renderPayPalButton(amount) {
    const container = document.getElementById('paypal-button-container');
    container.innerHTML = ''; // Limpiar previo

    const iva = amount * 0.15;
    const baseWithIVA = amount + iva;
    const totalPayPal = (baseWithIVA + PAYPAL_FEES.fixed) / (1 - PAYPAL_FEES.percent);

    paypal.Buttons({
        createOrder: (data, actions) => {
            return actions.order.create({
                purchase_units: [{
                    amount: { value: totalPayPal.toFixed(2) },
                    description: "Compra Click TV Mundial 2026"
                }]
            });
        },
        onApprove: (data, actions) => {
            return actions.order.capture().then(details => {
                alert('Pago realizado con éxito por ' + details.payer.name.given_name);
                cart = [];
                updateCartUI();
                // Redirigir o enviar WPP
            });
        }
    }).render('#paypal-button-container');
}

// WHATSAPP CHECKOUT
function sendWppCart() {
    let msg = "Hola Click TV, deseo adquirir:\n";
    cart.forEach(item => {
        msg += `• ${item.name} (${item.selectedPlan})\n`;
    });
    msg += `\nTotal: ${document.getElementById('cart-total').innerText}`;
    window.open(`https://wa.me/${WPP_PHONE}?text=${encodeURIComponent(msg)}`);
}

// FOOTBALL API
async function fetchMatches() {
    const token = '467c885c07fa49baa40ac78cf636f8b0';
    try {
        const res = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
            headers: { 'X-Auth-Token': token }
        });
        const data = await res.json();
        // Lógica de renderizado de partidos...
    } catch (e) {
        document.getElementById('matches-grid').innerHTML = `
            <div class="api-fallback">
                <p>⚽ Información próximamente disponible</p>
                <a href="https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures" class="btn-fifa" target="_blank">Ver Calendario Oficial FIFA</a>
            </div>`;
    }
}