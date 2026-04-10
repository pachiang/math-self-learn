import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { generateTerms } from './analysis-ch2-util';

const PRESETS = [
  { name: '(-1)ⁿ(1+1/n)', fn: (n: number) => ((-1) ** n) * (1 + 1 / n), limSup: 1, limInf: -1 },
  { name: 'sin(n)', fn: Math.sin, limSup: 1, limInf: -1 },
  { name: '(-1)ⁿ+1/n', fn: (n: number) => ((-1) ** n) + 1 / n, limSup: 1, limInf: -1 },
  { name: '1/n（收斂）', fn: (n: number) => 1 / n, limSup: 0, limInf: 0 },
];

@Component({
  selector: 'app-step-limsup-liminf',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="上極限與下極限" subtitle="§2.8">
      <p>
        有界但不收斂的數列（如 (-1)ⁿ）沒有極限。但我們仍然能定義兩個有用的量：
      </p>
      <p class="formula">
        lim sup aₙ = lim(N→∞) sup(n≥N) aₙ（「最終天花板」）<br />
        lim inf aₙ = lim(N→∞) inf(n≥N) aₙ（「最終地板」）
      </p>
      <p>
        <strong>數列收斂 ⟺ lim sup = lim inf</strong>。
        當它們不相等時，數列在兩者之間「永遠跳動」。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="拖動窗口起點 N，看 sup 和 inf 怎麼穩定下來">
      <div class="ctrl-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ p.name }}</button>
        }
      </div>

      <div class="window-ctrl">
        <span class="wl">窗口起點 N = {{ windowStart() }}</span>
        <input type="range" min="1" max="35" step="1" [value]="windowStart()"
               (input)="windowStart.set(+($any($event.target)).value)" class="w-slider" />
      </div>

      <svg viewBox="0 0 520 200" class="ls-svg">
        <line x1="40" y1="170" x2="510" y2="170" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="170" stroke="var(--border)" stroke-width="0.8" />

        <!-- Window indicator -->
        <rect [attr.x]="nx(windowStart())" y="5" [attr.width]="510 - nx(windowStart())" height="170"
              fill="var(--accent)" fill-opacity="0.04" />

        <!-- lim sup line -->
        <line x1="40" [attr.y1]="vy(currentSup())" x2="510" [attr.y2]="vy(currentSup())"
              stroke="#aa5a6a" stroke-width="1.5" stroke-dasharray="5 3" />
        <text x="512" [attr.y]="vy(currentSup()) + 4" class="ls-label sup">sup = {{ currentSup().toFixed(3) }}</text>

        <!-- lim inf line -->
        <line x1="40" [attr.y1]="vy(currentInf())" x2="510" [attr.y2]="vy(currentInf())"
              stroke="#5a7faa" stroke-width="1.5" stroke-dasharray="5 3" />
        <text x="512" [attr.y]="vy(currentInf()) + 4" class="ls-label inf">inf = {{ currentInf().toFixed(3) }}</text>

        <!-- Dots -->
        @for (t of terms(); track t.n) {
          <circle [attr.cx]="nx(t.n)" [attr.cy]="vy(t.val)" r="3"
                  [attr.fill]="t.n >= windowStart() ? 'var(--accent)' : 'var(--text-muted)'"
                  [attr.fill-opacity]="t.n >= windowStart() ? 0.8 : 0.2" />
        }
      </svg>

      <div class="result-row">
        <div class="r-card">
          <div class="rc-label">lim sup</div>
          <div class="rc-val">{{ current().limSup }}</div>
        </div>
        <div class="r-card">
          <div class="rc-label">lim inf</div>
          <div class="rc-val">{{ current().limInf }}</div>
        </div>
        <div class="r-card" [class.conv]="current().limSup === current().limInf">
          <div class="rc-label">收斂？</div>
          <div class="rc-val">{{ current().limSup === current().limInf ? '是（lim sup = lim inf）' : '否' }}</div>
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        lim sup 和 lim inf 是有界數列的「終極武器」——
        即使數列不收斂，它們也能精確描述數列的<strong>漸近行為</strong>。
      </p>
      <p>
        下一節用心智圖把第一章（完備性）和第二章（數列收斂）串起來。
      </p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 14px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8; }

    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pre-btn { padding: 4px 8px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .window-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .wl { font-size: 13px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; min-width: 140px; }
    .w-slider { flex: 1; accent-color: var(--accent); }

    .ls-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .ls-label { font-size: 8px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
      &.sup { fill: #aa5a6a; } &.inf { fill: #5a7faa; } }

    .result-row { display: flex; gap: 10px; }
    .r-card { flex: 1; padding: 10px; border: 1px solid var(--border); border-radius: 8px;
      background: var(--bg-surface); text-align: center;
      &.conv { background: rgba(90, 138, 90, 0.08); border-color: #5a8a5a; } }
    .rc-label { font-size: 11px; color: var(--text-muted); }
    .rc-val { font-size: 14px; font-weight: 700; color: var(--text);
      font-family: 'JetBrains Mono', monospace; margin-top: 2px; }
  `,
})
export class StepLimsupLiminfComponent {
  readonly presets = PRESETS;
  readonly selIdx = signal(0);
  readonly windowStart = signal(1);

  readonly current = computed(() => PRESETS[this.selIdx()]);
  readonly terms = computed(() => generateTerms(this.current().fn, 50));

  readonly currentSup = computed(() => {
    const N = this.windowStart();
    const tail = this.terms().filter((t) => t.n >= N);
    return tail.length ? Math.max(...tail.map((t) => t.val)) : 0;
  });

  readonly currentInf = computed(() => {
    const N = this.windowStart();
    const tail = this.terms().filter((t) => t.n >= N);
    return tail.length ? Math.min(...tail.map((t) => t.val)) : 0;
  });

  vy(v: number): number { return 90 - v * 60; }
  nx(n: number): number { return 40 + (n / 52) * 470; }
}
