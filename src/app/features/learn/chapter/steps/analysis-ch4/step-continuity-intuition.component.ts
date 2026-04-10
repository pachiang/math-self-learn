import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { weierstrass, sampleFunction } from './analysis-ch4-util';

@Component({
  selector: 'app-step-continuity-intuition',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="連續性的幾何直覺" subtitle="§4.3">
      <p>
        直覺說法：連續函數可以「<strong>不提筆地畫完</strong>」。
        這對大部分例子是對的，但精確定義比直覺更豐富——
        連續函數可以「怪」到超乎想像。
      </p>
      <p>
        <strong>Weierstrass 函數</strong>（1872）：處處連續，但<strong>處處不可微</strong>。
        你可以不提筆地畫，但每一點都是「尖角」——沒有切線。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="調項數看 Weierstrass 函數怎麼越來越「碎」但永遠連續">
      <div class="ctrl-row">
        <span class="nl">項數 N = {{ terms() }}</span>
        <input type="range" min="1" max="12" step="1" [value]="terms()"
               (input)="terms.set(+($any($event.target)).value)" class="n-slider" />
      </div>

      <svg viewBox="0 0 520 220" class="w-svg">
        <line x1="20" y1="110" x2="500" y2="110" stroke="var(--border)" stroke-width="0.5" />

        <path [attr.d]="wPath()" fill="none" stroke="var(--accent)" stroke-width="1.5" />
      </svg>

      <div class="info-grid">
        <div class="info-card">
          <div class="ic-label">連續？</div>
          <div class="ic-val ok">永遠連續 ✓</div>
        </div>
        <div class="info-card">
          <div class="ic-label">可微？</div>
          <div class="ic-val bad">處處不可微 ✗</div>
        </div>
        <div class="info-card">
          <div class="ic-label">N = {{ terms() }}</div>
          <div class="ic-val">{{ terms() }} 個 cos 疊加</div>
        </div>
      </div>

      <div class="insight">
        每加一項，函數多一層「皺褶」。在任何尺度放大都能看到新的振盪——這是碎形結構。
        但加法是有限和的極限，每個有限和都連續，均勻收斂 → 極限也連續。
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        Weierstrass 函數打破了「連續 → 幾乎處處可微」的直覺。
        「連續」比你想的<strong>更寬</strong>，「可微」比你想的<strong>更嚴格</strong>。
      </p>
      <p>下一節正式分類不同類型的<strong>間斷點</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .nl { font-size: 13px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; min-width: 90px; }
    .n-slider { flex: 1; accent-color: var(--accent); }
    .w-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px; }
    .info-card { padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); text-align: center; }
    .ic-label { font-size: 11px; color: var(--text-muted); }
    .ic-val { font-size: 13px; font-weight: 700; margin-top: 2px;
      &.ok { color: #5a8a5a; } &.bad { color: #a05a5a; } }
    .insight { padding: 10px 14px; font-size: 12px; color: var(--text-secondary);
      background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border); }
  `,
})
export class StepContinuityIntuitionComponent {
  readonly terms = signal(3);

  wPath(): string {
    const N = this.terms();
    const pts: string[] = [];
    for (let px = 0; px <= 480; px += 1) {
      const x = (px / 480) * 2 - 1;
      const y = weierstrass(x, N);
      pts.push(`${20 + px},${110 - y * 40}`);
    }
    return 'M' + pts.join('L');
  }
}
