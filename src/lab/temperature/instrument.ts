import type {Reading,Settings,Temps,Sensor} from './physics';
/** Normal 6000-count resolution of the 87 V for the low DC and resistance ranges used here.
 * Sensor laws remain ideal; this models display resolution, not a calibrated instrument or random error. */
export function instrumentSample(value:number,unit:string){
 const n=Math.abs(value),digits=unit==='mV'?(n<600?1:0):unit==='Ω'?(n<600?1:n<6000?0:0):unit==='V'?(n<6?3:n<60?2:1):3;
 const step=10**-digits,rounded=Number((Math.round(value/step)*step).toFixed(digits));
 return {value:Object.is(rounded,-0)?0:rounded,digits,step};
}
export function measurementTemperature(t:Temps,sensor:Sensor){return sensor==='pt'?t.pt:t.tc;}
export function captureProblem(settings:Settings,temps:Temps,reading:Reading,sensor:Sensor,target:number,typed:number|null,why:string){
 if(why)return why;
 if(reading.sensor!==sensor)return `Conecta el multímetro al ${sensor==='pt'?'Pt100':sensor==='tc'?'termopar':'transmisor'} y selecciona su función.`;
 if(Math.abs(settings.setpoint-target)>.6||Math.abs(measurementTemperature(temps,sensor)-target)>.6)return `Lleva el pozo a ${target} °C y espera a que la sonda alcance esa temperatura.`;
 if(typed===null)return 'Transcribe el número que lees en la pantalla del multímetro.';
 if(reading.value===null)return 'No hay una lectura para registrar.';
 const shown=instrumentSample(reading.value,reading.unit);
 if(Math.abs(typed-shown.value)>shown.step*.49+1e-9)return 'La transcripción no coincide con la pantalla. Revisa el signo, el decimal y la unidad.';
 return '';
}
