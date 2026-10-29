/** Keep REL and MIN/MAX in base units when autoranging crosses Ω/kΩ or mV/V. */
export function parseMeterReadout(text:string){
 const match=text.match(/^\s*(?:•\)\)\s*)?(-?\d+(?:[.,]\d+)?)\s*(mV|V|µA|μA|mA|A|MΩ|kΩ|Ω)\s*$/);
 if(!match)return null;
 const unit=match[2],factor=unit==='mV'||unit==='mA'?1e-3:unit==='µA'||unit==='μA'?1e-6:unit==='kΩ'?1e3:unit==='MΩ'?1e6:1;
 const value=Number(match[1].replace(',','.'))*factor,digits=match[1].split(/[.,]/)[1]?.length??0;
 const n=Math.abs(value)/factor;
 const range=unit==='Ω'?600:unit==='MΩ'?(n<6?6:50):unit==='A'?(n<6?6:10):unit==='mV'?600:n<6?6:n<60?60:n<600?600:unit==='V'?1000:6000;
 return {value,factor,digits,token:match[1],unit,range,step:10**-digits};
}
