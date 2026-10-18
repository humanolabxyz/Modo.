import {newReviewLog,parseReview,recordRight,recordWrong,reviewKey,type ConceptId,type ReviewLog} from './temperatureReview';
/** Lectura y escritura del registro de repaso en el navegador. Un guardado ilegible se conserva sin sobrescribir. */
export function readReview():{log:ReviewLog;blocked:boolean}{
  try{const raw=localStorage.getItem(reviewKey);return {log:raw?parseReview(raw):newReviewLog(),blocked:false};}
  catch(error){return {log:newReviewLog(),blocked:localStorage.getItem(reviewKey)!==null&&!(error instanceof DOMException)};}
}
export function writeReview(log:ReviewLog):boolean{try{localStorage.setItem(reviewKey,JSON.stringify(log));return true;}catch{return false;}}
const update=(id:ConceptId,change:(log:ReviewLog,id:ConceptId)=>ReviewLog)=>{const {log,blocked}=readReview();if(!blocked)writeReview(change(log,id));};
export const noteWrong=(id:ConceptId)=>update(id,recordWrong);
export const noteRight=(id:ConceptId)=>update(id,recordRight);
