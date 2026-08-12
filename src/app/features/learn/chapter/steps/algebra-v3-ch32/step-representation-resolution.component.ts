import { Component, computed, signal } from '@angular/core';
import { D3_ELEMENTS, type D3Element, label } from '../algebra-v3-ch16/d3-model';
import {
  RESOLUTION_WORLDS,
  resolutionBuckets,
  sufficientForGoal,
  type ResolutionWorldId,
} from './diagnostic-model';

@Component({
  selector: 'app-algebra-v3-representation-resolution',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch32-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 32.2</p>
        <h2>Representation 是相機鏡頭：放大 state space，原本黏在一起的 actors 才會分開</h2>
        <p class="lede">
          同一個 D₃ 沒有改變；改變的是觀察 world
          保存多少資訊。最好的鏡頭不是永遠最大，而是剛好足以回答目標。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>只想偵測 reflection，是否一定需要 faithful representation？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set(false)">
            不用，2-state orientation 已足夠
          </button>
          <button type="button" (click)="prediction.set(true)">需要，否則資訊不完整</button>
        </div>
        @if (prediction() !== null) {
          <p class="feedback" [class.warning]="prediction()">
            {{
              prediction()
                ? 'Faithful 能回答更多問題，但 orientation 已精確分開 rotations 與 reflections。'
                : '對。保留超過 goal 所需的資訊，不會讓第一步更聰明。'
            }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Representation resolution dial</p>
            <h3>轉動 resolution；看六張 actor cards 如何 merge 或 split</h3>
          </div>
          <p>每桶直接列出 actors 並標示 MERGED／DISTINCT，不靠顏色判讀。</p>
        </div>
        <div class="resolution-controls">
          <div role="group" aria-label="選擇觀察目標">
            <button
              type="button"
              [attr.aria-pressed]="goal() === 'reflection'"
              (click)="goal.set('reflection')"
            >
              GOAL · 偵測 reflection
            </button>
            <button
              type="button"
              [attr.aria-pressed]="goal() === 'faithful'"
              (click)="goal.set('faithful')"
            >
              GOAL · 區分每個 actor
            </button>
          </div>
          <div class="resolution-dial" role="group" aria-label="選擇 representation resolution">
            @for (world of worlds; track world.id; let i = $index) {
              <button
                type="button"
                [attr.aria-pressed]="worldId() === world.id"
                (click)="worldId.set(world.id)"
              >
                <span>{{ i + 1 }}</span
                >{{ world.label }}<small>{{ world.stateCount }} states</small>
              </button>
            }
          </div>
        </div>
        <div class="stage resolution-stage">
          <section class="actor-source" aria-label="D3 的六個 actors">
            @for (actor of actors; track actor) {
              <span>{{ name(actor) }}</span>
            }
          </section>
          <div class="lens-aperture">
            <span>ACTIVE WORLD</span><b>{{ activeWorld().label }}</b
            ><small>{{ activeWorld().description }}</small>
          </div>
          <section class="signature-buckets" aria-live="polite">
            @for (bucket of buckets(); track $index) {
              <article [class.distinct]="bucket.length === 1">
                <header>
                  <span>SIGNATURE {{ $index + 1 }}</span
                  ><b>{{ bucket.length === 1 ? 'DISTINCT' : 'MERGED × ' + bucket.length }}</b>
                </header>
                <div>
                  @for (actor of bucket; track actor) {
                    <strong>{{ name(actor) }}</strong>
                  }
                </div>
              </article>
            }
          </section>
          <section class="resolution-readout">
            <div>
              <span>STATES USED</span><b>{{ activeWorld().stateCount }}</b>
            </div>
            <div>
              <span>VISIBLE SIGNATURES</span><b>{{ buckets().length }} / 6</b>
            </div>
            <div [class.enough]="enough()">
              <span>ENOUGH FOR GOAL?</span><b>{{ enough() ? 'YES' : 'NO' }}</b>
            </div>
          </section>
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>smaller world</span><i>cheaper but forgetful</i><span>faithful</span
          ><i>nothing merged</i>
        </div>
        <p>
          <strong>Best representation = enough for this question。</strong>
          Faithful 表示沒有 actors 被合併；它是資訊保真條件，不是每個問題都必須付出的成本。
        </p>
      </aside>

      <section class="transfer">
        <p class="kicker">遷移</p>
        <h3>
          Triangle world 已有 6 個 distinct signatures，還需要 regular action 才算 faithful 嗎？
        </h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(false)">不需要；injective 已成立</button>
          <button type="button" (click)="transfer.set(true)">需要；world 至少要有 6 states</button>
        </div>
        @if (transfer() !== null) {
          <p class="feedback" [class.warning]="transfer()">
            {{
              transfer()
                ? 'Faithful 比較的是 actors 是否產生 distinct permutations，不要求 |X|≥|G|。'
                : '對。三個 states 已能支援六張不同的 permutations。'
            }}
          </p>
        }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>Representation 與 faithful 的正式語言</summary>
          <div>
            一個 action representation 是 homomorphism ρ:G→Sym(X)。若 ker ρ 只有
            identity，等價於不同 group elements 產生不同 permutations，就稱 faithful
            representation。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3RepresentationResolutionComponent {
  readonly actors = D3_ELEMENTS;
  readonly worlds = RESOLUTION_WORLDS;
  readonly worldId = signal<ResolutionWorldId>('orientation');
  readonly goal = signal<'reflection' | 'faithful'>('reflection');
  readonly prediction = signal<boolean | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly activeWorld = computed(() => this.worlds.find((world) => world.id === this.worldId())!);
  readonly buckets = computed(() => resolutionBuckets(this.worldId()));
  readonly enough = computed(() => sufficientForGoal(this.worldId(), this.goal()));

  name(actor: D3Element): string {
    return label(actor);
  }
}
