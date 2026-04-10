import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { differenceQuotient, sampleFn } from './analysis-ch5-util';

interface Preset { name: string; fn: (x: number) => number; dfn: (x: number) => number; }

const PRESETS: Preset[] = [
  { name: 'x²', fn: (x) => x * x, dfn: (x) => 2 * x },
  { name: 'sin x', fn: Math.sin, dfn: Math.cos },
  { name: 'eˣ', fn: Math.exp, dfn: Math.exp },
  { name: '|x|', fn: Math.abs, dfn: (x) => x > 0 ? 1 : x < 0 ? -1 : NaN },
];

@Component({
  selector: 'app-step-derivative-def',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="導數的定義" subtitle="§5.1">
      <p>
        <strong>導數</strong>是「差商的極限」——割線的斜率趨近切線的斜率：
      </p>
      <p class="formula">
        f'(x₀) = lim(h→0) [f(x₀+h) − f(x₀)] / h
      </p>
      <p>
        幾何意義：f 在 x₀ 的<strong>切線斜率</strong>。
        分析意義：函數在 x₀ 附近的<strong>最佳線性近似</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="縮小 h 看割線怎麼變成切線">
      <div class="ctrl-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ p.name }}</button>
        }
      </div>
      <div class="ctrl-row">
        <span class="cl">x₀ = {{ x0().toFixed(2) }}</span>
        <input type="range" min="-2" max="2" step="0.05" [value]="x0()"
               (input)="x0.set(+($any($event.target)).value)" class="sl" />
        <span class="cl">h = {{ h().toFixed(4) }}</span>
        <input type="range" min="-2" max="2" step="0.01" [value]="hLog()"
               (input)="onHLog($event)" class="sl" />
      </div>

      <svg viewBox="0 0 520 280" class="der-svg">
        <line x1="50" y1="220" x2="490" y2="220" stroke="var(--border)" stroke-width="0.8" />
        <line x1="50" y1="10" x2="50" y2="220" stroke="var(--border)" stroke-width="0.8" />

        <!-- Function curve -->
        <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="2" />

        <!-- Secant line -->
        <line [attr.x1]="fx(x0() - 2)" [attr.y1]="fy(secantY(x0() - 2))"
              [attr.x2]="fx(x0() + 2)" [attr.y2]="fy(secantY(x0() + 2))"
              stroke="#c8983b" stroke-width="1.5" stroke-opacity="0.6" />

        <!-- Tangent line (true derivative) -->
        <line [attr.x1]="fx(x0() - 2)" [attr.y1]="fy(tangentY(x0() - 2))"
              [attr.x2]="fx(x0() + 2)" [attr.y2]="fy(tangentY(x0() + 2))"
              stroke="#5a8a5a" stroke-width="1.5" stroke-dasharray="5 3" />

        <!-- Points x₀ and x₀+h -->
        <circle [attr.cx]="fx(x0())" [attr.cy]="fy(currentFn()(x0()))" r="5"
                fill="var(--accent)" stroke="white" stroke-width="1.5" />
        @if (Math.abs(h()) > 0.001) {
          <circle [attr.cx]="fx(x0() + h())" [attr.cy]="fy(currentFn()(x0() + h()))" r="4"
                  fill="#c8983b" stroke="white" stroke-width="1" />
        }
      </svg>

      <div class="result-row">
        <div class="r-card">差商 = {{ dq().toFixed(6) }}</div>
        <div class="r-card ok">真正的 f'(x₀) = {{ trueD().toFixed(6) }}</div>
        <div class="r-card">|誤差| = {{ Math.abs(dq() - trueD()).toExponential(2) }}</div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        當 h → 0，金色割線旋轉到跟綠色切線<strong>完全重合</strong>。
        差商收斂到導數。
      </p>
      <p>下一節問：可微和連續是什麼關係？</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 15px; font-weight: 600; color: var(--accent);
      padding: 12px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; }
    .ctrl-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 8px; }
    .pre-btn { padding: 4px 8px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 11px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .cl { font-size: 12px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; min-width: 80px; }
    .sl { width: 100px; accent-color: var(--accent); }
    .der-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .result-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .r-card { flex: 1; min-width: 100px; padding: 8px; border-radius: 6px; text-align: center;
      font-size: 12px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; } }
  `,
})
export class StepDerivativeDefComponent {
  readonly Math = Math;
  readonly presets = PRESETS;
  readonly selIdx = signal(0);
  readonly x0 = signal(1.0);
  readonly hLog = signal(0);

  readonly h = computed(() => {
    const hl = this.hLog();
    // Map slider [-2, 2] to h via sign-preserving log scale
    if (Math.abs(hl) < 0.05) return 0;
    return Math.sign(hl) * Math.pow(10, -3 + Math.abs(hl));
  });

  readonly currentFn = computed(() => PRESETS[this.selIdx()].fn);
  readonly currentDfn = computed(() => PRESETS[this.selIdx()].dfn);

  readonly dq = computed(() => {
    const hv = this.h();
    return Math.abs(hv) < 1e-12 ? this.trueD() : differenceQuotient(this.currentFn(), this.x0(), hv);
  });

  readonly trueD = computed(() => this.currentDfn()(this.x0()));

  fx(x: number): number { return 50 + ((x + 3) / 6) * 440; }
  fy(y: number): number { return 220 - ((y + 2) / 10) * 210; }

  secantY(x: number): number {
    const fn = this.currentFn();
    const x0 = this.x0(), hv = this.h();
    const slope = Math.abs(hv) < 1e-12 ? this.trueD() : differenceQuotient(fn, x0, hv);
    return fn(x0) + slope * (x - x0);
  }

  tangentY(x: number): number {
    const fn = this.currentFn();
    const x0 = this.x0();
    return fn(x0) + this.trueD() * (x - x0);
  }

  curvePath(): string {
    const pts = sampleFn(this.currentFn(), -3, 3, 300);
    const valid = pts.filter((p) => Math.abs(p.y) < 8);
    if (valid.length < 2) return '';
    return 'M' + valid.map((p) => `${this.fx(p.x)},${this.fy(p.y)}`).join('L');
  }

  onHLog(ev: Event): void { this.hLog.set(+(ev.target as HTMLInputElement).value); }
}
