// BLOQUE MUNDIAL V11.5
// Integrar dentro del script.js actual.
// Usa crest de Football Data si existe.

function obtenerEscudoMundial(p,lado){
 return lado==="local"
 ? (p.escudoLocal || p.homeTeam?.crest || "")
 : (p.escudoVisitante || p.awayTeam?.crest || "");
}
