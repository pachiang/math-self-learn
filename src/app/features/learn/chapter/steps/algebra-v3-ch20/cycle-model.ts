import { Permutation } from '../algebra-v3-ch19/permutation-model';
export const LABELS6=['A','B','C','D','E','F'];
export const DEMO_PERMUTATION:Permutation=[1,2,0,4,3,5];
export function orbit(permutation:Permutation,seed:number):number[]{const result=[seed];let next=permutation[seed];while(next!==seed){result.push(next);next=permutation[next];}return result;}
export function cycleLabel(items:number[],labels=LABELS6):string{return`(${items.map(i=>labels[i]).join(' ')})`;}
