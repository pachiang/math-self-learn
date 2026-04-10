import { Component, signal, computed, OnDestroy } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { cobwebPoints, iterateContraction, sampleFn } from './analysis-ch8-util';

interface ContractionPreset { name: string; fn: (x: number) => number; lo: number; hi: number;
  fixedPoint: number; desc: string; }

const PRESETS: ContractionPreset[] = [
  { name: 'cos(x)', fn: Math.cos, lo: -0.5, hi: 2, fixedPoint: 0.7391,
    desc: 'cos 的不動點 ≈ 0.7391（Dottie 數）' },
  { name: '(x+2/x)/2 → √2', fn: (x) => (x + 2 / x) / 2, lo: 0.5, hi: 3, fixedPoint: Math.SQRT2,
    desc: 'Babylonian 法，二次收斂到 √2' },
  { name: 'x/2 + 1', fn: (x) => x / 2 + 1, lo: -1, hi: 4, fixedPoint: 2,
    desc: '線性壓縮，不動點 = 2' },
];

@Component({
  selector: 'app-step-contraction',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="壓縮映射定理" subtitle="§8.8">
      <p>
        <strong>壓縮映射</strong>：d(f(x), f(y)) ≤ c · d(x,y)，c &lt; 1。每次套用 f，距離至少縮小 c 倍。
      </p>
      <p class="formula axiom">
        Banach 不動點定理：<br />
        完備度量空間上的壓縮映射有<strong>唯一不動點</strong>，<br />
        且從<strong>任何起點</strong>迭代都會收斂到它。
      </p>
      <p>
        這是存在性+唯一性+演算法三合一的定理。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="蜘蛛網圖：從任意起點開始迭代，看軌跡螺旋收斂到不動點">
      <div class="ctrl-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="select(i)">{{ p.name }}</button>
        }
      </div>
      <div class="ctrl-row">
        <span class="cl">起點 x₀ = {{ x0().toFixed(2) }}</span>
        <input type="range" [min]="cur().lo" [max]="cur().hi" step="0.05" [value]="x0()"
               (input)="x0.set(+($any($event.target)).value)" class="sl" />
        <button class="act-btn" (click)="toggleRun()">{{ running() ? '⏸' : '▶ 動畫' }}</button>
      </div>

      <svg viewBox="-20 -20 540 340" class="cob-svg">
        <!-- Axes -->
        <line x1="40" y1="280" x2="500" y2="280" stroke="var(--border)" stroke-width="0.8" />
        <line x1="40" y1="10" x2="40" y2="280" stroke="var(--border)" stroke-width="0.8" />

        <!-- y = x line -->
        <line [attr.x1]="sx(cur().lo)" [attr.y1]="sy(cur().lo)"
              [attr.x2]="sx(cur().hi)" [attr.y2]="sy(cur().hi)"
              stroke="var(--text-muted)" stroke-width="1" stroke-dasharray="4 3" />

        <!-- f(x) curve -->
        <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />

        <!-- Cobweb -->
        <path [attr.d]="cobwebPath()" fill="none" stroke="#c8983b" stroke-width="1.5" stroke-opacity="0.7" />

        <!-- Fixed point -->
        <circle [attr.cx]="sx(cur().fixedPoint)" [attr.cy]="sy(cur().fixedPoint)"
                r="5" fill="#5a8a5a" stroke="white" stroke-width="1.5" />

        <!-- Current iteration point -->
        @if (iterations().length > 0) {
          <circle [attr.cx]="sx(lastIter())" [attr.cy]="sy(lastIter())"
                  r="4" fill="#c8983b" stroke="white" stroke-width="1" />
        }
      </svg>

      <div class="result-row">
        <div class="r-card">迭代 {{ visibleSteps() }} 次</div>
        <div class="r-card">xₙ = {{ lastIter().toFixed(8) }}</div>
        <div class="r-card ok">不動點 = {{ cur().fixedPoint.toFixed(8) }}</div>
      </div>
      <div class="desc">{{ cur().desc }}</div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        不管從哪裡開始，軌跡<strong>一定螺旋到不動點</strong>。
        這就是 Banach 定理的威力。應用：Newton 法、Picard 迭代（ODE 存在性）。
      </p>
      <p>下一節做統一回顧。</p>
    </app-prose-block>
  `,
  styles: `
    .formula { text-align: center; font-size: 13px; font-weight: 600; color: var(--accent);
      padding: 14px; background: var(--accent-10); border-radius: 8px; margin: 10px 0;
      font-family: 'JetBrains Mono', monospace; line-height: 1.8;
      &.axiom { border: 2px solid var(--accent); } }
    .ctrl-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 8px; }
    .pre-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .cl { font-size: 12px; font-weight: 700; color: var(--text); font-family: 'JetBrains Mono', monospace; min-width: 100px; }
    .sl { width: 120px; accent-color: var(--accent); }
    .act-btn { padding: 4px 12px; border: 1px solid var(--accent); border-radius: 6px;
      background: var(--accent); color: white; font-size: 12px; cursor: pointer; margin-left: auto; }
    .cob-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 12px; background: var(--bg); margin-bottom: 10px; }
    .result-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
    .r-card { flex: 1; min-width: 80px; padding: 8px; border-radius: 6px; text-align: center;
      font-size: 12px; font-weight: 600; font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; } }
    .desc { font-size: 12px; color: var(--text-secondary); padding: 8px 12px;
      background: var(--bg-surface); border-radius: 6px; border: 1px solid var(--border); }
  `,
})
export class StepContractionComponent implements OnDestroy {
  readonly presets = PRESETS;
  readonly selIdx = signal(0);
  readonly x0 = signal(0.2);
  readonly visibleSteps = signal(0);
  readonly running = signal(false);
  private timer: ReturnType<typeof setInterval> | null = null;

  readonly cur = computed(() => PRESETS[this.selIdx()]);
  readonly iterations = computed(() => iterateContraction(this.cur().fn, this.x0(), 30));
  readonly lastIter = computed(() => this.iterations()[Math.min(this.visibleSteps(), this.iterations().length - 1)]);
  readonly cobweb = computed(() => cobwebPoints(this.cur().fn, this.x0(), Math.min(this.visibleSteps(), 25)));

  select(i: number): void { this.selIdx.set(i); this.visibleSteps.set(0); this.stopRun(); }

  sx(x: number): number {
    const c = this.cur();
    return 40 + ((x - c.lo) / (c.hi - c.lo)) * 460;
  }
  sy(y: number): number {
    const c = this.cur();
    return 280 - ((y - c.lo) / (c.hi - c.lo)) * 265;
  }

  curvePath(): string {
    const c = this.cur();
    const pts = sampleFn(c.fn, c.lo, c.hi, 200);
    return 'M' + pts.filter((p) => p.y >= c.lo && p.y <= c.hi)
      .map((p) => `${this.sx(p.x)},${this.sy(p.y)}`).join('L');
  }

  cobwebPath(): string {
    const pts = this.cobweb();
    if (pts.length < 2) return '';
    return 'M' + pts.map((p) => `${this.sx(p.x)},${this.sy(p.y)}`).join('L');
  }

  toggleRun(): void {
    if (this.running()) { this.stopRun(); } else {
      this.running.set(true);
      this.visibleSteps.set(0);
      this.timer = setInterval(() => {
        if (this.visibleSteps() >= 25) this.stopRun();
        else this.visibleSteps.update((v) => v + 1);
      }, 200);
    }
  }

  private stopRun(): void { this.running.set(false); if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  ngOnDestroy(): void { this.stopRun(); }
}
