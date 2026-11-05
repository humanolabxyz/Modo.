import {robotGroup, MAX_RUNNING_ROBOTS} from '../project/fleet.ts';
import {Coordinator, STEP_US, type PhysicsPort, type SimModel, type Snapshot} from './coordinator.ts';
import {RobotPhysics} from './physics.ts';

type Rapier = Parameters<typeof RobotPhysics.create>[0];

export function createFleet(model: SimModel, rapier?: Rapier) {
  const programs = [{targetId: model.targetId, hex: model.hex}, ...(model.programs ?? [])];
  if (programs.length > MAX_RUNNING_ROBOTS) throw new Error('Puedes ejecutar hasta tres robots a la vez.');
  const fleet = new Map<string, number>();
  let fleetMask = 0;
  const models = programs.map((program, index): SimModel => {
    const ids = robotGroup(model.project, program.targetId);
    const bit = 1 << (index + 4);
    fleetMask |= bit;
    for (const id of ids) {
      if (fleet.has(id)) throw new Error('Los robots deben tener montajes y circuitos independientes.');
      fleet.set(id, bit);
    }
    const {project} = model;
    return {...program, project: {...project,
      parts: project.parts.filter(p => ids.has(p.instanceId)),
      attachments: project.attachments.filter(a => ids.has(a.parent.instanceId)),
      connections: project.connections.filter(c => ids.has(c.a.instanceId)),
    }};
  });
  const physics = rapier && RobotPhysics.create(rapier, model.project, {fleet, fleetMask});
  const motors = new Map<string, number>(), brakes = new Set<string>();
  let servos = new Map<string, number>(), previousServos = new Map<string, number>();
  // Each controller contributes commands, then Rapier advances the shared scene once.
  const port: PhysicsPort | undefined = physics ? {
    distance: id => physics.distance(id),
    reflectance: id => physics.reflectance(id),
    step: (volts, stops) => {
      for (const [id, value] of volts) motors.set(id, value);
      for (const id of stops ?? []) brakes.add(id);
    },
    setServos: angles => { for (const [id, angle] of angles) servos.set(id, angle); },
  } : undefined;
  const controllers = models.map(m => new Coordinator(m, port));
  const merge = <K extends 'leds' | 'motors' | 'bridges' | 'sensors' | 'reflectance' | 'servos' | 'displays' | 'controls'>(key: K, states: Snapshot[]): Snapshot[K] =>
    Object.assign({}, ...states.map(state => state[key]));
  return {
    advance(us: number) {
      for (let left = us; left > 0;) {
        const step = Math.min(STEP_US, left);
        motors.clear(); servos.clear(); brakes.clear();
        for (const controller of controllers) controller.advance(step);
        physics?.setServos(servos);
        physics?.step(motors, brakes);
        // The next radar pulse must still see the head angle published to physics.
        const reusable = previousServos;
        previousServos = servos;
        servos = reusable;
        left -= step;
      }
    },
    setControl(id: string, value: number) { for (const controller of controllers) controller.setControl(id, value); },
    snapshot(): Snapshot {
      const states = controllers.map(controller => controller.snapshot()), primary = states[0];
      const error = states.find(state => state.status === 'error');
      return {...primary, ...(error && {status: 'error', message: error.message}), physics: physics?.frame(),
        leds: merge('leds', states), motors: merge('motors', states), bridges: merge('bridges', states),
        sensors: merge('sensors', states), reflectance: merge('reflectance', states), servos: merge('servos', states),
        displays: merge('displays', states), controls: merge('controls', states)};
    },
    dispose() { physics?.dispose(); },
  };
}
