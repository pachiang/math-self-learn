import { Component, computed, signal } from '@angular/core';
import { allPairs, containsPair, operatePair, pairKey, pairLabel, Pair } from './rings-ch6-model';

interface GenerationReason {
  pair: Pair;
  reason: string;
}

interface Obligation {
  pair: Pair;
  reason: string;
}

@Component({
  selector: 'app-rings-ch6-generated-subring',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson rings-lesson">
      <header class="hero"><p class="eyebrow">Rings & Ideals · 6.5</p><h2>Generated subring 是 seed 在 contract 下被迫長出的最小世界</h2><p class="lede">Boundary 不能任意擴大。每次只問：目前已有的 cards 經 identity、difference 或 product，下一張無法拒絕的 output 是誰？</p></header>
      <div class="general-banner"><span>FORCED CONSTRUCTION · FUNCTION RING</span><code>seed + ambient 1_R + every required output</code></div>

      <section class="prediction"><div><p class="kicker">先預測</p><h3>在 (ℤ/2ℤ)^&#123;A,B&#125; 放入 seed f=(0,1)，並要求包含 1_R=(1,1)。Boundary 只會留下兩張 cards 嗎？</h3></div><div class="choice-row"><button type="button" (click)="prediction.set(false)">不會，還會被迫長大</button><button type="button" (click)="prediction.set(true)">會，只需 seed 與 1</button></div>@if(prediction()!==null){<p class="feedback" [class.warning]="prediction()">{{prediction()?'例如1_R−f=(1,0)尚未在boundary內，contract不允許忽略它。':'對。每一個missing required output都會推動frontier。'}}</p>}</section>

      <div class="control-row"><span class="case-badge">BASE · ℤ/{{n()}}ℤ · X=&#123;A,B&#125;</span><span class="kicker">SEED</span><button type="button" [class.active]="seedKind()==='constant'" (click)="setSeed('constant')">CONSTANT 1</button><button type="button" [class.active]="seedKind()==='nonconstant'" (click)="setSeed('nonconstant')">f=(0,1)</button><button type="button" (click)="next()">NEXT FORCED CARD</button><button type="button" (click)="autoComplete()">AUTO COMPLETE</button><button type="button" (click)="reset()">RESET</button>@if(transferUnlocked()){<button type="button" [class.active]="n()===3" (click)="setBase(3)">TRANSFER · BASE ℤ/3ℤ</button><button type="button" [class.active]="n()===2" (click)="setBase(2)">BACK TO ℤ/2ℤ</button>}</div>

      <section class="stage stage-grid">
        <div class="generation-lab">
          <div class="function-world">
            <div class="candidate-label"><strong>CURRENT GENERATED BOUNDARY</strong><span>{{members().length}} / {{board().length}} ambient cards</span></div>
            <div class="function-board" [style.--board-size]="n()">
              @for(pair of board();track key(pair)) {
                <span class="function-slot" [class.member]="isMember(pair)" [class.frontier]="nextPairKey()===key(pair)">
                  <strong>{{label(pair)}}</strong><span class="lane-mini"><span>A→{{pair[0]}}</span><span>B→{{pair[1]}}</span></span>
                </span>
              }
            </div>
            @if(nextObligation();as obligation){<div class="membership-gate"><p class="kicker">NEXT OBLIGATION</p><strong>{{label(obligation.pair)}}</strong><span>{{obligation.reason}}</span></div>}@else{<div class="fixed-point">FIXED POINT · every required output already inside</div>}
          </div>
          <div class="generation-history"><p class="kicker">WHY EACH CARD IS INSIDE</p>@for(item of history();track key(item.pair);let last=$last){<div class="reason-tag" [class.latest]="last"><strong>{{label(item.pair)}}</strong><span>{{item.reason}}</span></div>}</div>
        </div>
        <aside class="console" aria-live="polite"><span class="evidence-badge">{{fixedPoint()?'FINITE EXHAUSTION':'FORCED CONSTRUCTION'}}</span><h3>{{fixedPoint()?'MINIMAL FRONTIER STABILIZED':'ONE OBLIGATION AT A TIME'}}</h3><p>{{statusText()}}</p><div class="readout">{{nextObligation()?.reason ?? 'no missing identity / difference / product output'}}</div></aside>
      </section>
      <section class="insight"><span class="insight-icon">⟨ ⟩</span><div><strong>Generated subring 是任何包含 seed 的 subring 都無法拒絕的 cards</strong><span>Minimal 不是看起來最小；是每張加入的card都有contract強迫的理由。</span></div></section>
      <details><summary>正式定義與 notation</summary><p>由subset A生成的subring可寫作 ⟨A⟩_ring，並定義為所有包含A之subrings的intersection。若已指定base subring S並adjoin elements，常寫S[A]。有限ambient中的closure procedure必會停止；一般infinite world不保證有限步完成。</p></details>
    </article>
  `,
})
export class RingsCh6GeneratedSubringComponent {
  readonly n = signal(2);
  readonly seedKind = signal<'constant'|'nonconstant'>('nonconstant');
  readonly members = signal<Pair[]>([[0,1]]);
  readonly history = signal<GenerationReason[]>([{pair:[0,1],reason:'SEED · required from the start'}]);
  readonly transferUnlocked = signal(false);
  readonly prediction = signal<boolean|null>(null);
  readonly board = computed(() => allPairs(this.n()));
  readonly identity = computed<Pair>(() => [1 % this.n(),1 % this.n()]);
  readonly nextObligation = computed(() => this.findNextObligation(this.members()));
  readonly nextPairKey = computed(() => this.nextObligation() ? pairKey(this.nextObligation()!.pair) : null);
  readonly fixedPoint = computed(() => this.nextObligation() === null);
  readonly statusText = computed(() => this.fixedPoint()
    ? `所有目前cards的difference與product都已在boundary內，ambient identity也在內。`
    : `下一張card不是建議選項；任何合法subring若保留目前boundary，就必須把它加入。`);
  key=pairKey;label=pairLabel;
  isMember(pair:Pair){return containsPair(this.members(),pair);}
  private findNextObligation(current:readonly Pair[]):Obligation|null{
    if(!containsPair(current,this.identity()))return{pair:this.identity(),reason:`IDENTITY · ambient 1_R=${pairLabel(this.identity())}`};
    for(const left of current){
      for(const right of current){
        const difference=operatePair(left,right,'difference',this.n());
        if(!containsPair(current,difference))return{pair:difference,reason:`DIFFERENCE · ${pairLabel(left)}−${pairLabel(right)}`};
      }
    }
    for(const left of current){
      for(const right of current){
        const product=operatePair(left,right,'multiply',this.n());
        if(!containsPair(current,product))return{pair:product,reason:`PRODUCT · ${pairLabel(left)}×${pairLabel(right)}`};
      }
    }
    return null;
  }
  next(){const obligation=this.nextObligation();if(!obligation){this.transferUnlocked.set(true);return;}this.members.update(items=>[...items,obligation.pair]);this.history.update(items=>[...items,{pair:obligation.pair,reason:obligation.reason}]);if(!this.findNextObligation(this.members()))this.transferUnlocked.set(true);}
  autoComplete(){let guard=0;while(this.nextObligation()&&guard<this.board().length+2){this.next();guard++;}this.transferUnlocked.set(true);}
  setSeed(kind:'constant'|'nonconstant'){this.seedKind.set(kind);const seed:Pair=kind==='constant'?this.identity():[0,1];this.members.set([seed]);this.history.set([{pair:seed,reason:'SEED · required from the start'}]);}
  setBase(n:number){this.n.set(n);this.setSeed(this.seedKind());}
  reset(){this.n.set(2);this.seedKind.set('nonconstant');this.members.set([[0,1]]);this.history.set([{pair:[0,1],reason:'SEED · required from the start'}]);}
}
