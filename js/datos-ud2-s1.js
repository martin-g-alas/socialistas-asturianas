/*
 * Datos de la sesión. Es el ÚNICO archivo que cambia de una página a otra.
 * Todo el texto de la unidad está aquí, copiado literalmente de la fuente.
 * La lógica (ud-menu.js, ud-actividades.js) lo lee de window.UD_DATOS.
 *
 * Fuente: «Unidad_dida_ctica_cap._1.docx» — «La emancipación: las mujeres
 * asturianas en la conquista de la ciudadanía y el socialismo», Sesión 1.
 */
window.UD_DATOS = {
  unidad: {
    numero: 1,
    meta: ["Unidad 1", "8 sesiones"],
    titulo: "La emancipación: las mujeres asturianas en la conquista de la ciudadanía y el socialismo"
  },

  sesiones: {
    total: 8,
    actual: 1,
    etiqueta: "Sesión",
    tituloIndice: "Sesiones",
    pendiente: "pendiente"
  },

  sesion: {
    etiqueta: "SESIÓN 1",
    titulo: "¿Súbditas o ciudadanas?"
  },

  /* Textos de la interfaz. {nombre}, {aciertos}, {total}, {n} se sustituyen. */
  interfaz: {
    elige: "Elige un nombre…",
    eligeTexto: "Elige…",
    comprobar: "Comprobar",
    verSolucion: "Ver solución",
    correcto: "Correcto: {nombre}",
    noEs: "No es {nombre}. Vuelve a intentarlo.",
    solucion: "Solución: {nombre}",
    sinRespuesta: "Elige una opción antes de comprobar.",
    resumen: "{aciertos} de {total} resueltas.",
    completado: "Actividad completada: {aciertos} de {total}.",
    fotoPendiente: "Foto pendiente",
    altFoto: "Retrato {n} de la galería",
    altFotoResuelta: "Retrato de {nombre}",
    etiquetaTexto: "Texto {n}",
    textoElegido: "Texto de {nombre}, para comparar:",
    enElAula: "En el aula",
    actividadesTitulo: "Actividades",
    iconoAcierto: "✓",
    iconoError: "✗",
    iconoSolucion: "→"
  },

  actividades: [
    {
      tipo: "relacionar",
      numero: 1,
      tipoEtiqueta: "Actividad inicial",
      subtitulo: "Galería de imágenes",
      enunciado: [
        { texto: "Se proyectarán imágenes de:" },
        {
          lista: [
            "Olympe de Gouges (1748-1793).",
            "Mary Wollstonecraft (1759-1797).",
            "Flora Tristán (1803-1844).",
            "Concepción Arenal Ponte (1820-1893).",
            "Clara Zetkin (1857-1933)."
          ]
        }
      ],
      barajar: true,
      intentosParaSolucion: 2,
      /* Cada elemento: lo que se ve (imagen) y su respuesta correcta. */
      elementos: [
        { id: "de-gouges", imagen: "../img/galeria/de-gouges.jpg", respuesta: "Olympe de Gouges (1748-1793)" },
        { id: "wollstonecraft", imagen: "../img/galeria/wollstonecraft.jpg", respuesta: "Mary Wollstonecraft (1759-1797)" },
        { id: "tristan", imagen: "../img/galeria/tristan.jpg", respuesta: "Flora Tristán (1803-1844)" },
        { id: "arenal", imagen: "../img/galeria/arenal.jpg", respuesta: "Concepción Arenal Ponte (1820-1893)" },
        { id: "zetkin", imagen: "../img/galeria/zetkin.jpg", respuesta: "Clara Zetkin (1857-1933)" }
      ],
      despues: {
        titulo: "Preguntas iniciales",
        etiqueta: "En el aula",
        lista: [
          "¿Qué tienen en común estas mujeres?",
          "¿Por qué son consideradas pioneras?",
          "¿Qué significa ser ciudadana?"
        ]
      }
    },

    {
      tipo: "lectura",
      numero: 2,
      tipoEtiqueta: "Actividad principal",
      etiquetaAula: "En el aula",
      enunciado: [{ texto: "Lectura y comentario de:" }],
      textos: [
        {
          /* En la fuente es un único párrafo: título + indicación + enlace. */
          parrafos: [
            [
              { texto: "Declaración de los Derechos de la Mujer y de la Ciudadana (1791).", destacado: true },
              { texto: " La podrás leerla en toda su extensión y realizar el correspondiente comentario, con las indicaciones del profesorado, en: " },
              { enlace: "https://es.wikipedia.org/wiki/Declaraci%C3%B3n_de_los_Derechos_de_la_Mujer_y_de_la_Ciudadana" }
            ]
          ]
        },
        {
          parrafos: [
            [{ texto: "Vindicación de los Derechos de la Mujer (1792).", destacado: true }],
            "¿Quién ha erigido al hombre como único juez, si la mujer comparte con él el don de la razón? Esta es una pregunta fundamental que Mary Wollstonecraft se hace en su obra Vindicación porque, como ilustrada, concibe la razón al servicio del desenmascaramiento de las tradiciones, como ruptura de las situaciones injustas y los prejuicios existentes en la sociedad."
          ],
          cita: [
            "“La educación más perfecta es, en mi opinión, un ejercicio de entendimiento, calculado lo mejor posible para fortalecer el cuerpo y formar el corazón (…) para posibilitar al individuo la consecución de hábitos de virtud que le hagan independiente.  De hecho, es una farsa llamar virtuoso a un ser cuyas virtudes no resultan del ejercicio de su propia razón”. Ésta era la opinión de Rousseau con respecto a los hombres; yo la extiendo a las mujeres. (...)",
            "Rousseau declara que una mujer nunca debe ni por un momento sentirse independiente, que debe regirse por el miedo a ejercitar su astucia natural y hacerse una esclava coqueta para volverse un objeto de deseo más atrayente, una compañía más dulce para el hombre cuando quiera relajarse (...) insinúa que verdad y fortaleza, las piedras angulares de toda virtud humana, deben cultivarse con ciertas restricciones, porque, con respecto al carácter femenino, la obediencia es la gran lección que debe inculcarse con vigor inflexible. (. .) Me aventuraré a afirmar que hasta que no se eduque a las mujeres de modo más racional, el progreso de la virtud humana y el perfeccionamiento del conocimiento recibirán frenos continuos. (…)",
            "Probablemente yo he tenido la oportunidad de observar más niñas en su infancia que J.J. Rousseau. Puedo recordar mis propios sentimientos y he observado a mi alrededor con detenimiento. Sin embargo, lejos de coincidir con su opinión respecto a los primeros albores del carácter femenino, me aventuraré a afirmar que una niña a quien no se le haya apagado el espíritu por la inactividad o se le haya teñido la inocencia con la falsa vergüenza, siempre será traviesa y que no le atraerán la atención las muñecas, a menos que el encierro no le permita otra alternativa. En pocas palabras, los niños y las niñas jugarían juntos sin peligro, si no se inculcara la distinción de sexos muchos antes de que la naturaleza haga alguna diferencia. (. .)» (Fuente: Mary Wolstonecrat: Vindicación de los derechos de la mujer. Madrid, Cátedra, 1996, extracto pp. 31, 137, 158, 162, 163; en Carmen Suárez Suárez: El feminismo atraviesa la historia o cómo ha sido la lucha de las mujeres. Oviedo, Instituto Asturiano de la Mujer, 2004, pp. 20-21)"
          ]
        }
      ]
    },

    {
      tipo: "aula",
      numero: 3,
      tipoEtiqueta: "Debate",
      etiquetaAula: "En el aula",
      enunciado: [{ texto: "¿La Revolución Francesa fue también una revolución para las mujeres?" }]
    }
  ],

  pie: "Ilustración: Alfonso Zapico"
};
