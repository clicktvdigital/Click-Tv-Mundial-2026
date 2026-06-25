const WPP_NUMBER = "593939166222";
let cart = JSON.parse(localStorage.getItem('clicktv_cart')) || [];
let currentCurrency = 'USD';
let rates = { USD: 1, PEN: 3.80, COP: 4000, ARS: 1000, CLP: 950, MXN: 17 };
let discountPercent = 0;

function initApp() {
    updateCartUI();
    fetchWorldCupMatches();
    startOnlineCounter();
}

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('active');
}

function addToCart(name, priceUSD) {
    const existing = cart.find(i => i.name === name);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, priceUSD, qty: 1 });
    }
    saveCart();
    updateCartUI();
    toggleCart(); // Abre el carrito al añadir
}

function addDropdownToCart(baseName, selectId) {
    const select = document.getElementById(selectId);
    const opt = select.options[select.selectedIndex];
    addToCart(`${baseName} - ${opt.text.split('-')[0].trim()}`, parseFloat(opt.getAttribute('data-usd')));
}

function saveCart() {
    localStorage.setItem('clicktv_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const container = document.getElementById('cart-items');
    const countEl = document.getElementById('cart-count');
    const totalEl = document.getElementById('cart-total-local');
    
    if(!container) return;
    
    container.innerHTML = '';
    let totalUSD = 0;
    let qtyTotal = 0;

    cart.forEach((item, index) => {
        totalUSD += item.priceUSD * item.qty;
        qtyTotal += item.qty;
        container.innerHTML += `
            <div class="cart-item" style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid #222; padding-bottom:10px;">
                <div>
                    <h4 style="font-size:14px;">${item.name}</h4>
                    <small>$${(item.priceUSD * rates[currentCurrency]).toFixed(2)} ${currentCurrency}</small>
                </div>
                <button onclick="removeItem(${index})" style="background:none; border:none; color:red;">❌</button>
            </div>
        `;
    });

    const finalTotal = totalUSD * (1 - discountPercent);
    countEl.innerText = qtyTotal;
    totalEl.innerText = `$${(finalTotal * rates[currentCurrency]).toFixed(2)} ${currentCurrency}`;
}

function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function processCheckout() {
    if (cart.length === 0) return;
    let message = `🚀 *NUEVO PEDIDO CLICK TV*%0A%0A`;
    cart.forEach(i => message += `• ${i.name} (x${i.qty})%0A`);
    message += `%0A💰 *Total:* ${document.getElementById('cart-total-local').innerText}`;
    window.open(`https://wa.me/${WPP_NUMBER}?text=${message}`, '_blank');
}

// FIX: Fechas del Mundial corregidas con Backticks
async function fetchWorldCupMatches() {
    const container = document.getElementById('matches-container');
    if (!container) return;
    
    const events = [
        { home: "Ecuador", away: "Costa de Marfil", date: "2026-06-17", time: "18:00:00" },
        { home: "España", away: "Egipto", date: "2026-06-17", time: "21:00:00" }
    ];

    container.innerHTML = events.map(m => `
        <div class="match-card" style="background:#1a1a1a; padding:15px; border-radius:10px; margin-bottom:10px; text-align:center;">
            <b>${m.home} vs ${m.away}</b><br>
            <small>📅 ${m.date} - 🕒 ${m.time}</small>
        </div>
    `).join('');
}

function startOnlineCounter() {
    setInterval(() => {
        const count = 250 + Math.floor(Math.random() * 50);
        const el = document.getElementById('online-count');
        if(el) el.innerText = count;
    }, 5000);
}

document.addEventListener('DOMContentLoaded', initApp);