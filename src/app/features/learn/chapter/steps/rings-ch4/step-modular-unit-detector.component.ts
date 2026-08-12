import { Component, computed, signal } from '@angular/core';
import { coverage, gcd, inverseMod, mod } from './rings-ch4-model';

@Component({
  selector: 'app-rings-ch4-modular-unit-detector',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero">
        <p class="eyebrow">Rings & Ideals · 4.4</p>
        <h2>在 modular world 裡，coprime multiplier 才能掃過每一個 socket</h2>
        <p class="lede">這一節只研究 ℤ/nℤ。讓 ×a 逐步走過所有 inputs：若 outputs 沒有碰撞也沒有缺口，inverse 才有位置出現。</p>
      </header>

      <div class="general-banner modular-only"><span>CASE STUDY · ℤ/nℤ ONLY</span><code>gcd(a,n)=1 ⇔ a is a unit mod n</code></div>

      <section class="prediction">
        <div><p class="kicker">先預測</p><h3>在 ℤ/10ℤ 中，×3 與 ×4 哪一台會覆蓋全部 outputs？</h3></div>
        <div class="choice-row"><button type="button" (click)="prediction.set(3)">×3</button><button type="button" (click)="prediction.set(4)">×4</button></div>
        @if (prediction() !== null) {<p class="feedback" [class.warning]="prediction()!==3">{{ prediction()===3 ? '對。3與10沒有共同factor，路線不會提早合流。' : '×4 只會走到偶數 sockets；共同factor 2 把coverage壓縮了。' }}</p>}
      </section>

      <div class="control-row"><span class="kicker">MODULUS n</span>@for(v of moduli;track v){<button type="button" [class.active]="n()===v" (click)="setModulus(v)">{{v}}</button>}<span class="kicker">MULTIPLIER a</span><button type="button" (click)="changeA(-1)">−</button><strong>{{a()}}</strong><button type="button" (click)="changeA(1)">＋</button><button type="button" (click)="step()">STEP x</button><button type="button" (click)="complete()">COMPLETE</button><button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid">
        <div class="coverage-board">
          <div class="input-ruler">
            @for (row of rows(); track row.x) {
              <div class="input-step" [class.visited]="row.visited"><strong>x={{row.x}}</strong><span>{{row.visited ? '→ '+row.output : '等待測試'}}</span></div>
            }
          </div>
          <div class="coverage-wheel" role="img" [attr.aria-label]="ariaLabel()">
            @for (node of wheelNodes(); track node.output) {
              <span class="wheel-node" [class.visited]="node.inputs.length>0" [class.inverse]="node.output===1 && node.inputs.includes(inverse() ?? -1)" [style.left.%]="node.left" [style.top.%]="node.top">
                {{node.output}}<small>{{node.inputs.length ? 'from x='+node.inputs.join(',') : 'empty'}}</small>
              </span>
            }
          </div>
        </div>
        <aside class="console" aria-live="polite"><p class="kicker">FINITE EXHAUSTION</p><h3>{{finished() ? (isUnit() ? 'FULL COVERAGE' : 'GAPS / COLLISIONS') : visited()+' / '+n()+' inputs tested'}}</h3><p>gcd({{a()}}, {{n()}}) = {{commonFactor()}}</p><p>{{finished() ? explanation() : '每按一次 STEP，input label會跟著output保留，讓collision有可追蹤的來源。'}}</p><div class="readout">inverse witness：{{inverse() ?? 'none'}}</div></aside>
      </section>

      <section class="insight"><span class="insight-icon">◎</span><div><strong>共同 factor 會讓不同 inputs 合流；coprime 才能完整排列 residues</strong><span>這是 finite modular rings 的 detector，不是所有 rings 的 unit 定義。</span></div></section>
      <details><summary>為什麼 coverage 數量由 gcd 控制？</summary><p>在 ℤ/nℤ 中，×a 的 image 有 n/gcd(a,n) 個 residues。只有 gcd(a,n)=1 時 image 才有 n 個元素，因此 multiplication map 是 permutation，且 a 有 inverse。</p></details>
    </article>
  `,
})
export class RingsCh4ModularUnitDetectorComponent {
  readonly moduli = [8, 10, 12, 15] as const;
  readonly n = signal(10);
  readonly a = signal(3);
  readonly visited = signal(0);
  readonly prediction = signal<number | null>(null);
  readonly commonFactor = computed(() => gcd(this.a(), this.n()));
  readonly inverse = computed(() => inverseMod(this.a(), this.n()));
  readonly isUnit = computed(() => this.commonFactor() === 1);
  readonly finished = computed(() => this.visited() === this.n());
  readonly traces = computed(() => coverage(this.a(), this.n(), this.visited()));
  readonly rows = computed(() => Array.from({length: this.n()}, (_, x) => ({x, output: mod(this.a()*x, this.n()), visited: x < this.visited()})));
  readonly wheelNodes = computed(() => Array.from({length: this.n()}, (_, output) => {
    const angle = -Math.PI / 2 + 2 * Math.PI * output / this.n();
    return {output, inputs: this.traces().filter(t => t.output === output).map(t => t.x), left: 50 + 43*Math.cos(angle), top: 50 + 43*Math.sin(angle)};
  }));
  readonly explanation = computed(() => this.isUnit() ? `每個output恰有一個來源；x=${this.inverse()} 是抵達1的inverse witness。` : `共同factor ${this.commonFactor()} 讓不同inputs撞進同一socket，也留下永遠抵達不了的gaps。`);
  readonly ariaLabel = computed(() => `mod ${this.n()} coverage wheel，multiplier ${this.a()}，已測試 ${this.visited()} 個inputs`);
  setModulus(n:number){this.n.set(n);this.a.set(Math.min(this.a(),n-1));this.reset();}
  changeA(delta:number){this.a.update(v=>mod(v-1+delta,this.n()-1)+1);this.reset();}
  step(){this.visited.update(v=>Math.min(this.n(),v+1));}
  complete(){this.visited.set(this.n());}
  reset(){this.visited.set(0);}
}
