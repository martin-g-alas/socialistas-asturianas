# UD interactivas · sitio estático

Carpeta autónoma para subir al servidor, aparte de WordPress. Funciona abriendo
los `.html` con doble clic o desde cualquier servidor. Sin plugins, sin CDN, sin
servicios de terceros, sin cookies ni `localStorage`. La tipografía (Lato) está
en `fuentes/`.

## Estructura

| Ruta | Qué es |
|---|---|
| `index.html` | Portada general (tablero «Main» del boceto). La tarjeta 01 abre la Unidad 1. |
| `ud1/index.html` | Página de la Unidad 1 (presentación, objetivos, secuencia, museo, podcast, evaluación, ampliación, recursos y créditos). |
| `ud1/sesion-1.html` … `sesion-8.html` | Una página por sesión: ilustración arriba, contenidos y enlaces a la sesión anterior y siguiente. |
| `css/ud.css` | Todos los estilos. `.ud-unidad` = diseño «portada 1»; `.ud-prueba` = página de prueba anterior. |
| `js/ud-menu.js` | Menú común: plegado en móvil (< 768 px), submenú «Datos de la unidad», Escape, clic fuera. |
| `js/ud-actividades.js` | Lógica genérica. No contiene texto de ninguna unidad. |
| `js/datos-ud1.js` | Todo el texto, respuestas e imágenes de la Unidad 1 (`window.UD_DATOS`). |
| `img/rosa.png` · `img/rosa-web.png` | Ilustración de Alfonso Zapico (copia recibida) y versión web de 782 × 900 px. |
| `img/ud1/` | Imágenes de la Unidad 1. `creditos.json`: archivo, título, autor, fecha, fuente, licencia, sesión y estado de cada una. |
| `docs/ud1/` | Páginas de *El Socialista* (16-3-1900 y 11-10-1913) para el visor, con miniaturas. |
| `fuentes/` | Lato 300/400/400 cursiva/700 (latin) y su licencia `OFL.txt`. |
| `prueba-ud2-s1/` | Página de prueba anterior (Sesión 1), con sus archivos `js/datos-ud2-s1.js` e `img/galeria/`. |

Orden de carga de los scripts (clásicos, con `defer`):
`datos-udN.js` → `ud-menu.js` → `ud-actividades.js`.

## Subir al servidor

Sube la carpeta `ud-interactivas/` completa respetando subcarpetas y abre
`https://tu-dominio/…/ud-interactivas/`. No hace falta configurar nada.
Prueba local: dentro de la carpeta, `python3 -m http.server 8000`.

## Hacer otra unidad

1. Copia `ud1/` como `ud2/` y `js/datos-ud1.js` como `js/datos-ud2.js`.
2. En `ud2/index.html` cambia solo la línea del script de datos.
3. Rellena el archivo de datos: `unidad`, `interfaz`, `imagenes` y `bloques`
   (tipos: `portada`, `cifras`, `objetivos`, `rejillaSesiones`, `sesion`,
   `bandaMuseo`, `podcast`, `evaluacion`, `ampliacion`, `recursos`, `creditos`).
4. En `index.html` convierte la tarjeta de la unidad en enlace.

Actividad interactiva (`interactiva` dentro de una actividad), motor «relacionar»:
`modo` = `imagenes` (galería), `textos` (fragmentos), `lista` (ordenar con
posiciones 1.º, 2.º…) o `mapa` (puntos numerados sobre una imagen, con `x`/`y`
en %). Opciones: `barajar`, `intentosParaSolucion` (2), `compararAlFallar`,
`revelar` (por elemento) y `alCompletar` (texto que aparece al terminar).

La Unidad 1 se generó desde el .docx con un script, para que los textos sean
literales; si se edita a mano, hay que copiar los textos letra a letra.

## Ilustraciones (se colocan solas al copiar el archivo)

- **Cabecera de cada sesión:** `img/ud1/sesiones/sesion-1.jpg` … `sesion-8.jpg`.
- **Ilustración de cada mujer** (se muestra en grande, junto a su foto, donde aparece):
  `img/ud1/ilustraciones/` con estos nombres:
  `olympe-de-gouges.jpg`, `mary-wollstonecraft.jpg`, `flora-tristan.jpg`,
  `concepcion-arenal.jpg`, `clara-zetkin.jpg`, `jeanne-deroin.jpg`,
  `aleksandra-kollontai.jpg`, `rosa-luxemburgo.jpg`, `josefa-amar-y-borbon.jpg`,
  `virginia-gonzalez-polo.jpg`, `rosario-de-acuna.jpg`, `teresa-olay.jpg`,
  `rogelia-gonzalez-vega.jpg`.

Mientras falte el archivo, la sesión muestra «Ilustración pendiente» y cada mujer
aparece solo con su foto.

## Mujeres con ilustración propia (trato destacado)

Carpeta `UD/correos/fotos_mujeres` (también en el Drive de m.garcia.alas@gmail.com):
Maximina Montes, Ludivina García «La Capricha», Concepción Pérez, Dolores Valdés,
Argentina Rubiera y Ángeles Flórez, más la imagen de grupo `mujeres-carcel-laviana1.png`.
Ninguna aparece en la Unidad 1. Cuando aparezcan en otra unidad, se muestran con su
ilustración en grande y su foto al lado (bloque `retratos`), con más presencia que
el resto.
