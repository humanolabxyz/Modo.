export function LogoModo({symbol=false}:{symbol?:boolean}) {
  if(symbol)return <img className="modo-logo modo-symbol" src="/brand/modo-simbolo-negro.svg" alt="modo." width="26" height="28"/>;
  return <img className="modo-logo" src="/brand/modo-logo-horizontal-color.svg" alt="modo." width="274" height="80"/>;
}
