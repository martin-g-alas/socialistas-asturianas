/*
 * Lógica genérica de las unidades didácticas. Reutilizable en cualquier UD.
 * NO contiene texto de ninguna unidad: todo se lee de window.UD_DATOS
 * (archivo js/datos-*.js, cargado antes que este).
 *
 * Dos formatos de datos:
 *   - D.bloques: página de unidad (tipos de bloque en el objeto «bloques»).
 *   - D.actividades: página de prueba de una sola sesión.
 *
 * Motor «relacionar»: elementos (imagen, texto o punto sobre una imagen) con
 * un desplegable. Botón de comprobación, reintentos ilimitados y botón de
 * solución tras N fallos. Sirve también para ordenar: las opciones son
 * posiciones y la respuesta de cada elemento, su posición.
 */
(function () {
  "use strict";

  var D = window.UD_DATOS;
  var aviso = document.getElementById("ud-aviso-datos");

  function mostrarAviso() {
    if (aviso) { aviso.hidden = false; }
  }

  if (!D || typeof D !== "object") {
    mostrarAviso();
    return;
  }

  var T = D.interfaz || {};
  var IMG = D.imagenes || {};
  var contador = 0;

  /* =========================================================
     Utilidades
     ========================================================= */

  function nuevoId(prefijo) {
    contador += 1;
    return "ud-" + prefijo + "-" + contador;
  }

  function el(etiqueta, clase, texto) {
    var nodo = document.createElement(etiqueta);
    if (clase) { nodo.className = clase; }
    if (texto !== undefined && texto !== null) { nodo.textContent = texto; }
    return nodo;
  }

  function fmt(plantilla, valores) {
    return String(plantilla || "").replace(/\{(\w+)\}/g, function (todo, clave) {
      return valores && valores[clave] !== undefined ? valores[clave] : todo;
    });
  }

  function barajar(lista) {
    var copia = lista.slice();
    for (var i = copia.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = copia[i]; copia[i] = copia[j]; copia[j] = t;
    }
    // Evita que el orden barajado coincida con la solución.
    if (copia.length > 1 && copia.every(function (x, k) { return x === lista[k]; })) {
      copia.push(copia.shift());
    }
    return copia;
  }

  function rellenar(selector, texto) {
    var nodo = document.querySelector('[data-ud="' + selector + '"]');
    if (nodo && texto) { nodo.textContent = texto; }
    return nodo;
  }

  function boton(texto, clase) {
    var b = el("button", clase || "ud-boton", texto);
    b.type = "button";
    return b;
  }

  /* Enlace externo: se abre en otra pestaña y lo dice. */
  function enlaceExterno(href, texto, clase) {
    var a = el("a", clase || "ud-enlace", texto || href);
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
    if (T.otraPestana) { a.appendChild(el("span", "ud-oculto", " " + T.otraPestana)); }
    return a;
  }

  /* Párrafo: cadena, o lista de segmentos {texto} / {texto, destacado} /
     {texto, cursiva} / {enlace, texto?}. */
  function parrafo(contenido, clase) {
    var p = el("p", clase);
    rellenarSegmentos(p, contenido);
    return p;
  }

  function rellenarSegmentos(nodo, contenido) {
    var segmentos = typeof contenido === "string" ? [{ texto: contenido }] : contenido;
    for (var i = 0; i < segmentos.length; i++) {
      var s = segmentos[i];
      if (typeof s === "string") { s = { texto: s }; }
      if (s.enlace) {
        nodo.appendChild(enlaceExterno(s.enlace, s.texto));
      } else if (s.destacado) {
        nodo.appendChild(el("strong", "ud-destacado", s.texto));
      } else if (s.cursiva) {
        nodo.appendChild(el("em", null, s.texto));
      } else {
        nodo.appendChild(document.createTextNode(s.texto));
      }
    }
  }

  /* Título en dos tonos: [fino, grueso] o cadena. */
  function tituloDosTonos(etiqueta, clase, partes) {
    var h = el(etiqueta, clase);
    if (typeof partes === "string") { h.textContent = partes; return h; }
    h.appendChild(document.createTextNode(partes[0]));
    if (partes[1]) {
      if (partes[0] && partes[2] !== "junto") { h.appendChild(document.createTextNode(" ")); }
      h.appendChild(el("span", "ud-grueso", partes[1]));
    }
    return h;
  }

  function raya(clase) {
    var r = el("div", "ud-raya" + (clase ? " " + clase : ""));
    r.setAttribute("aria-hidden", "true");
    return r;
  }

  function insignia(texto, clase) {
    return el("span", "ud-insignia" + (clase ? " " + clase : ""), texto);
  }

  /* =========================================================
     Imágenes con crédito
     ========================================================= */

  function datoImagen(ref) {
    if (!ref) { return null; }
    if (typeof ref === "object") { return ref; }
    if (IMG[ref]) { return IMG[ref]; }
    return { src: ref, alt: "" };
  }

  function textoCredito(d) {
    var partes = [];
    if (d.autor) { partes.push(d.autor); }
    if (d.fecha) { partes.push(d.fecha); }
    if (d.licencia) { partes.push(d.licencia); }
    return partes.join(" · ");
  }

  function pieCredito(d) {
    var pie = el("p", "ud-credito");
    pie.appendChild(document.createTextNode(textoCredito(d)));
    if (d.fuente) {
      pie.appendChild(document.createTextNode(" · "));
      pie.appendChild(enlaceExterno(d.fuente, T.fuente || d.fuente));
    }
    return pie;
  }

  function hueco(texto, descripcion, clase) {
    var h = el("div", "ud-pendiente" + (clase ? " " + clase : ""));
    h.setAttribute("role", "img");
    h.setAttribute("aria-label", texto + (descripcion ? ". " + descripcion : ""));
    h.appendChild(el("span", "ud-pendiente__texto", texto));
    if (descripcion) { h.appendChild(el("span", "ud-pendiente__desc", descripcion)); }
    return h;
  }

  /* Imagen, o hueco gris si falta el archivo o la licencia. */
  function imagenONada(d, altForzado, clase) {
    var pendiente = T.fotoPendiente || "";
    if (!d || d.estado === "pendiente" || !d.src) {
      return hueco(pendiente, d && d.descripcion, clase);
    }
    var img = el("img", "ud-imagen" + (clase ? " " + clase : ""));
    img.alt = altForzado !== undefined ? altForzado : (d.alt || "");
    img.loading = "lazy";
    img.decoding = "async";
    if (d.w && d.h) { img.width = d.w; img.height = d.h; }
    img.onerror = function () {
      if (img.parentNode) { img.parentNode.replaceChild(hueco(pendiente, d.descripcion, clase), img); }
    };
    img.src = d.src;
    return img;
  }

  function figura(ref, clase) {
    var d = datoImagen(ref);
    var f = el("figure", "ud-figura" + (clase ? " " + clase : ""));
    f.appendChild(imagenONada(d));
    var cap = el("figcaption", "ud-figura__pie");
    if (d && d.pie) { cap.appendChild(parrafo(d.pie, "ud-figura__texto")); }
    if (d && d.estado !== "pendiente" && (d.autor || d.licencia)) { cap.appendChild(pieCredito(d)); }
    if (cap.childNodes.length) { f.appendChild(cap); }
    return f;
  }

  /* Retrato de una persona: su ilustración en grande y su fotografía.
     Si el archivo de la ilustración aún no está, se muestra solo la foto. */
  function retrato(x) {
    var f = el("figure", "ud-retrato");
    var fila = el("div", "ud-retrato__fila");
    if (x.ilustracion) {
      var ilu = el("img", "ud-retrato__ilustracion");
      ilu.alt = fmt(T.altIlustracion, { nombre: x.nombre });
      ilu.loading = "lazy";
      ilu.onerror = function () {
        if (ilu.parentNode) { ilu.parentNode.removeChild(ilu); }
        f.classList.add("ud-retrato--sin-ilustracion");
      };
      ilu.src = x.ilustracion;
      fila.appendChild(ilu);
    } else {
      f.classList.add("ud-retrato--sin-ilustracion");
    }
    var d = datoImagen(x.foto);
    var foto = el("div", "ud-retrato__foto");
    foto.appendChild(imagenONada(d, d && d.alt));
    if (d && d.estado !== "pendiente" && (d.autor || d.licencia)) { foto.appendChild(pieCredito(d)); }
    fila.appendChild(foto);
    f.appendChild(fila);
    var cap = el("figcaption", "ud-retrato__nombre", x.nombre);
    f.appendChild(cap);
    return f;
  }

  /* =========================================================
     Contenido genérico de una actividad o bloque
     ========================================================= */

  function contenido(items, padre) {
    (items || []).forEach(function (it) {
      if (typeof it === "string" || Array.isArray(it)) {
        padre.appendChild(parrafo(it, "ud-parrafo"));
      } else if (it.titulo !== undefined && Object.keys(it).length === 1) {
        padre.appendChild(el("h4", "ud-subtitulo", it.titulo));
      } else if (it.destacado !== undefined) {
        padre.appendChild(el("p", "ud-lema", it.destacado));
      } else if (it.lista) {
        var ul = el(it.numerada ? "ol" : "ul", "ud-lista" + (it.clase ? " " + it.clase : ""));
        it.lista.forEach(function (x) {
          var li = el("li");
          rellenarSegmentos(li, x);
          ul.appendChild(li);
        });
        padre.appendChild(ul);
      } else if (it.cita) {
        var bq = el("blockquote", "ud-cita");
        it.cita.forEach(function (p) {
          var pp = el("p", "ud-parrafo");
          if (p && p.texto !== undefined && p.referencia !== undefined) {
            pp.appendChild(document.createTextNode(p.texto));
            pp.appendChild(el("span", "ud-referencia", p.referencia));
          } else {
            rellenarSegmentos(pp, p);
          }
          bq.appendChild(pp);
        });
        padre.appendChild(bq);
      } else if (it.figura) {
        padre.appendChild(figura(it.figura, it.clase));
      } else if (it.galeria) {
        var g = el("div", "ud-galeria" + (it.clase ? " " + it.clase : ""));
        it.galeria.forEach(function (ref) { g.appendChild(figura(ref, "ud-figura--galeria")); });
        padre.appendChild(g);
      } else if (it.ancla || it.href) {
        var a = el("a", "ud-enlace-flecha", it.texto);
        a.href = it.href || "#" + it.ancla;
        padre.appendChild(a);
      } else if (it.retratos) {
        var rr = el("div", "ud-retratos");
        it.retratos.forEach(function (x) { rr.appendChild(retrato(x)); });
        padre.appendChild(rr);
      } else if (it.nota) {
        padre.appendChild(el("p", "ud-nota", it.nota));
      } else if (it.plegable) {
        padre.appendChild(plegable(it.plegable, it.items));
      }
    });
    return padre;
  }

  function plegable(titulo, items) {
    var d = el("details", "ud-plegable");
    var s = el("summary", "ud-plegable__titulo");
    s.appendChild(el("span", null, titulo));
    s.appendChild(el("span", "ud-plegable__icono"));
    d.appendChild(s);
    contenido(items, d.appendChild(el("div", "ud-plegable__cuerpo")));
    return d;
  }

  /* =========================================================
     Motor «relacionar» (imágenes, textos, mapa, ordenar)
     ========================================================= */

  function motorRelacionar(act) {
    var caja = el("div", "ud-relacionar ud-relacionar--" + (act.modo || (act.elementos.some(function (e) { return e.imagen; }) ? "imagenes" : "textos")));
    var modo = act.modo || (act.elementos.some(function (e) { return e.imagen; }) ? "imagenes" : "textos");
    var maxFallos = act.intentosParaSolucion || 2;
    var elementos = act.elementos || [];
    var opciones = act.opciones || elementos.map(function (e) { return e.respuesta; });
    var orden = act.barajar ? barajar(elementos) : elementos.slice();
    var porRespuesta = {};
    elementos.forEach(function (e) { porRespuesta[e.respuesta] = e; });
    var M = act.mensajes || {};
    var plantillaEtiqueta = act.etiquetaElemento || (modo === "imagenes" ? T.altFoto : T.etiquetaTexto);

    // Modo «mapa»: imagen base con puntos numerados encima.
    var marcadores = [];
    if (modo === "mapa") {
      var dm = datoImagen(act.mapa);
      var lienzo = el("figure", "ud-mapa");
      var marco = el("div", "ud-mapa__marco");
      marco.appendChild(imagenONada(dm, dm && dm.alt, "ud-mapa__imagen"));
      orden.forEach(function (dato, i) {
        var m = el("span", "ud-mapa__punto", String(i + 1));
        m.setAttribute("aria-hidden", "true");
        m.style.left = dato.punto.x + "%";
        m.style.top = dato.punto.y + "%";
        marco.appendChild(m);
        marcadores.push(m);
      });
      lienzo.appendChild(marco);
      var capm = el("figcaption", "ud-figura__pie");
      if (dm && dm.estado !== "pendiente") { capm.appendChild(pieCredito(dm)); }
      if (act.notaMapa) { capm.appendChild(parrafo(act.notaMapa, "ud-credito")); }
      lienzo.appendChild(capm);
      caja.appendChild(lienzo);
    }

    var rejilla = el(modo === "lista" ? "ol" : "div", "ud-rejilla ud-rejilla--" + modo);
    var piezas = [];

    orden.forEach(function (dato, indice) {
      var n = indice + 1;
      var pieza = { dato: dato, fallos: 0, estado: "pendiente", nodo: el(modo === "lista" ? "li" : "div", "ud-pieza") };
      var etiquetaTexto = fmt(plantillaEtiqueta, { n: n });
      if (marcadores[indice]) { pieza.marcador = marcadores[indice]; }

      if (modo === "imagenes") {
        var media = el("div", "ud-pieza__media");
        var di = datoImagen(dato.imagen);
        var nodoImg = imagenONada(di, etiquetaTexto, "ud-pieza__foto");
        media.appendChild(nodoImg);
        pieza.img = nodoImg.tagName === "IMG" ? nodoImg : null;
        pieza.datoImagen = di;
        pieza.nodo.appendChild(media);
      } else if (modo === "textos" || modo === "lista") {
        var bq = el(modo === "lista" ? "div" : "blockquote", modo === "lista" ? "ud-pieza__elemento" : "ud-pieza__texto");
        (dato.parrafos || [dato.texto]).forEach(function (p) { bq.appendChild(parrafo(p, "ud-parrafo")); });
        pieza.nodo.appendChild(bq);
      }

      var idSelect = nuevoId("eleccion");
      var idFeedback = nuevoId("feedback");
      var control = el("div", "ud-pieza__control");
      var etiqueta = el("label", "ud-pieza__etiqueta", etiquetaTexto);
      etiqueta.htmlFor = idSelect;
      var select = el("select", "ud-select");
      select.id = idSelect;
      select.setAttribute("aria-describedby", idFeedback);
      select.appendChild(new Option(act.textoElige || (modo === "imagenes" ? T.elige : T.eligeTexto), ""));
      opciones.forEach(function (o) { select.appendChild(new Option(o, o)); });
      pieza.select = select;

      var fb = el("p", "ud-pieza__feedback");
      fb.id = idFeedback;
      fb.tabIndex = -1;
      pieza.feedback = fb;

      var revelado = el("div", "ud-pieza__revelado");
      revelado.hidden = true;
      pieza.revelado = revelado;

      var comparar = el("div", "ud-pieza__comparar");
      comparar.hidden = true;
      pieza.comparar = comparar;

      var botonSol = boton(T.verSolucion, "ud-boton ud-boton--secundario");
      botonSol.hidden = true;
      pieza.botonSolucion = botonSol;

      control.appendChild(etiqueta);
      control.appendChild(select);
      control.appendChild(fb);
      control.appendChild(revelado);
      control.appendChild(comparar);
      control.appendChild(botonSol);
      pieza.nodo.appendChild(control);

      select.addEventListener("change", function () {
        if (pieza.estado !== "pendiente") { return; }
        pieza.nodo.classList.remove("ud-error");
        if (pieza.marcador) { pieza.marcador.classList.remove("ud-error"); }
        fb.textContent = "";
        comparar.hidden = true;
      });

      botonSol.addEventListener("click", function () {
        resolver(pieza, "solucion");
        fb.focus();
        anunciar();
      });

      piezas.push(pieza);
      rejilla.appendChild(pieza.nodo);
    });

    caja.appendChild(rejilla);

    var acciones = el("div", "ud-acciones");
    var botonComprobar = boton(T.comprobar);
    acciones.appendChild(botonComprobar);
    caja.appendChild(acciones);

    var vivo = el("p", "ud-vivo");
    vivo.setAttribute("role", "status");
    vivo.setAttribute("aria-live", "polite");
    caja.appendChild(vivo);

    var final = el("div", "ud-al-completar");
    final.hidden = true;
    if (act.alCompletar) {
      if (T.alCompletarTitulo) { final.appendChild(el("p", "ud-al-completar__titulo", T.alCompletarTitulo)); }
      contenido(act.alCompletar, final);
    }
    caja.appendChild(final);

    function marcar(pieza, icono, texto) {
      pieza.feedback.textContent = "";
      pieza.feedback.appendChild(el("span", "ud-icono", icono));
      pieza.feedback.appendChild(document.createTextNode(" " + texto));
    }

    function resolver(pieza, estado) {
      var nombre = pieza.dato.respuesta;
      pieza.estado = estado;
      pieza.select.value = nombre;
      pieza.select.disabled = true;
      pieza.botonSolucion.hidden = true;
      pieza.comparar.hidden = true;
      pieza.nodo.classList.remove("ud-error");
      pieza.nodo.classList.add(estado === "ok" ? "ud-ok" : "ud-solucion");
      if (pieza.marcador) {
        pieza.marcador.classList.remove("ud-error");
        pieza.marcador.classList.add(estado === "ok" ? "ud-ok" : "ud-solucion");
      }
      marcar(pieza, estado === "ok" ? T.iconoAcierto : T.iconoSolucion,
        fmt(estado === "ok" ? (M.correcto || T.correcto) : (M.solucion || T.solucion), { nombre: nombre }));
      if (pieza.dato.revelar) {
        pieza.revelado.textContent = "";
        contenido(pieza.dato.revelar, pieza.revelado);
        pieza.revelado.hidden = false;
      }
      if (pieza.img) {
        pieza.img.alt = fmt(act.altResuelta || T.altFotoResuelta, { nombre: nombre });
        if (pieza.datoImagen && (pieza.datoImagen.autor || pieza.datoImagen.licencia)) {
          pieza.revelado.appendChild(pieCredito(pieza.datoImagen));
          pieza.revelado.hidden = false;
        }
      }
    }

    function anunciar() {
      var hechas = piezas.filter(function (p) { return p.estado !== "pendiente"; }).length;
      var aciertos = piezas.filter(function (p) { return p.estado === "ok"; }).length;
      var completa = hechas === piezas.length;
      vivo.textContent = fmt(completa ? T.completado : T.resumen, { aciertos: completa ? aciertos : hechas, total: piezas.length });
      if (completa) {
        botonComprobar.disabled = true;
        if (act.alCompletar) { final.hidden = false; }
      }
    }

    botonComprobar.addEventListener("click", function () {
      piezas.forEach(function (pieza) {
        if (pieza.estado !== "pendiente") { return; }
        var valor = pieza.select.value;
        if (!valor) {
          pieza.nodo.classList.remove("ud-error");
          pieza.feedback.textContent = T.sinRespuesta;
          return;
        }
        if (valor === pieza.dato.respuesta) {
          resolver(pieza, "ok");
          return;
        }
        pieza.fallos += 1;
        pieza.nodo.classList.add("ud-error");
        if (pieza.marcador) { pieza.marcador.classList.add("ud-error"); }
        marcar(pieza, T.iconoError, fmt(M.noEs || T.noEs, { nombre: valor }));
        var elegido = porRespuesta[valor];
        if (act.compararAlFallar && elegido && (elegido.comparar || elegido.parrafos || elegido.texto)) {
          pieza.comparar.textContent = "";
          pieza.comparar.appendChild(el("p", "ud-pieza__comparar-titulo", fmt(M.textoElegido || T.textoElegido, { nombre: valor })));
          var cita = el("blockquote", "ud-pieza__texto");
          (elegido.comparar || elegido.parrafos || [elegido.texto]).forEach(function (p) { cita.appendChild(parrafo(p, "ud-parrafo")); });
          pieza.comparar.appendChild(cita);
          pieza.comparar.hidden = false;
        }
        if (pieza.fallos >= maxFallos) { pieza.botonSolucion.hidden = false; }
      });
      anunciar();
    });

    return caja;
  }

  /* =========================================================
     FORMATO «BLOQUES»: página de unidad
     ========================================================= */

  function cabeceraSeccion(b, oscura) {
    var c = el("div", "ud-sec__cabecera");
    if (b.etiqueta) { c.appendChild(el("p", "ud-antetitulo", b.etiqueta)); }
    c.appendChild(tituloDosTonos(b.nivel || "h2", b.etiqueta ? "ud-titulo" : "ud-titulo-linea", b.titulo));
    if (b.etiqueta) { c.appendChild(raya(oscura ? "ud-raya--clara" : "")); }
    if (b.subtitulo) { c.appendChild(parrafo(b.subtitulo, "ud-entradilla")); }
    return c;
  }

  function seccion(b, clase) {
    var s = el("section", "ud-sec" + (clase ? " " + clase : ""));
    if (b.id) { s.id = b.id; }
    if (b.oscura) { s.classList.add("ud-sec--oscura"); }
    if (b.gris) { s.classList.add("ud-sec--gris"); }
    return s;
  }

  var bloques = {

    portada: function (b) {
      var s = seccion(b, "ud-portada");
      var izq = el("div", "ud-portada__imagen");
      izq.appendChild(figura(b.imagen, "ud-figura--portada ud-marco"));
      var der = el("div", "ud-portada__texto");
      der.appendChild(el("p", "ud-antetitulo", b.etiqueta));
      der.appendChild(tituloDosTonos("h1", "ud-portada__titulo", b.titulo));
      der.appendChild(raya());
      (b.datos || []).forEach(function (d) {
        var p = el("p", "ud-portada__dato");
        p.appendChild(el("span", "ud-portada__clave", d.clave));
        p.appendChild(el("span", "ud-portada__valor", d.valor));
        der.appendChild(p);
      });
      s.appendChild(izq);
      s.appendChild(der);
      return s;
    },

    cifras: function (b) {
      var s = seccion(b, "ud-cifras");
      if (b.etiquetaAccesible) { s.setAttribute("aria-label", b.etiquetaAccesible); }
      b.items.forEach(function (c) {
        var d = el("div", "ud-cifra");
        d.appendChild(el("p", "ud-cifra__valor", c.valor));
        d.appendChild(el("p", "ud-cifra__etiqueta", c.etiqueta));
        if (c.nota) { d.appendChild(el("p", "ud-cifra__nota", c.nota)); }
        s.appendChild(d);
      });
      return s;
    },

    objetivos: function (b) {
      var s = seccion(b, "ud-sec--pad");
      s.appendChild(cabeceraSeccion(b));
      if (b.intro) { s.appendChild(parrafo(b.intro, "ud-entradilla")); }
      var g = el("ol", "ud-objetivos");
      b.items.forEach(function (o, i) {
        var li = el("li", "ud-objetivo");
        li.appendChild(el("span", "ud-objetivo__num", (i < 9 ? "0" : "") + (i + 1)));
        li.appendChild(el("span", "ud-objetivo__texto", o));
        g.appendChild(li);
      });
      s.appendChild(g);
      return s;
    },

    rejillaSesiones: function (b) {
      var s = seccion(b, "ud-sec--pad");
      s.appendChild(cabeceraSeccion(b));
      var g = el("div", "ud-rejilla-sesiones");
      b.items.forEach(function (it) {
        var a = el("a", "ud-tarjeta-sesion");
        a.href = it.href || "#" + it.ancla;
        a.appendChild(el("span", "ud-tarjeta-sesion__num", it.num));
        a.appendChild(el("span", "ud-tarjeta-sesion__titulo", it.titulo));
        g.appendChild(a);
      });
      s.appendChild(g);
      return s;
    },

    sesion: function (b) {
      var s = seccion(b, "ud-sesion");
      var cab = el("div", "ud-sesion__cabecera");
      cab.appendChild(el("p", "ud-antetitulo", b.etiqueta));
      cab.appendChild(tituloDosTonos("h2", "ud-titulo", b.titulo));
      cab.appendChild(raya());
      s.appendChild(cab);
      (b.actividades || []).forEach(function (a) { s.appendChild(actividad(a)); });
      return s;
    },

    bandaMuseo: function (b) {
      var s = seccion(b, "ud-sec--pad ud-sec--oscura");
      s.appendChild(cabeceraSeccion(b, true));
      var cuerpo = el("div", "ud-columna-lectura");
      contenido(b.contenido, cuerpo);
      s.appendChild(cuerpo);
      if (b.salas) { s.appendChild(salas(b.salas)); }
      (b.despues || []).forEach(function (bloque) { s.appendChild(subbloque(bloque)); });
      return s;
    },

    podcast: function (b) {
      var s = seccion(b, "ud-sec--pad ud-podcast");
      var izq = el("div", "ud-podcast__intro");
      izq.appendChild(el("p", "ud-antetitulo", b.etiqueta));
      izq.appendChild(tituloDosTonos("h2", "ud-titulo", b.titulo));
      izq.appendChild(raya());
      contenido(b.contenido, izq);
      var der = el("ol", "ud-episodios");
      b.episodios.forEach(function (e, i) {
        var li = el("li", "ud-episodio");
        li.appendChild(el("span", "ud-episodio__num", (i < 9 ? "0" : "") + (i + 1)));
        var t = el("div", "ud-episodio__texto");
        t.appendChild(el("p", "ud-episodio__nombre", e.nombre));
        t.appendChild(el("p", "ud-episodio__estado", e.estado || T.audioPendiente));
        li.appendChild(t);
        var bt = boton("▶ " + T.escuchar, "ud-boton");
        bt.disabled = !e.audio;
        if (!e.audio) { bt.setAttribute("aria-label", T.escuchar + " · " + e.nombre + " · " + T.audioPendiente); }
        li.appendChild(bt);
        der.appendChild(li);
      });
      s.appendChild(izq);
      s.appendChild(der);
      return s;
    },

    evaluacion: function (b) {
      var s = seccion(b, "ud-sec--pad ud-sec--gris");
      s.appendChild(cabeceraSeccion(b));
      if (b.intro) { s.appendChild(el("h3", "ud-subtitulo-seccion", b.intro)); }
      var g = el("div", "ud-evaluacion");
      b.items.forEach(function (it) {
        var d = el("div", "ud-instrumento");
        d.appendChild(el("p", "ud-instrumento__peso", it.peso));
        d.appendChild(el("h4", "ud-instrumento__nombre", it.nombre));
        d.appendChild(plegable(it.titulo, it.criterios));
        g.appendChild(d);
      });
      s.appendChild(g);
      return s;
    },

    ampliacion: function (b) {
      var s = seccion(b, "ud-sec--pad");
      s.appendChild(cabeceraSeccion(b));
      var g = el("div", "ud-ampliacion");
      b.items.forEach(function (it) {
        var d = el("div", "ud-ampliacion__item");
        if (it.icono && ICONOS[it.icono]) { d.appendChild(icono(it.icono)); }
        var t = el("div", "ud-ampliacion__texto");
        t.appendChild(el("h3", "ud-ampliacion__titulo", it.titulo));
        if (it.lema) { t.appendChild(el("p", "ud-lema", it.lema)); }
        contenido(it.contenido, t);
        d.appendChild(t);
        g.appendChild(d);
      });
      s.appendChild(g);
      (b.despues || []).forEach(function (bloque) { s.appendChild(subbloque(bloque)); });
      return s;
    },

    recursos: function (b) {
      var s = seccion(b, "ud-sec--pad");
      s.appendChild(cabeceraSeccion(b));
      var g = el("div", "ud-recursos");
      b.columnas.forEach(function (c) {
        var d = el("div", "ud-recursos__col");
        d.appendChild(el("h3", "ud-recursos__titulo", c.titulo));
        contenido(c.contenido, d);
        g.appendChild(d);
      });
      s.appendChild(g);
      (b.despues || []).forEach(function (bloque) { s.appendChild(subbloque(bloque)); });
      return s;
    },

    creditos: function (b) {
      var s = seccion(b, "ud-sec--pad ud-sec--gris");
      s.appendChild(cabeceraSeccion(b));
      var nota = el("div", "ud-columna-lectura");
      contenido(b.nota, nota);
      s.appendChild(nota);
      if (b.tablaTitulo) { s.appendChild(el("h3", "ud-subtitulo-seccion", b.tablaTitulo)); }
      s.appendChild(tablaCreditos(b.columnas));
      if (b.despues) { contenido(b.despues, s); }
      return s;
    }
  };

  /* Sub-bloques dentro de una sección. */
  function subbloque(b) {
    var d = el("div", "ud-subbloque" + (b.clase ? " " + b.clase : ""));
    if (b.id) { d.id = b.id; }
    if (b.titulo) { d.appendChild(tituloDosTonos("h3", "ud-subbloque__titulo", b.titulo)); }
    if (b.lema) { d.appendChild(el("p", "ud-lema", b.lema)); }
    if (b.contenido) { contenido(b.contenido, d.appendChild(el("div", "ud-columna-lectura"))); }
    if (b.salas) { d.appendChild(salas(b.salas)); }
    if (b.visor) { d.appendChild(visor(b.visor)); }
    (b.actividades || []).forEach(function (a) { d.appendChild(actividad(a)); });
    (b.despues || []).forEach(function (x) { d.appendChild(subbloque(x)); });
    return d;
  }

  function salas(lista) {
    var g = el("div", "ud-salas");
    lista.forEach(function (sala) {
      var d = el("div", "ud-sala");
      d.appendChild(el("p", "ud-sala__num", sala.num));
      d.appendChild(el("p", "ud-sala__titulo", sala.titulo));
      if (sala.contenido) { contenido(sala.contenido, d); }
      g.appendChild(d);
    });
    return g;
  }

  /* =========================================================
     Actividad (tarjeta) dentro de una sesión
     ========================================================= */

  function actividad(a) {
    var art = el("article", "ud-actividad" + (a.oscura ? " ud-actividad--oscura" : ""));
    if (a.id) { art.id = a.id; }
    var idTit = nuevoId("act");
    art.setAttribute("aria-labelledby", idTit);
    var cab = el("div", "ud-actividad__cabecera");
    var h = el("h3", "ud-actividad__etiqueta", a.etiqueta);
    h.id = idTit;
    cab.appendChild(h);
    if (a.aula) { cab.appendChild(insignia(T.enElAula, "ud-insignia--aula")); }
    if (a.estado) { cab.appendChild(insignia(a.estado, "ud-insignia--estado")); }
    art.appendChild(cab);

    var cuerpo = el("div", "ud-actividad__cuerpo");
    if (a.lema) { cuerpo.appendChild(el("p", "ud-lema", a.lema)); }
    contenido(a.contenido, cuerpo);
    art.appendChild(cuerpo);
    if (a.salas) { art.appendChild(salas(a.salas)); }

    if (a.interactiva) {
      try {
        art.appendChild(motorRelacionar(a.interactiva));
      } catch (e) {
        mostrarAviso();
      }
    }
    if (a.despues) { contenido(a.despues, art.appendChild(el("div", "ud-actividad__despues"))); }
    return art;
  }

  /* =========================================================
     Visor de páginas de prensa
     ========================================================= */

  function visor(v) {
    var caja = el("div", "ud-visor");
    var lateral = el("div", "ud-visor__lateral");
    var vista = el("div", "ud-visor__vista");
    var estado = { pub: 0, pag: 0 };

    lateral.appendChild(el("p", "ud-antetitulo", v.etiqueta));
    var titulo = el("h4", "ud-visor__titulo");
    lateral.appendChild(titulo);
    var datos = el("p", "ud-visor__datos");
    datos.setAttribute("aria-live", "polite");
    lateral.appendChild(datos);

    // Selector de número.
    var selPub = el("div", "ud-visor__numeros");
    selPub.setAttribute("role", "group");
    selPub.setAttribute("aria-label", v.etiquetaNumeros);
    var botonesPub = v.publicaciones.map(function (p, i) {
      var b = boton(p.corto, "ud-boton ud-boton--claro");
      b.addEventListener("click", function () { estado.pub = i; estado.pag = 0; pintar(); });
      selPub.appendChild(b);
      return b;
    });
    lateral.appendChild(selPub);

    var nav = el("div", "ud-visor__nav");
    var ant = boton("← " + T.anterior, "ud-boton ud-boton--claro");
    var sig = boton(T.siguiente + " →", "ud-boton ud-boton--claro");
    nav.appendChild(ant);
    nav.appendChild(sig);
    lateral.appendChild(nav);

    var minis = el("div", "ud-visor__minis");
    minis.setAttribute("role", "group");
    minis.setAttribute("aria-label", v.etiquetaPaginas);
    lateral.appendChild(minis);

    var abrir = el("a", "ud-visor__abrir");
    abrir.target = "_blank";
    abrir.rel = "noopener";
    lateral.appendChild(abrir);
    if (v.nota) { lateral.appendChild(parrafo(v.nota, "ud-visor__nota")); }

    var imagen = el("img", "ud-visor__imagen");
    imagen.decoding = "async";
    vista.appendChild(imagen);

    ant.addEventListener("click", function () { if (estado.pag > 0) { estado.pag -= 1; pintar(); } });
    sig.addEventListener("click", function () {
      if (estado.pag < v.publicaciones[estado.pub].paginas.length - 1) { estado.pag += 1; pintar(); }
    });

    function pintar() {
      var p = v.publicaciones[estado.pub];
      var pg = p.paginas[estado.pag];
      titulo.textContent = p.titulo;
      datos.textContent = fmt(T.paginaDe, { datos: p.datos, n: estado.pag + 1, total: p.paginas.length });
      if (pg.w && pg.h) { imagen.width = pg.w; imagen.height = pg.h; }
      imagen.src = pg.src;
      imagen.alt = fmt(T.altPagina, { titulo: p.titulo, datos: p.datos, n: estado.pag + 1 });
      abrir.href = pg.src;
      abrir.textContent = T.abrirPagina + " ↗";
      ant.disabled = estado.pag === 0;
      sig.disabled = estado.pag === p.paginas.length - 1;
      botonesPub.forEach(function (b, i) { b.setAttribute("aria-pressed", i === estado.pub ? "true" : "false"); });
      minis.textContent = "";
      p.paginas.forEach(function (x, i) {
        var b = el("button", "ud-visor__mini");
        b.type = "button";
        b.setAttribute("aria-label", fmt(T.irAPagina, { n: i + 1 }));
        if (i === estado.pag) { b.setAttribute("aria-current", "true"); }
        var im = el("img");
        im.src = x.mini;
        im.alt = "";
        b.appendChild(im);
        b.addEventListener("click", function () { estado.pag = i; pintar(); b.focus(); });
        minis.appendChild(b);
      });
    }

    caja.appendChild(lateral);
    caja.appendChild(vista);
    pintar();
    return caja;
  }

  /* =========================================================
     Tabla de créditos (desde D.imagenes)
     ========================================================= */

  function tablaCreditos(columnas) {
    var envoltorio = el("div", "ud-tabla-caja");
    envoltorio.tabIndex = 0;
    envoltorio.setAttribute("role", "region");
    envoltorio.setAttribute("aria-label", columnas.etiqueta);
    var t = el("table", "ud-tabla");
    var thead = el("thead");
    var tr = el("tr");
    columnas.cabeceras.forEach(function (c) { var th = el("th", null, c); th.scope = "col"; tr.appendChild(th); });
    thead.appendChild(tr);
    t.appendChild(thead);
    var tb = el("tbody");
    Object.keys(IMG).forEach(function (k) {
      var d = IMG[k];
      if (d.sinCredito) { return; }
      var fila = el("tr");
      fila.appendChild(el("td", null, d.titulo || d.descripcion || k));
      fila.appendChild(el("td", null, [d.autor, d.fecha].filter(Boolean).join(" · ")));
      fila.appendChild(el("td", null, d.licencia || ""));
      var tdf = el("td");
      if (d.fuente) { tdf.appendChild(enlaceExterno(d.fuente, T.fuente)); }
      fila.appendChild(tdf);
      fila.appendChild(el("td", null, d.sesion || ""));
      fila.appendChild(el("td", "ud-tabla__estado", d.estadoTexto || ""));
      [].forEach.call(fila.children, function (td, i) { td.setAttribute("data-etiqueta", columnas.cabeceras[i]); });
      tb.appendChild(fila);
    });
    t.appendChild(tb);
    envoltorio.appendChild(t);
    return envoltorio;
  }

  /* Iconos de línea (decorativos). */
  var ICONOS = {
    comic: '<rect x="3" y="4" width="8" height="7"></rect><rect x="13" y="4" width="8" height="7"></rect><rect x="3" y="13" width="18" height="7"></rect>',
    podcast: '<rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5 11a7 7 0 0 0 14 0"></path><path d="M12 18v3"></path>',
    escape: '<rect x="5" y="11" width="14" height="10"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path>',
    galeria: '<rect x="3" y="5" width="18" height="14"></rect><path d="M3 16l5-5 4 4 3-3 6 6"></path>'
  };

  function icono(nombre) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("width", "32");
    svg.setAttribute("height", "32");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.3");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "ud-icono-linea");
    svg.innerHTML = ICONOS[nombre];
    return svg;
  }

  /* Página de una sesión: ilustración arriba, contenidos y navegación. */
  function iniciarSesion(cont, n) {
    var sesiones = D.bloques.filter(function (b) { return b.tipo === "sesion"; });
    var i = sesiones.map(function (b) { return b.id; }).indexOf("s" + n);
    if (i < 0) { mostrarAviso(); return; }
    var b = sesiones[i];
    document.title = b.etiqueta + " · " + b.titulo + " · " + (D.unidad.tituloPagina || "");
    var exterior = el("div", "ud-sesion-ilustracion");
    var cab = el("figure", "ud-marco");
    exterior.appendChild(cab);
    var ilu = el("img", "ud-sesion-ilustracion__imagen");
    ilu.alt = b.ilustracionAlt || "";
    function pendiente() {
      cab.textContent = "";
      exterior.classList.add("ud-sesion-ilustracion--pendiente");
      cab.appendChild(el("span", "ud-pendiente__texto", T.ilustracionPendiente));
    }
    var dIlu = b.ilustracionImagen ? datoImagen(b.ilustracionImagen) : null;
    if (dIlu && dIlu.src) {
      ilu.alt = dIlu.alt || "";
      if (dIlu.w && dIlu.h) { ilu.width = dIlu.w; ilu.height = dIlu.h; }
      ilu.onerror = pendiente;
      ilu.src = dIlu.src;
      cab.appendChild(ilu);
      if (dIlu.autor || dIlu.licencia) {
        var cr = pieCredito(dIlu);
        cr.className = "ud-sesion-ilustracion__credito";
        cab.appendChild(cr);
      }
    } else if (b.ilustracion) {
      ilu.onerror = pendiente;
      ilu.src = b.ilustracion;
      cab.appendChild(ilu);
    } else {
      pendiente();
    }
    cont.appendChild(exterior);
    cont.appendChild(bloques.sesion(b));
    // Bloques que la unidad sitúa al final de esta sesión (p. ej., el producto final).
    D.bloques.forEach(function (x) {
      if (x.trasSesion === Number(n) && bloques[x.tipo]) { cont.appendChild(bloques[x.tipo](x)); }
    });
    // La sesión se abre siempre por arriba, empezando por su imagen.
    if ("scrollRestoration" in history) { history.scrollRestoration = "manual"; }
    if (!location.hash) { window.scrollTo(0, 0); }
  }

  function iniciarBloques() {
    var cont = document.querySelector('[data-ud="pagina"]');
    if (!cont) { return; }
    var n = document.body.getAttribute("data-ud-sesion");
    if (n) { iniciarSesion(cont, n); return; }
    var vista = document.body.getAttribute("data-ud-vista") || "unidad";
    if (vista === "unidad" && D.unidad && D.unidad.tituloPagina) { document.title = D.unidad.tituloPagina; }
    D.bloques.forEach(function (b) {
      if (b.tipo === "sesion" || b.trasSesion) { return; }
      if ((b.pagina || "unidad") !== vista) { return; }
      var f = bloques[b.tipo];
      if (!f) { mostrarAviso(); return; }
      try {
        cont.appendChild(f(b));
      } catch (e) {
        mostrarAviso();
      }
    });
  }

  /* =========================================================
     FORMATO «ACTIVIDADES»: página de prueba de una sesión
     ========================================================= */

  function pintarCabeceraPrueba() {
    var u = D.unidad || {};
    rellenar("meta", (u.meta || []).join(" · "));
    rellenar("titulo", u.titulo);
    rellenar("pie", D.pie);
    if (D.sesion && u.titulo) {
      document.title = D.sesion.titulo + " · " + u.titulo;
    }
  }

  function pintarSesionesPrueba() {
    var nav = document.querySelector('[data-ud="sesiones"]');
    var s = D.sesiones;
    if (!nav || !s) { return; }
    var titulo = el("h2", "ud-sesiones__titulo", s.tituloIndice);
    titulo.id = "ud-sesiones-titulo";
    nav.appendChild(titulo);
    var ol = el("ol", "ud-sesiones__lista");
    for (var n = 1; n <= s.total; n++) {
      var li = el("li", "ud-sesiones__item");
      var nombre = s.etiqueta + " " + n;
      if (n === s.actual) {
        var a = el("a", "ud-sesiones__enlace", nombre);
        a.href = "#ud-sesion";
        a.setAttribute("aria-current", "page");
        li.appendChild(a);
      } else {
        var span = el("span", "ud-sesiones__pendiente", nombre);
        span.appendChild(el("span", "ud-oculto", " (" + s.pendiente + ")"));
        li.appendChild(span);
      }
      ol.appendChild(li);
    }
    nav.appendChild(ol);
  }

  function pintarSesionPrueba() {
    var h = document.querySelector('[data-ud="sesion"]');
    if (!h || !D.sesion) { return; }
    h.id = "ud-sesion";
    h.tabIndex = -1;
    h.appendChild(el("span", "ud-sesion__etiqueta", D.sesion.etiqueta));
    h.appendChild(document.createTextNode(" "));
    h.appendChild(el("span", "ud-sesion__nombre", D.sesion.titulo));
  }

  function enunciadoPrueba(bloquesTexto) {
    var caja = el("div", "ud-tarjeta__enunciado");
    (bloquesTexto || []).forEach(function (b) {
      if (b.lista) { contenido([{ lista: b.lista }], caja); }
      else { caja.appendChild(parrafo(b.texto !== undefined ? b.texto : b, "ud-parrafo")); }
    });
    return caja;
  }

  function tarjetaPrueba(act) {
    var sec = el("section", "ud-tarjeta ud-tarjeta--" + act.tipo);
    var idTitulo = nuevoId("titulo");
    sec.setAttribute("aria-labelledby", idTitulo);
    var cab = el("div", "ud-tarjeta__cabecera");
    var h = el("h3", "ud-tarjeta__etiqueta");
    h.id = idTitulo;
    h.appendChild(el("span", "ud-tarjeta__numero", String(act.numero)));
    var partes = [act.tipoEtiqueta];
    if (act.subtitulo) { partes.push(act.subtitulo); }
    h.appendChild(el("span", "ud-tarjeta__tipo", partes.join(" · ")));
    cab.appendChild(h);
    if (act.etiquetaAula) { cab.appendChild(insignia(act.etiquetaAula)); }
    sec.appendChild(cab);
    sec.appendChild(enunciadoPrueba(act.enunciado));
    return sec;
  }

  function recuadroPrueba(d) {
    var caja = el("div", "ud-recuadro");
    var cab = el("div", "ud-recuadro__cabecera");
    cab.appendChild(el("h4", "ud-recuadro__titulo", d.titulo));
    if (d.etiqueta) { cab.appendChild(insignia(d.etiqueta)); }
    caja.appendChild(cab);
    if (d.lista) { contenido([{ lista: d.lista }], caja); }
    return caja;
  }

  var tiposPrueba = {
    relacionar: function (act) {
      var sec = tarjetaPrueba(act);
      sec.appendChild(motorRelacionar(act));
      if (act.despues) { sec.appendChild(recuadroPrueba(act.despues)); }
      return sec;
    },
    lectura: function (act) {
      var sec = tarjetaPrueba(act);
      (act.textos || []).forEach(function (t) {
        var art = el("article", "ud-lectura");
        if (t.titulo) { art.appendChild(el("h4", "ud-lectura__titulo", t.titulo)); }
        (t.parrafos || []).forEach(function (p) { art.appendChild(parrafo(p, "ud-parrafo")); });
        if (t.cita && t.cita.length) { contenido([{ cita: t.cita }], art); }
        sec.appendChild(art);
      });
      if (act.despues) { sec.appendChild(recuadroPrueba(act.despues)); }
      return sec;
    },
    aula: function (act) { return tarjetaPrueba(act); }
  };

  function iniciarPrueba() {
    pintarCabeceraPrueba();
    pintarSesionesPrueba();
    pintarSesionPrueba();
    var contenedor = document.querySelector('[data-ud="actividades"]');
    if (!contenedor) { return; }
    (D.actividades || []).forEach(function (act) {
      var pintar = tiposPrueba[act.tipo];
      if (!pintar) { mostrarAviso(); return; }
      try {
        contenedor.appendChild(pintar(act));
      } catch (e) {
        mostrarAviso();
      }
    });
  }

  if (D.bloques) { iniciarBloques(); } else { iniciarPrueba(); }
})();
