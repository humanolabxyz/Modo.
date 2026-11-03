import {useEffect, useRef, useState} from 'react';
import type {ArenaFrame} from './model.ts';
import type {BattleStatus} from './ArenaStage';
/** Small synthesized cues; context is unlocked only by an explicit sound-button click. */
export function useArenaAudio(frame:ArenaFrame|null,status:BattleStatus){
  const [enabled,setEnabled]=useState(false),ctx=useRef<AudioContext|null>(null),seen=useRef({count:-1,impact:0,done:false});
  function tone(frequency:number,length:number,delay=0,volume=.035){
    const c=ctx.current;if(!c||c.state!=='running')return;
    const osc=c.createOscillator(),gain=c.createGain(),t=c.currentTime+delay;
    osc.type='triangle';osc.frequency.setValueAtTime(frequency,t);gain.gain.setValueAtTime(volume,t);gain.gain.exponentialRampToValueAtTime(.0001,t+length);osc.connect(gain);gain.connect(c.destination);osc.start(t);osc.stop(t+length+.01);
  }
  function toggle(){
    if(enabled){setEnabled(false);void ctx.current?.suspend();return;}
    try{ctx.current??=new AudioContext();void ctx.current.resume();setEnabled(true);}catch{setEnabled(false);}
  }
  useEffect(()=>{
    if(!frame){seen.current={count:-1,impact:0,done:false};return;}
    if(!enabled||status==='paused')return;
    if(frame.countdown!==seen.current.count){seen.current.count=frame.countdown;tone(frame.countdown?520:880,frame.countdown?.09:.23);}
    const impact=frame.physics.impacts?.at(-1)?.sequence??0;
    if(impact!==seen.current.impact){seen.current.impact=impact;tone(95,.10,0,.065);tone(230,.045,0,.025);}
    if(frame.result&&!seen.current.done){seen.current.done=true;[523,659,784,1046].forEach((note,i)=>tone(note,.22,i*.12));}
  },[frame,status,enabled]);
  useEffect(()=>()=>{void ctx.current?.close();},[]);
  return {enabled,toggle};
}
