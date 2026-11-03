# Escribe las páginas HTML de la situación de aprendizaje 1 (carpeta sa1/) con su menú y su pie.
# Lee js/datos-sa1.js para los títulos de sesión. Uso: python3 -I paginas_sa1.py RAIZ_DEL_SITIO
import html, json, os, re, sys

RAIZ = sys.argv[1]
texto = open(os.path.join(RAIZ, "js/datos-sa1.js"), encoding="utf8").read()
D = json.loads(texto[texto.index("{"):texto.rstrip().rstrip(";").rindex("}") + 1])
sesiones = [b for b in D["bloques"] if b["tipo"] == "sesion"]
marco = next(b for b in D["bloques"] if b["tipo"] == "marco")
portada = next(b for b in D["bloques"] if b["tipo"] == "portada")
e = html.escape

# Situaciones de aprendizaje: solo la 1 está hecha; las demás conservan su título de la portada general.
SITUACIONES = [
    (1, "¡Por nuestros derechos! La ciudadanía también tiene nombre de mujer", "sa1/index.html"),
    (2, "Asturias en la Segunda República", None),
    (3, "¡Salud, compañeras! Antifascismo y democracia", None),
    (4, "Asturias ocupada: violencia, represión y resistencia", None),
    (5, "Violencia, represión y memoria democrática", None),
    (6, "Huir de la represión: exilio y frontera", None),
    (7, "Asturianas por la ciudadanía", None),
]


def frase(t):
    """MAYÚSCULAS del docx → tipo frase para menús y títulos de pestaña."""
    t = t.strip()
    return t[0] + t[1:].lower() if t.isupper() else t


APARTADOS = [(s["id"], frase(s["titulo"])) for s in marco["secciones"]]
SECUENCIACION = frase(next(b for b in D["bloques"] if b["tipo"] == "rejillaSesiones")["titulo"])


def menu(actual, sesion=None):
    def cur(cond):
        return ' aria-current="page"' if cond else ""
    sa = "\n".join(
        '            <li><a href="%s"%s>%d · %s</a></li>' % ("index.html", cur(actual == "index"), n, e(t)) if url else
        '            <li><a href="#" aria-disabled="true">%d · %s · Pendiente</a></li>' % (n, e(t))
        for n, t, url in SITUACIONES)
    ap = "\n".join('            <li><a href="marco.html#%s">%s</a></li>' % (i, e(t)) for i, t in APARTADOS)
    se = "\n".join('            <li><a href="sesion-%d.html"%s>Sesión %d · %s</a></li>' % (k + 1, cur(sesion == k + 1), k + 1, e(frase(s["titulo"])))
                   for k, s in enumerate(sesiones))
    return f'''    <nav class="ud-menu" aria-label="Principal">
      <button class="ud-menu__boton" type="button" aria-expanded="false" aria-controls="ud-menu-lista">
        <span class="ud-menu__icono" aria-hidden="true"></span>Menú
      </button>
      <ul class="ud-menu__lista" id="ud-menu-lista">
        <li><a class="ud-menu__enlace" href="../index.html">Inicio</a></li>
        <li class="ud-menu__grupo">
          <button class="ud-menu__enlace ud-menu__desplegar{' ud-menu__enlace--actual' if actual == 'index' else ''}" type="button" aria-expanded="false" aria-controls="ud-submenu-situaciones">
            Situación de aprendizaje 1<span class="ud-menu__flecha" aria-hidden="true"></span>
          </button>
          <ul class="ud-submenu" id="ud-submenu-situaciones">
{sa}
          </ul>
        </li>
        <li class="ud-menu__grupo">
          <button class="ud-menu__enlace ud-menu__desplegar{' ud-menu__enlace--actual' if actual == 'marco' else ''}" type="button" aria-expanded="false" aria-controls="ud-submenu-marco">
            Marco curricular<span class="ud-menu__flecha" aria-hidden="true"></span>
          </button>
          <ul class="ud-submenu" id="ud-submenu-marco">
{ap}
          </ul>
        </li>
        <li class="ud-menu__grupo">
          <button class="ud-menu__enlace ud-menu__desplegar{' ud-menu__enlace--actual' if actual == 'sesion' else ''}" type="button" aria-expanded="false" aria-controls="ud-submenu-secuencia">
            {e(SECUENCIACION)}<span class="ud-menu__flecha" aria-hidden="true"></span>
          </button>
          <ul class="ud-submenu" id="ud-submenu-secuencia">
{se}
            <li><a href="index.html#secuencia">Todas las sesiones</a></li>
          </ul>
        </li>
      </ul>
    </nav>'''


def pie(actual, sesion=None):
    if sesion:
        k = sesion - 1
        ant = ('<a class="ud-pie-nav__ant" href="sesion-%d.html"><span>← Sesión anterior</span>%s</a>' % (k, e(frase(sesiones[k - 1]["titulo"])))) if k > 0 else '<span class="ud-pie-nav__vacio"></span>'
        sig = ('<a class="ud-pie-nav__sig" href="sesion-%d.html"><span>Sesión siguiente →</span>%s</a>' % (k + 2, e(frase(sesiones[k + 1]["titulo"])))) if k + 1 < len(sesiones) else '<span class="ud-pie-nav__vacio"></span>'
        centro = '<a class="ud-pie-nav__centro" href="index.html#secuencia">%s</a>' % e(SECUENCIACION)
        etiqueta = "Fases de la secuenciación didáctica"
    else:
        ant = '<span class="ud-pie-nav__vacio"></span>'
        siguiente = SITUACIONES[1]
        sig = '<span class="ud-pie-nav__sig ud-pie-nav__sig--pendiente"><span>Situación de aprendizaje %d →</span>%s · Pendiente</span>' % (siguiente[0], e(siguiente[1]))
        centro = '<a class="ud-pie-nav__centro" href="../index.html#unidades">Todas las situaciones de aprendizaje</a>'
        etiqueta = "Otras situaciones de aprendizaje"
    return f'''  <nav class="ud-pie-nav" aria-label="{etiqueta}">
    {ant}
    {centro}
    {sig}
  </nav>

  <footer class="ud-pie-u">
    <a href="creditos.html">Fuentes y créditos</a>
  </footer>'''


def pagina(nombre, titulo, cuerpo_attr, actual, sesion=None):
    return f'''<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{e(titulo)}</title>
  <link rel="stylesheet" href="../css/ud.css">
  <script src="../js/datos-sa1.js" defer></script>
  <script src="../js/ud-menu.js" defer></script>
  <script src="../js/ud-actividades.js" defer></script>
</head>
<body class="ud-pagina ud-unidad ud-caja"{cuerpo_attr}>

  <a class="ud-saltar" href="#ud-contenido">Ir al contenido</a>

  <!-- CABECERA COMÚN (igual en todas las páginas de la situación de aprendizaje) -->
  <header class="ud-cab">
    <a class="ud-cab__marca" href="../index.html">
      <img class="ud-cab__rosa" src="../img/rosa-web.png" width="782" height="900" alt="" aria-hidden="true">
      <img class="ud-cab__texto" src="../img/texto.png" width="617" height="220" alt="Socialistas asturianas. De la emancipación a la conquista de la democracia. 1936-1977. La emancipación. El camino hacia el socialismo">
    </a>
{menu(actual, sesion)}
  </header>

  <main id="ud-contenido" tabindex="-1">
    <div class="ud-aviso" id="ud-aviso-datos" role="alert" hidden>
      No se ha podido cargar el archivo de datos de la situación de aprendizaje (carpeta js/). La página se muestra sin contenido.
    </div>
    <noscript>
      <div class="ud-aviso">Esta página necesita JavaScript para mostrar la situación de aprendizaje.</div>
    </noscript>
    <div data-ud="pagina"></div>
  </main>

{pie(actual, sesion)}

</body>
</html>
'''


carpeta = os.path.join(RAIZ, "sa1")
os.makedirs(carpeta, exist_ok=True)
base = "Situación de aprendizaje 1"
paginas = {
    "index.html": pagina("index.html", D["unidad"]["tituloPagina"], "", "index"),
    "marco.html": pagina("marco.html", "Marco curricular · " + base, ' data-ud-vista="marco"', "marco"),
    "creditos.html": pagina("creditos.html", "Fuentes y créditos · " + base, ' data-ud-vista="creditos"', "creditos"),
}
for k, s in enumerate(sesiones):
    paginas["sesion-%d.html" % (k + 1)] = pagina("", "Sesión %d · %s · %s" % (k + 1, frase(s["titulo"]), base), ' data-ud-sesion="%d"' % (k + 1), "sesion", k + 1)
for nombre, contenido in paginas.items():
    open(os.path.join(carpeta, nombre), "w", encoding="utf8").write(contenido)
print(sorted(paginas))
