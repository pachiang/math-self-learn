import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

const PX_PER_T = 32;
const PX_PER_Y = 22;
const T_END = 5.5;

function rk4Path(
  f: (t: number, y: number) => number,
  y0: number,
  tStart: number,
  tEnd: number,
  numSteps: number,
): string {
  const h = (tEnd - tStart) / numSteps;
  let t = tStart;
  let y = y0;
  const pts: string[] = [`M ${(t * PX_PER_T).toFixed(1)} ${(-y * PX_PER_Y).toFixed(1)}`];
  for (let i = 0; i < numSteps; i++) {
    const k1 = f(t, y);
    const k2 = f(t + h / 2, y + (h / 2) * k1);
    const k3 = f(t + h / 2, y + (h / 2) * k2);
    const k4 = f(t + h, y + h * k3);
    y = y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    t = t + h;
    if (!isFinite(y) || Math.abs(y) > 12) break;
    pts.push(`L ${(t * PX_PER_T).toFixed(1)} ${(-y * PX_PER_Y).toFixed(1)}`);
  }
  return pts.join(' ');
}

function eulerPoints(
  f: (t: number, y: number) => number,
  y0: number,
  tStart: number,
  tEnd: number,
  h: number,
): Array<{ t: number; y: number }> {
  const pts: Array<{ t: number; y: number }> = [{ t: tStart, y: y0 }];
  let t = tStart;
  let y = y0;
  let guard = 0;
  while (t < tEnd && guard < 5000) {
    const slope = f(t, y);
    y = y + h * slope;
    t = t + h;
    if (!isFinite(y) || Math.abs(y) > 12) {
      pts.push({ t, y: Math.sign(y) * 12 });
      break;
    }
    pts.push({ t, y });
    guard++;
  }
  return pts;
}

function eulerPathD(points: Array<{ t: number; y: number }>): string {
  if (points.length === 0) return '';
  return points
    .map(
      (p, i) =>
        `${i === 0 ? 'M' : 'L'} ${(p.t * PX_PER_T).toFixed(1)} ${(
          -p.y * PX_PER_Y
        ).toFixed(1)}`,
    )
    .join(' ');
}

function analyticPath(
  formula: (t: number) => number,
  tStart: number,
  tEnd: number,
  n: number,
): string {
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const t = tStart + (i / n) * (tEnd - tStart);
    const y = formula(t);
    if (!isFinite(y) || Math.abs(y) > 12) continue;
    pts.push(
      `${pts.length === 0 ? 'M' : 'L'} ${(t * PX_PER_T).toFixed(1)} ${(
        -y * PX_PER_Y
      ).toFixed(1)}`,
    );
  }
  return pts.join(' ');
}

@Component({
  selector: 'app-de-ch1-analytic-vs-numerical',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="解析解 vs 數值解" subtitle="§1.5">
      <p>
        前幾節我們都靠電腦積分出曲線。現在要問一個很真實的問題：
      </p>
      <p class="key-idea">
        我們<strong>能不能用公式</strong>把解寫出來，像 <code>y(t) = e<sup>t</sup></code> 那樣？還是只能靠電腦一步步算？
      </p>
      <p>
        答案令人意外：<strong>大多數微分方程是「算得出」但「寫不出來」的</strong>。
        能寫成初等函數的，是少數幸運案例。
      </p>
      <p>
        這一節我們做兩件事：
      </p>
      <ol>
        <li>比較「可解的」跟「不可解的」方程長什麼樣</li>
        <li>看「數值解」到底有多準——會不會騙人？</li>
      </ol>
    </app-prose-block>

    <app-challenge-card prompt="左右對照：能寫 vs 不能寫。下方滑桿控制 Euler 步長——把步長拉大，看數值解怎麼壞掉">
      <div class="case-grid">
        <!-- Case A: solvable -->
        <div class="case card-a">
          <div class="case-head">
            <span class="tag tag-ok">可解</span>
            <span class="case-title">Case A</span>
          </div>
          <code class="case-eq">dy/dt = y,  y(0) = {{ y0().toFixed(2) }}</code>
          <div class="formula-line">
            <span class="formula-lead">解析解：</span>
            <code class="formula-big">y(t) = {{ y0().toFixed(2) }} · e<sup>t</sup></code>
          </div>
          <div class="plot-wrap">
            <svg viewBox="-10 -80 200 160" class="plot-svg">
              <line x1="-5" y1="0" x2="195" y2="0" stroke="var(--border-strong)" stroke-width="1" />
              <line x1="0" y1="-75" x2="0" y2="75" stroke="var(--border-strong)" stroke-width="1" />
              @for (k of [1, 2, 3, 4, 5]; track k) {
                <line [attr.x1]="k * 32" y1="-75" [attr.x2]="k * 32" y2="75"
                  stroke="var(--border)" stroke-width="0.4" />
              }
              @for (k of [1, 2, 3]; track k) {
                <line x1="0" [attr.y1]="-k * 22" x2="195" [attr.y2]="-k * 22"
                  stroke="var(--border)" stroke-width="0.4" />
                <text x="-4" [attr.y]="-k * 22 + 3" class="tick right">{{ k }}</text>
              }
              <text x="192" y="12" class="axis">t</text>
              <text x="-6" y="-78" class="axis">y</text>

              <!-- Analytic (thick green) -->
              <path [attr.d]="caseAAnalytic()" fill="none" stroke="#5ca878" stroke-width="3" />
              <!-- RK4 (dashed orange) -->
              <path [attr.d]="caseARk4()" fill="none" stroke="#c87b5e"
                stroke-width="1.5" stroke-dasharray="4 3" opacity="0.9" />
              <!-- Euler (purple staircase) -->
              <path [attr.d]="caseAEulerPath()" fill="none" stroke="#8b6aa8" stroke-width="2" />
              @for (pt of caseAEulerPoints(); track $index) {
                <circle
                  [attr.cx]="pt.t * 32"
                  [attr.cy]="-pt.y * 22"
                  r="2.8"
                  fill="#8b6aa8"
                />
              }

              <!-- Initial point -->
              <circle cx="0" [attr.cy]="-y0() * 22" r="4" fill="var(--text)" stroke="white" stroke-width="2" />
            </svg>
            <div class="legend">
              <span class="dot" style="background:#5ca878"></span>公式
              <span class="dot dashed" style="background:#c87b5e"></span>RK4
              <span class="dot" style="background:#8b6aa8"></span>Euler
            </div>
          </div>
          <div class="error-box">
            <span class="err-k">Euler 最大誤差</span>
            <strong [class.err-bad]="caseAMaxError() > 0.8">
              {{ caseAMaxError().toFixed(3) }}
            </strong>
          </div>
        </div>

        <!-- Case B: unsolvable -->
        <div class="case card-b">
          <div class="case-head">
            <span class="tag tag-warn">無封閉解</span>
            <span class="case-title">Case B</span>
          </div>
          <code class="case-eq">dy/dt = sin(ty),  y(0) = {{ y0().toFixed(2) }}</code>
          <div class="formula-line">
            <span class="formula-lead">解析解：</span>
            <code class="formula-big none">不存在初等閉式</code>
          </div>
          <div class="plot-wrap">
            <svg viewBox="-10 -80 200 160" class="plot-svg">
              <line x1="-5" y1="0" x2="195" y2="0" stroke="var(--border-strong)" stroke-width="1" />
              <line x1="0" y1="-75" x2="0" y2="75" stroke="var(--border-strong)" stroke-width="1" />
              @for (k of [1, 2, 3, 4, 5]; track k) {
                <line [attr.x1]="k * 32" y1="-75" [attr.x2]="k * 32" y2="75"
                  stroke="var(--border)" stroke-width="0.4" />
              }
              @for (k of [1, 2, 3]; track k) {
                <line x1="0" [attr.y1]="-k * 22" x2="195" [attr.y2]="-k * 22"
                  stroke="var(--border)" stroke-width="0.4" />
                <text x="-4" [attr.y]="-k * 22 + 3" class="tick right">{{ k }}</text>
              }
              <text x="192" y="12" class="axis">t</text>
              <text x="-6" y="-78" class="axis">y</text>

              <!-- RK4 (reference, thick orange) -->
              <path [attr.d]="caseBRk4()" fill="none" stroke="#c87b5e" stroke-width="2.5" />
              <!-- Euler staircase -->
              <path [attr.d]="caseBEulerPath()" fill="none" stroke="#8b6aa8" stroke-width="2" />
              @for (pt of caseBEulerPoints(); track $index) {
                <circle
                  [attr.cx]="pt.t * 32"
                  [attr.cy]="-pt.y * 22"
                  r="2.8"
                  fill="#8b6aa8"
                />
              }
              <circle cx="0" [attr.cy]="-y0() * 22" r="4" fill="var(--text)" stroke="white" stroke-width="2" />
            </svg>
            <div class="legend">
              <span class="dot" style="background:#c87b5e"></span>RK4 (參考)
              <span class="dot" style="background:#8b6aa8"></span>Euler
              <span class="dash">—</span>公式：不存在
            </div>
          </div>
          <div class="error-box">
            <span class="err-k">Euler vs RK4 最大差</span>
            <strong [class.err-bad]="caseBMaxError() > 0.8">
              {{ caseBMaxError().toFixed(3) }}
            </strong>
          </div>
        </div>
      </div>

      <div class="sliders-panel">
        <div class="sl">
          <span class="sl-lab">y(0) =</span>
          <input type="range" min="0.3" max="3" step="0.05" [value]="y0()"
            (input)="y0.set(+$any($event).target.value)" />
          <span class="sl-val">{{ y0().toFixed(2) }}</span>
        </div>
        <div class="sl">
          <span class="sl-lab">Euler 步長 h =</span>
          <input type="range" min="0.05" max="1.5" step="0.05" [value]="h()"
            (input)="h.set(+$any($event).target.value)" />
          <span class="sl-val">{{ h().toFixed(2) }}</span>
        </div>
        <div class="sl-pills">
          <button class="preset" [class.active]="h() < 0.15" (click)="h.set(0.1)">h=0.1 (細)</button>
          <button class="preset" [class.active]="h() >= 0.15 && h() < 0.6" (click)="h.set(0.4)">h=0.4 (中)</button>
          <button class="preset" [class.active]="h() >= 0.6 && h() < 1.1" (click)="h.set(0.8)">h=0.8 (粗)</button>
          <button class="preset" [class.active]="h() >= 1.1" (click)="h.set(1.4)">h=1.4 (太大)</button>
        </div>

        <div class="hint-line" [class.danger]="caseAMaxError() > 0.8">
          @if (h() < 0.15) {
            ✓ 步長很細，Euler 跟公式幾乎重疊——你「付出多次計算」換到了「高精度」。
          } @else if (h() < 0.6) {
            ⚠ 步長中等，Euler 開始跟公式有可見差距，但趨勢還對。
          } @else if (h() < 1.1) {
            ⚠ 步長大，Euler 顯著偏離——每一步的誤差累積起來。
          } @else {
            ✗ 步長太大，Euler 嚴重偏離真實解——它看起來像個解，但根本不是。這就是「數值方法會騙人」。
          }
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <p>
        那麼——<strong>我們為什麼還要學解析方法</strong>？如果數值總能算，幹嘛學那麼多技巧？
      </p>
      <ul>
        <li><strong>洞察</strong>：公式會告訴你長期行為、對參數的敏感度。純數值做不到。</li>
        <li><strong>精確</strong>：剛才你自己看過——步長選不好，數值會騙人。公式是零誤差的參考答案。</li>
        <li><strong>設計</strong>：工程要<em>設計</em>一個系統（例如「怎麼選 R、C 讓電路穩定？」）不能只靠模擬。</li>
      </ul>
      <p>
        另一方面，數值也不可或缺。現代天氣預報、火箭軌道、神經網路訓練——背後都是大量 ODE／PDE 的數值解。
        Ch4 會正式研究：<em>什麼叫「好的數值解」？誤差有多大？怎麼控制？</em>
      </p>
      <div class="takeaway">
        <p style="margin: 0 0 8px;"><strong>這一節的 take-away：</strong></p>
        <ul style="margin: 0; padding-left: 20px;">
          <li><strong>解析解</strong>：給公式，精確、深刻。但只對少數方程存在。</li>
          <li><strong>數值解</strong>：幾乎對任何方程都管用。但步長太大會騙人。</li>
          <li><strong>RK4</strong>：比 Euler 聰明，用同樣步長做出的誤差小得多（你有看到 RK4 幾乎跟公式重疊，但 Euler 卻漂走）。</li>
        </ul>
      </div>
    </app-prose-block>
  `,
  styles: `
    .key-idea {
      padding: 14px;
      background: var(--accent-10);
      border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0;
      font-size: 15px;
      margin: 12px 0;
    }

    .takeaway {
      padding: 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      font-size: 14px;
    }

    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      background: var(--accent-10);
      padding: 1px 6px;
      border-radius: 4px;
      color: var(--accent);
    }

    .case-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 14px;
    }

    @media (max-width: 640px) {
      .case-grid { grid-template-columns: 1fr; }
    }

    .case {
      padding: 12px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .card-a { border-color: rgba(92, 168, 120, 0.35); }
    .card-b { border-color: rgba(200, 123, 94, 0.35); }

    .case-head {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }

    .tag {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .tag-ok { background: rgba(92, 168, 120, 0.15); color: #5ca878; }
    .tag-warn { background: rgba(200, 123, 94, 0.15); color: #c87b5e; }

    .case-title { font-size: 12px; font-weight: 600; color: var(--text-muted); }

    .case-eq {
      display: block;
      font-size: 12px;
      padding: 6px 10px;
      margin-bottom: 10px;
      background: var(--bg-surface);
      color: var(--text);
    }

    .formula-line { margin-bottom: 10px; }

    .formula-lead {
      display: block;
      font-size: 11px;
      color: var(--text-muted);
      margin-bottom: 3px;
    }

    .formula-big {
      display: block;
      font-size: 15px;
      font-family: 'JetBrains Mono', monospace;
      padding: 6px 10px;
      text-align: center;
      color: #5ca878;
      background: rgba(92, 168, 120, 0.08);
      border: 1px dashed rgba(92, 168, 120, 0.3);
    }

    .formula-big.none {
      color: #c87b5e;
      background: rgba(200, 123, 94, 0.08);
      border-color: rgba(200, 123, 94, 0.3);
      font-style: italic;
    }

    .plot-wrap { margin-bottom: 8px; }
    .plot-svg { width: 100%; display: block; }

    .tick {
      font-size: 9px;
      fill: var(--text-muted);
      text-anchor: middle;
      font-family: 'JetBrains Mono', monospace;
    }
    .tick.right { text-anchor: end; }

    .axis {
      font-size: 11px;
      fill: var(--text-muted);
      font-family: 'Noto Sans Math', serif;
      font-style: italic;
    }

    .legend {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 4px;
      flex-wrap: wrap;
    }

    .legend .dot {
      display: inline-block;
      width: 10px;
      height: 3px;
      border-radius: 2px;
      margin-right: 2px;
    }

    .legend .dot.dashed {
      background-image: linear-gradient(to right, #c87b5e 50%, transparent 50%);
      background-size: 4px 3px;
      background-color: transparent !important;
    }

    .legend .dash {
      font-family: 'JetBrains Mono', monospace;
      color: var(--text-muted);
    }

    .error-box {
      margin-top: 8px;
      padding: 6px 10px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 12px;
    }

    .err-k { color: var(--text-muted); }

    .error-box strong {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      color: var(--text);
    }

    .error-box strong.err-bad { color: #c87b5e; }

    .sliders-panel {
      padding: 14px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg-surface);
    }

    .sl {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    .sl-lab {
      font-size: 13px;
      font-weight: 700;
      color: var(--accent);
      min-width: 90px;
      font-family: 'Noto Sans Math', serif;
    }

    .sl input { flex: 1; accent-color: var(--accent); }

    .sl-val {
      font-size: 13px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--text);
      min-width: 44px;
      text-align: right;
    }

    .sl-pills {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }

    .preset {
      font: inherit;
      font-size: 11px;
      padding: 4px 10px;
      border: 1px solid var(--border);
      background: var(--bg);
      border-radius: 14px;
      cursor: pointer;
      color: var(--text-muted);
      transition: all 0.12s;
    }

    .preset:hover { border-color: var(--accent); }
    .preset.active {
      border-color: var(--accent);
      background: var(--accent-10);
      color: var(--accent);
      font-weight: 600;
    }

    .hint-line {
      font-size: 12px;
      padding: 8px 10px;
      border-radius: 6px;
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text-secondary);
    }

    .hint-line.danger {
      border-color: rgba(200, 123, 94, 0.4);
      background: rgba(200, 123, 94, 0.06);
      color: var(--text);
    }
  `,
})
export class DeCh1AnalyticVsNumericalComponent {
  readonly y0 = signal(1.0);
  readonly h = signal(0.4);

  // Case A — analytic
  readonly caseAAnalytic = computed(() =>
    analyticPath((t) => this.y0() * Math.exp(t), 0, T_END, 150),
  );

  // Case A — RK4 (reference, fine)
  readonly caseARk4 = computed(() =>
    rk4Path((_t, y) => y, this.y0(), 0, T_END, 200),
  );

  // Case A — Euler with user step
  readonly caseAEulerPoints = computed(() =>
    eulerPoints((_t, y) => y, this.y0(), 0, T_END, this.h()),
  );

  readonly caseAEulerPath = computed(() => eulerPathD(this.caseAEulerPoints()));

  readonly caseAMaxError = computed(() => {
    const pts = this.caseAEulerPoints();
    let maxErr = 0;
    for (const pt of pts) {
      const truth = this.y0() * Math.exp(pt.t);
      const err = Math.abs(pt.y - truth);
      if (err > maxErr) maxErr = err;
    }
    return maxErr;
  });

  // Case B — RK4 reference (fine, treat as truth)
  readonly caseBRk4 = computed(() =>
    rk4Path((t, y) => Math.sin(t * y), this.y0(), 0, T_END, 500),
  );

  readonly caseBEulerPoints = computed(() =>
    eulerPoints((t, y) => Math.sin(t * y), this.y0(), 0, T_END, this.h()),
  );

  readonly caseBEulerPath = computed(() => eulerPathD(this.caseBEulerPoints()));

  readonly caseBMaxError = computed(() => {
    // Compute RK4 reference at each Euler step t, compare
    const pts = this.caseBEulerPoints();
    const h = 0.01;
    let t = 0;
    let y = this.y0();
    let ptIdx = 0;
    let maxErr = 0;
    const f = (tt: number, yy: number) => Math.sin(tt * yy);
    while (ptIdx < pts.length) {
      // Advance RK4 to pts[ptIdx].t
      while (t < pts[ptIdx].t - 1e-9) {
        const step = Math.min(h, pts[ptIdx].t - t);
        const k1 = f(t, y);
        const k2 = f(t + step / 2, y + (step / 2) * k1);
        const k3 = f(t + step / 2, y + (step / 2) * k2);
        const k4 = f(t + step, y + step * k3);
        y = y + (step / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
        t = t + step;
        if (!isFinite(y)) break;
      }
      const err = Math.abs(pts[ptIdx].y - y);
      if (err > maxErr && isFinite(err)) maxErr = err;
      ptIdx++;
    }
    return maxErr;
  });
}
