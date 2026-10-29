import {ArrowLeft} from 'lucide-react';
import {unit2ReviewUrl} from './studyFocus';
export const inUnit2Review=()=>typeof location!=='undefined'&&new URLSearchParams(location.search).get('repaso')==='unidad2';
export function ExamReviewContext(){return inUnit2Review()?<a className="exam-return-link" href={unit2ReviewUrl}><ArrowLeft size={16}/>Volver al repaso de la prueba</a>:null;}
