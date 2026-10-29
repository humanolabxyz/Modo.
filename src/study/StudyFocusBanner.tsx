import {ArrowRight,CalendarDays} from 'lucide-react';
import {unit2ReviewUrl} from './studyFocus';
import '../styles/study-focus-unit2.css';
export function StudyFocusBanner(){return <aside className="study-exam-focus" aria-label="Preparar prueba de la Unidad 2"><div className="exam-focus-date"><CalendarDays size={20} aria-hidden="true"/><span>LUNES<strong>19 OCT</strong></span></div><div className="exam-focus-copy"><span>FOCO EN ÁLGEBRA · FUNCIONES Y MATRICES</span><h2>Unidad 2: exponenciales y logaritmos</h2><p>Revisa la materia, sigue los ejemplos y practica para tu prueba.</p></div><a href={unit2ReviewUrl}>Preparar la prueba<ArrowRight size={17} aria-hidden="true"/></a></aside>;}
