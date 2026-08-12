import { Component, computed, signal } from '@angular/core';

type Candidate = 'linear' | 'absolute';
type Rail = 'add' | 'multiply';

@Component({
  selector: 'app-rings-ch7-independent-contracts',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">Rings & Ideals · 7.2</p><h2>通過一條 rail，不會替另一條 rail 背書</h2><p class="lede">ADD與MULTIPLY preservation是兩份合約。下面兩張maps都保留1，也各自完整保住一條rail，卻能在另一條rail留下明確mismatch witness。</p></header>
      <span class="map-convention">SCOPE · INFINITE RINGS · GENERAL ARGUMENT ≠ SAMPLE SCAN</span>

      <section class="prediction"><div><p class="kicker">先預測</p><h3>若一張map對所有inputs保留ADD，MULTIPLY會自動被保留嗎？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(false)">不會，兩份合約獨立</button><button type="button" (click)="prediction.set(true)">會，自動保留</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()">{{prediction()?'下一張map會以general argument通過ADD，卻用一組inputs讓MULTIPLY兩路分離。':'對。反方向也能發生；兩個cases共用同一auditor。'}}</p>}</section>

      <div class="control-row"><span class="kicker">ACTIVE RAIL</span><button type="button" [class.active]="rail()==='add'" (click)="rail.set('add')">＋ ADD</button><button type="button" class="multiply" [class.active]="rail()==='multiply'" (click)="rail.set('multiply')">× MULTIPLY</button><button type="button" (click)="reveal.set(!reveal())">{{reveal()?'HIDE WITNESS':'REVEAL DECISIVE WITNESS'}}</button><button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid">
        <div class="dual-contract-lab">
          <nav class="candidate-map-list" aria-label="Candidate maps">
            <button type="button" [class.active]="candidate()==='linear'" (click)="select('linear')"><strong>L(f)=2f(A)−f(B)</strong><small>FUNCTIONS A,B → ℤ · preserves ADD and 1</small></button>
            <button type="button" [class.active]="candidate()==='absolute'" (click)="select('absolute')"><strong>abs(n)=|n|</strong><small>ℤ → ℤ · preserves MULTIPLY and 1</small></button>
          </nav>

          <div class="contract-auditor">
            <section class="contract-rail add" [class.active]="rail()==='add'">
              <p class="kicker">ADD CONTRACT</p><h3>{{addPass()?'GENERAL PASS':'WITNESS FOUND'}}</h3>
              <p>{{addReason()}}</p>
              <div class="contract-status" [class.pass]="addPass()" [class.fail]="!addPass()">{{addPass()?'GENERAL ARGUMENT':'ENDPOINT MISMATCH'}}</div>
              @if(reveal() && !addPass()){<div class="witness-endpoints fail"><span>{{leftEndpoint()}}</span><b>≠</b><span>{{rightEndpoint()}}</span></div>}
            </section>
            <section class="contract-rail multiply" [class.active]="rail()==='multiply'">
              <p class="kicker">MULTIPLY CONTRACT</p><h3>{{multiplyPass()?'GENERAL PASS':'WITNESS FOUND'}}</h3>
              <p>{{multiplyReason()}}</p>
              <div class="contract-status" [class.pass]="multiplyPass()" [class.fail]="!multiplyPass()">{{multiplyPass()?'GENERAL ARGUMENT':'ENDPOINT MISMATCH'}}</div>
              @if(reveal() && !multiplyPass()){<div class="witness-endpoints fail"><span>{{leftEndpoint()}}</span><b>≠</b><span>{{rightEndpoint()}}</span></div>}
            </section>
          </div>
        </div>
        <aside class="console" aria-live="polite"><span class="evidence-badge">{{activePass()?'GENERAL ARGUMENT':'WITNESS'}}</span><h3>{{candidateLabel()}}</h3><p>{{activeExplanation()}}</p><div class="readout">FINAL · {{addPass()?'ADD ✓':'ADD ×'}} · {{multiplyPass()?'MULTIPLY ✓':'MULTIPLY ×'}} · NOT A RING HOMOMORPHISM</div></aside>
      </section>

      <section class="insight"><span class="insight-icon">2</span><div><strong>Preserving ADD與preserving MULTIPLY是兩份合約</strong><span>任何一份都不能替另一份簽名。</span></div></section>
      <details><summary>為什麼這些是general arguments？</summary><p><code>L(f+g)=2(f(A)+g(A))−(f(B)+g(B))=L(f)+L(g)</code>涵蓋任意f、g；<code>|ab|=|a||b|</code>涵蓋任意integers。相反地，一組endpoint mismatch已足以否決另一條universal claim。</p></details>
    </article>
  `,
})
export class RingsCh7IndependentContractsComponent {
  readonly candidate = signal<Candidate>('linear');
  readonly rail = signal<Rail>('multiply');
  readonly reveal = signal(false);
  readonly prediction = signal<boolean | null>(null);
  readonly addPass = computed(() => this.candidate() === 'linear');
  readonly multiplyPass = computed(() => this.candidate() === 'absolute');
  readonly activePass = computed(() => this.rail() === 'add' ? this.addPass() : this.multiplyPass());
  readonly candidateLabel = computed(() => this.candidate() === 'linear' ? 'L · additive translator' : 'abs · multiplicative translator');
  readonly addReason = computed(() => this.candidate() === 'linear'
    ? 'Linear combination會把source addition逐項帶到target addition。'
    : '取絕對值會忘掉sign；−1與1相加時，兩條routes分離。');
  readonly multiplyReason = computed(() => this.candidate() === 'linear'
    ? '令x=(1,0)：source中x²=x，但L(x)²不等於L(x²)。'
    : '任意a、b都滿足|ab|=|a||b|。');
  readonly leftEndpoint = computed(() => this.candidate() === 'linear' ? 'L(x²)=2' : '|−1+1|=0');
  readonly rightEndpoint = computed(() => this.candidate() === 'linear' ? 'L(x)L(x)=4' : '|−1|+|1|=2');
  readonly activeExplanation = computed(() => this.activePass()
    ? `目前${this.rail() === 'add' ? 'ADD' : 'MULTIPLY'} rail由涵蓋任意inputs的reason支持；這不替另一條rail提供證據。`
    : this.reveal() ? '兩個明確endpoints不同；一個witness立即推翻這條preservation claim。' : '目前知道這條rail會失敗；揭露witness以查看是哪一對inputs把兩路分開。');
  select(candidate: Candidate): void { this.candidate.set(candidate); this.rail.set(candidate === 'linear' ? 'multiply' : 'add'); this.reveal.set(false); }
  reset(): void { this.candidate.set('linear'); this.rail.set('multiply'); this.reveal.set(false); this.prediction.set(null); }
}
