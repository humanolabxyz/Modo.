// Diagnóstico sin capturar ni silenciar rechazos de las transiciones.
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('./lib/playwright.cjs');
const out=process.env.AGRO_QA_OUT; if(!out)throw Error('Define AGRO_QA_OUT');
const urls=(process.env.AGRO_DIAG_URLS||'http://127.0.0.1:4386').split(',');
const action=process.env.AGRO_DIAG_ACTION||'normal';
(async()=>{
  fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const report=[];
  try {
    for(const base of urls)for(const wait of [false,true])for(let run=0;run<4;run++) {
      const c=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});
      const row={base,wait,run,action,events:[],errors:[]};report.push(row);
      await c.exposeBinding('transitionDiagnostic',(_,event)=>row.events.push(event));
      await c.addInitScript(action=>{
        localStorage.setItem('modo-tutoriales-bienvenida-v1','seen');sessionStorage.setItem('modo-opened-v2','1');
        const labels=new WeakMap();
        const emit=event=>window.transitionDiagnostic({url:location.href,time:performance.now(),...event});
        for(const name of ['pagereveal','pageswap']) addEventListener(name,e=>{
          const t=e.viewTransition;emit({event:name,hasTransition:!!t,visibility:document.visibilityState});
          if(t)for(const key of ['ready','finished','updateCallbackDone']){const promise=t[key];if(promise)labels.set(promise,name+'.'+key);}
          if(t&&action==='skip'&&name==='pagereveal'){t.skipTransition();emit({event:'explicit-skip'});}
        });
        addEventListener('unhandledrejection',e=>emit({event:'unhandledrejection',promise:labels.get(e.promise)||'unknown',reason:{name:e.reason?.name,message:e.reason?.message,stack:e.reason?.stack}}));
        addEventListener('rejectionhandled',e=>emit({event:'rejectionhandled',promise:labels.get(e.promise)||'unknown'}));
      },action);
      const p=await c.newPage();
      p.on('pageerror',e=>{row.errors.push({kind:'pageerror',url:p.url(),name:e.name,message:e.message,stack:e.stack});});
      p.on('console',m=>{if(m.type()==='error')row.errors.push({kind:'console',url:p.url(),message:m.text(),location:m.location()});});
      await p.goto(base+'/');await p.locator('[data-module=panel]:not(:disabled)').waitFor();await p.waitForTimeout(2200);
      await p.locator('[data-module=agro]').focus();await p.keyboard.press('Enter');
      if(action==='resize'){await p.waitForURL(base+'/agro/');await p.setViewportSize({width:390,height:844});}
      await p.getByTestId('agro-app').waitFor();
      row.arrival=await p.evaluate(()=>({view:document.querySelector('[data-testid=agro-app]').dataset.view,motion:document.documentElement.dataset.motion,visibility:document.visibilityState}));
      if(action==='resize') {
        await p.getByTestId('agro-new').click();await p.getByTestId('agro-wizard').waitFor();
        row.interaction={wizardOpened:true};
        await p.getByRole('button',{name:'Volver a Agro',exact:true}).click();
        await p.locator('[data-view=lobby]').waitFor();row.interaction.returnedToLobby=true;
      }
      if(wait){await p.waitForFunction(()=>!document.documentElement.dataset.motion);await p.waitForTimeout(500);}
      await c.close();console.log(JSON.stringify({base,wait,run,errors:row.errors,events:row.events}));
    }
  } finally {fs.writeFileSync(path.join(out,'diagnostico.json'),JSON.stringify(report,null,2));await browser.close();}
  if(report.some(row=>row.errors.length))throw Error('Se registraron errores; revisar diagnostico.json');
})().catch(e=>{console.error(e);process.exitCode=1;});
