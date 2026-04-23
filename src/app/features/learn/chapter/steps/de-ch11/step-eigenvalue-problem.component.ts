import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

@Component({
  selector: 'app-de-ch11-eigenvalue',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="本徵值問題：弦的振動與其類比" subtitle="§11.2">
      <p>
        承接 §11.1，把 BVP 寫成本徵值問題的標準形式：
      </p>
      <div class="centered-eq big">
        −y″ = λ·y,&nbsp;&nbsp;y(0) = 0,&nbsp;&nbsp;y(L) = 0
      </div>
      <p>
        解有三種情況，由 λ 的符號決定。讓我們逐一檢視。
      </p>
    </app-prose-block>

    <app-challenge-card prompt="滑動 λ：看三個情況與本徵值的「共振」">
      <div class="lambda-controls">
        <div class="sl">
          <span class="sl-lab">λ</span>
          <input type="range" [min]="-20" [max]="100" step="0.2" [value]="lambda()"
            (input)="lambda.set(+$any($event).target.value)" />
          <span class="sl-val">{{ lambda().toFixed(1) }}</span>
        </div>
        <div class="case-tabs">
          <button class="case-pill" [class.active]="caseType() === 'neg'" (click)="lambda.set(-5)">λ&lt;0</button>
          <button class="case-pill" [class.active]="caseType() === 'zero'" (click)="lambda.set(0)">λ=0</button>
          <button class="case-pill" [class.active]="caseType() === 'pos'" (click)="lambda.set(20)">λ&gt;0</button>
        </div>
        <div class="presets">
          <span class="pre-lab">跳到本徵值：</span>
          @for (n of [1, 2, 3, 4]; track n) {
            <button class="pre" (click)="jumpToEig(n)">λ_{{ n }}</button>
          }
        </div>
      </div>

      <div class="plot">
        <div class="plot-title">候選解在 [0, L=π] 的行為</div>
        <svg viewBox="-20 -90 440 170" class="plot-svg">
          <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-85" x2="0" y2="75" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="400" y1="-85" x2="400" y2="75" stroke="#ba8d2a" stroke-width="1.2" stroke-dasharray="3 2" />
          <text x="-4" y="14" class="tick">0</text>
          <text x="400" y="14" class="tick" text-anchor="middle">π</text>
          <text x="-4" y="-85" class="ax" text-anchor="end">y</text>

          <!-- Solution satisfying y(0)=0, y'(0)=1 -->
          <path [attr.d]="solPath()" fill="none" stroke="var(--accent)" stroke-width="2.4" />

          <!-- Highlight endpoint value -->
          <circle cx="400" [attr.cy]="-endY() * 40" r="4" fill="var(--accent)" stroke="white" stroke-width="1.5" />
        </svg>
      </div>

      <div class="verdict-box" [attr.data-case]="caseType()">
        @if (caseType() === 'neg') {
          <strong>λ &lt; 0（指數增長）：</strong> 解 = sinh(√|λ|·x)，在 x=L 不會再回到零 → <strong>無非平凡解</strong>。
        } @else if (caseType() === 'zero') {
          <strong>λ = 0（線性）：</strong> 解 = x，在 x=L 顯然 ≠ 0 → <strong>無非平凡解</strong>。
        } @else if (isEigenvalue()) {
          <strong>λ 剛好是本徵值！</strong> 解 = sin(√λ·x) 擊中 x=L 的零點 → <strong>有非平凡解 y_n(x)</strong>。
        } @else {
          <strong>λ &gt; 0 但不是本徵值：</strong> 解振盪，但 x=L 沒落在零點 → <strong>只有平凡解</strong>。
        }
      </div>

      <div class="eig-table">
        <div class="eig-title">前幾個本徵對 (L = π)：</div>
        <div class="eig-grid">
          @for (n of [1, 2, 3, 4, 5]; track n) {
            <div class="eig-cell">
              <div class="eig-n">n = {{ n }}</div>
              <div class="eig-lam">λ_n = {{ n * n }}</div>
              <div class="eig-y">y_n = sin({{ n }}x)</div>
            </div>
          }
        </div>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>為什麼叫「本徵」（eigen-）？</h4>
      <p>
        把 <code>−d²/dx²</code> 看成一個線性算子 <strong>L</strong>（作用在滿足邊界條件的函數空間上），
        那 <code>Ly = λy</code> 就是線性代數裡的<strong>特徵方程</strong>——只是現在「矩陣」是微分算子、
        「向量」是函數。
      </p>
      <div class="analogy">
        <div class="analogy-row">
          <div class="lin">線性代數：Av = λv</div>
          <div class="arrow">↔</div>
          <div class="ode">ODE：L[y] = λy + BC</div>
        </div>
        <div class="analogy-row">
          <div class="lin">特徵向量 vₙ</div>
          <div class="arrow">↔</div>
          <div class="ode">本徵函數 yₙ(x)</div>
        </div>
        <div class="analogy-row">
          <div class="lin">對稱 A：vₙ 互相正交</div>
          <div class="arrow">↔</div>
          <div class="ode">「自伴」L：yₙ 互相正交</div>
        </div>
      </div>

      <p class="takeaway">
        <strong>take-away：</strong>
        BVP = 微分算子的特徵方程。λₙ 是允許的頻率/能量，yₙ 是對應的形狀。
        下一節用<strong>正交性</strong>把這套對應真正跟 Fourier 掛鉤。
      </p>
    </app-prose-block>
  `,
  styles: `
    .centered-eq {
      text-align: center; padding: 12px; background: var(--accent-10); border-radius: 8px;
      font-size: 15px; font-family: 'JetBrains Mono', monospace; color: var(--accent); font-weight: 600; margin: 10px 0;
    }
    .centered-eq.big { font-size: 17px; padding: 14px; }
    code { font-family: 'JetBrains Mono', monospace; font-size: 13px; background: var(--accent-10); padding: 1px 6px; border-radius: 4px; color: var(--accent); }

    .lambda-controls { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; }
    .sl { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .sl-lab { font-size: 14px; color: var(--accent); font-weight: 700; min-width: 30px; font-family: 'Noto Sans Math', serif; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 50px; text-align: right; }

    .case-tabs { display: flex; gap: 6px; margin-bottom: 8px; }
    .case-pill {
      font: inherit; font-size: 12px; padding: 5px 12px;
      background: var(--bg); border: 1px solid var(--border); border-radius: 14px;
      cursor: pointer; color: var(--text-muted);
    }
    .case-pill.active { background: var(--accent); border-color: var(--accent); color: white; }
    .case-pill:hover:not(.active) { border-color: var(--accent); color: var(--accent); }

    .presets { display: flex; gap: 4px; align-items: center; flex-wrap: wrap; }
    .pre-lab { font-size: 12px; color: var(--text-muted); }
    .pre { font: inherit; font-size: 11px; font-family: 'JetBrains Mono', monospace;
      padding: 4px 10px; border: 1px solid var(--border); background: var(--bg);
      border-radius: 12px; cursor: pointer; color: var(--text-muted); }
    .pre:hover { border-color: var(--accent); color: var(--accent); }

    .plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .plot-title { font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 4px; }
    .plot-svg { width: 100%; display: block; }
    .ax { font-size: 11px; fill: var(--text-muted); font-style: italic; }
    .tick { font-size: 9px; fill: var(--text-muted); text-anchor: end; font-family: 'JetBrains Mono', monospace; }

    .verdict-box { padding: 12px 14px; border-radius: 8px; font-size: 13px; margin-top: 10px; line-height: 1.6; }
    .verdict-box[data-case='neg'] { background: rgba(200, 123, 94, 0.1); color: #c87b5e; }
    .verdict-box[data-case='zero'] { background: rgba(244, 200, 102, 0.1); color: #ba8d2a; }
    .verdict-box[data-case='pos'] { background: rgba(92, 168, 120, 0.1); color: #5ca878; }
    .verdict-box strong { font-weight: 700; }

    .eig-table { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-top: 10px; }
    .eig-title { font-size: 13px; color: var(--text-muted); margin-bottom: 6px; }
    .eig-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 6px; }
    .eig-cell { padding: 6px 8px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; text-align: center; }
    .eig-n { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
    .eig-lam { font-size: 13px; font-weight: 700; color: var(--accent); font-family: 'JetBrains Mono', monospace; margin: 2px 0; }
    .eig-y { font-size: 11px; color: var(--text-secondary); font-family: 'JetBrains Mono', monospace; }

    h4 { color: var(--accent); font-size: 15px; margin: 12px 0 6px; }
    .analogy { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin: 8px 0; }
    .analogy-row { display: grid; grid-template-columns: 1fr 40px 1fr; gap: 10px; align-items: center; padding: 6px 0; font-size: 13px; }
    .analogy-row + .analogy-row { border-top: 1px dashed var(--border); }
    .lin { text-align: right; color: var(--text-secondary); }
    .arrow { text-align: center; color: var(--accent); font-weight: 700; }
    .ode { color: var(--accent); font-weight: 600; }

    .takeaway { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; font-size: 14px; }
  `,
})
export class DeCh11EigenvalueComponent {
  readonly lambda = signal(4);
  readonly L = Math.PI;

  readonly caseType = computed(() => {
    const l = this.lambda();
    if (l < -0.01) return 'neg';
    if (l < 0.01) return 'zero';
    return 'pos';
  });

  readonly isEigenvalue = computed(() => {
    const l = this.lambda();
    if (l < 0) return false;
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      if (Math.abs(l - n * n) < 0.3) return true;
    }
    return false;
  });

  readonly endY = computed(() => {
    // solution of -y'' = λy, y(0)=0, y'(0)=1; evaluated at x=L
    const l = this.lambda();
    const L = this.L;
    if (l > 0) {
      const k = Math.sqrt(l);
      return Math.sin(k * L) / k;
    } else if (l < 0) {
      const k = Math.sqrt(-l);
      return Math.sinh(k * L) / k;
    }
    return L;
  });

  solPath(): string {
    const l = this.lambda();
    const L = this.L;
    const W = 400;
    const YSCALE = 40;
    const pts: string[] = [];
    const N = 200;
    for (let i = 0; i <= N; i++) {
      const x = (i / N) * L;
      let y: number;
      if (l > 0) {
        const k = Math.sqrt(l);
        y = Math.sin(k * x) / k;
      } else if (l < 0) {
        const k = Math.sqrt(-l);
        y = Math.sinh(k * x) / k;
      } else {
        y = x;
      }
      const yc = Math.max(-2.2, Math.min(2.2, y));
      const px = (x / L) * W;
      const py = -yc * YSCALE;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  }

  jumpToEig(n: number) { this.lambda.set(n * n); }
}
