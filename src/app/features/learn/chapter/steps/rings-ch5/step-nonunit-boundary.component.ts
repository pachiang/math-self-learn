import { Component, computed, signal } from '@angular/core';
import { multiplyMod } from './rings-ch5-model';

type InspectionLens = 'distinction' | 'coverage';

@Component({
  selector: 'app-rings-ch5-nonunit-boundary',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">Rings & Ideals · 5.3</p><h2>Nonunit 可能只是漏掉 outputs，不一定壓掉 inputs</h2><p class="lede">固定同一台 ×2 machine，把兩個 ambient worlds 同時攤開。沒有 global undo 可能來自 gaps，也可能同時伴隨 collisions。</p></header>
      <div class="general-banner"><span>CONTROLLED COMPARISON · ONLY AMBIENT CHANGES</span><code>x ↦ 2x stays fixed</code></div>
      <section class="prediction"><div><p class="kicker">先預測</p><h3>2 在 ℤ 與 ℤ/10ℤ 中都不是 unit；兩邊是否都必然有 collision？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(false)">不必然</button><button type="button" (click)="prediction.set(true)">一定都有</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()">{{prediction()?'「不能完整倒帶」沒有說明是漏掉outputs，還是壓掉inputs。':'對。ℤ中的×2保留source distinction；mod 10才讓x與x+5合流。'}}</p>}</section>
      <div class="control-row"><span class="kicker">INSPECTION LENS</span><button type="button" [class.active]="lens()==='distinction'" (click)="lens.set('distinction')">INPUT DISTINCTION</button><button type="button" [class.active]="lens()==='coverage'" (click)="lens.set('coverage')">OUTPUT COVERAGE</button><button type="button" (click)="shift.update(v=>v-1)">INTEGER VIEW ←</button><button type="button" (click)="shift.set(-2)">CENTER</button><button type="button" (click)="shift.update(v=>v+1)">INTEGER VIEW →</button></div>

      <section class="stage stage-grid">
        <div class="world-comparison">
          <div class="map-world infinite">
            <div class="world-heading"><div><p class="kicker">INFINITE WORLD · VIEWPORT ONLY</p><h3>ℤ · integers</h3></div><strong>×2</strong></div>
            <div class="map-rows">
              @for(row of integerRows();track row.input){
                <div class="map-row" [class.dim]="lens()==='coverage'&&!row.gapAfter"><strong>{{row.input}}</strong><span class="map-arrow"></span><strong>{{row.output}}</strong></div>
                @if(row.gapAfter){<div class="map-row" [class.dim]="lens()==='distinction'"><span>—</span><span class="map-arrow"></span><strong>{{row.output+1}} · GAP</strong></div>}
              }
            </div>
            <div class="status-pair"><span class="status-chip pass">DISTINCT INPUTS · PRESERVED</span><span class="status-chip fail">EVERY OUTPUT · NO</span></div>
          </div>
          <div class="map-world finite">
            <div class="world-heading"><div><p class="kicker">FINITE EXHAUSTION · ALL 10 INPUTS</p><h3>ℤ/10ℤ</h3></div><strong>×2</strong></div>
            <div class="map-rows">
              @for(group of modularGroups();track group.output){<div class="map-row collision" [class.dim]="lens()==='coverage'&&!group.gap"><strong>{{group.sources.join(',')}}</strong><span class="map-arrow"></span><strong>{{group.output}}</strong></div>}
              @if(lens()==='coverage'){@for(gap of modularGaps;track gap){<div class="map-row"><span>—</span><span class="map-arrow"></span><strong>{{gap}} · GAP</strong></div>}}
            </div>
            <div class="status-pair"><span class="status-chip fail">DISTINCT INPUTS · NO</span><span class="status-chip fail">EVERY OUTPUT · NO</span></div>
          </div>
        </div>
        <aside class="console" aria-live="polite"><span class="evidence-badge">CONTROLLED EXAMPLE</span><h3>{{lens()==='distinction'?'WHO GETS MERGED?':'WHAT NEVER GETS REACHED?'}}</h3><p>{{lensText()}}</p><div class="readout">UNIT? no in both · ZERO DIVISOR? ℤ: no / ℤ/10ℤ: yes</div></aside>
      </section>
      <section class="insight"><span class="insight-icon">2</span><div><strong>Unit 要求沒有 collisions，也沒有 gaps；zero divisor 只偵測 collisions</strong><span>Nonunit 只告訴你至少一項失敗，沒有告訴你是哪一項。</span></div></section>
      <details><summary>單射、滿射與雙射</summary><p>單射（injective）表示不同inputs保持不同；滿射（surjective）表示每個output都有來源；雙射（bijective）同時滿足兩者。固定乘unit的map是bijective。ℤ上的×2 injective但不surjective。</p></details>
      <details><summary>為何 finite world 特別容易混淆？</summary><p><span class="evidence-badge">FINITE COMMUTATIVE RING ONLY</span> 有限集合的self-map中injective等價於surjective。因此有限commutative ring裡，每個非零nonunit都是zero divisor；這不能不加scope地推到ℤ等無限rings。</p></details>
    </article>
  `,
})
export class RingsCh5NonunitBoundaryComponent {
  readonly lens = signal<InspectionLens>('distinction');
  readonly shift = signal(-2);
  readonly prediction = signal<boolean|null>(null);
  readonly modularGaps = [1,3,5,7,9] as const;
  readonly integerRows = computed(() => Array.from({length:5},(_,index)=>{
    const input=this.shift()+index;
    return {input,output:input*2,gapAfter:true};
  }));
  readonly modularGroups = computed(() => [0,2,4,6,8].map(output=>({output,sources:Array.from({length:10},(_,x)=>x).filter(x=>multiplyMod(2,x)===output),gap:false})));
  readonly lensText = computed(() => this.lens()==='distinction'
    ? '左欄每個source各有自己的output；右欄每個even socket疊著兩個source labels。'
    : '兩欄都漏掉outputs，但只有右欄也發生source collision。Gaps與collisions是不同證據。');
}
