export function mod(value:number,n:number){return((value%n)+n)%n;}
export function gcd(a:number,b:number):number{let x=Math.abs(a),y=Math.abs(b);while(y){[x,y]=[y,x%y];}return x;}
export function inverseMod(a:number,n:number):number|null{for(let b=0;b<n;b++)if(mod(a*b,n)===1)return b;return null;}
export function multiplicationOutputs(a:number,n:number){return Array.from({length:n},(_,x)=>({x,output:mod(a*x,n)}));}
export function coverage(a:number,n:number,steps=n){return multiplicationOutputs(a,n).slice(0,steps);}
export function rationalPartner(value:number):string|null{if(value===0)return null;if(value===1||value===-1)return String(value);return `1/${value}`;}
export const UNITS_MOD_10=[1,3,7,9] as const;
export function isUnitMod10(value:number){return UNITS_MOD_10.includes(mod(value,10) as 1|3|7|9);}
export function inverseMod10(value:number){return inverseMod(value,10);}
