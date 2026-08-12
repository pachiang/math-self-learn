import { Component, computed, signal } from '@angular/core';
import {
  S4,
  S4_P8,
  conjugateSubgroup,
  permutationKey,
  permutationLabel,
  sameSubgroup,
} from '../algebra-v3-ch30/sylow-model';
import { S4_SYLOW_2_POINTS, subgroupSummary } from './sylow-landscape-model';

@Component({
  selector: 'app-algebra-v3-sylow-landscape',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch31-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 31.1</p>
        <h2>不要把 Sylow subgroups 當三座孤島；它們是同一個 point 被搬出的 orbit</h2>
        <p class="lede">
          固定 S₄ 的一個 Sylow 2-subgroup P，再讓 frame g 跑遍整個群。每張 card 產生 P 的一個
          conjugate；重複結果會落進同一個 point，而不是被重算。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>24 個 frames 是否一定產生 24 個不同的 Sylow 2-subgroups？</h3>
        <div class="choice-row" role="group" aria-label="預測 distinct Sylow subgroup 數量">
          <button type="button" (click)="prediction.set(false)">不會，許多 frames 會重複</button>
          <button type="button" (click)="prediction.set(true)">
            會，一張 frame 對一個 subgroup
          </button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">
            {{
              prediction()
                ? 'Frame 是搬動方法，不是 destination；不同 frames 可以把 P 搬到同一個位置。'
                : '對。掃完 24 張 cards 只留下 3 個 distinct subgroup points。'
            }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Sylow landscape builder</p>
            <h3>逐張送入 frame；destination 重複時就疊進既有 point</h3>
          </div>
          <p>圓點代表 subgroup，不代表單一 element；粗框與 FOUND 文字表示目前已被發現。</p>
        </div>
        <div class="scan-controls">
          <button type="button" class="primary" [disabled]="count() >= 24" (click)="advance()">
            掃描下一張 frame
          </button>
          <button type="button" (click)="count.set(24)">掃描全部</button>
          <button type="button" (click)="count.set(1)">重設</button>
          <span>{{ count() }} / 24 FRAMES</span>
        </div>
        <div class="stage landscape-stage">
          <section class="frame-tape" aria-label="24 個 S4 frame 掃描進度">
            @for (row of rows(); track row.key; let i = $index) {
              <span [class.scanned]="row.scanned" [class.latest]="i === count() - 1">
                {{ row.scanned ? row.label : '?' }}
              </span>
            }
          </section>
          <div class="transport-arrow" aria-hidden="true"><span>conjugate P</span><b>→</b></div>
          <section class="sylow-landscape" aria-live="polite">
            @for (point of points; track point.id; let i = $index) {
              <article [class.found]="binCounts()[i] > 0">
                <span>{{ point.id }}</span>
                <b>{{ binCounts()[i] > 0 ? 'FOUND' : 'WAITING' }}</b>
                <strong>{{ binCounts()[i] }} frames</strong>
                <small>{{ summary(point.subgroup) }}</small>
              </article>
            }
          </section>
          <section class="landscape-readout">
            <div>
              <span>FRAMES TESTED</span><b>{{ count() }}</b>
            </div>
            <div>
              <span>DISTINCT POINTS</span><b>{{ distinctCount() }}</b>
            </div>
            <div>
              <span>FINAL LANDSCAPE</span><b>{{ count() === 24 ? '3 SYLOWS' : 'BUILDING…' }}</b>
            </div>
          </section>
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>one P</span><i>all frames g</i><span>one conjugation orbit</span>
        </div>
        <p>
          <strong>Sylow II 先是一張 landscape，不是一句「彼此共軛」。</strong>
          不同 Sylow subgroups 是同一種 maximal p-structure 在 ambient group 裡的不同位置。
        </p>
      </aside>

      <section class="transfer">
        <p class="kicker">遷移</p>
        <h3>若這個 landscape 最後只有一個 point，P 會有什麼額外性質？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set('normal')">
            所有 frames 都留在 P，因此 P normal
          </button>
          <button type="button" (click)="transfer.set('cyclic')">因此 P 一定 cyclic</button>
        </div>
        @if (transfer()) {
          <p class="feedback" [class.warning]="transfer() !== 'normal'">
            {{
              transfer() === 'normal'
                ? '對。唯一 Sylow 等價於 conjugation orbit 是 singleton，也就是 normal。'
                : 'Cyclic 描述 P 內部；singleton orbit 描述 P 在 G 中對所有 frames 不變。'
            }}
          </p>
        }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>Sylow 第二定理（Sylow’s second theorem）的正式說法</summary>
          <div>
            有限群 G 的任兩個 Sylow p-subgroups P、Q 都共軛：存在 g∈G，使 Q=gPg⁻¹。 因此所有 Sylow
            p-subgroups 構成 conjugation action 下的一個 orbit；P normal 當且僅當這個 orbit
            只有一點。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3SylowLandscapeComponent {
  readonly points = S4_SYLOW_2_POINTS;
  readonly count = signal(1);
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<'normal' | 'cyclic' | null>(null);
  readonly rows = computed(() =>
    S4.map((frame, index) => {
      const output = conjugateSubgroup(S4_P8, frame);
      return {
        key: permutationKey(frame),
        label: permutationLabel(frame),
        outputIndex: this.points.findIndex((point) => sameSubgroup(point.subgroup, output)),
        scanned: index < this.count(),
      };
    }),
  );
  readonly binCounts = computed(() =>
    this.points.map(
      (_, pointIndex) =>
        this.rows().filter((row) => row.scanned && row.outputIndex === pointIndex).length,
    ),
  );
  readonly distinctCount = computed(() => this.binCounts().filter((count) => count > 0).length);

  advance(): void {
    this.count.update((value) => Math.min(24, value + 1));
  }

  summary = subgroupSummary;
}
