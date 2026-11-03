export type ActivityProfile='manual'|'matias'|'twoContactors';
export const ACTIVITY_PROFILES={
 manual:{title:'Circuito de la guía · manual',detail:'KM1 principal, KM3 estrella y KM2 triángulo. S1 inicia, S3 cambia y S2 detiene; equivalen a SB2, SB3 y SB1 del profesor.'},
 matias:{title:'Proyecto de Matías · automático',detail:'45 cables originales. KT1 es principal, KM1 estrella y KM2 triángulo. S1 inicia y el temporizador cambia la conexión. Para estudiar, el retardo se prepara en 60 s.'},
 twoContactors:{title:'Panel de dos contactores · automático',detail:'40 cables: los 37 del montaje recibido más los 3 del piloto rojo. KT1 (temporizador neumático) es el contactor principal: por él entran R, S y T; KM1 (contactor + relé térmico) hace el triángulo y KM2 (contactor trifásico) hace la estrella. S1 inicia, S2 detiene y S3 no interviene. P1 indica estrella, P4 triángulo, P3 disparo y P2 (rojo) motor detenido.'}
} as const;
export function activityRoles(profile:ActivityProfile){return {
 main:profile==='manual'?'CONTACTOR_TERMICO':'TEMPORIZADOR_1',
 star:profile==='manual'?'CONTACTOR_TRIFASICO_3':profile==='twoContactors'?'CONTACTOR_TRIFASICO':'CONTACTOR_TERMICO',
 delta:profile==='twoContactors'?'CONTACTOR_TERMICO':'CONTACTOR_TRIFASICO',
 start:profile==='twoContactors'?'S1':'S1',automatic:profile!=='manual',restPilot:true
};}
