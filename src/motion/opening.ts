/* Pantalla de apertura (ModoSplash.astro). Se retira sola cuando la aplicación termina de montarse:
   mientras exista un elemento .modo-pending o .lab-loading sigue visible. */
type Opening={show:(label?:string)=>void;hide:()=>void};
const api=()=>(window as unknown as {modoOpening?:Opening}).modoOpening;
export const openingShow=(label:string)=>api()?.show(label);
