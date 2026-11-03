import {useEffect,useRef,useState} from 'react';
import type {RobotProject,Vec3} from '../project/types.ts';
import {ARM_ID,BLOCK_ID,ZONE_ID,gripArm,moveArm,resetArmPractice,approachArm,heldId,armTaskProgress} from './model.ts';
import {HOME,JOINTS,armAngles,armFrames,inverseArm,modelTorques} from './kinematics.ts';
import {planArmMotion,type MotionKind} from './motion.ts';
import {prepareArmTask, type ArmPoint} from './program.ts';
import {conveyorReading,stepConveyor,routeDetectedPiece,feedInterlock,findConveyor} from '../conveyor/model.ts';

export function useArmController(project:RobotProject,update:(fn:(p:RobotProject)=>RobotProject)=>void){
  const [preview,setPreview]=useState<RobotProject|null>(null),[enabled,setEnabled]=useState(false),[eStop,setEStop]=useState(false);
  const [running,setRunning]=useState(false),[paused,setPaused]=useState(false),[speed,setSpeed]=useState(50),[kind,setKind]=useState<MotionKind>('MovJ');
  const [message,setMessage]=useState('');
  const [dropping,setDropping]=useState(false);
  const [sequencing,setSequencing]=useState(false),[step,setStep]=useState<{index:number;total:number;name:string}|null>(null);
  const [selectedBlock,setSelectedBlock]=useState('');
  const sequence=useRef(false);
  const [feeding,setFeeding]=useState(false);
  const feedBusy=useRef(false),feedTimer=useRef(0),feedFinish=useRef<((ok:boolean)=>void)|null>(null);
  const [acceleration,setAcceleration]=useState([0,0,0,0,0,0]);
  const dropFinish=useRef<((ok:boolean)=>void)|null>(null);
  const fallFrame=useRef(0),freeFall=useRef<(()=>void)|null>(null),mounted=useRef(true);
  const committedParts=useRef<RobotProject['parts']|null>(null),busy=useRef(false);
  const commit=(next:RobotProject)=>{committedParts.current=next.parts;update(()=>next);};
  const current=useRef(project),stored=useRef(project),raf=useRef(0),pauseRef=useRef(false),generation=useRef(0),finish=useRef<((ok:boolean)=>void)|null>(null);
  stored.current=project;if(!running&&!preview&&!feeding&&!sequencing)current.current=project;
  const stop=(save=true)=>{
    clearTimeout(feedTimer.current);feedBusy.current=false;feedFinish.current?.(false);feedFinish.current=null;setFeeding(false);
    sequence.current=false;setSequencing(false);setStep(null);
    busy.current=false;generation.current++;clearTimeout(raf.current);finish.current?.(false);finish.current=null;
    if(save&&current.current!==stored.current)commit(current.current);
    setPreview(null);setRunning(false);setPaused(false);pauseRef.current=false;
    setAcceleration([0,0,0,0,0,0]);
  };
  useEffect(()=>{
    if(project.parts===committedParts.current&&project.scene.obstacles===current.current.scene.obstacles)return;
    clearTimeout(feedTimer.current);feedBusy.current=false;feedFinish.current?.(false);feedFinish.current=null;setFeeding(false);
    clearTimeout(fallFrame.current);freeFall.current?.();freeFall.current=null;dropFinish.current?.(false);dropFinish.current=null;setDropping(false);
    busy.current=false;clearTimeout(raf.current);finish.current?.(false);finish.current=null;generation.current++;
    sequence.current=false;setSequencing(false);setStep(null);
    current.current=project;setPreview(null);setRunning(false);setPaused(false);pauseRef.current=false;
  },[project.parts,project.scene.obstacles]);
  useEffect(()=>{setEnabled(false);setEStop(false);setMessage('');},[project.id]);
  useEffect(()=>{mounted.current=true;return ()=>{mounted.current=false;clearTimeout(feedTimer.current);feedFinish.current?.(false);clearTimeout(raf.current);clearTimeout(fallFrame.current);freeFall.current?.();dropFinish.current?.(false);finish.current?.(false);generation.current++;};},[]);
  useEffect(()=>{
    const hidden=()=>{if(document.hidden&&(busy.current||sequence.current||feedBusy.current)){pauseRef.current=true;setPaused(true);setAcceleration([0,0,0,0,0,0]);}};
    document.addEventListener('visibilitychange',hidden);
    return ()=>document.removeEventListener('visibilitychange',hidden);
  },[]);
  const id=project.parts.find(p=>p.definitionId===ARM_ID)?.instanceId;
  const motion=async(target:number[],motionKind:MotionKind=kind):Promise<boolean>=>{
    if(!id||!enabled||eStop){setMessage('Enciende los motores para mover el brazo. Si hay una emergencia activa, restablécela primero.');return false;}
    if(busy.current||feedBusy.current||dropping)return false;
    const plan=planArmMotion(current.current,id,target,motionKind,speed);
    if(!plan.ok){setMessage(plan.message);return false;}
    busy.current=true;setRunning(true);if(!sequence.current){setPaused(false);pauseRef.current=false;}setMessage(`${motionKind} en marcha · velocidad ${speed} %.`);
    return new Promise(resolve=>{
      finish.current=resolve;let elapsed=0,last=performance.now();
      const tick=(now:number)=>{
        if(!pauseRef.current)elapsed+=(now-last)/1000;last=now;
        if(pauseRef.current){raf.current=window.setTimeout(()=>tick(performance.now()),20);return;}
        const index=Math.min(plan.frames.length-1,Math.floor(elapsed/plan.duration*plan.frames.length));
        const dt=plan.duration/plan.frames.length,prev=index>0?plan.frames[index-1]:armAngles(current.current.parts.find(x=>x.instanceId===id)!),next=plan.frames[Math.min(plan.frames.length-1,index+1)];
        setAcceleration(plan.frames[index].map((v,i)=>(next[i]-2*v+prev[i])/(dt*dt)));
        const result=moveArm(current.current,id,plan.frames[index]);
        if(!result.ok){setMessage(result.message);stop();return;}
        current.current=result.project;setPreview(result.project);
        if(elapsed>=plan.duration){
          finish.current=null;busy.current=false;setRunning(false);setPreview(null);setAcceleration([0,0,0,0,0,0]);commit(result.project);setMessage(`${motionKind} completado.`);resolve(true);
        }else raf.current=window.setTimeout(()=>tick(performance.now()),20);
      };
      raf.current=window.setTimeout(()=>tick(performance.now()),20);
    });
  };
  const act=(fn:(p:RobotProject)=>ReturnType<typeof gripArm>)=>{
    if(busy.current||sequence.current||feedBusy.current||dropping){setMessage('Espera a que termine el movimiento.');return;}
    if(!enabled||eStop){setMessage('Primero pulsa «Encender motores».');return;}
    const result=fn(current.current);setMessage(result.message);
    if(result.ok){current.current=result.project;commit(result.project);}
  };
  const approach=(zone:boolean,above=false)=>{
    if(!id)return;
    const p=current.current,active=p.parts.find(x=>x.instanceId===id)!,block=p.parts.find(x=>x.instanceId===(heldId(active)||selectedBlock)&&x.definitionId===BLOCK_ID)??p.parts.find(x=>x.definitionId===BLOCK_ID);
    const part=zone?p.parts.find(x=>x.definitionId===ZONE_ID&&(!block?.props?.targetZone||x.instanceId===block.props.targetZone)):block;
    if(!part){setMessage('Falta la pieza o zona de entrega.');return;}
    const height=above?Math.max(.20,part.transform.position[1]+.12):(zone?.025:part.transform.position[1]+.0075);
    const r=approachArm(p,id,[part.transform.position[0],height,part.transform.position[2]]);
    if(!r.ok){setMessage(r.message);return;}void motion(armAngles(r.project.parts.find(x=>x.instanceId===id)!));
  };
  const jog=(axis:number,sign:number,cartesian=false)=>{
    if(!id||busy.current||feedBusy.current||sequence.current)return;const arm=current.current.parts.find(x=>x.instanceId===id)!;
    if(cartesian){
      const tcp=armFrames(arm).tcp,pos=[...tcp.position] as Vec3;pos[axis]+=.01*sign;
      const target=inverseArm(arm,{...tcp,position:pos});if(!target){setMessage('Jog cartesiano fuera de alcance o próximo a singularidad.');return;}void motion(target,'MovL');
    }else{const target=armAngles(arm);target[axis]=Math.max(JOINTS[axis].min,Math.min(JOINTS[axis].max,target[axis]+5*sign));void motion(target);}
  };
  const record=()=>{
    if(!id||busy.current||feedBusy.current||sequence.current)return;const p=current.current,arm=p.parts.find(x=>x.instanceId===id)!;
    const points=p.armProgram?.armId===id?p.armProgram.points:[];if(points.length>=40){setMessage('Máximo 40 puntos.');return;}
    update(p=>({...p,armProgram:{armId:id,points:[...points,{name:`P${points.length+1}`,angles:armAngles(arm),gripperOpen:arm.props?.gripperOpen!==false,kind}]}}));
    setMessage('Posición guardada con su recorrido y estado de pinza. Agrega otra posición o ejecuta tu programa.');
  };
  const executePoints=async(points:ArmPoint[],token:number)=>{
    if(!id)return false;
    for(const [index,point] of points.entries()){
      if(token!==generation.current)return false;
      setStep({index:index+1,total:points.length,name:point.name});
      while(pauseRef.current&&token===generation.current)await new Promise<void>(resolve=>setTimeout(resolve,20));
      if(token!==generation.current)return false;
      const ok=await motion(point.angles,point.kind);if(!ok||token!==generation.current)return false;
      const active=current.current.parts.find(x=>x.instanceId===id)!;
      if((active.props?.gripperOpen!==false)!==point.gripperOpen){const released=await grip();if(!released||token!==generation.current)return false;}
      if(point.expectedHeld&&heldId(current.current.parts.find(x=>x.instanceId===id)!)!==point.expectedHeld){setMessage(`Secuencia detenida en ${point.name}: la pinza no sostiene la pieza prevista. Revisa su posición y reinicia la práctica.`);return false;}
      // Yield a frame to let the stored project settle between taught steps.
      await new Promise<void>(resolve=>setTimeout(resolve,0));
    }
    return token===generation.current;
  };
  const runProgram=async(points:ArmPoint[])=>{
    if(!id||busy.current||feedBusy.current||sequence.current||dropping||!enabled||eStop)return;
    if(!points.length){setMessage('Todavía no hay puntos. Genera un recorrido de ejemplo o guarda una posición del brazo.');return;}
    const token=generation.current;
    sequence.current=true;setSequencing(true);setPaused(false);pauseRef.current=false;
    try { if(await executePoints(points,token))setMessage('Secuencia de puntos completada.');
    } finally {if(token===generation.current){sequence.current=false;setSequencing(false);setStep(null);setPaused(false);pauseRef.current=false;}}
  };
  const playback=()=>runProgram(stored.current.armProgram?.points??[]);
  const startPractice=async()=>{
    if(!id||busy.current||feedBusy.current||sequence.current||dropping||!enabled||eStop)return;
    const prepared=prepareArmTask(current.current,id,speed);
    if(!prepared.ok){setMessage(prepared.message);return;}
    current.current={...current.current,armProgram:prepared.program};commit(current.current);
    await runProgram(prepared.program.points);
  };
  const shown=preview??project,arm=shown.parts.find(x=>x.instanceId===id);
  const grip=async()=>{
    if(!id||busy.current||feedBusy.current||dropping||!enabled||eStop)return false;
    const before=current.current,active=before.parts.find(x=>x.instanceId===id)!;
    const released=before.parts.find(x=>x.instanceId===heldId(active));
    const r=gripArm(before,id,active.props?.gripperOpen===false);
    setMessage(r.message);if(!r.ok)return false;
    if(!released||active.props?.gripperOpen!==false){current.current=r.project;commit(r.project);return true;}
    setDropping(true);current.current=r.project;setPreview(r.project);
    try{
      const {createDropWorld}=await import('./drop.ts');
      const world=await createDropWorld(r.project,r.project.parts.find(x=>x.instanceId===released.instanceId)!,r.project.parts.find(x=>x.instanceId===id)!);
      if(!mounted.current||stored.current.id!==before.id||(stored.current.parts!==before.parts&&stored.current.parts!==committedParts.current)){world.free();return false;}
      freeFall.current=world.free;let last=performance.now(),accumulator=0;
      return await new Promise<boolean>(resolve=>{
      dropFinish.current=resolve;
      const tick=(now:number)=>{
        accumulator+=Math.min(.25,(now-last)/1000);last=now;
        let frame:ReturnType<typeof world.step>|undefined;
        while(accumulator>=1/120){frame=world.step();accumulator-=1/120;if(frame.done)break;}
        if(frame){
          current.current={...current.current,parts:current.current.parts.map(x=>x.instanceId===released.instanceId?{...x,transform:frame!.transform}:x)};
          setPreview(current.current);
          if(frame.done){world.free();freeFall.current=null;setDropping(false);setPreview(null);commit(current.current);setMessage('Pieza liberada: caída y contacto resueltos por la física.');dropFinish.current=null;resolve(true);return;}
        }
        fallFrame.current=window.setTimeout(()=>tick(performance.now()),16);
      };
      fallFrame.current=window.setTimeout(()=>tick(performance.now()),16);
      });
    }catch{if(mounted.current){setDropping(false);current.current=before;setPreview(null);setMessage('No se pudo iniciar la física de la pieza; se conserva el agarre anterior.');}return false;}
  };
  const feed=async()=>{
    if(!id||!enabled||eStop||busy.current||feedBusy.current||dropping)return false;
    const interlock=feedInterlock(current.current);if(interlock){setMessage(interlock);return false;}
    feedBusy.current=true;setFeeding(true);
    if(!sequence.current){pauseRef.current=false;setPaused(false);}
    setMessage('Cinta en marcha · esperando presencia.');
    const token=generation.current;
    return new Promise<boolean>(resolve=>{
      feedFinish.current=resolve;let last=performance.now();
      const tick=(now:number)=>{
        if(token!==generation.current||!mounted.current){resolve(false);return;}
        const dt=Math.min(.1,(now-last)/1000);last=now;
        if(pauseRef.current){feedTimer.current=window.setTimeout(()=>tick(performance.now()),20);return;}
        const result=stepConveyor(current.current,dt);
        current.current=result.project;setPreview(result.project);
        if(result.state==='moving'){feedTimer.current=window.setTimeout(()=>tick(performance.now()),20);return;}
        feedBusy.current=false;setFeeding(false);setPreview(null);commit(result.project);feedFinish.current=null;setMessage(result.message);resolve(result.state==='detected');
      };
      feedTimer.current=window.setTimeout(()=>tick(performance.now()),20);
    });
  };
  const classify=async()=>{
    if(!id||busy.current||feedBusy.current||sequence.current||dropping||!enabled||eStop)return;
    const token=generation.current;
    sequence.current=true;setSequencing(true);setPaused(false);pauseRef.current=false;
    try {
      const total=armTaskProgress(current.current).total;
      for(let i=0;i<total&&!armTaskProgress(current.current).complete;i++){
        const before=armTaskProgress(current.current).done;
        setStep({index:before+1,total,name:'Transportar hasta presencia'});
        if(!await feed()||token!==generation.current)return;
        while(pauseRef.current&&token===generation.current)await new Promise<void>(resolve=>setTimeout(resolve,20));
        if(token!==generation.current)return;
        const routed=routeDetectedPiece(current.current);
        if(!routed.ok){setMessage(routed.message);return;}
        const prepared=prepareArmTask(routed.project,id,speed,[routed.pieceId]);
        if(!prepared.ok){setMessage(prepared.message);return;}
        current.current={...routed.project,armProgram:prepared.program};commit(current.current);
        if(!await executePoints(prepared.program.points,token)||token!==generation.current)return;
        if(armTaskProgress(current.current).done<=before){setMessage('Ciclo detenido: la pieza no quedó en su destino. Revisa la entrega antes de continuar.');return;}
      }
      if(token===generation.current)setMessage(armTaskProgress(current.current).complete?'Clasificación completada: lote entregado por color.':'Clasificación detenida: quedan piezas pendientes.');
    } finally {if(token===generation.current){sequence.current=false;setSequencing(false);setStep(null);setPaused(false);pauseRef.current=false;}}
  };
  const editPoint=(index:number,patch:Partial<ArmPoint>)=>{
    if(sequence.current||busy.current||feedBusy.current||dropping)return;
    update(p=>p.armProgram?{...p,armProgram:{...p.armProgram,points:p.armProgram.points.map((point,i)=>i===index?{...point,...patch}:point)}}:p);
  };
  return {project:shown,enabled,eStop,running:running||sequencing||feeding,dropping,paused,speed,kind,message,step,selectedBlock,setSelectedBlock,setKind,setSpeed,
    line:conveyorReading(shown),feeding,
    advance:()=>{if(!sequence.current)void feed();},classify,
    setConveyorProp:(key:'speedMps'|'jammed'|'sensorFault',value:number|boolean)=>{if(busy.current||sequence.current||feedBusy.current||dropping)return;const belt=findConveyor(current.current);if(!belt)return;update(p=>({...p,parts:p.parts.map(x=>x.instanceId===belt.instanceId?{...x,props:{...x.props,[key]:value}}:x)}));},
    status:eStop?'EMERGENCIA':paused&&(running||sequencing||feeding)?'PAUSA':dropping?'PIEZA LIBERADA':!enabled?'SERVOS OFF':running||sequencing||feeding?'EN MARCHA':'LISTO',
    enable:()=>{if(busy.current||sequence.current||feedBusy.current||dropping)return;if(eStop){setMessage('Restablece la emergencia antes de habilitar.');return;}setEnabled(v=>!v);setMessage(enabled?'Motores apagados. Puedes revisar o preparar el recorrido.':'Motores encendidos. Inicia una práctica o mueve el brazo a mano.');},
    emergency:()=>{stop();setEStop(true);setEnabled(false);setMessage('Emergencia activa: el movimiento está detenido. Restablece la emergencia y vuelve a encender los motores para continuar.');},
    resetEmergency:()=>{setEStop(false);setMessage('Emergencia restablecida. Pulsa «Encender motores» para volver a operar.');},
    pause:()=>{pauseRef.current=!pauseRef.current;setPaused(pauseRef.current);if(pauseRef.current)setAcceleration([0,0,0,0,0,0]);},stop:()=>{stop();setMessage('Movimiento detenido en la posición actual.');},
    move:(angles:number[])=>{if(!sequence.current)void motion(angles);},home:()=>{if(!sequence.current)void motion(HOME);},jog,approach,record,playback,startPractice,
    grip:()=>{if(!sequence.current)void grip();},
    prepare:()=>{
      if(!id||busy.current||feedBusy.current||sequence.current||dropping)return;
      let working=current.current,pieceIds:string[]|undefined;
      if(findConveyor(working)){const routed=routeDetectedPiece(working);if(!routed.ok){setMessage(routed.message);return;}working=routed.project;pieceIds=[routed.pieceId];}
      const result=prepareArmTask(working,id,speed,pieceIds);if(!result.ok){setMessage(result.message);return;}
      update(p=>({...p,parts:working.parts,armProgram:result.program}));setMessage(`Ciclo preparado: ${result.program.points.length} puntos, aproximadamente ${Math.ceil(result.duration)} s de movimiento a ${speed} %. Habilita servos y reproduce el programa.`);
    },
    editPoint,
    reorderPoint:(index:number,offset:number)=>{if(sequence.current||busy.current||feedBusy.current||dropping)return;update(p=>{if(!p.armProgram)return p;const points=[...p.armProgram.points],other=index+offset;if(other<0||other>=points.length)return p;[points[index],points[other]]=[points[other],points[index]];return {...p,armProgram:{...p.armProgram,points}};});},
    resetPractice:()=>id&&act(p=>resetArmPractice(p,id)),
    removePoint:(index:number)=>!sequence.current&&!busy.current&&!feedBusy.current&&!dropping&&update(p=>p.armProgram?{...p,armProgram:{...p.armProgram,points:p.armProgram.points.filter((_,i)=>i!==index)}}:p),
    torques:arm?modelTorques(arm,heldId(arm)?Number(shown.parts.find(x=>x.instanceId===heldId(arm))?.props?.massKg??.05):0,acceleration):[],
  };
}
export type ArmController=ReturnType<typeof useArmController>;
