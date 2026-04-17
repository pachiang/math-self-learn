import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-step-fatou',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Fatou 引理" subtitle="§10.5">
      <p>不要求單調時，等號可能變成不等號：</p>
      <p class="formula axiom">
        如果 fₙ ≥ 0，那麼<br />
        <strong>∫ lim inf fₙ ≤ lim inf ∫ fₙ</strong>
      </p>
      <p>
        「積分的 lim inf ≥ lim inf 的積分」。嚴格不等號是可能的——
        面積可以在極限過程中「逃走」。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="fₙ = n·1_(0,1/n)：矩形越窄越高，面積不變但極限是零">
      <div class="n-ctrl">
        <span class="nl">n = {{ nVal() }}</span>
        <input type="range" min="1" max="30" step="1" [value]="nVal()"
               (input)="nVal.set(+($any($event.target)).value)" class="n-slider" />
      </div>

      <svg viewBox="0 0 520 240" class="fatou-svg">
        <!-- Axes -->
        <line x1="40" y1="200" x2="500" y2="200" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="200" stroke="var(--border)" stroke-width="0.8" />
        <text x="36" y="200" text-anchor="end" fill="var(--text-muted)" font-size="7">0</text>
        <text x="500" y="212" text-anchor="middle" fill="var(--text-muted)" font-size="7">1</text>

        <!-- Ghost rectangles for previous n values -->
        @for (ghost of ghosts(); track ghost.n) {
          <rect [attr.x]="40" [attr.y]="200 - ghost.h"
                [attr.width]="ghost.w" [attr.height]="ghost.h"
                fill="var(--accent)" [attr.fill-opacity]="ghost.opacity"
                stroke="none" />
        }

        <!-- Current rectangle: height = n, width = 1/n -->
        <rect [attr.x]="40" [attr.y]="rectTop()"
              [attr.width]="Math.max(2, rectWidth())" [attr.height]="rectHeight()"
              fill="var(--accent)" fill-opacity="0.3"
              stroke="var(--accent)" stroke-width="1.5" />

        <!-- Area = 1 label inside rectangle -->
        @if (rectWidth() > 20) {
          <text [attr.x]="40 + rectWidth() / 2" [attr.y]="rectTop() + rectHeight() / 2 + 4"
                text-anchor="middle" fill="var(--accent)" font-size="10" font-weight="700">
            面積 = 1
          </text>
        }

        <!-- Height label -->
        <text x="35" [attr.y]="rectTop() + 4" text-anchor="end" fill="var(--accent)" font-size="7">{{ nVal() }}</text>

        <!-- Width label -->
        <text [attr.x]="40 + Math.max(2, rectWidth()) / 2" y="215" text-anchor="middle"
              fill="var(--text-muted)" font-size="7">1/{{ nVal() }}</text>
      </svg>

      <div class="result-row">
        <div class="r-card">高度 = n = {{ nVal() }}</div>
        <div class="r-card">寬度 = 1/n = {{ (1/nVal()).toFixed(4) }}</div>
        <div class="r-card accent">∫ fₙ = {{ (1).toFixed(1) }}（恆等於 1）</div>
      </div>

      <div class="inequality">0 = ∫ lim fₙ &lt; lim inf ∫ fₙ = 1</div>
      <div class="escape-note">
        面積「逃到無窮高」了——矩形越來越窄但越來越高，面積守恆但極限函數是零。
      </div>
    </app-challenge-card>

    <app-challenge-card prompt="三大定理比較">
      <div class="comparison">
        <table class="cmp">
          <thead><tr><th>定理</th><th>條件</th><th>結論</th></tr></thead>
          <tbody>
            <tr><td>MCT</td><td>0 ≤ f₁ ≤ f₂ ≤ …（<strong>單調</strong>）</td><td>lim ∫ = ∫ lim（<strong>等號</strong>）</td></tr>
            <tr><td>Fatou</td><td>fₙ ≥ 0（<strong>不需要單調</strong>）</td><td>∫ lim inf ≤ lim inf ∫（<strong>不等號</strong>）</td></tr>
            <tr class="highlight"><td>DCT</td><td>|fₙ| ≤ g ∈ L¹（<strong>控制</strong>）</td><td>lim ∫ = ∫ lim（<strong>等號</strong>）</td></tr>
          </tbody>
        </table>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>Fatou 引理是 MCT 和 DCT 之間的橋樑。下一節看最強的工具——<strong>控制收斂定理</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 14px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8;
      &.axiom { border: 2px solid var(--accent); } strong { color: var(--text); } }
    .n-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .nl { font-size: 16px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 60px; }
    .n-slider { flex: 1; accent-color: var(--accent); height: 24px; }
    .fatou-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .result-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
    .r-card { flex: 1; min-width: 80px; padding: 8px; border-radius: 6px; text-align: center;
      font-size: 12px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.accent { background: var(--accent-10); color: var(--accent); } }
    .inequality { text-align: center; font-size: 16px; font-weight: 700; color: #a05a5a;
      font-family: 'JetBrains Mono', monospace; padding: 10px;
      background: rgba(160,90,90,0.08); border-radius: 8px; margin-bottom: 8px; }
    .escape-note { text-align: center; font-size: 12px; color: var(--text-muted); margin-bottom: 14px; }
    .comparison { overflow-x: auto; }
    .cmp { width: 100%; border-collapse: collapse; font-size: 12px; }
    .cmp th { padding: 8px; text-align: left; color: var(--text-muted);
      border-bottom: 1px solid var(--border); font-weight: 600; background: var(--bg-surface); }
    .cmp td { padding: 8px; border-bottom: 1px solid var(--border); color: var(--text-secondary);
      strong { color: var(--accent); } }
    .cmp tr.highlight td { background: var(--accent-10); }
  `,
})
export class StepFatouComponent {
  readonly Math = Math;
  readonly nVal = signal(3);

  private readonly maxVisualHeight = 190;

  rectWidth(): number {
    const n = this.nVal();
    return (1 / n) * 460;
  }

  rectHeight(): number {
    const n = this.nVal();
    // Scale: area = 1, so height * width_fraction = 1 in unit space
    // Visual: cap at maxVisualHeight
    return Math.min(this.maxVisualHeight, n * (this.maxVisualHeight / 30));
  }

  rectTop(): number {
    return 200 - this.rectHeight();
  }

  readonly ghosts = computed(() => {
    const current = this.nVal();
    const result: { n: number; w: number; h: number; opacity: number }[] = [];
    for (let n = 1; n < current; n++) {
      const w = (1 / n) * 460;
      const h = Math.min(this.maxVisualHeight, n * (this.maxVisualHeight / 30));
      const age = current - n;
      if (age <= 6) {
        result.push({ n, w: Math.max(2, w), h, opacity: 0.06 * (7 - age) / 7 });
      }
    }
    return result;
  });
}
