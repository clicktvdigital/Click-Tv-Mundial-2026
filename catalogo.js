/* Catálogo multicanal Click TV Streaming */
(function () {
  const escapar = (texto = "") => String(texto).replace(/[&<>'"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  let categoriaActual = "todos";

  window.seleccionarCategoriaCatalogo = function (categoria = "todos") {
    categoriaActual = categoria;
    document.querySelectorAll("[data-categoria]").forEach((btn) => btn.classList.toggle("activo", btn.dataset.categoria === categoria));
    renderCatalogo();
  };

  window.renderCatalogo = function () {
    const grid = document.getElementById("catalogo-grid");
    if (!grid || typeof PRODUCTOS === "undefined") return;
    const productos = categoriaActual === "todos" ? PRODUCTOS : PRODUCTOS.filter((p) => p.categoria === categoriaActual);
    grid.innerHTML = productos.map(crearProducto).join("");
  };

  function crearProducto(producto) {
    const planes = (producto.planes || []).map((plan, i) => {
      const precio = plan.consultar ? "Consultar" : (typeof formatearPrecio === "function" ? formatearPrecio(plan.precio) : `$${Number(plan.precio).toFixed(2)} USD`);
      return `<div class="product-plan">
        <div class="product-plan__info"><strong>${escapar(plan.tipo)}</strong><span>${precio}</span></div>
        <div class="product-plan__actions">
          ${plan.consultar ? "" : `<button class="btn btn--primary btn--small" type="button" onclick="agregarPlanAlCarrito('${producto.id}',${i})">🛒 Añadir al carrito</button>`}
          <button class="btn btn--outline btn--small" type="button" onclick="contactarPlanWhatsApp('${producto.id}',${i},'compra')">🟢 Comprar por WhatsApp</button>
          <button class="btn btn--outline btn--small" type="button" onclick="contactarPlanTelegram('${producto.id}',${i},'compra')">✈️ Comprar por Telegram</button>
          <button class="btn btn--outline btn--small" type="button" onclick="contactarPlanSignal('${producto.id}',${i},'compra')">🔵 Comprar por Signal</button>
          <button class="btn btn--ghost btn--small" type="button" onclick="marcarPlanRenovacion('${producto.id}',${i})">🔄 Renovar</button>
        </div>
      </div>`;
    }).join("");
    return `<article class="product-card reveal" data-producto="${escapar(producto.id)}">
      <div class="product-card__head"><span class="product-card__icon">${producto.icono || "📺"}</span><div><h3>${escapar(producto.nombre)}</h3><div class="product-tags">${(producto.etiquetas||[]).map(e=>`<span>${escapar(e)}</span>`).join("")}</div></div></div>
      <p>${escapar(producto.descripcion || "")}</p>
      <div class="product-plans">${planes}</div>
    </article>`;
  }

  function obtener(productoId, planIndex) {
    const producto = PRODUCTOS.find((p) => p.id === productoId);
    const plan = producto?.planes?.[Number(planIndex)];
    return producto && plan ? {producto, plan} : null;
  }
  function mensaje(productoId, planIndex, operacion) {
    const data = obtener(productoId, planIndex); if (!data) return "Hola, deseo información sobre sus servicios.";
    const tipo = operacion === "renovacion" ? "renovar" : "comprar por primera vez";
    return `Hola Click TV Streaming. Deseo ${tipo}:

Servicio: ${data.producto.nombre}
Plan: ${data.plan.tipo}
Precio: ${data.plan.consultar ? "Por consultar" : `$${Number(data.plan.precio).toFixed(2)} USD`}

Por favor, indíqueme disponibilidad y forma de pago.`;
  }
  window.contactarPlanWhatsApp = (p,i,o='compra') => window.open(`${CONFIG.whatsappLink}?text=${encodeURIComponent(mensaje(p,i,o))}`, '_blank', 'noopener,noreferrer');
  window.contactarPlanTelegram = (p,i,o='compra') => abrirTelegramConMensaje(mensaje(p,i,o));
  window.contactarPlanSignal = (p,i,o='compra') => abrirSignalConMensaje(mensaje(p,i,o));
  window.marcarPlanRenovacion = (p,i) => {
    const data=obtener(p,i); if (!data) return;
    if (!data.plan.consultar) agregarAlCarrito(data.producto, {...data.plan, operacion:'renovacion'});
    const item = carrito.find(x => x.productoId===p && x.plan===data.plan.tipo);
    if (item) { item.operacion='renovacion'; guardarCarritoEnStorage(); renderCarrito(); actualizarContadorCarrito(); }
    mostrarToast('Servicio marcado como renovación. Elige WhatsApp, Telegram o Signal.', 'exito');
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-categoria]').forEach(btn => btn.addEventListener('click', () => seleccionarCategoriaCatalogo(btn.dataset.categoria)));
    renderCatalogo();
  });
})();
