import { Component, computed, signal } from '@angular/core';
import { FunctionPair, differencePair, evaluateA, pairLabel } from './rings-ch7-model';

@Component({
  selector: 'app-rings-ch7-collision-difference',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">Rings & Ideals · 7.4</p><h2>Map 的 collision，會化成一個被送往 0 的 difference</h2><p class="lede">Many-to-one不是散亂配對。若φ無法分辨f與g，addition preservation會把source中的difference f−g送成target的additive identity。</p></header>

      <section class="prediction"><div><p class="kicker">先預測</p><h3>ev_A把f=(1,0)、g=(1,2)都送到1。它會把difference f−g送到哪裡？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(0)">送到target 0</button><button type="button" (click)="prediction.set(2)">送到target 2</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()!==0">{{prediction()===0?'對。完整difference仍是(0,2)，但它的A lane是0，因此ev_A看見0。':'2留在B lane；ev_A讀的是A lane。別把完整source element和target output混在一起。'}}</p>}</section>

      <div class="control-row"><span class="kicker">PAIR STATE</span><button type="button" [class.active]="sameOutput()" (click)="setPair(true)">SAME A · COLLISION</button><button type="button" [class.active]="!sameOutput()" (click)="setPair(false)">DIFFERENT A · NO COLLISION</button><button type="button" (click)="advance()">{{phase()<3?'NEXT REPRESENTATION':'REPLAY'}}</button>@if(transferUnlocked()){<button type="button" [class.active]="transfer()" (click)="transfer.set(!transfer())">{{transfer()?'BACK · ev_A':'TRANSFER · MOD 6'}}</button>}<button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid">
        <div class="zero-fiber-lab">
          <section class="collision-cards">
            @if (!transfer()) {
              <div class="collision-card"><strong>f = {{pairLabel(f())}}</strong><span>ev_A(f)={{evaluate(f())}}</span></div>
              <div class="collision-card"><strong>g = {{pairLabel(g())}}</strong><span>ev_A(g)={{evaluate(g())}}</span></div>
              <div class="difference-packet-map" [class.active]="phase()>=2"><small>DIFFERENCE PACKET</small><strong>f−g = {{pairLabel(difference())}}</strong><span>A→{{difference()[0]}} · B→{{difference()[1]}}</span></div>
            } @else {
              <div class="collision-card"><strong>a = 8</strong><span>q(a)=[2]₆</span></div><div class="collision-card"><strong>b = 2</strong><span>q(b)=[2]₆</span></div><div class="difference-packet-map active"><small>DIFFERENCE PACKET</small><strong>a−b = 6</strong><span>q(6)=[0]₆</span></div>
            }
          </section>

          <div class="fiber-bridge"><div class="fiber-arrow"></div><div class="phi-bridge">{{transfer()?'q':'ev_A'}}</div><div class="route-step" [class.active]="phase()>=3">SEND DIFFERENCE</div></div>

          <section class="target-fiber">
            <div class="target-node" [class.active]="phase()>=1"><span>φ(first)</span><strong>{{firstOutput()}}</strong></div>
            <div class="target-node" [class.active]="phase()>=1"><span>φ(second)</span><strong>{{secondOutput()}}</strong></div>
            <div class="target-node zero" [class.active]="phase()>=3"><span>φ(difference)</span><strong>{{phase()>=3?differenceOutput():'?'}}</strong></div>
          </section>
        </div>
        <aside class="console" aria-live="polite"><span class="evidence-badge">{{phase()>=3?'GENERAL PATTERN':'STEP '+phase()+' / 3'}}</span><h3>{{statusTitle()}}</h3><p>{{statusReading()}}</p><div class="readout">{{equivalence()}}</div></aside>
      </section>

      <section class="insight"><span class="insight-icon">0</span><div><strong>Homomorphism 的collision有結構</strong><span>被混在一起的兩個inputs，正好相差一個被送到0的difference。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · Ch8</strong><p>若φ(i)=0，拿任意ambient r乘上i之後，φ(ri)還會是0嗎？這一頁先不揭曉。</p></div>
      <details><summary>為什麼是雙向等價？</summary><p>保addition給<code>φ(f−g)=φ(f)−φ(g)</code>。所以φ(f)=φ(g)時difference送到0；反過來若φ(f−g)=0，則φ(f)−φ(g)=0，因此φ(f)=φ(g)。下一章才替整個zero-output fiber命名並檢查multiplication。</p></details>
    </article>
  `,
})
export class RingsCh7CollisionDifferenceComponent {
  readonly f = signal<FunctionPair>([1, 0]);
  readonly g = signal<FunctionPair>([1, 2]);
  readonly phase = signal(0);
  readonly transfer = signal(false);
  readonly transferUnlocked = signal(false);
  readonly prediction = signal<number | null>(null);
  readonly difference = computed(() => differencePair(this.f(), this.g()));
  readonly sameOutput = computed(() => evaluateA(this.f()) === evaluateA(this.g()));
  readonly firstOutput = computed(() => this.transfer() ? '[2]₆' : String(evaluateA(this.f())));
  readonly secondOutput = computed(() => this.transfer() ? '[2]₆' : String(evaluateA(this.g())));
  readonly differenceOutput = computed(() => this.transfer() ? '[0]₆' : String(evaluateA(this.difference())));
  readonly statusTitle = computed(() => this.phase() === 0 ? 'SOURCE PAIR READY' : this.phase() === 1 ? (this.sameOutput() ? 'TARGET COLLISION' : 'TARGETS SEPARATE') : this.phase() === 2 ? 'DIFFERENCE PACKED IN SOURCE' : (this.sameOutput() ? 'DIFFERENCE ENTERS ZERO FIBER' : 'NONZERO DIFFERENCE REMAINS VISIBLE'));
  readonly statusReading = computed(() => this.phase() === 0
    ? '先比較兩張完整source cards，不要只看一條lane。'
    : this.phase() === 1 ? (this.sameOutput() ? '兩張cards跨橋後落在同一target dock。' : 'A lane不同，因此map仍能分辨這兩張cards。')
      : this.phase() === 2 ? `Source difference是${pairLabel(this.difference())}；它仍是一張完整function card。`
        : this.sameOutput() ? '相同output迫使difference的image成為target 0。' : 'Outputs沒有collision，因此difference不會被送到0。');
  readonly equivalence = computed(() => this.phase() >= 3 ? `φ(f)=φ(g) ${this.sameOutput()?'✓':'×'}  ⇔  φ(f−g)=0 ${this.sameOutput()?'✓':'×'}` : 'same output  ?⇔  difference maps to 0');
  pairLabel = pairLabel;
  evaluate = evaluateA;
  advance(): void { if (this.phase() >= 3) this.phase.set(0); else { this.phase.update(value => value + 1); if (this.phase() === 3 && this.sameOutput()) this.transferUnlocked.set(true); } }
  setPair(same: boolean): void { this.f.set([1, 0]); this.g.set(same ? [1, 2] : [3, 2]); this.phase.set(0); this.transfer.set(false); }
  reset(): void { this.f.set([1, 0]); this.g.set([1, 2]); this.phase.set(0); this.transfer.set(false); this.transferUnlocked.set(false); this.prediction.set(null); }
}
