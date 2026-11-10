import {experiencePolicy} from './experience.ts';
import {EXPERIENCE_MODES} from '../model/types.ts';
import {validatePolygon} from '../terrain/geometry.ts';
import {roadOverlapsPolygon, ruralRoads} from '../terrain/roads.ts';
import {parcelArea} from './parcelGeometry.ts';
import {compileOperation, type TerrainOperation} from '../terrain/operations.ts';
// Sesión de un mundo abierto: terreno editable + piezas + conexiones + historial UNIFICADO de deshacer/rehacer. Puro (sin React ni three).
// Un solo historial para todo lo que el jugador hace: un trazo de terreno, colocar, mover, renombrar, eliminar… se deshacen en el orden en que ocurrieron.
// Los estados de piezas y conexiones son inmutables (compartición estructural), así que cada paso del historial guarda solo dos referencias.
import {defaultParams, itemById, portsFor} from '../catalog/items.ts';
import {EMPTY_PROGRAM, bitOn, addressKind, exampleProgram, readRuntime, resetRuntime, writeRuntime} from '../plc/program.ts';
import {runPlcs} from '../sim/plc.ts';
import {ECON, available, buildSeconds, chargeLabor, deliverDue, initEconomy, isTracked, placeOrder} from '../economy/economy.ts';
import {alertsOf, type Alert} from '../sim/alerts.ts';
import type {AgroProgram, Clock, Economy, Entity, ExperienceMode, Pose, PortRef, PropValue, Result, SimSpeed, TerrainEditKind, WorldProject} from '../model/types.ts';
import {LIMITS} from '../model/types.ts';
import {TerrainModel, type StampResult} from '../terrain/model.ts';
import {sampleHeight} from '../terrain/heightfield.ts';
import * as cmd from './commands.ts';
import {analyze, type Analysis} from '../sim/network.ts';
import {connectPorts} from './connections.ts';
import {isLiveKey, carryLive} from '../sim/live.ts';
import {stepWorld, type SimEvent} from '../sim/step.ts';
import {clearCrop, harvest, plant} from '../sim/soil.ts';
import {timeInfo} from '../sim/clock.ts';
import {checkPlacement, entityFootprint, portWorld} from './placement.ts';
import {markTerrainReview, previewTerrainImpact, type ImpactReport} from './impact.ts';
import {clearTerrainSupport, PIPE_ELEVATIONS, TERRAIN_ISSUE} from './pipeElevation.ts';

type Entry = {label: string; terrain: boolean; before: cmd.Parts; after: cmd.Parts};
export const HISTORY_LIMIT = 200;
const fail = (error: string): {ok: false; error: string} => ({ok: false, error});
const strokeBusy = () => fail('Termina o cancela el trazo de terreno primero.');
const poseAt = (hf: TerrainModel['hf'], x: number, z: number, yaw: number): Pose => ({position: [x, sampleHeight(hf, x, z), z], rotation: [0, yaw, 0]});

export class WorldSession {
  readonly terrain: TerrainModel;
  private base: WorldProject;
  private clock_: Clock;
  private events_: SimEvent[] = [];
  private economy_: Economy | null;
  private parts_: cmd.Parts;
  private undo_: Entry[] = [];
  private redo_: Entry[] = [];
  private impact_: ImpactReport | null = null;
  editorActive = false;
  parcelPreview: Entity | null = null;
  operationPreview: {cutM3:number;fillM3:number;kind:string} | null = null;
  private restoringHistory = false;
  private listeners = new Set<() => void>();
  /** Sube con cualquier cambio visible, incluido un trazo en vista previa. */
  version = 0;
  /** Las vistas previas y su cancelación no ensucian el documento guardado. */
  saveVersion = 0;

  private constructor(world: WorldProject) {
    this.base = world;
    this.economy_ = world.economy ?? null;
    this.clock_ = {...world.clock, speed: 0};   // un mundo siempre se abre en pausa
    this.terrain = TerrainModel.fromTerrain(world.terrain);
    this.terrain.hf.baseRoads = ruralRoads(this.terrain.hf.sizeX, this.terrain.hf.sizeZ, world.scenario.site ?? [0, 0]);
    this.parts_ = this.settle({entities: upgrade(refreshPorts(world.entities, world.connections)), connections: world.connections, ...(world.plc ? {plc: world.plc} : {})});
    this.terrain.subscribe(() => { if (!this.restoringHistory) this.changed(false); });
  }

  static fromWorld(world: WorldProject): WorldSession { return new WorldSession(world); }

  get id(): string { return this.base.id; }
  get name(): string { return this.base.name; }
  get site(): readonly [number, number] { return this.base.scenario.site ?? [0, 0]; }
  get entities(): readonly Entity[] { return this.parts_.entities; }
  get connections(): cmd.Parts['connections'] { return this.parts_.connections; }
  get parts(): cmd.Parts { return this.parts_; }
  get canUndo(): boolean { return this.undo_.length > 0 && !this.terrain.painting && !this.parcelPreview; }
  get canRedo(): boolean { return this.redo_.length > 0 && !this.terrain.painting && !this.parcelPreview; }
  get undoLabel(): string | null { return this.undo_.at(-1)?.label ?? null; }
  get terrainImpact(): ImpactReport | null { return this.impact_ && (this.impact_.entities.length || this.impact_.connections.length) ? this.impact_ : null; }
  /** Cambiar el nombre del mundo no entra en el historial de deshacer. */
  setName(name: string): Result<string> {
    const clean = name.trim();
    if (!clean || clean.length > 80) return fail('El nombre del mundo no es válido.');
    this.base = {...this.base, name: clean}; this.changed(); return {ok: true, value: clean};
  }
  entity(id: string): Entity | undefined { return this.parts_.entities.find(e => e.id === id); }

  subscribe(fn: () => void): () => void { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; }
  private changed(persist = true): void {
    if (persist) this.saveVersion++;
    this.version++;
    for (const fn of this.listeners) fn();
  }

  /** Documento serializable del mundo tal como está ahora. */
  toWorld(now = new Date().toISOString()): WorldProject {
    const {plc: _stale, economy: _eco, ...base} = this.base;
    return {...base, updatedAt: now, clock: {...this.clock_}, terrain: this.terrain.toTerrain(), entities: [...this.parts_.entities], connections: [...this.parts_.connections], ...(this.parts_.plc ? {plc: this.parts_.plc} : {}), ...(this.economy_ ? {economy: this.economy_} : {})};
  }

  private commit(label: string, next: cmd.Parts, terrain = false): void {
    this.undo_.push({label, terrain, before: this.parts_, after: next});
    if (this.undo_.length > HISTORY_LIMIT) this.undo_.shift();
    this.redo_ = []; this.parts_ = this.settle(next);
    if (terrain) {
      this.restoringHistory = true;
      try { this.terrain.endStroke(); }
      finally { this.restoringHistory = false; }
    }
    this.changed();
  }
  /** Resuelve la lógica de cada PLC con el estado actual (sin avanzar el tiempo): salidas coherentes tras cualquier cambio. */
  private settle(parts: cmd.Parts): cmd.Parts {
    if (!parts.plc) return parts;
    const run = runPlcs(parts.entities, parts.connections, parts.plc, timeInfo(this.clock_).hour, 0);
    if (run.entities === parts.entities) return parts;
    for (const e of run.entities) {   // arranque o parada de la bomba por un cambio del jugador (interruptor, modo, pantalla, cable): también va al registro
      const was = parts.entities.find(x => x.id === e.id);
      if (e.type === 'tablero' && was && bitOn(was.state, 'Y0') !== bitOn(e.state, 'Y0')) this.events_ = [...this.events_, {at: this.clock_.simSeconds, level: 'info' as const, entityId: e.id, text: `El PLC de «${e.label}» ${bitOn(e.state, 'Y0') ? 'arrancó' : 'detuvo'} la bomba (salida Y0).`}].slice(-100);
    }
    return {...parts, entities: run.entities};
  }
  private apply<T>(label: string, r: Result<cmd.Parts>, pick: (p: cmd.Parts) => T): Result<T> {
    if (this.terrain.painting || this.parcelPreview) return strokeBusy();
    if (!r.ok) return r;
    this.commit(label, r.value); return {ok: true, value: pick(r.value)};
  }

  // ── Terreno ────────────────────────────────────────────────────────────
  previewPolygonParcel(points:[number,number][]):Result<true> {
    if(!this.editorActive)return fail('Abre Editar mapa para delimitar el escenario.');
    if(this.terrain.painting||this.parcelPreview)return strokeBusy();
    const polygon=validatePolygon(points);if(!polygon.ok)return polygon;
    const xs=points.map(p=>p[0]),zs=points.map(p=>p[1]),x=(Math.min(...xs)+Math.max(...xs))/2,z=(Math.min(...zs)+Math.max(...zs))/2;
    const params={anchoM:Math.max(5,Math.ceil(Math.max(...xs)-Math.min(...xs))),largoM:Math.max(5,Math.ceil(Math.max(...zs)-Math.min(...zs)))};
    const made=cmd.buildEntity('parcela',poseAt(this.terrain.hf,x,z,0),this.entities,{params});if(!made.ok)return made;
    const entity={...made.value,parcelPolygon:points.map(([px,pz])=>[px-x,pz-z] as [number,number])};
    const check=checkPlacement(this.terrain.hf,this.entities,'parcela',entity.pose,entity.params,undefined,entity.parcelPolygon);if(!check.ok)return check;
    this.parcelPreview=entity;this.changed(false);return {ok:true,value:true};
  }
  confirmPolygonParcel():Result<true> {
    const entity=this.parcelPreview;if(!entity)return fail('No hay una parcela en vista previa.');
    const check=checkPlacement(this.terrain.hf,this.entities,'parcela',entity.pose,entity.params,undefined,entity.parcelPolygon);if(!check.ok)return check;
    const added=cmd.addEntity(this.parts_,entity);if(!added.ok)return added;
    this.parcelPreview=null;this.commit('Delimitar parcela poligonal',added.value);return {ok:true,value:true};
  }
  setEditorActive(active:boolean): void {
    if(this.terrain.painting||this.parcelPreview)this.abortStroke();
    this.editorActive=active;
    if(active)this.setSpeed(0);
    this.changed(false);
  }
  previewTerrainOperation(op:TerrainOperation): Result<true> {
    if(!this.editorActive && op.kind !== 'road')return fail('Abre Editar mapa para modificar directamente el escenario.');
    if(this.terrain.painting||this.parcelPreview)return strokeBusy();
    const compiled=compileOperation(this.terrain.hf,op);if(!compiled.ok)return compiled;
    if (op.kind === 'road') {
      const blocked = this.parts_.entities.find(e => itemById(e.type)?.solid && roadOverlapsPolygon(compiled.value, entityFootprint(e)));
      if (blocked) return fail(`El camino cruza la estructura «${blocked.label}». Ajusta el trazado.`);
    }
    this.terrain.beginStroke();const applied=this.terrain.applyOperation({...compiled.value,at:this.clock_.simSeconds});
    if(!applied.ok){this.terrain.abortStroke();return applied;}
    const {hf,committedHeightfield}=this.terrain;
    let cutM3=0,fillM3=0;
    for(const [idx,old] of committedHeightfield.originals??[]) {
      const delta=(hf.data[idx]-old)*hf.cell*hf.cell;
      if(delta>0)fillM3+=delta;else cutM3-=delta;
    }
    this.operationPreview={cutM3,fillM3,kind:op.kind};
    this.impact_=previewTerrainImpact(this.parts_,committedHeightfield,hf,[applied.edit]);
    this.changed(false);return {ok:true,value:true};
  }
  beginStroke(): void { this.terrain.beginStroke(); }
  stamp(kind: TerrainEditKind, x: number, z: number, radius: number, amount: number): StampResult {
    return this.impact_ ? strokeBusy() : this.terrain.stamp(kind, x, z, radius, amount, this.clock_.simSeconds);
  }

  /** Un trazo con impacto queda en vista previa hasta que el jugador decida. */
  endStroke(): ImpactReport | null {
    if (this.impact_) return this.impact_;
    if (!this.terrain.strokeSize) { this.terrain.endStroke(); return null; }
    const {hf, committedHeightfield, edits, strokeSize} = this.terrain;
    const report = previewTerrainImpact(this.parts_, committedHeightfield, hf, edits.slice(-strokeSize));
    if (report.entities.length || report.connections.length) {
      this.impact_ = report; this.changed(false); return report;
    }
    this.finishStroke(this.parts_);
    return null;
  }

  abortStroke(): void {
    const parcel=!!this.parcelPreview;this.parcelPreview=null;
    this.impact_ = null; this.operationPreview=null; this.terrain.abortStroke();if(parcel)this.changed(false);
  }

  commitStroke(option: 'reseat' | 'keep'): Result<true> {
    const report = this.impact_;
    if (!report || !this.terrain.painting) return fail('No hay una edición de terreno por confirmar.');
    const affected = new Map(report.entities.map(e => [e.id, e]));
    const linked = new Set(report.connections.map(c => c.id));
    const entities: Entity[] = [];
    for (const e of this.parts_.entities) {
      const impact = affected.get(e.id);
      if (!impact) { entities.push(e); continue; }
      if (option === 'reseat' && !impact.blocker) {
        const [x, , z] = e.pose.position;
        entities.push({...e, pose: {...e.pose, position: [x, impact.nextY, z]}, state: clearTerrainSupport(e.state)});
      } else {
        const state = {...e.state, [TERRAIN_ISSUE]: impact.blocker ?? 'Revisa el apoyo sobre el terreno.',
          ...(impact.pin !== undefined ? {[PIPE_ELEVATIONS]: impact.pin} : {})};
        if (Object.keys(state).length > LIMITS.params) return fail(`«${e.label}» no admite más datos para guardar la incidencia. Cancela o elige otra opción disponible.`);
        entities.push({...e, state});
      }
    }
    const connections = this.parts_.connections.map(c => linked.has(c.id) ? markTerrainReview(c) : c);
    this.finishStroke({...this.parts_, entities, connections});
    return {ok: true, value: true};
  }

  private finishStroke(next: cmd.Parts): void {
    const added = this.terrain.strokeSize;
    this.impact_ = null; this.operationPreview=null;
    this.commit(added === 1 ? 'Editar terreno' : `Editar terreno (${added} marcas)`, next, true);
  }

  // ── Piezas ─────────────────────────────────────────────────────────────
  /** Pose y validez de colocar `typeId` en (x, z): es lo que muestra el fantasma. */
  previewPlacement(typeId: string, x: number, z: number, yaw: number, params: Record<string, PropValue> = {}, ignoreId?: string): {pose: Pose; check: Result<true>} {
    const pose = poseAt(this.terrain.hf, x, z, yaw), def = itemById(typeId);
    const merged = def ? {...cmdDefaults(typeId), ...params} : params;
    const check = checkPlacement(this.terrain.hf, this.parts_.entities, typeId, pose, merged, ignoreId, ignoreId?this.entity(ignoreId)?.parcelPolygon:undefined);
    if (check.ok && !ignoreId && this.stockOf(typeId) < 1) return {pose, check: {ok: false as const, error: `No hay «${def?.name ?? typeId}» en el inventario: cómprala en Gestión → Inventario.`}};
    return {pose, check};
  }

  place(typeId: string, x: number, z: number, yaw: number, options: {params?: Record<string, PropValue>; label?: string; id?: string} = {}): Result<Entity> {
    if (this.terrain.painting || this.parcelPreview) return strokeBusy();
    const {pose, check} = this.previewPlacement(typeId, x, z, yaw, options.params);
    if (!check.ok) return check;
    const real = this.policy.inventory && this.economy_ !== null && isTracked(typeId), def = itemById(typeId);
    if (real && available(this.economy_!, this.parts_.entities, typeId) < 1) return fail(`No hay «${def?.name ?? typeId}» en el inventario: cómprala en Gestión → Inventario.`);
    const built = cmd.buildEntity(typeId, pose, this.parts_.entities, options); if (!built.ok) return built;
    let entity = built.value;
    if (real && this.policy.constructionTime && buildSeconds(typeId) > 0) entity = {...entity, state: {...entity.state, obraDesde: this.clock_.simSeconds, obraHasta: this.clock_.simSeconds + buildSeconds(typeId)}};
    const added = cmd.addEntity(this.parts_, entity); if (!added.ok) return added;
    if (real && this.policy.chargeCosts) this.economy_ = chargeLabor(this.economy_!, typeId, this.clock_.simSeconds, entity.label);
    this.commit(`Colocar ${entity.label}`, added.value); return {ok: true, value: entity};
  }

  move(id: string, x: number, z: number, yaw?: number): Result<Entity> {
    const e = this.entity(id); if (!e) return fail('La pieza no existe.');
    const {pose, check} = this.previewPlacement(e.type, x, z, yaw ?? e.pose.rotation[1], e.params, id);
    if (!check.ok) return check;
    return this.apply(`Mover ${e.label}`, cmd.setPose(this.parts_, id, pose), p => p.entities.find(q => q.id === id)!);
  }
  rotate(id: string, deltaYaw: number): Result<Entity> {
    const e = this.entity(id); if (!e) return fail('La pieza no existe.');
    return this.move(id, e.pose.position[0], e.pose.position[2], e.pose.rotation[1] + deltaYaw);
  }
  rename(id: string, label: string): Result<Entity> { return this.apply('Renombrar', cmd.rename(this.parts_, id, label), p => p.entities.find(q => q.id === id)!); }
  /** Cambia un parámetro. Si la pieza ya está conectada, se mantiene anclado en su sitio el primer puerto conectado (alargar una tubería la extiende desde donde está unida). */
  setParam(id: string, key: string, value: number): Result<Entity> {
    const e = this.entity(id); if (!e) return fail('La pieza no existe.');
    if(e.parcelPolygon&&['anchoM','largoM'].includes(key))return fail('La huella poligonal se define con sus vértices; conserva sus dimensiones al mover o girar.');
    const res = cmd.setParam(this.parts_, id, key, value); if (!res.ok) return res;
    let next = res.value.entities.find(q => q.id === id)!;
    if (next.type === 'tuberia' && key === 'largoM' && next.params.largoM !== e.params.largoM) next = {...next, state: clearTerrainSupport(next.state)};
    const anchor = this.parts_.connections.find(c => c.kind === 'hydraulic' && (c.a.entityId === id || c.b.entityId === id));
    if (anchor) {
      const portId = anchor.a.entityId === id ? anchor.a.portId : anchor.b.portId, before = e.ports.find(p => p.id === portId), after = next.ports.find(p => p.id === portId);
      if (before && after) { const wb = portWorld(e, before), wa = portWorld(next, after); next = {...next, pose: {position: [next.pose.position[0] + wb.x - wa.x, sampleHeight(this.terrain.hf, next.pose.position[0] + wb.x - wa.x, next.pose.position[2] + wb.z - wa.z), next.pose.position[2] + wb.z - wa.z], rotation: next.pose.rotation}}; }
    }
    const check = checkPlacement(this.terrain.hf, this.parts_.entities, e.type, next.pose, next.params, id);
    if (!check.ok) return check;
    return this.apply(`Cambiar ${key} de ${e.label}`, {ok: true, value: {...res.value, entities: res.value.entities.map(q => (q.id === id ? next : q))}}, p => p.entities.find(q => q.id === id)!);
  }
  remove(id: string, options: {confirm?: boolean} = {}): Result<Entity> & {dependencies?: cmd.Dependencies} {
    if (this.terrain.painting || this.parcelPreview) return strokeBusy();
    const e = this.entity(id); if (!e) return fail('La pieza no existe.');
    const res = cmd.removeEntity(this.parts_, id, options);
    if (!res.ok) return {...res};
    this.commit(`Eliminar ${e.label}`, res.value); return {ok: true, value: e, dependencies: res.dependencies};
  }
  /** Conexión física: valida compatibilidad y, en las hidráulicas, acopla la pieza (la mueve y la gira hasta que los puertos coinciden). */
  connectPorts(a: PortRef, b: PortRef): Result<{docked: string | null}> {
    if (this.terrain.painting || this.parcelPreview) return strokeBusy();
    const r = connectPorts(this.parts_, this.terrain.hf, a, b); if (!r.ok) return r;
    this.commit(r.value.docked ? `Conectar y acoplar ${r.value.docked}` : 'Conectar', r.value.parts); return {ok: true, value: {docked: r.value.docked}};
  }
  disconnect(connectionId: string): Result<true> { return this.apply('Desconectar', cmd.disconnect(this.parts_, connectionId), () => true as const); }
  setState(id: string, key: string, value: PropValue): Result<Entity> {
    const e = this.entity(id); if (!e) return fail('La pieza no existe.');
    if (isLiveKey(e.type, key)) { // agua, suelo y cultivo: parte de la simulación, fuera del historial
      const r = cmd.setState(this.parts_, id, key, value); if (!r.ok) return r;
      this.parts_ = this.settle(r.value); this.changed(); return {ok: true, value: this.parts_.entities.find(q => q.id === id)!};
    }
    return this.apply(`Cambiar ${key} de ${e.label}`, cmd.setState(this.parts_, id, key, value), p => p.entities.find(q => q.id === id)!);
  }
  private analysis_: {version: number; value: Analysis} | null = null;
  /** Análisis de energía e hidráulica del estado actual (se recalcula solo cuando algo cambió). */
  analyze(): Analysis {
    if (!this.analysis_ || this.analysis_.version !== this.version) this.analysis_ = {version: this.version, value: analyze(this.parts_.entities, this.parts_.connections, this.terrain.committedHeightfield)};
    return this.analysis_.value;
  }
  connect(a: PortRef, b: PortRef): Result<true> { return this.apply('Conectar', cmd.connect(this.parts_, a, b), () => true as const); }
  dependenciesOf(id: string): cmd.Dependencies { return cmd.dependenciesOf(this.parts_, id); }

  // ── Tiempo, agua y cultivo (Fase 4) ──────────────────────────────────────
  get clock(): Readonly<Clock> { return this.clock_; }
  /** Registro de sucesos de esta sesión (más reciente al final). No se guarda en el archivo del mundo: el estado que lo explica sí. */
  get events(): readonly SimEvent[] { return this.events_; }
  setSpeed(speed: SimSpeed): void { if(this.editorActive&&speed!==0)return; if (this.clock_.speed === speed) return; this.clock_ = {...this.clock_, speed}; this.changed(); }
  /** Avanza el mundo `seconds` segundos simulados (o menos si se agota `budgetMs`). Devuelve lo realmente avanzado. No entra en el historial. */
  advance(seconds: number, budgetMs?: number): number {
    if (!(seconds > 0)) return 0;
    const r = stepWorld(this.parts_.entities, this.parts_.connections, this.terrain.committedHeightfield, this.clock_, seconds, {budgetMs, plc: this.parts_.plc});
    if (r.advanced <= 0) return 0;
    this.clock_ = {...this.clock_, simSeconds: this.clock_.simSeconds + r.advanced};
    this.parts_ = this.settle({...this.parts_, entities: r.entities});
    if (r.events.length) this.events_ = [...this.events_, ...r.events].slice(-100);
    this.receiveOrders();
    this.changed(); return r.advanced;
  }
  /** Siembra un cultivo en una parcela (acción del jugador; no se deshace: el tiempo ya corrió). */
  plant(parcelId: string, cropId: string): Result<Entity> { return this.act(parcelId, 'parcela', s => plant(s, cropId, timeInfo(this.clock_).dayIndex)); }
  clearCrop(parcelId: string): Result<Entity> { return this.act(parcelId, 'parcela', s => ({ok: true as const, state: clearCrop(s)})); }
  harvest(parcelId: string): Result<{entity: Entity; kg: number; tha: number}> {
    const e = this.entity(parcelId); if (!e || e.type !== 'parcela') return fail('La parcela no existe.');
    const area = parcelArea(e), r = harvest(e.state, area); if (!r.ok) return r;
    this.parts_ = {...this.parts_, entities: this.parts_.entities.map(x => (x.id === parcelId ? {...x, state: r.state} : x))};
    this.events_ = [...this.events_, {at: this.clock_.simSeconds, level: 'info' as const, entityId: parcelId, text: `Cosecha de «${e.label}»: ${Math.round(r.kg).toLocaleString('es-CL')} kg (${r.tha.toFixed(1).replace('.', ',')} t/ha).`}].slice(-100);
    this.changed(); return {ok: true, value: {entity: this.entity(parcelId)!, kg: r.kg, tha: r.tha}};
  }
  private act(id: string, type: string, fn: (state: Record<string, PropValue>) => {ok: true; state: Record<string, PropValue>} | {ok: false; error: string}): Result<Entity> {
    const e = this.entity(id); if (!e || e.type !== type) return fail('La pieza no existe.');
    const r = fn(e.state); if (!r.ok) return r;
    this.parts_ = {...this.parts_, entities: this.parts_.entities.map(x => (x.id === id ? {...x, state: r.state} : x))};
    this.changed(); return {ok: true, value: this.entity(id)!};
  }
  // ── Inventario, compras y obras (Fase 6) ─────────────────────────────────
  get policy() {return experiencePolicy(this.experience);}
  get experience(): ExperienceMode { return this.base.experience; }
  /** Economía de la experiencia real (null en mundos libres que nunca fueron reales). */
  get economy(): Readonly<Economy> | null { return this.economy_; }
  /** Cambia el modo de la finca. «real» activa inventario, compras y obras; lo ya construido se considera recibido. Volver a «libre» conserva la economía pero deja de aplicarla. No entra en el historial. */
  setExperience(mode: ExperienceMode): Result<ExperienceMode> {
    if(!EXPERIENCE_MODES.includes(mode))return fail('Experiencia desconocida.');
    if(this.terrain.painting||this.parcelPreview)return strokeBusy();
    const nextPolicy=experiencePolicy(mode);
    if (this.base.experience === mode) return {ok: true, value: mode};
    if (nextPolicy.inventory && !this.economy_) this.economy_ = initEconomy(this.parts_.entities, this.clock_.simSeconds);
    this.base = {...this.base, experience: mode};
    if (!nextPolicy.constructionTime) { // al salir del modo real las obras en curso se terminan: en libre todo existe de inmediato
      this.parts_ = {...this.parts_, entities: this.parts_.entities.map(e => (typeof e.state.obraHasta === 'number' && e.state.obraHasta > 0 ? {...e, state: {...e.state, obraHasta: 0}} : e))};
    }
    this.changed(); return {ok: true, value: mode};
  }
  /** Compra `qty` unidades de una pieza del catálogo. */
  buy(type: string, qty: number): Result<Economy> {
    if (!this.policy.inventory || !this.economy_) return fail('Las compras solo existen en el modo real de la finca.');
    const r = placeOrder(this.economy_, type, qty, this.clock_.simSeconds, itemById(type)?.name ?? type); if (!r.ok) return r;
    this.economy_ = r.value; this.changed(); return r;
  }
  /** Unidades de `type` que se pueden colocar ahora (infinito fuera del modo real). */
  stockOf(type: string): number { return this.policy.inventory && this.economy_ ? available(this.economy_, this.parts_.entities, type) : Infinity; }
  private receiveOrders(): void {
    if (!this.economy_) return;
    const r = deliverDue(this.economy_, this.clock_.simSeconds, t => itemById(t)?.name ?? t);
    if (r.economy === this.economy_) return;
    this.economy_ = r.economy; this.events_ = [...this.events_, ...r.received.map(x => ({at: x.at, level: 'info' as const, text: x.text}))].slice(-100);
  }

  /** Tras deshacer o rehacer se conserva el agua y el cultivo actuales: el tiempo no se deshace. */
  private carry(next: cmd.Parts): cmd.Parts {
    let entities = carryLive(this.parts_.entities, next.entities);
    // Si el programa de un tablero cambia al deshacer o rehacer, su PLC parte de cero (los temporizadores del programa anterior no valen para el nuevo).
    const stale = entities.filter(e => e.type === 'tablero' && this.parts_.plc?.[e.id] !== next.plc?.[e.id]);
    if (stale.length) entities = entities.map(e => (stale.includes(e) ? {...e, state: {...e.state, ...resetRuntime(e.state, !!next.plc?.[e.id])}} : e));
    return this.settle(entities === next.entities ? next : {...next, entities});
  }

  /** Alertas activas del estado actual (estanques, cultivos y tableros en automático). */
  alerts(): Alert[] { return alertsOf(this.parts_.entities, this.analyze(), {connections: this.parts_.connections, plc: this.parts_.plc, hour: timeInfo(this.clock_).hour}); }

  // ── PLC del tablero (Fase 5) ─────────────────────────────────────────────
  /** Programa del tablero (vacío si no tiene). */
  program(boardId: string): AgroProgram { return this.parts_.plc?.[boardId] ?? EMPTY_PROGRAM; }
  /** Cambia el programa con una operación de `plc/program.ts`. Entra en el historial; el PLC parte de cero. */
  editProgram(boardId: string, f: (p: AgroProgram) => Result<AgroProgram>): Result<true> {
    const e = this.entity(boardId); if (!e) return fail('La pieza no existe.');
    const next = f(this.program(boardId)); if (!next.ok) return next;
    return this.apply(`Programar ${e.label}`, cmd.setProgram(this.parts_, boardId, next.value), () => true as const);
  }
  /** Carga el programa de ejemplo (riego por humedad). */
  loadExample(boardId: string): Result<true> { return this.editProgram(boardId, () => ({ok: true, value: exampleProgram()})); }
  clearProgram(boardId: string): Result<true> { const e = this.entity(boardId); if (!e) return fail('La pieza no existe.'); return this.apply(`Quitar programa de ${e.label}`, cmd.setProgram(this.parts_, boardId, null), () => true as const); }
  /** HMI: escribe una marca interna (M) del PLC. Es una acción del operador en el tiempo presente: no entra en el historial. */
  setTag(boardId: string, tag: string, value: boolean): Result<true> {
    const e = this.entity(boardId), program = this.parts_.plc?.[boardId];
    if (!e || e.type !== 'tablero' || !program) return fail('Este tablero no tiene programa.');
    if (addressKind(tag) !== 'memory') return fail('Desde la pantalla solo se escriben marcas internas (M).');
    const rt = readRuntime(e.state, program); rt.values[tag] = value;
    this.parts_ = this.settle({...this.parts_, entities: this.parts_.entities.map(x => (x.id === boardId ? {...x, state: {...x.state, ...writeRuntime(program, rt)}} : x))});
    this.changed(); return {ok: true, value: true};
  }

  // ── Historial ──────────────────────────────────────────────────────────
  undo(): boolean {
    if (!this.canUndo) return false;
    const entry = this.undo_.pop()!;
    if (entry.terrain && !this.restoreTerrain('undo')) { this.undo_.push(entry); return false; }
    this.parts_ = this.carry(entry.before); this.redo_.push(entry); this.changed(); return true;
  }
  redo(): boolean {
    if (!this.canRedo) return false;
    const entry = this.redo_.pop()!;
    if (entry.terrain && !this.restoreTerrain('redo')) { this.redo_.push(entry); return false; }
    this.parts_ = this.carry(entry.after); this.undo_.push(entry); this.changed(); return true;
  }

  private restoreTerrain(action: 'undo' | 'redo'): boolean {
    this.restoringHistory = true;
    try { return this.terrain[action](); }
    finally { this.restoringHistory = false; }
  }
}

/** Mundos antiguos: completa los parámetros de catálogo que no existían cuando se guardaron (p. ej. el radio de riego del aspersor). */
function upgrade(entities: Entity[]): Entity[] {
  return entities.map(e => {
    const def = itemById(e.type); if (!def) return e;
    const fresh = defaultParams(def), missing = Object.keys(fresh).filter(k => !(k in e.params));
    return missing.length ? {...e, params: {...Object.fromEntries(missing.map(k => [k, fresh[k]])), ...e.params}} : e;
  });
}

function cmdDefaults(typeId: string): Record<string, PropValue> {
  const def = itemById(typeId)!, out: Record<string, PropValue> = {};
  for (const p of def.params) out[p.key] = p.default;
  return out;
}

/** Al abrir un mundo se actualizan los puertos de cada pieza a la definición vigente del catálogo, siempre que sigan existiendo los puertos que ya tienen conexiones. */
function refreshPorts(entities: Entity[], connections: cmd.Parts['connections']): Entity[] {
  return entities.map(e => {
    const def = itemById(e.type); if (!def) return e;
    const fresh = portsFor(def, e.params), used = connections.flatMap(c => [c.a, c.b]).filter(r => r.entityId === e.id).map(r => r.portId);
    if (!used.every(id => fresh.some(p => p.id === id))) return e;
    return JSON.stringify(fresh) === JSON.stringify(e.ports) ? e : {...e, ports: fresh};
  });
}
