/* script.js - Corrección Radio La Red + Mundial 2026
   Reemplazar funciones equivalentes en tu proyecto actual.
*/

// Radio estable
function inicializarRadio() {
  const radio = document.getElementById("radio-player");
  if (!radio) return;

  const urlRadio = "https://icecast.radiolared.com.ec/radiolared";

  radio.src = urlRadio;
  radio.preload = "none";

  radio.addEventListener("stalled", () => {
    console.log("Radio detenida, intentando recuperar señal...");
    setTimeout(() => {
      if (!radio.paused) radio.load();
    }, 3000);
  });

  radio.addEventListener("error", () => {
    console.log("Error de radio, reintentando...");
    setTimeout(() => {
      radio.load();
    }, 5000);
  });
}


// Mundial: respaldo de próximos partidos
const MUNDIAL_2026_EXTRA = [
  {
    etapa: "Semifinal",
    local: "Francia",
    visitante: "España",
    fechaUTC: "2026-07-14T20:00:00Z",
    marcador: "",
    sede: "Mundial 2026"
  },
  {
    etapa: "Semifinal",
    local: "Inglaterra",
    visitante: "Argentina",
    fechaUTC: "2026-07-15T20:00:00Z",
    marcador: "",
    sede: "Mundial 2026"
  },
  {
    etapa: "Tercer puesto",
    local: "Por definir",
    visitante: "Por definir",
    fechaUTC: "2026-07-18T20:00:00Z",
    marcador: "",
    sede: "Mundial 2026"
  },
  {
    etapa: "Final Mundial 2026",
    local: "Por definir",
    visitante: "Por definir",
    fechaUTC: "2026-07-19T19:00:00Z",
    marcador: "",
    sede: "Final Mundial 2026"
  }
];
