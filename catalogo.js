/* ========================================================================== 
   CLICK TV STREAMING MUNDIAL 2026 — catalogo.js
   Render de catálogo, filtros y botones de compra
   ========================================================================== */

const CATEGORIAS = {
  todos: "Todos",
  streaming: "🎬 Streaming",
  iptv: "📺 IPTV",
  musica: "🎵 Música",
  apps: "🎓 Premium Apps",
  deportes: "⚽ Deportes"
};

let categoriaCatalogoActual = "todos";

function inicializarFiltros() {
  const botones = document.querySelectorAll("[data-categoria]");
  botones.forEach((btn) => {
    btn.addEventListener("click", () => {
      seleccionarCategoriaCatalogo(btn.dataset.categoria || "todos");
    });
  });

  document.querySelectorAll("[data-ir-categoria]").forEach((link) => {
    link.addEventListener("click", () => {
      seleccionarCategoriaCatalogo(link.dataset.irCategoria || "todos");
    });
  });
}

function seleccionarCategoriaCatalogo(categoria) {
  categoriaCatalogoActual = categoria || "todos";

  document.querySelectorAll("[data-categoria]").forEach((btn) => {
    btn.classList.toggle("activo", btn.dataset.categoria === categoriaCatalogoActual);
  });

  renderCatalogo();
}

function renderCatalogo() {
  const contenedor = document.getElementById("catalogo-grid");
  if (!contenedor || typeof PRODUCTOS === "undefined") return;

  const productosFiltrados = categoriaCatalogoActual === "todos"
    ? PRODUCTOS
    : PRODUCTOS.filter((producto) => producto.categoria === categoriaCatalogoActual);

  if (productosFiltrados.length === 0) {
    contenedor.innerHTML = `
      <div class="empty-state">
        <h3>Sin productos disponibles</h3>
        <p>Pronto agregaremos más opciones a esta categoría.</p>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = productosFiltrados.map((producto) => crearCardProducto(producto)).join("");
}

function crearCardProducto(producto) {
  const etiquetas = (producto.etiquetas || [])
    .map((etiqueta) => `<span class="product-badge">${etiqueta}</span>`)
    .join("");

  const planes = producto.planes
    .map((plan, index) => crearPlanProducto(producto, plan, index))
    .join("");

  return `
    <article class="product-card" data-producto="${producto.id}">
      <div class="product-card__top">
        <span class="product-card__icon">${producto.icono}</span>
        <div>
          <h3>${producto.nombre}</h3>
          <p>${producto.descripcion}</p>
        </div>
      </div>

      <div class="product-card__badges">${etiquetas}</div>

      <div class="planes-lista">
        ${planes}
      </div>
    </article>
  `;
}

function crearPlanProducto(producto, plan, index) {
  const precioTexto = plan.consultar ? "Consultar disponibilidad" : formatearPrecio(plan.precio);
  const btnComprar = plan.consultar ? "💬 Consultar" : "🟢 Comprar Ahora";

  return `
    <div class="plan-row">
      <div class="plan-row__info">
        <strong>${plan.tipo}</strong>
        <span>${precioTexto}</span>
      </div>
      <div class="plan-row__actions">
        <button class="btn btn--primary btn--mini" onclick="comprarAhora('${producto.id}', ${index})">${btnComprar}</button>
        <button class="btn btn--outline btn--mini" onclick="agregarPlanAlCarrito('${producto.id}', ${index})">🛒 Añadir</button>
      </div>
    </div>
  `;
}

function obtenerProductoPorId(productoId) {
  return PRODUCTOS.find((producto) => producto.id === productoId);
}

function obtenerPlanProducto(productoId, planIndex) {
  const producto = obtenerProductoPorId(productoId);
  if (!producto) return null;
  const plan = producto.planes[planIndex];
  if (!plan) return null;
  return { producto, plan };
}
