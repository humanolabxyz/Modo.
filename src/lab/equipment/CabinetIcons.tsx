import type {ReactNode} from 'react';

/** Iconos bitono del taller: trazo y relleno suave en currentColor y un punto de luz fijo.
 *  La iluminación (halo, hover, activo) se resuelve en cabinet-fx.css con drop-shadow. */
const base={fill:'none',stroke:'currentColor',strokeWidth:1.7,strokeLinecap:'round' as const,strokeLinejoin:'round' as const};
const soft={fill:'currentColor',fillOpacity:.2,stroke:'none'};
const spark=(x:number,y:number,r=1.35)=><circle cx={x} cy={y} r={r} fill="#fff7c4" stroke="none"/>;

export type CabinetIconName='mount'|'wire'|'program'|'verify'|'play'|'pause'|'save'|'trash'|'all'|'plate'|'door'|'field'|'guide';

const SHAPES:Record<CabinetIconName,ReactNode>={
 mount:<><rect x="3" y="3.5" width="18" height="17" rx="2.5" {...base}/><rect x="6" y="7" width="5.5" height="5" rx="1" {...soft}/><rect x="6" y="7" width="5.5" height="5" rx="1" {...base} strokeWidth={1.3}/><path d="M13.5 8.2h4M13.5 11h4M5.5 16.5h13" {...base}/>{spark(15.6,15.2)}</>,
 wire:<><rect x="2.5" y="4" width="5" height="5" rx="1.2" {...soft}/><rect x="2.5" y="4" width="5" height="5" rx="1.2" {...base} strokeWidth={1.4}/><rect x="16.5" y="15" width="5" height="5" rx="1.2" {...soft}/><rect x="16.5" y="15" width="5" height="5" rx="1.2" {...base} strokeWidth={1.4}/><path d="M7.5 6.5h4.5c2.5 0 2.5 3 0 3.5l-1 .2c-2.6.5-2.6 3.5 0 4l1 .2c2 .4 3 1.4 4.5 2.1" {...base}/>{spark(9.7,6.5)}</>,
 program:<><rect x="6.5" y="6.5" width="11" height="11" rx="2" {...soft}/><rect x="6.5" y="6.5" width="11" height="11" rx="2" {...base}/><path d="M9.5 3.5v3m5-3v3m-5 11v3m5-3v3M3.5 9.5h3m-3 5h3m11-5h3m-3 5h3" {...base}/><path d="M10.2 10.6 8.9 12l1.3 1.4m3.6-2.8 1.3 1.4-1.3 1.4" {...base} strokeWidth={1.3}/>{spark(15.6,8.4,1.1)}</>,
 verify:<><path d="M12 3 4.5 5.8v5.6c0 4.5 3 8 7.5 9.6 4.5-1.6 7.5-5.1 7.5-9.6V5.8z" {...soft}/><path d="M12 3 4.5 5.8v5.6c0 4.5 3 8 7.5 9.6 4.5-1.6 7.5-5.1 7.5-9.6V5.8z" {...base}/><path d="m8.6 12.2 2.6 2.6 4.4-5" {...base} strokeWidth={2}/>{spark(16.8,6.4,1.1)}</>,
 play:<><circle cx="12" cy="12" r="9" {...soft}/><circle cx="12" cy="12" r="9" {...base}/><path d="M10 8.2v7.6l6.2-3.8z" fill="currentColor" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>{spark(17.2,6.4,1.1)}</>,
 pause:<><circle cx="12" cy="12" r="9" {...soft}/><circle cx="12" cy="12" r="9" {...base}/><rect x="8.6" y="8.2" width="2.5" height="7.6" rx=".8" fill="currentColor" stroke="none"/><rect x="12.9" y="8.2" width="2.5" height="7.6" rx=".8" fill="currentColor" stroke="none"/></>,
 save:<><path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" {...base}/><path d="M12 4v10.2m-4.2-3.9 4.2 4.2 4.2-4.2" {...base} strokeWidth={2}/><path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15z" {...soft}/>{spark(17.6,17.4,1)}</>,
 trash:<><path d="M5.5 7.5h13l-1 11.2a1.6 1.6 0 0 1-1.6 1.4H8.1a1.6 1.6 0 0 1-1.6-1.4z" {...soft}/><path d="M4 7.5h16M9.5 7.5V5.2c0-.7.5-1.2 1.2-1.2h2.6c.7 0 1.2.5 1.2 1.2v2.3M5.5 7.5l1 11.2a1.6 1.6 0 0 0 1.6 1.4h7.8a1.6 1.6 0 0 0 1.6-1.4l1-11.2M10 11v5.5m4-5.5v5.5" {...base}/></>,
 all:<><rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.6" {...soft}/><rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.6" {...base}/><rect x="13" y="3.5" width="7.5" height="7.5" rx="1.6" {...base}/><rect x="3.5" y="13" width="7.5" height="7.5" rx="1.6" {...base}/><rect x="13" y="13" width="7.5" height="7.5" rx="1.6" {...base}/>{spark(7.2,7.2,1)}</>,
 plate:<><rect x="3" y="4" width="18" height="16" rx="2" {...base}/><path d="M3 9.5h18M3 15.5h18" {...base} strokeWidth={1.3}/><rect x="6" y="11" width="4" height="3" rx=".7" {...soft}/><rect x="6" y="11" width="4" height="3" rx=".7" {...base} strokeWidth={1.2}/><rect x="12" y="5.5" width="4" height="3" rx=".7" {...base} strokeWidth={1.2}/><rect x="13" y="16.7" width="5" height="2" rx=".6" {...base} strokeWidth={1.2}/>{spark(8,12.5,.9)}</>,
 door:<><path d="M6 20.5V4.8c0-.7.5-1.3 1.2-1.3h9.6c.7 0 1.2.6 1.2 1.3v15.7" {...base}/><path d="M6 20.5V4.8c0-.7.5-1.3 1.2-1.3h9.6c.7 0 1.2.6 1.2 1.3v15.7z" {...soft}/><path d="M4 20.5h16" {...base}/><circle cx="15" cy="12.4" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="8" r="1.6" {...base} strokeWidth={1.3}/>{spark(12,8,.7)}</>,
 field:<><rect x="3" y="9" width="9" height="7" rx="2" {...soft}/><rect x="3" y="9" width="9" height="7" rx="2" {...base}/><circle cx="17" cy="12.5" r="4" {...base}/><path d="M17 9.7v5.6M14.2 12.5h5.6" {...base} strokeWidth={1.3}/><path d="M12 12.5h1M2 19h20" {...base}/>{spark(6.4,11.4,.9)}</>,
 guide:<><circle cx="12" cy="12" r="9" {...soft}/><circle cx="12" cy="12" r="9" {...base}/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.7 2.2c-.9.5-1.3 1-1.3 1.9" {...base}/>{spark(12,17,1.1)}</>,
};

export function CabinetIcon({name,size=18}:{name:CabinetIconName;size?:number}){return <svg className="cab-ico" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">{SHAPES[name]}</svg>;}
