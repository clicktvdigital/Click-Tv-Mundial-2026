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
const CLAVE_VOLUMEN_RADIO = "clicktv_radio_volumen";
const CLAVE_RADIO_SELECCIONADA = "clicktv_radio_seleccionada";

let carrito = [];
let monedaActual = "USD";
let cuponAplicado = null;
let paypalRenderizado = false;
let paypalSdkPromise = null;
let observadorReveal = null;
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
  // Cada módulo se inicia de forma independiente. Si uno falla, el menú,
  // la radio y el resto de la interfaz continúan funcionando.
  const iniciarSeguro = (nombre, tarea) => {
    try {
      tarea();
    } catch (error) {
      console.error(`[Click TV] Error al iniciar ${nombre}:`, error);
    }
  };

  iniciarSeguro("carrito", cargarCarritoDesdeStorage);
  iniciarSeguro("moneda", cargarMonedaDesdeStorage);
  iniciarSeguro("filtros", inicializarFiltros);
  iniciarSeguro("catálogo", renderCatalogo);
  iniciarSeguro("carrito visual", renderCarrito);
  iniciarSeguro("reseñas", cargarResenas);
  iniciarSeguro("actividad", renderActividadReciente);
  iniciarSeguro("partidos", renderMundial);
  iniciarSeguro("interfaz", inicializarUI);
  iniciarSeguro("pagos rápidos", inicializarPagosRapidos);
  iniciarSeguro("calculadora de ahorro", inicializarCalculadoraAhorro);
  iniciarSeguro("ubicación", inicializarUbicacion);
  iniciarSeguro("tasas de cambio", actualizarTasasCambio);
  iniciarSeguro("usuarios conectados", actualizarUsuariosConectados);
  iniciarSeguro("contador del carrito", actualizarContadorCarrito);
  iniciarSeguro("fondo dinámico", inicializarFondoDinamico);
  iniciarSeguro("animaciones", inicializarAnimacionesScroll);
  iniciarSeguro("efecto premium", inicializarTiltPremium);
  iniciarSeguro("accesibilidad", inicializarAccesibilidadGlobal);

  setInterval(() => iniciarSeguro("actividad periódica", renderActividadReciente), 4500);
  setInterval(() => iniciarSeguro("rotación de reseñas", rotarResenas), 10000);
  setInterval(() => iniciarSeguro("usuarios conectados", actualizarUsuariosConectados), 6500);
  setInterval(() => iniciarSeguro("partidos periódicos", () => renderMundial(true)), 30000);
});


function inicializarFiltros() {
  // Los botones del catálogo se gestionan también desde catalogo.js.
  // Aquí se conectan los enlaces del menú que llevan a una categoría concreta.
  document.querySelectorAll("[data-ir-categoria]").forEach((enlace) => {
    enlace.addEventListener("click", () => {
      const categoria = enlace.dataset.irCategoria || "todos";
      if (typeof window.seleccionarCategoriaCatalogo === "function") {
        window.seleccionarCategoriaCatalogo(categoria);
      }
    });
  });
}

let marcadorMenuMovil = null;

function prepararMenuMovilEnViewport() {
  const menu = document.getElementById("nav-menu");
  const overlay = document.getElementById("menu-overlay");
  const esMovil = window.matchMedia("(max-width: 920px)").matches;
  if (!menu || !overlay) return;

  if (esMovil && menu.parentElement !== document.body) {
    marcadorMenuMovil = document.createComment("ubicacion-original-nav-menu");
    menu.parentNode.insertBefore(marcadorMenuMovil, menu);
    document.body.appendChild(overlay);
    document.body.appendChild(menu);
  } else if (!esMovil && marcadorMenuMovil?.parentNode) {
    marcadorMenuMovil.parentNode.insertBefore(overlay, marcadorMenuMovil);
    marcadorMenuMovil.parentNode.insertBefore(menu, marcadorMenuMovil.nextSibling);
    marcadorMenuMovil.remove();
    marcadorMenuMovil = null;
    cerrarMenuMovil();
  }
}

function abrirMenuMovil() {
  prepararMenuMovilEnViewport();
  const menu = document.getElementById("nav-menu");
  const boton = document.getElementById("btn-menu-movil");
  const overlay = document.getElementById("menu-overlay");
  if (!menu) return;
  menu.classList.add("abierto");
  menu.scrollTop = 0;
  overlay?.classList.add("visible");
  overlay?.setAttribute("aria-hidden", "false");
  boton?.setAttribute("aria-expanded", "true");
  boton?.classList.add("is-open");
  document.body.classList.add("menu-movil-abierto");
  document.getElementById("btn-cerrar-menu")?.focus({ preventScroll: true });
}

function cerrarMenuMovil() {
  const menu = document.getElementById("nav-menu");
  const boton = document.getElementById("btn-menu-movil");
  const overlay = document.getElementById("menu-overlay");
  menu?.classList.remove("abierto");
  overlay?.classList.remove("visible");
  overlay?.setAttribute("aria-hidden", "true");
  boton?.setAttribute("aria-expanded", "false");
  boton?.classList.remove("is-open");
  document.body.classList.remove("menu-movil-abierto");
}

function alternarMenuMovil() {
  const abierto = document.getElementById("nav-menu")?.classList.contains("abierto");
  if (abierto) cerrarMenuMovil(); else abrirMenuMovil();
}

function inicializarUI() {
  const btnMenu = document.getElementById("btn-menu-movil");
  const navMenu = document.getElementById("nav-menu");

  if (btnMenu && navMenu) {
    btnMenu.addEventListener("click", () => alternarMenuMovil());
    document.getElementById("btn-cerrar-menu")?.addEventListener("click", cerrarMenuMovil);
    document.getElementById("menu-overlay")?.addEventListener("click", cerrarMenuMovil);
    document.getElementById("btn-menu-flotante")?.addEventListener("click", abrirMenuMovil);
    document.getElementById("btn-menu-subir")?.addEventListener("click", () => {
      navMenu.scrollBy({ top: -Math.max(220, navMenu.clientHeight * 0.72), behavior: "smooth" });
    });
    document.getElementById("btn-menu-bajar")?.addEventListener("click", () => {
      navMenu.scrollBy({ top: Math.max(220, navMenu.clientHeight * 0.72), behavior: "smooth" });
    });
    prepararMenuMovilEnViewport();
    window.addEventListener("resize", prepararMenuMovilEnViewport, { passive: true });

    navMenu.querySelectorAll("a.nav-link").forEach((enlace) => {
      enlace.addEventListener("click", cerrarMenuMovil);
    });

    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape") cerrarMenuMovil();
    });
  }

  // Carrito
  document.getElementById("btn-abrir-carrito")?.addEventListener("click", abrirCarrito);
  document.getElementById("btn-cerrar-carrito")?.addEventListener("click", cerrarCarrito);
  document.getElementById("btn-continuar-comprando")?.addEventListener("click", cerrarCarrito);
  document.getElementById("carrito-overlay")?.addEventListener("click", cerrarCarrito);
  document.querySelector('.cart-reviews a[href="#resenas"]')?.addEventListener("click", cerrarCarrito);

  // Cupón
  document.getElementById("btn-aplicar-cupon")?.addEventListener("click", aplicarCupon);

  // Checkout
  document.getElementById("btn-finalizar-compra")?.addEventListener("click", finalizarCompra);
  document.getElementById("btn-enviar-comprobante")?.addEventListener("click", enviarComprobanteWhatsApp);
  document.getElementById("btn-enviar-pedido")?.addEventListener("click", enviarPedidoWhatsApp);
  document.querySelectorAll("[data-review-form]").forEach((form) => form.addEventListener("submit", registrarResenaCarrito));
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
    if (window.scrollY > 180) {
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
    link.addEventListener("click", () => {
      navMenu?.classList.remove("abierto");
      btnMenu?.classList.remove("is-open");
      btnMenu?.setAttribute("aria-expanded", "false");
    });
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

function abrirTelegramConMensaje(mensaje) {
  const texto = encodeURIComponent(mensaje);
  const usuario = "ClickTvDigital";
  window.open(`https://t.me/${usuario}?text=${texto}`, "_blank", "noopener,noreferrer");
}

async function abrirSignalConMensaje(mensaje) {
  // Signal no ofrece un enlace web oficial que abra un chat concreto con texto
  // precargado. En móviles usamos Compartir para que el texto llegue ya escrito
  // al seleccionar Signal, sin obligar al cliente a copiar y pegar.
  if (navigator.share) {
    try {
      await navigator.share({
        title: "Click TV Streaming",
        text: mensaje
      });
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }

  await copiarTexto(mensaje, "Mensaje listo para Signal");
  window.open(CONFIG.signalLink, "_blank", "noopener,noreferrer");
}

function mensajeContactoGeneral() {
  return "Hola Click TV Streaming, deseo información sobre sus planes, disponibilidad y formas de pago.";
}

function contactarWhatsAppGeneral() {
  window.open(`${CONFIG.whatsappLink}?text=${encodeURIComponent(mensajeContactoGeneral())}`, "_blank", "noopener,noreferrer");
}

function contactarTelegramGeneral() {
  abrirTelegramConMensaje(mensajeContactoGeneral());
}

function contactarSignalGeneral() {
  abrirSignalConMensaje(mensajeContactoGeneral());
}

function inicializarBotonesFlotantes() {
  if (typeof CONFIG === "undefined") return;

  const wa = document.getElementById("btn-whatsapp");
  const grupo = document.getElementById("btn-whatsapp-grupo");
  const tg = document.getElementById("btn-telegram");
  const signal = document.getElementById("btn-signal");
  const soporte = document.getElementById("btn-soporte");
  const catalogo = document.getElementById("btn-catalogo-flotante");

  if (wa) { wa.href = "#"; wa.addEventListener("click", (e) => { e.preventDefault(); contactarWhatsAppGeneral(); }); }
  if (grupo) configurarLinkExterno(grupo, CONFIG.whatsappGrupo);
  if (tg) { tg.href = "#"; tg.addEventListener("click", (e) => { e.preventDefault(); contactarTelegramGeneral(); }); }
  if (signal) { signal.href = "#"; signal.addEventListener("click", (e) => { e.preventDefault(); contactarSignalGeneral(); }); }
  if (catalogo) catalogo.href = "#streaming";

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
  const app = document.getElementById("radio-app");
  const radioStatus = document.getElementById("radio-status");
  const connection = document.getElementById("radio-connection");
  const currentName = document.getElementById("radio-current-name");
  const currentLogo = document.getElementById("radio-current-logo");
  const artButton = document.getElementById("radio-art-action");
  const playButton = document.getElementById("radio-toggle-play");
  const volumeControl = document.getElementById("radio-volume");
  const retryButton = document.getElementById("radio-retry");
  const botones = [...document.querySelectorAll("[data-radio]")];

  if (!radioPlayer || !app || !playButton) return;

  const radios = CONFIG?.radioStations || {
    lared: {
      nombre: "La Red 102.1 FM Quito",
      corto: "La Red",
      frecuencia: "102.1 FM · Quito",
      url: "https://icecast.ticsecuador.com.ec/radiolared#.mp3",
      logo: "radio-la-red.png"
    },
    mach: {
      nombre: "Mach Deportes 91.7 FM Quito",
      corto: "Mach Deportes",
      frecuencia: "91.7 FM · Quito",
      url: "https://streamingecuador.net:9170/stream",
      logo: "radio-mach-deportes.png"
    }
  };

  let radioActual = localStorage.getItem(CLAVE_RADIO_SELECCIONADA);
  if (!radios[radioActual]) radioActual = "lared";

  let reproduccionSolicitada = false;
  let fuentePreparadaPara = "";
  let reconexionTimer = null;
  let intentosReconexion = 0;
  const maxIntentos = 6;
  const equalizerBars = [...app.querySelectorAll(".equalizer i")];
  let equalizerFrame = 0;
  let equalizerActivo = false;

  // Mantener la fuente precargada reduce el retraso del primer toque y permite
  // reanudar inmediatamente después de una pausa sin abrir una conexión nueva.
  radioPlayer.preload = "auto";

  const pintarEcualizadorEnReposo = () => {
    equalizerBars.forEach((bar, index) => {
      const escala = 0.18 + ((index % 4) * 0.035);
      bar.style.transform = `scaleY(${escala.toFixed(3)})`;
      bar.style.opacity = "0.58";
    });
  };

  const detenerEcualizador = () => {
    equalizerActivo = false;
    if (equalizerFrame) cancelAnimationFrame(equalizerFrame);
    equalizerFrame = 0;
    pintarEcualizadorEnReposo();
  };

  const animarEcualizador = (tiempo) => {
    if (!equalizerActivo || radioPlayer.paused || document.hidden) {
      equalizerFrame = 0;
      return;
    }

    equalizerBars.forEach((bar, index) => {
      const ondaPrincipal = (Math.sin((tiempo / 115) + (index * 1.13)) + 1) / 2;
      const ondaSecundaria = (Math.sin((tiempo / 63) + (index * 0.57)) + 1) / 2;
      const pulso = (Math.sin((tiempo / 310) - (index * 0.36)) + 1) / 2;
      const escala = Math.min(1, 0.18 + (ondaPrincipal * 0.48) + (ondaSecundaria * 0.23) + (pulso * 0.11));
      bar.style.transform = `scaleY(${escala.toFixed(3)})`;
      bar.style.opacity = String((0.62 + escala * 0.38).toFixed(2));
    });

    equalizerFrame = requestAnimationFrame(animarEcualizador);
  };

  const iniciarEcualizador = () => {
    if (equalizerActivo || !equalizerBars.length || radioPlayer.paused) return;
    equalizerActivo = true;
    equalizerFrame = requestAnimationFrame(animarEcualizador);
  };

  pintarEcualizadorEnReposo();

  const establecerEstado = (tipo, texto) => {
    if (radioStatus) radioStatus.textContent = texto;
    if (connection) {
      connection.className = `radio-connection is-${tipo}`;
      connection.innerHTML = `<i aria-hidden="true"></i>${escaparHTML(texto)}`;
    }
    app.dataset.state = tipo;
    app.classList.toggle("is-playing", tipo === "live");
    app.classList.toggle("is-loading", tipo === "connecting");
    app.classList.toggle("has-error", tipo === "error");
    if (tipo === "live") iniciarEcualizador();
    else detenerEcualizador();
  };

  const actualizarBotonPlay = (reproduciendo) => {
    const radio = radios[radioActual];
    playButton.setAttribute("aria-pressed", String(reproduciendo));
    playButton.setAttribute("aria-label", `${reproduciendo ? "Pausar" : "Reproducir"} ${radio.nombre}`);
    if (artButton) {
      artButton.setAttribute("aria-pressed", String(reproduciendo));
      artButton.setAttribute("aria-label", `${reproduciendo ? "Pausar" : "Reproducir"} ${radio.nombre}`);
    }
    app.classList.toggle("is-playing", reproduciendo);
  };

  const actualizarEmisoraUI = (id) => {
    const radio = radios[id];
    if (!radio) return;
    radioActual = id;
    localStorage.setItem(CLAVE_RADIO_SELECCIONADA, id);

    if (currentName) currentName.textContent = radio.nombre;
    if (currentLogo) {
      currentLogo.src = radio.logo;
      currentLogo.alt = `Logo de ${radio.nombre}`;
    }

    botones.forEach((btn) => {
      const activa = btn.dataset.radio === id;
      btn.classList.toggle("is-active", activa);
      btn.setAttribute("aria-checked", String(activa));
      btn.setAttribute("aria-label", `${activa ? "Escuchar" : "Cambiar a"} ${radios[btn.dataset.radio]?.nombre || "radio"}`);
    });

    actualizarBotonPlay(false);
    configurarMediaSessionRadio(radioPlayer, radio);
  };

  const limpiarReconexion = () => {
    clearTimeout(reconexionTimer);
    reconexionTimer = null;
  };

  const prepararFuente = (forzar = false) => {
    const radio = radios[radioActual];
    if (!radio) return false;

    const necesitaFuente = forzar || fuentePreparadaPara !== radioActual || !radioPlayer.getAttribute("src");
    if (!necesitaFuente) return false;

    radioPlayer.pause();
    radioPlayer.src = radio.url;
    fuentePreparadaPara = radioActual;
    radioPlayer.load();
    return true;
  };

  const saltarAlDirecto = () => {
    try {
      const rangos = radioPlayer.seekable;
      if (!rangos?.length) return;
      const bordeEnVivo = rangos.end(rangos.length - 1);
      if (Number.isFinite(bordeEnVivo) && Math.abs(bordeEnVivo - radioPlayer.currentTime) > 1.25) {
        radioPlayer.currentTime = Math.max(0, bordeEnVivo - 0.12);
      }
    } catch {
      // Algunos streams Icecast no exponen rangos seekable.
    }
  };

  const reiniciarFuente = () => {
    radioPlayer.pause();
    radioPlayer.removeAttribute("src");
    radioPlayer.load();
    fuentePreparadaPara = "";
  };

  const reproducir = async ({ reconexion = false } = {}) => {
    const radio = radios[radioActual];
    if (!radio) return;

    reproduccionSolicitada = true;
    limpiarReconexion();
    if (!reconexion) intentosReconexion = 0;

    const fuenteNueva = prepararFuente(reconexion);
    saltarAlDirecto();

    establecerEstado(
      "connecting",
      fuenteNueva ? `Conectando con ${radio.corto}...` : `Reanudando ${radio.corto}...`
    );

    try {
      const promesa = radioPlayer.play();
      if (promesa && typeof promesa.then === "function") await promesa;
    } catch (error) {
      actualizarBotonPlay(false);
      if (error?.name === "NotAllowedError") {
        reproduccionSolicitada = false;
        establecerEstado("paused", `Toca el logo o el botón de reproducción para escuchar ${radio.corto}.`);
      } else if (error?.name !== "AbortError") {
        programarReconexion();
      }
    }
  };

  const pausar = () => {
    reproduccionSolicitada = false;
    limpiarReconexion();

    // No se elimina src: así el siguiente Play no vuelve a conectarse desde cero.
    radioPlayer.pause();
    actualizarBotonPlay(false);
    establecerEstado("paused", `${radios[radioActual].corto} en pausa. Toca el logo para continuar.`);
  };

  const alternarReproduccion = () => {
    if (radioPlayer.paused || !reproduccionSolicitada) reproducir();
    else pausar();
  };

  radioPlayer.clickTvPlay = () => reproducir();
  radioPlayer.clickTvPause = () => pausar();

  const programarReconexion = () => {
    if (!reproduccionSolicitada) return;
    limpiarReconexion();

    if (intentosReconexion >= maxIntentos) {
      establecerEstado("error", "No se pudo recuperar la señal automáticamente.");
      if (retryButton) retryButton.hidden = false;
      return;
    }

    const espera = Math.min(1200 * (2 ** intentosReconexion), 10000);
    intentosReconexion += 1;
    establecerEstado("connecting", `Señal interrumpida. Reconectando (${intentosReconexion}/${maxIntentos})...`);
    reconexionTimer = setTimeout(() => reproducir({ reconexion: true }), espera);
  };

  botones.forEach((btn) => {
    const precalentar = () => {
      const nueva = btn.dataset.radio;
      if (nueva === radioActual) prepararFuente(false);
    };
    btn.addEventListener("pointerdown", precalentar, { passive: true });

    btn.addEventListener("click", async () => {
      const nueva = btn.dataset.radio;
      if (!radios[nueva]) return;

      // Tocar el logo/tarjeta de la emisora activa también inicia la radio.
      if (nueva === radioActual) {
        if (radioPlayer.paused || !reproduccionSolicitada) await reproducir();
        return;
      }

      limpiarReconexion();
      reproduccionSolicitada = false;
      reiniciarFuente();
      actualizarEmisoraUI(nueva);
      establecerEstado("connecting", `Cambiando a ${radios[nueva].corto}...`);
      await reproducir();
    });
  });

  [playButton, artButton].filter(Boolean).forEach((control) => {
    control.addEventListener("pointerdown", () => prepararFuente(false), { passive: true });
    control.addEventListener("click", alternarReproduccion);
  });

  retryButton?.addEventListener("click", () => {
    retryButton.hidden = true;
    intentosReconexion = 0;
    reproducir({ reconexion: true });
  });

  const volumenGuardado = Number(localStorage.getItem(CLAVE_VOLUMEN_RADIO));
  const volumenInicial = Number.isFinite(volumenGuardado) ? Math.min(1, Math.max(0, volumenGuardado)) : 0.85;
  radioPlayer.volume = volumenInicial;
  if (volumeControl) {
    volumeControl.value = String(volumenInicial);
    volumeControl.addEventListener("input", () => {
      const valor = Math.min(1, Math.max(0, Number(volumeControl.value)));
      radioPlayer.volume = valor;
      localStorage.setItem(CLAVE_VOLUMEN_RADIO, String(valor));
    });
  }

  radioPlayer.addEventListener("loadstart", () => {
    if (reproduccionSolicitada) establecerEstado("connecting", "Cargando señal en vivo...");
  });
  radioPlayer.addEventListener("waiting", () => {
    if (reproduccionSolicitada) establecerEstado("connecting", "Sincronizando señal en vivo...");
  });
  radioPlayer.addEventListener("canplay", () => {
    if (!reproduccionSolicitada && radioPlayer.paused) {
      establecerEstado("idle", `${radios[radioActual].corto} lista. Toca el logo para escuchar.`);
    }
  });
  radioPlayer.addEventListener("playing", () => {
    intentosReconexion = 0;
    if (retryButton) retryButton.hidden = true;
    saltarAlDirecto();
    actualizarBotonPlay(true);
    establecerEstado("live", `${radios[radioActual].nombre} transmitiendo en vivo.`);
  });
  radioPlayer.addEventListener("pause", () => {
    if (!reproduccionSolicitada) actualizarBotonPlay(false);
  });
  radioPlayer.addEventListener("stalled", programarReconexion);
  radioPlayer.addEventListener("error", programarReconexion);
  radioPlayer.addEventListener("ended", programarReconexion);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) detenerEcualizador();
    else if (!radioPlayer.paused && reproduccionSolicitada) iniciarEcualizador();
  });

  actualizarEmisoraUI(radioActual);
  establecerEstado("idle", "Preparando radio para reproducción rápida...");

  // Precalienta la emisora elegida sin reproducirla. En Safari puede ignorarse
  // hasta el primer toque; por eso también se repite en pointerdown.
  prepararFuente(false);
}

function configurarMediaSessionRadio(radioPlayer, radio = {}) {
  if (!("mediaSession" in navigator)) return;

  if ("MediaMetadata" in window) {
    let artwork = [];
    if (radio.logo) {
      try {
        artwork = [{ src: new URL(radio.logo, document.baseURI).href, sizes: "512x512", type: "image/png" }];
      } catch {
        artwork = [];
      }
    }

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: radio.nombre || "Radio deportiva en vivo",
        artist: "Click TV Streaming",
        album: "Radios deportivas de Quito",
        artwork
      });
    } catch {
      // Algunos navegadores exigen artwork absoluto o no aceptan MediaMetadata.
    }
  }

  try {
    navigator.mediaSession.setActionHandler("play", () => {
      if (typeof radioPlayer.clickTvPlay === "function") radioPlayer.clickTvPlay();
      else radioPlayer.play();
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      if (typeof radioPlayer.clickTvPause === "function") radioPlayer.clickTvPause();
      else radioPlayer.pause();
    });
  } catch {
    // Safari y navegadores antiguos pueden limitar Media Session.
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
    mostrarToast("No encontré ese servicio. Revisa el catálogo o consulta por WhatsApp, Signal o Telegram.", "info");
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
      consultar: Boolean(plan.consultar),
      ivaIncluido: Boolean(plan.ivaIncluido),
      bloquearDescuento: Boolean(plan.bloquearDescuento),
      operacion: item.operacion === "renovacion" ? "renovacion" : "compra"
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
  const itemId = `${producto.id}-${normalizarTexto(plan.tipo)}`;
  const existente = carrito.find((item) => item.itemId === itemId);

  if (existente) {
    existente.cantidad += 1;
    existente.consultar = existente.consultar || Boolean(plan.consultar);
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
      consultar: Boolean(plan.consultar),
      cantidad: 1,
      ivaIncluido: Boolean(plan.ivaIncluido),
      bloquearDescuento: Boolean(plan.bloquearDescuento),
      dispositivos: plan.dispositivos || null,
      operacion: "compra"
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

function renovarServicio(productoId, planIndex, agregarAlCarrito = false) {
  const data = obtenerPlanProducto(productoId, planIndex);
  if (!data) return mostrarToast("Servicio no disponible.", "error");

  const { producto, plan } = data;

  if (agregarAlCarrito) {
    agregarAlCarrito(producto, plan);
    const itemId = `${producto.id}-${normalizarTexto(plan.tipo)}`;
    const item = carrito.find((elemento) => elemento.itemId === itemId);
    if (item) item.operacion = "renovacion";
    guardarCarritoEnStorage();
    renderCarrito();
    return;
  }

  const mensaje = encodeURIComponent(
    `Hola Click TV, deseo renovar mi servicio:\n\nServicio: ${producto.nombre}\nPlan: ${plan.tipo}\nDeseo realizar renovación.`
  );
  window.open(`${CONFIG.whatsappLink}?text=${mensaje}`, "_blank", "noopener,noreferrer");
}

function marcarRenovacionCarrito(itemId) {
  const item = carrito.find((elemento) => elemento.itemId === itemId);
  if (!item) return;
  item.operacion = item.operacion === "renovacion" ? "compra" : "renovacion";
  guardarCarritoEnStorage();
  renderCarrito();
  mostrarToast(item.operacion === "renovacion" ? "Producto marcado para renovación." : "Producto marcado como compra nueva.", "info");
}

function obtenerMensajeRenovacion(item) {
  return `Hola Click TV Streaming, deseo renovar mi servicio:\n\nServicio: ${item.nombre}\nPlan: ${item.plan}\nCantidad: ${item.cantidad || 1}\nDeseo realizar la renovación.`;
}

function renovarItemWhatsApp(itemId) {
  const item = carrito.find((elemento) => elemento.itemId === itemId);
  if (!item) return;
  const mensaje = encodeURIComponent(obtenerMensajeRenovacion(item));
  window.open(`${CONFIG.whatsappLink}?text=${mensaje}`, "_blank", "noopener,noreferrer");
}

async function renovarItemSignal(itemId) {
  const item = carrito.find((elemento) => elemento.itemId === itemId);
  if (!item) return;
  await abrirSignalConMensaje(obtenerMensajeRenovacion(item));
}

async function renovarItemTelegram(itemId) {
  const item = carrito.find((elemento) => elemento.itemId === itemId);
  if (!item) return;
  abrirTelegramConMensaje(obtenerMensajeRenovacion(item));
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
          <div class="carrito-item__title-row">
            <p class="carrito-item__nombre">${item.nombre}</p>
            <span class="operation-badge ${item.operacion === "renovacion" ? "is-renewal" : ""}">${item.operacion === "renovacion" ? "Renovación" : "Compra nueva"}</span>
          </div>
          <p class="carrito-item__plan">${item.plan} · ${item.consultar ? "Precio por confirmar" : formatearPrecio(item.precio)}${item.ivaIncluido ? " · Precio final" : ""}${item.bloquearDescuento ? " · Sin cupón" : ""}</p>
          ${item.dispositivos ? `
            <label class="mini-label">Dispositivos
              <input type="number" min="1" max="10" value="${item.dispositivos}" onchange="modificarDispositivos('${item.itemId}', this.value)">
            </label>
          ` : ""}
          <div class="carrito-item__quantity-row">
            <div class="carrito-item__cantidad">
              <button type="button" onclick="cambiarCantidad('${item.itemId}', -1)" aria-label="Reducir cantidad">−</button>
              <span>${item.cantidad}</span>
              <button type="button" onclick="cambiarCantidad('${item.itemId}', 1)" aria-label="Aumentar cantidad">+</button>
            </div>
            <div class="carrito-item__renew-actions">
              <button type="button" class="cart-renew-toggle" onclick="marcarRenovacionCarrito('${item.itemId}')">${item.operacion === "renovacion" ? "Cambiar a compra" : "🔄 Marcar renovación"}</button>
              <div class="cart-renew-channels" aria-label="Renovar por canal de contacto">
                <button type="button" class="cart-renew-channel cart-renew-channel--wa" onclick="renovarItemWhatsApp('${item.itemId}')">🟢 Enviar por WhatsApp</button>
                <button type="button" class="cart-renew-channel cart-renew-channel--signal" onclick="renovarItemSignal('${item.itemId}')">🔵 Enviar por Signal</button>
                <button type="button" class="cart-renew-channel cart-renew-channel--telegram" onclick="renovarItemTelegram('${item.itemId}')">✈️ Enviar por Telegram</button>
              </div>
            </div>
          </div>
        </div>
        <button type="button" class="carrito-item__borrar" onclick="eliminarDelCarrito('${item.itemId}')" aria-label="Eliminar producto">🗑️</button>
      </div>
    `).join("");
  }

  const totales = calcularTotales();
  actualizarTexto("carrito-subtotal", formatearPrecio(totales.subtotal));
  actualizarTexto("carrito-descuento", `- ${formatearPrecio(totales.descuento)}`);
  actualizarTexto("carrito-iva", formatearPrecio(totales.iva));
  const contienePreciosPorConfirmar = carrito.some((item) => item.consultar);
  actualizarTexto("carrito-total", `${formatearPrecio(totales.total)}${contienePreciosPorConfirmar ? " + valores por confirmar" : ""}`);
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
  const anterior = Number(contador.textContent || 0);
  contador.textContent = totalItems;
  contador.style.display = totalItems > 0 ? "inline-flex" : "none";
  if (anterior !== totalItems) {
    contador.classList.remove("is-bumping");
    requestAnimationFrame(() => contador.classList.add("is-bumping"));
    setTimeout(() => contador.classList.remove("is-bumping"), 420);
  }
}

function abrirCarrito() {
  document.getElementById("panel-carrito")?.classList.add("abierto");
  document.getElementById("carrito-overlay")?.classList.add("visible");
  document.getElementById("btn-abrir-carrito")?.setAttribute("aria-expanded", "true");
  document.body.classList.add("cart-open");
  renderCarrito();
}

function cerrarCarrito() {
  document.getElementById("panel-carrito")?.classList.remove("abierto");
  document.getElementById("carrito-overlay")?.classList.remove("visible");
  document.getElementById("btn-abrir-carrito")?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("cart-open");
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
    case "signal":
      enviarPedidoSignal();
      break;
    case "telegram":
      enviarPedidoTelegram();
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
      mostrarToast("Copia los datos bancarios y envía el comprobante por WhatsApp, Signal o Telegram.", "info");
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
    whatsapp: "WhatsApp",
    signal: "Signal",
    telegram: "Telegram"
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
      <button class="btn btn--primary btn--full" onclick="enviarComprobanteWhatsApp()">📲 Enviar comprobante por WhatsApp</button>
      <button class="btn btn--outline btn--full" onclick="enviarComprobanteSignal()">🔵 Enviar comprobante por Signal</button>
      <button class="btn btn--outline btn--full" onclick="enviarComprobanteTelegram()">💬 Enviar comprobante por Telegram</button>
      <p>Luego envía tu comprobante por WhatsApp, Signal o Telegram para validar tu pedido.</p>
    `,
    deuna: `
      <strong>DEUNA</strong>
      <p>Total referencial: <b>${total}</b></p>
      <p>Paga desde el enlace oficial y luego envía el comprobante por WhatsApp, Signal o Telegram.</p>
      <a class="btn btn--primary btn--full" href="${CONFIG.deunaUrl}" target="_blank" rel="noopener noreferrer">Pagar con DEUNA</a>
      <button class="btn btn--outline btn--full" onclick="enviarComprobanteWhatsApp()">📲 Comprobante por WhatsApp</button>
      <button class="btn btn--outline btn--full" onclick="enviarComprobanteSignal()">🔵 Comprobante por Signal</button>
      <button class="btn btn--outline btn--full" onclick="enviarComprobanteTelegram()">💬 Comprobante por Telegram</button>
    `,
    payphone: `
      <strong>PayPhone</strong>
      <p>Total referencial: <b>${total}</b></p>
      <p>Abre el enlace de PayPhone y confirma el pago.</p>
      <a class="btn btn--primary btn--full" href="${CONFIG.payphoneUrl}" target="_blank" rel="noopener noreferrer">Pagar con PayPhone</a>
      <button class="btn btn--outline btn--full" onclick="enviarComprobanteWhatsApp()">📲 Comprobante por WhatsApp</button>
      <button class="btn btn--outline btn--full" onclick="enviarComprobanteSignal()">🔵 Comprobante por Signal</button>
      <button class="btn btn--outline btn--full" onclick="enviarComprobanteTelegram()">💬 Comprobante por Telegram</button>
    `,
    paypalme: `
      <strong>PayPal</strong>
      <p>Total con comisión PayPal estimada: <b>${totalPaypal}</b></p>
      <p>Usa el botón PayPal que aparece debajo o paga con PayPal.Me.</p>
      <a class="btn btn--primary btn--full" href="${CONFIG.paypalUrl}" target="_blank" rel="noopener noreferrer">Pagar con PayPal.Me</a>
      <button class="btn btn--outline btn--full" onclick="enviarComprobanteWhatsApp()">📲 Comprobante por WhatsApp</button>
      <button class="btn btn--outline btn--full" onclick="enviarComprobanteSignal()">🔵 Comprobante por Signal</button>
      <button class="btn btn--outline btn--full" onclick="enviarComprobanteTelegram()">💬 Comprobante por Telegram</button>
    `,
    whatsapp: `
      <strong>Pedido por WhatsApp</strong>
      <p>Total a confirmar: <b>${total}</b></p>
      <p>Enviaremos el resumen completo del carrito por WhatsApp.</p>
      <button class="btn btn--primary btn--full" onclick="enviarPedidoWhatsApp()">📲 Enviar pedido por WhatsApp</button>
    `,
    signal: `
      <strong>Pedido por Signal</strong>
      <p>Total a confirmar: <b>${total}</b></p>
      <p>Copiaremos el resumen del carrito y abriremos Signal para que puedas pegarlo.</p>
      <button class="btn btn--primary btn--full" onclick="enviarPedidoSignal()">🔵 Copiar pedido y abrir Signal</button>
    `,
    telegram: `
      <strong>Pedido por Telegram</strong>
      <p>Total a confirmar: <b>${total}</b></p>
      <p>Copiaremos el resumen del carrito y abriremos el chat oficial de Telegram.</p>
      <button class="btn btn--primary btn--full" onclick="enviarPedidoTelegram()">💬 Copiar pedido y abrir Telegram</button>
    `
  };

  detalle.innerHTML = detalles[metodoPagoActual] || detalles.transferencia;

  if (paypalBox) {
    paypalBox.classList.toggle("visible", metodoPagoActual === "paypalme");
  }
}

function generarResumenPedido() {
  const resumen = carrito.map((item) => {
    const operacion = item.operacion === "renovacion" ? "RENOVACIÓN" : "COMPRA NUEVA";
    const precioLinea = item.consultar ? " · PRECIO POR CONFIRMAR" : ` · $${Number(item.precio).toFixed(2)} USD c/u`;
    return `• ${operacion}: ${item.nombre} (${item.plan}) x${item.cantidad}${precioLinea}`;
  }).join("\n");
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

async function copiarResumenParaCanal(tipo = "pedido") {
  const encabezado = tipo === "comprobante"
    ? "Hola, ya realicé el pago y deseo enviar mi comprobante para validar este pedido."
    : "Hola, deseo realizar el siguiente pedido:";
  const mensaje = `${encabezado}

${generarResumenPedido()}`;
  try {
    await navigator.clipboard.writeText(mensaje);
    mostrarToast("Resumen copiado. Pégalo en el chat junto con tu comprobante.", "exito");
  } catch (error) {
    mostrarToast("Abriendo el canal. Adjunta el comprobante y escribe el resumen del pedido.", "info");
  }
}

function generarMensajeParaCanal(tipo = "pedido") {
  const encabezado = tipo === "comprobante"
    ? "Hola, ya realicé el pago y deseo enviar mi comprobante para validar este pedido."
    : "Hola, deseo realizar el siguiente pedido:";
  return `${encabezado}

${generarResumenPedido()}`;
}

async function enviarComprobanteSignal() {
  await abrirSignalConMensaje(generarMensajeParaCanal("comprobante"));
}

function enviarComprobanteTelegram() {
  abrirTelegramConMensaje(generarMensajeParaCanal("comprobante"));
}

async function enviarPedidoSignal() {
  if (carrito.length === 0) return mostrarToast("Tu carrito está vacío.", "error");
  await abrirSignalConMensaje(generarMensajeParaCanal("pedido"));
}

function enviarPedidoTelegram() {
  if (carrito.length === 0) return mostrarToast("Tu carrito está vacío.", "error");
  abrirTelegramConMensaje(generarMensajeParaCanal("pedido"));
}

function cargarPayPalSDK() {
  if (typeof paypal !== "undefined") return Promise.resolve(paypal);
  if (paypalSdkPromise) return paypalSdkPromise;

  paypalSdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const clientId = encodeURIComponent(CONFIG.paypalClientIdLive);
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.async = true;
    script.onload = () => resolve(window.paypal);
    script.onerror = () => reject(new Error("No se pudo cargar PayPal SDK"));
    document.head.appendChild(script);
  });

  return paypalSdkPromise;
}

async function inicializarPayPalCheckout() {
  const contenedor = document.getElementById("paypal-button-container-carrito");
  if (!contenedor || paypalRenderizado) return;

  try {
    await cargarPayPalSDK();
  } catch (error) {
    console.error("PayPal SDK:", error);
    contenedor.innerHTML = `<p class="notice">PayPal Checkout no pudo cargar. Usa PayPal.Me como alternativa.</p>`;
    return;
  }

  if (typeof paypal === "undefined") return;

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
    box.innerHTML = `<div class="loading-card">⚽ Buscando partidos del Mundial, Libertadores y LigaPro Ecuador...</div>`;
  }

  try {
    const respuestaPartidos = await obtenerPartidosFootballData();
    const partidosAPI = Array.isArray(respuestaPartidos) ? respuestaPartidos : (respuestaPartidos.matches || respuestaPartidos.partidos || []);
    const partidosApiNormalizados = normalizarPartidos(partidosAPI).filter(tieneEquiposReales);
    actualizarFuentePartidos(respuestaPartidos);
    const partidosLocales = Array.isArray(MUNDIAL_2026) ? normalizarPartidosLocales(MUNDIAL_2026).filter(tieneEquiposReales) : [];
    const partidos = combinarPartidosMundial(partidosApiNormalizados, partidosLocales);
    const html = renderizarBloquesMundial(partidos);
    iniciarCronometroMundial();
    box.innerHTML = html || `
      <div class="loading-card">
        ⚽ No hay partidos disponibles actualmente en las competiciones consultadas.
        <br>Volveremos a consultar automáticamente en 30 segundos.
      </div>`;
  } catch (error) {
    console.warn("No se pudo cargar la API de fútbol; se usa el calendario local:", error);
    box.innerHTML = renderizarRespaldoMundial();
    iniciarCronometroMundial();
  }
}

async function obtenerPartidosFootballData() {
  const params = new URLSearchParams({
    dateFrom: fechaConsultaMundial(-2),
    dateTo: fechaConsultaMundial(12)
  });

  let data = null;

  // En Vercel se usa el agregador serverless para Mundial, Libertadores y LigaPro.
  try {
    const endpoint = CONFIG.partidosApiUrl || "/api/partidos";
    const respuestaProxy = await fetch(`${endpoint}?${params.toString()}`, { cache: "no-store" });
    if (respuestaProxy.ok) data = await respuestaProxy.json();
  } catch (error) {
    console.warn("El agregador de partidos no respondió:", error);
  }

  // Respaldo directo: conserva el Mundial si el endpoint serverless no está disponible.
  if (!data) {
    const url = new URL(CONFIG.footballDataApiUrl);
    url.search = params.toString();
    const respuestaDirecta = await fetch(url.toString(), {
      headers: { "X-Auth-Token": CONFIG.footballDataApiToken }
    });
    if (!respuestaDirecta.ok) throw new Error(`Football-Data HTTP ${respuestaDirecta.status}`);
    data = await respuestaDirecta.json();
  }

  const matches = Array.isArray(data) ? data : (data.matches || data.partidos || []);
  const enriquecidos = await enriquecerPartidosConDetalle(matches);
  return Array.isArray(data) ? enriquecidos : { ...data, matches: enriquecidos };
}

function actualizarFuentePartidos(respuesta = {}) {
  const estado = document.getElementById("football-source-status");
  if (!estado) return;
  const fuentes = Array.isArray(respuesta.fuentes) ? respuesta.fuentes.filter(Boolean) : [];
  const total = Number(respuesta.total || respuesta.matches?.length || 0);
  estado.textContent = total
    ? `✅ ${total} partido${total === 1 ? "" : "s"} encontrados · ${fuentes.join(" · ") || "Calendario actualizado"}`
    : "ℹ️ Sin encuentros cercanos; actualización automática cada 30 segundos.";
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
  return Boolean(match.id) && /^\d+$/.test(String(match.id)) && ["LIVE", "IN_PLAY", "PAUSED", "FINISHED"].includes(status);
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

function normalizarSedePartido(valor) {
  let sede = valor;
  if (sede && typeof sede === "object") {
    sede = sede.name || sede.fullName || sede.shortName || sede.label || "";
  }

  sede = String(sede || "").replace(/\s+/g, " ").trim();
  if (!sede) return "";
  if (/^(sede|estadio|venue)?\s*(por confirmar|pendiente)$/i.test(sede)) return "";
  if (/^(tbd|tbc|to be confirmed|unknown|n\/?a|null|undefined|-+)$/i.test(sede)) return "";
  return sede;
}

function extraerSedePartidoApi(match = {}) {
  const candidatos = [
    match.venue,
    match.stadium,
    match.matchVenue,
    match.location,
    match.ground,
    match.details?.venue,
    match.details?.stadium
  ];

  for (const candidato of candidatos) {
    const sede = normalizarSedePartido(candidato);
    if (sede) return sede;
  }
  return "";
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
    sede: extraerSedePartidoApi(m),
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
        sede: normalizarSedePartido(p.sede),
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
    sede: normalizarSedePartido(nuevo.sede) || normalizarSedePartido(base.sede)
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
  const sede = normalizarSedePartido(p.sede);
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
      ${sede ? `<p class="match-venue">📍 ${escaparHTML(sede)}</p>` : ""}
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

  const resenas = obtenerTodasLasResenas();
  if (!resenas.length) {
    contenedor.innerHTML = '<p class="resenas-vacias">Pronto aparecerán nuevas reseñas verificadas.</p>';
    return;
  }

  indiceResena = indiceResena % resenas.length;
  contenedor.innerHTML = crearResena(resenas[indiceResena]);
  actualizarEstadoResenas(resenas.length);
  reiniciarProgresoResena();
  renderResenasCarrito();
}

function actualizarEstadoResenas(total) {
  const contador = document.getElementById("resena-contador");
  if (contador) contador.textContent = `${indiceResena + 1} de ${total}`;
}

function reiniciarProgresoResena() {
  const progreso = document.getElementById("resena-progreso");
  if (!progreso) return;
  progreso.style.animation = "none";
  void progreso.offsetWidth;
  progreso.style.animation = "reviewProgress 10s linear forwards";
}

function crearResena(resena) {
  return `
    <article class="resena-card activa" aria-live="polite">
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

  const formulario = evento.currentTarget || evento.target;
  const datosFormulario = new FormData(formulario);
  const nombre = String(datosFormulario.get("nombre") || "").trim();
  const pais = String(datosFormulario.get("pais") || "").trim();
  const estrellas = Number(datosFormulario.get("estrellas") || 5);
  const comentario = String(datosFormulario.get("comentario") || "").trim();

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
  const contenedor = document.getElementById("resenas-slider");
  const resenas = obtenerTodasLasResenas();
  if (!contenedor || !resenas.length) return;

  indiceResena = (indiceResena + 1) % resenas.length;
  const tarjetaActual = contenedor.querySelector(".resena-card");

  if (!tarjetaActual) {
    contenedor.innerHTML = crearResena(resenas[indiceResena]);
    return;
  }

  tarjetaActual.classList.add("saliendo");
  window.setTimeout(() => {
    contenedor.innerHTML = crearResena(resenas[indiceResena]);
    actualizarEstadoResenas(resenas.length);
    reiniciarProgresoResena();
  }, 280);
}

function renderActividadReciente() {
  const box = document.getElementById("actividad-reciente");
  if (!box || !ACTIVIDAD_RECIENTE?.length) return;
  const texto = String(ACTIVIDAD_RECIENTE[indiceActividad % ACTIVIDAD_RECIENTE.length]).replace(/^🟢\s*/, "");
  box.classList.remove("activity-pill--animate");
  box.innerHTML = `<span class="activity-live"><i aria-hidden="true"></i>LIVE</span><span>${escaparHTML(texto)}</span>`;
  requestAnimationFrame(() => box.classList.add("activity-pill--animate"));
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
// EXPERIENCIA PREMIUM, ANIMACIONES Y ACCESIBILIDAD
// ---------------------------------------------------------------------------
function inicializarFondoDinamico() {
  const contenedor = document.getElementById("tech-particles");
  if (!contenedor || contenedor.childElementCount) return;
  const cantidad = window.matchMedia("(max-width: 720px)").matches ? 10 : 18;
  const fragmento = document.createDocumentFragment();

  for (let i = 0; i < cantidad; i += 1) {
    const particula = document.createElement("span");
    particula.style.setProperty("--x", `${Math.random() * 100}%`);
    particula.style.setProperty("--y", `${Math.random() * 100}%`);
    particula.style.setProperty("--size", `${2 + Math.random() * 4}px`);
    particula.style.setProperty("--duration", `${12 + Math.random() * 18}s`);
    particula.style.setProperty("--delay", `${-Math.random() * 20}s`);
    fragmento.appendChild(particula);
  }
  contenedor.appendChild(fragmento);
}

function inicializarAnimacionesScroll() {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("reveal--visible"));
    return;
  }

  observadorReveal = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add("reveal--visible");
      observadorReveal.unobserve(entrada.target);
    });
  }, { rootMargin: "0px 0px -8%", threshold: 0.08 });

  registrarContenidoDinamico(document);

  const mutaciones = new MutationObserver((lista) => {
    lista.forEach((mutacion) => {
      mutacion.addedNodes.forEach((nodo) => {
        if (nodo.nodeType === Node.ELEMENT_NODE) registrarContenidoDinamico(nodo);
      });
    });
  });
  mutaciones.observe(document.body, { childList: true, subtree: true });
}

function registrarContenidoDinamico(root = document) {
  const selector = [
    ".reveal", ".section-head", ".step-card", ".product-card", ".payment-card", ".stat-card",
    ".faq-card", ".match-card", ".glass-card", ".teleamazonas-player-card",
    ".saving-option", ".savings-card", ".radio-app"
  ].join(",");

  const elementos = [];
  if (root.matches?.(selector)) elementos.push(root);
  root.querySelectorAll?.(selector).forEach((el) => elementos.push(el));

  elementos.forEach((el, index) => {
    if (!el.classList.contains("reveal")) el.classList.add("reveal");
    el.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 55}ms`);
    if (observadorReveal) observadorReveal.observe(el);
  });
}

function inicializarTiltPremium() {
  const permiteMovimiento = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const permiteHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!permiteMovimiento || !permiteHover) return;

  let frame = 0;
  let tarjetaActiva = null;
  let ultimoEvento = null;
  const selector = ".product-card, .payment-card, .step-card, .faq-card, .match-card, .stat-card, .glass-card, .radio-app";

  document.addEventListener("pointermove", (evento) => {
    const tarjeta = evento.target.closest(selector);
    if (!tarjeta) return;
    tarjetaActiva = tarjeta;
    ultimoEvento = evento;
    tarjeta.classList.add("premium-tilt");

    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!tarjetaActiva || !ultimoEvento) return;
      const rect = tarjetaActiva.getBoundingClientRect();
      const x = (ultimoEvento.clientX - rect.left) / rect.width - 0.5;
      const y = (ultimoEvento.clientY - rect.top) / rect.height - 0.5;
      tarjetaActiva.style.setProperty("--ry", `${x * 4.5}deg`);
      tarjetaActiva.style.setProperty("--rx", `${y * -4.5}deg`);
      tarjetaActiva.style.setProperty("--glow-x", `${(x + 0.5) * 100}%`);
      tarjetaActiva.style.setProperty("--glow-y", `${(y + 0.5) * 100}%`);
    });
  }, { passive: true });

  document.addEventListener("pointerout", (evento) => {
    const tarjeta = evento.target.closest(selector);
    if (!tarjeta || tarjeta.contains(evento.relatedTarget)) return;
    tarjeta.style.setProperty("--ry", "0deg");
    tarjeta.style.setProperty("--rx", "0deg");
  });
}

function inicializarAccesibilidadGlobal() {
  document.addEventListener("keydown", (evento) => {
    if (evento.key !== "Escape") return;
    cerrarCarrito();
    cerrarModalUbicacion();
    cerrarMenuMovil();
  });

  document.querySelectorAll('a[target="_blank"]').forEach((enlace) => {
    enlace.rel = "noopener noreferrer";
  });
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
