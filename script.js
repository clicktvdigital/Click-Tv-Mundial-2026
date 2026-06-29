/* ========================================================================== 
   CLICK TV STREAMING MUNDIAL 2026 — script.js
   Lógica principal: carrito, pagos, moneda, API Mundial, UI y botones
   ========================================================================== */

const CLAVE_CARRITO = "clicktv_carrito";
const CLAVE_MONEDA = "clicktv_moneda";
const CLAVE_CUPON = "clicktv_cupon";
const CLAVE_VENTAS = "clicktv_ventas";

let carrito = [];
let monedaActual = "USD";
let cuponAplicado = null;
let paypalRenderizado = false;
let indiceActividad = 0;
let indiceResena = 0;
let metodoPagoActual = "transferencia";

// ---------------------------------------------------------------------------
// INICIALIZACIÓN
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  cargarCarritoDesdeStorage();
  cargarMonedaDesdeStorage();
  inicializarFiltros();
  renderCatalogo();
  renderCarrito();
  cargarResenas();
  renderActividadReciente();
  renderMundial();
  inicializarUI();
  inicializarBotonesFlotantes();
  inicializarPagosRapidos();
  inicializarUbicacion();
  actualizarTasasCambio();
  actualizarContadorCarrito();
  inicializarPayPalCheckout();

  setInterval(renderActividadReciente, 4500);
  setInterval(rotarResenas, 6000);
});

function inicializarUI() {
  const btnMenu = document.getElementById("btn-menu-movil");
  const navMenu = document.getElementById("nav-menu");

  if (btnMenu && navMenu) {
    btnMenu.addEventListener("click", () => navMenu.classList.toggle("abierto"));
  }

  // Carrito
  document.getElementById("btn-abrir-carrito")?.addEventListener("click", abrirCarrito);
  document.getElementById("btn-cerrar-carrito")?.addEventListener("click", cerrarCarrito);
  document.getElementById("btn-continuar-comprando")?.addEventListener("click", cerrarCarrito);
  document.getElementById("carrito-overlay")?.addEventListener("click", cerrarCarrito);

  // Cupón
  document.getElementById("btn-aplicar-cupon")?.addEventListener("click", aplicarCupon);

  // Checkout
  document.getElementById("btn-finalizar-compra")?.addEventListener("click", finalizarCompra);
  document.getElementById("btn-enviar-comprobante")?.addEventListener("click", enviarComprobanteWhatsApp);
  document.getElementById("btn-enviar-pedido")?.addEventListener("click", enviarPedidoWhatsApp);

  // Botones de pago
  document.querySelectorAll(".btn-pago").forEach((btn) => {
    btn.addEventListener("click", () => procesarPago(btn.dataset.metodo));
  });

  // Botones copiar
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => copiarTexto(btn.dataset.copy, btn.dataset.label || "Dato copiado"));
  });

  // Selector de moneda
  document.getElementById("selector-moneda")?.addEventListener("change", (e) => {
    monedaActual = e.target.value;
    localStorage.setItem(CLAVE_MONEDA, monedaActual);
    renderCatalogo();
    renderCarrito();
    mostrarToast(`Moneda cambiada a ${monedaActual}`, "info");
  });

  // Scroll arriba
  const btnScrollTop = document.getElementById("btn-scroll-top");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      btnScrollTop?.classList.add("visible");
    } else {
      btnScrollTop?.classList.remove("visible");
    }
  });

  btnScrollTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Cerrar menú móvil al tocar una opción
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => navMenu?.classList.remove("abierto"));
  });

  // Año dinámico en footer
  const anio = document.getElementById("anio-actual");
  if (anio) anio.textContent = new Date().getFullYear();

  // Usuarios conectados
  const usuarios = document.getElementById("usuarios-conectados");
  if (usuarios) usuarios.textContent = `${Math.floor(Math.random() * 39) + 38}`;

  // Radio en vivo
  const radioPlayer = document.getElementById("radio-player");

  if (radioPlayer && typeof CONFIG !== "undefined" && CONFIG.radioStreamUrl) {
    radioPlayer.src = CONFIG.radioStreamUrl;
    radioPlayer.load();
  }

  // Teleamazonas en vivo
  const btnTeleamazonas = document.getElementById("btn-teleamazonas");

  if (btnTeleamazonas && typeof CONFIG !== "undefined" && CONFIG.teleamazonasUrl) {
    btnTeleamazonas.href = CONFIG.teleamazonasUrl;
    btnTeleamazonas.target = "_blank";
    btnTeleamazonas.rel = "noopener noreferrer";
  }

  // Botones flotantes
  inicializarBotonesFlotantes();
  actualizarDetallePagoCarrito();
}

function configurarLinkExterno(elemento, url) {
  if (!elemento || !url) return;

  elemento.href = url;
  elemento.target = "_blank";
  elemento.rel = "noopener noreferrer";
}

function inicializarBotonesFlotantes() {
  if (typeof CONFIG === "undefined") return;

  const wa = document.getElementById("btn-whatsapp");
  const grupo = document.getElementById("btn-whatsapp-grupo");
  const tg = document.getElementById("btn-telegram");
  const soporte = document.getElementById("btn-soporte");

  if (wa) configurarLinkExterno(wa, CONFIG.whatsappLink);
  if (grupo) configurarLinkExterno(grupo, CONFIG.whatsappGrupo);
  if (tg) configurarLinkExterno(tg, CONFIG.telegramLink);

  if (soporte) {
    const msg = encodeURIComponent("Hola, necesito soporte técnico con mi servicio Click TV.");
    configurarLinkExterno(soporte, `${CONFIG.whatsappLink}?text=${msg}`);
  }
}

function inicializarPagosRapidos() {
  const deuna = document.getElementById("link-deuna");
  const payphone = document.getElementById("link-payphone");
  const paypalme = document.getElementById("link-paypalme");
  const catalogo = document.getElementById("link-catalogo-oficial");
  const fifa = document.getElementById("link-fifa-calendario");
  const teleamazonas = document.getElementById("btn-teleamazonas");

  if (deuna) configurarLinkExterno(deuna, CONFIG.deunaUrl);
  if (payphone) configurarLinkExterno(payphone, CONFIG.payphoneUrl);
  if (paypalme) configurarLinkExterno(paypalme, CONFIG.paypalUrl);
  if (catalogo) configurarLinkExterno(catalogo, CONFIG.catalogoUrl);
  if (fifa) configurarLinkExterno(fifa, CONFIG.fifaCalendarioUrl);
  if (teleamazonas) configurarLinkExterno(teleamazonas, CONFIG.teleamazonasUrl);

  const radio = document.getElementById("radio-player");
  if (radio) radio.src = CONFIG.radioStreamUrl;
}

// ---------------------------------------------------------------------------
// MONEDA
// ---------------------------------------------------------------------------
function formatearPrecio(precioUSD) {
  const info = TASAS_CAMBIO[monedaActual] || TASAS_CAMBIO.USD;
  const convertido = Number(precioUSD) * info.tasa;
  const decimales = ["USD", "EUR", "PEN", "BRL", "BOB", "DOP", "GTQ"].includes(monedaActual) ? 2 : 0;
  const local = monedaActual === "USD" ? "" : ` · ${info.simbolo}${convertido.toFixed(decimales)} aprox.`;
  return `$${Number(precioUSD).toFixed(2)} USD${local}`;
}

function cargarMonedaDesdeStorage() {
  const guardada = localStorage.getItem(CLAVE_MONEDA);
  if (guardada && TASAS_CAMBIO[guardada]) {
    monedaActual = guardada;
    const selector = document.getElementById("selector-moneda");
    if (selector) selector.value = guardada;
  }
}

function inicializarUbicacion() {
  const btnUbicacion = document.getElementById("btn-activar-ubicacion");
  const elPais = document.getElementById("pais-detectado");

  btnUbicacion?.addEventListener("click", detectarPais);

  if (localStorage.getItem(CLAVE_MONEDA)) {
    if (elPais) elPais.textContent = `🌎 Moneda: ${monedaActual}`;
    return;
  }

  if (elPais) elPais.textContent = "🌎 Activa ubicación o elige moneda";
}

async function actualizarTasasCambio() {
  if (!CONFIG.exchangeRateApiUrl) return;

  try {
    const respuesta = await fetch(CONFIG.exchangeRateApiUrl);
    if (!respuesta.ok) throw new Error(`Exchange HTTP ${respuesta.status}`);

    const datos = await respuesta.json();
    const rates = datos?.rates;
    if (!rates) return;

    Object.keys(TASAS_CAMBIO).forEach((codigo) => {
      if (Number.isFinite(Number(rates[codigo]))) {
        TASAS_CAMBIO[codigo].tasa = Number(rates[codigo]);
      }
    });

    renderCatalogo();
    renderCarrito();
    actualizarDetallePagoCarrito();
  } catch (error) {
    console.warn("No se pudieron actualizar tasas de cambio. Se usan tasas de respaldo.", error);
  }
}

function detectarPais() {
  const elPais = document.getElementById("pais-detectado");
  const btnUbicacion = document.getElementById("btn-activar-ubicacion");
  if (!elPais) return;

  if (!navigator.geolocation) {
    elPais.textContent = "🌎 Ubicación no disponible";
    return;
  }

  elPais.textContent = "📍 Detectando país...";
  if (btnUbicacion) {
    btnUbicacion.disabled = true;
    btnUbicacion.textContent = "📍 Detectando...";
  }

  navigator.geolocation.getCurrentPosition(
    async (posicion) => {
      try {
        const { latitude, longitude } = posicion.coords;
        const respuesta = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const datos = await respuesta.json();
        const pais = datos?.address?.country || "Ubicación detectada";
        const codigoPais = datos?.address?.country_code?.toUpperCase() || "";
        elPais.textContent = `🌎 ${pais}`;
        sugerirMonedaPorPais(pais, codigoPais);
      } catch {
        elPais.textContent = "🌎 País detectado";
      }
      if (btnUbicacion) {
        btnUbicacion.disabled = false;
        btnUbicacion.textContent = "📍 Ubicación activa";
      }
    },
    () => {
      elPais.textContent = "🌎 Ecuador / Internacional";
      if (btnUbicacion) {
        btnUbicacion.disabled = false;
        btnUbicacion.textContent = "📍 Activar ubicación";
      }
      mostrarToast("No se activó la ubicación. Puedes elegir la moneda manualmente.", "info");
    },
    { enableHighAccuracy: false, timeout: 7000, maximumAge: 600000 }
  );
}

function sugerirMonedaPorPais(pais, codigoPais = "") {
  if (localStorage.getItem(CLAVE_MONEDA)) return;

  const monedaPorCodigo = MONEDA_POR_PAIS?.[codigoPais];
  const encontrada = monedaPorCodigo
    ? [monedaPorCodigo, TASAS_CAMBIO[monedaPorCodigo]]
    : Object.entries(TASAS_CAMBIO).find(([, info]) => info.paises?.includes(pais));

  if (!encontrada || !TASAS_CAMBIO[encontrada[0]]) return;

  monedaActual = encontrada[0];
  localStorage.setItem(CLAVE_MONEDA, monedaActual);

  const selector = document.getElementById("selector-moneda");
  if (selector) selector.value = monedaActual;

  renderCatalogo();
  renderCarrito();
  mostrarToast(`Moneda sugerida: ${monedaActual}`, "exito");
}

// ---------------------------------------------------------------------------
// CARRITO — PERSISTENCIA
// ---------------------------------------------------------------------------
function cargarCarritoDesdeStorage() {
  try {
    carrito = JSON.parse(localStorage.getItem(CLAVE_CARRITO) || "[]");
    cuponAplicado = JSON.parse(localStorage.getItem(CLAVE_CUPON) || "null");
  } catch {
    carrito = [];
    cuponAplicado = null;
  }
}

function guardarCarritoEnStorage() {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

// ---------------------------------------------------------------------------
// CARRITO — ACCIONES
// ---------------------------------------------------------------------------
function agregarPlanAlCarrito(productoId, planIndex) {
  const data = obtenerPlanProducto(productoId, planIndex);
  if (!data) return mostrarToast("Producto no disponible.", "error");
  agregarAlCarrito(data.producto, data.plan);
}

function agregarAlCarrito(producto, plan) {
  if (plan.consultar) {
    comprarAhora(producto.id, producto.planes.indexOf(plan));
    return;
  }

  const itemId = `${producto.id}-${normalizarTexto(plan.tipo)}`;
  const existente = carrito.find((item) => item.itemId === itemId);

  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({
      itemId,
      productoId: producto.id,
      nombre: producto.nombre,
      icono: producto.icono,
      plan: plan.tipo,
      precio: Number(plan.precio),
      cantidad: 1,
      dispositivos: plan.dispositivos || null
    });
  }

  guardarCarritoEnStorage();
  renderCarrito();
  actualizarContadorCarrito();
  abrirCarrito();
  mostrarToast(`${producto.nombre} agregado al carrito 🛒`, "exito");
}

function eliminarDelCarrito(itemId) {
  carrito = carrito.filter((item) => item.itemId !== itemId);
  guardarCarritoEnStorage();
  renderCarrito();
  actualizarContadorCarrito();
  mostrarToast("Producto eliminado del carrito", "info");
}

function cambiarCantidad(itemId, delta) {
  const item = carrito.find((i) => i.itemId === itemId);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) {
    eliminarDelCarrito(itemId);
    return;
  }
  guardarCarritoEnStorage();
  renderCarrito();
  actualizarContadorCarrito();
}

function modificarDispositivos(itemId, valor) {
  const item = carrito.find((i) => i.itemId === itemId);
  if (!item) return;
  const nuevoValor = Math.max(1, Number(valor) || 1);
  item.dispositivos = nuevoValor;
  guardarCarritoEnStorage();
  renderCarrito();
}

function comprarAhora(productoId, planIndex) {
  const data = obtenerPlanProducto(productoId, planIndex);
  if (!data) return mostrarToast("Producto no disponible.", "error");

  const { producto, plan } = data;
  const precio = plan.consultar ? "consultar disponibilidad" : `$${Number(plan.precio).toFixed(2)} USD`;
  const mensaje = encodeURIComponent(`Hola, deseo comprar ${producto.nombre} ${plan.tipo} por ${precio}.`);
  window.open(`${CONFIG.whatsappLink}?text=${mensaje}`, "_blank", "noopener,noreferrer");
}

function renderCarrito() {
  const contenedor = document.getElementById("carrito-items");
  if (!contenedor) return;

  if (carrito.length === 0) {
    contenedor.innerHTML = `<p class="carrito-vacio">Tu carrito está vacío. Explora el catálogo y agrega tus servicios favoritos. 🛍️</p>`;
  } else {
    contenedor.innerHTML = carrito.map((item) => `
      <div class="carrito-item">
        <span class="carrito-item__icono">${item.icono}</span>
        <div class="carrito-item__info">
          <p class="carrito-item__nombre">${item.nombre}</p>
          <p class="carrito-item__plan">${item.plan} · ${formatearPrecio(item.precio)}</p>
          ${item.dispositivos ? `
            <label class="mini-label">Dispositivos
              <input type="number" min="1" max="10" value="${item.dispositivos}" onchange="modificarDispositivos('${item.itemId}', this.value)">
            </label>
          ` : ""}
          <div class="carrito-item__cantidad">
            <button onclick="cambiarCantidad('${item.itemId}', -1)" aria-label="Reducir cantidad">−</button>
            <span>${item.cantidad}</span>
            <button onclick="cambiarCantidad('${item.itemId}', 1)" aria-label="Aumentar cantidad">+</button>
          </div>
        </div>
        <button class="carrito-item__borrar" onclick="eliminarDelCarrito('${item.itemId}')" aria-label="Eliminar producto">🗑️</button>
      </div>
    `).join("");
  }

  const totales = calcularTotales();
  actualizarTexto("carrito-subtotal", formatearPrecio(totales.subtotal));
  actualizarTexto("carrito-descuento", `- ${formatearPrecio(totales.descuento)}`);
  actualizarTexto("carrito-iva", formatearPrecio(totales.iva));
  actualizarTexto("carrito-total", formatearPrecio(totales.total));
  actualizarTexto("paypal-total", `$${totales.totalPaypal.toFixed(2)} USD`);
  actualizarDetallePagoCarrito();

  const elCuponInfo = document.getElementById("cupon-info");
  if (elCuponInfo) {
    elCuponInfo.textContent = cuponAplicado
      ? `Cupón aplicado: ${cuponAplicado.codigo} (${cuponAplicado.porcentaje}% de descuento)`
      : "";
  }
}

function calcularTotales() {
  const subtotal = carrito.reduce((acc, item) => acc + Number(item.precio) * Number(item.cantidad), 0);
  const descuento = cuponAplicado ? subtotal * (Number(cuponAplicado.porcentaje) / 100) : 0;
  const base = Math.max(subtotal - descuento, 0);
  const iva = base * CONFIG.ivaPorcentaje;
  const total = base + iva;
  const totalPaypal = total > 0
    ? (total + CONFIG.paypalComisionFija) / (1 - CONFIG.paypalComisionPorcentaje)
    : 0;

  return { subtotal, descuento, base, iva, total, totalPaypal };
}

function actualizarContadorCarrito() {
  const contador = document.getElementById("contador-carrito");
  if (!contador) return;
  const totalItems = carrito.reduce((acc, item) => acc + Number(item.cantidad), 0);
  contador.textContent = totalItems;
  contador.style.display = totalItems > 0 ? "inline-flex" : "none";
}

function abrirCarrito() {
  document.getElementById("panel-carrito")?.classList.add("abierto");
  document.getElementById("carrito-overlay")?.classList.add("visible");
  renderCarrito();
}

function cerrarCarrito() {
  document.getElementById("panel-carrito")?.classList.remove("abierto");
  document.getElementById("carrito-overlay")?.classList.remove("visible");
}

function vaciarCarrito() {
  carrito = [];
  cuponAplicado = null;
  localStorage.removeItem(CLAVE_CARRITO);
  localStorage.removeItem(CLAVE_CUPON);
  renderCarrito();
  actualizarContadorCarrito();
}

// ---------------------------------------------------------------------------
// CUPONES
// ---------------------------------------------------------------------------
function aplicarCupon() {
  const input = document.getElementById("input-cupon");
  if (!input) return;
  const codigo = normalizarCuponCodigo(input.value);

  if (!codigo) return mostrarToast("Ingresa un código de cupón.", "error");

  const cupon = CUPONES[codigo];
  if (!cupon) return mostrarToast("Cupón inválido. Puedes escribirlo con espacios o en minúsculas.", "error");

  cuponAplicado = { codigo, porcentaje: cupon.porcentaje };
  localStorage.setItem(CLAVE_CUPON, JSON.stringify(cuponAplicado));
  input.value = codigo;
  renderCarrito();
  mostrarToast(`Cupón ${codigo} aplicado: ${cupon.descripcion}`, "exito");
}

// ---------------------------------------------------------------------------
// CHECKOUT Y PAGOS
// ---------------------------------------------------------------------------
function finalizarCompra() {
  if (carrito.length === 0) return mostrarToast("Tu carrito está vacío.", "error");
  procesarPago(metodoPagoActual, true);
}

function procesarPago(metodo, ejecutar = false) {
  metodoPagoActual = metodo || "transferencia";

  document.querySelectorAll(".btn-pago").forEach((btn) => {
    btn.classList.toggle("activo", btn.dataset.metodo === metodoPagoActual);
  });

  actualizarDetallePagoCarrito();

  if (!ejecutar) {
    mostrarToast(`Método seleccionado: ${obtenerNombreMetodoPago(metodoPagoActual)}`, "info");
    return;
  }

  if (carrito.length === 0) {
    return mostrarToast("Agrega productos antes de enviar el pedido.", "error");
  }

  switch (metodoPagoActual) {
    case "whatsapp":
      enviarPedidoWhatsApp();
      break;
    case "deuna":
      window.open(CONFIG.deunaUrl, "_blank", "noopener,noreferrer");
      break;
    case "payphone":
      window.open(CONFIG.payphoneUrl, "_blank", "noopener,noreferrer");
      break;
    case "paypalme":
      window.open(CONFIG.paypalUrl, "_blank", "noopener,noreferrer");
      break;
    case "transferencia":
      mostrarToast("Copia los datos bancarios y envía el comprobante por WhatsApp.", "info");
      break;
    default:
      mostrarToast("Método de pago no disponible.", "error");
  }
}

function obtenerNombreMetodoPago(metodo) {
  const nombres = {
    transferencia: "Transferencia bancaria",
    deuna: "DEUNA",
    payphone: "PayPhone",
    paypalme: "PayPal",
    whatsapp: "WhatsApp"
  };
  return nombres[metodo] || "Método de pago";
}

function actualizarDetallePagoCarrito() {
  const detalle = document.getElementById("carrito-pago-detalle");
  if (!detalle || typeof CONFIG === "undefined") return;

  const totales = calcularTotales();
  const total = `$${totales.total.toFixed(2)} USD`;
  const totalPaypal = `$${totales.totalPaypal.toFixed(2)} USD`;

  const detalles = {
    transferencia: `
      <strong>Transferencia bancaria</strong>
      <p>Total a pagar: <b>${total}</b></p>
      <p>Banco Pichincha: <b>${CONFIG.bancoPichincha}</b></p>
      <button class="btn btn--outline btn--full" onclick="copiarTexto('${CONFIG.bancoPichincha}', 'Banco Pichincha copiado')">Copiar Pichincha</button>
      <p>Banco Guayaquil: <b>${CONFIG.bancoGuayaquil}</b></p>
      <button class="btn btn--outline btn--full" onclick="copiarTexto('${CONFIG.bancoGuayaquil}', 'Banco Guayaquil copiado')">Copiar Guayaquil</button>
      <p>Luego envía tu comprobante por WhatsApp para validar tu pedido.</p>
    `,
    deuna: `
      <strong>DEUNA</strong>
      <p>Total referencial: <b>${total}</b></p>
      <p>Paga desde el enlace oficial y luego envía el comprobante por WhatsApp.</p>
      <a class="btn btn--primary btn--full" href="${CONFIG.deunaUrl}" target="_blank" rel="noopener noreferrer">Pagar con DEUNA</a>
    `,
    payphone: `
      <strong>PayPhone</strong>
      <p>Total referencial: <b>${total}</b></p>
      <p>Abre el enlace de PayPhone y confirma el pago.</p>
      <a class="btn btn--primary btn--full" href="${CONFIG.payphoneUrl}" target="_blank" rel="noopener noreferrer">Pagar con PayPhone</a>
    `,
    paypalme: `
      <strong>PayPal</strong>
      <p>Total con comisión PayPal estimada: <b>${totalPaypal}</b></p>
      <p>Usa PayPal.Me o el checkout automático de la sección pagos.</p>
      <a class="btn btn--primary btn--full" href="${CONFIG.paypalUrl}" target="_blank" rel="noopener noreferrer">Pagar con PayPal.Me</a>
    `,
    whatsapp: `
      <strong>Pedido por WhatsApp</strong>
      <p>Total a confirmar: <b>${total}</b></p>
      <p>Envía el resumen del carrito por WhatsApp para recibir atención directa.</p>
      <button class="btn btn--primary btn--full" onclick="enviarPedidoWhatsApp()">Enviar pedido por WhatsApp</button>
    `
  };

  detalle.innerHTML = detalles[metodoPagoActual] || detalles.transferencia;
}

function generarResumenPedido() {
  const resumen = carrito.map((item) => `• ${item.nombre} (${item.plan}) x${item.cantidad}`).join("\n");
  const totales = calcularTotales();
  return `Hola, quiero finalizar mi compra:\n${resumen}\n\nSubtotal: $${totales.subtotal.toFixed(2)} USD\nDescuento: $${totales.descuento.toFixed(2)} USD\nIVA 15%: $${totales.iva.toFixed(2)} USD\nTotal: $${totales.total.toFixed(2)} USD${cuponAplicado ? `\nCupón: ${cuponAplicado.codigo}` : ""}`;
}

function enviarPedidoWhatsApp() {
  if (carrito.length === 0) return mostrarToast("Tu carrito está vacío.", "error");
  const mensaje = encodeURIComponent(generarResumenPedido());
  window.open(`${CONFIG.whatsappLink}?text=${mensaje}`, "_blank", "noopener,noreferrer");
}

function enviarComprobanteWhatsApp() {
  const mensaje = encodeURIComponent("Hola, ya realicé el pago y deseo enviar mi comprobante para validar mi pedido.");
  window.open(`${CONFIG.whatsappLink}?text=${mensaje}`, "_blank", "noopener,noreferrer");
}

function inicializarPayPalCheckout() {
  const contenedor = document.getElementById("paypal-button-container");
  if (!contenedor || paypalRenderizado) return;

  if (typeof paypal === "undefined") {
    contenedor.innerHTML = `<p class="notice">PayPal Checkout no pudo cargar. Use PayPal.Me como alternativa.</p>`;
    return;
  }

  paypal.Buttons({
    style: {
      layout: "vertical",
      color: "gold",
      shape: "pill",
      label: "paypal"
    },
    createOrder: (data, actions) => {
      if (carrito.length === 0) {
        mostrarToast("Agrega productos al carrito antes de pagar con PayPal.", "error");
        throw new Error("Carrito vacío");
      }
      const totalPaypal = calcularTotales().totalPaypal;
      return actions.order.create({
        purchase_units: [{
          description: "Compra Click TV Mundial 2026",
          amount: {
            currency_code: "USD",
            value: totalPaypal.toFixed(2)
          }
        }]
      });
    },
    onApprove: (data, actions) => {
      return actions.order.capture().then((details) => {
        guardarVenta({
          metodo: "PayPal Checkout",
          orderId: data.orderID,
          payer: details?.payer?.name?.given_name || "Cliente PayPal",
          total: calcularTotales().totalPaypal,
          items: carrito,
          fecha: new Date().toISOString()
        });
        vaciarCarrito();
        mostrarConfirmacionPago(`Pago confirmado por PayPal. Orden: ${data.orderID}`);
      });
    },
    onError: (err) => {
      console.error("PayPal error:", err);
      mostrarToast("No se pudo completar el pago con PayPal. Intenta nuevamente o usa PayPal.Me.", "error");
    }
  }).render("#paypal-button-container");

  paypalRenderizado = true;
}

function guardarVenta(venta) {
  const ventas = JSON.parse(localStorage.getItem(CLAVE_VENTAS) || "[]");
  ventas.push(venta);
  localStorage.setItem(CLAVE_VENTAS, JSON.stringify(ventas));
}

function mostrarConfirmacionPago(mensaje) {
  const box = document.getElementById("confirmacion-pago");
  if (box) {
    box.innerHTML = `
      <div class="success-box">
        <h3>✅ Pago confirmado</h3>
        <p>${mensaje}</p>
        <button class="btn btn--primary" onclick="enviarComprobanteWhatsApp()">Enviar comprobante por WhatsApp</button>
      </div>
    `;
    box.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  mostrarToast("Pago confirmado correctamente ✅", "exito");
}

// ---------------------------------------------------------------------------
// MUNDIAL 2026
// ---------------------------------------------------------------------------
async function renderMundial() {
  const box = document.getElementById("mundial-grid");
  if (!box) return;

  box.innerHTML = `<div class="loading-card">⚽ Cargando información del Mundial 2026...</div>`;

  try {
    const partidosAPI = await obtenerPartidosFootballData();
    const partidos = normalizarPartidos(partidosAPI);
    const html = renderizarBloquesMundial(partidos);
    box.innerHTML = html || renderMundialFallback();
  } catch (error) {
    console.warn("No se pudo cargar Football-Data:", error);
    const locales = Array.isArray(MUNDIAL_2026) ? normalizarPartidosLocales(MUNDIAL_2026) : [];
    const htmlLocal = renderizarBloquesMundial(locales);
    box.innerHTML = htmlLocal || renderMundialFallback();
  }
}

async function obtenerPartidosFootballData() {
  const respuesta = await fetch(CONFIG.footballDataApiUrl, {
    headers: { "X-Auth-Token": CONFIG.footballDataApiToken }
  });

  if (!respuesta.ok) throw new Error(`Football-Data HTTP ${respuesta.status}`);
  const data = await respuesta.json();
  return Array.isArray(data.matches) ? data.matches : [];
}

function normalizarPartidos(matches) {
  return matches.map((m) => ({
    grupo: m.group || m.stage || m.competition?.name || "Mundial 2026",
    local: m.homeTeam?.name || m.homeTeam?.shortName || "Equipo local",
    visitante: m.awayTeam?.name || m.awayTeam?.shortName || "Equipo visitante",
    fechaUTC: m.utcDate,
    sede: m.venue || "Sede por confirmar",
    estado: traducirEstadoPartido(m.status),
    marcador: crearMarcador(m.score)
  })).filter((m) => m.fechaUTC);
}

function normalizarPartidosLocales(grupos) {
  const lista = [];
  grupos.forEach((grupo) => {
    (grupo.partidos || []).forEach((p) => {
      lista.push({
        grupo: grupo.grupo || p.grupo || "Mundial 2026",
        local: p.local,
        visitante: p.visitante,
        fechaUTC: p.fechaUTC,
        sede: p.sede || "Sede por confirmar",
        estado: obtenerEstadoPorFecha(p.fechaUTC),
        marcador: ""
      });
    });
  });
  return lista;
}

function renderizarBloquesMundial(partidos) {
  if (!partidos.length) return "";

  const hoy = fechaEcuador(0);
  const ayer = fechaEcuador(-1);
  const manana = fechaEcuador(1);

  const bloques = [
    { titulo: "📅 Ayer", fecha: ayer },
    { titulo: "🔴 Hoy", fecha: hoy },
    { titulo: "📅 Mañana", fecha: manana }
  ];

  let html = bloques.map((bloque) => {
    const items = partidos.filter((p) => fechaDesdeUTCEnEcuador(p.fechaUTC) === bloque.fecha);
    return crearBloquePartidos(bloque.titulo, items);
  }).join("");

  const proximos = partidos
    .filter((p) => new Date(p.fechaUTC) > new Date())
    .sort((a, b) => new Date(a.fechaUTC) - new Date(b.fechaUTC))
    .slice(0, 8);

  html += crearBloquePartidos("📅 Próximos partidos", proximos);
  return html;
}

function crearBloquePartidos(titulo, partidos) {
  if (!partidos.length) return "";
  return `
    <div class="mundial-bloque">
      <h3>${titulo}</h3>
      <div class="mundial-cards">
        ${partidos.map(crearCardPartido).join("")}
      </div>
    </div>
  `;
}

function crearCardPartido(p) {
  const fecha = new Date(p.fechaUTC);
  const fechaTexto = fecha.toLocaleDateString("es-EC", { timeZone: "America/Guayaquil", weekday: "short", day: "2-digit", month: "short" });
  const horaTexto = fecha.toLocaleTimeString("es-EC", { timeZone: "America/Guayaquil", hour: "2-digit", minute: "2-digit" });

  return `
    <article class="match-card">
      <span class="status">${p.estado || obtenerEstadoPorFecha(p.fechaUTC)}</span>
      <p class="match-group">${p.grupo}</p>
      <h4>${p.local} <span>vs</span> ${p.visitante}</h4>
      <p>📅 ${fechaTexto}</p>
      <p>⏰ ${horaTexto} (Ecuador)</p>
      <p>📍 ${p.sede}</p>
      ${p.marcador ? `<p class="match-score">${p.marcador}</p>` : ""}
    </article>
  `;
}

function renderMundialFallback() {
  return `
    <div class="empty-state mundial-empty">
      <h3>⚽ Información próximamente disponible</h3>
      <p>No hay datos disponibles en este momento. Revisa el calendario oficial.</p>
      <a id="link-fifa-calendario" class="btn btn--primary" href="${CONFIG.fifaCalendarioUrl}" target="_blank" rel="noopener noreferrer">📅 Ver Calendario Oficial FIFA</a>
    </div>
  `;
}

function fechaEcuador(offsetDias = 0) {
  const ahora = new Date();
  ahora.setDate(ahora.getDate() + offsetDias);
  return ahora.toLocaleDateString("en-CA", { timeZone: "America/Guayaquil" });
}

function fechaDesdeUTCEnEcuador(fechaUTC) {
  const fecha = new Date(fechaUTC);
  if (isNaN(fecha.getTime())) return "";
  return fecha.toLocaleDateString("en-CA", { timeZone: "America/Guayaquil" });
}

function obtenerEstadoPorFecha(fechaUTC) {
  const inicio = new Date(fechaUTC);
  if (isNaN(inicio.getTime())) return "⚽ Programado";
  const ahora = new Date();
  const fin = new Date(inicio.getTime() + 120 * 60 * 1000);
  if (ahora < inicio) return "🟡 Programado";
  if (ahora >= inicio && ahora <= fin) return "🔴 EN VIVO";
  return "⚫ Finalizado";
}

function traducirEstadoPartido(status) {
  const mapa = {
    SCHEDULED: "🟡 Programado",
    TIMED: "🟡 Programado",
    IN_PLAY: "🔴 EN VIVO",
    PAUSED: "⏸️ Descanso",
    FINISHED: "⚫ Finalizado",
    POSTPONED: "⏳ Pospuesto",
    SUSPENDED: "⛔ Suspendido",
    CANCELED: "❌ Cancelado"
  };
  return mapa[status] || "⚽ Programado";
}

function crearMarcador(score) {
  if (!score?.fullTime) return "";
  const home = score.fullTime.home;
  const away = score.fullTime.away;
  if (home === null || away === null || home === undefined || away === undefined) return "";
  return `Resultado: ${home} - ${away}`;
}

// ---------------------------------------------------------------------------
// RESEÑAS Y ACTIVIDAD
// ---------------------------------------------------------------------------
function cargarResenas() {
  const contenedor = document.getElementById("resenas-slider");
  if (!contenedor) return;
  contenedor.innerHTML = RESENAS.map((r, i) => crearResena(r, i)).join("");
  rotarResenas();
}

function crearResena(resena, index) {
  return `
    <article class="resena-card ${index === 0 ? "activa" : ""}">
      <div class="estrellas">${"★".repeat(resena.estrellas)}</div>
      <h3>${resena.nombre}</h3>
      <p class="resena-pais">${resena.pais}</p>
      <p>${resena.comentario}</p>
    </article>
  `;
}

function rotarResenas() {
  const cards = document.querySelectorAll(".resena-card");
  if (!cards.length) return;
  cards.forEach((card) => card.classList.remove("activa"));
  cards[indiceResena % cards.length].classList.add("activa");
  indiceResena++;
}

function renderActividadReciente() {
  const box = document.getElementById("actividad-reciente");
  if (!box || !ACTIVIDAD_RECIENTE?.length) return;
  box.textContent = ACTIVIDAD_RECIENTE[indiceActividad % ACTIVIDAD_RECIENTE.length];
  indiceActividad++;
}

// ---------------------------------------------------------------------------
// UTILIDADES
// ---------------------------------------------------------------------------
async function copiarTexto(texto, label = "Copiado") {
  try {
    await navigator.clipboard.writeText(texto);
    mostrarToast(`${label} 📋`, "exito");
  } catch {
    mostrarToast("No se pudo copiar. Mantén presionado y copia manualmente.", "error");
  }
}

function mostrarToast(mensaje, tipo = "info") {
  const contenedor = document.getElementById("toast-contenedor");
  if (!contenedor) return;

  const toast = document.createElement("div");
  toast.className = `toast toast--${tipo}`;
  toast.textContent = mensaje;
  contenedor.appendChild(toast);

  setTimeout(() => toast.classList.add("visible"), 10);
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 280);
  }, 3500);
}

function actualizarTexto(id, texto) {
  const el = document.getElementById(id);
  if (el) el.textContent = texto;
}

function normalizarTexto(texto) {
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizarCuponCodigo(texto) {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}
