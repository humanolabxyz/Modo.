// La imagen de referencia y el esquema interactivo se generan desde los mismos datos.
import {build} from 'esbuild';
import {writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const file='qa/star-lessons/render.cjs';
await build({stdin:{loader:'tsx',resolveDir:process.cwd(),contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {CadeShape} from './src/components/CadeSheet';import drawings from './src/data/cadeStarLessons.json';
export function render(key){const d=drawings[key],v=d.views.all;return renderToStaticMarkup(<svg xmlns="http://www.w3.org/2000/svg" viewBox={[v.x,v.y,v.w,v.h].join(' ')} width={1620} height={v.h*2} color="#3c4650"><rect x={v.x} y={v.y} width={v.w} height={v.h} fill="white"/>{d.objects.map(o=>o.type===4000?<line key={o.id} x1={o.x} y1={o.y} x2={o.x2} y2={o.y2} stroke={o.color} strokeWidth={.55} strokeDasharray={o.dashed?'1.6 1.1':undefined}/>:o.type===4001?<circle key={o.id} cx={o.x} cy={o.y} r={.75} fill="#44505a"/>:<CadeShape key={o.id} o={o}/>)}</svg>);}`},bundle:true,platform:'node',format:'cjs',outfile:file,logLevel:'silent'});
const {render}=await import(pathToFileURL(process.cwd()+'/'+file));
const {chromium}=await import('file:///C:/Users/HUMANO%20LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const browser=await chromium.launch();
try{const page=await browser.newPage({viewport:{width:1620,height:688}});for(const id of ['estrellaManual','estrellaTimer']){const svg=render(id);writeFileSync(`qa/star-lessons/${id}.svg`,svg);await page.setContent(`<body style="margin:0">${svg}</body>`);await page.locator('svg').screenshot({path:`public/diagrams/leccion-${id==='estrellaManual'?'estrella-manual':'estrella-temporizador'}.png`})}}finally{await browser.close()}
console.log('Referencias PNG de las dos lecciones generadas.');
