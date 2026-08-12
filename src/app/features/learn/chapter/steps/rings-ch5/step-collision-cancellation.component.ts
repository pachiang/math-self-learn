import { Component, computed, signal } from '@angular/core';
import { multiplyMod } from './rings-ch5-model';

type CollisionMode = 'witness' | 'compare' | 'challenge';

@Component({
  selector: 'app-rings-ch5-collision-cancellation',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">Rings & Ideals · 5.1</p><h2>相同 output，不一定來自相同 input</h2><p class="lede">Cancellation 不是把共同符號擦掉。先問固定乘法 machine 是否仍記得每張 input card 原本是誰。</p></header>
      <div class="general-banner"><span>COURSE SCOPE · COMMUTATIVE UNITAL RINGS</span><code>ab = ac  ·  can we conclude b = c?</code></div>

      <section class="prediction"><div><p class="kicker">先預測</p><h3>在 ℤ/10ℤ 中，4·1=4·6。可以把兩側的 4 約掉嗎？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(false)">不可以</button><button type="button" (click)="prediction.set(true)">可以，得到 1=6</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()">{{prediction()?'同一個output仍列著兩個不同sources；刪掉4會憑空丟失這項資訊。':'對。共同factor非零仍不夠，還要確認machine沒有collision。'}}</p>}</section>

      <div class="control-row"><span class="case-badge">INSTANCE · ℤ/10ℤ</span><button type="button" [class.active]="mode()==='witness'" (click)="setMode('witness')">FOCUSED ×4</button><button type="button" [class.active]="mode()==='compare'" (click)="setMode('compare')">COMPARE ×3</button>@if(challengeUnlocked()){<button type="button" [class.active]="mode()==='challenge'" (click)="setMode('challenge')">FIND ×5 COLLISION</button>}<button type="button" (click)="revealed.set(true)">REVEAL OUTPUTS</button><button type="button" (click)="tryCancel()">TRY CANCELLATION</button><button type="button" (click)="reset()">RESET</button></div>
      @if(mode()==='challenge') {<div class="control-row"><span class="kicker">SOURCE b</span>@for(v of values;track v){<button type="button" [class.active]="b()===v" (click)="b.set(v)">{{v}}</button>}<span class="kicker">SOURCE c</span>@for(v of values;track v){<button type="button" [class.active]="c()===v" (click)="c.set(v)">{{v}}</button>}</div>}

      <section class="stage stage-grid">
        <div class="collision-stage">
          <div class="mapping-pair">
            <div class="source-stack"><span class="source-card">source b={{b()}}</span><span class="source-card">source c={{c()}}</span></div>
            <div class="fiber-lines"><span class="fiber-line" [class.merge]="collision()"></span><span class="fiber-line" [class.merge]="collision()"></span></div>
            <div class="output-stack">
              @if(revealed()) {
                @if(collision()) {<div class="output-socket collision"><strong>output {{outB()}}</strong><small>from b={{b()}}</small><small>from c={{c()}}</small></div>}
                @else {<div class="output-socket"><strong>{{outB()}}</strong><small>from b={{b()}}</small></div><div class="output-socket"><strong>{{outC()}}</strong><small>from c={{c()}}</small></div>}
              } @else {<div class="output-socket"><strong>?</strong><small>REVEAL first</small></div>}
            </div>
          </div>
          <div class="cancel-gate" [class.blocked]="cancelTried()&&collision()" [class.open]="cancelTried()&&!collision()"><p class="kicker">CANCELLATION GATE</p><h3>{{gateText()}}</h3></div>
        </div>
        <aside class="console" aria-live="polite"><span class="evidence-badge">WITNESS</span><h3>{{collision()&&revealed()?'ONE OUTPUT · TWO SOURCES':'TRACK THE SOURCES'}}</h3><p>{{statusText()}}</p><div class="readout">m{{a()}}({{b()}})={{revealed()?outB():'?'}} · m{{a()}}({{c()}})={{revealed()?outC():'?'}}</div></aside>
      </section>
      <section class="insight"><span class="insight-icon">≠</span><div><strong>Cancellation 需要 multiplication 沒有忘記 input 是誰</strong><span>一個 collision witness 已足以推翻「所有非零factor都可約掉」。</span></div></section>
      <details><summary>消去律（cancellation law）</summary><p>Left cancellation要求：若a≠0且ab=ac，則b=c。本課主線為commutative rings，因此左右版本一致；一般noncommutative ring必須分開。</p></details>
    </article>
  `,
})
export class RingsCh5CollisionCancellationComponent {
  readonly values = [0,1,2,3,4,5,6,7,8,9] as const;
  readonly mode = signal<CollisionMode>('witness');
  readonly b = signal(1);
  readonly c = signal(6);
  readonly revealed = signal(false);
  readonly cancelTried = signal(false);
  readonly challengeUnlocked = signal(false);
  readonly prediction = signal<boolean|null>(null);
  readonly a = computed(() => this.mode()==='witness' ? 4 : this.mode()==='compare' ? 3 : 5);
  readonly outB = computed(() => multiplyMod(this.a(),this.b()));
  readonly outC = computed(() => multiplyMod(this.a(),this.c()));
  readonly collision = computed(() => this.b()!==this.c() && this.outB()===this.outC());
  readonly gateText = computed(() => !this.cancelTried() ? '尚未嘗試約掉共同factor' : this.collision() ? 'BLOCKED · one output cannot identify its source' : 'OPEN · these selected sources remain distinct');
  readonly statusText = computed(() => !this.revealed() ? '先保留兩張source labels，再揭曉outputs。' : this.collision() ? `${this.b()}與${this.c()}仍是不同elements，卻被×${this.a()}送進同一socket。` : `這一對sources沒有collision；它只是一個comparison，不單獨證明所有inputs都安全。`);
  setMode(mode:CollisionMode){this.mode.set(mode);this.b.set(1);this.c.set(6);this.revealed.set(false);this.cancelTried.set(false);}
  tryCancel(){this.revealed.set(true);this.cancelTried.set(true);this.challengeUnlocked.set(true);}
  reset(){this.mode.set('witness');this.b.set(1);this.c.set(6);this.revealed.set(false);this.cancelTried.set(false);}
}
