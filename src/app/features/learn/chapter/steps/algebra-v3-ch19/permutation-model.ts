export type Permutation = readonly number[];
export function compose(left:Permutation,right:Permutation):number[]{return right.map(value=>left[value]);}
export function inverse(permutation:Permutation):number[]{const result=Array(permutation.length).fill(0);permutation.forEach((value,index)=>result[value]=index);return result;}
export function key(permutation:Permutation):string{return permutation.join('');}
export function display(permutation:Permutation,labels=['A','B','C','D']):string{return permutation.map((value,index)=>`${labels[index]}→${labels[value]}`).join(' · ');}
export const S3:number[][]=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
