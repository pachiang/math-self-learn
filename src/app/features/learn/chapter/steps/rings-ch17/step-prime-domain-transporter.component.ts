import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-rings-ch17-prime-domain-transporter',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson rings-ch17-lesson">
      <header class="hero"><p class="eyebrow">Rings & Ideals · 17.3</p><h2>Prime breach 投影下去，就是一整包 zero-product witness</h2><p class="lede">不要比較兩張definition卡。保留同一對representatives，逐條穿過canonical projection；三條membership翻譯完成後，兩邊的failure witnesses會完全對齊。</p></header>
      <span class="map-convention">GENERAL ARGUMENT · COMMUTATIVE UNITAL RINGS · P PROPER · NO FINITE SCAN</span>

      <section class="prediction"><div><p class="kicker">投影前先預測</p><h3>若a、b都在P外而ab在P內，projection會保留哪一種failure pattern？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(true)">兩個nonzero classes乘成zero</button><button type="button" (click)="prediction.set(false)">至少一個factor class先變zero</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="!prediction()">{{ prediction() ? '對。接下來逐條核對，不把相似圖案當作證明。' : 'a∉P恰好表示a+P不是zero class；兩個factors都會保留下來。' }}</p>}</section>

      <div class="control-row"><button type="button" [disabled]="prediction()===null || stage()>=3" (click)="next()">TRANSLATE NEXT FACT</button><button type="button" [disabled]="stage()<3" (click)="direction.update(v=>v==='down'?'up':'down')">{{ direction()==='down' ? 'PULL WITNESS BACK UP' : 'SEND WITNESS DOWN' }}</button><button type="button" (click)="reset()">RESET</button></div>

      <section class="stage stage-grid">
        <div class="witness-transporter-lab">
          <div class="transport-track">
            <section class="witness-packet upstairs"><small>UPSTAIRS · PRIME BREACH PACKET</small><div class="packet" [class.revealed]="stage()>=1"><small>FACTOR a</small><strong>a ∉ P</strong><span>outside representative</span></div><div class="packet" [class.revealed]="stage()>=2"><small>FACTOR b</small><strong>b ∉ P</strong><span>outside representative</span></div><div class="packet product" [class.revealed]="stage()>=3"><small>PRODUCT</small><strong>ab ∈ P</strong><span>boundary absorbs product</span></div></section>
            <div class="projection-gate"><small>{{ direction()==='down' ? 'CANONICAL PROJECTION' : 'CHOOSE REPRESENTATIVES' }}</small><strong>{{ direction()==='down' ? 'π' : '↑' }}</strong><span>{{ direction()==='down' ? 'membership → class status' : 'class status → membership' }}</span></div>
            <section class="witness-packet downstairs"><small>DOWNSTAIRS · ZERO-PRODUCT PACKET</small><div class="packet" [class.revealed]="stage()>=1"><small>FACTOR CLASS</small><strong>a+P ≠ 0+P</strong><span>because a∉P</span></div><div class="packet" [class.revealed]="stage()>=2"><small>FACTOR CLASS</small><strong>b+P ≠ 0+P</strong><span>because b∉P</span></div><div class="packet product" [class.revealed]="stage()>=3"><small>PRODUCT CLASS</small><strong>(a+P)(b+P)=0+P</strong><span>because ab∈P</span></div></section>
          </div>
          @if(complete()) { <div class="theorem-seal"><small>WITNESSES EXIST ON ONE SIDE ⇔ WITNESSES EXIST ON THE OTHER</small><strong>P prime ⇔ R/P is an integral domain</strong><span>Prime與domain共享同一批failure packets；不是finite examples碰巧同時PASS。</span></div> }
        </div>
        <aside class="console" aria-live="polite"><span class="evidence-badge">{{ complete() ? 'GENERAL ARGUMENT · BIDIRECTIONAL WITNESS TRANSPORT' : 'EXACT ROLE TRANSLATION' }}</span><h3>{{ complete() ? 'THE FAILURE SETS MATCH' : 'TRANSLATION '+stage()+' / 3' }}</h3><p>{{ complete() ? '任何prime breach都下降成zero-product witness；任何quotient zero-product witness選representatives後也拉回prime breach。' : hint() }}</p><div class="readout">facts aligned {{ stage() }} / 3 · direction {{ direction()==='down' ? 'downstairs' : 'upstairs' }}</div></aside>
      </section>

      <section class="insight"><span class="insight-icon">P⇔D</span><div><strong>Prime ideal與domain quotient擁有完全相同的 failure witnesses</strong><span>兩個outsiders乘進P，和兩個nonzero classes乘成zero，是同一份packet在projection兩側的讀法。</span></div></section>
      <div class="next-question"><strong>NEXT QUESTION · 17.4</strong><p>第16章的maximal–field correspondence，能否沿field⇒domain接到這條新bridge？</p></div>
      <details><summary>完整雙向 proof</summary><p>若P prime且(a+P)(b+P)=0+P，則ab∈P，故a∈P或b∈P，因此a+P=0+P或b+P=0+P。反向若R/P是domain且ab∈P，則(a+P)(b+P)=0+P，所以至少一個factor class為zero，亦即a∈P或b∈P。</p></details>
    </article>
  `,
})
export class RingsCh17PrimeDomainTransporterComponent {
  readonly prediction = signal<boolean | null>(null);
  readonly stage = signal(0);
  readonly direction = signal<'down' | 'up'>('down');
  readonly complete = computed(() => this.stage() === 3);
  next(): void { this.stage.update(value => Math.min(3, value + 1)); }
  hint(): string { return ['先把a在P外翻成a+P非zero。','第一個factor已對齊；接著處理b。','兩個factor都保留；最後翻譯product membership。'][this.stage()]; }
  reset(): void { this.prediction.set(null);this.stage.set(0);this.direction.set('down'); }
}
