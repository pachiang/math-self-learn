import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { findDelta, sampleFunction } from './analysis-ch4-util';

interface Preset {
  name: string; fn: (x: number) => number; c: number; L: number; exists: boolean;
  desc: string; xRange: [number, number]; yRange: [number, number];
}

const PRESETS: Preset[] = [
  { name: 'sin(x)/x → 1', fn: (x) => x === 0 ? 1 : Math.sin(x) / x, c: 0, L: 1, exists: true,
    desc: '經典極限。x → 0 時函數值 → 1，雖然 f(0) 的定義需要另外處理。',
    xRange: [-3, 3], yRange: [-0.5, 1.5] },
  { name: '(x²−1)/(x−1) → 2', fn: (x) => x === 1 ? 2 : (x * x - 1) / (x - 1), c: 1, L: 2, exists: true,
    desc: '消去 (x−1) 後 = x+1。在 x=1 處「有洞」但極限存在 = 2。',
    xRange: [-1, 3], yRange: [-0.5, 4] },
  { name: '|x|/x（不存在）', fn: (x) => x > 0 ? 1 : x < 0 ? -1 : 0, c: 0, L: 0, exists: false,
    desc: '從左邊靠近 → −1，從右邊靠近 → +1。左右極限不同 → 極限不存在。',
    xRange: [-2, 2], yRange: [-1.8, 1.8] },
];

@Component({
  selector: 'app-step-function-limits',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="函數的極限" subtitle="§4.1">
      <p>
        第二章用 ε-N 定義了數列極限。現在搬到函數上。核心想法完全一樣：
      </p>
      <p class="intuition">
        想像你和對手在玩一個遊戲：<br>
        對手給你一個挑戰（<span class="c-eps">ε 帶</span>——多窄的水平帶子），<br>
        你要回應一個防守（<span class="c-del">δ 帶</span>——多窄的垂直窗口），<br>
        使得只要 x 落在你的 <span class="c-del">δ 窗口</span>裡，f(x) 就保證落在對手的 <span class="c-eps">ε 帶子</span>裡。<br>
        <strong>不管對手出多窄的帶子，你都能贏 → 極限存在。</strong>
      </p>
    </app-prose-block>

    <app-prose-block>
      <div class="formula-box">
        <div class="formula-title">ε-δ 定義</div>
        <div class="formula-body">
          lim(x→c) f(x) = L &nbsp;⟺<br>
          ∀<span class="c-eps">ε</span> > 0, ∃<span class="c-del">δ</span> > 0 使得
          0 &lt; <span class="c-del">|x − c|</span> &lt; <span class="c-del">δ</span>
          &nbsp;⟹&nbsp;
          <span class="c-eps">|f(x) − L|</span> &lt; <span class="c-eps">ε</span>
        </div>
      </div>

      <div class="geometry-explain">
        <div class="ge-row">
          <span class="ge-icon eps-icon">━</span>
          <span class="ge-text"><span class="c-eps">ε 帶</span> = 以 L 為中心的<strong>水平帶子</strong> (L−ε, L+ε)。控制<strong>輸出精度</strong>：f(x) 要多靠近 L。</span>
        </div>
        <div class="ge-row">
          <span class="ge-icon del-icon">┃</span>
          <span class="ge-text"><span class="c-del">δ 帶</span> = 以 c 為中心的<strong>垂直窗口</strong> (c−δ, c+δ)。控制<strong>輸入範圍</strong>：x 要多靠近 c。</span>
        </div>
        <div class="ge-row">
          <span class="ge-icon cross-icon">✦</span>
          <span class="ge-text"><strong>兩帶交叉</strong>形成矩形。極限存在 ⟺ 曲線在 <span class="c-del">δ 窗口</span>裡完全被 <span class="c-eps">ε 帶</span>關住。</span>
        </div>
      </div>
    </app-prose-block>

    <app-challenge-card prompt="調 ε 看 δ 怎麼跟著變——帶子越薄，窗口越窄">
      <div class="ctrl-row">
        @for (p of presets; track p.name; let i = $index) {
          <button class="pre-btn" [class.active]="selIdx() === i" (click)="selIdx.set(i)">{{ p.name }}</button>
        }
      </div>

      <div class="eps-ctrl">
        <span class="eps-label"><span class="c-eps">ε</span> = {{ epsilon().toFixed(3) }}</span>
        <input type="range" min="0.03" max="1.2" step="0.01" [value]="epsilon()"
               (input)="epsilon.set(+($any($event.target)).value)" class="eps-slider" />
      </div>

      <svg viewBox="0 0 520 340" class="ed-svg">
        <line x1="60" y1="290" x2="490" y2="290" stroke="var(--border)" stroke-width="0.8" />
        <line x1="60" y1="20" x2="60" y2="290" stroke="var(--border)" stroke-width="0.8" />

        @for (yt of yTicks(); track yt.v) {
          <line x1="55" [attr.y1]="fy(yt.v)" x2="490" [attr.y2]="fy(yt.v)"
                stroke="var(--border)" stroke-width="0.3" stroke-opacity="0.3" />
          <text x="50" [attr.y]="fy(yt.v) + 3" class="ax-label" text-anchor="end">{{ yt.label }}</text>
        }
        @for (xt of xTicks(); track xt.v) {
          <text [attr.x]="fx(xt.v)" y="304" class="ax-label" text-anchor="middle">{{ xt.label }}</text>
        }

        <!-- ε band -->
        @if (current().exists) {
          <rect x="60" [attr.y]="fy(current().L + epsilon())" width="430"
                [attr.height]="Math.max(1, fy(current().L - epsilon()) - fy(current().L + epsilon()))"
                fill="#c06060" fill-opacity="0.08" stroke="#c06060" stroke-width="0.8" stroke-dasharray="4 3" />
          <text [attr.x]="497" [attr.y]="fy(current().L + epsilon() / 2) + 3"
                class="band-label eps-color" text-anchor="start">ε</text>
          <line x1="60" [attr.y1]="fy(current().L)" x2="490" [attr.y2]="fy(current().L)"
                stroke="#c06060" stroke-width="1.2" stroke-dasharray="6 4" />
          <text x="497" [attr.y]="fy(current().L) + 4" class="L-label">L</text>
          <text x="50" [attr.y]="fy(current().L + epsilon()) - 3" class="bound-label eps-color" text-anchor="end">L+ε</text>
          <text x="50" [attr.y]="fy(current().L - epsilon()) + 10" class="bound-label eps-color" text-anchor="end">L−ε</text>
          <!-- Y bracket -->
          <line x1="57" [attr.y1]="fy(current().L + epsilon())" x2="57" [attr.y2]="fy(current().L - epsilon())"
                stroke="#c06060" stroke-width="2.5" />
        }

        <!-- δ band -->
        @if (current().exists && delta() > 0) {
          <rect [attr.x]="fx(current().c - delta())" y="20"
                [attr.width]="Math.max(1, fx(current().c + delta()) - fx(current().c - delta()))"
                height="270"
                fill="#4080c0" fill-opacity="0.08" stroke="#4080c0" stroke-width="0.8" stroke-dasharray="4 3" />
          <text [attr.x]="fx(current().c + delta() / 2)" y="16"
                class="band-label del-color" text-anchor="middle">δ</text>
          <line [attr.x1]="fx(current().c)" y1="20" [attr.x2]="fx(current().c)" y2="290"
                stroke="#4080c0" stroke-width="1.2" stroke-dasharray="6 4" />
          <text [attr.x]="fx(current().c)" y="318" class="c-label" text-anchor="middle">c</text>
          <text [attr.x]="fx(current().c - delta())" y="318" class="bound-label del-color" text-anchor="middle">c−δ</text>
          <text [attr.x]="fx(current().c + delta())" y="318" class="bound-label del-color" text-anchor="middle">c+δ</text>
          <!-- X bracket -->
          <line [attr.x1]="fx(current().c - delta())" y1="293" [attr.x2]="fx(current().c + delta())" y2="293"
                stroke="#4080c0" stroke-width="2.5" />
        }

        <!-- Curve -->
        <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />

        <!-- (c, L) open circle -->
        <circle [attr.cx]="fx(current().c)" [attr.cy]="fy(current().L)" r="5"
                fill="none" stroke="var(--accent)" stroke-width="2" />
      </svg>

      <div class="result-row">
        <div class="r-card eps-bg">
          <span class="r-label">對手的挑戰</span>
          <span class="r-val"><span class="c-eps">ε</span> = {{ epsilon().toFixed(3) }}</span>
        </div>
        <div class="r-card del-bg">
          <span class="r-label">你的回應</span>
          <span class="r-val"><span class="c-del">δ</span> = {{ delta().toFixed(4) }}</span>
        </div>
        <div class="r-card" [class.ok]="current().exists" [class.bad]="!current().exists">
          {{ current().exists ? '你永遠能贏 → 極限存在 ✓' : '你贏不了 → 極限不存在 ✗' }}
        </div>
      </div>

      <div class="desc">{{ current().desc }}</div>

      @if (!current().exists) {
        <div class="fail-explain">
          不管 <span class="c-del">δ</span> 選多小，<span class="c-del">δ 窗口</span>裡總有
          f(x) 跑出 <span class="c-eps">ε 帶</span>的點——因為左右極限不同。
        </div>
      }
    </app-challenge-card>

    <app-prose-block>
      <p>
        <strong>一句話記住 ε-δ</strong>：
        <span class="c-eps">ε 控制輸出精度</span>，
        <span class="c-del">δ 控制輸入範圍</span>。
        極限存在 = 輸出精度永遠能被輸入範圍保證。
      </p>
      <p>
        下一節用 ε-δ 定義<strong>連續</strong>——只需要把「0 &lt; |x−c|」改成「|x−c|」（允許 x = c）。
      </p>
    </app-prose-block>
  `,
  styles: `
    .c-eps { color: #c06060; font-weight: 700; }
    .c-del { color: #4080c0; font-weight: 700; }
    .eps-color { fill: #c06060; }
    .del-color { fill: #4080c0; }

    .intuition { padding: 14px; border-radius: 10px; background: var(--bg-surface);
      border: 1px solid var(--border); font-size: 13px; line-height: 2;
      color: var(--text-secondary); text-align: center; margin: 10px 0; }
    .intuition strong { color: var(--accent); }

    .formula-box { padding: 16px; border-radius: 10px; background: var(--accent-10);
      border: 2px solid var(--accent); margin: 10px 0; text-align: center; }
    .formula-title { font-size: 12px; font-weight: 700; color: var(--accent);
      text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
    .formula-body { font-size: 15px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; line-height: 2; }

    .geometry-explain { display: flex; flex-direction: column; gap: 8px; margin: 12px 0; }
    .ge-row { display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px;
      border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface); }
    .ge-icon { font-size: 18px; min-width: 24px; text-align: center; line-height: 1;
      &.eps-icon { color: #c06060; } &.del-icon { color: #4080c0; } &.cross-icon { color: var(--accent); } }
    .ge-text { font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
    .ge-text strong { color: var(--accent); }

    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
    .pre-btn { padding: 5px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .eps-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .eps-label { font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace; min-width: 90px; }
    .eps-slider { flex: 1; accent-color: #c06060; height: 22px; }

    .ed-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 12px; background: var(--bg); margin-bottom: 10px; }
    .ax-label { font-size: 7px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .band-label { font-size: 11px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .bound-label { font-size: 6.5px; font-weight: 600; font-family: 'JetBrains Mono', monospace; }
    .L-label { font-size: 9px; fill: #c06060; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .c-label { font-size: 9px; fill: #4080c0; font-weight: 700; font-family: 'JetBrains Mono', monospace; }

    .result-row { display: flex; gap: 8px; margin-bottom: 8px; }
    .r-card { flex: 1; padding: 10px; border-radius: 8px; text-align: center;
      border: 1px solid var(--border); background: var(--bg-surface); font-size: 12px;
      &.eps-bg { background: rgba(192,96,96,0.06); border-color: rgba(192,96,96,0.2); }
      &.del-bg { background: rgba(64,128,192,0.06); border-color: rgba(64,128,192,0.2); }
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; font-weight: 600; }
      &.bad { background: rgba(160,90,90,0.08); color: #a05a5a; font-weight: 600; } }
    .r-label { font-size: 10px; color: var(--text-muted); display: block; margin-bottom: 2px; }
    .r-val { font-size: 15px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text); }
    .desc { font-size: 12px; color: var(--text-secondary); padding: 10px 12px;
      background: var(--bg-surface); border-radius: 8px; border: 1px solid var(--border); margin-bottom: 8px; }
    .fail-explain { padding: 10px; border-radius: 8px; background: rgba(160,90,90,0.06);
      border: 1px solid rgba(160,90,90,0.2); font-size: 12px; color: var(--text-secondary); text-align: center; }
  `,
})
export class StepFunctionLimitsComponent {
  readonly Math = Math;
  readonly presets = PRESETS;
  readonly selIdx = signal(0);
  readonly epsilon = signal(0.3);

  readonly current = computed(() => PRESETS[this.selIdx()]);
  readonly delta = computed(() => {
    const p = this.current();
    if (!p.exists) return 0;
    return findDelta(p.fn, p.c, p.L, this.epsilon());
  });

  fx(x: number): number {
    const [lo, hi] = this.current().xRange;
    return 60 + ((x - lo) / (hi - lo)) * 430;
  }

  fy(y: number): number {
    const [lo, hi] = this.current().yRange;
    return 290 - ((y - lo) / (hi - lo)) * 270;
  }

  readonly yTicks = computed(() => {
    const [lo, hi] = this.current().yRange;
    const step = this.niceStep(hi - lo, 5);
    const ticks: { v: number; label: string }[] = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) {
      ticks.push({ v, label: Math.abs(v) < 1e-10 ? '0' : v.toFixed(1) });
    }
    return ticks;
  });

  readonly xTicks = computed(() => {
    const [lo, hi] = this.current().xRange;
    const step = this.niceStep(hi - lo, 5);
    const ticks: { v: number; label: string }[] = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) {
      ticks.push({ v, label: Math.abs(v) < 1e-10 ? '0' : v.toFixed(1) });
    }
    return ticks;
  });

  private niceStep(range: number, target: number): number {
    const rough = range / target;
    const mag = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / mag;
    if (norm < 1.5) return mag;
    if (norm < 3.5) return 2 * mag;
    if (norm < 7.5) return 5 * mag;
    return 10 * mag;
  }

  curvePath(): string {
    const p = this.current();
    const pts = sampleFunction(p.fn, p.xRange[0], p.xRange[1], 300);
    const valid = pts.filter((pt) => pt.y > p.yRange[0] - 0.5 && pt.y < p.yRange[1] + 0.5);
    if (valid.length < 2) return '';
    let path = '';
    for (let i = 0; i < valid.length; i++) {
      const jump = i > 0 && Math.abs(valid[i].y - valid[i - 1].y) > 0.5;
      path += (i === 0 || jump ? 'M' : 'L') + `${this.fx(valid[i].x).toFixed(1)},${this.fy(valid[i].y).toFixed(1)}`;
    }
    return path;
  }
}
