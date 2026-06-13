/* START OF FILE script.js */

// Configuración Global
const WPP_NUMBER = "593939166222";
let cart = [];
let currentCurrency = 'USD';
let rates = { USD: 1, PEN: 3.75, COP: 3900, ARS: 850, CLP: 940, MXN: 17.5 };

// Actividades recientes mejoradas
const activityLogs = [
    "✅ Cliente de CDMX activó IPTV Ultra 4K",
    "✅ Nueva suscripción Disney+ Premium en Lima",
    "✅ Cliente de Medellín renovó Netflix Perfil Extra",
    "✅ Activación inmediata de DAZN en Santiago",
    "✅ +1 cliente satisfecho con Paramount+ en Quito"
];

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    startActivityToasts();
    simulateUsers();
});

async function initApp() {
    // Detectar País (puedes usar tu API actual de ipapi.co)
    detectCountry();
    updateOnlineCount();
}

// Función de Simulación de Usuarios Online (Psicología de Ventas)
function simulateUsers() {
    const el = document.getElementById('online-count');
    setInterval(() => {
        const base = 200;
        const rand = Math.floor(Math.random() * 80);
        el.innerText = base + rand;
    }, 5000);
}

// Toasts de Venta (Generan confianza)
function startActivityToasts() {
    setInterval(() => {
        const msg = activityLogs[Math.floor(Math.random() * activityLogs.length)];
        showToast(msg);
    }, 15000);
}

function showToast(text) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast glass-dark active';
    toast.innerHTML = `<i class="fas fa-shopping-cart" style="color:var(--gold)"></i> ${text}`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// Lógica de Carrito con Resumen Visual
function updateCartUI() {
    const cartItems = document.getElementById('cart-items');
    // Implementar renderizado con animaciones
    // Calcular subtotales y aplicar descuentos de cupones
}

function processCheckout() {
    if (cart.length === 0) return;
    
    let message = `🚀 *PEDIDO CLICK TV MUNDIAL*%0A`;
    message += `----------------------------%0A`;
    cart.forEach(item => {
        message += `• ${item.qty}x ${item.name} (%0A`;
    });
    
    // Generar enlace de WhatsApp con formato profesional
    const url = `https://wa.me/${WPP_NUMBER}?text=${message}`;
    window.open(url, '_blank');
}

// Manejo de Filtros de Catálogo
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const filter = e.target.dataset.filter;
        // Lógica de filtrado visual de las cards
    });
});