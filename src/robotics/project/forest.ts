import type {Obstacle, ObstacleKind, Scene, Vec3} from './types.ts';

export const OBSTACLE_LABEL: Record<ObstacleKind, string> = {tree: 'Árbol', rock: 'Roca', log: 'Tronco', branch: 'Rama suelta', post: 'Baliza'};

export function forestObstacle(id: string, kind: ObstacleKind, x: number, z: number, size: Vec3, movable = false): Obstacle {
  return {id, kind, shape: kind === 'tree' ? 'cylinder' : 'box', size,
    transform: {position: [x, size[1] / 2, z], rotation: [0, 0, 0, 1]},
    ...(movable ? {movable: true, massKg: kind === 'branch' ? .035 : .18} : {})};
}

export function forestScene(scene: Scene): Scene {
  const obstacles = [
    forestObstacle('tronco-sendero', 'log', 0, .95, [.5, .4, .1]),
    forestObstacle('roca-lateral', 'rock', .32, .75, [.08, .4, .7]),
    forestObstacle('roca-claro', 'rock', -1.23, -.72, [.38, .32, .31]),
    forestObstacle('tronco-suelto', 'log', -.95, 1.2, [.36, .32, .19], true),
    forestObstacle('rama-sendero', 'branch', 0, .43, [.24, .1, .075], true),
    forestObstacle('rama-claro', 'branch', -1.12, .63, [.23, .085, .08], true),
    forestObstacle('baliza-norte', 'post', -.70, 1.57, [.16, .48, .16]),
    forestObstacle('baliza-sur', 'post', .62, -.93, [.16, .48, .16]),
    ...([[-1.57, .2], [1.51, -.26], [1.45, 1.37], [-1.46, 1.55], [-.62, -1.57], [.77, -1.58]] as const)
      .map(([x,z], i) => forestObstacle('arbol-' + (i + 1), 'tree', x, z, [.23, .76, .23])),
  ];
  return {...scene, theme: 'forest', sizeM: Math.max(scene.sizeM ?? 4, 8) as Scene['sizeM'], lineTrack: undefined, obstacles};
}
