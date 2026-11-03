import type {PartInstance} from '../project/types.ts';
import {BELT_LENGTH,SENSOR_Z} from './constants.ts';
const Box=({at,size,color,metal=0}:{at:[number,number,number];size:[number,number,number];color:string;metal?:number})=><mesh position={at} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} metalness={metal} roughness={.48}/></mesh>;
export function ConveyorMesh({part}:{part:PartInstance}){
  const phase=Number(part.props?.phaseM??0);
  return <>
    <Box at={[0,.030,0]} size={[.125,.018,.67]} color="#253f55"/>
    {[-1,1].map(side=><group key={side}>
      <Box at={[side*.073,.006,0]} size={[.014,.04,BELT_LENGTH]} color="#bdc7cc" metal={.7}/>
      {[-.26,.26].map(z=><Box key={z} at={[side*.06,-.025,z]} size={[.014,.03,.025]} color="#5d707d" metal={.5}/>)}
      <Box at={[side*.077,.065,SENSOR_Z]} size={[.018,.05,.028]} color="#2f74b0"/>
      <Box at={[side*.066,.058,SENSOR_Z]} size={[.003,.012,.012]} color={side<0?'#e54c4c':'#24343d'}/>
    </group>)}
    {[-.329,.329].map(z=><mesh key={z} position={[0,.018,z]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.021,.021,.13,24]}/><meshStandardMaterial color="#788e9d" metalness={.8} roughness={.3}/></mesh>)}
    {Array.from({length:24},(_,i)=><Box key={i} at={[0,.0405,((i*.03-phase+BELT_LENGTH*2)%BELT_LENGTH)-BELT_LENGTH/2]} size={[.12,.001,.003]} color="#456278"/>)}
    <Box at={[.102,.006,.26]} size={[.045,.035,.055]} color="#3679b6"/>
    <Box at={[.080,.097,SENSOR_Z+.035]} size={[.025,.017,.028]} color="#e7edf1"/>
    <mesh position={[0,.0575,SENSOR_Z]}><boxGeometry args={[.125,.001,.001]}/><meshBasicMaterial color="#ff5252" transparent opacity={.45}/></mesh>
  </>;
}
