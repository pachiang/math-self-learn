import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { d0, d1, DEMO_1FORMS } from './analysis-ch19-util';

@Component({
  selector: 'app-step-exterior-derivative',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="外微分 d" subtitle="§19.4">
      <p>
        <strong>外微分</strong> d 是統一 grad、curl、div 的「萬能導數」：
      </p>
      <ul>
        <li><strong>d(0-form)</strong> = 1-form：df = (∂f/∂x) dx + (∂f/∂y) dy → 就是<strong>梯度</strong></li>
        <li><strong>d(1-form)</strong> = 2-form：d(P dx + Q dy) = (∂Q/∂x − ∂P/∂y) dx∧dy → 就是<strong>旋度</strong></li>
        <li><strong>d(2-form)</strong> = 3-form：在 3D 裡就是<strong>散度</strong></li>
      </ul>
      <p>
        而且 <strong>dd = 0</strong>（恆等式！）——梯度的旋度 = 0，旋度的散度 = 0，全部是同一件事。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="選 1-form，看 dω 在每個點的值（= 旋度）">
      <div class="fn-tabs">
        @for (f of forms; track f.name; let i = $index) {
          <button class="ft" [class.active]="sel() === i" (click)="sel.set(i)">{{ f.formula }}</button>
        }
      </div>

      <svg viewBox="-2.5 -2.5 5 5" class="d-svg">
        @for (g of [-2,-1,0,1,2]; track g) {
          <line [attr.x1]="g" y1="-2.5" [attr.x2]="g" y2="2.5" stroke="var(--border)" stroke-width="0.008" />
          <line x1="-2.5" [attr.y1]="g" x2="2.5" [attr.y2]="g" stroke="var(--border)" stroke-width="0.008" />
        }

        <!-- dω heatmap -->
        @for (cell of heatmap(); track cell.key) {
          <rect [attr.x]="cell.x - 0.2" [attr.y]="-(cell.y + 0.2)" width="0.4" height="0.4"
                [attr.fill]="cell.val > 0 ? '#5a8a5a' : cell.val < 0 ? '#a05a5a' : 'transparent'"
                [attr.fill-opacity]="Math.min(0.6, Math.abs(cell.val) * 0.15)" />
        }

        <!-- 1-form arrows -->
        @for (a of arrows(); track a.key) {
          <line [attr.x1]="a.x" [attr.y1]="-a.y"
                [attr.x2]="a.x + a.dx * 0.2" [attr.y2]="-(a.y + a.dy * 0.2)"
                stroke="var(--accent)" stroke-width="0.02" stroke-opacity="0.5" />
        }
      </svg>

      <div class="legend">
        <span><span class="dot green"></span>dω > 0 (逆時針旋轉)</span>
        <span><span class="dot red"></span>dω &lt; 0 (順時針旋轉)</span>
        <span class="note">dω = 0 → ω 是閉形式 (closed)</span>
      </div>

      <div class="dd-box">
        <strong>dd = 0 的意義</strong>：如果 ω = df（恰當），那 dω = d(df) = 0（閉）。
        <br>恰當 (exact) ⇒ 閉 (closed)。反過來在單連通區域上也成立（Poincare 引理）。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        注意 x dx + y dy 的 dω = 0（恰當形式，因為 ω = d(x²+y²)/2）。
        而 −y dx + x dy 的 dω = 2 dx∧dy ≠ 0（非恰當）。
        外微分 d 一招就區分了保守/非保守。
      </p>
    </app-prose-block>
  `,
  styles: `
    .fn-tabs { display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap; }
    .ft { padding: 5px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .d-svg { width: 100%; max-width: 380px; display: block; margin: 0 auto 10px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); aspect-ratio: 1; }
    .legend { display: flex; gap: 12px; font-size: 11px; color: var(--text-muted); margin-bottom: 10px; flex-wrap: wrap; }
    .dot { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 4px; vertical-align: middle;
      &.green { background: rgba(90,138,90,0.4); } &.red { background: rgba(160,90,90,0.4); } }
    .note { font-style: italic; }
    .dd-box { padding: 12px; border-radius: 8px; background: var(--accent-10); border: 1px solid var(--accent);
      font-size: 12px; text-align: center; color: var(--text-muted); line-height: 1.7; }
    .dd-box strong { color: var(--accent); }
  `,
})
export class StepExteriorDerivativeComponent {
  readonly Math = Math;
  readonly forms = DEMO_1FORMS;
  readonly sel = signal(0);

  readonly heatmap = computed(() => {
    const omega = DEMO_1FORMS[this.sel()].omega;
    const cells: { key: string; x: number; y: number; val: number }[] = [];
    for (let x = -2.2; x <= 2.2; x += 0.4) {
      for (let y = -2.2; y <= 2.2; y += 0.4) {
        cells.push({ key: `${x},${y}`, x, y, val: d1(omega, x, y) });
      }
    }
    return cells;
  });

  readonly arrows = computed(() => {
    const omega = DEMO_1FORMS[this.sel()].omega;
    const result: { key: string; x: number; y: number; dx: number; dy: number }[] = [];
    for (let x = -2; x <= 2; x += 0.5) {
      for (let y = -2; y <= 2; y += 0.5) {
        const [P, Q] = omega(x, y);
        const mag = Math.sqrt(P * P + Q * Q);
        const s = mag > 0 ? Math.min(1, 1 / mag) : 0;
        result.push({ key: `${x},${y}`, x, y, dx: P * s, dy: Q * s });
      }
    }
    return result;
  });
}
