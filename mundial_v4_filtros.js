
/*
 CLICK TV STREAMING - Mundial 2026 V4
 Filtros no destructivos:
 - elimina próximos partidos vencidos
 - prioriza vivo/finalizado/próximo
 - mantiene respaldo cuando la API no responde
*/

function filtrarPartidosMundialV4(partidos = []) {
  const ahora = new Date();

  return partidos.filter(p => {
    const fecha = new Date(p.fecha || p.fechaUTC || p.date || ahora);
    const estado = String(p.estado || p.status || "").toUpperCase();

    if (estado.includes("LIVE") || estado.includes("EN VIVO")) return true;
    if (estado.includes("FINAL")) return true;

    return fecha >= ahora;
  });
}

function ordenarPartidosMundialV4(partidos = []) {
  const prioridad = {
    LIVE: 1,
    "EN VIVO": 1,
    HALF: 2,
    ENTRETIEMPO: 2,
    FINAL: 3,
    "FINALIZADO": 3
  };

  return [...partidos].sort((a,b)=>{
    const ea = prioridad[String(a.estado || a.status || "").toUpperCase()] || 4;
    const eb = prioridad[String(b.estado || b.status || "").toUpperCase()] || 4;
    if (ea !== eb) return ea-eb;
    return new Date(a.fecha || 0)-new Date(b.fecha || 0);
  });
}
