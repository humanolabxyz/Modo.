/** Magnitudes eléctricas de la protoboard: formato, lectura y validación.
 *  El modelo, el solver y el guardado reciben siempre números en ohmios, voltios o amperios;
 *  las etiquetas («4,7 kΩ») son solo presentación y se derivan de esos números. */
export const OHM_MIN=1;
export const OHM_MAX=1e7;
export const SUPPLY_MIN=.1;
export const SUPPLY_MAX=24;
export const LED_DROP_MIN=.1;
export const LED_DROP_MAX=5;
export type OhmUnit='Ω'|'kΩ'|'MΩ';
export const OHM_UNITS:{unit:OhmUnit;factor:number}[]=[{unit:'Ω',factor:1},{unit:'kΩ',factor:1e3},{unit:'MΩ',factor:1e6}];
export const COMMON_OHMS=[220,330,470,1000,4700,10000];
export const COMMON_SUPPLY=[3.3,5,9,12,24];
export type Parsed={ok:true;value:number}|{ok:false;error:string};

const fail=(error:string):{ok:false;error:string}=>({ok:false,error});
/** Número con coma decimal y sin ruido de coma flotante. */
export function formatNumber(n:number,maxDecimals=6):string{
  if(!Number.isFinite(n))return '—';
  const text=String(Number(n.toFixed(maxDecimals)));
  return text.includes('e')?n.toExponential(3).replace('.',','):text.replace('.',',');
}
export function formatOhms(ohms:number):string{
  if(!Number.isFinite(ohms))return '— Ω';
  if(ohms>=1e6)return `${formatNumber(Number((ohms/1e6).toPrecision(10)))} MΩ`;
  if(ohms>=1e3)return `${formatNumber(Number((ohms/1e3).toPrecision(10)))} kΩ`;
  return `${formatNumber(Number(ohms.toPrecision(10)))} Ω`;
}
/** Texto y unidad con que se rellena el editor para un valor en ohmios. */
export function splitOhms(ohms:number):{text:string;unit:OhmUnit}{
  const unit:OhmUnit=ohms>=1e6?'MΩ':ohms>=1e3?'kΩ':'Ω',factor=unit==='MΩ'?1e6:unit==='kΩ'?1e3:1;
  return {text:formatNumber(Number((ohms/factor).toPrecision(10))),unit};
}
export function formatVolts(volts:number):string{return `${formatNumber(Number(volts.toPrecision(10)),3)} V`;}
export function formatAmps(amps:number):string{
  const a=Math.abs(amps);
  if(!Number.isFinite(amps))return '— mA';
  if(a>=1)return `${formatNumber(amps,3)} A`;
  if(a>0&&a<5e-4)return `${formatNumber(amps*1e6,1)} µA`;
  return `${formatNumber(amps*1e3,3)} mA`;
}

type Split={ok:true;digits:string;exponent:number;unit:string}|{ok:false;error:string};
const GROUP_FIRST=/^\d{1,3}$/,GROUP_NEXT=/^\d{3}$/;
/** Separa «4,7 k», «4k7», «1.000,5» o «220» en cifras, exponente decimal y unidad escrita.
 *  Un único separador seguido de tres cifras («1.000») es ambiguo y se rechaza en lugar de adivinar. */
function splitNumber(raw:string):Split{
  let t=raw.trim().replace(/ω/gi,'').replace(/ohm(?:io)?s?/gi,'').trim();
  if(!t)return fail('Escribe un valor.');
  const compact=/^(\d+)([kKMrR])(\d+)$/.exec(t);
  if(compact)return {ok:true,digits:`${compact[1]}${compact[3]}`,exponent:-compact[3].length,unit:compact[2]};
  const match=/^([0-9][0-9.,\s]*|[.,][0-9]+)\s*([A-Za-zµ]*)$/.exec(t);
  if(!match)return fail(`No se entiende «${raw.trim().slice(0,24)}». Usa números como 220 o 4,7.`);
  let number=match[1].trim();const unit=match[2];
  if(/\s/.test(number)){if(!/^\d{1,3}(\s\d{3})+([.,]\d+)?$/.test(number))return fail('Hay espacios dentro del número. Escribe 4700 o 4,7.');number=number.replace(/\s+/g,'');}
  const separators=[...number].filter(c=>c==='.'||c===',');
  let integer=number,fraction='';
  if(separators.length===1){
    const [a,b]=number.split(/[.,]/);
    if(b==='')return fail('El número está incompleto: falta la parte decimal.');
    if(b.length===3&&a!==''&&GROUP_FIRST.test(a)&&!a.startsWith('0'))return fail(`«${number}» es ambiguo (¿decimal o miles?). Escribe ${a}${b} o ${a},${b} con una unidad.`);
    integer=a===''?'0':a;fraction=b;
  }else if(separators.length>1){
    const decimal=separators.at(-1)!,other=decimal==='.'?',':'.',last=number.lastIndexOf(decimal);
    const lastDecimalPart=number.slice(last+1);
    const hasMixed=separators.some(c=>c!==decimal);
    if(hasMixed){
      const head=number.slice(0,last).split(other);
      if(number.slice(0,last).includes(decimal)||!GROUP_FIRST.test(head[0])||!head.slice(1).every(g=>GROUP_NEXT.test(g))||lastDecimalPart==='')return fail('Separadores mezclados: escribe 4700 o 4,7.');
      integer=head.join('');fraction=lastDecimalPart;
    }else{
      const groups=number.split(decimal);
      if(!GROUP_FIRST.test(groups[0])||!groups.slice(1).every(g=>GROUP_NEXT.test(g)))return fail('Hay demasiados separadores. Escribe 4700 o 4,7.');
      integer=groups.join('');
    }
  }
  if(!/^\d+$/.test(integer)||(fraction!==''&&!/^\d+$/.test(fraction)))return fail('El número no es válido.');
  return {ok:true,digits:`${integer}${fraction}`,exponent:-fraction.length,unit};
}
const exact=(digits:string,exponent:number)=>Number(`${digits}e${exponent}`);

/** Valor escrito por el usuario → ohmios. `defaultUnit` se usa cuando el texto no trae unidad. */
export function parseOhms(text:string,defaultUnit:OhmUnit='Ω',min=OHM_MIN,max=OHM_MAX):Parsed{
  const split=splitNumber(text);if(!split.ok)return split;
  let power=defaultUnit==='MΩ'?6:defaultUnit==='kΩ'?3:0;
  const unit=split.unit;
  if(unit==='k'||unit==='K')power=3;
  else if(unit==='M'||/^meg(a)?$/i.test(unit))power=6;
  else if(unit==='m')return fail('«m» es ambiguo: usa k para kilo o M para mega.');
  else if(unit==='r'||unit==='R')power=0;
  else if(unit!==''&&!/^(ohm|o)$/i.test(unit))return fail(`Unidad «${unit}» no reconocida. Usa Ω, kΩ o MΩ.`);
  const value=exact(split.digits,split.exponent+power);
  if(!Number.isFinite(value)||value<min||value>max)return fail(`El valor debe estar entre ${formatOhms(min)} y ${formatOhms(max)}.`);
  return {ok:true,value};
}
/** Tensión en voltios con rango propio; admite «5», «3,3» o «12 V». */
export function parseVolts(text:string,min:number,max:number):Parsed{
  const split=splitNumber(text);if(!split.ok)return split;
  if(split.unit!==''&&!/^v$/i.test(split.unit))return fail(`Unidad «${split.unit}» no reconocida. Usa V.`);
  const value=exact(split.digits,split.exponent);
  if(!Number.isFinite(value)||value<min||value>max)return fail(`El valor debe estar entre ${formatVolts(min)} y ${formatVolts(max)}.`);
  return {ok:true,value};
}

const DIGIT_COLORS=['#1f1f1f','#7b4426','#cf3a2f','#e5822a','#e8c62d','#3f9a52','#2f6fc0','#7f55b2','#8d9093','#f2f2ee'];
const GOLD='#c9a227',SILVER='#bec4c8';
/** Colores de las tres primeras bandas (dos cifras y multiplicador) solo si el valor se puede
 *  escribir exactamente con dos cifras significativas. No se dibuja banda de tolerancia: el modelo no la tiene. */
export function resistorBands(ohms:number):string[]|null{
  if(!Number.isFinite(ohms)||ohms<OHM_MIN||ohms>OHM_MAX)return null;
  for(let multiplier=-2;multiplier<=7;multiplier++){
    const scaled=ohms/Math.pow(10,multiplier);
    if(scaled<10-1e-9||scaled>99+1e-9)continue;
    const digits=Math.round(scaled);
    if(Math.abs(scaled-digits)>1e-7)continue;
    const color=multiplier>=0?DIGIT_COLORS[multiplier]:multiplier===-1?GOLD:SILVER;
    return [DIGIT_COLORS[Math.floor(digits/10)],DIGIT_COLORS[digits%10],color];
  }
  return null;
}

/** Ganancia de corriente (hFE) de un transistor: número sin unidad. */
export function parseGain(text:string,min=10,max=1000):Parsed{
  const split=splitNumber(text);if(!split.ok)return split;
  if(split.unit!=='')return fail('La ganancia no lleva unidad: escribe, por ejemplo, 100.');
  const value=exact(split.digits,split.exponent);
  if(!Number.isFinite(value)||value<min||value>max)return fail(`La ganancia debe estar entre ${min} y ${max}.`);
  return {ok:true,value};
}

/** Lectura de multímetro con cuatro dígitos y coma decimal, y el rango que elegiría un instrumento automático. */
export function formatReading(kind:'voltage'|'current'|'resistance',value:number):{text:string;unit:string}{
  const abs=Math.abs(value),fixed=(n:number,decimals:number)=>(Math.abs(n)<Math.pow(10,-decimals)/2?0:n).toFixed(decimals).replace('.',',');
  const digits=(n:number)=>Math.abs(n)<10?3:Math.abs(n)<100?2:1;
  if(kind==='voltage')return {text:fixed(value,digits(value)),unit:'V'};
  if(kind==='current')return abs>=1?{text:fixed(value,3),unit:'A'}:{text:fixed(value*1e3,digits(value*1e3)),unit:'mA'};
  if(abs>=1e6)return {text:fixed(value/1e6,3),unit:'MΩ'};
  if(abs>=1e3)return {text:fixed(value/1e3,digits(value/1e3)),unit:'kΩ'};
  return {text:fixed(value,abs<100?2:1),unit:'Ω'};
}
