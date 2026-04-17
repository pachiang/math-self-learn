import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

interface LHExample {
  name: string; fStr: string; gStr: string; fpStr: string; gpStr: string;
  f: (x: number) => number; g: (x: number) => number;
  fp: (x: number) => number; gp: (x: number) => number;
  c: number; form: string; answer: string;
  xDefault: [number, number]; yFGRange: [number, number]; yRatioRange: [number, number];
}

const EX: LHExample[] = [
  { name: 'sin x / x', fStr: 'sin x', gStr: 'x', fpStr: 'cos x', gpStr: '1',
    f: Math.sin, g: (x) => x, fp: Math.cos, gp: () => 1,
    c: 0, form: '0/0', answer: 'cos(0)/1 = 1',
    xDefault: [-2, 2], yFGRange: [-2, 2], yRatioRange: [-0.5, 1.5] },
  { name: '(eˣ−1) / x', fStr: 'eˣ−1', gStr: 'x', fpStr: 'eˣ', gpStr: '1',
    f: (x) => Math.exp(x) - 1, g: (x) => x, fp: Math.exp, gp: () => 1,
    c: 0, form: '0/0', answer: 'e⁰/1 = 1',
    xDefault: [-2, 2], yFGRange: [-2, 3], yRatioRange: [-0.5, 2.5] },
  { name: '(1−cos x) / x²', fStr: '1−cos x', gStr: 'x²', fpStr: 'sin x', gpStr: '2x',
    f: (x) => 1 - Math.cos(x), g: (x) => x * x, fp: Math.sin, gp: (x) => 2 * x,
    c: 0, form: '0/0（要用兩次！）', answer: 'sin x / 2x → cos x / 2 = 1/2',
    xDefault: [-3, 3], yFGRange: [-1, 3], yRatioRange: [-0.2, 1] },
  { name: 'ln x / (x−1)', fStr: 'ln x', gStr: 'x−1', fpStr: '1/x', gpStr: '1',
    f: Math.log, g: (x) => x - 1, fp: (x) => 1 / x, gp: () => 1,
    c: 1, form: '0/0', answer: '(1/x)/1 at x=1 = 1',
    xDefault: [0.1, 2.5], yFGRange: [-2, 2], yRatioRange: [0, 2] },
];

@Component({
  selector: 'app-step-lhopital',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <!-- ===== 直覺 ===== -->
    <app-prose-block title="L'Hôpital 法則" subtitle="§5.5">
      <p>
        lim f(x)/g(x) 遇到 <strong>0/0</strong> 或 <strong>∞/∞</strong>？
        分子分母都趨向同一個東西，比值取決於誰「跑得快」——
        而<strong>速度就是導數</strong>。
      </p>
      <div class="formula-box">
        <div class="formula-title">L'Hôpital 法則</div>
        <div class="formula-body">
          若 f(x)/g(x) 是 0/0 或 ∞/∞ 型，且
          lim <span class="c-fp">f'(x)</span>/<span class="c-gp">g'(x)</span> 存在，則<br>
          lim <span class="c-f">f(x)</span>/<span class="c-g">g(x)</span>
          = lim <span class="c-fp">f'(x)</span>/<span class="c-gp">g'(x)</span>
        </div>
      </div>
      <p>
        直覺：在 x → c 附近，f(x) ≈ <span class="c-fp">f'(c)</span>·(x−c)，g(x) ≈ <span class="c-gp">g'(c)</span>·(x−c)，
        所以 f/g ≈ <span class="c-fp">f'(c)</span>/<span class="c-gp">g'(c)</span>。(x−c) 消掉了！
      </p>
    </app-prose-block>

    <!-- ===== 互動 ===== -->
    <app-challenge-card prompt="三層圖：分子/分母各自趨向 0 → 比值 → 導數之比">
      <div class="ctrl-row">
        @for (ex of examples; track ex.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ ex.name }}</button>
        }
      </div>

      <div class="zoom-ctrl">
        <span class="zoom-label">放大鏡（靠近 x = {{ cur().c }}）</span>
        <input type="range" min="0" max="0.95" step="0.01" [value]="zoom()"
               (input)="zoom.set(+($any($event.target)).value)" class="zoom-slider" />
        <span class="zoom-val">{{ zoomLabel() }}</span>
      </div>

      <!-- Panel 1: f(x) and g(x) separately -->
      <div class="panel-label">
        <span class="c-f">f(x) = {{ cur().fStr }}</span> 和
        <span class="c-g">g(x) = {{ cur().gStr }}</span>
        —— 都趨向 {{ cur().form.includes('0') ? '0' : '∞' }}
      </div>
      <svg [attr.viewBox]="'0 0 520 180'" class="panel-svg">
        <line x1="60" y1="150" x2="490" y2="150" stroke="var(--border)" stroke-width="0.8" />
        <line x1="60" y1="10" x2="60" y2="150" stroke="var(--border)" stroke-width="0.8" />
        @for (yt of fgYTicks(); track yt) {
          <line x1="55" [attr.y1]="fgy(yt)" x2="490" [attr.y2]="fgy(yt)"
                stroke="var(--border)" stroke-width="0.3" stroke-opacity="0.3" />
          <text x="50" [attr.y]="fgy(yt) + 3" class="ax-label" text-anchor="end">{{ yt }}</text>
        }
        <!-- c marker -->
        <line [attr.x1]="fgx(cur().c)" y1="10" [attr.x2]="fgx(cur().c)" y2="150"
              stroke="var(--text-muted)" stroke-width="0.8" stroke-dasharray="4 3" />

        <!-- f(x) blue -->
        <path [attr.d]="fPath()" fill="none" stroke="#5a7faa" stroke-width="2.5" />
        <!-- g(x) orange -->
        <path [attr.d]="gPath()" fill="none" stroke="#c8983b" stroke-width="2.5" />

        <!-- zero crossing markers -->
        <circle [attr.cx]="fgx(cur().c)" [attr.cy]="fgy(0)" r="5"
                fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-dasharray="2 2" />
        <!-- Legend -->
        <line x1="380" y1="20" x2="400" y2="20" stroke="#5a7faa" stroke-width="2" />
        <text x="405" y="24" class="legend-text">f(x)</text>
        <line x1="380" y1="34" x2="400" y2="34" stroke="#c8983b" stroke-width="2" />
        <text x="405" y="38" class="legend-text">g(x)</text>
      </svg>

      <!-- Panel 2: f(x)/g(x) ratio -->
      <div class="panel-label">比值 <span class="c-ratio">f(x)/g(x)</span> — 在 x = {{ cur().c }} 處是 {{ cur().form }}</div>
      <svg [attr.viewBox]="'0 0 520 160'" class="panel-svg">
        <line x1="60" y1="130" x2="490" y2="130" stroke="var(--border)" stroke-width="0.8" />
        <line x1="60" y1="10" x2="60" y2="130" stroke="var(--border)" stroke-width="0.8" />
        @for (yt of ratioYTicks(); track yt) {
          <line x1="55" [attr.y1]="ry(yt)" x2="490" [attr.y2]="ry(yt)"
                stroke="var(--border)" stroke-width="0.3" stroke-opacity="0.3" />
          <text x="50" [attr.y]="ry(yt) + 3" class="ax-label" text-anchor="end">{{ yt }}</text>
        }
        <!-- c marker -->
        <line [attr.x1]="fgx(cur().c)" y1="10" [attr.x2]="fgx(cur().c)" y2="130"
              stroke="var(--text-muted)" stroke-width="0.8" stroke-dasharray="4 3" />
        <!-- Limit line -->
        @if (limitVal() !== null) {
          <line x1="60" [attr.y1]="ry(limitVal()!)" x2="490" [attr.y2]="ry(limitVal()!)"
                stroke="#5a8a5a" stroke-width="1.5" stroke-dasharray="6 4" />
          <text x="495" [attr.y]="ry(limitVal()!) + 4" class="limit-label">L = {{ limitVal() }}</text>
        }
        <!-- f/g curve -->
        <path [attr.d]="ratioPath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />
        <!-- open circle at c -->
        <circle [attr.cx]="fgx(cur().c)" [attr.cy]="ry(limitVal() ?? 0)" r="5"
                fill="none" stroke="var(--accent)" stroke-width="2" />
      </svg>

      <!-- Panel 3: f'/g' ratio -->
      <div class="panel-label">導數之比 <span class="c-fp">f'(x)</span>/<span class="c-gp">g'(x)</span></div>
      <svg [attr.viewBox]="'0 0 520 130'" class="panel-svg">
        <line x1="60" y1="105" x2="490" y2="105" stroke="var(--border)" stroke-width="0.8" />
        <line x1="60" y1="10" x2="60" y2="105" stroke="var(--border)" stroke-width="0.8" />
        @for (yt of ratioYTicks(); track yt) {
          <line x1="55" [attr.y1]="dry(yt)" x2="490" [attr.y2]="dry(yt)"
                stroke="var(--border)" stroke-width="0.3" stroke-opacity="0.3" />
          <text x="50" [attr.y]="dry(yt) + 3" class="ax-label" text-anchor="end">{{ yt }}</text>
        }
        <!-- f'/g' curve -->
        <path [attr.d]="derivRatioPath()" fill="none" stroke="#8a6aaa" stroke-width="2.5" />
        <!-- Limit value -->
        @if (limitVal() !== null) {
          <line x1="60" [attr.y1]="dry(limitVal()!)" x2="490" [attr.y2]="dry(limitVal()!)"
                stroke="#5a8a5a" stroke-width="1.5" stroke-dasharray="6 4" />
          <circle [attr.cx]="fgx(cur().c)" [attr.cy]="dry(limitVal()!)" r="5"
                  fill="#8a6aaa" stroke="white" stroke-width="1.5" />
        }
      </svg>

      <!-- Result -->
      <div class="result-box">
        <div class="rb-step">
          <span class="rb-label">原式</span>
          <span class="rb-val">lim <span class="c-f">{{ cur().fStr }}</span> / <span class="c-g">{{ cur().gStr }}</span></span>
          <span class="rb-type">{{ cur().form }}</span>
        </div>
        <div class="rb-arrow">= L'H =</div>
        <div class="rb-step">
          <span class="rb-label">微分後</span>
          <span class="rb-val">lim <span class="c-fp">{{ cur().fpStr }}</span> / <span class="c-gp">{{ cur().gpStr }}</span></span>
          <span class="rb-answer">= {{ cur().answer }}</span>
        </div>
      </div>

      @if (selIdx() === 2) {
        <div class="twice-note">
          這題第一次 L'Hôpital 後還是 0/0 (sin x / 2x)，要<strong>再用一次</strong>：
          cos x / 2 → 1/2。有時候需要連續用好幾次！
        </div>
      }
    </app-challenge-card>

    <!-- ===== 本質 ===== -->
    <app-prose-block subtitle="L'Hôpital 的本質">
      <p>
        L'Hôpital 本質上說：<strong>函數的比值取決於它們接近 0 的速度</strong>，而速度就是導數。
      </p>
      <p>
        用放大鏡看——把上面的滑桿拉到最右邊。
        你會看到 f 和 g 在 x → c 附近越來越像直線（因為可微 ≈ 局部線性），
        兩條直線的斜率就是 f'(c) 和 g'(c)，它們的比值自然就是極限。
      </p>
      <p>
        嚴格證明用 <strong>Cauchy 均值定理</strong>（Ch5.4 MVT 的推廣版）。
      </p>
      <p>下一節重訪 <strong>Taylor 定理</strong>——用導數做更精確的近似。</p>
    </app-prose-block>
  `,
  styles: `
    .c-f { color: #5a7faa; font-weight: 700; }
    .c-g { color: #c8983b; font-weight: 700; }
    .c-fp { color: #5a7faa; font-weight: 700; font-style: italic; }
    .c-gp { color: #c8983b; font-weight: 700; font-style: italic; }
    .c-ratio { color: var(--accent); font-weight: 700; }

    .formula-box { padding: 14px; border-radius: 10px; background: var(--accent-10);
      border: 2px solid var(--accent); margin: 10px 0; text-align: center; }
    .formula-title { font-size: 12px; font-weight: 700; color: var(--accent);
      text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .formula-body { font-size: 15px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; line-height: 2; }

    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pre-btn { padding: 5px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }

    .zoom-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
      padding: 8px 12px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border); }
    .zoom-label { font-size: 12px; color: var(--text-muted); min-width: 140px; }
    .zoom-slider { flex: 1; accent-color: var(--accent); height: 20px; }
    .zoom-val { font-size: 12px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; min-width: 50px; text-align: right; }

    .panel-label { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 3px; }
    .panel-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 8px; }
    .ax-label { font-size: 7px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .legend-text { font-size: 8px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .limit-label { font-size: 8px; fill: #5a8a5a; font-weight: 700; font-family: 'JetBrains Mono', monospace; }

    .result-box { display: flex; align-items: center; justify-content: center; gap: 12px;
      padding: 14px; border-radius: 10px; background: var(--bg-surface); border: 1px solid var(--border);
      margin-bottom: 10px; flex-wrap: wrap; font-family: 'JetBrains Mono', monospace; }
    .rb-step { text-align: center; }
    .rb-label { font-size: 10px; color: var(--text-muted); display: block; }
    .rb-val { font-size: 14px; color: var(--text); display: block; margin: 2px 0; }
    .rb-type { font-size: 12px; color: #a05a5a; font-weight: 600; }
    .rb-answer { font-size: 14px; color: #5a8a5a; font-weight: 700; display: block; }
    .rb-arrow { font-size: 14px; color: var(--accent); font-weight: 700; }

    .twice-note { padding: 10px; border-radius: 8px; background: rgba(138,106,170,0.08);
      border: 1px solid rgba(138,106,170,0.2); font-size: 12px; color: var(--text-secondary);
      text-align: center; margin-bottom: 10px; }
    .twice-note strong { color: #8a6aaa; }
  `,
})
export class StepLhopitalComponent {
  readonly Math = Math;
  readonly examples = EX;
  readonly selIdx = signal(0);
  readonly zoom = signal(0);
  readonly cur = computed(() => EX[this.selIdx()]);

  readonly zoomLabel = computed(() => {
    const z = this.zoom();
    if (z < 0.3) return '全景';
    if (z < 0.6) return '放大中';
    if (z < 0.85) return '高倍放大';
    return '極致放大';
  });

  // X range depends on zoom level
  private readonly xRange = computed((): [number, number] => {
    const ex = this.cur();
    const [lo, hi] = ex.xDefault;
    const z = this.zoom();
    const halfW = ((hi - lo) / 2) * (1 - z * 0.95);
    return [ex.c - halfW, ex.c + halfW];
  });

  // Coordinate transforms
  fgx(x: number): number {
    const [lo, hi] = this.xRange();
    return 60 + ((x - lo) / (hi - lo)) * 430;
  }
  fgy(y: number): number {
    const [lo, hi] = this.cur().yFGRange;
    return 150 - ((y - lo) / (hi - lo)) * 140;
  }
  ry(y: number): number {
    const [lo, hi] = this.cur().yRatioRange;
    return 130 - ((y - lo) / (hi - lo)) * 120;
  }
  dry(y: number): number {
    const [lo, hi] = this.cur().yRatioRange;
    return 105 - ((y - lo) / (hi - lo)) * 95;
  }

  readonly fgYTicks = computed(() => {
    const [lo, hi] = this.cur().yFGRange;
    return this.makeTicks(lo, hi, 4);
  });
  readonly ratioYTicks = computed(() => {
    const [lo, hi] = this.cur().yRatioRange;
    return this.makeTicks(lo, hi, 3);
  });

  readonly limitVal = computed((): number | null => {
    const ex = this.cur();
    const gpAtC = ex.gp(ex.c);
    if (Math.abs(gpAtC) < 1e-10) return 0.5; // (1-cosx)/x^2 case
    return ex.fp(ex.c) / gpAtC;
  });

  // Paths
  fPath(): string { return this.buildPath((x) => this.cur().f(x), this.fgy.bind(this)); }
  gPath(): string { return this.buildPath((x) => this.cur().g(x), this.fgy.bind(this)); }

  ratioPath(): string {
    const ex = this.cur();
    return this.buildPath((x) => {
      const gx = ex.g(x);
      if (Math.abs(gx) < 1e-10) return NaN;
      return ex.f(x) / gx;
    }, this.ry.bind(this));
  }

  derivRatioPath(): string {
    const ex = this.cur();
    return this.buildPath((x) => {
      const gpx = ex.gp(x);
      if (Math.abs(gpx) < 1e-10) return NaN;
      return ex.fp(x) / gpx;
    }, this.dry.bind(this));
  }

  private buildPath(fn: (x: number) => number, yMap: (y: number) => number): string {
    const [lo, hi] = this.xRange();
    const steps = 400;
    const dx = (hi - lo) / steps;
    let path = '';
    for (let i = 0; i <= steps; i++) {
      const x = lo + i * dx;
      const y = fn(x);
      if (!isFinite(y)) { path += ''; continue; }
      const py = yMap(y);
      if (py < -20 || py > 300) { path += ''; continue; }
      path += (path === '' || path.endsWith(' ') ? 'M' : 'L') + `${this.fgx(x).toFixed(1)},${py.toFixed(1)}`;
    }
    return path;
  }

  private makeTicks(lo: number, hi: number, target: number): number[] {
    const step = this.niceStep(hi - lo, target);
    const ticks: number[] = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) {
      ticks.push(+v.toFixed(2));
    }
    return ticks;
  }

  private niceStep(range: number, target: number): number {
    const rough = range / target;
    const mag = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / mag;
    if (norm < 1.5) return mag;
    if (norm < 3.5) return 2 * mag;
    return 5 * mag;
  }
}
