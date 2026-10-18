/* Mapa de bornes de la lección «Inversión de giro»: define las posiciones, escribe src/data/leccionInversion.layout.json
 * (que usa la lección para marcar cada paso) y dibuja public/diagrams/leccion-inversion-giro.png con Playwright.
 * Uso: node scripts/build-leccion-inversion.mjs */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const W=1200,H=1120;
const COLORS={red:'#bd142a',blue:'#17509a',black:'#24272c',gray:'#6a747c',white:'#f5f1e7',green:'#00865b'};
const phase=['blue','black','red'];
const t=(id,x,y,color,side='r')=>({id,x,y,color,side});
const modules=[
 {id:'FUENTE',title:'ALIMENTACIÓN',x:40,y:40,w:360,h:170,terminals:[t('R',90,150,'blue','b'),t('S',150,150,'black','b'),t('T',210,150,'red','b'),t('N',280,150,'white','b'),t('F',345,150,'red','b'),t('TP',350,95,'green','l')]},
 {id:'BOTONERAS',title:'BOTONERAS Y PILOTOS',x:440,y:40,w:700,h:260,terminals:[
  ...[1,2,3,4].map((n,i)=>t(`PILOTO_${n}`,500+i*150,105,'red','r')),
  ...[['S1',540],['S2',780],['S3',1020]].flatMap(([s,cx])=>[t(`${s}:1`,cx-25,200,'red','l'),t(`${s}:2`,cx-25,255,'red','l'),t(`${s}:3`,cx+25,200,'white','r'),t(`${s}:4`,cx+25,255,'white','r')]),
  t('N',1100,125,'white','b'),t('TP_DER',1100,230,'green','b')]},
 {id:'CONTACTOR_TERMICO',title:'KM1 · CONTACTOR + RELÉ TÉRMICO',x:40,y:350,w:520,h:365,terminals:[
  t('A2',90,410,'red','r'),t('A1',90,465,'white','r'),...['L1','L2','L3'].map((id,i)=>t(id,250+i*60,410,phase[i],'b')),
  t('71',100,540,'gray','l'),t('72',170,540,'gray','r'),t('81',100,600,'gray','l'),t('82',170,600,'gray','r'),t('95',100,660,'gray','l'),t('96',170,660,'gray','r'),
  t('13',450,470,'blue','l'),t('14',520,470,'blue','b'),t('97',450,550,'blue','l'),t('98',520,550,'blue','b'),
  ...['T1','T2','T3'].map((id,i)=>t(id,250+i*60,650,phase[i],'b')),t('TP_DER',520,650,'green','b')]},
 {id:'CONTACTOR_TRIFASICO',title:'KM2 · CONTACTOR TRIFÁSICO',x:600,y:350,w:540,h:365,terminals:[
  t('A2',650,410,'red','r'),t('A1',650,465,'white','r'),...['L1','L2','L3'].map((id,i)=>t(id,790+i*70,410,phase[i],'b')),
  t('71',660,540,'gray','l'),t('72',730,540,'gray','r'),t('81',660,600,'gray','l'),t('82',730,600,'gray','r'),
  t('13',1010,470,'blue','l'),t('14',1080,470,'blue','b'),
  ...['T1','T2','T3'].map((id,i)=>t(id,790+i*70,650,phase[i],'b')),t('TP_IZQ',660,655,'green','r'),t('TP_DER',1080,650,'green','b')]},
 {id:'BORNERA_MOTOR',title:'MOTOR TRIFÁSICO',x:40,y:770,w:620,h:300,terminals:[
  t('U1',400,850,'blue','b'),t('V1',470,850,'black','b'),t('W1',540,850,'red','b'),t('W2',400,960,'red','b'),t('U2',470,960,'blue','b'),t('V2',540,960,'black','b'),t('TP',330,905,'green','l')]}
];
fs.writeFileSync(path.join(root,'src/data/leccionInversion.layout.json'),JSON.stringify({width:W,height:H,modules:modules.map(m=>({id:m.id,terminals:m.terminals.map(({id,x,y})=>({id,x,y}))}))},null,1)+'\n');
const label=id=>id.match(/^S[123]:([1-4])$/)?.[1]??id.replace('PILOTO_','P').replace(/^TP_.+$/,'TP');
/** Un mapa por lección: mismos bornes, distinta leyenda; los módulos que la lección no usa se atenúan. */
const variants=[
 {file:'leccion-inversion-giro.png',title:'Mapa de bornes · inversión de giro',dim:[],legend:['KM1 = contactor + relé térmico (giro directo)','KM2 = contactor trifásico (giro inverso)','S1 = marcha 1 (verde izquierdo)','S2 = paro (rojo central)','S3 = marcha 2 (verde derecho)']},
 {file:'leccion-marcha-paro.png',title:'Mapa de bornes · marcha y paro',dim:['CONTACTOR_TRIFASICO'],legend:['KM1 = contactor + relé térmico','(el único que se usa; KM2 atenuado)','S1 = marcha (verde izquierdo)','S2 = paro (rojo central)','P1 = KM1 activo · P2 = reposo','P3 = térmico disparado']}
];
const drawing=v=>`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Arial, Helvetica, sans-serif">
<rect width="${W}" height="${H}" fill="#f4f6f7"/>
${modules.map(m=>`<g opacity="${v.dim.includes(m.id)?.38:1}"><rect x="${m.x}" y="${m.y}" width="${m.w}" height="${m.h}" rx="12" fill="#ffffff" stroke="#9aa6ad" stroke-width="3"/><text x="${m.x+m.w/2}" y="${m.y+34}" text-anchor="middle" font-size="22" font-weight="700" fill="#33424b">${m.title}</text>
${m.terminals.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="17" fill="#d6dce0" stroke="#7e8b93" stroke-width="2"/><circle cx="${p.x}" cy="${p.y}" r="12" fill="${COLORS[p.color]}" stroke="#22262c" stroke-width="1.5"/><circle cx="${p.x}" cy="${p.y}" r="5" fill="#151a20"/><text x="${p.side==='r'?p.x+25:p.side==='l'?p.x-25:p.x}" y="${p.side==='b'?p.y+40:p.side==='a'?p.y-26:p.y+7}" text-anchor="${p.side==='r'?'start':p.side==='l'?'end':'middle'}" font-size="19" font-weight="700" fill="#1d2a31">${label(p.id)}</text>`).join('')}</g>`).join('')}
<g font-size="21" fill="#33424b"><text x="700" y="820" font-weight="700" font-size="26">${v.title}</text>
${v.legend.map((line,i)=>`<text x="700" y="${865+i*35}">${line}</text>`).join('')}
<text x="700" y="1060" font-size="17" fill="#6c7b84">Ubicación de bornes: la guía resalta cada cable.</text></g></svg>`;
const {chromium}=await import('file:///C:/Users/HUMANO%20LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs').catch(()=>import('playwright'));
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:W,height:H}});
 for(const v of variants){
  await page.setContent(`<!doctype html><meta charset="utf-8"><body style="margin:0">${drawing(v)}</body>`);
  await page.screenshot({path:path.join(root,'public/diagrams',v.file),clip:{x:0,y:0,width:W,height:H}});
 }
}finally{await browser.close()}
console.log('Mapas de bornes y diseño de las lecciones generados.');
