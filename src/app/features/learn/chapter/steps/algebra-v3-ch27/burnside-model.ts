export function binaryStrings(n:number):string[]{return Array.from({length:2**n},(_,i)=>i.toString(2).padStart(n,'0'))}
export function rotate(bits:string,k:number):string{const n=bits.length,s=((k%n)+n)%n;return bits.slice(s)+bits.slice(0,s)}
export function orbit(bits:string):string[]{return[...new Set(Array.from({length:bits.length},(_,k)=>rotate(bits,k)))]}
export function orbitClasses(n:number):string[][]{const unseen=new Set(binaryStrings(n)),out:string[][]=[];while(unseen.size){const x=unseen.values().next().value!;const group=orbit(x);group.forEach(y=>unseen.delete(y));out.push(group)}return out}
export function fixedStrings(n:number,k:number):string[]{return binaryStrings(n).filter(x=>rotate(x,k)===x)}
export function gcd(a:number,b:number):number{while(b)[a,b]=[b,a%b];return Math.abs(a)}
export function positionCycles(n:number,k:number):number[][]{const unseen=new Set(Array.from({length:n},(_,i)=>i)),out:number[][]=[];while(unseen.size){const start=unseen.values().next().value!,cycle:number[]=[];let x=start;do{cycle.push(x);unseen.delete(x);x=(x+k)%n}while(x!==start);out.push(cycle)}return out}
