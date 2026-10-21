/*
 * Menú principal común a todas las unidades.
 * - Menos de 768 px: se pliega en un botón (aria-expanded / aria-controls).
 * - Submenú «Unidades»: botón desplegable, válido en escritorio y en móvil.
 * - Escape cierra (primero el submenú, luego el menú) y devuelve el foco.
 * - Los enlaces con aria-disabled="true" no navegan.
 * - Marca la unidad actual con aria-current="page" según window.UD_DATOS.
 * No contiene textos de ninguna unidad.
 */
(function () {
  "use strict";

  var nav = document.querySelector(".ud-menu");
  if (!nav) { return; }

  var botonMenu = nav.querySelector(".ud-menu__boton");
  var botonesSub = nav.querySelectorAll(".ud-menu__desplegar");

  function abrir(boton, abierto) {
    var destino = document.getElementById(boton.getAttribute("aria-controls"));
    boton.setAttribute("aria-expanded", abierto ? "true" : "false");
    if (destino) { destino.classList.toggle("ud-abierto", abierto); }
  }

  function estaAbierto(boton) {
    return boton.getAttribute("aria-expanded") === "true";
  }

  function cerrarSubmenus() {
    for (var i = 0; i < botonesSub.length; i++) { abrir(botonesSub[i], false); }
  }

  // Unidad actual (si hay datos).
  var datos = window.UD_DATOS;
  if (datos && datos.unidad && datos.unidad.numero) {
    var actual = nav.querySelector('[data-ud-unidad="' + datos.unidad.numero + '"]');
    if (actual) {
      actual.removeAttribute("aria-disabled");
      actual.setAttribute("aria-current", "page");
    }
  }

  botonMenu.addEventListener("click", function () {
    var abierto = !estaAbierto(botonMenu);
    abrir(botonMenu, abierto);
    if (!abierto) { cerrarSubmenus(); }
  });

  for (var i = 0; i < botonesSub.length; i++) {
    botonesSub[i].addEventListener("click", function (evento) {
      var boton = evento.currentTarget;
      var abierto = !estaAbierto(boton);
      cerrarSubmenus();
      abrir(boton, abierto);
    });
  }

  // Enlaces pendientes y la página actual: no navegan.
  nav.addEventListener("click", function (evento) {
    var enlace = evento.target.closest("a");
    if (enlace && (enlace.getAttribute("aria-disabled") === "true" || enlace.getAttribute("href") === "#")) {
      evento.preventDefault();
      return;
    }
    // Enlace a un apartado de la misma página: se cierra el menú.
    var mismaPagina = enlace && enlace.hash && enlace.pathname === location.pathname;
    if (enlace && (enlace.getAttribute("href").charAt(0) === "#" || mismaPagina)) {
      var destino = document.getElementById(enlace.hash.slice(1));
      cerrarSubmenus();
      abrir(botonMenu, false);
      if (destino) {
        // Primero se cierra el menú y después se baja: así el apartado queda arriba.
        evento.preventDefault();
        if (!destino.hasAttribute("tabindex")) { destino.setAttribute("tabindex", "-1"); }
        destino.scrollIntoView();
        destino.focus({ preventScroll: true });
        if (window.history && history.pushState) { history.pushState(null, "", "#" + destino.id); }
      }
    }
  });

  document.addEventListener("keydown", function (evento) {
    if (evento.key !== "Escape" && evento.key !== "Esc") { return; }
    for (var i = 0; i < botonesSub.length; i++) {
      if (estaAbierto(botonesSub[i])) {
        abrir(botonesSub[i], false);
        botonesSub[i].focus();
        return;
      }
    }
    if (estaAbierto(botonMenu)) {
      abrir(botonMenu, false);
      botonMenu.focus();
    }
  });

  // Clic o toque fuera del menú: se cierra todo.
  document.addEventListener("click", function (evento) {
    if (nav.contains(evento.target)) { return; }
    cerrarSubmenus();
    abrir(botonMenu, false);
  });

  // El foco sale del menú con el tabulador: se cierran los submenús.
  nav.addEventListener("focusout", function (evento) {
    if (evento.relatedTarget && !nav.contains(evento.relatedTarget)) {
      cerrarSubmenus();
      abrir(botonMenu, false);
    }
  });

  // Al pasar a escritorio, el estado móvil no debe quedarse colgado.
  if (window.matchMedia) {
    var escritorio = window.matchMedia("(min-width: 768px)");
    var alCambiar = function () { abrir(botonMenu, false); cerrarSubmenus(); };
    if (escritorio.addEventListener) { escritorio.addEventListener("change", alCambiar); }
    else if (escritorio.addListener) { escritorio.addListener(alCambiar); }
  }

})();
