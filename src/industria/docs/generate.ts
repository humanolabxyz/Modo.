// Documentación técnica generada del modelo (fase 8). Puro: se prueba en Node.
// Listas de materiales, de cables, de E/S del PLC, programa en texto, redes y avisos. Todo sale del proyecto (mismos ids): no hay nada tecleado aparte.
// Honestidad: el catálogo es genérico, así que no hay referencias de fabricante, y los estados son «Genérico · no verificado» salvo piezas con fuente.
import {shapeOf, STATUS_LABEL} from '../build/shapes.ts';
import type {IndustryProject, Rung} from '../model/types.ts';
import {checkProgram, programOf, tagsOf, PLC_DEFINITION, terminalDirection} from '../plc/program.ts';
import {evaluate} from '../wiring/engine.ts';

export type BomRow = {definitionId: string; name: string; family: string; status: string; quantity: number; labels: string[]};
export type WireRow = {n: string; from: string; to: string; kind: string; status: string; net: string; label: string; notes: string};
export type IoRow = {plc: string; terminal: string; direction: 'Entrada' | 'Salida'; tag: string; connectedTo: string};
export type ProgramDoc = {plc: string; lines: string[]};
export type Documentation = {
  name: string; date: string; mode: string;
  bom: BomRow[]; wires: WireRow[]; io: IoRow[]; program: ProgramDoc[]; nets: {id: string; terminals: string[]}[]; issues: string[];
  genericCount: number; disclaimer: string; purpose: string; steps: string[];
};

export const DISCLAIMER = 'Documentación generada automáticamente a partir del modelo de modo. Industria. Las piezas del catálogo son genéricas y no están verificadas: no incluyen referencias de fabricante ni valores eléctricos. No sustituye documentación de ingeniería.';
const KIND_TEXT: Record<string, string> = {power: 'Fuerza', control: 'Mando', signal: 'Señal', earth: 'Tierra', pipe: 'Proceso'};
const STATUS_TEXT: Record<string, string> = {valid: 'Válido', invalid: 'Inválido', unverified: 'Sin verificar'};

const coilText = (r: Rung) => ({set: '(S)', reset: '(R)', out: '( )', ton: `[TON ${r.coil.preset ?? '?'} ms]`, ctu: `[CTU ${r.coil.preset ?? '?'}]`, ctr: '[RES contador]'})[r.coil.mode] + ` ${r.coil.tag}`;
const contactText = (c: {tag: string; nc?: boolean}) => (c.nc ? `/${c.tag}` : c.tag);

export function buildDocumentation(p: IndustryProject, date: string): Documentation {
  const label = (id: string) => p.entities.find(e => e.id === id)?.label ?? id;
  const ev = evaluate(p);
  const bomMap = new Map<string, BomRow>();
  for (const e of p.entities) {
    const s = shapeOf(e.definitionId), row = bomMap.get(e.definitionId) ?? {definitionId: e.definitionId, name: s.name, family: s.family, status: STATUS_LABEL[s.status], quantity: 0, labels: []};
    row.quantity++; row.labels.push(e.label); bomMap.set(e.definitionId, row);
  }
  const bom = [...bomMap.values()].sort((a, b) => a.family.localeCompare(b.family, 'es') || a.name.localeCompare(b.name, 'es'));

  const netOfConn = new Map<string, string>();
  for (const n of ev.nets) for (const c of n.connections) netOfConn.set(c, n.id);
  const wires: WireRow[] = p.connections.map((c, i) => ({
    n: `W${String(i + 1).padStart(3, '0')}`, from: `${label(c.a.entityId)}.${c.a.terminalId}`, to: `${label(c.b.entityId)}.${c.b.terminalId}`, kind: KIND_TEXT[c.kind] ?? c.kind,
    status: STATUS_TEXT[ev.status[c.id] ?? c.status] ?? c.status, net: netOfConn.get(c.id) ?? '', label: c.label ?? '', notes: (ev.reasons[c.id] ?? []).join(' '),
  }));

  const io: IoRow[] = [], program: ProgramDoc[] = [], issues: string[] = ev.issues.map(i => i.message);
  for (const e of p.entities.filter(x => x.definitionId === PLC_DEFINITION)) {
    const terminals = (shapeOf(e.definitionId).terminals ?? []).filter(t => terminalDirection(t.id)), tags = tagsOf(p, e.id);
    for (const t of terminals) {
      const other = p.connections.filter(c => (c.a.entityId === e.id && c.a.terminalId === t.id) || (c.b.entityId === e.id && c.b.terminalId === t.id))
        .map(c => { const o = c.a.entityId === e.id && c.a.terminalId === t.id ? c.b : c.a; return `${label(o.entityId)}.${o.terminalId}`; });
      io.push({plc: e.label, terminal: t.label, direction: terminalDirection(t.id) === 'input' ? 'Entrada' : 'Salida', tag: tags.find(x => x.terminalId === t.id)?.name ?? '', connectedTo: other.join(', ')});
    }
    const prog = programOf(p, e.id);
    program.push({plc: e.label, lines: prog.rungs.map((r, i) => `Línea ${i + 1}: ${r.branches.map(b => (b.length ? b.map(contactText).join(' Y ') : '(sin contactos)')).join('  O  ')}  →  ${coilText(r)}${r.comment ? `   // ${r.comment}` : ''}`)});
    for (const it of checkProgram(p, e.id)) issues.push(`${e.label}: ${it.message}`);
  }

  const nets = ev.nets.map(n => ({id: n.id, terminals: n.terminals.map(t => `${label(t.entityId)}.${t.terminalId}`)}));
  const genericCount = p.entities.filter(e => shapeOf(e.definitionId).status !== 'verified').length;
  const hasLine = p.entities.some(e => e.definitionId === 'cinta-larga' || e.definitionId === 'cinta-transportadora');
  const hasMotor = p.entities.some(e => e.definitionId === 'motor-3p');
  const purpose = hasLine && program.length ? 'Inspeccionar el montaje y comprobar el control de una línea transportadora.'
    : hasMotor ? 'Inspeccionar las conexiones y comprobar el mando simulado del motor.'
    : 'Revisar la distribución, las conexiones y el comportamiento simulado de la instalación.';
  const start = io.find(row => row.direction === 'Entrada' && row.tag === 'START' && row.connectedTo);
  const stop = io.find(row => row.direction === 'Entrada' && row.tag === 'STOP' && row.connectedTo && row.plc === start?.plc);
  const motor = io.find(row => row.direction === 'Salida' && row.tag === 'MOTOR' && row.connectedTo && row.plc === start?.plc);
  const steps = ['Ubica los equipos en Planta 3D y revisa sus bornes en Tablero.'];
  if (start && motor) steps.push('En la simulación, sigue la señal de ' + start.connectedTo + ' hacia ' + start.terminal + ' / START y observa ' + motor.terminal + ' / MOTOR hacia ' + motor.connectedTo + '.');
  if (stop) steps.push('Prueba el paro desde ' + stop.connectedTo + ' y comprueba el estado de la salida en el monitor del PLC.');
  else steps.push('Compara la respuesta simulada de los equipos con el esquema y sus conexiones.');
  return {name: p.name, date, mode: p.mode, bom, wires, io, program, nets, issues, genericCount, disclaimer: DISCLAIMER, purpose, steps};
}

/** Un texto que empieza con = + - @ se interpretaría como fórmula al abrir el CSV en una hoja de cálculo: se neutraliza con una comilla simple. */
const csvCell = (v: string | number) => { let s = String(v); if (typeof v === 'string' && /^[=+\-@\t\r]/.test(s)) s = `'${s}`; return /[",;\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const csv = (head: string[], rows: (string | number)[][]) => [head, ...rows].map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
export const bomCsv = (d: Documentation) => csv(['Cantidad', 'Pieza', 'Familia', 'Estado', 'Referencias'], d.bom.map(r => [r.quantity, r.name, r.family, r.status, r.labels.join(' ')]));
export const wiresCsv = (d: Documentation) => csv(['N.º', 'Desde', 'Hasta', 'Tipo', 'Estado', 'Red', 'Etiqueta', 'Notas'], d.wires.map(r => [r.n, r.from, r.to, r.kind, r.status, r.net, r.label, r.notes]));

const md = (c: string) => c.replace(/[\r\n]+/g, ' ').replace(/\|/g, '\\|').replace(/</g, '&lt;');
const table = (head: string[], rows: string[][]) => rows.length === 0 ? '_Sin datos._\n' : [`| ${head.join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`, ...rows.map(r => `| ${r.map(md).join(' | ')} |`)].join('\n') + '\n';
export function toMarkdown(d: Documentation): string {
  return [
    `# Documentación técnica · ${md(d.name)}`, '', `Generada el ${d.date}. Modo: ${d.mode}.`, '', `> ${d.disclaimer}`, '',
    '## Propósito y secuencia de revisión', '', md(d.purpose), '', ...d.steps.map((step, i) => (i + 1) + '. ' + md(step)), '',
    `## 1. Lista de materiales`, '', table(['Cant.', 'Pieza', 'Familia', 'Estado', 'Referencias'], d.bom.map(r => [String(r.quantity), r.name, r.family, r.status, r.labels.join(' ')])),
    `## 2. Lista de cables`, '', table(['N.º', 'Desde', 'Hasta', 'Tipo', 'Estado', 'Red', 'Notas'], d.wires.map(r => [r.n, r.from, r.to, r.kind, r.status, r.net, r.notes])),
    `## 3. Entradas y salidas del PLC`, '', table(['PLC', 'Terminal', 'Tipo', 'Variable', 'Conectado a'], d.io.map(r => [r.plc, r.terminal, r.direction, r.tag || '—', r.connectedTo || '—'])),
    `## 4. Programa del PLC`, '', ...(d.program.length ? d.program.flatMap(x => [`**${x.plc}**`, '', x.lines.length ? '```\n' + x.lines.join('\n').replace(/```/g, '\'\'\'') + '\n```' : '_Sin líneas._', '']) : ['_No hay PLC en el proyecto._', '']),
    `## 5. Redes`, '', table(['Red', 'Terminales'], d.nets.map(n => [n.id, n.terminals.join(' · ')])),
    `## 6. Avisos`, '', d.issues.length ? d.issues.map(i => `- ${md(i)}`).join('\n') + '\n' : '_Sin avisos de topología ni de programa._\n',
    `---`, `${d.genericCount} pieza(s) genéricas o sin verificar. ${d.disclaimer}`, '',
  ].join('\n');
}
