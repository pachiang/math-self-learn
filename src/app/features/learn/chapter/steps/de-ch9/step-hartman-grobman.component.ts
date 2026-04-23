import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

/**
 * Pendulum nonlinear: dθ/dt = ω, dω/dt = -sin θ
 * Around (0, 0): linearization gives dθ/dt = ω, dω/dt = -θ (circles)
 */
function pendulumF(x: number, y: number): [number, number] {
  return [y, -Math.sin(x)];
}

/** Linearized at (0, 0): Jacobian = [[0, 1], [-1, 0]] */
function pendulumLinearF(x: number, y: number): [number, number] {
  return [y, -x];
}

function integrate(
  f: (x: number, y: number) => [number, number],
  x0: [number, number],
  tMax: number,
  dir: 1 | -1,
  dt = 0.02,
): Array<[number, number]> {
  const pts: Array<[number, number]> = [x0];
  let x = x0[0], y = x0[1];
  const h = dt * dir;
  const n = Math.ceil(tMax / dt);
  for (let i = 0; i < n; i++) {
    const [k1x, k1y] = f(x, y);
    const [k2x, k2y] = f(x + (h / 2) * k1x, y + (h / 2) * k1y);
    const [k3x, k3y] = f(x + (h / 2) * k2x, y + (h / 2) * k2y);
    const [k4x, k4y] = f(x + h * k3x, y + h * k3y);
    x += (h / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
    y += (h / 6) * (k1y + 2 * k2y + 2 * k3y + k4y);
    if (!isFinite(x) || !isFinite(y)) break;
    pts.push([x, y]);
  }
  return pts;
}

@Component({
  selector: 'app-de-ch9-hartman',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="Hartman-Grobman 定理" subtitle="§9.3">
      <p>
        上一節你已經「直覺上」在用它了——算出 Jacobian 後，直接把它當 A 用 Ch8 分類。
        這一節正式聲明為什麼這是合法的。
      </p>
      <p class="key-idea">
        <strong>Hartman-Grobman 定理</strong>：在<strong>雙曲平衡點</strong>附近
        （Re(λ) ≠ 0，即 Jacobian 的特徵值實部都非零），
        非線性系統的流動在<strong>拓撲上等價於</strong>它的線性化系統的流動。
      </p>
      <p>
        「拓撲等價」聽起來嚇人，直白講就是：
      </p>
      <ul>
        <li>軌跡的<strong>定性行為</strong>完全相同（都是螺旋、都是鞍點、都是節點）</li>
        <li>定性類型一樣：穩定<strong>焦點</strong>周圍的非線性軌跡看起來也像穩定<strong>焦點</strong></li>
        <li>會有連續彎曲——幾何細節差，但<strong>拓撲結構</strong>（軌跡怎麼連接、平衡點的類型）完全一樣</li>
      </ul>
      <p>
        重要但要小心的例外：
      </p>
      <div class="warning">
        <strong>⚠ 中心（Re(λ) = 0）不適用</strong>：如果線性化給出「中心」——純虛特徵值——
        Hartman-Grobman 不保證非線性系統也是中心。
        可能變成穩定焦點、不穩定焦點、或仍是中心。
        必須用高階分析（Lyapunov 函數、流形理論）才能判斷。
      </div>
    </app-prose-block>

    <app-challenge-card prompt="放大鐘擺 (0, 0) 附近的相肖像 → 看它跟線性化是否真的「一樣」">
      <div class="zoom-grid">
        <div class="zoom-col">
          <div class="zoom-head">
            非線性系統
            <code class="small">θ′ = ω, ω′ = −sin θ</code>
          </div>
          <svg [attr.viewBox]="viewBox()" class="zoom-svg">
            <!-- Grid -->
            @for (g of [-2, -1, 1, 2]; track g) {
              <line [attr.x1]="g * 40" [attr.y1]="-80 * zoomScale()" [attr.x2]="g * 40" [attr.y2]="80 * zoomScale()"
                stroke="var(--border)" stroke-width="0.3" opacity="0.4" />
              <line [attr.x1]="-80 * zoomScale()" [attr.y1]="-g * 40" [attr.x2]="80 * zoomScale()" [attr.y2]="-g * 40"
                stroke="var(--border)" stroke-width="0.3" opacity="0.4" />
            }
            <line [attr.x1]="-80 * zoomScale()" y1="0" [attr.x2]="80 * zoomScale()" y2="0"
              stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" [attr.y1]="-80 * zoomScale()" x2="0" [attr.y2]="80 * zoomScale()"
              stroke="var(--border-strong)" stroke-width="1" />

            <!-- Trajectories from nonlinear system -->
            @for (tr of nonlinearTrajectories(); track $index) {
              <path [attr.d]="tr" fill="none"
                stroke="var(--accent)" stroke-width="1.5" opacity="0.85" />
            }

            <!-- Origin marker -->
            <circle cx="0" cy="0" r="4" fill="#8b6aa8" stroke="white" stroke-width="1.5" />
          </svg>
        </div>

        <div class="zoom-col">
          <div class="zoom-head">
            線性化（Jacobian 在 (0,0)）
            <code class="small">θ′ = ω, ω′ = −θ</code>
          </div>
          <svg [attr.viewBox]="viewBox()" class="zoom-svg">
            @for (g of [-2, -1, 1, 2]; track g) {
              <line [attr.x1]="g * 40" [attr.y1]="-80 * zoomScale()" [attr.x2]="g * 40" [attr.y2]="80 * zoomScale()"
                stroke="var(--border)" stroke-width="0.3" opacity="0.4" />
              <line [attr.x1]="-80 * zoomScale()" [attr.y1]="-g * 40" [attr.x2]="80 * zoomScale()" [attr.y2]="-g * 40"
                stroke="var(--border)" stroke-width="0.3" opacity="0.4" />
            }
            <line [attr.x1]="-80 * zoomScale()" y1="0" [attr.x2]="80 * zoomScale()" y2="0"
              stroke="var(--border-strong)" stroke-width="1" />
            <line x1="0" [attr.y1]="-80 * zoomScale()" x2="0" [attr.y2]="80 * zoomScale()"
              stroke="var(--border-strong)" stroke-width="1" />

            @for (tr of linearTrajectories(); track $index) {
              <path [attr.d]="tr" fill="none"
                stroke="#5a8aa8" stroke-width="1.5" opacity="0.85" />
            }

            <circle cx="0" cy="0" r="4" fill="#8b6aa8" stroke="white" stroke-width="1.5" />
          </svg>
        </div>
      </div>

      <div class="zoom-ctrl">
        <span class="zc-lab">放大倍率：</span>
        <input type="range" min="1" max="10" step="0.1"
          [value]="zoomScale()" (input)="zoomScale.set(+$any($event).target.value)" />
        <span class="zc-val">×{{ zoomScale().toFixed(1) }}</span>
      </div>

      <div class="observation" [attr.data-level]="zoomScale() > 5 ? 'close' : zoomScale() > 2 ? 'mid' : 'far'">
        @if (zoomScale() > 5) {
          🔬 <strong>放大後</strong>：兩張圖軌跡幾乎重疊——Hartman-Grobman 保證了這件事。
          非線性的「彎曲」在小尺度下可以忽略。
        } @else if (zoomScale() > 2) {
          兩張圖定性相似，但非線性已有可見的變形。
        } @else {
          <strong>廣域視野</strong>：非線性有週期結構（sin θ 的週期性），線性近似在 θ ≈ ±π 附近完全失準。
          Hartman-Grobman 只保證<em>局部</em>相似。
        }
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h3>非線性 vs 線性：定性相同、定量不同</h3>
      <p>
        <strong>Hartman-Grobman 保證了「拓撲等價」——軌跡的類型、連接關係、穩定性相同</strong>。
        這是個強大的承諾：Ch8 學的所有分類（穩定/不穩定節點、焦點、鞍點）<strong>自動轉移</strong>到非線性世界的平衡點附近。
      </p>
      <p>
        但它<strong>不保證</strong>：
      </p>
      <ul>
        <li><strong>精確的軌跡形狀</strong>：非線性的「橢圓」可能是歪曲的蛋形。</li>
        <li><strong>遠離平衡點的行為</strong>：局部定理就是局部。走遠了要另外分析。</li>
        <li><strong>中心</strong>：線性化是中心時，非線性可能完全不同（下一節 Lotka-Volterra 就是個幸運例外）。</li>
      </ul>

      <div class="practical">
        <h4>實務意義</h4>
        <p>
          研究非線性系統的標準流程——完全來自這個定理：
        </p>
        <ol>
          <li>找所有平衡點 (x*, y*)。</li>
          <li>在每個平衡點算 Jacobian J(x*, y*)。</li>
          <li>用 trace-det 分類 J，判斷平衡點類型。</li>
          <li>組合所有平衡點的局部資訊，拼出全域相肖像的「骨架」。</li>
        </ol>
      </div>

      <p class="takeaway">
        <strong>這一節的 take-away：</strong>
        Hartman-Grobman 定理確認：<strong>局部線性化是合法的</strong>。
        Ch8 的工具在非線性世界仍然有效，但只在「每個平衡點附近」。
        下面三節用三個經典案例看這套方法的威力（以及中心的微妙例外）。
      </p>
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

    .warning {
      padding: 12px 14px;
      background: rgba(200, 123, 94, 0.08);
      border: 1px solid rgba(200, 123, 94, 0.35);
      border-radius: 8px;
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.7;
      margin: 12px 0;
    }

    .warning strong { color: #c87b5e; }

    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      background: var(--accent-10);
      padding: 1px 6px;
      border-radius: 4px;
      color: var(--accent);
    }

    code.small { font-size: 11px; }

    .zoom-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 12px;
    }

    @media (max-width: 600px) {
      .zoom-grid { grid-template-columns: 1fr; }
    }

    .zoom-col {
      padding: 10px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--bg);
    }

    .zoom-head {
      font-size: 11px;
      color: var(--text-muted);
      text-align: center;
      margin-bottom: 6px;
      font-family: 'JetBrains Mono', monospace;
    }

    .zoom-svg {
      width: 100%;
      display: block;
    }

    .zoom-ctrl {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      background: var(--bg-surface);
      border-radius: 8px;
      margin-bottom: 10px;
    }

    .zc-lab {
      font-size: 13px;
      font-weight: 700;
      color: var(--accent);
    }

    .zoom-ctrl input { flex: 1; accent-color: var(--accent); }

    .zc-val {
      font-size: 13px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--accent);
      min-width: 50px;
      text-align: right;
    }

    .observation {
      padding: 12px 14px;
      border-radius: 8px;
      font-size: 13px;
      line-height: 1.7;
    }

    .observation[data-level='far'] {
      background: rgba(200, 123, 94, 0.08);
      border: 1px solid rgba(200, 123, 94, 0.3);
      color: var(--text-secondary);
    }

    .observation[data-level='mid'] {
      background: rgba(244, 200, 102, 0.08);
      border: 1px solid rgba(244, 200, 102, 0.3);
      color: var(--text-secondary);
    }

    .observation[data-level='close'] {
      background: rgba(92, 168, 120, 0.08);
      border: 1px solid rgba(92, 168, 120, 0.3);
      color: var(--text-secondary);
    }

    .observation strong { color: var(--text); }

    h3 {
      font-size: 16px;
      color: var(--accent);
      margin: 16px 0 8px;
    }

    .practical {
      padding: 14px;
      background: var(--accent-10);
      border: 1px solid var(--accent-30);
      border-radius: 10px;
      margin: 12px 0;
    }

    .practical h4 {
      margin: 0 0 8px;
      font-size: 14px;
      color: var(--accent);
    }

    .practical p {
      margin: 0 0 8px;
      font-size: 13px;
      color: var(--text-secondary);
    }

    .practical ol {
      margin: 0;
      padding-left: 22px;
      font-size: 13px;
      line-height: 1.8;
      color: var(--text-secondary);
    }
  `,
})
export class DeCh9HartmanComponent {
  readonly zoomScale = signal(2.5);

  readonly viewBox = computed(() => {
    const half = 100 / this.zoomScale();
    return `-${half} -${half} ${half * 2} ${half * 2}`;
  });

  readonly nonlinearTrajectories = computed(() =>
    this.buildTrajectories(pendulumF)
  );

  readonly linearTrajectories = computed(() =>
    this.buildTrajectories(pendulumLinearF)
  );

  private buildTrajectories(f: (x: number, y: number) => [number, number]): string[] {
    const halfRange = 2.2 / this.zoomScale();
    const ics: Array<[number, number]> = [];
    // Drop 6 initial conditions forming concentric "shells"
    const n = 6;
    for (let i = 1; i <= n; i++) {
      const r = (i / n) * halfRange * 0.85;
      // Multiple angles for each radius to get rich coverage
      ics.push([r, 0]);
      ics.push([0, r]);
      ics.push([-r, 0]);
      ics.push([0, -r]);
    }

    return ics.map((ic) => {
      const fwd = integrate(f, ic, 10 / this.zoomScale(), 1, 0.01);
      const all = fwd;
      return all
        .map(([x, y], i) => {
          const xc = x * 40;
          const yc = -y * 40;
          return `${i === 0 ? 'M' : 'L'} ${xc.toFixed(1)} ${yc.toFixed(1)}`;
        })
        .join(' ');
    });
  }
}
