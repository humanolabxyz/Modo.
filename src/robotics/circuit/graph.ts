// Grafo eléctrico del proyecto (docs/robotica/02 §5). Puro: nodos = `instanceId:pinId`; las redes (nets) salen de los cables
// (`connections`), de los pines unidos por dentro (`internalNet`) y de los puentes de los módulos (propiedades). Nada más define el circuito.
import {getDefinition} from '../catalog/index.ts';
import type {PartInstance, PinRef, RobotProject} from '../project/types.ts';

export type NetId = string;
export type CircuitGraph = {netOf: Map<string, NetId>; nets: Map<NetId, PinRef[]>};
export const pinKey = (r: PinRef): string => `${r.instanceId}:${r.pinId}`;

/** Uniones internas de una pieza según sus propiedades (p. ej. los puentes ENA/ENB del L298N conectan ese pin a +5V). */
export function internalLinks(part: PartInstance): [string, string][] {
  if (part.definitionId !== 'l298n-module') return [];
  const links: [string, string][] = [];
  if (part.props?.jumperENA ?? true) links.push(['ENA', '+5V']);
  if (part.props?.jumperENB ?? true) links.push(['ENB', '+5V']);
  return links;
}

class UnionFind {
  parent = new Map<string, string>();
  find(a: string): string {
    if (!this.parent.has(a)) this.parent.set(a, a);
    let root = a;
    while (this.parent.get(root) !== root) root = this.parent.get(root)!;
    for (let cur = a; cur !== root;) { const next = this.parent.get(cur)!; this.parent.set(cur, root); cur = next; }
    return root;
  }
  union(a: string, b: string) {
    const ra = this.find(a), rb = this.find(b);
    if (ra !== rb) this.parent.set(ra < rb ? rb : ra, ra < rb ? ra : rb); // la raíz es siempre la clave menor: los ids de red son estables
  }
}

export function buildGraph(p: RobotProject): CircuitGraph {
  const uf = new UnionFind();
  for (const part of p.parts) {
    const def = getDefinition(part.definitionId);
    if (!def) continue;
    const firstOfNet = new Map<string, string>();
    for (const pin of def.pins) {
      const key = `${part.instanceId}:${pin.id}`;
      uf.find(key);
      if (pin.internalNet) { const first = firstOfNet.get(pin.internalNet); if (first) uf.union(first, key); else firstOfNet.set(pin.internalNet, key); }
    }
    for (const [a, b] of internalLinks(part)) uf.union(`${part.instanceId}:${a}`, `${part.instanceId}:${b}`);
  }
  for (const c of p.connections) uf.union(pinKey(c.a), pinKey(c.b));
  const netOf = new Map<string, NetId>(), nets = new Map<NetId, PinRef[]>();
  for (const key of Array.from(uf.parent.keys())) {
    const id = `net:${uf.find(key)}`;
    netOf.set(key, id);
    const at = key.indexOf(':'), ref = {instanceId: key.slice(0, at), pinId: key.slice(at + 1)};
    (nets.get(id) ?? nets.set(id, []).get(id)!).push(ref);
  }
  return {netOf, nets};
}

export const netOfPin = (g: CircuitGraph, instanceId: string, pinId: string): NetId | undefined => g.netOf.get(`${instanceId}:${pinId}`);
/** Pines que comparten red con este (sin contarse a sí mismo). */
export const peers = (g: CircuitGraph, ref: PinRef): PinRef[] => (g.nets.get(g.netOf.get(pinKey(ref)) ?? '') ?? []).filter(x => pinKey(x) !== pinKey(ref));
/** ¿El pin tiene algún cable o unión interna con otro pin? */
export const isConnected = (g: CircuitGraph, ref: PinRef): boolean => peers(g, ref).length > 0;
