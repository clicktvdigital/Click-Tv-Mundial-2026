/* ==========================================================================
   CLICK TV STREAMING MUNDIAL 2026 — catalogo.js
   Renderizado del catálogo de productos, filtros por categoría y reseñas
   ========================================================================== */

let categoriaActiva = "todos";

// ---------------------------------------------------------------------------
// RENDER CATÁLOGO
// ---------------------------------------------------------------------------
function renderCatalogo() {
  const contenedor = document.getElementById("catalogo-grid");
  if (!contenedor) return;

  const productosFiltrados =
    categoriaActiva === "todos"
      ? PRODUCTOS
      : PRODUCTOS.filter((p) => p.categoria === categoriaActiva);

  if (productosFiltrados.length === 0) {
    contenedor.innerHTML = `<p class="catalogo-vacio">No hay productos en esta categoría.</p>`;
    return;
  }

  contenedor.innerHTML = productosFiltrados
    .map((producto) => crearTarjetaProducto(producto))
    .join("");

  // Vincular eventos de planes (cambiar precio mostrado) y botones
  productosFiltrados.forEach((producto) => {
    const select = document.getElementById(`plan-${producto.id}`);
    if (select) {
      select.addEventListener("change", () => actualizarPrecioTarjeta(producto.id));
    }
  });
}

function crearTarjetaProducto(producto) {
  const planOptions = producto.planes
    .map(
      (plan, i) =>
        `<option value="${i}">${plan.tipo} — ${formatearPrecio(plan.precio)}</option>`
    )
    .join("");

  return `
    <article class="card-producto" data-id="${producto.id}">
      <div class="card-producto__icono">${producto.icono}</div>
      <h3 class="card-producto__nombre">${producto.nombre}</h3>
      <p class="card-producto__desc">${producto.descripcion}</p>

      <label class="card-producto__label" for="plan-${producto.id}">Plan</label>
      <select class="card-producto__select" id="plan-${producto.id}">
        ${planOptions}
      </select>

      <p class="card-producto__precio" id="precio-${producto.id}">
        ${formatearPrecio(producto.planes[0].precio)}
      </p>

      <div class="card-producto__acciones">
        <button class="btn btn-primario" onclick="agregarDesdeCarta('${producto.id}')">
          🛒 Agregar al carrito
        </button>
        <button class="btn btn-whatsapp" onclick="comprarPorWhatsapp('${producto.id}')">
          💬 Comprar por WhatsApp
        </button>
      </div>
    </article>
  `;
}

function actualizarPrecioTarjeta(productoId) {
  const producto = PRODUCTOS.find((p) => p.id === productoId);
  const select = document.getElementById(`plan-${productoId}`);
  const precioEl = document.getElementById(`precio-${productoId}`);
  if (!producto || !select || !precioEl) return;
  const plan = producto.planes[select.value];
  precioEl.textContent = formatearPrecio(plan.precio);
}

function agregarDesdeCarta(productoId) {
  const producto = PRODUCTOS.find((p) => p.id === productoId);
  const select = document.getElementById(`plan-${productoId}`);
  if (!producto || !select) return;
  const plan = producto.planes[select.value];
  agregarAlCarrito(producto, plan);
}

function comprarPorWhatsapp(productoId) {
  const producto = PRODUCTOS.find((p) => p.id === productoId);
  const select = document.getElementById(`plan-${productoId}`);
  if (!producto || !select) return;
  const plan = producto.planes[select.value];
  const mensaje = encodeURIComponent(
    `Hola, quiero comprar *${producto.nombre}* — Plan ${plan.tipo} (${formatearPrecio(
      plan.precio
    )}). ¿Me ayudan con el proceso?`
  );
  window.open(`https://wa.me/${CONFIG.whatsappNumero}?text=${mensaje}`, "_blank");
}

// ---------------------------------------------------------------------------
// FILTROS DE CATEGORÍA
// ---------------------------------------------------------------------------
function inicializarFiltros() {
  const botones = document.querySelectorAll(".filtro-categoria");
  botones.forEach((btn) => {
    btn.addEventListener("click", () => {
      botones.forEach((b) => b.classList.remove("activo"));
      btn.classList.add("activo");
      categoriaActiva = btn.dataset.categoria;
      renderCatalogo();
    });
  });
}

// ---------------------------------------------------------------------------
// RESEÑAS
// ---------------------------------------------------------------------------
let listaResenas = [];

function cargarResenas() {
  const guardadas = localStorage.getItem("clicktv_resenas_extra");
  const extra = guardadas ? JSON.parse(guardadas) : [];
  listaResenas = [...RESENAS, ...extra];
  renderResenas();
}

function renderResenas() {
  const contenedor = document.getElementById("resenas-grid");
  if (!contenedor) return;

  contenedor.innerHTML = listaResenas
    .map(
      (r) => `
      <article class="card-resena">
        <div class="card-resena__estrellas">${"⭐".repeat(r.estrellas)}${"☆".repeat(
        5 - r.estrellas
      )}</div>
        <p class="card-resena__comentario">"${escapeHtml(r.comentario)}"</p>
        <p class="card-resena__autor">${escapeHtml(r.nombre)} · ${escapeHtml(r.pais)}</p>
      </article>
    `
    )
    .join("");
}

function agregarResena(evento) {
  evento.preventDefault();
  const nombre = document.getElementById("resena-nombre").value.trim();
  const pais = document.getElementById("resena-pais").value.trim();
  const estrellas = parseInt(document.getElementById("resena-estrellas").value, 10);
  const comentario = document.getElementById("resena-comentario").value.trim();

  if (!nombre || !pais || !comentario) {
    mostrarToast("Completa todos los campos de la reseña.", "error");
    return;
  }

  const nuevaResena = { nombre, pais, estrellas, comentario };
  listaResenas.push(nuevaResena);

  const guardadas = localStorage.getItem("clicktv_resenas_extra");
  const extra = guardadas ? JSON.parse(guardadas) : [];
  extra.push(nuevaResena);
  localStorage.setItem("clicktv_resenas_extra", JSON.stringify(extra));

  renderResenas();
  evento.target.reset();
  mostrarToast("¡Gracias por tu reseña! 🌟", "exito");
}

function escapeHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// ---------------------------------------------------------------------------
// MUNDIAL 2026 — Render de grupos y partidos
// ---------------------------------------------------------------------------
function renderMundial() {
  const contenedor = document.getElementById("mundial-grid");
  if (!contenedor) return;

  contenedor.innerHTML = MUNDIAL_2026.map(
    (grupo) => `
      <article class="card-grupo">
        <h3 class="card-grupo__titulo">${grupo.grupo}</h3>
        ${grupo.partidos
          .map(
            (p) => `
          <div class="partido">
            <span class="partido__equipos">${p.local} 🆚 ${p.visitante}</span>
            <span class="partido__info">${formatearFecha(p.fecha)} · ${p.hora} (Ecuador) · ${p.sede}</span>
          </div>
        `
          )
          .join("")}
      </article>
    `
  ).join("");

  renderPartidosDelDia();
}

function renderPartidosDelDia() {
  const contenedor = document.getElementById("partidos-hoy");
  if (!contenedor) return;

  const hoy = new Date().toISOString().split("T")[0];
  const todos = MUNDIAL_2026.flatMap((g) =>
    g.partidos.map((p) => ({ ...p, grupo: g.grupo }))
  );
  const partidosHoy = todos.filter((p) => p.fecha === hoy);

  if (partidosHoy.length === 0) {
    contenedor.innerHTML = `<p class="partidos-hoy__vacio">No hay partidos programados para hoy. Revisa el calendario completo por grupos. ⚽</p>`;
    return;
  }

  contenedor.innerHTML = partidosHoy
    .map(
      (p) => `
      <div class="partido partido--destacado">
        <span class="partido__equipos">${p.local} 🆚 ${p.visitante}</span>
        <span class="partido__info">${p.grupo} · ${p.hora} (Ecuador) · ${p.sede}</span>
      </div>
    `
    )
    .join("");
}

function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO + "T00:00:00");
  return fecha.toLocaleDateString("es-EC", { day: "2-digit", month: "short", year: "numeric" });
}
