/* ========================================================================== 
   CLICK TV STREAMING MUNDIAL 2026 — script.js
   Lógica principal: carrito, pagos, moneda, API Mundial, UI y botones
   ========================================================================== */

const CLAVE_CARRITO = "clicktv_carrito";
const CLAVE_MONEDA = "clicktv_moneda";
const CLAVE_CUPON = "clicktv_cupon";
const CLAVE_VENTAS = "clicktv_ventas";
const CLAVE_GEO_MODAL = "clicktv_geo_modal_visto";
const CLAVE_RESENAS_CLIENTES = "clicktv_resenas_clientes";

let carrito = [];
let monedaActual = "USD";
let cuponAplicado = null;
let paypalRenderizado = false;
let indiceActividad = 0;
let indiceResena = 0;
let metodoPagoActual = "transferencia";
let usuariosConectados = 48;
let cuponAhorroAplicado = null;
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
  inicializarCalculadoraAhorro();
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
  document.getElementById("form-resena-carrito")?.addEventListener("submit", registrarResenaCarrito);
  document.getElementById("form-contacto-internacional")?.addEventListener("submit", enviarContactoInternacional);

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

  inicializarRadioLaRed();
  inicializarTeleamazonasPlayer();
  inicializarBuscadorMaestro();

  // Botones flotantes
  inicializarBotonesFlotantes();
  actualizarDetallePagoCarrito();
  renderResenasCarrito();
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
  const renovar = document.getElementById("link-renovar-servicio");

  if (deuna) configurarLinkExterno(deuna, CONFIG.deunaUrl);
  if (payphone) configurarLinkExterno(payphone, CONFIG.payphoneUrl);
  if (paypalme) configurarLinkExterno(paypalme, CONFIG.paypalUrl);
  if (catalogo) configurarLinkExterno(catalogo, CONFIG.catalogoUrl);
  if (fifa) configurarLinkExterno(fifa, CONFIG.fifaCalendarioUrl);
  if (renovar) {
    const mensaje = encodeURIComponent("Hola, deseo renovar mi servicio Click Tv Streaming.");
    configurarLinkExterno(renovar, `${CONFIG.whatsappLink}?text=${mensaje}`);
  }

}

function inicializarTeleamazonasPlayer() {
  const linkOficial = document.getElementById("teleamazonas-link-oficial");
  if (!linkOficial || typeof CONFIG === "undefined" || !CONFIG.teleamazonasUrl) return;
  configurarLinkExterno(linkOficial, CONFIG.teleamazonasUrl);
}

function inicializarRadioLaRed() {
  const radioPlayer = document.getElementById("radio-player");
  const radioStatus = document.getElementById("radio-status");
  if (!radioPlayer || typeof CONFIG === "undefined" || !CONFIG.radioStreamUrl) return;

  let usuarioQuiereRadio = false;
  let temporizadorReconexion = null;
  let reconexionEnCurso = false;

  radioPlayer.preload = "auto";
  if (!radioPlayer.getAttribute("src")) {
    radioPlayer.src = CONFIG.radioStreamUrl;
  }

  configurarMediaSessionRadio(radioPlayer);

  const actualizarEstadoRadio = (mensaje) => {
    if (radioStatus) radioStatus.textContent = mensaje;
  };

  const reproducirRadio = async () => {
    usuarioQuiereRadio = true;
    actualizarEstadoRadio("Cargando señal en vivo...");

    try {
      await radioPlayer.play();
    } catch {
      actualizarEstadoRadio("Presiona reproducir para reactivar la señal.");
    }
  };

  const reconectarRadio = async () => {
    if (!usuarioQuiereRadio || reconexionEnCurso) return;
    reconexionEnCurso = true;
    clearTimeout(temporizadorReconexion);
    actualizarEstadoRadio("Reconectando señal en vivo...");

    const estabaEnSilencio = radioPlayer.muted;
    const volumen = radioPlayer.volume;
    radioPlayer.src = CONFIG.radioStreamUrl;
    radioPlayer.load();
    radioPlayer.muted = estabaEnSilencio;
    radioPlayer.volume = volumen;

    await reproducirRadio();
    reconexionEnCurso = false;
  };

  const programarReconexionRadio = () => {
    if (!usuarioQuiereRadio) return;
    clearTimeout(temporizadorReconexion);
    temporizadorReconexion = setTimeout(reconectarRadio, 2500);
  };

  radioPlayer.addEventListener("play", () => {
    usuarioQuiereRadio = true;
    actualizarEstadoRadio("Cargando señal en vivo...");
  });

  radioPlayer.addEventListener("playing", () => {
    clearTimeout(temporizadorReconexion);
    usuarioQuiereRadio = true;
    actualizarEstadoRadio("Señal en vivo activa.");
  });

  radioPlayer.addEventListener("pause", () => {
    if (!document.hidden) usuarioQuiereRadio = false;
  });

  radioPlayer.addEventListener("waiting", programarReconexionRadio);
  radioPlayer.addEventListener("stalled", programarReconexionRadio);
  radioPlayer.addEventListener("ended", reconectarRadio);

  window.addEventListener("online", reconectarRadio);
  window.addEventListener("pageshow", () => {
    if (usuarioQuiereRadio && radioPlayer.paused) reconectarRadio();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      usuarioQuiereRadio = usuarioQuiereRadio || !radioPlayer.paused;
      return;
    }

    if (usuarioQuiereRadio && radioPlayer.paused) {
      reconectarRadio();
    }
  });

  radioPlayer.addEventListener("error", () => {
    actualizarEstadoRadio("La radio se cortó o la emisora restringe el acceso. Intentando reconectar...");
    programarReconexionRadio();
  });
}

function configurarMediaSessionRadio(radioPlayer) {
  if (!("mediaSession" in navigator)) return;

  if ("MediaMetadata" in window) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: "La Red 102.1 FM en vivo",
      artist: "Click Tv Streaming",
      album: "Programación deportiva"
    });
  }

  try {
    navigator.mediaSession.setActionHandler("play", () => radioPlayer.play());
    navigator.mediaSession.setActionHandler("pause", () => radioPlayer.pause());
  } catch {
    // Algunos navegadores no permiten registrar acciones de Media Session.
  }
}

function inicializarBuscadorMaestro() {
  const input = document.getElementById("buscador-maestro");
  const boton = document.getElementById("btn-buscar-maestro");
  if (!input || !boton) return;

  const ejecutarBusqueda = () => buscarServicioMaestro(input.value);

  boton.addEventListener("click", ejecutarBusqueda);
  input.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
      evento.preventDefault();
      ejecutarBusqueda();
    }
  });
}

function buscarServicioMaestro(consulta) {
  const termino = normalizarTexto(consulta || "");
  if (!termino) {
    mostrarToast("Escribe el servicio que deseas buscar.", "info");
    return;
  }

  const producto = PRODUCTOS.find((item) => {
    const texto = [
      item.nombre,
      item.descripcion,
      item.categoria,
      ...(item.etiquetas || []),
      ...(item.planes || []).map((plan) => plan.tipo)
    ].join(" ");
    return normalizarTexto(texto).includes(termino);
  });

  if (!producto) {
    document.getElementById("streaming")?.scrollIntoView({ behavior: "smooth", block: "start" });
    mostrarToast("No encontré ese servicio. Revisa el catálogo o consulta por WhatsApp.", "info");
    return;
  }

  if (typeof seleccionarCategoriaCatalogo === "function") {
    seleccionarCategoriaCatalogo(producto.categoria || "todos");
  }

  setTimeout(() => {
    const card = document.querySelector(`[data-producto="${producto.id}"]`);
    card?.scrollIntoView({ behavior: "smooth", block: "center" });
    card?.classList.add("product-card--highlight");
    setTimeout(() => card?.classList.remove("product-card--highlight"), 2200);
  }, 80);

  mostrarToast(`Servicio encontrado: ${producto.nombre}`, "exito");
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
    normalizarCarritoDesdeCatalogo();
    cuponAplicado = null;
    localStorage.removeItem(CLAVE_CUPON);
  } catch {
    carrito = [];
    cuponAplicado = null;
    localStorage.removeItem(CLAVE_CUPON);
  }
}

function normalizarCarritoDesdeCatalogo() {
  if (!Array.isArray(carrito) || typeof PRODUCTOS === "undefined") return;

  carrito = carrito.map((item) => {
    const producto = PRODUCTOS.find((p) => p.id === item.productoId);
    const plan = producto?.planes?.find((p) => p.tipo === item.plan);
    if (!plan) return item;

    return {
      ...item,
      precio: Number(plan.precio),
      ivaIncluido: Boolean(plan.ivaIncluido),
      bloquearDescuento: Boolean(plan.bloquearDescuento)
    };
  });
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
    existente.ivaIncluido = existente.ivaIncluido || Boolean(plan.ivaIncluido);
    existente.bloquearDescuento = existente.bloquearDescuento || Boolean(plan.bloquearDescuento);
  } else {
    carrito.push({
      itemId,
      productoId: producto.id,
      nombre: producto.nombre,
      icono: producto.icono,
      plan: plan.tipo,
      precio: Number(plan.precio),
      cantidad: 1,
      ivaIncluido: Boolean(plan.ivaIncluido),
      bloquearDescuento: Boolean(plan.bloquearDescuento),
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
    const mensajeConsulta = encodeURIComponent(`Hola, deseo consultar disponibilidad de ${producto.nombre} (${plan.tipo}). ¿Me confirma stock, precio y condiciones antes de pagar?`);
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
          <p class="carrito-item__plan">${item.plan} · ${formatearPrecio(item.precio)}${item.ivaIncluido ? " · Precio final" : ""}${item.bloquearDescuento ? " · Sin cupón" : ""}</p>
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

  const cuponManualActivo = obtenerCuponManualActivo();
  const elCuponInfo = document.getElementById("cupon-info");
  if (elCuponInfo) {
    elCuponInfo.textContent = cuponManualActivo
      ? `Cupón aplicado manualmente: ${cuponManualActivo.codigo} (${cuponManualActivo.porcentaje}% de descuento). No aplica a recargas o combos oficiales de operadora.`
      : "";
  }
}

function calcularTotales() {
  const cuponManualActivo = obtenerCuponManualActivo();
  const subtotal = carrito.reduce((acc, item) => acc + Number(item.precio) * Number(item.cantidad), 0);
  const subtotalDescontable = carrito.reduce((acc, item) => {
    if (item.bloquearDescuento) return acc;
    return acc + Number(item.precio) * Number(item.cantidad);
  }, 0);
  const descuento = cuponManualActivo ? subtotalDescontable * (Number(cuponManualActivo.porcentaje) / 100) : 0;
  const base = Math.max(subtotal - descuento, 0);
  const subtotalGravado = carrito.reduce((acc, item) => {
    if (item.ivaIncluido) return acc;
    return acc + Number(item.precio) * Number(item.cantidad);
  }, 0);
  const subtotalGravadoDescontable = carrito.reduce((acc, item) => {
    if (item.ivaIncluido || item.bloquearDescuento) return acc;
    return acc + Number(item.precio) * Number(item.cantidad);
  }, 0);
  const descuentoGravado = cuponManualActivo ? subtotalGravadoDescontable * (Number(cuponManualActivo.porcentaje) / 100) : 0;
  const baseGravada = Math.max(subtotalGravado - descuentoGravado, 0);
  const iva = baseGravada * CONFIG.ivaPorcentaje;
  const total = base + iva;
  const totalPaypal = total > 0
    ? (total + CONFIG.paypalComisionFija) / (1 - CONFIG.paypalComisionPorcentaje)
    : 0;

  return { subtotal, descuento, base, iva, total, totalPaypal };
}

function obtenerCuponManualActivo() {
  return cuponAplicado && cuponAplicado.manual === true ? cuponAplicado : null;
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
// CALCULADORA DE AHORRO
// ---------------------------------------------------------------------------
const SERVICIOS_AHORRO = [
  { id: "netflix-extra", plan: "1 mes", nombre: "Netflix Perfil Extra", precioNormal: 9.99 },
  { id: "disney-estandar", plan: "1 mes", nombre: "Disney Estándar", precioNormal: 7.99 },
  { id: "prime-video", plan: "1 mes", nombre: "Prime Video", precioNormal: 5.99 },
  { id: "paramount-plus", plan: "1 mes", nombre: "Paramount+", precioNormal: 5.99 },
  { id: "zapping-pro", plan: "Cuenta individual · 1 dispositivo · 1 mes", nombre: "Zapping Pro", precioNormal: 14.99 }
];

function inicializarCalculadoraAhorro() {
  const contenedor = document.getElementById("ahorro-servicios");
  if (!contenedor || typeof PRODUCTOS === "undefined") return;

  contenedor.innerHTML = SERVICIOS_AHORRO.map((servicio, index) => {
    const data = obtenerServicioAhorro(servicio);
    if (!data) return "";

    return `
      <label class="saving-option">
        <input type="checkbox" value="${servicio.id}" ${index < 3 ? "checked" : ""}>
        <span>
          <strong>${servicio.nombre}</strong>
          <small>${data.plan.tipo} · Click TV ${formatearPrecio(data.plan.precio)} · Normal ref. $${servicio.precioNormal.toFixed(2)}</small>
        </span>
      </label>
    `;
  }).join("");

  contenedor.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", actualizarCalculadoraAhorro);
  });

  document.getElementById("btn-aplicar-cupon-ahorro")?.addEventListener("click", aplicarCuponAhorro);
  document.getElementById("btn-ahorro-whatsapp")?.addEventListener("click", enviarAhorroWhatsApp);
  actualizarCalculadoraAhorro();
}

function obtenerServicioAhorro(servicio) {
  const producto = PRODUCTOS.find((item) => item.id === servicio.id);
  const plan = producto?.planes?.find((item) => item.tipo === servicio.plan);
  if (!producto || !plan) return null;
  return { producto, plan };
}

function obtenerServiciosAhorroSeleccionados() {
  const seleccionados = [...document.querySelectorAll("#ahorro-servicios input:checked")].map((input) => input.value);
  return SERVICIOS_AHORRO
    .filter((servicio) => seleccionados.includes(servicio.id))
    .map((servicio) => ({ ...servicio, data: obtenerServicioAhorro(servicio) }))
    .filter((servicio) => servicio.data);
}

function calcularAhorroSeleccionado() {
  const seleccionados = obtenerServiciosAhorroSeleccionados();
  const normal = seleccionados.reduce((acc, item) => acc + Number(item.precioNormal), 0);
  const subtotal = seleccionados.reduce((acc, item) => acc + Number(item.data.plan.precio), 0);
  const descuento = cuponAhorroAplicado ? subtotal * (Number(cuponAhorroAplicado.porcentaje) / 100) : 0;
  const base = Math.max(subtotal - descuento, 0);
  const iva = base * Number(CONFIG.ivaPorcentaje || 0);
  const total = base + iva;
  const ahorro = Math.max(normal - total, 0);

  return { seleccionados, normal, subtotal, descuento, iva, total, ahorro };
}

function actualizarCalculadoraAhorro() {
  const totales = calcularAhorroSeleccionado();
  actualizarTexto("ahorro-normal", formatearPrecio(totales.normal));
  actualizarTexto("ahorro-subtotal", formatearPrecio(totales.subtotal));
  actualizarTexto("ahorro-cupon", `- ${formatearPrecio(totales.descuento)}`);
  actualizarTexto("ahorro-iva", formatearPrecio(totales.iva));
  actualizarTexto("ahorro-total", formatearPrecio(totales.total));
  actualizarTexto("ahorro-total-ahorrado", formatearPrecio(totales.ahorro));
  actualizarTexto("ahorro-cupon-info", cuponAhorroAplicado ? `Cupón aplicado manualmente: ${cuponAhorroAplicado.codigo}` : "Sin cupón aplicado.");
}

function aplicarCuponAhorro() {
  const input = document.getElementById("input-cupon-ahorro");
  if (!input) return;

  const codigo = normalizarCuponCodigo(input.value);
  if (!codigo) return mostrarToast("Ingresa un cupón para la calculadora.", "error");

  const cupon = CUPONES[codigo];
  if (!cupon) return mostrarToast("Cupón inválido en la calculadora.", "error");

  cuponAhorroAplicado = { codigo, porcentaje: cupon.porcentaje, manual: true };
  input.value = codigo;
  actualizarCalculadoraAhorro();
  mostrarToast(`Cupón ${codigo} aplicado manualmente en la calculadora.`, "exito");
}

function enviarAhorroWhatsApp() {
  const totales = calcularAhorroSeleccionado();
  if (!totales.seleccionados.length) return mostrarToast("Selecciona al menos un servicio para consultar.", "error");

  const servicios = totales.seleccionados
    .map((item) => `• ${item.nombre} (${item.data.plan.tipo})`)
    .join("\n");

  const mensaje = encodeURIComponent(
    `Hola, deseo consultar este combo simulado:\n${servicios}\n\nSubtotal Click TV: $${totales.subtotal.toFixed(2)} USD\nCupón aplicado: ${cuponAhorroAplicado ? `${cuponAhorroAplicado.codigo} (-$${totales.descuento.toFixed(2)} USD)` : "Sin cupón"}\nIVA Ecuador: $${totales.iva.toFixed(2)} USD\nTotal estimado: $${totales.total.toFixed(2)} USD\nAhorro aproximado: $${totales.ahorro.toFixed(2)} USD\n\nPor favor confirmar disponibilidad y precio final.`
  );

  window.open(`${CONFIG.whatsappLink}?text=${mensaje}`, "_blank", "noopener,noreferrer");
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

  cuponAplicado = { codigo, porcentaje: cupon.porcentaje, manual: true };
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
  const ivaEtiqueta = Math.round(CONFIG.ivaPorcentaje * 100);
  const cuponManualActivo = obtenerCuponManualActivo();
  return `Hola, quiero finalizar mi compra:\n${resumen}\n\nMétodo elegido: ${obtenerNombreMetodoPago(metodoPagoActual)}\nSubtotal: $${totales.subtotal.toFixed(2)} USD\nDescuento aplicado: $${totales.descuento.toFixed(2)} USD\nIVA ${ivaEtiqueta}% Ecuador cuando aplica: $${totales.iva.toFixed(2)} USD\nTotal: $${totales.total.toFixed(2)} USD${cuponManualActivo ? `\nCupón: ${cuponManualActivo.codigo} (no aplica a recargas o combos oficiales de operadora)` : ""}\n\nPor favor confirmar disponibilidad y pasos para activar.`;
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
    const partidosApiNormalizados = normalizarPartidos(partidosAPI).filter(tieneEquiposReales);
    const partidosLocales = Array.isArray(MUNDIAL_2026) ? normalizarPartidosLocales(MUNDIAL_2026).filter(tieneEquiposReales) : [];
    const partidos = combinarPartidosMundial(partidosApiNormalizados, partidosLocales);
    const html = renderizarBloquesMundial(partidos);
    iniciarCronometroMundial();
    box.innerHTML = html || `
      <div class="loading-card">
        ⚽ No hay partidos disponibles actualmente.
        <br>Sincronizando Mundial 2026...
      </div>`;
  } catch (error) {
    console.warn("No se pudo cargar Football-Data:", error);
    box.innerHTML = `
      <div class="loading-card">
        ⚽ No se pudo conectar con la API del Mundial.
        <br>Se reintentará automáticamente.
      </div>`;
  }
}

async function obtenerPartidosFootballData() {
  const params = new URLSearchParams({
    dateFrom: fechaConsultaMundial(-2),
    dateTo: fechaConsultaMundial(8)
  });

  const respuesta = await fetch("/api/mundial");

  if (!respuesta.ok) throw new Error(`API Mundial HTTP ${respuesta.status}`);
  const data = await respuesta.json();
  const matches = Array.isArray(data)
    ? data
    : (data.matches || data.partidos || []);
  return enriquecerPartidosConDetalle(matches);
}

async function enriquecerPartidosConDetalle(matches) {
  const prioritarios = matches
    .filter(debeCargarDetallePartido)
    .sort(ordenarPartidosPorPrioridadDetalle)
    .slice(0, 3);

  if (!prioritarios.length) return matches;

  const resultados = await Promise.allSettled(prioritarios.map((m) => obtenerDetallePartidoFootballData(m.id)));
  const detalles = new Map();

  resultados.forEach((resultado) => {
    if (resultado.status === "fulfilled" && resultado.value?.id) {
      detalles.set(resultado.value.id, resultado.value);
    }
  });

  return matches.map((m) => detalles.has(m.id) ? { ...m, ...detalles.get(m.id) } : m);
}

function debeCargarDetallePartido(match) {
  const status = String(match.status || "").toUpperCase();
  return Boolean(match.id) && ["LIVE", "IN_PLAY", "PAUSED", "FINISHED"].includes(status);
}

function ordenarPartidosPorPrioridadDetalle(a, b) {
  const prioridad = { LIVE: 1, IN_PLAY: 1, PAUSED: 2, FINISHED: 3 };
  const estadoA = prioridad[String(a.status || "").toUpperCase()] || 9;
  const estadoB = prioridad[String(b.status || "").toUpperCase()] || 9;
  if (estadoA !== estadoB) return estadoA - estadoB;
  return new Date(b.utcDate || 0) - new Date(a.utcDate || 0);
}

async function obtenerDetallePartidoFootballData(id) {
  const url = new URL(CONFIG.footballDataApiUrl);
  url.pathname = `/v4/matches/${id}`;
  url.search = "";

  const respuesta = await fetch(url.toString(), {
    headers: { "X-Auth-Token": CONFIG.footballDataApiToken }
  });

  if (!respuesta.ok) throw new Error(`Football-Data detail HTTP ${respuesta.status}`);
  return respuesta.json();
}

function normalizarPartidos(matches) {
  return matches.map((m) => ({
    id: m.id || "",
    grupo: m.group || m.stage || m.competition?.name || "Mundial 2026",
    local: traducirPais(m.homeTeam?.name || m.homeTeam?.shortName || "Equipo local"),
visitante: traducirPais(m.awayTeam?.name || m.awayTeam?.shortName || "Equipo visitante"),
    codigoLocal: m.homeTeam?.tla || m.homeTeam?.area?.code || "",
    codigoVisitante: m.awayTeam?.tla || m.awayTeam?.area?.code || "",
    escudoLocal: m.homeTeam?.crest || "",
    escudoVisitante: m.awayTeam?.crest || "",
    fechaUTC: m.utcDate,
    sede: m.venue || "Sede por confirmar",
    statusRaw: m.status || "",
    statusDetalle: m.statusDetail || m.matchStatus || m.period || m.stage || "",
    minuto: m.minute || m.matchMinute || m.time?.minute || "",
    injuryTime: m.injuryTime || "",
    score: m.score || null,
    goles: Array.isArray(m.goals) ? m.goals : [],
    bookings: Array.isArray(m.bookings) ? m.bookings : [],
    substitutions: Array.isArray(m.substitutions) ? m.substitutions : [],
    lastUpdated: m.lastUpdated || "",
    estado: traducirEstadoPartido(m.status),
    marcador: crearMarcador(m.score)
  })).filter((m) => m.fechaUTC);
}
function traducirPais(nombre = "") {
  const paises = {
    "Argentina": "Argentina",
    "Switzerland": "Suiza",
    "England": "Inglaterra",
    "France": "Francia",
    "Spain": "España",
    "Germany": "Alemania",
    "Brazil": "Brasil",
    "Portugal": "Portugal",
    "Netherlands": "Países Bajos",
    "Belgium": "Bélgica",
    "Croatia": "Croacia",
    "Japan": "Japón",
    "South Korea": "Corea del Sur",
    "United States": "Estados Unidos",
    "Mexico": "México",
    "Morocco": "Marruecos",
    "Senegal": "Senegal",
    "Norway": "Noruega",
    "Ecuador": "Ecuador",
    "Italy": "Italia",
    "Uruguay": "Uruguay",
    "Colombia": "Colombia"
  };

  return paises[nombre] || nombre;
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
        codigoLocal: p.codigoLocal || "",
        codigoVisitante: p.codigoVisitante || "",
        fechaUTC: p.fechaUTC,
        sede: p.sede || "Sede por confirmar",
        statusRaw: p.statusRaw || "",
        statusDetalle: p.statusDetalle || "",
        minuto: p.minuto || "",
        injuryTime: p.injuryTime || "",
        score: p.score || null,
        goles: Array.isArray(p.goles) ? p.goles : [],
        bookings: Array.isArray(p.bookings) ? p.bookings : [],
        substitutions: Array.isArray(p.substitutions) ? p.substitutions : [],
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

function combinarPartidosMundial(api, locales) {
  const mapa = new Map();

  locales.forEach((partido) => {
    mapa.set(crearClavePartidoMundial(partido), partido);
  });

  api.forEach((partido) => {
    const clave = crearClavePartidoMundial(partido);
    mapa.set(clave, fusionarPartidosMundial(mapa.get(clave), partido));
  });

  return [...mapa.values()].sort((a, b) => new Date(a.fechaUTC) - new Date(b.fechaUTC));
}

function crearClavePartidoMundial(partido) {
  const fecha = new Date(partido.fechaUTC);
  const dia = isNaN(fecha.getTime()) ? partido.fechaUTC : fecha.toISOString().slice(0, 10);
  const local = normalizarClaveEquipoMundial(partido.local || "");
  const visitante = normalizarClaveEquipoMundial(partido.visitante || "");
  return `${dia}-${local}-${visitante}`;
}

function fusionarPartidosMundial(base = {}, nuevo = {}) {
  return {
    ...base,
    ...nuevo,
    marcador: nuevo.marcador || base.marcador || "",
    score: tieneMarcadorEnScore(nuevo.score) ? nuevo.score : (base.score || nuevo.score || null),
    etapa: nuevo.etapa || base.etapa || "",
    sede: nuevo.sede || base.sede || "Sede por confirmar"
  };
}

function tieneMarcadorEnScore(score) {
  return Boolean(crearMarcador(score));
}

function normalizarClaveEquipoMundial(nombre = "") {
  const clave = normalizarTexto(nombre);
  const alias = {
    usa: "estados-unidos",
    us: "estados-unidos",
    "united-states": "estados-unidos",
    "estados-unidos": "estados-unidos",
    "estados-unidos-de-america": "estados-unidos",
    england: "inglaterra",
    inglaterra: "inglaterra",
    "dr-congo": "rd-congo",
    "congo-dr": "rd-congo",
    "rd-congo": "rd-congo",
    "democratic-republic-of-the-congo": "rd-congo",
    "republica-democratica-del-congo": "rd-congo",
    "bosnia-herzegovina": "bosnia-y-herzegovina",
    "bosnia-and-herzegovina": "bosnia-y-herzegovina",
    "bosnia-y-herzegovina": "bosnia-y-herzegovina",
    "ivory-coast": "costa-de-marfil",
    "cote-d-ivoire": "costa-de-marfil",
    "costa-de-marfil": "costa-de-marfil",
    netherlands: "paises-bajos",
    "paises-bajos": "paises-bajos",
    germany: "alemania",
    alemania: "alemania",
    belgium: "belgica",
    belgica: "belgica",
    algeria: "argelia",
    argelia: "argelia",
    egypt: "egipto",
    egipto: "egipto",
    "cape-verde": "cabo-verde",
    "cabo-verde-islands": "cabo-verde",
    "cabo-verde": "cabo-verde",
    mexico: "mexico",
    ecuador: "ecuador",
    argentina: "argentina",
    suiza: "suiza",
    switzerland: "suiza",
    norway: "noruega",
    noruega: "noruega",
    brazil: "brasil",
    brasil: "brasil",
    japan: "japon",
    japon: "japon",
    france: "francia",
    francia: "francia",
    morocco: "marruecos",
    marruecos: "marruecos",
    spain: "espana",
    espana: "espana",
    portugal: "portugal",
    croatia: "croacia",
    croacia: "croacia",
    senegal: "senegal",
    egypt: "egipto",
    egipto: "egipto"
  };

  return alias[clave] || clave;
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

  const fechasPrincipales = new Set(bloques.map((bloque) => bloque.fecha));
  const clavesMostradas = new Set();

  let html = bloques.map((bloque) => {
    const items = partidos.filter((p) => fechaDesdeUTCEnEcuador(p.fechaUTC) === bloque.fecha);
    items.forEach((p) => clavesMostradas.add(crearClavePartidoMundial(p)));
    return crearBloquePartidos(bloque.titulo, items);
  }).join("");

  const proximos = partidos
    .filter((p) => new Date(p.fechaUTC) > new Date())
    .filter((p) => !fechasPrincipales.has(fechaDesdeUTCEnEcuador(p.fechaUTC)))
    .filter((p) => !clavesMostradas.has(crearClavePartidoMundial(p)))
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
  const estadoTiempo = obtenerTextoTiempoPartido(p);
  const scoreTexto = obtenerScoreTexto(p, estadoTiempo);
  return `
    <article class="match-card mundial-pantalla-gigante ${estadoTiempo.estado.includes("EN VIVO") ? "mundial-live" : ""}">
      <div class="mundial-live-status">${estadoTiempo.estado}</div>
      <p class="match-group">${p.grupo}</p>
      <div class="mundial-duelo">
        <div class="mundial-team">
          ${p.escudoLocal ? `<img class="mundial-escudo" src="${p.escudoLocal}" alt="${p.local}">` : crearNombreEquipoConBandera(p.local,p.codigoLocal)}
          <strong>${p.local}</strong>
        </div>
        <div class="mundial-marcador">
          <strong>${scoreTexto}</strong>
          <span>${estadoTiempo.detalle}</span>
          <div class="mundial-cronometro" data-fecha="${p.fechaUTC}">⏱</div>
        </div>
        <div class="mundial-team">
          ${p.escudoVisitante ? `<img class="mundial-escudo" src="${p.escudoVisitante}" alt="${p.visitante}">` : crearNombreEquipoConBandera(p.visitante,p.codigoVisitante)}
          <strong>${p.visitante}</strong>
        </div>
      </div>
      <p>📅 ${formatearFechaPartidoCliente(fecha)}</p>
      <p>⏰ ${formatearHoraPartidoCliente(fecha)} ${obtenerEtiquetaHoraCliente()}</p>
      <p>📍 ${p.sede}</p>
    </article>`;
}
function crearNombreEquipoConBandera(nombre, codigo = "") {
  const bandera = obtenerBanderaEquipo(nombre, codigo);
  return `<span class="team-name">${bandera ? `<span class="team-flag team-flag--uniforme ${normalizarTextoPais(nombre).includes("argentina") ? "bandera-argentina-ajuste" : ""}">${bandera}</span>` : ""}${nombre}</span>`;
}

function obtenerBanderaEquipo(nombre = "", codigo = "") {
  const porCodigo = {
    ARG: "🇦🇷️", AUS: "🇦🇺", AUT: "🇦🇹", BEL: "🇧🇪", BRA: "🇧🇷", CAN: "🇨🇦",
    CHI: "🇨🇱", CHN: "🇨🇳", CIV: "🇨🇮", COL: "🇨🇴", CPV: "🇨🇻", CRC: "🇨🇷", CRO: "🇭🇷",
    DEN: "🇩🇰", DZA: "🇩🇿", ECU: "🇪🇨", EGY: "🇪🇬", ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", ESP: "🇪🇸", FRA: "🇫🇷", GER: "🇩🇪",
    GHA: "🇬🇭", IRN: "🇮🇷", ITA: "🇮🇹", JPN: "🇯🇵", KOR: "🇰🇷", MAR: "🇲🇦",
    MEX: "🇲🇽", NED: "🇳🇱", NOR: "🇳🇴", PAR: "🇵🇾", POL: "🇵🇱", POR: "🇵🇹",
    QAT: "🇶🇦", SEN: "🇸🇳", SRB: "🇷🇸", SUI: "🇨🇭", SWE: "🇸🇪", URU: "🇺🇾",
    USA: "🇺🇸", WAL: "🏴"
  };

  const claveCodigo = String(codigo || "").trim().toUpperCase();
  if (porCodigo[claveCodigo]) return porCodigo[claveCodigo];

  const claveNombre = normalizarTextoPais(nombre);
  const porNombre = {
    alemania: "🇩🇪",
    argelia: "🇩🇿",
    algeria: "🇩🇿",
    argentina: "🇦🇷",
    australia: "🇦🇺",
    austria: "🇦🇹",
    belgica: "🇧🇪",
    belgium: "🇧🇪",
    "bosnia y herzegovina": "🇧🇦",
    "bosnia and herzegovina": "🇧🇦",
    brasil: "🇧🇷",
    brazil: "🇧🇷",
    canada: "🇨🇦",
    "cabo verde": "🇨🇻",
    "cape verde": "🇨🇻",
    chile: "🇨🇱",
    china: "🇨🇳",
    colombia: "🇨🇴",
    "costa de marfil": "🇨🇮",
    "ivory coast": "🇨🇮",
    croacia: "🇭🇷",
    denmark: "🇩🇰",
    dinamarca: "🇩🇰",
    ecuador: "🇪🇨",
    egipto: "🇪🇬",
    egypt: "🇪🇬",
    england: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    inglaterra: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    espana: "🇪🇸",
    spain: "🇪🇸",
    "estados unidos": "🇺🇸",
    usa: "🇺🇸",
    "united states": "🇺🇸",
    francia: "🇫🇷",
    france: "🇫🇷",
    germany: "🇩🇪",
    ghana: "🇬🇭",
    iran: "🇮🇷",
    italia: "🇮🇹",
    italy: "🇮🇹",
    japon: "🇯🇵",
    japan: "🇯🇵",
    marruecos: "🇲🇦",
    morocco: "🇲🇦",
    mexico: "🇲🇽",
    noruega: "🇳🇴",
    norway: "🇳🇴",
    "paises bajos": "🇳🇱",
    netherlands: "🇳🇱",
    paraguay: "🇵🇾",
    polonia: "🇵🇱",
    portugal: "🇵🇹",
    qatar: "🇶🇦",
    "rd congo": "🇨🇩",
    "republica democratica del congo": "🇨🇩",
    "dr congo": "🇨🇩",
    senegal: "🇸🇳",
    serbia: "🇷🇸",
    "corea del sur": "🇰🇷",
    "south korea": "🇰🇷",
    suecia: "🇸🇪",
    sweden: "🇸🇪",
    suiza: "🇨🇭",
    switzerland: "🇨🇭",
    uruguay: "🇺🇾",
    wales: "🏴",
    gales: "🏴"
  };

  return porNombre[claveNombre] || "";
}

function normalizarTextoPais(texto = "") {
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(fc|cf|national team|seleccion)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
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
  const marcador = obtenerMarcadorPartido(partido);
  if (marcador) return marcador;
  if (estadoTiempo.estado.includes("EN VIVO")) return "En desarrollo";
  if (estadoTiempo.estado.includes("Descanso")) return "Descanso";
  if (estadoTiempo.estado.includes("Finalizado")) return "Cerrado";
  return "VS";
}

function obtenerDetalleScore(partido, estadoTiempo) {
  const detalle = String(partido.statusDetalle || "").toLowerCase();
  const minuto = obtenerMinutoPartidoTexto(partido);
  const marcador = obtenerMarcadorPartido(partido);
  const ultimoGol = obtenerUltimoGol(partido);
  const detalleResultado = obtenerDetalleResultado(partido);

  if (/hydration|cooling|hidrat/.test(detalle)) return "Pausa de hidratación";
  if (/half.?time|descanso|break|paused/.test(detalle) || estadoTiempo.estado.includes("Descanso")) return marcador ? "Marcador al descanso" : "Actualizando marcador";
  if (/second|2nd|segundo/.test(detalle)) return minuto ? `Segundo tiempo · ${minuto}'` : "Segundo tiempo";
  if (/first|1st|primer/.test(detalle)) return minuto ? `Primer tiempo · ${minuto}'` : "Primer tiempo";
  if (estadoTiempo.estado.includes("EN VIVO")) {
    if (ultimoGol) return `Último gol ${formatearMinutoEvento(ultimoGol)} · ${obtenerNombreEquipoEvento(ultimoGol)}`;
    return minuto ? `Minuto ${minuto}'` : "Actualizando cada 30s";
  }
  if (estadoTiempo.estado.includes("Finalizado")) return detalleResultado || (marcador ? "Resultado oficial" : "Finalizado oficialmente");
  if (estadoTiempo.estado.includes("Programado")) return "Aún no inicia";
  return "";
}

function obtenerMarcadorPartido(partido) {
  return partido.marcador || crearMarcador(partido.score);
}

function obtenerMinutoPartido(partido) {
  const minuto = Number(partido.minuto);
  return Number.isFinite(minuto) && minuto > 0 ? Math.round(minuto) : "";
}

function obtenerMinutoPartidoTexto(partido) {
  const minuto = obtenerMinutoPartido(partido);
  const adicion = Number(partido.injuryTime);
  if (!minuto) return "";
  return Number.isFinite(adicion) && adicion > 0 ? `${minuto}+${Math.round(adicion)}` : `${minuto}`;
}

function obtenerDetalleResultado(partido) {
  const score = partido.score || {};
  const duracion = String(score.duration || "").toUpperCase();
  const penales = crearMarcadorDesdeFuente(score.penalties);
  const regular = crearMarcadorDesdeFuente(score.regularTime);
  const tiempoExtra = crearMarcadorDesdeFuente(score.extraTime);

  if (duracion === "PENALTY_SHOOTOUT" && penales) return `Final por penales ${penales}`;
  if (duracion === "EXTRA_TIME") return tiempoExtra ? `Prórroga ${tiempoExtra}` : "Final en tiempo extra";
  if (regular && regular !== obtenerMarcadorPartido(partido)) return `Tiempo regular ${regular}`;

  const ultimoGol = obtenerUltimoGol(partido);
  if (ultimoGol) return `Último gol ${formatearMinutoEvento(ultimoGol)} · ${obtenerNombreEquipoEvento(ultimoGol)}`;

  return "";
}

function obtenerUltimoGol(partido) {
  const goles = Array.isArray(partido.goles) ? partido.goles : [];
  if (!goles.length) return null;

  return [...goles].sort((a, b) => {
    const minutoA = Number(a.minute || 0) + Number(a.injuryTime || 0) / 100;
    const minutoB = Number(b.minute || 0) + Number(b.injuryTime || 0) / 100;
    return minutoB - minutoA;
  })[0];
}

function formatearMinutoEvento(evento) {
  const minuto = Number(evento?.minute);
  const adicion = Number(evento?.injuryTime);
  if (!Number.isFinite(minuto) || minuto <= 0) return "";
  return Number.isFinite(adicion) && adicion > 0 ? `${Math.round(minuto)}+${Math.round(adicion)}'` : `${Math.round(minuto)}'`;
}

function obtenerNombreEquipoEvento(evento) {
  return evento?.team?.shortName || evento?.team?.name || "equipo";
}

function obtenerClaseScorebox(estado) {
  if (estado.includes("EN VIVO")) return "match-scorebox--live";
  if (estado.includes("Descanso")) return "match-scorebox--paused";
  if (estado.includes("Finalizado")) return "match-scorebox--finished";
  return "";
}

function obtenerTituloScorebox(estado, partido = null) {
  if (estado.includes("EN VIVO")) return "En vivo";
  if (estado.includes("Descanso")) return "Receso";
  if (estado.includes("Finalizado")) return partido && obtenerMarcadorPartido(partido) ? "Resultado" : "Partido";
  return "Marcador";
}

function obtenerTextoTiempoPartido(partido) {
  const raw = String(partido.statusRaw || "").toUpperCase();
  if (["LIVE", "IN_PLAY"].includes(raw)) {
    return { estado: "🔴 EN VIVO", detalle: "Partido en curso" };
  }
  if (raw === "PAUSED") {
    return { estado: "⏸️ Descanso", detalle: "Entretiempo" };
  }
  if (raw === "FINISHED") {
    return { estado: "⚫ Finalizado", detalle: "Encuentro terminado" };
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
    return { estado: "🔴 EN VIVO", detalle: "Partido en curso" };
  }

  return { estado: "⚫ Finalizado", detalle: "Encuentro terminado" };
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

function fechaConsultaMundial(offsetDias = 0) {
  const ahora = new Date();
  ahora.setDate(ahora.getDate() + offsetDias);
  return ahora.toLocaleDateString("en-CA", { timeZone: "America/Guayaquil" });
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

  const fuentes = [
    score.fullTime,
    score.current,
    score.live,
    score.regularTime,
    score.halfTime,
    score.extraTime,
    score.penalties
  ];

  return fuentes.map(crearMarcadorDesdeFuente).find(Boolean) || "";
}

function tieneScoreValido(fuente) {
  return Boolean(crearMarcadorDesdeFuente(fuente));
}

function crearMarcadorDesdeFuente(fuente) {
  if (!fuente) return "";
  const home = obtenerNumeroScore(fuente, ["home", "homeTeam"]);
  const away = obtenerNumeroScore(fuente, ["away", "awayTeam"]);
  if (home === null || away === null) return "";
  return `${home} - ${away}`;
}

function obtenerNumeroScore(fuente, llaves) {
  for (const llave of llaves) {
    const valor = Number(fuente[llave]);
    if (Number.isFinite(valor)) return valor;
  }
  return null;
}


function iniciarCronometroMundial() {
  if (window.__cronometroMundialActivo) return;
  window.__cronometroMundialActivo = true;
  setInterval(actualizarTemporizadoresMundial, 1000);
}


function actualizarTemporizadoresMundial() {
  document.querySelectorAll(".mundial-cronometro[data-fecha]").forEach((el) => {
    const fecha = new Date(el.dataset.fecha);
    if (isNaN(fecha.getTime())) return;
    const diff = fecha.getTime() - Date.now();
    if (diff > 0) {
      const s = Math.floor(diff / 1000);
      const d = Math.floor(s / 86400);
      const h = Math.floor((s % 86400) / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      el.textContent = `⏳ ${d}d ${h}h ${m}m ${sec}s`;
    } else {
      el.textContent = "🔴 En vivo";
    }
  });
}

// ---------------------------------------------------------------------------
// RESEÑAS Y ACTIVIDAD
// ---------------------------------------------------------------------------
function obtenerResenasCliente() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_RESENAS_CLIENTES) || "[]");
  } catch {
    return [];
  }
}

function obtenerTodasLasResenas() {
  return [...(RESENAS || []), ...obtenerResenasCliente()];
}

function cargarResenas() {
  const contenedor = document.getElementById("resenas-slider");
  if (!contenedor) return;
  contenedor.innerHTML = obtenerTodasLasResenas().map((r, i) => crearResena(r, i)).join("");
  rotarResenas();
  renderResenasCarrito();
}

function crearResena(resena, index) {
  return `
    <article class="resena-card ${index === 0 ? "activa" : ""}">
      <div class="estrellas">${"★".repeat(Number(resena.estrellas) || 5)}</div>
      <h3>${escaparHTML(resena.nombre)}</h3>
      <p class="resena-pais">${escaparHTML(resena.pais)}</p>
      <p>${escaparHTML(resena.comentario)}</p>
    </article>
  `;
}

function renderResenasCarrito() {
  const contenedor = document.getElementById("carrito-resenas-lista");
  if (!contenedor) return;

  const resenas = obtenerTodasLasResenas().slice(-5).reverse();

  contenedor.innerHTML = resenas.map((resena) => `
    <article class="cart-review-card">
      <div class="estrellas">${"★".repeat(Number(resena.estrellas) || 5)}</div>
      <strong>${escaparHTML(resena.nombre)}</strong>
      <span>${escaparHTML(resena.pais)}</span>
      <p>${escaparHTML(resena.comentario)}</p>
    </article>
  `).join("");
}

function registrarResenaCarrito(evento) {
  evento.preventDefault();

  const nombre = document.getElementById("resena-nombre")?.value.trim();
  const pais = document.getElementById("resena-pais")?.value.trim();
  const estrellas = Number(document.getElementById("resena-estrellas")?.value || 5);
  const comentario = document.getElementById("resena-comentario")?.value.trim();

  if (!nombre || !pais || !comentario) {
    mostrarToast("Completa tu nombre, país y comentario.", "error");
    return;
  }

  const nuevaResena = {
    nombre,
    pais,
    estrellas,
    comentario,
    fecha: new Date().toISOString()
  };

  const resenasCliente = obtenerResenasCliente();
  resenasCliente.push(nuevaResena);
  localStorage.setItem(CLAVE_RESENAS_CLIENTES, JSON.stringify(resenasCliente.slice(-20)));

  renderResenasCarrito();
  cargarResenas();
  evento.target.reset();

  const mensaje = encodeURIComponent(
    `Nueva reseña Click Tv Streaming:\n\nNombre: ${nombre}\nPaís/Ciudad: ${pais}\nCalificación: ${"⭐".repeat(estrellas)}\nComentario: ${comentario}`
  );
  window.open(`${CONFIG.whatsappLink}?text=${mensaje}`, "_blank", "noopener,noreferrer");
  mostrarToast("Gracias por dejar tu reseña.", "exito");
}

function enviarContactoInternacional(evento) {
  evento.preventDefault();

  const nombre = document.getElementById("contacto-nombre")?.value.trim();
  const pais = document.getElementById("contacto-pais")?.value.trim();
  const telefono = document.getElementById("contacto-telefono")?.value.trim();
  const mensajeCliente = document.getElementById("contacto-mensaje")?.value.trim();

  if (!nombre || !pais || !telefono || !mensajeCliente) {
    mostrarToast("Completa todos los datos de contacto.", "error");
    return;
  }

  const mensaje = encodeURIComponent(
    `Hola, deseo información de Click Tv Streaming.\n\nNombre: ${nombre}\nPaís: ${pais}\nTeléfono: ${telefono}\nMensaje: ${mensajeCliente}`
  );

  window.open(`${CONFIG.whatsappLink}?text=${mensaje}`, "_blank", "noopener,noreferrer");
  mostrarToast("Consulta enviada por WhatsApp.", "exito");
  evento.target.reset();
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

function escaparHTML(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
