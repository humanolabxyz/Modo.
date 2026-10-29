import {divide,multiply} from './panelAC';
/** Educational parameters, NOT the nameplate or identified circuit of the physical lab motor.
 * Per-phase induction equivalent: Rs+jXs + (jXm || (Rr/s+jXr)).
 * Slip/torque: https://www.mathworks.com/help/simscape-electrical/ref/simplifiedinductionmotor.html
 * Mechanics: J·dω/dt = Te − Tload − Bω. No switching waveform/harmonics/thermal calibration. */
export type MotorParameters={statorOhms:number;rotorOhms:number;statorX50:number;rotorX50:number;magnetizingX50:number;poles:number;inertia:number;friction:number};
export type MotorModelSettings={motorMode?:'induction'|'resistive';frequencyHz?:number;loadTorqueNm?:number;rotorRpm?:number;motorDirection?:1|-1;lineOhms?:number;motorParameters?:MotorParameters;phaseScale?:[number,number,number];openPhase?:'R'|'S'|'T'|null;positiveVolts?:number;negativeVolts?:number;simulationSeconds?:number;lastMakeSeconds?:number|null};
export const MOTOR_EQUIVALENT={statorOhms:4,rotorOhms:3,statorX50:7,rotorX50:7,magnetizingX50:180,poles:4,inertia:.18,friction:.005};
export const motorFrequency=(m:MotorModelSettings)=>Math.max(20,Math.min(70,m.frequencyHz??50));
export function motorEquivalent(m:MotorModelSettings,slipOverride?:number){
 const p=m.motorParameters??MOTOR_EQUIVALENT,f=motorFrequency(m),syncRpm=120*f/p.poles,dir=m.motorDirection??1;
 const slip=Math.max(.001,Math.min(1.999,slipOverride??1-(m.rotorRpm??0)/(dir*syncRpm))),zrot={re:p.rotorOhms/slip,im:p.rotorX50*f/50},zmag={re:0,im:p.magnetizingX50*f/50};
 const parallel=divide(multiply(zrot,zmag),{re:zrot.re+zmag.re,im:zrot.im+zmag.im}),impedance={re:p.statorOhms+parallel.re,im:p.statorX50*f/50+parallel.im};
 const rotorRatio=divide(divide(parallel,impedance),zrot);
 return {impedance,slip,syncRpm,rotorRatio};
}
export type MotorMotion={rpm:number;torqueNm:number;slip:number;phaseVolts:number;stalled:boolean};
export const stoppedMotion=():MotorMotion=>({rpm:0,torqueNm:0,slip:1,phaseVolts:0,stalled:false});
export function advanceMotor(motion:MotorMotion,m:MotorModelSettings,phaseVolts:number,powered:boolean,direction:1|-1,dt:number):MotorMotion{
 if(m.motorMode!=='induction')return stoppedMotion();
 const eq=motorEquivalent({...m,rotorRpm:motion.rpm,motorDirection:direction}),p=m.motorParameters??MOTOR_EQUIVALENT;
 const rotorAmps=(m.positiveVolts??phaseVolts)*Math.hypot(eq.rotorRatio.re,eq.rotorRatio.im),omegaSync=eq.syncRpm*Math.PI/30;
 const neg=motorEquivalent({...m,rotorRpm:motion.rpm,motorDirection:direction},2-eq.slip);
 const negativeAmps=(m.negativeVolts??0)*Math.hypot(neg.rotorRatio.re,neg.rotorRatio.im);
 const torque=powered?3*p.rotorOhms*(rotorAmps*rotorAmps/eq.slip-negativeAmps*negativeAmps/(2-eq.slip))/omegaSync:0;
 const omega=motion.rpm*Math.PI/30,load=Math.max(0,Math.min(40,m.loadTorqueNm??4));
 const sign=Math.abs(omega)>.01?Math.sign(omega):direction;
 const acceleration=(direction*torque-sign*load-p.friction*omega)/p.inertia;
 let next=omega+acceleration*Math.max(0,Math.min(.05,dt));
 if(!powered&&Math.sign(next)!==Math.sign(omega))next=0;
 if(powered&&Math.abs(omega)<.01&&direction*next<0)next=0;
 next=Math.max(-omegaSync*.999,Math.min(omegaSync*.999,next));
 return {rpm:next*30/Math.PI,torqueNm:torque,slip:eq.slip,phaseVolts:powered?phaseVolts:0,stalled:powered&&Math.abs(next)<omegaSync*.05&&torque<load};
}
