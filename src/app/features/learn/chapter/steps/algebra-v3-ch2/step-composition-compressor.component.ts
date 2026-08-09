import { Component, computed, signal } from '@angular/core';

type Vertex = 'A' | 'B' | 'C';
type ActionId = 'r' | 'r2' | 's';
type Prediction = 'e' | 'r' | 'r2';

interface ActionDefinition {
  id: ActionId;
  label: string;
  description: string;
  map: Record<Vertex, Vertex>;
}

const VERTICES: readonly Vertex[] = ['A', 'B', 'C'];
const ACTIONS: Record<ActionId, ActionDefinition> = {
  r: { id: 'r', label: 'r', description: '順時針轉一格', map: { A: 'B', B: 'C', C: 'A' } },
  r2: { id: 'r2', label: 'r²', description: '順時針轉兩格', map: { A: 'C', B: 'A', C: 'B' } },
  s: { id: 's', label: 's', description: '固定 A，交換 B、C', map: { A: 'A', B: 'C', C: 'B' } },
};

const TOTAL_EFFECTS: ReadonlyArray<{
  id: string;
  label: string;
  map: Record<Vertex, Vertex>;
}> = [
  { id: 'e', label: 'e（沒有淨改變）', map: { A: 'A', B: 'B', C: 'C' } },
  { id: 'r', label: 'r（轉一格）', map: { A: 'B', B: 'C', C: 'A' } },
  { id: 'r2', label: 'r²（轉兩格）', map: { A: 'C', B: 'A', C: 'B' } },
  { id: 'sA', label: 'sₐ（固定 A）', map: { A: 'A', B: 'C', C: 'B' } },
  { id: 'sB', label: 'sᵦ（固定 B）', map: { A: 'C', B: 'B', C: 'A' } },
  { id: 'sC', label: 's𝚌（固定 C）', map: { A: 'B', B: 'A', C: 'C' } },
];

@Component({
  selector: 'app-algebra-v3-composition-compressor',
  standalone: true,
  template: `
    <article class="algebra-v3-lesson alg-ch2-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 2.1</p>
        <h2>先保留每一步，再把整段動作壓成一個 mapping</h2>
        <p class="lede">
          「先轉、再翻、再轉」是一段 history；它也對每個起點造成一個確定終點。只要三個起點的終點都知道，整段 history 就已經成為一個新的 action。
        </p>
      </header>

      <section class="prediction">
        <p class="kicker">先猜再算</p>
        <h3>從任何起點連做兩次 r，總效果是哪一個？</h3>
        <div class="choice-row" role="group" aria-label="選擇兩次 r 的總效果">
          @for (choice of predictionChoices; track choice.id) {
            <button type="button" [attr.aria-pressed]="prediction() === choice.id" (click)="prediction.set(choice.id)">
              {{ choice.label }}
            </button>
          }
        </div>
        @if (prediction(); as answer) {
          <p class="feedback" [class.warning]="answer !== 'r2'" aria-live="polite">
            {{ answer === 'r2' ? '對。A→C、B→A、C→B，三條 mapping 一起吻合 r²。' : '先別只追一個點；把 A、B、C 都走兩步，才足以辨認總 action。' }}
          </p>
        }
      </section>

      <section class="lab">
        <div class="lab-heading">
          <div>
            <p class="kicker">Action-sequence compressor</p>
            <h3>組一段 history，拖曳時間尺逐步檢查</h3>
          </div>
          <p>操作變數就是 action 的順序。上方不先化簡；下方同時追蹤所有起點，避免只看單一案例猜錯。</p>
        </div>

        <div class="chip-tray" aria-label="可加入的動作">
          @for (action of actionChoices; track action.id) {
            <button type="button" class="action-chip" (click)="append(action.id)" [disabled]="sequence().length >= 7">
              + {{ action.label }}
              <span class="sr-only">：{{ action.description }}</span>
            </button>
          }
          <button type="button" (click)="undo()" [disabled]="sequence().length === 0">復原一步</button>
          <button type="button" (click)="reset()" [disabled]="sequence().length === 0">清空</button>
        </div>

        <div class="stage">
          <div class="sequence-strip" aria-label="目前的動作歷程">
            @if (sequence().length === 0) {
              <span class="empty">尚未加入動作；這時總效果是 e。</span>
            } @else {
              @for (action of sequence(); track $index) {
                @if ($index > 0) { <i aria-hidden="true">→</i> }
                <b>{{ actionLabel(action) }}</b>
              }
            }
          </div>

          <label class="scrubber">
            <span>起點</span>
            <input
              type="range"
              min="0"
              [max]="sequence().length"
              [value]="playhead()"
              (input)="setPlayhead($event)"
              aria-label="查看執行到第幾步"
            />
            <span>第 {{ playhead() }} / {{ sequence().length }} 步</span>
          </label>

          <div class="mapping-board" aria-live="polite">
            @for (path of paths(); track path.start) {
              <div class="mapping-lane">
                <b>{{ path.start }}</b>
                <span class="history">{{ path.history.join(' → ') }}</span>
                <b class="destination">{{ path.end }}</b>
              </div>
            }
          </div>
        </div>

        <div class="readout effect-stamp" aria-live="polite">
          <span>目前 prefix 的完整 mapping：{{ mappingText() }}</span>
          <strong>總效果 = {{ totalEffect().label }}</strong>
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true"><span>action history</span><i>⇒</i><span>one mapping</span></div>
        <p>
          <strong>合成（composition）不是把名字黏起來，而是依序執行。</strong>
          history 可以很長；只要它對每個 state 的終點相同，就代表同一個 composite action。變的是寫法長短，不變的是完整 mapping。
        </p>
      </aside>

      <section class="transfer">
        <p class="kicker">遷移檢查</p>
        <h3>兩段洗牌歷程，只測一張牌都落在第 2 格，就能斷定它們是同一個總 action 嗎？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(false)">不能</button>
          <button type="button" (click)="transfer.set(true)">可以</button>
        </div>
        @if (transfer() !== null) {
          <p class="feedback" [class.warning]="transfer()" aria-live="polite">
            {{ transfer() ? '一張牌只是一個 state；其他牌可能去往不同位置。' : '對。要比較 action，必須比較整個 state space 上的 mapping。' }}
          </p>
        }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER</p>
        <details>
          <summary>符號為什麼看起來是反過來的？</summary>
          <div>
            若先做 f、再做 g，function notation 寫作 (g ∘ f)(x) = g(f(x))：x 先進最靠近它的 f。這一頁的時間軸仍由左往右播放，避免把記號慣例誤當成動作順序。
          </div>
        </details>
        <details>
          <summary>為什麼檢查三個起點就夠？</summary>
          <div>
            這個 state space 只有 A、B、C。兩個 functions 相等的定義，是它們對 domain 中每一個 input 都給出相同 output；三列全相同，mapping 就完全相同。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3CompositionCompressorComponent {
  readonly prediction = signal<Prediction | null>(null);
  readonly transfer = signal<boolean | null>(null);
  readonly sequence = signal<ActionId[]>([]);
  readonly playhead = signal(0);
  readonly predictionChoices: ReadonlyArray<{ id: Prediction; label: string }> = [
    { id: 'e', label: 'e' },
    { id: 'r', label: 'r' },
    { id: 'r2', label: 'r²' },
  ];
  readonly actionChoices = Object.values(ACTIONS);
  readonly activeSequence = computed(() => this.sequence().slice(0, this.playhead()));
  readonly paths = computed(() =>
    VERTICES.map((start) => {
      const history = [start];
      let current = start;
      for (const actionId of this.activeSequence()) {
        current = ACTIONS[actionId].map[current];
        history.push(current);
      }
      return { start, history, end: current };
    }),
  );
  readonly totalEffect = computed(() => {
    const output = Object.fromEntries(this.paths().map((path) => [path.start, path.end])) as Record<Vertex, Vertex>;
    return TOTAL_EFFECTS.find((effect) => VERTICES.every((vertex) => effect.map[vertex] === output[vertex])) ?? TOTAL_EFFECTS[0];
  });
  readonly mappingText = computed(() => this.paths().map((path) => `${path.start}→${path.end}`).join('，'));

  append(action: ActionId): void {
    if (this.sequence().length >= 7) return;
    this.sequence.update((value) => [...value, action]);
    this.playhead.set(this.sequence().length);
  }

  undo(): void {
    this.sequence.update((value) => value.slice(0, -1));
    this.playhead.set(this.sequence().length);
  }

  reset(): void {
    this.sequence.set([]);
    this.playhead.set(0);
  }

  setPlayhead(event: Event): void {
    const input = event.currentTarget;
    if (input instanceof HTMLInputElement) this.playhead.set(Number(input.value));
  }

  actionLabel(action: ActionId): string {
    return ACTIONS[action].label;
  }
}
