import {ShieldCheck} from 'lucide-react';
import '../styles/legal-links.css';

export function LegalLink() {
  return <a className="humano-legal-link" href="/legal/" target="_blank" rel="noopener noreferrer" aria-label="Humano Lab: créditos y políticas (abre otra pestaña)" title="Humano Lab · Créditos y políticas">
    <ShieldCheck size={18} aria-hidden="true"/><span>Créditos y políticas</span>
  </a>;
}
