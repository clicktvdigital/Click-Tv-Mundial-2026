/* ================= CLICK TV CATALOGO CENTRAL ================= */

const PRODUCTS = [
    
    /* ================= STREAMING ================= */
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
        plans: [
            { label: "1 Mes", price: 5 }
        ]
    },
    {
        name: "HBO Max",
        plans: [
            { label: "1 Mes", price: 6 }
        ]
    },
    {
        name: "Apple TV+",
        plans: [
            { label: "1 Mes", price: 3 }
        ]
    },
    
    /* ================= IPTV ================= */
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
        plans: [
            { label: "1 Mes", price: 5 }
        ]
    },
    {
        name: "IPTV Stella",
        plans: [
            { label: "1 Mes", price: 5 }
        ]
    },
    
    /* ================= APPS ================= */
    {
        name: "Canva Pro",
        plans: [
            { label: "1 Mes", price: 3 }
        ]
    },
    {
        name: "Duolingo Premium",
        plans: [
            { label: "1 Mes", price: 4 }
        ]
    },
    {
        name: "Crunchyroll",
        plans: [
            { label: "1 Mes", price: 3 }
        ]
    },
    
    /* ================= DEPORTES ================= */
    {
        name: "DAZN",
        plans: [
            { label: "1 Mes", price: 5 }
        ]
    },
    {
        name: "NBA League Pass",
        plans: [
            { label: "1 Mes", price: 5 }
        ]
    },
    {
        name: "FIFA Mundial Pack",
        plans: [
            { label: "Pack Completo", price: 10 }
        ]
    },
    
    /* ================= MAYORISTAS ================= */
    {
        name: "Outlook Mayorista",
        plans: [
            { label: "Consulta", price: 2.75 }
        ]
    },
    {
        name: "Panel IPTV Revendedores",
        plans: [
            { label: "Consulta", price: 20 }
        ]
    }
    
];

/* ================= RENDER AUTOMATIC CATALOG ================= */
function renderCatalog(){

    const container = document.getElementById("catalog-container");
    if(!container) return;

    let html = "";

    PRODUCTS.forEach(product => {

        html += `
        <div class="product-card">
            <h3>${product.name}</h3>
        `;

        product.plans.forEach(plan => {

            html += `
            <div class="plan-row">
                <span>${plan.label} - $${plan.price}</span>

                <button onclick="addToCart('${product.name} ${plan.label}', ${plan.price})">
                    🛒 Carrito
                </button>

                <button onclick="buyNow('${product.name} ${plan.label}', ${plan.price})">
                    💳 Comprar
                </button>
            </div>
            `;
        });

        html += `</div>`;
    });

    container.innerHTML = html;
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
    renderCatalog();
});

/* ================= SAFE BUY NOW ================= */
function buyNow(name, price){

    if(!name || isNaN(price)) return;

    const msg = `
🛒 CLICK TV ORDER

📦 Producto: ${name}
💰 Precio: $${price} USD
    `;

    window.open(
        `https://wa.me/${WPP_NUMBER}?text=${encodeURIComponent(msg)}`,
        "_blank"
    );
}

/* ================= SAFE CART UPDATE ================= */
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

/* ================= CART UPDATE ================= */
function updateCart(){

    const box = document.getElementById("cart-items");
    const count = document.getElementById("cart-count");

    if(!box) return;

    let html = "";
    let total = 0;
    let qty = 0;

    cart.forEach(i=>{
        qty += i.qty;
        total += i.price * i.qty;

        html += `
        <div class="cart-item">
            <b>${i.name}</b>
            <span>x${i.qty}</span>
        </div>`;
    });

    box.innerHTML = html;

    if(count) count.innerText = qty;

    const totalEl = document.getElementById("cart-total-local");
    if(totalEl) totalEl.innerText = `$${total.toFixed(2)}`;
}

/* ================= CART OPEN ================= */
function openCart(){
    document.getElementById("cart-sidebar")?.classList.add("active");
}

/* ================= TOGGLE CART ================= */
function toggleCart(){
    document.getElementById("cart-sidebar")?.classList.toggle("active");
}

/* ================= MENU ================= */
function toggleMenu(){
    document.getElementById("nav-links")?.classList.toggle("active");
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {

    // inicializar catálogo dinámico
    if(typeof renderCatalog === "function"){
        renderCatalog();
    }

    // inicializar carrito
    updateCart();
});
