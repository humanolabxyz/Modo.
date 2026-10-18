import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath,pathToFileURL} from 'node:url';
import ts from 'typescript';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const directory=await fs.mkdtemp(path.join(os.tmpdir(),'panellab-laboratory-check-'));
const tests=[];const started=performance.now();
function test(name,run){try{run();tests.push({name,status:'PASS'});}catch(error){tests.push({name,status:'FAIL',error:error.message});}}
try{
  for(const name of ['model','st','dc','engine','validation','units','labels','cords','equipment/model','equipment/engine']){const source=await fs.readFile(path.join(root,`src/lab/${name}.ts`),'utf8');const result=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}});await fs.mkdir(path.dirname(path.join(directory,`${name}.mjs`)),{recursive:true});await fs.writeFile(path.join(directory,`${name}.mjs`),result.outputText.replace(/from '(\.\.?\/[^']+)'/g,(_,p)=>`from '${p}.mjs'`));}
  const {newProject}=await import(pathToFileURL(path.join(directory,'model.mjs')));
  const {emptyRuntime,tick,compilePLC,solveSchematic}=await import(pathToFileURL(path.join(directory,'engine.mjs')));
  const {compileST,runST}=await import(pathToFileURL(path.join(directory,'st.mjs')));
  const {solveBreadboard,solveDC,measureResistance,actualValue}=await import(pathToFileURL(path.join(directory,'dc.mjs')));
  const {parseProject,readProject}=await import(pathToFileURL(path.join(directory,'validation.mjs')));
  const {HOLES,HOLE_BY_ID,bjtBase,crowdedHoles,relocate}=await import(pathToFileURL(path.join(directory,'model.mjs')));
  const {formatOhms,formatAmps,formatVolts,parseOhms,parseVolts,splitOhms,resistorBands}=await import(pathToFileURL(path.join(directory,'units.mjs')));
  const {createChain,stepChain,ropeTarget,CORD_DEFAULTS}=await import(pathToFileURL(path.join(directory,'cords.mjs')));
  const {placeLabels,labelWidth,wirePolyline,segmentHitsRect,LABEL_HEIGHT}=await import(pathToFileURL(path.join(directory,'labels.mjs')));
  const clone=p=>structuredClone(p),base=newProject();
  test('All three project templates survive JSON export/import',()=>{for(const template of ['motor','tank','blank']){const p=newProject(template),r=readProject(JSON.stringify(p));assert.equal(r.ok,true);assert.deepEqual(r.project,p);}});
  test('Duplicate identities and dangling terminals rejected',()=>{let p=clone(base);p.schematic.devices.push(clone(p.schematic.devices[0]));assert.equal(parseProject(p).ok,false);p=clone(base);p.schematic.wires[0].from.device='missing';assert.equal(parseProject(p).ok,false);});
  test('Reversed duplicate cable rejected',()=>{const p=clone(base),w=clone(p.schematic.wires[0]);w.id='duplicate';[w.from,w.to]=[w.to,w.from];p.schematic.wires.push(w);assert.equal(parseProject(p).ok,false);});
  test('Start, retention after release, and stop in relay circuit and PLC',()=>{let r=emptyRuntime(base);r=tick(base,r,{start:true},{},.1,null);assert.equal(r.relays.K1,true);assert.equal(r.memory['Q0.0'],true);r=tick(base,r,{}, {},.1,null);assert.equal(r.relays.K1,true);assert.equal(r.memory['Q0.0'],true);r=tick(base,r,{stop:true},{},.1,null);assert.equal(r.relays.K1,false);assert.equal(r.memory['Q0.0'],false);});
  test('Short between supply poles stops simulation',()=>{const p=clone(base);p.schematic.wires.push({id:'short',from:{device:'g1',pin:0},to:{device:'g1',pin:1}});const r=tick(p,emptyRuntime(p),{},{},.1,null);assert.match(r.fault,/Cortocircuito/);assert.equal(r.pump,false);});
  test('Ladder unknown contact and input coil produce diagnostics',()=>{const p=clone(base);p.plc.rungs[0].branches=[[{address:'I9.0',negated:false}]];p.plc.rungs[0].output='I0.0';assert.deepEqual(compilePLC(p).diagnostics.map(d=>d.code).sort(),['L002','L004']);});
  test('TON reaches preset and resets when input drops',()=>{const p=clone(base);p.schematic={devices:[],wires:[]};p.plc.rungs=[{id:'timer',branches:[[{address:'I0.0',negated:false}]],output:'T1',mode:'ton',preset:2,comment:''}];let r=emptyRuntime(p);for(let i=0;i<19;i++)r=tick(p,r,{}, {'I0.0':true},.1,null);assert.equal(r.memory.T1,false);r=tick(p,r,{}, {'I0.0':true},.1,null);assert.equal(r.memory.T1,true);r=tick(p,r,{}, {'I0.0':false},.1,null);assert.equal(r.memory.T1,false);});
  test('TOF holds after input drops and expires at preset',()=>{const p=clone(base);p.schematic={devices:[],wires:[]};p.plc.rungs=[{id:'timer',branches:[[{address:'I0.0',negated:false}]],output:'T1',mode:'tof',preset:1,comment:''}];let r=tick(p,emptyRuntime(p),{}, {'I0.0':true},.1,null);assert.equal(r.memory.T1,true);for(let i=0;i<9;i++)r=tick(p,r,{}, {'I0.0':false},.1,null);assert.equal(r.memory.T1,true);r=tick(p,r,{}, {'I0.0':false},.1,null);assert.equal(r.memory.T1,false);});
  test('CTU counts edges instead of scans',()=>{const p=clone(base);p.schematic={devices:[],wires:[]};p.plc.rungs=[{id:'count',branches:[[{address:'I0.0',negated:false}]],output:'C1',mode:'ctu',preset:2,comment:''}];let r=emptyRuntime(p);for(let i=0;i<10;i++)r=tick(p,r,{}, {'I0.0':true},.1,null);assert.equal(r.blocks.count.count,1);r=tick(p,r,{}, {'I0.0':false},.1,null);r=tick(p,r,{}, {'I0.0':true},.1,null);assert.equal(r.blocks.count.count,2);assert.equal(r.memory.C1,true);});
  test('ST boolean conditions, arithmetic precedence and comments',()=>{const tags=[...base.plc.tags,{address:'MW0',name:'Valor',type:'number',initial:0}];const p=compileST('// prueba\nMW0 := 2 + 3 * 4;\nIF I0.0 AND NOT I0.1 THEN Q0.0 := TRUE; ELSE Q0.0 := FALSE; END_IF;',tags);assert.deepEqual(p.diagnostics,[]);const memory=runST(p,{'I0.0':true,'I0.1':false});assert.equal(memory.MW0,14);assert.equal(memory['Q0.0'],true);});
  test('ST rejects unknown names, type errors, loops and input assignment',()=>{for(const source of ['Q0.0 := missing;','Q0.0 := 2 + 3;','FOR i := 1 TO 10 DO Q0.0 := TRUE; END_FOR;','I0.0 := TRUE;'])assert.ok(compileST(source,base.plc.tags).diagnostics.length);});
  test('ST division by zero fails explicitly',()=>{const tags=[...base.plc.tags,{address:'MW0',name:'Valor',type:'number',initial:0}];const p=compileST('MW0 := 1 / 0;',tags);assert.equal(p.diagnostics.length,0);assert.throws(()=>runST(p,{}),/cero/);});
  test('Automatic tank reaches high level and turns pump off',()=>{const p=newProject('tank');let r=emptyRuntime(p);for(let i=0;i<150;i++)r=tick(p,r,{}, {},.1,null);assert.equal(r.pump,false);assert.ok(r.level>=80&&r.level<81);assert.equal(r.memory['I0.3'],true);assert.equal(r.memory.AI0,r.level);});
  test('Drain returns to low level and pump restarts',()=>{const p=newProject('tank');let r=emptyRuntime(p);for(let i=0;i<150;i++)r=tick(p,r,{}, {},.1,null);r={...r,drain:true};let restarted=false;for(let i=0;i<800;i++){r=tick(p,r,{}, {},.1,null);if(r.pump){restarted=true;break;}}assert.equal(restarted,true);assert.ok(r.level>=0&&r.level<=100);});
  test('Tank volume follows inflow minus outflow',()=>{const p=clone(base);let r={...emptyRuntime(p),drain:true};for(let i=0;i<5;i++)r=tick(p,r,{}, {'I0.0':true},1,null);assert.ok(Math.abs(r.level-45)<1e-9);});
  test('Default LED circuit current agrees with resistor and diode model',()=>{const r=solveBreadboard(base.breadboard);assert.equal(r.fault,null);assert.ok(Math.abs(r.amps.pr2-3.1/1010)<1e-8);assert.ok(Math.abs(r.amps.pr3-r.amps.pr2)<1e-8);assert.equal(r.holeVolts['top+:1'],5);assert.equal(r.holeVolts['top-:1'],0);});
  test('Reversed LED does not light',()=>{const p=clone(base.breadboard);const led=p.components.find(c=>c.kind==='led');[led.from,led.to]=[led.to,led.from];const r=solveBreadboard(p);assert.equal(r.fault,null);assert.equal(r.amps.pr3,0);});
  test('Breadboard columns connected internally; channel and split rails separated',()=>{const r=solveBreadboard(base.breadboard);assert.equal(r.groups['a:1'],r.groups['e:1']);assert.notEqual(r.groups['e:1'],r.groups['f:1']);assert.notEqual(r.groups['top+:15'],r.groups['top+:16']);assert.equal(r.groups['top+:16'],r.groups['top+:30']);});
  test('Shorted breadboard source detected before solving',()=>{const p=clone(base.breadboard);p.components.push({id:'short',kind:'wire',from:p.positive,to:p.negative,value:0,closed:true,color:'#000000'});assert.match(solveBreadboard(p).fault,/Cortocircuito/);});
  test('Floating circuit has no fabricated voltage',()=>{const p=clone(base.breadboard);p.components=[{id:'float',kind:'resistor',from:'a:20',to:'f:21',value:1000,closed:true,color:'#000000'}];const r=solveBreadboard(p);assert.equal(r.fault,null);assert.equal(r.holeVolts['a:20'],undefined);assert.ok(r.floating.length);});
  test('Nodal solver handles series and parallel resistors',()=>{let r=solveDC([{id:'r1',a:'p',b:'mid',resistance:1000},{id:'r2',a:'mid',b:'n',resistance:1000}],{p:10,n:0});assert.equal(r.fault,null);assert.ok(Math.abs(r.volts.mid-5)<1e-9);assert.ok(Math.abs(r.amps.r1-.005)<1e-9);r=solveDC([{id:'r1',a:'p',b:'n',resistance:1000},{id:'r2',a:'p',b:'n',resistance:2000}],{p:10,n:0});assert.ok(Math.abs(r.amps.r1+r.amps.r2-.015)<1e-9);});
  test('LED without limiting resistor produces overcurrent warning',()=>{const p=clone(base.breadboard);p.components=p.components.filter(c=>c.id!=='pr2');p.components.push({id:'bypass',kind:'wire',from:'a:5',to:'a:10',value:0,closed:true,color:'#000000'});const r=solveBreadboard(p);assert.ok(r.warnings.some(w=>w.includes('20 mA')));});
  test('Invalid versions, JSON, holes, nonfinite values and mismatched widget types rejected',()=>{for(const change of [p=>p.version=99,p=>p.breadboard.components[0].from='a:99',p=>p.process.capacity=Infinity,p=>p.hmi.widgets[0].address='AI0',p=>p.process.low=90]){const p=clone(base);change(p);assert.equal(parseProject(p).ok,false);}assert.equal(readProject('{oops').ok,false);});
  test('Resistance labels use ohms, kilo and mega with decimal comma',()=>{const expected={1:'1 Ω',220:'220 Ω',1000:'1 kΩ',2200:'2,2 kΩ',4700:'4,7 kΩ',10000:'10 kΩ',1000000:'1 MΩ',1500000:'1,5 MΩ',10000000:'10 MΩ'};for(const [ohms,text] of Object.entries(expected))assert.equal(formatOhms(Number(ohms)),text);assert.deepEqual(splitOhms(4700),{text:'4,7',unit:'kΩ'});assert.equal(formatAmps(.003069),'3,069 mA');assert.equal(formatVolts(5),'5 V');});
  test('Resistance input: decimal comma, scale and thousands are never confused; values are stored in ohms',()=>{
    const ok=(text,unit,value)=>{const r=parseOhms(text,unit);assert.equal(r.ok,true,`${text} ${unit}: ${r.error}`);assert.equal(r.value,value,`${text} ${unit}`);};
    ok('4,7','kΩ',4700);ok('4.7','kΩ',4700);ok('4k7','Ω',4700);ok('4,7 kΩ','Ω',4700);ok('1 MΩ','Ω',1e6);ok('220','Ω',220);ok('10k','Ω',10000);ok('1.000.000','Ω',1e6);ok('1.000,5','Ω',1000.5);ok('1 000','Ω',1000);ok('0,001','kΩ',1);ok('220 ohmios','Ω',220);ok('1,5','MΩ',1.5e6);
    for(const bad of ['','  ','abc','1.000','1,000','1,','0','-5','11 MΩ','1m','1,2,3 k','1.0.00','Infinity','NaN','4,7 xyz','1e3']){const r=parseOhms(bad,'Ω');assert.equal(r.ok,false,`«${bad}» debe rechazarse`);assert.ok(r.error.length>5);}
    assert.equal(parseOhms('1.000','Ω').ok,false);assert.match(parseOhms('1.000','Ω').error,/ambiguo/);assert.match(parseOhms('0','Ω').error,/entre/);
    assert.equal(parseVolts('3,3',.1,24).value,3.3);assert.equal(parseVolts('12 V',.1,24).value,12);assert.equal(parseVolts('25',.1,24).ok,false);assert.equal(parseVolts('0',.1,24).ok,false);});
  test('Resistor bands are computed only when the value is exactly representable with two digits',()=>{const hex=v=>resistorBands(v);assert.equal(hex(1000).length,3);assert.deepEqual(hex(1000),[hex(1)[0],hex(100)[1],hex(100)[2]].map((_,i)=>hex(1000)[i]));assert.notEqual(hex(1000)[2],hex(10000)[2]);assert.notDeepEqual(hex(4700),hex(1000));assert.equal(resistorBands(1234),null);assert.equal(resistorBands(0),null);assert.equal(resistorBands(5e7),null);assert.equal(resistorBands(NaN),null);assert.notDeepEqual(resistorBands(220),resistorBands(330));assert.equal(resistorBands(4.7).length,3);});
  test('Confirmed resistor edit to 4,7 kΩ is stored as 4700 and the solver uses it; reference stays 3,069 mA',()=>{
    const reference=solveBreadboard(base.breadboard),pr2=base.breadboard.components.find(c=>c.id==='pr2');assert.ok(Math.abs(reference.amps.pr2*1000-3.069)<.001);
    const edited=clone(base);const parsed=parseOhms('4,7','kΩ');edited.breadboard.components.find(c=>c.id==='pr2').value=parsed.value;
    assert.equal(edited.breadboard.components.find(c=>c.id==='pr2').value,4700);
    const r=solveBreadboard(edited.breadboard);assert.ok(Math.abs(r.amps.pr2-(5-1.9)/(4700+10))<1e-9);assert.equal(formatAmps(r.amps.pr2),'0,658 mA');
    const round=readProject(JSON.stringify(edited));assert.equal(round.ok,true);assert.equal(round.project.breadboard.components.find(c=>c.id==='pr2').value,4700);assert.equal(pr2.value,1000);});
  test('Value labels sit in hole-free lanes, away from legs, wires and each other',()=>{
    const part=(id,from,to,kind='resistor')=>({id,kind,from,to,value:1000,closed:true,color:'#0f766e'});
    const sets=[base.breadboard.components,[part('r1','a:2','a:6'),part('r2','a:8','a:12'),part('r3','b:3','b:9'),part('r4','c:14','c:20'),part('r5','top+:3','top+:9'),part('r6','bottom-:4','bottom-:12'),part('r7','j:5','j:9'),part('r8','e:22','f:22','led'),part('r9','a:25','e:25'),part('w1','top+:1','a:2','wire')]];
    for(const components of sets){
      const geo=components.map(c=>({c,a:HOLE_BY_ID.get(c.from),b:HOLE_BY_ID.get(c.to)})),segments=[];
      for(const {c,a,b} of geo){if(c.kind==='wire'){const pts=wirePolyline(a,b);for(let i=0;i<pts.length-1;i++)segments.push([pts[i],pts[i+1]]);}else segments.push([a,b]);}
      const requests=geo.filter(g=>g.c.kind!=='wire').map(({c,a,b})=>({id:c.id,anchor:{x:(a.x+b.x)/2,y:(a.y+b.y)/2},w:labelWidth([c.kind==='resistor'?'4,7 kΩ':'Vf 1,9 V','3,069 mA'])}));
      const placed=placeLabels(requests,segments);assert.equal(placed.length,requests.length);
      for(const p of placed){const rect={x:p.x-p.w/2,y:p.y-p.h/2,w:p.w,h:p.h};assert.equal(p.h,LABEL_HEIGHT);
        for(const h of HOLES)assert.ok(!(rect.x<h.x+4.5&&rect.x+rect.w>h.x-4.5&&rect.y<h.y+4.5&&rect.y+rect.h>h.y-4.5),`${p.id} cubre el orificio ${h.id}`);
        for(const [s,e] of segments)assert.ok(!segmentHitsRect(s,e,rect),`${p.id} cubre una pata o puente`);}
      for(let i=0;i<placed.length;i++)for(let j=i+1;j<placed.length;j++){const a=placed[i],b=placed[j];assert.ok(!(Math.abs(a.x-b.x)<(a.w+b.w)/2&&Math.abs(a.y-b.y)<(a.h+b.h)/2),`${a.id} y ${b.id} se superponen`);}
    }});
  test('Puente H con L293D (Práctica 2): sentido de giro, habilitación, conflictos y validación',()=>{
    const h=newProject('hbridge');assert.equal(readProject(JSON.stringify(h)).ok,true);const board=h.breadboard;
    const motor=r=>r.amps['hb-m'];
    let r=solveBreadboard(board,{});assert.equal(r.fault,null);assert.ok(!motor(r)||Math.abs(motor(r))<1e-9,'sin pulsar el motor no recibe corriente');assert.equal(r.ics['hb-ic'].powered,true);assert.equal(r.ics['hb-ic'].pins[2].level,'off');
    r=solveBreadboard(board,{'hb-s2':true});assert.ok(Math.abs(motor(r)+12/40)<1e-6,'S2: OUT2=VS y OUT1=GND; corriente de OUT2 a OUT1');assert.equal(r.ics['hb-ic'].pins[5].level,'high');assert.equal(r.ics['hb-ic'].pins[2].level,'low');
    r=solveBreadboard(board,{'hb-s1':true});assert.ok(!motor(r)||Math.abs(motor(r))<1e-9,'S1 solo: EN1 sigue bajo y el L293D no excita');
    r=solveBreadboard(board,{'hb-s1':true,'hb-s2':true});assert.ok(Math.abs(motor(r))<1e-9,'las dos entradas altas: ambas salidas en VS, motor parado');assert.equal(r.ics['hb-ic'].pins[2].level,'high');
    assert.ok(solveBreadboard(board,{'hb-s2':true}).warnings.some(w=>w.includes('VSS')),'VSS de 12 V se advierte según la hoja de datos');
    const noGround=clone(board);noGround.components=noGround.components.filter(c=>!c.id.startsWith('hb-g'));r=solveBreadboard(noGround,{'hb-s2':true});assert.ok(!r.ics['hb-ic'].powered);assert.ok(!motor(r)||Math.abs(motor(r))<1e-9,'sin GND no hay salidas');
    const clash=clone(board);clash.components.push({id:'hb-bad',kind:'wire',from:'g:12',to:'top+:2',value:0,closed:true,color:'#000000'});r=solveBreadboard(clash,{'hb-s2':true});assert.match(r.fault,/unida a otra tensión/);
    const bad=clone(h);bad.breadboard.components.find(c=>c.id==='hb-ic').to='e:18';assert.equal(parseProject(bad).ok,false);
    const low=clone(board);low.voltage=3;r=solveBreadboard(low,{'hb-s2':true});assert.ok(!r.ics['hb-ic'].powered);
  });
  test('Transistor NPN 2N2222: corte, región activa (Ic = β·Ib) y saturación',()=>{
    const circuit=(rb,rc,baseToGround=false)=>solveDC([{id:'rb',a:'vcc',b:'b',resistance:rb},{id:'rc',a:'vcc',b:'c',resistance:rc},...baseToGround?[{id:'rg',a:'b',b:'gnd',resistance:1000}]:[]],{vcc:5,gnd:0},[{id:'q',b:'b',c:'c',e:'gnd',beta:100}]);
    let r=circuit(10000,330);assert.equal(r.fault,null);assert.equal(r.bjts.q.region,'saturación');assert.ok(r.bjts.q.vce<.3);assert.ok(Math.abs(r.bjts.q.ic-4.8/332)<2e-4);assert.ok(r.bjts.q.ic<100*r.bjts.q.ib);
    r=circuit(100000,100);assert.equal(r.bjts.q.region,'activa');assert.ok(Math.abs(r.bjts.q.ib-4.3/100010)<1e-7);assert.ok(Math.abs(r.bjts.q.ic-100*r.bjts.q.ib)<1e-9);assert.ok(Math.abs(r.bjts.q.vce-(5-100*r.bjts.q.ib*100))<1e-3);
    r=circuit(10000,330,true);assert.equal(r.bjts.q.region,'corte');assert.ok(r.bjts.q.ic<1e-6);assert.ok(r.bjts.q.vce>4.9);
    r=solveDC([{id:'rb',a:'vcc',b:'b',resistance:1000},{id:'rc',a:'vcc',b:'c',resistance:330}],{vcc:5,gnd:0},[{id:'q',b:'b',c:'c',e:'gnd',beta:100}]);assert.ok(r.bjts.q.ib>3e-3,'sin resistencia de base la corriente de base es alta');
  });
  test('Transistor en la protoboard: base en el orificio del medio, validación y advertencias',()=>{
    assert.equal(bjtBase('e:5','e:7'),'e:6');assert.equal(bjtBase('e:7','e:5'),'e:6');assert.equal(bjtBase('e:5','e:8'),null);assert.equal(bjtBase('e:5','f:7'),null);
    const board={voltage:5,positive:'top+:1',negative:'top-:1',components:[
      {id:'rb',kind:'resistor',from:'top+:3',to:'a:6',value:10000,closed:true,color:'#0f766e'},
      {id:'rc',kind:'resistor',from:'top+:5',to:'a:7',value:330,closed:true,color:'#0f766e'},
      {id:'q',kind:'bjt',from:'b:5',to:'b:7',value:100,closed:true,color:'#222222'},
      {id:'ge',kind:'wire',from:'c:5',to:'top-:5',value:0,closed:true,color:'#334155'}]};
    let r=solveBreadboard(board);assert.equal(r.fault,null);assert.equal(r.bjts.q.region,'saturación');assert.ok(r.bjts.q.ic>.013&&r.bjts.q.ic<.016);
    const noBase=clone(board);noBase.components=noBase.components.filter(c=>c.id!=='rb');r=solveBreadboard(noBase);assert.equal(r.bjts.q.region,'corte');
    const badLayout=clone(base);badLayout.breadboard.components.push({id:'q',kind:'bjt',from:'b:5',to:'b:8',value:100,closed:true,color:'#222222'});assert.equal(parseProject(badLayout).ok,false);
    const good=clone(base);good.breadboard.components.push({id:'q',kind:'bjt',from:'b:15',to:'b:17',value:100,closed:true,color:'#222222'});assert.equal(readProject(JSON.stringify(good)).ok,true);
  });
  test('Práctica 1 (puente H con cuatro 2N2222): S1 y S2 invierten el giro; ambos juntos provocan cortocircuito del puente',()=>{
    const h=newProject('hbridge-bjt');assert.equal(readProject(JSON.stringify(h)).ok,true);const b=h.breadboard,m=r=>r.amps['bj-m'];
    let r=solveBreadboard(b,{});assert.equal(r.fault,null);assert.ok(Math.abs(m(r)??0)<1e-6);for(const q of ['bj-q1','bj-q2','bj-q3','bj-q4'])assert.equal(r.bjts[q].region,'corte');
    r=solveBreadboard(b,{'bj-s1':true});assert.equal(r.fault,null);assert.ok(m(r)>.15&&m(r)<.3,`S1: ${m(r)}`);assert.equal(r.bjts['bj-q4'].region,'saturación');assert.equal(r.bjts['bj-q2'].region,'activa');assert.equal(r.bjts['bj-q1'].region,'corte');assert.equal(r.bjts['bj-q3'].region,'corte');
    r=solveBreadboard(b,{'bj-s2':true});assert.ok(m(r)<-.15&&m(r)>-.3,`S2: ${m(r)}`);assert.equal(r.bjts['bj-q3'].region,'saturación');assert.equal(r.bjts['bj-q1'].region,'activa');
    r=solveBreadboard(b,{'bj-s1':true,'bj-s2':true});assert.equal(r.fault,null);assert.ok(r.warnings.some(w=>w.includes('600 mA')),'ambos pulsadores: el puente conduce de +12 V a tierra');
    for(const kind of ['motor','tank','blank','hbridge','hbridge-bjt'])assert.deepEqual(crowdedHoles(newProject(kind).breadboard.components),{},`${kind}: una pata por orificio`);
    assert.deepEqual(Object.keys(crowdedHoles([{id:'x',kind:'wire',from:'a:5',to:'a:6'},{id:'y',kind:'resistor',from:'a:5',to:'a:9'}])),['a:5']);
    const ic=[{id:'ic',kind:'l293d',from:'f:10',to:'e:17'},{id:'w',kind:'wire',from:'e:12',to:'a:3'}];assert.deepEqual(Object.keys(crowdedHoles(ic)),['e:12']);
  });
  test('Óhmetro: sin energía, resistencia en serie, circuito abierto, cortocircuito y LED (OL a 0,4 V)',()=>{
    const b=clone(base.breadboard),comp=(id,kind,from,to,value=1000)=>({id,kind,from,to,value,closed:true,color:'#0f766e'});
    let r=measureResistance(b,{},'b:5','b:10');assert.ok(Math.abs(r.ohms-1000)<1,'resistencia de 1 kΩ');
    r=measureResistance(b,{},'top+:1','b:10');assert.ok(Math.abs(r.ohms-1000)<1,'puente + resistencia');
    r=measureResistance(b,{},'a:5','a:5');assert.equal(r.short,true);assert.equal(r.ohms,0);
    r=measureResistance(b,{},'a:20','a:25');assert.equal(r.ohms,null);
    r=measureResistance(b,{},'c:10','f:10');assert.equal(r.ohms,null,'un LED no conduce con la tensión de prueba del óhmetro');
    const two=clone(b);two.components.push(comp('x2','resistor','a:12','a:14',2200),comp('x3','resistor','b:14','b:18',3300));r=measureResistance(two,{},'a:12','b:18');assert.ok(Math.abs(r.ohms-5500)<1,`serie: ${r.ohms}`);
    const burnt=measureResistance(b,{},'b:5','b:10',{pr2:'x'});assert.equal(burnt.ohms,null,'una resistencia quemada queda abierta');
  });
  test('Valores reales: tolerancia estable por pieza, ±5 % en resistencias y lectura distinta del valor nominal',()=>{
    const b=clone(base.breadboard);b.realistic=true;const ohms=measureResistance(b,{},'b:5','b:10').ohms;assert.ok(Math.abs(ohms-1000)<=50.5&&ohms!==1000,`1 kΩ real = ${ohms}`);
    assert.equal(measureResistance(b,{},'b:5','b:10').ohms,ohms,'determinista');
    const r=solveBreadboard(b),n=solveBreadboard(base.breadboard);assert.ok(Math.abs(r.amps.pr2-n.amps.pr2)>1e-7&&Math.abs(r.amps.pr2/n.amps.pr2-1)<.1);
    for(const id of ['a','b','c','d','e','f','g','h']){const v=actualValue({id,kind:'resistor',value:1000},true);assert.ok(v>=950-1e-9&&v<=1050+1e-9);const g=actualValue({id,kind:'bjt',value:100},true);assert.ok(g>=70&&g<=130);}
    assert.equal(actualValue({id:'x',kind:'resistor',value:470},false),470);assert.equal(actualValue({id:'x',kind:'wire',value:0},true),0);
    const withFlag=clone(base);withFlag.breadboard.realistic=true;withFlag.breadboard.notes='Conclusión';withFlag.breadboard.log=[{id:'m1',kind:'voltage',a:'top+:1',b:'top-:1',value:5,label:'Fuente',at:'2026-10-15T12:00:00.000Z'},{id:'m2',kind:'resistance',a:'a:20',b:'a:25',value:null,label:'Abierto',at:'2026-10-15T12:01:00.000Z'}];
    const round=readProject(JSON.stringify(withFlag));assert.equal(round.ok,true);assert.deepEqual(round.project.breadboard.log,withFlag.breadboard.log);assert.equal(round.project.breadboard.realistic,true);
    const bad=clone(withFlag);bad.breadboard.log[0].kind='otra';assert.equal(parseProject(bad).ok,false);
  });
  test('Amperímetro en serie, en paralelo y fusible; fallas por sobreesfuerzo y protección de la fuente',()=>{
    const options={failures:true},series=clone(base.breadboard);series.components=series.components.filter(c=>c.id!=='pr1');
    let r=solveBreadboard(series,{},{...options,ammeter:{a:'top+:1',b:'a:5'}});assert.equal(r.fault,null);assert.ok(Math.abs(r.meterCurrent*1000-3.07)<.05,`serie: ${r.meterCurrent}`);assert.deepEqual(r.failures,{});
    const open=solveBreadboard(series,{},{...options});assert.ok(!open.amps.pr2||Math.abs(open.amps.pr2)<1e-9,'sin el amperímetro el circuito está abierto');
    r=solveBreadboard(base.breadboard,{},{...options,ammeter:{a:'b:5',b:'b:10'}});assert.ok(r.failures.pr3,'amperímetro en paralelo con la resistencia: el LED recibe unos 300 mA y se quema');assert.ok(Math.abs(r.amps.pr3??0)<1e-9,'LED quemado = abierto');
    r=solveBreadboard(base.breadboard,{},{...options,ammeter:{a:'top+:2',b:'top-:2'}});assert.ok(r.failures.meter,'amperímetro entre los polos: se funde el fusible');assert.equal(r.fault,null);
    const stays=solveBreadboard(base.breadboard,{},{...options,ammeter:{a:'top+:2',b:'top-:2'},damaged:{meter:'x'}});assert.deepEqual(stays.failures,{});
    const noLimit=clone(base.breadboard);noLimit.components=noLimit.components.map(c=>c.id==='pr2'?{...c,kind:'wire',value:0}:c);
    r=solveBreadboard(noLimit,{},options);assert.match(r.failures.pr3,/sobrecorriente/);
    assert.ok(solveBreadboard(noLimit).warnings.some(w=>w.includes('20 mA')),'sin fallas activadas solo hay advertencia (compatibilidad)');
    const hot=clone(base.breadboard);hot.voltage=12;hot.components.push({id:'hot',kind:'resistor',from:'top+:3',to:'top-:3',value:10,closed:true,color:'#000000'});r=solveBreadboard(hot,{},options);assert.match(r.failures.hot,/sobrecalentamiento/);
    const stall=clone(base.breadboard);stall.voltage=12;stall.components=[{id:'m',kind:'motor',from:'top+:3',to:'top-:3',value:1,closed:true,color:'#000000'}];r=solveBreadboard(stall,{},options);assert.equal(r.tripped,true);assert.match(r.fault,/Protección de la fuente/);
    const bj=newProject('hbridge-bjt').breadboard;r=solveBreadboard(bj,{'bj-s1':true,'bj-s2':true},options);assert.ok(['bj-q1','bj-q2','bj-q3','bj-q4'].some(id=>r.failures[id]),'con S1 y S2 a la vez se queman transistores del puente');
    const single=solveBreadboard(bj,{'bj-s1':true},options);assert.deepEqual(single.failures,{});
    const rev=clone(base.breadboard);rev.components.find(c=>c.id==='pr3').from='f:10';rev.components.find(c=>c.id==='pr3').to='c:10';rev.voltage=12;r=solveBreadboard(rev,{},options);assert.ok(r.failures.pr3,'LED con 12 V inversos se daña');
  });
  test('Transistor PNP (2N2907) y diodo 1N4007: polaridad, regiones y corriente',()=>{
    const pnp=(rb)=>solveDC([{id:'rb',a:'b',b:'gnd',resistance:rb},{id:'rc',a:'c',b:'gnd',resistance:330}],{vcc:5,gnd:0},[{id:'q',b:'b',c:'c',e:'vcc',beta:100,pnp:true}]);
    let r=pnp(10000);assert.equal(r.fault,null);assert.equal(r.bjts.q.region,'saturación');assert.ok(Math.abs(r.bjts.q.ic-4.8/332)<2e-4,`PNP saturado: ${r.bjts.q.ic}`);assert.ok(r.volts.c>4.5,'el colector queda cerca de +5 V');
    r=solveDC([{id:'rb',a:'b',b:'vcc',resistance:10000},{id:'rc',a:'c',b:'gnd',resistance:330}],{vcc:5,gnd:0},[{id:'q',b:'b',c:'c',e:'vcc',beta:100,pnp:true}]);assert.equal(r.bjts.q.region,'corte');assert.ok(r.bjts.q.ic<1e-6);
    r=pnp(100000);assert.equal(r.bjts.q.region,'activa');assert.ok(Math.abs(r.bjts.q.ic-100*r.bjts.q.ib)<1e-9);
    const board={voltage:5,positive:'top+:1',negative:'top-:1',components:[
      {id:'r',kind:'resistor',from:'top+:3',to:'a:6',value:1000,closed:true,color:'#0f766e'},
      {id:'d',kind:'diode',from:'b:6',to:'b:9',value:.7,closed:true,color:'#222222'},
      {id:'g',kind:'wire',from:'c:9',to:'top-:5',value:0,closed:true,color:'#334155'}]};
    r=solveBreadboard(board);assert.ok(Math.abs(r.amps.d-4.3/1001)<1e-6,`diodo directo: ${r.amps.d}`);
    const rev=clone(board);rev.components[1]={...rev.components[1],from:'b:9',to:'b:6'};r=solveBreadboard(rev);assert.ok((r.amps.d??0)<1e-9,'diodo inverso no conduce');
    const heavy=clone(board);heavy.components[0].value=2;heavy.voltage=12;r=solveBreadboard(heavy,{},{failures:true});assert.ok(r.failures.d||r.failures.r,'una sobrecarga quema el diodo o la resistencia');
    const ok=clone(base);ok.breadboard.components.push({id:'q',kind:'bjt',from:'b:15',to:'b:17',value:100,closed:true,color:'#222222',polarity:'pnp'},{id:'dd',kind:'diode',from:'b:20',to:'b:22',value:.7,closed:true,color:'#222222'});{const rr=readProject(JSON.stringify(ok));assert.equal(rr.ok,true,rr.error);}
    const bad=clone(ok);bad.breadboard.components.find(c=>c.id==='dd').polarity='pnp';assert.equal(parseProject(bad).ok,false);
    const v1=clone(base);v1.version=1;const read=readProject(JSON.stringify(v1));assert.equal(read.ok,true);assert.equal(read.project.version,2);const v99=clone(base);v99.version=99;assert.equal(parseProject(v99).ok,false);
  });
  test('Reubicar componentes: extremos libres, transistor y L293D conservan su forma y no pisan otras patas',()=>{
    const parts=newProject('hbridge').breadboard.components;
    let r=relocate(parts,'hb-r1',{to:'a:11'});assert.equal(r.ok,true);assert.equal(r.component.to,'a:11');assert.equal(r.component.from,'top+:4');
    r=relocate(parts,'hb-r1',{to:'c:10'});assert.equal(r.ok,false);assert.match(r.error,/ya tiene una pata/);
    r=relocate(parts,'hb-r1',{to:'zz:9'});assert.equal(r.ok,false);
    r=relocate(parts,'hb-r1',{from:'a:10'});assert.equal(r.ok,false);assert.match(r.error,/diferentes/);
    r=relocate(parts,'hb-ic',{anchor:'f:20'});assert.equal(r.ok,true);assert.equal(r.component.to,'e:27');
    r=relocate(parts,'hb-ic',{anchor:'f:25'});assert.equal(r.ok,false);r=relocate(parts,'hb-ic',{anchor:'e:20'});assert.equal(r.ok,false);
    const bj=newProject('hbridge-bjt').breadboard.components;
    r=relocate(bj,'bj-q2',{anchor:'d:20'});assert.equal(r.ok,true);assert.equal(r.component.from,'d:20');assert.equal(r.component.to,'d:22');
    r=relocate(bj,'bj-q2',{anchor:'top+:20'});assert.equal(r.ok,false);r=relocate(bj,'bj-q2',{from:'e:1',to:'e:5'});assert.equal(r.ok,false);
    r=relocate(bj,'bj-q2',{anchor:'e:6'});assert.equal(r.ok,false,'no se puede pisar a otro transistor');
    r=relocate(bj,'no-existe',{from:'a:1'});assert.equal(r.ok,false);
    const own=relocate(parts,'hb-r1',{from:'top+:5'});assert.equal(own.ok,true,'mover una pata a otro orificio libre del riel');
  });
  test('Cable del multímetro: cuelga con holgura, conserva su longitud, reacciona al mover la punta y se asienta',()=>{
    const o={...CORD_DEFAULTS,penDir:{x:.5,y:-.866}},jack={x:700,y:520},tip={x:200,y:200};
    let chain=createChain(jack,tip,16,o);for(let i=0;i<400;i++)chain=stepChain(chain,jack,tip,o);
    const n=chain.nodes,last=n.length-1,seg=chain.rope/(last-1),speed=()=>Math.max(...n.map(q=>Math.hypot(q.x-q.px,q.y-q.py)));
    assert.deepEqual([n[0].x,n[0].y],[jack.x,jack.y]);assert.deepEqual([n[last].x,n[last].y],[tip.x,tip.y]);
    for(let i=0;i<last-1;i++)assert.ok(Math.abs(Math.hypot(n[i+1].x-n[i].x,n[i+1].y-n[i].y)-seg)/seg<.08,`tramo ${i} conserva su largo`);
    assert.ok(Math.abs(Math.hypot(n[last-1].x-n[last].x,n[last-1].y-n[last].y)-o.penLength)<1,'el mango de la punta es rígido');
    assert.ok(chain.rope>=Math.hypot(jack.x-(tip.x+o.penDir.x*o.penLength),jack.y-(tip.y+o.penDir.y*o.penLength)),'la cuerda es más larga que la distancia: hay holgura');
    const back=n[last-1],chordY=x=>jack.y+(back.y-jack.y)*((x-jack.x)/(back.x-jack.x));assert.ok(Math.max(...n.slice(1,last-1).map(q=>q.y-chordY(q.x)))>8,'el cable cuelga: se comba por debajo de la cuerda recta');assert.ok(speed()<.05,'se asienta en reposo');
    const moved={x:tip.x+150,y:tip.y+60};let peak=0;for(let i=0;i<60;i++){chain=stepChain(chain,jack,moved,o);peak=Math.max(peak,Math.max(...chain.nodes.map(q=>Math.hypot(q.x-q.px,q.y-q.py))));}
    assert.ok(peak>1,'al mover la punta el cable se balancea');for(let i=0;i<600;i++)chain=stepChain(chain,jack,moved,o);assert.ok(Math.max(...chain.nodes.map(q=>Math.hypot(q.x-q.px,q.y-q.py)))<.05,'y vuelve a asentarse');
    assert.deepEqual([chain.nodes[last].x,chain.nodes[last].y],[moved.x,moved.y]);
    const far={x:tip.x-400,y:tip.y};for(let i=0;i<300;i++)chain=stepChain(chain,jack,far,o);assert.ok(Math.abs(ropeTarget(jack,far,o)-chain.rope)<2,'la longitud se ajusta sin estirarse de golpe');
  });
  const output={tests,passed:tests.filter(t=>t.status==='PASS').length,total:tests.length,elapsedMs:Math.round(performance.now()-started),scope:'Own local educational models; no physical hardware, manufacturer PLC or UNIFCAD PRO validation.'};
  const outputDirectory=path.join(root,'qa/laboratory-results');await fs.mkdir(outputDirectory,{recursive:true});await fs.writeFile(path.join(outputDirectory,'models.json'),JSON.stringify(output,null,2));
  for(const t of tests)console.log(`${t.status} ${t.name}${t.error?' — '+t.error:''}`);console.log(`${output.passed}/${output.total} passed · ${output.elapsedMs} ms`);if(output.passed!==output.total)process.exitCode=1;
}finally{
  const target=path.resolve(directory),parent=path.resolve(os.tmpdir());if(path.dirname(target)!==parent||!path.basename(target).startsWith('panellab-laboratory-check-'))throw new Error('Unexpected temporary path; cleanup refused.');await fs.rm(target,{recursive:true,force:true});
}
