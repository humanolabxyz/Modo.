/** KM1 / KM2 module identity explicitly confirmed by the user on 2026-10-14. */
export const CONFIRMED_MODULE_ALIASES:Record<string,string>={CONTACTOR_TERMICO:'KM1',CONTACTOR_TRIFASICO:'KM2'};
/** Q is drawn twice: the three-phase breaker and the control breaker are distinct devices. */
export const cadePortKey=(p:{reference:string;terminal:string;objectId:number})=>`${p.reference==='-Q'&&p.objectId===3?'-Q.potencia':p.reference}:${p.terminal}`;
/** Previous exports used -Q:3..6 exclusively for the power breaker. Keep those
 * personal assignments when importing them into the disambiguated model. */
export function migrateCadeBindings(bindings:Record<string,string>){
 const next={...bindings};
 for(const key of Object.keys(next))if(/^-Q:[3-6]$/.test(key)){const scoped=key.replace('-Q:','-Q.potencia:');if(!Object.hasOwn(next,scoped))next[scoped]=next[key];delete next[key]}
 return next;
}
/** Bank equivalents used by the lessons. Q is integrated in the supply and the power thermal
 * is integrated in KM1: these drawing ports share a bank socket, not an extra banana cable.
 * This describes the virtual lesson, not an additional accessible socket on the physical device. */
export const DEFAULT_CADE_BINDINGS:Record<string,string>={
 '-F:95':'CONTACTOR_TERMICO:95','-F:96':'CONTACTOR_TERMICO:96','-F:97':'CONTACTOR_TERMICO:97','-F:98':'CONTACTOR_TERMICO:98',
 '-M:U1':'BORNERA_MOTOR:U1','-M:V1':'BORNERA_MOTOR:V1','-M:W1':'BORNERA_MOTOR:W1',
 '-M:W2':'BORNERA_MOTOR:W2','-M:U2':'BORNERA_MOTOR:U2','-M:V2':'BORNERA_MOTOR:V2',
 '-KM1:A1':'CONTACTOR_TERMICO:A1','-KM1:A2':'CONTACTOR_TERMICO:A2',
 '-KM1:13':'CONTACTOR_TERMICO:13','-KM1:14':'CONTACTOR_TERMICO:14',
 '-KM1:11':'CONTACTOR_TERMICO:71','-KM1:12':'CONTACTOR_TERMICO:72',
 '-SB1:11':'BOTONERAS:S2:1','-SB1:12':'BOTONERAS:S2:2',
 '-SB2:13':'BOTONERAS:S1:3','-SB2:14':'BOTONERAS:S1:4',
 '-H1:X1':'BOTONERAS:PILOTO_1','-H2:X1':'BOTONERAS:PILOTO_3','-H3:X1':'BOTONERAS:PILOTO_2',
 '-H1:X2':'BOTONERAS:N','-H2:X2':'BOTONERAS:N','-H3:X2':'BOTONERAS:N',
 '-X:L':'FUENTE:F','-X:N':'FUENTE:N','-X:PE':'FUENTE:TP','-M:PE':'BORNERA_MOTOR:TP',
 '-Q:1':'FUENTE:F','-Q:2':'FUENTE:F',
 '-X:L1':'FUENTE:R','-X:L2':'FUENTE:S','-X:L3':'FUENTE:T',
 ...Object.fromEntries(['R','S','T'].flatMap((phase,i)=>[
  [`-Q.potencia:${i*2+1}`,`FUENTE:${phase}`],[`-Q.potencia:${i*2+2}`,`FUENTE:${phase}`],
  [`-KM1:${i*2+1}`,`CONTACTOR_TERMICO:L${i+1}`],[`-KM1:${i*2+2}`,`CONTACTOR_TERMICO:T${i+1}`],
  [`-F:${i*2+1}`,`CONTACTOR_TERMICO:T${i+1}`],[`-F:${i*2+2}`,`CONTACTOR_TERMICO:T${i+1}`],
 ])),
};
/** Only the predefined equivalent ports may share a socket. Personal assignments cannot
 * collapse unrelated contacts, phases or the two ends of a coil. */
export function bindingConflict(key:string,id:string,bindings:Record<string,string>){
 return !!id&&Object.entries({...DEFAULT_CADE_BINDINGS,...bindings}).some(([other,value])=>other!==key&&value===id&&!(DEFAULT_CADE_BINDINGS[key]===id&&DEFAULT_CADE_BINDINGS[other]===id));
}
