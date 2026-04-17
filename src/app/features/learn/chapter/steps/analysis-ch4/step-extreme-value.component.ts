import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { sampleFunction } from './analysis-ch4-util';

interface GoodExample {
  name: string; fn: (x: number) => number; a: number; b: number;
  xRange: [number, number]; yRange: [number, number];
}

const GOOD_EXAMPLES: GoodExample[] = [
  { name: 'sin(2x)+x/3', fn: (x) => Math.sin(2 * x) + x / 3, a: 0, b: 3,
    xRange: [-0.2, 3.3], yRange: [-1.2, 2.2] },
  { name: 'x³−3x+1', fn: (x) => x * x * x - 3 * x + 1, a: -2, b: 2,
    xRange: [-2.3, 2.3], yRange: [-2, 4] },
  { name: 'cos(πx)', fn: (x) => Math.cos(Math.PI * x), a: 0, b: 2,
    xRange: [-0.2, 2.3], yRange: [-1.4, 1.4] },
];

interface BadCase {
  name: string; problem: string;
  fn: (x: number) => number;
  xRange: [number, number]; yRange: [number, number];
  openLeft: boolean; openRight: boolean;
  supVal: number; supAttained: boolean;
  explain: string;
}

const BAD_CASES: BadCase[] = [
  { name: 'f(x)=x 在 (0,1)', problem: '開區間',
    fn: (x) => x, xRange: [-0.1, 1.2], yRange: [-0.2, 1.3],
    openLeft: true, openRight: true, supVal: 1, supAttained: false,
    explain: 'sup = 1，但 x=1 不在 (0,1) 裡。不管 x 多靠近 1，f(x) < 1。上確界存在但永遠到不了。' },
  { name: 'f(x)=1/x 在 (0,1]', problem: '無界',
    fn: (x) => x > 0.01 ? 1 / x : 100, xRange: [-0.1, 1.3], yRange: [-0.5, 12],
    openLeft: true, openRight: false, supVal: Infinity, supAttained: false,
    explain: 'x → 0⁺ 時 f(x) → ∞。函數值沒有上界，sup = ∞。連「最大值候選」都不存在。' },
  { name: '跳躍函數 在 [0,1]', problem: '不連續',
    fn: (x) => x < 0.5 ? x + 0.5 : x - 0.3, xRange: [-0.1, 1.2], yRange: [-0.2, 1.2],
    openLeft: false, openRight: false, supVal: 1, supAttained: false,
    explain: '在 x=0.5 處跳下去。左極限 = 1 但 f(0.5) = 0.2。sup = 1（左邊的極限值），但沒有任何 x 使 f(x) = 1。' },
];

@Component({
  selector: 'app-step-extreme-value',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <!-- ===== 直覺 ===== -->
    <app-prose-block title="極值定理" subtitle="§4.6">
      <p>
        想像爬一座山：從山腳（a）走到另一邊的山腳（b），沿途一定有一個<strong>最高點</strong>和一個<strong>最低點</strong>。
      </p>
      <p>
        但如果——
      </p>
      <ul>
        <li>路在懸崖邊<strong>斷了</strong>（開區間）→ 你可能越走越高但永遠到不了最高處</li>
        <li>路通往<strong>無限遠</strong>（無界）→ 沒有最高點</li>
        <li>路有<strong>傳送門</strong>（不連續）→ 你可能「跳過」最高的位置</li>
      </ul>
      <p>
        極值定理說：<strong>只要路完整（閉區間）且平滑（連續），最高最低一定存在。</strong>
      </p>
    </app-prose-block>

    <!-- ===== 定理 ===== -->
    <app-prose-block>
      <div class="theorem-box">
        <div class="thm-title">極值定理 (EVT)</div>
        <div class="thm-body">
          f 在<strong>閉區間</strong> [a, b] 上<strong>連續</strong> →<br>
          ∃ c, d ∈ [a, b] 使得
          <span class="c-min">f(c)</span> ≤ f(x) ≤ <span class="c-max">f(d)</span> &nbsp;∀x ∈ [a, b]
        </div>
        <div class="thm-key">
          <span class="c-max">最大值</span>和<span class="c-min">最小值</span>都<strong>實際達到</strong>——不只是 sup/inf 存在，而是有具體的 x 值使 f 等於它。
        </div>
      </div>
    </app-prose-block>

    <!-- ===== 互動 1：正常情況 ===== -->
    <app-challenge-card prompt="閉區間 + 連續 → max 和 min 一定被達到">
      <div class="ctrl-row">
        @for (ex of goodExamples; track ex.name; let i = $index) {
          <button class="pre-btn" [class.active]="goodSel() === i" (click)="goodSel.set(i)">{{ ex.name }}</button>
        }
      </div>

      <svg viewBox="0 0 520 300" class="ev-svg">
        <line x1="60" y1="260" x2="490" y2="260" stroke="var(--border)" stroke-width="0.8" />
        <line x1="60" y1="20" x2="60" y2="260" stroke="var(--border)" stroke-width="0.8" />

        @for (yt of gYTicks(); track yt.v) {
          <line x1="55" [attr.y1]="gfy(yt.v)" x2="490" [attr.y2]="gfy(yt.v)"
                stroke="var(--border)" stroke-width="0.3" stroke-opacity="0.3" />
          <text x="50" [attr.y]="gfy(yt.v) + 3" class="ax-label" text-anchor="end">{{ yt.label }}</text>
        }

        <!-- Interval shading [a,b] -->
        <rect [attr.x]="gfx(curGood().a)" y="20" [attr.width]="gfx(curGood().b) - gfx(curGood().a)"
              height="240" fill="var(--accent)" fill-opacity="0.03" />

        <!-- Max line (green dashed) -->
        <line x1="60" [attr.y1]="gfy(gMaxVal())" x2="490" [attr.y2]="gfy(gMaxVal())"
              stroke="#5a8a5a" stroke-width="1" stroke-dasharray="5 3" stroke-opacity="0.5" />
        <text x="495" [attr.y]="gfy(gMaxVal()) + 4" class="max-label">max = {{ gMaxVal().toFixed(2) }}</text>

        <!-- Min line (blue dashed) -->
        <line x1="60" [attr.y1]="gfy(gMinVal())" x2="490" [attr.y2]="gfy(gMinVal())"
              stroke="#5a7faa" stroke-width="1" stroke-dasharray="5 3" stroke-opacity="0.5" />
        <text x="495" [attr.y]="gfy(gMinVal()) + 4" class="min-label">min = {{ gMinVal().toFixed(2) }}</text>

        <!-- Curve -->
        <path [attr.d]="goodCurvePath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />

        <!-- Endpoints -->
        <circle [attr.cx]="gfx(curGood().a)" [attr.cy]="gfy(curGood().fn(curGood().a))" r="4" fill="var(--accent)" stroke="white" stroke-width="1" />
        <circle [attr.cx]="gfx(curGood().b)" [attr.cy]="gfy(curGood().fn(curGood().b))" r="4" fill="var(--accent)" stroke="white" stroke-width="1" />

        <!-- Max point -->
        <circle [attr.cx]="gfx(gMaxX())" [attr.cy]="gfy(gMaxVal())" r="6"
                fill="#5a8a5a" stroke="white" stroke-width="2" />
        <text [attr.x]="gfx(gMaxX()) + 10" [attr.y]="gfy(gMaxVal()) - 6" class="ext-found max-color">
          max 在 x={{ gMaxX().toFixed(2) }}
        </text>

        <!-- Min point -->
        <circle [attr.cx]="gfx(gMinX())" [attr.cy]="gfy(gMinVal())" r="6"
                fill="#5a7faa" stroke="white" stroke-width="2" />
        <text [attr.x]="gfx(gMinX()) + 10" [attr.y]="gfy(gMinVal()) + 14" class="ext-found min-color">
          min 在 x={{ gMinX().toFixed(2) }}
        </text>
      </svg>

      <div class="good-result">
        <div class="gr-card max-bg"><span class="c-max">最大值</span> = {{ gMaxVal().toFixed(4) }}，在 x = {{ gMaxX().toFixed(4) }} 達到</div>
        <div class="gr-card min-bg"><span class="c-min">最小值</span> = {{ gMinVal().toFixed(4) }}，在 x = {{ gMinX().toFixed(4) }} 達到</div>
      </div>
    </app-challenge-card>

    <!-- ===== 互動 2：三個條件各自必要 ===== -->
    <app-challenge-card prompt="拿掉任何一個條件，定理就崩潰——選一個看為什麼">
      <div class="ctrl-row">
        @for (bc of badCases; track bc.name; let i = $index) {
          <button class="pre-btn bad-btn" [class.active]="badSel() === i" (click)="badSel.set(i)">
            ✗ {{ bc.problem }}
          </button>
        }
      </div>

      <svg viewBox="0 0 520 250" class="ev-svg bad-svg">
        <line x1="60" y1="210" x2="490" y2="210" stroke="var(--border)" stroke-width="0.8" />
        <line x1="60" y1="20" x2="60" y2="210" stroke="var(--border)" stroke-width="0.8" />

        @for (yt of bYTicks(); track yt.v) {
          <line x1="55" [attr.y1]="bfy(yt.v)" x2="490" [attr.y2]="bfy(yt.v)"
                stroke="var(--border)" stroke-width="0.3" stroke-opacity="0.3" />
          <text x="50" [attr.y]="bfy(yt.v) + 3" class="ax-label" text-anchor="end">{{ yt.label }}</text>
        }

        <!-- sup line (dashed, red) -->
        @if (curBad().supVal < 50) {
          <line x1="60" [attr.y1]="bfy(curBad().supVal)" x2="490" [attr.y2]="bfy(curBad().supVal)"
                stroke="#a05a5a" stroke-width="1.5" stroke-dasharray="5 3" />
          <text x="495" [attr.y]="bfy(curBad().supVal) + 4" class="sup-label">sup = {{ curBad().supVal }}（到不了！）</text>
        }

        <!-- Curve -->
        <path [attr.d]="badCurvePath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />

        <!-- Open endpoint markers -->
        @if (curBad().openLeft) {
          <circle [attr.cx]="bfx(curBad().xRange[0] + 0.05)" [attr.cy]="bfy(curBad().fn(curBad().xRange[0] + 0.05))"
                  r="5" fill="none" stroke="#a05a5a" stroke-width="2" />
        }
        @if (curBad().openRight) {
          <circle [attr.cx]="bfx(curBad().xRange[1] - 0.05)" [attr.cy]="bfy(curBad().fn(curBad().xRange[1] - 0.05))"
                  r="5" fill="none" stroke="#a05a5a" stroke-width="2" />
        }
      </svg>

      <div class="bad-explain">
        <div class="be-problem"><span class="c-bad">✗ {{ curBad().problem }}</span></div>
        <div class="be-body">{{ curBad().explain }}</div>
      </div>
    </app-challenge-card>

    <!-- ===== 證明思路 ===== -->
    <app-prose-block subtitle="證明用了什麼？">
      <p>極值定理的證明串聯了前面學過的定理：</p>
      <ol class="proof-chain">
        <li>f 連續 + [a,b] 閉 → f 有界（先證這個，用 Heine-Borel/BW）</li>
        <li>有界 → sup M = sup f(x) 存在（完備性，Ch1）</li>
        <li>取數列 xₙ 使 f(xₙ) → M（sup 的定義）</li>
        <li>xₙ 在 [a,b] 裡（有界）→ 有收斂子列 xₙₖ → c（<strong>Bolzano-Weierstrass，Ch2.5!</strong>）</li>
        <li>[a,b] 是閉的 → c ∈ [a,b]</li>
        <li>f 連續 → f(c) = lim f(xₙₖ) = M。找到了！</li>
      </ol>
      <p>
        <strong>完備性 → BW → 極值定理</strong>。每一層都建立在前一層上。
      </p>
    </app-prose-block>

    <!-- ===== 意義 ===== -->
    <app-prose-block>
      <p>
        <strong>為什麼重要</strong>：極值定理保證了<strong>最優化問題有解</strong>。
        「在某個限制條件下找最大/最小」是工程、經濟、物理的核心問題。
        EVT 告訴你：只要定義域是閉有界集且目標函數連續，<strong>最優解一定存在</strong>。
      </p>
      <p>下一節看一個更深的性質——<strong>均勻連續</strong>。</p>
    </app-prose-block>
  `,
  styles: `
    .c-max { color: #5a8a5a; font-weight: 700; }
    .c-min { color: #5a7faa; font-weight: 700; }
    .c-bad { color: #a05a5a; font-weight: 700; }
    .max-color { fill: #5a8a5a; } .min-color { fill: #5a7faa; }

    .theorem-box { padding: 16px; border-radius: 12px; background: var(--accent-10);
      border: 2px solid var(--accent); margin: 10px 0; text-align: center; }
    .thm-title { font-size: 13px; font-weight: 700; color: var(--accent); text-transform: uppercase;
      letter-spacing: 0.05em; margin-bottom: 6px; }
    .thm-body { font-size: 15px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; line-height: 1.8; }
    .thm-key { margin-top: 8px; font-size: 12px; color: var(--text-muted); line-height: 1.6; }
    .thm-key strong { color: var(--accent); }

    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pre-btn { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .bad-btn {
      &:hover { background: rgba(160,90,90,0.08); }
      &.active { background: rgba(160,90,90,0.12); border-color: #a05a5a; color: #a05a5a; } }

    .ev-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 12px; background: var(--bg); margin-bottom: 10px;
      &.bad-svg { border-color: rgba(160,90,90,0.3); } }
    .ax-label { font-size: 7px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .max-label { font-size: 8px; fill: #5a8a5a; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .min-label { font-size: 8px; fill: #5a7faa; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .sup-label { font-size: 8px; fill: #a05a5a; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .ext-found { font-size: 8px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }

    .good-result { display: flex; gap: 8px; margin-bottom: 14px; }
    .gr-card { flex: 1; padding: 10px; border-radius: 8px; text-align: center; font-size: 12px;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border); color: var(--text);
      &.max-bg { background: rgba(90,138,90,0.06); border-color: rgba(90,138,90,0.2); }
      &.min-bg { background: rgba(90,127,170,0.06); border-color: rgba(90,127,170,0.2); } }

    .bad-explain { padding: 14px; border-radius: 10px; background: rgba(160,90,90,0.04);
      border: 1px solid rgba(160,90,90,0.2); margin-bottom: 14px; }
    .be-problem { font-size: 14px; font-weight: 700; margin-bottom: 6px; }
    .be-body { font-size: 13px; color: var(--text-secondary); line-height: 1.7; }

    .proof-chain { padding-left: 20px; }
    .proof-chain li { font-size: 13px; color: var(--text-secondary); margin: 8px 0; line-height: 1.6; }
    .proof-chain li strong { color: var(--accent); }
  `,
})
export class StepExtremeValueComponent {
  readonly goodExamples = GOOD_EXAMPLES;
  readonly badCases = BAD_CASES;
  readonly goodSel = signal(0);
  readonly badSel = signal(0);

  readonly curGood = computed(() => GOOD_EXAMPLES[this.goodSel()]);
  readonly curBad = computed(() => BAD_CASES[this.badSel()]);

  // --- Good case ---
  private readonly gSamples = computed(() => {
    const e = this.curGood();
    return sampleFunction(e.fn, e.a, e.b, 300);
  });

  readonly gMaxX = computed(() => { let mx = 0, my = -Infinity; for (const p of this.gSamples()) { if (p.y > my) { my = p.y; mx = p.x; } } return mx; });
  readonly gMaxVal = computed(() => Math.max(...this.gSamples().map(p => p.y)));
  readonly gMinX = computed(() => { let mx = 0, my = Infinity; for (const p of this.gSamples()) { if (p.y < my) { my = p.y; mx = p.x; } } return mx; });
  readonly gMinVal = computed(() => Math.min(...this.gSamples().map(p => p.y)));

  gfx(x: number): number {
    const [lo, hi] = this.curGood().xRange;
    return 60 + ((x - lo) / (hi - lo)) * 430;
  }
  gfy(y: number): number {
    const [lo, hi] = this.curGood().yRange;
    return 260 - ((y - lo) / (hi - lo)) * 240;
  }

  readonly gYTicks = computed(() => this.makeTicks(this.curGood().yRange));
  goodCurvePath(): string {
    const e = this.curGood();
    const pts = sampleFunction(e.fn, e.xRange[0], e.xRange[1], 300);
    return 'M' + pts.filter(p => p.y >= e.yRange[0] - 0.5 && p.y <= e.yRange[1] + 0.5)
      .map(p => `${this.gfx(p.x).toFixed(1)},${this.gfy(p.y).toFixed(1)}`).join('L');
  }

  // --- Bad case ---
  bfx(x: number): number {
    const [lo, hi] = this.curBad().xRange;
    return 60 + ((x - lo) / (hi - lo)) * 430;
  }
  bfy(y: number): number {
    const [lo, hi] = this.curBad().yRange;
    return 210 - ((y - lo) / (hi - lo)) * 190;
  }

  readonly bYTicks = computed(() => this.makeTicks(this.curBad().yRange));
  badCurvePath(): string {
    const bc = this.curBad();
    const pts = sampleFunction(bc.fn, bc.xRange[0] + 0.02, bc.xRange[1] - 0.02, 300);
    let path = '';
    for (let i = 0; i < pts.length; i++) {
      if (pts[i].y < bc.yRange[0] - 1 || pts[i].y > bc.yRange[1] + 1) continue;
      const jump = i > 0 && Math.abs(pts[i].y - pts[i - 1].y) > 0.3 * (bc.yRange[1] - bc.yRange[0]);
      path += (path === '' || jump ? 'M' : 'L') + `${this.bfx(pts[i].x).toFixed(1)},${this.bfy(pts[i].y).toFixed(1)}`;
    }
    return path;
  }

  private makeTicks(range: [number, number]): { v: number; label: string }[] {
    const [lo, hi] = range;
    const step = this.niceStep(hi - lo, 5);
    const ticks: { v: number; label: string }[] = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) {
      ticks.push({ v, label: Math.abs(v) < 1e-10 ? '0' : v.toFixed(1) });
    }
    return ticks;
  }

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
