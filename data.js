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

  radioStreamUrl: "https://icecast.radiolared.com.ec/radiolared",
  laredStreamingUrl: "https://www.lared.com.ec/streaming/",
  teleamazonasUrl: "https://www.teleamazonas.com/teleamazonas-en-vivo/",
  teleamazonasSignatureUrl: "https://www.teleamazonas.com/mediastream/signature",
  teleamazonasPlayerId: "6945b9bca18f515cff51c75b",
  teleamazonasSignals: {
    quito: { label: "Quito", tokenKey: "tabQuito", queryKey: "live_quito", mediaId: "6a0cd90eb3852427fcded197" },
    guayaquil: { label: "Guayaquil", tokenKey: "tabGuayaquil", queryKey: "live_guayaquil", mediaId: "6a0dedcb6c7d568efdc8e0d9" },
    otros: { label: "Nacional", tokenKey: "tabOtros", queryKey: "live_otros", mediaId: "6a233703aa86429263ce17ec" }
  },
  exchangeRateApiUrl: "https://open.er-api.com/v6/latest/USD",
  ipGeoUrl: "https://ipapi.co/json/",

  ivaPorcentaje: 0.13,
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
  CLICKTVMUNDIAL: { porcentaje: 15, descripcion: "15% de descuento especial Mundial 2026 cuando aplica" }
};

const PRODUCTOS = [
  {
    id: "paramount-plus",
    nombre: "Paramount+",
    categoria: "streaming",
    icono: "🔵",
    descripcion: "Plataforma para ver películas, series, realities, contenido familiar y deportes seleccionados. Ideal para entretenimiento diario desde Smart TV, celular o navegador.",
    etiquetas: ["⚽ IDEAL PARA EL MUNDIAL", "🔥 MÁS VENDIDO"],
    planes: [{ tipo: "1 mes", precio: 5 }]
  },
  {
    id: "disney-premium",
    nombre: "Disney+ Premium",
    categoria: "streaming",
    icono: "🟣",
    descripcion: "Acceso premium para ver Disney, Marvel, Star Wars, Pixar, National Geographic y contenido familiar en alta calidad.",
    etiquetas: ["⭐ RECOMENDADO", "💎 PREMIUM"],
    planes: [{ tipo: "1 mes", precio: 9 }]
  },
  {
    id: "disney-estandar",
    nombre: "Disney Estándar sin ESPN",
    categoria: "streaming",
    icono: "🏰",
    descripcion: "Plan enfocado en películas, series y contenido familiar de Disney. No incluye ESPN, ideal si solo necesitas entretenimiento.",
    etiquetas: ["⭐ RECOMENDADO"],
    planes: [{ tipo: "1 mes", precio: 5 }]
  },
  {
    id: "dazn",
    nombre: "DAZN",
    categoria: "deportes",
    icono: "🔴",
    descripcion: "Servicio deportivo para ver eventos en vivo, fútbol internacional, boxeo y programación deportiva según disponibilidad de la plataforma.",
    etiquetas: ["⚽ IDEAL PARA EL MUNDIAL"],
    planes: [{ tipo: "1 mes", precio: 10, ivaIncluido: true }]
  },
  {
    id: "zapping-pro",
    nombre: "Zapping Pro",
    categoria: "deportes",
    icono: "📺",
    descripcion: "Liga Pro Ecuador / Liga Ecuabet en vivo, más de 40 canales nacionales e internacionales. Cuenta completa: 2 dispositivos simultáneos en diferente IP para Liga Pro o hasta 5 dispositivos dentro del mismo domicilio con la misma IP.",
    etiquetas: ["⚽ LIGA PRO ECUADOR", "🔥 ZAPPING PRO", "📺 +40 CANALES"],
    planes: [
      { tipo: "Cuenta individual · 1 dispositivo · 1 mes", precio: 10, ivaIncluido: true },
      { tipo: "Cuenta completa · hasta 5 dispositivos · 1 mes", precio: 20, ivaIncluido: true }
    ]
  },
  {
    id: "directv-go",
    nombre: "DIRECTV GO",
    categoria: "streaming",
    icono: "⚪",
    descripcion: "TV en vivo por internet con canales deportivos, entretenimiento, noticias y programación premium desde dispositivos compatibles.",
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
    descripcion: "Perfil compartido para ver series, películas, documentales y estrenos de Netflix con soporte durante el periodo contratado.",
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
    descripcion: "Perfil extra con mejor estabilidad de uso para ver Netflix en un entorno más ordenado y con menor riesgo de cruces de acceso.",
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
    descripcion: "Plataforma para ver series, películas, estrenos, documentales y contenido premium de entretenimiento.",
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
    descripcion: "Servicio para ver películas, series originales, estrenos y contenido exclusivo de Amazon Prime Video.",
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
    descripcion: "Contenido original de Apple, series exclusivas, películas y estrenos para ver en dispositivos compatibles.",
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
    descripcion: "Servicio especializado en anime, estrenos, temporadas completas, simulcast y contenido japonés para fanáticos del anime.",
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
    descripcion: "Contenido latino con películas, novelas, series, realities, deportes y entretenimiento en español.",
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
    descripcion: "Servicio IPTV básico para ver TV en vivo, películas, series y deportes desde apps compatibles en Android, TV Box o Smart TV.",
    etiquetas: ["⚽ IDEAL PARA EL MUNDIAL"],
    planes: [
      { tipo: "1 dispositivo", precio: 3, dispositivos: 1, ivaIncluido: true },
      { tipo: "2 dispositivos", precio: 5, dispositivos: 2, ivaIncluido: true },
      { tipo: "3 dispositivos", precio: 7, dispositivos: 3, ivaIncluido: true }
    ]
  },
  {
    id: "iptv-premium",
    nombre: "IPTV Premium",
    categoria: "iptv",
    icono: "📺",
    descripcion: "Paquete IPTV premium con canales en vivo, contenido VOD, películas, series y deportes para una experiencia más completa.",
    etiquetas: ["🔥 MÁS VENDIDO", "⚽ IDEAL PARA EL MUNDIAL"],
    planes: [
      { tipo: "1 dispositivo", precio: 5, dispositivos: 1, ivaIncluido: true },
      { tipo: "2 dispositivos", precio: 10, dispositivos: 2, ivaIncluido: true },
      { tipo: "3 dispositivos", precio: 15, dispositivos: 3, ivaIncluido: true }
    ]
  },
  {
    id: "iptv-ultra",
    nombre: "IPTV Ultra",
    categoria: "iptv",
    icono: "📺",
    descripcion: "Plan IPTV superior para usuarios que buscan más estabilidad, más contenido y mejor experiencia en deportes, películas y series.",
    etiquetas: ["💎 PREMIUM", "⚽ IDEAL PARA EL MUNDIAL"],
    planes: [
      { tipo: "1 dispositivo", precio: 7, dispositivos: 1, ivaIncluido: true },
      { tipo: "2 dispositivos", precio: 14, dispositivos: 2, ivaIncluido: true },
      { tipo: "3 dispositivos", precio: 21, dispositivos: 3, ivaIncluido: true }
    ]
  },
  {
    id: "ibo-player",
    nombre: "IBO Player",
    categoria: "iptv",
    icono: "📡",
    descripcion: "Licencia de reproductor IPTV compatible con Android, Android TV, LG WebOS, Samsung Tizen, Fire TV, iPhone, iPad, Windows y Mac.",
    etiquetas: ["💎 PREMIUM"],
    planes: [
      { tipo: "Licencia anual", precio: 10, ivaIncluido: true },
      { tipo: "Licencia permanente", precio: 20, ivaIncluido: true }
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
    descripcion: "Música sin anuncios, descargas, reproducción offline y mejor experiencia para escuchar playlists, álbumes y podcasts.",
    etiquetas: ["⭐ RECOMENDADO"],
    planes: [
      { tipo: "3 meses", precio: 5, ivaIncluido: true },
      { tipo: "6 meses", precio: 10, ivaIncluido: true },
      { tipo: "12 meses", precio: 15, ivaIncluido: true }
    ]
  },
  {
    id: "deezer",
    nombre: "Deezer",
    categoria: "musica",
    icono: "🎧",
    descripcion: "Servicio musical premium para escuchar canciones, playlists y contenido de audio con mejor experiencia en un dispositivo.",
    etiquetas: ["⭐ RECOMENDADO"],
    planes: [{ tipo: "1 dispositivo", precio: 5, ivaIncluido: true }]
  },
  {
    id: "canva-pro",
    nombre: "Canva Pro",
    categoria: "apps",
    icono: "🎨",
    descripcion: "Herramienta de diseño para crear flyers, logos, publicaciones, presentaciones y contenido visual con plantillas premium y funciones Pro.",
    etiquetas: ["💎 PREMIUM"],
    planes: [{ tipo: "Consultar disponibilidad", precio: 0, consultar: true }]
  },
  {
    id: "duolingo",
    nombre: "Duolingo",
    categoria: "apps",
    icono: "🎓",
    descripcion: "Plan premium para aprender idiomas con ejercicios, práctica diaria, avance guiado y funciones adicionales según disponibilidad del servicio.",
    etiquetas: ["⭐ RECOMENDADO"],
    planes: [{ tipo: "Consultar disponibilidad", precio: 0, consultar: true }]
  },
  {
    id: "chatgpt",
    nombre: "ChatGPT",
    categoria: "apps",
    icono: "🤖",
    descripcion: "Herramienta de inteligencia artificial para estudiar, redactar, resolver dudas, crear contenido y mejorar productividad. Consulta disponibilidad de planes.",
    etiquetas: ["💎 PREMIUM"],
    planes: [{ tipo: "Consultar disponibilidad", precio: 0, consultar: true }]
  },
  {
    id: "deportes-pack",
    nombre: "Pack Deportes",
    categoria: "deportes",
    icono: "⚽",
    descripcion: "DAZN, Disney+ ESPN, Paramount+, NBA, UFC, ECDF y Zapping Pro. Consulta disponibilidad de paquetes combinados.",
    etiquetas: ["⚽ IDEAL PARA EL MUNDIAL", "🔥 MÁS VENDIDO"],
    planes: [{ tipo: "Consultar disponibilidad", precio: 0, consultar: true }]
  },
  {
    id: "aumento-gigas-proneet",
    nombre: "Aumento de gigas PRONEET VPN",
    categoria: "proneet",
    icono: "📶",
    descripcion: "Aumento de megas para Android en Ecuador. Disponible para Claro, Movistar y Tuenti. No disponible para CNT.",
    etiquetas: ["🚀 AUMENTO DE MEGAS", "✅ ACEPTA CUPÓN", "⚡ ACTIVACIÓN RÁPIDA"],
    planes: [
      { tipo: "PRONEET VPN Claro · aumento de megas", precio: 5, ivaIncluido: true },
      { tipo: "PRONEET VPN Movistar · aumento de megas", precio: 5, ivaIncluido: true },
      { tipo: "PRONEET VPN Tuenti · aumento de megas", precio: 5, ivaIncluido: true }
    ]
  },
  {
    id: "claro-paquetes-megas",
    nombre: "Claro Paquetes Megas",
    categoria: "recargas",
    icono: "🔴",
    descripcion: "Paquetes de megas Claro Ecuador según tabla enviada. Valores finales para activación por paquete.",
    etiquetas: ["🔴 CLARO", "📶 PAQUETES MEGAS", "🚫 SIN CUPÓN"],
    planes: [
      { tipo: "1 GB · vigencia 1 día", precio: 1.05, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Redes ilimitadas · vigencia 1 día", precio: 1.50, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "2 GB · vigencia 2 días", precio: 2.05, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "5 GB · vigencia 3 días", precio: 2.50, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "7 GB · vigencia 3 días", precio: 3.10, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "9 GB · vigencia 7 días", precio: 3.50, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "10 GB · vigencia 10 días", precio: 4.00, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "8 GB · vigencia 15 días", precio: 5.15, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "10 GB · vigencia 15 días", precio: 5.50, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "12 GB · vigencia 25 días", precio: 8.00, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "16 GB · vigencia 30 días", precio: 10.50, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "19 GB · vigencia 30 días", precio: 12.50, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "22 GB · vigencia 30 días", precio: 15.50, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "27 GB · vigencia 30 días", precio: 20.50, ivaIncluido: true, bloquearDescuento: true }
    ]
  },
  {
    id: "movistar-combos",
    nombre: "Movistar Combos Prepago",
    categoria: "recargas",
    icono: "🔵",
    descripcion: "Combos Movistar Ecuador con precios finales publicados por operador. No aplican cupón de descuento.",
    etiquetas: ["🔵 MOVISTAR", "📲 COMBOS", "🚫 SIN CUPÓN"],
    planes: [
      { tipo: "1 GB · vigencia 1 día", precio: 1.05, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "5 GB · vigencia 7 días", precio: 3.00, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "6 GB · vigencia 15 días", precio: 5.00, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "8 GB · vigencia 20 días", precio: 7.00, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "8 GB · vigencia 30 días", precio: 8.00, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "10 GB · vigencia 30 días", precio: 9.00, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "14 GB · vigencia 30 días", precio: 10.25, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "19 GB · vigencia 30 días", precio: 15.50, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Recarga normal Movistar · monto a confirmar", precio: 0, consultar: true }
    ]
  },
  {
    id: "tuenti-recargas-combos",
    nombre: "Tuenti Recargas y Combos",
    categoria: "recargas",
    icono: "🩵",
    descripcion: "Recargas y combos Tuenti Ecuador. Los precios finales de combos no aceptan cupón.",
    etiquetas: ["🩵 TUENTI", "💸 RECARGAS", "🚫 SIN CUPÓN"],
    planes: [
      { tipo: "Recarga normal Tuenti $1", precio: 1.00, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Recarga normal Tuenti $4", precio: 4.00, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Recarga normal Tuenti $8", precio: 8.00, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Combo 1/2 GB · vigencia 15 días", precio: 1.00, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Combo 3 GB · vigencia 15 días", precio: 4.00, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Combo 5 GB · vigencia 30 días", precio: 7.00, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Combo 8 GB + 2 GB TikTok/Instagram · vigencia 30 días", precio: 8.00, ivaIncluido: true, bloquearDescuento: true }
    ]
  },
  {
    id: "cnt-paquetes-prepago",
    nombre: "CNT Paquetes Prepago",
    categoria: "recargas",
    icono: "🟣",
    descripcion: "Paquetes CNT Ecuador con precios finales. No aplican cupón de descuento.",
    etiquetas: ["🟣 CNT", "📲 PAQUETES", "🚫 SIN CUPÓN"],
    planes: [
      { tipo: "Paquete Plus · vigencia 1 día", precio: 1.00, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Paquete Plus · vigencia 3 días", precio: 2.00, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Paquete Plus · vigencia 7 días", precio: 3.00, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Paquete Plus · vigencia 30 días", precio: 5.00, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Paquete Plus · vigencia 30 días", precio: 6.00, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Paquete Plus · vigencia 30 días", precio: 10.00, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Paquete Plus · vigencia 30 días", precio: 15.00, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Paquete Plus · vigencia 30 días", precio: 20.00, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Apps prepago · 1 GB para app · vigencia 1 día", precio: 1.00, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Herramientas colaboración · 5 GB", precio: 5.00, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Recarga normal CNT · monto a confirmar", precio: 0, consultar: true }
    ]
  },
  {
    id: "recargas-ilimitadas-operador",
    nombre: "Recargas ilimitadas por operador",
    categoria: "recargas",
    icono: "♾️",
    descripcion: "Gestión de recarga ilimitada o combo ilimitado por operador. Precio final sin IVA adicional y sin cupón.",
    etiquetas: ["♾️ ILIMITADAS", "✅ PRECIO FINAL", "🚫 SIN CUPÓN"],
    planes: [
      { tipo: "Recarga ilimitada Claro · 1 mes", precio: 4.00, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Recarga ilimitada Movistar · 1 mes", precio: 4.00, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Recarga ilimitada Tuenti · 1 mes", precio: 4.00, ivaIncluido: true, bloquearDescuento: true },
      { tipo: "Recarga ilimitada CNT · 1 mes", precio: 4.00, ivaIncluido: true, bloquearDescuento: true }
    ]
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
  "🟢 Cliente de Perú solicitó IBO Player",
  "🟢 Cliente de Quito activó PRONEET VPN",
  "🟢 Cliente de Guayaquil solicitó recarga móvil",
  "🟢 Cliente de Cuenca activó paquete Claro Megas",
  "🟢 Cliente de Ambato compró combo Movistar",
  "🟢 Cliente de Manta compró combo Tuenti"
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
        etapa: "Dieciseisavos de final",
        marcador: "2 - 1"
      },
      {
        grupo: "Lunes 29 de junio",
        local: "Alemania",
        visitante: "Paraguay",
        fechaUTC: "2026-06-29T20:30:00Z",
        sede: "Gillette Stadium / Boston Stadium",
        etapa: "Dieciseisavos de final",
        marcador: "1 - 1",
        score: {
          duration: "PENALTY_SHOOTOUT",
          penalties: { home: 3, away: 4 }
        }
      },
      {
        grupo: "Lunes 29 de junio",
        local: "Países Bajos",
        visitante: "Marruecos",
        fechaUTC: "2026-06-30T01:00:00Z",
        sede: "Estadio BBVA Bancomer / Monterrey Stadium",
        etapa: "Dieciseisavos de final",
        marcador: "1 - 1"
      },
      {
        grupo: "Martes 30 de junio",
        local: "Costa de Marfil",
        visitante: "Noruega",
        fechaUTC: "2026-06-30T17:00:00Z",
        sede: "New York New Jersey Stadium",
        etapa: "Dieciseisavos de final",
        marcador: "1 - 2"
      },
      {
        grupo: "Martes 30 de junio",
        local: "Francia",
        visitante: "Suecia",
        fechaUTC: "2026-06-30T21:00:00Z",
        sede: "Dallas Stadium",
        etapa: "Dieciseisavos de final",
        marcador: "3 - 0"
      },
      {
        grupo: "Martes 30 de junio",
        local: "México",
        visitante: "Ecuador",
        fechaUTC: "2026-07-01T01:00:00Z",
        sede: "Mexico City Stadium",
        etapa: "Dieciseisavos de final",
        marcador: "2 - 0"
      },
      {
        grupo: "Miércoles 1 de julio",
        local: "Inglaterra",
        visitante: "RD Congo",
        fechaUTC: "2026-07-01T16:00:00Z",
        sede: "Atlanta Stadium",
        etapa: "Dieciseisavos de final",
        marcador: "2 - 1"
      },
      {
        grupo: "Miércoles 1 de julio",
        local: "Bélgica",
        visitante: "Senegal",
        fechaUTC: "2026-07-01T20:00:00Z",
        sede: "Seattle Stadium",
        etapa: "Dieciseisavos de final"
      },
      {
        grupo: "Miércoles 1 de julio",
        local: "Estados Unidos",
        visitante: "Bosnia y Herzegovina",
        fechaUTC: "2026-07-02T00:00:00Z",
        sede: "San Francisco Bay Area Stadium",
        etapa: "Dieciseisavos de final"
      }
    ]
  }
];
