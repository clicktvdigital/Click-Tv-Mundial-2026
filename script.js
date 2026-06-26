function filterCat(cat) {
    renderCatalogo(cat);
}

function renderCatalogo(cat = 'todos') {
    const grid = document.getElementById('catalogo-grid');
    grid.innerHTML = '';
    
    const filtered = cat === 'todos' ? PRODUCTOS : PRODUCTOS.filter(p => p.categoria === cat);
    
    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        // Determinar primer precio
        const precioBase = p.planes[0].precio;
        const displayPrecio = precioBase === 0 ? 'Consultar' : `$${precioBase} USD`;

        card.innerHTML = `
            ${p.etiqueta ? `<span class="badge-prod">${p.etiqueta}</span>` : ''}
            <div class="card-icon">${p.icono}</div>
            <h3>${p.nombre}</h3>
            <select id="select-${p.id}" class="plan-select" onchange="updatePrice('${p.id}')">
                ${p.planes.map((plan, idx) => `<option value="${idx}" data-price="${plan.precio}">${plan.tipo}</option>`).join('')}
            </select>
            <div class="price-tag" id="price-${p.id}">${displayPrecio}</div>
            <button onclick="buyNow('${p.id}')" class="btn-buy">🟢 Comprar Ahora</button>
            <button onclick="addToCart('${p.id}')" class="btn-cart-add">🛒 Añadir al Carrito</button>
        `;
        grid.appendChild(card);
    });
}

function updatePrice(id) {
    const select = document.getElementById(`select-${id}`);
    const price = select.options[select.selectedIndex].dataset.price;
    document.getElementById(`price-${id}`).innerText = price == 0 ? 'Consultar' : `$${price} USD`;
}

function buyNow(id) {
    const p = PRODUCTOS.find(prod => prod.id === id);
    const select = document.getElementById(`select-${id}`);
    const plan = p.planes[select.selectedIndex].tipo;
    const precio = p.planes[select.selectedIndex].precio;
    
    const text = `Hola, deseo comprar ${p.nombre} - ${plan} por $${precio} USD.`;
    window.open(`${CONFIG.whatsappLink}?text=${encodeURIComponent(text)}`, '_blank');
}