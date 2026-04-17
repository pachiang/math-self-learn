import { Component, signal, computed, OnDestroy } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { bisectionRoot, sampleFunction } from './analysis-ch4-util';

interface IvtExample {
  name: string; fn: (x: number) => number; a: number; b: number;
  fA: number; fB: number; label: string;
  xRange: [number, number]; yRange: [number, number];
}

const EXAMPLES: IvtExample[] = [
  { name: 'x³ − x − 2', fn: (x) => x * x * x - x - 2, a: 1, b: 2,
    fA: -2, fB: 4, label: 'f(1)=−2, f(2)=4',
    xRange: [0.5, 2.5], yRange: [-3, 5] },
  { name: 'cos(x)', fn: Math.cos, a: 0, b: Math.PI,
    fA: 1, fB: -1, label: 'f(0)=1, f(π)=−1',
    xRange: [-0.3, 3.5], yRange: [-1.5, 1.5] },
  { name: 'x² − 2', fn: (x) => x * x - 2, a: 0, b: 2,
    fA: -2, fB: 2, label: 'f(0)=−2, f(2)=2',
    xRange: [-0.3, 2.5], yRange: [-2.5, 3] },
];

@Component({
  selector: 'app-step-ivt',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <!-- ===== 直覺 ===== -->
    <app-prose-block title="中間值定理" subtitle="§4.5">
      <p>
        早上 10°C，下午 20°C。問：今天某個時刻溫度<strong>恰好</strong>是 15°C 嗎？
      </p>
      <p>
        當然！溫度是連續變化的——從 10 到 20，中間每個溫度都一定經過了。
        你不可能從 14.9°C 直接「跳」到 15.1°C 而跳過 15°C。
      </p>
      <p>
        這就是<strong>中間值定理</strong>的直覺。翻譯成數學：
      </p>
    </app-prose-block>

    <!-- ===== 定理 ===== -->
    <app-prose-block>
      <div class="theorem-box">
        <div class="thm-title">中間值定理 (IVT)</div>
        <div class="thm-body">
          如果 f 在 [a, b] 上<strong>連續</strong>，且
          <span class="c-lo">f(a)</span> &lt; <span class="c-target">y</span> &lt; <span class="c-hi">f(b)</span>，<br>
          那麼<strong>存在</strong> c ∈ (a, b) 使得 f(c) = <span class="c-target">y</span>。
        </div>
        <div class="thm-oneliner">
          一句話：<strong>連續曲線不能「跳過」任何中間值。</strong>
        </div>
      </div>
    </app-prose-block>

    <!-- ===== 互動 1：拖動目標值 y ===== -->
    <app-challenge-card prompt="拖動目標值 y——不管你選什麼值，曲線一定會穿過那條水平線">
      <div class="ctrl-row">
        @for (ex of examples; track ex.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selectEx(i)">{{ ex.name }}</button>
        }
      </div>

      <div class="target-ctrl">
        <span class="target-label">目標值 <span class="c-target">y</span> = {{ targetY().toFixed(2) }}</span>
        <input type="range" [min]="targetMin()" [max]="targetMax()" step="0.01" [value]="targetY()"
               (input)="targetY.set(+($any($event.target)).value)" class="target-slider" />
      </div>

      <svg viewBox="0 0 520 320" class="ivt-svg">
        <line x1="60" y1="280" x2="490" y2="280" stroke="var(--border)" stroke-width="0.8" />
        <line x1="60" y1="20" x2="60" y2="280" stroke="var(--border)" stroke-width="0.8" />

        <!-- Y ticks -->
        @for (yt of yTicks(); track yt.v) {
          <line x1="55" [attr.y1]="fy(yt.v)" x2="490" [attr.y2]="fy(yt.v)"
                stroke="var(--border)" stroke-width="0.3" stroke-opacity="0.3" />
          <text x="50" [attr.y]="fy(yt.v) + 3" class="ax-label" text-anchor="end">{{ yt.label }}</text>
        }
        @for (xt of xTicks(); track xt.v) {
          <text [attr.x]="fx(xt.v)" y="296" class="ax-label" text-anchor="middle">{{ xt.label }}</text>
        }

        <!-- Interval [a,b] shading -->
        <rect [attr.x]="fx(curEx().a)" y="20" [attr.width]="fx(curEx().b) - fx(curEx().a)"
              height="260" fill="var(--accent)" fill-opacity="0.03" />

        <!-- Target y line (orange) -->
        <line x1="60" [attr.y1]="fy(targetY())" x2="490" [attr.y2]="fy(targetY())"
              stroke="#c8983b" stroke-width="2" stroke-dasharray="6 4" />
        <text x="495" [attr.y]="fy(targetY()) + 4" class="y-label">y = {{ targetY().toFixed(2) }}</text>

        <!-- f(a) and f(b) markers -->
        <circle [attr.cx]="fx(curEx().a)" [attr.cy]="fy(curEx().fA)" r="5" fill="#5a7faa" stroke="white" stroke-width="1.5" />
        <text [attr.x]="fx(curEx().a) - 6" [attr.y]="fy(curEx().fA) - 8" class="pt-label lo">f(a)={{ curEx().fA.toFixed(1) }}</text>

        <circle [attr.cx]="fx(curEx().b)" [attr.cy]="fy(curEx().fB)" r="5" fill="#aa5a6a" stroke="white" stroke-width="1.5" />
        <text [attr.x]="fx(curEx().b) + 6" [attr.y]="fy(curEx().fB) - 8" class="pt-label hi">f(b)={{ curEx().fB.toFixed(1) }}</text>

        <!-- Function curve -->
        <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />

        <!-- Intersection point c -->
        @if (crossingC() !== null) {
          <circle [attr.cx]="fx(crossingC()!)" [attr.cy]="fy(targetY())" r="6"
                  fill="#c8983b" stroke="white" stroke-width="2" />
          <line [attr.x1]="fx(crossingC()!)" y1="280" [attr.x2]="fx(crossingC()!)" [attr.y2]="fy(targetY())"
                stroke="#c8983b" stroke-width="1" stroke-dasharray="3 2" />
          <text [attr.x]="fx(crossingC()!) + 8" [attr.y]="fy(targetY()) + 14"
                class="c-found">c ≈ {{ crossingC()!.toFixed(4) }}</text>
        }
      </svg>

      <div class="result-row">
        <div class="r-card lo-bg"><span class="c-lo">f(a)</span> = {{ curEx().fA.toFixed(2) }}</div>
        <div class="r-card target-bg"><span class="c-target">y</span> = {{ targetY().toFixed(2) }}</div>
        <div class="r-card hi-bg"><span class="c-hi">f(b)</span> = {{ curEx().fB.toFixed(2) }}</div>
        <div class="r-card ok">∃ c ≈ {{ (crossingC() ?? 0).toFixed(4) }}</div>
      </div>

      <div class="insight">
        不管你把 <span class="c-target">y</span> 拖到
        <span class="c-lo">f(a)</span> 和 <span class="c-hi">f(b)</span> 之間的哪個位置，
        曲線<strong>一定穿過</strong>那條水平線。這就是 IVT。
      </div>
    </app-challenge-card>

    <!-- ===== 為什麼連續是必要的 ===== -->
    <app-challenge-card prompt="如果函數不連續，IVT 就會失敗！">
      <div class="contrast">
        <div class="contrast-col">
          <div class="cc-title ok-title">連續 → IVT 成立</div>
          <svg viewBox="0 0 160 120" class="mini-svg">
            <line x1="15" y1="100" x2="145" y2="100" stroke="var(--border)" stroke-width="0.5" />
            <!-- Continuous curve from below to above -->
            <path d="M20,85 Q80,20 140,30" fill="none" stroke="var(--accent)" stroke-width="2" />
            <!-- y target line -->
            <line x1="15" y1="55" x2="145" y2="55" stroke="#c8983b" stroke-width="1" stroke-dasharray="3 2" />
            <!-- Intersection -->
            <circle cx="70" cy="55" r="4" fill="#c8983b" />
            <text x="80" y="52" fill="#5a8a5a" font-size="7" font-weight="700">✓ 一定穿過</text>
          </svg>
        </div>
        <div class="contrast-col">
          <div class="cc-title bad-title">不連續 → IVT 可能失敗</div>
          <svg viewBox="0 0 160 120" class="mini-svg">
            <line x1="15" y1="100" x2="145" y2="100" stroke="var(--border)" stroke-width="0.5" />
            <!-- Discontinuous: jumps over the target -->
            <line x1="20" y1="85" x2="75" y2="70" stroke="var(--accent)" stroke-width="2" />
            <line x1="85" y1="30" x2="140" y2="25" stroke="var(--accent)" stroke-width="2" />
            <circle cx="75" cy="70" r="3" fill="var(--accent)" />
            <circle cx="85" cy="30" r="3" fill="none" stroke="var(--accent)" stroke-width="1.5" />
            <!-- y target line -->
            <line x1="15" y1="50" x2="145" y2="50" stroke="#c8983b" stroke-width="1" stroke-dasharray="3 2" />
            <!-- No intersection! -->
            <text x="80" y="48" fill="#a05a5a" font-size="7" font-weight="700">✗ 跳過了！</text>
          </svg>
        </div>
      </div>
      <div class="fail-note">
        跳躍不連續讓函數可以「跨過」目標值。<strong>連續性是 IVT 的必要條件。</strong>
      </div>
    </app-challenge-card>

    <!-- ===== 互動 2：二分法（IVT 的應用）===== -->
    <app-challenge-card prompt="IVT 的應用：二分法求根——每一步都用 IVT 保證根還在區間裡">
      <div class="ctrl-row">
        <button class="act-btn" (click)="bisectStep()" [disabled]="bStep() >= maxBisect - 1">🔪 二分一步</button>
        <button class="act-btn" (click)="toggleBisect()">{{ bRunning() ? '⏸' : '▶ 自動' }}</button>
        <button class="act-btn reset" (click)="resetBisect()">↺ 重置</button>
        <span class="step-info">步驟 {{ bStep() + 1 }}/{{ maxBisect }} · 精度 {{ bWidth().toExponential(1) }}</span>
      </div>

      <svg viewBox="0 0 520 200" class="bisect-svg">
        <line x1="60" y1="160" x2="490" y2="160" stroke="var(--border)" stroke-width="0.8" />
        <line x1="60" y1="10" x2="60" y2="160" stroke="var(--border)" stroke-width="0.8" />

        <!-- y=0 -->
        <line x1="60" [attr.y1]="bfy(0)" x2="490" [attr.y2]="bfy(0)"
              stroke="#5a8a5a" stroke-width="1" stroke-dasharray="4 3" />

        <!-- Curve -->
        <path [attr.d]="bCurvePath" fill="none" stroke="var(--accent)" stroke-width="2" />

        <!-- Current interval -->
        @if (bCurrent()) {
          <rect [attr.x]="bfx(bCurrent()!.a)" y="10"
                [attr.width]="Math.max(2, bfx(bCurrent()!.b) - bfx(bCurrent()!.a))"
                height="150" fill="#c8983b" fill-opacity="0.12"
                stroke="#c8983b" stroke-width="1" stroke-dasharray="4 3" />

          <!-- Midpoint -->
          <circle [attr.cx]="bfx(bCurrent()!.mid)" [attr.cy]="bfy(bCurrent()!.fMid)"
                  r="5" fill="var(--accent)" stroke="white" stroke-width="1.5" />

          <!-- Midpoint labels -->
          <text [attr.x]="bfx(bCurrent()!.a)" y="178" class="b-label" text-anchor="middle">{{ bCurrent()!.a.toFixed(3) }}</text>
          <text [attr.x]="bfx(bCurrent()!.b)" y="178" class="b-label" text-anchor="middle">{{ bCurrent()!.b.toFixed(3) }}</text>
        }
      </svg>

      <div class="bisect-logic">
        @if (bCurrent()) {
          f(mid) = {{ bCurrent()!.fMid.toFixed(4) }} →
          @if (bCurrent()!.fMid > 0) {
            <strong>正</strong> → 根在<strong>左半邊</strong>（IVT 保證！）
          } @else if (bCurrent()!.fMid < 0) {
            <strong>負</strong> → 根在<strong>右半邊</strong>（IVT 保證！）
          } @else {
            <strong>= 0</strong> → 找到根了！
          }
        }
      </div>
    </app-challenge-card>

    <!-- ===== 完備性連結 ===== -->
    <app-prose-block subtitle="IVT 與完備性">
      <p>
        IVT 在有理數上<strong>會失敗</strong>！
        f(x) = x² − 2 在 Q 上，f(0) = −2 &lt; 0，f(2) = 2 > 0，
        但<strong>不存在</strong>有理數 c 使得 f(c) = 0（因為 √2 ∉ Q）。
      </p>
      <p>
        IVT 的證明核心是<strong>完備性</strong>——二分法產生的嵌套閉區間在 R 中一定有交點，
        但在 Q 中可能交出一個「洞」。這又回到了 Ch1 的主題：<strong>R 沒有洞</strong>。
      </p>
      <p>下一節看連續函數在閉區間上的另一個大定理——<strong>極值定理</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .c-lo { color: #5a7faa; font-weight: 700; }
    .c-hi { color: #aa5a6a; font-weight: 700; }
    .c-target { color: #c8983b; font-weight: 700; }

    .theorem-box { padding: 16px; border-radius: 12px; background: var(--accent-10);
      border: 2px solid var(--accent); margin: 10px 0; text-align: center; }
    .thm-title { font-size: 13px; font-weight: 700; color: var(--accent); text-transform: uppercase;
      letter-spacing: 0.05em; margin-bottom: 6px; }
    .thm-body { font-size: 15px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; line-height: 1.8; }
    .thm-oneliner { margin-top: 8px; font-size: 13px; color: var(--text-muted); }
    .thm-oneliner strong { color: var(--accent); }

    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
    .pre-btn { padding: 5px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .target-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .target-label { font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace; min-width: 120px; }
    .target-slider { flex: 1; accent-color: #c8983b; height: 22px; }

    .ivt-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 12px; background: var(--bg); margin-bottom: 10px; }
    .ax-label { font-size: 7px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .y-label { font-size: 8px; fill: #c8983b; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .pt-label { font-size: 7px; font-weight: 700; font-family: 'JetBrains Mono', monospace;
      &.lo { fill: #5a7faa; } &.hi { fill: #aa5a6a; } }
    .c-found { font-size: 8px; fill: #c8983b; font-weight: 700; font-family: 'JetBrains Mono', monospace; }

    .result-row { display: flex; gap: 6px; margin-bottom: 8px; }
    .r-card { flex: 1; padding: 8px; border-radius: 8px; text-align: center; font-size: 12px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.lo-bg { background: rgba(90,127,170,0.06); }
      &.hi-bg { background: rgba(170,90,106,0.06); }
      &.target-bg { background: rgba(200,152,59,0.08); }
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; } }

    .insight { padding: 10px; border-radius: 8px; background: var(--accent-10); border: 1px solid var(--accent);
      font-size: 12px; color: var(--text-muted); text-align: center; margin-bottom: 14px; }
    .insight strong { color: var(--accent); }

    /* Contrast: continuous vs discontinuous */
    .contrast { display: flex; gap: 10px; margin-bottom: 10px; }
    .contrast-col { flex: 1; text-align: center; }
    .cc-title { font-size: 12px; font-weight: 700; margin-bottom: 4px;
      &.ok-title { color: #5a8a5a; } &.bad-title { color: #a05a5a; } }
    .mini-svg { width: 100%; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); }
    .fail-note { padding: 8px; border-radius: 8px; background: rgba(160,90,90,0.06);
      border: 1px solid rgba(160,90,90,0.2); font-size: 12px; color: var(--text-muted); text-align: center; }
    .fail-note strong { color: #a05a5a; }

    /* Bisection */
    .act-btn { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: var(--bg-surface); color: var(--text); font-size: 12px; cursor: pointer;
      &:hover { background: var(--accent-10); } &:disabled { opacity: 0.4; } &.reset { color: var(--text-muted); } }
    .step-info { font-size: 11px; color: var(--text-muted); margin-left: auto;
      font-family: 'JetBrains Mono', monospace; }
    .bisect-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 8px; }
    .b-label { font-size: 7px; fill: #c8983b; font-weight: 600; font-family: 'JetBrains Mono', monospace; }
    .bisect-logic { padding: 8px 12px; border-radius: 8px; background: var(--bg-surface);
      border: 1px solid var(--border); font-size: 12px; text-align: center;
      font-family: 'JetBrains Mono', monospace; color: var(--text-muted); }
    .bisect-logic strong { color: var(--accent); }
  `,
})
export class StepIvtComponent implements OnDestroy {
  readonly Math = Math;
  readonly examples = EXAMPLES;
  readonly selIdx = signal(0);
  readonly targetY = signal(0);
  readonly curEx = computed(() => EXAMPLES[this.selIdx()]);

  readonly targetMin = computed(() => {
    const e = this.curEx();
    return Math.min(e.fA, e.fB) + 0.01;
  });
  readonly targetMax = computed(() => {
    const e = this.curEx();
    return Math.max(e.fA, e.fB) - 0.01;
  });

  selectEx(i: number): void {
    this.selIdx.set(i);
    const e = EXAMPLES[i];
    this.targetY.set((e.fA + e.fB) / 2);
    this.resetBisect();
  }

  constructor() {
    this.targetY.set((EXAMPLES[0].fA + EXAMPLES[0].fB) / 2);
  }

  // --- Main IVT viz ---
  fx(x: number): number {
    const [lo, hi] = this.curEx().xRange;
    return 60 + ((x - lo) / (hi - lo)) * 430;
  }
  fy(y: number): number {
    const [lo, hi] = this.curEx().yRange;
    return 280 - ((y - lo) / (hi - lo)) * 260;
  }

  readonly yTicks = computed(() => {
    const [lo, hi] = this.curEx().yRange;
    const step = this.niceStep(hi - lo, 5);
    const ticks: { v: number; label: string }[] = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) {
      ticks.push({ v, label: Math.abs(v) < 1e-10 ? '0' : v.toFixed(1) });
    }
    return ticks;
  });

  readonly xTicks = computed(() => {
    const [lo, hi] = this.curEx().xRange;
    const step = this.niceStep(hi - lo, 5);
    const ticks: { v: number; label: string }[] = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) {
      ticks.push({ v, label: Math.abs(v) < 1e-10 ? '0' : v.toFixed(1) });
    }
    return ticks;
  });

  curvePath(): string {
    const e = this.curEx();
    const pts = sampleFunction(e.fn, e.xRange[0], e.xRange[1], 300);
    return 'M' + pts.filter(p => p.y >= e.yRange[0] - 1 && p.y <= e.yRange[1] + 1)
      .map(p => `${this.fx(p.x).toFixed(1)},${this.fy(p.y).toFixed(1)}`).join('L');
  }

  // Find crossing point numerically
  readonly crossingC = computed((): number | null => {
    const e = this.curEx();
    const y = this.targetY();
    // Simple bisection to find c where f(c) = y
    let lo = e.a, hi = e.b;
    const g = (x: number) => e.fn(x) - y;
    if (g(lo) * g(hi) > 0) return null;
    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2;
      if (g(lo) * g(mid) <= 0) hi = mid; else lo = mid;
    }
    return (lo + hi) / 2;
  });

  // --- Bisection sub-section ---
  readonly maxBisect = 20;
  readonly bStep = signal(0);
  readonly bRunning = signal(false);
  private bTimer: ReturnType<typeof setInterval> | null = null;

  private readonly bFn = (x: number) => x * x * x - x - 2;
  readonly bAllSteps = bisectionRoot(this.bFn, 1, 2, this.maxBisect);
  readonly bCurrent = computed(() => this.bAllSteps[this.bStep()] ?? null);
  readonly bWidth = computed(() => {
    const s = this.bCurrent();
    return s ? s.b - s.a : 1;
  });

  bfx(x: number): number { return 60 + ((x - 0.8) / 1.5) * 430; }
  bfy(y: number): number { return 160 - ((y + 3) / 8) * 150; }

  readonly bCurvePath = (() => {
    const pts = sampleFunction(this.bFn, 0.8, 2.3, 200);
    return 'M' + pts.map(p => `${this.bfx(p.x)},${this.bfy(p.y)}`).join('L');
  })();

  bisectStep(): void { if (this.bStep() < this.maxBisect - 1) this.bStep.update(v => v + 1); }
  toggleBisect(): void {
    if (this.bRunning()) { this.stopBisect(); } else {
      this.bRunning.set(true);
      this.bTimer = setInterval(() => {
        if (this.bStep() >= this.maxBisect - 1) this.stopBisect(); else this.bisectStep();
      }, 400);
    }
  }
  resetBisect(): void { this.stopBisect(); this.bStep.set(0); }
  private stopBisect(): void { this.bRunning.set(false); if (this.bTimer) { clearInterval(this.bTimer); this.bTimer = null; } }
  ngOnDestroy(): void { this.stopBisect(); }

  private niceStep(range: number, target: number): number {
    const rough = range / target;
    const mag = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / mag;
    if (norm < 1.5) return mag;
    if (norm < 3.5) return 2 * mag;
    if (norm < 7.5) return 5 * mag;
    return 10 * mag;
  }
}
