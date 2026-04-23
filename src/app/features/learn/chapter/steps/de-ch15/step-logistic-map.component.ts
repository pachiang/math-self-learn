import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

/** Logistic map x_{n+1} = r x_n (1 - x_n) */
function iterate(r: number, x0: number, skip: number, keep: number): number[] {
  let x = x0;
  for (let i = 0; i < skip; i++) x = r * x * (1 - x);
  const arr: number[] = [];
  for (let i = 0; i < keep; i++) {
    x = r * x * (1 - x);
    arr.push(x);
  }
  return arr;
}

@Component({
  selector: 'app-de-ch15-logistic',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Logistic map：離散的混沌路徑" subtitle="§15.4">
      <p>
        連續 Lorenz 看起來很奇幻，但最簡單的混沌其實是一條<strong>離散</strong>遞迴：
      </p>
      <div class="centered-eq big">
        x_{{ '{n+1}' }} = r · x_n · (1 − x_n),&nbsp;&nbsp; r ∈ [0, 4], x₀ ∈ (0, 1)
      </div>
      <p>
        這是 Ch3 Logistic 族群模型的離散版。
        隨 r 增加，行為從固定點、到週期 2、4、8、16、⋯⋯ 最終混沌。
      </p>

      <h4>週期倍增的費根鮑姆常數</h4>
      <p>
        週期 2<sup>n</sup> 誕生的 r 值記為 rₙ。費根鮑姆發現：
      </p>
      <div class="centered-eq">
        δ = lim (r<sub>n−1</sub> − r<sub>n−2</sub>) / (r<sub>n</sub> − r<sub>n−1</sub>) ≈ 4.66920160910299⋯
      </div>
      <p>
        更神奇：<strong>這個常數對所有「單峰映射」（一個極大值的 f）都成立</strong>——
        logistic、sin(πx)、任何光滑的駝峰都給出同一個 δ。
        這就是<strong>混沌的普適性 (universality)</strong>。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="滑動 r：看分岔與週期倍增">
      <div class="two-panel">
        <div class="panel">
          <div class="p-title">軌跡 x_n 的時間序列（n = 1⋯100，已丟前 500 項）</div>
          <svg viewBox="-10 -10 420 120" class="t-svg">
            <line x1="0" y1="100" x2="400" y2="100" stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" y1="0" x2="0" y2="100" stroke="var(--border-strong)" stroke-width="1" />
            <text x="-4" y="10" class="tk" text-anchor="end">1</text>
            <text x="-4" y="104" class="tk" text-anchor="end">0</text>
            @for (p of timePoints(); track $index) {
              <circle [attr.cx]="p.x" [attr.cy]="p.y" r="1.6" fill="var(--accent)" opacity="0.8" />
            }
          </svg>
        </div>

        <div class="panel">
          <div class="p-title">
            分岔圖（{{ rVal().toFixed(3) }} 所在處）
          </div>
          <svg viewBox="-10 -10 420 160" class="b-svg">
            <rect x="0" y="0" width="400" height="150" fill="var(--bg)" />
            @for (p of bifPoints(); track p.id) {
              <circle [attr.cx]="p.x" [attr.cy]="p.y" r="0.5" [attr.fill]="p.color" />
            }
            <!-- r marker -->
            <line [attr.x1]="((rVal() - 2.5) / 1.5) * 400" y1="0" [attr.x2]="((rVal() - 2.5) / 1.5) * 400" y2="150"
              stroke="var(--accent)" stroke-width="1.2" />
            <text x="-4" y="10" class="tk" text-anchor="end">1</text>
            <text x="-4" y="149" class="tk" text-anchor="end">0</text>
            <text x="4" y="164" class="tk">r=2.5</text>
            <text x="396" y="164" class="tk" text-anchor="end">r=4.0</text>
          </svg>
        </div>
      </div>

      <div class="ctrl">
        <div class="sl">
          <span class="sl-lab">r</span>
          <input type="range" min="0.5" max="4" step="0.002" [value]="rVal()"
            (input)="rVal.set(+$any($event).target.value)" />
          <span class="sl-val">{{ rVal().toFixed(3) }}</span>
        </div>
        <div class="presets">
          <button class="pre" (click)="rVal.set(2.5)">r=2.5 (週期 1)</button>
          <button class="pre" (click)="rVal.set(3.2)">r=3.2 (週期 2)</button>
          <button class="pre" (click)="rVal.set(3.5)">r=3.5 (週期 4)</button>
          <button class="pre" (click)="rVal.set(3.55)">r=3.55 (週期 8)</button>
          <button class="pre" (click)="rVal.set(3.828)">r=3.828 (週期 3)</button>
          <button class="pre" (click)="rVal.set(3.9)">r=3.9 (混沌)</button>
        </div>
      </div>

      <div class="verdict" [attr.data-reg]="regime()">
        @if (regime() === 'fixed') {
          <strong>r &lt; 3：</strong> 單一固定點吸引所有軌跡。
        } @else if (regime() === 'p2') {
          <strong>3 &lt; r &lt; 3.449：</strong> 週期 2——軌跡在兩個值間交替。
        } @else if (regime() === 'p4') {
          <strong>3.449 &lt; r &lt; 3.544：</strong> 週期 4。
        } @else if (regime() === 'p8plus') {
          <strong>~3.544 &lt; r &lt; 3.57：</strong> 週期 8、16、⋯ 迅速倍增到混沌。
        } @else if (regime() === 'chaos') {
          <strong>r ≈ 3.9：</strong> 混沌。軌跡看似隨機、不重複。
        } @else {
          <strong>特殊窗口：</strong> 混沌之海中的週期島（如 r = 3.828 的週期 3）。
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>Sharkovsky 定理：週期 3 ⇒ 一切週期都存在</h4>
      <p>
        1964 年，Sharkovsky 證明：對任何連續 f : [0,1] → [0,1]，
        如果存在<strong>週期 3 的軌道</strong>，那麼<strong>所有週期都存在</strong>。
        這就是著名的「Period 3 implies chaos」。
      </p>

      <h4>普適性 = 重整化群</h4>
      <p>
        費根鮑姆常數 δ 不依賴特定映射的細節——它是所有「倍增通往混沌」系統的
        <strong>內在幾何常數</strong>。這跟統計物理的「臨界現象」使用相同的數學工具（重整化群）。
        這是 20 世紀後半混沌理論最深刻的洞見之一。
      </p>

      <p class="takeaway">
        <strong>take-away：</strong>
        混沌不需要 3 個維度——<strong>一條一維遞迴就夠了</strong>。
        週期倍增、普適常數、週期窗口，一切都存在這條簡單公式中。
        下一節收尾整個微分方程課程。
      </p>
    </app-prose-block>
  `,
  styles: `
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }
    .centered-eq { text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 14px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0; }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 4px; }

    .two-panel { display: grid; gap: 8px; }
    .panel { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .p-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .t-svg, .b-svg { width: 100%; display: block; }
    .tk { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .sl { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .sl-lab { font-size: 14px; color: var(--accent); font-weight: 700; min-width: 20px; font-family: 'Noto Sans Math', serif; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 56px; text-align: right; }
    .presets { display: flex; gap: 4px; flex-wrap: wrap; }
    .pre { font: inherit; font-size: 10px; padding: 4px 8px; border: 1px solid var(--border); background: var(--bg); border-radius: 12px; cursor: pointer; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .pre:hover { border-color: var(--accent); color: var(--accent); }

    .verdict { padding: 12px; border-radius: 8px; font-size: 13px; margin-top: 10px; line-height: 1.6; }
    .verdict[data-reg='fixed'] { background: rgba(92, 168, 120, 0.1); color: #5ca878; }
    .verdict[data-reg='p2'], .verdict[data-reg='p4'] { background: rgba(90, 138, 168, 0.1); color: #5a8aa8; }
    .verdict[data-reg='p8plus'] { background: rgba(244, 200, 102, 0.1); color: #ba8d2a; }
    .verdict[data-reg='chaos'], .verdict[data-reg='window'] { background: rgba(200, 123, 94, 0.1); color: #c87b5e; }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class DeCh15LogisticComponent {
  readonly rVal = signal(3.55);

  readonly regime = computed(() => {
    const r = this.rVal();
    if (r < 3) return 'fixed';
    if (Math.abs(r - 3.828) < 0.02) return 'window';
    if (r < 3.449) return 'p2';
    if (r < 3.544) return 'p4';
    if (r < 3.57) return 'p8plus';
    return 'chaos';
  });

  readonly timePoints = computed(() => {
    const r = this.rVal();
    const seq = iterate(r, 0.5, 500, 100);
    return seq.map((x, i) => ({ x: (i / 100) * 400, y: (1 - x) * 100 }));
  });

  readonly bifPoints = computed(() => {
    // Sample r from 2.5 to 4.0, iterate and plot last attractor points
    const rMin = 2.5;
    const rMax = 4.0;
    const NR = 300;
    const out: Array<{ id: string; x: number; y: number; color: string }> = [];
    for (let i = 0; i < NR; i++) {
      const rr = rMin + ((rMax - rMin) * i) / NR;
      const vals = iterate(rr, 0.5, 400, 60);
      for (let k = 0; k < vals.length; k++) {
        const px = (i / NR) * 400;
        const py = (1 - vals[k]) * 150;
        out.push({ id: `${i}_${k}`, x: px, y: py, color: 'var(--accent)' });
      }
    }
    return out;
  });
}
