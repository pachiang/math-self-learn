import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';
import { sampleFunction } from './analysis-ch4-util';

interface UCExample {
  name: string; fn: (x: number) => number;
  xRange: [number, number]; yRange: [number, number];
  uniform: boolean; why: string;
}

const EXAMPLES: UCExample[] = [
  { name: 'sin(x) 在 R', fn: Math.sin, xRange: [-6, 6], yRange: [-1.5, 1.5],
    uniform: true, why: '斜率永遠 ≤ 1（Lipschitz），所以 δ = ε 到處管用。函數的「陡峭程度」被天花板壓住了。' },
  { name: '1/x 在 (0, 2)', fn: (x) => x > 0.02 ? 1 / x : 50, xRange: [0.02, 2.2], yRange: [-1, 20],
    uniform: false, why: '在 x=0.5 附近，稍微動一下 δ，高度變化不大。但在 x=0.0001 附近，同樣動一下 δ，高度大爆炸。函數變得無限陡峭，沒有任何固定 δ 能滿足所有地方。' },
  { name: 'x² 在 [0, 2]', fn: (x) => x * x, xRange: [-0.2, 2.3], yRange: [-0.5, 5],
    uniform: true, why: '斜率 = 2x 在增加，但區間是閉的 → 最陡處就是 x=2（斜率=4）。針對這個「最陡處」選夠小的 δ，在其他更平緩的地方就通吃了。' },
  { name: 'sin(1/x) 在 (0, 1)', fn: (x) => x > 0.005 ? Math.sin(1 / x) : 0, xRange: [0.005, 1.1], yRange: [-1.5, 1.5],
    uniform: false, why: '靠近 0 時振盪越來越快，任何固定的 δ 窗口裡都包含完整的上下擺動。函數在角落裡「瘋狂」到無法控制。' },
];

@Component({
  selector: 'app-step-uniform-continuity',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <!-- ===== 從局部到整體 ===== -->
    <app-prose-block title="均勻連續" subtitle="§4.7">
      <p>
        這一節的核心是從<strong>「局部」跨越到「整體」</strong>。
      </p>
      <p>
        到目前為止，連續性是<strong>逐點</strong>的——在每個點 x₀，都能找到一個 δ。
        但當我們要做「需要看整段區間」的事情——像是積分、函數序列的極限——
        逐點連續就不夠用了。我們需要知道：整段區間上的行為是否<strong>均勻地受控</strong>。
      </p>
    </app-prose-block>

    <!-- ===== 闖關遊戲比喻 ===== -->
    <app-prose-block subtitle="闖關遊戲：那個「一夫當關」的 δ">
      <p>想像一個闖關遊戲：</p>
      <div class="game-compare">
        <div class="game-card">
          <div class="game-title">逐點連續</div>
          <div class="game-rule">
            關主給你 <span class="c-eps">ε</span>，然後讓你<strong>先選關卡</strong>（點 x₀）。
            選定後，關主掏出一個通關道具 <span class="c-del">δ</span>。
            <strong>換一個關卡，他可以給你不同的道具。</strong>
          </div>
          <div class="game-note"><span class="c-del">δ</span> 是 x 的函數——<strong>因地制宜</strong></div>
        </div>
        <div class="game-vs">vs</div>
        <div class="game-card highlight">
          <div class="game-title">均勻連續</div>
          <div class="game-rule">
            關主給你 <span class="c-eps">ε</span>，但<strong>在你選關卡之前</strong>，
            他必須掏出<strong>唯一一個</strong>道具 <span class="c-del">δ</span>。
            這個道具必須讓你在<strong>所有關卡</strong>中都能通關。
          </div>
          <div class="game-note"><span class="c-del">δ</span> 只跟 ε 有關——<strong>一體適用</strong></div>
        </div>
      </div>
    </app-prose-block>

    <!-- ===== 量詞對比 ===== -->
    <app-prose-block subtitle="量詞順序：一字之差，天壤之別">
      <div class="def-compare">
        <div class="def-card">
          <div class="def-label">逐點連續</div>
          <div class="def-formula">∀x, ∀<span class="c-eps">ε</span>>0, ∃<span class="c-del">δ(x, ε)</span>>0 : ...</div>
          <div class="def-meaning">先選 x，再找 δ → δ 可以隨位置變</div>
        </div>
        <div class="def-arrow">↕ 交換</div>
        <div class="def-card strong">
          <div class="def-label">均勻連續</div>
          <div class="def-formula">∀<span class="c-eps">ε</span>>0, ∃<span class="c-del">δ(ε)</span>>0, ∀x : ...</div>
          <div class="def-meaning">先選 δ，再給任何 x 都成立 → δ 全域統一</div>
        </div>
      </div>
      <div class="quantifier-note">
        均勻連續是更強的「結構性」要求。
        如果函數均勻連續，它在整段區間上的<strong>震盪速度被控制住了</strong>，
        不會在某個角落突然變得無限瘋狂。
      </div>
    </app-prose-block>

    <!-- ===== 互動：δ(x) 分佈圖 ===== -->
    <app-challenge-card prompt="核心視覺化：δ 隨位置的變化——均勻連續 = δ 有正的下界">
      <div class="ctrl-row">
        @for (ex of examples; track ex.name; let i = $index) {
          <button class="pre-btn" [class.active]="sel() === i" (click)="sel.set(i)">{{ ex.name }}</button>
        }
      </div>

      <div class="eps-ctrl">
        <span class="eps-label"><span class="c-eps">ε</span> = {{ eps().toFixed(2) }}</span>
        <input type="range" min="0.1" max="1.5" step="0.05" [value]="eps()"
               (input)="eps.set(+($any($event.target)).value)" class="eps-slider" />
      </div>

      <!-- 上半：函數圖 + 探針 -->
      <div class="chart-label">函數 f(x)</div>
      <svg viewBox="0 0 520 200" class="fn-svg">
        <line x1="60" y1="175" x2="490" y2="175" stroke="var(--border)" stroke-width="0.8" />
        <line x1="60" y1="10" x2="60" y2="175" stroke="var(--border)" stroke-width="0.8" />
        @for (yt of fnYTicks(); track yt.v) {
          <line x1="55" [attr.y1]="ffy(yt.v)" x2="490" [attr.y2]="ffy(yt.v)"
                stroke="var(--border)" stroke-width="0.3" stroke-opacity="0.3" />
          <text x="50" [attr.y]="ffy(yt.v) + 3" class="ax-label" text-anchor="end">{{ yt.label }}</text>
        }
        <!-- ε band -->
        <rect x="60" [attr.y]="ffy(fAtProbe() + eps())" width="430"
              [attr.height]="Math.max(1, ffy(fAtProbe() - eps()) - ffy(fAtProbe() + eps()))"
              fill="#c06060" fill-opacity="0.08" stroke="#c06060" stroke-width="0.5" stroke-dasharray="3 2" />
        <!-- δ band -->
        @if (localDelta() > 0.001) {
          <rect [attr.x]="Math.max(60, ffx(probeX() - localDelta()))" y="10"
                [attr.width]="Math.min(430, ffx(probeX() + localDelta()) - ffx(probeX() - localDelta()))"
                height="165" fill="#4080c0" fill-opacity="0.06" stroke="#4080c0" stroke-width="0.5" stroke-dasharray="3 2" />
        }
        <path [attr.d]="curvePath()" fill="none" stroke="var(--accent)" stroke-width="2.5" />
        <circle [attr.cx]="ffx(probeX())" [attr.cy]="ffy(fAtProbe())" r="5"
                fill="var(--accent)" stroke="white" stroke-width="1.5" />
      </svg>

      <div class="probe-ctrl">
        <span class="probe-label">探測位置 x₀ = {{ probeX().toFixed(2) }}</span>
        <input type="range" [min]="curEx().xRange[0]" [max]="curEx().xRange[1]" step="0.01"
               [value]="probeX()" (input)="probeX.set(+($any($event.target)).value)" class="probe-slider" />
      </div>

      <!-- 下半：δ(x) 分佈圖 -->
      <div class="chart-label">
        每個位置 x 可用的 <span class="c-del">δ</span>
        ——均勻連續 ⟺ 這條線<strong>不掉到零</strong>
      </div>
      <svg viewBox="0 0 520 130" class="delta-svg">
        <line x1="60" y1="110" x2="490" y2="110" stroke="var(--border)" stroke-width="0.8" />
        <line x1="60" y1="10" x2="60" y2="110" stroke="var(--border)" stroke-width="0.8" />
        <path [attr.d]="deltaAreaPath()" fill="#4080c0" fill-opacity="0.15" stroke="#4080c0" stroke-width="1.5" />
        <circle [attr.cx]="ffx(probeX())" [attr.cy]="dfy(localDelta())" r="5"
                fill="#4080c0" stroke="white" stroke-width="1.5" />
        <text [attr.x]="ffx(probeX()) + 8" [attr.y]="dfy(localDelta()) - 4"
              class="delta-val-label">δ = {{ localDelta().toFixed(4) }}</text>
        @if (curEx().uniform) {
          <line x1="60" [attr.y1]="dfy(minDelta())" x2="490" [attr.y2]="dfy(minDelta())"
                stroke="#5a8a5a" stroke-width="1.5" stroke-dasharray="5 3" />
          <text x="495" [attr.y]="dfy(minDelta()) + 4" class="floor-label">δ_min > 0 ✓</text>
        } @else {
          <text x="100" y="105" class="drops-label">δ → 0 ✗</text>
        }
      </svg>

      <div class="result-row">
        <div class="r-card del-bg">δ(x₀) = {{ localDelta().toFixed(4) }}</div>
        <div class="r-card" [class.ok]="curEx().uniform" [class.bad]="!curEx().uniform">
          {{ curEx().uniform ? '均勻連續 ✓ — δ 有正下界' : '非均勻連續 ✗ — δ 趨向 0' }}
        </div>
      </div>
      <div class="why-box">{{ curEx().why }}</div>
    </app-challenge-card>

    <!-- ===== Heine-Cantor：閉區間的魔力 ===== -->
    <app-prose-block subtitle="Heine-Cantor 定理：閉區間的魔力">
      <div class="hc-box">
        <div class="hc-title">Heine-Cantor 定理</div>
        <div class="hc-body">
          f 在<strong>閉有界</strong>區間 [a, b] 上連續 → f 在 [a, b] 上<strong>均勻連續</strong>。
        </div>
      </div>
      <p>
        為什麼 x² 在 [0, 2] 均勻連續，但在整個 R 上不是？
      </p>
      <p>
        在 R 上，x² 隨著 x 變大，斜率 2x 無限增加——你總能找到一個極遠的地方，
        在那裡函數陡到連最小的 δ 都拉不住。
      </p>
      <p>
        但在<strong>閉有界區間</strong>上，函數的陡峭程度如果會變大，
        它必須在區間結束前「停下來」。因為區間是閉的，函數不可能在邊界處爆掉。
        既然<strong>最陡的地方</strong>都被限制住了，我們只要針對那個最陡處選一個夠小的 δ，
        <strong>這個 δ 在其他更平緩的地方就通吃了</strong>。
      </p>
      <p>
        （嚴格證明用有限覆蓋或 Bolzano-Weierstrass——閉有界 = 緊緻，
        緊緻保證了「有限個 δ 取最小」的操作合法。）
      </p>
    </app-prose-block>

    <!-- ===== 為什麼拼命也要證均勻連續 ===== -->
    <app-prose-block subtitle="為什麼拼了命也要證明均勻連續？">
      <p>
        均勻連續不是學術概念——它是讓很多「整體操作」合法的<strong>關鍵鑰匙</strong>：
      </p>

      <div class="app-cards">
        <div class="app-card">
          <div class="app-title">A. 積分的合法性</div>
          <div class="app-body">
            Riemann 積分把區間切成小段，希望切得夠細時每小段的高度差<strong>一致</strong>趨向 0。
            如果函數不均勻連續，某個角落的高度差可能永遠縮不下來——
            積分的定義就崩潰了。均勻連續保證：<strong>切得夠細 → 處處都平</strong>。
          </div>
        </div>

        <div class="app-card">
          <div class="app-title">B. Cauchy 列的穩定性</div>
          <div class="app-body">
            均勻連續保證：<strong>Cauchy 列映射到 Cauchy 列</strong>。
            如果你有一串點 xₙ 彼此靠得很近，映射後 f(xₙ) 也會彼此靠得很近。
            普通連續<strong>不保證這點</strong>——它可能在某個極端處把快要收斂的序列扯得稀爛。
          </div>
        </div>

        <div class="app-card">
          <div class="app-title">C. 函數延拓</div>
          <div class="app-body">
            f 在 (a, b) 上均勻連續 → 可以延拓到 [a, b]（端點有定義）。
            不均勻連續就可能延拓不了——如 sin(1/x) 在 x=0 處無法連續延拓，
            因為它靠近 0 時「振盪得太瘋狂」。
          </div>
        </div>
      </div>

      <p class="summary-line">
        <strong>逐點連續是「點的友善」，均勻連續是「區間的穩定」。</strong>
        學這一節，是為了擁有一套工具去處理那些行為規律、不會在角落爆炸的函數。
      </p>
      <p>下一節預覽<strong>連續函數空間</strong>和 sup 範數。</p>
    </app-prose-block>
  `,
  styles: `
    .c-eps { color: #c06060; font-weight: 700; }
    .c-del { color: #4080c0; font-weight: 700; }

    .key-question { text-align: center; font-size: 14px; padding: 12px; margin: 10px 0;
      background: var(--accent-10); border: 2px solid var(--accent); border-radius: 10px; color: var(--text); }

    /* Game comparison */
    .game-compare { display: flex; gap: 10px; align-items: stretch; margin: 10px 0; }
    .game-card { flex: 1; padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-surface);
      &.highlight { border: 2px solid var(--accent); background: var(--accent-10); } }
    .game-title { font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 8px; }
    .game-rule { font-size: 12px; color: var(--text-secondary); line-height: 1.8; }
    .game-note { margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border);
      font-size: 12px; font-weight: 600; color: var(--text-muted); }
    .game-vs { font-size: 14px; font-weight: 700; color: var(--text-muted); align-self: center; }

    /* Definition comparison */
    .def-compare { display: flex; flex-direction: column; gap: 0; margin: 10px 0; }
    .def-card { padding: 12px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg-surface);
      &.strong { border: 2px solid var(--accent); background: var(--accent-10); } }
    .def-label { font-size: 11px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.04em; }
    .def-formula { font-size: 15px; font-weight: 600; color: var(--text); font-family: 'JetBrains Mono', monospace; margin: 4px 0; }
    .def-meaning { font-size: 12px; color: var(--text-muted); }
    .def-arrow { text-align: center; font-size: 12px; color: var(--accent); font-weight: 700; padding: 2px 0; }
    .quantifier-note { padding: 10px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border);
      font-size: 12px; color: var(--text-muted); text-align: center; margin-top: 8px; }
    .quantifier-note strong { color: var(--accent); }

    /* Controls */
    .ctrl-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
    .pre-btn { padding: 5px 10px; border: 1px solid var(--border); border-radius: 6px;
      background: transparent; color: var(--text-muted); font-size: 12px; cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      &:hover { background: var(--accent-10); }
      &.active { background: var(--accent-18); border-color: var(--accent); color: var(--text); font-weight: 600; } }
    .eps-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .eps-label { font-size: 14px; font-weight: 700; font-family: 'JetBrains Mono', monospace; min-width: 80px; }
    .eps-slider { flex: 1; accent-color: #c06060; height: 20px; }
    .probe-ctrl { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .probe-label { font-size: 12px; font-weight: 600; font-family: 'JetBrains Mono', monospace; min-width: 130px; color: var(--text); }
    .probe-slider { flex: 1; accent-color: var(--accent); height: 20px; }

    /* Charts */
    .chart-label { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 3px; }
    .chart-label strong { color: var(--accent); }
    .fn-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 6px; }
    .delta-svg { width: 100%; display: block; border: 1px solid var(--border);
      border-radius: 10px; background: var(--bg); margin-bottom: 10px; }
    .ax-label { font-size: 7px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .delta-val-label { font-size: 8px; fill: #4080c0; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .floor-label { font-size: 8px; fill: #5a8a5a; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .drops-label { font-size: 9px; fill: #a05a5a; font-weight: 700; font-family: 'JetBrains Mono', monospace; }

    .result-row { display: flex; gap: 8px; margin-bottom: 8px; }
    .r-card { flex: 1; padding: 10px; border-radius: 8px; text-align: center; font-size: 12px; font-weight: 600;
      font-family: 'JetBrains Mono', monospace; border: 1px solid var(--border); background: var(--bg-surface); color: var(--text);
      &.del-bg { background: rgba(64,128,192,0.06); border-color: rgba(64,128,192,0.2); }
      &.ok { background: rgba(90,138,90,0.08); color: #5a8a5a; }
      &.bad { background: rgba(160,90,90,0.08); color: #a05a5a; } }
    .why-box { padding: 10px 12px; border-radius: 8px; background: var(--bg-surface); border: 1px solid var(--border);
      font-size: 12px; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.7; }

    /* Heine-Cantor */
    .hc-box { padding: 14px; border-radius: 10px; background: var(--accent-10);
      border: 2px solid var(--accent); margin: 10px 0; text-align: center; }
    .hc-title { font-size: 12px; font-weight: 700; color: var(--accent);
      text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .hc-body { font-size: 14px; font-weight: 600; color: var(--text);
      font-family: 'JetBrains Mono', monospace; line-height: 1.8; }

    /* Application cards */
    .app-cards { display: flex; flex-direction: column; gap: 10px; margin: 12px 0; }
    .app-card { padding: 14px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-surface); }
    .app-title { font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 6px; }
    .app-body { font-size: 12px; color: var(--text-secondary); line-height: 1.8; }
    .app-body strong { color: var(--accent); }

    .summary-line { text-align: center; font-size: 14px; padding: 12px; margin: 12px 0;
      background: var(--accent-10); border: 2px solid var(--accent); border-radius: 10px;
      color: var(--text); line-height: 1.7; }
  `,
})
export class StepUniformContinuityComponent {
  readonly Math = Math;
  readonly examples = EXAMPLES;
  readonly sel = signal(0);
  readonly eps = signal(0.5);
  readonly probeX = signal(0.5);
  readonly curEx = computed(() => EXAMPLES[this.sel()]);
  readonly fAtProbe = computed(() => this.curEx().fn(this.probeX()));

  readonly localDelta = computed(() => this.computeDelta(this.probeX()));

  private computeDelta(x0: number): number {
    const fn = this.curEx().fn;
    const e = this.eps();
    const fX0 = fn(x0);
    const [lo, hi] = this.curEx().xRange;
    let delta = 0.001;
    while (delta < 3) {
      const xL = x0 - delta, xR = x0 + delta;
      if ((xL > lo && Math.abs(fn(xL) - fX0) >= e) ||
          (xR < hi && Math.abs(fn(xR) - fX0) >= e)) break;
      delta += 0.002;
    }
    return Math.max(0.001, delta - 0.002);
  }

  readonly minDelta = computed(() => {
    const [lo, hi] = this.curEx().xRange;
    let md = Infinity;
    const step = (hi - lo) / 60;
    for (let x = lo + step; x < hi - step; x += step) {
      md = Math.min(md, this.computeDelta(x));
    }
    return md;
  });

  ffx(x: number): number {
    const [lo, hi] = this.curEx().xRange;
    return 60 + ((x - lo) / (hi - lo)) * 430;
  }
  ffy(y: number): number {
    const [lo, hi] = this.curEx().yRange;
    return 175 - ((y - lo) / (hi - lo)) * 165;
  }
  readonly fnYTicks = computed(() => this.makeTicks(this.curEx().yRange, 4));

  curvePath(): string {
    const e = this.curEx();
    const pts = sampleFunction(e.fn, e.xRange[0], e.xRange[1], 400);
    return 'M' + pts.filter(p => p.y >= e.yRange[0] - 1 && p.y <= e.yRange[1] + 1)
      .map(p => `${this.ffx(p.x).toFixed(1)},${this.ffy(p.y).toFixed(1)}`).join('L');
  }

  dfy(d: number): number { return 110 - Math.min(d, 1.5) / 1.5 * 100; }

  deltaAreaPath(): string {
    const [lo, hi] = this.curEx().xRange;
    const step = (hi - lo) / 80;
    let path = `M${this.ffx(lo).toFixed(1)},110`;
    for (let x = lo + step; x < hi - step; x += step) {
      const d = this.computeDelta(x);
      path += `L${this.ffx(x).toFixed(1)},${this.dfy(d).toFixed(1)}`;
    }
    path += `L${this.ffx(hi - step).toFixed(1)},110Z`;
    return path;
  }

  private makeTicks(range: [number, number], target: number): { v: number; label: string }[] {
    const [lo, hi] = range;
    const step = this.niceStep(hi - lo, target);
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
