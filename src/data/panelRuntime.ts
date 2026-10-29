import type {RelayState} from './simulation';
export type Clock={seconds:number;wall:number|null;paused:boolean};
export const newClock=():Clock=>({seconds:0,wall:null,paused:true});
/** Every physical process uses this foreground clock. Hidden/suspended time is discarded together. */
export function advanceClock(old:Clock,wall:number,running:boolean){const dt=running&&!old.paused&&old.wall!==null?Math.max(0,Math.min(.25,(wall-old.wall)/1000)):0;return {clock:{seconds:old.seconds+dt,wall,paused:!running},dt};}
export type TimerBank=Record<string,{start:number;duration:number;done:boolean}>;
export function advanceTimers(old:TimerBank,coils:RelayState,ids:string[],now:number,duration:number):TimerBank{const next:TimerBank={};for(const id of ids){if(!coils[id])continue;const previous=old[id],t=previous&&(previous.done||previous.duration===duration)?previous:{start:now,duration,done:false};next[id]={...t,done:t.done||now-t.start>=t.duration-1e-9};}return next;}
export type ThermalSettings={enabled:boolean;amps:number;tripClass:5|10|20|30;coolingSeconds:number;resetLevel:number};
export const DEFAULT_THERMAL:ThermalSettings={enabled:true,amps:6,tripClass:10,coolingSeconds:180,resetLevel:.65};
export type ThermalState={heat:number;tripped:boolean;reason:'TEST'|'sobrecarga'|null;secondsToTrip:number|null};
export const coldThermal=():ThermalState=>({heat:0,tripped:false,reason:null,secondsToTrip:null});
/** Educational first-order I² thermal memory, anchored at 7.2×Ir to the selected class.
 * This is not an IEC certification or a fitted curve of a physical relay. */
export function advanceThermal(state:ThermalState,amps:number,settings:ThermalSettings,dt:number):ThermalState{
 const target=settings.enabled?(Math.max(0,amps)/Math.max(.1,settings.amps)/1.15)**2:0;
 const tau=target>state.heat?(settings.tripClass*.75)/-Math.log(1-(1.15/7.2)**2):settings.coolingSeconds;
 const heat=Math.max(0,state.heat*Math.exp(-dt/tau)+target*(1-Math.exp(-dt/tau)));
 const trip=state.tripped||(settings.enabled&&heat>=1),secondsToTrip=!trip&&target>1?Math.max(0,-tau*Math.log((target-1)/(target-heat))):null;
 return {heat,tripped:trip,reason:trip?(state.reason??'sobrecarga'):null,secondsToTrip};
}
export type PowerContactState={positions:RelayState;requested:RelayState;pending:Record<string,{at:number;closed:boolean}>;lastConnection:'star'|'delta'|null;gapUntil:number;lastMake:number|null};
export const openPowerContacts=():PowerContactState=>({positions:{},requested:{},pending:{},lastConnection:null,gapUntil:0,lastMake:null});
export function advancePowerContacts(old:PowerContactState,requested:RelayState,connection:'star'|'delta'|null,now:number,delays:{pickupMs:number;dropMs:number;gapMs:number}):PowerContactState{
 const positions={...old.positions},pending={...old.pending};let gapUntil=old.gapUntil,lastMake=old.lastMake;
 const swapping=old.lastConnection!==null&&connection!==null&&old.lastConnection!==connection;
 if(swapping)gapUntil=now+(delays.dropMs+delays.gapMs)/1000;
 for(const [id,on] of Object.entries(requested))if(on!==!!old.requested[id])pending[id]={closed:on,at:now+(on?delays.pickupMs:delays.dropMs)/1000};
 if(swapping)for(const p of Object.values(pending))if(p.closed)p.at=Math.max(p.at,gapUntil);
 for(const [id,p] of Object.entries(pending))if(now>=p.at-1e-9){if(p.closed&&!positions[id])lastMake=now;positions[id]=p.closed;delete pending[id];}
 return {positions,requested:{...requested},pending,lastConnection:connection??old.lastConnection,gapUntil,lastMake};
}
