# Situaciones de aprendizaje · sitio estático

Socialistas asturianas · Geografía e Historia, 4.º ESO. Sitio estático, aparte de
WordPress: funciona abriendo los `.html` o desde cualquier servidor (se publica con
GitHub Pages desde la rama `main`). Sin CDN ni servicios de terceros. La tipografía
(Lato) está en `fuentes/`. Las tablas para rellenar guardan lo escrito solo en el
navegador de quien las usa (`localStorage`).

## Estructura

| Ruta | Qué es |
|---|---|
| `index.html` | Portada general: las siete situaciones de aprendizaje. La 1 abre `sa1/`. |
| `sa1/index.html` | Portada de la situación de aprendizaje 1 y su secuenciación didáctica. |
| `sa1/marco.html` | Marco curricular: intención educativa, ODS, elementos curriculares, saberes básicos, metodología y agrupamientos. |
| `sa1/sesion-1.html` … `sesion-6.html` | Una página por sesión: imagen de cabecera, actividades y, al pie, sesión anterior · secuenciación · sesión siguiente. |
| `sa1/creditos.html` | Fuentes y créditos de las imágenes (enlazado desde el pie). |
| `css/ud.css` | Todos los estilos (`.ud-unidad`; `.ud-prueba` = página de prueba antigua). |
| `js/ud-menu.js` | Menú común: plegado en móvil (< 768 px), desplegables, Escape, clic fuera. |
| `js/ud-actividades.js` | Lógica genérica. No contiene texto de ninguna situación. |
| `js/datos-sa1.js` | Todo el texto, respuestas e imágenes de la situación 1 (`window.UD_DATOS`). Generado. |
| `img/sa1/` | Imágenes de la situación 1; `img/sa1/sesiones/` = cabeceras de sesión. |
| `docs/sa1/` | Páginas escaneadas de *El Socialista* (16-3-1900 y 11-10-1913). |
| `herramientas/` | Scripts que generan `js/datos-sa1.js` y las páginas de `sa1/` desde el .docx. |
| `prueba-ud2-s1/` | Página de prueba antigua, no enlazada. |

## Regenerar la situación 1

Los textos salen literalmente del docx «PROPUESTA DE SITUACIÓN DE APRENDIZAJE 1»;
su texto ya extraído, sin las notas internas en rojo, está en `herramientas/parrafos-sa1.json`,
así que no hace falta el docx para regenerar. Después se aplican los cambios posteriores
(«Cambios.docx»: título nuevo, María Cambrils en la sesión 3, sesión 7), guardados
literalmente en `herramientas/cambios-sa1.json`.

```
python3 -I herramientas/construir_sa1.py herramientas/parrafos-sa1.json herramientas/datos-anteriores.json js/datos-sa1.js
python3 -I herramientas/cambios_sa1.py js/datos-sa1.js herramientas/cambios-sa1.json
python3 -I herramientas/paginas_sa1.py .
```

`construir_sa1.py` avisa de cualquier párrafo del docx que no se haya usado y lleva la
lista de erratas corregidas con el visto bueno de la autoría. `datos-anteriores.json`
guarda lo que el docx pide «mantener» de la versión anterior. Las páginas cargan CSS y JS
con una huella de versión (`?v=…`) para que el navegador no use copias viejas.

## Mujeres con ilustración propia (trato destacado)

Carpeta `UD/correos/fotos_mujeres` (también en Drive):
Maximina Montes, Ludivina García «La Capricha», Concepción Pérez, Dolores Valdés,
Argentina Rubiera y Ángeles Flórez, más la imagen de grupo `mujeres-carcel-laviana1.png`.
Ninguna aparece en la situación 1. Cuando aparezcan, se muestran con su ilustración
en grande y su foto al lado (bloque `retratos` con `ilustracion`); sin ilustración,
los retratos van en rejilla.
