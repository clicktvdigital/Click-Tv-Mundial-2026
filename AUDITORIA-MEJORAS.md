# Click TV Streaming — Auditoría y mejoras Premium V12

## Problemas detectados en los archivos originales

- `index.html` cargaba `mundial-v1-mejoras.css`, pero ese archivo no fue entregado: generaba una solicitud 404.
- La imagen Open Graph declaraba 1200 × 630 y MIME PNG, pero el archivo era JPEG de 1536 × 811 con extensión `.png`.
- Los archivos de los logos de radio estaban nombrados al revés: `la-red.png` contenía Mach Deportes y `mach-deportes.png` contenía La Red.
- El logo principal tenía un lienzo negro grande, por lo que visualmente quedaba reducido dentro de un cuadro.
- El reproductor de radio dependía del elemento `<audio>` y no tenía control propio de play/pausa, volumen, logo activo, reintento manual ni estados detallados.
- El ecualizador se animaba incluso cuando la radio estaba pausada.
- El enlace antiguo del grupo de WhatsApp aparecía en `index.html` y `data.js`.
- El catálogo solo ofrecía comprar o añadir; no incluía renovación para cada plan.
- El carrito no distinguía entre compra nueva y renovación.
- No existía implementación real para las clases `reveal` ni animaciones con Intersection Observer.
- `inicializarBotonesFlotantes()` se ejecutaba dos veces durante el arranque.
- El SDK de PayPal se cargaba siempre, aunque el usuario no seleccionara PayPal.

## Implementado

- Logo horizontal recortado, transparente y optimizado.
- Radio premium personalizada para La Red y Mach Deportes, con logos correctos, play/pausa, volumen, estados, reconexión progresiva, Media Session y ecualizador ligado a la reproducción.
- Nueva barra flotante con SVG: WhatsApp, grupo, Telegram, soporte y catálogo; en móvil funciona como barra inferior tipo app.
- Nuevo enlace del grupo de WhatsApp en todas las referencias.
- Tres acciones por plan: carrito, compra por WhatsApp y renovación.
- Carrito con operación compra/renovación, persistencia, precio y mensaje de WhatsApp.
- Animaciones de scroll, tarjetas con profundidad, fondo dinámico, actividad LIVE y carrusel refinado.
- OG image real de 1200 × 630 en PNG, `twitter:image`, URL segura, versión de caché y atributos alt.
- SDK PayPal bajo demanda.
- Mejoras para iPhone/Safari, Android, notch, safe areas, teclado, focus visible y reduced motion.

## Despliegue

Sube todos los archivos de esta carpeta a la raíz del proyecto en Vercel o GitHub Pages. No olvides subir también:

- `click-tv-logo-premium.png`
- `radio-la-red.png`
- `radio-mach-deportes.png`
- `og-image-v12.png`

La URL Open Graph está configurada para `https://click-tv-mundial.vercel.app/`. Si cambias de dominio, reemplaza esa URL absoluta en `index.html`.

## Nota de seguridad

`footballDataApiToken` sigue en `data.js` para conservar la función existente. En un sitio estático, cualquier token incluido en JavaScript es público. Para ocultarlo de verdad se necesita un proxy/serverless function en Vercel.

## Verificación técnica realizada

- Sintaxis validada con `node --check` en `data.js`, `catalogo.js` y `script.js`.
- Render de prueba: 30 productos, 102 opciones de renovación, 2 emisoras y 5 accesos flotantes.
- Carrito probado con cambio de “Compra nueva” a “Renovación”.
- Sin overflow horizontal en 1440 px, 390 px y 360 px.
- No hay IDs HTML duplicados ni recursos CSS locales inexistentes.
- No fue posible comprobar la disponibilidad real de los streams desde este entorno porque la resolución DNS externa estaba restringida; el reproductor sí quedó configurado con las URLs entregadas y manejo de error/reconexión.
