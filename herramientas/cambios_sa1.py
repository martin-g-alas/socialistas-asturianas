# Aplica a js/datos-sa1.js los cambios del documento «Cambios.docx» (noviembre de 2026).
# Se ejecuta DESPUÉS de construir_sa1.py. Los textos nuevos, copiados tal cual del documento,
# están en herramientas/cambios-sa1.json. Cada cambio comprueba el texto de partida: si ya no
# coincide, el script se detiene en vez de inventar.
# Uso: python3 -I herramientas/cambios_sa1.py js/datos-sa1.js herramientas/cambios-sa1.json
import json, sys

RUTA = sys.argv[1]
C = json.load(open(sys.argv[2], encoding="utf8"))
texto = open(RUTA, encoding="utf8").read()
cabecera = texto[:texto.index("window.UD_DATOS")]
D = json.loads(texto[texto.index("{"):texto.rstrip().rstrip(";").rindex("}") + 1])
B = {b.get("id"): b for b in D["bloques"]}


def cambiar(cadena, viejo, nuevo):
    assert cadena.count(viejo) == 1, (viejo, cadena[:80])
    return cadena.replace(viejo, nuevo)


# 1. Título de la situación de aprendizaje
titulo = C["titulo_sa"]
B["presentacion"]["titulo"] = titulo
D["unidad"]["tituloPagina"] = "Situación de aprendizaje 1 · " + titulo

# 2. Sesión 3: María Cambrils pasa a ser la novena figura
s3 = B["s3"]
for donde in (s3, next(i for i in B["secuencia"]["items"] if i["href"] == "sesion-3.html")):
    clave = "intro" if donde is s3 else "texto"
    donde[clave] = cambiar(donde[clave], "biografías de ocho figuras", "biografías de nueve figuras")
    donde[clave] = cambiar(donde[clave], "Josefa Amar y Borbón y Adolfo Posada.", "Josefa Amar y Borbón, Adolfo Posada y María Cambrils.")

investigacion, creacion, franja = s3["actividades"][0], s3["actividades"][1], s3["actividades"][2]
assert investigacion["titulo"] == "las pensadoras de la emancipación"
investigacion["titulo"] = "Las pensadoras de la emancipación"
investigacion["contenido"][0] = cambiar(investigacion["contenido"][0], "en ocho equipos", "en nueve equipos")
lista = next(x for x in investigacion["contenido"] if isinstance(x, dict) and "lista" in x)
ultimo = lista["lista"][-1]
assert ("".join(x["texto"] for x in ultimo) if isinstance(ultimo, list) else ultimo) == "Adolfo Posada."
lista["lista"].append("María Cambrils.")
retratos = next(x for x in investigacion["contenido"] if isinstance(x, dict) and "retratos" in x)
retratos["retratos"].append({"nombre": "María Cambrils Sendra (1878-1939)", "foto": "cambrils"})
D["imagenes"]["cambrils"] = {"src": "../img/sa1/cambrils.jpg", "alt": "Fotografía de María Cambrils sentada, con un ejemplar de un periódico en la mano.",
                             "titulo": "María Cambrils Sendra", "autor": "Autor desconocido", "fecha": "Sin fecha", "licencia": "Public domain",
                             "fuente": "https://commons.wikimedia.org/wiki/File:Mar%C3%ADa_Cambrils_Sendra.jpg", "sesion": "Sesión 3",
                             "estado": "libre", "estadoTexto": "Libre", "w": 330, "h": 321}

# Actividad nueva después de la primera: lectura de un texto de María Cambrils; la autoría se desvela al final.
lectura = {"etiqueta": "Lectura", "aula": True,
           "contenido": [C["lectura_enunciado"], {"cita": C["lectura_cita"]},
                         {"plegable": "Desvelar quién lo escribió", "items": [C["lectura_solucion"]]}]}
s3["actividades"].insert(1, lectura)

creacion["titulo"] = cambiar(creacion["titulo"], "las ocho figuras", "las nueve figuras")
franja["lema"] = cambiar(franja["lema"], "las ocho figuras", "las nueve figuras")

# 3. Sesión 7: «Podcast feminista», en construcción
s6 = D["bloques"].index(B["s6"])
D["bloques"].insert(s6 + 1, {"tipo": "sesion", "id": "s7", "etiqueta": "Sesión 7", "titulo": C["sesion7_titulo"],
                             "actividades": [{"etiqueta": "En construcción"}]})
B["secuencia"]["items"].append({"num": "07", "titulo": C["sesion7_titulo"], "texto": "En construcción", "href": "sesion-7.html"})

open(RUTA, "w", encoding="utf8").write(cabecera + "window.UD_DATOS = " + json.dumps(D, ensure_ascii=False, indent=1) + ";\n")
print("cambios aplicados")
