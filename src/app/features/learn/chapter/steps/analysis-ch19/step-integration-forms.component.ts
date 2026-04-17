import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { DEMO_1FORMS, integrateForm1 } from './analysis-ch19-util';

@Component({
  selector: 'app-step-integration-forms',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="微分形式的積分" subtitle="§19.8">
      <p>
        k-form 天然知道自己該在 k 維的東西上被積分：
      </p>
      <ul>
        <li><strong>0-form</strong> f：在「0 維邊界」（點）上求值 → f(b) − f(a)</li>
        <li><strong>1-form</strong> ω = P dx + Q dy：沿<strong>曲線</strong>積分 → ∫_C ω</li>
        <li><strong>2-form</strong> f dx∧dy：在<strong>曲面</strong>上積分 → ∬_S ω</li>
      </ul>
      <p>形式的「階數」自動匹配被積區域的「維度」。不需要手動寫 ds 或 dA。</p>
    </app-prose-block>

    <app-challenge-card prompt="同一個 1-form 沿不同路徑的積分">
      <div class="fn-tabs">
        @for (f of forms; track f.name; let i = $index) {
          <button class="ft" [class.active]="formSel() === i" (click)="formSel.set(i)">{{ f.formula }}</button>
        }
      </div>

      <svg viewBox="-2 -2 4 4" class="int-svg">
        @for (g of [-1,0,1]; track g) {
          <line [attr.x1]="g" y1="-2" [attr.x2]="g" y2="2" stroke="var(--border)" stroke-width="0.008" />
          <line x1="-2" [attr.y1]="g" x2="2" [attr.y2]="g" stroke="var(--border)" stroke-width="0.008" />
        }

        <!-- Path: unit circle -->
        <circle cx="0" cy="0" r="1" fill="none" stroke="var(--accent)" stroke-width="0.03" />
        <text x="0.8" y="-0.85" fill="var(--accent)" font-size="0.1">C₁ 圓</text>

        <!-- Path: straight line -->
        <line x1="-1" y1="1" x2="1" y2="-1" stroke="#bf8a5a" stroke-width="0.03" />
        <text x="0.6" y="-0.65" fill="#bf8a5a" font-size="0.1">C₂ 直線</text>

        <!-- Path: parabola -->
        <path [attr.d]="parabolaPath()" fill="none" stroke="#5a8a5a" stroke-width="0.03" />
        <text x="0.85" y="0.4" fill="#5a8a5a" font-size="0.1">C₃ 拋物線</text>
      </svg>

      <div class="results">
        <div class="r-row">
          <span class="r-path" style="color: var(--accent)">C₁ 單位圓</span>
          <span class="r-val">∫ ω = {{ circleVal().toFixed(4) }}</span>
        </div>
        <div class="r-row">
          <span class="r-path" style="color: #bf8a5a">C₂ 直線 (−1,1)→(1,−1)</span>
          <span class="r-val">∫ ω = {{ lineVal().toFixed(4) }}</span>
        </div>
        <div class="r-row">
          <span class="r-path" style="color: #5a8a5a">C₃ 拋物線 y=x² (0→1)</span>
          <span class="r-val">∫ ω = {{ paraVal().toFixed(4) }}</span>
        </div>
      </div>

      @if (forms[formSel()].exact) {
        <div class="note ok">恰當形式：積分只看端點，路徑無關。</div>
      } @else {
        <div class="note">非恰當形式：不同路徑給不同值。閉路 ≠ 0。</div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        微分形式讓「被積的東西」和「被積的地方」完美匹配——
        不再需要記住什麼時候用 ds、什麼時候用 dA、什麼時候要乘 |r'|。
        形式自己知道。
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
    .int-svg { width: 100%; max-width: 360px; display: block; margin: 0 auto 12px;
      border: 1px solid var(--border); border-radius: 12px; background: var(--bg); aspect-ratio: 1; }
    .results { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 10px; }
    .r-row { display: flex; justify-content: space-between; padding: 10px 14px;
      border-bottom: 1px solid var(--border); font-family: 'JetBrains Mono', monospace; font-size: 12px;
      &:last-child { border-bottom: none; } }
    .r-path { font-weight: 600; }
    .r-val { font-weight: 700; color: var(--accent); }
    .note { padding: 8px; border-radius: 6px; font-size: 12px; text-align: center; color: var(--text-muted);
      background: var(--bg-surface); border: 1px solid var(--border);
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; } }
  `,
})
export class StepIntegrationFormsComponent {
  readonly forms = DEMO_1FORMS;
  readonly formSel = signal(0);

  readonly circleVal = computed(() => integrateForm1(
    DEMO_1FORMS[this.formSel()].omega,
    (t) => [Math.cos(t), Math.sin(t)],
    (t) => [-Math.sin(t), Math.cos(t)],
    [0, 2 * Math.PI],
  ));

  readonly lineVal = computed(() => integrateForm1(
    DEMO_1FORMS[this.formSel()].omega,
    (t) => [-1 + 2 * t, 1 - 2 * t],
    () => [2, -2],
    [0, 1],
  ));

  readonly paraVal = computed(() => integrateForm1(
    DEMO_1FORMS[this.formSel()].omega,
    (t) => [t, t * t],
    (t) => [1, 2 * t],
    [0, 1],
  ));

  parabolaPath(): string {
    let path = '';
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      path += (i === 0 ? 'M' : 'L') + `${t.toFixed(3)},${(-t * t).toFixed(3)}`;
    }
    return path;
  }
}
