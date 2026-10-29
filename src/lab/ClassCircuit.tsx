import {useState,type ReactNode} from 'react';
import {IC_PIN_NAMES} from './model';
const ink='#284d5d',live='#147c79';
export function ClassCircuit({kind,zoom}:{kind:string;zoom:number}){
 const [route,setRoute]=useState<0|1|2>(0),[selected,setSelected]=useState<string|null>(null);
 const line=(d:string,on=false)=><path d={d} fill="none" stroke={on?live:ink} strokeWidth={on?4:2} strokeLinejoin="round" strokeLinecap="round"/>;
 const dot=(x:number,y:number)=><circle cx={x} cy={y} r="4" fill={ink}/>;
 const text=(x:number,y:number,value:string,size=14)=><text x={x} y={y} fill={ink} fontSize={size} fontFamily="system-ui">{value}</text>;
 const device=(id:string,x:number,y:number,children:ReactNode)=><g role="button" tabIndex={0} aria-label={`Explicar ${id}`} onClick={()=>setSelected(id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected(id);}}} style={{cursor:'pointer'}}><rect x={x-38} y={y-40} width="76" height="80" rx="7" fill={selected===id?'#dbefed':'transparent'} stroke={selected===id?'#29938d':'transparent'}/>{children}</g>;
 const resistor=(id:string,x:number,y:number)=>device(id,x,y,<>{line(`M${x-40} ${y}h18m44 0h18`)}<rect x={x-22} y={y-8} width="44" height="16" fill="white" stroke={ink} strokeWidth="2"/>{text(x-20,y-16,id+' · 1 kΩ',12)}</>);
 const transistor=(id:string,x:number,y:number)=>device(id,x,y,<>{line(`M${x-30} ${y}h22M${x-8} ${y-17}v34M${x-3} ${y-9}L${x+22} ${y-28}M${x-3} ${y+9}L${x+22} ${y+28}`)}<path d={`M${x+11} ${y+11}l10 16 -16 -6z`} fill={ink}/>{text(x+28,y-7,id,15)}{text(x+28,y+11,'PN2222A',11)}{text(x-1,y-31,'C',10)}{text(x-18,y-4,'B',10)}{text(x+17,y+43,'E',10)}</>);
 const motor=(x:number,y:number)=><g><circle cx={x} cy={y} r="26" fill="white" stroke={ink} strokeWidth="2"/><text x={x} y={y+7} textAnchor="middle" fill={ink} fontFamily="system-ui" fontSize="24">M</text>{text(x-30,y+49,'Motor DC',13)}</g>;
 const button=(id:string,x:number,y:number,active:boolean)=>device(id,x,y,<>{line(`M${x-35} ${y}h15m40 0h15`,active)}<circle cx={x-20} cy={y} r="3" fill="white" stroke={ink}/><circle cx={x+20} cy={y} r="3" fill="white" stroke={ink}/>{line(active?`M${x-20} ${y}h40`:`M${x-20} ${y}l33 -17`,active)}{text(x-20,y+27,id,13)}</>);
 const ground=(x:number,y:number)=><g>{line(`M${x} ${y}v12m-15 0h30m-24 6h18m-12 6h6`)}{text(x+23,y+18,'0 V',12)}</g>;
 const explanation=selected?.startsWith('Q')?'Transistor NPN: E, B y C son nodos distintos. La resistencia limita la corriente de base. El montaje conecta las tres patas en columnas separadas.':selected?.startsWith('R')?'Resistencia de base de 1 kΩ del esquema docente. Une el mando a la base del transistor y limita su corriente.':selected?.startsWith('S')?'Pulsador momentáneo: solo cierra al mantenerlo presionado. En la placa tiene cuatro patas, con dos pares conectados internamente.':null;
 return <div className="class-circuit">
 {kind!=='pines'?<div className="class-route-tools" role="group" aria-label="Recorridos del diagrama">{(['Sin mando','S1 · giro 1','S2 · giro 2'] as const).map((name,i)=><button type="button" key={name} aria-pressed={route===i} onClick={()=>setRoute(i as 0|1|2)}>{name}</button>)}<span>Resaltado explicativo · opera el circuito en la placa</span></div>:null}
 <svg className="class-circuit-svg" width={880*zoom} height={(kind==='pines'?620:640)*zoom} viewBox={`0 0 880 ${kind==='pines'?620:640}`} role="img" aria-label={kind==='practica-1'?'Esquema claro del puente H con cuatro transistores NPN, cuatro resistencias y dos pulsadores':kind==='pines'?'Patillaje numerado L293D DIP16 con muesca y funciones':'Esquema de montaje L293D con lógica y motor a 5 V, dos pulsadores y resistencias de bajada'}>
 <defs><pattern id="class-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".65" fill="#cddcde"/></pattern></defs><rect width="880" height="640" fill="#fbfdfc"/><rect width="880" height="640" fill="url(#class-grid)"/>
 {text(30,35,kind==='practica-1'?'PRÁCTICA 1 · PUENTE H CON TRANSISTORES':kind==='pines'?'L293D · DIP16 · VISTA SUPERIOR':'PRÁCTICA 2 · MONTAJE A 5 V',19)}
 {kind==='practica-1'?<>
 {text(30,62,'V1 = 12 V · R1–R4 = 1 kΩ · cuatro NPN · misma topología que la lámina de clase',13)}
 {line('M95 110H760M95 110V175M95 110V350H125M95 350V510H125')}{text(110,102,'+12 V',14)}{dot(95,110)}
 <circle cx="95" cy="205" r="30" fill="white" stroke={ink} strokeWidth="2"/>{text(87,199,'+',20)}{text(88,221,'−',20)}{line('M95 235V580H760')}{ground(95,580)}
 {line('M425 110V152M760 110V152M425 208V445M760 208V445M425 501V580M760 501V580')}
 {transistor('Q2',403,180)}{transistor('Q1',738,180)}{transistor('Q3',403,473)}{transistor('Q4',738,473)}
 {line('M425 350H562M614 350H760',route!==0)}{motor(588,350)}{dot(425,350)}{dot(760,350)}
 {button('S1',160,350,route===1)}{button('S2',160,510,route===2)}
 {line('M195 350H240V180H260',route===1)}{resistor('R1',300,180)}{line('M340 180H373',route===1)}
 {line('M240 350V555H555V473H585',route===1)}{resistor('R4',625,473)}{line('M665 473H708',route===1)}
 {line('M195 510H215V473H260',route===2)}{resistor('R2',300,473)}{line('M340 473H373',route===2)}
 {line('M215 510V85H555V180H585',route===2)}{resistor('R3',625,180)}{line('M665 180H708',route===2)}{dot(240,350)}{dot(215,510)}
 {route===1?line('M425 110V152M425 208V350H562M614 350H760V445M760 501V580',true):route===2?line('M760 110V152M760 208V350H614M562 350H425V445M425 501V580',true):null}
 {text(30,620,'Punto lleno = unión. Cruce sin punto = cables separados. No pulses S1 y S2 a la vez.',13)}
 </>:kind==='pines'?<>
 <rect x="290" y="110" width="290" height="420" rx="15" fill="#344a56" stroke={ink} strokeWidth="3"/><path d="M410 110a25 25 0 0 0 50 0" fill="#fbfdfc" stroke={ink} strokeWidth="3"/><circle cx="315" cy="146" r="6" fill="#eee"/>
 {Array.from({length:8},(_,i)=>{const y=155+i*45;return <g key={i}>{line(`M250 ${y}h40M580 ${y}h40`)}{text(260,y-9,String(i+1),12)}{text(590,y-9,String(16-i),12)}{text(90,y+5,`${i+1} · ${IC_PIN_NAMES[i]}`,17)}{text(650,y+5,`${16-i} · ${IC_PIN_NAMES[15-i]}`,17)}</g>;})}
 <text x="435" y="325" fill="white" textAnchor="middle" fontFamily="system-ui" fontSize="25">L293D</text>{text(290,568,'Muesca arriba · pin 1 marcado con punto',15)}{text(90,601,'VSS (16): lógica 5 V · VS (8): motor · GND: 4, 5, 12 y 13',16)}
 </>:<>
 {text(30,62,'Preparación del simulador: 5 V comunes para lógica y motor; los pulsadores tienen pull-down de 10 kΩ.',13)}
 {line('M90 110H790')}{text(90,100,'+5 V',15)}{line('M90 570H790')}{ground(110,570)}
 <rect x="370" y="165" width="235" height="310" rx="10" fill="white" stroke={ink} strokeWidth="2"/>{text(430,200,'L293D',21)}
 {text(382,242,'16 · VSS',14)}{text(510,242,'8 · VS',14)}{line('M410 110V220M555 110V220M488 110V285H370')}{text(380,281,'1 · EN1',13)}{dot(410,110)}{dot(555,110)}{dot(488,110)}
 {text(382,335,'2 · IN1',13)}{text(382,407,'7 · IN2',13)}{line('M90 110V325H125M90 325V397H125')}{button('S1',160,325,route===1)}{button('S2',160,397,route===2)}{line('M195 325H370',route===1)}{line('M195 397H370',route===2)}
 {line('M245 325V450M305 397V450')}{dot(245,325)}{dot(305,397)}{[245,305].map(x=><g key={x}><rect x={x-7} y="450" width="14" height="50" fill="white" stroke={ink} strokeWidth="2"/>{line(`M${x} 500V570`)}{text(x-22,526,'10 kΩ',12)}</g>)}
 {text(505,335,'3 · OUT1',13)}{text(505,407,'6 · OUT2',13)}{line('M605 325H740V340',route===1)}{line('M605 397H740V392',route===2)}{motor(740,366)}
 {text(402,453,'4, 5, 12, 13 · GND',13)}{line('M488 475V570')}{dot(488,570)}
 {text(30,615,'La lámina docente usa motor a 12 V: VSS necesita una fuente lógica independiente de 5 V.',14)}
 </>}
 </svg>
 {explanation?<p className="class-device-explanation" role="status"><strong>{selected}</strong> · {explanation}</p>:<p className="class-device-explanation">Toca una referencia para reconocer su función. Los recorridos resaltados explican la conexión; la medición se realiza en el banco.</p>}
 </div>;
}
