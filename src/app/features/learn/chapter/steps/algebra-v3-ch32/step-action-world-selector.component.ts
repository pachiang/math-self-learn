import { Component, computed, signal } from '@angular/core';
import { ACTION_SOCKETS } from './diagnostic-model';

@Component({
  selector: 'app-algebra-v3-action-world-selector',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch32-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 32.4</p>
        <h2>Action 的力量不只來自 G；選對 world X，問題才會變成可數的 orbit 或 fixed point</h2>
        <p class="lede">
          同一個群可以搬 vertices、cosets、subgroups 或 colorings。選 world
          不是換包裝，而是在決定哪一種 structure 能被看見。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先預測</p>
        <h3>想證明 K 被某個 conjugate of H 吸收，應先看 vertex world 還是 coset world？</h3>
        <div class="choice-row">
          <button type="button" (click)="prediction.set('cosets')">Coset world</button>
          <button type="button" (click)="prediction.set('vertices')">Vertex world</button>
        </div>
        @if (prediction()) {
          <p class="feedback" [class.warning]="prediction() !== 'cosets'">
            {{
              prediction() === 'cosets'
                ? '對。Fixed coset gH 會直接解碼成 K≤gHg⁻¹。'
                : 'Vertex motion 能看 reachability，但沒有直接 encoding subgroup containment。'
            }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Action world plugboard</p>
            <h3>先選 goal，再把 cable 插進一個 world socket</h3>
          </div>
          <p>一次只展開 active world；錯配會說明缺少的 observable，而不是只顯示 WRONG。</p>
        </div>
        <div class="goal-tabs" role="group" aria-label="選擇 action 分析目標">
          @for (socket of sockets; track socket.id; let i = $index) {
            <button type="button" [attr.aria-pressed]="goalIndex() === i" (click)="selectGoal(i)">
              GOAL {{ i + 1 }} · {{ shortGoal(i) }}
            </button>
          }
        </div>
        <div class="stage plugboard-stage">
          <section class="action-goal-card">
            <span>GOAL</span><strong>{{ goalSocket().goal }}</strong
            ><small>needs · {{ goalSocket().observable }}</small>
          </section>
          <div class="world-cable" aria-hidden="true">plug goal into X →</div>
          <section class="world-sockets" role="group" aria-label="選擇 action world X">
            @for (socket of sockets; track socket.id; let i = $index) {
              <button
                type="button"
                [attr.aria-pressed]="worldIndex() === i"
                [class.match]="worldIndex() === i && goalIndex() === i"
                (click)="worldIndex.set(i)"
              >
                <span>{{ socket.label }}</span
                ><b>{{ socket.world }}</b
                ><small>{{ socket.chapter }}</small>
              </button>
            }
          </section>
          <section class="world-monitor" [class.mismatch]="!matches()" aria-live="polite">
            <header>
              <span>OBSERVATION MONITOR</span
              ><b>{{ matches() ? 'WORLD FITS GOAL' : 'MISSING OBSERVABLE' }}</b>
            </header>
            @if (matches()) {
              <div class="observable-flow">
                <strong>{{ activeWorld().world }}</strong
                ><i>G ↷ X</i><strong>{{ activeWorld().observable }}</strong
                ><i>reveals</i><strong>{{ activeWorld().output }}</strong>
              </div>
            } @else {
              <p>{{ activeWorld().missing }}</p>
              <small>目前 goal 真正需要：{{ goalSocket().observable }}</small>
            }
          </section>
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>choose X</span><i>so the fact becomes</i
          ><span>orbit / stabilizer / fixed point</span>
        </div>
        <p>
          <strong>好 action 會改寫問題。</strong>
          它把抽象目標變成 reachability、local symmetry、fixed coset 或 fixed-state counting。
        </p>
      </aside>

      <section class="transfer">
        <p class="kicker">遷移</p>
        <h3>想數 binary necklaces up to rotation，哪個 world 最直接？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set('colorings')">Coloring configurations</button>
          <button type="button" (click)="transfer.set('conjugation')">
            Conjugation on subgroups
          </button>
        </div>
        @if (transfer()) {
          <p class="feedback" [class.warning]="transfer() !== 'colorings'">
            {{
              transfer() === 'colorings'
                ? '對。Configurations 作為 X，rotation orbits 正是 necklaces。'
                : 'Conjugation world 回答 re-framing 的 subgroup 問題，不編碼每條 necklace。'
            }}
          </p>
        }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>Action world 的正式條件</summary>
          <div>
            選定集合 X 後，需要一個 homomorphism G→Sym(X)。Identity 必須不動所有 states，且 gh
            的作用必須等於先 h 後 g。Orbit、stabilizer 與 fixed points 才能從這個合法 action
            中讀取。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3ActionWorldSelectorComponent {
  readonly sockets = ACTION_SOCKETS;
  readonly goalIndex = signal(1);
  readonly worldIndex = signal(0);
  readonly prediction = signal<'cosets' | 'vertices' | null>(null);
  readonly transfer = signal<'colorings' | 'conjugation' | null>(null);
  readonly goalSocket = computed(() => this.sockets[this.goalIndex()]);
  readonly activeWorld = computed(() => this.sockets[this.worldIndex()]);
  readonly matches = computed(() => this.goalIndex() === this.worldIndex());

  selectGoal(index: number): void {
    this.goalIndex.set(index);
  }

  shortGoal(index: number): string {
    return ['reachability', 'containment', 'reframing', 'symmetry classes'][index];
  }
}
