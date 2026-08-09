import { Component, computed, signal } from '@angular/core';

type Answer = 'same' | 'different';
type ActionId = 'e' | 'r' | 'r2' | 's';
type Vertex = 'A' | 'B' | 'C';

interface TriangleAction {
  id: ActionId;
  label: string;
  notation: string;
  mapping: Record<Vertex, Vertex>;
  explanation: string;
}

const POSITIONS: Record<Vertex, { x: number; y: number }> = {
  A: { x: 150, y: 42 },
  B: { x: 250, y: 214 },
  C: { x: 50, y: 214 },
};

@Component({
  selector: 'app-algebra-v3-state-vs-action',
  standalone: true,
  template: `
    <article class="alg-ch1-lesson">
      <header class="hero">
        <p class="eyebrow">Abstract Algebra · 1.1</p>
        <h2>外框回到原樣，不代表什麼都沒做</h2>
        <p class="lede">
          第一個要切開的層級是 state 與 action：state 是目前看到的配置；action
          是一條規則，說明每個可能位置會被送去哪裡。
        </p>
      </header>

      <section class="prediction" aria-labelledby="prediction-1-1">
        <p class="kicker">先預測，不看頂點標記</p>
        <h3 id="prediction-1-1">
          沒有標記的正三角形旋轉 120° 後，外觀和原來相同。它和「完全不動」是同一個 action 嗎？
        </h3>
        <div class="choice-row" role="group" aria-label="選擇你的判斷">
          <button type="button" [class.selected]="answer() === 'same'" (click)="answer.set('same')">
            是，同一個 action
          </button>
          <button
            type="button"
            [class.selected]="answer() === 'different'"
            (click)="answer.set('different')"
          >
            不是，只是最後外觀相同
          </button>
        </div>
        @if (answer(); as value) {
          <p class="feedback" [class.warning]="value === 'same'" aria-live="polite">
            <strong>{{
              value === 'different' ? '抓到關鍵層級了。' : '你只比較了最後的 state。'
            }}</strong>
            {{
              value === 'different'
                ? '打開 labels 後，A、B、C 的去向會揭露不同的 mapping。'
                : '相同外框可以由 identity、rotation 或 reflection 產生；必須追蹤每個位置。'
            }}
          </p>
        }
      </section>

      <section class="lab" aria-labelledby="lab-1-1">
        <div class="lab-heading">
          <div>
            <p class="kicker">State / action separator</p>
            <h3 id="lab-1-1">先藏起 labels，再套用 action</h3>
          </div>
          <p>外框在四種 symmetry 下都不變；頂點 token 才記錄 action 真正做了什麼。</p>
        </div>

        <div class="action-row" role="group" aria-label="選擇三角形 action">
          @for (candidate of actions; track candidate.id) {
            <button
              type="button"
              [class.active]="actionId() === candidate.id"
              [attr.aria-pressed]="actionId() === candidate.id"
              (click)="chooseAction(candidate.id)"
            >
              {{ candidate.label }}
            </button>
          }
        </div>

        <div class="stage symmetry-workbench">
          <div class="triangle-scene">
            <svg viewBox="0 0 300 260" role="img" [attr.aria-label]="sceneLabel()">
              <polygon points="150,42 250,214 50,214" class="triangle-outline" />
              @if (labelsVisible()) {
                @for (vertex of vertices; track vertex) {
                  <g class="vertex-token" [style.transform]="vertexTransform(vertex)">
                    <circle cx="0" cy="0" r="18" />
                    <text x="0" y="5">{{ vertex }}</text>
                  </g>
                }
              }
            </svg>
          </div>

          <div class="workbench-console">
            <div class="action-name">
              <span>目前選擇</span>
              <strong>{{ activeAction().notation }} · {{ activeAction().label }}</strong>
            </div>
            <div class="direct-controls">
              <button
                type="button"
                [class.active]="labelsVisible()"
                [attr.aria-pressed]="labelsVisible()"
                (click)="labelsVisible.update((visible) => !visible)"
              >
                {{ labelsVisible() ? '隱藏 labels' : '顯示 labels' }}
              </button>
              <button
                type="button"
                [class.active]="applied()"
                [attr.aria-pressed]="applied()"
                (click)="applied.update((value) => !value)"
              >
                {{ applied() ? '回到 action 前' : '套用 action' }}
              </button>
            </div>
            <div class="mapping-list" aria-label="目前 action 的頂點 mapping">
              @for (vertex of vertices; track vertex) {
                <span>{{ vertex }} → {{ destination(vertex) }}</span>
              }
            </div>
            <p class="readout">
              <strong>{{ applied() ? activeAction().explanation : '目前仍是起始 state。' }}</strong
              ><br />
              {{
                labelsVisible()
                  ? 'labels 正在保存 action history。'
                  : 'labels 被隱藏後，外框無法辨認 action。'
              }}
            </p>
          </div>
        </div>
      </section>

      <aside class="insight-card">
        <div class="insight-visual" aria-hidden="true">
          <span>state</span><i>≠</i><span>action</span>
        </div>
        <p>
          <strong>State 回答「現在長什麼樣」；action 回答「每個可能 state 被送去哪裡」。</strong>
          群論首先研究後者。只看一張終點照片，通常無法還原做過的 action。
        </p>
      </aside>

      <section class="transfer" aria-labelledby="transfer-1-1">
        <p class="kicker">換一個表面</p>
        <h3 id="transfer-1-1">時鐘指針最後回到 12，能否因此推出它從未移動？</h3>
        <div class="choice-row">
          <button type="button" (click)="transfer.set(false)">能</button>
          <button type="button" (click)="transfer.set(true)">不能</button>
        </div>
        @if (transfer() !== null) {
          <p class="feedback" [class.warning]="!transfer()">
            {{
              transfer()
                ? '對。同一 state 可以由不動、轉一圈或多圈抵達。'
                : '終點相同沒有保存 action history。'
            }}
          </p>
        }
      </section>

      <section class="secondary">
        <p>SECONDARY LAYER · 主流程到這裡已完整</p>
        <details>
          <summary>正式定義：transformation 何時相等？</summary>
          <div>
            <p>Transformation 是 state space 到自身的 function，T:S→S。</p>
            <p>兩個 transformations 相等，表示它們對每個 input state 都給出相同 output。</p>
          </div>
        </details>
        <details>
          <summary>Proof Lab：怎樣證明兩個 actions 不同？</summary>
          <div>
            找一個 input 即可：identity 把 A 送到 A；120° rotation 把 A 送到 B。outputs
            不同，所以兩個 functions 不相等。反過來，只檢查一個 input 相同，不能證明 functions
            相等。
          </div>
        </details>
      </section>
    </article>
  `,
})
export class AlgebraV3StateVsActionComponent {
  readonly vertices: Vertex[] = ['A', 'B', 'C'];
  readonly actions: TriangleAction[] = [
    {
      id: 'e',
      label: '完全不動',
      notation: 'e',
      mapping: { A: 'A', B: 'B', C: 'C' },
      explanation: '每個 token 都留在原位置；這是 identity action。',
    },
    {
      id: 'r',
      label: '旋轉 120°',
      notation: 'r',
      mapping: { A: 'B', B: 'C', C: 'A' },
      explanation: '外框相同，但 A→B、B→C、C→A。',
    },
    {
      id: 'r2',
      label: '旋轉 240°',
      notation: 'r²',
      mapping: { A: 'C', B: 'A', C: 'B' },
      explanation: '這是第三個 mapping，不是 120° rotation 的另一個名字。',
    },
    {
      id: 's',
      label: '左右 reflection',
      notation: 's',
      mapping: { A: 'A', B: 'C', C: 'B' },
      explanation: 'A 固定，B、C 交換；它和三種 rotations 都不同。',
    },
  ];

  readonly answer = signal<Answer | null>(null);
  readonly actionId = signal<ActionId>('r');
  readonly labelsVisible = signal(false);
  readonly applied = signal(false);
  readonly transfer = signal<boolean | null>(null);

  readonly activeAction = computed(
    () => this.actions.find((action) => action.id === this.actionId()) ?? this.actions[0],
  );

  readonly sceneLabel = computed(() => {
    if (!this.labelsVisible()) return '沒有頂點標記的正三角形，外框保持不變';
    return this.applied()
      ? `已套用 ${this.activeAction().label}：${this.vertices.map((v) => `${v} 到 ${this.destination(v)}`).join('，')}`
      : '帶有 A、B、C 頂點標記的起始三角形';
  });

  chooseAction(id: ActionId): void {
    this.actionId.set(id);
    this.applied.set(false);
  }

  destination(vertex: Vertex): Vertex {
    return this.applied() ? this.activeAction().mapping[vertex] : vertex;
  }

  vertexTransform(vertex: Vertex): string {
    const position = POSITIONS[this.destination(vertex)];
    return `translate(${position.x}px, ${position.y}px)`;
  }
}
