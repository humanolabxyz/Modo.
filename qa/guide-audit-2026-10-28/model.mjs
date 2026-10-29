// src/data/machineGuideCoverage.ts
var MACHINE_GUIDE_SOURCE = {
  url: "/activities/actividad-2-unidad-2.pdf",
  sha256: "49775a14bcb23af18ac3fb07cfcafa1cf5041cd032e5fe363b0682d2265dc0da",
  pages: 13,
  workbook: "/estudio?curso=s2-2&clase=cm-actividad-2-u2"
};
var MACHINE_GUIDE_COVERAGE = [
  { point: 1, title: "Seguridad y puesto sin energ\xEDa", where: "Cuaderno: EPP y seguridad presencial; inicio virtual desenergizado.", steps: [] },
  { point: 2, title: "Interpretar mando y fuerza", where: "Motor y esquema, referencia PDF y explicaci\xF3n del cuaderno.", steps: [] },
  { point: 3, title: "Revisar los elementos del puesto", where: "Inventario del cuaderno; la disponibilidad f\xEDsica se revisa con el docente.", steps: [] },
  { point: 4, title: "Montar y comprobar el mando", where: "Montaje y continuidad virtual; revisi\xF3n f\xEDsica con el docente.", steps: ["thermal", "stop", "start-open", "contact-ohms"] },
  { point: 5, title: "Medir alimentaci\xF3n del mando", where: "Voltaje F\u2013N; equivalente virtual de 24 V~.", steps: ["control-volts"] },
  { point: 6, title: "Comprobar reposo y se\xF1alizaci\xF3n", where: "En dos contactores las bobinas y pilotos est\xE1n apagados; P2 no est\xE1 cableado.", steps: ["control-rest"] },
  { point: 7, title: "Dar marcha en estrella, solo mando", where: "S1 activa KT1 y KM2; P1 indica estrella.", steps: ["control-star"] },
  { point: 8, title: "Cambiar el mando a tri\xE1ngulo", where: "Cambio temporizado a KM1 y piloto P4, en vez de SB3 manual.", steps: ["control-delta"] },
  { point: 9, title: "TEST del t\xE9rmico en el mando", where: "Corte de bobinas y P3 de disparo; P2 no est\xE1 cableado.", steps: ["control-trip"] },
  { point: 10, title: "RESET del mando", where: "Rearme sin marcha autom\xE1tica; pilotos apagados en este montaje.", steps: ["control-reset"] },
  { point: 11, title: "Comprobar el circuito de fuerza", where: "Motor conectado desde el inicio; comprobaci\xF3n de continuidad sin alimentaci\xF3n antes de habilitar fuerza.", steps: ["force-continuity"] },
  { point: 12, title: "Tabla 1 \xB7 tensi\xF3n entre fases", where: "R\u2013S, R\u2013T y S\u2013T.", steps: ["line-RS", "line-RT", "line-ST"] },
  { point: 13, title: "Reposo con mando y fuerza", where: "Motor y bobinas en reposo; sin piloto P2 en el montaje de dos contactores.", steps: ["powered-rest"] },
  { point: 14, title: "Arrancar el motor en estrella", where: "S1 activa KT1 y KM2, con el circuito de fuerza habilitado.", steps: ["start-star"] },
  { point: 15, title: "Tabla 3 \xB7 voltajes en estrella", where: "U1\u2013U2, V1\u2013V2 y W1\u2013W2.", steps: ["star-U", "star-V", "star-W"] },
  { point: 16, title: "Tabla 4 \xB7 corrientes en estrella", where: "Pinza en R, S y T antes de sus derivaciones.", steps: ["star-current-R", "star-current-S", "star-current-T"] },
  { point: 17, title: "Cambiar el motor a tri\xE1ngulo", where: "Cambio autom\xE1tico temporizado en el montaje actual.", steps: ["change-delta"] },
  { point: 18, title: "Tabla 5 \xB7 voltajes en tri\xE1ngulo", where: "U1\u2013U2, V1\u2013V2 y W1\u2013W2.", steps: ["delta-U", "delta-V", "delta-W"] },
  { point: 19, title: "Tabla 6 \xB7 corrientes en tri\xE1ngulo", where: "Pinza en R, S y T antes de sus derivaciones.", steps: ["delta-current-R", "delta-current-S", "delta-current-T"] },
  { point: 20, title: "Comparar voltajes y corrientes", where: "Relaciones V\u0394/VY e I\u0394/IY y explicaci\xF3n de resultados.", steps: ["compare"] },
  { point: 21, title: "Prueba de sobrecarga con el motor", where: "TEST desde tri\xE1ngulo, parada y piloto P3.", steps: ["overload"] },
  { point: 22, title: "Rearmar la protecci\xF3n", where: "RESET sin nueva orden de marcha.", steps: ["reset"] },
  { point: 23, title: "Solicitar revisi\xF3n al docente", where: "Cuaderno: resultados, observaciones y solicitud de revisi\xF3n; no se concede aprobaci\xF3n autom\xE1tica.", steps: [] },
  { point: 24, title: "Desenergizar el sistema", where: "Abrir CONTROL y FUERZA y desconectar el enchufe virtual.", steps: ["shutdown"] },
  { point: 25, title: "Desmontar y ordenar", where: "Desmontaje virtual y declaraci\xF3n del orden f\xEDsico en el cuaderno.", steps: ["dismantle"] }
];

// src/data/measurementProfiles.ts
var ACTIVITY_PROFILES = {
  manual: { title: "Circuito de la gu\xEDa \xB7 manual", detail: "KM1 principal, KM3 estrella y KM2 tri\xE1ngulo. S1 inicia, S3 cambia y S2 detiene; equivalen a SB2, SB3 y SB1 del profesor." },
  matias: { title: "Proyecto de Mat\xEDas \xB7 autom\xE1tico", detail: "45 cables originales. KT1 es principal, KM1 estrella y KM2 tri\xE1ngulo. S1 inicia y el temporizador cambia la conexi\xF3n. Para estudiar, el retardo se prepara en 60 s." },
  twoContactors: { title: "Panel de dos contactores \xB7 autom\xE1tico", detail: "37 cables del montaje recibido. KM2 conecta estrella y KM1 tri\xE1ngulo; KT1 es el conjunto de l\xEDnea temporizado. S1 inicia, S2 detiene y S3 no interviene. P1 indica estrella, P4 tri\xE1ngulo y P3 disparo; P2 no est\xE1 cableado." }
};
function activityRoles(profile) {
  return {
    main: profile === "manual" ? "CONTACTOR_TERMICO" : "TEMPORIZADOR_1",
    star: profile === "manual" ? "CONTACTOR_TRIFASICO_3" : profile === "twoContactors" ? "CONTACTOR_TRIFASICO" : "CONTACTOR_TERMICO",
    delta: profile === "twoContactors" ? "CONTACTOR_TERMICO" : "CONTACTOR_TRIFASICO",
    start: profile === "twoContactors" ? "S1" : "S1",
    automatic: profile !== "manual",
    restPilot: profile !== "twoContactors"
  };
}

// src/data/activityTrace.ts
function validActionProof(v) {
  const p = v;
  return !!p && p.version === 1 && Number.isInteger(p.eventId) && p.eventId > 0 && Number.isFinite(p.seconds) && p.seconds >= 0 && ["press", "test", "thermalReset", "timer"].includes(p.kind) && (p.control === void 0 || typeof p.control === "string" && p.control.length < 80) && typeof p.from === "string" && p.from.length < 50 && typeof p.to === "string" && p.to.length < 50;
}
var validConditions = (v) => {
  const c = v;
  return !!c && [c.simulationSeconds, c.lineVolts, c.frequencyHz, c.relayAmps].every(Number.isFinite) && c.simulationSeconds >= 0 && c.lineVolts > 0 && c.frequencyHz > 0 && c.relayAmps > 0 && typeof c.profile === "string" && c.profile.length <= 160 && [null, "star", "delta"].includes(c.connection);
};

// src/data/activity2Matias.json
var activity2Matias_default = {
  title: "Ejemplo virtual \xB7 Arranque estrella-tri\xE1ngulo con temporizador",
  wires: [
    {
      id: "cce54ab9-4f71-4c06-bfe6-5faa4ba14ab6",
      from: {
        terminalId: "FUENTE:F"
      },
      to: {
        terminalId: "CONTACTOR_TERMICO:95"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 1
    },
    {
      id: "90ad760e-5a45-40ee-ba70-8762e1935559",
      from: {
        terminalId: "CONTACTOR_TERMICO:96"
      },
      to: {
        terminalId: "BOTONERAS:S2:1"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 2
    },
    {
      id: "ec1a558f-35c0-41a4-8305-568fc4874ca4",
      from: {
        terminalId: "BOTONERAS:S2:2"
      },
      to: {
        terminalId: "BOTONERAS:S1:3"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 3
    },
    {
      id: "06ee4d18-2fdf-449b-be29-c645297972be",
      from: {
        terminalId: "BOTONERAS:S1:4"
      },
      to: {
        terminalId: "TEMPORIZADOR_1:A1"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 4
    },
    {
      id: "3241a752-925f-4ef8-94da-e6b05ce70c21",
      from: {
        terminalId: "TEMPORIZADOR_1:A2"
      },
      to: {
        terminalId: "FUENTE:N"
      },
      color: "#2978c8",
      route: {
        sag: 130
      },
      layer: 5
    },
    {
      id: "5100b61d-1ac4-4b75-8d83-f7b1b1c3c2f0",
      from: {
        terminalId: "BOTONERAS:S2:2"
      },
      to: {
        terminalId: "TEMPORIZADOR_1:13"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 7
    },
    {
      id: "f3bbad2c-05ee-48fe-af37-78254cd70a92",
      from: {
        terminalId: "TEMPORIZADOR_1:14"
      },
      to: {
        terminalId: "BOTONERAS:S1:4"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 8
    },
    {
      id: "f454b964-02f9-4e33-9374-00deae41d2f3",
      from: {
        terminalId: "BOTONERAS:S1:4"
      },
      to: {
        terminalId: "TEMPORIZADOR_1:55"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 9
    },
    {
      id: "6e80c1cb-ffa3-4158-bfd7-98f3aa44934f",
      from: {
        terminalId: "TEMPORIZADOR_1:56"
      },
      to: {
        terminalId: "CONTACTOR_TRIFASICO:71"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 10
    },
    {
      id: "e180980d-ce8b-4490-8a4e-65338f01f929",
      from: {
        terminalId: "CONTACTOR_TRIFASICO:72"
      },
      to: {
        terminalId: "CONTACTOR_TERMICO:A1"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 11
    },
    {
      id: "779250c0-c67e-4dd0-a3c9-5be31308196b",
      from: {
        terminalId: "CONTACTOR_TERMICO:A2"
      },
      to: {
        terminalId: "FUENTE:N"
      },
      color: "#2978c8",
      route: {
        sag: 130
      },
      layer: 12
    },
    {
      id: "dee86745-f7b3-47f0-8175-73f5ac01f546",
      from: {
        terminalId: "BOTONERAS:S1:4"
      },
      to: {
        terminalId: "TEMPORIZADOR_1:67"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 13
    },
    {
      id: "57e9fcfa-22e4-449e-89aa-265d000ef691",
      from: {
        terminalId: "TEMPORIZADOR_1:68"
      },
      to: {
        terminalId: "CONTACTOR_TERMICO:71"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 14
    },
    {
      id: "a9f54ed8-e362-4fa9-b0b7-de2c3c5ca582",
      from: {
        terminalId: "CONTACTOR_TERMICO:72"
      },
      to: {
        terminalId: "CONTACTOR_TRIFASICO:A1"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 15
    },
    {
      id: "e545aa2c-fc9b-4db9-a908-72115e5e342b",
      from: {
        terminalId: "CONTACTOR_TRIFASICO:A2"
      },
      to: {
        terminalId: "FUENTE:N"
      },
      color: "#2978c8",
      route: {
        sag: 130
      },
      layer: 16
    },
    {
      id: "95a76639-014b-4769-a742-89fe605013ad",
      from: {
        terminalId: "BOTONERAS:N"
      },
      to: {
        terminalId: "FUENTE:N"
      },
      color: "#2978c8",
      route: {
        sag: 130
      },
      layer: 17
    },
    {
      id: "939d360a-33a1-44b3-a712-a3a99f88a2e0",
      from: {
        terminalId: "FUENTE:R"
      },
      to: {
        terminalId: "CONTACTOR_TRIFASICO:L1"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 18
    },
    {
      id: "b46e148f-d522-4e35-a0d5-1e3fe3a23474",
      from: {
        terminalId: "FUENTE:S"
      },
      to: {
        terminalId: "CONTACTOR_TRIFASICO:L2"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 19
    },
    {
      id: "c791ebf2-b72a-4184-8159-8fc31270794d",
      from: {
        terminalId: "FUENTE:T"
      },
      to: {
        terminalId: "CONTACTOR_TRIFASICO:L3"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 20
    },
    {
      id: "ecc8b2e5-95ec-4396-bc8b-b74f0424e17c",
      from: {
        terminalId: "CONTACTOR_TRIFASICO:T1"
      },
      to: {
        terminalId: "BORNERA_MOTOR:W2"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 21
    },
    {
      id: "f1925e3e-9c54-438d-96e6-e0575f308bdc",
      from: {
        terminalId: "CONTACTOR_TRIFASICO:T2"
      },
      to: {
        terminalId: "BORNERA_MOTOR:U2"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 22
    },
    {
      id: "daf89e3f-e776-4593-ad8e-87c22b89847c",
      from: {
        terminalId: "CONTACTOR_TRIFASICO:T3"
      },
      to: {
        terminalId: "BORNERA_MOTOR:V2"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 23
    },
    {
      id: "8db2bb10-3d50-42fb-afb8-2b0995aed07b",
      from: {
        terminalId: "FUENTE:R"
      },
      to: {
        terminalId: "TEMPORIZADOR_1:L1"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 24
    },
    {
      id: "af86409f-7b50-41e9-883a-25c239896357",
      from: {
        terminalId: "FUENTE:S"
      },
      to: {
        terminalId: "TEMPORIZADOR_1:L2"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 25
    },
    {
      id: "aa59b0e6-07b8-4c3a-8fb3-fa84852f6437",
      from: {
        terminalId: "FUENTE:T"
      },
      to: {
        terminalId: "TEMPORIZADOR_1:L3"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 26
    },
    {
      id: "ac8b750f-de15-4014-bf26-0c10cf219385",
      from: {
        terminalId: "TEMPORIZADOR_1:T1"
      },
      to: {
        terminalId: "BORNERA_MOTOR:U1"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 27
    },
    {
      id: "27cad97c-1f58-4280-9f8e-08b43b922944",
      from: {
        terminalId: "TEMPORIZADOR_1:T2"
      },
      to: {
        terminalId: "BORNERA_MOTOR:V1"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 28
    },
    {
      id: "8bb21bdf-2623-4292-9536-4ebc7645d47d",
      from: {
        terminalId: "TEMPORIZADOR_1:T3"
      },
      to: {
        terminalId: "BORNERA_MOTOR:W1"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 29
    },
    {
      id: "b0c3ab15-8f7e-4637-af9b-d0f3efff3a87",
      from: {
        terminalId: "CONTACTOR_TERMICO:L1"
      },
      to: {
        terminalId: "CONTACTOR_TERMICO:L2"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 30
    },
    {
      id: "58425b64-8d58-4b5f-b8ac-6d4971d0c417",
      from: {
        terminalId: "CONTACTOR_TERMICO:L3"
      },
      to: {
        terminalId: "CONTACTOR_TERMICO:L2"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 31
    },
    {
      id: "53c6f415-b194-4c2e-bebb-bf692dc4302d",
      from: {
        terminalId: "CONTACTOR_TERMICO:T1"
      },
      to: {
        terminalId: "BORNERA_MOTOR:V2"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 32
    },
    {
      id: "4570c9e7-a50a-4a76-bd10-a194784a9d82",
      from: {
        terminalId: "CONTACTOR_TERMICO:T2"
      },
      to: {
        terminalId: "BORNERA_MOTOR:U2"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 33
    },
    {
      id: "114094af-6573-4afd-a819-14c9a52617e9",
      from: {
        terminalId: "CONTACTOR_TERMICO:T3"
      },
      to: {
        terminalId: "BORNERA_MOTOR:W2"
      },
      color: "#c53943",
      route: {
        sag: 130
      },
      layer: 34
    },
    {
      id: "c4c842ad-0724-4a63-b05d-21d9cdfd2d58",
      from: {
        terminalId: "BOTONERAS:PILOTO_2"
      },
      to: {
        terminalId: "CONTACTOR_TRIFASICO:82"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 35
    },
    {
      id: "b5cb3367-8960-47a9-83e4-bfe70b4a93d0",
      from: {
        terminalId: "CONTACTOR_TRIFASICO:81"
      },
      to: {
        terminalId: "CONTACTOR_TERMICO:82"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 36
    },
    {
      id: "f3aea82f-9b65-4073-b084-0314867160b7",
      from: {
        terminalId: "CONTACTOR_TERMICO:81"
      },
      to: {
        terminalId: "FUENTE:F"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 37
    },
    {
      id: "cf9d2be1-28c5-4a00-82b9-3ffc19bdebe9",
      from: {
        terminalId: "FUENTE:F"
      },
      to: {
        terminalId: "CONTACTOR_TERMICO:97"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 50
    },
    {
      id: "f9e898d9-d58d-421e-850f-522ecbd8a534",
      from: {
        terminalId: "CONTACTOR_TERMICO:98"
      },
      to: {
        terminalId: "BOTONERAS:PILOTO_3"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 51
    },
    {
      id: "38aeee8d-d557-461f-8483-4238b2f9e158",
      from: {
        terminalId: "TEMPORIZADOR_1:TP_DER"
      },
      to: {
        terminalId: "FUENTE:TP"
      },
      color: "#32834b",
      route: {
        sag: 130
      },
      layer: 53
    },
    {
      id: "2e154c3e-ce17-4f7e-8738-0882039e5dfa",
      from: {
        terminalId: "BORNERA_MOTOR:TP"
      },
      to: {
        terminalId: "FUENTE:TP"
      },
      color: "#32834b",
      route: {
        sag: 130
      },
      layer: 54
    },
    {
      id: "c114d2e2-eb46-4a11-9f25-9c7b33d94a94",
      from: {
        terminalId: "CONTACTOR_TERMICO:TP_DER"
      },
      to: {
        terminalId: "FUENTE:TP"
      },
      color: "#32834b",
      route: {
        sag: 130
      },
      layer: 55
    },
    {
      id: "b0141501-a8d4-46f4-914c-cf7c11be9ea3",
      from: {
        terminalId: "BOTONERAS:TP_IZQ"
      },
      to: {
        terminalId: "FUENTE:TP"
      },
      color: "#32834b",
      route: {
        sag: 130
      },
      layer: 56
    },
    {
      id: "e570ce0a-0cc2-405d-81de-1a5bdef8186b",
      from: {
        terminalId: "CONTACTOR_TRIFASICO:TP_IZQ"
      },
      to: {
        terminalId: "FUENTE:TP"
      },
      color: "#32834b",
      route: {
        sag: 130
      },
      layer: 57
    },
    {
      id: "608ec287-76d3-4ea6-8c22-9f323dcad985",
      from: {
        terminalId: "CONTACTOR_TRIFASICO:A1"
      },
      to: {
        terminalId: "BOTONERAS:PILOTO_4"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 58
    },
    {
      id: "7bddfeb1-d1ae-45cb-a830-eb67d8074d3c",
      from: {
        terminalId: "CONTACTOR_TERMICO:A1"
      },
      to: {
        terminalId: "BOTONERAS:PILOTO_1"
      },
      color: "#d8ab28",
      route: {
        sag: 130
      },
      layer: 59
    }
  ]
};

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

// src/data/twoContactorSource.json
var twoContactorSource_default = {
  source: "modo-panel-dos-contactores-original.json",
  sha256: "aec6c2de15663dd8273f6785b9303cd01e46881fcf3732399f92b61ec84b4676",
  receivedTitle: "Ejemplo virtual \xB7 Estrella-tri\xE1ngulo \xB7 2 contactores + conjunto temporizado",
  receivedDiagram: {
    id: "leccion-estrellaTimer",
    name: "Estrella-tri\xE1ngulo con temporizador",
    src: "/diagrams/leccion-estrella-temporizador.png",
    origin: "class_photo"
  },
  receivedStepCount: 42,
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
      "BOTONERAS:S3:3"
    ],
    [
      "BOTONERAS:S3:3",
      "TEMPORIZADOR_1:13"
    ],
    [
      "BOTONERAS:S3:4",
      "TEMPORIZADOR_1:14"
    ],
    [
      "TEMPORIZADOR_1:14",
      "TEMPORIZADOR_1:A1"
    ],
    [
      "TEMPORIZADOR_1:A2",
      "FUENTE:N"
    ],
    [
      "TEMPORIZADOR_1:14",
      "TEMPORIZADOR_1:55"
    ],
    [
      "TEMPORIZADOR_1:56",
      "CONTACTOR_TERMICO:71"
    ],
    [
      "CONTACTOR_TERMICO:72",
      "CONTACTOR_TRIFASICO:A1"
    ],
    [
      "CONTACTOR_TRIFASICO:A2",
      "FUENTE:N"
    ],
    [
      "TEMPORIZADOR_1:14",
      "TEMPORIZADOR_1:67"
    ],
    [
      "TEMPORIZADOR_1:68",
      "CONTACTOR_TRIFASICO:71"
    ],
    [
      "CONTACTOR_TRIFASICO:72",
      "CONTACTOR_TERMICO:A1"
    ],
    [
      "CONTACTOR_TERMICO:A2",
      "FUENTE:N"
    ],
    [
      "FUENTE:S",
      "TEMPORIZADOR_1:L2"
    ],
    [
      "FUENTE:T",
      "TEMPORIZADOR_1:L3"
    ],
    [
      "TEMPORIZADOR_1:T1",
      "BORNERA_MOTOR:U1"
    ],
    [
      "TEMPORIZADOR_1:T2",
      "BORNERA_MOTOR:V1"
    ],
    [
      "TEMPORIZADOR_1:T3",
      "BORNERA_MOTOR:W1"
    ],
    [
      "BORNERA_MOTOR:W2",
      "CONTACTOR_TRIFASICO:L1"
    ],
    [
      "BORNERA_MOTOR:U2",
      "CONTACTOR_TRIFASICO:L2"
    ],
    [
      "BORNERA_MOTOR:V2",
      "CONTACTOR_TRIFASICO:L3"
    ],
    [
      "CONTACTOR_TRIFASICO:T1",
      "CONTACTOR_TRIFASICO:T2"
    ],
    [
      "CONTACTOR_TRIFASICO:T2",
      "CONTACTOR_TRIFASICO:T3"
    ],
    [
      "BORNERA_MOTOR:U1",
      "CONTACTOR_TERMICO:L1"
    ],
    [
      "BORNERA_MOTOR:V1",
      "CONTACTOR_TERMICO:L2"
    ],
    [
      "BORNERA_MOTOR:W1",
      "CONTACTOR_TERMICO:L3"
    ],
    [
      "CONTACTOR_TERMICO:T1",
      "BORNERA_MOTOR:W2"
    ],
    [
      "CONTACTOR_TERMICO:T2",
      "BORNERA_MOTOR:U2"
    ],
    [
      "CONTACTOR_TERMICO:T3",
      "BORNERA_MOTOR:V2"
    ],
    [
      "FUENTE:N",
      "BOTONERAS:N"
    ],
    [
      "CONTACTOR_TRIFASICO:A1",
      "BOTONERAS:PILOTO_1"
    ],
    [
      "CONTACTOR_TERMICO:A1",
      "BOTONERAS:PILOTO_4"
    ],
    [
      "FUENTE:R",
      "TEMPORIZADOR_1:L1"
    ],
    [
      "CONTACTOR_TERMICO:97",
      "FUENTE:F"
    ],
    [
      "CONTACTOR_TERMICO:98",
      "BOTONERAS:PILOTO_3"
    ]
  ]
};

// src/data/twoContactorTeaching.ts
var entry = (title, why, behavior, without, question, criteria) => ({ title, why, behavior, without, question, criteria });
var control = [
  entry("Protecci\xF3n del mando \xB7 F a 95", "F alimenta la entrada 95 del rel\xE9 t\xE9rmico que est\xE1 junto a KM1. El t\xE9rmico es una protecci\xF3n, no otro contactor.", "Con el t\xE9rmico sano, 95\u201396 permite alimentar el mando; TEST abre 95\u201396 y corta esta cadena.", "El mando no recibe alimentaci\xF3n por la ruta protegida.", "\xBFQu\xE9 diferencia hay entre el contactor KM1 y su rel\xE9 t\xE9rmico, y qu\xE9 cambia al disparar este \xFAltimo?", ["Distinguir contactor y rel\xE9 t\xE9rmico.", "Explicar la apertura de 95\u201396."]),
  entry("Del t\xE9rmico al paro \xB7 96 a S2:1", "La salida 96 lleva la fase protegida al NC del pulsador rojo S2.", "El paro queda en serie con la marcha S1 y con la retenci\xF3n de KT1.", "La cadena de marcha y retenci\xF3n queda sin alimentaci\xF3n.", "\xBFPor qu\xE9 el paro debe recibir fase despu\xE9s de 95\u201396?", ["Seguir F \u2192 95\u201396 \u2192 S2.", "Relacionar el disparo t\xE9rmico con la p\xE9rdida de mando."]),
  entry("Salida del paro a marcha \xB7 S1", "S2:2 alimenta el borne 3 del pulsador verde izquierdo S1. En este archivo S1 da marcha; S3 no se utiliza.", "Pulsar S1 cierra 3\u20134, siempre que S2 y el t\xE9rmico permitan el paso.", "S1 no puede dar la orden inicial por esta rama.", "\xBFQu\xE9 pulsador inicia este montaje y por qu\xE9 no se debe seguir aqu\xED la orden S1 de la otra lecci\xF3n?", ["Identificar S1 como marcha y S2 como paro.", "Reconocer que los pasos heredados no describ\xEDan estos cables."]),
  entry("Retenci\xF3n de KT1 \xB7 entrada 13", "El auxiliar 13\u201314 de KT1 recibe fase del mismo nodo que S1:3, despu\xE9s del paro.", "Cuando act\xFAa KT1 su NA 13\u201314 cierra y ofrece una ruta en paralelo con S1.", "Sin esta entrada no se alimenta la rama de retenci\xF3n.", "\xBFQu\xE9 dos ramas reciben fase despu\xE9s de S2 y c\xF3mo conserva el paro su prioridad?", ["Explicar el paralelo S1 / KT1 13\u201314.", "Situar ambas ramas despu\xE9s del paro."]),
  entry("Retenci\xF3n de KT1 \xB7 salida 14", "S1:4 se une con KT1:14; las dos rutas de marcha llegan al mismo nodo.", "Despu\xE9s de dar marcha, el auxiliar mantiene ese nodo alimentado al soltar S1.", "Sin otra ruta equivalente, el conjunto depender\xEDa de mantener S1 pulsado.", "\xBFC\xF3mo sigue alimentado KT1 cuando sueltas el pulsador verde izquierdo?", ["Seguir la ruta de retenci\xF3n 13\u201314.", "Distinguir contacto auxiliar y pulsador."]),
  entry("Bobina del conjunto temporizado \xB7 A1", "El nodo de marcha y retenci\xF3n alimenta A1 del conjunto KT1.", "En el modelo KT1 cierra sus tres polos de l\xEDnea y empieza el retardo; los contactos 55\u201356 y 67\u201368 realizan el cambio.", "No se acciona el conjunto de l\xEDnea ni comienza su temporizaci\xF3n.", "\xBFQu\xE9 funciones realiza KT1 al alimentarse en este montaje?", ["Identificar bobina, polos de fuerza y temporizaci\xF3n.", "No confundir KT1 con KM3 ni con un temporizador sin polos."]),
  entry("Retorno de KT1 \xB7 A2 a N", "A2 completa el circuito de la bobina de KT1 con el neutro de mando.", "La bobina necesita tensi\xF3n entre A1 y A2 para actuar y contar el tiempo.", "Alimentar A1 sin retorno no completa el circuito de la bobina.", "\xBFPor qu\xE9 necesita KT1 un retorno a N y por qu\xE9 no se sustituye por TP?", ["Explicar circuito cerrado A1\u2013A2.", "Distinguir N y TP."]),
  entry("Alimentaci\xF3n de la etapa estrella \xB7 55", "El nodo KT1:14 alimenta la entrada 55 del contacto temporizado NC.", "55\u201356 permite la primera etapa mientras transcurre el retardo.", "La rama inicial de estrella no recibe fase por esta ruta.", "\xBFPor qu\xE9 esta rama se alimenta desde el nodo retenido y no directamente desde F?", ["Relacionar la etapa con la marcha retenida.", "Identificar 55\u201356 como contacto inicial."]),
  entry("Salida temporizada de estrella \xB7 56 a KM1:71", "La salida 56 pasa por el NC 71\u201372 de KM1 antes de llegar a KM2.", "Durante el tiempo, 55\u201356 permite la estrella si KM1 de tri\xE1ngulo est\xE1 abierto. Al terminar abre.", "KM2 no recibe la orden inicial por esta rama.", "\xBFQu\xE9 dos condiciones deben permitir el paso para activar KM2 en estrella?", ["Nombrar KT1 55\u201356 y KM1 71\u201372.", "Explicar temporizaci\xF3n y enclavamiento."]),
  entry("Enclavamiento de estrella \xB7 KM1:72 a KM2:A1", "La salida del NC de KM1 alimenta la bobina de KM2, que en este archivo hace estrella.", "Si act\xFAa KM1, su 71\u201372 abre e impide mantener la rama de KM2.", "Queda interrumpida la alimentaci\xF3n de la bobina de estrella.", "\xBFQu\xE9 contactor hace estrella y cu\xE1l debe estar abierto para que pueda entrar?", ["Identificar KM2 como estrella.", "Explicar el NC de KM1 en la rama contraria."]),
  entry("Retorno de KM2 \xB7 A2 a N", "La bobina del contactor de estrella completa su retorno a N.", "KM2 act\xFAa cuando su rama temporizada alimenta A1 y A2 dispone de retorno.", "La bobina de estrella queda sin circuito cerrado.", "Sigue el recorrido completo desde F hasta el retorno de KM2: \xBFqu\xE9 condiciones encuentras?", ["Incluir t\xE9rmico, paro, retenci\xF3n, temporizador y enclavamiento.", "Terminar en A2 y N."]),
  entry("Alimentaci\xF3n de la etapa tri\xE1ngulo \xB7 67", "El mismo nodo retenido alimenta 67 del contacto temporizado NA.", "67\u201368 espera abierto y cierra cuando termina el retardo de KT1.", "La rama de tri\xE1ngulo no recibe su alimentaci\xF3n prevista.", "\xBFEn qu\xE9 se diferencian 55\u201356 y 67\u201368 durante y despu\xE9s del tiempo?", ["Describir el NC inicial y el NA final.", "Relacionar ambos con una \xFAnica marcha de KT1."]),
  entry("Salida temporizada de tri\xE1ngulo \xB7 68 a KM2:71", "La salida 68 pasa por el NC 71\u201372 de KM2 antes de alimentar KM1.", "Al terminar el retardo, la orden llega a tri\xE1ngulo cuando KM2 de estrella ha ca\xEDdo y su NC permite el paso.", "No llega la orden temporizada de tri\xE1ngulo por esta rama.", "\xBFPor qu\xE9 67\u201368 no alimenta directamente la bobina de KM1?", ["Explicar el enclavamiento por KM2.", "Describir la exclusi\xF3n entre estrella y tri\xE1ngulo."]),
  entry("Enclavamiento de tri\xE1ngulo \xB7 KM2:72 a KM1:A1", "El NC de KM2 entrega la orden a KM1, el contactor con rel\xE9 t\xE9rmico que aqu\xED realiza tri\xE1ngulo.", "KM1 cierra sus polos para formar U1\u2013W2, V1\u2013U2 y W1\u2013V2; KM2 debe estar abierto.", "No act\xFAa el contactor que completa tri\xE1ngulo.", "\xBFPor qu\xE9 KM1 y KM2 no deben cerrar juntos en este esquema?", ["Relacionar polos y conexi\xF3n de bobinados.", "Explicar la funci\xF3n de los NC cruzados."]),
  entry("Retorno de KM1 \xB7 A2 a N", "La bobina del contactor de tri\xE1ngulo completa su retorno a N.", "KM1 puede actuar tras el tiempo si se cumplen marcha, protecci\xF3n y enclavamiento.", "La orden sobre A1 no completa por s\xED sola el circuito de KM1.", "\xBFQu\xE9 recorrido alimenta KM1 despu\xE9s del retardo y c\xF3mo se detiene?", ["Incluir KT1 67\u201368 y KM2 71\u201372.", "Explicar paro S2 y corte por 95\u201396."])
];
var power = (i) => {
  const [from, to] = twoContactorSource_default.pairs[i];
  if (from.startsWith("FUENTE:")) return entry(`Fuerza \xB7 fase ${from.split(":")[1]} a KT1`, "Esta fase entra en un polo de l\xEDnea del conjunto temporizado KT1, tal como est\xE1 cableado en el archivo.", "Al actuar KT1, su polo L\u2013T deja pasar esta fase hacia U1, V1 o W1.", "Queda una fase de fuerza sin su recorrido previsto; las bobinas pueden actuar aunque el motor no tenga alimentaci\xF3n completa.", "\xBFQu\xE9 polo de KT1 lleva esta fase al motor y qu\xE9 diferencia hay entre mando y fuerza?", ["Seguir entrada L y salida T correspondientes.", "No deducir giro solo del estado de una bobina."]);
  if (from.startsWith("TEMPORIZADOR_1:T")) return entry("De KT1 al motor \xB7 " + to.split(":")[1], "Los polos de l\xEDnea de KT1 alimentan los extremos U1, V1 y W1 del motor.", "Esta alimentaci\xF3n permanece durante estrella y tri\xE1ngulo; el cambio se realiza en los otros extremos de las bobinas.", "Falta una de las alimentaciones principales de los bobinados.", "\xBFPor qu\xE9 esta conexi\xF3n permanece igual durante las dos etapas?", ["Identificar el extremo del motor.", "Distinguir alimentaci\xF3n de l\xEDnea y cambio de conexi\xF3n."]);
  if (to.startsWith("CONTACTOR_TRIFASICO:L")) return entry("Extremo del motor hacia KM2 \xB7 estrella", "Un extremo W2, U2 o V2 va a una entrada L de KM2. En este archivo el puente com\xFAn se hace en las salidas T.", "Al cerrar KM2, cada polo une su extremo de motor con el nodo com\xFAn T1\u2013T2\u2013T3.", "Queda incompleto el recorrido de uno de los extremos hacia el punto estrella.", "Sigue este extremo: \xBFc\xF3mo llega al nodo com\xFAn cuando act\xFAa KM2?", ["Situar W2, U2 o V2.", "Identificar el puente en T, no en L."]);
  if (from.startsWith("CONTACTOR_TRIFASICO:T")) return entry("Puente del punto estrella \xB7 KM2", "Los puentes unen T1, T2 y T3 de KM2 en un nodo com\xFAn.", "Con KM2 cerrado quedan reunidos W2, U2 y V2. Con KM2 abierto los puentes no unen por s\xED solos esos extremos del motor.", "Sin todos los puentes falta parte del punto estrella.", "\xBFPor qu\xE9 los puentes en T forman estrella solo cuando cierran los polos de KM2?", ["Identificar T1\u2013T2\u2013T3 como nodo com\xFAn.", "Relacionar el puente con los polos L\u2013T."]);
  return entry("Rama de tri\xE1ngulo \xB7 KM1", "KM1 toma U1, V1 y W1 por L1, L2 y L3 y los une a W2, U2 y V2 por las salidas T del m\xF3dulo con t\xE9rmico.", "Con KM1 cerrado se forman U1\u2013W2, V1\u2013U2 y W1\u2013V2. KM2 de estrella debe estar abierto.", "Falta uno de los recorridos de la conexi\xF3n tri\xE1ngulo.", "\xBFQu\xE9 pareja de extremos se une por este polo de KM1 y por qu\xE9 debe estar abierto KM2?", ["Seguir L\u2013T y la pareja de extremos del motor.", "Distinguir el rel\xE9 t\xE9rmico de un tercer contactor."]);
};
var extras = {
  31: entry("Neutro com\xFAn de los pilotos", "BOTONERAS:N conecta el retorno modelado de los pilotos a N de la fuente.", "Las se\xF1ales pueden encenderse cuando su rama recibe fase y este retorno est\xE1 completo.", "Los pilotos quedan sin retorno aunque el mando pueda funcionar.", "\xBFQu\xE9 circuitos cierra este cable y por qu\xE9 no se une N a TP?", ["Identificar el retorno com\xFAn de pilotos.", "Separar neutro y protecci\xF3n."]),
  32: entry("Piloto P1 \xB7 estrella", "P1 recibe la misma alimentaci\xF3n de mando que A1 de KM2.", "Indica la orden sobre la bobina de estrella, con el retorno de pilotos conectado.", "Se pierde la se\xF1al verde de estrella; esto no prueba por s\xED solo un fallo del circuito de fuerza.", "\xBFQu\xE9 indica P1 y por qu\xE9 no demuestra por s\xED solo que gira un motor f\xEDsico?", ["Relacionar P1 con KM2.", "Distinguir se\xF1al de mando y giro."]),
  33: entry("Piloto P4 \xB7 tri\xE1ngulo", "P4 toma la se\xF1al de A1 de KM1, el contactor que hace tri\xE1ngulo en este montaje.", "Se enciende con la orden de tri\xE1ngulo tras el retardo, si dispone del retorno com\xFAn.", "Se pierde esta indicaci\xF3n de tri\xE1ngulo aunque la bobina pueda actuar.", "\xBFPor qu\xE9 P4 se conecta a KM1:A1 y P1 a KM2:A1?", ["Relacionar cada piloto con su etapa.", "No trasladar los papeles de la lecci\xF3n de tres contactores."]),
  35: entry("Alimentaci\xF3n del aviso t\xE9rmico \xB7 97", "El NA 97\u201398 toma fase directamente de F, antes del corte 95\u201396.", "As\xED el aviso puede seguir recibiendo alimentaci\xF3n cuando el t\xE9rmico interrumpe el mando.", "No se alimenta el circuito de alarma por esta ruta.", "\xBFPor qu\xE9 97 se alimenta antes del contacto que abre al dispararse?", ["Distinguir aviso y corte de mando.", "Seguir F \u2192 97\u201398."]),
  36: entry("Aviso de disparo \xB7 98 a P3", "La salida 98 alimenta el piloto amarillo P3.", "En el modelo, TEST abre 95\u201396 y cierra 97\u201398: cae el mando y se enciende P3 con N conectado.", "Falta el aviso luminoso de disparo aunque pueda cortarse el mando.", "\xBFQu\xE9 diferencias observar\xEDas entre un paro por S2 y un disparo t\xE9rmico?", ["Comparar S2 y TEST.", "Identificar 95\u201396 de corte y 97\u201398 de se\xF1al."])
};
var TWO_CONTACTOR_DETAILS = twoContactorSource_default.pairs.map((_, i) => control[i] ?? extras[i] ?? power(i));

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
    if (!timed && has("BOTONERAS:S3:3")) return item("Permiso de cambio \xB7 despu\xE9s de la partida", "El NA 3\u20134 de S3 toma la alimentaci\xF3n de S1:4, despu\xE9s de la partida y del auxiliar de retenci\xF3n de KM1, como SB3 en la figura 1 de la gu\xEDa.", "Pulsar S3 desde reposo no alimenta KM1 ni KM2. Primero S1 inicia estrella y luego S3 solicita tri\xE1ngulo.", "Falta la orden de cambio; tomarla antes de S1 permitir\xEDa una partida directa en tri\xE1ngulo que no corresponde a este esquema.", "\xBFPor qu\xE9 SB3 se alimenta despu\xE9s de SB2 y qu\xE9 ocurre si lo pulsas con el banco en reposo?", ["Seguir la salida de S1 y la retenci\xF3n de KM1.", "Distinguir partida y cambio de conexi\xF3n."]);
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
  const a3 = point(from), b = point(to), pad = 62, x0 = Math.min(a3.x, b.x) - pad, x1 = Math.max(a3.x, b.x) + pad, y0 = Math.min(a3.y, b.y) - pad, y1 = Math.max(a3.y, b.y) + pad;
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
  const pairs = source2.pairs.map(([from, to]) => [id === "estrellaManual" && from === "BOTONERAS:S2:2" && to === "BOTONERAS:S3:3" ? "BOTONERAS:S1:4" : from, to]);
  return {
    id,
    schematic: id,
    title: `Lecci\xF3n \xB7 ${source2.title} \xB7 3 contactores`,
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
var startOnS1 = (id) => id.replace("BOTONERAS:S3:", "BOTONERAS:S1:");
var TWO_CONTACTOR_PAIRS = twoContactorSource_default.pairs.map(([a3, b]) => [startOnS1(a3), startOnS1(b)]);
var TWO_CONTACTOR_LESSON = {
  id: "estrellaDosContactores",
  schematic: "estrellaDosContactores",
  title: "Lecci\xF3n \xB7 Estrella-tri\xE1ngulo \xB7 2 contactores",
  summary: "Tu montaje: KM1 con rel\xE9 t\xE9rmico, KM2 y conjunto temporizado KT1. S1 da marcha; S2 para. 37 cables, paso a paso desde el banco vac\xEDo.",
  diagram: { id: "leccion-estrellaDosContactores", name: twoContactorSource_default.receivedDiagram.name, src: twoContactorSource_default.receivedDiagram.src, origin: "class_photo" },
  pairs: TWO_CONTACTOR_PAIRS.map(([a3, b]) => [a3, b]),
  steps: TWO_CONTACTOR_PAIRS.map(([from, to], i) => ({ id: `estrellaDosContactores-${String(i + 1).padStart(2, "0")}`, from, to, title: TWO_CONTACTOR_DETAILS[i].title, explanation: TWO_CONTACTOR_DETAILS[i].why, review: "user_reviewed", region: { x: 0, y: 0, w: 1e3, h: 1e3 } }))
};
var LESSONS = { simple: SIMPLE_LESSON, inversion: INVERSION_LESSON, estrellaManual: STAR_MANUAL_LESSON, estrellaTimer: STAR_TIMER_LESSON, estrellaDosContactores: TWO_CONTACTOR_LESSON };
var LESSON_MAP_RATIO = leccionInversion_layout_default.height / leccionInversion_layout_default.width;

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
var btn = { id: "BOTONERAS", title: "LUCES PILOTO 24 V A.C. / BOTONERAS", x: 712, y: 76, w: 615, h: 300, image: "/references/botoneras.jpg", category: "botoneras", summary: "Cuatro pilotos y tres pulsadores. Pares rojos 1\u20132; pares claros 3\u20134. NA/NC por convenci\xF3n, pendiente de verificaci\xF3n.", labelBands: [1, 2, 3].flatMap((s) => [[`S${s}:1`, `S${s}:3`], [`S${s}:2`, `S${s}:4`]]), terminals: [
  ...[78, 228, 378, 530].map((x, i) => port(`PILOTO_${i + 1}`, x, 105, "red", `Conector visible bajo piloto ${i + 1}; retorno a\xFAn no verificado`, void 0, "bottom", "no_verificado")),
  ...[115, 303, 488].flatMap((cx, i) => [
    // Los tres pulsadores se leen de izquierda a derecha: rojos 1–2 a la izquierda y claros 3–4 a la derecha. (Las fotos IMG_4737 e IMG_4536 muestran el derecho con las columnas invertidas; se normaliza a petición del autor.)
    port(`S${i + 1}:1`, cx - 29, 196, "red", `Pulsador ${i + 1} \xB7 contacto 1\u20132`, "NC por convenci\xF3n \xB7 por confirmar", "bottom", "convencion_por_confirmar"),
    port(`S${i + 1}:2`, cx - 29, 250, "red", `Pulsador ${i + 1} \xB7 contacto 1\u20132`, "NC por convenci\xF3n \xB7 por confirmar", "bottom", "convencion_por_confirmar"),
    port(`S${i + 1}:3`, cx + 29, 196, "white", `Pulsador ${i + 1} \xB7 contacto 3\u20134`, "NA por convenci\xF3n \xB7 por confirmar", "bottom", "convencion_por_confirmar"),
    port(`S${i + 1}:4`, cx + 29, 250, "white", `Pulsador ${i + 1} \xB7 contacto 3\u20134`, "NA por convenci\xF3n \xB7 por confirmar", "bottom", "convencion_por_confirmar")
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

// src/data/machinePreparation.ts
var EXAMPLE_RATING = { deltaVolts: 380, starVolts: 660, lineAmps: 10, source: "Ejemplo did\xE1ctico; no corresponde a la placa del laboratorio" };
function ratingCompatibility(r, line, connection) {
  const limit = connection === "delta" ? r.deltaVolts : r.starVolts, ok = line <= limit * 1.1;
  return { ok, message: ok ? "Tensi\xF3n compatible con el ejemplo de placa." : `Tensi\xF3n incompatible: ${line} V en ${connection === "delta" ? "\u0394" : "Y"} supera la tensi\xF3n nominal ${limit} V. Desenergiza y revisa la placa.`, windingVolts: connection === "delta" ? line : line / Math.sqrt(3) };
}
var relaySetting = (nominal, location) => nominal / (location === "inside" ? Math.sqrt(3) : 1);
var newMachinePreparation = () => ({ version: 1, starVoltage: "", deltaVoltage: "", compatible: "", incompatible: "", location: "inside", setting: "", range: "", device: "", diagram: { wires: [], positions: {}, explanation: "" } });
function preparationChecks(p) {
  const n = (v) => Number(v.replace(",", "."));
  return { plate: Math.abs(n(p.starVoltage) - 380 / Math.sqrt(3)) < 1 && Math.abs(n(p.deltaVoltage) - 380) < 1 && p.compatible === "yes" && p.incompatible === "star", protection: Math.abs(n(p.setting) - relaySetting(10, p.location)) < 0.08 && p.range.split("-").length === 2 && n(p.range.split("-")[0]) <= relaySetting(10, p.location) && n(p.range.split("-")[1]) >= relaySetting(10, p.location) && p.device === "thermal" };
}

// src/data/practice.ts
var BANANA_COLOR = "#145650";
var CLASS_DIAGRAMS = [1, 2, 3].map((n) => ({ id: `clase-${n}`, name: `Fotograf\xEDa de clase ${n} \xB7 referencia sin validar`, src: `/diagrams/clase-${n}.jpg`, origin: "class_photo" }));
var emptyPractice = () => ({ version: 2, title: "Mi pr\xE1ctica INACAP", wires: [], diagram: CLASS_DIAGRAMS[0], steps: [], mode: "free", stepIndex: 0 });

// src/lab/units.ts
function formatReading(kind, value) {
  const abs = Math.abs(value), fixed = (n, d) => (Math.abs(n) < 10 ** -d / 2 ? 0 : n).toFixed(d).replace(".", ",");
  const ranges = kind === "voltage" ? [[6, 1, 3, "V"], [60, 1, 2, "V"], [600, 1, 1, "V"], [1e3, 1, 0, "V"]] : kind === "current" ? [[6, 1, 3, "A"], [10, 1, 2, "A"], [20, 1, 2, "A"]] : [[600, 1, 1, "\u03A9"], [6e3, 1e3, 3, "k\u03A9"], [6e4, 1e3, 2, "k\u03A9"], [6e5, 1e3, 1, "k\u03A9"], [6e6, 1e6, 3, "M\u03A9"], [5e7, 1e6, 2, "M\u03A9"]];
  for (let i = 0; i < ranges.length; i++) {
    const [limit, factor, d, unit] = ranges[i];
    const rounded = Number((abs / factor).toFixed(d)) * factor, last = i === ranges.length - 1;
    if (last ? abs <= limit : rounded < limit) return { text: fixed(value / factor, d), unit };
  }
  return { text: "OL", unit: "" };
}

// src/data/simulation.ts
var contactorIds = () => MODULES.filter((m) => m.category === "contactores").map((m) => m.id);
var timerIds = () => MODULES.filter((m) => m.category === "temporizadores").map((m) => m.id);
var relayIds = () => [...contactorIds(), ...timerIds()];
function simulationContacts(input, relays, timed = []) {
  const pairs = [];
  for (const s of ["S1", "S2", "S3"]) pairs.push(input.pressed.includes(s) ? [`BOTONERAS:${s}:3`, `BOTONERAS:${s}:4`] : [`BOTONERAS:${s}:1`, `BOTONERAS:${s}:2`]);
  for (const id of contactorIds()) {
    const closed = !!relays[id];
    for (const [a3, b] of closed ? [["13", "14"], ["63", "64"], ["93", "94"]] : [["71", "72"], ["81", "82"]]) pairs.push([`${id}:${a3}`, `${id}:${b}`]);
    if (input.powerContacts?.[id] ?? closed) for (const i of [1, 2, 3]) pairs.push([`${id}:L${i}`, `${id}:T${i}`]);
  }
  for (const id of timerIds()) {
    const on = !!relays[id], done = on && timed.includes(id);
    if (input.powerContacts?.[id] ?? on) for (const i of [1, 2, 3]) pairs.push([`${id}:L${i}`, `${id}:T${i}`]);
    if (on) pairs.push([`${id}:13`, `${id}:14`]);
    pairs.push(done ? [`${id}:67`, `${id}:68`] : [`${id}:55`, `${id}:56`]);
  }
  pairs.push(input.thermalTripped ? ["CONTACTOR_TERMICO:97", "CONTACTOR_TERMICO:98"] : ["CONTACTOR_TERMICO:95", "CONTACTOR_TERMICO:96"]);
  return pairs;
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
  starDelta: { title: "Estrella-tri\xE1ngulo \xB7 2 contactores + conjunto temporizado", pairs: [
    // KT1 is the line contactor with pneumatic block. KM2 = star; KM1 = delta.
    ["FUENTE:F", "CONTACTOR_TERMICO:95"],
    ["CONTACTOR_TERMICO:96", "BOTONERAS:S2:1"],
    ["BOTONERAS:S2:2", "BOTONERAS:S3:3"],
    ["BOTONERAS:S3:3", "TEMPORIZADOR_1:13"],
    ["BOTONERAS:S3:4", "TEMPORIZADOR_1:14"],
    ["TEMPORIZADOR_1:14", "TEMPORIZADOR_1:A1"],
    ["TEMPORIZADOR_1:A2", "FUENTE:N"],
    ["TEMPORIZADOR_1:14", "TEMPORIZADOR_1:55"],
    ["TEMPORIZADOR_1:56", "CONTACTOR_TERMICO:71"],
    ["CONTACTOR_TERMICO:72", "CONTACTOR_TRIFASICO:A1"],
    ["CONTACTOR_TRIFASICO:A2", "FUENTE:N"],
    ["TEMPORIZADOR_1:14", "TEMPORIZADOR_1:67"],
    ["TEMPORIZADOR_1:68", "CONTACTOR_TRIFASICO:71"],
    ["CONTACTOR_TRIFASICO:72", "CONTACTOR_TERMICO:A1"],
    ["CONTACTOR_TERMICO:A2", "FUENTE:N"],
    ["FUENTE:R", "TEMPORIZADOR_1:L1"],
    ["FUENTE:S", "TEMPORIZADOR_1:L2"],
    ["FUENTE:T", "TEMPORIZADOR_1:L3"],
    ["TEMPORIZADOR_1:T1", "BORNERA_MOTOR:U1"],
    ["TEMPORIZADOR_1:T2", "BORNERA_MOTOR:V1"],
    ["TEMPORIZADOR_1:T3", "BORNERA_MOTOR:W1"],
    ["BORNERA_MOTOR:W2", "CONTACTOR_TRIFASICO:L1"],
    ["BORNERA_MOTOR:U2", "CONTACTOR_TRIFASICO:L2"],
    ["BORNERA_MOTOR:V2", "CONTACTOR_TRIFASICO:L3"],
    ["CONTACTOR_TRIFASICO:T1", "CONTACTOR_TRIFASICO:T2"],
    ["CONTACTOR_TRIFASICO:T2", "CONTACTOR_TRIFASICO:T3"],
    ["BORNERA_MOTOR:U1", "CONTACTOR_TERMICO:L1"],
    ["BORNERA_MOTOR:V1", "CONTACTOR_TERMICO:L2"],
    ["BORNERA_MOTOR:W1", "CONTACTOR_TERMICO:L3"],
    ["CONTACTOR_TERMICO:T1", "BORNERA_MOTOR:W2"],
    ["CONTACTOR_TERMICO:T2", "BORNERA_MOTOR:U2"],
    ["CONTACTOR_TERMICO:T3", "BORNERA_MOTOR:V2"],
    ["FUENTE:N", "BOTONERAS:N"],
    ["CONTACTOR_TRIFASICO:A1", "BOTONERAS:PILOTO_1"],
    ["CONTACTOR_TERMICO:A1", "BOTONERAS:PILOTO_4"]
  ] },
  starDeltaThree: { title: "Estrella-tri\xE1ngulo \xB7 3 contactores + temporizador separado", needs: ["CONTACTOR_TRIFASICO_3"], pairs: [
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

// src/lab/model.ts
var HOLES = [];
for (let col = 1; col <= 30; col++) {
  const x = 55 + (col - 1) * 24;
  for (const [row, y] of [["top+", 62], ["top-", 86], ["bottom+", 386], ["bottom-", 410]]) HOLES.push({ id: `${row}:${col}`, x, y, group: `${row}:${col <= 15 ? "left" : "right"}` });
  for (const [i, row] of [..."abcdefghij"].entries()) HOLES.push({ id: `${row}:${col}`, x, y: 135 + i * 20 + (i >= 5 ? 35 : 0), group: `${i < 5 ? "upper" : "lower"}:${col}` });
}
var HOLE_BY_ID = new Map(HOLES.map((h) => [h.id, h]));

// src/lab/dc.ts
function junctionCurrent(v, resistance, j) {
  const rs = Math.max(resistance, 1e-6), is = j.saturation, vt = j.nvt;
  if (v <= 0) {
    const ex = Math.exp(Math.max(-40, v / vt));
    return { current: is * (ex - 1), conductance: Math.max(1e-12, is * ex / vt) };
  }
  let lo = 0, hi = v / rs;
  for (let k = 0; k < 64; k++) {
    const mid = (lo + hi) / 2;
    if (vt * Math.log1p(mid / is) + mid * rs > v) hi = mid;
    else lo = mid;
  }
  const current = (lo + hi) / 2;
  return { current, conductance: 1 / (rs + vt / (current + is)) };
}
var BJT_VBE = 0.7;
var BJT_RB = 10;
var BJT_VCE_SAT = 0.2;
var BJT_RCE = 2;
function solveDC(branches, fixed, transistors = []) {
  const adjacency = /* @__PURE__ */ new Map();
  const link = (x, y) => {
    if (!adjacency.has(x)) adjacency.set(x, /* @__PURE__ */ new Set());
    if (!adjacency.has(y)) adjacency.set(y, /* @__PURE__ */ new Set());
    adjacency.get(x).add(y);
    adjacency.get(y).add(x);
  };
  for (const b of branches) link(b.a, b.b);
  for (const t of transistors) {
    link(t.b, t.e);
    link(t.c, t.e);
  }
  const reachable = new Set(Object.keys(fixed)), queue = [...reachable];
  for (let i = 0; i < queue.length; i++) for (const next of adjacency.get(queue[i]) ?? []) if (!reachable.has(next)) {
    reachable.add(next);
    queue.push(next);
  }
  const nodes = [...reachable].filter((id) => !(id in fixed)), lookup = new Map(nodes.map((id, i) => [id, i]));
  const floating = [...adjacency.keys()].filter((id) => !reachable.has(id));
  const failure = (fault) => ({ volts: {}, amps: {}, floating, fault, bjts: {} });
  let volts = { ...fixed };
  let converged = false;
  if (nodes.length > 500) return failure("La red supera la capacidad de c\xE1lculo de esta versi\xF3n.");
  const active = transistors.filter((t) => reachable.has(t.b) && reachable.has(t.e) && t.b !== t.e);
  const regions = new Map(active.map((t) => [t.id, "corte"]));
  const gminNodes = new Set(active.flatMap((t) => [t.b, t.c, t.e]).filter((id) => lookup.has(id)));
  for (let iteration = 0; iteration < 120; iteration++) {
    const matrix = nodes.map(() => new Float64Array(nodes.length + 1));
    const add = (row, col, coefficient) => {
      const i = lookup.get(row);
      if (i === void 0) return;
      const j = lookup.get(col);
      if (j !== void 0) matrix[i][j] += coefficient;
      else matrix[i][nodes.length] -= coefficient * (fixed[col] ?? 0);
    };
    const rhs = (row, value) => {
      const i = lookup.get(row);
      if (i !== void 0) matrix[i][nodes.length] += value;
    };
    for (const branch of branches) {
      if (!reachable.has(branch.a) || !reachable.has(branch.b) || branch.a === branch.b) continue;
      const conducting = branch.drop === void 0 || (volts[branch.a] ?? 0) - (volts[branch.b] ?? 0) > branch.drop;
      const v = (volts[branch.a] ?? 0) - (volts[branch.b] ?? 0), nonlinear = branch.junction ? junctionCurrent(v, branch.resistance, branch.junction) : null;
      const conductance = nonlinear?.conductance ?? (conducting ? 1 / branch.resistance : 1e-8);
      const drop = nonlinear ? v - nonlinear.current / conductance : conducting ? branch.drop ?? 0 : 0;
      for (const [a3, b, sign] of [[branch.a, branch.b, 1], [branch.b, branch.a, -1]]) {
        const i = lookup.get(a3);
        if (i === void 0) continue;
        matrix[i][i] += conductance;
        const j = lookup.get(b);
        if (j !== void 0) matrix[i][j] -= conductance;
        else matrix[i][nodes.length] += conductance * fixed[b];
        matrix[i][nodes.length] += sign * conductance * drop;
      }
    }
    let regionChanged = false;
    for (const t of active) {
      const s = t.pnp ? -1 : 1, vb = volts[t.b] ?? 0, ve = volts[t.e] ?? 0, vc = volts[t.c] ?? ve, vbe = s * (vb - ve), vce = s * (vc - ve), on = vbe > BJT_VBE, before = regions.get(t.id);
      let region = before;
      if (!on) region = "corte";
      else if (before === "corte") region = "activa";
      else if (before === "activa" && vce < BJT_VCE_SAT) region = "saturaci\xF3n";
      else if (before === "saturaci\xF3n" && (vce - BJT_VCE_SAT) / BJT_RCE > t.beta * (vbe - BJT_VBE) / BJT_RB) region = "activa";
      if (region !== before) {
        regionChanged = true;
        regions.set(t.id, region);
      }
      const gb = on ? 1 / BJT_RB : 1e-8, db = on ? BJT_VBE : 0;
      add(t.b, t.b, gb);
      add(t.b, t.e, -gb);
      rhs(t.b, s * gb * db);
      add(t.e, t.e, gb);
      add(t.e, t.b, -gb);
      rhs(t.e, -s * gb * db);
      if (!reachable.has(t.c)) continue;
      if (region === "corte") {
        add(t.c, t.c, 1e-8);
        add(t.c, t.e, -1e-8);
        add(t.e, t.e, 1e-8);
        add(t.e, t.c, -1e-8);
      } else if (region === "activa") {
        const k = t.beta / BJT_RB;
        add(t.c, t.b, k);
        add(t.c, t.e, -k);
        rhs(t.c, s * k * BJT_VBE);
        add(t.e, t.b, -k);
        add(t.e, t.e, k);
        rhs(t.e, -s * k * BJT_VBE);
        add(t.c, t.c, 1e-8);
        add(t.c, t.e, -1e-8);
        add(t.e, t.e, 1e-8);
        add(t.e, t.c, -1e-8);
      } else {
        const g = 1 / BJT_RCE;
        add(t.c, t.c, g);
        add(t.c, t.e, -g);
        rhs(t.c, s * g * BJT_VCE_SAT);
        add(t.e, t.e, g);
        add(t.e, t.c, -g);
        rhs(t.e, -s * g * BJT_VCE_SAT);
      }
    }
    for (const id of gminNodes) {
      const i = lookup.get(id);
      matrix[i][i] += 1e-7;
    }
    for (let col = 0; col < nodes.length; col++) {
      let pivot = col;
      for (let row = col + 1; row < nodes.length; row++) if (Math.abs(matrix[row][col]) > Math.abs(matrix[pivot][col])) pivot = row;
      if (Math.abs(matrix[pivot][col]) < 1e-14) return failure("No se puede resolver esta red: revisa conexiones y referencia de tensi\xF3n.");
      [matrix[pivot], matrix[col]] = [matrix[col], matrix[pivot]];
      const divisor = matrix[col][col];
      for (let j = col; j <= nodes.length; j++) matrix[col][j] /= divisor;
      for (let row = 0; row < nodes.length; row++) if (row !== col) {
        const scale = matrix[row][col];
        if (scale === 0) continue;
        for (let j = col; j <= nodes.length; j++) matrix[row][j] -= scale * matrix[col][j];
      }
    }
    const next = { ...fixed };
    nodes.forEach((id, i) => {
      next[id] = matrix[i][nodes.length];
    });
    if (!regionChanged && nodes.every((id) => Math.abs((volts[id] ?? 0) - next[id]) < 1e-8)) {
      volts = next;
      converged = true;
      break;
    }
    volts = branches.some((b) => b.junction) ? Object.fromEntries(Object.entries(next).map(([id, value]) => [id, id in fixed ? value : (volts[id] ?? 0) * 0.4 + value * 0.6])) : next;
  }
  if (!converged && nodes.length) return failure(transistors.length ? "El modelo del transistor no converge en este montaje. Revisa la resistencia de base y las conexiones." : "El modelo de diodo no converge en este montaje. Revisa polaridad y resistencia.");
  let floatingAll = floating;
  if (active.length) {
    const live = new Set(Object.keys(fixed)), edges = /* @__PURE__ */ new Map(), join = (x, y) => {
      if (!edges.has(x)) edges.set(x, /* @__PURE__ */ new Set());
      if (!edges.has(y)) edges.set(y, /* @__PURE__ */ new Set());
      edges.get(x).add(y);
      edges.get(y).add(x);
    };
    for (const b of branches) join(b.a, b.b);
    for (const t of transistors) {
      if ((regions.get(t.id) ?? "corte") !== "corte") {
        join(t.b, t.e);
        join(t.c, t.e);
      }
    }
    const pending = [...live];
    for (let i = 0; i < pending.length; i++) for (const next of edges.get(pending[i]) ?? []) if (!live.has(next)) {
      live.add(next);
      pending.push(next);
    }
    const lost = Object.keys(volts).filter((id) => !live.has(id) && !(id in fixed));
    if (lost.length) {
      volts = { ...volts };
      for (const id of lost) delete volts[id];
      floatingAll = [.../* @__PURE__ */ new Set([...floating, ...lost])];
    }
  }
  const amps = {}, bjts = {};
  for (const b of branches) if (volts[b.a] !== void 0 && volts[b.b] !== void 0) amps[b.id] = b.junction ? junctionCurrent(volts[b.a] - volts[b.b], b.resistance, b.junction).current : b.drop === void 0 ? (volts[b.a] - volts[b.b]) / b.resistance : Math.max(0, (volts[b.a] - volts[b.b] - b.drop) / b.resistance);
  for (const t of transistors) {
    const region = regions.get(t.id) ?? "corte", vb = volts[t.b], ve = volts[t.e], vc = volts[t.c];
    if (vb === void 0 || ve === void 0) {
      bjts[t.id] = { ib: 0, ic: 0, vbe: 0, vce: 0, region: "corte" };
      amps[t.id] = 0;
      continue;
    }
    const sg = t.pnp ? -1 : 1, vbe = sg * (vb - ve), vce = sg * ((vc ?? ve) - ve), ib = region === "corte" ? 0 : Math.max(0, (vbe - BJT_VBE) / BJT_RB), ic = region === "corte" ? 0 : region === "activa" ? t.beta * ib : Math.max(0, (vce - BJT_VCE_SAT) / BJT_RCE);
    bjts[t.id] = { ib, ic, vbe, vce, region };
    amps[t.id] = ic;
  }
  return { volts, amps, floating: floatingAll, fault: null, bjts };
}

// src/data/panelAC.ts
var multiply = (a3, b) => ({ re: a3.re * b.re - a3.im * b.im, im: a3.re * b.im + a3.im * b.re });
var divide = (a3, b) => {
  const d = b.re * b.re + b.im * b.im;
  return { re: (a3.re * b.re + a3.im * b.im) / d, im: (a3.im * b.re - a3.re * b.im) / d };
};
function solvePanelAC(branches, fixed, coupled = []) {
  const graph = /* @__PURE__ */ new Map();
  for (const b of branches) {
    if (!graph.has(b.a)) graph.set(b.a, /* @__PURE__ */ new Set());
    if (!graph.has(b.b)) graph.set(b.b, /* @__PURE__ */ new Set());
    graph.get(b.a).add(b.b);
    graph.get(b.b).add(b.a);
  }
  for (const load of coupled) {
    const ids = load.ports.flat();
    for (const a3 of ids) {
      if (!graph.has(a3)) graph.set(a3, /* @__PURE__ */ new Set());
      for (const b of ids) if (a3 !== b) graph.get(a3).add(b);
    }
  }
  const reached = new Set(Object.keys(fixed)), queue = [...reached];
  for (let i = 0; i < queue.length; i++) for (const id of graph.get(queue[i]) ?? []) if (!reached.has(id)) {
    reached.add(id);
    queue.push(id);
  }
  const nodes = [...reached].filter((id) => !(id in fixed)), index = new Map(nodes.map((id, i) => [id, i])), n = nodes.length;
  const volts = { ...fixed }, amps = {}, floating = [...graph.keys()].filter((id) => !reached.has(id));
  const fail = (fault) => ({ volts: { ...fixed }, amps: {}, floating, fault });
  if (n > 256) return fail("La red AC supera el l\xEDmite del simulador.");
  const re = nodes.map(() => new Float64Array(n + 1)), im = nodes.map(() => new Float64Array(n + 1));
  const add = (row, col, g) => {
    const i = index.get(row);
    if (i === void 0) return;
    const j = index.get(col);
    if (j !== void 0) {
      re[i][j] += g.re;
      im[i][j] += g.im;
    } else {
      const z = multiply(g, fixed[col] ?? { re: 0, im: 0 });
      re[i][n] -= z.re;
      im[i][n] -= z.im;
    }
  };
  for (const b of branches) {
    if (b.a === b.b || !reached.has(b.a)) continue;
    const z = { re: b.resistance, im: b.reactance ?? 0 };
    if (!Number.isFinite(z.re) || !Number.isFinite(z.im) || Math.hypot(z.re, z.im) < 1e-9) return fail("Impedancia AC inv\xE1lida.");
    const y = divide({ re: 1, im: 0 }, z), neg = { re: -y.re, im: -y.im };
    add(b.a, b.a, y);
    add(b.b, b.b, y);
    add(b.a, b.b, neg);
    add(b.b, b.a, neg);
  }
  for (const load of coupled) for (let i = 0; i < load.ports.length; i++) for (let j = 0; j < load.ports.length; j++) {
    const [a3, b] = load.ports[i], [c, d] = load.ports[j], y = load.admittance[i][j], neg = { re: -y.re, im: -y.im };
    add(a3, c, y);
    add(a3, d, neg);
    add(b, c, neg);
    add(b, d, y);
  }
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) if (Math.hypot(re[row][col], im[row][col]) > Math.hypot(re[pivot][col], im[pivot][col])) pivot = row;
    if (Math.hypot(re[pivot][col], im[pivot][col]) < 1e-12) return fail("Red AC sin referencia suficiente.");
    [re[col], re[pivot]] = [re[pivot], re[col]];
    [im[col], im[pivot]] = [im[pivot], im[col]];
    const p = { re: re[col][col], im: im[col][col] };
    for (let j = col; j <= n; j++) {
      const z = divide({ re: re[col][j], im: im[col][j] }, p);
      re[col][j] = z.re;
      im[col][j] = z.im;
    }
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const g = { re: re[row][col], im: im[row][col] };
      for (let j = col; j <= n; j++) {
        const z = multiply(g, { re: re[col][j], im: im[col][j] });
        re[row][j] -= z.re;
        im[row][j] -= z.im;
      }
    }
  }
  for (let i = 0; i < n; i++) volts[nodes[i]] = { re: re[i][n], im: im[i][n] };
  for (const b of branches) {
    const a3 = volts[b.a], z = volts[b.b];
    amps[b.id] = a3 && z ? divide({ re: a3.re - z.re, im: a3.im - z.im }, { re: b.resistance, im: b.reactance ?? 0 }) : { re: 0, im: 0 };
  }
  for (const load of coupled) {
    const v = load.ports.map(([a3, b]) => ({ re: (volts[a3]?.re ?? 0) - (volts[b]?.re ?? 0), im: (volts[a3]?.im ?? 0) - (volts[b]?.im ?? 0) }));
    for (let i = 0; i < v.length; i++) amps[load.ids[i]] = load.admittance[i].reduce((sum2, y, j) => {
      const x = multiply(y, v[j]);
      return { re: sum2.re + x.re, im: sum2.im + x.im };
    }, { re: 0, im: 0 });
  }
  if (Object.values(volts).some((v) => !Number.isFinite(v.re) || !Number.isFinite(v.im))) return fail("El c\xE1lculo AC no converge.");
  return { volts, amps, floating, fault: null };
}

// src/data/panelMotorDynamics.ts
var MOTOR_EQUIVALENT = { statorOhms: 4, rotorOhms: 3, statorX50: 7, rotorX50: 7, magnetizingX50: 180, poles: 4, inertia: 0.18, friction: 5e-3 };
var motorFrequency = (m) => Math.max(20, Math.min(70, m.frequencyHz ?? 50));
function motorEquivalent(m, slipOverride) {
  const p = m.motorParameters ?? MOTOR_EQUIVALENT, f = motorFrequency(m), syncRpm = 120 * f / p.poles, dir = m.motorDirection ?? 1;
  const slip = Math.max(1e-3, Math.min(1.999, slipOverride ?? 1 - (m.rotorRpm ?? 0) / (dir * syncRpm))), zrot = { re: p.rotorOhms / slip, im: p.rotorX50 * f / 50 }, zmag = { re: 0, im: p.magnetizingX50 * f / 50 };
  const parallel = divide(multiply(zrot, zmag), { re: zrot.re + zmag.re, im: zrot.im + zmag.im }), impedance = { re: p.statorOhms + parallel.re, im: p.statorX50 * f / 50 + parallel.im };
  const rotorRatio = divide(divide(parallel, impedance), zrot);
  return { impedance, slip, syncRpm, rotorRatio };
}

// src/data/panelSequences.ts
var a = { re: -0.5, im: Math.sqrt(3) / 2 };
var a2 = { re: -0.5, im: -Math.sqrt(3) / 2 };
var sum = (z) => ({ re: z.reduce((s, v) => s + v.re, 0) / 3, im: z.reduce((s, v) => s + v.im, 0) / 3 });
function sequences(v) {
  return { zero: sum(v), positive: sum([v[0], multiply(a, v[1]), multiply(a2, v[2])]), negative: sum([v[0], multiply(a2, v[1]), multiply(a, v[2])]) };
}
var restore = (z, p, n) => [{ re: z.re + p.re + n.re, im: z.im + p.im + n.im }, ...[[a2, a], [a, a2]].map(([x, y]) => {
  const px = multiply(x, p), ny = multiply(y, n);
  return { re: z.re + px.re + ny.re, im: z.im + px.im + ny.im };
})];
function motorAdmittance(model) {
  const eq = motorEquivalent(model), neg = motorEquivalent(model, 2 - eq.slip), forward = divide({ re: 1, im: 0 }, eq.impedance), backward = divide({ re: 1, im: 0 }, neg.impedance), dir = model.motorDirection ?? 1;
  const cols = [0, 1, 2].map((j) => {
    const seq = sequences([0, 1, 2].map((i) => ({ re: i === j ? 1 : 0, im: 0 })));
    return restore(multiply(seq.zero, forward), multiply(seq.positive, dir === 1 ? forward : backward), multiply(seq.negative, dir === 1 ? backward : forward));
  });
  return [0, 1, 2].map((i) => [0, 1, 2].map((j) => cols[j][i]));
}
function switchingRms(current, model) {
  const rms = Math.hypot(current.re, current.im), age = (model.simulationSeconds ?? 0) - (model.lastMakeSeconds ?? -10);
  if (model.lastMakeSeconds == null || age < 0 || age > 0.2 || model.motorMode !== "induction") return rms;
  const omega = 2 * Math.PI * motorFrequency(model), z = motorEquivalent(model).impedance, tau = Math.max(5e-4, Math.min(0.08, Math.abs(z.im) / (omega * Math.max(0.05, z.re)))), close = omega * model.lastMakeSeconds, offset = -Math.SQRT2 * (current.re * Math.cos(close) - current.im * Math.sin(close));
  let squares = 0;
  for (let i = 0; i < 64; i++) {
    const t = age + (i + 0.5) / 64 / motorFrequency(model), phase = omega * (model.lastMakeSeconds + t), sample = Math.SQRT2 * (current.re * Math.cos(phase) - current.im * Math.sin(phase)) + offset * Math.exp(-t / tau);
    squares += sample * sample;
  }
  return Math.sqrt(squares / 64);
}

// src/data/panelElectrical.ts
var DEFAULT_PANEL_METER_MODEL = { nameplate: { ...EXAMPLE_RATING }, lineVolts: 380, supplyVariationPct: 0, supplyVariationEnabled: false, coilOhms: 240, pilotOhms: 480, windingOhms: 100, motorMode: "induction", frequencyHz: 50, loadTorqueNm: 4, lineOhms: 0.15 };
function supplyLineVolts(model) {
  if (!model.supplyVariationEnabled) return model.lineVolts;
  const seconds = model.simulationSeconds;
  if (seconds === void 0 || !Number.isFinite(seconds)) return model.lineVolts;
  const t = Math.max(0, seconds), amount = Math.max(0, Math.min(1, model.supplyVariationPct ?? 0)) / 100;
  return model.lineVolts * (1 + amount * (0.65 * Math.sin(2 * Math.PI * t / 7.3) + 0.35 * Math.sin(2 * Math.PI * t / 2.1)));
}
var AMMETER_MAX = 20;
var MA_MAX = 0.6;
var jackLimit = (jack) => jack === "ma" ? MA_MAX : AMMETER_MAX;
function panelElectrical(wires, input, relays, timed, model = DEFAULT_PANEL_METER_MODEL, meter2) {
  const parent = new Map(TERMINALS.map((t) => [t.key, t.key]));
  const root = (id) => {
    const p = parent.get(id);
    if (!p) return id;
    if (p !== id) parent.set(id, root(p));
    return parent.get(id);
  };
  const join = (a3, b) => parent.set(root(a3), root(b));
  for (const w of wires) join(w.from.terminalId, w.to.terminalId);
  const contacts = simulationContacts(input, relays, timed);
  for (const [a3, b] of contacts) join(a3, b);
  const ports = {};
  const branches = [], load = (id, a3, b, resistance, reactance = 0) => {
    ports[id] = [a3, b];
    a3 = root(a3);
    b = root(b);
    if (a3 !== b) branches.push({ id, a: a3, b, resistance, reactance });
  };
  for (const id of relayIds()) load(id, `${id}:A1`, `${id}:A2`, model.coilOhms);
  for (let n = 1; n <= 4; n++) load(`pilot-${n}`, `BOTONERAS:PILOTO_${n}`, "BOTONERAS:N", model.pilotOhms);
  const motor2 = model.motorMode === "induction" ? motorEquivalent(model).impedance : { re: model.windingOhms, im: 0 };
  for (const p of ["U", "V", "W"]) load(`winding-${p}`, `BORNERA_MOTOR:${p}1`, `BORNERA_MOTOR:${p}2`, motor2.re, motor2.im);
  if (meter2) load("ammeter", meter2.red, meter2.black, 0.1);
  const energized = input.enabled && input.plugged, control2 = energized && input.breakers.every(Boolean), force = energized && input.forceBreaker;
  const source2 = [
    { id: "FUENTE:F", re: control2 ? 24 : 0, im: 0, family: "control" },
    { id: "FUENTE:N", re: 0, im: 0, family: "control" },
    ...["R", "S", "T"].filter((p) => model.openPhase !== p).map((p) => {
      const i = ["R", "S", "T"].indexOf(p), v = force ? supplyLineVolts(model) * (model.phaseScale?.[i] ?? 1) / Math.sqrt(3) : 0;
      return { id: (model.lineOhms ?? 0) > 0 ? `__SUPPLY_${p}` : `FUENTE:${p}`, re: v * Math.cos(-i * 2 * Math.PI / 3), im: v * Math.sin(-i * 2 * Math.PI / 3), family: "force" };
    })
  ];
  if ((model.lineOhms ?? 0) > 0) {
    for (const phase of ["R", "S", "T"]) if (model.openPhase !== phase) load(`supply-${phase}`, `__SUPPLY_${phase}`, `FUENTE:${phase}`, model.lineOhms);
  }
  const fixedRe = {}, fixedIm = {}, families = /* @__PURE__ */ new Map();
  let fault = null;
  for (const s of source2) {
    const r = root(s.id);
    if (r in fixedRe && Math.hypot(fixedRe[r] - s.re, fixedIm[r] - s.im) > 1e-6) fault = "Cortocircuito entre fuentes de tensi\xF3n.";
    fixedRe[r] = s.re;
    fixedIm[r] = s.im;
    if (!families.has(r)) families.set(r, /* @__PURE__ */ new Set());
    families.get(r).add(s.family);
  }
  for (let i = 0; i < branches.length + 1; i++) {
    let changed = false;
    for (const b of branches) {
      const both = /* @__PURE__ */ new Set([...families.get(b.a) ?? [], ...families.get(b.b) ?? []]);
      for (const id of [b.a, b.b]) if (both.size > (families.get(id)?.size ?? 0)) {
        families.set(id, new Set(both));
        changed = true;
      }
    }
    if (!changed) break;
  }
  if ([...families.values()].some((f) => f.size > 1)) fault = "Mando y fuerza unidos: revisa la separaci\xF3n de las fuentes.";
  const same = (a3, b) => root(`BORNERA_MOTOR:${a3}`) === root(`BORNERA_MOTOR:${b}`), connection = same("U2", "V2") && same("V2", "W2") ? "star" : same("U1", "W2") && same("V1", "U2") && same("W1", "V2") ? "delta" : null;
  const coupled = model.motorMode === "induction" && connection ? [{ ids: ["winding-U", "winding-V", "winding-W"], ports: ["U", "V", "W"].map((p) => [root(`BORNERA_MOTOR:${p}1`), root(`BORNERA_MOTOR:${p}2`)]), admittance: motorAdmittance(model) }] : [];
  const solved = solvePanelAC(coupled.length ? branches.filter((b) => !b.id.startsWith("winding-")) : branches, Object.fromEntries(Object.keys(fixedRe).map((id) => [id, { re: fixedRe[id], im: fixedIm[id] }])), coupled);
  fault ??= solved.fault;
  const current = meter2 && root(meter2.red) === root(meter2.black) ? 0 : switchingRms(solved.amps.ammeter ?? { re: 0, im: 0 }, model);
  const phasor = (a3, b) => {
    const va = solved.volts[root(a3)], vb = solved.volts[root(b)];
    return va && vb ? { re: va.re - vb.re, im: va.im - vb.im } : { re: 0, im: 0 };
  };
  const voltage = (a3, b) => {
    a3 = root(a3);
    b = root(b);
    if (a3 === b) return 0;
    const fa = families.get(a3), fb = families.get(b);
    if (!fa?.size || !fb?.size || [...fa].some((f) => !fb.has(f))) return null;
    if (solved.volts[a3] === void 0 || solved.volts[b] === void 0) return null;
    return Math.hypot(solved.volts[a3].re - solved.volts[b].re, solved.volts[a3].im - solved.volts[b].im);
  };
  const linePhasors = {};
  const lineAmps = Object.fromEntries(["R", "S", "T"].map((phase) => {
    const node = root(`FUENTE:${phase}`), sum2 = (part) => branches.filter((b) => !b.id.startsWith("supply-")).reduce((total, b) => total + (b.a === node ? solved.amps[b.id]?.[part] ?? 0 : b.b === node ? -(solved.amps[b.id]?.[part] ?? 0) : 0), 0);
    linePhasors[phase] = { re: sum2("re"), im: sum2("im") };
    return [phase, switchingRms(linePhasors[phase], model)];
  }));
  const conductorCurrent = (from, to) => {
    const index = contacts.findIndex(([a3, b]) => a3 === from && b === to || a3 === to && b === from);
    if (index < 0) return { amps: 0, bypassed: false };
    const graph = /* @__PURE__ */ new Map(), edge = (a3, b) => {
      if (!graph.has(a3)) graph.set(a3, /* @__PURE__ */ new Set());
      if (!graph.has(b)) graph.set(b, /* @__PURE__ */ new Set());
      graph.get(a3).add(b);
      graph.get(b).add(a3);
    };
    wires.forEach((w) => edge(w.from.terminalId, w.to.terminalId));
    contacts.forEach(([a3, b], i) => {
      if (i !== index) edge(a3, b);
    });
    const region = (id) => {
      const seen = /* @__PURE__ */ new Set([id]), queue = [id];
      for (let i = 0; i < queue.length; i++) for (const next of graph.get(queue[i]) ?? []) if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
      return seen;
    };
    let side = region(to);
    if (side.has(from)) return { amps: 0, bypassed: true };
    if (source2.some((v) => side.has(v.id))) side = region(from);
    const current2 = Object.entries(ports).reduce((sum2, [id, [a3, b]]) => {
      const z = solved.amps[id] ?? { re: 0, im: 0 }, sign = Number(side.has(a3)) - Number(side.has(b));
      return { re: sum2.re + sign * z.re, im: sum2.im + sign * z.im };
    }, { re: 0, im: 0 });
    return { amps: switchingRms(current2, model), bypassed: false };
  };
  const thermalPoles = [1, 2, 3].map((i) => conductorCurrent(`CONTACTOR_TERMICO:L${i}`, `CONTACTOR_TERMICO:T${i}`));
  const sequence = sequences(["U", "V", "W"].map((p) => phasor(`BORNERA_MOTOR:${p}1`, `BORNERA_MOTOR:${p}2`))), positive = model.motorDirection === -1 ? sequence.negative : sequence.positive, negative = model.motorDirection === -1 ? sequence.positive : sequence.negative;
  const positiveVolts = Math.hypot(positive.re, positive.im), negativeVolts = Math.hypot(negative.re, negative.im);
  const wirePhasor = (id) => {
    const wire = wires.find((w) => w.id === id);
    if (!wire) return null;
    const graph = /* @__PURE__ */ new Map(), edge = (a3, b) => {
      if (!graph.has(a3)) graph.set(a3, /* @__PURE__ */ new Set());
      if (!graph.has(b)) graph.set(b, /* @__PURE__ */ new Set());
      graph.get(a3).add(b);
      graph.get(b).add(a3);
    };
    wires.forEach((w) => {
      if (w.id !== id) edge(w.from.terminalId, w.to.terminalId);
    });
    contacts.forEach(([a3, b]) => edge(a3, b));
    const region = (id2) => {
      const seen = /* @__PURE__ */ new Set([id2]), q = [id2];
      for (let i = 0; i < q.length; i++) for (const next of graph.get(q[i]) ?? []) if (!seen.has(next)) {
        seen.add(next);
        q.push(next);
      }
      return seen;
    };
    let side = region(wire.to.terminalId), sign = 1;
    if (side.has(wire.from.terminalId)) return null;
    if (source2.some((s) => side.has(s.id))) {
      side = region(wire.from.terminalId);
      sign = -1;
    }
    return Object.entries(ports).reduce((sum2, [id2, [a3, b]]) => {
      const z = solved.amps[id2] ?? { re: 0, im: 0 }, k = (Number(side.has(a3)) - Number(side.has(b))) * sign;
      return { re: sum2.re + k * z.re, im: sum2.im + k * z.im };
    }, { re: 0, im: 0 });
  };
  const wireClampAmps = (ids) => {
    const readings = ids.map(wirePhasor);
    return readings.some((v) => v === null) ? null : switchingRms(readings.reduce((sum2, z) => ({ re: sum2.re + z.re, im: sum2.im + z.im }), { re: 0, im: 0 }), model);
  };
  return { root, branches, current, voltage, fault, lineAmps, wireClampAmps, clampAmps: (phases) => switchingRms(phases.reduce((v, p) => ({ re: v.re + (linePhasors[p]?.re ?? 0), im: v.im + (linePhasors[p]?.im ?? 0) }), { re: 0, im: 0 }), model), thermalAmps: thermalPoles.map((p) => p.amps), thermalBypassed: thermalPoles.some((p) => p.bypassed), connection, positiveVolts, negativeVolts, unbalancePct: positiveVolts > 1 ? 100 * negativeVolts / positiveVolts : 0 };
}

// src/data/panelCalibration.ts
var resistanceKey = (a3, b) => [a3, b].sort().join("|");

// src/data/panelMeter.ts
function readPanelMeter(wires, input, result, timed, mode, red, black, model = DEFAULT_PANEL_METER_MODEL, redJack = "vo", fuse = {}) {
  const kind = mode === "V" ? "voltage" : mode === "A" ? "current" : mode === "C" ? "continuity" : "resistance", answer = (text, note2, value2) => ({ text, note: note2, value: value2, kind });
  if (mode === "OFF") return answer("", "Selecciona V~, A~, \u03A9 o continuidad.");
  if (mode === "A" && redJack === "vo") return answer("USA A Y COM", "Conecta el cable rojo a A (o a mA \xB5A para corrientes peque\xF1as) y el negro a COM. Abre una rama del circuito e inserta las puntas en sus dos extremos.");
  if (mode === "A" && redJack !== "vo" && fuse[redJack]) return answer("FUSIBLE", "Se quem\xF3 el fusible de esta entrada: " + (redJack === "ma" ? "0,44 A" : "11 A") + ". C\xE1mbialo con el bot\xF3n \xABFusible\xBB junto al mult\xEDmetro para volver a medir corriente.");
  if (mode !== "A" && redJack !== "vo") return answer("USA V \u03A9", "Vuelve a conectar el cable rojo a V \u03A9 para medir tensi\xF3n, resistencia o continuidad.");
  if (!red || !black || ![red, black].every((id) => TERMINALS.some((t) => t.key === id))) return answer("Pon las puntas", "Arrastra cada punta a un borne real del panel.");
  const energized = input.enabled && input.plugged, contacts = simulationContacts(input, result.relays, timed), parent = /* @__PURE__ */ new Map();
  const root = (x) => {
    const p = parent.get(x);
    if (!p) {
      parent.set(x, x);
      return x;
    }
    if (p !== x) parent.set(x, root(p));
    return parent.get(x);
  }, join = (a3, b) => parent.set(root(a3), root(b));
  const edges = [...wires.map((w) => [w.from.terminalId, w.to.terminalId]), ...contacts];
  edges.forEach(([a3, b]) => join(a3, b));
  if (mode === "R" || mode === "C") {
    if (energized) return answer("DESENERGIZA", "Desconecta el enchufe virtual antes de medir \u03A9 o continuidad, tambi\xE9n si los interruptores est\xE1n abiertos.");
    if (root(red) === root(black)) {
      const branches = edges.map(([a3, b], i) => ({ id: String(i), a: a3, b, resistance: i < wires.length ? 0.01 : 0.02 })).filter((b) => root(b.a) === root(red)), r = red === black ? 0 : (() => {
        const solved2 = solveDC(branches, { [red]: 1, [black]: 0 });
        return solved2.fault ? 0 : 1 / Math.abs(branches.reduce((sum2, b) => b.a === red ? sum2 + (solved2.amps[b.id] ?? 0) : b.b === red ? sum2 - (solved2.amps[b.id] ?? 0) : sum2, 0));
      })();
      const value2 = 0.4 + (Number.isFinite(r) ? r : 0);
      return answer(`${value2.toFixed(1).replace(".", ",")} \u03A9`, "Modelo de prueba: 0,2 \u03A9 por punta, 0,01 \u03A9 por cable y 0,02 \u03A9 por contacto cerrado; valores did\xE1cticos.", value2);
    }
  }
  const loads = [...["U", "V", "W"].map((p) => [`BORNERA_MOTOR:${p}1`, `BORNERA_MOTOR:${p}2`]), ...relayIds().map((id) => [`${id}:A1`, `${id}:A2`]), ...[1, 2, 3, 4].map((n) => [`BOTONERAS:PILOTO_${n}`, "BOTONERAS:N"])], loadGraph = /* @__PURE__ */ new Map();
  loads.forEach(([a3, b]) => {
    a3 = root(a3);
    b = root(b);
    if (a3 === b) return;
    if (!loadGraph.has(a3)) loadGraph.set(a3, /* @__PURE__ */ new Set());
    if (!loadGraph.has(b)) loadGraph.set(b, /* @__PURE__ */ new Set());
    loadGraph.get(a3).add(b);
    loadGraph.get(b).add(a3);
  });
  const reachable = (start) => {
    const origin = root(start), seen = /* @__PURE__ */ new Set([origin]), queue = [origin];
    while (queue.length) {
      const a3 = queue.pop();
      for (const b of loadGraph.get(a3) ?? []) if (!seen.has(b)) {
        seen.add(b);
        queue.push(b);
      }
    }
    return seen;
  };
  if (mode === "R" || mode === "C") {
    if (!reachable(red).has(root(black))) return answer("OL", "No hay camino por cables, contactos o cargas modeladas.", null);
    if (!model.resistanceMode) return answer("SIN DATOS", "Resistencia f\xEDsica sin documentar. Elige expl\xEDcitamente un perfil did\xE1ctico o aporta una medici\xF3n de referencia.");
    const unknown = [], dcLoads = loads.flatMap(([a3, b], i) => {
      const datum = model.providedResistances?.[resistanceKey(a3, b)], ohms = model.resistanceMode === "model" ? datum?.ohms ?? (i < 3 ? (model.motorParameters ?? MOTOR_EQUIVALENT).statorOhms : i < 3 + relayIds().length ? model.coilOhms : model.pilotOhms) : datum?.ohms;
      if (ohms === void 0) {
        if (reachable(red).has(root(a3)) || reachable(red).has(root(b))) unknown.push(a3 + "\u2013" + b);
        return [];
      }
      return [{ id: "load-" + i, a: a3, b, resistance: ohms }];
    });
    if (unknown.length) return answer("SIN DATOS", "Hay resistencias pendientes de referencia en este circuito. A\xEDsla el componente o completa los datos aportados.");
    const branches = [...edges.map(([a3, b], i) => ({ id: "path-" + i, a: a3, b, resistance: i < wires.length ? 0.01 : 0.02 })), ...dcLoads], solved2 = solveDC(branches, { [red]: 1, [black]: 0 });
    if (solved2.fault) return answer("SIN DATOS", solved2.fault);
    const amps = Math.abs(branches.reduce((sum2, b) => sum2 + (b.a === red ? solved2.amps[b.id] ?? 0 : b.b === red ? -(solved2.amps[b.id] ?? 0) : 0), 0));
    if (amps < 1e-12) return answer("OL", "Circuito abierto para la corriente de prueba.", null);
    const value2 = 0.4 + 1 / amps, shown2 = formatReading("resistance", value2);
    return answer(`${shown2.text} ${shown2.unit}`, model.resistanceMode === "model" ? "\u03A9 del perfil did\xE1ctico, incluidos caminos en paralelo y 0,2 \u03A9 por punta. No es una resistencia medida del equipo f\xEDsico." : "\u03A9 calculados con datos aportados por el usuario y 0,2 \u03A9 por punta; la validaci\xF3n f\xEDsica sigue pendiente.", value2);
  }
  if (!energized) return answer(mode === "A" ? "0,000 A" : "0,000 V", "Fuente virtual desconectada. Esta lectura pertenece al modelo, no verifica el equipo f\xEDsico.", 0);
  if (result.fault) return answer("REVISAR", "Resuelve la falla de la simulaci\xF3n antes de medir.");
  const solved = panelElectrical(wires, input, result.relays, timed, model, mode === "A" ? { red, black } : void 0);
  if (solved.fault) return answer(mode === "A" ? "REVISAR SERIE" : "REVISAR", solved.fault);
  const note = (model.motorMode === "induction" ? `Inducci\xF3n RMS: ${Math.round(model.rotorRpm ?? 0)} rpm, carga ${model.loadTorqueNm ?? 4} N\xB7m. ` : "Equivalente resistivo. ") + `Modelo did\xE1ctico: mando 24 V~, fuerza ${model.lineVolts} V~ entre fases; bobina ${model.coilOhms} \u03A9, piloto ${model.pilotOhms} \u03A9 y ${model.motorMode === "induction" ? "devanados con impedancia de inducci\xF3n" : `devanado ${model.windingOhms} \u03A9 resistivo`}. Valores ajustables, no datos de placa.`;
  if (mode === "A") {
    if (root(red) === root(black)) return answer("ABRE LA RAMA", "Las puntas est\xE1n unidas por un cable o contacto. Retira un extremo del cable e intercala el tester en ese corte.");
    if (solved.current > jackLimit(redJack)) return answer("SOBRECARGA", redJack === "ma" ? "La entrada mA \xB5A supera 600 mA: se quemar\xEDa su fusible. Revisa que el tester est\xE9 en serie y no entre dos fuentes." : "La entrada A supera 20 A: se quemar\xEDa su fusible de 11 A. Revisa que el tester est\xE9 en serie y no entre dos fuentes.");
    if (redJack === "ma") {
      const ma = solved.current * 1e3, t = ma.toFixed(ma < 40 ? 2 : 1).replace(".", ",");
      return answer(`${t} mA`, note + " El tester cierra la rama con una carga de 0,1 \u03A9.", solved.current);
    }
    const shown2 = formatReading("current", solved.current);
    return answer(`${shown2.text} ${shown2.unit}`, note + " El tester cierra la rama con una carga de 0,1 \u03A9.", solved.current);
  }
  const value = solved.voltage(red, black);
  if (value === null) return answer("SIN REFERENCIA", "Punto flotante o fuentes aisladas entre s\xED. Usa dos puntos de mando o dos puntos de fuerza; TP no es el retorno de medida.");
  const shown = formatReading("voltage", value);
  return answer(`${shown.text} ${shown.unit}`, note, value);
}

// src/data/meterActivity.ts
var isForceTerminal = (id) => /^FUENTE:[RST]$|^BORNERA_MOTOR:|:[LT][123]$|:TP/.test(id);
var isForceWire = (w) => isForceTerminal(w.from.terminalId) || isForceTerminal(w.to.terminalId);
function activityDocument(profile, scope = "full") {
  const wires = [];
  if (profile !== "matias") for (const [from, to] of (profile === "twoContactors" ? LESSONS.estrellaDosContactores : LESSONS.estrellaManual).pairs) wires.push({ id: crypto.randomUUID(), from: { terminalId: from }, to: { terminalId: to }, color: BANANA_COLOR, route: { sag: 130 }, layer: wires.length + 1 });
  else wires.push(...structuredClone(activity2Matias_default.wires));
  return { ...emptyPractice(), title: `Actividad 2 \xB7 mediciones \xB7 ${profile === "twoContactors" ? "panel de dos contactores" : profile === "manual" ? "gu\xEDa manual" : "Mat\xEDas"}`, wires: scope === "control" ? wires.filter((w) => !isForceWire(w)) : wires, diagram: profile === "twoContactors" ? LESSONS.estrellaDosContactores.diagram : profile === "manual" ? LESSONS.estrellaManual.diagram : emptyPractice().diagram };
}
function matchesActivity(profile, wires, scope = "full") {
  const reference = profile !== "matias" ? (profile === "twoContactors" ? LESSONS.estrellaDosContactores : LESSONS.estrellaManual).pairs.map(([from, to]) => ({ from: { terminalId: from }, to: { terminalId: to } })) : activity2Matias_default.wires;
  const ids = [.../* @__PURE__ */ new Set([...TERMINALS.map((t) => t.key), ...reference.flatMap((w) => [w.from.terminalId, w.to.terminalId])])], known = new Set(ids);
  if (wires.some((w) => !known.has(w.from.terminalId) || !known.has(w.to.terminalId))) return false;
  const domain = scope === "control" ? ids.filter((id) => !isForceTerminal(id)) : ids;
  if (scope === "control" && wires.some((w) => isForceTerminal(w.from.terminalId) !== isForceTerminal(w.to.terminalId))) return false;
  const partition = (ws) => {
    const parent = new Map(ids.map((id) => [id, id]));
    const root = (id) => {
      const p = parent.get(id);
      if (p !== id) parent.set(id, root(p));
      return parent.get(id);
    };
    ws.forEach((w) => parent.set(root(w.from.terminalId), root(w.to.terminalId)));
    const groups = /* @__PURE__ */ new Map();
    domain.forEach((id) => {
      const key = root(id);
      groups.set(key, [...groups.get(key) ?? [], id]);
    });
    return [...groups.values()].map((g) => g.sort().join("|")).sort().join(";");
  };
  return partition(wires) === partition(reference);
}
var meter = (id, title, page, point2, stage, mode, red, black, why, table, expected) => ({ id, title, page, point: point2, stage, mode, red, black, why, table, expected, kind: "meter", task: `Selecciona ${mode === "V" ? "V~" : mode === "R" ? "\u03A9" : "continuidad"}. Coloca las puntas en los dos bornes indicados y escribe lo que lees.` });
var ACTIVITY_STEPS = [
  meter("thermal", "Continuidad del t\xE9rmico", 4, "4 y 11", "cold", "C", "CONTACTOR_TERMICO:95", "CONTACTOR_TERMICO:96", "Antes de energizar, comprueba el contacto NC 95\u201396 en reposo. El tono y la baja resistencia indican un camino cerrado.", void 0, "low"),
  meter("stop", "Continuidad del paro", 4, "4", "cold", "C", "BOTONERAS:S2:1", "BOTONERAS:S2:2", "SB1 del dibujo es S2 en el banco. Su par NC 1\u20132 est\xE1 cerrado en reposo.", void 0, "low"),
  meter("start-open", "Reconocer un auxiliar NA libre", 4, "Preparaci\xF3n adicional", "cold", "C", "CONTACTOR_TRIFASICO:63", "CONTACTOR_TRIFASICO:64", "El auxiliar NA de reserva 63\u201364 de KM2 est\xE1 sin cablear en ambos montajes y abierto en reposo. As\xED evitas confundir el contacto abierto con rutas paralelas del circuito: OL no significa un fallo del instrumento.", void 0, "open"),
  meter("contact-ohms", "Resistencia de un contacto cerrado", 4, "Preparaci\xF3n adicional", "cold", "R", "CONTACTOR_TERMICO:95", "CONTACTOR_TERMICO:96", "Pr\xE1ctica adicional de \u03A9: la gu\xEDa pide continuidad, no una tabla de resistencias. El modelo incluye 0,2 \u03A9 por punta y 0,02 \u03A9 por contacto; no es una resistencia real de placa.", void 0, "low"),
  meter("control-volts", "Voltaje de alimentaci\xF3n del mando", 5, "5", "control", "V", "FUENTE:F", "FUENTE:N", "En el banco virtual el secundario F\u2013N es de 24 V~. La gu\xEDa usa alimentaci\xF3n monof\xE1sica; no confundas estos 24 V did\xE1cticos con su red monof\xE1sica."),
  { id: "control-rest", title: "Mando \xB7 piloto de motor detenido", page: 6, point: "6", stage: "control-rest", kind: "action", why: "La gu\xEDa comprueba primero el circuito de mando, sin habilitar fuerza. El piloto rojo P2 debe indicar reposo.", task: "Mant\xE9n FUERZA abierta. Con el mando alimentado y sin pulsar marcha, observa P2 rojo encendido." },
  { id: "control-star", title: "Mando \xB7 orden de partir en estrella", page: 6, point: "7", stage: "control-star", kind: "action", why: "En el esquema del profesor, SB2 activa KM1 y KM3. Se apaga el rojo y se enciende el verde de estrella; con FUERZA abierta el motor a\xFAn no gira.", task: "Sin cerrar FUERZA, pulsa y suelta S1 (SB2 del profesor). Comprueba las bobinas y el piloto de estrella." },
  { id: "control-delta", title: "Mando \xB7 orden de conexi\xF3n tri\xE1ngulo", page: 7, point: "8", stage: "control-delta", kind: "action", why: "En la gu\xEDa, KM1 se mantiene, KM3 cae y entra KM2. La se\xF1al pasa del verde de estrella al de tri\xE1ngulo, todav\xEDa sin fuerza.", task: "En el manual pulsa S3 (SB3). En la variante opcional de Mat\xEDas espera el temporizador. Mant\xE9n FUERZA abierta." },
  { id: "control-trip", title: "Mando \xB7 prueba TEST del t\xE9rmico", page: 7, point: "9", stage: "control-trip", kind: "action", why: "El profesor comprueba el disparo antes de montar fuerza: caen las bobinas, se apagan los verdes y se encienden amarillo y rojo.", task: "Pulsa TEST del t\xE9rmico y verifica el corte de las bobinas y los dos pilotos de aviso." },
  { id: "control-reset", title: "Mando \xB7 RESET y vuelta al reposo", page: 7, point: "10", stage: "control-reset", kind: "action", why: "RESET apaga el amarillo y mantiene el rojo. Rearmar no es una nueva orden de marcha.", task: "Rearma el t\xE9rmico. Comprueba que solo el piloto rojo queda encendido y las bobinas siguen desactivadas." },
  meter("force-continuity", "Fuerza \xB7 comprobar continuidad antes de energizar", 8, "11", "cold", "C", "FUENTE:R", "CONTACTOR_TERMICO:L1", "Con las alimentaciones desconectadas, comprueba el cable desde R a la entrada L1 del contactor principal. No confundas este cable con el polo interno L1\u2013T1.", void 0, "low"),
  ...[["R", "S"], ["R", "T"], ["S", "T"]].map(([a3, b]) => meter(`line-${a3}${b}`, `Voltaje entre fases ${a3}\u2013${b}`, 8, "12", "supply", "V", `FUENTE:${a3}`, `FUENTE:${b}`, "Las dos puntas van entre fases, en paralelo. No uses TP ni el N del mando como referencia de fuerza. El modelo parte de 380 V entre fases.", "Tabla 1")),
  { id: "powered-rest", title: "Fuerza y mando \xB7 motor detenido", page: 8, point: "13", stage: "powered-rest", kind: "action", why: "Despu\xE9s de medir la alimentaci\xF3n trif\xE1sica, el profesor vuelve a habilitar el mando y verifica el piloto rojo antes de arrancar.", task: "Mant\xE9n FUERZA cerrada, vuelve a cerrar ambos CONTROL y verifica P2 rojo y el motor detenido." },
  { id: "start-star", title: "Poner el motor en estrella", page: 8, point: "14", stage: "star", kind: "action", why: "Reconoce primero qu\xE9 contactores act\xFAan. La lectura siguiente solo es v\xE1lida cuando el motor est\xE1 en estrella.", task: "Conecta la corriente virtual, cierra FUERZA y los dos CONTROL. Pulsa y suelta S1 (SB2 en la gu\xEDa)." },
  ...["U", "V", "W"].map((p) => meter(`star-${p}`, `Estrella \xB7 devanado ${p}1\u2013${p}2`, 9, "15", "star", "V", `BORNERA_MOTOR:${p}1`, `BORNERA_MOTOR:${p}2`, "Mide entre los dos extremos de una misma bobina, no entre dos bornes superiores. En el modelo equilibrado esperas V de l\xEDnea / \u221A3.", "Tabla 3")),
  ...["R", "S", "T"].map((phase) => ({ id: `star-current-${phase}`, title: `Estrella \xB7 corriente de l\xEDnea ${phase}`, page: 9, point: "16", stage: "star", kind: "clamp", phase, table: "Tabla 4", why: "La gu\xEDa pide amper\xEDmetro de tenazas: abraza un solo conductor de entrada, antes de sus derivaciones. No conectes un mult\xEDmetro en A entre fases.", task: "En la pinza virtual, elige el conductor de entrada solicitado y registra su lectura." })),
  { id: "change-delta", title: "Cambiar a tri\xE1ngulo", page: 9, point: "17", stage: "delta", kind: "action", why: "La gu\xEDa manual mantiene KM1, desactiva KM3 y activa KM2. En Mat\xEDas, KT1 permanece y el temporizador cambia de KM1 a KM2.", task: "En el montaje manual pulsa y suelta S3 (SB3). En Mat\xEDas, reduce el retardo del temporizador y espera el cambio autom\xE1tico." },
  ...["U", "V", "W"].map((p) => meter(`delta-${p}`, `Tri\xE1ngulo \xB7 devanado ${p}1\u2013${p}2`, 10, "18", "delta", "V", `BORNERA_MOTOR:${p}1`, `BORNERA_MOTOR:${p}2`, "Conserva la medici\xF3n entre los extremos de la misma bobina. En tri\xE1ngulo cada devanado queda entre dos fases y recibe la tensi\xF3n de l\xEDnea.", "Tabla 5")),
  ...["R", "S", "T"].map((phase) => ({ id: `delta-current-${phase}`, title: `Tri\xE1ngulo \xB7 corriente de l\xEDnea ${phase}`, page: 10, point: "19", stage: "delta", kind: "clamp", phase, table: "Tabla 6", why: "Vuelve a medir el mismo conductor de entrada, antes de las bifurcaciones. Compara con la corriente que registraste en estrella.", task: "Selecciona una sola fase en la pinza virtual y anota la corriente." })),
  { id: "compare", title: "Comparar estrella y tri\xE1ngulo", page: 10, point: "20", stage: "delta", kind: "compare", why: "Usa tus tablas para explicar c\xF3mo cambia la tensi\xF3n de cada bobina y la corriente de entrada. El motor de inducci\xF3n cambia su corriente con velocidad, carga y conexi\xF3n. Registra en qu\xE9 condici\xF3n hiciste cada medici\xF3n.", task: "Explica la relaci\xF3n VY \u2248 VL/\u221A3 y V\u0394 \u2248 VL. Calcula I\u0394/IY con tus datos. La relaci\xF3n 3 solo corresponde a la misma impedancia y tensi\xF3n de red; no es universal entre dos estados de marcha." },
  { id: "overload", title: "Comprobar la sobrecarga virtual", page: 11, point: "21", stage: "trip", kind: "action", why: "TEST abre 95\u201396, corta el mando y debe detener el motor. El contacto 97\u201398 se\xF1aliza el disparo.", task: "Activa TEST del t\xE9rmico y observa la parada y el aviso de sobrecarga." },
  { id: "reset", title: "Rearmar el rel\xE9 t\xE9rmico", page: 12, point: "22", stage: "reset", kind: "action", why: "RESET elimina el estado de disparo, pero no debe arrancar el motor por s\xED mismo.", task: "Rearma el t\xE9rmico y verifica que el motor permanezca detenido." },
  { id: "shutdown", title: "Desenergizar el banco", page: 12, point: "23\u201324", stage: "off", kind: "action", why: "Guarda los resultados para revisi\xF3n docente y deja el banco sin alimentaci\xF3n. La revisi\xF3n del profesor se registra por separado en el cuaderno de entrega.", task: "Abre FUERZA y ambos CONTROL y desconecta el enchufe virtual. Descarga tus resultados en la pesta\xF1a Resultados." },
  { id: "dismantle", title: "Desmontar y ordenar el panel", page: 12, point: "25", stage: "off", kind: "action", why: "La gu\xEDa termina desconectando los elementos. Tus mediciones se conservan al retirar los cables. Deshacer recupera el circuito.", task: "Con el banco sin alimentaci\xF3n, retira todos los cables o usa \xABDesmontar circuito\xBB. Despu\xE9s comprueba el cierre." }
];
function activityStep(profile, index) {
  const step = ACTIVITY_STEPS[index];
  if (profile === "twoContactors") {
    const changes = {
      "start-open": { why: "El auxiliar NA 63\u201364 de KM2 queda libre en los 37 cables de este montaje y est\xE1 abierto en reposo. Comprueba OL sin confundirlo con una falla del instrumento." },
      "control-rest": { title: "Mando \xB7 reposo del montaje de dos contactores", why: "KT1, KM1 y KM2 est\xE1n desactivados. P2 no est\xE1 cableado en el montaje recibido; en reposo no hay pilotos activos.", task: "Alimenta solo el mando, sin cerrar FUERZA. Comprueba las bobinas desactivadas y los pilotos apagados." },
      "control-star": { why: "S1 alimenta y retiene KT1. El contacto temporizado 55\u201356 da la orden a KM2, que conecta estrella; P1 indica esa orden. Con FUERZA abierta el motor todav\xEDa no gira.", task: "Con FUERZA abierta, pulsa y suelta S1. Comprueba KT1 y KM2 activos, KM1 desactivado y P1 encendido." },
      "control-delta": { why: "KT1 se mantiene y su temporizaci\xF3n abre estrella KM2 y ordena tri\xE1ngulo KM1. P1 se apaga y P4 se enciende; FUERZA sigue abierta.", task: "Espera el temporizador o reduce su retardo. Comprueba KT1 + KM1, KM2 desactivado y P4 encendido." },
      "control-trip": { why: "TEST abre 95\u201396 y desactiva las bobinas. El contacto 97\u201398 enciende P3 amarillo; P2 no est\xE1 cableado.", task: "Pulsa TEST: deben caer KT1, KM1 y KM2, apagarse P1/P4 y encenderse solamente P3." },
      "control-reset": { why: "RESET rearma el t\xE9rmico y apaga P3. No da marcha ni enciende un piloto rojo de reposo, porque P2 no est\xE1 cableado.", task: "Rearma el t\xE9rmico. Comprueba bobinas desactivadas y todos los pilotos apagados." },
      "force-continuity": { black: "TEMPORIZADOR_1:L1", why: "El cable de entrada R llega a L1 del conjunto de l\xEDnea KT1. Comprueba ese conductor sin confundirlo con el polo interno L1\u2013T1.", task: "Desenchufa y abre FUERZA y los dos CONTROL. Mide continuidad entre R y KT1:L1." },
      "powered-rest": { why: "Con las alimentaciones habilitadas, el montaje permanece detenido hasta dar marcha con S1. Los pilotos siguen apagados; no se a\xF1ade P2 al circuito.", task: "Habilita FUERZA y ambos CONTROL sin pulsar marcha. Comprueba el motor y las bobinas en reposo." },
      "start-star": { why: "En este montaje S1 inicia KT1 y KM2 (estrella). KM1 permanece desactivado hasta el cambio temporizado.", task: "Conecta la corriente, cierra FUERZA y los dos CONTROL. Pulsa y suelta S1; comprueba la retenci\xF3n en estrella." },
      "change-delta": { why: "El temporizador mantiene KT1, desactiva KM2 y activa KM1 para tri\xE1ngulo. No interviene un tercer contactor.", task: "Reduce el retardo o espera el cambio autom\xE1tico. Comprueba estrella desactivada y tri\xE1ngulo activo." },
      "overload": { why: "TEST abre 95\u201396 y corta el mando. P3 se\xF1aliza el disparo mediante 97\u201398; no se espera un piloto rojo.", task: "Desde tri\xE1ngulo, pulsa TEST y comprueba la parada y solamente P3 amarillo encendido." }
    };
    return { ...step, ...changes[step.id] };
  }
  if (step.id !== "force-continuity") return step;
  return { ...step, task: "Desenchufa, abre ambos CONTROL y FUERZA. " + step.task, ...profile === "matias" ? { black: "TEMPORIZADOR_1:L1", why: "En el proyecto opcional de Mat\xEDas el conjunto KT1 es el contactor principal. Desconecta las alimentaciones y comprueba el cable R \u2192 KT1:L1." } : {} };
}
function checkActivity(step, c) {
  const fail = (message) => ({ ready: false, message });
  if (step.id === "dismantle") {
    if (c.input.plugged || c.input.forceBreaker || c.input.breakers.some(Boolean)) return fail("Desconecta toda la alimentaci\xF3n antes de desmontar.");
    return c.wires.length ? fail("Retira los cables para dejar el panel desmontado. Tus resultados se conservan.") : { ready: true, message: "Panel sin alimentaci\xF3n y sin cables; cierre virtual comprobado." };
  }
  if (!matchesActivity(c.profile, c.wires, ACTIVITY_STEPS.findIndex((s) => s.id === step.id) < 10 ? "control" : "full")) return fail(c.profile === "manual" && c.wires.some((w) => [w.from.terminalId, w.to.terminalId].includes("BOTONERAS:S2:2") && [w.from.terminalId, w.to.terminalId].includes("BOTONERAS:S3:3")) ? "Referencia antigua: la entrada NA S3:3 debe alimentarse desde S1:4, despu\xE9s de la partida (figura 1, p\xE1g. 5). Desenergiza el banco virtual y corrige ese cable, o prepara el montaje actualizado; tus mediciones se conservan." : "El cableado ya no coincide con la pr\xE1ctica elegida. Revisa las conexiones; Deshacer conserva tu trabajo anterior.");
  const energized = c.input.enabled && c.input.plugged;
  if (["star", "delta"].includes(step.stage) && c.model.nameplate && !ratingCompatibility(c.model.nameplate, c.model.lineVolts, step.stage === "delta" ? "delta" : "star").ok) return fail(ratingCompatibility(c.model.nameplate, c.model.lineVolts, step.stage === "delta" ? "delta" : "star").message);
  if (step.stage === "cold" && energized) return fail("Desconecta el enchufe virtual antes de medir continuidad o resistencia. Abrir solo los interruptores no basta.");
  if (step.stage.startsWith("control") && (!energized || !c.input.breakers.every(Boolean))) return fail("Conecta la corriente virtual y cierra ambos interruptores CONTROL.");
  if (step.stage.startsWith("control") && c.input.forceBreaker) return fail("En esta parte el profesor comprueba solo el mando: abre FUERZA.");
  if (step.id === "force-continuity" && (c.input.forceBreaker || c.input.breakers.some(Boolean))) return fail("Desenchufa y abre FUERZA y los dos CONTROL antes de comprobar fuerza.");
  const pilots = (values) => c.result.pilots.every((v, i) => v === values[i]), allOff = Object.values(c.result.relays).every((v) => !v), roles = activityRoles(c.profile), { main, star, delta } = roles;
  if (["control-rest", "control-reset", "powered-rest"].includes(step.stage) && (!allOff || c.input.thermalTripped || !pilots([false, roles.restPilot, false, false]))) return fail(roles.restPilot ? "Se esperan bobinas desactivadas, t\xE9rmico rearmado y solo el piloto rojo encendido." : "Se esperan bobinas desactivadas y pilotos apagados. P2 no est\xE1 cableado en este montaje.");
  if (step.stage === "powered-rest" && (!energized || !c.input.forceBreaker || !c.input.breakers.every(Boolean))) return fail("Conecta fuerza y ambos interruptores CONTROL para verificar el reposo antes de arrancar.");
  if (step.stage === "control-star" && (!c.result.relays[main] || !c.result.relays[star] || c.result.relays[delta] || !pilots([true, false, false, false]))) return fail(`Pulsa ${roles.start}: deben entrar el conjunto principal y estrella, con P1 encendido.`);
  if (step.stage === "control-delta" && (!c.result.relays[main] || !c.result.relays[delta] || c.result.relays[star] || !pilots([false, false, false, true]))) return fail("Se espera principal + tri\xE1ngulo, con estrella desactivada y su verde apagado.");
  if (step.stage === "control-trip" && (!c.input.thermalTripped || !allOff || !pilots([false, roles.restPilot, true, false]))) return fail(roles.restPilot ? "Activa TEST y comprueba bobinas desactivadas, rojo y amarillo encendidos." : "Activa TEST: bobinas desactivadas y solo P3 amarillo encendido.");
  if (["trip", "reset"].includes(step.stage) && (!energized || !c.input.forceBreaker || !c.input.breakers.every(Boolean))) return fail("Mant\xE9n mando y fuerza alimentados para comprobar el t\xE9rmico. Cortar la alimentaci\xF3n no sustituye TEST o RESET.");
  if (step.kind === "action" && c.input.pressed.length) return fail("Suelta los pulsadores antes de comprobar el estado.");
  if (["supply", "star", "delta"].includes(step.stage) && (!energized || !c.input.forceBreaker)) return fail("Conecta la corriente virtual y cierra FUERZA.");
  if (step.stage === "supply" && c.result.motor.status !== "off") return fail("Det\xE9n el motor con S2 antes de comprobar la alimentaci\xF3n.");
  if ((step.stage === "star" || step.stage === "delta") && (c.input.thermalTripped || !c.input.breakers.every(Boolean) || c.result.motor.status !== "running" || c.result.motor.connection !== step.stage)) return fail(step.stage === "star" ? `El motor debe estar en estrella. Si ya cambi\xF3, det\xE9n con S2 y vuelve a iniciar con ${roles.start}.` : roles.automatic ? "El motor debe estar en tri\xE1ngulo. Espera el cambio autom\xE1tico del temporizador." : "El motor debe estar en tri\xE1ngulo. Pulsa S3 para cambiar desde estrella.");
  if (step.stage === "trip" && (!c.input.thermalTripped || !allOff || !pilots([false, roles.restPilot, true, false]) || c.result.motor.status !== "off")) return fail(roles.restPilot ? "Activa TEST: el t\xE9rmico debe estar disparado y el motor detenido." : "Activa TEST: bobinas y motor detenidos, con solamente P3 encendido.");
  if (step.stage === "reset" && (c.input.thermalTripped || !allOff || !pilots([false, roles.restPilot, false, false]) || c.result.motor.status !== "off")) return fail("Rearma el t\xE9rmico y deja el motor detenido.");
  if (step.stage === "off" && (c.input.plugged || c.input.forceBreaker || c.input.breakers.some(Boolean))) return fail("Abre FUERZA y los dos CONTROL y desenchufa la corriente virtual.");
  if (c.result.fault) return fail("La simulaci\xF3n informa una falla. Revisa el montaje antes de registrar.");
  if (step.kind === "meter") {
    if (c.mode !== step.mode) return fail(`Selecciona ${step.mode === "V" ? "V~" : step.mode === "R" ? "\u03A9" : "continuidad"} en el selector del mult\xEDmetro.`);
    if (c.redJack !== "vo") return fail("Conecta el cable rojo a V \u03A9 y el negro a COM.");
    if (c.frozen) return fail("Quita HOLD y cualquier retenci\xF3n de la pantalla para observar la lectura actual.");
    if (!(c.probes[0] === step.red && c.probes[1] === step.black || c.probes[1] === step.red && c.probes[0] === step.black)) return fail("Las puntas todav\xEDa no est\xE1n en los dos bornes pedidos. Consulta \xABD\xF3nde poner las puntas\xBB.");
    const reading = readPanelMeter(c.wires, c.input, c.result, c.timed, c.mode, ...c.probes, c.model, c.redJack);
    if (reading.value === void 0) return { ...fail(reading.note), reading };
    if (step.expected === "open" && reading.value !== null) return { ...fail("Se esperaba un contacto abierto (OL). Suelta el pulsador de marcha."), reading };
    if (step.expected === "low" && (reading.value === null || reading.value > 2)) return { ...fail("Se esperaba baja resistencia en este contacto cerrado."), reading };
    return { ready: true, message: "Puntas, funci\xF3n y estado correctos. Escribe la lectura que observas.", reading };
  }
  if (step.kind === "clamp") {
    if (c.clamp !== step.phase) return fail(`Selecciona solo el conductor de entrada ${step.phase} en la pinza virtual.`);
    const solved = panelElectrical(c.wires, c.input, c.result.relays, c.timed, c.model);
    if (solved.fault) return fail(solved.fault);
    const value = solved.lineAmps[step.phase];
    return { ready: true, message: "Pinza en la entrada de la fase solicitada, antes de las derivaciones.", reading: { value, text: `${value.toFixed(3).replace(".", ",")} A`, kind: "current", note: c.model.motorMode === "induction" ? `Corriente RMS de inducci\xF3n a ${Math.round(c.model.rotorRpm ?? 0)} rpm; carga ${c.model.loadTorqueNm ?? 4} N\xB7m. Par\xE1metros did\xE1cticos.` : "Corriente RMS del equivalente resistivo did\xE1ctico." } };
  }
  return { ready: true, message: "Estado verificado en el banco virtual." };
}
function observedMatches(text, value) {
  if (value === null) return text.trim().toUpperCase() === "OL";
  const entered = Number(text.trim().replace(",", "."));
  return text.trim() !== "" && Number.isFinite(entered) && Math.abs(entered - value) <= Math.max(0.06, Math.abs(value) * 0.025);
}
var LEGACY_ACTIVITY_KEY = "modo-meter-activity2-v1";
var ACTIVITY_KEY = "modo-meter-two-contactors-v1";
var newActivity = (profile) => ({ version: 1, profile, index: 0, records: [], reflection: "", complete: false });
function readActivity(raw) {
  if (!raw || typeof raw !== "object") return null;
  const v = raw;
  if (v.version !== 1 || !["manual", "matias", "twoContactors"].includes(v.profile) || !Number.isInteger(v.index) || v.index < 0 || v.index >= ACTIVITY_STEPS.length || typeof v.complete !== "boolean" || typeof v.reflection !== "string" || v.reflection.length > 5e3 || !Array.isArray(v.records) || v.records.length > ACTIVITY_STEPS.length) return null;
  if (v.analysis && (v.analysis.voltage !== void 0 && (typeof v.analysis.voltage !== "string" || v.analysis.voltage.length > 30) || v.analysis.current !== void 0 && (typeof v.analysis.current !== "string" || v.analysis.current.length > 30))) return null;
  if (v.records.some((r) => !r || r.rpm !== void 0 && !Number.isFinite(r.rpm) || r.loadTorqueNm !== void 0 && (!Number.isFinite(r.loadTorqueNm) || r.loadTorqueNm < 0 || r.loadTorqueNm > 40) || r.motorMode !== void 0 && !["induction", "resistive"].includes(r.motorMode))) return null;
  if (v.records.some((r) => r && (r.conditions !== void 0 && !validConditions(r.conditions) || r.action !== void 0 && !validActionProof(r.action) || r.displayUnit !== void 0 && (typeof r.displayUnit !== "string" || r.displayUnit.length > 10) || r.capturedAt !== void 0 && (typeof r.capturedAt !== "string" || r.capturedAt.length > 50)))) return null;
  if (v.records.some((r) => !r || !ACTIVITY_STEPS.some((s) => s.id === r.id) || typeof r.observed !== "string" || r.observed.length > 80 || typeof r.text !== "string" || r.text.length > 120 || r.value !== null && !Number.isFinite(r.value) || typeof r.at !== "string")) return null;
  const firstMissing = ACTIVITY_STEPS.findIndex((s) => !v.records.some((r) => r.id === s.id));
  return v.complete && firstMissing >= 0 ? { ...v, index: firstMissing, complete: false } : v;
}

// src/data/machineReport.ts
var esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
var capturedConditions = (r) => r?.conditions ? `t = ${esc(r.conditions.simulationSeconds.toFixed(2))} s \xB7 red configurada ${esc(r.conditions.lineVolts)} V \xB7 ${esc(r.conditions.frequencyHz)} Hz \xB7 Ir ${esc(r.conditions.relayAmps)} A \xB7 ${esc(r.conditions.profile)} \xB7 ${esc(r.conditions.connection === "star" ? "estrella" : r.conditions.connection === "delta" ? "tri\xE1ngulo" : "sin conexi\xF3n de motor")}<br>Muestra: ${esc(r.at)} \xB7 captura: ${esc(r.capturedAt)}` : r ? "Registro anterior sin condiciones de captura" : "Pendiente";
function machineMeasurementsHtml(p, prep = newMachinePreparation(), svg = "") {
  const val = (id) => p.records.find((r) => r.id === id)?.value, ratio = (a3, b) => {
    const x = val(a3), y = val(b);
    return typeof x === "number" && typeof y === "number" && y !== 0 ? (x / y).toFixed(3) : "Pendiente";
  }, checks = preparationChecks(prep);
  return `<h2>Resultados virtuales \xB7 ${esc(ACTIVITY_PROFILES[p.profile].title)}</h2><p>${p.complete ? "Recorrido virtual finalizado" : "Recorrido pendiente"}. Modelo did\xE1ctico; datos f\xEDsicos y revisi\xF3n docente pendientes.</p>${["Tabla 1", "Tabla 3", "Tabla 4", "Tabla 5", "Tabla 6"].map((table) => `<h3>${table}</h3><table><thead><tr><th>Medici\xF3n</th><th>Lectura</th><th>rpm</th><th>Carga N\xB7m</th><th>Condiciones de la muestra</th></tr></thead><tbody>${ACTIVITY_STEPS.filter((s) => s.table === table).map((s) => {
    const r = p.records.find((r2) => r2.id === s.id);
    return `<tr><td>${esc(activityStep(p.profile, ACTIVITY_STEPS.findIndex((step) => step.id === s.id)).title)}</td><td>${r ? esc(r.text) : "Pendiente"}</td><td>${esc(r?.rpm)}</td><td>${esc(r?.loadTorqueNm)}</td><td>${capturedConditions(r)}</td></tr>`;
  }).join("")}</tbody></table>`).join("")}<h2>Comprobaciones de maniobra</h2><ul>${ACTIVITY_STEPS.filter((s) => ["control-star", "control-delta", "control-trip", "control-reset", "start-star", "change-delta", "overload", "reset"].includes(s.id)).map((s) => {
    const r = p.records.find((r2) => r2.id === s.id), a3 = r?.action;
    return `<li>${esc(activityStep(p.profile, ACTIVITY_STEPS.findIndex((step) => step.id === s.id)).title)}: ${a3 ? `${esc(a3.from)} \u2192 ${esc(a3.to)} \xB7 t = ${esc(a3.seconds.toFixed(2))} s \xB7 evento ${esc(a3.eventId)}` : r ? "registro anterior sin traza de maniobra" : "pendiente"}</li>`;
  }).join("")}</ul><h2>Comparaci\xF3n matem\xE1tica</h2><p>V\u0394/VY = ${ratio("delta-U", "star-U")} \xB7 respuesta del estudiante: ${esc(p.analysis?.voltage || "Pendiente")}.</p><p>I\u0394/IY = ${ratio("delta-current-R", "star-current-R")} \xB7 respuesta del estudiante: ${esc(p.analysis?.current || "Pendiente")}.</p><p>VY \u2248 VL/\u221A3; V\u0394 \u2248 VL. La relaci\xF3n de corrientes depende de las condiciones de giro y carga registradas.</p><p>${esc(p.reflection || "Explicaci\xF3n pendiente")}</p><h2>Placa y protecci\xF3n \xB7 ejercicios de ejemplo</h2><p>Placa: ${checks.plate ? "respuestas comprobadas" : "pendiente"} \xB7 bobina Y: ${esc(prep.starVoltage)} V \xB7 bobina \u0394: ${esc(prep.deltaVoltage)} V.</p><p>Protecci\xF3n: ${checks.protection ? "c\xE1lculo comprobado" : "pendiente"} \xB7 ubicaci\xF3n: ${esc(prep.location)} \xB7 Ir: ${esc(prep.setting)} A \xB7 rango de ejemplo: ${esc(prep.range)} A.</p><h2>Esquema del estudiante</h2>${svg ? `<figure>${svg}<figcaption>Esquema generado desde los conductores guardados por el estudiante.</figcaption></figure>` : ""}<p>${esc(prep.diagram.explanation || "Explicaci\xF3n pendiente")}</p><details><summary>${prep.diagram.wires.length} conductores guardados</summary><ul>${prep.diagram.wires.map((w) => `<li>${esc(w.from.terminalId)} \u2192 ${esc(w.to.terminalId)}</li>`).join("")}</ul></details><p>${p.profile === "twoContactors" ? "Montaje medido: 37 cables recibidos, dos contactores y conjunto KT1; S1 marcha y S2 paro. Referencia te\xF3rica:" : "Fuente:"} Actividad 2 UA2, Control de M\xE1quinas El\xE9ctricas Rotativas, 13 p\xE1ginas. La gu\xEDa numera las tablas 1, 3, 4, 5 y 6.</p><details><summary>Correspondencia con los 25 puntos de la gu\xEDa</summary><p>El montaje de dos contactores es una adaptaci\xF3n autom\xE1tica del circuito manual del profesor. Las tareas presenciales y la revisi\xF3n docente se completan por separado.</p><ol>${MACHINE_GUIDE_COVERAGE.map((item2) => `<li value="${item2.point}"><strong>${esc(item2.title)}</strong>: ${esc(item2.where)}</li>`).join("")}</ol></details>`;
}
function machineReportHtml(p, prep, svg = "") {
  return `<!doctype html><html lang="es"><meta charset="utf-8"><title>Actividad 2 \xB7 M\xE1quinas \xB7 resultados virtuales</title><style>body{font:15px/1.6 system-ui;color:#223b2c;max-width:1000px;margin:auto;padding:24px}table{width:100%;border-collapse:collapse}th,td{padding:8px;border:1px solid #b5c6b9;text-align:left}svg{width:100%;max-height:850px}figure{break-inside:avoid}h2{margin-top:30px}@media print{button{display:none}body{padding:0}}</style><button onclick="window.print()">Imprimir / Guardar PDF</button><h1>Actividad 2 \xB7 Unidad 2 \xB7 Estrella\u2013tri\xE1ngulo</h1>${machineMeasurementsHtml(p, prep, svg)}</html>`;
}
export {
  ACTIVITY_KEY,
  ACTIVITY_PROFILES,
  ACTIVITY_STEPS,
  LEGACY_ACTIVITY_KEY,
  MACHINE_GUIDE_COVERAGE,
  MACHINE_GUIDE_SOURCE,
  activityDocument,
  activityRoles,
  activityStep,
  checkActivity,
  isForceTerminal,
  isForceWire,
  machineMeasurementsHtml,
  machineReportHtml,
  matchesActivity,
  newActivity,
  observedMatches,
  readActivity
};
