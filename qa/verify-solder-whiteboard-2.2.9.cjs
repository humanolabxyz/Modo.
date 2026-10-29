const {chromium,webkit}=require('C:/Users/HUMANO LAB/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'),assert=require('assert/strict'),fs=require('fs');
const base=process.env.PANELLAB_URL||'http://127.0.0.1:4327/';fs.mkdirSync('qa/solder-2.2.9',{recursive:true});
(async()=>{for(const engine of [chromium,webkit]){const b=await engine.launch();for(const width of [393,820,1440]){
 const c=await b.newContext({viewport:{width,height:1000},hasTouch:true,isMobile:width<1000,reducedMotion:'reduce',serviceWorkers:'block'}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await c.addInitScript(()=>localStorage.setItem('modo-tutoriales-bienvenida-v1','seen'));await p.goto(base+'laboratorio?tool=soldering');await p.locator('.workshop-scene').waitFor();await p.waitForFunction(()=>!document.getElementById('modo-splash')&&!document.documentElement.classList.contains('modo-opening-on'));
 assert.equal(await p.locator('#solder-mat').count(),0);
 const d=engine===chromium?await c.newCDPSession(p):null;
 const drag=async(a,z)=>{if(d){await d.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...a,id:1}]});for(let i=1;i<=18;i++){await d.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:a.x+(z.x-a.x)*i/18,y:a.y+(z.y-a.y)*i/18,id:1}]});await p.waitForTimeout(12);}await d.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}else{await p.mouse.move(a.x,a.y);await p.mouse.down();await p.mouse.move(z.x,z.y,{steps:18});await p.mouse.up();}await p.waitForTimeout(100);};
 const region=p.locator('.tool-soldering .lab-pan:visible'),at=await region.boundingBox();
 // Pan to a part of the whiteboard beyond the old 1000 x 700 SVG.
 await p.getByRole('button',{name:'Mover vista de soldadura',exact:true}).tap();const a={x:at.x+at.width*.75,y:at.y+at.height*.5};for(let i=0;i<4;i++)await drag(a,{x:a.x-at.width*.6,y:a.y});
 await p.getByRole('button',{name:'Manipular piezas',exact:true}).tap();await p.getByRole('button',{name:'Herramientas y materiales de soldadura',exact:true}).tap();const card=await p.getByRole('button',{name:'Arrastrar pelacables a la mesa',exact:true}).boundingBox(),z={x:width*.72,y:Math.min(600,at.y+at.height*.45)};
 const world=await p.locator('.workshop-scene').evaluate((el,z)=>{const q=new DOMPoint(z.x,z.y).matrixTransform(el.getScreenCTM().inverse());return {x:q.x,y:q.y};},z);assert.ok(world.x>1000,JSON.stringify(world));
 await drag({x:card.x+card.width/2,y:card.y+40},z);const tool=p.locator('[data-shelf-tool="stripper"]');await tool.waitFor();assert.equal(await p.getByRole('dialog',{name:'Herramientas',exact:true}).count(),0);
 const t=await tool.getAttribute('transform');assert.ok(Number(t.match(/-?\d+(?:\.\d+)?/g)[0])>900,t);
 const q=await tool.evaluate(el=>{const p=new DOMPoint(55,-12).matrixTransform(el.getScreenCTM());return {x:p.x,y:p.y};});assert.ok(await p.evaluate(q=>!!document.elementFromPoint(q.x,q.y)?.closest('[data-shelf-tool="stripper"]'),q));
 await drag(q,{x:q.x-50,y:q.y+25});assert.notEqual(await tool.getAttribute('transform'),t);await p.screenshot({path:`qa/solder-2.2.9/${engine.name()}-${width}.png`});assert.deepEqual(errors,[]);console.log('PASS',engine.name(),width,'place and manipulate beyond original SVG on whiteboard');await c.close();
 }await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
