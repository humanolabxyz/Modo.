import {ArrowUpRight,UsersRound} from 'lucide-react';
import '../styles/community-card.css';

export function CommunityCard(){
 return <a className="modo-card modo-community" href="/comunidad/" aria-labelledby="community-entry-title">
  <span className="modo-community-icon"><UsersRound size={30} aria-hidden="true"/></span>
  <div className="modo-community-copy"><p className="modo-eyebrow">PERSONAS QUE SUMAN</p><h2 id="community-entry-title">Comunidad</h2><p>Conoce a quienes ayudan a mejorar modo.</p></div>
  <span className="modo-community-note" aria-hidden="true">Aprender.<br/>Compartir.<br/>Construir juntos.</span>
  <span className="modo-community-arrow" aria-hidden="true"><ArrowUpRight size={23}/></span>
 </a>;
}
