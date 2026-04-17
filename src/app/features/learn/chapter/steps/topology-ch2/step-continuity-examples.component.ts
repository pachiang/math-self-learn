import { Component, signal } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-continuity-examples',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="連續映射的例子" subtitle="§2.2">
      <p>拓撲的選擇直接影響什麼函數是連續的：</p>
    </app-prose-block>

    <app-challenge-card prompt="同一個函數，換個拓撲就可能從連續變不連續">
      <div class="example-stack">
        @for (ex of examples; track ex.name; let i = $index) {
          <div class="ex-card" (click)="sel.set(i)" [class.active]="sel() === i">
            <div class="ex-name">{{ ex.name }}</div>
            <div class="ex-map">{{ ex.map }}</div>
            <div class="ex-result" [class]="ex.type">{{ ex.result }}</div>
            @if (sel() === i) {
              <div class="ex-why">{{ ex.why }}</div>
            }
          </div>
        }
      </div>

      <div class="key-point">
        <strong>離散拓撲上一切連續</strong>（因為任何原像都是開集）。
        <strong>密著拓撲上只有常數連續</strong>（因為只有 ∅ 和 X 是開集）。
        拓撲越細 → 連續函數越少。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>連續性不是函數本身的性質——它取決於<strong>源和目標的拓撲</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .example-stack { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
    .ex-card { padding: 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface);
      cursor: pointer; transition: all 0.15s;
      &:hover { background: var(--accent-10); }
      &.active { border-color: var(--accent); } }
    .ex-name { font-size: 13px; font-weight: 700; color: var(--text); }
    .ex-map { font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; margin: 2px 0; }
    .ex-result { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;
      &.yes { background: rgba(90,138,90,0.1); color: #5a8a5a; }
      &.no { background: rgba(160,90,90,0.1); color: #a05a5a; } }
    .ex-why { font-size: 11px; color: var(--text-muted); margin-top: 6px; padding-top: 6px; border-top: 1px solid var(--border); }
    .key-point { padding: 12px; border-radius: 8px; background: var(--accent-10); border: 1px solid var(--accent);
      font-size: 12px; color: var(--text-muted); text-align: center; line-height: 1.7; }
    .key-point strong { color: var(--accent); }
  `,
})
export class StepContinuityExamplesComponent {
  readonly sel = signal(0);
  readonly examples = [
    { name: 'id: (R, 標準) → (R, 標準)', map: 'f(x) = x', result: '連續 ✓', type: 'yes',
      why: '開區間的原像還是開區間。' },
    { name: 'id: (R, 標準) → (R, 離散)', map: 'f(x) = x', result: '不連續 ✗', type: 'no',
      why: '單點集在離散拓撲中是開集，但原像也是單點集，在標準拓撲中不是開集。' },
    { name: 'id: (R, 離散) → (R, 標準)', map: 'f(x) = x', result: '連續 ✓', type: 'yes',
      why: '標準拓撲的開集的原像在離散拓撲中一定是開集（一切都是開集）。' },
    { name: '常函數 f(x)=0', map: 'f: (任何拓撲) → (任何拓撲)', result: '永遠連續 ✓', type: 'yes',
      why: '開集的原像不是 ∅ 就是 X，都是開集。' },
    { name: 'floor: (R, 標準) → (R, 標準)', map: 'f(x) = ⌊x⌋', result: '不連續 ✗', type: 'no',
      why: '(0.5, 1.5) 的原像 = [1, 1.5)，不是開集。' },
  ];
}
