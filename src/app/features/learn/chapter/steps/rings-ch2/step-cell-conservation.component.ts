import { Component, computed, signal } from '@angular/core';
import { RouteMode } from './rings-ch2-model';

@Component({
  selector: 'app-rings-ch2-cell-conservation', standalone: true,
  template: `
  <article class="algebra-v3-lesson rings-lesson">
    <header class="hero"><p class="eyebrow">Rings & Ideals · 2.1</p><h2>Distribute 不是把括號擦掉：同一個作用被送進 sum 的每個分支</h2><p class="lede">這塊 board 只有一批帶座標的 cells。WHOLE route 先把兩段合成長 strip；SPLIT route 先各自複製。執行順序不同，沒有任何 cell 被新增或遺漏。</p></header>
    <section class="prediction"><div><p class="kicker">先預測</p><h3>先合再複製，會比先分別複製多出 cells 嗎？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set('same')">不會，同一批</button><button type="button" (click)="prediction.set('more')">會，whole 更多</button></div>@if(prediction()){<p class="feedback" [class.warning]="prediction()==='more'">{{prediction()==='same'?'對。接著改 seam，追蹤哪些 cells 變了分組、哪些量保持不變。':'括號只決定何時分組；它不會創造額外 rows 或 columns。'}}</p>}</section>
    <div class="control-row">
      <label class="compact-control">rows a <input type="range" min="1" max="5" [value]="a()" (input)="setNumber(a,$event)"><strong>{{a()}}</strong></label>
      <label class="compact-control">left b <input type="range" min="1" max="6" [value]="b()" (input)="setB($event)"><strong>{{b()}}</strong></label>
      <label class="compact-control">right c <input type="range" min="1" max="6" [value]="c()" (input)="setC($event)"><strong>{{c()}}</strong></label>
      <div class="route-toggle"><button type="button" [class.active]="route()==='whole'" (click)="route.set('whole')">WHOLE FIRST</button><button type="button" class="multiply" [class.active]="route()==='split'" (click)="route.set('split')">SPLIT FIRST</button><button type="button" [class.active]="route()==='both'" (click)="route.set('both')">OVERLAY</button></div>
      <button type="button" (click)="reset()">重設</button>
    </div>
    <section class="stage stage-grid">
      <div class="tile-lab" role="img" [attr.aria-label]="ariaLabel()">
        <div class="tile-board" [style.grid-template-columns]="'repeat(' + totalWidth() + ', 1fr)'">
          @for(cell of cells();track cell.id){<span class="tile-cell" [class.left]="cell.side==='left'" [class.right]="cell.side==='right'" [class.seam]="cell.column===b()"><small>{{cell.row}},{{cell.column}}</small></span>}
        </div>
        <div class="tile-legend"><span><i class="left"></i>{{a()}}×{{b()}} = {{leftCount()}}</span><span><i class="right"></i>{{a()}}×{{c()}} = {{rightCount()}}</span></div>
        <div class="same-stamp">{{ routeReading() }}</div>
      </div>
      <aside class="console" aria-live="polite"><p class="kicker">CELL LEDGER</p><h3>{{totalCount()}} cells，兩條 routes 完全對齊</h3><p>Seam 只改變 cells 被分到哪一包；總 board 仍是 {{a()}} rows × {{totalWidth()}} columns。</p><div class="readout">{{a()}}({{b()}}+{{c()}}) = {{totalCount()}} = {{leftCount()}}+{{rightCount()}}</div></aside>
    </section>
    <section class="insight"><span class="insight-icon">▦</span><div><strong>同一批 cells，不同分組順序</strong><span>整體作用與分支作用沒有增加或漏掉任何 cell。</span></div></section>
    <details><summary>壓縮成公式</summary><p>Overlay 對齊後，cell conservation 才壓縮成 <code>a(b+c)=ab+ac</code>。下一節會移除 rectangle，保留真正重要的 two-route structure。</p></details>
  </article>`
})
export class RingsCh2CellConservationComponent {
  readonly a=signal(3); readonly b=signal(3); readonly c=signal(2); readonly route=signal<RouteMode>('whole'); readonly prediction=signal<'same'|'more'|null>(null);
  readonly totalWidth=computed(()=>this.b()+this.c()); readonly leftCount=computed(()=>this.a()*this.b()); readonly rightCount=computed(()=>this.a()*this.c()); readonly totalCount=computed(()=>this.a()*this.totalWidth());
  readonly cells=computed(()=>Array.from({length:this.totalCount()},(_,index)=>{const row=Math.floor(index/this.totalWidth())+1;const column=index%this.totalWidth()+1;return{id:`${row}-${column}`,row,column,side:column<=this.b()?'left' as const:'right' as const};}));
  readonly routeReading=computed(()=>this.route()==='whole'?'WHOLE：先 bracket 寬度，再複製 rows':this.route()==='split'?'SPLIT：兩段各自複製，再沿 seam 拼接':'OVERLAY：每個 row,column identity 一一重合');
  readonly ariaLabel=computed(()=>`${this.a()} 乘以 ${this.b()} 加 ${this.c()} 的 tile board，共 ${this.totalCount()} 格，目前顯示 ${this.routeReading()}`);
  setNumber(target:{set(value:number):void},event:Event){const input=event.currentTarget;if(input instanceof HTMLInputElement)target.set(+input.value);}
  setB(event:Event){const input=event.currentTarget;if(input instanceof HTMLInputElement)this.b.set(Math.min(+input.value,7-this.c()));}
  setC(event:Event){const input=event.currentTarget;if(input instanceof HTMLInputElement)this.c.set(Math.min(+input.value,7-this.b()));}
  reset(){this.a.set(3);this.b.set(3);this.c.set(2);this.route.set('whole');this.prediction.set(null);}
}
