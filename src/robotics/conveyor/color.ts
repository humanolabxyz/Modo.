import type {PartInstance} from '../project/types.ts';
import {COLOR_RGB, SORT_COLORS, type SortColor} from './constants.ts';

/** A didactic RGB sensor: classification uses the piece surface values, never its ID. */
export function readPieceColor(piece: PartInstance): {rgb:number[];color:SortColor|null} {
  const rgb=['surfaceR','surfaceG','surfaceB'].map(key=>Number(piece.props?.[key]??NaN));
  if(!rgb.every(v=>Number.isFinite(v)&&v>=0&&v<=255))return {rgb,color:null};
  const matches=SORT_COLORS.map(color=>({color,error:Math.hypot(...rgb.map((v,i)=>v-COLOR_RGB[color][i]))})).sort((a,b)=>a.error-b.error);
  return {rgb,color:matches[0].error<=65?matches[0].color:null};
}
export function pieceSurface(piece: PartInstance, fallback='#e59c37') {
  const {rgb}=readPieceColor(piece);
  return rgb.every(v=>Number.isFinite(v)&&v>=0&&v<=255)?`rgb(${rgb.map(Math.round).join(',')})`:fallback;
}
