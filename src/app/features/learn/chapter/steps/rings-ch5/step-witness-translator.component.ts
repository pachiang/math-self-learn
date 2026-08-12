import { Component, computed, signal } from '@angular/core';

type TranslatorPanel = 'zero' | 'map' | 'cancel';
type TranslatorCandidate = 'z10' | 'integers' | 'functions';

@Component({
  selector: 'app-rings-ch5-witness-translator',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">Rings & Ideals · 5.5</p><h2>同一份 witness，可以翻譯成 zero product、collision 或 cancellation failure</h2><p class="lede">這不是三套新知識。保持 a 與非零 difference d 不變，只把同一次資訊遺失改寫成三種熟悉的語言。</p></header>
      <div class="general-banner"><span>GENERAL ARGUMENT · SYNCHRONIZED VIEWS</span><code>one witness packet · three readouts</code></div>
      <section class="prediction"><div><p class="kicker">先預測</p><h3>已知 ad=0 且 a,d 都非零。固定乘 a 時，哪兩個不同 inputs 必定 collision？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(true)">0 與 d</button><button type="button" (click)="prediction.set(false)">a 與 d</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="!prediction()">{{prediction()?'對。mₐ(0)=0，而mₐ(d)=ad=0。':'Shared multiplier是a；要比較的是送進mₐ的inputs 0與d。'}}</p>}</section>

      <div class="control-row"><span class="kicker">START FROM</span><button type="button" [class.active]="entry()==='zero'" (click)="setEntry('zero')">ZERO PRODUCT</button><button type="button" [class.active]="entry()==='map'" (click)="setEntry('map')">MAP COLLISION</button><button type="button" [class.active]="entry()==='cancel'" (click)="setEntry('cancel')">CANCELLATION</button><button type="button" (click)="back()">TRANSLATE BACK</button><button type="button" (click)="next()">TRANSLATE NEXT</button><button type="button" (click)="revealAll()">REVEAL ALL</button><button type="button" (click)="reset()">RESET</button></div>
      @if(transfersUnlocked()){<div class="control-row"><span class="kicker">TRANSFER WORLD</span><button type="button" [class.active]="candidate()==='z10'" (click)="setCandidate('z10')">ℤ/10ℤ</button><button type="button" [class.active]="candidate()==='integers'" (click)="setCandidate('integers')">ℤ</button><button type="button" [class.active]="candidate()==='functions'" (click)="setCandidate('functions')">ℤ^X FUNCTIONS</button></div>}

      <section class="stage stage-grid">
        <div class="translator">
          <div class="shared-witness" [class.promise-card]="candidate()==='integers'"><p class="kicker">SHARED PACKET · {{candidateLabel()}}</p><h3>{{packetTitle()}}</h3><span>{{packetText()}}</span></div>
          <div class="translation-columns">
            <div class="translation-panel zero-product" [class.revealed]="visible('zero')"><p class="kicker">ZERO PRODUCT</p>@if(visible('zero')){<div class="translation-expression">{{zeroExpression()}}</div><p>{{zeroText()}}</p>}@else{<strong>translate to reveal</strong>}</div>
            <div class="translation-panel map-fiber" [class.revealed]="visible('map')"><p class="kicker">MAP FIBER</p>@if(visible('map')){<div class="translation-expression">{{mapExpression()}}</div><p>{{mapText()}}</p>}@else{<strong>translate to reveal</strong>}</div>
            <div class="translation-panel cancel-test" [class.revealed]="visible('cancel')"><p class="kicker">CANCELLATION TEST</p>@if(visible('cancel')){<div class="translation-expression">{{cancelExpression()}}</div><p>{{cancelText()}}</p>}@else{<strong>translate to reveal</strong>}</div>
          </div>
        </div>
        <aside class="console" aria-live="polite"><span class="evidence-badge">{{candidate()==='integers'?'GENERAL ARGUMENT':'WITNESS'}}</span><h3>{{revealCount()===3?'THREE VIEWS ALIGNED':'SAME PACKET · NEW LANGUAGE'}}</h3><p>{{statusText()}}</p><div class="readout">revealed {{revealCount()}} / 3 · packet identity unchanged</div></aside>
      </section>
      <section class="insight"><span class="insight-icon">⇔</span><div><strong>Integral domain 的 multiplication 不會由非零 multiplier 壓掉 differences</strong><span>No nonzero zero product、input distinction與cancellation，是同一個structural promise。</span></div></section>
      <details><summary>Integral domain 的正式條件</summary><p>在本課scope中，integral domain是commutative unital ring、滿足1≠0，且沒有zero divisors。等價地，每個a≠0的multiplication map mₐ都是injective；也等價於nonzero cancellation law。</p></details>
    </article>
  `,
})
export class RingsCh5WitnessTranslatorComponent {
  readonly entry = signal<TranslatorPanel>('zero');
  readonly candidate = signal<TranslatorCandidate>('z10');
  readonly revealCount = signal(1);
  readonly transfersUnlocked = signal(false);
  readonly prediction = signal<boolean|null>(null);
  readonly order = computed<TranslatorPanel[]>(() => this.entry()==='zero' ? ['zero','map','cancel'] : this.entry()==='map' ? ['map','zero','cancel'] : ['cancel','map','zero']);
  readonly candidateLabel = computed(() => this.candidate()==='z10'?'INSTANCE · ℤ/10ℤ':this.candidate()==='integers'?'GENERAL PROMISE · ℤ':'TRANSFER WITNESS · ℤ^X');
  readonly packetTitle = computed(() => this.candidate()==='z10'?'a=2 · d=5':this.candidate()==='integers'?'NO FAILURE PACKET EXISTS':'a=f · d=g');
  readonly packetText = computed(() => this.candidate()==='z10'?'2與5保持不變；只翻譯readout。':this.candidate()==='integers'?'對每個nonzero integer a，沒有nonzero d能滿足ad=0。':'f與g是上一節的disjoint-support nonzero function cards。');
  readonly zeroExpression = computed(() => this.candidate()==='z10'?'2·5=0 mod 10':this.candidate()==='integers'?'ad=0, a≠0 ⇒ d=0':'f·g=0 function');
  readonly mapExpression = computed(() => this.candidate()==='z10'?'m₂(0)=m₂(5)=0':this.candidate()==='integers'?'mₐ(b)=mₐ(c) ⇒ b=c':'m_f(0)=m_f(g)');
  readonly cancelExpression = computed(() => this.candidate()==='z10'?'2·0=2·5 but 0≠5':this.candidate()==='integers'?'ab=ac, a≠0 ⇒ b=c':'f·0=f·g but 0≠g');
  readonly zeroText = computed(() => this.candidate()==='integers'?'Nonzero product witness無法建立。':'兩個非零factors的product落到0。');
  readonly mapText = computed(() => this.candidate()==='integers'?'每個nonzero multiplier保存input distinction。':'Inputs 0與difference d進入同一output fiber。');
  readonly cancelText = computed(() => this.candidate()==='integers'?'共同nonzero factor可以可靠cancellation。':'共同factor不能被擦掉，因兩個sources仍不同。');
  readonly statusText = computed(() => this.candidate()==='integers'
    ? '這次沒有failure witness；三欄同步顯示同一項information-preservation promise。'
    : this.revealCount()===3?'Zero product、collision與cancellation failure已由同一packet對齊。':'繼續翻譯；a與d在所有欄位保持不變。');
  visible(panel:TranslatorPanel){return this.order().indexOf(panel)<this.revealCount();}
  setEntry(entry:TranslatorPanel){this.entry.set(entry);this.revealCount.set(1);}
  setCandidate(candidate:TranslatorCandidate){this.candidate.set(candidate);this.revealCount.set(1);}
  next(){this.revealCount.update(value=>Math.min(3,value+1));if(this.revealCount()===3)this.transfersUnlocked.set(true);}
  back(){this.revealCount.update(value=>Math.max(1,value-1));}
  revealAll(){this.revealCount.set(3);this.transfersUnlocked.set(true);}
  reset(){this.entry.set('zero');this.candidate.set('z10');this.revealCount.set(1);}
}
