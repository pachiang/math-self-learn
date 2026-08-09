import{D3_ELEMENTS,type D3Element,conjugate}from'../algebra-v3-ch16/d3-model';
export function centralizerOf(h:D3Element):D3Element[]{return D3_ELEMENTS.filter(k=>conjugate(k,h)===h)}
export function classOf(h:D3Element):D3Element[]{return[...new Set(D3_ELEMENTS.map(k=>conjugate(k,h)))]}
export function conjugacyPartition():D3Element[][]{const unseen=new Set<D3Element>(D3_ELEMENTS);const out:D3Element[][]=[];while(unseen.size){const h=unseen.values().next().value as D3Element;const group=classOf(h);group.forEach(x=>unseen.delete(x));out.push(group)}return out}
