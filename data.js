let cart = JSON.parse(localStorage.getItem('click_cart')) || [];
let activeDiscount = 0;

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    renderCatalogo();
    updateCartCounter();
    inicializarBotonesFlotantes();
    detectCountry();
    fetchMundial();
    renderActivity();
    
    // Configurar enlaces estáticos
    document.getElementById('fifa-link').href = CONFIG.fifaCalendarioUrl;
}

function inicializarBotonesFlotantes() {
    document.getElementById("btn-whatsapp").href = CONFIG.whatsappLink;
    document.getElementById("btn-whatsapp-grupo").href = CONFIG.whatsappGrupo;
    document.getElementById("btn-telegram").href = CONFIG.telegramLink;
    
    const msgSoporte = encodeURIComponent("Hola, necesito soporte técnico con mi servicio Click TV.");
    document.getElementById("btn-soporte").href = `${CONFIG.whatsappLink}?text=${msgSoporte}`;

    window.onscroll = function() {
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            document.getElementById("btn-scroll-top").style.display = "flex";
        } else {
            document.getElementById("btn-scroll-top").style.display = "none";
        }
    };
    
    document.getElementById("btn-scroll-top").onclick = () => window.scrollTo({top: 0, behavior: 'smooth'});
}

/* --- LÓGICA DE CARRITO --- */
function addToCart(id) {
    const p = PRODUCTOS.find(prod => prod.id === id);
    const select = document.getElementById(`select-${id}`);
    const planIdx = select.selectedIndex;
    const plan = p.planes[planIdx];

    if(plan.precio === 0) {
        buyNow(id);
        return;
    }

    cart.push({ ...p, planSelected: plan.tipo, price: plan.precio, uniqueId: Date.now() });
    saveCart();
    toggleCart(true);
    renderCart();
    showToast(`Agregado: ${p.nombre}`);
}

function renderCart() {
    const container = document.getElementById('cart-items');
    container.innerHTML = '';
    
    let subtotal = 0;
    cart.forEach((item, index) => {
        subtotal += item.price;
        container.innerHTML += `
            <div class="cart-item">
                <span>${item.nombre} (${item.planSelected})</span>
                <span>$${item.price} <i class="fas fa-trash" onclick="removeFromCart(${index})"></i></span>
            </div>
        `;
    });

    const desc = subtotal * (activeDiscount / 100);
    const iva = (subtotal - desc) * CONFIG.ivaPorcentaje;
    const totalConIva = subtotal - desc + iva;
    
    // Total PayPal con fórmula solicitada
    const totalPaypal = (totalConIva + CONFIG.paypalComisionFija) / (1 - CONFIG.paypalComisionPorcentaje);

    document.getElementById('cart-summary').innerHTML = `
        <p>Subtotal: $${subtotal.toFixed(2)}</p>
        <p>Descuento (${activeDiscount}%): -$${desc.toFixed(2)}</p>
        <p>IVA (${CONFIG.ivaPorcentaje * 100}%): $${iva.toFixed(2)}</p>
        <h3 class="total-green">Total: $${totalConIva.toFixed(2)} USD</h3>
        <small>Total con comisión PayPal: $${totalPaypal.toFixed(2)} USD</small>
    `;

    renderPaypal(totalPaypal.toFixed(2));
}

function renderPaypal(amount) {
    document.getElementById('paypal-button-container').innerHTML = '';
    paypal.Buttons({
        createOrder: (data, actions) => {
            return actions.order.create({
                purchase_units: [{ amount: { value: amount } }]
            });
        },
        onApprove: (data, actions) => {
            return actions.order.capture().then(details => {
                showToast("¡Pago exitoso, " + details.payer.name.given_name + "!");
                cart = [];
                saveCart();
                renderCart();
                window.open(`${CONFIG.whatsappLink}?text=${encodeURIComponent("Pago PayPal confirmado ID: " + data.orderID)}`, '_blank');
            });
        }
    }).render('#paypal-button-container');
}

/* --- MUNDIAL API --- */
async function fetchMundial() {
    const container = document.getElementById('matches-container');
    try {
        const response = await fetch(CONFIG.footballDataApiUrl, {
            headers: { 'X-Auth-Token': CONFIG.footballDataApiToken }
        });
        const data = await response.json();
        if(!data.matches || data.matches.length === 0) throw new Error();
        
        container.innerHTML = data.matches.slice(0, 4).map(m => `
            <div class="match-card glass">
                <p>${m.homeTeam.name} vs ${m.awayTeam.name}</p>
                <small>${new Date(m.utcDate).toLocaleString()}</small>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = '<p class="empty-msg">⚽ Información próximamente disponible</p>';
    }
}

/* --- UTILIDADES --- */
function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast-msg glass';
    t.innerText = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function saveCart() {
    localStorage.setItem('click_cart', JSON.stringify(cart));
    updateCartCounter();
}

function updateCartCounter() {
    document.getElementById('cart-count').innerText = cart.length;
}

function toggleCart(force) {
    const side = document.getElementById('cart-sidebar');
    if(force) side.classList.add('active');
    else side.classList.toggle('active');
    if(side.classList.contains('active')) renderCart();
}

function copyText(txt) {
    navigator.clipboard.writeText(txt);
    showToast("Copiado al portapapeles");
}