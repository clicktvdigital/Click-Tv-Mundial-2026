// REEMPLAZA ÚNICAMENTE LA FUNCIÓN renderMundial() ACTUAL POR ESTA.
// No modifica la radio ni ninguna otra parte de la web.

async function renderMundial(silencioso = false) {
  const box = document.getElementById("mundial-grid");
  if (!box) return;

  if (!silencioso) {
    box.innerHTML = `<div class="loading-card">⚽ Cargando información del Mundial 2026...</div>`;
  }

  // El respaldo local se prepara ANTES de llamar a la API.
  // Así los partidos siguen visibles aunque Football-Data falle, bloquee CORS
  // o alcance el límite de solicitudes.
  const partidosLocales = Array.isArray(MUNDIAL_2026)
    ? normalizarPartidosLocales(MUNDIAL_2026).filter(tieneEquiposReales)
    : [];

  try {
    const partidosAPI = await obtenerPartidosFootballData();
    const partidosApiNormalizados = normalizarPartidos(partidosAPI).filter(tieneEquiposReales);
    const partidos = combinarPartidosMundial(partidosApiNormalizados, partidosLocales);
    const html = renderizarBloquesMundial(partidos);

    box.innerHTML = html || renderizarRespaldoMundial();
  } catch (error) {
    console.warn("Football-Data no respondió; se usa el calendario local:", error);

    const htmlLocal = renderizarBloquesMundial(partidosLocales);
    box.innerHTML = htmlLocal || renderizarRespaldoMundial();
  }
}
