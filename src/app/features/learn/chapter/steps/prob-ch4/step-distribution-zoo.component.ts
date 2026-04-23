import { Component, signal, computed } from '@angular/core';
import { ProseBlockComponent } from '../../../shared/prose-block/prose-block.component';
import { ChallengeCardComponent } from '../../../shared/challenge-card/challenge-card.component';

function gammaFn(z: number): number {
  // Lanczos approximation
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gammaFn(1 - z));
  z -= 1;
  const g = 7;
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

function gammaPDF(x: number, k: number, theta: number): number {
  if (x <= 0) return 0;
  return (1 / (Math.pow(theta, k) * gammaFn(k))) * Math.pow(x, k - 1) * Math.exp(-x / theta);
}

function betaPDF(x: number, a: number, b: number): number {
  if (x <= 0 || x >= 1) return 0;
  const B = (gammaFn(a) * gammaFn(b)) / gammaFn(a + b);
  return (1 / B) * Math.pow(x, a - 1) * Math.pow(1 - x, b - 1);
}

function chiSquaredPDF(x: number, k: number): number {
  if (x <= 0) return 0;
  return gammaPDF(x, k / 2, 2);
}

type DistId = 'gamma' | 'beta' | 'chi2' | 'lognormal';

@Component({
  selector: 'app-prob-ch4-zoo',
  standalone: true,
  imports: [ProseBlockComponent, ChallengeCardComponent],
  template: `
    <app-prose-block title="分佈園區：Gamma, Beta, χ², Log-Normal" subtitle="§4.4">
      <p>
        除了四大基礎分佈，還有一家族「衍生分佈」在統計學中反覆出現。
        每個都有獨特的「偏斜」或「有界」特性。
      </p>

      <div class="fam-grid">
        <div class="fam">
          <div class="f-name">Gamma(k, θ)</div>
          <p>k 個 Exp(1/θ) 的和。<strong>正值、右偏</strong>。等 k 次事件的時間。</p>
        </div>
        <div class="fam">
          <div class="f-name">Beta(α, β)</div>
          <p>限於 [0, 1]。<strong>機率的機率</strong>——Bayesian 常用。α=β=1 是 Uniform。</p>
        </div>
        <div class="fam">
          <div class="f-name">χ²(k)</div>
          <p>k 個獨立 N(0,1)² 的和。統計檢定的骨幹。</p>
        </div>
        <div class="fam">
          <div class="f-name">Log-Normal</div>
          <p>log(X) ~ Normal。<strong>乘法性過程</strong>的極限：股價、城市人口、器官大小。</p>
        </div>
      </div>
    </app-prose-block>

    <app-challenge-card prompt="切換分佈：看不同形狀">
      <div class="dist-tabs">
        @for (d of distList; track d.id) {
          <button class="pill" [class.active]="dist() === d.id" (click)="dist.set(d.id)">{{ d.name }}</button>
        }
      </div>

      <div class="dist-card">
        <div class="dc-title">{{ currentInfo().name }}</div>
        <div class="dc-desc">{{ currentInfo().desc }}</div>
      </div>

      <div class="ctrl">
        @if (dist() === 'gamma') {
          <div class="sl">
            <span class="sl-lab">shape k</span>
            <input type="range" min="0.5" max="10" step="0.1" [value]="p1()"
              (input)="p1.set(+$any($event).target.value)" />
            <span class="sl-val">{{ p1().toFixed(1) }}</span>
          </div>
          <div class="sl">
            <span class="sl-lab">scale θ</span>
            <input type="range" min="0.2" max="3" step="0.05" [value]="p2()"
              (input)="p2.set(+$any($event).target.value)" />
            <span class="sl-val">{{ p2().toFixed(2) }}</span>
          </div>
        } @else if (dist() === 'beta') {
          <div class="sl">
            <span class="sl-lab">α</span>
            <input type="range" min="0.3" max="8" step="0.1" [value]="p1()"
              (input)="p1.set(+$any($event).target.value)" />
            <span class="sl-val">{{ p1().toFixed(1) }}</span>
          </div>
          <div class="sl">
            <span class="sl-lab">β</span>
            <input type="range" min="0.3" max="8" step="0.1" [value]="p2()"
              (input)="p2.set(+$any($event).target.value)" />
            <span class="sl-val">{{ p2().toFixed(1) }}</span>
          </div>
        } @else if (dist() === 'chi2') {
          <div class="sl">
            <span class="sl-lab">自由度 k</span>
            <input type="range" min="1" max="15" step="1" [value]="p1()"
              (input)="p1.set(+$any($event).target.value)" />
            <span class="sl-val">{{ p1() }}</span>
          </div>
        } @else {
          <div class="sl">
            <span class="sl-lab">μ (log)</span>
            <input type="range" min="-1" max="2" step="0.05" [value]="p1()"
              (input)="p1.set(+$any($event).target.value)" />
            <span class="sl-val">{{ p1().toFixed(2) }}</span>
          </div>
          <div class="sl">
            <span class="sl-lab">σ (log)</span>
            <input type="range" min="0.1" max="2" step="0.05" [value]="p2()"
              (input)="p2.set(+$any($event).target.value)" />
            <span class="sl-val">{{ p2().toFixed(2) }}</span>
          </div>
        }
      </div>

      <div class="plot">
        <svg viewBox="-10 -170 420 200" class="plot-svg">
          <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border-strong)" stroke-width="1" />
          <line x1="0" y1="-165" x2="0" y2="25" stroke="var(--border-strong)" stroke-width="1" />
          <path [attr.d]="pdfPath()" fill="var(--accent)" opacity="0.2" />
          <path [attr.d]="pdfPath()" fill="none" stroke="var(--accent)" stroke-width="2" />
          <!-- x markers -->
          @for (x of xMarks(); track x) {
            <line [attr.x1]="(x / xMax()) * 400" y1="-3" [attr.x2]="(x / xMax()) * 400" y2="3" stroke="var(--border-strong)" />
            <text [attr.x]="(x / xMax()) * 400" y="14" class="tk" text-anchor="middle">{{ x }}</text>
          }
        </svg>
      </div>
    </app-challenge-card>

    <app-prose-block>
      <h4>分佈間的關係圖</h4>
      <div class="rel-diagram">
        <div class="rel-row">
          <div class="rel-node">Bernoulli</div>
          <div class="rel-arr">n 次和</div>
          <div class="rel-node">Binomial</div>
          <div class="rel-arr">大 n, 小 p, np 固定</div>
          <div class="rel-node">Poisson</div>
        </div>
        <div class="rel-row">
          <div class="rel-node">Exponential</div>
          <div class="rel-arr">k 次和</div>
          <div class="rel-node">Gamma</div>
          <div class="rel-arr">k=ν/2, θ=2</div>
          <div class="rel-node">χ²(ν)</div>
        </div>
        <div class="rel-row">
          <div class="rel-node">iid 任意</div>
          <div class="rel-arr">CLT</div>
          <div class="rel-node">Normal</div>
          <div class="rel-arr">exp</div>
          <div class="rel-node">Log-Normal</div>
        </div>
      </div>

      <h4>本章總結</h4>
      <ol class="summary">
        <li>連續 RV 用 PDF 和 CDF 描述。面積 = 機率。</li>
        <li><strong>Uniform</strong>：最簡單，無偏見。</li>
        <li><strong>Exponential</strong>：等待時間、無記憶。</li>
        <li><strong>Normal</strong>：CLT 的極限，萬能鐘形。</li>
        <li><strong>Gamma / Beta / χ² / Log-Normal</strong>：各有用武之地的衍生分佈。</li>
        <li>分佈之間有明確的變換和極限關係。</li>
      </ol>

      <div class="next-ch">
        <h4>下一章：期望值與變異數</h4>
        <p>
          我們已經用了 E[X] 和 Var(X) 無數次；下一章正式定義、計算、掌握它們的性質。
          線性性 E[aX+bY] = aE[X]+bE[Y]、LOTUS、covariance——這些工具讓機率從「分佈」進化到「計算」。
        </p>
      </div>
    </app-prose-block>
  `,
  styles: `
    .fam-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 10px 0; }
    .fam { padding: 12px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .f-name { font-weight: 700; color: var(--accent); font-size: 13px; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .fam p { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
    .fam strong { color: var(--accent); }

    .dist-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .pill { font: inherit; font-size: 12px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 14px; background: transparent; cursor: pointer; color: var(--text-muted); }
    .pill.active { background: var(--accent); border-color: var(--accent); color: white; font-weight: 700; }
    .pill:hover:not(.active) { border-color: var(--accent); color: var(--accent); }

    .dist-card { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; }
    .dc-title { font-weight: 700; color: var(--accent); font-size: 14px; margin-bottom: 4px; font-family: 'JetBrains Mono', monospace; }
    .dc-desc { font-size: 13px; color: var(--text-secondary); line-height: 1.6; }

    .ctrl { padding: 12px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px; display: grid; gap: 6px; }
    .sl { display: flex; align-items: center; gap: 10px; }
    .sl-lab { font-size: 13px; color: var(--accent); font-weight: 700; min-width: 70px; }
    .sl input { flex: 1; accent-color: var(--accent); }
    .sl-val { font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 40px; text-align: right; }

    .plot { padding: 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); }
    .plot-svg { width: 100%; display: block; }
    .tk { font-size: 9px; fill: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

    h4 { color: var(--accent); font-size: 15px; margin: 14px 0 6px; }

    .rel-diagram { padding: 14px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; margin: 10px 0; }
    .rel-row { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; gap: 8px; align-items: center; padding: 8px 0; font-size: 12px; }
    .rel-row + .rel-row { border-top: 1px dashed var(--border); }
    .rel-node { padding: 6px 10px; background: var(--accent-10); border: 1px solid var(--accent-30); border-radius: 6px; font-weight: 700; color: var(--accent); text-align: center; font-family: 'JetBrains Mono', monospace; }
    .rel-arr { font-size: 10px; color: var(--text-muted); text-align: center; }
    @media (max-width: 640px) {
      .rel-row { grid-template-columns: 1fr; }
    }

    .summary { margin: 8px 0 12px 20px; font-size: 13px; line-height: 1.9; color: var(--text-secondary); }
    .summary strong { color: var(--accent); }

    .next-ch { padding: 16px; background: var(--bg-surface); border: 1px solid var(--accent-30); border-radius: 12px; margin-top: 16px; }
    .next-ch p { margin: 6px 0 0; font-size: 13px; color: var(--text-secondary); line-height: 1.7; }
  `,
})
export class ProbCh4ZooComponent {
  readonly distList: Array<{ id: DistId; name: string; desc: string }> = [
    { id: 'gamma', name: 'Gamma', desc: 'k 個 Exp 的和，右偏分佈' },
    { id: 'beta', name: 'Beta', desc: '限於 [0,1]，描述機率的機率' },
    { id: 'chi2', name: 'χ²', desc: '正態平方和，統計檢定骨幹' },
    { id: 'lognormal', name: 'Log-Normal', desc: '乘法性過程的極限' },
  ];
  readonly dist = signal<DistId>('gamma');
  readonly p1 = signal(2);
  readonly p2 = signal(1);

  readonly currentInfo = computed(() => {
    const d = this.distList.find(x => x.id === this.dist());
    return d ?? this.distList[0];
  });

  readonly xMax = computed(() => {
    const d = this.dist();
    if (d === 'beta') return 1;
    if (d === 'chi2') return Math.max(10, this.p1() * 3);
    if (d === 'lognormal') return Math.min(20, Math.exp(this.p1() + 3 * this.p2()));
    return Math.max(8, this.p1() * this.p2() * 3);
  });

  readonly xMarks = computed(() => {
    const max = this.xMax();
    if (max <= 1) return [0.25, 0.5, 0.75];
    const step = max > 20 ? 5 : max > 10 ? 2 : 1;
    const arr: number[] = [];
    for (let x = step; x < max; x += step) arr.push(x);
    return arr;
  });

  pdfPath(): string {
    const dist = this.dist();
    const p1 = this.p1();
    const p2 = this.p2();
    const xMax = this.xMax();
    const pts: string[] = [];
    const N = 300;
    let maxY = 0.01;
    // First pass: find max for scaling
    for (let i = 0; i <= N; i++) {
      const x = xMax * i / N;
      let y = 0;
      if (dist === 'gamma') y = gammaPDF(x, p1, p2);
      else if (dist === 'beta') y = betaPDF(x, p1, p2);
      else if (dist === 'chi2') y = chiSquaredPDF(x, Math.round(p1));
      else if (dist === 'lognormal' && x > 0) {
        const logX = Math.log(x);
        y = (1 / (x * p2 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((logX - p1) / p2) ** 2);
      }
      if (y > maxY) maxY = y;
    }
    const scaleY = Math.max(150, 150);
    for (let i = 0; i <= N; i++) {
      const x = xMax * i / N;
      let y = 0;
      if (dist === 'gamma') y = gammaPDF(x, p1, p2);
      else if (dist === 'beta') y = betaPDF(x, p1, p2);
      else if (dist === 'chi2') y = chiSquaredPDF(x, Math.round(p1));
      else if (dist === 'lognormal' && x > 0) {
        const logX = Math.log(x);
        y = (1 / (x * p2 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((logX - p1) / p2) ** 2);
      }
      const px = (x / xMax) * 400;
      const py = -(y / maxY) * scaleY;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    pts.push('L 400 0 L 0 0 Z');
    return pts.join(' ');
  }
}
