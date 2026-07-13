
/*
 CLICK TV MUNDIAL V11.5 REAL
 Parche para integrar sobre script.js existente.

 Incluye:
 - escudos desde Football Data
 - tarjeta estilo pantalla gigante
 - cronómetro visual
 - cuenta regresiva
*/

function obtenerEscudoEquipo(partido, lado) {
  if (lado === "local") {
    return partido.escudoLocal || partido.homeTeam?.crest || "";
  }
  return partido.escudoVisitante || partido.awayTeam?.crest || "";
}

function crearTarjetaPantallaGigante(p) {
  const estado = obtenerTextoTiempoPartido(p);
  const score = obtenerMarcadorPartido(p) || "VS";

  return `
  <article class="match-card stadium-card ${estado.estado.includes("EN VIVO") ? "is-live" : ""}">
    <div class="stadium-status">${estado.estado}</div>

    <div class="stadium-teams">
      <div class="stadium-team">
        ${obtenerEscudoEquipo(p,"local") ? `<img src="${obtenerEscudoEquipo(p,"local")}" class="team-shield">` : ""}
        <span>${p.local}</span>
      </div>

      <div class="stadium-score">
        <strong>${score}</strong>
        <span class="stadium-time">${estado.detalle}</span>
      </div>

      <div class="stadium-team">
        ${obtenerEscudoEquipo(p,"visitante") ? `<img src="${obtenerEscudoEquipo(p,"visitante")}" class="team-shield">` : ""}
        <span>${p.visitante}</span>
      </div>
    </div>
  </article>`;
}

function iniciarRelojMundial() {
  document.querySelectorAll(".stadium-time").forEach((elemento)=>{
    setInterval(()=>{
      if(elemento.dataset.live==="true"){
        elemento.textContent = "⏱ " + new Date().toLocaleTimeString();
      }
    },1000);
  });
}
