import type {Rung} from '../model/types.ts';

export default function LadderNetwork({rung, number, flow, live}: {
  rung: Rung; number: number; flow: {on: boolean; branches: boolean[][]}; live: boolean;
}) {
  const gap = 100, row = 52;
  const width = Math.max(440, Math.max(...rung.branches.map(branch => branch.length)) * gap + 185);
  const height = rung.branches.length * row + 14;
  const join = width - 130;
  return <div className="ind-ladder-network">
    <svg width={width} height={height} role="img" aria-label={`Red Ladder ${number}: ${rung.coil.tag}`}>
      <path d={`M12 8V${height - 8} M${width - 12} 8V${height - 8}`} className="ind-rail" />
      <path d={`M${join} 34V${height - 32} M${join} 34H${width - 83} M${width - 42} 34H${width - 12}`} className={live && flow.on ? 'is-live' : ''} />
      {rung.branches.map((branch, bi) => {
        const y = 34 + bi * row;
        const active = live && branch.length > 0 && !!flow.branches[bi]?.[branch.length - 1];
        return <g key={bi}>
          <path d={`M12 ${y}H${join}`} className={active ? 'is-live' : ''} />
          {branch.map((contact, ci) => {
            const x = 64 + ci * gap;
            return <g key={ci} className={live && flow.branches[bi]?.[ci] ? 'is-live' : ''}>
              <rect x={x - 9} y={y - 10} width="18" height="20" />
              <path d={`M${x - 8} ${y - 10}v20 M${x + 8} ${y - 10}v20${contact.nc ? ` M${x - 11} ${y + 13}l22 -26` : ''}`} />
              <text x={x} y={y - 15}>{contact.tag.length > 16 ? contact.tag.slice(0, 15) + '…' : contact.tag}</text>
            </g>;
          })}
        </g>;
      })}
      <g className={live && flow.on ? 'is-live' : ''}>
        <text x={width - 62} y="17">{rung.coil.tag.length > 16 ? rung.coil.tag.slice(0, 15) + '…' : rung.coil.tag}</text>
        <path d={`M${width - 75} 23q-12 11 0 22 M${width - 49} 23q12 11 0 22`} />
        <text x={width - 62} y="38">{rung.coil.mode === 'out' ? '' : rung.coil.mode.toUpperCase()}</text>
      </g>
    </svg>
  </div>;
}
