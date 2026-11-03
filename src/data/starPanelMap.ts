/** Correspondencia entre los bornes del dibujo «Estrella-triángulo» (objeto → borne del símbolo) y los bornes del banco.
 *  Con ella cada cable de las lecciones estrella-triángulo se puede ubicar en el dibujo, igual que en las otras lecciones.
 *  Solo se asocian bornes que el dibujo realmente tiene: lo que no aparece en él (tierras TP, temporizador KT1, contactos 81–82)
 *  queda sin línea en el esquema. */
export type PanelMap=Record<number,Record<string,string>>;
const K1='CONTACTOR_TERMICO:',K2='CONTACTOR_TRIFASICO:',K3='CONTACTOR_TRIFASICO_3:',BT='BOTONERAS:',KT='TEMPORIZADOR_1:';
const seq=(prefix:string,terminals:string[],names:string[])=>Object.fromEntries(terminals.map((t,i)=>[t,prefix+names[i]]));
/** Contactor de potencia del dibujo: entradas 1-3-5 → L1-L2-L3; salidas según el cableado de cada lección. */
const power=(prefix:string,outs:[string,string,string])=>({...seq(prefix,['1','3','5'],['L1','L2','L3']),...seq(prefix,outs,['T1','T2','T3'])});
/** Bornes comunes a las dos variantes. */
const common=():PanelMap=>({
 2:{'2':'FUENTE:R','4':'FUENTE:S','6':'FUENTE:T'},
 3:seq(K1,['1','3','5'],['L1','L2','L3']),
 4:seq(K1,['2','4','6'],['T1','T2','T3']),
 5:{U1:'BORNERA_MOTOR:U1',V1:'BORNERA_MOTOR:V1',W1:'BORNERA_MOTOR:W1',W2:'BORNERA_MOTOR:W2',U2:'BORNERA_MOTOR:U2',V2:'BORNERA_MOTOR:V2',PE:'BORNERA_MOTOR:TP'},
 52:{N:'FUENTE:N'},
 53:{'2':'FUENTE:F'},
 54:seq(K1,['95','96','97','98'],['95','96','97','98']),
 55:{'11':BT+'S2:1','12':BT+'S2:2'},
 56:{'13':BT+'S1:3','14':BT+'S1:4'},
 57:seq(K1,['13','14'],['13','14']),
 63:seq(K1,['A1','A2'],['A1','A2']),
});
/** Sin temporizador: KM3 es la estrella (dibujo: KM3) y KM2 el triángulo (dibujo: KM2). El cambio se hace con S3. */
const manual=():PanelMap=>({
 ...common(),
 6:power(K2,['2','4','6']),7:power(K3,['2','4','6']),
 58:seq(BT+'S3:',['11','12','13','14'],['1','2','3','4']),
 59:seq(K2,['11','12'],['71','72']),60:{'13':K2+'13','14':K2+'14'},61:seq(K3,['11','12'],['71','72']),
 62:seq(K1,['11','12'],['71','72']),
 64:seq(K3,['A1','A2'],['A1','A2']),65:seq(K2,['A1','A2'],['A1','A2']),
 66:{X1:BT+'PILOTO_2',X2:BT+'N'},67:{X1:BT+'PILOTO_1',X2:BT+'N'},68:{X1:BT+'PILOTO_4',X2:BT+'N'},69:{X1:BT+'PILOTO_3',X2:BT+'N'},
});
/** Con temporizador (dibujo cadeEstrellaTemporizador.json, ver qa/build-cade-timer.cjs): KM2 es la estrella (objeto 7) y KM3 el triángulo (objeto 6). */
const timer=():PanelMap=>({
 ...common(),
 6:power(K3,['2','4','6']),7:power(K2,['2','4','6']),
 204:seq(K1,['81','82'],['81','82']),207:seq(K2,['81','82'],['81','82']),209:seq(K3,['81','82'],['81','82']),
 211:{X1:BT+'PILOTO_2',X2:BT+'N'},216:{X1:BT+'PILOTO_1',X2:BT+'N'},218:{X1:BT+'PILOTO_3',X2:BT+'N'},
 222:seq(KT,['A1','A2'],['A1','A2']),226:seq(KT,['55','56'],['55','56']),234:seq(KT,['67','68'],['67','68']),
 228:seq(K3,['71','72'],['71','72']),236:seq(K2,['71','72'],['71','72']),
 230:seq(K2,['A1','A2'],['A1','A2']),238:seq(K3,['A1','A2'],['A1','A2']),
});
export const STAR_PANELS={estrellaManual:manual(),estrellaTimer:timer()};
