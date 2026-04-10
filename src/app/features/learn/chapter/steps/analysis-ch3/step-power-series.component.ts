import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { taylorCoeff, taylorEval } from './analysis-ch3-util';

interface PowerPreset { name: string; coeffName: string; trueFn: (x: number) => number; R: number; desc: string; }

const PRESETS: PowerPreset[] = [
  { name: '1/(1−x)', coeffName: 'geo', trueFn: (x) => 1 / (1 - x), R: 1,
    desc: 'Σxⁿ，收斂半徑 R = 1' },
  { name: 'eˣ', coeffName: 'exp', trueFn: Math.exp, R: Infinity,
    desc: 'Σxⁿ/n!，收斂半徑 R = ∞' },
  { name: 'ln(1+x)', coeffName: 'ln1px', trueFn: (x) => Math.log(1 + x), R: 1,
    desc: 'Σ(-1)ⁿ⁺¹xⁿ/n，收斂半徑 R = 1' },
];

// Geometric series coefficients
function geoCoeff(n: number): number { return 1; }

@Component({
  selector: 'app-step-power-series',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="冪級數" subtitle="§3.7">
      <p>
        <strong>冪級數</strong> Σaₙxⁿ 的收斂性取決於 x 的大小。
        存在一個<strong>收斂半徑</strong> R：
      </p>
      <ul>
        <li>|x| &lt; R → 絕對收斂</li>
        <li>|x| > R → 發散</li>
        <li>|x| = R → 需要個別分析</li>
      </ul>
      <p>
        在收斂區間內，冪級數可以逐項微分和積分——行為像多項式。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="調 N 看冪級數多項式怎麼逼近真正的函數——收斂半徑外就爆掉">
      <div class="ctrl-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ p.name }}</button>
        }
        <div class="n-ctrl">
          <span class="nl">N = {{ degree() }}</span>
          <input type="range" min="1" max="15" step="1" [value]="degree()"
                 (input)="degree.set(+($any($event.target)).value)" class="n-slider" />
        </div>
      </div>

      <svg viewBox="-20 -20 540 260" class="ps-svg">
        <!-- Axes -->
        <line x1="250" y1="0" x2="250" y2="240" stroke="var(--border)" stroke-width="0.5" />
        <line x1="0" y1="120" x2="500" y2="120" stroke="var(--border)" stroke-width="0.5" />

        <!-- Convergence radius markers -->
        @if (currentR() < 10) {
          <line [attr.x1]="sx(-currentR())" y1="0" [attr.x2]="sx(-currentR())" y2="240"
                stroke="#a05a5a" stroke-width="1" stroke-dasharray="4 3" />
          <line [attr.x1]="sx(currentR())" y1="0" [attr.x2]="sx(currentR())" y2="240"
                stroke="#a05a5a" stroke-width="1" stroke-dasharray="4 3" />
          <text [attr.x]="sx(currentR()) + 3" y="15" class="r-label">R = {{ currentR() }}</text>
        }

        <!-- True function -->
        <path [attr.d]="truePath()" fill="none" stroke="#5a8a5a" stroke-width="2" />

        <!-- Polynomial approximation -->
        <path [attr.d]="polyPath()" fill="none" stroke="var(--accent)" stroke-width="2" />
      </svg>

      <div class="legend">
        <span><span class="dot green"></span>真正的函數</span>
        <span><span class="dot accent"></span>冪級數 N = {{ degree() }}</span>
        @if (currentR() < 10) {
          <span><span class="dot red"></span>|x| = R（紅線外發散）</span>
        }
      </div>
      <div class="desc">{{ currentPreset().desc }}</div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        在收斂半徑裡面，多項式<strong>完美逼近</strong>函數。外面則「爆炸」。
        這個邊界 R 由比值法或根式法決定。
      </p>
      <p>下一節看最重要的冪級數——<strong>Taylor 級數</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .ctrl-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 10px; }
    .pre-btn { padding: 4px 8px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .n-ctrl { display: flex; align-items: center; gap: 6px; margin-left: auto; }
    .nl { font-size: 13px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; }
    .n-slider { width: 100px; accent-color: var(--accent); }

    .ps-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 8px; }
    .r-label { font-size: 9px; fill: #a05a5a; font-weight: 700; font-family: 'JetBrains Mono', monospace; }

    .legend { display: flex; gap: 16px; font-size: 11px; color: var(--text-muted); margin-bottom: 6px; }
    .dot { display: inline-block; width: 14px; height: 3px; margin-right: 4px; vertical-align: middle;
      &.green { background: #5a8a5a; } &.accent { background: var(--accent); } &.red { background: #a05a5a; } }
    .desc { font-size: 12px; color: var(--text-secondary); padding: 8px 12px;
      background: var(--bg-surface); border-radius: 6px; border: 1px solid var(--border); }
  `,
})
export class StepPowerSeriesComponent {
  readonly presets = PRESETS;
  readonly selIdx = signal(0);
  readonly degree = signal(5);

  readonly currentPreset = computed(() => PRESETS[this.selIdx()]);
  readonly currentR = computed(() => this.currentPreset().R);

  private coeffFn = computed(() => {
    const name = this.currentPreset().coeffName;
    return name === 'geo' ? geoCoeff : taylorCoeff(name);
  });

  sx(x: number): number { return 250 + x * 100; }
  sy(y: number): number { return 120 - y * 40; }

  truePath(): string {
    const fn = this.currentPreset().trueFn;
    const pts: string[] = [];
    for (let x = -2.4; x <= 2.4; x += 0.05) {
      const y = fn(x);
      if (isFinite(y) && Math.abs(y) < 5) pts.push(`${this.sx(x)},${this.sy(y)}`);
    }
    return pts.length > 1 ? 'M' + pts.join('L') : '';
  }

  polyPath(): string {
    const cf = this.coeffFn();
    const N = this.degree();
    const pts: string[] = [];
    for (let x = -2.4; x <= 2.4; x += 0.05) {
      const y = taylorEval(cf, x, 0, N);
      if (isFinite(y) && Math.abs(y) < 5) pts.push(`${this.sx(x)},${this.sy(y)}`);
      else break;
    }
    return pts.length > 1 ? 'M' + pts.join('L') : '';
  }
}
