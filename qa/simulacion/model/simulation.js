// src/data/panel.ts
var port = (id, x, y, color, note, state, labelSide = "bottom", verification = "foto") => ({ id, label: id, x, y, color, note, state, labelSide, verification });
var source = { id: "FUENTE", title: "ALIMENTACI\xD3N Y TRANSFORMADOR", subtitle: "Transformador 220 / 24 V \xB7 3 A", x: 65, y: 82, w: 585, h: 285, image: "/references/suministro.jpg", category: "alimentacion", summary: "Fuentes y puntos de alimentaci\xF3n visibles. No energizar equipos reales sin autorizaci\xF3n docente.", labelBands: [["R", "S", "T"], ["N", "F"]], terminals: [
  port("R", 237, 230, "blue", "Fase R"),
  port("S", 297, 230, "black", "Fase S"),
  port("T", 357, 230, "red", "Fase T"),
  port("N", 430, 230, "white", "Neutro / referencia: conexi\xF3n interna por confirmar", void 0, "bottom", "no_verificado"),
  port("F", 493, 230, "red", "Borne marcado F: funci\xF3n interna por confirmar", void 0, "bottom", "no_verificado"),
  port("TP", 550, 242, "green", "Tierra de protecci\xF3n")
] };
var btn = { id: "BOTONERAS", title: "LUCES PILOTO 24 V A.C. / BOTONERAS", x: 712, y: 76, w: 615, h: 300, image: "/references/botoneras.jpg", category: "botoneras", summary: "Cuatro pilotos y tres pulsadores. Pares rojos 1\u20132; pares claros 3\u20134. En el pulsador derecho las columnas est\xE1n invertidas. NA/NC por convenci\xF3n, pendiente de verificaci\xF3n.", labelBands: [1, 2, 3].flatMap((s) => [[`S${s}:1`, `S${s}:3`], [`S${s}:2`, `S${s}:4`]]), terminals: [
  ...[78, 228, 378, 530].map((x, i) => port(`PILOTO_${i + 1}`, x, 105, "red", `Conector visible bajo piloto ${i + 1}; retorno a\xFAn no verificado`, void 0, "bottom", "no_verificado")),
  ...[115, 303, 488].flatMap((cx, i) => [
    // IMG_4737 and IMG_4536: the right-hand button has its columns reversed.
    port(`S${i + 1}:1`, cx + (i === 2 ? 29 : -29), 196, "red", `Pulsador ${i + 1} \xB7 contacto 1\u20132`, "NC por convenci\xF3n \xB7 por confirmar", "bottom", "convencion_por_confirmar"),
    port(`S${i + 1}:2`, cx + (i === 2 ? 29 : -29), 250, "red", `Pulsador ${i + 1} \xB7 contacto 1\u20132`, "NC por convenci\xF3n \xB7 por confirmar", "bottom", "convencion_por_confirmar"),
    port(`S${i + 1}:3`, cx + (i === 2 ? -29 : 29), 196, "white", `Pulsador ${i + 1} \xB7 contacto 3\u20134`, "NA por convenci\xF3n \xB7 por confirmar", "bottom", "convencion_por_confirmar"),
    port(`S${i + 1}:4`, cx + (i === 2 ? -29 : 29), 250, "white", `Pulsador ${i + 1} \xB7 contacto 3\u20134`, "NA por convenci\xF3n \xB7 por confirmar", "bottom", "convencion_por_confirmar")
  ]),
  port("N", 571, 132, "white", "Borne N visible del m\xF3dulo; conexi\xF3n interna no verificada", void 0, "bottom", "no_verificado"),
  port("TP_IZQ", 40, 260, "green", "Tierra de protecci\xF3n"),
  port("TP_DER", 579, 260, "green", "Tierra de protecci\xF3n")
] };
var thermal = { id: "CONTACTOR_TERMICO", title: "CONTACTOR + REL\xC9 T\xC9RMICO", subtitle: "Contactor y protecci\xF3n de sobrecarga", x: 65, y: 408, w: 585, h: 350, image: "/photos-2026-10-15/foto-6.jpg", category: "contactores", summary: "Contactor con rel\xE9 t\xE9rmico. Los n\xFAmeros de bornes est\xE1n identificados; referencia KM escrita a mano sin confirmar.", aliasEditable: true, labelBands: [["A2", "A1"], ["L1", "L2", "L3"], ["T1", "T2", "T3"], ["71", "72"], ["81", "82"], ["95", "96"], ["13", "14"], ["63", "64"], ["93", "94"], ["97", "98"]], terminals: [
  port("A2", 176, 64, "red", "Bobina, borne A2", void 0, "right"),
  port("A1", 176, 108, "white", "Bobina, borne A1", void 0, "right"),
  ...["L1", "L2", "L3"].map((id, i) => port(id, 264 + i * 77, 70, ["blue", "black", "red"][i], "Entrada de potencia", void 0, "bottom")),
  ...["T1", "T2", "T3"].map((id, i) => port(id, 264 + i * 77, 309, ["blue", "black", "red"][i], "Salida de potencia", void 0, "bottom")),
  ...["71", "72", "81", "82", "95", "96"].map((id, i) => port(id, 178 + i % 2 * 74, 164 + Math.floor(i / 2) * 54, "black", `${i >= 4 ? "Protecci\xF3n t\xE9rmica" : "Auxiliar"} \xB7 contacto ${["71\u201372", "71\u201372", "81\u201382", "81\u201382", "95\u201396", "95\u201396"][i]}`, "NC probable", "top", "convencion_por_confirmar")),
  ...["13", "14", "63", "64", "93", "94", "97", "98"].map((id, i) => port(id, 449 + i % 2 * 70, 128 + Math.floor(i / 2) * 54, "blue", `${i >= 6 ? "Protecci\xF3n t\xE9rmica" : "Auxiliar"} \xB7 contacto ${["13\u201314", "13\u201314", "63\u201364", "63\u201364", "93\u201394", "93\u201394", "97\u201398", "97\u201398"][i]}`, "NA probable", "top", "convencion_por_confirmar")),
  port("TP_IZQ", 170, 309, "green", "Tierra de protecci\xF3n"),
  port("TP_DER", 551, 309, "green", "Tierra de protecci\xF3n")
] };
var tri = { id: "CONTACTOR_TRIFASICO", title: "CONTACTOR TRIF\xC1SICO", subtitle: "Referencia escrita KM\u2026 por confirmar", x: 712, y: 408, w: 615, h: 350, image: "/photos-2026-10-15/foto-3.jpg", category: "contactores", summary: "Contactor trif\xE1sico con bobina, bornes de potencia y contactos auxiliares. Etiqueta KM manuscrita a\xFAn no legible por completo.", aliasEditable: true, labelBands: [["A2", "A1"], ["L1", "L2", "L3"], ["T1", "T2", "T3"], ["71", "72"], ["81", "82"], ["13", "14"], ["63", "64"], ["93", "94"]], terminals: [
  port("A2", 52, 65, "red", "Bobina, borne A2", void 0, "right"),
  port("A1", 52, 112, "white", "Bobina, borne A1", void 0, "right"),
  ...["L1", "L2", "L3"].map((id, i) => port(id, 184 + i * 78, 71, ["blue", "black", "red"][i], "Entrada de potencia", void 0, "bottom")),
  ...["T1", "T2", "T3"].map((id, i) => port(id, 184 + i * 78, 309, ["blue", "black", "red"][i], "Salida de potencia", void 0, "bottom")),
  ...["71", "72", "81", "82"].map((id, i) => port(id, i === 0 ? 80 : 72 + i % 2 * 65, 157 + Math.floor(i / 2) * 60, "black", `Auxiliar \xB7 contacto ${i < 2 ? "71\u201372" : "81\u201382"}`, "NC probable", "top", "convencion_por_confirmar")),
  port("95", 72, 277, "black", "Borne 95 de KM2: presencia indicada por ti. No visible en fotos 3\u20135 del 15/10/2026; presencia en este m\xF3dulo por confirmar. Posici\xF3n y color de referencia; funci\xF3n interna por confirmar.", void 0, "top", "usuario"),
  port("96", 137, 277, "black", "Borne 96 de KM2: presencia indicada por ti. No visible en fotos 3\u20135 del 15/10/2026; presencia en este m\xF3dulo por confirmar. Posici\xF3n y color de referencia; funci\xF3n interna por confirmar.", void 0, "top", "usuario"),
  ...["13", "14", "63", "64", "93", "94"].map((id, i) => port(id, 473 + i % 2 * 65, 149 + Math.floor(i / 2) * 54, "blue", `Contacto ${["13\u201314", "13\u201314", "63\u201364", "63\u201364", "93\u201394", "93\u201394"][i]}`, "NA probable", "top", "convencion_por_confirmar")),
  port("TP_IZQ", 55, 309, "green", "Tierra de protecci\xF3n"),
  port("TP_DER", 580, 309, "green", "Tierra de protecci\xF3n")
] };
function timer(id, x, image) {
  return { id, title: "TEMPORIZADOR NEUM\xC1TICO", subtitle: "BOBINA 24 V A.C.", x, y: 787, w: 485, h: 270, image, category: "temporizadores", aliasEditable: true, summary: "Temporizador neum\xE1tico de 24 V CA. Antes de simularlo hay que confirmar el modo de retardo y su referencia.", labelBands: [["A2", "A1"], ["L1", "L2", "L3"], ["T1", "T2", "T3"], ["55", "56"], ["13", "14"], ["67", "68"]], terminals: [
    port("A2", 33, 59, "red", "Bobina A2", void 0, "right"),
    port("A1", 33, 102, "white", "Bobina A1", void 0, "right"),
    ...["L1", "L2", "L3"].map((id2, i) => port(id2, 152 + i * 63, 58, ["blue", "black", "red"][i], "Bornes superiores", void 0, "bottom")),
    ...["T1", "T2", "T3"].map((id2, i) => port(id2, 152 + i * 63, 222, ["blue", "black", "red"][i], "Bornes inferiores", void 0, "bottom")),
    port("55", 45, 169, "black", "Contacto 55\u201356, retardo no verificado", "NC probable", "top", "convencion_por_confirmar"),
    port("56", 96, 169, "black", "Contacto 55\u201356, retardo no verificado", "NC probable", "top", "convencion_por_confirmar"),
    port("13", 365, 135, "blue", "Auxiliar 13\u201314", "NA probable", "top", "convencion_por_confirmar"),
    port("14", 427, 135, "blue", "Auxiliar 13\u201314", "NA probable", "top", "convencion_por_confirmar"),
    port("67", 365, 191, "blue", "Contacto 67\u201368, retardo no verificado", "NA probable", "top", "convencion_por_confirmar"),
    port("68", 427, 191, "blue", "Contacto 67\u201368, retardo no verificado", "NA probable", "top", "convencion_por_confirmar"),
    port("TP_IZQ", 49, 224, "green", "Tierra de protecci\xF3n"),
    port("TP_DER", 452, 224, "green", "Tierra de protecci\xF3n")
  ] };
}
var motor = { id: "BORNERA_MOTOR", title: "MOTOR TRIF\xC1SICO", subtitle: "Motor con bornera U1 V1 W1 \xB7 W2 U2 V2", x: 65, y: 798, w: 715, h: 285, image: "/references/motor.jpg", category: "motor", summary: "Motor trif\xE1sico con su bornera: seis extremos de bobinado y tierra de protecci\xF3n. Estrella o tri\xE1ngulo se define con los puentes entre bornes.", labelBands: [["U1", "V1", "W1"], ["W2", "U2", "V2"]], terminals: [
  port("U1", 532, 109, "blue", "Terminal de motor U1", void 0, "top"),
  port("V1", 581, 109, "black", "Terminal de motor V1", void 0, "top"),
  port("W1", 630, 109, "red", "Terminal de motor W1", void 0, "top"),
  port("W2", 532, 176, "red", "Terminal de motor W2", void 0, "bottom"),
  port("U2", 581, 176, "blue", "Terminal de motor U2", void 0, "bottom"),
  port("V2", 630, 176, "black", "Terminal de motor V2", void 0, "bottom"),
  port("TP", 499, 144, "green", "Tierra de protecci\xF3n", void 0, "bottom")
] };
for (const m of [thermal, tri]) for (const t of m.terminals) {
  if (["71", "72", "81", "82", "95", "96"].includes(t.id)) {
    t.color = "gray";
    t.state = "NC \xB7 normalmente cerrado";
    t.verification = "usuario";
    t.note = (m === tri && ["95", "96"].includes(t.id) ? "Contacto 95\u201396: NC indicado por ti; accionamiento interno por confirmar." : t.note || "") + " Gris = normalmente cerrado, indicado por ti.";
  }
  if (["13", "14", "63", "64", "93", "94", "97", "98"].includes(t.id)) {
    t.state = "NA \xB7 normalmente abierto";
    t.verification = "usuario";
    t.note = (t.note || "") + " Azul = normalmente abierto, indicado por ti.";
  }
}
tri.labelBands.push(["95", "96"]);
source.x = 65;
source.y = 76;
btn.x = 674;
btn.y = 76;
thermal.x = 65;
thermal.y = 412;
tri.x = 674;
tri.y = 412;
var pneumatic = timer("TEMPORIZADOR_1", 65, "/references/temporizador-1.jpg");
pneumatic.y = 798;
motor.x = 574;
motor.y = 798;
var RETIRED_MODULES = [timer("TEMPORIZADOR_2", 831, "/references/temporizador-2.jpg")];
var MODULES = [source, btn, thermal, tri, motor, pneumatic];
var BASE_MODULE_IDS = new Set(MODULES.map((m) => m.id));
var RETIRED_TERMINAL_IDS = new Set(RETIRED_MODULES.flatMap((m) => m.terminals.map((t) => `${m.id}:${t.id}`)));
var PORT_COUNT = MODULES.reduce((n, m) => n + m.terminals.length, 0);
var terminalKey = (module, terminal) => `${module.id}:${terminal.id}`;
var TERMINALS = MODULES.flatMap((module) => module.terminals.map((terminal) => ({ key: terminalKey(module, terminal), module, terminal })));
var TERMINAL_BY_ID = new Map(TERMINALS.map((t) => [t.key, t]));

// src/data/leccionInversion.layout.json
var leccionInversion_layout_default = {
  width: 1200,
  height: 1120,
  modules: [
    {
      id: "FUENTE",
      terminals: [
        {
          id: "R",
          x: 90,
          y: 150
        },
        {
          id: "S",
          x: 150,
          y: 150
        },
        {
          id: "T",
          x: 210,
          y: 150
        },
        {
          id: "N",
          x: 280,
          y: 150
        },
        {
          id: "F",
          x: 345,
          y: 150
        },
        {
          id: "TP",
          x: 350,
          y: 95
        }
      ]
    },
    {
      id: "BOTONERAS",
      terminals: [
        {
          id: "PILOTO_1",
          x: 500,
          y: 105
        },
        {
          id: "PILOTO_2",
          x: 650,
          y: 105
        },
        {
          id: "PILOTO_3",
          x: 800,
          y: 105
        },
        {
          id: "PILOTO_4",
          x: 950,
          y: 105
        },
        {
          id: "S1:1",
          x: 515,
          y: 200
        },
        {
          id: "S1:2",
          x: 515,
          y: 255
        },
        {
          id: "S1:3",
          x: 565,
          y: 200
        },
        {
          id: "S1:4",
          x: 565,
          y: 255
        },
        {
          id: "S2:1",
          x: 755,
          y: 200
        },
        {
          id: "S2:2",
          x: 755,
          y: 255
        },
        {
          id: "S2:3",
          x: 805,
          y: 200
        },
        {
          id: "S2:4",
          x: 805,
          y: 255
        },
        {
          id: "S3:1",
          x: 995,
          y: 200
        },
        {
          id: "S3:2",
          x: 995,
          y: 255
        },
        {
          id: "S3:3",
          x: 1045,
          y: 200
        },
        {
          id: "S3:4",
          x: 1045,
          y: 255
        },
        {
          id: "N",
          x: 1100,
          y: 125
        },
        {
          id: "TP_DER",
          x: 1100,
          y: 230
        }
      ]
    },
    {
      id: "CONTACTOR_TERMICO",
      terminals: [
        {
          id: "A2",
          x: 90,
          y: 410
        },
        {
          id: "A1",
          x: 90,
          y: 465
        },
        {
          id: "L1",
          x: 250,
          y: 410
        },
        {
          id: "L2",
          x: 310,
          y: 410
        },
        {
          id: "L3",
          x: 370,
          y: 410
        },
        {
          id: "71",
          x: 100,
          y: 540
        },
        {
          id: "72",
          x: 170,
          y: 540
        },
        {
          id: "81",
          x: 100,
          y: 600
        },
        {
          id: "82",
          x: 170,
          y: 600
        },
        {
          id: "95",
          x: 100,
          y: 660
        },
        {
          id: "96",
          x: 170,
          y: 660
        },
        {
          id: "13",
          x: 450,
          y: 470
        },
        {
          id: "14",
          x: 520,
          y: 470
        },
        {
          id: "97",
          x: 450,
          y: 550
        },
        {
          id: "98",
          x: 520,
          y: 550
        },
        {
          id: "T1",
          x: 250,
          y: 650
        },
        {
          id: "T2",
          x: 310,
          y: 650
        },
        {
          id: "T3",
          x: 370,
          y: 650
        },
        {
          id: "TP_DER",
          x: 520,
          y: 650
        }
      ]
    },
    {
      id: "CONTACTOR_TRIFASICO",
      terminals: [
        {
          id: "A2",
          x: 650,
          y: 410
        },
        {
          id: "A1",
          x: 650,
          y: 465
        },
        {
          id: "L1",
          x: 790,
          y: 410
        },
        {
          id: "L2",
          x: 860,
          y: 410
        },
        {
          id: "L3",
          x: 930,
          y: 410
        },
        {
          id: "71",
          x: 660,
          y: 540
        },
        {
          id: "72",
          x: 730,
          y: 540
        },
        {
          id: "81",
          x: 660,
          y: 600
        },
        {
          id: "82",
          x: 730,
          y: 600
        },
        {
          id: "13",
          x: 1010,
          y: 470
        },
        {
          id: "14",
          x: 1080,
          y: 470
        },
        {
          id: "T1",
          x: 790,
          y: 650
        },
        {
          id: "T2",
          x: 860,
          y: 650
        },
        {
          id: "T3",
          x: 930,
          y: 650
        },
        {
          id: "TP_IZQ",
          x: 660,
          y: 655
        },
        {
          id: "TP_DER",
          x: 1080,
          y: 650
        }
      ]
    },
    {
      id: "BORNERA_MOTOR",
      terminals: [
        {
          id: "U1",
          x: 400,
          y: 850
        },
        {
          id: "V1",
          x: 470,
          y: 850
        },
        {
          id: "W1",
          x: 540,
          y: 850
        },
        {
          id: "W2",
          x: 400,
          y: 960
        },
        {
          id: "U2",
          x: 470,
          y: 960
        },
        {
          id: "V2",
          x: 540,
          y: 960
        },
        {
          id: "TP",
          x: 330,
          y: 905
        }
      ]
    }
  ]
};

// src/data/starDeltaSources.json
var starDeltaSources_default = {
  estrellaManual: {
    title: "Estrella-tri\xE1ngulo sin temporizador",
    summary: "S1 arranca en estrella; S3 hace el cambio a tri\xE1ngulo.",
    source: "1-modo-panel-con-historial-2-.json",
    sha256: "d30b3149cd17a023dd4ef61e287ac1dcc6549550bba51e8196c6f29e774e2102",
    star: "KM3",
    delta: "KM2",
    historyTruncated: true,
    pairs: [
      [
        "FUENTE:F",
        "CONTACTOR_TERMICO:71"
      ],
      [
        "CONTACTOR_TERMICO:72",
        "BOTONERAS:PILOTO_2"
      ],
      [
        "FUENTE:F",
        "CONTACTOR_TERMICO:95"
      ],
      [
        "CONTACTOR_TERMICO:96",
        "BOTONERAS:S2:1"
      ],
      [
        "BOTONERAS:S2:2",
        "BOTONERAS:S1:3"
      ],
      [
        "BOTONERAS:S1:4",
        "CONTACTOR_TERMICO:A1"
      ],
      [
        "BOTONERAS:S2:2",
        "CONTACTOR_TERMICO:13"
      ],
      [
        "CONTACTOR_TERMICO:14",
        "BOTONERAS:S1:4"
      ],
      [
        "BOTONERAS:S1:4",
        "BOTONERAS:S3:1"
      ],
      [
        "BOTONERAS:S3:2",
        "CONTACTOR_TRIFASICO:71"
      ],
      [
        "CONTACTOR_TRIFASICO:72",
        "CONTACTOR_TRIFASICO_3:A1"
      ],
      [
        "CONTACTOR_TRIFASICO_3:A1",
        "BOTONERAS:PILOTO_1"
      ],
      [
        "BOTONERAS:S2:2",
        "BOTONERAS:S3:3"
      ],
      [
        "BOTONERAS:S3:4",
        "CONTACTOR_TRIFASICO_3:71"
      ],
      [
        "CONTACTOR_TRIFASICO_3:72",
        "CONTACTOR_TRIFASICO:A1"
      ],
      [
        "CONTACTOR_TRIFASICO:A1",
        "BOTONERAS:PILOTO_4"
      ],
      [
        "BOTONERAS:S1:4",
        "CONTACTOR_TRIFASICO:13"
      ],
      [
        "CONTACTOR_TRIFASICO:14",
        "BOTONERAS:S3:4"
      ],
      [
        "FUENTE:F",
        "CONTACTOR_TERMICO:97"
      ],
      [
        "CONTACTOR_TERMICO:98",
        "BOTONERAS:PILOTO_3"
      ],
      [
        "CONTACTOR_TERMICO:A2",
        "FUENTE:N"
      ],
      [
        "BOTONERAS:N",
        "FUENTE:N"
      ],
      [
        "CONTACTOR_TRIFASICO:A2",
        "FUENTE:N"
      ],
      [
        "CONTACTOR_TRIFASICO_3:A2",
        "FUENTE:N"
      ],
      [
        "FUENTE:R",
        "CONTACTOR_TERMICO:L1"
      ],
      [
        "FUENTE:S",
        "CONTACTOR_TERMICO:L2"
      ],
      [
        "FUENTE:T",
        "CONTACTOR_TERMICO:L3"
      ],
      [
        "CONTACTOR_TERMICO:T1",
        "BORNERA_MOTOR:U1"
      ],
      [
        "CONTACTOR_TERMICO:T2",
        "BORNERA_MOTOR:V1"
      ],
      [
        "CONTACTOR_TERMICO:T3",
        "BORNERA_MOTOR:W1"
      ],
      [
        "CONTACTOR_TERMICO:L1",
        "CONTACTOR_TRIFASICO:L1"
      ],
      [
        "CONTACTOR_TERMICO:L2",
        "CONTACTOR_TRIFASICO:L2"
      ],
      [
        "CONTACTOR_TERMICO:L3",
        "CONTACTOR_TRIFASICO:L3"
      ],
      [
        "CONTACTOR_TRIFASICO:T1",
        "BORNERA_MOTOR:W2"
      ],
      [
        "CONTACTOR_TRIFASICO:T2",
        "BORNERA_MOTOR:U2"
      ],
      [
        "CONTACTOR_TRIFASICO:T3",
        "BORNERA_MOTOR:V2"
      ],
      [
        "CONTACTOR_TRIFASICO:T1",
        "CONTACTOR_TRIFASICO_3:T3"
      ],
      [
        "CONTACTOR_TRIFASICO:T2",
        "CONTACTOR_TRIFASICO_3:T2"
      ],
      [
        "CONTACTOR_TRIFASICO:T3",
        "CONTACTOR_TRIFASICO_3:T1"
      ],
      [
        "CONTACTOR_TRIFASICO_3:L1",
        "CONTACTOR_TRIFASICO_3:L2"
      ],
      [
        "CONTACTOR_TRIFASICO_3:L3",
        "CONTACTOR_TRIFASICO_3:L2"
      ],
      [
        "FUENTE:TP",
        "BOTONERAS:TP_IZQ"
      ],
      [
        "CONTACTOR_TERMICO:TP_DER",
        "FUENTE:TP"
      ],
      [
        "CONTACTOR_TRIFASICO:TP_IZQ",
        "CONTACTOR_TERMICO:TP_DER"
      ],
      [
        "CONTACTOR_TRIFASICO:TP_DER",
        "BORNERA_MOTOR:TP"
      ],
      [
        "CONTACTOR_TRIFASICO_3:TP_IZQ",
        "CONTACTOR_TRIFASICO:TP_DER"
      ]
    ]
  },
  estrellaTimer: {
    title: "Estrella-tri\xE1ngulo con temporizador",
    summary: "S1 arranca; KT1 realiza el cambio de estrella a tri\xE1ngulo.",
    source: "2-modo-panel-con-historial-3-.json",
    sha256: "cd98794668e7182fa293d605dda462f0ceacb6b44a5be7d072e15142eab42df4",
    star: "KM2",
    delta: "KM3",
    historyTruncated: true,
    pairs: [
      [
        "FUENTE:F",
        "CONTACTOR_TERMICO:95"
      ],
      [
        "CONTACTOR_TERMICO:96",
        "BOTONERAS:S2:1"
      ],
      [
        "BOTONERAS:S2:2",
        "BOTONERAS:S1:3"
      ],
      [
        "BOTONERAS:S1:4",
        "CONTACTOR_TERMICO:A1"
      ],
      [
        "BOTONERAS:PILOTO_1",
        "CONTACTOR_TERMICO:A1"
      ],
      [
        "BOTONERAS:S2:2",
        "CONTACTOR_TERMICO:13"
      ],
      [
        "CONTACTOR_TERMICO:14",
        "BOTONERAS:S1:4"
      ],
      [
        "CONTACTOR_TERMICO:14",
        "TEMPORIZADOR_1:55"
      ],
      [
        "TEMPORIZADOR_1:56",
        "CONTACTOR_TRIFASICO_3:71"
      ],
      [
        "CONTACTOR_TRIFASICO_3:72",
        "CONTACTOR_TRIFASICO:A1"
      ],
      [
        "CONTACTOR_TERMICO:14",
        "TEMPORIZADOR_1:67"
      ],
      [
        "TEMPORIZADOR_1:68",
        "CONTACTOR_TRIFASICO:71"
      ],
      [
        "CONTACTOR_TRIFASICO:72",
        "CONTACTOR_TRIFASICO_3:A1"
      ],
      [
        "FUENTE:F",
        "CONTACTOR_TERMICO:97"
      ],
      [
        "CONTACTOR_TERMICO:98",
        "BOTONERAS:PILOTO_3"
      ],
      [
        "CONTACTOR_TERMICO:A2",
        "FUENTE:N"
      ],
      [
        "CONTACTOR_TRIFASICO:A2",
        "FUENTE:N"
      ],
      [
        "CONTACTOR_TRIFASICO_3:A2",
        "FUENTE:N"
      ],
      [
        "FUENTE:F",
        "CONTACTOR_TERMICO:81"
      ],
      [
        "CONTACTOR_TERMICO:82",
        "CONTACTOR_TRIFASICO:81"
      ],
      [
        "CONTACTOR_TRIFASICO:82",
        "CONTACTOR_TRIFASICO_3:81"
      ],
      [
        "CONTACTOR_TRIFASICO_3:82",
        "BOTONERAS:PILOTO_2"
      ],
      [
        "BOTONERAS:N",
        "FUENTE:N"
      ],
      [
        "FUENTE:R",
        "CONTACTOR_TERMICO:L1"
      ],
      [
        "FUENTE:S",
        "CONTACTOR_TERMICO:L2"
      ],
      [
        "FUENTE:T",
        "CONTACTOR_TERMICO:L3"
      ],
      [
        "CONTACTOR_TERMICO:T1",
        "BORNERA_MOTOR:U1"
      ],
      [
        "CONTACTOR_TERMICO:T2",
        "BORNERA_MOTOR:V1"
      ],
      [
        "CONTACTOR_TERMICO:T3",
        "BORNERA_MOTOR:W1"
      ],
      [
        "CONTACTOR_TERMICO:L1",
        "CONTACTOR_TRIFASICO_3:L1"
      ],
      [
        "CONTACTOR_TERMICO:L2",
        "CONTACTOR_TRIFASICO_3:L2"
      ],
      [
        "CONTACTOR_TERMICO:L3",
        "CONTACTOR_TRIFASICO_3:L3"
      ],
      [
        "CONTACTOR_TRIFASICO_3:T1",
        "BORNERA_MOTOR:W2"
      ],
      [
        "CONTACTOR_TRIFASICO_3:T2",
        "BORNERA_MOTOR:U2"
      ],
      [
        "CONTACTOR_TRIFASICO_3:T3",
        "BORNERA_MOTOR:V2"
      ],
      [
        "BORNERA_MOTOR:W2",
        "CONTACTOR_TRIFASICO:T3"
      ],
      [
        "BORNERA_MOTOR:U2",
        "CONTACTOR_TRIFASICO:T2"
      ],
      [
        "BORNERA_MOTOR:V2",
        "CONTACTOR_TRIFASICO:T1"
      ],
      [
        "CONTACTOR_TRIFASICO:L1",
        "CONTACTOR_TRIFASICO:L2"
      ],
      [
        "CONTACTOR_TRIFASICO:L3",
        "CONTACTOR_TRIFASICO:L2"
      ],
      [
        "BOTONERAS:S1:4",
        "TEMPORIZADOR_1:A1"
      ],
      [
        "TEMPORIZADOR_1:A2",
        "BOTONERAS:N"
      ]
    ]
  }
};

// src/data/starDeltaTeaching.ts
var item = (title, why, behavior, without, question, criteria) => ({ title, why, behavior, without, question, criteria });
function starDetail(id, from, to) {
  const timed = id === "estrellaTimer", s = starDeltaSources_default[id], ends = [from, to], has = (v) => ends.includes(v), match = (re) => ends.some((v) => re.test(v));
  const star = s.star, delta = s.delta, starModule = timed ? "CONTACTOR_TRIFASICO" : "CONTACTOR_TRIFASICO_3", deltaModule = timed ? "CONTACTOR_TRIFASICO_3" : "CONTACTOR_TRIFASICO";
  if (match(/:TP/)) return item("Continuidad de protecci\xF3n \xB7 TP", "Esta uni\xF3n contin\xFAa la red TP presente en el archivo sin temporizador.", "La protecci\xF3n se mantiene separada de N y de las rutas de mando y fuerza.", "Falta parte de la continuidad TP de esta referencia, aunque el modelo pudiera funcionar.", "\xBFQu\xE9 funci\xF3n cumple esta uni\xF3n TP y por qu\xE9 no debe usarse como retorno de una bobina?", ["Separar TP de N.", "Distinguir funcionamiento y continuidad de protecci\xF3n."]);
  if (match(/^CONTACTOR_.*:[LT][123]$/)) {
    if (ends.every((v) => v.startsWith(starModule + ":L"))) return item(`Punto com\xFAn de estrella \xB7 ${star}`, "Los puentes unen las tres entradas L del contactor de estrella en un mismo nodo.", "Al cerrar sus tres polos, ese nodo re\xFAne W2, U2 y V2 a trav\xE9s de las salidas T.", "Sin todos los puentes no se forma el nodo com\xFAn completo al cerrar el contactor.", "\xBFPor qu\xE9 se unen estas entradas y cu\xE1ndo quedan unidos los tres extremos del motor?", ["Identificar el nodo com\xFAn.", "Explicar que la estrella depende del cierre de " + star + "."]);
    if (match(new RegExp("^" + starModule + ":T"))) return item(`Extremo de bobinado hacia estrella \xB7 ${star}`, "Este cable lleva un extremo inferior del motor al contactor de estrella, seg\xFAn la red del archivo.", "Con " + star + " cerrado, sus tres polos llevan W2, U2 y V2 al nodo com\xFAn de sus entradas L.", "Falta uno de los recorridos que debe cerrar la conexi\xF3n estrella.", "Sigue este cable hasta el motor: \xBFc\xF3mo participa en la estrella y de qu\xE9 contactor depende?", ["Identificar W2, U2 o V2 y su recorrido.", "Relacionar el polo del contactor con el nodo com\xFAn."]);
    if (match(new RegExp("^" + deltaModule + ":[LT]"))) return item(`Rama de tri\xE1ngulo \xB7 ${delta}`, "La rama de " + delta + " toma las fases de entrada de KM1 y las lleva a W2, U2 y V2 seg\xFAn el archivo.", "Con KM1 y " + delta + " cerrados, las parejas U1\u2013W2, V1\u2013U2 y W1\u2013V2 reciben las fases de la referencia. " + star + " debe estar abierto.", "Se interrumpe uno de los recorridos necesarios para formar el tri\xE1ngulo previsto.", "\xBFQu\xE9 pareja de extremos del motor alimenta esta rama y por qu\xE9 debe estar abierto el contactor de estrella?", ["Seguir el recorrido de la fase hasta la pareja de bobinados.", "Distinguir estrella y tri\xE1ngulo e incluir el enclavamiento."]);
    return item("Fuerza principal \xB7 KM1", "KM1 recibe R, S y T y alimenta U1, V1 y W1 por sus polos principales.", "KM1 permanece activo en estrella y en tri\xE1ngulo; el cambio se hace en los otros extremos del motor.", "Falta una de las rutas de fuerza, aunque las bobinas de mando puedan activarse.", "\xBFQu\xE9 fase o extremo del motor lleva este cable y qu\xE9 papel conserva KM1 durante el cambio?", ["Distinguir mando y fuerza.", "Explicar la funci\xF3n de l\xEDnea de KM1."]);
  }
  if (has("TEMPORIZADOR_1:A1") || has("TEMPORIZADOR_1:A2")) return item("Alimentaci\xF3n del temporizador \xB7 KT1", "KT1 toma la alimentaci\xF3n del mismo nodo de marcha de KM1 y necesita un retorno a N.", "En el modelo virtual, al energizar KT1 comienza el retardo; al retirar la alimentaci\xF3n se reinicia.", "KT1 no completa su alimentaci\xF3n y sus contactos no realizan el cambio temporizado previsto.", "\xBFCu\xE1ndo empieza a contar KT1 y qu\xE9 sucede con el retardo al parar el circuito?", ["Relacionar la alimentaci\xF3n de KT1 con la marcha de KM1.", "Incluir A1, A2 y el reinicio al desenergizar."]);
  if (match(/^TEMPORIZADOR_1:(55|56|67|68)$/)) {
    const nc = match(/:(55|56)$/);
    return item(nc ? "Primera etapa \xB7 KT1 55\u201356" : "Segunda etapa \xB7 KT1 67\u201368", nc ? "La rama de estrella pasa por 55\u201356 de KT1 antes del enclavamiento con " + delta + "." : "La rama de tri\xE1ngulo pasa por 67\u201368 de KT1 antes del enclavamiento con " + star + ".", nc ? "En el modelo de retardo a la conexi\xF3n, 55\u201356 deja arrancar en estrella y abre al terminar el tiempo." : "En el mismo modelo, 67\u201368 permanece abierto durante el retardo y cierra al terminarlo.", nc ? "Se interrumpe la orden inicial de estrella. Puentear el contacto eliminar\xEDa su apertura temporizada." : "Falta la orden temporizada de tri\xE1ngulo. Un puente quitar\xEDa la espera prevista.", "\xBFQu\xE9 cambia en este contacto al terminar el retardo y c\xF3mo afecta a " + (nc ? star : delta) + "?", ["Distinguir 55\u201356 de 67\u201368.", "Relacionar la etapa temporal con el contactor correcto."]);
  }
  if (has("BOTONERAS:S3:1") || has("BOTONERAS:S3:2")) return item("Cambio manual \xB7 S3 abre la estrella", "La alimentaci\xF3n de la rama de " + star + " atraviesa el contacto NC 1\u20132 de S3.", "Al pulsar S3, 1\u20132 abre y cae " + star + ". Al soltarlo, el enclavamiento de " + delta + " impide volver a estrella mientras siga activo.", "La rama de estrella queda abierta; un puente impedir\xEDa que S3 la corte por este contacto.", "\xBFPor qu\xE9 S3 debe abrir esta rama antes de mantener el tri\xE1ngulo?", ["Relacionar el NC de S3 con la ca\xEDda de " + star + ".", "Explicar el papel del enclavamiento despu\xE9s del cambio."]);
  if (has("BOTONERAS:S3:3") || has("BOTONERAS:S3:4")) {
    if (match(/:14$/)) return item(`Retenci\xF3n del tri\xE1ngulo \xB7 ${delta}`, "El auxiliar NA 13\u201314 de " + delta + " forma una ruta en paralelo con la orden 3\u20134 de S3.", "Despu\xE9s del cambio, mantiene " + delta + " al soltar S3, mientras KM1 siga alimentando esa rama.", "Sin otra ruta equivalente, el tri\xE1ngulo depende de mantener pulsado S3.", "\xBFC\xF3mo mantiene este cable la marcha en tri\xE1ngulo despu\xE9s de soltar S3?", ["Explicar el paralelo con S3.", "Considerar el paro, KM1 y el enclavamiento."]);
    return item("Cambio manual \xB7 S3 ordena tri\xE1ngulo", "El contacto NA 3\u20134 de S3 da la orden de cambio a " + delta + " a trav\xE9s del NC de " + star + ".", "Al pulsar S3, abre la rama de estrella y cierra la orden de tri\xE1ngulo. El NC de " + star + " debe permitir el paso.", "Falta una parte de la orden manual de tri\xE1ngulo; la retenci\xF3n no sustituye la orden inicial.", "\xBFQu\xE9 dos acciones realiza S3 y c\xF3mo se evita activar estrella y tri\xE1ngulo juntos?", ["Distinguir 1\u20132 NC y 3\u20134 NA de S3.", "Explicar el enclavamiento cruzado."]);
  }
  if (match(/:(71|72)$/) && !has("CONTACTOR_TERMICO:71") && !has("CONTACTOR_TERMICO:72")) return item("Enclavamiento entre estrella y tri\xE1ngulo", "La alimentaci\xF3n de una bobina pasa por el NC 71\u201372 del contactor que realiza la otra conexi\xF3n.", "Si ese otro contactor act\xFAa, su NC abre e interrumpe esta rama; al caer vuelve a cerrar en el modelo.", "Sin el cable la rama queda interrumpida. Puentear el NC elimina esta condici\xF3n de exclusi\xF3n.", "Identifica el NC y la bobina de esta rama: \xBFqu\xE9 ocurre si el otro contactor est\xE1 activo?", ["Nombrar " + star + " como estrella y " + delta + " como tri\xE1ngulo.", "Explicar la apertura del NC contrario."]);
  if (has("BOTONERAS:N")) return item("Retorno com\xFAn de se\xF1alizaci\xF3n", "El borne N de las botoneras conecta el retorno modelado de los pilotos con el neutro de la fuente.", "Los pilotos pueden encenderse cuando su borne de se\xF1al recibe alimentaci\xF3n y este retorno est\xE1 completo.", "Los pilotos quedan sin retorno aunque sus otros bornes reciban fase.", "\xBFQu\xE9 circuitos cierra este retorno y en qu\xE9 se diferencia de TP?", ["Explicar el retorno de los pilotos.", "Separar N y TP."]);
  if (match(/:A2$/)) return item("Retorno de bobina a N", "A2 vuelve al neutro y completa el circuito de la bobina correspondiente.", "La bobina act\xFAa al recibir tensi\xF3n entre A1 y A2 y cumplirse las condiciones de su rama.", "Al faltar el retorno no basta con alimentar A1 para que act\xFAe la bobina.", "\xBFPor qu\xE9 la bobina necesita ambos extremos y qu\xE9 elementos acciona al alimentarse?", ["Identificar la bobina concreta.", "Explicar el circuito cerrado sin usar TP como retorno."]);
  if (match(/:(97|98)$/)) return item("Aviso de disparo \xB7 P3", "El aviso toma fase antes de 95\u201396 y utiliza el NA de se\xF1alizaci\xF3n 97\u201398 del t\xE9rmico.", "En el modelo, un disparo abre 95\u201396 y cierra 97\u201398; P3 puede encenderse con su retorno completo.", "Falta una parte del aviso, aunque el corte del mando puede seguir funcionando.", "\xBFC\xF3mo puede encenderse P3 cuando el t\xE9rmico corta la marcha?", ["Distinguir el corte 95\u201396 y el aviso 97\u201398.", "Situar la alimentaci\xF3n antes del corte."]);
  if (match(/:PILOTO_[14]$/)) {
    const state = timed ? "KM1 principal" : has("BOTONERAS:PILOTO_1") ? star + " estrella" : delta + " tri\xE1ngulo";
    return item("Piloto de estado \xB7 " + state, "El piloto toma alimentaci\xF3n del mismo nodo que la bobina de " + state + ".", "Con N conectado indica la alimentaci\xF3n de esa rama; no acredita por s\xED solo el giro f\xEDsico del motor.", "Se pierde esta se\xF1al, aunque la bobina pueda funcionar por su ruta propia.", "\xBFQu\xE9 estado indica este piloto en esta versi\xF3n y qu\xE9 no demuestra por s\xED solo?", ["Identificar la bobina asociada en este archivo.", "Separar se\xF1al luminosa y comprobaci\xF3n f\xEDsica."]);
  }
  if (match(/:(71|72|81|82)$/) || has("BOTONERAS:PILOTO_2")) return item("Indicaci\xF3n de reposo \xB7 P2", timed ? "P2 recibe fase a trav\xE9s de los NC 81\u201382 de KM1, KM2 y KM3 en serie." : "P2 recibe fase a trav\xE9s del NC 71\u201372 de KM1, tomado directamente de F.", "P2 puede encenderse con " + (timed ? "los tres contactores en reposo" : "KM1 en reposo") + " y el retorno N completo. Esta rama toma F antes del t\xE9rmico.", "Se pierde o se interrumpe la indicaci\xF3n de reposo, aunque las ramas de mando puedan funcionar.", "\xBFQu\xE9 estados deben tener los contactores para que P2 reciba alimentaci\xF3n en este archivo?", ["Seguir los NC presentes en esta versi\xF3n.", "Reconocer que la toma de F est\xE1 antes de 95\u201396."]);
  if (has("CONTACTOR_TERMICO:95")) return item("Protecci\xF3n del mando \xB7 95\u201396", "La alimentaci\xF3n F entra en 95 y sale por 96 hacia el paro.", "Al disparar el t\xE9rmico, su NC 95\u201396 abre y corta el mando alimentado por esta cadena.", "Falta la alimentaci\xF3n protegida; un puente evitar\xEDa la intervenci\xF3n de ese contacto.", "\xBFQu\xE9 ramas debe detener la apertura de 95\u201396 y cu\xE1les son solo se\xF1alizaci\xF3n?", ["Seguir la cadena protegida.", "Distinguirla de las se\xF1ales tomadas antes del t\xE9rmico."]);
  if (has("BOTONERAS:S2:1")) return item("Paro com\xFAn \xB7 S2", "El contacto NC 1\u20132 de S2 se coloca despu\xE9s del t\xE9rmico y antes de las ramas de marcha.", "Al pulsar S2 abre la cadena y retira la alimentaci\xF3n mantenida de KM1 y del cambio de conexi\xF3n.", "La cadena de mando queda abierta; un puente impedir\xEDa detenerla por este contacto.", "\xBFPor qu\xE9 el paro debe cortar tambi\xE9n la retenci\xF3n y el cambio estrella-tri\xE1ngulo?", ["Incluir marcha y retenci\xF3n.", "Explicar qu\xE9 ocurre con las bobinas al abrir S2."]);
  if (match(/:(13|14)$/)) return item("Retenci\xF3n de marcha \xB7 " + (has("CONTACTOR_TRIFASICO:13") ? delta : "KM1"), "El auxiliar NA 13\u201314 forma una ruta de mantenimiento, alimentada desde el nodo indicado en este archivo.", "Cuando entra su contactor, el NA cierra y mantiene la orden al soltar el pulsador que est\xE1 en paralelo.", "Sin otra ruta equivalente no queda completa esta retenci\xF3n.", "Sigue la entrada y la salida de 13\u201314: \xBFqu\xE9 pulsador evita tener que mantener presionado?", ["Identificar el contactor y el pulsador en paralelo.", "Relacionar el mantenimiento con el paro."]);
  if (has("BOTONERAS:S1:3")) return item("Orden inicial \xB7 S1", "S1 recibe la fase protegida despu\xE9s del paro y da la orden inicial de KM1.", "Al pulsar S1 cierra 3\u20134; KM1 inicia la marcha y habilita la primera etapa de estrella.", "Falta la orden inicial, aunque la rama auxiliar de retenci\xF3n est\xE9 conectada.", "\xBFQu\xE9 inicia S1 y qu\xE9 permite mantener el circuito al soltarlo?", ["Distinguir arranque y cambio de conexi\xF3n.", "Incluir el auxiliar de retenci\xF3n de KM1."]);
  return item("Alimentaci\xF3n de la bobina \xB7 KM1", "La salida de S1 llega a A1 de KM1 y al nodo de marcha del circuito.", "Con el retorno A2 completo, KM1 act\xFAa y su auxiliar NA mantiene ese nodo alimentado.", "KM1 no recibe la alimentaci\xF3n prevista y no se habilita la secuencia de marcha.", "\xBFQu\xE9 funci\xF3n tiene KM1 durante las dos etapas y c\xF3mo se mantiene su alimentaci\xF3n?", ["Identificar KM1 como contactor principal.", "Explicar la relaci\xF3n entre S1 y 13\u201314."]);
}

// src/data/lessons.ts
var K1 = "CONTACTOR_TERMICO:";
var K2 = "CONTACTOR_TRIFASICO:";
var BT = "BOTONERAS:";
var FU = "FUENTE:";
var MO = "BORNERA_MOTOR:";
var INVERSION = [
  // — Mando de KM1 (marcha 1) —
  [FU + "F", K1 + "95", "Fase al mando por el t\xE9rmico", "La fase F entra al mando pasando por el contacto 95\u201396 del rel\xE9 t\xE9rmico, que es NC. Si el t\xE9rmico dispara, este contacto abre y corta todo el mando."],
  [K1 + "96", BT + "S2:1", "Del t\xE9rmico al paro (S2)", "Desde 96 la fase va al pulsador rojo S2. Su contacto 1\u20132 es NC: el mando queda alimentado mientras no pulses el paro."],
  [BT + "S2:2", BT + "S1:3", "Del paro a marcha 1 (S1)", "S2:2 es el punto \xABprotegido por el paro\xBB: todo lo que sale de aqu\xED se apaga al pulsar S2. Ll\xE9valo al borne 3 de S1 (verde izquierdo), contacto NA 3\u20134."],
  [BT + "S1:4", K2 + "71", "Enclavamiento: S1 pasa por KM2", "Al pulsar S1 la fase sale por el borne 4 y debe cruzar el contacto NC 71\u201372 de KM2. Si KM2 est\xE1 activo, ese contacto abre e impide que KM1 entre al mismo tiempo."],
  [K2 + "72", K1 + "A1", "Hacia la bobina de KM1", "Pasado el enclavamiento, la fase llega al borne A1 de la bobina de KM1."],
  [BT + "PILOTO_1", K1 + "A1", "L\xE1mpara de KM1 (P1)", "El piloto 1 toma la fase del mismo punto que la bobina: se enciende cuando KM1 est\xE1 activo. Su retorno a N se cablea m\xE1s adelante."],
  [BT + "S2:2", K1 + "13", "Retenci\xF3n de KM1: entrada", "El contacto auxiliar NA 13\u201314 de KM1 hace de memoria. Su entrada 13 recibe la fase desde S2:2, despu\xE9s del paro."],
  [K1 + "14", BT + "S1:4", "Retenci\xF3n de KM1: salida en paralelo con S1", "14 devuelve la fase a S1:4, en paralelo con el pulsador. Cuando KM1 entra, 13\u201314 cierra y mantiene la bobina aunque sueltes S1."],
  // — Mando de KM2 (marcha 2) —
  [BT + "S2:2", BT + "S3:3", "Del paro a marcha 2 (S3)", "Misma idea para el giro contrario: la fase protegida por el paro llega al borne 3 de S3 (verde derecho)."],
  [BT + "S3:4", K1 + "71", "Enclavamiento: S3 pasa por KM1", "Ahora la fase de S3 cruza el contacto NC 71\u201372 de KM1: con KM1 activo, KM2 no puede entrar."],
  [K1 + "72", K2 + "A1", "Hacia la bobina de KM2", "Pasado el enclavamiento, la fase llega a A1 de la bobina de KM2."],
  [BT + "PILOTO_4", K2 + "A1", "L\xE1mpara de KM2 (P4)", "El piloto 4 comparte punto con la bobina de KM2: indica que KM2 (giro inverso) est\xE1 activo."],
  [BT + "S2:2", K2 + "13", "Retenci\xF3n de KM2: entrada", "El NA 13\u201314 de KM2 hace la retenci\xF3n del giro inverso; 13 recibe la fase desde S2:2."],
  [K2 + "14", BT + "S3:4", "Retenci\xF3n de KM2: salida en paralelo con S3", "14 devuelve la fase a S3:4, en paralelo con el pulsador. KM2 queda retenido hasta que pulses S2."],
  // — Retornos y señalización —
  [K1 + "A2", FU + "N", "Retorno de la bobina de KM1", "A2 va al neutro N: la bobina de 24 V CA queda entre la fase (A1) y el neutro (A2)."],
  [K2 + "A2", FU + "N", "Retorno de la bobina de KM2", "Igual que KM1: A2 de KM2 va al neutro, de modo que su bobina de 24 V CA queda entre A1 (fase) y A2 (neutro)."],
  [BT + "N", FU + "N", "Neutro para las l\xE1mparas", "Los pilotos retornan por el borne N de las botoneras; \xFAnelo al neutro de la fuente para cerrar sus circuitos."],
  [FU + "F", K1 + "97", "Fase al aviso de t\xE9rmico disparado", "El contacto 97\u201398 de KM1 es NA: cierra cuando el rel\xE9 t\xE9rmico dispara. Alimenta 97 con la fase."],
  [K1 + "98", BT + "PILOTO_3", "L\xE1mpara de t\xE9rmico disparado (P3)", "Al disparar el t\xE9rmico, 97\u201398 cierra y enciende el piloto 3 (amarillo)."],
  [K1 + "96", K1 + "81", "Fase de reposo hacia la cadena de avisos", "Desde 96 (fase si el t\xE9rmico est\xE1 bien) se arma una cadena de contactos NC: primero el 81\u201382 de KM1."],
  [K1 + "82", K2 + "81", "Cadena de reposo: de KM1 a KM2", "La fase sigue por el NC 81\u201382 de KM2. Solo llegar\xE1 al final si ninguno de los dos contactores est\xE1 activo."],
  [K2 + "82", BT + "PILOTO_2", "L\xE1mpara de reposo (P2)", "El piloto 2 (rojo) se enciende \xFAnicamente con KM1 y KM2 en reposo y el t\xE9rmico sano."],
  // — Fuerza —
  [FU + "R", K1 + "L1", "Fuerza: R a KM1", "Las tres fases entran al contactor de giro directo. R va a L1."],
  [FU + "S", K1 + "L2", "Fuerza: S a KM1", "La fase S (negra) va a L2. Mant\xE9n el orden R\u2013S\u2013T en L1\u2013L2\u2013L3 para que el giro directo sea el esperado."],
  [FU + "T", K1 + "L3", "Fuerza: T a KM1", "La fase T (roja) va a L3. Con las tres fases en KM1 ya solo falta que su bobina cierre los contactos."],
  [K1 + "L1", K2 + "L1", "Las mismas fases a KM2: L1", "KM2 recibe las fases en el mismo orden que KM1; el cambio de giro se hace a la salida."],
  [K1 + "L2", K2 + "L2", "Las mismas fases a KM2: L2", "La fase S tambi\xE9n llega a L2 de KM2, tomada de L2 de KM1 (la fase central no se intercambia despu\xE9s)."],
  [K1 + "L3", K2 + "L3", "Las mismas fases a KM2: L3", "La fase T llega a L3 de KM2. Con las tres fases en KM2, solo falta cruzar dos a su salida."],
  [K1 + "T1", MO + "U1", "KM1 al motor: U1", "Con KM1 el motor recibe R, S y T en U1, V1 y W1: giro directo."],
  [K1 + "T2", MO + "V1", "KM1 al motor: V1", "T2 (negro) va a V1: la fase S queda en el borne central del motor."],
  [K1 + "T3", MO + "W1", "KM1 al motor: W1", "T3 (rojo) va a W1. Con KM1 cerrado el motor recibe R\u2013S\u2013T en U1\u2013V1\u2013W1."],
  [K2 + "T1", K1 + "T3", "KM2 invierte: T1 a W1", "Para invertir el giro basta intercambiar dos fases. La salida T1 de KM2 (fase R) se une con T3 de KM1, que va a W1."],
  [K2 + "T3", K1 + "T1", "KM2 invierte: T3 a U1", "La salida T3 de KM2 (fase T) se une con T1 de KM1, que va a U1. Con KM2 activo el motor recibe T, S y R: gira al rev\xE9s."],
  [K2 + "T2", K1 + "T2", "KM2: T2 queda igual", "La fase central no se cambia: T2 de KM2 con T2 de KM1."],
  [MO + "W2", MO + "U2", "Motor en estrella (1)", "Unir W2 con U2 es la primera mitad del puente de estrella."],
  [MO + "V2", MO + "U2", "Motor en estrella (2)", "Con W2, U2 y V2 unidos las tres bobinas quedan en estrella y el motor puede girar en los dos sentidos."],
  // — Tierras de protección —
  [MO + "TP", K2 + "TP_DER", "Tierra del motor", "Las tierras de protecci\xF3n (TP, verdes) se unen entre los m\xF3dulos y terminan en la tierra de la fuente. No cambian el funcionamiento del simulador."],
  [K2 + "TP_IZQ", K1 + "TP_DER", "Tierra entre KM2 y KM1", "Contin\xFAa la cadena de tierras: la tierra izquierda de KM2 se une con la tierra derecha de KM1."],
  [K1 + "TP_DER", FU + "TP", "Tierra de KM1 a la fuente", "La cadena llega a la tierra de protecci\xF3n de la fuente."],
  [K2 + "TP_DER", K2 + "TP_IZQ", "Tierra de KM2: lado derecho", "Une las dos tierras del m\xF3dulo de KM2 entre s\xED, de modo que toda la hilera de tierras queda unida."],
  [BT + "TP_DER", FU + "TP", "Tierra de las botoneras", "\xDAltima conexi\xF3n: las botoneras tambi\xE9n quedan a tierra."]
];
var SIMPLE = [
  // — Mando de KM1 —
  [FU + "F", K1 + "95", "Fase al mando por el t\xE9rmico", "La fase F entra al mando pasando por el contacto 95\u201396 del rel\xE9 t\xE9rmico, que es NC. Si el t\xE9rmico dispara, este contacto abre y corta todo el mando."],
  [K1 + "96", K1 + "71", "Fase hacia el aviso de reposo", "Desde 96 (hay fase mientras el t\xE9rmico est\xE9 sano) se alimenta el contacto NC 71\u201372 de KM1. Cuando KM1 est\xE9 en reposo, ese contacto estar\xE1 cerrado."],
  [K1 + "72", BT + "PILOTO_2", "L\xE1mpara de reposo (P2)", "El piloto 2 (rojo) se enciende solo con KM1 en reposo: la fase llega por 71\u201372, que est\xE1 cerrado. Cuando KM1 entra, 71\u201372 abre y P2 se apaga."],
  [BT + "N", FU + "N", "Neutro para las l\xE1mparas", "Los pilotos retornan por el borne N de las botoneras; \xFAnelo al neutro de la fuente para cerrar sus circuitos."],
  [K1 + "96", BT + "S2:1", "Del t\xE9rmico al paro (S2)", "Desde 96 la fase va al pulsador rojo S2. Su contacto 1\u20132 es NC: el mando queda alimentado mientras no pulses el paro."],
  [BT + "S2:2", BT + "S1:3", "Del paro a la marcha (S1)", "S2:2 es el punto \xABprotegido por el paro\xBB: todo lo que sale de aqu\xED se apaga al pulsar S2. Ll\xE9valo al borne 3 de S1 (verde izquierdo), contacto NA 3\u20134."],
  [BT + "S1:4", K1 + "A1", "A la bobina de KM1", "Al pulsar S1 la fase sale por el borne 4 y llega a A1, el borne de la bobina de KM1."],
  [K1 + "A2", FU + "N", "Retorno de la bobina", "A2 va al neutro N: la bobina de 24 V CA queda entre la fase (A1) y el neutro (A2). Con S1 pulsado, KM1 ya deber\xEDa entrar."],
  [BT + "S2:2", K1 + "13", "Retenci\xF3n: entrada", "El contacto auxiliar NA 13\u201314 de KM1 hace de memoria. Su entrada 13 recibe la fase desde S2:2, despu\xE9s del paro."],
  [K1 + "14", BT + "S1:4", "Retenci\xF3n: salida en paralelo con S1", "14 devuelve la fase a S1:4, en paralelo con el pulsador. Cuando KM1 entra, 13\u201314 cierra y mantiene la bobina aunque sueltes S1; solo el paro la suelta."],
  [K1 + "A1", BT + "PILOTO_1", "L\xE1mpara de KM1 (P1)", "El piloto 1 toma la fase del mismo punto que la bobina: se enciende cuando KM1 est\xE1 activo."],
  [FU + "F", K1 + "97", "Fase al aviso de t\xE9rmico disparado", "El contacto 97\u201398 de KM1 es NA: cierra cuando el rel\xE9 t\xE9rmico dispara. Alimenta 97 con la fase."],
  [K1 + "98", BT + "PILOTO_3", "L\xE1mpara de t\xE9rmico disparado (P3)", "Al disparar el t\xE9rmico, 97\u201398 cierra y enciende el piloto 3 (amarillo)."],
  // — Fuerza —
  [FU + "R", K1 + "L1", "Fuerza: R a KM1", "Las tres fases entran al contactor. R (azul) va a L1."],
  [FU + "S", K1 + "L2", "Fuerza: S a KM1", "La fase S (negra) va a L2. Mant\xE9n el orden R\u2013S\u2013T en L1\u2013L2\u2013L3."],
  [FU + "T", K1 + "L3", "Fuerza: T a KM1", "La fase T (roja) va a L3. Con las tres fases en KM1, solo falta que su bobina cierre los contactos."],
  [K1 + "T1", MO + "U1", "KM1 al motor: U1", "Con KM1 cerrado, T1 entrega la fase R al borne U1 del motor."],
  [K1 + "T2", MO + "V1", "KM1 al motor: V1", "T2 (negro) va a V1: la fase S queda en el borne central del motor."],
  [K1 + "T3", MO + "W1", "KM1 al motor: W1", "T3 (rojo) va a W1. Con KM1 cerrado el motor recibe R\u2013S\u2013T en U1\u2013V1\u2013W1."],
  [MO + "W2", MO + "U2", "Motor en estrella (1)", "Unir W2 con U2 es la primera mitad del puente de estrella."],
  [MO + "V2", MO + "U2", "Motor en estrella (2)", "Con W2, U2 y V2 unidos las tres bobinas quedan en estrella y el motor puede girar."],
  // — Tierras de protección —
  [MO + "TP", K1 + "TP_DER", "Tierra del motor", "Las tierras de protecci\xF3n (TP, verdes) se unen entre los m\xF3dulos y terminan en la tierra de la fuente. No cambian el funcionamiento del simulador."],
  [K1 + "TP_DER", FU + "TP", "Tierra de KM1 a la fuente", "La cadena llega a la tierra de protecci\xF3n de la fuente."],
  [BT + "TP_DER", FU + "TP", "Tierra de las botoneras", "\xDAltima conexi\xF3n: las botoneras tambi\xE9n quedan a tierra."]
];
var point = (id) => {
  const [module, ...rest] = id.split(":"), terminal = rest.join(":"), found = leccionInversion_layout_default.modules.find((m) => m.id === module)?.terminals.find((t) => t.id === terminal);
  if (!found) throw new Error(`Terminal sin posici\xF3n en el mapa de la lecci\xF3n: ${id}`);
  return found;
};
var clamp = (v) => Math.max(0, Math.min(1e3, v));
function regionFor(from, to) {
  const a = point(from), b = point(to), pad = 62, x0 = Math.min(a.x, b.x) - pad, x1 = Math.max(a.x, b.x) + pad, y0 = Math.min(a.y, b.y) - pad, y1 = Math.max(a.y, b.y) + pad;
  const nx = (v) => clamp(v / leccionInversion_layout_default.width * 1e3), ny = (v) => clamp(v / leccionInversion_layout_default.height * 1e3);
  return { x: Math.round(nx(x0)), y: Math.round(ny(y0)), w: Math.round(nx(x1) - nx(x0)), h: Math.round(ny(y1) - ny(y0)) };
}
function buildLesson(id, schematic, title, summary, diagram, seeds) {
  return {
    id,
    schematic,
    title,
    summary,
    diagram,
    pairs: seeds.map(([from, to]) => [from, to]),
    steps: seeds.map(([from, to, stepTitle, explanation], i) => ({ id: `${id}-${String(i + 1).padStart(2, "0")}`, title: stepTitle, from, to, region: regionFor(from, to), explanation, review: "user_reviewed" }))
  };
}
var INVERSION_LESSON = buildLesson(
  "inversion",
  "inversion",
  "Lecci\xF3n \xB7 Inversi\xF3n de giro con enclavamiento",
  "Marcha 1 (KM1), marcha 2 (KM2) y paro, con enclavamiento y l\xE1mparas. Basada en el circuito armado por un compa\xF1ero.",
  { id: "leccion-inversion-giro", name: "Mapa de bornes \xB7 inversi\xF3n de giro", src: "/diagrams/leccion-inversion-giro.png", origin: "class_photo" },
  INVERSION
);
var SIMPLE_LESSON = buildLesson(
  "simple",
  "simple",
  "Lecci\xF3n \xB7 Marcha y paro con retenci\xF3n",
  "El circuito m\xE1s simple del banco: un contactor (KM1 con t\xE9rmico), marcha, paro, retenci\xF3n y l\xE1mparas. Armado por un compa\xF1ero.",
  { id: "leccion-marcha-paro", name: "Mapa de bornes \xB7 marcha y paro", src: "/diagrams/leccion-marcha-paro.png", origin: "class_photo" },
  SIMPLE
);
function buildStarLesson(id) {
  const source2 = starDeltaSources_default[id];
  const pairs = source2.pairs;
  return {
    id,
    schematic: id,
    title: `Lecci\xF3n \xB7 ${source2.title}`,
    summary: source2.summary,
    needs: ["CONTACTOR_TRIFASICO_3"],
    diagram: { id: `leccion-${id}`, name: source2.title, src: `/diagrams/leccion-${id === "estrellaManual" ? "estrella-manual" : "estrella-temporizador"}.png`, origin: "class_photo" },
    pairs,
    steps: pairs.map(([from, to], i) => {
      const detail = starDetail(id, from, to);
      return { id: `${id}-${String(i + 1).padStart(2, "0")}`, from, to, title: detail.title, explanation: detail.why, review: "user_reviewed", region: { x: 0, y: 0, w: 1e3, h: 1e3 } };
    })
  };
}
var STAR_MANUAL_LESSON = buildStarLesson("estrellaManual");
var STAR_TIMER_LESSON = buildStarLesson("estrellaTimer");
var LESSON_MAP_RATIO = leccionInversion_layout_default.height / leccionInversion_layout_default.width;

// src/data/simulation.ts
var contactorIds = () => MODULES.filter((m) => m.category === "contactores").map((m) => m.id);
var timerIds = () => MODULES.filter((m) => m.category === "temporizadores").map((m) => m.id);
var relayIds = () => [...contactorIds(), ...timerIds()];
var OFF_RELAYS = () => Object.fromEntries(relayIds().map((id) => [id, false]));
var sameRelays = (a, b) => relayIds().every((id) => !!a[id] === !!b[id]);
var emptySimulation = () => ({ enabled: false, plugged: false, forceBreaker: false, breakers: [false, false], pressed: [], thermalTripped: false });
var IDLE_MOTOR = { status: "off", connection: null, direction: 1, speed: 0, message: "Sin tensi\xF3n de fuerza.", lines: [null, null, null] };
function simulationContacts(input, relays, timed = []) {
  const pairs = [];
  for (const s of ["S1", "S2", "S3"]) pairs.push(input.pressed.includes(s) ? [`BOTONERAS:${s}:3`, `BOTONERAS:${s}:4`] : [`BOTONERAS:${s}:1`, `BOTONERAS:${s}:2`]);
  for (const id of contactorIds()) {
    const closed = !!relays[id];
    for (const [a, b] of closed ? [["13", "14"], ["63", "64"], ["93", "94"]] : [["71", "72"], ["81", "82"]]) pairs.push([`${id}:${a}`, `${id}:${b}`]);
    if (closed && (id !== "CONTACTOR_TERMICO" || !input.thermalTripped)) for (const i of [1, 2, 3]) pairs.push([`${id}:L${i}`, `${id}:T${i}`]);
  }
  for (const id of timerIds()) {
    const on = !!relays[id], done = on && timed.includes(id);
    if (on) pairs.push([`${id}:13`, `${id}:14`]);
    pairs.push(done ? [`${id}:67`, `${id}:68`] : [`${id}:55`, `${id}:56`]);
  }
  pairs.push(input.thermalTripped ? ["CONTACTOR_TERMICO:97", "CONTACTOR_TERMICO:98"] : ["CONTACTOR_TERMICO:95", "CONTACTOR_TERMICO:96"]);
  return pairs;
}
function graph(wires, pairs) {
  const parent = new Map(TERMINALS.map((t) => [t.key, t.key]));
  const root = (id) => {
    const p = parent.get(id);
    if (!p) return id;
    if (p !== id) parent.set(id, root(p));
    return parent.get(id);
  };
  const join = (a, b) => {
    if (parent.has(a) && parent.has(b)) parent.set(root(b), root(a));
  };
  wires.forEach((w) => join(w.from.terminalId, w.to.terminalId));
  pairs.forEach(([a, b]) => join(a, b));
  const phase = root("FUENTE:F"), neutral = root("FUENTE:N"), phases = ["FUENTE:R", "FUENTE:S", "FUENTE:T"].map(root);
  const voltage = (a, b) => phase !== neutral && (root(a) === phase && root(b) === neutral || root(a) === neutral && root(b) === phase);
  return { root, phase, neutral, phases, voltage };
}
function solveControl(wires, input, previous = OFF_RELAYS(), timed = []) {
  const off = (fault = null) => ({ powered: false, fault, relays: OFF_RELAYS(), pilots: [false, false, false, false], liveTerminals: [], liveWireIds: [], closedContacts: [] });
  if (!input.enabled || !input.plugged || !input.breakers.every(Boolean)) return off();
  let relays = { ...previous };
  const seen = /* @__PURE__ */ new Set();
  for (let i = 0; i < 16; i++) {
    const ids = relayIds(), signature = ids.map((id) => Number(!!relays[id])).join("");
    if (seen.has(signature)) return off("unstable");
    seen.add(signature);
    const contacts = simulationContacts(input, relays, timed), g = graph(wires, contacts);
    if (g.phase === g.neutral) return off("short");
    const next = Object.fromEntries(ids.map((id) => [id, g.voltage(`${id}:A1`, `${id}:A2`)]));
    if (ids.every((id) => next[id] === !!relays[id])) {
      const pilots = [1, 2, 3, 4].map((n) => g.voltage(`BOTONERAS:PILOTO_${n}`, "BOTONERAS:N"));
      const liveTerminals = TERMINALS.filter((t) => g.root(t.key) === g.phase).map((t) => t.key);
      return { powered: true, fault: null, relays, pilots, liveTerminals, liveWireIds: wires.filter((w) => liveTerminals.includes(w.from.terminalId)).map((w) => w.id), closedContacts: contacts };
    }
    relays = next;
  }
  return off("unstable");
}
var MOTOR = "BORNERA_MOTOR:";
var SEQUENCES = ["RST", "STR", "TRS"];
function solveMotor(wires, input, relays, timed = []) {
  const idle = (message, status = "off") => ({ motor: { ...IDLE_MOTOR, status, message }, live: [] });
  if (!input.enabled) return idle("Simulaci\xF3n detenida.");
  if (!input.plugged) return idle("Enchufa la corriente virtual en el m\xF3dulo de alimentaci\xF3n.");
  if (!input.forceBreaker) return idle("Cierra el interruptor FUERZA para energizar R, S y T.");
  const g = graph(wires, simulationContacts(input, relays, timed)), [r, s, t] = g.phases;
  if ((/* @__PURE__ */ new Set([r, s, t])).size < 3) return idle("Cortocircuito entre fases: alg\xFAn cable une R, S o T. Ret\xEDralo.", "fault");
  const label = (id) => {
    const x = g.root(MOTOR + id);
    return x === r ? "R" : x === s ? "S" : x === t ? "T" : null;
  };
  const live = TERMINALS.filter((x) => [r, s, t].includes(g.root(x.key))).map((x) => x.key);
  const lines = ["U1", "V1", "W1"].map(label), ends = ["U2", "V2", "W2"].map(label);
  const same = (a, b) => g.root(MOTOR + a) === g.root(MOTOR + b);
  const fed = lines.filter(Boolean).length;
  if (!fed && !ends.some(Boolean)) return { motor: { ...IDLE_MOTOR, message: "El motor no recibe tensi\xF3n: lleva R, S y T al contactor y su salida a U1, V1 y W1." }, live };
  if (fed < 3) return { motor: { ...IDLE_MOTOR, status: "fault", lines, message: `Falta una fase: solo ${fed} de los 3 bornes U1, V1 y W1 reciben tensi\xF3n.` }, live };
  if (new Set(lines).size < 3) return { motor: { ...IDLE_MOTOR, status: "fault", lines, message: "Dos bornes reciben la misma fase: el motor necesita R, S y T distintas." }, live };
  const direction = SEQUENCES.includes(lines.join("")) ? 1 : -1;
  const star = same("U2", "V2") && same("V2", "W2") && ends.every((e) => e === null);
  const delta = same("U1", "W2") && same("V1", "U2") && same("W1", "V2");
  if (star) return { motor: { status: "running", connection: "star", direction, speed: 0.55, message: "Girando en estrella: cada bobina recibe tensi\xF3n reducida.", lines }, live };
  if (delta) return { motor: { status: "running", connection: "delta", direction, speed: 1, message: "Girando en tri\xE1ngulo: cada bobina recibe la tensi\xF3n de l\xEDnea.", lines }, live };
  return { motor: { ...IDLE_MOTOR, status: "fault", lines, message: "Bobinas sin cerrar: une W2-U2-V2 (estrella) o U1-W2, V1-U2 y W1-V2 (tri\xE1ngulo)." }, live };
}
function solveSimulation(wires, input, previous = OFF_RELAYS(), timed = []) {
  const base = solveControl(wires, input, previous, timed), force = solveMotor(wires, input, base.relays, timed);
  if (!force.live.length) return { ...base, motor: force.motor };
  const liveTerminals = [.../* @__PURE__ */ new Set([...base.liveTerminals, ...force.live])];
  return { ...base, motor: force.motor, liveTerminals, liveWireIds: wires.filter((w) => liveTerminals.includes(w.from.terminalId)).map((w) => w.id) };
}
var SIMULATION_EXAMPLES = {
  lamp: { title: "Piloto con pulsador", pairs: [["FUENTE:F", "BOTONERAS:S3:3"], ["BOTONERAS:S3:4", "BOTONERAS:PILOTO_4"], ["FUENTE:N", "BOTONERAS:N"]] },
  hold: { title: "Marcha, mantenimiento y parada", pairs: [
    ["FUENTE:F", "CONTACTOR_TERMICO:95"],
    ["CONTACTOR_TERMICO:96", "BOTONERAS:S2:1"],
    ["BOTONERAS:S2:2", "BOTONERAS:S3:3"],
    ["BOTONERAS:S3:3", "CONTACTOR_TERMICO:13"],
    ["BOTONERAS:S3:4", "CONTACTOR_TERMICO:14"],
    ["CONTACTOR_TERMICO:14", "CONTACTOR_TERMICO:A1"],
    ["CONTACTOR_TERMICO:A1", "BOTONERAS:PILOTO_4"],
    ["CONTACTOR_TERMICO:A2", "FUENTE:N"],
    ["FUENTE:N", "BOTONERAS:N"],
    ["CONTACTOR_TERMICO:96", "CONTACTOR_TERMICO:71"],
    ["CONTACTOR_TERMICO:72", "BOTONERAS:PILOTO_2"],
    ["FUENTE:F", "CONTACTOR_TERMICO:97"],
    ["CONTACTOR_TERMICO:98", "BOTONERAS:PILOTO_3"]
  ] },
  motor: { title: "Arranque del motor con KM1", pairs: [
    ["FUENTE:F", "CONTACTOR_TERMICO:95"],
    ["CONTACTOR_TERMICO:96", "BOTONERAS:S2:1"],
    ["BOTONERAS:S2:2", "BOTONERAS:S3:3"],
    ["BOTONERAS:S3:3", "CONTACTOR_TERMICO:13"],
    ["BOTONERAS:S3:4", "CONTACTOR_TERMICO:14"],
    ["CONTACTOR_TERMICO:14", "CONTACTOR_TERMICO:A1"],
    ["CONTACTOR_TERMICO:A2", "FUENTE:N"],
    ["FUENTE:N", "BOTONERAS:N"],
    ["FUENTE:R", "CONTACTOR_TERMICO:L1"],
    ["FUENTE:S", "CONTACTOR_TERMICO:L2"],
    ["FUENTE:T", "CONTACTOR_TERMICO:L3"],
    ["CONTACTOR_TERMICO:T1", "BORNERA_MOTOR:U1"],
    ["CONTACTOR_TERMICO:T2", "BORNERA_MOTOR:V1"],
    ["CONTACTOR_TERMICO:T3", "BORNERA_MOTOR:W1"],
    ["BORNERA_MOTOR:W2", "BORNERA_MOTOR:U2"],
    ["BORNERA_MOTOR:U2", "BORNERA_MOTOR:V2"]
  ] },
  motorRev: { title: "Motor con giro invertido (dos fases cruzadas)", pairs: [
    ["FUENTE:F", "CONTACTOR_TERMICO:95"],
    ["CONTACTOR_TERMICO:96", "BOTONERAS:S2:1"],
    ["BOTONERAS:S2:2", "BOTONERAS:S3:3"],
    ["BOTONERAS:S3:3", "CONTACTOR_TERMICO:13"],
    ["BOTONERAS:S3:4", "CONTACTOR_TERMICO:14"],
    ["CONTACTOR_TERMICO:14", "CONTACTOR_TERMICO:A1"],
    ["CONTACTOR_TERMICO:A2", "FUENTE:N"],
    ["FUENTE:N", "BOTONERAS:N"],
    ["FUENTE:R", "CONTACTOR_TERMICO:L1"],
    ["FUENTE:S", "CONTACTOR_TERMICO:L2"],
    ["FUENTE:T", "CONTACTOR_TERMICO:L3"],
    ["CONTACTOR_TERMICO:T1", "BORNERA_MOTOR:V1"],
    ["CONTACTOR_TERMICO:T2", "BORNERA_MOTOR:U1"],
    ["CONTACTOR_TERMICO:T3", "BORNERA_MOTOR:W1"],
    ["BORNERA_MOTOR:W2", "BORNERA_MOTOR:U2"],
    ["BORNERA_MOTOR:U2", "BORNERA_MOTOR:V2"]
  ] },
  simple: { title: "Marcha y paro con retenci\xF3n (el m\xE1s simple, de un compa\xF1ero)", pairs: SIMPLE_LESSON.pairs },
  inversion: { title: "Inversi\xF3n de giro con enclavamiento y paro (circuito de un compa\xF1ero)", pairs: INVERSION_LESSON.pairs },
  starDelta: { title: "Arranque estrella-tri\xE1ngulo con temporizador", needs: ["CONTACTOR_TRIFASICO_3"], pairs: [
    // Mando: F → térmico → parada → marcha con retención en KM1. KM1:14 alimenta al temporizador y a los dos contactores de conmutación.
    ["FUENTE:F", "CONTACTOR_TERMICO:95"],
    ["CONTACTOR_TERMICO:96", "BOTONERAS:S2:1"],
    ["BOTONERAS:S2:2", "BOTONERAS:S3:3"],
    ["BOTONERAS:S3:3", "CONTACTOR_TERMICO:13"],
    ["BOTONERAS:S3:4", "CONTACTOR_TERMICO:14"],
    ["CONTACTOR_TERMICO:14", "CONTACTOR_TERMICO:A1"],
    ["CONTACTOR_TERMICO:A2", "FUENTE:N"],
    ["FUENTE:N", "BOTONERAS:N"],
    ["CONTACTOR_TERMICO:14", "TEMPORIZADOR_1:A1"],
    ["TEMPORIZADOR_1:A2", "FUENTE:N"],
    // Estrella (KM3): KT 55-56 (cae al terminar el retardo) y enclavamiento con KM2 71-72
    ["CONTACTOR_TERMICO:14", "TEMPORIZADOR_1:55"],
    ["TEMPORIZADOR_1:56", "CONTACTOR_TRIFASICO:71"],
    ["CONTACTOR_TRIFASICO:72", "CONTACTOR_TRIFASICO_3:A1"],
    ["CONTACTOR_TRIFASICO_3:A2", "FUENTE:N"],
    // Triángulo (KM2): KT 67-68 (cierra al terminar) y enclavamiento con KM3 71-72
    ["CONTACTOR_TERMICO:14", "TEMPORIZADOR_1:67"],
    ["TEMPORIZADOR_1:68", "CONTACTOR_TRIFASICO_3:71"],
    ["CONTACTOR_TRIFASICO_3:72", "CONTACTOR_TRIFASICO:A1"],
    ["CONTACTOR_TRIFASICO:A2", "FUENTE:N"],
    // Fuerza: KM1 alimenta U1 V1 W1
    ["FUENTE:R", "CONTACTOR_TERMICO:L1"],
    ["FUENTE:S", "CONTACTOR_TERMICO:L2"],
    ["FUENTE:T", "CONTACTOR_TERMICO:L3"],
    ["CONTACTOR_TERMICO:T1", "BORNERA_MOTOR:U1"],
    ["CONTACTOR_TERMICO:T2", "BORNERA_MOTOR:V1"],
    ["CONTACTOR_TERMICO:T3", "BORNERA_MOTOR:W1"],
    // Triángulo: KM2 une U1-W2, V1-U2, W1-V2
    ["BORNERA_MOTOR:U1", "CONTACTOR_TRIFASICO:L1"],
    ["BORNERA_MOTOR:V1", "CONTACTOR_TRIFASICO:L2"],
    ["BORNERA_MOTOR:W1", "CONTACTOR_TRIFASICO:L3"],
    ["CONTACTOR_TRIFASICO:T1", "BORNERA_MOTOR:W2"],
    ["CONTACTOR_TRIFASICO:T2", "BORNERA_MOTOR:U2"],
    ["CONTACTOR_TRIFASICO:T3", "BORNERA_MOTOR:V2"],
    // Estrella: KM3 cierra W2-U2-V2 entre sí
    ["BORNERA_MOTOR:W2", "CONTACTOR_TRIFASICO_3:L1"],
    ["BORNERA_MOTOR:U2", "CONTACTOR_TRIFASICO_3:L2"],
    ["BORNERA_MOTOR:V2", "CONTACTOR_TRIFASICO_3:L3"],
    ["CONTACTOR_TRIFASICO_3:T1", "CONTACTOR_TRIFASICO_3:T2"],
    ["CONTACTOR_TRIFASICO_3:T2", "CONTACTOR_TRIFASICO_3:T3"]
  ] },
  motorDelta: { title: "Motor en tri\xE1ngulo", pairs: [
    ["FUENTE:F", "CONTACTOR_TERMICO:95"],
    ["CONTACTOR_TERMICO:96", "BOTONERAS:S2:1"],
    ["BOTONERAS:S2:2", "BOTONERAS:S3:3"],
    ["BOTONERAS:S3:3", "CONTACTOR_TERMICO:13"],
    ["BOTONERAS:S3:4", "CONTACTOR_TERMICO:14"],
    ["CONTACTOR_TERMICO:14", "CONTACTOR_TERMICO:A1"],
    ["CONTACTOR_TERMICO:A2", "FUENTE:N"],
    ["FUENTE:N", "BOTONERAS:N"],
    ["FUENTE:R", "CONTACTOR_TERMICO:L1"],
    ["FUENTE:S", "CONTACTOR_TERMICO:L2"],
    ["FUENTE:T", "CONTACTOR_TERMICO:L3"],
    ["CONTACTOR_TERMICO:T1", "BORNERA_MOTOR:U1"],
    ["CONTACTOR_TERMICO:T2", "BORNERA_MOTOR:V1"],
    ["CONTACTOR_TERMICO:T3", "BORNERA_MOTOR:W1"],
    ["BORNERA_MOTOR:U1", "BORNERA_MOTOR:W2"],
    ["BORNERA_MOTOR:V1", "BORNERA_MOTOR:U2"],
    ["BORNERA_MOTOR:W1", "BORNERA_MOTOR:V2"]
  ] }
};
export {
  IDLE_MOTOR,
  OFF_RELAYS,
  SIMULATION_EXAMPLES,
  contactorIds,
  emptySimulation,
  relayIds,
  sameRelays,
  simulationContacts,
  solveSimulation,
  timerIds
};
