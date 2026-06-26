/* ==========================================================================
   CLICK TV STREAMING MUNDIAL 2026 — data.js
   Fuente de datos: productos, reseñas, partidos del mundial, tasas de cambio
   ========================================================================== */

// ---------------------------------------------------------------------------
// PRODUCTOS
// ---------------------------------------------------------------------------
const PRODUCTOS = [
  // ---------- STREAMING ----------
  {
    id: "netflix",
    nombre: "Netflix Premium",
    categoria: "streaming",
    icono: "🎬",
    descripcion: "4 pantallas · Full HD/4K · Perfiles ilimitados",
    planes: [
      { tipo: "Mensual", precio: 4.5 },
      { tipo: "Trimestral", precio: 12 }
    ]
  },
  {
    id: "disney",
    nombre: "Disney+ Premium",
    categoria: "streaming",
    icono: "🏰",
    descripcion: "Marvel, Star Wars, Pixar y National Geographic",
    planes: [
      { tipo: "Mensual", precio: 4 },
      { tipo: "Trimestral", precio: 10.5 }
    ]
  },
  {
    id: "hbo",
    nombre: "HBO Max",
    categoria: "streaming",
    icono: "🎭",
    descripcion: "Series originales, estrenos de cine y documentales",
    planes: [
      { tipo: "Mensual", precio: 4 },
      { tipo: "Trimestral", precio: 11 }
    ]
  },
  {
    id: "prime",
    nombre: "Amazon Prime Video",
    categoria: "streaming",
    icono: "📦",
    descripcion: "Series exclusivas, cine y eventos en vivo",
    planes: [
      { tipo: "Mensual", precio: 3.5 },
      { tipo: "Trimestral", precio: 9.5 }
    ]
  },
  {
    id: "paramount",
    nombre: "Paramount+",
    categoria: "streaming",
    icono: "⭐",
    descripcion: "Cine, series y deportes en exclusiva",
    planes: [
      { tipo: "Mensual", precio: 3.5 },
      { tipo: "Trimestral", precio: 9 }
    ]
  },
  // ---------- IPTV ----------
  {
    id: "iptv-full",
    nombre: "IPTV Full HD Mundial",
    categoria: "iptv",
    icono: "📡",
    descripcion: "+15,000 canales y VOD · Latino, USA, Europa",
    planes: [
      { tipo: "Mensual", precio: 8 },
      { tipo: "Trimestral", precio: 20 }
    ]
  },
  {
    id: "iptv-4k",
    nombre: "IPTV 4K Premium",
    categoria: "iptv",
    icono: "📺",
    descripcion: "Canales 4K, deportes PPV y series estreno",
    planes: [
      { tipo: "Mensual", precio: 10 },
      { tipo: "Trimestral", precio: 26 }
    ]
  },
  {
    id: "iptv-sports",
    nombre: "IPTV Deportes Total",
    categoria: "iptv",
    icono: "🥇",
    descripcion: "Todas las ligas + Mundial 2026 sin cortes",
    planes: [
      { tipo: "Mensual", precio: 9 },
      { tipo: "Trimestral", precio: 23 }
    ]
  },
  // ---------- APPS ----------
  {
    id: "spotify",
    nombre: "Spotify Premium",
    categoria: "apps",
    icono: "🎧",
    descripcion: "Música sin anuncios, descargas y audio offline",
    planes: [
      { tipo: "Mensual", precio: 3 },
      { tipo: "Trimestral", precio: 8 }
    ]
  },
  {
    id: "youtube",
    nombre: "YouTube Premium",
    categoria: "apps",
    icono: "▶️",
    descripcion: "Sin anuncios, YouTube Music incluido",
    planes: [
      { tipo: "Mensual", precio: 3.5 },
      { tipo: "Trimestral", precio: 9 }
    ]
  },
  {
    id: "canva",
    nombre: "Canva Pro",
    categoria: "apps",
    icono: "🎨",
    descripcion: "Plantillas premium, fondos removibles y más",
    planes: [
      { tipo: "Mensual", precio: 3 },
      { tipo: "Trimestral", precio: 7.5 }
    ]
  },
  {
    id: "office",
    nombre: "Microsoft 365",
    categoria: "apps",
    icono: "💼",
    descripcion: "Word, Excel, PowerPoint y 1TB en la nube",
    planes: [
      { tipo: "Mensual", precio: 4 },
      { tipo: "Trimestral", precio: 10 }
    ]
  },
  // ---------- DEPORTES ----------
  {
    id: "dazn",
    nombre: "DAZN Total",
    categoria: "deportes",
    icono: "🥊",
    descripcion: "Boxeo, fútbol internacional y combate",
    planes: [
      { tipo: "Mensual", precio: 6 },
      { tipo: "Trimestral", precio: 16 }
    ]
  },
  {
    id: "espn",
    nombre: "ESPN Premium",
    categoria: "deportes",
    icono: "🏈",
    descripcion: "Liga local, NFL, NBA y Mundial 2026",
    planes: [
      { tipo: "Mensual", precio: 5.5 },
      { tipo: "Trimestral", precio: 14.5 }
    ]
  },
  {
    id: "fubo",
    nombre: "FuboTV Sports",
    categoria: "deportes",
    icono: "⚽",
    descripcion: "Más de 100 canales deportivos en vivo",
    planes: [
      { tipo: "Mensual", precio: 7 },
      { tipo: "Trimestral", precio: 18 }
    ]
  }
];

// ---------------------------------------------------------------------------
// RESEÑAS (iniciales)
// ---------------------------------------------------------------------------
const RESENAS = [
  { nombre: "Carlos Mendoza", pais: "Ecuador 🇪🇨", estrellas: 5, comentario: "Excelente servicio, la IPTV nunca se corta ni en los partidos del Mundial. Recomendado 100%." },
  { nombre: "Valentina Rojas", pais: "Colombia 🇨🇴", estrellas: 5, comentario: "Pedí Netflix y Disney+ juntos, llegó todo en minutos por WhatsApp. Muy profesionales." },
  { nombre: "Diego Fernández", pais: "Argentina 🇦🇷", estrellas: 4, comentario: "Buena calidad de imagen en 4K, el soporte responde rápido. Le doy 4 estrellas por el precio en pesos." },
  { nombre: "María José Pérez", pais: "México 🇲🇽", estrellas: 5, comentario: "La mejor IPTV que he probado, tiene canales de deportes que no encontraba en otros lados." },
  { nombre: "Luis Castillo", pais: "Perú 🇵🇪", estrellas: 5, comentario: "Compré el combo deportes y vi todo el Mundial sin lag. Totalmente recomendado." },
  { nombre: "Camila Torres", pais: "Chile 🇨🇱", estrellas: 4, comentario: "Todo funcionó bien, solo tardó un poco la activación pero el soporte fue amable." },
  { nombre: "Andrés Salazar", pais: "Ecuador 🇪🇨", estrellas: 5, comentario: "Uso Spotify y HBO Max hace 6 meses, nunca he tenido problemas con la renovación." },
  { nombre: "Fernanda López", pais: "Venezuela 🇻🇪", estrellas: 5, comentario: "El cupón de descuento me ayudó muchísimo, excelente atención por WhatsApp." },
  { nombre: "Roberto Gómez", pais: "España 🇪🇸", estrellas: 4, comentario: "Calidad muy buena para ver fútbol europeo y el Mundial 2026, lo recomiendo." },
  { nombre: "Sofía Ramírez", pais: "Estados Unidos 🇺🇸", estrellas: 5, comentario: "Increíble servicio al cliente, resolvieron mi duda en minutos. Volveré a comprar." }
];

// ---------------------------------------------------------------------------
// MUNDIAL 2026 — Fase de grupos (horario Ecuador GMT-5, datos ilustrativos)
// ---------------------------------------------------------------------------
const MUNDIAL_2026 = [
  {
    grupo: "Grupo A",
    partidos: [
      { local: "México", visitante: "Polonia", fecha: "2026-06-11", hora: "15:00", sede: "Ciudad de México" },
      { local: "Argentina", visitante: "Arabia Saudita", fecha: "2026-06-12", hora: "10:00", sede: "Guadalajara" }
    ]
  },
  {
    grupo: "Grupo B",
    partidos: [
      { local: "Estados Unidos", visitante: "Gales", fecha: "2026-06-13", hora: "13:00", sede: "Los Ángeles" },
      { local: "Inglaterra", visitante: "Irán", fecha: "2026-06-13", hora: "16:00", sede: "Nueva York" }
    ]
  },
  {
    grupo: "Grupo C",
    partidos: [
      { local: "Brasil", visitante: "Serbia", fecha: "2026-06-14", hora: "11:00", sede: "Toronto" },
      { local: "Suiza", visitante: "Camerún", fecha: "2026-06-14", hora: "14:00", sede: "Vancouver" }
    ]
  },
  {
    grupo: "Grupo D",
    partidos: [
      { local: "Francia", visitante: "Australia", fecha: "2026-06-15", hora: "10:00", sede: "Houston" },
      { local: "Ecuador", visitante: "Países Bajos", fecha: "2026-06-15", hora: "13:00", sede: "Atlanta" }
    ]
  },
  {
    grupo: "Grupo E",
    partidos: [
      { local: "España", visitante: "Costa Rica", fecha: "2026-06-16", hora: "12:00", sede: "Miami" },
      { local: "Alemania", visitante: "Japón", fecha: "2026-06-16", hora: "15:00", sede: "Boston" }
    ]
  },
  {
    grupo: "Grupo F",
    partidos: [
      { local: "Bélgica", visitante: "Canadá", fecha: "2026-06-17", hora: "11:00", sede: "Seattle" },
      { local: "Croacia", visitante: "Marruecos", fecha: "2026-06-17", hora: "14:00", sede: "Kansas City" }
    ]
  }
];

// ---------------------------------------------------------------------------
// TASAS DE CAMBIO (base USD) — valores ilustrativos para conversión simulada
// ---------------------------------------------------------------------------
const TASAS_CAMBIO = {
  USD: { simbolo: "$", tasa: 1 },
  EUR: { simbolo: "€", tasa: 0.92 },
  MXN: { simbolo: "MX$", tasa: 18.5 },
  COP: { simbolo: "COL$", tasa: 4100 },
  PEN: { simbolo: "S/", tasa: 3.75 },
  ARS: { simbolo: "AR$", tasa: 950 },
  CLP: { simbolo: "CL$", tasa: 930 }
};

// ---------------------------------------------------------------------------
// CUPONES DE DESCUENTO
// ---------------------------------------------------------------------------
const CUPONES = {
  SAVE10: { porcentaje: 10, descripcion: "10% de descuento general" },
  WELCOME: { porcentaje: 15, descripcion: "15% de descuento de bienvenida" },
  IPTV50: { porcentaje: 20, descripcion: "20% de descuento exclusivo en IPTV" }
};

// ---------------------------------------------------------------------------
// CONFIGURACIÓN GENERAL
// ---------------------------------------------------------------------------
const CONFIG = {
  whatsappNumero: "593999999999", // Reemplazar con número real (formato sin +)
  telegramUsuario: "clicktvstreaming",
  radioStreamUrl: "https://stream.zeno.fm/f3wvbbqmdg8uv", // radio online embebida demo
  teleamazonasUrl: "https://www.teleamazonas.com/envivo/"
};
function getAllMatches() {
  let all = [];

  groups.forEach(g => {
    g.matches.forEach(m => {
      all.push({
        ...m,
        group: g.name
      });
    });
  });

  return all;
}