/* ==========================================================================
   CLICK TV STREAMING MUNDIAL 2026 — script.js
   Lógica principal: carrito, cupones, pagos, moneda, geolocalización, UI
   ========================================================================== */

const CLAVE_CARRITO = "clicktv_carrito";
const CLAVE_MONEDA = "clicktv_moneda";
const CLAVE_CUPON = "clicktv_cupon";

let carrito = [];
let monedaActual = "USD";
let cuponAplicado = null;

// ---------------------------------------------------------------------------
// INICIALIZACIÓN
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  cargarCarritoDesdeStorage();
  cargarMonedaDesdeStorage();
  inicializarFiltros();
  renderCatalogo();
  cargarResenas();
  renderMundial();
  inicializarUI();
  detectarPais();
  actualizarContadorCarrito();
});

function inicializarUI() {
  // Menú móvil
  const btnMenu = document.getElementById("btn-menu-movil");
  const navMenu = document.getElementById("nav-menu");
  if (btnMenu && navMenu) {
    btnMenu.addEventListener("click", () => navMenu.classList.toggle("abierto"));
  }

  // Carrito: abrir / cerrar
  document.getElementById("btn-abrir-carrito")?.addEventListener("click", abrirCarrito);
  document.getElementById("btn-cerrar-carrito")?.addEventListener("click", cerrarCarrito);
  document.getElementById("carrito-overlay")?.addEventListener("click", cerrarCarrito);

  // Cupón
  document.getElementById("btn-aplicar-cupon")?.addEventListener("click", aplicarCupon);

  // Checkout
  document.getElementById("btn-finalizar-compra")?.addEventListener("click", finalizarCompra);

  // Pagos simulados
  document.querySelectorAll(".btn-pago").forEach((btn) => {
    btn.addEventListener("click", () => procesarPago(btn.dataset.metodo));
  });

  // Selector de moneda
  document.getElementById("selector-moneda")?.addEventListener("change", (e) => {
    monedaActual = e.target.value;
    localStorage.setItem(CLAVE_MONEDA, monedaActual);
    renderCatalogo();
    renderCarrito();
    mostrarToast(`Moneda cambiada a ${monedaActual}`, "info");
  });

  // Formulario de reseña
  document.getElementById("form-resena")?.addEventListener("submit", agregarResena);

  // Scroll to top
  const btnScrollTop = document.getElementById("btn-scroll-top");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      btnScrollTop?.classList.add("visible");
    } else {
      btnScrollTop?.classList.remove("visible");
    }
  });
  btnScrollTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Navegación suave + cerrar menú móvil
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => navMenu?.classList.remove("abierto"));
  });

  // Año dinámico en footer
  const anio = document.getElementById("anio-actual");
  if (anio) anio.textContent = new Date().getFullYear();
}

// ---------------------------------------------------------------------------
// FORMATEO DE MONEDA
// ---------------------------------------------------------------------------
function formatearPrecio(precioUSD) {
  const info = TASAS_CAMBIO[monedaActual] || TASAS_CAMBIO.USD;
  const convertido = precioUSD * info.tasa;
  const decimales = monedaActual === "USD" || monedaActual === "EUR" || monedaActual === "PEN" ? 2 : 0;
  return `${info.simbolo}${convertido.toFixed(decimales)}`;
}

function cargarMonedaDesdeStorage() {
  const guardada = localStorage.getItem(CLAVE_MONEDA);
  if (guardada && TASAS_CAMBIO[guardada]) {
    monedaActual = guardada;
    const selector = document.getElementById("selector-moneda");
    if (selector) selector.value = guardada;
  }
}

// ---------------------------------------------------------------------------
// GEOLOCALIZACIÓN
// ---------------------------------------------------------------------------
function detectarPais() {
  const elPais = document.getElementById("pais-detectado");
  if (!elPais) return;

  if (!navigator.geolocation) {
    elPais.textContent = "Ubicación no disponible";
    return;
  }

  elPais.textContent = "Detectando ubicación... 📍";

  navigator.geolocation.getCurrentPosition(
    async (posicion) => {
      try {
        const { latitude, longitude } = posicion.coords;
        const respuesta = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const datos = await respuesta.json();
        const pais = datos?.address?.country || "Desconocido";
        elPais.textContent = `📍 ${pais}`;
        sugerirMonedaPorPais(pais);
      } catch {
        elPais.textContent = "📍 Ubicación detectada";
      }
    },
    () => {
      elPais.textContent = "📍 Activa la ubicación para personalizar tu moneda";
    }
  );
}

function sugerirMonedaPorPais(pais) {
  const mapa = {
    México: "MXN",
    Colombia: "COP",
    Perú: "PEN",
    Argentina: "ARS",
    Chile: "CLP",
    España: "EUR",
    Alemania: "EUR",
    Francia: "EUR"
  };
  const sugerida = mapa[pais];
  if (sugerida && !localStorage.getItem(CLAVE_MONEDA)) {
    monedaActual = sugerida;
    const selector = document.getElementById("selector-moneda");
    if (selector) selector.value = sugerida;
    renderCatalogo();
    renderCarrito();
  }
}

// ---------------------------------------------------------------------------
// CARRITO — PERSISTENCIA
// ---------------------------------------------------------------------------
function cargarCarritoDesdeStorage() {
  const guardado = localStorage.getItem(CLAVE_CARRITO);
  carrito = guardado ? JSON.parse(guardado) : [];
  const cuponGuardado = localStorage.getItem(CLAVE_CUPON);
  cuponAplicado = cuponGuardado ? JSON.parse(cuponGuardado) : null;
}

function guardarCarritoEnStorage() {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

// ---------------------------------------------------------------------------
// CARRITO — ACCIONES
// ---------------------------------------------------------------------------
function agregarAlCarrito(producto, plan) {
  const itemId = `${producto.id}-${plan.tipo}`;
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
      precio: plan.precio,
      cantidad: 1
    });
  }

  guardarCarritoEnStorage();
  renderCarrito();
  actualizarContadorCarrito();
  mostrarToast(`${producto.nombre} agregado al carrito 🛒`, "exito");
  abrirCarrito();
}

function eliminarDelCarrito(itemId) {
  carrito = carrito.filter((item) => item.itemId !== itemId);
  guardarCarritoEnStorage();
  renderCarrito();
  actualizarContadorCarrito();
  mostrarToast("Producto eliminado del carrito 🗑️", "info");
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

// ---------------------------------------------------------------------------
// CARRITO — RENDER
// ---------------------------------------------------------------------------
function renderCarrito() {
  const contenedor = document.getElementById("carrito-items");
  const elSubtotal = document.getElementById("carrito-subtotal");
  const elDescuento = document.getElementById("carrito-descuento");
  const elTotal = document.getElementById("carrito-total");
  if (!contenedor) return;

  if (carrito.length === 0) {
    contenedor.innerHTML = `<p class="carrito-vacio">Tu carrito está vacío. ¡Explora nuestro catálogo! 🛍️</p>`;
  } else {
    contenedor.innerHTML = carrito
      .map(
        (item) => `
        <div class="carrito-item">
          <span class="carrito-item__icono">${item.icono}</span>
          <div class="carrito-item__info">
            <p class="carrito-item__nombre">${item.nombre}</p>
            <p class="carrito-item__plan">Plan ${item.plan} · ${formatearPrecio(item.precio)}</p>
            <div class="carrito-item__cantidad">
              <button onclick="cambiarCantidad('${item.itemId}', -1)" aria-label="Reducir cantidad">−</button>
              <span>${item.cantidad}</span>
              <button onclick="cambiarCantidad('${item.itemId}', 1)" aria-label="Aumentar cantidad">+</button>
            </div>
          </div>
          <button class="carrito-item__borrar" onclick="eliminarDelCarrito('${item.itemId}')" aria-label="Eliminar producto">
            🗑️
          </button>
        </div>
      `
      )
      .join("");
  }

  const subtotalUSD = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const descuentoUSD = cuponAplicado ? subtotalUSD * (cuponAplicado.porcentaje / 100) : 0;
  const totalUSD = subtotalUSD - descuentoUSD;

  if (elSubtotal) elSubtotal.textContent = formatearPrecio(subtotalUSD);
  if (elDescuento) elDescuento.textContent = `- ${formatearPrecio(descuentoUSD)}`;
  if (elTotal) elTotal.textContent = formatearPrecio(totalUSD);

  const elCuponInfo = document.getElementById("cupon-info");
  if (elCuponInfo) {
    elCuponInfo.textContent = cuponAplicado
      ? `Cupón aplicado: ${cuponAplicado.codigo} (${cuponAplicado.porcentaje}% off)`
      : "";
  }
}

function actualizarContadorCarrito() {
  const contador = document.getElementById("contador-carrito");
  if (!contador) return;
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
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

// ---------------------------------------------------------------------------
// CUPONES
// ---------------------------------------------------------------------------
function aplicarCupon() {
  const input = document.getElementById("input-cupon");
  if (!input) return;
  const codigo = input.value.trim().toUpperCase();

  if (!codigo) {
    mostrarToast("Ingresa un código de cupón.", "error");
    return;
  }

  const cupon = CUPONES[codigo];
  if (!cupon) {
    mostrarToast("Cupón inválido o expirado.", "error");
    return;
  }

  cuponAplicado = { codigo, porcentaje: cupon.porcentaje };
  localStorage.setItem(CLAVE_CUPON, JSON.stringify(cuponAplicado));
  renderCarrito();
  mostrarToast(`¡Cupón ${codigo} aplicado! ${cupon.descripcion}`, "exito");
}

// ---------------------------------------------------------------------------
// CHECKOUT Y PAGOS SIMULADOS
// ---------------------------------------------------------------------------
function finalizarCompra() {
  if (carrito.length === 0) {
    mostrarToast("Tu carrito está vacío.", "error");
    return;
  }
  document.getElementById("seccion-pagos")?.classList.add("visible");
  mostrarToast("Selecciona un método de pago para continuar.", "info");
}

function procesarPago(metodo) {
  if (carrito.length === 0) {
    mostrarToast("Agrega productos antes de pagar.", "error");
    return;
  }

  const resumen = carrito
    .map((item) => `• ${item.nombre} (${item.plan}) x${item.cantidad}`)
    .join("\n");

  const subtotalUSD = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const descuentoUSD = cuponAplicado ? subtotalUSD * (cuponAplicado.porcentaje / 100) : 0;
  const totalUSD = subtotalUSD - descuentoUSD;

  switch (metodo) {
    case "whatsapp": {
      const mensaje = encodeURIComponent(
        `Hola, quiero finalizar mi compra:\n${resumen}\n\nTotal: ${formatearPrecio(
          totalUSD
        )}${cuponAplicado ? ` (cupón ${cuponAplicado.codigo} aplicado)` : ""}`
      );
      window.open(`https://wa.me/${CONFIG.whatsappNumero}?text=${mensaje}`, "_blank");
      break;
    }
    case "paypal":
      mostrarToast("Redirigiendo a PayPal (simulado)... 💳", "info");
      break;
    case "payphone":
      mostrarToast("Redirigiendo a Payphone (simulado)... 📱", "info");
      break;
    case "transferencia":
      mostrarToast("Mostrando datos bancarios para transferencia (simulado) 🏦", "info");
      break;
    default:
      mostrarToast("Procesando pago...", "info");
  }
}

// ---------------------------------------------------------------------------
// TOASTS
// ---------------------------------------------------------------------------
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
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
const API_URL = "https://api.football-data.org/v4/matches";
const API_KEY = "467c885c07fa49baa40ac78cf636f8b0";

async function cargarPartidos() {
  const box = document.getElementById("mundial-grid");

  try {
    const hoy = new Date().toISOString().split("T")[0];

    const res = await fetch(`${API_URL}?dateFrom=${hoy}&dateTo=${hoy}`, {
      headers: {
        "X-Auth-Token": API_KEY
      }
    });

    const data = await res.json();

    if (!data || !data.matches) throw new Error("sin datos");

    renderPartidos(data.matches);

  } catch (error) {
    console.log("API falló, usando modo offline");

    // 🔥 FALLBACK LOCAL (ESTO EVITA EL ERROR)
    renderPartidos([
      {
        home: "Noruega",
        away: "Francia",
        group: "I",
        utcDate: "2026-06-26T20:00:00Z",
        status: "SCHEDULED",
        competition: { name: "World Cup 2026" }
      },
      {
        home: "Senegal",
        away: "Iraq",
        group: "I",
        utcDate: "2026-06-26T20:00:00Z",
        status: "SCHEDULED",
        competition: { name: "World Cup 2026" }
      },
      {
        home: "España",
        away: "Uruguay",
        group: "H",
        utcDate: "2026-06-26T23:00:00Z",
        status: "SCHEDULED",
        competition: { name: "World Cup 2026" }
      }
    ]);
  }
}

function renderPartidos(matches) {
  const box = document.getElementById("mundial-grid");
  if (!box) return;

  box.innerHTML = matches.map(m => {

    const horaEC = new Date(m.utcDate).toLocaleTimeString("es-EC", {
      timeZone: "America/Guayaquil",
      hour: "2-digit",
      minute: "2-digit"
    });

    return `
      <div class="match-card">
        <div class="status">⚽ ${m.status}</div>

        <h3>${m.homeTeam.name} vs ${m.awayTeam.name}</h3>

        <p>⏰ Ecuador: ${horaEC}</p>

        <span>🏆 ${m.competition.name}</span>
      </div>
    `;
  }).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  cargarPartidos();

  setInterval(() => {
    cargarPartidos();
  }, 60000);
});