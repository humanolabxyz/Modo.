import type {ReactNode} from 'react';
import type {DeviceKind,Widget} from './model';
/** Iconos de los menús del dock: el mismo símbolo normalizado que se dibuja en el esquema, a tamaño de botón. */
const base={width:22,height:22,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.7,strokeLinecap:'round' as const,strokeLinejoin:'round' as const,'aria-hidden':true};
export function DeviceIcon({kind}:{kind:DeviceKind}){
  const art:Record<DeviceKind,ReactNode>={
    supply:<><path d="M12 2v5M12 17v5"/><circle cx="12" cy="12" r="5"/><path d="M12 9.6v4.8M9.6 12h4.8" strokeWidth="1.3"/></>,
    no:<><path d="M2 17h6M16 17h6"/><path d="M8 17l7-5"/><path d="M12 12V6M8.5 6h7"/></>,
    nc:<><path d="M2 17h6M16 17h6"/><path d="M8 17h8"/><path d="M10 21l5-8"/><path d="M12 11.5V6M8.5 6h7"/></>,
    coil:<><path d="M2 12h4M18 12h4"/><rect x="6" y="7" width="12" height="10" rx="1.5"/><path d="M9 10v4M12 10v4M15 10v4" strokeWidth="1.2"/></>,
    contact:<><path d="M2 12h6M16 12h6"/><path d="M8 6v12M16 6v12"/></>,
    lamp:<><path d="M2 12h3M19 12h3"/><circle cx="12" cy="12" r="7"/><path d="M7.2 7.2l9.6 9.6M16.8 7.2l-9.6 9.6"/></>,
    motor:<><path d="M2 12h3M19 12h3"/><circle cx="12" cy="12" r="7"/><path d="M8.6 15.4v-6.8l3.4 4.4 3.4-4.4v6.8" strokeWidth="1.5"/></>,
    output:<><path d="M2 12h6M16 12h6"/><path d="M8 6v12M16 6v12"/><path d="M12 6V3.5M9.5 3.5h5"/></>,
    breaker:<><path d="M12 2v5M12 17v5M12 17l5-10"/><circle cx="12" cy="7" r="1"/><path d="M5 9v6M3 9h4"/></>,
    fuse:<><path d="M12 2v20"/><rect x="8" y="6" width="8" height="12" rx="1"/></>,
    emergency:<><path d="M2 17h20M12 12v5M6 7h12v4H6zM7 4h10"/><path d="M9 20l6-6"/></>,
    selector:<><path d="M2 17h6M16 17h6M8 17l8-5M12 9V3M8 5l4-2 4 2"/></>,
    'contact-nc':<><path d="M2 12h6M16 12h6M8 6v12M16 6v12M6 19L18 5"/></>,
    terminal:<><path d="M2 12h20"/><rect x="6" y="6" width="12" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></>,
    buzzer:<><path d="M2 12h4M18 12h4"/><circle cx="12" cy="12" r="6"/><path d="M10 9h2l3-2v10l-3-2h-2z"/></>,
  };
  return <svg {...base} className="lab-device-icon">{art[kind]}</svg>;
}
export function WidgetIcon({kind}:{kind:Widget['kind']}){
  const art:Record<Widget['kind'],ReactNode>={
    toggle:<><rect x="3" y="8" width="18" height="8" rx="4"/><circle cx="16" cy="12" r="2.6" fill="currentColor"/></>,
    lamp:<><circle cx="12" cy="12" r="4.4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/></>,
    number:<><rect x="2.5" y="6" width="19" height="12" rx="2"/><path d="M7 10.2v3.6M10 10.2v3.6M13 10.2h2.5v1.8H13v1.8h2.5" strokeWidth="1.4"/></>,
    bar:<><rect x="3" y="9" width="18" height="6" rx="3"/><rect x="5" y="11" width="8" height="2" rx="1" fill="currentColor" stroke="none"/></>,
  };
  return <svg {...base} className="lab-device-icon">{art[kind]}</svg>;
}
export const iconTile=(node:ReactNode)=><span className="lab-menu-icon">{node}</span>;
