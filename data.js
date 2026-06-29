/* ========================================================================== 
   CLICK TV STREAMING MUNDIAL 2026 — data.js
   Datos globales: configuración, catálogo, reseñas, actividad, mundial y tasas
   ========================================================================== */

const CONFIG = {
  whatsappNumero: "593939166222",
  whatsappLocal: "0939166222",
  whatsappLink: "https://wa.me/593939166222",
  whatsappGrupo: "https://chat.whatsapp.com/CNWqZ0AhHhKDb1VKp1LqNu?s=sw&p=a&mlu=1",

  telegramUsuario: "streamid",
  telegramLink: "https://t.me/streamid",
  telegramReferenciaWeb: "https://web.telegram.org/k/#@streamid",

  catalogoUrl: "https://click-tv-mundial.vercel.app/#streaming",

  correoEmpresa: "clicktvdigital@gmail.com",
  correoValidacion: "clicktvprivado@gmail.com",

  bancoPichincha: "2205375908",
  bancoGuayaquil: "0013647475",

  deunaUrl: "https://pagar.deuna.app/H92p/U2FsdGVkX1+d5ztHtEqOvWZoCPyapr0gLHqVfd5bPEnxFHTZK9YHPAshlvR6BD3wG3A1HJIxJsdqS/ac5gip07gMGakILWEtHrLHQwCiL6Z/SAeuNxx4UZlxsyvCLBJjtcSCj7/jZoDAyB7FNrWMdr7WIw0EUeiv1Cdbs0Xtw4VfcP9tlvf4dRXGPzF65Wjr+YC1aZpkCI5gHp6qXtIAfA==",
  payphoneUrl: "https://ppls.me/izAAuu8fptGHF6uZBV9L4Q",
  paypalUrl: "https://paypal.me/richardontaneda",
  paypalClientIdLive: "ASzNgRtmM63xQ0hRG9Lx47JyJKmva9nu4ij8ZsbAJRrAD1b1b0okUxnBtneq2xUmK6q9JuIHlXFR2T_-",

  footballDataApiUrl: "https://api.football-data.org/v4/competitions/WC/matches",
  footballDataApiToken: "467c885c07fa49baa40ac78cf636f8b0",
  fifaCalendarioUrl: "https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures",

  radioStreamUrl: "",
  laredStreamingUrl: "https://www.lared.com.ec/streaming/",
  teleamazonasUrl: "https://www.teleamazonas.com/teleamazonas-en-vivo/",
  exchangeRateApiUrl: "https://open.er-api.com/v6/latest/USD",
  ipGeoUrl: "https://ipapi.co/json/",

  ivaPorcentaje: 0.15,
  paypalComisionPorcentaje: 0.054,
  paypalComisionFija: 0.30
};

const TASAS_CAMBIO = {
  USD: { nombre: "Dólar", simbolo: "$", tasa: 1, paises: ["Ecuador", "Estados Unidos", "Panamá", "El Salvador"] },
  PEN: { nombre: "Sol peruano", simbolo: "S/", tasa: 3.75, paises: ["Perú"] },
  COP: { nombre: "Peso colombiano", simbolo: "COL$", tasa: 4100, paises: ["Colombia"] },
  ARS: { nombre: "Peso argentino", simbolo: "AR$", tasa: 950, paises: ["Argentina"] },
  MXN: { nombre: "Peso mexicano", simbolo: "MX$", tasa: 18.5, paises: ["México"] },
  CLP: { nombre: "Peso chileno", simbolo: "CL$", tasa: 930, paises: ["Chile"] },
  EUR: { nombre: "Euro", simbolo: "€", tasa: 0.92, paises: ["España", "Francia", "Alemania", "Italia", "Portugal", "Países Bajos", "Bélgica"] },
  BRL: { nombre: "Real brasileño", simbolo: "R$", tasa: 5.4, paises: ["Brasil"] },
  BOB: { nombre: "Boliviano", simbolo: "Bs", tasa: 6.9, paises: ["Bolivia"] },
  VES: { nombre: "Bolívar", simbolo: "Bs", tasa: 36, paises: ["Venezuela"] },
  UYU: { nombre: "Peso uruguayo", simbolo: "$U", tasa: 40, paises: ["Uruguay"] },
  PYG: { nombre: "Guaraní", simbolo: "₲", tasa: 7500, paises: ["Paraguay"] },
  DOP: { nombre: "Peso dominicano", simbolo: "RD$", tasa: 59, paises: ["República Dominicana"] },
  CRC: { nombre: "Colón costarricense", simbolo: "₡", tasa: 520, paises: ["Costa Rica"] },
  GTQ: { nombre: "Quetzal", simbolo: "Q", tasa: 7.8, paises: ["Guatemala"] },
  HNL: { nombre: "Lempira", simbolo: "L", tasa: 24.8, paises: ["Honduras"] },
  NIO: { nombre: "Córdoba", simbolo: "C$", tasa: 36.8, paises: ["Nicaragua"] }
};

const MONEDA_POR_PAIS = {
  EC: "USD",
  US: "USD",
  PA: "USD",
  SV: "USD",
  PE: "PEN",
  CO: "COP",
  AR: "ARS",
  MX: "MXN",
  CL: "CLP",
  ES: "EUR",
  FR: "EUR",
  DE: "EUR",
  IT: "EUR",
  PT: "EUR",
  NL: "EUR",
  BE: "EUR",
  BR: "BRL",
  BO: "BOB",
  VE: "VES",
  UY: "UYU",
  PY: "PYG",
  DO: "DOP",
  CR: "CRC",
  GT: "GTQ",
  HN: "HNL",
  NI: "NIO"
};

const CUPONES = {
  SAVE10: { porcentaje: 10, descripcion: "10% de descuento general" },
  WELCOME: { porcentaje: 15, descripcion: "15% de descuento de bienvenida" },
  IPTV50: { porcentaje: 20, descripcion: "20% exclusivo en IPTV" },
  CLICKTVMUNDIAL: { porcentaje: 5, descripcion: "5% de descuento especial Mundial 2026" }
};

const PRODUCTOS = [
  {
    id: "paramount-plus",
    nombre: "Paramount+",
    categoria: "streaming",
    icono: "🔵",
    descripcion: "Streaming premium con películas, series y deportes seleccionados.",
    etiquetas: ["⚽ IDEAL PARA EL MUNDIAL", "🔥 MÁS VENDIDO"],
    planes: [{ tipo: "1 mes", precio: 5 }]
  },
  {
    id: "disney-premium",
    nombre: "Disney+ Premium",
    categoria: "streaming",
    icono: "🟣",
    descripcion: "Disney+, Marvel, Star Wars, Pixar, National Geographic y contenido premium.",
    etiquetas: ["⭐ RECOMENDADO", "💎 PREMIUM"],
    planes: [{ tipo: "1 mes", precio: 9 }]
  },
  {
    id: "disney-estandar",
    nombre: "Disney Estándar sin ESPN",
    categoria: "streaming",
    icono: "🏰",
    descripcion: "Disney Estándar sin ESPN, ideal para películas y series familiares.",
    etiquetas: ["⭐ RECOMENDADO"],
    planes: [{ tipo: "1 mes", precio: 5 }]
  },
  {
    id: "dazn",
    nombre: "DAZN",
    categoria: "deportes",
    icono: "🔴",
    descripcion: "Deportes, boxeo, fútbol internacional y eventos en vivo.",
    etiquetas: ["⚽ IDEAL PARA EL MUNDIAL"],
    planes: [{ tipo: "1 mes", precio: 10 }]
  },
  {
    id: "directv-go",
    nombre: "DIRECTV GO",
    categoria: "streaming",
    icono: "⚪",
    descripcion: "TV en vivo, deportes, entretenimiento y canales premium.",
    etiquetas: ["💎 PREMIUM"],
    planes: [
      { tipo: "1 dispositivo", precio: 15 },
      { tipo: "Cuenta completa", precio: 25 }
    ]
  },
  {
    id: "netflix-compartido",
    nombre: "Netflix Compartido",
    categoria: "streaming",
    icono: "🔴",
    descripcion: "Netflix compartido con acceso estable y soporte durante el servicio.",
    etiquetas: ["🔥 MÁS VENDIDO"],
    planes: [
      { tipo: "1 mes", precio: 4 },
      { tipo: "3 meses", precio: 12 },
      { tipo: "6 meses", precio: 24 },
      { tipo: "12 meses", precio: 48 }
    ]
  },
  {
    id: "netflix-extra",
    nombre: "Netflix Perfil Extra",
    categoria: "streaming",
    icono: "🟡",
    descripcion: "Perfil extra de Netflix con mayor estabilidad de uso.",
    etiquetas: ["⭐ RECOMENDADO", "💎 PREMIUM"],
    planes: [
      { tipo: "1 mes", precio: 6 },
      { tipo: "3 meses", precio: 18 },
      { tipo: "6 meses", precio: 36 },
      { tipo: "12 meses", precio: 72 }
    ]
  },
  {
    id: "max",
    nombre: "Max",
    categoria: "streaming",
    icono: "🟣",
    descripcion: "Series, películas, estrenos y entretenimiento premium.",
    etiquetas: ["⭐ RECOMENDADO"],
    planes: [
      { tipo: "1 mes", precio: 3 },
      { tipo: "3 meses", precio: 8 },
      { tipo: "6 meses", precio: 15 },
      { tipo: "12 meses", precio: 25 }
    ]
  },
  {
    id: "prime-video",
    nombre: "Prime Video",
    categoria: "streaming",
    icono: "🔵",
    descripcion: "Películas, series originales y contenido exclusivo.",
    etiquetas: ["🔥 MÁS VENDIDO"],
    planes: [
      { tipo: "1 mes", precio: 3 },
      { tipo: "3 meses", precio: 8 },
      { tipo: "6 meses", precio: 15 },
      { tipo: "12 meses", precio: 25 }
    ]
  },
  {
    id: "apple-tv",
    nombre: "Apple TV",
    categoria: "streaming",
    icono: "⚪",
    descripcion: "Contenido original, series, películas y estrenos Apple.",
    etiquetas: ["💎 PREMIUM"],
    planes: [
      { tipo: "1 dispositivo", precio: 3 },
      { tipo: "Cuenta completa", precio: 5 }
    ]
  },
  {
    id: "crunchyroll",
    nombre: "Crunchyroll",
    categoria: "streaming",
    icono: "🟠",
    descripcion: "Anime, estrenos, temporadas completas y contenido japonés.",
    etiquetas: ["⭐ RECOMENDADO"],
    planes: [
      { tipo: "1 mes", precio: 3 },
      { tipo: "3 meses", precio: 8 },
      { tipo: "6 meses", precio: 15 },
      { tipo: "12 meses", precio: 25 }
    ]
  },
  {
    id: "vix-premium",
    nombre: "VIX Premium",
    categoria: "streaming",
    icono: "⚫",
    descripcion: "Películas, novelas, series, deportes y contenido latino.",
    etiquetas: ["🔥 MÁS VENDIDO"],
    planes: [
      { tipo: "1 mes", precio: 3 },
      { tipo: "3 meses", precio: 8 },
      { tipo: "6 meses", precio: 15 },
      { tipo: "12 meses", precio: 25 }
    ]
  },
  {
    id: "iptv-basico",
    nombre: "IPTV Básico",
    categoria: "iptv",
    icono: "📺",
    descripcion: "TV en vivo, películas, series y deportes en paquete básico.",
    etiquetas: ["⚽ IDEAL PARA EL MUNDIAL"],
    planes: [
      { tipo: "1 dispositivo", precio: 3, dispositivos: 1 },
      { tipo: "2 dispositivos", precio: 5, dispositivos: 2 },
      { tipo: "3 dispositivos", precio: 7, dispositivos: 3 }
    ]
  },
  {
    id: "iptv-premium",
    nombre: "IPTV Premium",
    categoria: "iptv",
    icono: "📺",
    descripcion: "Paquete premium con TV en vivo, VOD, películas, series y deportes.",
    etiquetas: ["🔥 MÁS VENDIDO", "⚽ IDEAL PARA EL MUNDIAL"],
    planes: [
      { tipo: "1 dispositivo", precio: 5, dispositivos: 1 },
      { tipo: "2 dispositivos", precio: 10, dispositivos: 2 },
      { tipo: "3 dispositivos", precio: 15, dispositivos: 3 }
    ]
  },
  {
    id: "iptv-ultra",
    nombre: "IPTV Ultra",
    categoria: "iptv",
    icono: "📺",
    descripcion: "Experiencia superior para ver Mundial 2026, deportes, series y películas.",
    etiquetas: ["💎 PREMIUM", "⚽ IDEAL PARA EL MUNDIAL"],
    planes: [
      { tipo: "1 dispositivo", precio: 7, dispositivos: 1 },
      { tipo: "2 dispositivos", precio: 14, dispositivos: 2 },
      { tipo: "3 dispositivos", precio: 21, dispositivos: 3 }
    ]
  },
  {
    id: "ibo-player",
    nombre: "IBO Player",
    categoria: "iptv",
    icono: "📡",
    descripcion: "Licencia compatible con Android, Android TV, LG WebOS, Samsung Tizen, Fire TV, iPhone, iPad, Windows y Mac.",
    etiquetas: ["💎 PREMIUM"],
    planes: [
      { tipo: "Licencia anual", precio: 10 },
      { tipo: "Licencia permanente", precio: 20 }
    ]
  },
  {
    id: "plataformas-iptv",
    nombre: "Plataformas IPTV",
    categoria: "iptv",
    icono: "📺",
    descripcion: "MegaX TV, Flujo TV, Oleada TV, MA TV Digital, Stella TV y Telelatino. Incluyen Mundial 2026, TV en vivo, películas, series y deportes.",
    etiquetas: ["⚽ IDEAL PARA EL MUNDIAL"],
    planes: [{ tipo: "Consultar disponibilidad", precio: 0, consultar: true }]
  },
  {
    id: "spotify-premium",
    nombre: "Spotify Premium",
    categoria: "musica",
    icono: "🎵",
    descripcion: "Música sin anuncios, descargas y reproducción offline.",
    etiquetas: ["⭐ RECOMENDADO"],
    planes: [
      { tipo: "3 meses", precio: 5 },
      { tipo: "6 meses", precio: 10 },
      { tipo: "12 meses", precio: 15 }
    ]
  },
  {
    id: "deezer",
    nombre: "Deezer",
    categoria: "musica",
    icono: "🎧",
    descripcion: "Música premium en un dispositivo.",
    etiquetas: ["⭐ RECOMENDADO"],
    planes: [{ tipo: "1 dispositivo", precio: 5 }]
  },
  {
    id: "canva-pro",
    nombre: "Canva Pro",
    categoria: "apps",
    icono: "🎨",
    descripcion: "Plantillas premium, fondos removibles y herramientas Pro.",
    etiquetas: ["💎 PREMIUM"],
    planes: [{ tipo: "Consultar disponibilidad", precio: 0, consultar: true }]
  },
  {
    id: "duolingo",
    nombre: "Duolingo",
    categoria: "apps",
    icono: "🎓",
    descripcion: "Plan premium para aprendizaje de idiomas.",
    etiquetas: ["⭐ RECOMENDADO"],
    planes: [{ tipo: "Consultar disponibilidad", precio: 0, consultar: true }]
  },
  {
    id: "chatgpt",
    nombre: "ChatGPT",
    categoria: "apps",
    icono: "🤖",
    descripcion: "Consulta disponibilidad de planes digitales.",
    etiquetas: ["💎 PREMIUM"],
    planes: [{ tipo: "Consultar disponibilidad", precio: 0, consultar: true }]
  },
  {
    id: "deportes-pack",
    nombre: "Pack Deportes",
    categoria: "deportes",
    icono: "⚽",
    descripcion: "DAZN, Disney+ ESPN, Paramount+, NBA, UFC, ECDF y Zapping Pro. Consulta disponibilidad.",
    etiquetas: ["⚽ IDEAL PARA EL MUNDIAL", "🔥 MÁS VENDIDO"],
    planes: [{ tipo: "Consultar disponibilidad", precio: 0, consultar: true }]
  }
];

const RESENAS = [
  { nombre: "Cliente Verificado", pais: "Quito - Ecuador", estrellas: 5, comentario: "Activación rápida y soporte claro por WhatsApp." },
  { nombre: "Cliente Verificado", pais: "Lima - Perú", estrellas: 5, comentario: "Compré Disney+ y me ayudaron en todo el proceso." },
  { nombre: "Cliente Verificado", pais: "Bogotá - Colombia", estrellas: 5, comentario: "Paramount+ funcionando perfecto, recomendado." },
  { nombre: "Cliente Verificado", pais: "Guayaquil - Ecuador", estrellas: 5, comentario: "IPTV Ultra estable para ver deportes y películas." },
  { nombre: "Cliente Verificado", pais: "Santiago - Chile", estrellas: 5, comentario: "Atención rápida y buen servicio." }
];

const ACTIVIDAD_RECIENTE = [
  "🟢 Cliente de Quito - Ecuador activó IPTV Premium",
  "🟢 Cliente de Lima - Perú adquirió Disney+",
  "🟢 Cliente de Bogotá - Colombia adquirió Paramount+",
  "🟢 Cliente de Guayaquil - Ecuador activó IPTV Ultra",
  "🟢 Cliente de Santiago - Chile adquirió DAZN",
  "🟢 Cliente de México activó Netflix Perfil Extra",
  "🟢 Cliente de Perú solicitó IBO Player"
];

// Respaldo local del fixture oficial si la API no devuelve datos del Mundial.
const MUNDIAL_2026 = [
  {
    grupo: "Dieciseisavos de final",
    partidos: [
      {
        grupo: "Lunes 29 de junio",
        local: "Brasil",
        visitante: "Japón",
        fechaUTC: "2026-06-29T17:00:00Z",
        sede: "NRG Stadium / Houston Stadium",
        etapa: "Dieciseisavos de final"
      },
      {
        grupo: "Lunes 29 de junio",
        local: "Alemania",
        visitante: "Paraguay",
        fechaUTC: "2026-06-29T20:30:00Z",
        sede: "Gillette Stadium / Boston Stadium",
        etapa: "Dieciseisavos de final"
      },
      {
        grupo: "Lunes 29 de junio",
        local: "Países Bajos",
        visitante: "Marruecos",
        fechaUTC: "2026-06-30T01:00:00Z",
        sede: "Estadio BBVA Bancomer / Monterrey Stadium",
        etapa: "Dieciseisavos de final"
      },
      {
        grupo: "Martes 30 de junio",
        local: "Costa de Marfil",
        visitante: "Noruega",
        fechaUTC: "2026-06-30T17:00:00Z",
        sede: "New York New Jersey Stadium",
        etapa: "Dieciseisavos de final"
      },
      {
        grupo: "Martes 30 de junio",
        local: "Francia",
        visitante: "Suecia",
        fechaUTC: "2026-06-30T21:00:00Z",
        sede: "Dallas Stadium",
        etapa: "Dieciseisavos de final"
      },
      {
        grupo: "Martes 30 de junio",
        local: "México",
        visitante: "Ecuador",
        fechaUTC: "2026-07-01T01:00:00Z",
        sede: "Mexico City Stadium",
        etapa: "Dieciseisavos de final"
      }
    ]
  }
];
