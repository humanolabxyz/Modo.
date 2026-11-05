import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const inline=path=>fs.readFileSync(path,'utf8').match(/<script is:inline>([\s\S]*?)<\/script>/)[1];
const head=inline('src/components/motion/MotionHead.astro');
const splashScript=[...fs.readFileSync('src/components/motion/ModoSplash.astro','utf8').matchAll(/<script is:inline>([\s\S]*?)<\/script>/g)].map(m=>m[1]).find(s=>s.includes('function joinSound()'));
const checks=[];
const pass=message=>{checks.push(message);console.log('PASS',message)};

function boot({session=new Map(),referrer='',navigation='navigate',hidden=false,reduce=false,mode='completo',blockedStorage=false}={}){
 const classes=new Set(),listeners=new Map(),timers=[];
 const root={dataset:{},classList:{add:(...values)=>values.forEach(v=>classes.add(v)),remove:(...values)=>values.forEach(v=>classes.delete(v)),contains:v=>classes.has(v),toggle:(v,on)=>on?classes.add(v):classes.delete(v)}};
 let removed=0;
 const splash={remove:()=>{removed++},addEventListener:(name,fn)=>listeners.set('splash:'+name,new Set([fn]))};
 const storage=values=>({getItem:key=>{if(blockedStorage)throw Error('blocked');return values.get(key)??null},setItem:(key,value)=>{if(blockedStorage)throw Error('blocked');values.set(key,value)}});
 const document={documentElement:root,visibilityState:hidden?'hidden':'visible',referrer,getElementById:()=>removed?null:splash,addEventListener:(name,fn)=>{if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(fn)},removeEventListener:(name,fn)=>listeners.get(name)?.delete(fn)};
 const context={document,location:new URL('http://localhost/'),performance:{getEntriesByType:()=>[{type:navigation}]},sessionStorage:storage(session),localStorage:storage(new Map([['modo-movimiento',mode]])),matchMedia:()=>({matches:reduce}),URL,URLSearchParams,addEventListener:()=>{},setTimeout:fn=>timers.push(fn),clearTimeout:()=>{}};
 vm.runInNewContext(head,context);
 vm.runInNewContext(splashScript,context);
 return {classes,root,get removed(){return removed},finish:()=>timers.forEach(fn=>fn()),visibility:value=>{document.visibilityState=value;for(const fn of [...listeners.get('visibilitychange')??[]])fn()}};
}

const session=new Map();
const opening=boot({session});
assert.ok(opening.classes.has('modo-splash-on'));opening.finish();
for(let i=0;i<3;i++){opening.visibility('hidden');opening.visibility('visible')}
assert.equal(opening.removed,1);assert.ok(!opening.classes.has('modo-splash-on'));
pass('Abrir reproduce la intro una vez; tres ciclos de reposo no la reinician');

assert.ok(boot({session}).classes.has('modo-splash-on'));
pass('Una nueva apertura directa vuelve a reproducirla aunque la pestaña ya se usó');
assert.ok(boot({session,referrer:'http://localhost/laboratorio',navigation:'reload'}).classes.has('modo-splash-on'));
pass('Recargar cuenta como nueva apertura');
assert.ok(!boot({session,referrer:'http://localhost/estudio'}).classes.has('modo-splash-on'));
pass('Navegar entre módulos conserva la sesión sin repetir intro');
assert.ok(!boot({navigation:'back_forward'}).classes.has('modo-splash-on'));
pass('Volver desde el historial no repite intro');

const background=boot({hidden:true});
assert.ok(!background.classes.has('modo-splash-on'));background.visibility('visible');assert.ok(background.classes.has('modo-splash-on'));
background.visibility('hidden');background.visibility('visible');assert.equal(background.removed,1);
pass('Una apertura en segundo plano espera la primera vista; después no se reinicia');
assert.ok(!boot({reduce:true,mode:'sistema'}).classes.has('modo-splash-on'));
assert.ok(boot({reduce:true,mode:'completo'}).classes.has('modo-splash-on'));
assert.ok(!boot({mode:'reducido'}).classes.has('modo-splash-on'));
pass('Sistema, movimiento completo y reducido conservan sus preferencias');
assert.ok(!boot({blockedStorage:true,referrer:'http://localhost/laboratorio'}).classes.has('modo-splash-on'));
pass('Sin almacenamiento, navegar entre módulos tampoco repite intro');

fs.mkdirSync('qa/diagrama-ayuda',{recursive:true});
fs.writeFileSync('qa/diagrama-ayuda/motion-lifecycle.json',JSON.stringify({result:'PASS',checks},null,2));
