import { Component, computed, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface DecompExample {
  label: string;
  perm: number[];
  decomp: [number, number][];
  explanation: string;
}

const EXAMPLES: DecompExample[] = [
  { label: '(1 2 3)', perm: [1,2,0],
    decomp: [[0,1],[1,2]], explanation: '(1 2 3) = (1 2)(2 3)：先交換 2,3 再交換 1,2' },
  { label: '(1 3 2)', perm: [2,0,1],
    decomp: [[1,2],[0,1]], explanation: '(1 3 2) = (2 3)(1 2)：先交換 1,2 再交換 2,3' },
  { label: '(1 2 3 4)', perm: [1,2,3,0],
    decomp: [[0,1],[1,2],[2,3]], explanation: '(1 2 3 4) = (1 2)(2 3)(3 4)：長度 4 的循環需要 3 次對換' },
  { label: '(1 3)', perm: [2,1,0],
    decomp: [[0,2]], explanation: '(1 3) 本身就是一個對換，不需要拆' },
  { label: '(1 2)(3 4)', perm: [1,0,3,2],
    decomp: [[0,1],[2,3]], explanation: '兩個不相交的對換，各自獨立' },
];

@Component({
  selector: 'app-step-transpositions',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="對換：拆成最小單位" subtitle="\u00A74.3">
      <p>
        長度為 2 的循環 (a b) 叫做<strong>對換</strong>（transposition）— 它只交換兩個元素。
        對換是最簡單的非恆等置換。
      </p>
      <p>
        驚人的事實：<strong>任何置換都能寫成對換的乘積</strong>。
        就像任何整數都能分解成質因數一樣，對換就是置換的「質因數」。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選一個置換，看看它怎麼被拆成對換">
      <div class="example-selector">
        @for (ex of examples; track ex.label; let i = $index) {
          <button class="ex-btn" [class.active]="selectedIdx() === i"
            (click)="selectedIdx.set(i)">{{ ex.label }}</button>
        }
      </div>

      <!-- Decomposition visualization -->
      <div class="decomp-viz">
        <div class="original">
          <span class="label">原始：</span>
          <span class="perm-label">{{ current().label }}</span>
        </div>
        <div class="equals">=</div>
        <div class="factors">
          @for (t of current().decomp; track $index; let i = $index) {
            @if (i > 0) { <span class="times">\u00B7</span> }
            <span class="factor">({{ t[0]+1 }} {{ t[1]+1 }})</span>
          }
        </div>
      </div>

      <!-- Step by step -->
      <div class="steps-section">
        <div class="step-label">逐步執行：</div>
        <div class="step-row">
          <span class="step-state">
            {{ stateLabel(initialState()) }}
          </span>
          <span class="step-tag">開始</span>
        </div>
        @for (t of current().decomp; track $index; let i = $index) {
          <div class="step-row">
            <span class="step-arrow">\u2193 交換 {{ t[0]+1 }} 和 {{ t[1]+1 }}</span>
          </div>
          <div class="step-row">
            <span class="step-state">{{ stateLabel(stateAfter(i)) }}</span>
            @if (i === current().decomp.length - 1) {
              <span class="step-tag final">結果</span>
            }
          </div>
        }
      </div>

      <div class="explain">{{ current().explanation }}</div>

      <div class="count-box">
        <strong>對換數 = {{ current().decomp.length }}</strong>
        （{{ current().decomp.length % 2 === 0 ? '偶數' : '奇數' }}）
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        拆法不唯一 — 同一個置換可以用不同的對換組合來寫。
        但有一個不變的性質：<strong>對換的個數永遠是同奇同偶</strong>。
      </p>
      <p>
        也就是說：如果一種拆法用了偶數個對換，那所有拆法都是偶數個。
        這個「奇偶性」是置換的一個<strong>固有屬性</strong>。
      </p>
      <span class="hint">
        這個奇偶性可以定義一個映射 sgn: S\u2099 \u2192 {{ '{' }}\u00B11{{ '}' }}。
        下一節會看到，它竟然是一個同態 — 而且跟第三章的 D\u2083 \u2192 Z\u2082 有深刻的聯繫。
      </span>
    </app-prose-block>
  `,
  styles: `
    .example-selector { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
    .ex-btn {
      padding: 6px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text); font-size: 13px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace; transition: all 0.12s;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); font-weight: 600; }
    }

    .decomp-viz {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
      padding: 14px 18px; background: var(--bg); border-radius: 10px;
      border: 1px solid var(--border); margin-bottom: 14px;
      font-family: 'JetBrains Mono', monospace; font-size: 18px;
    }
    .label { font-size: 12px; color: var(--text-muted); }
    .perm-label { font-weight: 700; color: var(--text); }
    .equals { color: var(--text-muted); }
    .times { color: var(--text-muted); }
    .factor { font-weight: 600; color: var(--accent); }

    .steps-section {
      margin-bottom: 14px; padding: 12px; border: 1px solid var(--border);
      border-radius: 8px; background: var(--bg-surface);
    }
    .step-label { font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px; }
    .step-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .step-state {
      font-size: 16px; font-family: 'JetBrains Mono', monospace;
      font-weight: 600; color: var(--text); letter-spacing: 0.15em;
    }
    .step-arrow { font-size: 13px; color: var(--accent); padding-left: 8px; }
    .step-tag {
      font-size: 11px; padding: 2px 6px; border-radius: 3px;
      background: var(--accent-10); color: var(--accent);
      &.final { background: rgba(90,138,90,0.1); color: #5a8a5a; }
    }

    .explain { font-size: 13px; color: var(--text-secondary); margin-bottom: 10px; line-height: 1.5; }

    .count-box {
      padding: 10px 14px; border-radius: 8px;
      background: var(--accent-10); font-size: 14px; color: var(--text-secondary);
      strong { color: var(--text); }
    }
  `,
})
export class StepTranspositionsComponent {
  readonly examples = EXAMPLES;
  readonly selectedIdx = signal(0);
  readonly current = computed(() => this.examples[this.selectedIdx()]);

  initialState(): number[] {
    const n = this.current().perm.length;
    return Array.from({ length: n }, (_, i) => i);
  }

  stateAfter(stepIdx: number): number[] {
    let state = this.initialState();
    for (let i = 0; i <= stepIdx; i++) {
      const [a, b] = this.current().decomp[i];
      state = [...state];
      [state[a], state[b]] = [state[b], state[a]];
    }
    return state;
  }

  stateLabel(state: number[]): string {
    return state.map((v) => v + 1).join('  ');
  }
}
