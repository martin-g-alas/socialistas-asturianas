# Genera js/datos-sa1.js a partir de «PROPUESTA DE SITUACIÓN DE APRENDIZAJE 1.docx».
# Los textos se copian tal cual del docx (sin las notas en rojo, que son indicaciones
# para la web). Lo que el docx pide «mantener» se toma de la versión anterior (datos-ud1).
# Uso: python3 -I construir_sa1.py parrafos.json datos-anteriores.json salida.js
import json, re, sys

P = json.load(open(sys.argv[1], encoding="utf8"))
V = json.load(open(sys.argv[2], encoding="utf8"))
SAL = sys.argv[3]
usados = set()


def buscar(prefijo, n=1):
    """Párrafo n-ésimo cuyo texto (sin notas en rojo) empieza por prefijo."""
    hallados = [i for i, p in enumerate(P) if limpio(p).startswith(prefijo)]
    assert len(hallados) >= n, ("no está", prefijo)
    i = hallados[n - 1]
    usados.add(i)
    return P[i]


def limpio(p):
    return "".join(s["t"] for s in p["segs"] if not s.get("rojo")).strip()


def T(prefijo, n=1):
    return limpio(buscar(prefijo, n))


def exacto(texto):
    """Párrafo cuyo texto es exactamente este (para palabras sueltas como los lugares)."""
    hallados = [i for i, p in enumerate(P) if limpio(p) == texto]
    assert hallados, texto
    usados.update(hallados)
    return texto


def S(prefijo, n=1, sin_negrita=False):
    """Segmentos con formato (negrita, cursiva, enlace) del párrafo, sin notas en rojo."""
    p = buscar(prefijo, n)
    segs = [dict(s) for s in p["segs"] if not s.get("rojo")]
    out = []
    for s in segs:
        clase = "enlace" if s.get("link") else ("destacado" if s.get("b") and s["t"].strip() and not sin_negrita else ("cursiva" if s.get("i") and s["t"].strip() else "texto"))
        if out and out[-1][0] == clase and clase != "enlace":
            out[-1][1] += s["t"]
        else:
            out.append([clase, s["t"]])
    # recorta espacios en los extremos
    while out and not out[0][1].strip():
        out.pop(0)
    while out and not out[-1][1].strip():
        out.pop()
    out[0][1] = out[0][1].lstrip()
    out[-1][1] = out[-1][1].rstrip()
    assert "".join(x[1] for x in out) == limpio(p), prefijo
    if all(c == "texto" for c, _ in out):
        return "".join(x[1] for x in out)
    r = []
    for c, t in out:
        if c == "enlace":
            r.append({"enlace": t.strip(), "texto": t.strip()})
            if t != t.strip():
                r.append({"texto": t[len(t.rstrip()):]})
        elif c == "texto":
            r.append({"texto": t})
        else:
            r.append({"texto": t, c: True})
    return r


def lista(prefijos, n=1):
    return {"lista": [S(x, n) for x in prefijos]}


def partir(texto, sep=": "):
    """«ETIQUETA: título» → (etiqueta, título), comprobando que no se pierde nada."""
    a, b = texto.split(sep, 1)
    assert a + sep + b == texto
    return a, b


viejas = {b["id"]: b for b in V["bloques"] if b["tipo"] == "sesion"}


def vieja(sid, etiqueta):
    return next(a for a in viejas[sid]["actividades"] if a["etiqueta"] == etiqueta)


def franja(prefijo_etiqueta, prefijo_texto, etiqueta, n=1):
    """Franja gris del final de sesión: etiqueta + «En el aula» + texto."""
    t = T(prefijo_etiqueta, n)
    assert re.sub(r"\s+", " ", t).upper().startswith(etiqueta.upper()), t
    return {"etiqueta": etiqueta, "aula": True, "oscura": True, "lema": T(prefijo_texto)}


# ------------------------------------------------------------------ sesiones

sesiones = []

# ---- Sesión 1
s1_inicial = vieja("s1", "Actividad inicial · Galería de imágenes")
eti, tit = partir(T("ACTIVIDAD INICIAL"))
act_inicial = {
    "etiqueta": eti.capitalize(), "titulo": tit,
    "contenido": [T("La primera actividad consiste"), T("Se proyectarán imágenes de:"),
                  lista(["Olympe de Gouges.", "Mary Wollstonecraft.", "Flora Tristán.", "Concepción Arenal.", "Clara Zetkin."])],
    "interactiva": s1_inicial["interactiva"],
    "despues": [T("Para orientar el desarrollo"), {"titulo": T("Preguntas iniciales").rstrip(")").strip()},
                lista(["¿Qué tienen en común", "¿Por qué son consideradas", "¿Qué significa ser ciudadana"])],
}
# La galería ya no repite la lista de nombres al completarse (la lista va arriba).
vind = vieja("s1", "Actividad principal")["contenido"]
cita_vind = next(x for x in vind if isinstance(x, dict) and x.get("cita"))
eti, tit = partir(T("ACTIVIDAD PRINCIPAL"))
decl = S("Declaración de los Derechos de la Mujer y de la Ciudadana (1791).")
act_principal = {
    "etiqueta": eti.capitalize(), "titulo": tit, "aula": True,
    "contenido": [T("La clase se dividirá en grupos heterogéneos"), T("El objetivo es fomentar el pensamiento crítico, la argumentación histórica y la reflexión sobre los avances y las limitaciones de la igualdad de género durante la Revolución Francesa, dando"),
                  T("Finalmente, se realizará una reflexión conjunta"),
                  {"titulo": T("Lectura por grupos de fragmentos de:")},
                  {"lista": [decl, T("Vindicación de los Derechos de la Mujer (1792).")]},
                  cita_vind,
                  {"titulo": T("Preparación de debate:")}, T("La clase se dividirá en cuatro grupos")],
}
debate = dict(vieja("s1", "Debate"))
sesiones.append({"n": 1, "titulo": T("¿Súbditas o ciudadanas?"), "intro": T("La primera sesión está orientada"),
                 "actividades": [act_inicial, act_principal, debate], "imagen": "cabecera_s1"})

# ---- Sesión 2
ordenar = vieja("s2", "Actividad visual")["interactiva"]
eti_coop = T("ACTIVIDAD COOPERATIVA")
assert eti_coop == "ACTIVIDAD COOPERATIVA La campaña sufragista", eti_coop
seneca = ["La historia de la humanidad es", "La ha obligado a someterse", "Si está casada", "Moralmente se ha convertido", "Al emprender la gran tarea"]
decidimos = ["DECIDIMOS: Que todas aquellas", "DECIDIMOS: Que la mujer es igual", "DECIDIMOS: Que es deber"]
sesiones.append({
    "n": 2, "titulo": T("La campaña sufragista", 1), "intro": T("El derecho al voto de las mujeres"),
    "actividades": [
        {"etiqueta": "Línea del tiempo", "contenido": [T("En primer lugar, se propone ordenar")], "interactiva": ordenar},
        {"etiqueta": "Actividad cooperativa", "titulo": "La campaña sufragista", "aula": True,
         "contenido": [T("La idea es que cada pareja"), T("Como paso previo, leeremos"),
                       {"documento": {"titulo": T("La Declaración de independencia respecto a los varones:"),
                                      "parrafos": [T(x) for x in seneca],
                                      "nota": T("La Declaración recoge el principio"),
                                      "resoluciones": [T(x) for x in decidimos],
                                      "fuente": T("Fuente: Amalia Martín Gamero")}},
                       S("A continuación, cada pareja de estudiantes"), T("Una vez realizada la pancarta"),
                       lista(["¿Qué mensaje reivindicativo", "¿Por qué hemos elegido", "¿Cómo ayudaría esa", "¿Sigue siendo necesario"]),
                       {"galeria": ["desfile", "sufragistas_coche", "wspu"], "clase": "ud-galeria--apaisada"}]},
        franja("RECREACIÓN", "¿Os atrevéis a recrear", "Recreación"),
    ], "imagen": "cabecera_s2"})

# ---- Sesión 3
retratos_s3 = next(x for x in vieja("s3", "Investigación por equipos")["contenido"] if isinstance(x, dict) and x.get("retratos"))
nombres_s3 = next(x for x in vieja("s3", "Investigación por equipos")["contenido"] if isinstance(x, dict) and x.get("lista"))["lista"]
retratos = list(retratos_s3["retratos"]) + [{"nombre": nombres_s3[-1].rstrip("."), "foto": "posada"}]
eti, tit = partir(T("Actividad de investigación biográfica"))
eti2, tit2 = partir(T("Actividad de creación. Entrada"), ". ")
sesiones.append({
    "n": 3, "titulo": T("Las pensadoras de la emancipación", 1), "intro": T("En la tercera sesión se propone"),
    "actividades": [
        {"etiqueta": eti, "titulo": tit, "aula": True,
         "contenido": [T("En esta actividad, el alumnado se organizará"), T("Cada equipo estudiará una de las siguientes"),
                       {"lista": [S("Flora Tristán.", 2), S("Jeanne Deroin."), S("Aleksandra Kollontái."), S("Clara Zetkin.", 2), S("Rosa Luxemburgo."), S("Concepción Arenal.", 2), S("Josefa Amar y Borbón."), S("Adolfo Posada.")]},
                       {"retratos": retratos}]},
        {"etiqueta": eti2, "titulo": tit2, "aula": True,
         "contenido": [T("A partir de la información recopilada"), T("Cada ficha deberá incluir"),
                       lista(["Fotografía", "Cronología", "Ideas principales", "Frases destacadas", "Influencia histórica"]),
                       S("Podemos tomar como ejemplo"), S("https://fpabloiglesias.es/entrada-db/"),
                       T("Finalmente, cada equipo compartirá")]},
        franja("CREACIÓN", "¿Os atrevéis a crear una cuenta", "Creación"),
    ], "imagen": "cabecera_s3"})

# ---- Sesión 4
textos = vieja("s4", "Actividad documental")
for k, pre in enumerate(["¿Se quiere hacer un pueblo", "A las primeras se las enseña", "En grave empeño me pongo"]):
    # El docx repite los textos de la versión anterior: se comprueba que no han cambiado.
    nuevo = T(pre)
    el = textos["interactiva"]["elementos"][k]
    assert nuevo.startswith(el["texto"]), pre
eti, tit = partir(T("Actividad de creación: Elaboración"))
pasos = [("1.1. Las voces del pasado", ["Se divide la clase en tres grupos"]),
         ("1.2. Del pasado al presente", ["Cada grupo relaciona las ideas"])]
sesiones.append({
    "n": 4, "titulo": T("Educación, trabajo y ciudadanía", 1), "intro": T("En la cuarta sesión se pretende"),
    "actividades": [
        {"etiqueta": "Textos", "contenido": textos["contenido"], "interactiva": textos["interactiva"]},
        {"etiqueta": eti, "titulo": tit, "aula": True,
         "contenido": [{"titulo": T("1.1. Las voces del pasado")}, T("Se divide la clase en tres grupos"),
                       {"titulo": T("1.2. Del pasado al presente")}, T("Cada grupo relaciona las ideas"),
                       lista(["¿Qué desigualdades en el acceso", "¿Qué avances se han conseguido", "¿Qué cambios deberían promoverse", "¿Cómo podemos contribuir"]),
                       T("Las conclusiones se irán anotando"),
                       {"titulo": T("1.3. Construimos el manifiesto")}, S("A partir de las reflexiones anteriores, toda la clase"),
                       T("Cada grupo aporta sus propuestas"),
                       {"lista": [T("1. Introducción:"), T("2. Lo que denunciamos:"), T("3. Lo que defendemos:"), T("4. Nuestros compromisos:")], "clase": "ud-lista--sin"},
                       T("El manifiesto debe incluir")]},
        franja("CREACIÓN", "¿Os atrevéis a transformar", "Creación", 2),
    ], "imagen": "cabecera_s4"})

# ---- Sesión 5
eti2, tit2 = partir(T("2. Actividad individual de empatía"))
sesiones.append({
    "n": 5, "titulo": T("La voz de las trabajadoras asturianas"), "intro": T("En la quinta sesión se pretende"),
    "actividades": [
        {"etiqueta": T("1. Actividad con prensa histórica"), "aula": True,
         "contenido": [{"titulo": T("Lectura por parejas de las dos noticias:")},
                       {"noticias": [
                           {"titulo": T("Documento 1. Oviedo, 1900"), "fecha": T("El Socialista 16-3-1900"), "resumen": T("Las obreras de una fábrica de cerillas"), "imagen": "prensa_oviedo"},
                           {"titulo": T("Documento 2. Gijón. 1913"), "fecha": T("El Socialista 11-10-1910"), "resumen": T("Más de doscientas trabajadoras"), "imagen": "prensa_gijon"}]},
                       {"titulo": T("b) Analizamos las condiciones de trabajo:")},
                       {"tablaTrabajo": {"clave": "sa1-s5-condiciones", "archivo": "Sesion-5-condiciones-de-trabajo", "titulo": T("b) Analizamos las condiciones de trabajo:"), "cabeceras": ["", T("Oviedo (1900)"), T("Gijón (1913)")],
                                         "filas": [T("Tipo de trabajadoras"), T("Problemas denunciados"), T("Forma de protesta"), T("Apoyo recibido")]}}]},
        {"etiqueta": eti2, "titulo": tit2, "aula": True,
         "contenido": [T("Esta actividad se realizará por parejas"), T("Estas preguntas pueden servir"),
                       lista(["¿Cómo sería tu jornada", "¿Cuáles serían tus principales", "¿Qué esperas conseguir", "¿Crees que las condiciones", "¿Qué derechos laborales", "¿Crees que siguen existiendo"])]},
        franja("LECTURA COLABORATIVA", "¿Os animáis a compartir", "Lectura colaborativa"),
    ], "imagen": "cabecera_s5"})

# ---- Sesión 6
eti, tit = partir(T("Actividad cartográfica:"))
eti2, tit2 = partir(T("Actividad cooperativa: Reportaje"))
lugares = ["Gijón", "Mieres", "La Vega (Riosa)", "Sotrondio", "Vegadotos", "Turón"]
fin = T("Puesta en común")
assert re.sub(r"\s+", " ", fin) == "Puesta en común En el aula", fin
sesiones.append({
    "n": 6, "titulo": T("Los primeros grupos femeninos socialistas en Asturias"), "intro": T("En la sexta sesión nos acercaremos"),
    "actividades": [
        {"etiqueta": eti, "titulo": tit, "aula": True,
         "contenido": [T("En primer lugar, debéis leer"),
                       {"documento": {"titulo": T("Las asturianas se organizan"),
                                      "parrafos": [T(x) for x in ["Los primeros grupos femeninos socialistas surgen", "En Gijón, las trabajadoras", "En octubre de 1913", "Fueron los grupos de La Vega", "El grupo femenino socialista de Vegadotos", "La Agrupación Femenina de Turón"]]}},
                       {"titulo": T("a) Debéis situar en el mapa")},
                       {"lista": [exacto(x) for x in lugares]},
                       {"relacionar": {"modo": "mapa", "mapa": "mapa_zona", "situacion": "mapa_situacion", "barajar": True, "intentosParaSolucion": 2,
                                       "etiquetaElemento": "Punto {n}", "textoElige": "Elige el lugar", "opciones": lugares,
                                       "mensajes": {"correcto": "Correcto · {nombre}", "noEs": "No es {nombre} · prueba otra vez", "solucion": "Solución · {nombre}"},
                                       "elementos": [{"respuesta": "Gijón", "punto": {"x": 56.4, "y": 16.3}},
                                                     {"respuesta": "Mieres", "punto": {"x": 45.9, "y": 71.6}},
                                                     {"respuesta": "La Vega (Riosa)", "punto": {"x": 22.7, "y": 80.8}},
                                                     {"respuesta": "Sotrondio", "punto": {"x": 70.5, "y": 68.3}},
                                                     {"respuesta": "Vegadotos", "punto": {"x": 53.6, "y": 71.2}},
                                                     {"respuesta": "Turón", "punto": {"x": 54.1, "y": 79.3}}]}},
                       {"titulo": T("b) Síntesis de los datos")},
                       {"tablaTrabajo": {"clave": "sa1-s6-grupos", "archivo": "Sesion-6-primeros-grupos-femeninos", "titulo": T("b) Síntesis de los datos"), "cabeceras": [T("Localidad"), T("Fecha aproximada"), T("Datos")],
                                         "filas": lugares}}]},
        {"etiqueta": eti2, "titulo": tit2, "aula": True,
         "contenido": [S("En el texto de la actividad anterior aparece"), S("Por su parte, Rosario de Acuña"),
                       {"retratos": [{"nombre": "Virginia González Polo", "foto": "gonzalez_polo"}, {"nombre": "Rosario de Acuña", "foto": "acuna"}]},
                       T("Lee los siguientes textos:"),
                       T("Estos son algunos de los testimonios"), {"cita": [T("Yo soy sencillamente una obrera")]},
                       T("Y estos fragmentos son parte del artículo"), {"cita": [T("¡Viví dos días el aire acre"), T("Tuve la satisfacción y la alegría")]},
                       T("Con la información que hemos trabajado"), {"titulo": T("Posibles pasos a seguir")}, T("La clase se dividirá en pequeños grupos")]},
        {"etiqueta": "Puesta en común", "aula": True, "oscura": True, "lema": T("¡La prensa sale a la calle!")},
    ], "imagen": "cabecera_s6"})

# Los nombres de lugar se repiten en la lista y en la tabla: marca ambos como usados.
for i, p in enumerate(P):
    if limpio(p) in lugares:
        usados.add(i)

# ------------------------------------------------------------------ marco curricular

def casillas(desde, hasta):
    i0 = next(i for i, p in enumerate(P) if limpio(p).startswith(desde))
    i1 = next(i for i, p in enumerate(P) if limpio(p).startswith(hasta) and i > i0)
    items = []
    for i in range(i0 + 1, i1):
        if P[i]["rojo"]:
            continue
        usados.add(i)
        texto = re.sub(r"^[☐]\s*", "", limpio(P[i])).strip()
        marcado = any(s.get("b") and s["t"].strip() for s in P[i]["segs"])
        items.append({"texto": texto, "marcado": marcado})
    usados.add(i0)
    return items


marco = [
    {"id": "intencion", "titulo": T("Intención educativa"), "contenido": [T("La conquista de los derechos"), T("A través de figuras como"), T("Esta situación de aprendizaje pretende")]},
    {"id": "ods", "titulo": T("Relación con ODS 2030"), "contenido": [T("Con esta situación de aprendizaje se espera"),
                                                                    lista(["ODS n.º 5.", "Reto siglo XXI n.º 4:", "Reto siglo XXI n.º 9:"]),
                                                                    T("Esta situación de aprendizaje se plantea para ocho")]},
    {"id": "elementos", "titulo": T("CONEXIÓN CON LOS ELEMENTOS CURRICULARES"),
     "tabla": {"cabeceras": [T("Competencias específicas"), T("Criterios de evaluación"), T("Descriptores del perfil de salida")],
               "filas": [
                   [[S("Competencia específica 1.")], [lista(["Elaborar contenidos propios", "Transferir adecuadamente"])], [T("CCL2, CCL3")]],
                   [[S("Competencia específica 2.")], [T("2.1 Generar productos"), T("2.2. Producir y expresar")], [T("CCL1, CCL2, CD2")]],
                   [[S("Competencia específica 5.")], [T("5.1. Conocer, valorar"), T("5.2. Reconocer movimientos")], [T("CCL5, CC1")]]]}},
    {"id": "saberes", "titulo": T("Saberes Básicos"), "contenido": [
        {"titulo": T("Bloque A. Retos")}, lista(["Desigualdad e injusticia", "Igualdad de género y formas"]),
        {"titulo": T("Bloque B. Sociedades")}, lista(["Conciencia histórica.", "La transformación política", "La acción de los movimientos", "La memoria democrática"]),
        {"titulo": T("Bloque C. Compromiso")}, lista(["Cohesión social e integración", "La igualdad real de mujeres"])]},
    {"id": "metodologia", "titulo": T("METODOLOGÍA"), "casillas": casillas("METODOLOGÍA", "AGRUPAMIENTOS")},
    {"id": "agrupamientos", "titulo": T("AGRUPAMIENTOS"), "casillas": casillas("AGRUPAMIENTOS", "SECUENCIACIÓN DIDÁCTICA")},
]

# ------------------------------------------------------------------ datos de la situación

sa = {
    "numero": 1,
    "etiqueta": T("SITUACIÓN DE APRENDIZAJE 1"),
    "titulo": T("¡POR NUESTROS DERECHOS!"),
    "subtitulo": T("La emancipación: Las mujeres asturianas"),
    "datos": [
        {"clave": T("Etapa"), "valor": T("Educación") + " " + T("Secundaria Obligatoria")},
        {"clave": T("Curso"), "valor": T("4.º ESO")},
        {"clave": T("Materia"), "valor": T("Geografía e Historia")},
        {"clave": T("Temporalización"), "valor": T("8 sesiones")},
    ],
    "interdisciplinar": {"clave": T("Relación interdisciplinar entre áreas"), "valor": T("En esta situación de aprendizaje, dado que")},
    "secuenciacion": T("SECUENCIACIÓN DIDÁCTICA"),
}
for x in ["Sesiones", "Descripción de las actividades"]:
    T(x)
for k in range(1, 7):
    T("Sesión %d" % k)

# ------------------------------------------------------------------ imágenes

IMG = {}
for k, v in V["imagenes"].items():
    v = dict(v)
    if v.get("src"):
        v["src"] = v["src"].replace("/img/ud1/", "/img/sa1/")
    IMG[k] = v
IMG["prensa_oviedo"] = {"src": "../img/sa1/el-socialista-1900-oviedo.jpg", "alt": "Recorte de prensa: noticia «En Oviedo» sobre la huelga de las operarias de la fábrica de cerillas de los señores San Román.",
                        "titulo": "El Socialista, 16-3-1900 · «En Oviedo» (recorte)", "autor": "El Socialista", "fecha": "1900", "licencia": "Dominio público",
                        "fuente": "", "estado": "libre", "estadoTexto": "Libre", "w": 383, "h": 780}
IMG["prensa_gijon"] = {"src": "../img/sa1/el-socialista-gijon-tejedoras.jpg", "alt": "Recorte de prensa: las tejedoras de Gijón mantienen su huelga.",
                       "titulo": "El Socialista · huelga de las tejedoras de Gijón (recorte)", "autor": "El Socialista", "fecha": "", "licencia": "Dominio público",
                       "fuente": "", "estado": "libre", "estadoTexto": "Libre", "w": 436, "h": 338}
# Josefa Amar y Borbón: grabado facilitado por la autoría de la unidad (procedencia por confirmar).
IMG["amar"] = {"src": "../img/sa1/amar.jpg", "alt": "Grabado: retrato de una mujer sentada, con collar y vestido de hombros descubiertos.",
               "titulo": "Josefa de Amar y Borbón (grabado)", "autor": "Grabado facilitado por la autoría de la unidad", "fecha": "",
               "licencia": "Procedencia por confirmar", "fuente": "", "estado": "libre", "estadoTexto": "Por confirmar", "w": 520, "h": 627}
IMG["mapa_zona"] = {"src": "../img/sa1/mapa-asturias-zona.png", "alt": "Mapa mudo de la zona central de Asturias con los límites de los concejos y seis puntos numerados.",
                    "titulo": "Mapa de concejos de Asturias (zona central)", "sinCredito": True, "estado": "libre", "w": 660, "h": 624}
IMG["mapa_situacion"] = {"src": "../img/sa1/mapa-asturias-situacion.png", "alt": "Mapa de situación: Asturias entera con un recuadro en la zona central ampliada.",
                         "titulo": "Mapa de situación de Asturias", "sinCredito": True, "estado": "libre", "w": 500, "h": 172}
IMG["cabecera_s2"] = {"src": "../img/sa1/sesiones/sesion-2-urna.jpg", "alt": "Acuarela de una urna electoral de cristal dentro de un armazón de madera.",
                      "titulo": "Ballot Box (urna electoral), acuarela, c. 1939", "autor": "Rose Campbell-Gerke · Index of American Design, National Gallery of Art", "fecha": "c. 1939", "licencia": "CC0",
                      "fuente": "https://www.rawpixel.com/image/8232391/image-art-vintage-public-domain", "estado": "libre", "estadoTexto": "Libre", "decorativa": True, "w": 1600, "h": 760}
IMG["cabecera_s6"] = {"src": "../img/sa1/sesiones/sesion-6-el-socialista.jpg", "alt": "Portada de El Socialista del 11 de octubre de 1913.",
                      "titulo": "El Socialista, núm. 1601, 11-10-1913 (portada)", "autor": "El Socialista", "fecha": "1913", "licencia": "Dominio público",
                      "fuente": "", "estado": "libre", "estadoTexto": "Libre", "decorativa": True, "w": 1200, "h": 800}

bloques = []
bloques.append({"tipo": "portada", "id": "presentacion", "imagen": "portada_ud", "etiqueta": sa["etiqueta"], "titulo": sa["titulo"],
                "subtitulo": sa["subtitulo"], "datos": [sa["interdisciplinar"]]})
bloques.append({"tipo": "cifras", "clase": "ud-cifras--datos", "etiquetaAccesible": "Datos de la situación de aprendizaje",
                "items": [{"valor": d["valor"], "etiqueta": d["clave"]} for d in sa["datos"]]})
bloques.append({"tipo": "rejillaSesiones", "id": "secuencia", "titulo": sa["secuenciacion"],
                "items": [{"num": "%02d" % s["n"], "titulo": s["titulo"], "texto": s["intro"], "href": "sesion-%d.html" % s["n"]} for s in sesiones]})
for s in sesiones:
    bloques.append({"tipo": "sesion", "id": "s%d" % s["n"], "etiqueta": "Sesión %d" % s["n"], "titulo": s["titulo"], "intro": s["intro"],
                    "actividades": s["actividades"], "ilustracionImagen": s["imagen"]})
bloques.append({"tipo": "marco", "pagina": "marco", "id": "marco", "titulo": ["Marco", "curricular"], "secciones": marco})

# Créditos: la tabla solo lista las imágenes que se usan en esta situación de aprendizaje.
texto_bloques = json.dumps(bloques, ensure_ascii=False)
usadas = {k for k in IMG if '"%s"' % k in texto_bloques}
viejo_cred = next(b for b in V["bloques"] if b["tipo"] == "creditos")
IMG = {k: v for k, v in IMG.items() if k in usadas}
# Columna «Dónde aparece», recalculada para las páginas nuevas.
for k, v in IMG.items():
    donde = []
    for b in bloques:
        if '"%s"' % k in json.dumps(b, ensure_ascii=False):
            if b["tipo"] == "sesion":
                donde.append(b["etiqueta"] + (" · cabecera" if b.get("ilustracionImagen") == k else ""))
            elif b["tipo"] == "portada":
                donde.append("Portada de la situación de aprendizaje")
    v["sesion"] = " · ".join(dict.fromkeys(donde))
cred = dict(viejo_cred)
cred["pagina"] = "creditos"
cred["despues"] = [{"nota": "Tipografía Lato (SIL Open Font License) · Ilustración de la rosa: Alfonso Zapico."},
                   {"nota": "Prensa: El Socialista, recortes incluidos en la propuesta de la situación de aprendizaje (sesión 5) y portada del núm. 1601 (11-10-1913), escaneada de la carpeta de la unidad (cabecera de la sesión 6)."}]
bloques.append(cred)

interfaz = dict(V["interfaz"])
interfaz.update({"tablaVacia": "Escribe aquí", "tablaGuardada": "Lo que escribas se guarda en este navegador. Para entregarlo o seguir en otro equipo, descárgalo o cópialo.",
                 "tablaWord": "Descargar para Word", "tablaCsv": "Descargar hoja de cálculo", "tablaCopiar": "Copiar la tabla",
                 "tablaDescargada": "Tabla descargada.", "tablaCopiada": "Tabla copiada: pégala en tu documento.",
                 "tablaNoCopiada": "No se ha podido copiar: usa «Descargar para Word».", "seleccionada": "(seleccionada)"})

D = {"unidad": {"numero": 1, "tituloPagina": sa["etiqueta"].strip().capitalize() + " · " + sa["titulo"].capitalize()},
     "interfaz": interfaz, "imagenes": IMG, "bloques": bloques}

open(SAL, "w", encoding="utf8").write("/* Generado por construir_sa1.py a partir de «PROPUESTA DE SITUACIÓN DE APRENDIZAJE 1.docx». No editar a mano. */\nwindow.UD_DATOS = "
                                       + json.dumps(D, ensure_ascii=False, indent=1) + ";\n")

# Informe: párrafos del docx que no se han usado (sin contar notas en rojo).
for i, p in enumerate(P):
    if i not in usados and not p["rojo"]:
        print("SIN USAR", i, limpio(p)[:100])
print("imágenes:", sorted(IMG))
