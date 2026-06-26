/* ==========================================================================
   CONFIGURACIÓN GLOBAL OBLIGATORIA
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
    
    // SDK Credential
    paypalClientIdLive: "ASzNgRtmM63xQ0hRG9Lx47JyJKmva9nu4ij8ZsbAJRrAD1b1b0okUxnBtneq2xUmK6q9JuIHlXFR2T_-",
    
    // API Football
    footballDataApiUrl: "https://api.football-data.org/v4/matches",
    footballDataApiToken: "467c885c07fa49baa40ac78cf636f8b0",
    fifaCalendarioUrl: "https://www.fifa.com/es/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures",
    
    // Media
    radioStreamUrl: "https://stream.zeno.fm/f3wvbbqmdg8uv",
    teleamazonasUrl: "https://www.teleamazonas.com/envivo/",
    
    // Finanzas
    ivaPorcentaje: 0.15,
    paypalComisionPorcentaje: 0.054,
    paypalComisionFija: 0.30
};

const PRODUCTOS = [
    { id: 'paramount', nombre: 'Paramount+', categoria: 'streaming', icono: '🎬', planes: [{ tipo: '1 Mes', precio: 5 }], etiqueta: '⚽ IDEAL' },
    { id: 'disney-prem', nombre: 'Disney+ Premium', categoria: 'streaming', icono: '🟣', planes: [{ tipo: '1 Mes', precio: 9 }], etiqueta: '⭐ RECOMENDADO' },
    { id: 'disney-std', nombre: 'Disney Estándar', categoria: 'streaming', icono: '🔵', planes: [{ tipo: '1 Mes', precio: 5 }], etiqueta: 'S/ ESPN' },
    { id: 'netflix-comp', nombre: 'Netflix Compartido', categoria: 'streaming', icono: '🔴', planes: [
        { tipo: '1 Mes', precio: 4 }, { tipo: '3 Meses', precio: 12 }, { tipo: '6 Meses', precio: 24 }, { tipo: '12 Meses', precio: 48 }
    ], etiqueta: '🔥 MÁS VENDIDO' },
    { id: 'netflix-extra', nombre: 'Netflix Perfil Extra', categoria: 'streaming', icono: '🟡', planes: [
        { tipo: '1 Mes', precio: 6 }, { tipo: '3 Meses', precio: 18 }, { tipo: '6 Meses', precio: 36 }, { tipo: '12 Meses', precio: 72 }
    ], etiqueta: '💎 PREMIUM' },
    { id: 'iptv-prem', nombre: 'IPTV Premium', categoria: 'iptv', icono: '📺', planes: [
        { tipo: '1 Disp', precio: 5 }, { tipo: '2 Disp', precio: 10 }, { tipo: '3 Disp', precio: 15 }
    ], etiqueta: '⭐ RECOMENDADO' },
    { id: 'iptv-ultra', nombre: 'IPTV Ultra', categoria: 'iptv', icono: '🚀', planes: [
        { tipo: '1 Disp', precio: 7 }, { tipo: '2 Disp', precio: 14 }, { tipo: '3 Disp', precio: 21 }
    ], etiqueta: '🔥 MÁS VENDIDO' },
    { id: 'spotify', nombre: 'Spotify Premium', categoria: 'musica', icono: '🎵', planes: [
        { tipo: '3 Meses', precio: 5 }, { tipo: '6 Meses', precio: 10 }, { tipo: '12 Meses', precio: 15 }
    ] },
    { id: 'canva', nombre: 'Canva Pro', categoria: 'apps', icono: '🎓', planes: [{ tipo: 'Consultar', precio: 0 }], etiqueta: 'Bajo Pedido' }
];

const CUPONES = {
    "CLICKTVMUNDIAL": { porcentaje: 5, descripcion: "5% de descuento especial Mundial 2026" }
};