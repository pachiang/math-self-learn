import { Component, computed, signal } from '@angular/core';
import { allFunctionPairs, evaluateA, KernelPair, pairLabel } from './rings-ch8-model';

@Component({
  selector: 'app-rings-ch8-zero-fiber-kernel',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">Rings & Ideals · 8.1</p><h2>Kernel 是整條 zero-output fiber，不是零星失敗名單</h2><p class="lede">把target dock反向追蹤回source。每個dock都有自己的fiber，但只有additive identity 0上方的完整preimage，稱為核（kernel）。</p></header>

      <section class="prediction"><div><p class="kicker">先圈boundary</p><h3>ev_A只讀A lane。Kernel只有zero function (0,0)，還是所有(0,b)？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set('single')">只有(0,0)</button><button type="button" (click)="prediction.set('fiber')">所有(0,b)</button></div>@if(prediction()){<p class="feedback" [class.warning]="prediction()==='single'">{{prediction()==='fiber'?'對。B lane可以非零，只要target仍讀到0。':'Kernel問的是「map看成0」，不是source element本身是否等於0。'}}</p>}</section>

      <div class="control-row"><span class="kicker">TARGET DOCK</span>@for(value of targets;track value){<button type="button" [class.active]="target()===value" (click)="selectTarget(value)">{{value}}</button>}<button type="button" (click)="trace()">TRACE PREIMAGE</button>@if(transferUnlocked()){<button type="button" [class.active]="mode()==='mod6'" (click)="toggleTransfer()">{{mode()==='function'?'TRANSFER · q MOD 6':'BACK · ev_A'}}</button>}<button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid">
        <div class="fiber-scanner">
          @if(mode()==='function'){
            <div [class.kernel-shell]="traced()&&target()===0"><div class="fiber-source">@for(pair of pairs;track pairLabel(pair)){<span class="fiber-card" [class.lit]="traced()&&evaluate(pair)===target()" [class.kernel]="traced()&&target()===0&&evaluate(pair)===0"><strong>{{pairLabel(pair)}}</strong><small>A→{{pair[0]}} · B→{{pair[1]}}</small></span>}</div></div>
          }@else{
            <div class="fiber-source integer">@for(value of integerWindow;track value){<span class="fiber-card" [class.lit]="traced()&&modSix(value)===target()" [class.kernel]="traced()&&target()===0&&modSix(value)===0"><strong>{{value}}</strong><small>q→{{modSix(value)}}</small></span>}</div>
          }
          <div class="fiber-arrow-stack"><span>{{mode()==='function'?'ev_A':'q mod 6'}}</span><div class="fiber-trace"></div><small>TRACE BACKWARD</small></div>
          <div class="target-docks">@for(value of targets;track value){<button type="button" class="target-dock" [class.zero]="value===0" [class.active]="target()===value" (click)="selectTarget(value)"><span>{{value===0?'TARGET ZERO':'TARGET '+value}}</span><strong>{{value}}</strong></button>}<div class="fiber-summary" aria-live="polite"><span class="evidence-badge">{{evidenceLabel()}}</span><strong>{{fiberTitle()}}</strong><span>{{fiberReading()}}</span></div></div>
        </div>
        <aside class="console" aria-live="polite"><p class="kicker">{{mode()==='function'?'FINITE FUNCTION MAP':'FINITE WINDOW · INFINITE MAP'}}</p><h3>{{fiberTitle()}}</h3><p>{{fiberReading()}}</p><div class="readout">{{setReading()}}</div></aside>
      </section>

      @if(traced()&&target()===0&&mode()==='function'){<div class="callback-strip"><strong>CALLBACK · Ch7.4</strong><span>同一fiber中的兩張cards，其difference會落進這條zero fiber。</span></div>}
      <section class="insight"><span class="insight-icon">ker</span><div><strong>Kernel不是source裡的0</strong><span>它是所有被map看成target 0的完整區域。</span></div></section>
      <details><summary>符號層：kernel與fiber</summary><p><code>ker φ = φ⁻¹(&#123;0_S&#125;)</code>。一般fiber是某個target element的完整preimage；kernel專指0_S上方的fiber。本頁16張cards可完整掃描目前finite map，但mod-6 window不等於對所有integers的proof。</p></details>
    </article>
  `,
})
export class RingsCh8ZeroFiberKernelComponent {
  readonly targets = [0, 1, 2, 3] as const;
  readonly pairs = allFunctionPairs();
  readonly integerWindow = Array.from({ length: 28 }, (_, index) => index - 12);
  readonly target = signal(0);
  readonly traced = signal(false);
  readonly mode = signal<'function' | 'mod6'>('function');
  readonly transferUnlocked = signal(false);
  readonly prediction = signal<'single' | 'fiber' | null>(null);
  readonly fiberTitle = computed(() => !this.traced() ? 'PREIMAGE NOT TRACED' : this.target() === 0 ? 'KERNEL · ZERO-OUTPUT FIBER' : `FIBER OVER ${this.target()} · NOT THE KERNEL`);
  readonly fiberReading = computed(() => !this.traced()
    ? '選一個target dock，再反向照亮它的完整preimage。'
    : this.mode() === 'function' ? `4張source cards被ev_A送到${this.target()}。` : `目前window只顯示q(n)=${this.target()}的部分integers；pattern向兩端延伸。`);
  readonly setReading = computed(() => !this.traced() ? 'φ⁻¹(?)' : this.mode() === 'function'
    ? `{ ${this.pairs.filter(pair => evaluateA(pair) === this.target()).map(pairLabel).join(', ')} }`
    : this.target() === 0 ? 'visible pattern: …, −12, −6, 0, 6, 12, … = 6ℤ' : `integers congruent to ${this.target()} mod 6`);
  readonly evidenceLabel = computed(() => !this.traced() ? 'UNTRACED' : this.mode() === 'function' ? 'FINITE EXHAUSTION · THIS MAP' : 'FINITE WINDOW · PATTERN');
  pairLabel = pairLabel;
  evaluate = evaluateA;
  modSix(value: number): number { return ((value % 6) + 6) % 6; }
  selectTarget(value: number): void { this.target.set(value); this.traced.set(false); }
  trace(): void { this.traced.set(true); if (this.target() === 0) this.transferUnlocked.set(true); }
  toggleTransfer(): void { this.mode.update(mode => mode === 'function' ? 'mod6' : 'function'); this.target.set(0); this.traced.set(false); }
  reset(): void { this.target.set(0); this.traced.set(false); this.mode.set('function'); this.transferUnlocked.set(false); this.prediction.set(null); }
}
