/* ========================================================================== 
   CLICK TV STREAMING MUNDIAL 2026 — script.js
   Lógica principal: carrito, pagos, moneda, API Mundial, UI y botones
   ========================================================================== */

const CLAVE_CARRITO = "clicktv_carrito";
const CLAVE_MONEDA = "clicktv_moneda";
const CLAVE_CUPON = "clicktv_cupon";
const CLAVE_VENTAS = "clicktv_ventas";
const CLAVE_GEO_MODAL = "clicktv_geo_modal_visto";

let carrito = [];
let monedaActual = "USD";
let cuponAplicado = null;
let paypalRenderizado = false;
let indiceActividad = 0;
let indiceResena = 0;
let metodoPagoActual = "transferencia";
let usuariosConectados = 48;
let ubicacionCliente = {
  ciudad: "",
  pais: "Ecuador",
  codigoPais: "EC",
  bandera: "🇪🇨",
  zonaHoraria: "America/Guayaquil"
};

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
  actualizarUsuariosConectados();
  actualizarContadorCarrito();

  setInterval(renderActividadReciente, 4500);
  setInterval(rotarResenas, 6000);
  setInterval(actualizarUsuariosConectados, 6500);
  setInterval(() => renderMundial(true), 30000);
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
    actualizarDetallePagoCarrito();
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

  // Radio en vivo
  const radioPlayer = document.getElementById("radio-player");
  const btnRadioPlay = document.getElementById("btn-radio-play");

  if (radioPlayer && typeof CONFIG !== "undefined" && CONFIG.radioStreamUrl) {
    radioPlayer.src = CONFIG.radioStreamUrl;
    radioPlayer.autoplay = true;
    radioPlayer.load();
    intentarAutoplayRadio();
  }

  btnRadioPlay?.addEventListener("click", activarRadioManual);

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

async function intentarAutoplayRadio() {
  const radio = document.getElementById("radio-player");
  const btn = document.getElementById("btn-radio-play");
  if (!radio) return;

  try {
    radio.muted = false;
    await radio.play();
    btn?.classList.add("oculto");
  } catch {
    btn?.classList.remove("oculto");
  }
}

async function activarRadioManual() {
  const radio = document.getElementById("radio-player");
  const btn = document.getElementById("btn-radio-play");
  if (!radio) return;

  try {
    radio.muted = false;
    radio.volume = 1;
    await radio.play();
    btn?.classList.add("oculto");
    mostrarToast("Radio activada correctamente.", "exito");
  } catch {
    mostrarToast("El navegador bloqueó la radio. Toca reproducir desde el control del audio.", "info");
  }
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
  const btnModalUbicacion = document.getElementById("btn-modal-activar-ubicacion");
  const btnCerrarModal = document.getElementById("btn-cerrar-modal-ubicacion");
  const btnContinuarUsd = document.getElementById("btn-continuar-sin-ubicacion");
  const selectorPais = document.getElementById("selector-pais-manual");
  const elPais = document.getElementById("pais-detectado");

  btnUbicacion?.addEventListener("click", mostrarModalUbicacion);
  btnModalUbicacion?.addEventListener("click", detectarPais);
  btnCerrarModal?.addEventListener("click", cerrarModalUbicacion);
  btnContinuarUsd?.addEventListener("click", () => {
    seleccionarMoneda("USD", "Ecuador / Internacional");
    cerrarModalUbicacion();
  });
  selectorPais?.addEventListener("change", () => aplicarPaisManual(selectorPais.value));

  if (!sessionStorage.getItem(CLAVE_GEO_MODAL)) {
    setTimeout(mostrarModalUbicacion, 900);
  }

  detectarUbicacionPorIP();

  if (localStorage.getItem(CLAVE_MONEDA)) {
    if (elPais) elPais.textContent = `🌎 Moneda: ${monedaActual}`;
    return;
  }

  if (elPais) elPais.textContent = "🌎 Activa ubicación o elige moneda";
}

function mostrarModalUbicacion() {
  const modal = document.getElementById("modal-ubicacion");
  if (!modal) return;
  modal.classList.add("visible");
  modal.setAttribute("aria-hidden", "false");
}

function cerrarModalUbicacion() {
  const modal = document.getElementById("modal-ubicacion");
  if (!modal) return;
  modal.classList.remove("visible");
  modal.setAttribute("aria-hidden", "true");
  sessionStorage.setItem(CLAVE_GEO_MODAL, "1");
}

function aplicarPaisManual(codigoPais) {
  if (!codigoPais) return;
  const moneda = MONEDA_POR_PAIS?.[codigoPais] || "USD";
  const opcion = document.querySelector(`#selector-pais-manual option[value="${codigoPais}"]`);
  const pais = opcion?.textContent?.split("/")[0]?.trim() || "País seleccionado";
  actualizarUbicacionCliente({ pais, codigoPais, zonaHoraria: obtenerZonaHorariaNavegador() });
  seleccionarMoneda(moneda, pais);
  cerrarModalUbicacion();
  renderMundial(true);
  mostrarToast(`Moneda configurada: ${moneda}`, "exito");
}

function seleccionarMoneda(moneda, pais = "") {
  if (!TASAS_CAMBIO[moneda]) return;
  monedaActual = moneda;
  localStorage.setItem(CLAVE_MONEDA, monedaActual);

  const selector = document.getElementById("selector-moneda");
  if (selector) selector.value = monedaActual;

  const elPais = document.getElementById("pais-detectado");
  if (elPais) elPais.textContent = pais ? `${ubicacionCliente.bandera || "🌎"} ${pais} · ${monedaActual}` : `🌎 Moneda: ${monedaActual}`;

  renderCatalogo();
  renderCarrito();
  actualizarDetallePagoCarrito();
}

function actualizarUbicacionCliente({ ciudad = "", pais = "", codigoPais = "", zonaHoraria = "" } = {}) {
  const codigo = String(codigoPais || ubicacionCliente.codigoPais || "EC").toUpperCase();
  ubicacionCliente = {
    ciudad: ciudad || ubicacionCliente.ciudad,
    pais: pais || ubicacionCliente.pais || "Ecuador",
    codigoPais: codigo,
    bandera: banderaDesdeCodigoPais(codigo),
    zonaHoraria: zonaHoraria || ubicacionCliente.zonaHoraria || obtenerZonaHorariaNavegador()
  };
}

function obtenerZonaHorariaNavegador() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Guayaquil";
}

function banderaDesdeCodigoPais(codigoPais) {
  const codigo = String(codigoPais || "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(codigo)) return "🌎";
  return [...codigo]
    .map((letra) => String.fromCodePoint(127397 + letra.charCodeAt(0)))
    .join("");
}

function obtenerEtiquetaHoraCliente() {
  const pais = ubicacionCliente.pais || "Ecuador";
  const bandera = ubicacionCliente.bandera || "🇪🇨";
  return `${bandera} ${pais}`;
}

async function detectarUbicacionPorIP() {
  if (!CONFIG.ipGeoUrl) return;

  try {
    const respuesta = await fetch(CONFIG.ipGeoUrl);
    if (!respuesta.ok) throw new Error(`IP Geo HTTP ${respuesta.status}`);

    const datos = await respuesta.json();
    const ciudad = datos?.city || "";
    const pais = datos?.country_name || datos?.country || "";
    const codigoPais = datos?.country_code || "";
    const zonaHoraria = datos?.timezone || obtenerZonaHorariaNavegador();
    const ubicacion = formatearUbicacion(ciudad, pais);

    actualizarUbicacionCliente({ ciudad, pais, codigoPais, zonaHoraria });

    if (ubicacion) {
      const elPais = document.getElementById("pais-detectado");
      if (elPais) elPais.textContent = `${ubicacionCliente.bandera} ${ubicacion}`;
    }

    if (!localStorage.getItem(CLAVE_MONEDA) && codigoPais) {
      sugerirMonedaPorPais(ubicacion || pais, codigoPais, true, false);
    }

    renderMundial(true);
  } catch (error) {
    console.warn("No se pudo detectar ubicación por IP.", error);
  }
}

function formatearUbicacion(ciudad, pais) {
  const partes = [ciudad, pais].filter(Boolean);
  return partes.join(", ");
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
  const btnModalUbicacion = document.getElementById("btn-modal-activar-ubicacion");
  if (!elPais) return;

  if (!window.isSecureContext) {
    mostrarToast("El GPS solo se activa en HTTPS. Usa Vercel o selecciona tu país manualmente.", "error");
    return;
  }

  if (!navigator.geolocation) {
    elPais.textContent = "🌎 Ubicación no disponible";
    mostrarToast("Tu navegador no permite ubicación. Selecciona tu país manualmente.", "info");
    return;
  }

  elPais.textContent = "📍 Detectando país...";
  if (btnUbicacion) {
    btnUbicacion.disabled = true;
    btnUbicacion.textContent = "📍 Detectando...";
  }
  if (btnModalUbicacion) {
    btnModalUbicacion.disabled = true;
    btnModalUbicacion.textContent = "Detectando ubicación...";
  }

  navigator.geolocation.getCurrentPosition(
    async (posicion) => {
      try {
        const { latitude, longitude } = posicion.coords;
        const respuesta = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const datos = await respuesta.json();
        const pais = datos?.address?.country || "Ubicación detectada";
        const ciudad = datos?.address?.city || datos?.address?.town || datos?.address?.village || datos?.address?.municipality || datos?.address?.state || "";
        const codigoPais = datos?.address?.country_code?.toUpperCase() || "";
        const ubicacion = formatearUbicacion(ciudad, pais) || pais;
        actualizarUbicacionCliente({ ciudad, pais, codigoPais, zonaHoraria: obtenerZonaHorariaNavegador() });
        elPais.textContent = `${ubicacionCliente.bandera} ${ubicacion}`;
        sugerirMonedaPorPais(ubicacion, codigoPais, true);
        renderMundial(true);
        cerrarModalUbicacion();
      } catch {
        elPais.textContent = "🌎 Ubicación GPS detectada";
      }
      if (btnUbicacion) {
        btnUbicacion.disabled = false;
        btnUbicacion.textContent = "📍 Ubicación activa";
      }
      if (btnModalUbicacion) {
        btnModalUbicacion.disabled = false;
        btnModalUbicacion.textContent = "Activar ubicación";
      }
    },
    () => {
      elPais.textContent = "🌎 Ecuador / Internacional";
      if (btnUbicacion) {
        btnUbicacion.disabled = false;
        btnUbicacion.textContent = "📍 Activar ubicación";
      }
      if (btnModalUbicacion) {
        btnModalUbicacion.disabled = false;
        btnModalUbicacion.textContent = "Activar ubicación";
      }
      mostrarToast("No se activó la ubicación. Puedes elegir la moneda manualmente.", "info");
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
}

function sugerirMonedaPorPais(pais, codigoPais = "", forzar = false, mostrarMensaje = true) {
  if (localStorage.getItem(CLAVE_MONEDA) && !forzar) return;
  const monedaPorCodigo = MONEDA_POR_PAIS?.[codigoPais];
  const encontrada = monedaPorCodigo
    ? [monedaPorCodigo, TASAS_CAMBIO[monedaPorCodigo]]
    : Object.entries(TASAS_CAMBIO).find(([, info]) => info.paises?.includes(pais));

  if (!encontrada || !TASAS_CAMBIO[encontrada[0]]) return;
  seleccionarMoneda(encontrada[0], pais);
  if (mostrarMensaje) mostrarToast(`Moneda sugerida: ${encontrada[0]}`, "exito");
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
  if (plan.consultar) {
    const mensajeConsulta = encodeURIComponent(`Hola, deseo consultar disponibilidad de ${producto.nombre}.`);
    window.open(`${CONFIG.whatsappLink}?text=${mensajeConsulta}`, "_blank", "noopener,noreferrer");
    return;
  }

  const precio = `$${Number(plan.precio).toFixed(2)} USD`;
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

  if (metodoPagoActual === "paypalme") {
    setTimeout(inicializarPayPalCheckout, 50);
  }

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
      document.getElementById("paypal-cart-box")?.scrollIntoView({ behavior: "smooth", block: "center" });
      mostrarToast("Usa el botón de PayPal dentro del carrito o PayPal.Me.", "info");
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
  const paypalBox = document.getElementById("paypal-cart-box");
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
      <button class="btn btn--ghost btn--full" onclick="enviarComprobanteWhatsApp()">Enviar comprobante por WhatsApp</button>
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
      <p>Usa el botón PayPal que aparece debajo o paga con PayPal.Me.</p>
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

  if (paypalBox) {
    paypalBox.classList.toggle("visible", metodoPagoActual === "paypalme");
  }
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
  const contenedor = document.getElementById("paypal-button-container-carrito");
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
          description: "Compra Click Tv Streaming",
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
  }).render("#paypal-button-container-carrito");

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
async function renderMundial(silencioso = false) {
  const box = document.getElementById("mundial-grid");
  if (!box) return;

  if (!silencioso) {
    box.innerHTML = `<div class="loading-card">⚽ Cargando información del Mundial 2026...</div>`;
  }

  try {
    const partidosAPI = await obtenerPartidosFootballData();
    const partidos = normalizarPartidos(partidosAPI).filter(tieneEquiposReales);
    const html = renderizarBloquesMundial(partidos);
    box.innerHTML = html || renderizarRespaldoMundial();
  } catch (error) {
    console.warn("No se pudo cargar Football-Data:", error);
    box.innerHTML = renderizarRespaldoMundial();
  }
}

async function obtenerPartidosFootballData() {
  const params = new URLSearchParams({
    dateFrom: fechaEcuador(-1),
    dateTo: fechaEcuador(6)
  });

  const respuesta = await fetch(`${CONFIG.footballDataApiUrl}?${params.toString()}`, {
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
    statusRaw: m.status || "",
    estado: traducirEstadoPartido(m.status),
    marcador: crearMarcador(m.score)
  })).filter((m) => m.fechaUTC);
}

function tieneEquiposReales(partido) {
  const texto = `${partido.local} ${partido.visitante}`.toLowerCase();
  return !/(equipo|ganador|grupo|third|runner|tbd|por confirmar)/i.test(texto);
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
        marcador: p.marcador || "",
        etapa: p.etapa || grupo.grupo || "Mundial 2026"
      });
    });
  });
  return lista;
}

function renderizarRespaldoMundial() {
  const locales = Array.isArray(MUNDIAL_2026) ? normalizarPartidosLocales(MUNDIAL_2026) : [];
  const htmlLocal = renderizarBloquesMundial(locales);
  return htmlLocal || renderMundialFallback();
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
  const fechaTexto = formatearFechaPartidoCliente(fecha);
  const horaTexto = formatearHoraPartidoCliente(fecha);
  const estadoTiempo = obtenerTextoTiempoPartido(p);
  const scoreTexto = obtenerScoreTexto(p, estadoTiempo);

  return `
    <article class="match-card">
      <div class="match-card__topline">
        <span class="status">${estadoTiempo.estado}</span>
        <div class="match-scorebox">
          <span>Marcador</span>
          <strong>${scoreTexto}</strong>
        </div>
      </div>
      <p class="match-group">${p.grupo}</p>
      <h4>${p.local} <span>vs</span> ${p.visitante}</h4>
      <p class="match-countdown">${estadoTiempo.detalle}</p>
      <p>📅 ${fechaTexto}</p>
      <p>⏰ ${horaTexto} ${obtenerEtiquetaHoraCliente()}</p>
      <p>📍 ${p.sede}</p>
      ${p.etapa ? `<p class="match-score">${p.etapa}</p>` : ""}
    </article>
  `;
}

function formatearFechaPartidoCliente(fecha) {
  return fecha.toLocaleDateString("es-EC", {
    timeZone: ubicacionCliente.zonaHoraria || obtenerZonaHorariaNavegador(),
    weekday: "short",
    day: "2-digit",
    month: "short"
  });
}

function formatearHoraPartidoCliente(fecha) {
  return fecha.toLocaleTimeString("es-EC", {
    timeZone: ubicacionCliente.zonaHoraria || obtenerZonaHorariaNavegador(),
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function obtenerScoreTexto(partido, estadoTiempo) {
  if (partido.marcador) return partido.marcador;
  if (estadoTiempo.estado.includes("EN VIVO")) return "En vivo";
  if (estadoTiempo.estado.includes("Finalizado")) return "Sin marcador";
  return "Por iniciar";
}

function obtenerTextoTiempoPartido(partido) {
  const raw = String(partido.statusRaw || "").toUpperCase();
  if (["LIVE", "IN_PLAY"].includes(raw)) {
    return { estado: "🔴 EN VIVO", detalle: "Partido en vivo ahora" };
  }
  if (raw === "PAUSED") {
    return { estado: "⏸️ Descanso", detalle: "Partido en descanso" };
  }
  if (raw === "FINISHED") {
    return { estado: "⚫ Finalizado", detalle: "Partido finalizado" };
  }

  const inicio = new Date(partido.fechaUTC);
  if (isNaN(inicio.getTime())) {
    return { estado: partido.estado || "⚽ Programado", detalle: "Horario por confirmar" };
  }

  const ahora = new Date();
  const diffMs = inicio.getTime() - ahora.getTime();
  const finEstimado = new Date(inicio.getTime() + 120 * 60 * 1000);

  if (diffMs > 0) {
    return { estado: "🟡 Programado", detalle: `Faltan ${formatearTiempoRestante(diffMs)}` };
  }

  if (ahora <= finEstimado) {
    return { estado: "🔴 EN VIVO", detalle: "Partido en vivo ahora" };
  }

  return { estado: "⚫ Finalizado", detalle: "Partido finalizado" };
}

function formatearTiempoRestante(ms) {
  const totalMinutos = Math.max(1, Math.ceil(ms / 60000));
  const dias = Math.floor(totalMinutos / 1440);
  const horas = Math.floor((totalMinutos % 1440) / 60);
  const minutos = totalMinutos % 60;

  if (dias > 0) {
    return horas > 0 ? `${dias} día${dias === 1 ? "" : "s"} y ${horas} hora${horas === 1 ? "" : "s"}` : `${dias} día${dias === 1 ? "" : "s"}`;
  }

  if (horas > 0) {
    return minutos > 0 ? `${horas} hora${horas === 1 ? "" : "s"} y ${minutos} min` : `${horas} hora${horas === 1 ? "" : "s"}`;
  }

  return `${minutos} min`;
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
  return ahora.toLocaleDateString("en-CA", { timeZone: ubicacionCliente.zonaHoraria || "America/Guayaquil" });
}

function fechaDesdeUTCEnEcuador(fechaUTC) {
  const fecha = new Date(fechaUTC);
  if (isNaN(fecha.getTime())) return "";
  return fecha.toLocaleDateString("en-CA", { timeZone: ubicacionCliente.zonaHoraria || "America/Guayaquil" });
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
  if (!score) return "";
  const fuente = score.fullTime || score.regularTime || score.halfTime || {};
  const home = fuente.home;
  const away = fuente.away;
  if (home === null || away === null || home === undefined || away === undefined) return "";
  return `${home} - ${away}`;
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

function actualizarUsuariosConectados() {
  const usuarios = document.getElementById("usuarios-conectados");
  if (!usuarios) return;

  const variacion = Math.floor(Math.random() * 7) - 3;
  usuariosConectados = Math.min(92, Math.max(38, usuariosConectados + variacion));
  usuarios.textContent = usuariosConectados;
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
