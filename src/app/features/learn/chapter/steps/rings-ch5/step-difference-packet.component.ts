import { Component, computed, signal } from '@angular/core';
import { mod, multiplyMod } from './rings-ch5-model';

@Component({
  selector: 'app-rings-ch5-difference-packet',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">Rings & Ideals · 5.2</p><h2>Collision 藏著一張被乘成 0 的非零 difference packet</h2><p class="lede">不先移項背公式。把 b 重建成 c+d，再觀察多帶的 d 為何對最後 output 完全沒有貢獻。</p></header>
      <div class="general-banner"><span>GENERAL MECHANISM</span><code>b=c+d · same output means a·d=0</code></div>
      <section class="prediction"><div><p class="kicker">先預測</p><h3>已知 4·1=4·6，而 d=1−6。d 本身是 0，還是只有 4d 變成 0？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(false)">d≠0，只有4d=0</button><button type="button" (click)="prediction.set(true)">d本身就是0</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()">{{prediction()?'1與6是不同residues，所以difference不是0；被壓掉的是它對product的貢獻。':'對。d仍是一張非零card，只是×4把它送到0 dock。'}}</p>}</section>

      <div class="control-row"><span class="case-badge">INSTANCE · ℤ/10ℤ</span><button type="button" [class.active]="!directionCase()" (click)="usePrimary()">PRIMARY · 4,1,6</button><button type="button" [class.active]="directionCase()" (click)="useDirectionCase()">DIRECTION CHECK · 5,1,3</button><button type="button" (click)="swap()">SWAP b,c</button><button type="button" (click)="back()">BACK</button><button type="button" (click)="next()">NEXT STEP</button><button type="button" (click)="phase.set(0)">RESET</button></div>

      <section class="stage stage-grid">
        <div class="difference-lab">
          <div class="difference-rebuild"><span class="packet">b={{b()}}</span><strong>=</strong><span class="packet">c={{c()}}</span><strong>+</strong><span class="packet difference">d={{d()}}</span></div>
          <div class="route-compare">
            <div class="difference-route whole" [class.visible]="phase()>=1"><p class="kicker">WHOLE ROUTE</p><strong>a(c+d) = {{outB()}}</strong><span>same as ab</span></div>
            <div class="difference-route split" [class.visible]="phase()>=2"><p class="kicker">SPLIT ROUTE</p><div class="contribution-row"><span class="packet">ac={{outC()}}</span><strong>+</strong><span class="packet difference">ad={{ad()}}</span></div></div>
          </div>
          <div class="difference-rebuild">@if(phase()>=3){<span class="packet">ac={{outC()}}</span><strong>+</strong><span class="packet zero">ad={{ad()}} · ZERO DOCK</span><strong>=</strong><span class="packet">ab={{outB()}}</span>}@else{<span class="evidence-badge">STEP {{phase()+1}} / 4</span>}</div>
        </div>
        <aside class="console" aria-live="polite"><span class="evidence-badge">{{phase()>=3?'GENERAL ARGUMENT':'INSTANCE READOUT'}}</span><h3>{{phaseTitle()}}</h3><p>{{phaseText()}}</p><div class="readout">{{equation()}}</div></aside>
      </section>
      <section class="insight"><span class="insight-icon">0</span><div><strong>Zero divisor（零因子）把某個非零 difference 送進 0</strong><span>Collision、zero product與cancellation failure，是同一份資訊遺失的不同外觀。</span></div></section>
      <details><summary>正式定義與雙向推導</summary><p>本課約定a≠0，且存在d≠0使ad=0時，稱a為zero divisor。若ab=ac且b≠c，令d=b−c即可得到ad=0；反之若ad=0，則a(x+d)=ax，形成collision。</p></details>
      <details><summary>Optional pattern · nilpotent element</summary><p>若a≠0且某個最小k≥2使aᵏ=0，則a·aᵏ⁻¹=0且aᵏ⁻¹≠0，因此a是zero divisor。這裡只辨認pattern，不展開taxonomy。</p></details>
    </article>
  `,
})
export class RingsCh5DifferencePacketComponent {
  readonly directionCase = signal(false);
  readonly swapped = signal(false);
  readonly phase = signal(0);
  readonly prediction = signal<boolean|null>(null);
  readonly a = computed(() => this.directionCase()?5:4);
  readonly baseB = computed(() => 1);
  readonly baseC = computed(() => this.directionCase()?3:6);
  readonly b = computed(() => this.swapped()?this.baseC():this.baseB());
  readonly c = computed(() => this.swapped()?this.baseB():this.baseC());
  readonly d = computed(() => mod(this.b()-this.c(),10));
  readonly outB = computed(() => multiplyMod(this.a(),this.b()));
  readonly outC = computed(() => multiplyMod(this.a(),this.c()));
  readonly ad = computed(() => multiplyMod(this.a(),this.d()));
  readonly phaseTitle = computed(() => ['COLLISION HELD','REBUILD THE INPUT','DISTRIBUTE ×a','ISOLATE THE CONTRIBUTION'][this.phase()]);
  readonly phaseText = computed(() => [
    `兩張source cards ${this.b()}與${this.c()} 抵達同一output ${this.outB()}。`,
    `d=${this.d()}把c重建成b；d不是畫面距離，而是ring中的additive difference。`,
    `Distributivity把a(c+d)拆成ac+ad，讓d的product contribution可以被單獨追蹤。`,
    `Whole與split endpoint相同，而ac已占滿原output，所以額外contribution ad只能是0。`,
  ][this.phase()]);
  readonly equation = computed(() => [
    `${this.a()}·${this.b()} = ${this.a()}·${this.c()} = ${this.outB()}`,
    `${this.b()} = ${this.c()} + ${this.d()}  (mod 10)`,
    `${this.a()}(${this.c()}+${this.d()}) = ${this.outC()} + ${this.ad()}`,
    `${this.a()}·${this.d()} = ${this.ad()}，但 ${this.d()} ≠ 0`,
  ][this.phase()]);
  next(){this.phase.update(value=>Math.min(3,value+1));}
  back(){this.phase.update(value=>Math.max(0,value-1));}
  swap(){this.swapped.update(value=>!value);this.phase.set(0);}
  usePrimary(){this.directionCase.set(false);this.swapped.set(false);this.phase.set(0);}
  useDirectionCase(){this.directionCase.set(true);this.swapped.set(false);this.phase.set(0);}
}
