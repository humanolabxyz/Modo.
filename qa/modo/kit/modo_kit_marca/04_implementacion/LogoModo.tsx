type LogoModoProps = { dark?: boolean; height?: number; className?: string };
/** Copiar los SVG de 01_svg_vector a public/brand/. */
export function LogoModo({ dark = false, height = 32, className = '' }: LogoModoProps) {
  return <img
    src={`/brand/${dark ? 'modo-logo-horizontal-blanco.svg' : 'modo-logo-horizontal-color.svg'}`}
    alt="modo."
    height={height}
    style={{ height, width: 'auto', display: 'block' }}
    className={className}
  />;
}
