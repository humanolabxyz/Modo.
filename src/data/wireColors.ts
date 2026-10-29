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
