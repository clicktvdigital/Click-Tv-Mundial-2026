// Función para abrir soporte con mensaje estructurado
function openSupport() {
    const message = `Hola 👋

Necesito ayuda con uno de mis servicios.

Seleccione una opción:

1️⃣ IPTV
2️⃣ Netflix
3️⃣ Disney+
4️⃣ Paramount+
5️⃣ Directv Go
6️⃣ Flujo TV
7️⃣ Telelatino
8️⃣ Otro servicio`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/593939166222?text=${encodedMessage}`, '_blank');
}

// Asegurar que el carrito no tenga estilos extraños al renderizar
function updateCartUI() {
    // ... (Tu lógica de carrito actual)
    // Al final, asegurar que el contenedor de totales esté limpio
    const totals = document.getElementById('cart-totals-section');
    if(totals) {
        totals.style.outline = "none";
        totals.style.borderTop = "1px solid rgba(255,255,255,0.1)";
    }
}