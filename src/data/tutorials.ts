export type TutorialContext = 'home' | 'practice' | 'laboratory' | 'study';

// Últimos renders de video-tutorial/out (v3, voz D2).
export const TUTORIALS = [
  {id: 'practica-1', area: 'Práctica', part: 1, title: 'Tu primer cable', description: 'Conoce el banco, las herramientas y cómo conectar dos bornes.', duration: '1:24'},
  {id: 'practica-2', area: 'Práctica', part: 2, title: 'Del diagrama al circuito', description: 'Lee el diagrama y sigue los pasos para probar la simulación.', duration: '1:35'},
  {id: 'laboratorio-1', area: 'Laboratorio', part: 1, title: 'Empieza en la protoboard', description: 'Ubica la fuente, añade componentes y conecta tus primeros puentes.', duration: '1:51'},
  {id: 'laboratorio-2', area: 'Laboratorio', part: 2, title: 'Simula y mide', description: 'Usa el multímetro y conoce las otras herramientas del laboratorio.', duration: '1:27'},
] as const;

export const tutorialSource = (id: string) => `/tutoriales/modo-v3-${id}.mp4`;
export const tutorialPoster = (id: string) => `/tutoriales/${id}.webp`;
