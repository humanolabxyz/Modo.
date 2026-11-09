import {useEffect, useRef} from 'react';
import {renderMinimap} from '../terrain/minimap.ts';
import type {Heightfield} from '../terrain/heightfield.ts';
import type {CameraReport} from '../scene/AgroCanvas.tsx';

const SIZE = 160;

/** Minimapa del relieve con la posición y la dirección de la cámara. Pulsar lleva la cámara a ese punto. */
export function Minimap({hf, revision, camera, onGoto}: {hf: Heightfield; revision: number; camera: CameraReport | null; onGoto(x: number, z: number): void}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const base = useRef<HTMLCanvasElement | null>(null);

  const paint = () => {
    const c = canvas.current, b = base.current; if (!c || !b) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, SIZE, SIZE); ctx.drawImage(b, 0, 0);
    if (camera) {
      const px = ((camera.x - hf.originX) / hf.sizeX) * SIZE, py = ((camera.z - hf.originZ) / hf.sizeZ) * SIZE;
      ctx.save(); ctx.translate(Math.max(0, Math.min(SIZE, px)), Math.max(0, Math.min(SIZE, py))); ctx.rotate(Math.PI - camera.yaw);
      ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(6, 6); ctx.lineTo(0, 3); ctx.lineTo(-6, 6); ctx.closePath();
      ctx.fillStyle = '#1b7a3d'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); ctx.fill(); ctx.restore();
    }
  };

  useEffect(() => { // el relieve se redibuja cuando cambia el terreno (con un pequeño retardo para no repetirlo en cada marca de un trazo)
    const t = setTimeout(() => {
      const off = document.createElement('canvas'); off.width = SIZE; off.height = SIZE;
      const pixels = renderMinimap(hf, SIZE);
      off.getContext('2d')?.putImageData(new ImageData(new Uint8ClampedArray(pixels), SIZE, SIZE), 0, 0);
      base.current = off; paint();
    }, base.current ? 180 : 0);
    return () => clearTimeout(t);
  }, [hf, revision]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(paint, [camera]); // eslint-disable-line react-hooks/exhaustive-deps

  return <canvas ref={canvas} className="agro-minimap-canvas" width={SIZE} height={SIZE} data-testid="agro-minimap" role="img" aria-label="Minimapa del terreno. Pulsa para mover la cámara."
    onPointerDown={e => { const r = e.currentTarget.getBoundingClientRect(); onGoto(hf.originX + ((e.clientX - r.left) / r.width) * hf.sizeX, hf.originZ + ((e.clientY - r.top) / r.height) * hf.sizeZ); }} />;
}
