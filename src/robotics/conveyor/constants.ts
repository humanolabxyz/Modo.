export const CONVEYOR_ID = 'educational-conveyor';
export const CONVEYOR_TEMPLATE = 'brazo-e6-cinta-clasificadora';
export const BELT_LENGTH = .72;
export const BELT_TOP = .04; // relative to part centre
export const SENSOR_Z = -.28;
export const SORT_COLORS = ['rojo', 'verde', 'azul'] as const;
export type SortColor = typeof SORT_COLORS[number];
export const COLOR_RGB: Record<SortColor, [number, number, number]> = {rojo:[220,55,55],verde:[50,180,95],azul:[55,115,225]};
