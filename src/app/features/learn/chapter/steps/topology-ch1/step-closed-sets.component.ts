import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-topo-closed-sets',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="閉集" subtitle="§1.4">
      <p>
        <strong>閉集</strong> = 開集的補集。F 是閉集 ⇔ X∖F ∈ τ。
      </p>
      <p>閉集的性質（和開集「對偶」）：</p>
      <ul>
        <li>∅ 和 X 都是閉集（也都是開集！）</li>
        <li>任意多個閉集的<strong>交集</strong>是閉集</li>
        <li>有限多個閉集的<strong>聯集</strong>是閉集</li>
      </ul>
      <p>
        ⚠ 「閉」和「開」<strong>不是反義詞</strong>。一個集合可以既開又閉（clopen），
        也可以既不開也不閉。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="在 R 的標準拓撲中分類這些集合">
      <div class="quiz-stack">
        @for (q of questions; track q.set; let i = $index) {
          <div class="quiz-card" (click)="toggle(i)">
            <div class="q-set">{{ q.set }}</div>
            @if (revealed()[i]) {
              <div class="q-answer" [class]="q.type">
                {{ q.answer }}
              </div>
            } @else {
              <div class="q-hint">點擊揭示</div>
            }
          </div>
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        <strong>閉包</strong>（closure）cl(A) = 包含 A 的最小閉集 = 所有「極限點」的集合。
        <strong>內部</strong>（interior）int(A) = A 裡最大的開集。
        <strong>邊界</strong>（boundary）∂A = cl(A) ∖ int(A)。
      </p>
      <p>這些概念在度量空間裡需要 ε-球，在拓撲空間裡只需要開集。</p>
    </app-prose-block>
  `,
  styles: `
    .quiz-stack { display: flex; flex-direction: column; gap: 8px; }
    .quiz-card { padding: 12px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); cursor: pointer; display: flex; justify-content: space-between; align-items: center;
      &:hover { background: var(--accent-10); } }
    .q-set { font-size: 14px; font-weight: 600; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .q-hint { font-size: 11px; color: var(--text-muted); }
    .q-answer { font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 6px;
      &.open { background: rgba(90,138,90,0.1); color: #5a8a5a; }
      &.closed { background: rgba(90,127,170,0.1); color: #5a7faa; }
      &.both { background: var(--accent-10); color: var(--accent); }
      &.neither { background: rgba(160,90,90,0.1); color: #a05a5a; } }
  `,
})
export class StepTopoClosedSetsComponent {
  readonly questions = [
    { set: '(0, 1)', answer: '開集 ✓  閉集 ✗', type: 'open' },
    { set: '[0, 1]', answer: '開集 ✗  閉集 ✓', type: 'closed' },
    { set: '[0, 1)', answer: '開集 ✗  閉集 ✗（既不開也不閉）', type: 'neither' },
    { set: '∅', answer: '開集 ✓  閉集 ✓（clopen!）', type: 'both' },
    { set: 'R', answer: '開集 ✓  閉集 ✓（clopen!）', type: 'both' },
    { set: 'Q（有理數）', answer: '開集 ✗  閉集 ✗', type: 'neither' },
  ];
  readonly revealed = signal(Array(6).fill(false));

  toggle(i: number): void {
    const arr = [...this.revealed()];
    arr[i] = !arr[i];
    this.revealed.set(arr);
  }
}
