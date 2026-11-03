// Shared user navigation for the native arm window. Legacy test names map to clearer labels.
exports.armUi=(page,width)=>{
 const panel=page.locator('.rb-window-arm'),press=l=>width<600?l.tap():l.click();
 const names={'Habilitar servos':'Encender motores','Deshabilitar servos':'Apagar motores','Enseñar punto':'Guardar posición actual','Preparar ciclo completo':'Generar recorrido de ejemplo','Reproducir puntos':'Ejecutar mi programa'};
 const button=name=>panel.getByRole('button',{name:names[name]??name,exact:true,includeHidden:true});
 const tab=async name=>{
  if(name==='Práctica'){
   await press(panel.getByRole('tab',{name:'Empezar',exact:true}));
   const detail=panel.locator('.rb-arm-manual-practice');if(!await detail.evaluate(el=>el.open))await press(detail.locator('summary'));
  }else if(name==='Articulaciones'||name==='Cartesiano'){
   await press(panel.getByRole('tab',{name:'Mover a mano',exact:true}));await press(button(name==='Articulaciones'?'Girar articulaciones':'Desplazar pinza'));
  }else await press(panel.getByRole('tab',{name,exact:true}));
 };
 return {panel,press,button,tab};
};
