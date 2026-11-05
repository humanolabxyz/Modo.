/** Insulation choices only: a color never assigns a terminal or an electrical function. */
export const WIRE_PALETTE=[
 {name:'Petróleo',hex:'#145650'},{name:'Rojo',hex:'#c53943'},
 {name:'Azul',hex:'#2978c8'},{name:'Amarillo',hex:'#d8ab28'},
 {name:'Negro',hex:'#343b42'},{name:'Blanco',hex:'#f4f1e7'},
 {name:'Verde',hex:'#32834b'},{name:'Naranja',hex:'#e07b2a'},
 {name:'Violeta',hex:'#8755b4'},{name:'Gris',hex:'#929aa3'},
 {name:'Marrón',hex:'#855535'},{name:'Rosa',hex:'#d77eab'},
];
export const isWireColor=(color:unknown):color is string=>typeof color==='string'&&/^#[0-9a-f]{6}$/i.test(color);
export const DEFAULT_CABLE_COLORS=['#2575a5','#dce4e9','#344249'];
export const wireColor=(wire:{color?:string},index:number)=>isWireColor(wire.color)?wire.color:DEFAULT_CABLE_COLORS[index%3];
export const wireColorName=(color:string)=>WIRE_PALETTE.find(c=>c.hex.toLowerCase()===color.toLowerCase())?.name??color;


// Alterna familias de color y luego sus tonos para distinguir los 41 cables.
const MATIAS_CABLE_COLORS=[
 '#c53943','#2978c8','#d8ab28','#8755b4','#32834b','#e07b2a','#145650','#d77eab','#344249','#855535','#929aa3',
 '#8f2330','#154d94','#a17a0a','#5d3389','#1f5b2e','#ab501a','#08777c','#a4356d','#262b36','#6d3b26','#617384',
 '#f46b6a','#52a1f2','#f3ca43','#ad79dd','#64aa53','#ff9b54','#34aba5','#eea2c4','#535d69','#ae7445','#aab4bf',
 '#a83b56','#206799','#bf971b','#72408f','#567b22','#c76b24','#217b65','#b75586','#474e63','#966247','#76899c',
];
export function nextMatiasCableColor(wires:ReadonlyArray<{color:string}>){
 const used=new Set(wires.map(w=>w.color.toLowerCase()));
 return MATIAS_CABLE_COLORS.find(color=>!used.has(color))??MATIAS_CABLE_COLORS[wires.length%MATIAS_CABLE_COLORS.length];
}
