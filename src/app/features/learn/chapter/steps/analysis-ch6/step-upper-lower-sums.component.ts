import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { upperSum, lowerSum, getRects, sampleFn } from './analysis-ch6-util';

@Component({
  selector: 'app-step-upper-lower-sums',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="上和與下和" subtitle="§6.2">
      <p>
        <strong>下和</strong> L(f, P)：每段取<strong>最小值</strong>（長方形在曲線<strong>下方</strong>）。
      </p>
      <p>
        <strong>上和</strong> U(f, P)：每段取<strong>最大值</strong>（長方形在曲線<strong>上方</strong>）。
      </p>
      <p class="formula">L(f, P) ≤ ∫f ≤ U(f, P)</p>
      <p>
        加細分割 → 上和下降、下和上升。當 U − L → 0 時，
        它們夾出唯一的值——就是 <strong>Riemann 積分</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="調 n 看上和（紅）和下和（藍）怎麼夾擠出積分">
      <div class="n-ctrl">
        <span class="nl">n = {{ nParts() }}</span>
        <input type="range" min="1" max="50" step="1" [value]="nParts()"
               (input)="nParts.set(+($any($event.target)).value)" class="n-slider" />
      </div>

      <svg viewBox="0 0 520 260" class="ul-svg">
        <line x1="40" y1="220" x2="500" y2="220" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="220" stroke="var(--border)" stroke-width="0.8" />

        <!-- Upper sum rects (red, behind) -->
        @for (r of upperRects(); track $index) {
          <rect [attr.x]="fx(r.x)" [attr.y]="fy(r.yHigh)" [attr.width]="Math.max(0.5, fx(r.x + r.width) - fx(r.x))"
                [attr.height]="Math.max(0.5, fy(0) - fy(r.yHigh))"
                fill="#aa5a6a" fill-opacity="0.12" stroke="#aa5a6a" stroke-width="0.4" />
        }

        <!-- Lower sum rects (blue, front) -->
        @for (r of lowerRects(); track $index) {
          <rect [attr.x]="fx(r.x)" [attr.y]="fy(r.yHigh)" [attr.width]="Math.max(0.5, fx(r.x + r.width) - fx(r.x))"
                [attr.height]="Math.max(0.5, fy(0) - fy(r.yHigh))"
                fill="#5a7faa" fill-opacity="0.15" stroke="#5a7faa" stroke-width="0.4" />
        }

        <!-- Curve -->
        <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />
      </svg>

      <div class="result-grid">
        <div class="rg-card lower">
          <div class="rg-label">下和 L</div>
          <div class="rg-val">{{ lSum().toFixed(6) }}</div>
        </div>
        <div class="rg-card exact">
          <div class="rg-label">精確積分</div>
          <div class="rg-val">{{ (1/3).toFixed(6) }}</div>
        </div>
        <div class="rg-card upper">
          <div class="rg-label">上和 U</div>
          <div class="rg-val">{{ uSum().toFixed(6) }}</div>
        </div>
        <div class="rg-card gap">
          <div class="rg-label">U − L</div>
          <div class="rg-val">{{ (uSum() - lSum()).toExponential(2) }}</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>U − L 隨 n 增大而趨向 0 → 上和和下和<strong>夾住</strong>同一個值 = 積分。</p>
      <p>下一節問：什麼樣的函數是<strong>Riemann 可積</strong>的？</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .n-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .nl { font-size: 14px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; min-width: 50px; }
    .n-slider { flex: 1; accent-color: var(--accent); }
    .ul-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .result-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
    @media (max-width: 500px) { .result-grid { grid-template-columns: 1fr 1fr; } }
    .rg-card { padding: 8px; border-radius: 6px; text-align: center; border: 1px solid var(--border);
      background: var(--bg-surface);
      &.lower { border-color: #5a7faa; } &.upper { border-color: #aa5a6a; }
      &.exact { background: rgba(90,138,90,0.08); border-color: #5a8a5a; }
      &.gap { background: rgba(200,152,59,0.08); } }
    .rg-label { font-size: 10px; color: var(--text-muted); }
    .rg-val { font-size: 13px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
  `,
})
export class StepUpperLowerSumsComponent {
  readonly Math = Math;
  readonly nParts = signal(8);
  private readonly f = (x: number) => x * x;

  readonly upperRects = computed(() => getRects(this.f, 0, 1, this.nParts(), 'upper'));
  readonly lowerRects = computed(() => getRects(this.f, 0, 1, this.nParts(), 'lower'));
  readonly uSum = computed(() => upperSum(this.f, 0, 1, this.nParts()));
  readonly lSum = computed(() => lowerSum(this.f, 0, 1, this.nParts()));

  fx(x: number): number { return 40 + x * 460; }
  fy(y: number): number { return 220 - y * 200; }

  curvePath(): string {
    const pts = sampleFn(this.f, 0, 1, 200);
    return 'M' + pts.map((p) => `${this.fx(p.x)},${this.fy(p.y)}`).join('L');
  }
}
