
let cart = [];
let WPP_NUMBER = "593939166222";

/* ================= ADD TO CART ================= */
function addToCart(name, price){

    if(!name || isNaN(price)) return;

    let item = cart.find(i => i.name === name);

    if(item){
        item.qty++;
    } else {
        cart.push({name, price, qty:1});
    }

    updateCart();
    openCart();
}

/* ================= UPDATE CART ================= */
function updateCart(){

    const box = document.getElementById("cart-items");
    const count = document.getElementById("cart-count");

    if(!box) return;

    let html = "";
    let totalQty = 0;

    cart.forEach(i=>{
        totalQty += i.qty;

        html += `
        <div class="cart-item">
            <b>${i.name}</b>
            <span>x${i.qty}</span>
        </div>`;
    });

    box.innerHTML = html;

    if(count) count.innerText = totalQty;
}

/* ================= OPEN CART ================= */
function openCart(){
    document.getElementById("cart-sidebar")?.classList.add("active");
}

/* ================= TOGGLE CART ================= */
function toggleCart(){
    document.getElementById("cart-sidebar")?.classList.toggle("active");
}

function buyNow(name, price){

    const msg = `
🛒 CLICK TV ORDER

📦 Producto: ${name}
💰 Precio: $${price} USD

✔ Pedido automático
`;

    const url = `https://wa.me/${WPP_NUMBER}?text=${encodeURIComponent(msg)}`;

    window.open(url, "_blank");
}

/* ================= CHECKOUT CART ================= */
function processCheckout(){

    if(cart.length === 0){
        alert("El carrito está vacío");
        return;
    }

    let total = 0;
    let msg = "🛒 CLICK TV CHECKOUT\n\n";

    cart.forEach(i=>{
        total += i.price * i.qty;
        msg += `📦 ${i.name} x${i.qty} - $${i.price}\n`;
    });

    msg += `\n💰 TOTAL: $${total} USD`;

    const url = `https://wa.me/${WPP_NUMBER}?text=${encodeURIComponent(msg)}`;

    window.open(url, "_blank");
}

/* ================= CALCULADORA DE AHORRO ================= */
function calculateSavings(){

    const select = document.getElementById("calc-service");
    if(!select) return;

    const option = select.options[select.selectedIndex];
    if(!option) return;

    const official = Number(option.dataset.official);
    const click = Number(option.dataset.click);

    if(isNaN(official) || isNaN(click)) return;

    const savings = official - click;
    const percent = Math.round((savings / official) * 100);

    const offEl = document.getElementById("calc-official");
    const clickEl = document.getElementById("calc-click");
    const saveEl = document.getElementById("calc-savings");

    if(offEl) offEl.innerText = `$${official.toFixed(2)}`;
    if(clickEl) clickEl.innerText = `$${click.toFixed(2)}`;
    if(saveEl) saveEl.innerText = `$${savings.toFixed(2)} (${percent}%)`;
}

/* AUTO INICIO */
document.addEventListener("DOMContentLoaded", ()=>{
    calculateSavings();
});

const cities = [
    "Quito - Ecuador",
    "Guayaquil - Ecuador",
    "Lima - Perú",
    "Bogotá - Colombia",
    "Santiago - Chile",
    "México DF - México",
    "Caracas - Venezuela"
];

const products = [
    "Netflix",
    "Disney+",
    "IPTV Premium",
    "DAZN",
    "Paramount+",
    "Crunchyroll",
    "HBO Max",
    "Prime Video"
];

/* ================= RANDOM HELPER ================= */
function random(arr){
    return arr[Math.floor(Math.random() * arr.length)];
}

/* ================= TOAST SYSTEM ================= */
function showToast(){

    const container = document.getElementById("toast-container");
    if(!container) return;

    const city = random(cities);
    const product = random(products);

    const msg = `🟢 Cliente de ${city} compró ${product}`;

    const div = document.createElement("div");
    div.className = "toast";
    div.innerText = msg;

    container.appendChild(div);

    setTimeout(()=>{
        div.remove();
    }, 4000);
}

/* ================= AUTO RUN ================= */
setInterval(showToast, 5000);

/* ================= MENU MOBILE ================= */
function toggleMenu(){
    document.getElementById("nav-links")?.classList.toggle("active");
}

/* ================= INIT SYSTEM ================= */
document.addEventListener("DOMContentLoaded", () => {

    // inicializar carrito
    updateCart();

    // inicializar calculadora si existe
    if(document.getElementById("calc-service")){
        calculateSavings();
    }

    // asegurar toast container existe
    if(!document.getElementById("toast-container")){
        const div = document.createElement("div");
        div.id = "toast-container";
        document.body.appendChild(div);
    }

});

/* ================= SAFE GUARDS (EVITAR CRASH) ================= */
window.addEventListener("error", function(e){
    console.log("JS Error Capturado:", e.message);
});

/* ================= EXPORT GLOBALS (SEGURIDAD UI) ================= */
window.addToCart = addToCart;
window.buyNow = buyNow;
window.toggleCart = toggleCart;
window.toggleMenu = toggleMenu;
window.calculateSavings = calculateSavings;
window.processCheckout = processCheckout;