import {useEffect, useRef} from 'react';
import {renderMinimap} from '../terrain/minimap.ts';
import type {Heightfield} from '../terrain/heightfield.ts';
import type {CameraReport} from '../scene/AgroCanvas.tsx';
import type {Connection, Entity} from '../model/types.ts';
import {entityFootprint, portWorld} from '../world/placement.ts';
import {itemById} from '../catalog/items.ts';

const SIZE = 160;

/** Minimapa del relieve con la posición y la dirección de la cámara. Pulsar lleva la cámara a ese punto. */
export function Minimap({hf, revision, camera, entities, connections, onGoto}: {hf: Heightfield; revision: number; camera: CameraReport | null; entities: readonly Entity[]; connections: readonly Connection[]; onGoto(x: number, z: number): void}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const base = useRef<HTMLCanvasElement | null>(null);
  const latestPaint = useRef<() => void>(() => {});

  const paint = () => {
    const c = canvas.current, b = base.current; if (!c || !b) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, SIZE, SIZE); ctx.drawImage(b, 0, 0);
    const pixel=(x:number,z:number):[number,number]=>[(x-hf.originX)/hf.sizeX*SIZE,(z-hf.originZ)/hf.sizeZ*SIZE];
    const byId=new Map(entities.map(e=>[e.id,e]));
    for(const link of connections) {
      const a=byId.get(link.a.entityId), b=byId.get(link.b.entityId), ap=a?.ports.find(p=>p.id===link.a.portId), bp=b?.ports.find(p=>p.id===link.b.portId);
      if(!a||!b||!ap||!bp)continue;
      const start=portWorld(a,ap), end=portWorld(b,bp), points=[[start.x,start.z],...(link.route??[]).map(p=>[p[0],p[2]]),[end.x,end.z]];
      ctx.beginPath();points.forEach(([x,z],i)=>{const [px,py]=pixel(x,z);if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py);});
      ctx.strokeStyle=link.kind==='hydraulic'?'#71c6f1':'#f2db78';ctx.lineWidth=1;ctx.stroke();
    }
    for(const e of entities) {
      if(!itemById(e.type))continue;
      const polygon=entityFootprint(e);ctx.beginPath();polygon.forEach(([x,z],i)=>{const [px,py]=pixel(x,z);if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py);});ctx.closePath();
      ctx.fillStyle=e.type==='parcela'?'#b3c779':'#f6eee0';ctx.strokeStyle=e.type==='parcela'?'#416a34':'#554438';ctx.lineWidth=1;ctx.fill();ctx.stroke();
      if(e.type!=='parcela'){const [px,py]=pixel(e.pose.position[0],e.pose.position[2]);ctx.fillStyle='#fff7e5';ctx.strokeStyle='#554438';ctx.beginPath();ctx.arc(px,py,2,0,Math.PI*2);ctx.fill();ctx.stroke();}
    }
    if (camera) {
      const px = ((camera.x - hf.originX) / hf.sizeX) * SIZE, py = ((camera.z - hf.originZ) / hf.sizeZ) * SIZE;
      ctx.save(); ctx.translate(Math.max(0, Math.min(SIZE, px)), Math.max(0, Math.min(SIZE, py))); ctx.rotate(Math.PI - camera.yaw);
      ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(6, 6); ctx.lineTo(0, 3); ctx.lineTo(-6, 6); ctx.closePath();
      ctx.fillStyle = '#1b7a3d'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); ctx.fill(); ctx.restore();
    }
  };
  latestPaint.current = paint;

  useEffect(() => { // el relieve se redibuja cuando cambia el terreno (con un pequeño retardo para no repetirlo en cada marca de un trazo)
    const t = setTimeout(() => {
      const off = document.createElement('canvas'); off.width = SIZE; off.height = SIZE;
      const pixels = renderMinimap(hf, SIZE);
      const ctx=off.getContext('2d');
      ctx?.putImageData(new ImageData(new Uint8ClampedArray(pixels), SIZE, SIZE), 0, 0);
      if(ctx) for(const road of [...(hf.baseRoads??[]),...(hf.surfaceEdits??[]).filter(e=>e.kind==='road')]) {
        if(!road.points?.length)continue;
        ctx.beginPath(); road.points.forEach(([x,z],i)=>{const px=(x-hf.originX)/hf.sizeX*SIZE,py=(z-hf.originZ)/hf.sizeZ*SIZE;if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py);});
        ctx.strokeStyle='#e3c99d';ctx.lineWidth=Math.max(1.5,(road.width??6)/hf.sizeX*SIZE);ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();
      }
      base.current = off; latestPaint.current();
    }, base.current ? 180 : 0);
    return () => clearTimeout(t);
  }, [hf, revision]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(paint, [camera, entities, connections]); // eslint-disable-line react-hooks/exhaustive-deps

  return <canvas ref={canvas} className="agro-minimap-canvas" width={SIZE} height={SIZE} data-testid="agro-minimap" role="img" aria-label="Minimapa del terreno. Pulsa para mover la cámara."
    onPointerDown={e => { const r = e.currentTarget.getBoundingClientRect(); onGoto(hf.originX + ((e.clientX - r.left) / r.width) * hf.sizeX, hf.originZ + ((e.clientY - r.top) / r.height) * hf.sizeZ); }} />;
}
