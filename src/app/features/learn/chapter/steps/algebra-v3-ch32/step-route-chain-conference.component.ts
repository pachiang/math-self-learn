import { Component, computed, signal } from '@angular/core';
import { ORDER_30_BRANCHES, ORDER_30_REQUIRED } from './diagnostic-model';

@Component({
  selector: 'app-algebra-v3-route-chain-conference',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch32-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 32.6</p>
        <h2>好 proof 不是一次猜中 theorem；它把上一個 output 接成下一個 input</h2>
        <p class="lede">
          只處理一個 case：|G|=30。Sylow 先留下 branches；假設兩條 non-normal branches
          同時成立，再讓 element packets 親自撞破容量。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>n₅=6 與 n₃=10 能否在同一個 order-30 group 中共存？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(false)">不能，elements 會超過 30</button>
          <button type="button" (click)="prediction.set(true)">可以，兩者都通過 Sylow gates</button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">
            {{
              prediction()
                ? '各自通過 constraints 不代表能同時實現；兩批 prime-order elements 不能重疊。'
                : '對。把兩個 branches 接到 element counting，容量會爆掉。'
            }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Route-chain case conference</p>
            <h3>逐步放入 evidence；不要跳過仍然 open 的 branch</h3>
          </div>
          <p>每步可重播；overflow 同時使用超出 tray、斜紋與 CONTRADICTION stamp。</p>
        </div>
        <div class="conference-controls">
          <button type="button" class="primary" [disabled]="step() >= 5" (click)="advance()">
            {{ nextLabel() }}
          </button>
          <button type="button" (click)="step.set(0)">從頭重跑</button>
          <span>STEP {{ step() }} / 5</span>
        </div>
        <div class="stage conference-stage">
          <section class="evidence-chain" aria-label="order 30 proof evidence chain">
            <article [class.ready]="step() >= 1"><span>FACTOR</span><b>30=2·3·5</b></article>
            <i>→</i>
            <article [class.ready]="step() >= 2">
              <span>SYLOW</span><b>n₃∈{{ '{' }}1,10{{ '}' }}</b>
            </article>
            <i>→</i>
            <article [class.ready]="step() >= 2">
              <span>SYLOW</span><b>n₅∈{{ '{' }}1,6{{ '}' }}</b>
            </article>
            <i>→</i>
            <article [class.ready]="step() >= 5"><span>RESOLVE</span><b>n₃=1 OR n₅=1</b></article>
          </section>
          <section class="capacity-summary">
            <article><span>IDENTITY</span><b>1</b><small>shared once</small></article>
            <article [class.ready]="step() >= 3">
              <span>6 SYLOW-5 PACKETS</span><b>{{ step() >= 3 ? '24' : '0' }}</b
              ><small>6×(5−1)</small>
            </article>
            <article [class.ready]="step() >= 4">
              <span>10 SYLOW-3 PACKETS</span><b>{{ step() >= 4 ? '20' : '0' }}</b
              ><small>10×(3−1)</small>
            </article>
            <article [class.contradiction]="step() >= 4">
              <span>REQUIRED</span><b>{{ requiredNow() }}</b
              ><small>capacity 30</small>
            </article>
          </section>
          <section class="capacity-tray" [class.overflowing]="step() >= 4" aria-live="polite">
            @for (slot of slots; track slot) {
              <span
                [class.five]="slotKind(slot) === 'five'"
                [class.three]="slotKind(slot) === 'three'"
              >
                {{ slotLabel(slot) }}
              </span>
            }
            @if (step() >= 4) {
              <div class="overflow-packets">
                @for (token of overflowTokens; track token) {
                  <span>3</span>
                }
              </div>
              <strong>CONTRADICTION · 45 REQUIRED &gt; 30 AVAILABLE</strong>
            }
          </section>
          <section class="conference-result" [class.resolved]="step() >= 5">
            <span>LOGICAL CONSEQUENCE</span>
            <b>{{ step() >= 5 ? 'AT LEAST ONE NORMAL SYLOW' : 'BRANCHES STILL OPEN' }}</b>
            <p>
              {{
                step() >= 5
                  ? '不能擅自指定是哪一個；證明只保證 Sylow 3 或 Sylow 5 至少一邊 unique。'
                  : '先保留每條尚未被 evidence 排除的 possibility。'
              }}
            </p>
            <button type="button" [disabled]="step() < 5" (click)="quotientOpen.set(true)">
              把 normal card 插入 quotient port
            </button>
            @if (quotientOpen()) {
              <small>N ◁ G → G/N 現在可用；達成題目後，不在此頁繼續 classification。</small>
            }
          </section>
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>Sylow candidates</span><i>→</i><span>element overflow</span><i>→</i
          ><span>normal subgroup</span><i>→</i><span>quotient available</span>
        </div>
        <p>
          <strong>Proof route 是 evidence pipeline。</strong>
          Constraint 的 output 成為 counting 的 input；得到 normal subgroup 後，它又能成為 quotient
          的入口。
        </p>
      </aside>

      <section class="transfer">
        <p class="kicker">遷移</p>
        <h3>這個 contradiction 能斷言「Sylow 5-subgroup 一定 normal」嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(false)">不能，只保證兩邊至少一邊</button>
          <button type="button" (click)="transfer.set(true)">能，5 比 3 大</button>
        </div>
        @if (transfer() !== null) {
          <p class="feedback" [class.warning]="transfer()">
            {{
              transfer()
                ? 'Counting 只排除「兩邊同時 non-normal」，沒有單獨排除 n₅=6。'
                : '對。保留 OR 是對 proof strength 的誠實描述。'
            }}
          </p>
        }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>為什麼 packets 內與兩種 prime orders 之間都不重疊？</summary>
          <div>
            Distinct order-p subgroups 的 intersection 是 subgroup，其 order 同時整除 p 且小於
            p，只能是 1，所以只共享 identity。Order-3 element 不可能同時是 order-5 element。因此極端
            branches 需要 1+6(5−1)+10(3−1)=45 個 distinct elements，超過 |G|=30。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3RouteChainConferenceComponent {
  readonly branches = ORDER_30_BRANCHES;
  readonly slots = Array.from({ length: 30 }, (_, index) => index + 1);
  readonly overflowTokens = Array.from({ length: 15 }, (_, index) => index + 1);
  readonly step = signal(0);
  readonly quotientOpen = signal(false);
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly requiredNow = computed(() => {
    if (this.step() < 3) return 1;
    if (this.step() < 4) return 1 + this.branches[0].required;
    return ORDER_30_REQUIRED;
  });

  advance(): void {
    this.step.update((step) => Math.min(5, step + 1));
    this.quotientOpen.set(false);
  }

  nextLabel(): string {
    return [
      '拆解 group order',
      '套用 Sylow constraints',
      '假設 n₅=6，放入 packets',
      '再假設 n₃=10，測試容量',
      'Resolve contradiction',
      '證明完成',
    ][this.step()];
  }

  slotKind(slot: number): 'identity' | 'five' | 'three' | 'empty' {
    if (slot === 1) return 'identity';
    if (this.step() >= 3 && slot <= 25) return 'five';
    if (this.step() >= 4) return 'three';
    return 'empty';
  }

  slotLabel(slot: number): string {
    const kind = this.slotKind(slot);
    return kind === 'identity' ? 'e' : kind === 'five' ? '5' : kind === 'three' ? '3' : '·';
  }
}
